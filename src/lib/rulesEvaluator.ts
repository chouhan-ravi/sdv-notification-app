/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule, RuleCondition, SimulationLog, BusinessFilter, CarOwnerSetting } from '../types';

/**
 * Safely accesses nested properties in a JSON object using dot notation path (e.g. "vehicle_state_snapshot.hvac_status.cabin_temp_c")
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Evaluates a single rule condition against the incoming event JSON payload
 */
export function evaluateCondition(condition: RuleCondition, payload: any): { passed: boolean; actualValue: any } {
  const actualValue = getNestedValue(payload, condition.fieldPath);
  const expectedStr = condition.value;

  if (condition.operator === 'exists') {
    return { passed: actualValue !== undefined && actualValue !== null, actualValue };
  }
  if (condition.operator === 'not_exists') {
    return { passed: actualValue === undefined || actualValue === null, actualValue };
  }

  if (actualValue === undefined || actualValue === null) {
    return { passed: false, actualValue: undefined };
  }

  switch (condition.operator) {
    case 'equals':
      return { 
        passed: String(actualValue).toLowerCase() === String(expectedStr).toLowerCase(), 
        actualValue 
      };
    case 'not_equals':
      return { 
        passed: String(actualValue).toLowerCase() !== String(expectedStr).toLowerCase(), 
        actualValue 
      };
    case 'greater_than': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedStr);
      return { 
        passed: !isNaN(actNum) && !isNaN(expNum) && actNum > expNum, 
        actualValue 
      };
    }
    case 'less_than': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedStr);
      return { 
        passed: !isNaN(actNum) && !isNaN(expNum) && actNum < expNum, 
        actualValue 
      };
    }
    case 'contains':
      return { 
        passed: String(actualValue).toLowerCase().includes(String(expectedStr).toLowerCase()), 
        actualValue 
      };
    case 'starts_with':
      return { 
        passed: String(actualValue).toLowerCase().startsWith(String(expectedStr).toLowerCase()), 
        actualValue 
      };
    case 'ends_with':
      return { 
        passed: String(actualValue).toLowerCase().endsWith(String(expectedStr).toLowerCase()), 
        actualValue 
      };
    default:
      return { passed: false, actualValue };
  }
}

/**
 * Parses dynamic placeholders like {vehicle_state_snapshot.hvac_status.cabin_temp_c} in strings
 */
export function parseTemplate(template: string, payload: any): string {
  if (!template) return '';
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const value = getNestedValue(payload, path.trim());
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Runs the evaluation for all active rules against a vehicle event payload.
 * It returns a structured SimulationLog detailing matching rules, evaluations, and generated outputs.
 */
export function runRulesEvaluation(
  rules: Rule[], 
  payload: any,
  businessFilters: BusinessFilter[] = [],
  userSettings: CarOwnerSetting[] = [],
  contextOverride?: { cssGen: string; vehicleModel: string; year: number; vehicleType: 'ICE' | 'EV' | 'PHEV' | 'All'; region: string; userId: string }
): SimulationLog {
  const timestampIso = new Date().toISOString();
  
  // Extract basic event header details safely
  const vin = getNestedValue(payload, 'response_header.vin') || 'UNKNOWN_VIN';
  const commandId = getNestedValue(payload, 'response_header.command_id') || 'UNKNOWN_CMD';
  const executionStatus = getNestedValue(payload, 'execution_status') || 'UNKNOWN_STATUS';

  // Extract / override contextual attributes
  const cssGen = contextOverride?.cssGen || getNestedValue(payload, 'vehicle_context.css_gen') || 'Gen 6';
  const vehicleModel = contextOverride?.vehicleModel || getNestedValue(payload, 'vehicle_context.model') || 'Civic';
  const year = contextOverride?.year || Number(getNestedValue(payload, 'vehicle_context.year')) || 2024;
  const vehicleType = contextOverride?.vehicleType || getNestedValue(payload, 'vehicle_context.type') || getNestedValue(payload, 'vehicle_state_snapshot.propulsion_system') || 'ICE';
  const region = contextOverride?.region || getNestedValue(payload, 'vehicle_context.region') || 'US';
  const userId = contextOverride?.userId || getNestedValue(payload, 'vehicle_context.user_id') || 'usr_ravi_55';

  const matchedRulesList: SimulationLog['matchedRules'] = [];

  // Evaluate enabled rules
  const activeRules = rules.filter(r => r.enabled);

  for (const rule of activeRules) {
    const conditionEvaluations = rule.conditions.map(cond => {
      const { passed, actualValue } = evaluateCondition(cond, payload);
      return {
        conditionId: cond.id,
        fieldPath: cond.fieldPath,
        operator: cond.operator,
        expectedValue: cond.value,
        actualValue,
        passed,
      };
    });

    // All conditions must pass
    const allPassed = conditionEvaluations.length > 0 && conditionEvaluations.every(ev => ev.passed);

    if (allPassed) {
      matchedRulesList.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleKey: rule.ruleKey,
        criticality: rule.criticality,
        priority: rule.priority,
        conditionEvaluations,
      });
    }
  }

  // Generate enriched push notification payload based on the HIGHEST priority or FIRST matched rule
  let pushNotificationPayload: any | null = null;
  let blockedReason: SimulationLog['blockedReason'] = undefined;
  
  const primaryMatch = matchedRulesList.find(r => r.priority === 'high') || matchedRulesList[0];

  if (primaryMatch) {
    const matchingRuleSource = rules.find(r => r.id === primaryMatch.ruleId)!;
    const catKey = matchingRuleSource.categoryKey;

    // 1. Evaluate User Preferences / Car Owner Settings first
    const userPref = userSettings.find(s => 
      s.userId === userId && 
      s.vin === vin && 
      (s.categoryKey === 'All' || s.categoryKey === catKey) &&
      (!s.ruleKey || s.ruleKey === 'All' || s.ruleKey === matchingRuleSource.ruleKey)
    );

    if (userPref && userPref.enabled === false) {
      const scopeText = userPref.ruleKey && userPref.ruleKey !== 'All'
        ? `rule "${userPref.ruleKey}"`
        : (userPref.categoryKey === 'All' ? 'all' : `"${catKey}"`) + ' alerts';
      blockedReason = {
        type: 'USER_SETTING',
        message: `Opted-out by Car Owner preference: User ID "${userId}" has muted ${scopeText} on VIN "${vin}".`
      };
    }

    // 2. Evaluate Global Corporate Business Ingress Filters if not already blocked
    if (!blockedReason) {
      const matchingFilter = businessFilters.find(f => {
        if (!f.enabled) return false;
        if (f.categoryKey !== 'All' && f.categoryKey !== catKey) return false;

        // Match Rule Key
        if (f.ruleKey && f.ruleKey !== 'All' && f.ruleKey !== matchingRuleSource.ruleKey) return false;

        // Match CSS Generation
        if (f.cssGen !== 'All' && f.cssGen.toLowerCase() !== cssGen.toLowerCase()) return false;

        // Match Vehicle Model
        if (f.vehicleModel !== 'All' && f.vehicleModel.toLowerCase() !== vehicleModel.toLowerCase()) return false;

        // Match Model Year range
        if (year < f.yearStart || year > f.yearEnd) return false;

        // Match Fuel Propulsion Type
        if (f.vehicleType !== 'All' && f.vehicleType.toLowerCase() !== vehicleType.toLowerCase()) return false;

        // Match Region
        if (f.region !== 'All' && f.region.toLowerCase() !== region.toLowerCase()) return false;

        return true;
      });

      if (matchingFilter) {
        if (matchingFilter.action === 'BLOCK') {
          blockedReason = {
            type: 'BUSINESS_FILTER',
            message: `Corporate Blocked: Notification category "${catKey}" is blocked by business rule [${matchingFilter.name}] for ${region} region under current vehicle spec.`,
            filterId: matchingFilter.id
          };
        }
      }
    }

    // If not blocked, generate notification
    if (!blockedReason) {
      // Evaluate template strings
      const title = parseTemplate(matchingRuleSource.notificationTitle, payload);
      const body = parseTemplate(matchingRuleSource.notificationBody, payload);

      // Build data section
      const dynamicData: Record<string, string> = {
        notification_type: 'REMOTE_COMMAND_STATUS',
        category: matchingRuleSource.categoryKey,
        rule_key: matchingRuleSource.ruleKey,
        vin: vin,
        timestamp: timestampIso,
        command_id: commandId,
        execution_status: executionStatus,
        context_css_gen: cssGen,
        context_region: region,
        context_type: vehicleType,
        context_model: vehicleModel,
        context_year: String(year),
        context_user_id: userId
      };

      // Add extra custom dynamic metadata key-values defined in the rule
      matchingRuleSource.dataMetadata.forEach(meta => {
        if (meta.key) {
          dynamicData[meta.key] = parseTemplate(meta.value, payload);
        }
      });

      pushNotificationPayload = {
        to: 'device_registration_token_xyz123',
        priority: matchingRuleSource.priority,
        notification: {
          title: title,
          body: body,
          sound: matchingRuleSource.sound || 'default',
        },
        data: dynamicData,
      };
    }
  }

  return {
    id: `sim_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: timestampIso,
    vin,
    commandId,
    executionStatus,
    eventPayload: payload,
    success: matchedRulesList.length > 0 && !blockedReason,
    blockedReason,
    matchedRules: matchedRulesList,
    pushNotificationPayload,
  };
}

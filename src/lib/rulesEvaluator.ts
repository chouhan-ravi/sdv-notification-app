/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Rule, 
  RuleConditionItem, 
  RuleConditionGroup, 
  RuleConfigItem, 
  SimulationLog, 
  BusinessFilter, 
  CarOwnerSetting,
  RuleEvaluationResponse 
} from '../types';

/**
 * Safely accesses nested properties in a JSON object using dot notation path (e.g. "vehicle_state_snapshot.telemetry.12v_battery_v")
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
 * Evaluates a single condition item against an incoming payload
 */
export function evaluateConditionItem(cond: RuleConditionItem, payload: any): { passed: boolean; actualValue: any } {
  const actualValue = getNestedValue(payload, cond.fieldPath);
  const expectedStr = cond.value;

  if (cond.operator === 'exists') {
    return { passed: actualValue !== undefined && actualValue !== null, actualValue };
  }
  if (cond.operator === 'not_exists') {
    return { passed: actualValue === undefined || actualValue === null, actualValue };
  }

  if (actualValue === undefined || actualValue === null) {
    return { passed: false, actualValue: undefined };
  }

  switch (cond.operator) {
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
 * Parses dynamic placeholders like {vehicle_state_snapshot.engine_state}
 */
export function parseTemplate(template: string, payload: any): string {
  if (!template) return '';
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const value = getNestedValue(payload, path.trim());
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Evaluates a condition group ("and" / "or")
 */
export function evaluateConditionGroup(group: RuleConditionGroup, payload: any) {
  let groupType: 'and' | 'or' = 'and';
  let condList: RuleConditionItem[] = [];

  if (group.and) {
    groupType = 'and';
    condList = group.and;
  } else if (group.or) {
    groupType = 'or';
    condList = group.or;
  }

  const conditionResults = condList.map(cond => {
    const { passed, actualValue } = evaluateConditionItem(cond, payload);
    return {
      id: cond.id,
      fieldPath: cond.fieldPath,
      operator: cond.operator,
      expectedValue: cond.value,
      actualValue,
      passed
    };
  });

  const passed = groupType === 'and'
    ? (conditionResults.length > 0 && conditionResults.every(c => c.passed))
    : (conditionResults.length > 0 && conditionResults.some(c => c.passed));

  return {
    groupType,
    passed,
    conditions: conditionResults
  };
}

/**
 * Backend API Rule Evaluation Engine
 */
export function evaluateRulesApiEngine(
  rules: Rule[], 
  payload: any
): RuleEvaluationResponse {
  const timestampIso = new Date().toISOString();
  const activeRules = rules.filter(r => r.enabled);
  const evaluationResults: RuleEvaluationResponse['evaluationResults'] = [];

  for (const rule of activeRules) {
    if (!rule.config || rule.config.length === 0) continue;

    for (const cfg of rule.config) {
      const groupsEvaluated = (cfg.conditions || []).map(g => evaluateConditionGroup(g, payload));
      const configMatched = groupsEvaluated.length > 0 && groupsEvaluated.every(g => g.passed);

      if (configMatched) {
        // Resolve dynamic templates
        const resolvedTitle = parseTemplate(cfg.notificationTemplate.title, payload);
        const resolvedBody = parseTemplate(cfg.notificationTemplate.body, payload);
        const resolvedMetadata = (cfg.metadata || []).map(m => ({
          key: m.key,
          value: parseTemplate(m.value, payload)
        }));

        evaluationResults.push({
          ruleId: rule.id,
          ruleName: rule.name,
          description: rule.description,
          enabled: rule.enabled,
          matchedConfig: {
            id: cfg.id,
            notificationCategory: cfg.notificationCategory,
            notificationKey: cfg.notificationKey,
            criticality: cfg.criticality,
            conditionsEvaluated: groupsEvaluated,
            resolvedNotificationTemplate: {
              ...cfg.notificationTemplate,
              title: resolvedTitle,
              body: resolvedBody
            },
            resolvedMetadata
          }
        });
      }
    }
  }

  return {
    status: evaluationResults.length > 0 ? 'SUCCESS' : 'NO_MATCH',
    timestamp: timestampIso,
    totalRulesEvaluated: activeRules.length,
    matchedRulesCount: evaluationResults.length,
    notificationEvent: payload,
    evaluationResults
  };
}

/**
 * Simulation log evaluation runner for client & WebSocket feeds
 */
export function runRulesEvaluation(
  rules: Rule[], 
  payload: any,
  businessFilters: BusinessFilter[] = [],
  userSettings: CarOwnerSetting[] = [],
  contextOverride?: { cssGen: string; vehicleModel: string; year: number; vehicleType: 'ICE' | 'EV' | 'PHEV' | 'All'; region: string; userId: string }
): SimulationLog {
  const timestampIso = new Date().toISOString();
  const vin = getNestedValue(payload, 'response_header.vin') || getNestedValue(payload, 'vin') || '1HGCR2F8XHA000000';
  const commandId = getNestedValue(payload, 'response_header.command_id') || 'CMD_EVAL_01';
  const executionStatus = getNestedValue(payload, 'execution_status') || 'SUCCESS';

  const apiResponse = evaluateRulesApiEngine(rules, payload);
  const matchedRulesList: SimulationLog['matchedRules'] = [];

  apiResponse.evaluationResults.forEach(res => {
    const matchedConds: any[] = [];
    res.matchedConfig.conditionsEvaluated.forEach(g => {
      g.conditions.forEach(c => {
        matchedConds.push({
          conditionId: c.id,
          fieldPath: c.fieldPath,
          operator: c.operator,
          expectedValue: c.expectedValue,
          actualValue: c.actualValue,
          passed: c.passed
        });
      });
    });

    matchedRulesList.push({
      ruleId: res.ruleId,
      ruleName: res.ruleName,
      ruleKey: res.matchedConfig.notificationKey,
      criticality: res.matchedConfig.criticality,
      priority: 'normal',
      conditionEvaluations: matchedConds
    });
  });

  let pushNotificationPayload: any = null;
  if (apiResponse.evaluationResults.length > 0) {
    const topMatch = apiResponse.evaluationResults[0];
    const dataObj: Record<string, string> = {
      category: topMatch.matchedConfig.notificationCategory,
      rule_key: topMatch.matchedConfig.notificationKey,
      vin: vin,
      timestamp: timestampIso
    };

    topMatch.matchedConfig.resolvedMetadata.forEach(m => {
      dataObj[m.key] = m.value;
    });

    pushNotificationPayload = {
      to: 'device_registration_token_xyz123',
      priority: 'high',
      notification: {
        title: topMatch.matchedConfig.resolvedNotificationTemplate.title,
        body: topMatch.matchedConfig.resolvedNotificationTemplate.body,
        sound: topMatch.matchedConfig.resolvedNotificationTemplate.sound || 'default'
      },
      data: dataObj
    };
  }

  return {
    id: `sim_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: timestampIso,
    vin,
    commandId,
    executionStatus,
    eventPayload: payload,
    success: matchedRulesList.length > 0,
    matchedRules: matchedRulesList,
    pushNotificationPayload
  };
}

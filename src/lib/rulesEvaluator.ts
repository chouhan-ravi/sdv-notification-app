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
  PipelineStep,
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
      notificationKey: res.matchedConfig.notificationKey,
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

  const userId = payload?.userId || `usr_${vin ? vin.slice(-5) : '78921'}`;

  const partialLog: SimulationLog = {
    id: `sim_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: timestampIso,
    vin,
    userId,
    commandId,
    executionStatus,
    eventPayload: payload,
    success: matchedRulesList.length > 0,
    matchedRules: matchedRulesList,
    pushNotificationPayload
  };

  partialLog.pipelineSteps = buildNotificationPipelineSteps(partialLog);

  return partialLog;
}

/**
 * Builds the 6-step lifecycle pipeline for Notification Events
 */
export function buildNotificationPipelineSteps(log: Partial<SimulationLog>): PipelineStep[] {
  const ts = log.timestamp || new Date().toISOString();
  const vin = log.vin || 'UNKNOWN_VIN';
  const commandId = log.commandId || 'CMD_EVAL_01';
  const payload = log.eventPayload || {};

  // Step 1: Payload Ingress
  const step1: PipelineStep = {
    stepNumber: 1,
    name: 'Payload Ingress',
    status: 'PASSED',
    title: '1. Notification Payload Ingress',
    summary: `Payload [Cmd: ${commandId}] entered notification system for VIN ${vin.length > 10 ? vin.substring(0, 10) + '...' : vin}`,
    timestamp: ts,
    details: {
      commandId,
      vin,
      ingressTimestamp: ts,
      executionStatus: log.executionStatus || 'RECEIVED',
      eventPayload: payload
    }
  };

  // Step 2: Check status (fake/duplicate check)
  const isFake = log.validationStatus?.isFake || payload?._isFake || payload?.fake === true || false;
  const isDuplicate = log.validationStatus?.isDuplicate || payload?._isDuplicate || commandId.includes('DUP') || false;
  const validationMsg = log.validationStatus?.message || 
    (isFake ? 'Signature verification failed: Flagged as synthetic or fake payload.' :
     isDuplicate ? 'Duplicate command ID detected within idempotency window.' :
     'Payload signature authentic, non-duplicate & schema valid.');

  const step2: PipelineStep = {
    stepNumber: 2,
    name: 'Validation Check',
    status: isFake ? 'FAILED' : isDuplicate ? 'WARNING' : 'PASSED',
    title: '2. Payload Validation & Deduplication Check',
    summary: isFake ? '⚠️ FAKE PAYLOAD DETECTED' : isDuplicate ? '⚠️ DUPLICATE PAYLOAD DETECTED' : '✅ AUTHENTIC & VALID',
    timestamp: ts,
    details: {
      isValid: !isFake && !isDuplicate,
      isFake,
      isDuplicate,
      message: validationMsg
    }
  };

  // Step 3: Rule config evaluation status
  const matchedRules = log.matchedRules || [];
  const topRule = matchedRules[0];
  const step3Status = matchedRules.length > 0 ? 'PASSED' : 'SKIPPED';
  const step3Summary = matchedRules.length > 0
    ? `Evaluated rule config matrix. Matched rule [${topRule.notificationKey}] (${topRule.ruleName}) with criticality '${topRule.criticality || 'INFO'}'.`
    : 'Evaluated rule config matrix. No active rules matched incoming payload conditions.';

  const step3: PipelineStep = {
    stepNumber: 3,
    name: 'Rule Config Evaluation',
    status: step3Status,
    title: '3. Rule Config Evaluation Status',
    summary: step3Summary,
    timestamp: ts,
    details: {
      rulesEvaluatedCount: matchedRules.length,
      topMatchedRuleKey: topRule?.notificationKey || 'NONE',
      criticality: topRule?.criticality || 'N/A',
      matchedRules
    }
  };

  // Step 4: Check notification settings status (if NotificationCategory block or not)
  const blockedReason = log.blockedReason;
  const targetCategory = log.pushNotificationPayload?.data?.category || topRule?.notificationKey || 'vehicle.remote.control';
  const step4Status = blockedReason ? 'BLOCKED' : 'PASSED';
  const step4Summary = blockedReason
    ? `Suppressed by ${blockedReason.type === 'BUSINESS_FILTER' ? 'Corporate Business Policy' : 'Car Owner Setting'}: ${blockedReason.message}`
    : `NotificationCategory '${targetCategory}' unblocked and permitted for dispatch.`;

  const step4: PipelineStep = {
    stepNumber: 4,
    name: 'Notification Settings Check',
    status: step4Status,
    title: '4. Notification Settings & Category Mute Check',
    summary: step4Summary,
    timestamp: ts,
    details: {
      blocked: !!blockedReason,
      notificationCategory: targetCategory,
      blockedReason
    }
  };

  // Step 5: Assign proper notification body template event
  const pushNotif = log.pushNotificationPayload?.notification;
  const step5Status = pushNotif ? 'PASSED' : 'SKIPPED';
  const step5Summary = pushNotif
    ? `Assigned body template: "${pushNotif.title}" — "${pushNotif.body}"`
    : 'No body template assigned (evaluation skipped or blocked prior to rendering).';

  const step5: PipelineStep = {
    stepNumber: 5,
    name: 'Template Body Assignment',
    status: step5Status,
    title: '5. Assign Notification Body Template',
    summary: step5Summary,
    timestamp: ts,
    details: {
      title: pushNotif?.title || 'N/A',
      body: pushNotif?.body || 'N/A',
      sound: pushNotif?.sound || 'default',
      dataEnvelope: log.pushNotificationPayload?.data
    }
  };

  // Step 6: Finally, dispatch event for forwarding end user notification payload to fcm or 3rd party
  const isDispatched = log.success && pushNotif && !blockedReason;
  const step6Status = isDispatched ? 'DISPATCHED' : 'BLOCKED';
  const step6Summary = isDispatched
    ? `Dispatched to FCM push gateway. Token: ${log.pushNotificationPayload?.to || 'fcm_device_token_xyz'} (Priority: HIGH)`
    : `Forwarding aborted before FCM dispatch. Reason: ${blockedReason ? 'Suppressed by policy' : 'No rule matched'}.`;

  const step6: PipelineStep = {
    stepNumber: 6,
    name: 'FCM Forwarding Dispatch',
    status: step6Status,
    title: '6. Forwarding Dispatch Event (FCM / 3rd Party)',
    summary: step6Summary,
    timestamp: ts,
    details: {
      dispatched: isDispatched,
      destination: 'Google FCM / Apple APNS Push Network',
      targetToken: log.pushNotificationPayload?.to || 'fcm_device_token_xyz',
      payloadEnvelope: log.pushNotificationPayload
    }
  };

  return [step1, step2, step3, step4, step5, step6];
}

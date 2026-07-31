/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'exists'
  | 'not_exists';

export interface RuleConditionItem {
  id: string;
  fieldPath: string; // e.g. "execution_status"
  operator: RuleOperator;
  value: string;
}

export interface RuleConditionGroup {
  and?: RuleConditionItem[];
  or?: RuleConditionItem[];
}

export interface RuleMetadataItem {
  key: string;
  value: string;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  sound?: string;
  badge?: number;
}

export interface RuleConfigItem {
  id: string;
  notificationCategory: string; // e.g. "milon.burglar.category"
  notificationKey: string;      // e.g. "milon.burgluer"
  criticality: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO' | string;
  conditions: RuleConditionGroup[];
  metadata: RuleMetadataItem[];
  notificationTemplate: NotificationTemplate;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  config: RuleConfigItem[];
  // Optional fallback helpers
  notificationKey?: string;
  notificationCategory?: string;
  priority?: 'high' | 'normal' | 'low';
  criticality?: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO' | string;
  conditions?: RuleConditionItem[];
  notificationTitle?: string;
  notificationBody?: string;
  sound?: string;
  dataMetadata?: RuleMetadataItem[];
  MessageType?: string;
  NotificationType?: string;
  translations?: RuleTranslation[];
}

export interface BusinessFilter {
  id: string;
  name: string;
  notificationCategory: string; // e.g. PLUG_N_CHARGE, VEHICLE_REMOTE_CONTROL
  notificationKey?: string;
  cssGen: string;
  vehicleModel: string;
  yearStart: number;
  yearEnd: number;
  vehicleType: 'ICE' | 'EV' | 'PHEV' | 'All';
  region: 'US' | 'EU' | 'JP' | 'CN' | 'All';
  enabled: boolean;
  action: 'ALLOW' | 'BLOCK';
  description: string;
}

export interface CarOwnerSetting {
  id: string;
  userId: string;
  vin: string;
  notificationCategory: string;
  notificationKey?: string;
  enabled: boolean;
  language?: string;
}

export interface RuleTranslation {
  locale: string;
  notificationTitle: string;
  notificationBody: string;
}

export interface PipelineStep {
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'WARNING' | 'SKIPPED' | 'DISPATCHED';
  title: string;
  summary: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  vin: string;
  userId?: string;
  commandId: string;
  executionStatus: string;
  eventPayload: any;
  success: boolean;
  blockedReason?: {
    type: 'BUSINESS_FILTER' | 'USER_SETTING';
    message: string;
    filterId?: string;
  };
  validationStatus?: {
    isDuplicate: boolean;
    isFake: boolean;
    isValid: boolean;
    message: string;
  };
  matchedRules: {
    ruleId: string;
    ruleName: string;
    notificationKey: string;
    criticality: string;
    priority: string;
    conditionEvaluations: {
      conditionId: string;
      fieldPath: string;
      operator: string;
      expectedValue: string;
      actualValue: any;
      passed: boolean;
    }[];
  }[];
  pushNotificationPayload: any | null;
  pipelineSteps?: PipelineStep[];
}

export interface RuleEvaluationResponse {
  status: 'SUCCESS' | 'NO_MATCH' | 'ERROR';
  timestamp: string;
  totalRulesEvaluated: number;
  matchedRulesCount: number;
  notificationEvent: any;
  evaluationResults: {
    ruleId: string;
    ruleName: string;
    description: string;
    enabled: boolean;
    matchedConfig: {
      id: string;
      notificationCategory: string;
      notificationKey: string;
      criticality: string;
      conditionsEvaluated: {
        groupType: 'and' | 'or';
        passed: boolean;
        conditions: {
          id: string;
          fieldPath: string;
          operator: string;
          expectedValue: string;
          actualValue: any;
          passed: boolean;
        }[];
      }[];
      resolvedNotificationTemplate: NotificationTemplate;
      resolvedMetadata: RuleMetadataItem[];
    };
  }[];
}

export interface AfterSalesRecord {
  id: string;
  vin: string;
  vehicleModel: string;
  serviceType: string;
  mileage: number;
  scheduledDate: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  description: string;
  proactiveTriggerStatus: 'Ready' | 'Triggered' | 'Muted' | 'Done';
  lastTriggeredAt?: string;
}

export interface NotificationScheduler {
  id: string;
  name: string;
  triggerCondition: 'DaysBefore' | 'OnStatusChange' | 'MileageExceeds' | 'CronExpression';
  triggerValue: string;
  serviceType: string;
  templateTitle: string;
  templateBody: string;
  notificationCategory: string;
  enabled: boolean;
  createdDate: string;
  lastExecutedAt?: string;
  type?: 'notification' | 'system_task';
  linkedRuleId?: string;
  systemTaskKey?: string;
}

export interface KeyTranslation {
  locale: string;
  name: string;
  description?: string;
}

export interface DynamicKey {
  key: string;
  displayName?: string;
  notificationCategory?: string;
  enabled?: boolean;
  description?: string;
  translations?: KeyTranslation[];
}

export interface DynamicCategory {
  categeory?: string;
  displayName?: string;
  enabled?: boolean;
  description?: string;
  isMandatory?: boolean;
  mappedNotificationKeys?: DynamicKey[];
  translations?: KeyTranslation[];
}

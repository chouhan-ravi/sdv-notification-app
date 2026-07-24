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

export interface RuleCondition {
  id: string;
  fieldPath: string; // e.g. "vehicle_state_snapshot.engine_state"
  operator: RuleOperator;
  value: string; // The value is stored as string and cast as needed for evaluation
}

export interface BusinessFilter {
  id: string;
  name: string;
  categoryKey: string; // e.g. PLUG_N_CHARGE, VEHICLE_REMOTE_CONTROL
  ruleKey?: string; // Optional specific rule key filter, e.g. RULE_REM_START_SUCCESS_CONFIRM, 'All'
  cssGen: string; // e.g. "Gen 5", "Gen 6", "Gen 7", "All"
  vehicleModel: string; // e.g. "Civic", "Model S", "All"
  yearStart: number;
  yearEnd: number;
  vehicleType: 'ICE' | 'EV' | 'PHEV' | 'All';
  region: 'US' | 'EU' | 'JP' | 'CN' | 'All';
  enabled: boolean; // Is this filter rule active?
  action: 'ALLOW' | 'BLOCK'; // Whether to allow or block notifications matching this criteria
  description: string;
}

export interface CarOwnerSetting {
  id: string;
  userId: string;
  vin: string;
  categoryKey: string; // e.g. PLUG_N_CHARGE, VEHICLE_REMOTE_CONTROL
  ruleKey?: string; // Optional specific rule key filter, e.g. RULE_REM_START_SUCCESS_CONFIRM
  enabled: boolean; // Custom toggle by the owner
  language?: string; // Preferred locale/language, e.g. 'es', 'fr', 'de', 'zh', 'ja', 'en'
}

export interface RuleTranslation {
  locale: string; // e.g. "es", "fr", "de", "zh", "ja"
  notificationTitle: string;
  notificationBody: string;
}

export interface Rule {
  id: string;
  name: string;
  ruleKey: string; // e.g. RULE_REM_START_SUCCESS_CONFIRM
  categoryKey: string; // e.g. VEHICLE_REMOTE_CONTROL
  messageType: string; // e.g. VEHICLE_REMOTE_CONTROL
  notificationType: string; // e.g. VEHICLE_REMOTE_CONTROL
  priority: 'high' | 'normal' | 'low';
  criticality: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  enabled: boolean;
  description: string;
  conditions: RuleCondition[];
  notificationTitle: string; // e.g. "Remote Start Successful"
  notificationBody: string; // e.g. "Your engine is running. Cabin temperature is {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C."
  sound: string; // e.g. "default"
  dataMetadata: { key: string; value: string }[]; // e.g. [{key: "runtime_limit_minutes", value: "15"}, {key: "engine_state", value: "{vehicle_state_snapshot.engine_state}"}]
  translations?: RuleTranslation[];
  MessageType?: string;
  NotificationType?: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string; // Date ISO string
  vin: string;
  commandId: string;
  executionStatus: string;
  eventPayload: any; // Original JSON
  success: boolean;
  blockedReason?: {
    type: 'BUSINESS_FILTER' | 'USER_SETTING';
    message: string;
    filterId?: string;
  };
  matchedRules: {
    ruleId: string;
    ruleName: string;
    ruleKey: string;
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
  pushNotificationPayload: any | null; // Generated Push Notification JSON (null if blocked)
}

export interface AfterSalesRecord {
  id: string;
  vin: string;
  vehicleModel: string;
  serviceType: string; // e.g. "Periodic Maintenance", "Brake Pad Replacement", "Battery Health Check", "Software Update", "Recall Action"
  mileage: number;
  scheduledDate: string; // e.g. "2026-08-15"
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
  triggerValue: string; // e.g., "7" (days), "Completed" (status), "15000" (mileage), or cron expression "0 0 * * *"
  serviceType: string; // "All" or matches Service Type
  templateTitle: string; // e.g., "Upcoming Service Reminder"
  templateBody: string; // e.g., "Dear customer, your vehicle {vehicleModel} (VIN: {vin}) is due for {serviceType}."
  categoryKey: string; // e.g. "VEHICLE_REMOTE_CONTROL" or "All"
  enabled: boolean;
  createdDate: string;
  lastExecutedAt?: string;
  type?: 'notification' | 'system_task';
  linkedRuleId?: string;
  systemTaskKey?: string;
}

export interface KeyTranslation {
  locale: string; // e.g. "es", "fr", "de", "zh", "ja"
  name: string;
  description?: string;
}

export interface DynamicCategory {
  key: string;
  name: string;
  enabled: boolean;
  description?: string;
  translations?: KeyTranslation[];
}

export interface DynamicRuleKey {
  key: string;
  name: string;
  categoryKey: string;
  enabled: boolean;
  description?: string;
  translations?: KeyTranslation[];
}


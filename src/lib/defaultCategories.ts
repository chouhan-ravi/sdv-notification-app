/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicCategory, DynamicRuleKey } from '../types';

export const DEFAULT_DYNAMIC_CATEGORIES: DynamicCategory[] = [
  { key: 'PLUG_N_CHARGE', name: '⚡ Plug-n-Charge Alerts', enabled: true, description: 'Triggers related to charging, payment, and charging stations.' },
  { key: 'VEHICLE_REMOTE_CONTROL', name: '📲 Remote Vehicle Control', enabled: true, description: 'Commands sent remotely to start engine, lock doors, etc.' },
  { key: 'VEHICLE_SAFETY', name: '🛡️ Safety Alerts & Pre-conditions', enabled: true, description: 'Safety warnings, unfastened seatbelts, and door hazard triggers.' },
  { key: 'VEHICLE_DIAGNOSTIC', name: '🔧 Diagnostic & Telemetry Faults', enabled: true, description: 'Engine malfunctions, low battery voltage, and telemetry metrics.' },
  { key: 'VEHICLE_SECURITY', name: '🔒 Security & Anti-Theft', enabled: true, description: 'Intrusion detection, alarm triggers, and immobilizer status.' }
];

export const DEFAULT_DYNAMIC_RULE_KEYS: DynamicRuleKey[] = [
  { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', name: 'Plug-n-Charge Active', categoryKey: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session started successfully.' },
  { key: 'RULE_PLUG_CHARGE_COMPLETED', name: 'Plug-n-Charge Completed', categoryKey: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session reached 100% capacity.' },
  { key: 'RULE_REM_START_SUCCESS_CONFIRM', name: 'Remote Start Succeeded', categoryKey: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine started running via app request.' },
  { key: 'RULE_REM_START_FAILED_ALERT', name: 'Remote Start Failed', categoryKey: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine start request aborted due to error.' },
  { key: 'RULE_REM_START_SAFETY_BLOCK', name: 'Remote Start Safety Block', categoryKey: 'VEHICLE_SAFETY', enabled: true, description: 'Aborted remote start for door safety compliance.' },
  { key: 'RULE_SEATBELT_UNFASTENED_ALERT', name: 'Seatbelt Alarm Warning', categoryKey: 'VEHICLE_SAFETY', enabled: true, description: 'Vehicle moving while seatbelts are unfastened.' },
  { key: 'RULE_BATTERY_VOLTAGE_FAULT', name: '12V Battery Low', categoryKey: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Battery drops below 11.8 Volts.' },
  { key: 'RULE_ENGINE_OVER_RPM', name: 'Engine Over-RPM Limit', categoryKey: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Engine speeds exceeded critical threshold.' },
  { key: 'RULE_SECURITY_INTRUSION_ALERT', name: 'Anti-Theft Intrusion Alert', categoryKey: 'VEHICLE_SECURITY', enabled: true, description: 'Intrusion alert from movement sensors.' }
];

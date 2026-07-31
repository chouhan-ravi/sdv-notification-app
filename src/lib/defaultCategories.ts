/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicCategory, DynamicKey } from '../types';

export const DEFAULT_DYNAMIC_CATEGORIES: DynamicCategory[] = [
  {
    category: 'milon.burglar.category',
    key: 'milon.burglar.category',
    displayName: 'Milon Burglar Category',
    name: 'Milon Burglar Category',
    description: 'milon.burglar.category',
    isMandatory: true,
    mappedRules: null,
    mappedNotificationKeys: [
      {
        key: 'milon.burgluer.handbrake.key',
        displayName: 'Milon Burgluer Hand Brakes',
        name: 'Milon Burgluer Hand Brakes',
        description: 'milon.burgluer.handbrake.key',
        mappedCategories: null
      }
    ]
  },
  {
    category: 'PLUG_N_CHARGE',
    key: 'PLUG_N_CHARGE',
    displayName: '⚡ Plug-n-Charge Alerts',
    name: '⚡ Plug-n-Charge Alerts',
    enabled: true,
    description: 'Triggers related to charging, payment, and charging stations.',
    isMandatory: true,
    mappedRules: null,
    mappedNotificationKeys: [
      { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', displayName: 'Plug-n-Charge Active', name: 'Plug-n-Charge Active', notificationCategory: 'PLUG_N_CHARGE', description: 'Charging session started successfully.' },
      { key: 'RULE_PLUG_CHARGE_COMPLETED', displayName: 'Plug-n-Charge Completed', name: 'Plug-n-Charge Completed', notificationCategory: 'PLUG_N_CHARGE', description: 'Charging session reached 100% capacity.' }
    ]
  },
  {
    category: 'VEHICLE_REMOTE_CONTROL',
    key: 'VEHICLE_REMOTE_CONTROL',
    displayName: '📲 Remote Vehicle Control',
    name: '📲 Remote Vehicle Control',
    enabled: true,
    description: 'Commands sent remotely to start engine, lock doors, etc.',
    isMandatory: true,
    mappedRules: null,
    mappedNotificationKeys: [
      { key: 'RULE_REM_START_SUCCESS_CONFIRM', displayName: 'Remote Start Succeeded', name: 'Remote Start Succeeded', notificationCategory: 'VEHICLE_REMOTE_CONTROL', description: 'Engine started running via app request.' },
      { key: 'RULE_REM_START_FAILED_ALERT', displayName: 'Remote Start Failed', name: 'Remote Start Failed', notificationCategory: 'VEHICLE_REMOTE_CONTROL', description: 'Engine start request aborted due to error.' }
    ]
  },
  {
    category: 'VEHICLE_SAFETY',
    key: 'VEHICLE_SAFETY',
    displayName: '🛡️ Safety Alerts & Pre-conditions',
    name: '🛡️ Safety Alerts & Pre-conditions',
    enabled: true,
    description: 'Safety warnings, unfastened seatbelts, and door hazard triggers.',
    isMandatory: false,
    mappedRules: null,
    mappedNotificationKeys: [
      { key: 'RULE_REM_START_SAFETY_BLOCK', displayName: 'Remote Start Safety Block', name: 'Remote Start Safety Block', notificationCategory: 'VEHICLE_SAFETY', description: 'Aborted remote start for door safety compliance.' },
      { key: 'RULE_SEATBELT_UNFASTENED_ALERT', displayName: 'Seatbelt Alarm Warning', name: 'Seatbelt Alarm Warning', notificationCategory: 'VEHICLE_SAFETY', description: 'Vehicle moving while seatbelts are unfastened.' }
    ]
  },
  {
    category: 'VEHICLE_DIAGNOSTIC',
    key: 'VEHICLE_DIAGNOSTIC',
    displayName: '🔧 Diagnostic & Telemetry Faults',
    name: '🔧 Diagnostic & Telemetry Faults',
    enabled: true,
    description: 'Engine malfunctions, low battery voltage, and telemetry metrics.',
    isMandatory: false,
    mappedRules: null,
    mappedNotificationKeys: [
      { key: 'RULE_BATTERY_VOLTAGE_FAULT', displayName: '12V Battery Low', name: '12V Battery Low', notificationCategory: 'VEHICLE_DIAGNOSTIC', description: 'Battery drops below 11.8 Volts.' },
      { key: 'RULE_ENGINE_OVER_RPM', displayName: 'Engine Over-RPM Limit', name: 'Engine Over-RPM Limit', notificationCategory: 'VEHICLE_DIAGNOSTIC', description: 'Engine speeds exceeded critical threshold.' }
    ]
  },
  {
    category: 'VEHICLE_SECURITY',
    key: 'VEHICLE_SECURITY',
    displayName: '🔒 Security & Anti-Theft',
    name: '🔒 Security & Anti-Theft',
    enabled: true,
    description: 'Intrusion detection, alarm triggers, and immobilizer status.',
    isMandatory: false,
    mappedRules: null,
    mappedNotificationKeys: [
      { key: 'RULE_SECURITY_INTRUSION_ALERT', displayName: 'Anti-Theft Intrusion Alert', name: 'Anti-Theft Intrusion Alert', notificationCategory: 'VEHICLE_SECURITY', description: 'Intrusion alert from movement sensors.' }
    ]
  },
  {
    category: 'fod',
    key: 'fod',
    displayName: 'Feature On Demand',
    name: 'Feature On Demand',
    description: 'Feature on demand category',
    isMandatory: true,
    mappedRules: null,
    mappedNotificationKeys: []
  }
];

export const DEFAULT_DYNAMIC_NOTIFICATION_KEYS: DynamicKey[] = [
  { key: 'milon.burgluer.handbrake.key', displayName: 'Milon Burgluer Hand Brakes', name: 'Milon Burgluer Hand Brakes', notificationCategory: 'milon.burglar.category', description: 'milon.burgluer.handbrake.key' },
  { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', displayName: 'Plug-n-Charge Active', name: 'Plug-n-Charge Active', notificationCategory: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session started successfully.' },
  { key: 'RULE_PLUG_CHARGE_COMPLETED', displayName: 'Plug-n-Charge Completed', name: 'Plug-n-Charge Completed', notificationCategory: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session reached 100% capacity.' },
  { key: 'RULE_REM_START_SUCCESS_CONFIRM', displayName: 'Remote Start Succeeded', name: 'Remote Start Succeeded', notificationCategory: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine started running via app request.' },
  { key: 'RULE_REM_START_FAILED_ALERT', displayName: 'Remote Start Failed', name: 'Remote Start Failed', notificationCategory: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine start request aborted due to error.' },
  { key: 'RULE_REM_START_SAFETY_BLOCK', displayName: 'Remote Start Safety Block', name: 'Remote Start Safety Block', notificationCategory: 'VEHICLE_SAFETY', enabled: true, description: 'Aborted remote start for door safety compliance.' },
  { key: 'RULE_SEATBELT_UNFASTENED_ALERT', displayName: 'Seatbelt Alarm Warning', name: 'Seatbelt Alarm Warning', notificationCategory: 'VEHICLE_SAFETY', enabled: true, description: 'Vehicle moving while seatbelts are unfastened.' },
  { key: 'RULE_BATTERY_VOLTAGE_FAULT', displayName: '12V Battery Low', name: '12V Battery Low', notificationCategory: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Battery drops below 11.8 Volts.' },
  { key: 'RULE_ENGINE_OVER_RPM', displayName: 'Engine Over-RPM Limit', name: 'Engine Over-RPM Limit', notificationCategory: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Engine speeds exceeded critical threshold.' },
  { key: 'RULE_SECURITY_INTRUSION_ALERT', displayName: 'Anti-Theft Intrusion Alert', name: 'Anti-Theft Intrusion Alert', notificationCategory: 'VEHICLE_SECURITY', enabled: true, description: 'Intrusion alert from movement sensors.' }
];

export const DEFAULT_DYNAMIC_KEYS = DEFAULT_DYNAMIC_NOTIFICATION_KEYS;



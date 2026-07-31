/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicCategory, DynamicKey } from '../types';

export const DEFAULT_DYNAMIC_CATEGORIES: DynamicCategory[] = [
  {
    key: 'milon.burglar.category',
    name: 'Milon Burglar Category',
    description: 'milon.burglar.category',
    isMandatory: true,
    mappedNotificationKeys: [
      {
        key: 'milon.burgluer.handbrake.key',
        name: 'Milon Burgluer Hand Brakes',
        description: 'milon.burgluer.handbrake.key'
      }
    ]
  },
  {
    key: 'PLUG_N_CHARGE',
    name: '⚡ Plug-n-Charge Alerts',
    enabled: true,
    description: 'Triggers related to charging, payment, and charging stations.',
    isMandatory: true,
    mappedNotificationKeys: [
      { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', name: 'Plug-n-Charge Active', notificationCategory: 'PLUG_N_CHARGE', description: 'Charging session started successfully.' },
      { key: 'RULE_PLUG_CHARGE_COMPLETED', name: 'Plug-n-Charge Completed', notificationCategory: 'PLUG_N_CHARGE', description: 'Charging session reached 100% capacity.' }
    ]
  },
  {
    key: 'VEHICLE_REMOTE_CONTROL',
    name: '📲 Remote Vehicle Control',
    enabled: true,
    description: 'Commands sent remotely to start engine, lock doors, etc.',
    isMandatory: true,
    mappedNotificationKeys: [
      { key: 'RULE_REM_START_SUCCESS_CONFIRM', name: 'Remote Start Succeeded', notificationCategory: 'VEHICLE_REMOTE_CONTROL', description: 'Engine started running via app request.' },
      { key: 'RULE_REM_START_FAILED_ALERT', name: 'Remote Start Failed', notificationCategory: 'VEHICLE_REMOTE_CONTROL', description: 'Engine start request aborted due to error.' }
    ]
  },
  {
    key: 'VEHICLE_SAFETY',
    name: '🛡️ Safety Alerts & Pre-conditions',
    enabled: true,
    description: 'Safety warnings, unfastened seatbelts, and door hazard triggers.',
    isMandatory: false,
    mappedNotificationKeys: [
      { key: 'RULE_REM_START_SAFETY_BLOCK', name: 'Remote Start Safety Block', notificationCategory: 'VEHICLE_SAFETY', description: 'Aborted remote start for door safety compliance.' },
      { key: 'RULE_SEATBELT_UNFASTENED_ALERT', name: 'Seatbelt Alarm Warning', notificationCategory: 'VEHICLE_SAFETY', description: 'Vehicle moving while seatbelts are unfastened.' }
    ]
  },
  {
    key: 'VEHICLE_DIAGNOSTIC',
    name: '🔧 Diagnostic & Telemetry Faults',
    enabled: true,
    description: 'Engine malfunctions, low battery voltage, and telemetry metrics.',
    isMandatory: false,
    mappedNotificationKeys: [
      { key: 'RULE_BATTERY_VOLTAGE_FAULT', name: '12V Battery Low', notificationCategory: 'VEHICLE_DIAGNOSTIC', description: 'Battery drops below 11.8 Volts.' },
      { key: 'RULE_ENGINE_OVER_RPM', name: 'Engine Over-RPM Limit', notificationCategory: 'VEHICLE_DIAGNOSTIC', description: 'Engine speeds exceeded critical threshold.' }
    ]
  },
  {
    key: 'VEHICLE_SECURITY',
    name: '🔒 Security & Anti-Theft',
    enabled: true,
    description: 'Intrusion detection, alarm triggers, and immobilizer status.',
    isMandatory: false,
    mappedNotificationKeys: [
      { key: 'RULE_SECURITY_INTRUSION_ALERT', name: 'Anti-Theft Intrusion Alert', notificationCategory: 'VEHICLE_SECURITY', description: 'Intrusion alert from movement sensors.' }
    ]
  },
  {
    key: 'fod',
    name: 'Feature On Demand',
    description: 'Feature on demand category',
    isMandatory: true,
    mappedNotificationKeys: []
  }
];

export const DEFAULT_DYNAMIC_NOTIFICATION_KEYS: DynamicKey[] = [
  { key: 'milon.burgluer.handbrake.key', name: 'Milon Burgluer Hand Brakes', notificationCategory: 'milon.burglar.category', description: 'milon.burgluer.handbrake.key' },
  { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', name: 'Plug-n-Charge Active', notificationCategory: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session started successfully.' },
  { key: 'RULE_PLUG_CHARGE_COMPLETED', name: 'Plug-n-Charge Completed', notificationCategory: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session reached 100% capacity.' },
  { key: 'RULE_REM_START_SUCCESS_CONFIRM', name: 'Remote Start Succeeded', notificationCategory: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine started running via app request.' },
  { key: 'RULE_REM_START_FAILED_ALERT', name: 'Remote Start Failed', notificationCategory: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine start request aborted due to error.' },
  { key: 'RULE_REM_START_SAFETY_BLOCK', name: 'Remote Start Safety Block', notificationCategory: 'VEHICLE_SAFETY', enabled: true, description: 'Aborted remote start for door safety compliance.' },
  { key: 'RULE_SEATBELT_UNFASTENED_ALERT', name: 'Seatbelt Alarm Warning', notificationCategory: 'VEHICLE_SAFETY', enabled: true, description: 'Vehicle moving while seatbelts are unfastened.' },
  { key: 'RULE_BATTERY_VOLTAGE_FAULT', name: '12V Battery Low', notificationCategory: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Battery drops below 11.8 Volts.' },
  { key: 'RULE_ENGINE_OVER_RPM', name: 'Engine Over-RPM Limit', notificationCategory: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Engine speeds exceeded critical threshold.' },
  { key: 'RULE_SECURITY_INTRUSION_ALERT', name: 'Anti-Theft Intrusion Alert', notificationCategory: 'VEHICLE_SECURITY', enabled: true, description: 'Intrusion alert from movement sensors.' }
];

export const DEFAULT_DYNAMIC_KEYS = DEFAULT_DYNAMIC_NOTIFICATION_KEYS;

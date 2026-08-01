/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicCategory, DynamicKey } from '../types';

export const DEFAULT_DYNAMIC_CATEGORIES: DynamicCategory[] = [
  {
    category: 'milon.burglar.category',
    displayName: 'Milon Burglar Category',
    description: 'milon.burglar.category',
    isMandatory: true,
    mappedNotificationKeys: [
      {
        key: 'milon.burgluer.handbrake.key',
        displayName: 'Milon Burgluer Hand Brakes',
        description: 'milon.burgluer.handbrake.key',
        notificationCategory: 'milon.burglar.category'
      }
    ]
  },
  {
    category: 'PLUG_N_CHARGE',
    displayName: '⚡ Plug-n-Charge Alerts',
    description: 'Triggers related to charging, payment, and charging stations.',
    isMandatory: true,
    enabled: true,
    mappedNotificationKeys: [
      { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', displayName: 'Plug-n-Charge Active', notificationCategory: 'PLUG_N_CHARGE', description: 'Charging session started successfully.' },
      { key: 'RULE_PLUG_CHARGE_COMPLETED', displayName: 'Plug-n-Charge Completed', notificationCategory: 'PLUG_N_CHARGE', description: 'Charging session reached 100% capacity.' }
    ]
  },
  {
    category: 'VEHICLE_REMOTE_CONTROL',
    displayName: '📲 Remote Vehicle Control',
    description: 'Commands sent remotely to start engine, lock doors, etc.',
    isMandatory: true,
    enabled: true,
    mappedNotificationKeys: [
      { key: 'RULE_REM_START_SUCCESS_CONFIRM', displayName: 'Remote Start Succeeded', notificationCategory: 'VEHICLE_REMOTE_CONTROL', description: 'Engine started running via app request.' },
      { key: 'RULE_REM_START_FAILED_ALERT', displayName: 'Remote Start Failed', notificationCategory: 'VEHICLE_REMOTE_CONTROL', description: 'Engine start request aborted due to error.' }
    ]
  },
  {
    category: 'VEHICLE_SAFETY',
    displayName: '🛡️ Safety Alerts & Pre-conditions',
    description: 'Safety warnings, unfastened seatbelts, and door hazard triggers.',
    isMandatory: false,
    enabled: true,
    mappedNotificationKeys: [
      { key: 'RULE_REM_START_SAFETY_BLOCK', displayName: 'Remote Start Safety Block', notificationCategory: 'VEHICLE_SAFETY', description: 'Aborted remote start for door safety compliance.' },
      { key: 'RULE_SEATBELT_UNFASTENED_ALERT', displayName: 'Seatbelt Alarm Warning', notificationCategory: 'VEHICLE_SAFETY', description: 'Vehicle moving while seatbelts are unfastened.' }
    ]
  },
  {
    category: 'VEHICLE_DIAGNOSTIC',
    displayName: '🔧 Diagnostic & Telemetry Faults',
    description: 'Engine malfunctions, low battery voltage, and telemetry metrics.',
    isMandatory: false,
    enabled: true,
    mappedNotificationKeys: [
      { key: 'RULE_BATTERY_VOLTAGE_FAULT', displayName: '12V Battery Low', notificationCategory: 'VEHICLE_DIAGNOSTIC', description: 'Battery drops below 11.8 Volts.' },
      { key: 'RULE_ENGINE_OVER_RPM', displayName: 'Engine Over-RPM Limit', notificationCategory: 'VEHICLE_DIAGNOSTIC', description: 'Engine speeds exceeded critical threshold.' }
    ]
  },
  {
    category: 'VEHICLE_SECURITY',
    displayName: '🔒 Security & Anti-Theft',
    description: 'Intrusion detection, alarm triggers, and immobilizer status.',
    isMandatory: false,
    enabled: true,
    mappedNotificationKeys: [
      { key: 'RULE_SECURITY_INTRUSION_ALERT', displayName: 'Anti-Theft Intrusion Alert', notificationCategory: 'VEHICLE_SECURITY', description: 'Intrusion alert from movement sensors.' }
    ]
  },
  {
    category: 'fod',
    displayName: 'Feature On Demand',
    description: 'Feature on demand category',
    isMandatory: true,
    mappedNotificationKeys: []
  },
  {
    category: 'v2hg',
    displayName: 'V2HG',
    description: 'V2HG for EV vehicle',
    isMandatory: false,
    mappedNotificationKeys: [
      {
        key: 'v2hg.charg.connect',
        displayName: 'V2HG Charge',
        description: 'V2HG for EV vehicle',
        category: true,
        notificationCategory: 'v2hg',
        realm: 'us'
      }
    ]
  }
];

export const DEFAULT_DYNAMIC_NOTIFICATION_KEYS: DynamicKey[] = [
  { key: 'milon.burgluer.handbrake.key', displayName: 'Milon Burgluer Hand Brakes', notificationCategory: 'milon.burglar.category', description: 'milon.burgluer.handbrake.key', realm: 'us' },
  { key: 'v2hg.charg.connect', displayName: 'V2HG Charge', notificationCategory: 'v2hg', category: true, realm: 'us', description: 'V2HG for EV vehicle' },
  { key: 'RULE_PLUG_CHARGE_IN_PROGRESS', displayName: 'Plug-n-Charge Active', notificationCategory: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session started successfully.' },
  { key: 'RULE_PLUG_CHARGE_COMPLETED', displayName: 'Plug-n-Charge Completed', notificationCategory: 'PLUG_N_CHARGE', enabled: true, description: 'Charging session reached 100% capacity.' },
  { key: 'RULE_REM_START_SUCCESS_CONFIRM', displayName: 'Remote Start Succeeded', notificationCategory: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine started running via app request.' },
  { key: 'RULE_REM_START_FAILED_ALERT', displayName: 'Remote Start Failed', notificationCategory: 'VEHICLE_REMOTE_CONTROL', enabled: true, description: 'Engine start request aborted due to error.' },
  { key: 'RULE_REM_START_SAFETY_BLOCK', displayName: 'Remote Start Safety Block', notificationCategory: 'VEHICLE_SAFETY', enabled: true, description: 'Aborted remote start for door safety compliance.' },
  { key: 'RULE_SEATBELT_UNFASTENED_ALERT', displayName: 'Seatbelt Alarm Warning', notificationCategory: 'VEHICLE_SAFETY', enabled: true, description: 'Vehicle moving while seatbelts are unfastened.' },
  { key: 'RULE_BATTERY_VOLTAGE_FAULT', displayName: '12V Battery Low', notificationCategory: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Battery drops below 11.8 Volts.' },
  { key: 'RULE_ENGINE_OVER_RPM', displayName: 'Engine Over-RPM Limit', notificationCategory: 'VEHICLE_DIAGNOSTIC', enabled: true, description: 'Engine speeds exceeded critical threshold.' },
  { key: 'RULE_SECURITY_INTRUSION_ALERT', displayName: 'Anti-Theft Intrusion Alert', notificationCategory: 'VEHICLE_SECURITY', enabled: true, description: 'Intrusion alert from movement sensors.' }
];

export const DEFAULT_DYNAMIC_KEYS = DEFAULT_DYNAMIC_NOTIFICATION_KEYS;

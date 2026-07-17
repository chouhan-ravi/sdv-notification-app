/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../types';

export const DEFAULT_RULES: Rule[] = [
  {
    id: 'rule_rem_start_success',
    name: 'Remote Start Successful',
    ruleKey: 'RULE_REM_START_SUCCESS_CONFIRM',
    categoryKey: 'VEHICLE_REMOTE_CONTROL',
    priority: 'high',
    criticality: 'INFO',
    enabled: true,
    description: 'Triggered when a remote start command completes successfully and the engine starts running.',
    conditions: [
      {
        id: 'c1',
        fieldPath: 'execution_status',
        operator: 'equals',
        value: 'SUCCESS'
      },
      {
        id: 'c2',
        fieldPath: 'vehicle_state_snapshot.engine_state',
        operator: 'equals',
        value: 'RUNNING'
      },
      {
        id: 'c3',
        fieldPath: 'response_header.command_id',
        operator: 'contains',
        value: 'cmd_rem_start_'
      }
    ],
    notificationTitle: 'Remote Start Successful',
    notificationBody: 'Your engine is running. Cabin temperature is {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C.',
    sound: 'default',
    dataMetadata: [
      { key: 'engine_state', value: '{vehicle_state_snapshot.engine_state}' },
      { key: 'runtime_limit_minutes', value: '15' }
    ]
  },
  {
    id: 'rule_rem_start_safety_fail',
    name: 'Remote Start Doors Unlocked Safety Block',
    ruleKey: 'RULE_REM_START_SAFETY_BLOCK',
    categoryKey: 'VEHICLE_SAFETY',
    priority: 'high',
    criticality: 'MAJOR',
    enabled: true,
    description: 'Aborts and logs remote starts requested when vehicle doors are unlocked to prevent unauthorised entry.',
    conditions: [
      {
        id: 'c4',
        fieldPath: 'execution_status',
        operator: 'equals',
        value: 'FAILED'
      },
      {
        id: 'c5',
        fieldPath: 'vehicle_state_snapshot.safety_pre_conditions.doors_locked',
        operator: 'equals',
        value: 'false'
      },
      {
        id: 'c6',
        fieldPath: 'response_header.command_id',
        operator: 'contains',
        value: 'cmd_rem_start_'
      }
    ],
    notificationTitle: 'Remote Start Aborted',
    notificationBody: 'Safety Alert: Remote Start failed because vehicle doors are unlocked.',
    sound: 'alarm_alert',
    dataMetadata: [
      { key: 'reason', value: 'DOORS_UNLOCKED' },
      { key: 'criticality_level', value: 'HIGH_RISK' }
    ]
  },
  {
    id: 'rule_battery_critical',
    name: '12V Battery Critical low level',
    ruleKey: 'RULE_BATTERY_VOLTAGE_FAULT',
    categoryKey: 'VEHICLE_DIAGNOSTIC',
    priority: 'high',
    criticality: 'CRITICAL',
    enabled: true,
    description: 'Alerts fleet operators when the 12V lead-acid aux battery drops below critical starting voltage.',
    conditions: [
      {
        id: 'c7',
        fieldPath: 'vehicle_state_snapshot.telemetry.12v_battery_v',
        operator: 'less_than',
        value: '11.8'
      }
    ],
    notificationTitle: 'Critical Battery Low',
    notificationBody: 'Vehicle 12V Battery is critical ({vehicle_state_snapshot.telemetry.12v_battery_v}V). Please drive or service immediately.',
    sound: 'critical_siren',
    dataMetadata: [
      { key: 'battery_voltage', value: '{vehicle_state_snapshot.telemetry.12v_battery_v}V' },
      { key: 'diagnostic_code', value: 'BATT_LOW_0921' }
    ]
  },
  {
    id: 'rule_engine_rpm_fault',
    name: 'Engine Speed Hyper-RPM warning',
    ruleKey: 'RULE_ENGINE_OVER_RPM',
    categoryKey: 'VEHICLE_DIAGNOSTIC',
    priority: 'normal',
    criticality: 'MAJOR',
    enabled: true,
    description: 'Detects extreme RPM peaks indicating propulsion over-stress or testing load limit warnings.',
    conditions: [
      {
        id: 'c8',
        fieldPath: 'vehicle_state_snapshot.engine_rpm',
        operator: 'greater_than',
        value: '5500'
      }
    ],
    notificationTitle: 'Propulsion Alert: Extreme RPM',
    notificationBody: 'High engine stress detected ({vehicle_state_snapshot.engine_rpm} RPM). Active thermal regulation enabled.',
    sound: 'default',
    dataMetadata: [
      { key: 'rpm_level', value: '{vehicle_state_snapshot.engine_rpm}' },
      { key: 'propulsion_type', value: '{vehicle_state_snapshot.propulsion_system}' }
    ]
  },
  {
    id: 'rule_security_theft_fob',
    name: 'Anti-Theft Fob Absence Lockout',
    ruleKey: 'RULE_SECURITY_INTRUSION_ALERT',
    categoryKey: 'VEHICLE_SECURITY',
    priority: 'high',
    criticality: 'CRITICAL',
    enabled: true,
    description: 'Flags critical theft scenario where the vehicle moves or engages gear without the Key Fob being present inside.',
    conditions: [
      {
        id: 'c9',
        fieldPath: 'vehicle_state_snapshot.engine_state',
        operator: 'equals',
        value: 'RUNNING'
      },
      {
        id: 'c10',
        fieldPath: 'vehicle_state_snapshot.safety_pre_conditions.key_fob_detected_inside',
        operator: 'equals',
        value: 'false'
      },
      {
        id: 'c11',
        fieldPath: 'vehicle_state_snapshot.safety_pre_conditions.transmission_gear',
        operator: 'not_equals',
        value: 'PARK'
      }
    ],
    notificationTitle: 'Anti-Theft Immobilizer Alert',
    notificationBody: 'Engine running and gear engaged ({vehicle_state_snapshot.safety_pre_conditions.transmission_gear}) but Key Fob NOT detected inside. Mobilizing remote lockout.',
    sound: 'siren_intense',
    dataMetadata: [
      { key: 'immobilizer_active', value: 'TRUE' },
      { key: 'gear_engaged', value: '{vehicle_state_snapshot.safety_pre_conditions.transmission_gear}' }
    ]
  }
];

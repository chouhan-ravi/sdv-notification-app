/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../types';

export const DEFAULT_RULES: Rule[] = [
  {
    id: "MILON_RULE",
    name: "Milon Rule",
    enabled: true,
    description: "Vehicle doors lock & unlock remotely",
    config: [
      {
        id: "cfg_milon_burglar",
        notificationCategory: "milon.burglar.category",
        notificationKey: "milon.burgluer",
        criticality: "INFO",
        conditions: [
          {
            and: [
              {
                id: "c_bjki7a7",
                value: "SUCCESS",
                operator: "equals",
                fieldPath: "execution_status"
              },
              {
                id: "c7",
                value: "11.8",
                operator: "less_than",
                fieldPath: "vehicle_state_snapshot.telemetry.12v_battery_v"
              }
            ]
          }
        ],
        metadata: [
          {
            key: "engine_state",
            value: "{vehicle_state_snapshot.engine_state}"
          }
        ],
        notificationTemplate: {
          title: "Circuit Milestone Achieved! 🎉",
          body: "Excellent work! You just completed your 'Q-Strength Circuit' and hit a new personal record.",
          sound: "default",
          badge: 1
        }
      }
    ]
  },
  {
    id: "REMOTE_START_RULE",
    name: "Remote Engine Start Confirmation",
    enabled: true,
    description: "Triggers notification when a remote start command executes successfully.",
    config: [
      {
        id: "cfg_rem_start_success",
        notificationCategory: "vehicle.remote.control",
        notificationKey: "vehicle.remote.start.success",
        criticality: "INFO",
        conditions: [
          {
            and: [
              {
                id: "c_rem_1",
                fieldPath: "execution_status",
                operator: "equals",
                value: "SUCCESS"
              },
              {
                id: "c_rem_2",
                fieldPath: "vehicle_state_snapshot.engine_state",
                operator: "equals",
                value: "RUNNING"
              }
            ]
          }
        ],
        metadata: [
          { key: "engine_state", value: "{vehicle_state_snapshot.engine_state}" },
          { key: "runtime_limit_minutes", value: "15" }
        ],
        notificationTemplate: {
          title: "Remote Start Successful",
          body: "Your engine is running. Cabin temperature is {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C.",
          sound: "default",
          badge: 1
        }
      }
    ]
  },
  {
    id: "BATTERY_WARNING_RULE",
    name: "12V Battery Critical Low Fault",
    enabled: true,
    description: "Alerts when 12V battery voltage drops below critical operational voltage.",
    config: [
      {
        id: "cfg_batt_low",
        notificationCategory: "vehicle.diagnostic.category",
        notificationKey: "vehicle.diagnostic.battery.low",
        criticality: "CRITICAL",
        conditions: [
          {
            and: [
              {
                id: "c_batt_1",
                fieldPath: "vehicle_state_snapshot.telemetry.12v_battery_v",
                operator: "less_than",
                value: "11.8"
              }
            ]
          }
        ],
        metadata: [
          { key: "battery_voltage", value: "{vehicle_state_snapshot.telemetry.12v_battery_v}V" },
          { key: "diagnostic_code", value: "BATT_LOW_0921" }
        ],
        notificationTemplate: {
          title: "Critical Battery Low Alert",
          body: "Vehicle 12V Battery is critical ({vehicle_state_snapshot.telemetry.12v_battery_v}V). Please service immediately.",
          sound: "critical_siren",
          badge: 1
        }
      }
    ]
  },
  {
    id: "SECURITY_INTRUSION_RULE",
    name: "Anti-Theft Intrusion Lockout",
    enabled: true,
    description: "Triggers security alert when key fob is absent while gear is engaged.",
    config: [
      {
        id: "cfg_intrusion_lockout",
        notificationCategory: "vehicle.security.category",
        notificationKey: "vehicle.security.intrusion.alert",
        criticality: "CRITICAL",
        conditions: [
          {
            and: [
              {
                id: "c_sec_1",
                fieldPath: "vehicle_state_snapshot.engine_state",
                operator: "equals",
                value: "RUNNING"
              },
              {
                id: "c_sec_2",
                fieldPath: "vehicle_state_snapshot.safety_pre_conditions.key_fob_detected_inside",
                operator: "equals",
                value: "false"
              }
            ]
          }
        ],
        metadata: [
          { key: "immobilizer_active", value: "TRUE" }
        ],
        notificationTemplate: {
          title: "Anti-Theft Immobilizer Alert",
          body: "Engine running but Key Fob NOT detected inside vehicle. Mobilizing remote lockout.",
          sound: "siren_intense",
          badge: 1
        }
      }
    ]
  }
];

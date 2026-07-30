/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PresetPayload {
  name: string;
  description: string;
  payload: any;
}

export const SAMPLE_PAYLOADS: PresetPayload[] = [
  {
    name: 'Remote Start Successful Event',
    description: 'A successful remote start command event matching RULE_REM_START_SUCCESS_CONFIRM.',
    payload: {
      "response_header": {
        "command_id": "cmd_rem_start_88321a",
        "vin": "1HGCR2F8XHA000000",
        "timestamp": 1784324464
      },
      "notification_type": "MILON_RULE",
      "execution_status": "SUCCESS",
      "error_code": "NONE",
      "vehicle_state_snapshot": {
        "engine_state": "RUNNING",
        "engine_rpm": 1200,
        "propulsion_system": "ICE",
        "safety_pre_conditions": {
          "transmission_gear": "PARK",
          "hood_closed": true,
          "trunk_closed": true,
          "doors_locked": true,
          "key_fob_detected_inside": false,
          "brake_pedal_depressed": false
        },
        "hvac_status": {
          "cabin_temp_c": 31.5,
          "compressor_active": true,
          "fan_speed_level": 4
        },
        "telemetry": {
          "12v_battery_v": 14.2,
          "fuel_level_pct": 45.0
        }
      }
    }
  },
  {
    name: 'Remote Start Doors Unlocked Safety Block',
    description: 'A failed remote start command event due to unlocked doors safety block.',
    payload: {
      "response_header": {
        "command_id": "cmd_rem_start_90311f",
        "vin": "1HGCR2F8XHA000000",
        "timestamp": 1784324600
      },
      "notification_type": "RLU_NOTIFICATION",
      "execution_status": "FAILED",
      "error_code": "SAFETY_LOCKOUT_DOORS_UNLOCKED",
      "vehicle_state_snapshot": {
        "engine_state": "OFF",
        "engine_rpm": 0,
        "propulsion_system": "ICE",
        "safety_pre_conditions": {
          "transmission_gear": "PARK",
          "hood_closed": true,
          "trunk_closed": true,
          "doors_locked": false,
          "key_fob_detected_inside": false,
          "brake_pedal_depressed": false
        },
        "hvac_status": {
          "cabin_temp_c": 38.0,
          "compressor_active": false,
          "fan_speed_level": 0
        },
        "telemetry": {
          "12v_battery_v": 12.6,
          "fuel_level_pct": 45.0
        }
      }
    }
  },
  {
    name: '12V Battery Critical Level Warning',
    description: 'Low aux battery voltage payload triggering telemetry alerts.',
    payload: {
      "response_header": {
        "command_id": "cmd_periodic_telemetry_553b",
        "vin": "1HGCR2F8XHA445910",
        "timestamp": 1784324810
      },
      "notification_type": "MILON_RULE",
      "execution_status": "NONE",
      "error_code": "NONE",
      "vehicle_state_snapshot": {
        "engine_state": "OFF",
        "engine_rpm": 0,
        "propulsion_system": "ICE",
        "safety_pre_conditions": {
          "transmission_gear": "PARK",
          "hood_closed": true,
          "trunk_closed": true,
          "doors_locked": true,
          "key_fob_detected_inside": false,
          "brake_pedal_depressed": false
        },
        "hvac_status": {
          "cabin_temp_c": 19.5,
          "compressor_active": false,
          "fan_speed_level": 0
        },
        "telemetry": {
          "12v_battery_v": 11.4,
          "fuel_level_pct": 12.5
        }
      }
    }
  },
  {
    name: 'Engine Extreme RPM stress warning',
    description: 'Vehicle driving payload with RPM exceeding 5500 limit.',
    payload: {
      "response_header": {
        "command_id": "cmd_performance_log_711a",
        "vin": "1HGCR2F8XHA982133",
        "timestamp": 1784325100
      },
      "notification_type": "RLU_NOTIFICATION",
      "execution_status": "NONE",
      "error_code": "NONE",
      "vehicle_state_snapshot": {
        "engine_state": "RUNNING",
        "engine_rpm": 5850,
        "propulsion_system": "ICE",
        "safety_pre_conditions": {
          "transmission_gear": "DRIVE",
          "hood_closed": true,
          "trunk_closed": true,
          "doors_locked": true,
          "key_fob_detected_inside": true,
          "brake_pedal_depressed": false
        },
        "hvac_status": {
          "cabin_temp_c": 22.0,
          "compressor_active": true,
          "fan_speed_level": 2
        },
        "telemetry": {
          "12v_battery_v": 14.1,
          "fuel_level_pct": 82.0
        }
      }
    }
  },
  {
    name: 'Active Theft Security Alert',
    description: 'Anti-theft alarm: vehicle in DRIVE with no key fob detected inside.',
    payload: {
      "response_header": {
        "command_id": "cmd_security_status_221x",
        "vin": "1HGCR2F8XHA831200",
        "timestamp": 1784325400
      },
      "notification_type": "SECURITY_NOTIFICATION",
      "execution_status": "NONE",
      "error_code": "SECURITY_BREACH_KEYFOB_ABSENT",
      "vehicle_state_snapshot": {
        "engine_state": "RUNNING",
        "engine_rpm": 2400,
        "propulsion_system": "ICE",
        "safety_pre_conditions": {
          "transmission_gear": "DRIVE",
          "hood_closed": true,
          "trunk_closed": true,
          "doors_locked": false,
          "key_fob_detected_inside": false,
          "brake_pedal_depressed": false
        },
        "hvac_status": {
          "cabin_temp_c": 24.5,
          "compressor_active": false,
          "fan_speed_level": 1
        },
        "telemetry": {
          "12v_battery_v": 13.9,
          "fuel_level_pct": 59.0
        }
      }
    }
  }
];

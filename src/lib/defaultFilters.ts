/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessFilter, CarOwnerSetting } from '../types';

export const CATEGORIES = [
  { key: 'PLUG_N_CHARGE', name: '⚡ Plug-n-Charge Alerts' },
  { key: 'VEHICLE_REMOTE_CONTROL', name: '📲 Remote Vehicle Control' },
  { key: 'VEHICLE_SAFETY', name: '🛡️ Safety Alerts & Pre-conditions' },
  { key: 'VEHICLE_DIAGNOSTIC', name: '🔧 Diagnostic & Telemetry Faults' },
  { key: 'VEHICLE_SECURITY', name: '🔒 Security & Anti-Theft' }
];

export const DEFAULT_BUSINESS_FILTERS: BusinessFilter[] = [
  {
    id: 'bf_plug_n_charge_us',
    name: 'Block Plug-n-Charge Alerts for US Region',
    categoryKey: 'PLUG_N_CHARGE',
    ruleKey: 'All',
    cssGen: 'All',
    vehicleModel: 'All',
    yearStart: 2020,
    yearEnd: 2027,
    vehicleType: 'EV',
    region: 'US',
    enabled: true,
    action: 'BLOCK',
    description: 'Corporate ingress block rule halting Plug-n-Charge notifications in the United States due to billing provider maintenance.'
  },
  {
    id: 'bf_remote_ice_old',
    name: 'Block Remote Engine Start for Old Legacy ICE models in Europe',
    categoryKey: 'VEHICLE_REMOTE_CONTROL',
    ruleKey: 'All',
    cssGen: 'Gen 5',
    vehicleModel: 'Civic',
    yearStart: 2018,
    yearEnd: 2022,
    vehicleType: 'ICE',
    region: 'EU',
    enabled: true,
    action: 'BLOCK',
    description: 'Halts remote starting alerts on older ICE powertrains in Europe to comply with strict emission and idling legislation.'
  }
];

export const DEFAULT_CAR_OWNER_SETTINGS: CarOwnerSetting[] = [
  {
    id: 'cos_1',
    userId: 'usr_ravi_55',
    vin: '1HGCR2F8XHA000000',
    categoryKey: 'PLUG_N_CHARGE',
    enabled: false // This user opted out of Plug-n-Charge alerts on their main EV
  },
  {
    id: 'cos_2',
    userId: 'usr_ravi_55',
    vin: '1HGCR2F8XHA000000',
    categoryKey: 'VEHICLE_REMOTE_CONTROL',
    enabled: true
  }
];

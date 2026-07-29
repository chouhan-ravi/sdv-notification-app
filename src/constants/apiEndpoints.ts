/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const API_BASE_URL = '/api';

/**
 * Central API Endpoints Registry for SDV Connected Gateway Services
 */
export const API_ENDPOINTS = {
  // 1. Rules Matrix Registry API URLs
  RULES_MATRIX: {
    EVALUATE: '/rules/evaluate',
    GET_ALL_RULES: '/rules',
    GET_RULE_BY_ID: (id: string) => `/rules/${id}`,
    CREATE_RULE: '/rules',
    UPDATE_RULE: (id: string) => `/rules/${id}`,
    DELETE_RULE: (id: string) => `/rules/${id}`,
    TOGGLE_STATUS: (id: string) => `/rules/${id}/toggle`,
    RECACHE_MATRIX: '/rules/recache',
    BATCH_SYNC: '/rules/batch-sync',
    EXPORT_RULES: '/rules/export',
    IMPORT_RULES: '/rules/import',
  },

  // 2. Notification Category & Key API URLs
  NOTIFICATION_CATEGORY: {
    GET_CATEGORIES: '/categories',
    GET_CATEGORY_BY_KEY: (key: string) => `/categories/${key}`,
    CREATE_CATEGORY: '/categories',
    UPDATE_CATEGORY: (key: string) => `/categories/${key}`,
    DELETE_CATEGORY: (key: string) => `/categories/${key}`,
    TOGGLE_CATEGORY: (key: string) => `/categories/${key}/toggle`,
    
    // Notification Keys
    GET_RULE_KEYS: '/rule-keys',
    GET_RULE_KEY_BY_ID: (key: string) => `/rule-keys/${key}`,
    CREATE_RULE_KEY: '/rule-keys',
    UPDATE_RULE_KEY: (key: string) => `/rule-keys/${key}`,
    DELETE_RULE_KEY: (key: string) => `/rule-keys/${key}`,
    TOGGLE_RULE_KEY: (key: string) => `/rule-keys/${key}/toggle`,
    REORDER_RELATIONS: '/categories/reorder-relations',
  },

  // 3. Scheduler & Proactive Notification API URLs
  SCHEDULER_PROACTIVE: {
    GET_SCHEDULERS: '/schedulers',
    GET_SCHEDULER_BY_ID: (id: string) => `/schedulers/${id}`,
    CREATE_SCHEDULER: '/schedulers',
    UPDATE_SCHEDULER: (id: string) => `/schedulers/${id}`,
    DELETE_SCHEDULER: (id: string) => `/schedulers/${id}`,
    TRIGGER_PROACTIVE_DISPATCH: (id: string) => `/schedulers/${id}/trigger`,

    // After-Sales Maintenance Records
    GET_AFTER_SALES_RECORDS: '/after-sales',
    CREATE_AFTER_SALES_RECORD: '/after-sales',
    UPDATE_AFTER_SALES_RECORD: (id: string) => `/after-sales/${id}`,
    DELETE_AFTER_SALES_RECORD: (id: string) => `/after-sales/${id}`,
    SYNC_MAINTENANCE_TRIGGER: (id: string) => `/after-sales/${id}/sync-trigger`,
  },

  // 4. Gateway Ingress Filters & Owner Preferences API URLs
  GATEWAY_FILTERS: {
    GET_BUSINESS_FILTERS: '/filters/business',
    CREATE_BUSINESS_FILTER: '/filters/business',
    TOGGLE_BUSINESS_FILTER: (id: string) => `/filters/business/${id}/toggle`,
    DELETE_BUSINESS_FILTER: (id: string) => `/filters/business/${id}`,

    GET_USER_SETTINGS: '/filters/user-settings',
    CREATE_USER_SETTING: '/filters/user-settings',
    TOGGLE_USER_SETTING: (id: string) => `/filters/user-settings/${id}/toggle`,
    DELETE_USER_SETTING: (id: string) => `/filters/user-settings/${id}`,
  },

  // 5. Localization & Translation API URLs
  LOCALIZATION: {
    GET_TRANSLATIONS: '/i18n/translations',
    UPDATE_TRANSLATION: '/i18n/translations',
    GET_LOCALES: '/i18n/locales',
  },

  // 6. Telemetry Feed & Audit Log API URLs
  TELEMETRY_AUDIT: {
    GET_LOGS: '/telemetry/logs',
    POST_LOG: '/telemetry/logs',
    CLEAR_LOGS: '/telemetry/logs/clear',
    SIMULATE_EVENT: '/telemetry/simulate',
    WEBSOCKET_FEED: '/telemetry/ws-feed',
  }
} as const;

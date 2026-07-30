/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const API_BASE_URL = 'http://localhost:8080';

/**
 * Central API Endpoints Registry for SDV Connected Gateway Services
 */
const API_PATH = '/api/v1';

export const SERVICE_ENDPOINTS = {
  RULE_SERVICE: `/rule-engine-service${API_PATH}`
} as const;

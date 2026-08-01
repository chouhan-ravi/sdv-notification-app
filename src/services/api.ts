/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_BASE_URL, SERVICE_ENDPOINTS } from '../constants/apiEndpoints';

export interface HttpLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  payload?: any;
  status?: number;
  statusText?: string;
  response?: any;
  error?: string;
}

export interface RequestInterceptor {
  (config: RequestInit): RequestInit | Promise<RequestInit>;
}

export interface ResponseInterceptor {
  (response: Response): Response | Promise<Response>;
}

type LogListener = (logs: HttpLog[]) => void;

class ApiService {
  private baseUrl: string = API_BASE_URL;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private httpLogs: HttpLog[] = [];
  private logListeners: Set<LogListener> = new Set();

  constructor() {
    // 1. Add Default Request Interceptor for Dynamic Header Upgrade & Authorization
    this.addRequestInterceptor((config) => {
      const headers = new Headers(config.headers || {});
      
      // Load current customized upgrade token from localStorage or use secure default
      const upgradeToken = localStorage.getItem('sdv_api_upgrade_token') || 'SDV-GATEWAY-v2.5-SECURE';
      if (upgradeToken) {
        headers.set('X-Header-Upgrade', upgradeToken);
        headers.set('Authorization', `Bearer ${upgradeToken}`);
      }

      // Automatically set standard content-type for payload delivery
      if (!headers.has('Content-Type') && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
        headers.set('Content-Type', 'application/json');
      }

      return {
        ...config,
        headers,
      };
    });

    // 2. Add Default Response Interceptor for intercepting network issues or upgrading headers on response
    this.addResponseInterceptor((response) => {
      // You can capture custom headers or perform session verification here
      const gatewayStatus = response.headers.get('X-Gateway-Upgraded');
      if (gatewayStatus === 'true') {
        // Dynamic feedback if server responded with an upgraded protocol
      }
      return response;
    });
  }

  public addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  public getLogs(): HttpLog[] {
    return [...this.httpLogs];
  }

  public clearLogs() {
    this.httpLogs = [];
    this.notifyLogListeners();
  }

  public subscribeLogs(listener: LogListener) {
    this.logListeners.add(listener);
    // Emit initial logs
    listener([...this.httpLogs]);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  private notifyLogListeners() {
    const logsCopy = [...this.httpLogs];
    this.logListeners.forEach(listener => listener(logsCopy));
  }

  private addHttpLog(log: HttpLog) {
    this.httpLogs = [log, ...this.httpLogs].slice(0, 50); // Store last 50 calls
    this.notifyLogListeners();
  }

  private updateHttpLog(id: string, updates: Partial<HttpLog>) {
    this.httpLogs = this.httpLogs.map(log => log.id === id ? { ...log, ...updates } : log);
    this.notifyLogListeners();
  }

  private async executeFetch(url: string, config: RequestInit): Promise<Response> {
    const logId = 'log_' + Math.random().toString(36).substring(2, 9);
    let activeConfig = { ...config };
    
    // Execute all registered request interceptors
    for (const interceptor of this.requestInterceptors) {
      try {
        activeConfig = await interceptor(activeConfig);
      } catch (err) {
        console.error('Request interceptor failed', err);
      }
    }

    // Convert Headers instance or configuration to readable JSON for logging
    const headersObj: Record<string, string> = {};
    if (activeConfig.headers) {
      const headersInstance = new Headers(activeConfig.headers);
      headersInstance.forEach((value, key) => {
        headersObj[key] = value;
      });
    }

    // Parse the payload body if available
    let parsedPayload: any = undefined;
    if (activeConfig.body && typeof activeConfig.body === 'string') {
      try {
        parsedPayload = JSON.parse(activeConfig.body);
      } catch (e) {
        parsedPayload = activeConfig.body;
      }
    }

    // Initialize network log
    const initialLog: HttpLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      method: activeConfig.method || 'GET',
      url: `${this.baseUrl}${url}`,
      headers: headersObj,
      payload: parsedPayload
    };
    this.addHttpLog(initialLog);

    try {
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}${url}`, activeConfig);
      } catch (primaryErr) {
        // Fallback to relative URL path if localhost:8080 fails
        console.warn(`Primary fetch to ${this.baseUrl}${url} failed, trying relative path ${url}...`);
        response = await fetch(url, activeConfig);
      }
      
      // Execute all registered response interceptors
      let interceptedResponse = response.clone();
      for (const interceptor of this.responseInterceptors) {
        try {
          interceptedResponse = await interceptor(interceptedResponse);
        } catch (err) {
          console.error('Response interceptor failed', err);
        }
      }

      // Read response content for diagnostics
      let responseBody: any = null;
      try {
        const text = await response.clone().text();
        responseBody = JSON.parse(text);
      } catch (e) {
        try {
          responseBody = await response.clone().text();
        } catch (e2) {
          responseBody = null;
        }
      }

      this.updateHttpLog(logId, {
        status: response.status,
        statusText: response.statusText,
        response: responseBody
      });

      return response;
    } catch (error: any) {
      this.updateHttpLog(logId, {
        error: error.message || 'Connection refused or Network Error',
        status: 0,
        statusText: 'FAILED'
      });
      throw error;
    }
  }

  public async get<T>(url: string, config: RequestInit = {}): Promise<T> {
    const response = await this.executeFetch(url, { ...config, method: 'GET' });
    if (!response.ok) {
      throw new Error(`GET API Call failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  public async post<T>(url: string, data: any, config: RequestInit = {}): Promise<T> {
    const response = await this.executeFetch(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`POST API Call failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  public async put<T>(url: string, data: any, config: RequestInit = {}): Promise<T> {
    const response = await this.executeFetch(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`PUT API Call failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  public async delete<T>(url: string, config: RequestInit = {}): Promise<T> {
    const response = await this.executeFetch(url, { ...config, method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`DELETE API Call failed with status ${response.status}`);
    }
    try {
      return await response.json() as T;
    } catch (e) {
      return {} as T;
    }
  }

  public async evaluateRules(notificationEvent: any): Promise<any> {
    return this.post(`${SERVICE_ENDPOINTS.RULE_SERVICE}/rules/evaluate`, notificationEvent);
  }

  // Rules Matrix API Services
  public async fetchRules(): Promise<any> {
    return this.get(`${SERVICE_ENDPOINTS.RULE_SERVICE}/rules`);
  }

  public async saveRule(rule: any): Promise<any> {
    return rule.id
      ? this.put(`${SERVICE_ENDPOINTS.RULE_SERVICE}/rules/${rule.id}`, rule)
      : this.post(`${SERVICE_ENDPOINTS.RULE_SERVICE}/rules`, rule);
  }

  public async deleteRule(id: string): Promise<any> {
    return this.delete(`${SERVICE_ENDPOINTS.RULE_SERVICE}/rules/${id}`);
  }

  public async recacheRules(ruleIds?: string[]): Promise<any> {
    const payload = ruleIds && ruleIds.length > 0 ? { ruleIds } : {};
    return this.post(`${SERVICE_ENDPOINTS.RULE_SERVICE}/rules/re-cache`, payload);
  }

  // Notification Category API Services
  public async fetchCategories(): Promise<any> {
    return this.get(`${SERVICE_ENDPOINTS.SETTING_SERVICE}/categories`);
  }

  public async createCategory(categoryData: any): Promise<any> {
    return this.post(`${SERVICE_ENDPOINTS.SETTING_SERVICE}/categories`, categoryData);
  }

  public async fetchKeys(): Promise<any> {
    return this.get(`${SERVICE_ENDPOINTS.SETTING_SERVICE}/keys`);
  }

  public async createKey(keyData: any): Promise<any> {
    return this.post(`${SERVICE_ENDPOINTS.SETTING_SERVICE}/keys`, keyData);
  }

  public async fetchMatrixByRealm(realm: string): Promise<any> {
    return this.get(`${SERVICE_ENDPOINTS.SETTING_SERVICE}/matrix/${realm}`);
  }

  // Scheduler & Proactive Notification API Services
  public async fetchSchedulers(): Promise<any> {
    return this.get(`${SERVICE_ENDPOINTS.RULE_SERVICE}/schedulers`);
  }

  public async triggerProactiveNotification(schedulerId: string): Promise<any> {
    return this.post(`${SERVICE_ENDPOINTS.RULE_SERVICE}/schedulers/${schedulerId}/trigger`, {});
  }
}

export const apiService = new ApiService();

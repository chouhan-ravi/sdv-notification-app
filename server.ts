/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { DEFAULT_RULES } from './src/lib/defaultRules';
import { DEFAULT_DYNAMIC_CATEGORIES, DEFAULT_DYNAMIC_NOTIFICATION_KEYS } from './src/lib/defaultCategories';
import { DEFAULT_SCHEDULERS } from './src/lib/defaultAfterSales';
import { Rule } from './src/types';
import { evaluateRulesApiEngine } from './src/lib/rulesEvaluator';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'rules-db.json');

app.use(express.json());

// Initialize Rules Database file with DEFAULT_RULES if it doesn't exist
function getRules(): Rule[] {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading rules db file, resetting to defaults', e);
    }
  }
  // Initialize file with factory defaults
  fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_RULES, null, 2), 'utf8');
  return DEFAULT_RULES;
}

function saveRules(rules: Rule[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(rules, null, 2), 'utf8');
}

// Initialize Audit Logs in Memory Only (LocalStorage only on client, no file storage)
let inMemoryAuditLogs: any[] = [
  {
    id: "seed_log_1",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    vin: "1HGCR2F8XHA445910",
    commandId: "CMD_REM_START_001",
    executionStatus: "SUCCESS",
    eventPayload: {
      command: "remote_start",
      vin: "1HGCR2F8XHA445910",
      vehicle_state_snapshot: {
        engine_state: "RUNNING",
        hvac_status: { cabin_temp_c: 21.5 }
      }
    },
    success: true,
    matchedRules: [{
      ruleId: "rule_1",
      ruleName: "Remote Engine Start Confirmation",
      ruleKey: "RULE_REM_START_SUCCESS_CONFIRM",
      criticality: "INFO",
      priority: "normal",
      conditionEvaluations: []
    }],
    pushNotificationPayload: {
      title: "Remote Start Successful",
      body: "Your engine is running. Cabin temperature is 21.5°C."
    }
  },
  {
    id: "seed_log_2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    vin: "1HGCR2F8XHA982133",
    commandId: "CMD_BATT_CHK_002",
    executionStatus: "FAULT",
    eventPayload: {
      command: "battery_status_check",
      vin: "1HGCR2F8XHA982133",
      vehicle_state_snapshot: {
        battery_system: { voltage_v: 11.2 }
      }
    },
    success: true,
    matchedRules: [{
      ruleId: "rule_3",
      ruleName: "Low Battery Warning Notification",
      ruleKey: "RULE_BATTERY_VOLTAGE_FAULT",
      criticality: "CRITICAL",
      priority: "high",
      conditionEvaluations: []
    }],
    pushNotificationPayload: {
      title: "Low Battery Fault Alert",
      body: "Warning: Vehicle 1HGCR2F8XHA982133 battery voltage is critically low (11.2V)!"
    }
  }
];

function getAuditLogs(): any[] {
  return inMemoryAuditLogs;
}

function saveAuditLogs(logs: any[]) {
  inMemoryAuditLogs = logs;
}

// Generate realistic mock log feed events
function generateLiveMockLog(): any {
  const vins = ["1HGCR2F8XHA445910", "1HGCR2F8XHA982133", "1HGCR2F8XHA831200"];
  const selectedVin = vins[Math.floor(Math.random() * vins.length)];
  const logId = "live_log_" + Math.random().toString(36).substring(2, 9);

  const events = [
    {
      commandId: "CMD_CHARGING_101",
      executionStatus: "COMPLETED",
      eventPayload: {
        command: "charge_status_check",
        vin: selectedVin,
        vehicle_state_snapshot: {
          propulsion_system: "EV",
          battery_state_of_charge: 100
        }
      },
      success: true,
      matchedRules: [{
        ruleId: "rule_charge_completed",
        ruleName: "EV Charging Completed Notification",
        ruleKey: "RULE_EV_CHARGE_COMPLETE",
        criticality: "INFO",
        priority: "normal",
        conditionEvaluations: []
      }],
      pushNotificationPayload: {
        title: "EV Battery Fully Charged",
        body: "Vehicle charging is complete. Battery is at 100% capacity."
      }
    },
    {
      commandId: "CMD_TIRE_WARN_202",
      executionStatus: "WARNING",
      eventPayload: {
        command: "tire_pressure_check",
        vin: selectedVin,
        vehicle_state_snapshot: {
          tire_pressures_psi: { front_left: 26, front_right: 32 }
        }
      },
      success: true,
      matchedRules: [{
        ruleId: "rule_low_tire",
        ruleName: "Tire Pressure Warning",
        ruleKey: "RULE_TIRE_PRESSURE_FAULT",
        criticality: "MAJOR",
        priority: "normal",
        conditionEvaluations: []
      }],
      pushNotificationPayload: {
        title: "Low Tire Pressure Alert",
        body: "Warning: Low tire pressure detected in Front Left tire (26 PSI)."
      }
    },
    {
      commandId: "CMD_INTRUSION_911",
      executionStatus: "ALERT",
      eventPayload: {
        command: "security_alarm",
        vin: selectedVin,
        vehicle_state_snapshot: {
          security_status: "ALARM_TRIGGERED"
        }
      },
      success: true,
      matchedRules: [{
        ruleId: "rule_intrusion",
        ruleName: "Theft/Intrusion Security Threat",
        ruleKey: "RULE_SECURITY_INTRUSION_ALERT",
        criticality: "CRITICAL",
        priority: "high",
        conditionEvaluations: []
      }],
      pushNotificationPayload: {
        title: "SECURITY THREAT - ALARM ACTIVE",
        body: "Urgent: Security alarm triggered on vehicle! Perimeter violation detected."
      }
    }
  ];

  const chosenEvent = events[Math.floor(Math.random() * events.length)];
  return {
    id: logId,
    timestamp: new Date().toISOString(),
    vin: selectedVin,
    ...chosenEvent
  };
}

// 1. Header Upgrade Interceptor Validation Middleware
app.use((req, res, next) => {
  const upgradeHeader = req.header('X-Header-Upgrade');
  const authHeader = req.header('Authorization');

  // Log incoming REST operations
  console.log(`[Gateway Interceptor] Incoming request: ${req.method} ${req.path}`);
  if (upgradeHeader) {
    console.log(`  ├── [Success] Header "X-Header-Upgrade" matches client interceptor value: "${upgradeHeader}"`);
    console.log(`  └── [Success] Auth Token: "${authHeader}"`);
    // Inject response confirmation headers for frontend validation
    res.setHeader('X-Gateway-Upgraded', 'true');
    res.setHeader('X-Received-Header-Upgrade', upgradeHeader);
  } else {
    console.warn(`  └── [Warning] Request contains NO custom "X-Header-Upgrade" client header!`);
    res.setHeader('X-Gateway-Upgraded', 'false');
  }

  next();
});

// 2. REST API endpoints
const RULE_PATHS = ['/rule-engine-service/api/v1/rules', '/api/rules', '/rules'];
const RECACHE_PATHS = ['/rule-engine-service/api/v1/rules/re-cache', '/api/rules/re-cache', '/rules/re-cache'];
const RESET_PATHS = ['/rule-engine-service/api/v1/rules/reset', '/api/rules/reset', '/rules/reset'];
const EVALUATE_PATHS = ['/rule-engine-service/api/v1/rules/evaluate', '/api/rules/evaluate', '/api/evaluate', '/evaluate'];
const RULE_ID_PATHS = ['/rule-engine-service/api/v1/rules/:id', '/api/rules/:id', '/rules/:id'];
const CATEGORY_PATHS = ['/settings-service/api/v1/categories', '/rule-engine-service/api/v1/categories', '/api/categories', '/categories'];
const KEY_PATHS = ['/settings-service/api/v1/keys', '/settings-service/api/v1/rule-keys', '/rule-engine-service/api/v1/rule-keys', '/api/keys', '/keys', '/rule-engine-service/api/v1/notification-keys', '/api/notification-keys'];
const SCHEDULER_PATHS = ['/rule-engine-service/api/v1/schedulers', '/api/schedulers', '/schedulers'];
const TRIGGER_SCHEDULER_PATHS = ['/rule-engine-service/api/v1/schedulers/:id/trigger', '/api/schedulers/:id/trigger'];
const MATRIX_PATHS = ['/matrix', '/api/matrix', '/rule-engine-service/api/v1/matrix', '/settings-service/api/v1/matrix'];
const MATRIX_REALM_PATHS = [
  '/matrix/:realm',
  '/api/matrix/:realm',
  '/rule-engine-service/api/v1/matrix/:realm',
  '/settings-service/api/v1/matrix/:realm',
  '/setting-service/matrix/:realm'
];

// GET: Fetch all active rules
app.get(RULE_PATHS, (req, res) => {
  const rules = getRules();
  res.json(rules);
});

// In-memory store for dynamic Categories & Notification Keys
let inMemoryCategories = [...DEFAULT_DYNAMIC_CATEGORIES];
let inMemoryNotificationKeys = [...DEFAULT_DYNAMIC_NOTIFICATION_KEYS];

// GET: Fetch Relationship Matrix
app.get(MATRIX_PATHS, (req, res) => {
  const rules = getRules();
  const categories = inMemoryCategories;
  const keys = inMemoryNotificationKeys;

  const matrix = categories.map(cat => {
    const catCode = cat.category || (cat as any).key || '';
    const catName = cat.displayName || (cat as any).name || catCode;

    const relatedKeys = keys
      .filter(k => (k.notificationCategory || (k as any).categoryKey) === catCode)
      .map(k => ({
        key: k.key,
        displayName: k.displayName || (k as any).name || k.key,
        description: k.description || k.key,
        realm: k.realm || 'us',
        mappedCategories: null
      }));

    const mappedRules = rules
      .filter(r => {
        if (r.notificationCategory === catCode) return true;
        if (r.config && r.config.some(c => c.notificationCategory === catCode)) return true;
        if (r.config && r.config.some(c => relatedKeys.some(rk => rk.key === c.notificationKey))) return true;
        return false;
      })
      .map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || ''
      }));

    return {
      category: catCode,
      displayName: catName,
      description: cat.description || catCode,
      isMandatory: cat.isMandatory ?? true,
      realm: (cat as any).realm ?? null,
      mappedRules,
      mappedNotificationKeys: relatedKeys
    };
  });

  res.json(matrix);
});

// GET: Fetch Relationship Matrix by Realm
app.get(MATRIX_REALM_PATHS, (req, res) => {
  const targetRealm = (req.params.realm || 'us').toLowerCase();
  const rules = getRules();

  // Find keys matching targetRealm
  const matchingKeys = inMemoryNotificationKeys.filter(k => 
    (k.realm || 'us').toLowerCase() === targetRealm
  );

  const keysToUse = matchingKeys.length > 0 ? matchingKeys : inMemoryNotificationKeys;

  const realmMatrix = keysToUse.map(k => {
    const catCode = k.notificationCategory || (k as any).categoryKey || (k as any).category || 'milon.burglar.category';
    
    const mappedRules = rules
      .filter(r => {
        if (r.notificationCategory === catCode) return true;
        if (r.config && r.config.some(c => c.notificationCategory === catCode || c.notificationKey === k.key)) return true;
        return false;
      })
      .map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || 'Vehicle doors lock & unlock remotely',
        enabled: r.enabled ?? true
      }));

    return {
      category: catCode,
      key: k.key,
      realm: k.realm || targetRealm,
      enabled: k.enabled ?? true,
      description: k.description || 'mapping',
      mappedRules: mappedRules.length > 0 ? mappedRules : [
        {
          id: 'MILON_RULE',
          name: 'Milon Rule',
          description: 'Vehicle doors lock & unlock remotely',
          enabled: true
        }
      ]
    };
  });

  res.json(realmMatrix);
});

// GET: Fetch notification categories
app.get(CATEGORY_PATHS, (req, res) => {
  const formattedCategories = inMemoryCategories.map(cat => {
    const catCode = cat.category || (cat as any).key || '';
    const catName = cat.displayName || (cat as any).name || catCode;

    const relatedKeys = inMemoryNotificationKeys
      .filter(k => k.notificationCategory === catCode || (k as any).categoryKey === catCode || (k as any).category === catCode)
      .map(k => ({
        key: k.key,
        displayName: k.displayName || (k as any).name || k.key,
        description: k.description || k.key,
        realm: k.realm || 'us',
        mappedCategories: null
      }));

    return {
      category: catCode,
      displayName: catName,
      description: cat.description || catCode,
      isMandatory: cat.isMandatory ?? true,
      realm: (cat as any).realm ?? null,
      mappedRules: null,
      mappedNotificationKeys: relatedKeys
    };
  });

  res.json(formattedCategories);
});

// POST: Create/Save notification category
app.post(CATEGORY_PATHS, (req, res) => {
  const body = req.body || {};
  const category = body.category || body.key;
  const displayName = body.displayName || body.name || category;
  const description = body.description || '';
  const isMandatory = body.isMandatory !== undefined ? Boolean(body.isMandatory) : true;

  if (!category) {
    res.status(400).json({ error: 'Field "category" is required in request body.' });
    return;
  }

  const existingIdx = inMemoryCategories.findIndex(c => (c.category || (c as any).key) === category);
  const categoryObj = {
    category,
    displayName,
    description,
    isMandatory,
    enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    translations: body.translations || undefined,
    mappedNotificationKeys: body.mappedNotificationKeys || []
  };

  if (existingIdx >= 0) {
    inMemoryCategories[existingIdx] = { ...inMemoryCategories[existingIdx], ...categoryObj };
  } else {
    inMemoryCategories.push(categoryObj);
  }

  console.log(`[REST API] Notification Category saved via POST /categories: "${category}" (${displayName})`);
  res.status(201).json(categoryObj);
});

// GET: Fetch notification keys
app.get(KEY_PATHS, (req, res) => {
  res.json(inMemoryNotificationKeys);
});

// POST: Create/Save notification key
app.post(KEY_PATHS, (req, res) => {
  const body = req.body || {};
  const key = body.key;
  const displayName = body.displayName || body.name || key;
  const description = body.description || '';
  const category = body.category !== undefined ? body.category : (body.notificationCategory || true);
  const realm = body.realm || 'us';

  if (!key) {
    res.status(400).json({ error: 'Field "key" is required in request body.' });
    return;
  }

  const notificationCategoryStr = typeof category === 'string'
    ? category
    : (body.notificationCategory || 'v2hg');

  const keyObj = {
    key,
    displayName,
    description,
    category, // supports boolean true or category string as in request body
    notificationCategory: notificationCategoryStr,
    realm,
    enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    translations: body.translations || undefined
  };

  const existingIdx = inMemoryNotificationKeys.findIndex(k => k.key === key);
  if (existingIdx >= 0) {
    inMemoryNotificationKeys[existingIdx] = { ...inMemoryNotificationKeys[existingIdx], ...keyObj };
  } else {
    inMemoryNotificationKeys.push(keyObj);
  }

  // Associate key with target category in inMemoryCategories if existing
  const catObj = inMemoryCategories.find(c => (c.category || (c as any).key) === notificationCategoryStr);
  if (catObj) {
    if (!catObj.mappedNotificationKeys) catObj.mappedNotificationKeys = [];
    if (!catObj.mappedNotificationKeys.some(k => k.key === key)) {
      catObj.mappedNotificationKeys.push(keyObj as any);
    }
  }

  console.log(`[REST API] Notification Key saved via POST /keys: "${key}" (${displayName}, category: ${JSON.stringify(category)}, realm: ${realm})`);
  res.status(201).json(keyObj);
});

// GET: Fetch schedulers
app.get(SCHEDULER_PATHS, (req, res) => {
  res.json(DEFAULT_SCHEDULERS);
});

// POST: Trigger scheduler execution
app.post(TRIGGER_SCHEDULER_PATHS, (req, res) => {
  const { id } = req.params;
  console.log(`[REST API] Triggered proactive scheduler execution for ID: ${id}`);
  res.json({
    status: 'SUCCESS',
    message: `Proactive scheduler execution triggered for ID: ${id}`,
    id,
    timestamp: new Date().toISOString()
  });
});

// POST: Re-cache rules (supports optional payload { ruleIds: [...] })
app.post(RECACHE_PATHS, (req, res) => {
  const { ruleIds } = req.body || {};
  console.log(`[REST API] Rules Re-cached. Target rule IDs:`, ruleIds || 'ALL');
  res.json({
    status: 'SUCCESS',
    message: ruleIds && ruleIds.length > 0
      ? `Successfully re-cached ${ruleIds.length} specified rule(s)`
      : 'All platform ingestion rules re-cached successfully',
    ruleIds: ruleIds || []
  });
});

// POST: Create a new custom rule
app.post(RULE_PATHS, (req, res) => {
  const newRule = req.body as Rule;
  if (!newRule || !newRule.id || !newRule.name) {
    res.status(400).json({ error: 'Rule payload must be defined with valid name and ID fields.' });
    return;
  }

  const rules = getRules();
  if (rules.some(r => r.id === newRule.id)) {
    res.status(409).json({ error: `Conflicting ID. A rule with ID "${newRule.id}" already exists.` });
    return;
  }

  rules.push(newRule);
  saveRules(rules);
  console.log(`[REST API] New Rule Created via POST: "${newRule.name}" (${newRule.id})`);
  res.status(201).json(newRule);
});

// PUT: Update an existing rule
app.put(RULE_ID_PATHS, (req, res) => {
  const { id } = req.params;
  const updatedRule = req.body as Rule;

  if (!updatedRule || !updatedRule.name) {
    res.status(400).json({ error: 'Rule update payload must be defined with valid fields.' });
    return;
  }

  const rules = getRules();
  const index = rules.findIndex(r => r.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Rule with ID "${id}" could not be located in database.` });
    return;
  }

  rules[index] = { ...updatedRule, id }; // Ensure ID remains immutable
  saveRules(rules);
  console.log(`[REST API] Rule Updated via PUT: "${updatedRule.name}" (${id})`);
  res.json(updatedRule);
});

// DELETE: Remove a rule
app.delete(RULE_ID_PATHS, (req, res) => {
  const { id } = req.params;
  const rules = getRules();
  const filtered = rules.filter(r => r.id !== id);

  if (rules.length === filtered.length) {
    res.status(404).json({ error: `Rule with ID "${id}" could not be located.` });
    return;
  }

  saveRules(filtered);
  console.log(`[REST API] Rule Deleted via DELETE: ${id}`);
  res.json({ success: true, id });
});

// POST: Reset database to initial template defaults
app.post(RESET_PATHS, (req, res) => {
  saveRules(DEFAULT_RULES);
  console.log(`[REST API] Database reset to initial factory configuration.`);
  res.json(DEFAULT_RULES);
});

// POST: Call rule evaluation API with notificationEvent JSON payload
app.post(EVALUATE_PATHS, (req, res) => {
  try {
    const body = req.body || {};
    // Support notificationEvent wrapper or raw JSON event payload
    const notificationEvent = body.notificationEvent || body.eventPayload || (body.execution_status || body.vehicle_state_snapshot || body.response_header ? body : {});
    
    if (!notificationEvent || Object.keys(notificationEvent).length === 0) {
      res.status(400).json({ 
        status: 'ERROR',
        error: 'Missing notificationEvent object in request body.' 
      });
      return;
    }

    const currentRules = getRules();
    const evaluationResult = evaluateRulesApiEngine(currentRules, notificationEvent);

    console.log(`[REST API] Rule Evaluation API executed: ${evaluationResult.matchedRulesCount} matched of ${evaluationResult.totalRulesEvaluated} rules.`);
    res.json(evaluationResult);
  } catch (err: any) {
    console.error('[REST API] Error during rule evaluation API call:', err);
    res.status(500).json({ 
      status: 'ERROR',
      error: err.message || 'Internal rule evaluation failure' 
    });
  }
});

// 3. Vite middleware for dev vs Express static distribution for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SDV Notification Gateway Server] Listening on http://0.0.0.0:${PORT}`);
  });

  // Attach WebSocket Server
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('[WebSocket Server] Client connected');

    ws.on('message', (messageData) => {
      try {
        const msg = JSON.parse(messageData.toString());
        console.log('[WebSocket Server] Message received:', msg.type);

        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        } else if (msg.type === 'SIMULATE_LOG' && msg.log) {
          const currentLogs = getAuditLogs();
          // Avoid duplicate IDs (idempotent guard)
          if (!currentLogs.some(l => l.id === msg.log.id)) {
            currentLogs.push(msg.log);
            if (currentLogs.length > 50) currentLogs.shift();
            saveAuditLogs(currentLogs);
          }

          // Broadcast new log to all other open clients
          const broadcastMsg = JSON.stringify({ type: 'NEW_LOG', log: msg.log });
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(broadcastMsg);
            }
          });
        } else if (msg.type === 'CLEAR_LOGS') {
          saveAuditLogs([]);
          const broadcastMsg = JSON.stringify({ type: 'CLEAR_LOGS' });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastMsg);
            }
          });
        }
      } catch (err) {
        console.error('[WebSocket Server] Error parsing client message', err);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket Server] Client disconnected');
    });
  });

  // Periodically stream new mock vehicle audit logs (every 25 seconds)
  setInterval(() => {
    if (wss.clients.size > 0) {
      const newLog = generateLiveMockLog();
      const currentLogs = getAuditLogs();
      currentLogs.push(newLog);
      if (currentLogs.length > 50) currentLogs.shift();
      saveAuditLogs(currentLogs);

      const broadcastMsg = JSON.stringify({ type: 'NEW_LOG', log: newLog });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMsg);
        }
      });
      console.log(`[WebSocket Server] Live streaming mock vehicle audit log: ${newLog.id}`);
    }
  }, 25000);
}

startServer();

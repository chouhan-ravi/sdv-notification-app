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
import { Rule } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'rules-db.json');
const LOGS_DB_FILE = path.join(process.cwd(), 'audit-logs-db.json');

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

// Initialize Audit Logs Database
function getAuditLogs(): any[] {
  if (fs.existsSync(LOGS_DB_FILE)) {
    try {
      const data = fs.readFileSync(LOGS_DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading audit logs file, resetting to defaults', e);
    }
  }

  // Seed with realistic starting historical audit logs
  const seedLogs = [
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

  fs.writeFileSync(LOGS_DB_FILE, JSON.stringify(seedLogs, null, 2), 'utf8');
  return seedLogs;
}

function saveAuditLogs(logs: any[]) {
  fs.writeFileSync(LOGS_DB_FILE, JSON.stringify(logs, null, 2), 'utf8');
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
// GET: Fetch all active rules
app.get('/api/rules', (req, res) => {
  const rules = getRules();
  res.json(rules);
});

// POST: Create a new custom rule
app.post('/api/rules', (req, res) => {
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
app.put('/api/rules/:id', (req, res) => {
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
app.delete('/api/rules/:id', (req, res) => {
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
app.post('/api/rules/reset', (req, res) => {
  saveRules(DEFAULT_RULES);
  console.log(`[REST API] Database reset to initial factory configuration.`);
  res.json(DEFAULT_RULES);
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
    
    // Send initial logs feed history on connect
    const initialLogs = getAuditLogs();
    ws.send(JSON.stringify({ type: 'INIT_LOGS', logs: initialLogs }));

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
          const broadcastMsg = JSON.stringify({ type: 'INIT_LOGS', logs: [] });
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

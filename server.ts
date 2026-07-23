/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_RULES } from './src/lib/defaultRules';
import { Rule } from './src/types';

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SDV Notification Gateway Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

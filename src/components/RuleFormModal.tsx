/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, RuleCondition, RuleOperator, DynamicCategory, DynamicRuleKey } from '../types';
import { X, Plus, Trash2, HelpCircle, Save } from 'lucide-react';

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Rule) => void;
  ruleToEdit: Rule | null;
  categories?: DynamicCategory[];
  ruleKeys?: DynamicRuleKey[];
}

export default function RuleFormModal({
  isOpen,
  onClose,
  onSave,
  ruleToEdit,
  categories = [],
  ruleKeys = []
}: RuleFormModalProps) {
  const [name, setName] = useState('');
  const [ruleKey, setRuleKey] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [criticality, setCriticality] = useState<Rule['criticality']>('INFO');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [sound, setSound] = useState('default');
  const [dataMetadata, setDataMetadata] = useState<{ key: string; value: string }[]>([]);
  const [messageType, setMessageType] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Load existing values when ruleToEdit changes
  useEffect(() => {
    if (ruleToEdit) {
      setName(ruleToEdit.name);
      setRuleKey(ruleToEdit.ruleKey);
      setCategoryKey(ruleToEdit.categoryKey);
      setPriority(ruleToEdit.priority);
      setCriticality(ruleToEdit.criticality);
      setDescription(ruleToEdit.description);
      setConditions(ruleToEdit.conditions || []);
      setNotificationTitle(ruleToEdit.notificationTitle);
      setNotificationBody(ruleToEdit.notificationBody);
      setSound(ruleToEdit.sound || 'default');
      setDataMetadata(ruleToEdit.dataMetadata || []);
      setMessageType(ruleToEdit.messageType || '');
      setNotificationType(ruleToEdit.notificationType || '');
      setErrors([]);
    } else {
      // Set default values for fresh new rule
      setName('');
      const defaultCategory = 'VEHICLE_REMOTE_CONTROL';
      setCategoryKey(defaultCategory);
      
      const defaultKeys = ruleKeys.filter(rk => rk.categoryKey === defaultCategory);
      if (defaultKeys.length > 0) {
        setRuleKey(defaultKeys[0].key);
      } else {
        setRuleKey('');
      }
      setPriority('normal');
      setCriticality('INFO');
      setDescription('');
      setConditions([
        { id: 'c_' + Math.random().toString(36).substring(2, 9), fieldPath: 'execution_status', operator: 'equals', value: 'SUCCESS' }
      ]);
      setNotificationTitle('Remote Event Alert');
      setNotificationBody('Vehicle {response_header.vin} triggered notification alert.');
      setSound('default');
      setDataMetadata([
        { key: 'engine_state', value: '{vehicle_state_snapshot.engine_state}' }
      ]);
      setMessageType('');
      setNotificationType('');
      setErrors([]);
    }
  }, [ruleToEdit, isOpen]);

  // Automated Rule Key Slugifier
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const addCondition = () => {
    const newCond: RuleCondition = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      fieldPath: '',
      operator: 'equals',
      value: ''
    };
    setConditions([...conditions, newCond]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addMetadataItem = () => {
    setDataMetadata([...dataMetadata, { key: '', value: '' }]);
  };

  const removeMetadataItem = (idx: number) => {
    setDataMetadata(dataMetadata.filter((_, i) => i !== idx));
  };

  const updateMetadataItem = (idx: number, key: string, value: string) => {
    const next = [...dataMetadata];
    next[idx] = { key, value };
    setDataMetadata(next);
  };

  const validateForm = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Rule Name is required');
    if (!ruleKey.trim()) errs.push('Rule Key (e.g. RULE_...) is required');
    if (!categoryKey.trim()) errs.push('Category Key (e.g. VEHICLE_...) is required');
    if (conditions.length === 0) errs.push('At least one Matching Condition is required');
    
    conditions.forEach((c, idx) => {
      if (!c.fieldPath.trim()) errs.push(`Condition #${idx + 1} is missing a Field Path`);
      if (c.operator !== 'exists' && c.operator !== 'not_exists' && !c.value.trim()) {
        errs.push(`Condition #${idx + 1} matches on an empty value`);
      }
    });

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const savedRule: Rule = {
      id: ruleToEdit ? ruleToEdit.id : 'rule_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      ruleKey: ruleKey.trim().toUpperCase(),
      categoryKey: categoryKey.trim().toUpperCase(),
      priority,
      criticality,
      enabled: ruleToEdit ? ruleToEdit.enabled : true,
      description: description.trim(),
      conditions,
      notificationTitle: notificationTitle.trim(),
      notificationBody: notificationBody.trim(),
      sound: sound.trim() || 'default',
      dataMetadata: dataMetadata.filter(m => m.key.trim() !== ''),
      messageType: messageType.trim(),
      notificationType: notificationType.trim()
    };

    onSave(savedRule);
  };

  if (!isOpen) return null;

  return (
    <div id="rule-form-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-display">
              {ruleToEdit ? 'Edit Vehicle Rule' : 'Configure New SDV Rule'}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Define the vehicle event filters and the notification template.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-850 rounded-lg transition duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable Form) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errors.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-500/40 text-rose-400 text-xs rounded-xl p-3 space-y-1">
              <div className="font-bold flex items-center">
                <span>⚠️ Configuration Validation Errors:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 font-mono">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Basic Identifiers */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono text-indigo-400 border-b border-slate-800 pb-1.5 uppercase">
              1. Rule Metadata & Identification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">RULE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Overheat Warning"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">CATEGORY KEY</label>
                <select
                  required
                  value={categoryKey}
                  onChange={(e) => {
                    const nextCategory = e.target.value;
                    setCategoryKey(nextCategory);
                    // Match and update selected ruleKey if it doesn't belong to the new category
                    const matchedKeys = ruleKeys.filter(rk => rk.categoryKey === nextCategory);
                    if (matchedKeys.length > 0 && !matchedKeys.some(rk => rk.key === ruleKey)) {
                      setRuleKey(matchedKeys[0].key);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 transition font-mono cursor-pointer"
                >
                  <option value="" disabled>-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">RULE KEY</label>
                <select
                  required
                  value={ruleKey}
                  onChange={(e) => setRuleKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 transition font-mono cursor-pointer"
                >
                  <option value="" disabled>-- Select Rule Key --</option>
                  {ruleKeys
                    .filter(rk => !categoryKey || rk.categoryKey === categoryKey)
                    .map(rk => (
                      <option key={rk.key} value={rk.key}>{rk.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">PRIORITY</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 transition"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">CRITICALITY LEVEL</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 transition font-mono"
                >
                  <option value="INFO">INFO (Normal status)</option>
                  <option value="MINOR">MINOR (Warning alerts)</option>
                  <option value="MAJOR">MAJOR (Action required)</option>
                  <option value="CRITICAL">CRITICAL (Safety hazards)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">MESSAGE TYPE</label>
                <input
                  type="text"
                  placeholder="e.g. ALERT, REMINDER, TRANSACTIONAL"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">NOTIFICATION TYPE</label>
                <input
                  type="text"
                  placeholder="e.g. PUSH, SMS, EMAIL"
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">DESCRIPTION</label>
              <textarea
                placeholder="Briefly describe what trigger conditions or events this rule represents."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition font-sans"
              />
            </div>
          </div>

          {/* Section 2: Rule Matching Conditions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase flex items-center">
                2. Acceptance Criteria / Logic (AND)
              </h3>
              <button
                type="button"
                onClick={addCondition}
                className="text-xs font-bold font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD CRITERIA</span>
              </button>
            </div>

            <div className="space-y-3">
              {conditions.map((cond, index) => (
                <div 
                  key={cond.id} 
                  className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-850 relative group"
                >
                  {/* Field Path */}
                  <div className="flex-1">
                    <label className="block md:hidden text-[9px] font-bold text-slate-500 font-mono mb-1">FIELD PATH</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. vehicle_state_snapshot.engine_state"
                      value={cond.fieldPath}
                      onChange={(e) => updateCondition(cond.id, { fieldPath: e.target.value.trim() })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                    />
                  </div>

                  {/* Operator */}
                  <div className="w-full md:w-44">
                    <label className="block md:hidden text-[9px] font-bold text-slate-500 font-mono mb-1">OPERATOR</label>
                    <select
                      value={cond.operator}
                      onChange={(e) => updateCondition(cond.id, { operator: e.target.value as RuleOperator })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="greater_than">Greater Than (&gt;)</option>
                      <option value="less_than">Less Than (&lt;)</option>
                      <option value="contains">Contains String</option>
                      <option value="starts_with">Starts With</option>
                      <option value="ends_with">Ends With</option>
                      <option value="exists">Key Exists</option>
                      <option value="not_exists">Key Not Exists</option>
                    </select>
                  </div>

                  {/* Expected Value */}
                  {cond.operator !== 'exists' && cond.operator !== 'not_exists' ? (
                    <div className="flex-1">
                      <label className="block md:hidden text-[9px] font-bold text-slate-500 font-mono mb-1">VALUE</label>
                      <input
                        type="text"
                        required
                        placeholder="Expected value (e.g. RUNNING or 15)"
                        value={cond.value}
                        onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center px-3 text-slate-500 text-xs font-mono select-none">
                      (No value required)
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeCondition(cond.id)}
                    className="p-1.5 text-rose-500 hover:bg-slate-900 rounded-lg hover:text-rose-400 self-end md:self-auto border border-transparent md:border-none"
                    disabled={conditions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-[10px] text-slate-500 font-sans flex items-start space-x-1 bg-slate-950/40 p-2 rounded border border-slate-850/40">
              <HelpCircle className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
              <span>
                <strong>How conditions work:</strong> Enter dot-notated paths to target any nested properties. For instance: <code>vehicle_state_snapshot.telemetry.12v_battery_v</code>. Operators compare matching fields to the given string or numeric representation.
              </span>
            </div>
          </div>

          {/* Section 3: Notification Template */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono text-indigo-400 border-b border-slate-800 pb-1.5 uppercase">
              3. Push Notification Output Template
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">NOTIFICATION TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote Start Successful"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">ALERT SOUND</label>
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 transition"
                >
                  <option value="default">Default Sound</option>
                  <option value="alarm_alert">Alarm Warning</option>
                  <option value="critical_siren">Intense Siren</option>
                  <option value="siren_intense">Tactical Beep</option>
                  <option value="none">Muted</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">
                NOTIFICATION BODY TEMPLATE
              </label>
              <textarea
                required
                placeholder="e.g. Your engine is running. Cabin temp is {vehicle_state_snapshot.hvac_status.cabin_temp_c}°C."
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition font-sans"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Use curly braces to inject dynamic data from the event payload. Example: <code>&#123;vehicle_state_snapshot.hvac_status.cabin_temp_c&#125;</code>
              </span>
            </div>
          </div>

          {/* Section 4: Data Metadata Enrichment */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase">
                4. Dynamic Payload Data Enrichment
              </h3>
              <button
                type="button"
                onClick={addMetadataItem}
                className="text-xs font-bold font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD DATA ATTR</span>
              </button>
            </div>

            <div className="space-y-2">
              {dataMetadata.length === 0 ? (
                <p className="text-xs text-slate-500 font-sans italic">No extra custom dynamic properties defined.</p>
              ) : (
                dataMetadata.map((meta, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Key (e.g. runtime_limit_minutes)"
                        value={meta.key}
                        onChange={(e) => updateMetadataItem(idx, e.target.value.toLowerCase().replace(/\s+/g, '_'), meta.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Value (e.g. 15 or {engine_state})"
                        value={meta.value}
                        onChange={(e) => updateMetadataItem(idx, meta.key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMetadataItem(idx)}
                      className="p-1 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-850 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[10px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>REST GATEWAY ACTIVE // POST-ON-SAVE DIRECT PIPELINE</span>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/10"
            >
              <Save className="h-4 w-4" />
              <span>{ruleToEdit ? 'Save Changes' : 'Create Rule'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

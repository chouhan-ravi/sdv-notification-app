/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, RuleConfigItem, RuleConditionItem, RuleOperator, DynamicCategory, DynamicKey } from '../types';
import { X, Plus, Trash2, Save, HelpCircle, RefreshCw } from 'lucide-react';
import { DEFAULT_DYNAMIC_CATEGORIES, DEFAULT_DYNAMIC_NOTIFICATION_KEYS } from '../lib/defaultCategories';

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Rule) => void;
  ruleToEdit: Rule | null;
  categories?: DynamicCategory[];
  keys?: DynamicKey[];
}

export default function RuleFormModal({
  isOpen,
  onClose,
  onSave,
  ruleToEdit,
  categories = [],
  keys = [],
}: RuleFormModalProps) {
  const [ruleId, setRuleId] = useState('');
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [description, setDescription] = useState('');
  
  // Configs array
  const [configs, setConfigs] = useState<RuleConfigItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Helper accessors for dynamic backend category & key structures
  const getCatValue = (c: DynamicCategory) => c.category || c.key || '';
  const getCatLabel = (c: DynamicCategory) => c.displayName || c.name || c.category || c.key || '';
  const getKeyValue = (k: DynamicKey) => k.key || '';
  const getKeyLabel = (k: DynamicKey) => k.displayName || k.name || k.key || '';

  const getKeysForCategory = (catKey: string, categoriesList: DynamicCategory[], fallbackKeysList: DynamicKey[] = []): DynamicKey[] => {
    if (!catKey) return fallbackKeysList;
    const foundCat = categoriesList.find(c => getCatValue(c) === catKey);
    if (foundCat && Array.isArray(foundCat.mappedNotificationKeys)) {
      return foundCat.mappedNotificationKeys;
    }
    const matchingFromKeys = fallbackKeysList.filter(k => k.notificationCategory === catKey || (k as any).categoryKey === catKey);
    if (matchingFromKeys.length > 0) {
      return matchingFromKeys;
    }
    return fallbackKeysList;
  };

  const activeCategories = categories.length > 0 ? categories : DEFAULT_DYNAMIC_CATEGORIES;
  const activeKeys = keys.length > 0 ? keys : DEFAULT_DYNAMIC_NOTIFICATION_KEYS;

  useEffect(() => {
    if (ruleToEdit) {
      setRuleId(ruleToEdit.id);
      setName(ruleToEdit.name);
      setEnabled(ruleToEdit.enabled);
      setDescription(ruleToEdit.description);
      
      if (ruleToEdit.config && ruleToEdit.config.length > 0) {
        setConfigs(ruleToEdit.config);
      } else {
        // Fallback default config if rule configs list is unpopulated
        const initCategory = ruleToEdit.notificationCategory || (ruleToEdit as any).categoryKey || getCatValue(activeCategories[0]) || 'milon.burglar.category';
        const initKeys = getKeysForCategory(initCategory, activeCategories, activeKeys);
        const initKey = ruleToEdit.notificationKey || (ruleToEdit as any).ruleKey || getKeyValue(initKeys[0]) || 'milon.burgluer.handbrake.key';

        setConfigs([{
          id: `cfg_${Math.random().toString(36).substring(2, 9)}`,
          notificationCategory: initCategory,
          notificationKey: initKey,
          criticality: ruleToEdit.criticality || 'INFO',
          conditions: [{
            and: (ruleToEdit.conditions || []).map(c => ({
              id: c.id || `c_${Math.random().toString(36).substring(2, 9)}`,
              fieldPath: c.fieldPath,
              operator: c.operator,
              value: c.value
            }))
          }],
          metadata: ruleToEdit.dataMetadata || [],
          notificationTemplate: {
            title: ruleToEdit.notificationTitle || 'Remote Alert',
            body: ruleToEdit.notificationBody || 'Event triggered.',
            sound: ruleToEdit.sound || 'default',
            badge: 1
          }
        }]);
      }
      setErrors([]);
    } else {
      // Create new rule defaults with clean empty fields and placeholders
      setRuleId('');
      setName('');
      setEnabled(true);
      setDescription('');
      const initCategory = getCatValue(activeCategories[0]) || '';
      const availableKeys = getKeysForCategory(initCategory, activeCategories, activeKeys);
      const initKey = getKeyValue(availableKeys[0]) || '';

      setConfigs([
        {
          id: `cfg_${Math.random().toString(36).substring(2, 8)}`,
          notificationCategory: initCategory,
          notificationKey: initKey,
          criticality: 'INFO',
          conditions: [
            {
              and: [
                {
                  id: `c_${Math.random().toString(36).substring(2, 8)}`,
                  fieldPath: '',
                  operator: 'equals',
                  value: ''
                }
              ]
            }
          ],
          metadata: [],
          notificationTemplate: {
            title: '',
            body: '',
            sound: 'default',
            badge: 1
          }
        }
      ]);
      setErrors([]);
    }
  }, [ruleToEdit, isOpen]);

  if (!isOpen) return null;

  const addConfig = () => {
    const initCat = getCatValue(activeCategories[0]) || '';
    const availableKeys = getKeysForCategory(initCat, activeCategories, activeKeys);
    const initKey = getKeyValue(availableKeys[0]) || '';

    const newCfg: RuleConfigItem = {
      id: `cfg_${Math.random().toString(36).substring(2, 8)}`,
      notificationCategory: initCat,
      notificationKey: initKey,
      criticality: 'INFO',
      conditions: [
        {
          and: [
            {
              id: `c_${Math.random().toString(36).substring(2, 8)}`,
              fieldPath: '',
              operator: 'equals',
              value: ''
            }
          ]
        }
      ],
      metadata: [],
      notificationTemplate: {
        title: '',
        body: '',
        sound: 'default',
        badge: 1
      }
    };
    setConfigs([...configs, newCfg]);
  };

  const removeConfig = (index: number) => {
    if (configs.length <= 1) return;
    setConfigs(configs.filter((_, i) => i !== index));
  };

  const updateConfigField = (index: number, updates: Partial<RuleConfigItem>) => {
    const next = [...configs];
    next[index] = { ...next[index], ...updates };
    setConfigs(next);
  };

  const addConditionToConfig = (configIdx: number) => {
    const next = [...configs];
    const cfg = next[configIdx];
    if (!cfg.conditions || cfg.conditions.length === 0) {
      cfg.conditions = [{ and: [] }];
    }
    const group = cfg.conditions[0];
    const newCond: RuleConditionItem = {
      id: `c_${Math.random().toString(36).substring(2, 8)}`,
      fieldPath: '',
      operator: 'equals',
      value: ''
    };
    if (group.and) {
      group.and.push(newCond);
    } else if (group.or) {
      group.or.push(newCond);
    } else {
      group.and = [newCond];
    }
    setConfigs(next);
  };

  const removeConditionFromConfig = (configIdx: number, condId: string) => {
    const next = [...configs];
    const cfg = next[configIdx];
    cfg.conditions.forEach(grp => {
      if (grp.and) grp.and = grp.and.filter(c => c.id !== condId);
      if (grp.or) grp.or = grp.or.filter(c => c.id !== condId);
    });
    setConfigs(next);
  };

  const updateConditionInConfig = (configIdx: number, condId: string, updates: Partial<RuleConditionItem>) => {
    const next = [...configs];
    const cfg = next[configIdx];
    cfg.conditions.forEach(grp => {
      const list = grp.and || grp.or || [];
      const item = list.find(c => c.id === condId);
      if (item) Object.assign(item, updates);
    });
    setConfigs(next);
  };

  const addMetadataToConfig = (configIdx: number) => {
    const next = [...configs];
    next[configIdx].metadata = [...(next[configIdx].metadata || []), { key: '', value: '' }];
    setConfigs(next);
  };

  const removeMetadataFromConfig = (configIdx: number, metaIdx: number) => {
    const next = [...configs];
    next[configIdx].metadata = next[configIdx].metadata.filter((_, i) => i !== metaIdx);
    setConfigs(next);
  };

  const updateMetadataInConfig = (configIdx: number, metaIdx: number, key: string, value: string) => {
    const next = [...configs];
    next[configIdx].metadata[metaIdx] = { key, value };
    setConfigs(next);
  };

  const validateForm = () => {
    const errs: string[] = [];
    if (ruleToEdit && !ruleId.trim()) errs.push('Rule ID is required');
    if (!name.trim()) errs.push('Rule Name is required');
    if (configs.length === 0) errs.push('At least one config item is required');

    configs.forEach((c, idx) => {
      if (!c.id.trim()) errs.push(`Config #${idx + 1} ID is required`);
      if (!c.notificationCategory.trim()) errs.push(`Config #${idx + 1} Category is required`);
      if (!c.notificationKey.trim()) errs.push(`Config #${idx + 1} Key is required`);
      if (!c.notificationTemplate.title.trim()) errs.push(`Config #${idx + 1} Notification Title is required`);
      if (!c.notificationTemplate.body.trim()) errs.push(`Config #${idx + 1} Notification Body is required`);
    });

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalRuleId = ruleId.trim() || `RULE_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const savedRule: Rule = {
      id: finalRuleId,
      name: name.trim(),
      enabled,
      description: description.trim(),
      config: configs
    };

    onSave(savedRule);
  };

  return (
    <div id="rule-form-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-display">
              {ruleToEdit ? 'Edit Vehicle Rule Registry' : 'Create New Vehicle Rule Registry'}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Define the rule metadata, config items, acceptance criteria, and notification template.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-850 rounded-lg transition duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
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

          {/* Section 1: Rule General Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono text-indigo-400 border-b border-slate-800 pb-1.5 uppercase">
              1. Rule Identification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">RULE ID</label>
                <input
                  type="text"
                  placeholder="e.g. RULE_BATTERY_LOW"
                  value={ruleId}
                  onChange={(e) => setRuleId(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  disabled={!!ruleToEdit}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-slate-700 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">RULE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battery Voltage Warning"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">STATUS</label>
                <select
                  value={enabled ? 'true' : 'false'}
                  onChange={(e) => setEnabled(e.target.value === 'true')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 font-mono cursor-pointer"
                >
                  <option value="true">Active (Enabled)</option>
                  <option value="false">Muted (Disabled)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5">DESCRIPTION</label>
              <textarea
                placeholder="e.g. Briefly describe what this vehicle rule evaluates or represents."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-sans"
              />
            </div>
          </div>

          {/* Section 2: Config Items List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase">
                2. Config Items ({configs.length})
              </h3>
              <button
                type="button"
                onClick={addConfig}
                className="text-xs font-bold font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD CONFIG ITEM</span>
              </button>
            </div>

            <div className="space-y-6">
              {configs.map((cfg, cfgIdx) => (
                <div key={cfgIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold font-mono text-slate-300">
                      Config #{cfgIdx + 1}
                    </span>
                    {configs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConfig(cfgIdx)}
                        className="text-rose-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase mb-1">CONFIG ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. cfg_01"
                        value={cfg.id}
                        onChange={(e) => updateConfigField(cfgIdx, { id: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase mb-1">
                        <span>NOTIFICATION CATEGORY</span>
                      </label>
                      <select
                        required
                        value={cfg.notificationCategory}
                        onChange={(e) => {
                          const newCatKey = e.target.value;
                          const availableKeys = getKeysForCategory(newCatKey, activeCategories, activeKeys);
                          const keyExists = availableKeys.some(k => getKeyValue(k) === cfg.notificationKey);
                          const newRkKey = keyExists ? cfg.notificationKey : (availableKeys.length > 0 ? getKeyValue(availableKeys[0]) : '');
                          updateConfigField(cfgIdx, {
                            notificationCategory: newCatKey,
                            notificationKey: newRkKey
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled>-- Select Category --</option>
                        {activeCategories.map((cat) => {
                          const cVal = getCatValue(cat);
                          const cLbl = getCatLabel(cat);
                          return (
                            <option key={cVal} value={cVal}>
                              {cLbl !== cVal ? `${cLbl} (${cVal})` : cVal}
                            </option>
                          );
                        })}
                        {cfg.notificationCategory && !activeCategories.some(c => getCatValue(c) === cfg.notificationCategory) && (
                          <option value={cfg.notificationCategory}>
                            {cfg.notificationCategory}
                          </option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase mb-1">NOTIFICATION KEY</label>
                      <select
                        required
                        value={cfg.notificationKey}
                        onChange={(e) => updateConfigField(cfgIdx, { notificationKey: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-mono cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled>-- Select Key --</option>
                        {(() => {
                          const availableKeys = getKeysForCategory(cfg.notificationCategory, activeCategories, activeKeys);
                          if (availableKeys.length === 0) {
                            return <option value="" disabled>No notification keys mapped</option>;
                          }
                          return availableKeys.map((rk) => {
                            const kVal = getKeyValue(rk);
                            const kLbl = getKeyLabel(rk);
                            return (
                              <option key={kVal} value={kVal}>
                                {kLbl !== kVal ? `${kLbl} (${kVal})` : kVal}
                              </option>
                            );
                          });
                        })()}
                        {cfg.notificationKey && !getKeysForCategory(cfg.notificationCategory, activeCategories, activeKeys).some(k => getKeyValue(k) === cfg.notificationKey) && (
                          <option value={cfg.notificationKey}>
                            {cfg.notificationKey}
                          </option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase mb-1">CRITICALITY</label>
                      <select
                        value={cfg.criticality}
                        onChange={(e) => updateConfigField(cfgIdx, { criticality: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono cursor-pointer"
                      >
                        <option value="INFO">INFO</option>
                        <option value="MINOR">MINOR</option>
                        <option value="MAJOR">MAJOR</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditions List inside Config */}
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                        Acceptance Conditions (AND Group)
                      </span>
                      <button
                        type="button"
                        onClick={() => addConditionToConfig(cfgIdx)}
                        className="text-[10px] font-bold font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>ADD CONDITION</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(cfg.conditions || []).flatMap(g => g.and || g.or || []).map((cond, cIdx) => (
                        <div key={cond.id || cIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                          <input
                            type="text"
                            required
                            placeholder="Field Path (e.g. execution_status)"
                            value={cond.fieldPath}
                            onChange={(e) => updateConditionInConfig(cfgIdx, cond.id, { fieldPath: e.target.value })}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                          />
                          <select
                            value={cond.operator}
                            onChange={(e) => updateConditionInConfig(cfgIdx, cond.id, { operator: e.target.value as RuleOperator })}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                          >
                            <option value="equals">equals</option>
                            <option value="not_equals">not_equals</option>
                            <option value="greater_than">greater_than</option>
                            <option value="less_than">less_than</option>
                            <option value="contains">contains</option>
                            <option value="starts_with">starts_with</option>
                            <option value="ends_with">ends_with</option>
                            <option value="exists">exists</option>
                            <option value="not_exists">not_exists</option>
                          </select>
                          <input
                            type="text"
                            required
                            placeholder="Value (e.g. SUCCESS or 11.8)"
                            value={cond.value}
                            onChange={(e) => updateConditionInConfig(cfgIdx, cond.id, { value: e.target.value })}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono text-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeConditionFromConfig(cfgIdx, cond.id)}
                            className="text-rose-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Output Template */}
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase block">
                      Notification Output Template
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 mb-1">TITLE</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Low Battery Voltage Warning"
                          value={cfg.notificationTemplate?.title || ''}
                          onChange={(e) => updateConfigField(cfgIdx, {
                            notificationTemplate: { ...cfg.notificationTemplate, title: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-sans placeholder-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 mb-1">SOUND</label>
                        <input
                          type="text"
                          placeholder="e.g. default"
                          value={cfg.notificationTemplate?.sound || 'default'}
                          onChange={(e) => updateConfigField(cfgIdx, {
                            notificationTemplate: { ...cfg.notificationTemplate, sound: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 mb-1">BODY TEMPLATE</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. Vehicle battery dropped below critical threshold ({vehicle_state_snapshot.telemetry.12v_battery_v}V)."
                        value={cfg.notificationTemplate?.body || ''}
                        onChange={(e) => updateConfigField(cfgIdx, {
                          notificationTemplate: { ...cfg.notificationTemplate, body: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-sans placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Metadata Enrichments */}
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                        Dynamic Metadata Attributes
                      </span>
                      <button
                        type="button"
                        onClick={() => addMetadataToConfig(cfgIdx)}
                        className="text-[10px] font-bold font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>ADD METADATA</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {(cfg.metadata || []).map((m, metaIdx) => (
                        <div key={metaIdx} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-850">
                          <input
                            type="text"
                            placeholder="Key (e.g. engine_state)"
                            value={m.key}
                            onChange={(e) => updateMetadataInConfig(cfgIdx, metaIdx, e.target.value, m.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. {vehicle_state_snapshot.engine_state})"
                            value={m.value}
                            onChange={(e) => updateMetadataInConfig(cfgIdx, metaIdx, m.key, e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono text-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeMetadataFromConfig(cfgIdx, metaIdx)}
                            className="text-rose-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-850 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[10px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>REST RULE ENGINE REGISTRY SYNC ACTIVE</span>
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

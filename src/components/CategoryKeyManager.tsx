/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Rule, DynamicCategory, DynamicRuleKey } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Lock, 
  Unlock, 
  Save, 
  X, 
  Search, 
  Info, 
  AlertTriangle, 
  Network, 
  Key, 
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FolderTree,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface CategoryKeyManagerProps {
  categories: DynamicCategory[];
  ruleKeys: DynamicRuleKey[];
  rules: Rule[];
  onAddCategory: (cat: DynamicCategory) => void;
  onUpdateCategory: (cat: DynamicCategory) => void;
  onDeleteCategory: (key: string) => void;
  onAddRuleKey: (rk: DynamicRuleKey) => void;
  onUpdateRuleKey: (rk: DynamicRuleKey) => void;
  onDeleteRuleKey: (key: string) => void;
  triggerToast: (msg: string) => void;
}

export default function CategoryKeyManager({
  categories,
  ruleKeys,
  rules,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddRuleKey,
  onUpdateRuleKey,
  onDeleteRuleKey,
  triggerToast
}: CategoryKeyManagerProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'categories' | 'rule_keys'>('visual');
  
  // Category Form States
  const [catKey, setCatKey] = useState('');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIsEditing, setCatIsEditing] = useState<string | null>(null); // holds category key
  const [catSearch, setCatSearch] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  // Rule Key Form States
  const [rkKey, setRkKey] = useState('');
  const [rkName, setRkName] = useState('');
  const [rkCategoryKey, setRkCategoryKey] = useState('');
  const [rkDesc, setRkDesc] = useState('');
  const [rkIsEditing, setRkIsEditing] = useState<string | null>(null); // holds rule key
  const [rkSearch, setRkSearch] = useState('');
  const [rkCategoryFilter, setRkCategoryFilter] = useState('ALL');
  const [showRkForm, setShowRkForm] = useState(false);

  // Relationship Quick-Move state
  const [quickMoveRk, setQuickMoveRk] = useState<string | null>(null);

  // Helper: check if Category Key is in use in rules matrix
  const getRulesUsingCategory = (key: string): Rule[] => {
    return rules.filter(r => r.categoryKey === key);
  };
  const isCategoryInUse = (key: string): boolean => {
    return getRulesUsingCategory(key).length > 0;
  };

  // Helper: check if Rule Key is in use in rules matrix
  const getRulesUsingRuleKey = (key: string): Rule[] => {
    return rules.filter(r => r.ruleKey === key);
  };
  const isRuleKeyInUse = (key: string): boolean => {
    return getRulesUsingRuleKey(key).length > 0;
  };

  // Submit Category
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!catKey.trim() || !catName.trim()) {
      triggerToast('Key and Name are required fields.');
      return;
    }

    const formattedKey = catKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    
    if (formattedKey.length < 3) {
      triggerToast('Key must be at least 3 characters alphanumeric/underscores.');
      return;
    }

    if (catIsEditing) {
      // Editing Mode
      const original = categories.find(c => c.key === catIsEditing);
      if (!original) return;

      onUpdateCategory({
        key: catIsEditing,
        name: catName.trim(),
        enabled: original.enabled,
        description: catDesc.trim()
      });
      triggerToast(`Category "${catName}" updated successfully.`);
      setCatIsEditing(null);
    } else {
      // Create Mode
      if (categories.some(c => c.key === formattedKey)) {
        triggerToast(`Category key "${formattedKey}" already exists.`);
        return;
      }

      onAddCategory({
        key: formattedKey,
        name: catName.trim(),
        enabled: true,
        description: catDesc.trim()
      });
      triggerToast(`Category "${catName}" created successfully.`);
    }

    // Reset Form
    setCatKey('');
    setCatName('');
    setCatDesc('');
    setShowCatForm(false);
  };

  // Submit Rule Key
  const handleRuleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rkKey.trim() || !rkName.trim() || !rkCategoryKey) {
      triggerToast('Key, Name, and Target Category are required fields.');
      return;
    }

    const formattedKey = rkKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');

    if (formattedKey.length < 3) {
      triggerToast('Rule Key must be at least 3 characters alphanumeric/underscores.');
      return;
    }

    if (rkIsEditing) {
      // Editing Mode
      const original = ruleKeys.find(r => r.key === rkIsEditing);
      if (!original) return;

      onUpdateRuleKey({
        key: rkIsEditing,
        name: rkName.trim(),
        categoryKey: rkCategoryKey,
        enabled: original.enabled,
        description: rkDesc.trim()
      });
      triggerToast(`Rule key "${rkName}" updated.`);
      setRkIsEditing(null);
    } else {
      // Create Mode
      if (ruleKeys.some(r => r.key === formattedKey)) {
        triggerToast(`Rule key "${formattedKey}" already exists.`);
        return;
      }

      onAddRuleKey({
        key: formattedKey,
        name: rkName.trim(),
        categoryKey: rkCategoryKey,
        enabled: true,
        description: rkDesc.trim()
      });
      triggerToast(`Rule Key "${rkName}" created.`);
    }

    // Reset Form
    setRkKey('');
    setRkName('');
    setRkCategoryKey('');
    setRkDesc('');
    setShowRkForm(false);
  };

  // Start Category Edit
  const startCatEdit = (cat: DynamicCategory) => {
    if (isCategoryInUse(cat.key)) {
      triggerToast(`Operation Blocked: Category "${cat.key}" is currently mapped to rules and cannot be edited.`);
      return;
    }
    setCatIsEditing(cat.key);
    setCatKey(cat.key);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setShowCatForm(true);
  };

  // Start Rule Key Edit
  const startRkEdit = (rk: DynamicRuleKey) => {
    if (isRuleKeyInUse(rk.key)) {
      triggerToast(`Operation Blocked: Rule Key "${rk.key}" is currently mapped in rules matrix and cannot be edited.`);
      return;
    }
    setRkIsEditing(rk.key);
    setRkKey(rk.key);
    setRkName(rk.name);
    setRkCategoryKey(rk.categoryKey);
    setRkDesc(rk.description || '');
    setShowRkForm(true);
  };

  // Handle Category Toggle Enable/Disable
  const handleToggleCategory = (cat: DynamicCategory) => {
    if (isCategoryInUse(cat.key)) {
      triggerToast(`Operation Blocked: Category "${cat.key}" is mapped in the rules matrix and cannot be disabled.`);
      return;
    }
    onUpdateCategory({
      ...cat,
      enabled: !cat.enabled
    });
    triggerToast(`Category "${cat.name}" is now ${!cat.enabled ? 'Enabled' : 'Disabled'}.`);
  };

  // Handle Rule Key Toggle Enable/Disable
  const handleToggleRuleKey = (rk: DynamicRuleKey) => {
    if (isRuleKeyInUse(rk.key)) {
      triggerToast(`Operation Blocked: Rule Key "${rk.key}" is mapped in the rules matrix and cannot be disabled.`);
      return;
    }
    onUpdateRuleKey({
      ...rk,
      enabled: !rk.enabled
    });
    triggerToast(`Rule key "${rk.name}" is now ${!rk.enabled ? 'Enabled' : 'Disabled'}.`);
  };

  // Handle Category Delete
  const handleCatDelete = (key: string) => {
    if (isCategoryInUse(key)) {
      triggerToast(`Operation Blocked: Category "${key}" is mapped in the rules matrix and cannot be deleted.`);
      return;
    }
    if (confirm(`Are you sure you want to delete Category "${key}"? This will untether any rule keys currently mapped to it.`)) {
      onDeleteCategory(key);
    }
  };

  // Handle Rule Key Delete
  const handleRkDelete = (key: string) => {
    if (isRuleKeyInUse(key)) {
      triggerToast(`Operation Blocked: Rule Key "${key}" is mapped in the rules matrix and cannot be deleted.`);
      return;
    }
    if (confirm(`Are you sure you want to delete Rule Key "${key}"?`)) {
      onDeleteRuleKey(key);
    }
  };

  // Quick relation move
  const handleQuickMove = (key: string, targetCat: string) => {
    const rk = ruleKeys.find(r => r.key === key);
    if (!rk) return;

    if (isRuleKeyInUse(key)) {
      triggerToast(`Operation Blocked: Rule Key "${key}" is currently mapped in rules matrix and its relationship cannot be modified.`);
      setQuickMoveRk(null);
      return;
    }

    onUpdateRuleKey({
      ...rk,
      categoryKey: targetCat
    });
    triggerToast(`Moved Rule Key "${rk.name}" to Category "${targetCat}".`);
    setQuickMoveRk(null);
  };

  // Filter Categories
  const filteredCategories = categories.filter(c => 
    c.key.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(catSearch.toLowerCase())
  );

  // Filter Rule Keys
  const filteredRuleKeys = ruleKeys.filter(r => {
    const matchesSearch = 
      r.key.toLowerCase().includes(rkSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(rkSearch.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(rkSearch.toLowerCase());
    const matchesCategory = rkCategoryFilter === 'ALL' || r.categoryKey === rkCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-sans">
      
      {/* Banner / Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <Network className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center space-x-2">
                <span>Category & Rule Key Matrix Registry</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure notification categories, unique alert triggers, and manage their system-wide relationships with real-time lock-state protections.
              </p>
            </div>
          </div>
          
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                activeTab === 'visual'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FolderTree className="h-3.5 w-3.5 inline mr-1.5 shrink-0" />
              Relationships Map
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                activeTab === 'categories'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Layers className="h-3.5 w-3.5 inline mr-1.5 shrink-0" />
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('rule_keys')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                activeTab === 'rule_keys'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Key className="h-3.5 w-3.5 inline mr-1.5 shrink-0" />
              Rule Keys ({ruleKeys.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="p-6">

        {/* 1. VISUAL RELATIONSHIPS MAP */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            
            {/* Explanatory Warning */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-slate-400">
              <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-bold uppercase tracking-wider mr-1 text-[11px]">Relational Graph:</span>
                This interactive tree renders all live <strong>Categories</strong> (groups) and shows their mapped <strong>Rule Keys</strong> (telemetry event keys) in real time. 
                Move keys between categories to change how filters suppressing messages apply to vehicle alerts. 
                <span className="text-rose-400 font-semibold block mt-1.5">
                  🛡️ Strict Matrix Safety Rule: If a Category or Rule Key is mapped in active rules, it carries a red <Lock className="h-3 w-3 inline mx-0.5" /> lock symbol and all structural configurations are frozen to prevent breaking gateway logic.
                </span>
              </div>
            </div>

            {/* Grid of Category Trees */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const isCatLocked = isCategoryInUse(cat.key);
                const relatedKeys = ruleKeys.filter(rk => rk.categoryKey === cat.key);
                const activeRulesInCat = getRulesUsingCategory(cat.key);

                return (
                  <div 
                    key={cat.key} 
                    className={`border rounded-xl overflow-hidden transition duration-200 ${
                      !cat.enabled 
                        ? 'bg-slate-950/20 border-slate-900 opacity-60' 
                        : isCatLocked 
                        ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700/60' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-indigo-900/30'
                    }`}
                  >
                    {/* Category Title Header */}
                    <div className="p-4 bg-slate-950/60 border-b border-slate-850 flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">{cat.key}</span>
                          {!cat.enabled && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700 uppercase">Disabled</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                          <span>{cat.name}</span>
                        </h3>
                      </div>

                      {/* Locked Badge */}
                      {isCatLocked ? (
                        <div 
                          className="flex items-center space-x-1 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-mono"
                          title={`Locked: ${activeRulesInCat.length} Rules using this category.`}
                        >
                          <Lock className="h-3 w-3" />
                          <span>LOCKED</span>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center space-x-1 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-mono"
                          title="Unlocked: No rules configured yet. Fully editable."
                        >
                          <Unlock className="h-3 w-3" />
                          <span>FREE</span>
                        </div>
                      )}
                    </div>

                    {/* Category Details & Rules Count */}
                    <div className="p-4 space-y-3.5">
                      {cat.description && (
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                          {cat.description}
                        </p>
                      )}

                      {/* Rule Keys Assigned List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wide">
                          <span>Rule Keys ({relatedKeys.length})</span>
                          <span>Actions</span>
                        </div>

                        {relatedKeys.length === 0 ? (
                          <div className="py-4 text-center rounded-lg bg-slate-900/30 border border-dashed border-slate-850/60">
                            <p className="text-[11px] text-slate-600 italic">No Rule Keys associated.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                            {relatedKeys.map((rk) => {
                              const isRkLocked = isRuleKeyInUse(rk.key);
                              const rulesUsingThisRk = getRulesUsingRuleKey(rk.key);

                              return (
                                <div 
                                  key={rk.key} 
                                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-850/50 flex items-center justify-between text-xs hover:bg-slate-900 transition"
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-mono text-[10px] font-bold text-slate-300 truncate" title={rk.key}>
                                        🔑 {rk.key}
                                      </span>
                                      {isRkLocked && (
                                        <Lock className="h-2.5 w-2.5 text-rose-500 shrink-0" title="Locked: Rule is in use" />
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">{rk.name}</div>
                                  </div>

                                  {/* Actions for rule keys in visual tab */}
                                  <div className="flex items-center space-x-1 shrink-0">
                                    {quickMoveRk === rk.key ? (
                                      <div className="flex items-center space-x-1 animate-fade-in">
                                        <select
                                          onChange={(e) => handleQuickMove(rk.key, e.target.value)}
                                          defaultValue=""
                                          className="bg-slate-950 border border-slate-700 text-[10px] text-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                                        >
                                          <option value="" disabled>Move...</option>
                                          {categories.filter(c => c.key !== cat.key).map(c => (
                                            <option key={c.key} value={c.key}>{c.key}</option>
                                          ))}
                                        </select>
                                        <button 
                                          onClick={() => setQuickMoveRk(null)}
                                          className="p-1 text-slate-500 hover:text-slate-300"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <button
                                          disabled={isRkLocked}
                                          onClick={() => setQuickMoveRk(rk.key)}
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition ${
                                            isRkLocked 
                                              ? 'text-slate-600 bg-slate-850 cursor-not-allowed'
                                              : 'text-indigo-400 bg-indigo-950/50 hover:bg-indigo-600 hover:text-white border border-indigo-800/40'
                                          }`}
                                          title={isRkLocked ? `Locked by active rule: ${rulesUsingThisRk[0]?.name}` : "Change Category Relationship"}
                                        >
                                          Move
                                        </button>
                                        <button
                                          disabled={isRkLocked}
                                          onClick={() => {
                                            setRkIsEditing(rk.key);
                                            setRkKey(rk.key);
                                            setRkName(rk.name);
                                            setRkCategoryKey(rk.categoryKey);
                                            setRkDesc(rk.description || '');
                                            setActiveTab('rule_keys');
                                            setShowRkForm(true);
                                          }}
                                          className={`p-1 rounded ${
                                            isRkLocked 
                                              ? 'text-slate-700 cursor-not-allowed'
                                              : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-850'
                                          }`}
                                          title="Quick Edit"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Display Locks if any */}
                      {isCatLocked && (
                        <div className="p-2 rounded bg-rose-950/15 border border-rose-900/30 text-[10px] text-rose-400 space-y-1 font-sans">
                          <div className="font-bold flex items-center space-x-1">
                            <Lock className="h-3 w-3" />
                            <span className="uppercase tracking-wider">Locked by Gateway Rules:</span>
                          </div>
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {activeRulesInCat.slice(0, 3).map((r, i) => (
                              <li key={i} className="truncate">
                                <span className="font-semibold">{r.name}</span> <span className="text-slate-500 font-mono">({r.ruleKey})</span>
                              </li>
                            ))}
                            {activeRulesInCat.length > 3 && (
                              <li className="italic text-slate-500">And {activeRulesInCat.length - 3} more...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Category Quick Card */}
              <button
                onClick={() => {
                  setCatIsEditing(null);
                  setCatKey('');
                  setCatName('');
                  setCatDesc('');
                  setShowCatForm(true);
                  setActiveTab('categories');
                }}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/20 hover:bg-slate-950/40 rounded-xl transition duration-200 min-h-[180px] group"
              >
                <div className="p-3 bg-slate-900 group-hover:bg-indigo-600/10 text-slate-500 group-hover:text-indigo-400 border border-slate-800 group-hover:border-indigo-500/20 rounded-xl transition">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 mt-3 font-mono uppercase tracking-wider">Add Category Key</span>
                <span className="text-[10px] text-slate-600 mt-1 text-center font-sans max-w-[200px]">Create an entirely new alert grouping to tether rule keys.</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {!showCatForm && (
                <button
                  onClick={() => {
                    setCatIsEditing(null);
                    setCatKey('');
                    setCatName('');
                    setCatDesc('');
                    setShowCatForm(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono tracking-wider uppercase transition flex items-center justify-center space-x-1.5 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Category</span>
                </button>
              )}
            </div>

            {/* Category Form */}
            {showCatForm && (
              <form onSubmit={handleCategorySubmit} className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>{catIsEditing ? `Edit Category [${catIsEditing}]` : 'Create New Category Key'}</span>
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowCatForm(false)}
                    className="p-1 rounded bg-slate-900 text-slate-500 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">CATEGORY CODE KEY</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VEHICLE_INFOTAINMENT"
                      disabled={!!catIsEditing}
                      value={catKey}
                      onChange={(e) => setCatKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {!catIsEditing && (
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">Unique code key. Upper-case letters, digits, and underscores only.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">HUMAN-READABLE NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 📻 Infotainment & Display"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">DESCRIPTION / FIELD SCOPE</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the alerts, sensors, or command-telemetry events grouped under this category key..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="flex justify-end space-x-2 border-t border-slate-850 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCatForm(false);
                      setCatIsEditing(null);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg text-xs font-mono font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Category</span>
                  </button>
                </div>
              </form>
            )}

            {/* Categories List View */}
            <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-4 font-semibold">Category Key</th>
                    <th className="p-3 font-semibold">Display Title & Scope</th>
                    <th className="p-3 text-center font-semibold">Live Mapped Rules</th>
                    <th className="p-3 text-center font-semibold">Status Toggle</th>
                    <th className="p-3 text-right pr-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans text-slate-300">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        No category keys found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => {
                      const isLocked = isCategoryInUse(cat.key);
                      const mappedCount = getRulesUsingCategory(cat.key).length;

                      return (
                        <tr 
                          key={cat.key} 
                          className={`hover:bg-slate-850/15 transition duration-150 ${!cat.enabled ? 'opacity-50 bg-slate-950/5' : ''}`}
                        >
                          {/* Code Key */}
                          <td className="p-3 pl-4 font-mono font-bold text-slate-200">
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-xs text-indigo-400 block w-fit">
                              {cat.key}
                            </span>
                          </td>

                          {/* Display name and description */}
                          <td className="p-3 max-w-sm">
                            <div className="font-bold text-slate-100">{cat.name}</div>
                            {cat.description && (
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                {cat.description}
                              </p>
                            )}
                          </td>

                          {/* Rule Mapped Count Badge */}
                          <td className="p-3 text-center">
                            <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                              mappedCount > 0 
                                ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' 
                                : 'bg-slate-900 text-slate-500 border border-slate-850'
                            }`}>
                              {mappedCount} Rules
                            </span>
                          </td>

                          {/* Status toggle */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCategory(cat)}
                              disabled={isLocked}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                                cat.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={isLocked ? "Operation Blocked: Category mapped in active gateway rules." : `Click to ${cat.enabled ? 'Disable' : 'Enable'} Category`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                                  cat.enabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end space-x-2">
                              {isLocked ? (
                                <div 
                                  className="flex items-center space-x-1.5 bg-rose-950/20 border border-rose-900/30 text-rose-400 text-[10px] px-2 py-1 rounded font-mono"
                                  title="Operation Blocked: Locked by gateway rule-matrix constraints."
                                >
                                  <Lock className="h-3 w-3 text-rose-500" />
                                  <span>LOCKED</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startCatEdit(cat)}
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                                    title="Edit Category Details"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleCatDelete(cat.key)}
                                    className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-lg transition"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RULE KEYS MANAGEMENT */}
        {activeTab === 'rule_keys' && (
          <div className="space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search rule keys..."
                    value={rkSearch}
                    onChange={(e) => setRkSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <select
                  value={rkCategoryFilter}
                  onChange={(e) => setRkCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="ALL">🔍 All Categories</option>
                  {categories.map(c => (
                    <option key={c.key} value={c.key}>{c.key} ({c.name.split(' ').slice(1).join(' ')})</option>
                  ))}
                </select>
              </div>

              {!showRkForm && (
                <button
                  onClick={() => {
                    setRkIsEditing(null);
                    setRkKey('');
                    setRkName('');
                    setRkCategoryKey(categories[0]?.key || '');
                    setRkDesc('');
                    setShowRkForm(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono tracking-wider uppercase transition flex items-center justify-center space-x-1.5 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Rule Key</span>
                </button>
              )}
            </div>

            {/* Rule Key Form */}
            {showRkForm && (
              <form onSubmit={handleRuleKeySubmit} className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Key className="h-4 w-4 text-indigo-400" />
                    <span>{rkIsEditing ? `Edit Rule Key [${rkIsEditing}]` : 'Create New Rule Key Pattern'}</span>
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowRkForm(false)}
                    className="p-1 rounded bg-slate-900 text-slate-500 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">RULE KEY CODE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RULE_ALARM_SILENCE"
                      disabled={!!rkIsEditing}
                      value={rkKey}
                      onChange={(e) => setRkKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {!rkIsEditing && (
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">Unique trigger code key. Prefixing with RULE_ is recommended.</p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">HUMAN-READABLE NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alarm Silenced Trigger"
                      value={rkName}
                      onChange={(e) => setRkName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">TARGET CATEGORY RELATIONSHIP</label>
                    <select
                      required
                      value={rkCategoryKey}
                      onChange={(e) => setRkCategoryKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="" disabled>Select category...</option>
                      {categories.map(c => (
                        <option key={c.key} value={c.key}>{c.key} ({c.name.split(' ').slice(1).join(' ')})</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-500 mt-1 font-sans">Defines which parent category suppresses messages when muted.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">DESCRIPTION / EXPLANATION</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a detailed description of what telemetry condition or gateway signal triggers this specific rule key..."
                    value={rkDesc}
                    onChange={(e) => setRkDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="flex justify-end space-x-2 border-t border-slate-850 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRkForm(false);
                      setRkIsEditing(null);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg text-xs font-mono font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Rule Key</span>
                  </button>
                </div>
              </form>
            )}

            {/* Rule Keys List View */}
            <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-4 font-semibold">Rule Key</th>
                    <th className="p-3 font-semibold">Associated Category</th>
                    <th className="p-3 font-semibold">Display Title & Scope</th>
                    <th className="p-3 text-center font-semibold">Status</th>
                    <th className="p-3 text-right pr-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans text-slate-300">
                  {filteredRuleKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        No rule keys found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRuleKeys.map((rk) => {
                      const isLocked = isRuleKeyInUse(rk.key);
                      const parentCat = categories.find(c => c.key === rk.categoryKey);
                      const rulesUsingKey = getRulesUsingRuleKey(rk.key);

                      return (
                        <tr 
                          key={rk.key} 
                          className={`hover:bg-slate-850/15 transition duration-150 ${!rk.enabled ? 'opacity-50 bg-slate-950/5' : ''}`}
                        >
                          {/* Code Key */}
                          <td className="p-3 pl-4 font-mono font-bold text-slate-200">
                            <span className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-xs text-amber-500 flex items-center space-x-1">
                                <span>🔑</span>
                                <span>{rk.key}</span>
                              </span>
                            </span>
                          </td>

                          {/* Category key relation */}
                          <td className="p-3">
                            {parentCat ? (
                              <div className="flex flex-col space-y-0.5">
                                <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/35 px-2 py-0.5 rounded-md w-fit uppercase">
                                  {rk.categoryKey}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{parentCat.name}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-400 font-mono italic">⚠️ TETHER BROKEN ({rk.categoryKey})</span>
                            )}
                          </td>

                          {/* Display name and description */}
                          <td className="p-3 max-w-sm">
                            <div className="font-bold text-slate-100">{rk.name}</div>
                            {rk.description && (
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                {rk.description}
                              </p>
                            )}
                          </td>

                          {/* Toggle Enabled */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRuleKey(rk)}
                              disabled={isLocked}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                                rk.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={isLocked ? "Operation Blocked: Rule Key is currently mapped in active rule matrix." : `Click to ${rk.enabled ? 'Disable' : 'Enable'} Rule Key`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                                  rk.enabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end space-x-2">
                              {isLocked ? (
                                <div 
                                  className="flex items-center space-x-1.5 bg-rose-950/20 border border-rose-900/30 text-rose-400 text-[10px] px-2 py-1 rounded font-mono"
                                  title={`Operation Blocked: Locked by Rule: "${rulesUsingKey[0]?.name}" (${rulesUsingKey[0]?.ruleKey})`}
                                >
                                  <Lock className="h-3 w-3 text-rose-500" />
                                  <span>LOCKED BY RULE</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startRkEdit(rk)}
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                                    title="Edit Rule Key details and category relationships"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRkDelete(rk.key)}
                                    className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-lg transition"
                                    title="Delete Rule Key"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

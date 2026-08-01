/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, DynamicCategory, DynamicKey, RuleConfigItem, MatrixCategoryItem } from '../types';
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
  Network, 
  Key, 
  Layers, 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Globe, 
  Check, 
  FileCode, 
  Sliders,
  Sparkles,
  Code,
  Copy,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL, SERVICE_ENDPOINTS } from '../constants/apiEndpoints';

const SUPPORTED_LOCALES = [
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' }
];

interface CategoryKeyManagerProps {
  categories: DynamicCategory[];
  notificationKeys: DynamicKey[];
  rules: Rule[];
  onAddCategory: (cat: DynamicCategory) => void;
  onUpdateCategory: (cat: DynamicCategory) => void;
  onDeleteCategory: (key: string) => void;
  onAddNotificationKey: (nk: DynamicKey) => void;
  onUpdateNotificationKey: (nk: DynamicKey) => void;
  onDeleteNotificationKey: (key: string) => void;
  triggerToast: (msg: string) => void;
}

export default function CategoryKeyManager({
  categories,
  notificationKeys = [],
  rules,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddNotificationKey,
  onUpdateNotificationKey,
  onDeleteNotificationKey,
  triggerToast
}: CategoryKeyManagerProps) {
  const activeNotificationKeys = notificationKeys;
  const handleAddNk = onAddNotificationKey;
  const handleUpdateNk = onUpdateNotificationKey;
  const handleDeleteNk = onDeleteNotificationKey;
  const [activeTab, setActiveTab] = useState<'visual' | 'categories' | 'notification_keys'>('visual');
  
  // NotificationCategory Form States
  const [catKey, setCatKey] = useState('');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIsEditing, setCatIsEditing] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);
  const [catTranslations, setCatTranslations] = useState<Record<string, { name: string; description: string }>>({
    es: { name: '', description: '' },
    fr: { name: '', description: '' },
    de: { name: '', description: '' },
    zh: { name: '', description: '' },
    ja: { name: '', description: '' },
  });
  const [activeCatFormLocale, setActiveCatFormLocale] = useState('es');

  // NotificationKey Form States
  const [rkKey, setRkKey] = useState('');
  const [rkName, setRkName] = useState('');
  const [rkCategoryKey, setRkCategoryKey] = useState('');
  const [rkDesc, setRkDesc] = useState('');
  const [rkIsEditing, setRkIsEditing] = useState<string | null>(null);
  const [rkSearch, setRkSearch] = useState('');
  const [rkCategoryFilter, setRkCategoryFilter] = useState('ALL');
  const [showRkForm, setShowRkForm] = useState(false);
  const [rkTranslations, setRkTranslations] = useState<Record<string, { name: string; description: string }>>({
    es: { name: '', description: '' },
    fr: { name: '', description: '' },
    de: { name: '', description: '' },
    zh: { name: '', description: '' },
    ja: { name: '', description: '' },
  });
  const [activeRkFormLocale, setActiveRkFormLocale] = useState('es');

  // Quick-Move state
  const [quickMoveRk, setQuickMoveRk] = useState<string | null>(null);

  // Matrix API GET /matrix states
  const [matrixData, setMatrixData] = useState<MatrixCategoryItem[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [jsonCopied, setJsonCopied] = useState<boolean>(false);

  // Property Accessors for Categories & Keys
  const getCatKey = (c: DynamicCategory | undefined | null): string => {
    if (!c) return '';
    return c.category || '';
  };

  const getCatName = (c: DynamicCategory | undefined | null): string => {
    if (!c) return '';
    return c.displayName || c.category || '';
  };

  const getRkKey = (k: DynamicKey | undefined | null): string => {
    if (!k) return '';
    return k.key || '';
  };

  const getRkName = (k: DynamicKey | undefined | null): string => {
    if (!k) return '';
    return k.displayName || k.key || '';
  };

  // Fetch matrix from GET /matrix endpoint
  const fetchMatrix = async () => {
    setLoadingMatrix(true);
    try {
      const res = await fetch(`${API_BASE_URL+SERVICE_ENDPOINTS.SETTING_SERVICE}/matrix`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMatrixData(data);
          setLoadingMatrix(false);
          return;
        }
      }
    } catch (e) {
      console.warn('GET /matrix endpoint call failed, using dynamic local matrix fallback', e);
    }

    // Dynamic local fallback adhering to exact JSON structure requested
    const fallback: MatrixCategoryItem[] = categories.map(cat => {
      const catCode = getCatKey(cat);
      const catNameVal = getCatName(cat);
      const relatedKeys = activeNotificationKeys
        .filter(rk => (rk.notificationCategory || (rk as any).categoryKey) === catCode)
        .map(rk => ({
          key: getRkKey(rk),
          displayName: getRkName(rk),
          description: rk.description || getRkKey(rk),
          mappedCategories: null
        }));

      const mappedRuleConfigs = getRuleConfigsForCategory(catCode);
      const mappedRules = Array.from(
        new Map(
          mappedRuleConfigs.map(c => [c.ruleId, { id: c.ruleId, name: c.ruleName, description: `Vehicle rule mapping for ${catCode}` }])
        ).values()
      );

      return {
        category: catCode,
        displayName: catNameVal,
        description: cat.description || catCode,
        isMandatory: cat.isMandatory ?? true,
        mappedRules,
        mappedNotificationKeys: relatedKeys
      };
    });

    setMatrixData(fallback);
    setLoadingMatrix(false);
  };

  useEffect(() => {
    if (activeTab === 'visual') {
      fetchMatrix();
    }
  }, [activeTab, categories, activeNotificationKeys, rules]);

  // Helper: check if NotificationCategory is in use in rules matrix via RuleConfig or categoryKey
  const getRulesUsingCategory = (key: string): Rule[] => {
    return rules.filter(r => {
      if (r.notificationCategory === key) return true;
      if (r.config && r.config.some(cfg => cfg.notificationCategory === key)) return true;
      return false;
    });
  };

  const isCategoryInUse = (key: string): boolean => {
    return getRulesUsingCategory(key).length > 0;
  };

  // Helper: check if NotificationKey is in use in rules matrix via RuleConfig or notificationKey
  const getRulesUsingNotificationKey = (key: string): Rule[] => {
    return rules.filter(r => {
      if (r.notificationKey === key) return true;
      if (r.config && r.config.some(cfg => cfg.notificationKey === key)) return true;
      return false;
    });
  };

  const isNotificationKeyInUse = (key: string): boolean => {
    return getRulesUsingNotificationKey(key).length > 0;
  };

  // Helper: extract all active RuleConfigs for a NotificationCategory or NotificationKey
  const getRuleConfigsForCategory = (catKey: string): { ruleName: string; ruleId: string; config: RuleConfigItem }[] => {
    const list: { ruleName: string; ruleId: string; config: RuleConfigItem }[] = [];
    rules.forEach(r => {
      if (r.config) {
        r.config.forEach(cfg => {
          if (cfg.notificationCategory === catKey) {
            list.push({ ruleName: r.name, ruleId: r.id, config: cfg });
          }
        });
      }
    });
    return list;
  };

  const getRuleConfigsForKey = (notificationKeyVal: string): { ruleName: string; ruleId: string; config: RuleConfigItem }[] => {
    const list: { ruleName: string; ruleId: string; config: RuleConfigItem }[] = [];
    rules.forEach(r => {
      if (r.config) {
        r.config.forEach(cfg => {
          if (cfg.notificationKey === notificationKeyVal) {
            list.push({ ruleName: r.name, ruleId: r.id, config: cfg });
          }
        });
      }
    });
    return list;
  };

  // Submit NotificationCategory
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!catKey.trim() || !catName.trim()) {
      triggerToast('NotificationCategory code and Name are required.');
      return;
    }

    const formattedKey = catKey.trim().replace(/[^A-Za-z0-9_.-]/g, '');
    
    if (formattedKey.length < 3) {
      triggerToast('NotificationCategory code must be at least 3 characters.');
      return;
    }

    const translationsArray = Object.entries(catTranslations)
      .filter(([_, t]) => (t as { name: string; description: string }).name.trim())
      .map(([locale, t]) => {
        const item = t as { name: string; description: string };
        return {
          locale,
          name: item.name.trim(),
          description: item.description.trim() || undefined
        };
      });

    if (catIsEditing) {
      const original = categories.find(c => getCatKey(c) === catIsEditing);
      if (!original) return;

      onUpdateCategory({
        category: catIsEditing,
        displayName: catName.trim(),
        description: catDesc.trim(),
        isMandatory: original.isMandatory,
        enabled: original.enabled,
        translations: translationsArray.length > 0 ? translationsArray : undefined
      });
      triggerToast(`NotificationCategory "${catName}" updated successfully.`);
      setCatIsEditing(null);
    } else {
      if (categories.some(c => getCatKey(c) === formattedKey)) {
        triggerToast(`NotificationCategory "${formattedKey}" already exists.`);
        return;
      }

      onAddCategory({
        category: formattedKey,
        displayName: catName.trim(),
        description: catDesc.trim(),
        enabled: true,
        translations: translationsArray.length > 0 ? translationsArray : undefined
      });
      triggerToast(`NotificationCategory "${catName}" created successfully.`);
    }

    // Reset Form
    setCatKey('');
    setCatName('');
    setCatDesc('');
    setCatTranslations({
      es: { name: '', description: '' },
      fr: { name: '', description: '' },
      de: { name: '', description: '' },
      zh: { name: '', description: '' },
      ja: { name: '', description: '' },
    });
    setActiveCatFormLocale('es');
    setShowCatForm(false);
  };

  // Submit NotificationKey
  const handleRuleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rkKey.trim() || !rkName.trim() || !rkCategoryKey) {
      triggerToast('NotificationKey code, Name, and Target NotificationCategory are required.');
      return;
    }

    const formattedKey = rkKey.trim().replace(/[^A-Za-z0-9_.-]/g, '');

    if (formattedKey.length < 3) {
      triggerToast('NotificationKey code must be at least 3 characters.');
      return;
    }

    const translationsArray = Object.entries(rkTranslations)
      .filter(([_, t]) => (t as { name: string; description: string }).name.trim())
      .map(([locale, t]) => {
        const item = t as { name: string; description: string };
        return {
          locale,
          name: item.name.trim(),
          description: item.description.trim() || undefined
        };
      });

    if (rkIsEditing) {
      const original = activeNotificationKeys.find(r => r.key === rkIsEditing);
      if (!original) return;

      handleUpdateNk({
        key: rkIsEditing,
        displayName: rkName.trim(),
        notificationCategory: rkCategoryKey,
        enabled: original.enabled,
        description: rkDesc.trim(),
        translations: translationsArray.length > 0 ? translationsArray : undefined
      });
      triggerToast(`NotificationKey "${rkName}" updated successfully.`);
      setRkIsEditing(null);
    } else {
      if (activeNotificationKeys.some(r => r.key === formattedKey)) {
        triggerToast(`NotificationKey "${formattedKey}" already exists.`);
        return;
      }

      handleAddNk({
        key: formattedKey,
        displayName: rkName.trim(),
        notificationCategory: rkCategoryKey,
        enabled: true,
        description: rkDesc.trim(),
        translations: translationsArray.length > 0 ? translationsArray : undefined
      });
      triggerToast(`NotificationKey "${rkName}" created successfully.`);
    }

    // Reset Form
    setRkKey('');
    setRkName('');
    setRkCategoryKey('');
    setRkDesc('');
    setRkTranslations({
      es: { name: '', description: '' },
      fr: { name: '', description: '' },
      de: { name: '', description: '' },
      zh: { name: '', description: '' },
      ja: { name: '', description: '' },
    });
    setActiveRkFormLocale('es');
    setShowRkForm(false);
  };

  // Start Category Edit
  const startCatEdit = (cat: DynamicCategory) => {
    const catCode = getCatKey(cat);
    const catNameVal = getCatName(cat);
    if (isCategoryInUse(catCode)) {
      triggerToast(`Operation Blocked: NotificationCategory "${catCode}" is mapped in active RuleConfig rules.`);
      return;
    }
    setCatIsEditing(catCode);
    setCatKey(catCode);
    setCatName(catNameVal);
    setCatDesc(cat.description || '');

    const initialTrans: Record<string, { name: string; description: string }> = {
      es: { name: '', description: '' },
      fr: { name: '', description: '' },
      de: { name: '', description: '' },
      zh: { name: '', description: '' },
      ja: { name: '', description: '' },
    };
    if (cat.translations) {
      cat.translations.forEach(t => {
        if (initialTrans[t.locale]) {
          initialTrans[t.locale] = {
            name: t.name,
            description: t.description || ''
          };
        }
      });
    }
    setCatTranslations(initialTrans);
    setActiveCatFormLocale('es');
    setShowCatForm(true);
  };

  // Start NotificationKey Edit
  const startRkEdit = (rk: DynamicKey) => {
    const rkCode = getRkKey(rk);
    const rkNameVal = getRkName(rk);
    if (isNotificationKeyInUse(rkCode)) {
      triggerToast(`Operation Blocked: NotificationKey "${rkCode}" is mapped in active RuleConfig rules.`);
      return;
    }
    setRkIsEditing(rkCode);
    setRkKey(rkCode);
    setRkName(rkNameVal);
    setRkCategoryKey(rk.notificationCategory || (rk as any).categoryKey || '');
    setRkDesc(rk.description || '');

    const initialTrans: Record<string, { name: string; description: string }> = {
      es: { name: '', description: '' },
      fr: { name: '', description: '' },
      de: { name: '', description: '' },
      zh: { name: '', description: '' },
      ja: { name: '', description: '' },
    };
    if (rk.translations) {
      rk.translations.forEach(t => {
        if (initialTrans[t.locale]) {
          initialTrans[t.locale] = {
            name: t.name,
            description: t.description || ''
          };
        }
      });
    }
    setRkTranslations(initialTrans);
    setActiveRkFormLocale('es');
    setShowRkForm(true);
  };

  // Toggle NotificationCategory
  const handleToggleCategory = (cat: DynamicCategory) => {
    const catCode = getCatKey(cat);
    const catNameVal = getCatName(cat);
    if (isCategoryInUse(catCode)) {
      triggerToast(`Operation Blocked: NotificationCategory "${catCode}" is mapped in active RuleConfig rules.`);
      return;
    }
    onUpdateCategory({
      ...cat,
      enabled: !cat.enabled
    });
    triggerToast(`NotificationCategory "${catNameVal}" is now ${!cat.enabled ? 'Enabled' : 'Disabled'}.`);
  };

  // Toggle NotificationKey
  const handleToggleRuleKey = (rk: DynamicKey) => {
    const rkCode = getRkKey(rk);
    const rkNameVal = getRkName(rk);
    if (isNotificationKeyInUse(rkCode)) {
      triggerToast(`Operation Blocked: NotificationKey "${rkCode}" is mapped in active RuleConfig rules.`);
      return;
    }
    handleUpdateNk({
      ...rk,
      enabled: !rk.enabled
    });
    triggerToast(`NotificationKey "${rkNameVal}" is now ${!rk.enabled ? 'Enabled' : 'Disabled'}.`);
  };

  // Delete Category
  const handleCatDelete = (key: string) => {
    if (isCategoryInUse(key)) {
      triggerToast(`Operation Blocked: NotificationCategory "${key}" is mapped in active RuleConfig rules.`);
      return;
    }
    if (confirm(`Are you sure you want to delete NotificationCategory "${key}"?`)) {
      onDeleteCategory(key);
    }
  };

  // Delete NotificationKey
  const handleRkDelete = (key: string) => {
    if (isNotificationKeyInUse(key)) {
      triggerToast(`Operation Blocked: NotificationKey "${key}" is mapped in active RuleConfig rules.`);
      return;
    }
    if (confirm(`Are you sure you want to delete NotificationKey "${key}"?`)) {
      handleDeleteNk(key);
    }
  };

  // Quick Move Category relation
  const handleQuickMove = (key: string, targetCat: string) => {
    const rk = activeNotificationKeys.find(r => getRkKey(r) === key);
    if (!rk) return;

    if (isNotificationKeyInUse(key)) {
      triggerToast(`Operation Blocked: NotificationKey "${key}" is mapped in active RuleConfig rules.`);
      setQuickMoveRk(null);
      return;
    }

    handleUpdateNk({
      ...rk,
      notificationCategory: targetCat
    });
    triggerToast(`Moved NotificationKey "${getRkName(rk)}" to NotificationCategory "${targetCat}".`);
    setQuickMoveRk(null);
  };

  // Filters
  const filteredCategories = categories.filter(c => {
    const code = getCatKey(c);
    const nameStr = getCatName(c);
    const desc = c.description || '';
    const q = (catSearch || '').toLowerCase();
    return (
      code.toLowerCase().includes(q) ||
      nameStr.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q)
    );
  });

  const filteredRuleKeys = activeNotificationKeys.filter(r => {
    const code = getRkKey(r);
    const nameStr = getRkName(r);
    const desc = r.description || '';
    const q = (rkSearch || '').toLowerCase();
    const matchesSearch = 
      code.toLowerCase().includes(q) ||
      nameStr.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q);
    const rkCat = r.notificationCategory || (r as any).categoryKey;
    const matchesCategory = rkCategoryFilter === 'ALL' || rkCat === rkCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-sans text-sm">
      
      {/* Banner / Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl shrink-0">
              <Network className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2 font-display">
                <span>Notification Category & Key Registry</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Configure notification categories, unique alert keys, and manage their relationships directly mapped in system-wide <strong className="text-indigo-300 font-mono">RuleConfig</strong> rules.
              </p>
            </div>
          </div>
          
          <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => { setActiveTab('visual'); fetchMatrix(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center space-x-2 ${
                activeTab === 'visual'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FolderTree className="h-4 w-4" />
              <span>Relationships Map</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Notification Category ({categories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notification_keys')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center space-x-2 ${
                (activeTab === 'notification_keys' || activeTab === ( 'rule_keys' as any))
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Key className="h-4 w-4" />
              <span>Notification Key ({activeNotificationKeys.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* RULE CONFIG RELATIONSHIP ARCHITECTURE BANNER */}
      <div className="mx-6 mt-6 p-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold font-mono text-indigo-300 text-xs uppercase tracking-wider">
              RuleConfig Relational Mapping Architecture
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In this system, <strong className="text-slate-200">RuleConfig</strong> is the core structure connecting <strong className="text-amber-400">NotificationCategory</strong> and <strong className="text-emerald-400">NotificationKey</strong>. Each rule contains configuration items defining criticality, condition groups, and template outputs linked to these keys.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs shrink-0 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
          <span className="text-amber-400 font-bold">Notification Category</span>
          <span className="text-slate-500">➔</span>
          <span className="text-emerald-400 font-bold">Notification Key</span>
          <span className="text-slate-500">➔</span>
          <span className="text-indigo-400 font-bold">RuleConfig</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 space-y-6">

        {/* TAB 1: VISUAL RELATIONSHIPS MAP */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            
            {/* API Endpoint Action Header */}
            <div className="p-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-lg uppercase">
                  GET /matrix
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <span>Category & Notification Key Relationship Matrix</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live relational JSON data structure fetched from <code className="text-indigo-300 font-mono">GET /matrix</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={fetchMatrix}
                  disabled={loadingMatrix}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${loadingMatrix ? 'animate-spin' : ''}`} />
                  <span>Refresh Endpoint</span>
                </button>

                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg flex items-center space-x-1.5 transition ${
                    showRawJson 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>{showRawJson ? 'Show Visual Cards' : 'View Raw JSON'}</span>
                </button>

                {showRawJson && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(matrixData, null, 2));
                      setJsonCopied(true);
                      triggerToast('Copied matrix JSON response to clipboard!');
                      setTimeout(() => setJsonCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 hover:bg-emerald-900/60 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{jsonCopied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid of Relationship Matrix Trees */}
            {loadingMatrix ? (
              <div className="py-12 text-center bg-slate-950/40 border border-slate-800 rounded-2xl">
                <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">Fetching relationship matrix from GET /matrix...</p>
              </div>
            ) : showRawJson ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span>API Response Payload: GET /matrix</span>
                  <span>{matrixData.length} Category Mappings</span>
                </div>
                <div className="relative">
                  <pre className="p-5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto max-h-[600px] leading-relaxed select-all">
                    {JSON.stringify(matrixData, null, 4)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matrixData.map((item, idx) => {
                const mappedRules = item.mappedRules || [];
                const mappedKeys = item.mappedNotificationKeys || [];

                return (
                  <div 
                    key={item.category || idx} 
                    className="bg-slate-950/60 border border-slate-800 hover:border-indigo-900/60 rounded-xl overflow-hidden transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Category Card Header */}
                      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded truncate">
                              {item.category}
                            </span>
                            {item.isMandatory ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-950/50 border border-rose-800/40 text-rose-300 rounded font-bold uppercase">
                                Mandatory
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded uppercase">
                                Optional
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-100 truncate mt-1">
                            {item.displayName}
                          </h3>
                        </div>
                      </div>

                      {/* Description & Mappings */}
                      <div className="p-4 space-y-4">
                        <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900/40 p-2 rounded border border-slate-850">
                          {item.description}
                        </p>

                        {/* Mapped Notification Keys */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold font-mono text-emerald-400 uppercase tracking-wide">
                            <span className="flex items-center space-x-1">
                              <Key className="h-3.5 w-3.5" />
                              <span>Mapped Notification Keys ({mappedKeys.length})</span>
                            </span>
                          </div>

                          {mappedKeys.length === 0 ? (
                            <div className="py-2.5 text-center rounded-lg bg-slate-900/30 border border-dashed border-slate-800">
                              <p className="text-xs text-slate-500 italic">No mapped notification keys</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {mappedKeys.map((nk) => (
                                <div key={nk.key} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                                  <div className="font-mono text-emerald-300 font-bold truncate flex items-center space-x-1">
                                    <span>🔑</span>
                                    <span title={nk.key}>{nk.key}</span>
                                  </div>
                                  <div className="text-slate-300 text-xs font-medium truncate mt-0.5">{nk.displayName}</div>
                                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{nk.description}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Mapped Rules */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <div className="flex items-center justify-between text-xs font-bold font-mono text-indigo-400 uppercase tracking-wide">
                            <span className="flex items-center space-x-1">
                              <Sliders className="h-3.5 w-3.5" />
                              <span>mappedRules ({mappedRules.length})</span>
                            </span>
                          </div>

                          {mappedRules.length === 0 ? (
                            <div className="py-2 text-center rounded-lg bg-slate-900/30 border border-dashed border-slate-800">
                              <p className="text-xs text-slate-500 italic">No mapped rules</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {mappedRules.map((rule) => (
                                <div key={rule.id} className="p-2 rounded bg-indigo-950/20 border border-indigo-900/30 text-xs space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-200 truncate">{rule.name}</span>
                                    <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/40 shrink-0">
                                      {rule.id}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 truncate">{rule.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/30 hover:bg-slate-950/60 rounded-xl transition duration-200 min-h-[220px] group"
              >
                <div className="p-3 bg-slate-900 group-hover:bg-indigo-600/10 text-slate-400 group-hover:text-indigo-400 border border-slate-800 group-hover:border-indigo-500/30 rounded-xl transition">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-slate-100 mt-4 font-mono uppercase tracking-wider">Add Notification Category</span>
                <span className="text-xs text-slate-500 mt-1 text-center max-w-[220px] leading-relaxed">Create a new category code to group Notification Key triggers.</span>
              </button>
            </div>
          )}
        </div>
      )}

        {/* TAB 2: NOTIFICATIONCATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search NotificationCategory..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
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
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Notification Category</span>
                </button>
              )}
            </div>

            {/* NotificationCategory Form */}
            {showCatForm && (
              <form onSubmit={handleCategorySubmit} className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-indigo-400" />
                    <span>{catIsEditing ? `Edit NotificationCategory [${catIsEditing}]` : 'Create New NotificationCategory'}</span>
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowCatForm(false)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      NOTIFICATION CATEGORY CODE
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. milon.burglar.category or VEHICLE_SAFETY"
                      disabled={!!catIsEditing}
                      value={catKey}
                      onChange={(e) => setCatKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {!catIsEditing && (
                      <p className="text-xs text-slate-500 mt-1.5 font-mono">Unique category key referenced in RuleConfig.notificationCategory</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 🛡️ Anti-Theft & Intrusion Category"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                    DESCRIPTION / SCOPE
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe the category scope and type of notifications grouped under this category..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                {/* Locale Translations */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-slate-200 font-mono flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-indigo-400" />
                      <span>Language Translations (Optional)</span>
                    </span>
                    <span className="text-xs text-slate-500">
                      Add localized labels for end users
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    {SUPPORTED_LOCALES.map(loc => {
                      const isFilled = catTranslations[loc.code]?.name.trim().length > 0;
                      return (
                        <button
                          key={loc.code}
                          type="button"
                          onClick={() => setActiveCatFormLocale(loc.code)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-2 ${
                            activeCatFormLocale === loc.code
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          <span>{loc.flag}</span>
                          <span>{loc.name.split(' ')[0]}</span>
                          {isFilled && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">
                        NAME IN {SUPPORTED_LOCALES.find(l => l.code === activeCatFormLocale)?.name.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        placeholder="Localized name..."
                        value={catTranslations[activeCatFormLocale]?.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCatTranslations(prev => ({
                            ...prev,
                            [activeCatFormLocale]: {
                              ...prev[activeCatFormLocale],
                              name: val
                            }
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 font-mono mb-1.5 uppercase tracking-wider">
                        DESCRIPTION IN {SUPPORTED_LOCALES.find(l => l.code === activeCatFormLocale)?.name.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        placeholder="Localized description..."
                        value={catTranslations[activeCatFormLocale]?.description || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCatTranslations(prev => ({
                            ...prev,
                            [activeCatFormLocale]: {
                              ...prev[activeCatFormLocale],
                              description: val
                            }
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCatForm(false);
                      setCatIsEditing(null);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-2 shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Notification Category</span>
                  </button>
                </div>
              </form>
            )}

            {/* NotificationCategory Table View */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 font-mono text-xs text-slate-400 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Notification Category</th>
                    <th className="p-4 font-semibold">Display Title & Scope</th>
                    <th className="p-4 text-center font-semibold">Mapped RuleConfigs</th>
                    <th className="p-4 text-center font-semibold">Status</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans text-slate-300">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        No Notification Category items found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => {
                      const catCode = getCatKey(cat);
                      const catNameVal = getCatName(cat);
                      const isLocked = isCategoryInUse(catCode);
                      const mappedConfigs = getRuleConfigsForCategory(catCode);

                      return (
                        <tr 
                          key={catCode} 
                          className={`hover:bg-slate-900/50 transition duration-150 ${!cat.enabled ? 'opacity-50 bg-slate-950/20' : ''}`}
                        >
                          {/* Code Key */}
                          <td className="p-4 font-mono font-bold text-slate-200">
                            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-amber-400 block w-fit">
                              {catCode}
                            </span>
                          </td>

                          {/* Display Name */}
                          <td className="p-4 max-w-md">
                            <div className="font-bold text-slate-100 text-sm">{catNameVal}</div>
                            {cat.description && (
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {cat.description}
                              </p>
                            )}
                          </td>

                          {/* Mapped Count */}
                          <td className="p-4 text-center">
                            <span className={`inline-block font-mono text-xs font-bold px-3 py-1 rounded-full ${
                              mappedConfigs.length > 0 
                                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60' 
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}>
                              {mappedConfigs.length} RuleConfigs
                            </span>
                          </td>

                          {/* Toggle */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCategory(cat)}
                              disabled={isLocked}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cat.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={isLocked ? "Operation Blocked: Category is mapped in active RuleConfigs." : `Click to ${cat.enabled ? 'Disable' : 'Enable'}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  cat.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isLocked ? (
                                <div 
                                  className="flex items-center space-x-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs px-2.5 py-1 rounded font-mono"
                                  title="Operation Blocked: Category mapped in active RuleConfigs."
                                >
                                  <Lock className="h-3.5 w-3.5 text-rose-500" />
                                  <span>LOCKED</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startCatEdit(cat)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                                    title="Edit NotificationCategory"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCatDelete(catCode)}
                                    className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-lg transition"
                                    title="Delete NotificationCategory"
                                  >
                                    <Trash2 className="h-4 w-4" />
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

        {/* TAB 3: NOTIFICATIONKEY MANAGEMENT */}
        {(activeTab === 'notification_keys' || activeTab === ('rule_keys' as any)) && (
          <div className="space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search NotificationKey..."
                    value={rkSearch}
                    onChange={(e) => setRkSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <select
                  value={rkCategoryFilter}
                  onChange={(e) => setRkCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="ALL">🔍 All Notification Category Items</option>
                  {categories.map(c => {
                    const cKey = getCatKey(c);
                    return <option key={cKey} value={cKey}>{cKey}</option>;
                  })}
                </select>
              </div>

              {!showRkForm && (
                <button
                  onClick={() => {
                    setRkIsEditing(null);
                    setRkKey('');
                    setRkName('');
                    setRkCategoryKey(getCatKey(categories[0]) || '');
                    setRkDesc('');
                    setShowRkForm(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Notification Key</span>
                </button>
              )}
            </div>

            {/* NotificationKey Form */}
            {showRkForm && (
              <form onSubmit={handleRuleKeySubmit} className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                    <Key className="h-5 w-5 text-indigo-400" />
                    <span>{rkIsEditing ? `Edit NotificationKey [${rkIsEditing}]` : 'Create New NotificationKey'}</span>
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowRkForm(false)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      NOTIFICATION KEY CODE
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. milon.burgluer or RULE_PLUG_CHARGE"
                      disabled={!!rkIsEditing}
                      value={rkKey}
                      onChange={(e) => setRkKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anti-Theft Burglary Alert"
                      value={rkName}
                      onChange={(e) => setRkName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      TARGET NOTIFICATION CATEGORY
                    </label>
                    <select
                      required
                      value={rkCategoryKey}
                      onChange={(e) => setRkCategoryKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="" disabled>Select parent category...</option>
                      {categories.map(c => {
                        const cKey = getCatKey(c);
                        return <option key={cKey} value={cKey}>{cKey}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                    DESCRIPTION / TRIGGER CONDITIONS
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide details on when this NotificationKey is triggered in RuleConfig..."
                    value={rkDesc}
                    onChange={(e) => setRkDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRkForm(false);
                      setRkIsEditing(null);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-2 shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Notification Key</span>
                  </button>
                </div>
              </form>
            )}

            {/* NotificationKey Table View */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 font-mono text-xs text-slate-400 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Notification Key</th>
                    <th className="p-4 font-semibold">Associated Notification Category</th>
                    <th className="p-4 font-semibold">Display Title & Scope</th>
                    <th className="p-4 text-center font-semibold">Status</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans text-slate-300">
                  {filteredRuleKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        No Notification Key items found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredRuleKeys.map((rk) => {
                      const rkCode = getRkKey(rk);
                      const rkNameVal = getRkName(rk);
                      const isLocked = isNotificationKeyInUse(rkCode);
                      const rkCat = rk.notificationCategory || (rk as any).categoryKey;
                      const parentCat = categories.find(c => getCatKey(c) === rkCat);
                      const mappedConfigs = getRuleConfigsForKey(rkCode);

                      return (
                        <tr 
                          key={rkCode} 
                          className={`hover:bg-slate-900/50 transition duration-150 ${!rk.enabled ? 'opacity-50 bg-slate-950/20' : ''}`}
                        >
                          {/* Code Key */}
                          <td className="p-4 font-mono font-bold text-slate-200">
                            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-emerald-400 flex items-center space-x-1.5 w-fit">
                              <span>🔑</span>
                              <span>{rkCode}</span>
                            </span>
                          </td>

                          {/* Associated Category */}
                          <td className="p-4">
                            {parentCat ? (
                              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-900/40 px-2.5 py-1 rounded-md inline-block">
                                {rkCat}
                              </span>
                            ) : (
                              <span className="text-xs text-rose-400 font-mono italic">⚠️ BROKEN ({rkCat})</span>
                            )}
                          </td>

                          {/* Display Name */}
                          <td className="p-4 max-w-md">
                            <div className="font-bold text-slate-100 text-sm">{rkNameVal}</div>
                            {rk.description && (
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {rk.description}
                              </p>
                            )}
                          </td>

                          {/* Status Toggle */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRuleKey(rk)}
                              disabled={isLocked}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                rk.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={isLocked ? "Operation Blocked: NotificationKey is mapped in active RuleConfigs." : `Click to ${rk.enabled ? 'Disable' : 'Enable'}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  rk.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isLocked ? (
                                <div 
                                  className="flex items-center space-x-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs px-2.5 py-1 rounded font-mono"
                                  title={`Locked by RuleConfig in: ${mappedConfigs[0]?.ruleName || 'Rule'}`}
                                >
                                  <Lock className="h-3.5 w-3.5 text-rose-500" />
                                  <span>LOCKED BY RULECONFIG</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startRkEdit(rk)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                                    title="Edit NotificationKey"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRkDelete(rkCode)}
                                    className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-lg transition"
                                    title="Delete NotificationKey"
                                  >
                                    <Trash2 className="h-4 w-4" />
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

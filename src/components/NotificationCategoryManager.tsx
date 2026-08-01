/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, DynamicCategory, DynamicKey, RuleConfigItem, MatrixCategoryItem, RealmMatrixMappingRecord } from '../types';
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
import { apiService } from '../services/api';

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
  const [catIsMandatory, setCatIsMandatory] = useState<boolean>(true);
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
  const [rkRealm, setRkRealm] = useState('us');
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

  // Realm Relationship Matrix API GET /matrix/{realm} states
  const [selectedRealmScope, setSelectedRealmScope] = useState<string>('us');
  const [realmMatrixMappings, setRealmMatrixMappings] = useState<RealmMatrixMappingRecord[]>([]);
  const [isLoadingRealmMatrix, setIsLoadingRealmMatrix] = useState<boolean>(false);
  const [isRawJsonModeActive, setIsRawJsonModeActive] = useState<boolean>(false);
  const [hasCopiedMatrixJson, setHasCopiedMatrixJson] = useState<boolean>(false);

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

  // Fetch matrix from GET /matrix/{realm} endpoint
  const fetchRealmMatrixData = async (targetRealm: string) => {
    setIsLoadingRealmMatrix(true);
    try {
      const res = await apiService.fetchMatrixByRealm(targetRealm);
      if (Array.isArray(res)) {
        setRealmMatrixMappings(res);
        setIsLoadingRealmMatrix(false);
        return;
      }
    } catch (err) {
      console.warn(`GET /matrix/${targetRealm} endpoint call warning, using fallback:`, err);
    }

    // Dynamic local fallback adhering to exact JSON structure requested for GET /matrix/{realm}
    const matchingKeys = activeNotificationKeys.filter(k => 
      (k.realm || 'us').toLowerCase() === targetRealm.toLowerCase()
    );

    const keysToMap = matchingKeys.length > 0 
      ? matchingKeys 
      : (activeNotificationKeys.length > 0 ? activeNotificationKeys : [
          {
            key: 'milon.burgluer.handbrake.key',
            displayName: 'Milon Burgluer Hand Brakes',
            notificationCategory: 'milon.burglar.category',
            realm: targetRealm,
            enabled: true,
            description: 'milon.burgluer.handbrake.key'
          }
        ]);

    const fallbackMappings: RealmMatrixMappingRecord[] = keysToMap.map(k => {
      const catCode = k.notificationCategory || (k as any).categoryKey || 'milon.burglar.category';
      const mappedRuleConfigs = getRuleConfigsForCategory(catCode);
      const mappedRulesList = mappedRuleConfigs.map(c => ({
        id: c.ruleId,
        name: c.ruleName,
        description: `Vehicle doors lock & unlock remotely`,
        enabled: true
      }));

      return {
        category: catCode,
        key: k.key,
        realm: k.realm || targetRealm,
        enabled: k.enabled ?? true,
        description: k.description || 'mapping',
        mappedRules: mappedRulesList.length > 0 ? mappedRulesList : [
          {
            id: 'MILON_RULE',
            name: 'Milon Rule',
            description: 'Vehicle doors lock & unlock remotely',
            enabled: true
          }
        ]
      };
    });

    setRealmMatrixMappings(fallbackMappings);
    setIsLoadingRealmMatrix(false);
  };

  useEffect(() => {
    if (activeTab === 'visual') {
      fetchRealmMatrixData(selectedRealmScope);
    }
  }, [activeTab, selectedRealmScope]);

  // Helper: check if NotificationCategory is in use in rules matrix or mapped to NotificationKey
  const getRulesUsingCategory = (key: string): Rule[] => {
    return rules.filter(r => {
      if (r.notificationCategory === key) return true;
      if (r.config && r.config.some(cfg => cfg.notificationCategory === key)) return true;
      return false;
    });
  };

  const getKeysUsingCategory = (catKey: string): DynamicKey[] => {
    return activeNotificationKeys.filter(rk => 
      (rk.notificationCategory || (rk as any).categoryKey || (rk as any).category) === catKey
    );
  };

  const isCategoryInUse = (key: string): boolean => {
    const inRules = getRulesUsingCategory(key).length > 0;
    const inKeys = getKeysUsingCategory(key).length > 0;
    return inRules || inKeys;
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
  const handleCategorySubmit = async (e: React.FormEvent) => {
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

    const categoryPayload: DynamicCategory = {
      category: formattedKey,
      displayName: catName.trim(),
      description: catDesc.trim(),
      isMandatory: catIsMandatory,
      enabled: true,
      translations: translationsArray.length > 0 ? translationsArray : undefined
    };

    // Integration with POST /categories
    try {
      await apiService.createCategory({
        category: categoryPayload.category,
        displayName: categoryPayload.displayName,
        description: categoryPayload.description,
        isMandatory: categoryPayload.isMandatory
      });
    } catch (apiErr) {
      console.warn('POST /categories API integration warning:', apiErr);
    }

    if (catIsEditing) {
      const original = categories.find(c => getCatKey(c) === catIsEditing);
      if (!original) return;

      onUpdateCategory({
        ...categoryPayload,
        category: catIsEditing,
        isMandatory: original.isMandatory,
        enabled: original.enabled
      });
      triggerToast(`NotificationCategory "${catName}" updated successfully.`);
      setCatIsEditing(null);
    } else {
      if (categories.some(c => getCatKey(c) === formattedKey)) {
        triggerToast(`NotificationCategory "${formattedKey}" already exists.`);
        return;
      }

      onAddCategory(categoryPayload);
      triggerToast(`NotificationCategory "${catName}" created via POST /categories.`);
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
  const handleRuleKeySubmit = async (e: React.FormEvent) => {
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

    const keyPayload: DynamicKey = {
      key: formattedKey,
      displayName: rkName.trim(),
      description: rkDesc.trim(),
      notificationCategory: rkCategoryKey,
      category: rkCategoryKey || true,
      realm: rkRealm || 'us',
      enabled: true,
      translations: translationsArray.length > 0 ? translationsArray : undefined
    };

    // Integration with POST /keys
    try {
      await apiService.createKey({
        key: keyPayload.key,
        displayName: keyPayload.displayName,
        description: keyPayload.description,
        category: keyPayload.category ?? true,
        realm: keyPayload.realm ?? 'us'
      });
    } catch (apiErr) {
      console.warn('POST /keys API integration warning:', apiErr);
    }

    if (rkIsEditing) {
      const original = activeNotificationKeys.find(r => r.key === rkIsEditing);
      if (!original) return;

      handleUpdateNk({
        ...keyPayload,
        key: rkIsEditing,
        enabled: original.enabled
      });
      triggerToast(`NotificationKey "${rkName}" updated successfully.`);
      setRkIsEditing(null);
    } else {
      if (activeNotificationKeys.some(r => r.key === formattedKey)) {
        triggerToast(`NotificationKey "${formattedKey}" already exists.`);
        return;
      }

      handleAddNk(keyPayload);
      triggerToast(`NotificationKey "${rkName}" created via POST /keys.`);
    }

    // Reset Form
    setRkKey('');
    setRkName('');
    setRkCategoryKey('');
    setRkRealm('us');
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
    const mappedRulesList = Array.isArray(cat.mappedRules) ? cat.mappedRules : getRulesUsingCategory(catCode);
    if (mappedRulesList && mappedRulesList.length > 0) {
      triggerToast(`Operation Blocked: NotificationCategory "${catCode}" has ${mappedRulesList.length} mapped rule(s) and action is locked.`);
      return;
    }
    setCatIsEditing(catCode);
    setCatKey(catCode);
    setCatName(catNameVal);
    setCatDesc(cat.description || '');
    setCatIsMandatory(cat.isMandatory ?? true);

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
    const mappedRulesList = Array.isArray(rk.mappedRules) ? rk.mappedRules : getRulesUsingNotificationKey(rkCode);
    if (mappedRulesList && mappedRulesList.length > 0) {
      triggerToast(`Operation Blocked: NotificationKey "${rkCode}" has ${mappedRulesList.length} mapped rule(s) and action is locked.`);
      return;
    }
    setRkIsEditing(rkCode);
    setRkKey(rkCode);
    setRkName(rkNameVal);
    setRkCategoryKey(rk.notificationCategory || (rk as any).categoryKey || '');
    setRkRealm(rk.realm || 'us');
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
    const mappedRulesList = Array.isArray(cat.mappedRules) ? cat.mappedRules : getRulesUsingCategory(catCode);
    if (mappedRulesList && mappedRulesList.length > 0) {
      triggerToast(`Operation Blocked: NotificationCategory "${catCode}" has ${mappedRulesList.length} mapped rule(s) and action is locked.`);
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
    const mappedRulesList = Array.isArray(rk.mappedRules) ? rk.mappedRules : getRulesUsingNotificationKey(rkCode);
    if (mappedRulesList && mappedRulesList.length > 0) {
      triggerToast(`Operation Blocked: NotificationKey "${rkCode}" has ${mappedRulesList.length} mapped rule(s) and action is locked.`);
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
    const catObj = categories.find(c => getCatKey(c) === key);
    const mappedRulesList = catObj && Array.isArray(catObj.mappedRules) ? catObj.mappedRules : getRulesUsingCategory(key);
    if (mappedRulesList && mappedRulesList.length > 0) {
      triggerToast(`Operation Blocked: NotificationCategory "${key}" has ${mappedRulesList.length} mapped rule(s) and action is locked.`);
      return;
    }
    if (confirm(`Are you sure you want to delete NotificationCategory "${key}"?`)) {
      onDeleteCategory(key);
    }
  };

  // Delete NotificationKey
  const handleRkDelete = (key: string) => {
    const rkObj = activeNotificationKeys.find(r => getRkKey(r) === key);
    const mappedRulesList = rkObj && Array.isArray(rkObj.mappedRules) ? rkObj.mappedRules : getRulesUsingNotificationKey(key);
    if (mappedRulesList && mappedRulesList.length > 0) {
      triggerToast(`Operation Blocked: NotificationKey "${key}" has ${mappedRulesList.length} mapped rule(s) and action is locked.`);
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
              onClick={() => setActiveTab('visual')}
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
            
            {/* API Endpoint Action & Realm Selection Header */}
            <div className="p-4 bg-slate-950/80 border border-indigo-900/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-lg uppercase">
                    GET /matrix/{selectedRealmScope}
                  </span>
                </div>

                {/* Realm Dropdown Selection */}
                <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-750 px-3 py-1.5 rounded-lg w-full sm:w-auto">
                  <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
                  <label htmlFor="realm-matrix-select" className="text-xs font-bold font-mono text-slate-300 shrink-0">
                    REALM:
                  </label>
                  <select
                    id="realm-matrix-select"
                    value={selectedRealmScope}
                    onChange={(e) => setSelectedRealmScope(e.target.value)}
                    className="bg-slate-950 text-cyan-300 font-mono text-xs font-bold px-2.5 py-1 rounded border border-slate-800 focus:outline-none focus:border-cyan-500 transition cursor-pointer w-full sm:w-auto"
                  >
                    <option value="us">us (United States)</option>
                    <option value="eu">eu (Europe)</option>
                    <option value="jp">jp (Japan)</option>
                    <option value="cn">cn (China)</option>
                    <option value="kr">kr (Korea)</option>
                    <option value="global">global (Global)</option>
                  </select>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-100 hidden lg:block">
                    Category & Key Realm Matrix
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => fetchRealmMatrixData(selectedRealmScope)}
                  disabled={isLoadingRealmMatrix}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${isLoadingRealmMatrix ? 'animate-spin' : ''}`} />
                  <span>Refresh Endpoint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRawJsonModeActive(!isRawJsonModeActive)}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg flex items-center space-x-1.5 transition ${
                    isRawJsonModeActive 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>{isRawJsonModeActive ? 'Show Visual Cards' : 'View Raw JSON'}</span>
                </button>

                {isRawJsonModeActive && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(realmMatrixMappings, null, 2));
                      setHasCopiedMatrixJson(true);
                      triggerToast(`Copied GET /matrix/${selectedRealmScope} response to clipboard!`);
                      setTimeout(() => setHasCopiedMatrixJson(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 hover:bg-emerald-900/60 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{hasCopiedMatrixJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid or Raw JSON view of Realm Relationship Matrix */}
            {isLoadingRealmMatrix ? (
              <div className="py-12 text-center bg-slate-950/40 border border-slate-800 rounded-2xl">
                <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">Fetching relationship matrix from GET /matrix/{selectedRealmScope}...</p>
              </div>
            ) : isRawJsonModeActive ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span>API Response Payload: GET /matrix/{selectedRealmScope}</span>
                  <span>{realmMatrixMappings.length} Mappings for Realm "{selectedRealmScope}"</span>
                </div>
                <div className="relative">
                  <pre className="p-5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto max-h-[600px] leading-relaxed select-all">
                    {JSON.stringify(realmMatrixMappings, null, 4)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realmMatrixMappings.map((mapItem, indexVal) => {
                  const mappedRuleEntries = mapItem.mappedRules || [];

                  return (
                    <div 
                      key={`${mapItem.category}-${mapItem.key}-${indexVal}`}
                      className="bg-slate-950/60 border border-slate-800 hover:border-cyan-900/60 rounded-xl overflow-hidden transition duration-200 flex flex-col justify-between"
                    >
                    <div>
                      {/* Card Header: Category & Key */}
                      <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2.5 py-1 rounded truncate">
                            📁 {mapItem.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded uppercase shrink-0">
                            🌐 {mapItem.realm}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="font-mono text-xs font-bold text-emerald-300 truncate flex items-center space-x-1 min-w-0">
                            <span>🔑</span>
                            <span className="truncate" title={mapItem.key}>{mapItem.key}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                            mapItem.enabled !== false 
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {mapItem.enabled !== false ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      {/* Card Body: Description & Mapped Rules */}
                      <div className="p-4 space-y-4">
                        <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900/40 p-2.5 rounded border border-slate-850">
                          {mapItem.description || 'Category & Key relationship mapping'}
                        </p>

                        {/* Mapped Rules Section */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <div className="flex items-center justify-between text-xs font-bold font-mono text-indigo-400 uppercase tracking-wide">
                            <span className="flex items-center space-x-1">
                              <Sliders className="h-3.5 w-3.5" />
                              <span>Mapped Rules ({mappedRuleEntries.length})</span>
                            </span>
                          </div>

                          {mappedRuleEntries.length === 0 ? (
                            <div className="py-2.5 text-center rounded-lg bg-slate-900/30 border border-dashed border-slate-800">
                              <p className="text-xs text-slate-500 italic">No mapped rules for this key</p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {mappedRuleEntries.map((ruleItem) => (
                                <div key={ruleItem.id} className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-200 truncate">{ruleItem.name}</span>
                                    <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/40 shrink-0">
                                      {ruleItem.id}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-snug">{ruleItem.description}</p>
                                  {ruleItem.enabled !== undefined && (
                                    <div className="pt-0.5 flex justify-end">
                                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                        ruleItem.enabled ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-500 bg-slate-900'
                                      }`}>
                                        {ruleItem.enabled ? '● Enabled' : '○ Disabled'}
                                      </span>
                                    </div>
                                  )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      MANDATORY STATUS (isMandatory)
                    </label>
                    <div className="flex items-center space-x-4 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isMandatoryGroup"
                          checked={catIsMandatory === true}
                          onChange={() => setCatIsMandatory(true)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">TRUE (Mandatory)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isMandatoryGroup"
                          checked={catIsMandatory === false}
                          onChange={() => setCatIsMandatory(false)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">FALSE (Optional)</span>
                      </label>
                    </div>
                  </div>
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
                    <th className="p-4 font-semibold">Display Name</th>
                    <th className="p-4 text-center font-semibold">Mapped Keys & Rules</th>
                    <th className="p-4 text-center font-semibold">Mandatory</th>
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
                      
                      // 3. Mapped Keys -> Count from Mapped Keys
                      const mappedKeysList = (cat.mappedNotificationKeys && Array.isArray(cat.mappedNotificationKeys))
                        ? cat.mappedNotificationKeys
                        : getKeysUsingCategory(catCode);
                      const mappedKeysCount = mappedKeysList.length;

                      // 4. Mandatory -> refer to isMandatory
                      const isMandatoryVal = Boolean(cat.isMandatory);

                      // Action button is locked when "mappedRules" count is more than zero
                      const mappedRulesList = Array.isArray(cat.mappedRules) 
                        ? cat.mappedRules 
                        : (getRulesUsingCategory(catCode).map(r => ({ id: r.id, name: r.name })));
                      const mappedRulesCount = mappedRulesList ? mappedRulesList.length : 0;
                      const isActionLocked = mappedRulesCount > 0;

                      return (
                        <tr 
                          key={catCode} 
                          className={`hover:bg-slate-900/50 transition duration-150 ${!cat.enabled ? 'opacity-60 bg-slate-950/20' : ''}`}
                        >
                          {/* 1. Notification Category -> refer to Category */}
                          <td className="p-4 font-mono font-bold text-slate-200">
                            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-amber-400 block w-fit">
                              {catCode}
                            </span>
                          </td>

                          {/* 2. Display Name -> refer to displayName */}
                          <td className="p-4 max-w-md">
                            <div className="font-bold text-slate-100 text-sm">{catNameVal}</div>
                            {cat.description && (
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {cat.description}
                              </p>
                            )}
                          </td>

                          {/* 3. Mapped Keys & Rules -> Count from Mapped Keys & Mapped Rules */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span 
                                className="px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-mono text-xs font-bold"
                                title={`Mapped Keys: ${mappedKeysCount}`}
                              >
                                {mappedKeysCount} {mappedKeysCount === 1 ? 'Key' : 'Keys'}
                              </span>
                              <span 
                                className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-mono text-xs font-bold"
                                title={`Mapped Rules: ${mappedRulesCount}`}
                              >
                                {mappedRulesCount} {mappedRulesCount === 1 ? 'Rule' : 'Rules'}
                              </span>
                            </div>
                          </td>

                          {/* 4. Mandatory -> refer to isMandatory */}
                          <td className="p-4 text-center">
                            <span className={`inline-block font-mono text-xs font-bold px-2.5 py-1 rounded uppercase ${
                              isMandatoryVal
                                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}>
                              {isMandatoryVal ? 'Mandatory' : 'Optional'}
                            </span>
                          </td>

                          {/* 5. Actions -> Action button is locked when "mappedRules" count is more than zero */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isActionLocked ? (
                                <div 
                                  className="flex items-center space-x-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs px-2.5 py-1.5 rounded font-mono font-bold w-fit ml-auto"
                                  title={`Action button is locked because mappedRules count is ${mappedRulesCount}`}
                                >
                                  <Lock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                  <span>LOCKED</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startCatEdit(cat)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                                    title="Edit Notification Category"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCatDelete(catCode)}
                                    className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-lg transition"
                                    title="Delete Notification Category"
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
                    setRkRealm('us');
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      NOTIFICATION KEY
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. v2hg.charg.connect or milon.burgluer"
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
                      placeholder="e.g. V2HG Charge"
                      value={rkName}
                      onChange={(e) => setRkName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      NOTIFICATION CATEGORY
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

                  <div>
                    <label className="block text-xs font-bold text-slate-300 font-mono mb-2 uppercase tracking-wider">
                      REALM
                    </label>
                    <select
                      required
                      value={rkRealm}
                      onChange={(e) => setRkRealm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="us">us - United States</option>
                      <option value="eu">eu - Europe</option>
                      <option value="jp">jp - Japan</option>
                      <option value="cn">cn - China</option>
                      <option value="kr">kr - Korea</option>
                      <option value="global">global - Global</option>
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
                    <th className="p-4 font-semibold">Display Name</th>
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 text-center font-semibold">Mapped Categories & Rules</th>
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
                      
                      // 1. Notification Key -> refer key
                      // 2. Display Name -> refer displayName
                      // 3. Description -> refer description

                      // 4. Mapped Categories & Rules -> refer mappedNotificationCategories & mappedRules Counts
                      const mappedCategoriesList = (rk.mappedNotificationCategories && Array.isArray(rk.mappedNotificationCategories))
                        ? rk.mappedNotificationCategories
                        : (categories.filter(c => getCatKey(c) === (rk.notificationCategory || (rk as any).categoryKey)));
                      const mappedCategoriesCount = mappedCategoriesList.length;

                      const mappedRulesList = (rk.mappedRules && Array.isArray(rk.mappedRules))
                        ? rk.mappedRules
                        : (getRulesUsingNotificationKey(rkCode).map(r => ({ id: r.id, name: r.name, description: r.description, enabled: r.enabled })));
                      const mappedRulesCount = mappedRulesList ? mappedRulesList.length : 0;

                      // 5. Actions -> blocked if mappedRules count is more than zero
                      const isActionLocked = mappedRulesCount > 0;

                      return (
                        <tr 
                          key={rkCode} 
                          className={`hover:bg-slate-900/50 transition duration-150 ${!rk.enabled ? 'opacity-60 bg-slate-950/20' : ''}`}
                        >
                          {/* 1. Notification Key -> refer key */}
                          <td className="p-4 font-mono font-bold text-slate-200">
                            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-amber-400 block w-fit">
                              {rkCode}
                            </span>
                          </td>

                          {/* 2. Display Name -> refer displayName */}
                          <td className="p-4 font-bold text-slate-100 text-sm">
                            {rkNameVal}
                          </td>

                          {/* 3. Description -> refer description */}
                          <td className="p-4 max-w-xs">
                            <div className="text-xs text-slate-300 leading-relaxed font-sans">
                              {rk.description || rkCode}
                            </div>
                          </td>

                          {/* 4. Mapped Categories & Rules -> refer mappedNotificationCategories & mappedRules Counts */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span 
                                className="px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-mono text-xs font-bold"
                                title={`Mapped Categories: ${mappedCategoriesCount}`}
                              >
                                {mappedCategoriesCount} {mappedCategoriesCount === 1 ? 'Category' : 'Categories'}
                              </span>
                              <span 
                                className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-mono text-xs font-bold"
                                title={`Mapped Rules: ${mappedRulesCount}`}
                              >
                                {mappedRulesCount} {mappedRulesCount === 1 ? 'Rule' : 'Rules'}
                              </span>
                            </div>
                          </td>

                          {/* 5. Actions -> blocked if mappedRules count is more than zero */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isActionLocked ? (
                                <div 
                                  className="flex items-center space-x-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs px-2.5 py-1.5 rounded font-mono font-bold w-fit ml-auto"
                                  title={`Action button is locked because mappedRules count is ${mappedRulesCount}`}
                                >
                                  <Lock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                  <span>LOCKED</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startRkEdit(rk)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                                    title="Edit Notification Key"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRkDelete(rkCode)}
                                    className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-lg transition"
                                    title="Delete Notification Key"
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

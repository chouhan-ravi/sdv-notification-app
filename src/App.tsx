/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, SimulationLog, BusinessFilter, CarOwnerSetting, AfterSalesRecord, NotificationScheduler, DynamicCategory, DynamicRuleKey } from './types';
import { DEFAULT_RULES } from './lib/defaultRules';
import { DEFAULT_BUSINESS_FILTERS, DEFAULT_CAR_OWNER_SETTINGS } from './lib/defaultFilters';
import { DEFAULT_AFTER_SALES_RECORDS, DEFAULT_SCHEDULERS } from './lib/defaultAfterSales';
import { DEFAULT_DYNAMIC_CATEGORIES, DEFAULT_DYNAMIC_RULE_KEYS } from './lib/defaultCategories';
import StatsGrid from './components/StatsGrid';
import RulesList from './components/RulesList';
import RuleFormModal from './components/RuleFormModal';
import Simulator from './components/Simulator';
import AuditLog from './components/AuditLog';
import NotificationSettings from './components/NotificationSettings';
import AfterSalesMaintenance from './components/AfterSalesMaintenance';
import SchedulerConfig from './components/SchedulerConfig';
import CategoryKeyManager from './components/CategoryKeyManager';
import TranslationManager from './components/TranslationManager';
import { apiService } from './services/api';
import { 
  Shield, 
  Settings, 
  Terminal, 
  Cpu, 
  FileDown, 
  FileUp, 
  RotateCcw, 
  Plus, 
  Sliders,
  Menu,
  X,
  Database,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Wrench,
  Clock,
  Network,
  Globe
} from 'lucide-react';

export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [businessFilters, setBusinessFilters] = useState<BusinessFilter[]>([]);
  const [userSettings, setUserSettings] = useState<CarOwnerSetting[]>([]);
  const [afterSalesRecords, setAfterSalesRecords] = useState<AfterSalesRecord[]>([]);
  const [schedulers, setSchedulers] = useState<NotificationScheduler[]>([]);
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [ruleKeys, setRuleKeys] = useState<DynamicRuleKey[]>([]);
  
  const [activeScreen, setActiveScreen] = useState<'simulator' | 'rules' | 'settings' | 'after_sales' | 'scheduler' | 'category_keys' | 'i18n'>('simulator');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<Rule | null>(null);
  const [activeRuleKeyFilter, setActiveRuleKeyFilter] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sdv_sidebar_collapsed');
    return saved === 'true';
  });

  const [theme, setTheme] = useState<'dark' | 'fuchsia-light'>(() => {
    return (localStorage.getItem('sdv_theme') as 'dark' | 'fuchsia-light') || 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'fuchsia-light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('sdv_theme', nextTheme);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sdv_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Sync theme with document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'fuchsia-light') {
      root.classList.add('fuchsia-light');
      root.style.backgroundColor = '#F5F6F8';
    } else {
      root.classList.remove('fuchsia-light');
      root.style.backgroundColor = '#020617';
    }
  }, [theme]);

  const fetchRulesFromApi = async () => {
    try {
      const data = await apiService.get<Rule[]>('/rules');
      setRules(data);
      localStorage.setItem('sdv_notification_rules', JSON.stringify(data));
    } catch (err) {
      console.warn('REST backend unreachable, falling back to LocalStorage:', err);
      const savedRules = localStorage.getItem('sdv_notification_rules');
      if (savedRules) {
        try {
          setRules(JSON.parse(savedRules));
        } catch (e) {
          setRules(DEFAULT_RULES);
        }
      } else {
        setRules(DEFAULT_RULES);
      }
    }
  };

  // Initialize and load from local storage
  useEffect(() => {
    // 1. Rules (Loads from REST API with dynamic LocalStorage fallback)
    fetchRulesFromApi();

    // 2. Simulation Logs
    const savedLogs = localStorage.getItem('sdv_simulation_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (err) {
        setLogs([]);
      }
    }

    // 3. Corporate Business Ingress Filters
    const savedFilters = localStorage.getItem('sdv_business_filters');
    if (savedFilters) {
      try {
        setBusinessFilters(JSON.parse(savedFilters));
      } catch (err) {
        setBusinessFilters(DEFAULT_BUSINESS_FILTERS);
      }
    } else {
      setBusinessFilters(DEFAULT_BUSINESS_FILTERS);
    }

    // 4. Car Owner Consent Settings
    const savedUserSettings = localStorage.getItem('sdv_car_owner_settings');
    if (savedUserSettings) {
      try {
        setUserSettings(JSON.parse(savedUserSettings));
      } catch (err) {
        setUserSettings(DEFAULT_CAR_OWNER_SETTINGS);
      }
    } else {
      setUserSettings(DEFAULT_CAR_OWNER_SETTINGS);
    }

    // 5. After-Sales Maintenance Records
    const savedAfterSales = localStorage.getItem('sdv_after_sales_records');
    if (savedAfterSales) {
      try {
        setAfterSalesRecords(JSON.parse(savedAfterSales));
      } catch (err) {
        setAfterSalesRecords(DEFAULT_AFTER_SALES_RECORDS);
      }
    } else {
      setAfterSalesRecords(DEFAULT_AFTER_SALES_RECORDS);
    }

    // 6. Notification Schedulers
    const savedSchedulers = localStorage.getItem('sdv_notification_schedulers');
    if (savedSchedulers) {
      try {
        setSchedulers(JSON.parse(savedSchedulers));
      } catch (err) {
        setSchedulers(DEFAULT_SCHEDULERS);
      }
    } else {
      setSchedulers(DEFAULT_SCHEDULERS);
    }

    // 7. Dynamic Categories
    const savedCategories = localStorage.getItem('sdv_dynamic_categories');
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (err) {
        setCategories(DEFAULT_DYNAMIC_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_DYNAMIC_CATEGORIES);
    }

    // 8. Dynamic Rule Keys
    const savedRuleKeys = localStorage.getItem('sdv_dynamic_rule_keys');
    if (savedRuleKeys) {
      try {
        setRuleKeys(JSON.parse(savedRuleKeys));
      } catch (err) {
        setRuleKeys(DEFAULT_DYNAMIC_RULE_KEYS);
      }
    } else {
      setRuleKeys(DEFAULT_DYNAMIC_RULE_KEYS);
    }
  }, []);

  // Sync state modifications to LocalStorage
  const saveCategoriesToLocalStorage = (updated: DynamicCategory[]) => {
    setCategories(updated);
    localStorage.setItem('sdv_dynamic_categories', JSON.stringify(updated));
  };

  const saveRuleKeysToLocalStorage = (updated: DynamicRuleKey[]) => {
    setRuleKeys(updated);
    localStorage.setItem('sdv_dynamic_rule_keys', JSON.stringify(updated));
  };

  const saveAfterSalesToLocalStorage = (updated: AfterSalesRecord[]) => {
    setAfterSalesRecords(updated);
    localStorage.setItem('sdv_after_sales_records', JSON.stringify(updated));
  };

  const saveSchedulersToLocalStorage = (updated: NotificationScheduler[]) => {
    setSchedulers(updated);
    localStorage.setItem('sdv_notification_schedulers', JSON.stringify(updated));
  };

  const saveRulesToLocalStorage = (updatedRules: Rule[]) => {
    setRules(updatedRules);
    localStorage.setItem('sdv_notification_rules', JSON.stringify(updatedRules));
  };

  const saveLogsToLocalStorage = (updatedLogs: SimulationLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('sdv_simulation_logs', JSON.stringify(updatedLogs));
  };

  const saveBusinessFiltersToLocalStorage = (updatedFilters: BusinessFilter[]) => {
    setBusinessFilters(updatedFilters);
    localStorage.setItem('sdv_business_filters', JSON.stringify(updatedFilters));
  };

  const saveUserSettingsToLocalStorage = (updatedSettings: CarOwnerSetting[]) => {
    setUserSettings(updatedSettings);
    localStorage.setItem('sdv_car_owner_settings', JSON.stringify(updatedSettings));
  };

  // Toast message controller
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Rule Handlers
  const handleToggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    
    const updatedRule = { ...rule, enabled: !rule.enabled };
    try {
      await apiService.put<Rule>(`/rules/${id}`, updatedRule);
      triggerToast(`Rule "${rule.name}" ${!rule.enabled ? 'enabled' : 'disabled'} successfully via PUT API`);
      await fetchRulesFromApi();
    } catch (err) {
      console.error('API toggle failed, falling back to local storage', err);
      const updated = rules.map(r => r.id === id ? updatedRule : r);
      saveRulesToLocalStorage(updated);
      triggerToast(`Rule "${rule.name}" ${!rule.enabled ? 'enabled' : 'disabled'} locally (fallback)`);
    }
  };

  const handleDeleteRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    
    if (window.confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      try {
        await apiService.delete(`/rules/${id}`);
        triggerToast('Rule deleted successfully via DELETE API');
        await fetchRulesFromApi();
      } catch (err) {
        console.error('API delete failed, falling back to local storage', err);
        const updated = rules.filter(r => r.id !== id);
        saveRulesToLocalStorage(updated);
        triggerToast('Rule deleted locally (fallback)');
      }
    }
  };

  const handleDuplicateRule = async (rule: Rule) => {
    const copy: Rule = {
      ...rule,
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      name: `${rule.name} (Copy)`,
      ruleKey: `${rule.ruleKey}_COPY`,
      enabled: true
    };
    
    try {
      await apiService.post<Rule>('/rules', copy);
      triggerToast(`Duplicated successfully via POST API`);
      await fetchRulesFromApi();
    } catch (err) {
      console.error('API duplication failed, falling back to local storage', err);
      const updated = [...rules, copy];
      saveRulesToLocalStorage(updated);
      triggerToast(`Duplicated locally into "${copy.name}" (fallback)`);
    }
  };

  const handleEditRuleTrigger = (rule: Rule) => {
    setRuleToEdit(rule);
    setIsFormOpen(true);
  };

  const handleCreateRuleTrigger = () => {
    setRuleToEdit(null);
    setIsFormOpen(true);
  };

  const handleSaveRule = async (savedRule: Rule) => {
    try {
      if (ruleToEdit) {
        // Edit Mode: PUT Call
        await apiService.put<Rule>(`/rules/${savedRule.id}`, savedRule);
        triggerToast('Rule settings updated successfully via PUT API');
      } else {
        // Create Mode: POST Call
        await apiService.post<Rule>('/rules', savedRule);
        triggerToast('New rule created successfully via POST API');
      }
      await fetchRulesFromApi();
    } catch (err: any) {
      console.error('REST API saving failed, resorting to local storage state fallback', err);
      let updated: Rule[];
      if (ruleToEdit) {
        updated = rules.map(r => r.id === savedRule.id ? savedRule : r);
        triggerToast('Rule settings updated locally (REST fallback)');
      } else {
        updated = [...rules, savedRule];
        triggerToast('New rule created locally (REST fallback)');
      }
      saveRulesToLocalStorage(updated);
    }
    setIsFormOpen(false);
    setRuleToEdit(null);
  };

  const handleReCache = async () => {
    try {
      await apiService.get('/rules/re-cache');
      triggerToast('All platform ingestion rules re-cached successfully');
      await fetchRulesFromApi();
    } catch (err: any) {
      console.error('API re-cache failed', err);
      triggerToast(`Re-cache failed: ${err.message || 'Network error'}`);
    }
  };

  // Corporate Suppression Filters Handlers
  const handleAddBusinessFilter = (newFilter: BusinessFilter) => {
    const updated = [newFilter, ...businessFilters];
    saveBusinessFiltersToLocalStorage(updated);
    triggerToast(`Suppression rule "${newFilter.name}" successfully active`);
  };

  const handleToggleBusinessFilter = (id: string) => {
    const updated = businessFilters.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f);
    saveBusinessFiltersToLocalStorage(updated);
    const filter = businessFilters.find(f => f.id === id);
    triggerToast(`Suppression filter "${filter?.name}" ${!filter?.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteBusinessFilter = (id: string) => {
    const filter = businessFilters.find(f => f.id === id);
    if (window.confirm(`Delete policy filter "${filter?.name}"?`)) {
      const updated = businessFilters.filter(f => f.id !== id);
      saveBusinessFiltersToLocalStorage(updated);
      triggerToast('Suppression filter removed successfully');
    }
  };

  // Subscriber Consent Handlers
  const handleAddUserSetting = (newSetting: CarOwnerSetting) => {
    const updated = [newSetting, ...userSettings];
    saveUserSettingsToLocalStorage(updated);
    triggerToast(`Saved mute preference for User "${newSetting.userId}"`);
  };

  const handleToggleUserSetting = (id: string) => {
    const updated = userSettings.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    saveUserSettingsToLocalStorage(updated);
    const setting = userSettings.find(s => s.id === id);
    triggerToast(`Mute state toggled for vehicle preference`);
  };

  const handleDeleteUserSetting = (id: string) => {
    const updated = userSettings.filter(s => s.id !== id);
    saveUserSettingsToLocalStorage(updated);
    triggerToast('Opt-out mute preference deleted');
  };

  // Dynamic Categories CRUD
  const handleAddCategory = (cat: DynamicCategory) => {
    const updated = [...categories, cat];
    saveCategoriesToLocalStorage(updated);
  };

  const handleUpdateCategory = (cat: DynamicCategory) => {
    const updated = categories.map(c => c.key === cat.key ? cat : c);
    saveCategoriesToLocalStorage(updated);
  };

  const handleDeleteCategory = (key: string) => {
    const updated = categories.filter(c => c.key !== key);
    saveCategoriesToLocalStorage(updated);
    // Unassign or delete orphaned rule keys
    const updatedRuleKeys = ruleKeys.filter(rk => rk.categoryKey !== key);
    saveRuleKeysToLocalStorage(updatedRuleKeys);
  };

  // Dynamic Rule Keys CRUD
  const handleAddRuleKey = (rk: DynamicRuleKey) => {
    const updated = [...ruleKeys, rk];
    saveRuleKeysToLocalStorage(updated);
  };

  const handleUpdateRuleKey = (rk: DynamicRuleKey) => {
    const updated = ruleKeys.map(r => r.key === rk.key ? rk : r);
    saveRuleKeysToLocalStorage(updated);
  };

  const handleDeleteRuleKey = (key: string) => {
    const updated = ruleKeys.filter(r => r.key !== key);
    saveRuleKeysToLocalStorage(updated);
  };

  // After-Sales Maintenance Records CRUD
  const handleAddAfterSalesRecord = (record: AfterSalesRecord) => {
    const updated = [record, ...afterSalesRecords];
    saveAfterSalesToLocalStorage(updated);
  };

  const handleUpdateAfterSalesRecord = (record: AfterSalesRecord) => {
    const updated = afterSalesRecords.map(r => r.id === record.id ? record : r);
    saveAfterSalesToLocalStorage(updated);
  };

  const handleDeleteAfterSalesRecord = (id: string) => {
    const updated = afterSalesRecords.filter(r => r.id !== id);
    saveAfterSalesToLocalStorage(updated);
    triggerToast('Service record removed successfully.');
  };

  // Notification Schedulers CRUD
  const handleAddScheduler = (sch: NotificationScheduler) => {
    const updated = [...schedulers, sch];
    saveSchedulersToLocalStorage(updated);
  };

  const handleUpdateScheduler = (sch: NotificationScheduler) => {
    const updated = schedulers.map(s => s.id === sch.id ? sch : s);
    saveSchedulersToLocalStorage(updated);
  };

  const handleDeleteScheduler = (id: string) => {
    const updated = schedulers.filter(s => s.id !== id);
    saveSchedulersToLocalStorage(updated);
    triggerToast('Scheduler rule removed successfully.');
  };

  // Log histories
  const handleAddLog = (newLog: SimulationLog) => {
    const updated = [...logs, newLog];
    saveLogsToLocalStorage(updated);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to purge all simulated event log history?')) {
      saveLogsToLocalStorage([]);
      triggerToast('Audit log database purged');
    }
  };

  // Load a historic log back into the active simulator panel
  const handleLoadLog = (log: SimulationLog) => {
    setActiveScreen('simulator');
    setActiveRuleKeyFilter(log.matchedRules[0]?.ruleKey || 'NONE');
    triggerToast(`Loaded simulation event for VIN: ${log.vin}`);
    setTimeout(() => setActiveRuleKeyFilter(null), 50);
  };

  // Factory settings reset
  const handleResetToDefaults = async () => {
    if (window.confirm('Reset all rules, corporate filters, and subscriber settings back to platform defaults? This will erase custom records.')) {
      try {
        await apiService.post<Rule[]>('/rules/reset', {});
        await fetchRulesFromApi();
        triggerToast('SDV platforms factory values restored via REST API');
      } catch (err) {
        console.error('API reset failed, falling back to local storage reset', err);
        saveRulesToLocalStorage(DEFAULT_RULES);
        triggerToast('SDV platforms factory values restored locally (fallback)');
      }
      saveBusinessFiltersToLocalStorage(DEFAULT_BUSINESS_FILTERS);
      saveUserSettingsToLocalStorage(DEFAULT_CAR_OWNER_SETTINGS);
      saveAfterSalesToLocalStorage(DEFAULT_AFTER_SALES_RECORDS);
      saveSchedulersToLocalStorage(DEFAULT_SCHEDULERS);
      saveCategoriesToLocalStorage(DEFAULT_DYNAMIC_CATEGORIES);
      saveRuleKeysToLocalStorage(DEFAULT_DYNAMIC_RULE_KEYS);
    }
  };

  // Export configured rules to file
  const handleExportConfig = () => {
    const jsonStr = JSON.stringify(rules, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sdv_vehicle_rules_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Rule suite configuration exported');
  };

  // Import custom rule configuration
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].ruleKey && parsed[0].conditions) {
          saveRulesToLocalStorage(parsed);
          triggerToast(`Successfully imported ${parsed.length} rules!`);
        } else {
          alert('Invalid rules configuration format. Must be an array of rule structures.');
        }
      } catch (err) {
        alert('Failed to parse file. Please verify it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleSelectRuleForTesting = (rule: Rule) => {
    setActiveScreen('simulator');
    setActiveRuleKeyFilter(rule.ruleKey);
    triggerToast(`Testing rule: ${rule.ruleKey}`);
    setTimeout(() => setActiveRuleKeyFilter(null), 50);
  };

  const getNavBtnClass = (screen: string) => {
    const isActive = activeScreen === screen;
    const padding = sidebarCollapsed ? 'justify-center p-2.5' : 'space-x-2.5 px-3 py-2';
    const base = `w-full flex items-center ${padding} rounded-xl text-xs font-bold transition duration-150 uppercase tracking-wide border`;
    if (isActive) {
      if (theme === 'fuchsia-light') {
        return `${base} bg-[#16171F] border-[#FC5A34]/30 text-[#FC5A34] font-extrabold`;
      }
      return `${base} bg-indigo-600/15 border-indigo-500/30 text-indigo-400 font-extrabold`;
    } else {
      if (theme === 'fuchsia-light') {
        return `${base} text-slate-400 hover:text-slate-100 hover:bg-[#151720]/80 border-transparent`;
      }
      return `${base} text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent`;
    }
  };

  const getActionBtnClass = () => {
    const padding = sidebarCollapsed ? 'justify-center p-2' : 'space-x-2 px-3 py-1.5';
    const base = `w-full flex items-center ${padding} text-left rounded-lg text-[11px] font-bold transition`;
    if (theme === 'fuchsia-light') {
      return `${base} text-slate-400 hover:text-slate-100 hover:bg-[#151720]/80`;
    }
    return `${base} text-slate-400 hover:text-slate-200 hover:bg-slate-900`;
  };

  return (
    <div id="sdv-app-root" className={`min-h-screen flex flex-col lg:flex-row font-sans selection:bg-indigo-600/30 selection:text-white transition-colors duration-200 ${theme === 'fuchsia-light' ? 'fuchsia-light bg-slate-950 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMsg && (
        <div id="global-toast" className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce-short">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MOBILE TOP NAVIGATION BAR */}
      <div className={`lg:hidden border-b p-4 sticky top-0 z-40 flex items-center justify-between ${theme === 'fuchsia-light' ? 'bg-[#0B0C10] border-[#151720]' : 'bg-slate-950 border-slate-800'}`}>
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-900 to-indigo-600 text-white shadow">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-slate-200 uppercase font-display">SDV Gate Control</h1>
            <p className="text-[9px] text-slate-500 font-sans font-medium">Enterprise Console</p>
          </div>
        </div>
        
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR MENU BAR (Responsive Desktop-First Sidebar) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 flex flex-col z-40 p-4 shrink-0 transition-all duration-300
        ${theme === 'fuchsia-light' ? 'bg-[#0B0C10] border-r border-[#151720]' : 'bg-slate-950 border-r border-slate-800'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        ${mobileSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}
      `}>
        
        {/* LOGO & BRAND */}
        <div className={`flex ${sidebarCollapsed ? 'flex-col items-center space-y-3' : 'items-center space-x-3'} mb-5 pb-4 border-b ${theme === 'fuchsia-light' ? 'border-[#151720]' : 'border-slate-800'} transition-all duration-300`}>
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-950 to-indigo-600 text-white shadow-lg shadow-indigo-600/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="transition-opacity duration-300">
              <div className="flex items-center space-x-1.5">
                <h1 className={`text-xs font-bold tracking-tight uppercase font-display ${theme === 'fuchsia-light' ? 'text-slate-100' : 'text-slate-200'}`}>SDV Vehicle</h1>
              </div>
              <p className="text-[10px] text-slate-500 font-sans font-medium">
                NOTIFICATION GATEWAY
              </p>
            </div>
          )}
        </div>

        {/* COLLAPSE/TOGGLE BUTTON */}
        <div className={`hidden lg:flex ${sidebarCollapsed ? 'justify-center' : 'justify-end'} mb-4`}>
          <button
            onClick={handleToggleSidebar}
            type="button"
            title={sidebarCollapsed ? "Switch to Full View" : "Switch to Icon View"}
            className={`p-1.5 rounded-lg border transition flex items-center space-x-1 text-[10px] font-mono font-bold ${
              theme === 'fuchsia-light'
                ? 'border-[#1C1E26] bg-[#07080B] text-slate-400 hover:text-indigo-400 hover:border-[#1C1E26]'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:border-slate-800'
            }`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-indigo-400" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 text-slate-500" />
                <span className="text-[9px] uppercase tracking-wider text-slate-500 px-1">Collapse Menu</span>
              </>
            )}
          </button>
        </div>

        {/* SCREEN NAVIGATION */}
        <div className="space-y-4 flex-1">
          <div>
            {!sidebarCollapsed ? (
              <span className="block text-[9px] font-bold text-slate-500 font-mono tracking-wider mb-2 uppercase px-2 transition-opacity duration-300">
                Platform Navigation
              </span>
            ) : (
              <div className={`h-px my-3 ${theme === 'fuchsia-light' ? 'bg-[#151720]' : 'bg-slate-900'}`} />
            )}
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveScreen('simulator'); setMobileSidebarOpen(false); }}
                title="Simulation Playground"
                className={getNavBtnClass('simulator')}
              >
                <Terminal className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Simulation Playground</span>}
              </button>

              <button
                onClick={() => { setActiveScreen('rules'); setMobileSidebarOpen(false); }}
                title="Rules Matrix Registry"
                className={getNavBtnClass('rules')}
              >
                <Cpu className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Rules Matrix Registry</span>}
              </button>

              <button
                onClick={() => { setActiveScreen('category_keys'); setMobileSidebarOpen(false); }}
                title="Category & Rule Keys"
                className={getNavBtnClass('category_keys')}
              >
                <Network className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Category & Rule Keys</span>}
              </button>

              <button
                onClick={() => { setActiveScreen('settings'); setMobileSidebarOpen(false); }}
                title="Gateway Controls"
                className={getNavBtnClass('settings')}
              >
                <Sliders className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Gateway Controls</span>}
              </button>

              <button
                onClick={() => { setActiveScreen('after_sales'); setMobileSidebarOpen(false); }}
                title="After-Sales & Maintenance"
                className={getNavBtnClass('after_sales')}
              >
                <Wrench className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">After-Sales & Shop</span>}
              </button>

              <button
                onClick={() => { setActiveScreen('scheduler'); setMobileSidebarOpen(false); }}
                title="Notification Schedulers"
                className={getNavBtnClass('scheduler')}
              >
                <Clock className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Proactive Schedulers</span>}
              </button>

              <button
                onClick={() => { setActiveScreen('i18n'); setMobileSidebarOpen(false); }}
                title="Locale & i18n Studio"
                className={getNavBtnClass('i18n')}
              >
                <Globe className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Locale & i18n Studio</span>}
              </button>
            </nav>
          </div>

          {/* QUICK CONTROLS AREA */}
          <div className={`pt-4 border-t ${theme === 'fuchsia-light' ? 'border-[#151720]' : 'border-slate-800'}`}>
            {!sidebarCollapsed ? (
              <span className="block text-[9px] font-bold text-slate-500 font-mono tracking-wider mb-2 uppercase px-2 transition-opacity duration-300">
                Registry Actions
              </span>
            ) : (
              <div className={`h-px my-3 ${theme === 'fuchsia-light' ? 'bg-[#151720]' : 'bg-slate-800'}`} />
            )}
            <div className="space-y-1.5">
              <button
                onClick={handleResetToDefaults}
                title="Reset Defaults"
                className={getActionBtnClass()}
              >
                <RotateCcw className="h-4 w-4 text-slate-500 shrink-0" />
                {!sidebarCollapsed && <span>Reset Defaults</span>}
              </button>

              <button
                onClick={handleExportConfig}
                title="Export Rules"
                className={getActionBtnClass()}
              >
                <FileDown className="h-4 w-4 text-slate-500 shrink-0" />
                {!sidebarCollapsed && <span>Export Rules</span>}
              </button>

              <label 
                title="Import Rules"
                className={`${getActionBtnClass()} cursor-pointer`}
              >
                <FileUp className="h-4 w-4 text-slate-500 shrink-0" />
                {!sidebarCollapsed && <span>Import Rules</span>}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="hidden"
                />
              </label>

              {activeScreen === 'rules' && (
                <button
                  onClick={handleCreateRuleTrigger}
                  title="Create New Rule"
                  className={`w-full flex items-center justify-center ${sidebarCollapsed ? 'p-2' : 'space-x-1.5 px-3 py-2'} bg-[#FC5A34] hover:bg-[#E04B28] text-white rounded-lg text-[11px] font-bold transition shadow`}
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>CREATE NEW RULE</span>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* METADATA SUMMARY */}
        <div className={`pt-4 border-t text-[10px] font-mono text-slate-600 space-y-1 ${theme === 'fuchsia-light' ? 'border-[#151720]' : 'border-slate-800'}`}>
          {sidebarCollapsed ? (
            <div className="text-center text-[9px] text-slate-500 font-mono">v2.4</div>
          ) : (
            <>
              <div className="flex justify-between">
                <span>PLATFORM PORT:</span>
                <span>3000</span>
              </div>
              <div className="flex justify-between">
                <span>VERSION:</span>
                <span>2.4.1</span>
              </div>
            </>
          )}
        </div>

      </aside>

      {/* MAIN SCREEN WORKSPACE CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 flex flex-col justify-between max-w-7xl">
        
        <div className="space-y-6">
          {/* TOP MENU BAR WITH PROFILE AND THEME TOGGLE */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold font-display uppercase tracking-widest text-slate-100">
                SDV Vehicle Notification Gateway
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                REGISTRY CONSOLE // {activeScreen.toUpperCase()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* THEME TOGGLE */}
              <button
                onClick={handleToggleTheme}
                title={theme === 'dark' ? "Switch to Coral Light Theme" : "Switch to Dark Theme"}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center shadow-lg relative group ${
                  theme === 'fuchsia-light' 
                    ? 'bg-white border-slate-200 hover:border-[#FC5A34] text-slate-500 hover:text-[#FC5A34]' 
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400'
                }`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-slate-500 animate-pulse" />
                )}
              </button>

              {/* PROFILE SECTION */}
              <div className={`flex items-center space-x-2 border rounded-xl px-3 py-1.5 shadow-sm ${
                theme === 'fuchsia-light' 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}>
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#FC5A34] to-amber-500 flex items-center justify-center text-white text-[10px] font-bold shadow-inner">
                  RC
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className={`text-[10px] font-bold leading-none ${theme === 'fuchsia-light' ? 'text-slate-800' : 'text-slate-200'}`}>Ravi Chouhan</span>
                  <span className="text-[8px] font-mono text-slate-500">usr_ravi_55</span>
                </div>
              </div>
            </div>
          </div>

          {/* STATS OVERVIEW GRID */}
          <StatsGrid rules={rules} logs={logs} />

          {/* ACTIVE SCREEN RENDERING LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SCREEN-SPECIFIC VIEWS */}
            <div className={`${(activeScreen === 'settings' || activeScreen === 'after_sales' || activeScreen === 'scheduler' || activeScreen === 'category_keys' || activeScreen === 'i18n') ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col space-y-4`}>
              
              {activeScreen === 'simulator' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                    <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                    <h2 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Simulation Playground Sandbox</h2>
                  </div>
                  
                  <Simulator 
                    rules={rules}
                    businessFilters={businessFilters}
                    userSettings={userSettings}
                    onAddLog={handleAddLog} 
                    activeRuleKeyFilter={activeRuleKeyFilter || undefined}
                  />
                </div>
              )}

              {activeScreen === 'rules' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                    <Cpu className="h-4.5 w-4.5 text-indigo-400" />
                    <h2 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Active Platform Ingestion Rules Matrix</h2>
                  </div>

                  <RulesList 
                    rules={rules}
                    categories={categories}
                    onToggleRule={handleToggleRule}
                    onEditRule={handleEditRuleTrigger}
                    onDeleteRule={handleDeleteRule}
                    onDuplicateRule={handleDuplicateRule}
                    onSelectRuleForTesting={handleSelectRuleForTesting}
                    onReCache={handleReCache}
                  />
                </div>
              )}

              {activeScreen === 'settings' && (
                <NotificationSettings
                  rules={rules}
                  businessFilters={businessFilters}
                  userSettings={userSettings}
                  categories={categories}
                  onAddBusinessFilter={handleAddBusinessFilter}
                  onToggleBusinessFilter={handleToggleBusinessFilter}
                  onDeleteBusinessFilter={handleDeleteBusinessFilter}
                  onAddUserSetting={handleAddUserSetting}
                  onToggleUserSetting={handleToggleUserSetting}
                  onDeleteUserSetting={handleDeleteUserSetting}
                />
              )}

              {activeScreen === 'after_sales' && (
                <div className="space-y-4">
                  <AfterSalesMaintenance
                    records={afterSalesRecords}
                    schedulers={schedulers}
                    onAddRecord={handleAddAfterSalesRecord}
                    onUpdateRecord={handleUpdateAfterSalesRecord}
                    onDeleteRecord={handleDeleteAfterSalesRecord}
                    onAddLog={handleAddLog}
                    triggerToast={triggerToast}
                  />
                </div>
              )}

              {activeScreen === 'scheduler' && (
                <div className="space-y-4">
                  <SchedulerConfig
                    schedulers={schedulers}
                    afterSalesRecords={afterSalesRecords}
                    rules={rules}
                    businessFilters={businessFilters}
                    userSettings={userSettings}
                    onAddScheduler={handleAddScheduler}
                    onUpdateScheduler={handleUpdateScheduler}
                    onDeleteScheduler={handleDeleteScheduler}
                    onAddLog={handleAddLog}
                    triggerToast={triggerToast}
                  />
                </div>
              )}

              {activeScreen === 'category_keys' && (
                <div className="space-y-4">
                  <CategoryKeyManager
                    categories={categories}
                    ruleKeys={ruleKeys}
                    rules={rules}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddRuleKey={handleAddRuleKey}
                    onUpdateRuleKey={handleUpdateRuleKey}
                    onDeleteRuleKey={handleDeleteRuleKey}
                    triggerToast={triggerToast}
                  />
                </div>
              )}

              {activeScreen === 'i18n' && (
                <div className="space-y-4">
                  <TranslationManager
                    rules={rules}
                    userSettings={userSettings}
                    onUpdateRule={(updatedRule) => {
                      const updated = rules.map(r => r.id === updatedRule.id ? updatedRule : r);
                      saveRulesToLocalStorage(updated);
                    }}
                    onUpdateUserSettings={saveUserSettingsToLocalStorage}
                    triggerToast={triggerToast}
                  />
                </div>
              )}



            </div>

            {/* SIDEBAR HISTORICAL AUDIT LOGS (Only visible in Simulation & Rules views) */}
            {(activeScreen !== 'settings' && activeScreen !== 'after_sales' && activeScreen !== 'scheduler' && activeScreen !== 'category_keys' && activeScreen !== 'i18n') && (
              <div className="lg:col-span-4">
                <AuditLog 
                  logs={logs} 
                  onLoadLogIntoSimulator={handleLoadLog} 
                  onClearLogs={handleClearLogs} 
                />
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 pt-6 mt-12 text-slate-600 text-[10px] font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>SDV GATEWAY SYSTEM // SECURE ENVELOPE: PASS</span>
          <span>© 2026 AUTOMOTIVE EDGE NETWORKS</span>
        </footer>

      </main>

      {/* OVERLAY SLIDE-OVER MODALS */}
      <RuleFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setRuleToEdit(null);
        }}
        onSave={handleSaveRule}
        ruleToEdit={ruleToEdit}
        categories={categories}
        ruleKeys={ruleKeys}
      />

    </div>
  );
}

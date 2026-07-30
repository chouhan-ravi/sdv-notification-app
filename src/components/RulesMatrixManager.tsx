/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Rule, DynamicCategory } from '../types';
import { CATEGORIES } from '../lib/defaultFilters';
import { 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Settings, 
  Layers, 
  AlertTriangle,
  Play,
  Network,
  Check,
  RefreshCw,
  FileCode,
  ShieldAlert
} from 'lucide-react';

interface RulesListProps {
  rules: Rule[];
  categories?: DynamicCategory[];
  onToggleRule: (id: string) => void;
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (id: string) => void;
  onDuplicateRule: (rule: Rule) => void;
  onSelectRuleForTesting: (rule: Rule) => void;
  onReCache?: () => Promise<void>;
}

export default function RulesList({
  rules,
  categories = [],
  onToggleRule,
  onEditRule,
  onDeleteRule,
  onDuplicateRule,
  onSelectRuleForTesting,
  onReCache
}: RulesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedRuleIds, setExpandedRuleIds] = useState<Record<string, boolean>>({});
  const [showMatrix, setShowMatrix] = useState(false);
  const [isReCaching, setIsReCaching] = useState(false);
  const [reCachingRuleId, setReCachingRuleId] = useState<string | null>(null);
  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);

  const handleRuleReCache = async (ruleId: string) => {
    if (onReCache) {
      setReCachingRuleId(ruleId);
      try {
        await onReCache();
      } catch (err) {
        console.error('Re-cache error:', err);
      } finally {
        setReCachingRuleId(null);
      }
    }
  };

  const handleReCacheClick = async () => {
    if (onReCache) {
      setIsReCaching(true);
      try {
        await onReCache();
      } catch (err) {
        console.error('Re-cache error:', err);
      } finally {
        setIsReCaching(false);
      }
    }
  };

  const activeCategories = categories && categories.length > 0 
    ? categories 
    : CATEGORIES.map(c => ({ key: c.key, name: c.name, enabled: true, iconName: 'Layers' }));

  const toggleExpand = (id: string) => {
    setExpandedRuleIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Collect unique categories & notification keys from rules configs
  const allConfigs = rules.flatMap(r => r.config || []);
  const uniqueCategories = Array.from(new Set(allConfigs.map(c => c.notificationCategory)));
  const uniqueNotificationKeys = Array.from(new Set(allConfigs.map(c => c.notificationKey)));

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const configs = rule.config || [];
    const matchesSearch = 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      configs.some(c => 
        c.notificationCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.notificationKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCriticality = selectedCriticality === 'ALL' || 
      configs.some(c => c.criticality === selectedCriticality);

    const matchesCategory = selectedCategory === 'ALL' || 
      configs.some(c => c.notificationCategory === selectedCategory);

    return matchesSearch && matchesCriticality && matchesCategory;
  });

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/40';
      case 'MAJOR':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'MINOR':
        return 'bg-yellow-950/60 text-yellow-400 border-yellow-500/40';
      case 'INFO':
      default:
        return 'bg-blue-950/60 text-blue-400 border-blue-500/40';
    }
  };

  const handleCopyJson = (rule: Rule) => {
    const jsonStr = JSON.stringify(rule, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedRuleId(rule.id);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  return (
    <div id="rules-list-container" className="space-y-4">
      
      {/* RELATIONSHIP MATRIX BOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900/60 transition text-left"
          type="button"
        >
          <div className="flex items-center space-x-2">
            <Network className="h-4.5 w-4.5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide">Notification Category ↔ Key Matrix Registry</h3>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Explore configured rules, condition groups, and output templates</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/35 px-2 py-0.5 rounded-md uppercase">
              {showMatrix ? "Hide Matrix" : "Show Matrix"}
            </span>
            {showMatrix ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {showMatrix && (
          <div className="p-5 border-t border-slate-850 bg-slate-900/50 space-y-4 animate-fade-in">
            <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/20">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-4 font-semibold min-w-[200px]">Notification Key</th>
                    {uniqueCategories.map((cat) => (
                      <th key={cat} className="p-3 text-center font-semibold whitespace-nowrap">
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans">
                  {uniqueNotificationKeys.map((key) => (
                    <tr key={key} className="hover:bg-slate-850/25 transition duration-150">
                      <td className="p-3 pl-4 font-mono font-bold text-slate-300">
                        🔑 {key}
                      </td>
                      {uniqueCategories.map((cat) => {
                        const isMapped = rules.some(r => (r.config || []).some(c => c.notificationKey === key && c.notificationCategory === cat));
                        return (
                          <td key={cat} className="p-3 text-center">
                            {isMapped ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setSearchTerm(key);
                                }}
                                className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950/40 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                title={`Filter by ${key} under ${cat}`}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-slate-800" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="rule-search-input"
            type="text"
            placeholder="Search rule ID, name, category, or key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition duration-250 font-sans"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Criticality Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <select
              id="criticality-filter"
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Criticalities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="MAJOR">MAJOR</option>
              <option value="MINOR">MINOR</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
            <Layers className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[200px]"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RE-CACHE ACTION BANNER */}
      {onReCache && (
        <div id="re-cache-banner" className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isReCaching ? 'bg-indigo-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isReCaching ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
            </span>
            <div className="text-center sm:text-left">
              <h4 className="text-[10px] font-bold font-mono text-slate-300 uppercase tracking-wider">RULE ENGINE SYNC AGENT</h4>
              <p className="text-[10px] text-slate-500 font-sans">Reload backend JSON rules database and refresh cache</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isReCaching}
            onClick={handleReCacheClick}
            className={`w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition duration-200 border ${
              isReCaching 
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600/10 hover:bg-indigo-600/20 border-indigo-500/30 hover:border-indigo-500/50 text-indigo-400 active:scale-95'
            }`}
          >
            {isReCaching ? (
              <>
                <span className="animate-spin inline-block h-3 w-3 border-2 border-indigo-400 border-t-transparent rounded-full" />
                <span>RE-CACHING...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-pulse" />
                <span>HOT RE-CACHE ALL RULES</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Rules Count Feedback */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-mono text-slate-400">
          Showing {filteredRules.length} of {rules.length} Configured Rules
        </span>
      </div>

      {/* Grid of Rules */}
      {filteredRules.length === 0 ? (
        <div id="no-rules-found" className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-8 text-center">
          <Info className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-300 font-medium font-sans">No matching rules found</p>
          <p className="text-slate-500 text-xs font-sans mt-1">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRules.map(rule => {
            const isExpanded = !!expandedRuleIds[rule.id];
            const primaryConfig = rule.config?.[0];

            return (
              <div 
                key={rule.id}
                id={`rule-card-${rule.id}`}
                className={`bg-slate-900 border rounded-xl overflow-hidden shadow-md transition-all duration-200 ${
                  rule.enabled 
                    ? 'border-slate-800 opacity-100 hover:border-slate-700' 
                    : 'border-slate-800/50 opacity-60'
                }`}
              >
                {/* Header Accent Line */}
                <div className={`h-1 w-full ${
                  primaryConfig?.criticality === 'CRITICAL' ? 'bg-rose-500' :
                  primaryConfig?.criticality === 'MAJOR' ? 'bg-amber-500' :
                  primaryConfig?.criticality === 'MINOR' ? 'bg-yellow-500' : 'bg-indigo-500'
                }`} />

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                          ID: {rule.id}
                        </span>
                        {primaryConfig && (
                          <>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getCriticalityBadge(primaryConfig.criticality)}`}>
                              {primaryConfig.criticality}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              CAT: {primaryConfig.notificationCategory}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-bold">
                              KEY: {primaryConfig.notificationKey}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-100 font-display">{rule.name}</h3>
                      </div>

                      <p className="text-xs text-slate-400 font-sans leading-relaxed">{rule.description}</p>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-4 lg:self-center self-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                      
                      {/* Toggle Enable */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-slate-400">
                          {rule.enabled ? 'Active' : 'Muted'}
                        </span>
                        <button
                          id={`toggle-rule-${rule.id}`}
                          onClick={() => onToggleRule(rule.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            rule.enabled ? 'bg-emerald-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              rule.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Control Action Buttons */}
                      <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-3">
                        <button
                          id={`copy-json-${rule.id}`}
                          onClick={() => handleCopyJson(rule)}
                          title="Copy JSON Representation"
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-950 hover:bg-slate-850 transition duration-150 border border-slate-850 flex items-center space-x-1"
                        >
                          <FileCode className="h-3.5 w-3.5" />
                          {copiedRuleId === rule.id && <span className="text-[9px] font-mono text-emerald-400">COPIED</span>}
                        </button>

                        <button
                          id={`duplicate-rule-${rule.id}`}
                          onClick={() => onDuplicateRule(rule)}
                          title="Duplicate Rule"
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-950 hover:bg-slate-850 transition duration-150 border border-slate-850"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`recache-rule-${rule.id}`}
                          onClick={() => handleRuleReCache(rule.id)}
                          disabled={reCachingRuleId === rule.id}
                          title="Re-cache Rule"
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 rounded-lg bg-slate-950 hover:bg-indigo-950/40 transition duration-150 border border-slate-850 flex items-center space-x-1"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${reCachingRuleId === rule.id ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>

                        <button
                          id={`edit-rule-${rule.id}`}
                          onClick={() => onEditRule(rule)}
                          title="Edit Rule"
                          className="p-1.5 text-blue-400 hover:text-blue-300 rounded-lg bg-slate-950 hover:bg-slate-850 transition duration-150 border border-slate-850"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`delete-rule-${rule.id}`}
                          onClick={() => onDeleteRule(rule.id)}
                          title="Delete Rule"
                          className="p-1.5 text-rose-500 hover:text-rose-400 rounded-lg bg-slate-950 hover:bg-slate-850 transition duration-150 border border-slate-850"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`quick-test-${rule.id}`}
                          onClick={() => onSelectRuleForTesting(rule)}
                          title="Test in Simulator"
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg bg-slate-950 hover:bg-emerald-950/40 transition duration-150 border border-slate-850 flex items-center space-x-1"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span className="text-[9px] font-bold font-mono">TEST</span>
                        </button>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(rule.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition duration-150"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Config Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
                      <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center">
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        Rule Configuration Items ({rule.config?.length || 0})
                      </h4>

                      {(rule.config || []).map((cfg, cfgIdx) => (
                        <div key={cfg.id || cfgIdx} className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold font-mono text-slate-300">Config ID: {cfg.id}</span>
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${getCriticalityBadge(cfg.criticality)}`}>
                                {cfg.criticality}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 space-x-2">
                              <span>Category: <strong className="text-slate-200">{cfg.notificationCategory}</strong></span>
                              <span>Key: <strong className="text-emerald-400">{cfg.notificationKey}</strong></span>
                            </div>
                          </div>

                          {/* Conditions */}
                          <div>
                            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1.5">
                              Condition Groups
                            </span>
                            <div className="space-y-2">
                              {(cfg.conditions || []).map((grp, gIdx) => {
                                const groupType = grp.and ? 'AND' : 'OR';
                                const items = grp.and || grp.or || [];
                                return (
                                  <div key={gIdx} className="bg-slate-900/80 border border-slate-850/60 rounded-lg p-2.5 space-y-1.5">
                                    <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50">
                                      {groupType} Group ({items.length} conditions)
                                    </span>
                                    <div className="space-y-1 pt-1">
                                      {items.map((c, cIdx) => (
                                        <div key={c.id || cIdx} className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded border border-slate-850">
                                          <span className="text-slate-400 font-semibold">{c.fieldPath}</span>
                                          <span className="text-indigo-400 font-bold uppercase">{c.operator}</span>
                                          <span className="text-emerald-400 font-mono">"{c.value}"</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Notification Template */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Title Template</span>
                              <div className="bg-slate-900 p-2 rounded text-xs font-mono text-slate-200 border border-slate-850">
                                {cfg.notificationTemplate?.title}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Body Template</span>
                              <div className="bg-slate-900 p-2 rounded text-xs font-mono text-slate-200 border border-slate-850">
                                {cfg.notificationTemplate?.body}
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          {cfg.metadata && cfg.metadata.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase block mb-1">Metadata Enrichments</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {cfg.metadata.map((m, mIdx) => (
                                  <div key={mIdx} className="flex justify-between items-center bg-slate-900 px-2.5 py-1 rounded text-xs font-mono border border-slate-850">
                                    <span className="text-slate-400">{m.key}:</span>
                                    <span className="text-slate-200 font-semibold">{m.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      ))}

                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

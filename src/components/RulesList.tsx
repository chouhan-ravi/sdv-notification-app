/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Rule, RuleCondition, DynamicCategory } from '../types';
import { CATEGORIES } from '../lib/defaultFilters';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  Info, 
  Settings, 
  Layers, 
  AlertTriangle,
  Play,
  Network,
  Link2,
  Check,
  RefreshCw
} from 'lucide-react';

interface RulesListProps {
  rules: Rule[];
  categories?: DynamicCategory[];
  onToggleRule: (id: string) => void;
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (id: string) => void;
  onDuplicateRule: (rule: Rule) => void;
  onSelectRuleForTesting: (rule: Rule) => void; // Quick-link to copy rule-key or load a test payload matching it
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

  // Fallback to static CATEGORIES if no categories passed or state is empty
  const activeCategories = categories && categories.length > 0 
    ? categories 
    : CATEGORIES.map(c => ({ key: c.key, name: c.name, enabled: true, iconName: 'Layers' }));

  // Toggle expand/collapse card
  const toggleExpand = (id: string) => {
    setExpandedRuleIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get list of unique categories dynamically
  const uniqueCategories = Array.from(new Set(rules.map(r => r.categoryKey)));

  // Filter rules based on searches and dropdowns
  const filteredRules = rules.filter(rule => {
    const matchesSearch = 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.ruleKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCriticality = 
      selectedCriticality === 'ALL' || rule.criticality === selectedCriticality;

    const matchesCategory = 
      selectedCategory === 'ALL' || rule.categoryKey === selectedCategory;

    return matchesSearch && matchesCriticality && matchesCategory;
  });

  const getCriticalityStyles = (criticality: Rule['criticality']) => {
    switch (criticality) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/20 text-rose-400 border-rose-500/30',
          badge: 'bg-rose-950 text-rose-400 border-rose-500/40',
          dot: 'bg-rose-500'
        };
      case 'MAJOR':
        return {
          bg: 'bg-amber-950/20 text-amber-400 border-amber-500/30',
          badge: 'bg-amber-950 text-amber-400 border-amber-500/40',
          dot: 'bg-amber-500'
        };
      case 'MINOR':
        return {
          bg: 'bg-yellow-950/20 text-yellow-400 border-yellow-500/30',
          badge: 'bg-yellow-950 text-yellow-400 border-yellow-500/40',
          dot: 'bg-yellow-500'
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-blue-950/20 text-blue-400 border-blue-500/30',
          badge: 'bg-blue-950 text-blue-400 border-blue-500/40',
          dot: 'bg-blue-400'
        };
    }
  };

  const formatOperator = (operator: string) => {
    return operator.replace('_', ' ').toUpperCase();
  };

  const uniqueRuleKeys = Array.from(new Set(rules.map(r => r.ruleKey)));

  const handleMatrixCellClick = (catKey: string, rKey: string) => {
    setSelectedCategory(catKey);
    setSearchTerm(rKey);
  };

  return (
    <div id="rules-list-container" className="space-y-4">
      
      {/* COLLAPSIBLE RELATIONSHIP MATRIX BOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900/60 transition text-left"
          type="button"
        >
          <div className="flex items-center space-x-2">
            <Network className="h-4.5 w-4.5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wide">Category ↔ Rule Key Relationship Matrix</h3>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Explore the many-to-many mappings configured across the Connected Gateway</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/35 px-2 py-0.5 rounded-md uppercase">
              {showMatrix ? "Hide Mapping Matrix" : "Show Mapping Matrix"}
            </span>
            {showMatrix ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {showMatrix && (
          <div className="p-5 border-t border-slate-850 bg-slate-900/50 space-y-4 animate-fade-in">
            <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-xs text-slate-400 leading-relaxed font-sans flex items-start space-x-2.5">
              <Link2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-300 font-semibold">Many-to-Many Architecture:</span> A single alert category (columns) can evaluate multiple independent rules. Similarly, a single rule key (rows) can be associated with multiple categories to provide highly modular muting and telemetry policies. 
                <p className="mt-1 text-[11px] text-slate-500 italic">💡 Click on any active connector checkmark ( <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-400 text-[9px]"><Check className="h-2 w-2" /></span> ) to automatically filter the rules registry below to that rule key and category.</p>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/20">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-4 font-semibold min-w-[240px]">Rule Key Pattern</th>
                    {activeCategories.map((cat) => {
                      const shortName = cat.name.includes(' ') 
                        ? cat.name.split(' ').slice(1).join(' ').replace('Alerts', '').replace('Vehicle', '').trim()
                        : cat.name;
                      return (
                        <th key={cat.key} className={`p-3 text-center font-semibold whitespace-nowrap ${!cat.enabled ? 'text-slate-600 line-through' : ''}`} title={`${cat.name}${!cat.enabled ? ' (Disabled)' : ''}`}>
                          {shortName}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans">
                  {uniqueRuleKeys.map((ruleKey) => {
                    return (
                      <tr key={ruleKey} className="hover:bg-slate-850/25 transition duration-150">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-300">
                          🔑 {ruleKey}
                        </td>
                        {activeCategories.map((cat) => {
                          // Check if there is an active mapping
                          const isMapped = rules.some(r => r.ruleKey === ruleKey && r.categoryKey === cat.key);
                          return (
                            <td key={cat.key} className="p-3 text-center">
                              {isMapped ? (
                                <button
                                  type="button"
                                  onClick={() => handleMatrixCellClick(cat.key, ruleKey)}
                                  className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full transition shadow-sm ${
                                    !cat.enabled 
                                      ? 'bg-slate-900 border border-slate-700 text-slate-500 hover:bg-slate-800'
                                      : 'bg-indigo-950/40 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                                  }`}
                                  title={!cat.enabled ? `MAPPED [${ruleKey}] under DISABLED Category [${cat.key}]` : `Click to filter: [${ruleKey}] under [${cat.key}]`}
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              ) : (
                                <span className={`mx-auto block h-1.5 w-1.5 rounded-full ${!cat.enabled ? 'bg-slate-900' : 'bg-slate-800'}`} />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
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
            placeholder="Search rules, key patterns or description..."
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
              <option value="ALL">All Severities</option>
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
              <h4 className="text-[10px] font-bold font-mono text-slate-300 uppercase tracking-wider">GATEWAY RULE SYNC AGENT</h4>
              <p className="text-[10px] text-slate-500 font-sans">Force a hot cache reload to instantly propagate active platform rules</p>
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
                <span>RE-CACHING GATEWAY...</span>
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
            const visual = getCriticalityStyles(rule.criticality);

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
                {/* Header Strip */}
                <div className={`h-1 w-full ${
                  rule.criticality === 'CRITICAL' ? 'bg-rose-500' :
                  rule.criticality === 'MAJOR' ? 'bg-amber-500' :
                  rule.criticality === 'MINOR' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />

                {/* Main Content Area */}
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Rule Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${visual.badge}`}>
                          {rule.criticality}
                        </span>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-850">
                          {rule.categoryKey}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-850 ${
                          rule.priority === 'high' ? 'text-red-400' : rule.priority === 'normal' ? 'text-slate-300' : 'text-slate-400'
                        }`}>
                          PRIORITY: {rule.priority.toUpperCase()}
                        </span>
                        {rule.MessageType && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-950/40 text-indigo-400 border border-indigo-900/40">
                            MSG: {rule.MessageType.toUpperCase()}
                          </span>
                        )}
                        {rule.NotificationType && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-950/40 text-purple-400 border border-purple-900/40">
                            NOTIF: {rule.NotificationType.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-100 font-display">{rule.name}</h3>
                        <span className="text-xs font-mono text-slate-500">({rule.ruleKey})</span>
                      </div>

                      <p className="text-xs text-slate-400 font-sans leading-relaxed">{rule.description}</p>
                    </div>

                    {/* Right: Actions / Toggles */}
                    <div className="flex items-center space-x-4 lg:self-center self-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                      {/* Active Toggle */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-slate-400">
                          {rule.enabled ? 'Enabled' : 'Disabled'}
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

                      {/* Control Actions */}
                      <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-3">
                        <button
                          id={`duplicate-rule-${rule.id}`}
                          onClick={() => onDuplicateRule(rule)}
                          title="Duplicate Rule"
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-950 hover:bg-slate-850 transition duration-150 border border-slate-850"
                        >
                          <Copy className="h-3.5 w-3.5" />
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
                          title="Quick Test this Rule Key"
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

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
                      {/* Conditions */}
                      <div>
                        <h4 className="text-xs font-bold font-mono text-slate-300 mb-2 flex items-center">
                          <Settings className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          MATCHING ACCEPTANCE CRITERIA (AND)
                        </h4>
                        <div className="space-y-1.5 bg-slate-950 border border-slate-850 rounded-lg p-3">
                          {rule.conditions.length === 0 ? (
                            <span className="text-xs text-slate-500 font-sans">No matching conditions specified (runs for all triggers)</span>
                          ) : (
                            rule.conditions.map((cond, idx) => (
                              <div key={cond.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono py-1 border-b border-slate-900 last:border-0 gap-1.5">
                                <span className="text-slate-400 font-semibold break-all">{cond.fieldPath}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-indigo-400 font-semibold bg-indigo-950/35 px-1.5 py-0.5 rounded border border-indigo-900/40">
                                    {formatOperator(cond.operator)}
                                  </span>
                                  {cond.operator !== 'exists' && cond.operator !== 'not_exists' && (
                                    <span className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-medium">
                                      "{cond.value}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Notification Template */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold font-mono text-slate-300 mb-1.5">
                            PUSH TITLE TEMPLATE
                          </h4>
                          <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs font-mono text-slate-200">
                            {rule.notificationTitle || <span className="text-slate-600">None</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold font-mono text-slate-300 mb-1.5">
                            PUSH SOUND
                          </h4>
                          <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs font-mono text-slate-400">
                            🔊 {rule.sound || 'default'}
                          </div>
                        </div>
                      </div>

                      {/* Message Type & Notification Type Details */}
                      {(rule.MessageType || rule.NotificationType) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-bold font-mono text-slate-300 mb-1.5">
                              MESSAGE TYPE
                            </h4>
                            <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs font-mono text-indigo-400">
                              {rule.MessageType || <span className="text-slate-600">Not specified</span>}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold font-mono text-slate-300 mb-1.5">
                              NOTIFICATION TYPE
                            </h4>
                            <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs font-mono text-purple-400">
                              {rule.NotificationType || <span className="text-slate-600">Not specified</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-bold font-mono text-slate-300 mb-1.5">
                          PUSH BODY TEMPLATE
                        </h4>
                        <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs font-mono text-slate-200 leading-relaxed">
                          {rule.notificationBody || <span className="text-slate-600">None</span>}
                        </div>
                      </div>

                      {/* Data Metadata Enrichment */}
                      {rule.dataMetadata && rule.dataMetadata.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold font-mono text-slate-300 mb-1.5">
                            ENRICHED DATA ATTRIBUTES
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rule.dataMetadata.map((meta, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs font-mono">
                                <span className="text-slate-500 font-semibold">{meta.key}</span>
                                <span className="text-slate-300 truncate max-w-[200px]" title={meta.value}>
                                  {meta.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

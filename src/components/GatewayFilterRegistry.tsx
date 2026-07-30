/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BusinessFilter, CarOwnerSetting, Rule, DynamicCategory } from '../types';
import { CATEGORIES } from '../lib/defaultFilters';
import { 
  Plus, 
  Trash2, 
  ShieldAlert, 
  UserCheck, 
  ToggleLeft, 
  ToggleRight, 
  Globe, 
  Sliders, 
  Car, 
  Layers, 
  Settings, 
  Check, 
  Search, 
  Info,
  Calendar,
  Fuel,
  MapPin,
  Lock,
  Key
} from 'lucide-react';

interface NotificationSettingsProps {
  rules: Rule[];
  businessFilters: BusinessFilter[];
  userSettings: CarOwnerSetting[];
  categories?: DynamicCategory[];
  onAddBusinessFilter: (filter: BusinessFilter) => void;
  onToggleBusinessFilter: (id: string) => void;
  onDeleteBusinessFilter: (id: string) => void;
  onAddUserSetting: (setting: CarOwnerSetting) => void;
  onToggleUserSetting: (id: string) => void;
  onDeleteUserSetting: (id: string) => void;
}

export default function NotificationSettings({
  rules,
  businessFilters,
  userSettings,
  categories = [],
  onAddBusinessFilter,
  onToggleBusinessFilter,
  onDeleteBusinessFilter,
  onAddUserSetting,
  onToggleUserSetting,
  onDeleteUserSetting
}: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'owner'>('business');

  // Fallback to static CATEGORIES if no categories passed or state is empty
  const activeCategories = categories && categories.length > 0 
    ? categories 
    : CATEGORIES.map(c => ({ key: c.key, name: c.name, enabled: true, iconName: 'Layers' }));
  
  // Business Filter Form States
  const [bfName, setBfName] = useState('');
  const [bfDesc, setBfDesc] = useState('');
  const [bfCategory, setBfCategory] = useState('All');
  const [bfRuleKey, setBfRuleKey] = useState('All');
  const [bfCssGen, setBfCssGen] = useState('All');
  const [bfModel, setBfModel] = useState('All');
  const [bfYearStart, setBfYearStart] = useState(2020);
  const [bfYearEnd, setBfYearEnd] = useState(2027);
  const [bfVehicleType, setBfVehicleType] = useState('EV');
  const [bfRegion, setBfRegion] = useState('US');
  const [bfShowForm, setBfShowForm] = useState(false);

  // User Setting Form States
  const [cosUserId, setCosUserId] = useState('');
  const [cosVin, setCosVin] = useState('');
  const [cosCategory, setCosCategory] = useState(CATEGORIES[0].key);
  const [cosRuleKey, setCosRuleKey] = useState('All');
  const [cosEnabled, setCosEnabled] = useState(false); // Default to false (meaning opt-out/blocked)
  const [cosShowForm, setCosShowForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Submit Business Filter
  const handleCreateBusinessFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bfName.trim()) return;

    const newFilter: BusinessFilter = {
      id: `bf_${Math.random().toString(36).substring(2, 9)}`,
      name: bfName,
      description: bfDesc || 'Custom corporate suppression policy.',
      notificationCategory: bfCategory,
      notificationKey: bfRuleKey,
      cssGen: bfCssGen,
      vehicleModel: bfModel,
      yearStart: Number(bfYearStart),
      yearEnd: Number(bfYearEnd),
      vehicleType: bfVehicleType as any,
      region: bfRegion,
      enabled: true,
      action: 'BLOCK'
    };

    onAddBusinessFilter(newFilter);
    
    // Reset Form
    setBfName('');
    setBfDesc('');
    setBfCategory('All');
    setBfRuleKey('All');
    setBfShowForm(false);
  };

  // Submit User Settings
  const handleCreateUserSetting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cosUserId.trim() || !cosVin.trim()) return;

    const newSetting: CarOwnerSetting = {
      id: `cos_${Math.random().toString(36).substring(2, 9)}`,
      userId: cosUserId.trim(),
      vin: cosVin.trim().toUpperCase(),
      notificationCategory: cosCategory,
      notificationKey: cosRuleKey,
      enabled: cosEnabled
    };

    onAddUserSetting(newSetting);

    // Reset Form
    setCosUserId('');
    setCosVin('');
    setCosRuleKey('All');
    setCosShowForm(false);
  };

  // Filter lists based on query
  const filteredBF = businessFilters.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.notificationCategory || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCOS = userSettings.filter(s => 
    s.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.notificationCategory || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title & Pitch */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 font-display uppercase tracking-wide flex items-center">
              <Sliders className="h-5 w-5 text-indigo-400 mr-2 shrink-0" />
              Gateway Filter & Opt-Out Registry
            </h2>
            <p className="text-slate-400 text-xs font-sans max-w-2xl leading-relaxed">
              Manage corporate regional blocking policies (e.g. US Plug-n-Charge halts) alongside individual subscriber privacy settings. These filters intercept matched alerts at the edge before push payload dispatch.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-850 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Filters Evaluated: ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0">
          <button
            onClick={() => { setActiveTab('business'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 uppercase tracking-wide flex items-center ${
              activeTab === 'business'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4 mr-2" />
            Corporate Ingress Rules ({businessFilters.length})
          </button>
          
          <button
            onClick={() => { setActiveTab('owner'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 uppercase tracking-wide flex items-center ${
              activeTab === 'owner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Owner Opt-Out Mutes ({userSettings.length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={activeTab === 'business' ? "Search ingress rules..." : "Search owner user IDs or VINs..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-600 font-sans"
          />
        </div>
      </div>

      {/* TAB 1: BUSINESS FILTERS (Corporate Block Policies) */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Rules List (Left 7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center">
                <ShieldAlert className="h-4 w-4 text-amber-500 mr-2" />
                Active Suppression Directives
              </h3>
              
              {!bfShowForm && (
                <button
                  onClick={() => setBfShowForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ADD DIRECTIVE</span>
                </button>
              )}
            </div>

            {filteredBF.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500">
                <Info className="h-7 w-7 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-400 uppercase">No Directives Found</div>
                <p className="text-[11px] text-slate-500 mt-1">No matching suppression rules exist. Click "Add Directive" to deploy a regional / model-year block filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBF.map((filter) => {
                  const cat = CATEGORIES.find(c => c.key === filter.notificationCategory);
                  return (
                    <div 
                      key={filter.id}
                      className={`bg-slate-900 border rounded-2xl p-4 shadow-md transition duration-200 ${
                        filter.enabled 
                          ? 'border-slate-800 hover:border-slate-700' 
                          : 'border-slate-850 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-200 font-sans leading-tight">
                              {filter.name}
                            </h4>
                            <span className="text-[9px] font-mono bg-red-950 border border-red-900 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              {filter.action}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                            {filter.description}
                          </p>
                          {filter.notificationKey && filter.notificationKey !== 'All' && (
                            <div className="mt-2 inline-flex items-center space-x-1 text-[10px] text-amber-400 font-mono font-medium bg-amber-950/40 border border-amber-900/30 px-2.5 py-0.5 rounded-lg">
                              <Key className="h-3 w-3 text-amber-400" />
                              <span>Muted Notification Key: {filter.notificationKey}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => onToggleBusinessFilter(filter.id)}
                            title={filter.enabled ? "Disable Rule" : "Enable Rule"}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition"
                          >
                            {filter.enabled ? (
                              <ToggleRight className="h-5 w-5 text-indigo-400" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-slate-600" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => onDeleteBusinessFilter(filter.id)}
                            title="Delete Policy"
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Criteria Tags Grid */}
                      <div className="mt-3 pt-3 border-t border-slate-850/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850 truncate" title={cat?.name || filter.notificationCategory}>
                          <span className="text-slate-600 font-bold block uppercase text-[8px]">Notification Category</span>
                          <span className="text-indigo-400 font-medium">{filter.notificationCategory}</span>
                        </div>
                        
                        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                          <span className="text-slate-600 font-bold block uppercase text-[8px]">Region Limit</span>
                          <span className="text-slate-300 font-medium flex items-center">
                            <MapPin className="h-3 w-3 mr-0.5 text-slate-500" />
                            {filter.region === 'All' ? '🌐 ALL REGIONS' : `📍 ${filter.region}`}
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                          <span className="text-slate-600 font-bold block uppercase text-[8px]">Propulsion</span>
                          <span className="text-slate-300 font-medium">
                            {filter.vehicleType === 'All' ? '⚡/⛽ ALL TYPES' : `🚗 ${filter.vehicleType}`}
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                          <span className="text-slate-600 font-bold block uppercase text-[8px]">Model / Year</span>
                          <span className="text-slate-300 font-medium truncate block">
                            {filter.vehicleModel === 'All' ? 'ALL MODELS' : filter.vehicleModel} • {filter.yearStart}-{filter.yearEnd}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Directive Form (Right 5 Columns) */}
          <div className="lg:col-span-5">
            {bfShowForm ? (
              <form onSubmit={handleCreateBusinessFilter} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-200 font-display uppercase tracking-wide flex items-center">
                    <Sliders className="h-4 w-4 text-indigo-400 mr-2" />
                    Deploy Block Filter
                  </h3>
                  <button
                    type="button"
                    onClick={() => setBfShowForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    CANCEL
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Policy Rule Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bfName}
                      onChange={(e) => setBfName(e.target.value)}
                      placeholder="e.g., Suppress Plug-n-Charge US EV"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Detailed Justification / Description
                    </label>
                    <textarea
                      value={bfDesc}
                      onChange={(e) => setBfDesc(e.target.value)}
                      placeholder="Enter legal or engineering explanation for silencing alerts..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-600 font-sans resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                        Notification Category
                      </label>
                      <select
                        value={bfCategory}
                        onChange={(e) => {
                          setBfCategory(e.target.value);
                          setBfRuleKey('All');
                        }}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none font-sans"
                      >
                        <option value="All">All Categories (Global)</option>
                        {activeCategories.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.name.includes(' ') ? cat.name.split(' ').slice(1).join(' ') : cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                        Region Limits
                      </label>
                      <select
                        value={bfRegion}
                        onChange={(e) => setBfRegion(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none font-sans"
                      >
                        <option value="All">All Regions (Global)</option>
                        <option value="US">US (United States)</option>
                        <option value="EU">EU (Europe)</option>
                        <option value="JP">JP (Japan)</option>
                        <option value="CN">CN (China)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Notification Key Restriction
                    </label>
                    <select
                      value={bfRuleKey}
                      onChange={(e) => setBfRuleKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none font-sans font-mono text-[11px]"
                    >
                      <option value="All">All Keys {bfCategory !== 'All' ? 'in Category' : 'Globally'}</option>
                      {Array.from(new Set(
                        bfCategory === 'All' 
                          ? rules.map(r => r.notificationKey || r.config[0]?.notificationKey)
                          : rules.filter(r => (r.notificationCategory || r.config[0]?.notificationCategory) === bfCategory).map(r => r.notificationKey || r.config[0]?.notificationKey)
                      )).filter(Boolean).map((nk) => {
                        const matchedRule = rules.find(r => (r.notificationKey || r.config[0]?.notificationKey) === nk);
                        return (
                          <option key={nk} value={nk}>
                            🔑 {nk} ({matchedRule?.name || ''})
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[9px] text-slate-500 mt-1 italic font-sans">
                      Select a precise Notification Key to apply the corporate block to, or choose "All Rules" for full-category suppression.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">
                        Propulsion
                      </label>
                      <select
                        value={bfVehicleType}
                        onChange={(e) => setBfVehicleType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none font-sans"
                      >
                        <option value="All">All Powertrains</option>
                        <option value="EV">EV Only</option>
                        <option value="ICE">ICE Only</option>
                        <option value="PHEV">PHEV Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">
                        CSS Gen
                      </label>
                      <select
                        value={bfCssGen}
                        onChange={(e) => setBfCssGen(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none font-sans"
                      >
                        <option value="All">All Gens</option>
                        <option value="Gen 5">Gen 5</option>
                        <option value="Gen 6">Gen 6</option>
                        <option value="Gen 7">Gen 7</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">
                        Vehicle Model
                      </label>
                      <select
                        value={bfModel}
                        onChange={(e) => setBfModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none font-sans"
                      >
                        <option value="All">All Models</option>
                        <option value="Civic">Civic</option>
                        <option value="Accord">Accord</option>
                        <option value="Model 3">Model 3</option>
                        <option value="Model Y">Model Y</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                        Model Year Start
                      </label>
                      <input
                        type="number"
                        min={2018}
                        max={2028}
                        value={bfYearStart}
                        onChange={(e) => setBfYearStart(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                        Model Year End
                      </label>
                      <input
                        type="number"
                        min={2018}
                        max={2028}
                        value={bfYearEnd}
                        onChange={(e) => setBfYearEnd(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10"
                >
                  DEPLOY Suppress Directives
                </button>
              </form>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center text-slate-500 space-y-3">
                <Info className="h-6 w-6 text-indigo-400/80 mx-auto" />
                <h4 className="text-xs font-bold text-slate-300 uppercase">Interactive Playground Sync</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Suppression directives created here are evaluated instantly in the **Simulation Playground**. Select a telemetry preset or adjust a vehicle profile under the US region to witness block rule executions.
                </p>
                <button
                  onClick={() => setBfShowForm(true)}
                  className="mx-auto block text-xs font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 px-3 py-1.5 rounded-lg transition"
                >
                  ADD NEW BLOCK RULES
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: OWNER SETTINGS (Mute Notifications by User Id + VIN) */}
      {activeTab === 'owner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* User Preferences List (Left 7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center">
                <UserCheck className="h-4 w-4 text-indigo-400 mr-2" />
                Subscriber Consent & Alert Silencers
              </h3>
              
              {!cosShowForm && (
                <button
                  onClick={() => setCosShowForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ADD OWNER MUTE</span>
                </button>
              )}
            </div>

            {filteredCOS.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500">
                <Info className="h-7 w-7 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-400 uppercase">No Owner Customizations</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  All subscribers are receiving standard push notifications. Click "Add Owner Mute" to simulate custom opt-out configurations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredCOS.map((setting) => {
                  const cat = CATEGORIES.find(c => c.key === setting.notificationCategory);
                  return (
                    <div 
                      key={setting.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                          <span className="text-xs font-bold bg-slate-950 px-2 py-0.5 rounded text-indigo-300 font-mono border border-slate-850">
                            👤 {setting.userId}
                          </span>
                          <span className="text-xs font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-300 font-mono border border-slate-850">
                            🚗 VIN: {setting.vin}
                          </span>
                        </div>
                        
                        <div className="text-xs font-sans text-slate-400 space-y-1">
                          <div>
                            Suppressing Category: <span className="font-bold text-slate-300 font-mono text-[10.5px]">{setting.notificationCategory}</span> ({setting.notificationCategory === 'All' ? 'All Categories' : (cat?.name.split(' ').slice(1).join(' ') || 'Custom')})
                          </div>
                          {setting.notificationKey && setting.notificationKey !== 'All' && (
                            <div className="inline-flex items-center space-x-1 text-[11px] text-indigo-400 font-mono font-medium bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded-lg">
                              <Key className="h-3 w-3 text-indigo-400" />
                              <span>Specific Notification Key: {setting.notificationKey}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                        {/* Consent Toggle */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-slate-500">ALERT DELIVERY:</span>
                          <button
                            onClick={() => onToggleUserSetting(setting.id)}
                            className="text-xs font-bold transition flex items-center shrink-0"
                            title={setting.enabled ? "Change to Opt-Out" : "Change to Opt-In"}
                          >
                            {setting.enabled ? (
                              <span className="text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded text-[10px] font-mono flex items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                                ENABLED
                              </span>
                            ) : (
                              <span className="text-rose-400 font-semibold bg-rose-950/40 border border-rose-900 px-2 py-0.5 rounded text-[10px] font-mono flex items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />
                                MUTED (OPT-OUT)
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteUserSetting(setting.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
                          title="Delete Consent Customization"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Owner Opt-out Consent Form (Right 5 Columns) */}
          <div className="lg:col-span-5">
            {cosShowForm ? (
              <form onSubmit={handleCreateUserSetting} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-200 font-display uppercase tracking-wide flex items-center">
                    <UserCheck className="h-4 w-4 text-indigo-400 mr-2" />
                    Simulate Owner Mute
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCosShowForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    CANCEL
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Subscriber User ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={cosUserId}
                      onChange={(e) => setCosUserId(e.target.value)}
                      placeholder="e.g., usr_ravi_55"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-600 font-mono text-xs"
                    />
                    <p className="text-[9px] text-slate-500 mt-1 italic font-sans">
                      Must match the User ID configured under the simulated context.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Vehicle VIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={cosVin}
                      onChange={(e) => setCosVin(e.target.value)}
                      placeholder="e.g., 1HGCR2F8XHA000000"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-600 font-mono text-xs"
                    />
                    <p className="text-[9px] text-slate-500 mt-1 italic font-sans">
                      Must match the VIN being simulated to mute alerts on that specific asset.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Target Alert Category
                    </label>
                    <select
                      value={cosCategory}
                      onChange={(e) => {
                        setCosCategory(e.target.value);
                        setCosRuleKey('All');
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none font-sans"
                    >
                      <option value="All">All Categories (Global Mute)</option>
                      {activeCategories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.name.includes(' ') ? cat.name.split(' ').slice(1).join(' ') : cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                      Target Specific Notification Key (Optional)
                    </label>
                    <select
                      value={cosRuleKey}
                      onChange={(e) => setCosRuleKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none font-sans"
                    >
                      <option value="All">All Notification Keys {cosCategory !== 'All' ? 'in Category' : 'Globally'}</option>
                      {Array.from(new Set(
                        cosCategory === 'All' 
                          ? rules.map(r => r.notificationKey || r.config[0]?.notificationKey)
                          : rules.filter(r => (r.notificationCategory || r.config[0]?.notificationCategory) === cosCategory).map(r => r.notificationKey || r.config[0]?.notificationKey)
                      )).filter(Boolean).map((nk) => {
                        const matchedRule = rules.find(r => (r.notificationKey || r.config[0]?.notificationKey) === nk);
                        const relatedCategories = Array.from(new Set(
                          rules.filter(r => (r.notificationKey || r.config[0]?.notificationKey) === nk).map(r => {
                            const foundCat = activeCategories.find(c => c.key === (r.notificationCategory || r.config[0]?.notificationCategory));
                            return foundCat 
                              ? (foundCat.name.includes(' ') ? foundCat.name.split(' ').slice(1).join(' ') : foundCat.name) 
                              : (r.notificationCategory || r.config[0]?.notificationCategory);
                          })
                        ));
                        return (
                          <option key={nk} value={nk}>
                            🔑 {nk} ({matchedRule?.name || ''}) — Related to: {relatedCategories.join(', ')}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[9px] text-slate-500 mt-1 italic font-sans">
                      Select a precise Notification Key to block, or choose "All Rules" for full channel muting.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-300 uppercase font-mono">SILENCE THIS CATEGORY?</div>
                      <p className="text-[9px] text-slate-500 font-sans">Owner opted-out of this telemetry channel.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCosEnabled(!cosEnabled)}
                      className={`text-[10px] font-mono font-bold px-3 py-1 rounded transition duration-150 ${
                        !cosEnabled 
                          ? 'bg-rose-950 border border-rose-900 text-rose-400' 
                          : 'bg-emerald-950 border border-emerald-900 text-emerald-400'
                      }`}
                    >
                      {!cosEnabled ? 'MUTED (OPT-OUT)' : 'ACTIVE (OPT-IN)'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition text-xs uppercase tracking-wider shadow-md shadow-indigo-600/10"
                >
                  SAVE OWNER PREFERENCE
                </button>
              </form>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center text-slate-500 space-y-3">
                <Lock className="h-6 w-6 text-indigo-400/80 mx-auto" />
                <h4 className="text-xs font-bold text-slate-300 uppercase">Consent Muting Rules</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Vehicle owners can opt-out of notifications at will. When an engine alert matches, the Connected Gateway verifies if the current vehicle owner has muted the category key, logging a clear "Owner Privacy" blocked notification.
                </p>
                <button
                  onClick={() => setCosShowForm(true)}
                  className="mx-auto block text-xs font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 px-3 py-1.5 rounded-lg transition"
                >
                  MUTE BY VIN & USER ID
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

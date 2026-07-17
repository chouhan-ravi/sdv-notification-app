/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, SimulationLog, RuleCondition, BusinessFilter, CarOwnerSetting } from '../types';
import { SAMPLE_PAYLOADS } from '../lib/samplePayloads';
import { runRulesEvaluation } from '../lib/rulesEvaluator';
import { 
  Play, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Sparkles, 
  Smartphone, 
  FileJson, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Check,
  User,
  MapPin,
  Car,
  Calendar,
  Layers,
  Fuel
} from 'lucide-react';

interface SimulatorProps {
  rules: Rule[];
  businessFilters: BusinessFilter[];
  userSettings: CarOwnerSetting[];
  onAddLog: (log: SimulationLog) => void;
  activeRuleKeyFilter?: string; // If populated, highlights or guides rule creation
}

export default function Simulator({ 
  rules, 
  businessFilters, 
  userSettings, 
  onAddLog, 
  activeRuleKeyFilter 
}: SimulatorProps) {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<SimulationLog | null>(null);
  const [expandedLogRules, setExpandedLogRules] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [phoneNotificationDismissed, setPhoneNotificationDismissed] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // Simulated Device context profile states
  const [simCssGen, setSimCssGen] = useState('Gen 6');
  const [simModel, setSimModel] = useState('Civic');
  const [simYear, setSimYear] = useState(2024);
  const [simPropulsion, setSimPropulsion] = useState<'ICE' | 'EV' | 'PHEV' | 'All'>('ICE');
  const [simRegion, setSimRegion] = useState('US');
  const [simUserId, setSimUserId] = useState('usr_ravi_55');
  const [simVin, setSimVin] = useState('');
  const [profileExpanded, setProfileExpanded] = useState(true);

  // Load selected preset payload on load or index change
  useEffect(() => {
    if (SAMPLE_PAYLOADS[selectedPresetIdx]) {
      const payload = SAMPLE_PAYLOADS[selectedPresetIdx].payload;
      setRawJson(JSON.stringify(payload, null, 2));
      setJsonError(null);

      // Auto-extract and sync context state from payload
      const vinValue = payload.response_header?.vin || '1HGCR2F8XHA000000';
      setSimVin(vinValue);

      const propulsionValue = payload.vehicle_state_snapshot?.propulsion_system || 'ICE';
      setSimPropulsion(propulsionValue as any);

      // Set default Model/Gen defaults based on preset name or VIN to match rules nicely
      if (vinValue.includes('HA445910')) {
        setSimModel('Accord');
        setSimYear(2023);
        setSimCssGen('Gen 6');
      } else if (vinValue.includes('982133')) {
        setSimModel('Model 3');
        setSimYear(2024);
        setSimPropulsion('EV');
        setSimCssGen('Gen 7');
      } else if (vinValue.includes('831200')) {
        setSimModel('Model Y');
        setSimYear(2025);
        setSimPropulsion('EV');
        setSimCssGen('Gen 7');
      } else {
        setSimModel('Civic');
        setSimYear(2024);
        setSimCssGen('Gen 6');
      }
    }
  }, [selectedPresetIdx]);

  // Handle manual load of rule key if user clicked "TEST" in the rules list
  useEffect(() => {
    if (activeRuleKeyFilter) {
      // Find preset matching this rule key, or find one that matches the command
      const matchedIdx = SAMPLE_PAYLOADS.findIndex(p => {
        if (activeRuleKeyFilter === 'RULE_REM_START_SUCCESS_CONFIRM' && p.name.includes('Successful')) return true;
        if (activeRuleKeyFilter === 'RULE_REM_START_SAFETY_BLOCK' && p.name.includes('Safety')) return true;
        if (activeRuleKeyFilter === 'RULE_BATTERY_VOLTAGE_FAULT' && p.name.includes('Battery')) return true;
        if (activeRuleKeyFilter === 'RULE_ENGINE_OVER_RPM' && p.name.includes('RPM')) return true;
        if (activeRuleKeyFilter === 'RULE_SECURITY_INTRUSION_ALERT' && p.name.includes('Theft')) return true;
        return false;
      });

      if (matchedIdx !== -1) {
        setSelectedPresetIdx(matchedIdx);
      }
    }
  }, [activeRuleKeyFilter]);

  // Live validation of raw JSON string
  const handleJsonChange = (val: string) => {
    setRawJson(val);
    try {
      if (!val.trim()) {
        setJsonError('JSON payload cannot be empty');
        return;
      }
      JSON.parse(val);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Malformed JSON syntax');
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setRawJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError('Cannot format: ' + (err.message || 'Malformed JSON'));
    }
  };

  const handleRunSimulation = () => {
    if (jsonError || !rawJson.trim()) return;

    setIsSimulating(true);
    setPhoneNotificationDismissed(false);
    setDiagnosticOpen(false);

    try {
      // Synchronize input fields back into raw event payload before evaluating
      const parsedPayload = JSON.parse(rawJson);
      if (parsedPayload.response_header) {
        parsedPayload.response_header.vin = simVin;
      }
      if (parsedPayload.vehicle_state_snapshot) {
        parsedPayload.vehicle_state_snapshot.propulsion_system = simPropulsion;
      }
      
      // Delay slightly for high-fidelity active compiler animation effect
      setTimeout(() => {
        const resultLog = runRulesEvaluation(
          rules, 
          parsedPayload,
          businessFilters,
          userSettings,
          {
            cssGen: simCssGen,
            vehicleModel: simModel,
            year: Number(simYear),
            vehicleType: simPropulsion,
            region: simRegion,
            userId: simUserId
          }
        );
        setActiveSimulation(resultLog);
        onAddLog(resultLog);
        setIsSimulating(false);

        // Auto-expand any matched rules in the evaluation results list
        const defaultExpanded: Record<string, boolean> = {};
        resultLog.matchedRules.forEach(mr => {
          defaultExpanded[mr.ruleId] = true;
        });
        setExpandedLogRules(defaultExpanded);
      }, 600);

    } catch (err: any) {
      setJsonError('Execution aborted: ' + (err.message || 'JSON parse error'));
      setIsSimulating(false);
    }
  };

  const copyToClipboard = () => {
    if (!activeSimulation || !activeSimulation.pushNotificationPayload) return;
    const jsonStr = JSON.stringify(activeSimulation.pushNotificationPayload, null, 2);
    
    navigator.clipboard.writeText(jsonStr)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        // Fallback for isolated browsers or dev containers without full clipboard APIs
        const textarea = document.createElement('textarea');
        textarea.value = jsonStr;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
  };

  const toggleExpandRule = (ruleId: string) => {
    setExpandedLogRules(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* LEFT: JSON Payload Editor (5 Columns) */}
      <div id="simulator-left-column" className="lg:col-span-5 flex flex-col space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex-1 flex flex-col">
          
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wide">
                Vehicle Event Ingestion
              </h3>
            </div>
            
            <button
              onClick={handleFormatJson}
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-800 transition font-mono"
            >
              PRETTY PRINT
            </button>
          </div>

          {/* Preset Selector */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-500 font-mono mb-1.5 uppercase">
              SELECT TELEMETRY PRESET
            </label>
            <select
              id="payload-preset-selector"
              value={selectedPresetIdx}
              onChange={(e) => setSelectedPresetIdx(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-sans cursor-pointer"
            >
              {SAMPLE_PAYLOADS.map((preset, idx) => (
                <option key={idx} value={idx}>
                  🚗 {preset.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 font-sans italic px-1">
              {SAMPLE_PAYLOADS[selectedPresetIdx]?.description}
            </p>
          </div>

          {/* Simulated Device Profile Context Form */}
          <div className="mb-4 border border-slate-800 bg-slate-950/40 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setProfileExpanded(!profileExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800"
            >
              <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center uppercase tracking-wider">
                <Car className="h-3.5 w-3.5 text-indigo-400 mr-1.5 shrink-0" />
                Simulated Vehicle & User Context
              </span>
              {profileExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            {profileExpanded && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      CSS Generation
                    </label>
                    <select
                      value={simCssGen}
                      onChange={(e) => setSimCssGen(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-slate-700 font-sans cursor-pointer text-xs"
                    >
                      <option value="Gen 5">Gen 5 (Legacy)</option>
                      <option value="Gen 6">Gen 6 (Current)</option>
                      <option value="Gen 7">Gen 7 (Premium)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      Vehicle Model
                    </label>
                    <select
                      value={simModel}
                      onChange={(e) => setSimModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-slate-700 font-sans cursor-pointer text-xs"
                    >
                      <option value="Civic">Civic</option>
                      <option value="Accord">Accord</option>
                      <option value="Model 3">Model 3</option>
                      <option value="Model Y">Model Y</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      Model Year
                    </label>
                    <input
                      type="number"
                      value={simYear}
                      onChange={(e) => setSimYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-slate-700 font-mono text-xs"
                      min={2018}
                      max={2028}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      Propulsion
                    </label>
                    <select
                      value={simPropulsion}
                      onChange={(e) => setSimPropulsion(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-slate-700 font-sans cursor-pointer text-xs"
                    >
                      <option value="ICE">ICE (Gasoline)</option>
                      <option value="EV">EV (Electric)</option>
                      <option value="PHEV">PHEV (Hybrid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      Region
                    </label>
                    <select
                      value={simRegion}
                      onChange={(e) => setSimRegion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-slate-700 font-sans cursor-pointer text-xs"
                    >
                      <option value="US">🇺🇸 US Region</option>
                      <option value="EU">🇪🇺 EU Region</option>
                      <option value="JP">🇯🇵 JP Region</option>
                      <option value="CN">🇨🇳 CN Region</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      Owner/User ID
                    </label>
                    <input
                      type="text"
                      value={simUserId}
                      onChange={(e) => setSimUserId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 font-mono uppercase mb-1">
                      Vehicle VIN
                    </label>
                    <input
                      type="text"
                      value={simVin}
                      onChange={(e) => setSimVin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Editor Space */}
          <div className="flex-1 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">
                RAW EVENT JSON PAYLOAD
              </span>
              
              {jsonError ? (
                <span className="text-[10px] font-mono text-rose-500 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1 animate-pulse" />
                  INVALID JSON SYNTAX
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                  PAYLOAD VALIDATED
                </span>
              )}
            </div>

            <textarea
              id="raw-json-editor"
              value={rawJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full flex-1 bg-slate-950 border rounded-lg p-3 font-mono text-[11px] leading-relaxed text-slate-300 resize-none focus:outline-none ${
                jsonError ? 'border-rose-950 text-rose-300' : 'border-slate-850 focus:border-slate-750'
              }`}
              spellCheck="false"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-slate-850">
            <button
              id="run-simulation-btn"
              onClick={handleRunSimulation}
              disabled={!!jsonError || isSimulating}
              className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition flex items-center justify-center space-x-2 shadow-lg ${
                !!jsonError 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : isSimulating
                  ? 'bg-indigo-850 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10'
              }`}
            >
              {isSimulating ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                  <span className="font-mono text-xs">EVALUATING SDV CRITERIA...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>SIMULATE EVENT & EVALUATE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Results Workspace (7 Columns) */}
      <div id="simulator-right-column" className="lg:col-span-7 flex flex-col space-y-4">
        
        {!activeSimulation ? (
          /* EMPTY STATE - WAITING FOR RUN */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-lg flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full border border-dashed border-indigo-500/20 animate-spin" />
              <div className="absolute h-12 w-12 rounded-full border border-indigo-500/30 animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-850 text-indigo-400">
                <Zap className="h-4 w-4 animate-bounce" />
              </div>
            </div>
            <h4 className="text-slate-200 font-bold text-sm font-display uppercase tracking-wide">
              Telemetry Ingestion Receiver Ready
            </h4>
            <p className="text-slate-500 text-xs font-sans mt-1 max-w-sm mx-auto">
              Choose one of the presets on the left or paste a custom JSON payload, then trigger simulation to verify rule engines and push notification triggers.
            </p>
          </div>
        ) : (
          /* ACTIVE SIMULATION PRESENT */
          <div className="space-y-4 flex-1 flex flex-col">
            
            {/* Header Telemetry Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-850">
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>SIMULATED {new Date(activeSimulation.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-slate-500">INGESTION STATUS:</span>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    activeSimulation.success 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' 
                      : 'bg-slate-950 text-slate-400 border border-slate-850'
                  }`}>
                    {activeSimulation.success ? 'RULES MATCHED (NOTIFICATION TRIGGERED)' : 'NO TRIGGER MATCHED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-850">
                  <div className="text-slate-500 text-[9px] font-bold uppercase">Target VIN</div>
                  <div className="text-slate-300 font-semibold truncate mt-0.5">{activeSimulation.vin}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-850">
                  <div className="text-slate-500 text-[9px] font-bold uppercase">Trigger Command</div>
                  <div className="text-slate-300 font-semibold truncate mt-0.5">{activeSimulation.commandId}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-850 col-span-2 sm:col-span-1">
                  <div className="text-slate-500 text-[9px] font-bold uppercase">Execution State</div>
                  <div className="text-slate-300 font-semibold mt-0.5">{activeSimulation.executionStatus}</div>
                </div>
              </div>
            </div>

            {activeSimulation.blockedReason && (
              <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-4 flex items-start space-x-3 text-xs">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-400 font-display uppercase tracking-wider flex items-center">
                    <span>⚠️ NOTIFICATION BLOCKED & SUPPRESSED</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-amber-950/80 border border-amber-800 rounded text-[9px] font-mono text-amber-300">
                      {activeSimulation.blockedReason.type === 'USER_SETTING' ? 'USER PRIVACY OPT-OUT' : 'CORPORATE RULE'}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans font-medium">
                    {activeSimulation.blockedReason.message}
                  </p>
                  <p className="text-slate-500 text-[10px] font-mono leading-none pt-1">
                    Rule Key: {activeSimulation.matchedRules[0]?.ruleKey || 'N/A'} • Gate Control ID: {activeSimulation.blockedReason.filterId || 'Privacy Filter'}
                  </p>
                </div>
              </div>
            )}

            {/* Split Details: Engine Run Breakdown & Push Payload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              
              {/* Rules Evaluation Engine Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
                <h4 className="text-xs font-bold font-mono text-slate-300 mb-2 border-b border-slate-850 pb-1.5 flex items-center uppercase">
                  <Terminal className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                  Criteria Execution Log
                </h4>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-1">
                  {/* Evaluated rules lists */}
                  {rules.filter(r => r.enabled).map(rule => {
                    const matchResult = activeSimulation.matchedRules.find(mr => mr.ruleId === rule.id);
                    const isMatched = !!matchResult;
                    const isExpanded = !!expandedLogRules[rule.id];

                    return (
                      <div 
                        key={rule.id}
                        className={`border rounded-xl overflow-hidden text-xs transition duration-150 ${
                          isMatched 
                            ? 'bg-emerald-950/15 border-emerald-900/50' 
                            : 'bg-slate-950/60 border-slate-850'
                        }`}
                      >
                        {/* Header of evaluated card */}
                        <div 
                          onClick={() => toggleExpandRule(rule.id)}
                          className="p-2.5 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center space-x-1.5 truncate pr-2">
                            {isMatched ? (
                              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-slate-500 shrink-0" />
                            )}
                            <span className={`font-semibold font-sans truncate ${isMatched ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {rule.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isMatched ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-500'
                            }`}>
                              {isMatched ? 'MATCH' : 'SKIP'}
                            </span>
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                          </div>
                        </div>

                        {/* Detailed condition items */}
                        {isExpanded && (
                          <div className="p-2.5 pt-0 border-t border-slate-850 bg-slate-950/40 space-y-2 font-mono text-[10px]">
                            <div className="text-slate-500 font-bold uppercase text-[8px] tracking-wide mb-1">
                              Individual Condition Evaluations (AND)
                            </div>
                            
                            {rule.conditions.map((cond, idx) => {
                              // If matched, extract pass state from results
                              let passed = false;
                              let actualValue: any = undefined;

                              if (isMatched && matchResult) {
                                const condEval = matchResult.conditionEvaluations.find(ce => ce.conditionId === cond.id);
                                passed = !!condEval?.passed;
                                actualValue = condEval?.actualValue;
                              } else {
                                // Evaluate manually for skipped display
                                const actual = runRulesEvaluation([rule], JSON.parse(rawJson));
                                const ruleMatch = actual.matchedRules.find(mr => mr.ruleId === rule.id);
                                if (ruleMatch) {
                                  const condEval = ruleMatch.conditionEvaluations.find(ce => ce.conditionId === cond.id);
                                  passed = !!condEval?.passed;
                                  actualValue = condEval?.actualValue;
                                } else {
                                  // Evaluate manually using our engine helper
                                  const res = runRulesEvaluation(rules, JSON.parse(rawJson));
                                  // Find if there is any condition evaluation records in custom run
                                  const manualObj = JSON.parse(rawJson);
                                  const nestedVal = requireNestedValue(manualObj, cond.fieldPath);
                                  actualValue = nestedVal;
                                  passed = evaluateConditionManual(cond, manualObj);
                                }
                              }

                              return (
                                <div key={cond.id || idx} className="flex items-start justify-between py-1 border-b border-slate-900/50 last:border-0">
                                  <div className="flex-1 pr-2">
                                    <div className="text-slate-400 font-bold truncate" title={cond.fieldPath}>{cond.fieldPath}</div>
                                    <div className="text-slate-500 text-[9px] mt-0.5">
                                      Expected: {cond.operator.toUpperCase()} "{cond.value}"
                                    </div>
                                    <div className="text-slate-500 text-[9px]">
                                      Actual: <span className={passed ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                                        {actualValue === undefined ? 'undefined' : `"${String(actualValue)}"`}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <span className={`font-bold mt-1 shrink-0 ${passed ? 'text-emerald-400' : 'text-rose-500'}`}>
                                    {passed ? '✓ PASS' : '✗ FAIL'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Push Notification Payload Output */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
                <div className="flex items-center justify-between mb-2 border-b border-slate-850 pb-1.5">
                  <h4 className="text-xs font-bold font-mono text-slate-300 flex items-center uppercase">
                    <FileJson className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                    Notification Output JSON
                  </h4>
                  
                  {activeSimulation.pushNotificationPayload && (
                    <button
                      onClick={copyToClipboard}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded border border-slate-850 transition flex items-center space-x-1"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span className="text-[10px] font-mono">{isCopied ? 'COPIED!' : 'COPY'}</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {!activeSimulation.pushNotificationPayload ? (
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 text-center font-sans space-y-2">
                      <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
                      <div className="text-xs font-semibold text-slate-300">No Notifications Generated</div>
                      <p className="text-[10px] text-slate-500">
                        The vehicle event didn't trigger any matching rule conditions. Change values in the left editor or select another preset.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 font-mono text-[9.5px] leading-relaxed text-indigo-200 overflow-y-auto max-h-[280px]">
                      <pre>{JSON.stringify(activeSimulation.pushNotificationPayload, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Immersive Mobile Push Device Mockup Preview */}
            {(activeSimulation.pushNotificationPayload || activeSimulation.blockedReason) && (
              <div id="smartphone-mockup" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <h4 className="text-xs font-bold font-mono text-slate-300 mb-3 flex items-center uppercase border-b border-slate-850 pb-1.5">
                  <Smartphone className="h-4 w-4 mr-1.5 text-blue-400" />
                  Operator Mobile Handset Simulation
                </h4>

                <div className="flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-850/50">
                  {/* CSS Mobile mockup chassis */}
                  <div className="relative w-full max-w-[310px] bg-slate-900 rounded-[30px] border-4 border-slate-800 p-2 shadow-2xl overflow-hidden aspect-[9/18]">
                    
                    {/* Device camera notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-900 ml-auto mr-4" />
                    </div>

                    {/* Lock screen ambient display content */}
                    <div className="w-full h-full rounded-[24px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 relative flex flex-col p-4 select-none pt-8">
                      
                      {/* Top Time Display */}
                      <div className="text-center mt-2 space-y-0.5">
                        <div className="text-2xl font-bold font-display text-slate-200">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[9px] font-medium font-sans text-slate-400 uppercase tracking-wider">
                          {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      {/* Notification Push Bubble Alert */}
                      {!phoneNotificationDismissed && (
                        activeSimulation.blockedReason ? (
                          <div className="mt-8 bg-amber-950/45 backdrop-blur-md border border-amber-900/50 rounded-2xl p-3.5 shadow-xl text-center space-y-1.5 z-10 animate-pulse-slow">
                            <div className="mx-auto h-7 w-7 rounded-full bg-amber-950 flex items-center justify-center border border-amber-800/60 text-amber-400">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                              ALERT MUTED & BLOCKED
                            </div>
                            <p className="text-[9px] text-slate-300 font-sans leading-tight">
                              Suppressed by {activeSimulation.blockedReason.type === 'USER_SETTING' ? 'Owner Privacy' : 'Corp Policy'}:
                            </p>
                            <p className="text-[9.5px] text-slate-400 italic leading-snug font-sans">
                              "{activeSimulation.blockedReason.message.slice(0, 75)}..."
                            </p>
                          </div>
                        ) : activeSimulation.pushNotificationPayload && (
                          <div className="mt-8 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-xl animate-bounce-short z-10">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1.5">
                                <div className="h-4 w-4 rounded bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white shadow font-display">
                                  SDV
                                </div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">CONNECTED GATEWAY</span>
                              </div>
                              <span className="text-[8px] text-slate-500 font-sans">Just Now</span>
                            </div>

                            <div className="space-y-0.5">
                              <h5 className="text-[11px] font-bold text-slate-200">
                                {activeSimulation.pushNotificationPayload.notification.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-sans leading-snug">
                                {activeSimulation.pushNotificationPayload.notification.body}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-bold">
                              <button
                                onClick={() => setPhoneNotificationDismissed(true)}
                                className="text-slate-400 hover:text-slate-300"
                              >
                                DISMISS
                              </button>
                              <button
                                onClick={() => setDiagnosticOpen(true)}
                                className="text-indigo-400 hover:text-indigo-300 uppercase"
                              >
                                VEHICLE STATS
                              </button>
                            </div>
                          </div>
                        )
                      )}

                      {/* Quick success action inside device */}
                      {diagnosticOpen && activeSimulation.pushNotificationPayload && (
                        <div className="absolute inset-x-2 bottom-12 bg-slate-900 border border-indigo-500/30 p-3 rounded-2xl shadow-xl space-y-2 animate-zoom-in z-20">
                          <div className="flex items-center space-x-1.5 text-xs text-indigo-400 font-bold font-display">
                            <Zap className="h-3.5 w-3.5" />
                            <span>VEHICLE TELEMETRY OVERVIEW</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 text-[8px] font-mono text-slate-400">
                            <div className="bg-slate-950 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-600 uppercase block">VIN</span>
                              <span className="text-slate-300 truncate block">{activeSimulation.vin}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-600 uppercase block">Engine</span>
                              <span className="text-slate-300 font-semibold">{activeSimulation.executionStatus === 'SUCCESS' ? 'RUNNING' : 'STOPPED'}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-600 uppercase block">Category</span>
                              <span className="text-slate-300">{activeSimulation.pushNotificationPayload.data.category}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-600 uppercase block">Trigger Key</span>
                              <span className="text-indigo-400 font-bold truncate block">{activeSimulation.pushNotificationPayload.data.rule_key}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setDiagnosticOpen(false)}
                            className="w-full py-1 text-[8px] font-bold text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                          >
                            CLOSE PANEL
                          </button>
                        </div>
                      )}

                      {/* Swipe up guide indicator */}
                      <div className="mt-auto mx-auto w-24 h-1 bg-slate-750 rounded-full mb-1" />
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

// Minimal safe nested extraction helpers for standalone evaluation checks if preset was skipped
function requireNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function evaluateConditionManual(condition: RuleCondition, payload: any): boolean {
  const actualValue = requireNestedValue(payload, condition.fieldPath);
  const expectedStr = condition.value;

  if (condition.operator === 'exists') {
    return actualValue !== undefined && actualValue !== null;
  }
  if (condition.operator === 'not_exists') {
    return actualValue === undefined || actualValue === null;
  }
  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  switch (condition.operator) {
    case 'equals':
      return String(actualValue).toLowerCase() === String(expectedStr).toLowerCase();
    case 'not_equals':
      return String(actualValue).toLowerCase() !== String(expectedStr).toLowerCase();
    case 'greater_than': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedStr);
      return !isNaN(actNum) && !isNaN(expNum) && actNum > expNum;
    }
    case 'less_than': {
      const actNum = Number(actualValue);
      const expNum = Number(expectedStr);
      return !isNaN(actNum) && !isNaN(expNum) && actNum < expNum;
    }
    case 'contains':
      return String(actualValue).toLowerCase().includes(String(expectedStr).toLowerCase());
    case 'starts_with':
      return String(actualValue).toLowerCase().startsWith(String(expectedStr).toLowerCase());
    case 'ends_with':
      return String(actualValue).toLowerCase().endsWith(String(expectedStr).toLowerCase());
    default:
      return false;
  }
}

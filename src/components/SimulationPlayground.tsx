/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Rule, SimulationLog, RuleConditionItem, BusinessFilter, CarOwnerSetting, RuleEvaluationResponse } from '../types';
import { SAMPLE_PAYLOADS } from '../lib/samplePayloads';
import { runRulesEvaluation, evaluateRulesApiEngine } from '../lib/rulesEvaluator';
import { apiService } from '../services/api';
import { 
  Play, 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Smartphone, 
  FileJson, 
  Clock, 
  AlertTriangle,
  Zap,
  Check,
  Car,
  CheckCircle,
  XCircle,
  Globe,
  Code
} from 'lucide-react';

interface SimulatorProps {
  rules: Rule[];
  businessFilters: BusinessFilter[];
  userSettings: CarOwnerSetting[];
  onAddLog: (log: SimulationLog) => void;
  activeNotificationKeyFilter?: string;
  activeRuleKeyFilter?: string; // backwards compatibility alias
}

export default function Simulator({ 
  rules, 
  businessFilters, 
  userSettings, 
  onAddLog, 
  activeNotificationKeyFilter,
  activeRuleKeyFilter 
}: SimulatorProps) {
  const effectiveKeyFilter = activeNotificationKeyFilter || activeRuleKeyFilter;
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<SimulationLog | null>(null);
  const [apiResponseJson, setApiResponseJson] = useState<RuleEvaluationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'parsed' | 'apiResponse' | 'phone'>('apiResponse');
  
  const [expandedLogRules, setExpandedLogRules] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [phoneNotificationDismissed, setPhoneNotificationDismissed] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // Context fields
  const [simCssGen, setSimCssGen] = useState('Gen 6');
  const [simModel, setSimModel] = useState('Civic');
  const [simYear, setSimYear] = useState(2024);
  const [simPropulsion, setSimPropulsion] = useState<'ICE' | 'EV' | 'PHEV' | 'All'>('ICE');
  const [simRegion, setSimRegion] = useState('US');
  const [simUserId, setSimUserId] = useState('usr_ravi_55');
  const [simVin, setSimVin] = useState('');
  const [profileExpanded, setProfileExpanded] = useState(true);

  useEffect(() => {
    if (SAMPLE_PAYLOADS[selectedPresetIdx]) {
      const payload = SAMPLE_PAYLOADS[selectedPresetIdx].payload;
      setRawJson(JSON.stringify(payload, null, 2));
      setJsonError(null);

      const vinValue = payload.response_header?.vin || '1HGCR2F8XHA000000';
      setSimVin(vinValue);

      const propulsionValue = payload.vehicle_state_snapshot?.propulsion_system || 'ICE';
      setSimPropulsion(propulsionValue as any);

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

  useEffect(() => {
    if (effectiveKeyFilter) {
      const matchedIdx = SAMPLE_PAYLOADS.findIndex(p => {
        if (effectiveKeyFilter.includes('REM_START') && p.name.includes('Successful')) return true;
        if (effectiveKeyFilter.includes('SAFETY') && p.name.includes('Safety')) return true;
        if (effectiveKeyFilter.includes('BATTERY') && p.name.includes('Battery')) return true;
        if (effectiveKeyFilter.includes('INTRUSION') && p.name.includes('Theft')) return true;
        return false;
      });

      if (matchedIdx !== -1) {
        setSelectedPresetIdx(matchedIdx);
      }
    }
  }, [effectiveKeyFilter]);

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

  const handleRunSimulation = async () => {
    if (jsonError || !rawJson.trim()) return;

    setIsSimulating(true);
    setPhoneNotificationDismissed(false);
    setDiagnosticOpen(false);

    try {
      const parsedPayload = JSON.parse(rawJson);
      if (parsedPayload.response_header) {
        parsedPayload.response_header.vin = simVin;
      }
      if (parsedPayload.vehicle_state_snapshot) {
        parsedPayload.vehicle_state_snapshot.propulsion_system = simPropulsion;
      }

      // 1. Call Rule Evaluation API via backend REST endpoint
      let apiResponse: RuleEvaluationResponse;
      try {
        apiResponse = await apiService.evaluateRules(parsedPayload);
      } catch (e) {
        console.warn('REST API evaluation call failed, computing locally via evaluator engine:', e);
        apiResponse = evaluateRulesApiEngine(rules, parsedPayload);
      }

      setApiResponseJson(apiResponse);

      // 2. Generate simulation log for UI feed
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

      const defaultExpanded: Record<string, boolean> = {};
      resultLog.matchedRules.forEach(mr => {
        defaultExpanded[mr.ruleId] = true;
      });
      setExpandedLogRules(defaultExpanded);

    } catch (err: any) {
      setJsonError('Execution aborted: ' + (err.message || 'JSON parse error'));
      setIsSimulating(false);
    }
  };

  const copyApiResponse = () => {
    if (!apiResponseJson) return;
    const jsonStr = JSON.stringify(apiResponseJson, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
                notificationEvent Ingestion
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
          </div>

          {/* Simulated Context */}
          <div className="mb-4 border border-slate-800 bg-slate-950/40 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setProfileExpanded(!profileExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800"
            >
              <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center uppercase tracking-wider">
                <Car className="h-3.5 w-3.5 text-indigo-400 mr-1.5 shrink-0" />
                Simulated Vehicle Profile Context
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
                      <option value="Gen 5">Gen 5</option>
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

                <div className="grid grid-cols-2 gap-2">
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
              </div>
            )}
          </div>

          {/* Editor Space */}
          <div className="flex-1 flex flex-col min-h-[320px]">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">
                notificationEvent Payload JSON
              </span>
              
              {jsonError ? (
                <span className="text-[10px] font-mono text-rose-500 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1 animate-pulse" />
                  INVALID JSON
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                  VALID JSON
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
                  <span className="font-mono text-xs">CALLING EVALUATE API...</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 fill-white" />
                  <span>CALL RULE EVALUATE API</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: API Response & Simulation Results Workspace (7 Columns) */}
      <div id="simulator-right-column" className="lg:col-span-7 flex flex-col space-y-4">
        
        {!apiResponseJson ? (
          /* EMPTY STATE */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-lg flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full border border-dashed border-indigo-500/20 animate-spin" />
              <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-850 text-indigo-400">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-slate-200 font-bold text-sm font-display uppercase tracking-wide">
              Rule Evaluation API Ready
            </h4>
            <p className="text-slate-500 text-xs font-sans mt-1 max-w-sm mx-auto">
              Click <strong>"CALL RULE EVALUATE API"</strong> on the left to send the notificationEvent payload to the backend REST API <code>POST /api/v1/rules/evaluate</code> and bind the response JSON in the frontend UI.
            </p>
          </div>
        ) : (
          /* ACTIVE API RESPONSE PRESENT */
          <div className="space-y-4 flex-1 flex flex-col">
            
            {/* View Switcher Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-md flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('apiResponse')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'apiResponse'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>API Response JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('parsed')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'parsed'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <FileJson className="h-3.5 w-3.5" />
                  <span>Evaluated Rules ({apiResponseJson.matchedRulesCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('phone')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 ${
                    activeTab === 'phone'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile Handset</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 pr-2">
                <span className="text-[10px] font-mono text-slate-500">HTTP 200 OK</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              </div>
            </div>

            {/* TAB 1: API RESPONSE JSON BINDING */}
            {activeTab === 'apiResponse' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <Globe className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-200 font-bold">Backend Response: POST /api/rules/evaluate</span>
                  </div>

                  <button
                    onClick={copyApiResponse}
                    className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition flex items-center space-x-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{isCopied ? 'COPIED!' : 'COPY JSON'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 font-mono text-[11px] leading-relaxed text-emerald-300 overflow-y-auto max-h-[450px]">
                  <pre className="whitespace-pre-wrap break-all">{JSON.stringify(apiResponseJson, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* TAB 2: PARSED MATCHED RULES LIST */}
            {activeTab === 'parsed' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex-1 flex flex-col space-y-3">
                <div className="text-xs font-bold font-mono text-slate-300 border-b border-slate-850 pb-2 flex items-center justify-between">
                  <span>Evaluated Rules Breakdown</span>
                  <span className="text-emerald-400">{apiResponseJson.matchedRulesCount} Matched / {apiResponseJson.totalRulesEvaluated} Total</span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                  {apiResponseJson.evaluationResults.map((res, idx) => (
                    <div key={idx} className="bg-slate-950 border border-emerald-900/40 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                        <span className="text-xs font-bold font-mono text-slate-200">{res.ruleName} ({res.ruleId})</span>
                        <span className="text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40">
                          {res.matchedConfig.criticality}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-400">
                        Category: <strong className="text-slate-200">{res.matchedConfig.notificationCategory}</strong> • Key: <strong className="text-emerald-400">{res.matchedConfig.notificationKey}</strong>
                      </div>

                      <div className="bg-slate-900 p-2 rounded text-xs font-sans text-slate-200 border border-slate-850">
                        <strong>Title:</strong> {res.matchedConfig.resolvedNotificationTemplate.title}
                        <br />
                        <strong>Body:</strong> {res.matchedConfig.resolvedNotificationTemplate.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PHONE HANDSET */}
            {activeTab === 'phone' && (
              <div id="smartphone-mockup" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex-1 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[310px] bg-slate-900 rounded-[30px] border-4 border-slate-800 p-2 shadow-2xl overflow-hidden aspect-[9/18]">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />

                  <div className="w-full h-full rounded-[24px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 relative flex flex-col p-4 select-none pt-8">
                    <div className="text-center mt-2 space-y-0.5">
                      <div className="text-2xl font-bold font-display text-slate-200">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {apiResponseJson.evaluationResults.length > 0 && (
                      <div className="mt-8 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-xl z-10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase">SDV GATEWAY</span>
                          <span className="text-[8px] text-slate-500 font-sans">Just Now</span>
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-200">
                          {apiResponseJson.evaluationResults[0].matchedConfig.resolvedNotificationTemplate.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-sans">
                          {apiResponseJson.evaluationResults[0].matchedConfig.resolvedNotificationTemplate.body}
                        </p>
                      </div>
                    )}
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

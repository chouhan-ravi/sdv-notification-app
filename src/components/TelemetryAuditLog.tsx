/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationLog } from '../types';
import { Clock, CheckSquare, AlertTriangle, RefreshCw, Trash2, HardDrive } from 'lucide-react';

interface AuditLogProps {
  logs: SimulationLog[];
  onLoadLogIntoSimulator: (log: SimulationLog) => void;
  onClearLogs: () => void;
  wsConnected?: boolean;
}

export default function AuditLog({ logs, onLoadLogIntoSimulator, onClearLogs, wsConnected }: AuditLogProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col h-full min-h-[300px]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-850 mb-3 gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <HardDrive className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wide">
            Platform Audit Log History
          </h3>
          {wsConnected !== undefined && (
            <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider ${
              wsConnected 
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                : 'bg-rose-950/40 text-rose-400 border border-rose-900/50 animate-pulse'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>{wsConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
            </span>
          )}
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 px-2 py-1 rounded transition flex items-center space-x-1 border border-rose-950 self-start sm:self-auto"
          >
            <Trash2 className="h-3 w-3" />
            <span>CLEAR HISTORY</span>
          </button>
        )}
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
            <Clock className="h-8 w-8 text-slate-650 mb-2" />
            <div className="text-xs font-semibold text-slate-400 font-sans">No Audit Logs Ingested</div>
            <p className="text-[10px] text-slate-500 font-sans max-w-xs mt-1">
              Simulations run in this session will generate persistent audits here for downstream diagnostic review.
            </p>
          </div>
        ) : (
          [...logs].reverse().map((log) => {
            const matchedRule = log.matchedRules[0];

            return (
              <div
                key={log.id}
                id={`audit-log-${log.id}`}
                className={`p-3 rounded-xl border text-xs font-mono transition-all duration-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                  log.success
                    ? 'bg-emerald-950/5 border-emerald-950/30 hover:border-emerald-500/30'
                    : 'bg-slate-950/30 border-slate-850 hover:border-slate-750'
                }`}
              >
                {/* Left: Timestamp & Basic Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[10px]">
                      ⏱️ {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-400 font-bold tracking-wider">{log.vin.substring(0, 8)}...</span>
                    
                    {log.success ? (
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 rounded font-bold">
                        TRIGGERED
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-850 text-slate-500 px-1 rounded font-bold">
                        MUTED
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-300 font-sans">
                    {log.success && matchedRule ? (
                      <span className="text-slate-200">
                        Rule Match: <strong className="text-emerald-400 font-mono text-[10px]">{matchedRule.ruleKey}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No rules matched for Command {log.commandId}</span>
                    )}
                  </div>
                </div>

                {/* Right Actions: Reload payload */}
                <button
                  onClick={() => onLoadLogIntoSimulator(log)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 transition flex items-center space-x-1.5 self-end sm:self-auto text-[10px]"
                  title="Reload this event payload into the active simulator"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="font-sans font-semibold text-[9px]">RE-SIMULATE</span>
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

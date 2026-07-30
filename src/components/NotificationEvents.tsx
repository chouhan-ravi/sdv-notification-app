/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulationLog } from '../types';
import { buildNotificationPipelineSteps } from '../lib/rulesEvaluator';
import { 
  BellRing, 
  Trash2, 
  Search, 
  FileText, 
  Clock, 
  User, 
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

interface NotificationEventsProps {
  logs: SimulationLog[];
  onLoadLogIntoSimulator: (log: SimulationLog) => void;
  onClearLogs: () => void;
  wsConnected?: boolean;
}

export interface IndividualNotificationEvent {
  eventId: string;
  simulationId: string;
  timestamp: string;
  vin: string;
  userId: string;
  commandId: string;
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6;
  stepName: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'WARNING' | 'SKIPPED' | 'DISPATCHED';
  title: string;
  summary: string;
  details?: Record<string, any>;
  rawLog: SimulationLog;
}

export default function NotificationEvents({ logs, onLoadLogIntoSimulator, onClearLogs, wsConnected }: NotificationEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectModalLog, setInspectModalLog] = useState<SimulationLog | null>(null);

  // Expand each simulation log into its 6 individual events
  const allEvents: IndividualNotificationEvent[] = logs.flatMap((log) => {
    const steps = log.pipelineSteps || buildNotificationPipelineSteps(log);
    const resolvedUserId = log.userId || log.eventPayload?.userId || `usr_${log.vin ? log.vin.slice(-5) : '89201'}`;

    return steps.map((step) => ({
      eventId: `${log.id}_step_${step.stepNumber}`,
      simulationId: log.id,
      timestamp: step.timestamp || log.timestamp,
      vin: log.vin,
      userId: resolvedUserId,
      commandId: log.commandId,
      stepNumber: step.stepNumber,
      stepName: step.name,
      status: step.status,
      title: step.title,
      summary: step.summary,
      details: step.details,
      rawLog: log
    }));
  });

  // Simple search filter if typed
  const filteredEvents = allEvents.filter((event) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      event.vin.toLowerCase().includes(term) ||
      event.userId.toLowerCase().includes(term) ||
      event.commandId.toLowerCase().includes(term) ||
      event.summary.toLowerCase().includes(term) ||
      event.status.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: IndividualNotificationEvent['status']) => {
    switch (status) {
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Send className="h-2.5 w-2.5" />
            <span>DISPATCHED</span>
          </span>
        );
      case 'PASSED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-900/80">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>PASSED</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-900">
            <XCircle className="h-2.5 w-2.5" />
            <span>BLOCKED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-900">
            <XCircle className="h-2.5 w-2.5" />
            <span>FAILED</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-900">
            <AlertTriangle className="h-2.5 w-2.5" />
            <span>WARNING</span>
          </span>
        );
      case 'SKIPPED':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-850 text-slate-400 border border-slate-750">
            <span>SKIPPED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full min-h-[420px]">
      
      {/* SIMPLE HEADER BAR */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
                Notification Events
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Stream of 6 lifecycle events emitted per notification payload
            </p>
          </div>

          {wsConnected !== undefined && (
            <span className={`hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider ${
              wsConnected 
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                : 'bg-rose-950/40 text-rose-400 border border-rose-900/50 animate-pulse'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>{wsConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1 border border-rose-950/60"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">CLEAR</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH BAR (Optional simple search) */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input 
          type="text"
          placeholder="Search events by VIN, User ID, Command or text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      {/* ONE-LINE EVENT LIST */}
      <div className="flex-1 overflow-y-auto max-h-[520px] space-y-1.5 pr-1">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-950/40 border border-slate-850/60 rounded-xl">
            <Clock className="h-8 w-8 text-slate-700 mb-2" />
            <div className="text-xs font-semibold text-slate-400 font-sans">No Notification Events Emitted</div>
            <p className="text-[10px] text-slate-500 font-sans max-w-xs mt-1">
              Simulations or scheduled triggers run in this session will stream individual events here in real time.
            </p>
          </div>
        ) : (
          [...filteredEvents].reverse().map((evt) => (
            <div
              key={evt.eventId}
              onClick={() => setInspectModalLog(evt.rawLog)}
              className="group bg-slate-950/60 hover:bg-slate-850/80 border border-slate-850/80 hover:border-slate-750 rounded-lg px-3 py-2 text-xs font-mono transition cursor-pointer flex items-center justify-between gap-2 overflow-hidden"
              title="Click to view full event JSON payload"
            >
              {/* One line content containing VIN, UserID, Event Step & Summary */}
              <div className="flex items-center space-x-2.5 min-w-0 flex-1 truncate">
                {/* Time */}
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>

                {/* VIN Badge */}
                <span className="inline-flex items-center space-x-1 font-bold text-slate-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                  <Car className="h-2.5 w-2.5 text-indigo-400" />
                  <span>{evt.vin.length > 10 ? `${evt.vin.substring(0, 8)}...` : evt.vin}</span>
                </span>

                {/* UserID Badge */}
                <span className="inline-flex items-center space-x-1 font-bold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                  <User className="h-2.5 w-2.5 text-slate-500" />
                  <span>{evt.userId}</span>
                </span>

                {/* Step # + Content summary in a single clean line */}
                <span className="text-slate-300 text-xs truncate font-sans">
                  <strong className="text-indigo-400 font-mono mr-1.5 font-semibold">
                    [{evt.stepNumber}. {evt.stepName}]
                  </strong>
                  <span>{evt.summary}</span>
                </span>
              </div>

              {/* Status Label Badge */}
              <div className="shrink-0 flex items-center space-x-2">
                {getStatusBadge(evt.status)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* RAW JSON INSPECT MODAL */}
      {inspectModalLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wide">
                  Notification Event Raw Telemetry Envelope
                </h3>
              </div>
              <button 
                onClick={() => setInspectModalLog(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
              >
                Close ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(inspectModalLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

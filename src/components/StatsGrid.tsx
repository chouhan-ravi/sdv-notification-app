/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Rule, SimulationLog } from '../types';
import { ShieldCheck, Activity, AlertTriangle, Cpu, Radio } from 'lucide-react';

interface StatsGridProps {
  rules: Rule[];
  logs: SimulationLog[];
}

export default function StatsGrid({ rules, logs }: StatsGridProps) {
  const activeRulesCount = rules.filter(r => r.enabled).length;
  const totalRulesCount = rules.length;
  const totalSimulations = logs.length;
  const matchedSimulations = logs.filter(l => l.success).length;
  
  // Calculate match rate percentage
  const matchRate = totalSimulations > 0 
    ? Math.round((matchedSimulations / totalSimulations) * 100) 
    : 0;

  // Breakdown of alerts in logs
  const criticalityCounts = logs.reduce(
    (acc, log) => {
      log.matchedRules.forEach(mr => {
        if (mr.criticality === 'CRITICAL') acc.critical++;
        else if (mr.criticality === 'MAJOR') acc.major++;
        else if (mr.criticality === 'MINOR') acc.minor++;
        else if (mr.criticality === 'INFO') acc.info++;
      });
      return acc;
    },
    { critical: 0, major: 0, minor: 0, info: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Active Rules Card */}
      <div id="stats-active-rules" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition duration-300">
          <Cpu className="h-20 w-20 text-blue-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-950 text-blue-400">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-slate-400 font-sans">Active Engine Rules</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-display text-slate-100">{activeRulesCount}</span>
          <span className="text-xs text-slate-500 font-mono">/ {totalRulesCount} total</span>
        </div>
        <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>SDV Rules Evaluator Live</span>
        </div>
      </div>

      {/* Total Simulations Card */}
      <div id="stats-simulations" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition duration-300">
          <Activity className="h-20 w-20 text-indigo-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-slate-400 font-sans">Event Logs Ingested</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-display text-slate-100">{totalSimulations}</span>
          <span className="text-xs text-slate-500 font-mono">simulated payload runs</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono flex justify-between">
          <span>Active Session History</span>
          <span className="text-indigo-400">Real-time Stream</span>
        </div>
      </div>

      {/* Match Rate Card */}
      <div id="stats-match-rate" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition duration-300">
          <ShieldCheck className="h-20 w-20 text-emerald-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-slate-400 font-sans">Trigger Rate</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-display text-slate-100">{matchRate}%</span>
          <span className="text-xs text-slate-500 font-mono">({matchedSimulations} triggers)</span>
        </div>
        <div className="mt-2 w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${matchRate}%` }}
          />
        </div>
      </div>

      {/* Critical Alerts Card */}
      <div id="stats-alert-breakdown" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition duration-300">
          <AlertTriangle className="h-20 w-20 text-rose-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-rose-950 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-slate-400 font-sans">Trigger Severity Breakdown</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-1">
          <div className="text-center bg-slate-950/50 rounded p-1.5 border border-red-950/50">
            <div className="text-rose-500 text-sm font-bold font-mono">{criticalityCounts.critical}</div>
            <div className="text-[10px] text-slate-500 font-semibold">CRIT</div>
          </div>
          <div className="text-center bg-slate-950/50 rounded p-1.5 border border-amber-950/50">
            <div className="text-amber-500 text-sm font-bold font-mono">{criticalityCounts.major}</div>
            <div className="text-[10px] text-slate-500 font-semibold">MAJ</div>
          </div>
          <div className="text-center bg-slate-950/50 rounded p-1.5 border border-yellow-950/50">
            <div className="text-yellow-500 text-sm font-bold font-mono">{criticalityCounts.minor}</div>
            <div className="text-[10px] text-slate-500 font-semibold">MIN</div>
          </div>
          <div className="text-center bg-slate-950/50 rounded p-1.5 border border-blue-950/50">
            <div className="text-blue-400 text-sm font-bold font-mono">{criticalityCounts.info}</div>
            <div className="text-[10px] text-slate-500 font-semibold">INFO</div>
          </div>
        </div>
      </div>
    </div>
  );
}

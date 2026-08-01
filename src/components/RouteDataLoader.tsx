import React, { useEffect, useState } from 'react';
import { RefreshCw, Database, CheckCircle2, Server, ArrowRight } from 'lucide-react';

interface RouteDataLoaderProps {
  routeName: string;
  routeEndpoint?: string;
  fetchers?: Array<() => Promise<void> | void>;
  children: React.ReactNode;
}

export default function RouteDataLoader({
  routeName,
  routeEndpoint,
  fetchers = [],
  children
}: RouteDataLoaderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(fetchers.length > 0);
  const [fetchTime, setFetchTime] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initiating microservice data pre-fetch...');

  useEffect(() => {
    let isMounted = true;

    if (fetchers.length === 0) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      const startTime = performance.now();
      setIsLoading(true);
      setStatusText(`Querying microservice endpoints for ${routeName}...`);

      try {
        await Promise.allSettled(fetchers.map(fn => fn()));
      } catch (error) {
        console.warn(`[Microservice DataLoader] Warning prefetching data for ${routeName}:`, error);
      } finally {
        if (isMounted) {
          const endTime = performance.now();
          setFetchTime(Math.round(endTime - startTime));
          setStatusText('Microservice sync complete');
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [routeName]);

  if (isLoading) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[380px] space-y-6 my-4 relative overflow-hidden backdrop-blur-md">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Server className="h-6 w-6 text-indigo-400 absolute" />
        </div>

        <div className="text-center space-y-2 max-w-md">
          <div className="flex items-center justify-center space-x-2">
            <span className="px-2.5 py-0.5 bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-mono text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center space-x-1">
              <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
              <span>LAZY PRE-FETCHING DATA</span>
            </span>
            {routeEndpoint && (
              <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] font-bold rounded-full">
                {routeEndpoint}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-100 tracking-wide">
            Loading {routeName}
          </h3>

          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            {statusText}
          </p>

          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] font-mono text-slate-500">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span>Restoring State & Intercepting Microservice API</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

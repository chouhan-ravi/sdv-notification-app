import React, { useState, useEffect, useRef } from 'react';
import { NotificationScheduler, AfterSalesRecord, Rule, BusinessFilter, CarOwnerSetting, SimulationLog } from '../types';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Bell, 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileText,
  Play,
  Terminal as TerminalIcon,
  Check,
  Server,
  Wifi,
  Smartphone,
  Watch,
  Tv,
  ArrowRight,
  Database,
  Activity,
  Shield,
  Search,
  X
} from 'lucide-react';

interface SchedulerConfigProps {
  schedulers: NotificationScheduler[];
  afterSalesRecords: AfterSalesRecord[];
  rules: Rule[];
  businessFilters: BusinessFilter[];
  userSettings: CarOwnerSetting[];
  onAddScheduler: (scheduler: NotificationScheduler) => void;
  onUpdateScheduler: (scheduler: NotificationScheduler) => void;
  onDeleteScheduler: (id: string) => void;
  onAddLog: (log: SimulationLog) => void;
  triggerToast: (msg: string) => void;
}

interface SystemTask {
  key: string;
  name: string;
  description: string;
  defaultCron: string;
  logsTemplate: string[];
}

const SYSTEM_BACKEND_TASKS: SystemTask[] = [
  {
    key: 'DB_CLEANUP',
    name: 'Database Maintenance & Clean-Up',
    description: 'Purges expired vehicle logs, vacuums telemetry state tables, and optimizes indices.',
    defaultCron: '0 0 * * *',
    logsTemplate: [
      "[SYSTEM] Initializing Database Maintenance & Clean-Up engine...",
      "[CONN] Checking connection status on master PostgreSQL pool... OK",
      "[QUERY] Scanning telemetry logs older than 30 days (retention threshold)...",
      "[AUDIT] Found 14,208 records scheduled for deletion.",
      "[BACKUP] Archiving 14,208 records into cold storage secure blobs...",
      "[SQL] EXECUTING: DELETE FROM vehicle_telemetry WHERE captured_at < NOW() - INTERVAL '30 days'",
      "[SQL] Successfully purged 14,208 stale telemetry log records.",
      "[VACUUM] Running vacuum process to reclaim unused disk blocks...",
      "[VACUUM] VACUUM FULL 'vehicle_telemetry', 'simulation_logs' completed successfully.",
      "[REINDEX] Reindexing tables to optimize diagnostic query lookup latency...",
      "[SUCCESS] Database maintenance completed. Released 452.8 MB storage. Time elapsed: 1.24s."
    ]
  },
  {
    key: 'TELEMETRY_ARCHIVE',
    name: 'Telemetry Logs Purge & Glacier Archive',
    description: 'Compresses and exports raw CAN-bus frames to encrypted deep glacier storage vaults.',
    defaultCron: '0 1 * * 0',
    logsTemplate: [
      "[SYSTEM] Starting weekly Telemetry Logs Purge & Glacier Archive sync...",
      "[FILES] Locking raw CAN-bus frame log directory...",
      "[STATS] Checking storage usage on local flash buffers: 78.4% capacity.",
      "[GZIP] Compressing 1.8 GB of raw binary CAN log trace files...",
      "[GZIP] Compression successful. Produced archive: sdv_can_frames_2026_w28.tar.gz (Size: 184 MB).",
      "[AWS] Initiating secure multipart upload to Glacier Deep Archive Vault...",
      "[TRANSFER] Uploading part [1/4] (46 MB)... Done",
      "[TRANSFER] Uploading part [2/4] (46 MB)... Done",
      "[TRANSFER] Uploading part [3/4] (46 MB)... Done",
      "[TRANSFER] Uploading part [4/4] (46 MB)... Done",
      "[AWS] Transfer completed. Archive ID: GL-92jF-0q2k-La18-XbK4-Z9p",
      "[HASH] Verifying SHA256 checksum hash... MATCH (0x9e107d9d372bb682)",
      "[PURGE] Safely deleting 1.8 GB raw trace files from active server buffers...",
      "[SUCCESS] Glacier Archive flow completed successfully. Local storage reclaimed: 1.8 GB."
    ]
  },
  {
    key: 'CACHE_INVALIDATE',
    name: 'Distributed Rules AST Cache Invalidation',
    description: 'Forces edge cloud gateways to reload optimized rule condition AST evaluations.',
    defaultCron: '*/15 * * * *',
    logsTemplate: [
      "[GATEWAY] Triggering Distributed Rules AST Cache Invalidation sequence...",
      "[GATEWAY] Fetching latest compiled state versions for rules cache keys...",
      "[VERSION] Active version detected: v4.12.0 (compiled timestamp: 2026-07-17T11:00:00Z).",
      "[GATEWAY] Broadcasting invalidate packet across 24 edge container clusters...",
      "[CLUSTER] Region US-EAST (8 nodes): Cache invalidation COMPLETE. Rebuilt in 14ms.",
      "[CLUSTER] Region US-WEST (6 nodes): Cache invalidation COMPLETE. Rebuilt in 18ms.",
      "[CLUSTER] Region EU-CENTRAL (6 nodes): Cache invalidation COMPLETE. Rebuilt in 22ms.",
      "[CLUSTER] Region AP-EAST (4 nodes): Cache invalidation COMPLETE. Rebuilt in 29ms.",
      "[REDIS] Flushing central Redis cache buffer keys... 104 invalidations recorded.",
      "[SUCCESS] All edge gateway routers synced with compiled rules v4.12.0. Status: ONLINE."
    ]
  },
  {
    key: 'HEARTBEAT_SCAN',
    name: 'Anomalous Telemetry Heartbeat Scan',
    description: 'Monitors fleet telemetry stream liveness and logs warning events for silent transponders.',
    defaultCron: '0 * * * *',
    logsTemplate: [
      "[SCAN] Launching anomalous telemetry heartbeat scan engine...",
      "[FLEET] Scanning active connection socket registry... Total active sockets: 8,421.",
      "[FLEET] Querying vehicle status database for active telemetry handshakes...",
      "[FLEET] Analyzing last-heard-from timestamps on all registered VINs (total: 10,000)...",
      "[ALERT] WARNING: VIN '1HGBH4F00000001' (Civic) last handshake was 4.2 hours ago.",
      "[ALERT] WARNING: VIN '5YJSA1E100000002' (Model S) last handshake was 1.8 hours ago.",
      "[FLEET] No critical cellular handshakes blackouts detected on remaining 9,998 VINs.",
      "[DEALER] Dispatching automated Diagnostic Tickets for 2 unresponsive transponders...",
      "[SUCCESS] Heartbeat scan completed. Registered 2 warning flags. Diagnostics: INACTIVE_STREAM."
    ]
  },
  {
    key: 'ERP_VIN_SYNC',
    name: 'VIN Registry Synchronization with Corporate ERP',
    description: 'Queries enterprise manufacturing systems to ingest new factory-rolled vehicle identities.',
    defaultCron: '0 2 * * *',
    logsTemplate: [
      "[ERP] Connecting to Corporate Manufacturing ERP SOAP Endpoint...",
      "[AUTH] Authenticating with OAuth Gateway Service ID: svc_sdv_registry_sync...",
      "[ERP] Requesting production-rolled VIN releases for date range: 2026-07-16 to 2026-07-17...",
      "[ERP] ERP returned 24 new vehicles produced at Detroit Plant A and Munich Plant C.",
      "[FLEET] Ingesting new VIN profiles...",
      "[DB] Registered: VIN '1HGCR2F8XHA445910' -> Profile: Accord Touring Hybrid (Gen 6).",
      "[DB] Registered: VIN '5YJYG1E100000003' -> Profile: Tesla Model Y Long Range (Gen 7).",
      "[DB] Registered: VIN '5YJ3E1EA00000004' -> Profile: Tesla Model 3 Performance (Gen 7).",
      "[SECURITY] Provisioning secure HSM telematics certificates for 24 new vehicle nodes...",
      "[SECURITY] Certificate Authority handshakes completed successfully.",
      "[SUCCESS] Corporate ERP sync finished. 24 new nodes registered in SDV Active Fleet DB."
    ]
  }
];

export default function SchedulerConfig({
  schedulers,
  afterSalesRecords,
  rules,
  businessFilters,
  userSettings,
  onAddScheduler,
  onUpdateScheduler,
  onDeleteScheduler,
  onAddLog,
  triggerToast
}: SchedulerConfigProps) {
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'notification' | 'system_task'>('all');
  
  // Form states
  const [name, setName] = useState('');
  const [schedulerType, setSchedulerType] = useState<'notification' | 'system_task'>('notification');
  const [linkedRuleId, setLinkedRuleId] = useState('');
  const [systemTaskKey, setSystemTaskKey] = useState(SYSTEM_BACKEND_TASKS[0].key);
  const [triggerCondition, setTriggerCondition] = useState<'DaysBefore' | 'OnStatusChange' | 'MileageExceeds' | 'CronExpression'>('OnStatusChange');
  const [triggerValue, setTriggerValue] = useState('Overdue');
  const [serviceType, setServiceType] = useState('All');
  const [enabled, setEnabled] = useState(true);

  // Simulation execution state
  const [executingScheduler, setExecutingScheduler] = useState<NotificationScheduler | null>(null);
  const [executionLogLines, setExecutionLogLines] = useState<string[]>([]);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionSuppressed, setExecutionSuppressed] = useState(false);
  const [executionBlockReason, setExecutionBlockReason] = useState<{ type: string; message: string } | null>(null);
  const [executionInterpolatedNotification, setExecutionInterpolatedNotification] = useState<{ title: string; body: string; criticality: string } | null>(null);
  const [mockSelectedRecord, setMockSelectedRecord] = useState<AfterSalesRecord | null>(null);
  const [activeTabSimDevice, setActiveTabSimDevice] = useState<'phone' | 'watch' | 'car'>('phone');
  const [toastFiredCount, setToastFiredCount] = useState(0);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogLines]);

  const serviceTypes = [
    'All',
    'Periodic Maintenance',
    'Brake Pad Replacement',
    'Battery Health Check',
    'Software Update',
    'Recall Action',
    'Custom Repair'
  ];

  // Load first rule by default if rules exist
  useEffect(() => {
    if (rules && rules.length > 0 && !linkedRuleId) {
      const activeRules = rules.filter(r => r.enabled);
      if (activeRules.length > 0) {
        setLinkedRuleId(activeRules[0].id);
      } else {
        setLinkedRuleId(rules[0].id);
      }
    }
  }, [rules, linkedRuleId]);

  const handleEditClick = (scheduler: NotificationScheduler) => {
    setEditingId(scheduler.id);
    setName(scheduler.name);
    setSchedulerType(scheduler.type || 'notification');
    setTriggerCondition(scheduler.triggerCondition);
    setTriggerValue(scheduler.triggerValue);
    setServiceType(scheduler.serviceType);
    setEnabled(scheduler.enabled);
    
    if (scheduler.linkedRuleId) {
      setLinkedRuleId(scheduler.linkedRuleId);
    } else if (rules.length > 0) {
      // Graceful fallback: try finding rule with matching template or category/key
      const found = rules.find(r => (r.notificationKey || r.config[0]?.notificationKey) === scheduler.notificationCategory);
      setLinkedRuleId(found ? found.id : rules[0].id);
    }

    if (scheduler.systemTaskKey) {
      setSystemTaskKey(scheduler.systemTaskKey);
    }

    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mandatory fields missing: Scheduler Name is required.');
      return;
    }

    let resolvedTitle = '';
    let resolvedBody = '';
    let resolvedCategory = 'All';

    if (schedulerType === 'notification') {
      const selectedRule = rules.find(r => r.id === linkedRuleId);
      if (!selectedRule) {
        alert('Invalid state: No linked rule selected.');
        return;
      }
      resolvedTitle = selectedRule.notificationTitle;
      resolvedBody = selectedRule.notificationBody;
      resolvedCategory = selectedRule.notificationCategory || selectedRule.config[0]?.notificationCategory || 'All';
    } else {
      const selectedTask = SYSTEM_BACKEND_TASKS.find(t => t.key === systemTaskKey);
      resolvedTitle = `⚙️ SYSTEM CRON: ${selectedTask?.name || 'Task'}`;
      resolvedBody = selectedTask?.description || 'Background maintenance schedule.';
      resolvedCategory = 'SYSTEM_CRON';
    }

    const schedulerData: NotificationScheduler = {
      id: editingId || `sch_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      triggerCondition: schedulerType === 'system_task' ? 'CronExpression' : triggerCondition,
      triggerValue: schedulerType === 'system_task' ? triggerValue : triggerValue.trim(),
      serviceType: schedulerType === 'system_task' ? 'All' : serviceType,
      templateTitle: resolvedTitle,
      templateBody: resolvedBody,
      notificationCategory: resolvedCategory,
      enabled,
      createdDate: editingId ? (schedulers.find(s => s.id === editingId)?.createdDate || '2026-07-17') : '2026-07-17',
      lastExecutedAt: editingId ? schedulers.find(s => s.id === editingId)?.lastExecutedAt : undefined,
      type: schedulerType,
      linkedRuleId: schedulerType === 'notification' ? linkedRuleId : undefined,
      systemTaskKey: schedulerType === 'system_task' ? systemTaskKey : undefined,
    };

    if (editingId) {
      onUpdateScheduler(schedulerData);
      triggerToast('Proactive Scheduler configurations updated successfully.');
    } else {
      onAddScheduler(schedulerData);
      triggerToast('New secure automated Scheduler registry saved.');
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSchedulerType('notification');
    setTriggerCondition('OnStatusChange');
    setTriggerValue('Overdue');
    setServiceType('All');
    setEnabled(true);
    if (rules.length > 0) {
      setLinkedRuleId(rules[0].id);
    }
    setSystemTaskKey(SYSTEM_BACKEND_TASKS[0].key);
    setShowForm(false);
  };

  const handleToggleEnable = (scheduler: NotificationScheduler) => {
    const updated = {
      ...scheduler,
      enabled: !scheduler.enabled
    };
    onUpdateScheduler(updated);
    triggerToast(`Scheduler "${scheduler.name}" ${!scheduler.enabled ? 'activated' : 'deactivated'}`);
  };

  const getConditionLabel = (sch: NotificationScheduler) => {
    if (sch.type === 'system_task' || sch.triggerCondition === 'CronExpression') {
      return `📅 CRON Schedule: "${sch.triggerValue}"`;
    }
    switch (sch.triggerCondition) {
      case 'DaysBefore':
        return `⏰ Trigger ${sch.triggerValue} days before service`;
      case 'OnStatusChange':
        return `🔄 Trigger when service status changes to "${sch.triggerValue}"`;
      case 'MileageExceeds':
        return `📈 Trigger when mileage exceeds ${Number(sch.triggerValue).toLocaleString()} miles`;
      default:
        return 'Custom trigger';
    }
  };

  // Check how many maintenance records would match this scheduler
  const countMatches = (sch: NotificationScheduler) => {
    if (sch.type === 'system_task') return 0;
    return afterSalesRecords.filter(rec => {
      const matchService = sch.serviceType === 'All' || sch.serviceType === rec.serviceType;
      
      let conditionMet = false;
      if (sch.triggerCondition === 'OnStatusChange') {
        conditionMet = (sch.triggerValue || '').toLowerCase() === (rec.status || '').toLowerCase();
      } else if (sch.triggerCondition === 'DaysBefore') {
        conditionMet = true; // Simulated matches
      } else if (sch.triggerCondition === 'MileageExceeds') {
        conditionMet = rec.mileage >= Number(sch.triggerValue);
      }

      return matchService && conditionMet;
    }).length;
  };

  // Triggering the Scheduler Notification Flow or Background Task
  const handleTriggerNow = (sch: NotificationScheduler) => {
    setExecutingScheduler(sch);
    setExecutionProgress(0);
    setExecutionLogLines([]);
    setExecutionSuppressed(false);
    setExecutionBlockReason(null);
    setExecutionInterpolatedNotification(null);
    setMockSelectedRecord(null);

    if (sch.type === 'system_task' || (!sch.type && sch.notificationCategory === 'SYSTEM_CRON')) {
      // Simulate system backend CRON task
      const task = SYSTEM_BACKEND_TASKS.find(t => t.key === sch.systemTaskKey) || SYSTEM_BACKEND_TASKS[0];
      let lineIndex = 0;
      setExecutionLogLines([`[CRON] Scheduled heartbeat trigger fired for Task ID: ${sch.id}`]);

      const interval = setInterval(() => {
        if (lineIndex < task.logsTemplate.length) {
          setExecutionLogLines(prev => [...prev, task.logsTemplate[lineIndex]]);
          setExecutionProgress(Math.floor(((lineIndex + 1) / task.logsTemplate.length) * 100));
          lineIndex++;
        } else {
          clearInterval(interval);
          setExecutionProgress(100);
          
          // Timestamp update on execution
          const updatedSch = {
            ...sch,
            lastExecutedAt: new Date().toISOString()
          };
          onUpdateScheduler(updatedSch);
          setToastFiredCount(prev => prev + 1);
          triggerToast(`System CRON task "${sch.name}" completed.`);
        }
      }, 350);

    } else {
      // Simulate high-fidelity Notification Flow trigger
      // 1. Identify linked rule
      const linkedRule = rules.find(r => r.id === sch.linkedRuleId) || rules.find(r => (r.notificationKey || r.config[0]?.notificationKey) === sch.notificationCategory) || rules[0];
      const activeRuleKey = linkedRule.notificationKey || linkedRule.config[0]?.notificationKey || linkedRule.id;
      const activeCategoryKey = linkedRule.notificationCategory || linkedRule.config[0]?.notificationCategory || 'ALL';
      
      // 2. Identify matching maintenance record, or fallback to synthetic mock
      const matchedRecords = afterSalesRecords.filter(rec => {
        const matchService = sch.serviceType === 'All' || sch.serviceType === rec.serviceType;
        return matchService;
      });
      const selectedRecord: AfterSalesRecord = matchedRecords.length > 0 ? matchedRecords[0] : {
        id: 'mock_record_99',
        vin: '1HGCR2F8XHA445910',
        vehicleModel: 'Accord Hybrid',
        serviceType: sch.serviceType === 'All' ? 'Periodic Maintenance' : sch.serviceType,
        mileage: 42100,
        scheduledDate: '2026-08-01',
        cost: 145,
        status: 'Scheduled',
        description: 'Simulated diagnostic scheduled parameters.',
        proactiveTriggerStatus: 'Ready'
      };
      setMockSelectedRecord(selectedRecord);

      // 3. Set up log trace
      const initialLogs = [
        `[INGRESS] Outbound scheduler heartbeat triggered. Event Name: "${sch.name}"`,
        `[INGRESS] Context loaded: Vehicle Model: ${selectedRecord.vehicleModel} | VIN: ${selectedRecord.vin}`,
        `[INGRESS] Linked Service: ${selectedRecord.serviceType} | Current Mileage: ${selectedRecord.mileage.toLocaleString()} miles`,
        `[COMPILER] Loading active Rule AST profile ID: ${linkedRule.id} (Key: ${activeRuleKey})`,
        `[COMPILER] Interpolating notification token templates using vehicle parameters...`
      ];
      setExecutionLogLines(initialLogs);

      // 4. Interpolate tokens
      const interpolate = (template: string) => {
        return template
          .replace(/{vehicleModel}/g, selectedRecord.vehicleModel)
          .replace(/{vin}/g, selectedRecord.vin)
          .replace(/{serviceType}/g, selectedRecord.serviceType)
          .replace(/{scheduledDate}/g, selectedRecord.scheduledDate)
          .replace(/{cost}/g, selectedRecord.cost.toString())
          .replace(/{mileage}/g, selectedRecord.mileage.toString());
      };

      const title = interpolate(linkedRule.notificationTitle);
      const body = interpolate(linkedRule.notificationBody);

      setTimeout(() => {
        setExecutionLogLines(prev => [
          ...prev, 
          `[EVAL] Interpolated Title: "${title}"`,
          `[EVAL] Interpolated Body: "${body}"`,
          `[AUDIT] Performing real-time suppression filter check against Edge Cloud Security policies...`
        ]);
        setExecutionProgress(35);
      }, 600);

      // 5. Evaluate Corporate Suppressions (BusinessFilters) & user consent preferences (UserSettings)
      setTimeout(() => {
        // Look for business filter matching category or key
        const blockFilter = businessFilters.find(f => 
          f.enabled && 
          f.action === 'BLOCK' && 
          (f.notificationCategory === 'All' || f.notificationCategory === activeCategoryKey) &&
          (f.notificationKey === 'All' || !f.notificationKey || f.notificationKey === activeRuleKey) &&
          (f.vehicleModel === 'All' || f.vehicleModel.toLowerCase() === selectedRecord.vehicleModel.toLowerCase())
        );

        const userMute = userSettings.find(s => 
          !s.enabled && 
          s.vin === selectedRecord.vin && 
          (s.notificationCategory === activeCategoryKey || s.notificationCategory === 'All')
        );

        let suppressed = false;
        let reason = null;

        if (blockFilter) {
          suppressed = true;
          reason = {
            type: 'BUSINESS_FILTER',
            message: `Blocked by corporate safety override policy filter "${blockFilter.name}" (ID: ${blockFilter.id})`
          };
        } else if (userMute) {
          suppressed = true;
          reason = {
            type: 'USER_SETTING',
            message: `Blocked by Subscriber privacy opt-out mute setting for VIN: ${selectedRecord.vin}`
          };
        }

        setExecutionSuppressed(suppressed);
        setExecutionBlockReason(reason);
        setExecutionInterpolatedNotification({
          title,
          body,
          criticality: linkedRule.criticality
        });

        if (suppressed) {
          setExecutionLogLines(prev => [
            ...prev,
            `[GATEWAY] ❌ DISPATCH BLOCKED!`,
            `[GATEWAY] Suppression reason: ${reason?.message}`,
            `[GATEWAY] Notification suppressed from transmission. Logging event to security audit ledger.`
          ]);
          setExecutionProgress(100);
          triggerToast(`Execution completed: Suppressed by policy.`);
        } else {
          setExecutionLogLines(prev => [
            ...prev,
            `[GATEWAY] 🟢 PASSED SAFETY CHECKS. Suppressions audit: 0 blocks found.`,
            `[GATEWAY] Establishing telematics stream handshake with recipient devices...`,
            `[DISPATCH] Generating secure JSON push notifications packets...`,
            `[DISPATCH] Packets routed through Apple APNS & Google FCM clusters.`,
            `[DELIVERY] Outbound transmission successful. Recipient devices: SMARTPHONE, SMARTWATCH, CAR_HUD`,
            `[SUCCESS] Notification flow executed successfully. Device callback received: delivered_ack.`
          ]);
          setExecutionProgress(100);
          setToastFiredCount(prev => prev + 1);
          triggerToast(`Push notification triggered successfully!`);
        }

        // Add real-time log back to App.tsx central simulation log history
        const simulationLog: SimulationLog = {
          id: `log_sch_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
          vin: selectedRecord.vin,
          commandId: `sch_trigger_${sch.id}`,
          executionStatus: suppressed ? 'BLOCKED_SUPPRESSED' : 'SUCCESS_DISPATCHED',
          eventPayload: {
            triggered_by_scheduler: sch.name,
            linked_notification_key: activeRuleKey,
            maintenance_record: selectedRecord
          },
          success: !suppressed,
          blockedReason: suppressed && reason ? {
            type: reason.type as any,
            message: reason.message,
          } : undefined,
          matchedRules: [{
            ruleId: linkedRule.id,
            ruleName: linkedRule.name,
            notificationKey: activeRuleKey,
            criticality: linkedRule.criticality,
            priority: linkedRule.priority,
            conditionEvaluations: [{
              conditionId: 'sch_cond',
              fieldPath: 'scheduler.trigger',
              operator: sch.triggerCondition,
              expectedValue: sch.triggerValue,
              actualValue: selectedRecord.status || selectedRecord.mileage,
              passed: true
            }]
          }],
          pushNotificationPayload: suppressed ? null : {
            notification: {
              title,
              body,
              sound: linkedRule.sound,
              criticality: linkedRule.criticality
            },
            data: {
              scheduler_source: sch.id,
              notification_key: activeRuleKey,
              vin: selectedRecord.vin
            }
          }
        };

        onAddLog(simulationLog);

        // Update scheduler timestamp
        const updatedSch = {
          ...sch,
          lastExecutedAt: new Date().toISOString()
        };
        onUpdateScheduler(updatedSch);

      }, 1200);
    }
  };

  // Filtered schedulers list
  const filteredSchedulers = schedulers.filter(sch => {
    const matchesSearch = sch.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sch.notificationCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sch.systemTaskKey && sch.systemTaskKey.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isNotificationType = sch.type === 'notification' || (!sch.type && sch.notificationCategory !== 'SYSTEM_CRON');
    const isSystemType = sch.type === 'system_task' || sch.notificationCategory === 'SYSTEM_CRON';

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'notification') return matchesSearch && isNotificationType;
    if (activeTab === 'system_task') return matchesSearch && isSystemType;
    return matchesSearch;
  });

  const selectedRuleObject = rules.find(r => r.id === linkedRuleId) || rules[0];

  return (
    <div id="mature-scheduler-root" className="space-y-6 font-sans">
      
      {/* GLAM HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/10 rounded-full blur-3xl -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 bg-fuchsia-500/5 rounded-full blur-2xl -ml-6 -mb-6" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-md">
              <Sliders className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-full">Proactive Engine</span>
                <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full">v2.4.0 Secure</span>
              </div>
              <h1 className="text-lg font-bold font-display text-slate-100 tracking-tight mt-1.5">Edge Operations Scheduler Center</h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl font-sans">
                Establish secure event-driven rules to push outbound notifications or configure cron-based background system processes. Directly simulate active data pipeline ingress and delivery alerts across devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-indigo-400 rounded-xl border border-slate-850">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase font-mono text-slate-500">Total Schedulers</div>
            <div className="text-base font-bold text-slate-100 font-mono mt-0.5">{schedulers.length}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-indigo-400 rounded-xl border border-slate-850">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase font-mono text-slate-500">Alert Flows</div>
            <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {schedulers.filter(s => s.type === 'notification' || (!s.type && s.notificationCategory !== 'SYSTEM_CRON')).length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-indigo-400 rounded-xl border border-slate-850">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase font-mono text-slate-500">System CRONs</div>
            <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {schedulers.filter(s => s.type === 'system_task' || s.notificationCategory === 'SYSTEM_CRON').length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5 shadow-sm">
          <div className="p-2.5 bg-slate-950 text-emerald-400 rounded-xl border border-slate-850">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase font-mono text-slate-500">Triggered (Session)</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{toastFiredCount} runs</div>
          </div>
        </div>
      </div>

      {/* FILTER & CREATION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-850 pb-4">
        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-950 border border-slate-850 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition uppercase tracking-wide ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Schedulers
          </button>
          <button
            onClick={() => setActiveTab('notification')}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition uppercase tracking-wide flex items-center space-x-1.5 ${
              activeTab === 'notification'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Alert Flows</span>
          </button>
          <button
            onClick={() => setActiveTab('system_task')}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition uppercase tracking-wide flex items-center space-x-1.5 ${
              activeTab === 'system_task'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>System Tasks</span>
          </button>
        </div>

        {/* Search & Add action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search schedulers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono w-48 sm:w-64"
            />
          </div>

          <button
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono rounded-xl shadow-md transition-all uppercase tracking-wide shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{showForm && !editingId ? "CLOSE ENGINE FORM" : "CREATE NEW SCHEDULER"}</span>
          </button>
        </div>
      </div>

      {/* DETAILED ENGINE CONFIGURATION FORM */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-spin-slow" />
              <span>{editingId ? "Update Operations Scheduler Rule" : "Register Automated Scheduler Sequence"}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-500 hover:text-slate-300 transition"
              title="Cancel Configuration"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Tab - Scheduler Category Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-2">
              SCHEDULER ENGINE TYPE *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSchedulerType('notification');
                  setTriggerCondition('OnStatusChange');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                  schedulerType === 'notification'
                    ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <Bell className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold font-mono uppercase tracking-wide">Device Notification Flow</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">Links with existing central rules list to simulate push alerts dispatching on user handsets.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSchedulerType('system_task');
                  setTriggerCondition('CronExpression');
                  setTriggerValue('0 0 * * *');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                  schedulerType === 'system_task'
                    ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <Server className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold font-mono uppercase tracking-wide">Background Backend Task</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">Executes pre-configured system cron jobs (DB cleanups, archives, cache purges) on server clusters.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Scheduler Core fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                Scheduler Rule Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={schedulerType === 'notification' ? "e.g., Critical Break Pad Replacement Automated Flow" : "e.g., Midnight Log Purge & Vacuum Thread"}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Depending on Scheduler Type, select Linked Rule or Predefined System Task */}
            {schedulerType === 'notification' ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
                  <span>Linked Active Rule *</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-indigo-950 text-indigo-400 rounded uppercase font-bold font-mono">READ-ONLY</span>
                </label>
                <select
                  required
                  value={linkedRuleId}
                  onChange={(e) => setLinkedRuleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-[11px] cursor-pointer"
                >
                  {rules.map(rule => {
                    const nk = rule.notificationKey || rule.config[0]?.notificationKey || rule.id;
                    return (
                      <option key={rule.id} value={rule.id}>
                        🔑 [{nk}] {rule.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                  Select Predefined System Task *
                </label>
                <select
                  required
                  value={systemTaskKey}
                  onChange={(e) => {
                    setSystemTaskKey(e.target.value);
                    const task = SYSTEM_BACKEND_TASKS.find(t => t.key === e.target.value);
                    if (task) {
                      setTriggerValue(task.defaultCron);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-[11px] cursor-pointer"
                >
                  {SYSTEM_BACKEND_TASKS.map(task => (
                    <option key={task.key} value={task.key}>
                      💾 {task.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* DYNAMIC RULE SUMMARY DISPLAY (If Notification Flow is linked, no new rule editing) */}
          {schedulerType === 'notification' && selectedRuleObject && (
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase font-mono text-indigo-400">Linked Central Rules Metadata</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">{selectedRuleObject.name}</h4>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-[9px]">
                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                    selectedRuleObject.criticality === 'CRITICAL' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' :
                    selectedRuleObject.criticality === 'MAJOR' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {selectedRuleObject.criticality}
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-bold uppercase bg-slate-900 text-slate-400">
                    Priority: {selectedRuleObject.priority}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-sans italic">{selectedRuleObject.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-900">
                <div className="space-y-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/60">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Simulated Notification Headline:</span>
                  <div className="text-slate-300 font-semibold leading-snug">{selectedRuleObject.notificationTitle}</div>
                </div>
                <div className="space-y-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/60">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Simulated Notification Content Body:</span>
                  <div className="text-slate-400 leading-normal text-[11px]">{selectedRuleObject.notificationBody}</div>
                </div>
              </div>

              {/* Conditions list */}
              <div className="bg-slate-900/20 p-2.5 rounded-lg border border-slate-900/40 space-y-1 text-[10px] font-mono">
                <div className="text-slate-500 uppercase font-bold text-[8px] tracking-wide">Compiled Trigger Condition Evaluators</div>
                {selectedRuleObject.conditions.map((cond, idx) => (
                  <div key={cond.id || idx} className="text-slate-400 flex items-center space-x-1">
                    <span className="text-indigo-400 font-bold">✓</span>
                    <span>{cond.fieldPath}</span>
                    <span className="text-indigo-500/70 font-bold uppercase">{cond.operator}</span>
                    <span className="text-slate-200">"{cond.value}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BACKGROUND SYSTEM TASK CARD DESCRIPTION */}
          {schedulerType === 'system_task' && (
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start space-x-3.5">
              <div className="p-3 bg-indigo-950/50 border border-indigo-900/50 rounded-xl text-indigo-400 shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase font-mono text-indigo-400">Pre-Configured Backend Daemon Job</span>
                <h4 className="text-xs font-bold text-slate-200">
                  {SYSTEM_BACKEND_TASKS.find(t => t.key === systemTaskKey)?.name}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {SYSTEM_BACKEND_TASKS.find(t => t.key === systemTaskKey)?.description}
                </p>
              </div>
            </div>
          )}

          {/* TRIGGER TRIGGERS SETTINGS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {schedulerType === 'notification' ? (
              <>
                {/* Condition Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                    Maintenance Trigger Type *
                  </label>
                  <select
                    value={triggerCondition}
                    onChange={(e) => {
                      setTriggerCondition(e.target.value as any);
                      if (e.target.value === 'OnStatusChange') setTriggerValue('Overdue');
                      else if (e.target.value === 'DaysBefore') setTriggerValue('7');
                      else if (e.target.value === 'MileageExceeds') setTriggerValue('40000');
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                  >
                    <option value="OnStatusChange">Status Match</option>
                    <option value="DaysBefore">Days Remaining Before Service</option>
                    <option value="MileageExceeds">Mileage Exceeds Target</option>
                  </select>
                </div>

                {/* Trigger Value */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                    Trigger Threshold Value *
                  </label>
                  {triggerCondition === 'OnStatusChange' ? (
                    <select
                      value={triggerValue}
                      onChange={(e) => setTriggerValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={triggerValue}
                      onChange={(e) => setTriggerValue(e.target.value)}
                      placeholder={triggerCondition === 'DaysBefore' ? "e.g., 7" : "e.g., 40000"}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  )}
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                    Linked Maintenance Service
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                  >
                    {serviceTypes.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* System Task Schedules - CRON expression selector */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                    Background Schedule CRON Presets *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTriggerValue('*/5 * * * *')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-mono transition ${
                        triggerValue === '*/5 * * * *' ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400 font-bold' : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Every 5 Minutes (*/5 * * * *)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriggerValue('0 * * * *')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-mono transition ${
                        triggerValue === '0 * * * *' ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400 font-bold' : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Hourly (0 * * * *)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriggerValue('0 0 * * *')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-mono transition ${
                        triggerValue === '0 0 * * *' ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400 font-bold' : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Daily at Midnight (0 0 * * *)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriggerValue('0 1 * * 0')}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-mono transition ${
                        triggerValue === '0 1 * * 0' ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400 font-bold' : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Weekly on Sunday (0 1 * * 0)
                    </button>
                  </div>
                </div>

                {/* Custom CRON Expression */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1.5">
                    CRON Expression Trigger *
                  </label>
                  <input
                    type="text"
                    required
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                    placeholder="e.g. */15 * * * *"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-indigo-400 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">5-field cron syntax expected</span>
                </div>
              </>
            )}
          </div>

          {/* Enabled Switch & Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-slate-850">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className="text-slate-400 focus:outline-none"
              >
                {enabled ? (
                  <ToggleRight className="h-8 w-8 text-indigo-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-600" />
                )}
              </button>
              <div>
                <span className="text-[10px] font-bold text-slate-200 uppercase font-mono block">
                  Scheduler Active
                </span>
                <span className="text-[9px] text-slate-500 block leading-none">
                  Triggers dynamically when matching conditions are registered.
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-1.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 rounded-xl text-xs font-bold font-mono transition"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition shadow-md"
              >
                {editingId ? "UPDATE SCHEDULER ENGINE" : "SAVE SECURE SCHEDULER"}
              </button>
            </div>
          </div>

        </form>
      )}

      {/* ACTIVE RUNTIME PIPELINE RUNNER SIMULATOR (DOCK) */}
      {executingScheduler && (
        <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-bounce-short">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
              <div>
                <span className="text-[9px] font-bold uppercase font-mono text-indigo-400 tracking-wider">Active Pipeline Ingress Execution</span>
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">{executingScheduler.name}</h3>
              </div>
            </div>

            <button
              onClick={() => {
                setExecutingScheduler(null);
                setExecutionProgress(0);
                setExecutionLogLines([]);
              }}
              className="text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 transition"
            >
              CLOSE SIMULATOR DOCK
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDE: Terminal Console Logs Output */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono text-slate-400 flex items-center uppercase">
                  <TerminalIcon className="h-4 w-4 mr-1.5 text-indigo-400" />
                  Live Operational Logs console
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{executionProgress}% COMPLETE</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" 
                  style={{ width: `${executionProgress}%` }}
                />
              </div>

              {/* Terminal window */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10.5px] text-slate-300 leading-relaxed overflow-y-auto max-h-[300px] shadow-inner h-64 border-l-2 border-l-indigo-500">
                <div className="space-y-1.5">
                  {executionLogLines.map((line, idx) => {
                    let color = 'text-slate-300';
                    if (line.includes('[SUCCESS]') || line.includes('🟢')) color = 'text-emerald-400 font-bold';
                    else if (line.includes('[SQL]') || line.includes('[QUERY]')) color = 'text-indigo-300';
                    else if (line.includes('WARNING') || line.includes('[ALERT]')) color = 'text-amber-400 font-bold';
                    else if (line.includes('[GATEWAY]')) color = 'text-sky-400';
                    else if (line.includes('[CONN]') || line.includes('[BACKUP]')) color = 'text-teal-400';
                    else if (line.includes('❌') || line.includes('suppressed')) color = 'text-rose-400 font-bold';

                    return (
                      <div key={idx} className={color}>
                        {line}
                      </div>
                    );
                  })}
                  {executionProgress < 100 && (
                    <div className="text-indigo-400 animate-pulse font-bold flex items-center space-x-1">
                      <span>⚡</span>
                      <span className="border-r-2 border-indigo-400 animate-blink">RUNNING_TASK_THREAD...</span>
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Device alerts & Supression indicators */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              
              {/* If Notification Type Scheduler */}
              {(executingScheduler.type === 'notification' || (!executingScheduler.type && executingScheduler.notificationCategory !== 'SYSTEM_CRON')) ? (
                <div className="space-y-3 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-slate-400 flex items-center uppercase mb-2">
                      <Smartphone className="h-4 w-4 mr-1.5 text-indigo-400" />
                      Audited Mobile Delivery Device Mockups
                    </span>
                    
                    {/* Filter Tabs for Devices */}
                    <div className="flex space-x-1 p-0.5 bg-slate-900 border border-slate-850 rounded-lg mb-3">
                      <button
                        onClick={() => setActiveTabSimDevice('phone')}
                        className={`flex-1 py-1 text-[10px] font-bold font-mono rounded transition uppercase ${
                          activeTabSimDevice === 'phone' ? 'bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        iPhone 16 Pro
                      </button>
                      <button
                        onClick={() => setActiveTabSimDevice('watch')}
                        className={`flex-1 py-1 text-[10px] font-bold font-mono rounded transition uppercase ${
                          activeTabSimDevice === 'watch' ? 'bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Apple Watch
                      </button>
                      <button
                        onClick={() => setActiveTabSimDevice('car')}
                        className={`flex-1 py-1 text-[10px] font-bold font-mono rounded transition uppercase ${
                          activeTabSimDevice === 'car' ? 'bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Car HUD
                      </button>
                    </div>
                  </div>

                  {/* Device Screens */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center min-h-[220px]">
                    {executionInterpolatedNotification ? (
                      executionSuppressed ? (
                        /* Suppressed Block State */
                        <div className="text-center space-y-2 max-w-[240px] animate-fade-in">
                          <div className="h-10 w-10 bg-rose-950/40 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="text-[10px] font-bold font-mono text-rose-400 uppercase tracking-wider">Alert Blocked at Edge Gateway</div>
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                            {executionBlockReason?.message}
                          </p>
                          <span className="text-[9px] px-2 py-0.5 bg-slate-950 text-slate-500 border border-slate-850 rounded font-mono uppercase font-bold block mt-1">Status: SUPPRESSED</span>
                        </div>
                      ) : (
                        /* Delivered Screens */
                        <div className="w-full h-full flex flex-col items-center justify-center animate-bounce-short">
                          
                          {/* iPhone Render */}
                          {activeTabSimDevice === 'phone' && (
                            <div className="relative w-[240px] h-[190px] bg-slate-950 rounded-[24px] border-4 border-slate-800 p-2 overflow-hidden shadow-xl">
                              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-10" />
                              <div className="w-full h-full rounded-[18px] bg-gradient-to-b from-indigo-950/20 to-slate-950 p-2 flex flex-col justify-start relative pt-4 font-sans select-none text-left">
                                <div className="text-[9px] text-slate-500 font-mono text-center">11:39 AM • 🟢 SDV Live</div>
                                
                                {/* Push alert bubble */}
                                <div className="mt-3 bg-slate-900 border border-slate-850 p-2.5 rounded-xl shadow-lg space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8.5px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center space-x-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                      <span>Gateway Alert</span>
                                    </span>
                                    <span className="text-[7.5px] text-slate-500">just now</span>
                                  </div>
                                  <h4 className="text-[9.5px] font-bold text-slate-200 leading-snug">{executionInterpolatedNotification.title}</h4>
                                  <p className="text-[8.5px] text-slate-400 leading-snug">{executionInterpolatedNotification.body}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Watch Render */}
                          {activeTabSimDevice === 'watch' && (
                            <div className="relative w-[150px] h-[150px] bg-slate-950 rounded-[28px] border-[6px] border-slate-800 p-2.5 overflow-hidden shadow-xl ring-2 ring-indigo-900/20">
                              <div className="w-full h-full rounded-[18px] bg-gradient-to-b from-slate-950 to-indigo-950/20 flex flex-col justify-start items-center p-1 relative text-center">
                                <div className="p-1 bg-indigo-600 rounded text-[6px] font-extrabold text-white uppercase mb-1">SDV DIRECT</div>
                                <h4 className="text-[8.5px] font-extrabold text-slate-200 leading-tight truncate w-full">{executionInterpolatedNotification.title}</h4>
                                <p className="text-[7.5px] text-slate-400 leading-normal mt-1 max-h-[60px] overflow-hidden leading-tight line-clamp-3">{executionInterpolatedNotification.body}</p>
                              </div>
                            </div>
                          )}

                          {/* Vehicle Car HUD Render */}
                          {activeTabSimDevice === 'car' && (
                            <div className="relative w-[280px] h-[140px] bg-slate-950 rounded-[12px] border-4 border-slate-800 p-2.5 overflow-hidden shadow-xl">
                              <div className="w-full h-full rounded-[6px] bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-2.5 flex items-center justify-between relative font-sans text-left">
                                <div className="space-y-1 max-w-[150px]">
                                  <span className="text-[8px] font-bold text-emerald-400 uppercase font-mono px-1.5 py-0.5 bg-emerald-950 rounded-full border border-emerald-900">In-Car HUD Alert</span>
                                  <h4 className="text-[9.5px] font-bold text-slate-100 leading-tight">{executionInterpolatedNotification.title}</h4>
                                  <p className="text-[8px] text-slate-400 line-clamp-2 leading-snug">{executionInterpolatedNotification.body}</p>
                                </div>
                                
                                <div className="border border-indigo-500/20 bg-indigo-950/25 p-2 rounded-lg flex flex-col items-center justify-center space-y-1 shrink-0 select-none max-w-[80px]">
                                  <Tv className="h-4 w-4 text-indigo-400" />
                                  <span className="text-[7.5px] font-mono text-indigo-300 font-bold uppercase text-center truncate w-full">Headunit Sys</span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      )
                    ) : (
                      <div className="text-center space-y-2 text-slate-500">
                        <Smartphone className="h-7 w-7 mx-auto text-slate-700 animate-pulse" />
                        <div className="text-[10px] font-mono">WAITING_FOR_DELIVERY_STREAM...</div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* System task summaries */
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 h-full flex flex-col justify-center">
                  <div className="text-center space-y-2">
                    <div className="h-10 w-10 bg-indigo-950 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                      <Cpu className="h-5 w-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">SYSTEM DAEMON JOB ACTIVE</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                      Executing automated administrative CRON threads directly in the background clusters of your server. All telemetry actions are secured.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* DETAILED SCHEDULERS BENTO GRID LIST */}
      <div className="grid grid-cols-1 gap-4 font-sans">
        {filteredSchedulers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <Sliders className="h-8 w-8 text-slate-600 mx-auto" />
            <div className="text-xs font-bold text-slate-400 uppercase font-mono">No Matching Schedulers Found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Modify search filters, browse categories, or register a new scheduler to trigger automated notifications or cron jobs.
            </p>
          </div>
        ) : (
          filteredSchedulers.map((sch) => {
            const matchCount = countMatches(sch);
            const isSystemCron = sch.type === 'system_task' || sch.notificationCategory === 'SYSTEM_CRON';
            
            return (
              <div 
                key={sch.id} 
                className={`bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-150 flex flex-col md:flex-row md:items-start justify-between gap-5 border-slate-800 ${
                  sch.enabled ? '' : 'opacity-65 border-slate-900 bg-slate-950/45'
                }`}
              >
                {/* Details pane */}
                <div className="space-y-3 flex-1">
                  
                  {/* Name and Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-200 font-mono tracking-wide uppercase">
                      {sch.name}
                    </h3>
                    
                    {/* Badge type */}
                    {isSystemCron ? (
                      <span className="text-[9px] font-mono font-bold bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Cpu className="h-3 w-3 shrink-0" />
                        <span>System CRON</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Bell className="h-3 w-3 shrink-0" />
                        <span>Notification Flow</span>
                      </span>
                    )}

                    {/* Delivery Category */}
                    <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md text-slate-400">
                      📬 Category: {sch.notificationCategory}
                    </span>

                    {sch.enabled ? (
                      <span className="text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg uppercase">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold font-mono bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded-lg uppercase">
                        DISABLED
                      </span>
                    )}
                  </div>

                  {/* Conditions & parameters labels */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-mono">
                    <span className="bg-slate-950/50 border border-slate-850 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>{getConditionLabel(sch)}</span>
                    </span>
                    {!isSystemCron && (
                      <span className="bg-slate-950/50 border border-slate-850 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                        <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>Service: <strong className="text-slate-200">{sch.serviceType}</strong></span>
                      </span>
                    )}
                  </div>

                  {/* Notification outline displays */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-xs">
                    <div className="text-slate-300 font-semibold leading-normal flex items-start">
                      <span className="text-[9px] text-slate-500 uppercase font-mono mr-1.5 mt-0.5 shrink-0">Title template:</span> 
                      <span className="font-sans text-[11px] font-medium">{sch.templateTitle}</span>
                    </div>
                    <div className="text-slate-400 leading-normal flex items-start">
                      <span className="text-[9px] text-slate-500 uppercase font-mono mr-1.5 mt-0.5 shrink-0">Body template:</span> 
                      <span className="font-sans text-[11px]">{sch.templateBody}</span>
                    </div>
                  </div>

                  {/* Performance stats lines */}
                  <div className="text-[9px] text-slate-500 font-mono flex flex-wrap items-center gap-4">
                    <span>Created on: {sch.createdDate}</span>
                    {sch.lastExecutedAt ? (
                      <span className="text-indigo-400 font-bold">⏱ Last Executed: {new Date(sch.lastExecutedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    ) : (
                      <span>Never Executed</span>
                    )}
                    {matchCount > 0 && (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <Check className="h-3 w-3" />
                        <span>Currently matches {matchCount} user records</span>
                      </span>
                    )}
                  </div>

                </div>

                {/* Operations column */}
                <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 self-end md:self-stretch justify-between">
                  
                  {/* Status switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleEnable(sch)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition flex items-center space-x-1.5 text-[10px] font-mono font-bold"
                    title={sch.enabled ? "Deactivate Scheduler Outbound" : "Activate Scheduler Outbound"}
                  >
                    {sch.enabled ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-indigo-500 shrink-0" />
                        <span className="hidden sm:inline">ONLINE</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-slate-600 shrink-0" />
                        <span className="hidden sm:inline">OFFLINE</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* TRIGGER NOW */}
                    <button
                      type="button"
                      onClick={() => handleTriggerNow(sch)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold font-mono rounded-xl shadow-md transition-all flex items-center space-x-1"
                      title="Trigger scheduler simulation pipeline"
                    >
                      <Play className="h-3 w-3 shrink-0 fill-current" />
                      <span>{isSystemCron ? 'RUN TASK' : 'RUN FLOW'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditClick(sch)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition"
                      title="Edit Outbound Scheduler Settings"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteScheduler(sch.id)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition"
                      title="Remove Scheduler Sequence"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

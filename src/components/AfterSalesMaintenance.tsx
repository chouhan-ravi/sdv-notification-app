import React, { useState } from 'react';
import { AfterSalesRecord, NotificationScheduler, SimulationLog } from '../types';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Calendar, 
  DollarSign, 
  Sparkles,
  RefreshCw,
  Eye,
  Settings,
  AlertCircle
} from 'lucide-react';

interface AfterSalesMaintenanceProps {
  records: AfterSalesRecord[];
  schedulers: NotificationScheduler[];
  onAddRecord: (record: AfterSalesRecord) => void;
  onUpdateRecord: (record: AfterSalesRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddLog: (log: SimulationLog) => void;
  triggerToast: (msg: string) => void;
}

export default function AfterSalesMaintenance({
  records,
  schedulers,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onAddLog,
  triggerToast
}: AfterSalesMaintenanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [vin, setVin] = useState('1HGBH4F00000001');
  const [vehicleModel, setVehicleModel] = useState('Civic');
  const [serviceType, setServiceType] = useState('Periodic Maintenance');
  const [mileage, setMileage] = useState(45000);
  const [scheduledDate, setScheduledDate] = useState('');
  const [cost, setCost] = useState(150);
  const [status, setStatus] = useState<'Scheduled' | 'In Progress' | 'Completed' | 'Overdue'>('Scheduled');
  const [description, setDescription] = useState('');
  const [proactiveTriggerStatus, setProactiveTriggerStatus] = useState<'Ready' | 'Triggered' | 'Muted' | 'Done'>('Ready');

  const serviceTypes = [
    'Periodic Maintenance',
    'Brake Pad Replacement',
    'Battery Health Check',
    'Software Update',
    'Recall Action',
    'Custom Repair'
  ];

  const handleEditClick = (record: AfterSalesRecord) => {
    setEditingId(record.id);
    setVin(record.vin);
    setVehicleModel(record.vehicleModel);
    setServiceType(record.serviceType);
    setMileage(record.mileage);
    setScheduledDate(record.scheduledDate);
    setCost(record.cost);
    setStatus(record.status);
    setDescription(record.description);
    setProactiveTriggerStatus(record.proactiveTriggerStatus);
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin.trim() || !vehicleModel.trim() || !scheduledDate) {
      alert('Please fill out all mandatory fields: VIN, Model, and Scheduled Date.');
      return;
    }

    const recordData: AfterSalesRecord = {
      id: editingId || `asr_${Math.random().toString(36).substring(2, 9)}`,
      vin: vin.trim(),
      vehicleModel: vehicleModel.trim(),
      serviceType,
      mileage: Number(mileage),
      scheduledDate,
      cost: Number(cost),
      status,
      description,
      proactiveTriggerStatus,
      lastTriggeredAt: editingId ? records.find(r => r.id === editingId)?.lastTriggeredAt : undefined
    };

    if (editingId) {
      onUpdateRecord(recordData);
      triggerToast('Maintenance record updated successfully.');
    } else {
      onAddRecord(recordData);
      triggerToast('New maintenance record saved.');
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setVin('1HGBH4F00000001');
    setVehicleModel('Civic');
    setServiceType('Periodic Maintenance');
    setMileage(45000);
    setScheduledDate('');
    setCost(150);
    setStatus('Scheduled');
    setDescription('');
    setProactiveTriggerStatus('Ready');
    setShowForm(false);
  };

  // Run the proactive schedulers matching this maintenance record
  const handleTriggerProactiveNotification = (record: AfterSalesRecord) => {
    // Find schedulers that are active, enabled, and match the serviceType (or "All")
    const matchingSchedulers = schedulers.filter(sch => {
      if (!sch.enabled) return false;
      const matchService = sch.serviceType === 'All' || sch.serviceType === record.serviceType;
      
      let conditionMet = false;
      if (sch.triggerCondition === 'OnStatusChange') {
        conditionMet = sch.triggerValue.toLowerCase() === record.status.toLowerCase();
      } else if (sch.triggerCondition === 'DaysBefore') {
        // Simple mock matching for DaysBefore or treat as trigger-ready
        conditionMet = true; 
      } else if (sch.triggerCondition === 'MileageExceeds') {
        conditionMet = record.mileage >= Number(sch.triggerValue);
      }

      return matchService && conditionMet;
    });

    if (matchingSchedulers.length === 0) {
      triggerToast(`⚠️ No enabled schedulers match "${record.serviceType}" with status [${record.status}].`);
      return;
    }

    // Generate push notifications for all matching schedulers
    matchingSchedulers.forEach(sch => {
      // Interpolate templates
      const interpolate = (tmpl: string) => {
        return tmpl
          .replace(/{vehicleModel}/g, record.vehicleModel)
          .replace(/{vin}/g, record.vin)
          .replace(/{serviceType}/g, record.serviceType)
          .replace(/{scheduledDate}/g, record.scheduledDate)
          .replace(/{cost}/g, String(record.cost))
          .replace(/{mileage}/g, String(record.mileage));
      };

      const title = interpolate(sch.templateTitle);
      const body = interpolate(sch.templateBody);

      // Create simulator event log
      const logId = `log_${Math.random().toString(36).substring(2, 9)}`;
      const newLog: SimulationLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        vin: record.vin,
        commandId: `cmd_proactive_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        executionStatus: 'DELIVERED',
        eventPayload: {
          event_type: 'AFTER_SALES_PROACTIVE_ALERT',
          vin: record.vin,
          vehicle_model: record.vehicleModel,
          triggered_by_scheduler: sch.name,
          maintenance_record_id: record.id,
          service_type: record.serviceType,
          current_mileage: record.mileage
        },
        success: true,
        matchedRules: [
          {
            ruleId: sch.id,
            ruleName: sch.name,
            ruleKey: `PROACTIVE_${record.serviceType.replace(/\s+/g, '_').toUpperCase()}`,
            criticality: 'MAJOR',
            priority: 'high',
            conditionEvaluations: [
              {
                conditionId: 'cond_p1',
                fieldPath: 'scheduler.trigger_condition',
                operator: 'equals',
                expectedValue: sch.triggerCondition,
                actualValue: sch.triggerCondition,
                passed: true
              }
            ]
          }
        ],
        pushNotificationPayload: {
          notification: {
            title,
            body,
            sound: 'ringtone_proactive_alert.mp3'
          },
          data: {
            category: sch.categoryKey,
            vin: record.vin,
            record_id: record.id,
            action_url: '/after-sales/maintenance'
          }
        }
      };

      onAddLog(newLog);
    });

    // Update the record's proactive trigger status to "Triggered"
    const updatedRecord: AfterSalesRecord = {
      ...record,
      proactiveTriggerStatus: 'Triggered',
      lastTriggeredAt: new Date().toISOString()
    };
    onUpdateRecord(updatedRecord);

    triggerToast(`🔥 Dispatched proactive notifications via ${matchingSchedulers.length} scheduler matches.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'In Progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Overdue': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const filteredRecords = records.filter(rec => {
    const matchesSearch = rec.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    const matchesService = serviceFilter === 'ALL' || rec.serviceType === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div id="after-sales-screen-root" className="space-y-6">
      
      {/* SCREEN BRIEF CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-950 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase font-mono text-slate-200 tracking-wider">After-Sales & Maintenance Operations Center</h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl font-sans">
              Track campaigns, campaign recall ingress, regular shop maintenance items, and trigger proactive notification streams on top of telemetry events. Add service records here and connect them to scheduler workflows.
            </p>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* SEARCH */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search VIN, model, desk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* STATUS */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="h-3 w-3 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] text-slate-300 focus:outline-none font-bold font-mono"
            >
              <option value="ALL" className="bg-slate-950">ALL STATUSES</option>
              <option value="Scheduled" className="bg-slate-950">SCHEDULED</option>
              <option value="In Progress" className="bg-slate-950">IN PROGRESS</option>
              <option value="Completed" className="bg-slate-950">COMPLETED</option>
              <option value="Overdue" className="bg-slate-950">OVERDUE</option>
            </select>
          </div>

          {/* SERVICE FILTER */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Wrench className="h-3 w-3 text-slate-500" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] text-slate-300 focus:outline-none font-bold font-mono"
            >
              <option value="ALL" className="bg-slate-950">ALL SERVICE TYPES</option>
              {serviceTypes.map(st => (
                <option key={st} value={st} className="bg-slate-950">{st.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CREATE BTN */}
        <button
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm && !editingId ? "CLOSE FORM" : "ADD SERVICE RECORD"}</span>
        </button>

      </div>

      {/* EXPANDABLE ADD/EDIT FORM */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{editingId ? "Edit Maintenance Record Details" : "Register New Shop Maintenance Event"}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-mono text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* VIN */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Vehicle VIN *
              </label>
              <select
                value={vin}
                onChange={(e) => {
                  setVin(e.target.value);
                  // Match model
                  if (e.target.value === '1HGBH4F00000001') setVehicleModel('Civic');
                  else if (e.target.value === '5YJSA1E100000002') setVehicleModel('Model S');
                  else if (e.target.value === '5YJYG1E100000003') setVehicleModel('Model Y');
                  else if (e.target.value === '5YJ3E1EA00000004') setVehicleModel('Model 3');
                }}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="1HGBH4F00000001">1HGBH4F00000001 (Civic)</option>
                <option value="5YJSA1E100000002">5YJSA1E100000002 (Model S)</option>
                <option value="5YJYG1E100000003">5YJYG1E100000003 (Model Y)</option>
                <option value="5YJ3E1EA00000004">5YJ3E1EA00000004 (Model 3)</option>
                <option value="CUSTOM_VIN_MOCK">CUSTOM_VIN_MOCK</option>
              </select>
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Vehicle Model *
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g., Civic"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Service/Campaign Type *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
              >
                {serviceTypes.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Mileage (miles)
              </label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Scheduled Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Scheduled Service Date *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Service Charge ($ USD)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Current Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
                Campaign Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
              Shop Operation Notes / Service Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical audit actions, mechanical details, or target parts..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-850">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-1.5 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 rounded-lg text-xs font-bold font-mono transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono transition"
            >
              {editingId ? "UPDATE RECORD" : "SAVE NEW RECORD"}
            </button>
          </div>
        </form>
      )}

      {/* RECORDS LIST CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="h-4.5 w-4.5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">Registered Campaigns & Inspections Log</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 border border-slate-800 text-slate-400 rounded">
            {filteredRecords.length} of {records.length} Records
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-sans">
            <AlertCircle className="h-8 w-8 text-slate-500 mx-auto" />
            <h4 className="text-slate-300 font-bold text-xs">No Maintenance Records Found</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              No service logs matching your current query were found. Adjust your search parameters or register a new workshop event.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-850 font-sans">
            {filteredRecords.map((record) => {
              const matchesCount = schedulers.filter(sch => sch.enabled && (sch.serviceType === 'All' || sch.serviceType === record.serviceType)).length;
              
              return (
                <div key={record.id} className="p-5 hover:bg-slate-850/15 transition duration-150 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left content block: Vehicle info and descriptions */}
                  <div className="space-y-2.5 flex-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono bg-slate-950/60 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                        🚗 {record.vehicleModel}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500">
                        VIN: {record.vin}
                      </span>
                      
                      {/* Service Type badge */}
                      <span className="text-[10px] font-mono font-semibold bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 px-2 py-0.5 rounded-lg uppercase">
                        🔧 {record.serviceType}
                      </span>

                      {/* Status Badges */}
                      <span className={`text-[9px] font-mono font-extrabold border px-2 py-0.5 rounded-lg uppercase tracking-wide ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {record.description || "No mechanical descriptions recorded."}
                    </p>

                    {/* Operational telemetry metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-600" />
                        <span>Scheduled: {record.scheduledDate}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-3.5 w-3.5 text-slate-600" />
                        <span>Cost: ${record.cost}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-slate-600" />
                        <span>Log Mileage: {record.mileage.toLocaleString()} miles</span>
                      </span>
                      {record.lastTriggeredAt && (
                        <span className="text-emerald-400 font-bold">
                          Last Triggered: {new Date(record.lastTriggeredAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right content block: Schedulers trigger and operations */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:items-end justify-center">
                    
                    {/* Proactive Trigger status trigger */}
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex flex-col justify-between space-y-2 text-right">
                      <div className="text-left md:text-right">
                        <div className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">Proactive Notifications</div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {matchesCount > 0 ? (
                            <span className="text-indigo-400 font-semibold">⚡ {matchesCount} Scheduler Matches Available</span>
                          ) : (
                            <span className="text-slate-600">No active schedulers matching service</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerProactiveNotification(record)}
                        disabled={matchesCount === 0}
                        className={`w-full text-center py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center space-x-1 border transition-all ${
                          matchesCount > 0
                            ? 'bg-indigo-950 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 shadow-md'
                            : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                        }`}
                      >
                        <Play className="h-3 w-3" />
                        <span>RUN SCHEDULER DISPATCH</span>
                      </button>
                    </div>

                    {/* Manage Buttons */}
                    <div className="flex items-center space-x-1.5 self-end">
                      <button
                        type="button"
                        onClick={() => handleEditClick(record)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition"
                        title="Edit Service Record"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                        title="Delete Service Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

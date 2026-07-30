import { AfterSalesRecord, NotificationScheduler } from '../types';

export const DEFAULT_AFTER_SALES_RECORDS: AfterSalesRecord[] = [
  {
    id: 'asr_1',
    vin: '1HGBH4F00000001',
    vehicleModel: 'Civic',
    serviceType: 'Periodic Maintenance',
    mileage: 45200,
    scheduledDate: '2026-08-20',
    cost: 150,
    status: 'Scheduled',
    description: '45,000 miles standard checkup. Engine oil pressure testing, microfilter replacement, and coolant loop audit.',
    proactiveTriggerStatus: 'Ready'
  },
  {
    id: 'asr_2',
    vin: '5YJSA1E100000002',
    vehicleModel: 'Model S',
    serviceType: 'Brake Pad Replacement',
    mileage: 62110,
    scheduledDate: '2026-07-10',
    cost: 380,
    status: 'Overdue',
    description: 'Front caliper and brake lining thickness below 3mm threshold. Safety alert trigger enabled.',
    proactiveTriggerStatus: 'Ready'
  },
  {
    id: 'asr_3',
    vin: '1HGBH4F00000001',
    vehicleModel: 'Civic',
    serviceType: 'Recall Action',
    mileage: 44100,
    scheduledDate: '2026-07-15',
    cost: 0,
    status: 'In Progress',
    description: 'Corporate campaign #91B: Airbag inflator housing swap-out. In-house dealer processing active.',
    proactiveTriggerStatus: 'Ready'
  },
  {
    id: 'asr_4',
    vin: '5YJYG1E100000003',
    vehicleModel: 'Model Y',
    serviceType: 'Battery Health Check',
    mileage: 18500,
    scheduledDate: '2026-07-01',
    cost: 120,
    status: 'Completed',
    description: 'High-voltage battery degradation test. Active cell health measured at 98.4% capacity. Completed normally.',
    proactiveTriggerStatus: 'Done',
    lastTriggeredAt: '2026-07-01T09:12:00-07:00'
  },
  {
    id: 'asr_5',
    vin: '5YJ3E1EA00000004',
    vehicleModel: 'Model 3',
    serviceType: 'Software Update',
    mileage: 32000,
    scheduledDate: '2026-08-01',
    cost: 0,
    status: 'Scheduled',
    description: 'OTA Deployment of safety patch package 12.4.1. Core drive-train thermal loop management improvements.',
    proactiveTriggerStatus: 'Ready'
  }
];

export const DEFAULT_SCHEDULERS: NotificationScheduler[] = [
  {
    id: 'sch_1',
    name: 'Upcoming Periodic Service Proactive Reminder',
    triggerCondition: 'DaysBefore',
    triggerValue: '7',
    serviceType: 'Periodic Maintenance',
    templateTitle: '⚠️ Upcoming Maintenance Scheduled',
    templateBody: 'Dear owner of {vehicleModel} (VIN: {vin}), your vehicle is scheduled for {serviceType} in 7 days on {scheduledDate}. Estimated cost is ${cost}. Please confirm your drop-off window.',
    notificationCategory: 'VEHICLE_REMOTE_CONTROL',
    enabled: true,
    createdDate: '2026-07-01'
  },
  {
    id: 'sch_2',
    name: 'Brake Pad Wear and Overdue Service Alert',
    triggerCondition: 'OnStatusChange',
    triggerValue: 'Overdue',
    serviceType: 'Brake Pad Replacement',
    templateTitle: '🔴 URGENT: Overdue Safety Service Warning',
    templateBody: 'URGENT SAFETY NOTIFICATION: The {serviceType} service for vehicle {vehicleModel} (VIN: {vin}) is OVERDUE since {scheduledDate}. Continued operation may degrade braking efficacy. Please visit an authorized service dealer immediately.',
    notificationCategory: 'SAFETY_SYSTEMS',
    enabled: true,
    createdDate: '2026-07-05'
  },
  {
    id: 'sch_3',
    name: 'Critical Recall Action Scheduler',
    triggerCondition: 'OnStatusChange',
    triggerValue: 'In Progress',
    serviceType: 'Recall Action',
    templateTitle: '🚨 Safety Recall Operations Ingress',
    templateBody: 'Safety systems gateway alert. Recall action ({serviceType}) is currently active on VIN {vin}. Safe operating envelope speed limits might be enforced.',
    notificationCategory: 'SAFETY_SYSTEMS',
    enabled: true,
    createdDate: '2026-07-06'
  },
  {
    id: 'sch_4',
    name: 'High Mileage Diagnostics Notice',
    triggerCondition: 'MileageExceeds',
    triggerValue: '40000',
    serviceType: 'All',
    templateTitle: 'ℹ️ High-Mileage Diagnostics Ingested',
    templateBody: 'A high-mileage diagnostic check was registered for {vehicleModel} (VIN: {vin}) at {mileage} miles. Generating telemetry profiles...',
    notificationCategory: 'DIAGNOSTICS',
    enabled: false,
    createdDate: '2026-07-10'
  }
];

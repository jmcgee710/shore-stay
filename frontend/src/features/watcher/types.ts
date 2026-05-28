export interface WatcherAssignment {
  id: string;
  watcherId: string;
  propertyId: string;
  handsOffMode: boolean;
  inviteToken: string;
  inviteAccepted: boolean;
  createdAt: string;
  property?: {
    id: string;
    name: string;
    address: string;
  };
  watcher?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WatchReport {
  id: string;
  propertyId: string;
  watcherId: string;
  visitedAt: string;
  summary: string;
  overallCondition: 'good' | 'fair' | 'needs_attention' | 'damage';
  photoUrls: string[];
  notes?: string;
  createdAt: string;
  watcher?: { id: string; name: string };
}

export interface StormAlert {
  id: string;
  propertyId: string;
  reportedById: string;
  alertType: 'storm' | 'flood' | 'wind_damage' | 'utility_failure' | 'vandalism' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photoUrls: string[];
  damageCostEstimate?: number;
  requiresOwnerApproval: boolean;
  ownerApprovedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  reportedBy?: { id: string; name: string };
  dispatches?: ContractorDispatch[];
}

export interface ContractorDispatch {
  id: string;
  stormAlertId: string;
  propertyId: string;
  contractorName: string;
  contractorPhone?: string;
  contractorEmail?: string;
  trade: 'plumber' | 'electrician' | 'roofer' | 'general' | 'other';
  workDescription: string;
  estimatedCost?: number;
  status: 'pending' | 'approved' | 'scheduled' | 'completed' | 'cancelled';
  approvedAt?: string;
  approvedById?: string;
  scheduledDate?: string;
  completedAt?: string;
  invoiceUrl?: string;
  notes?: string;
  createdAt: string;
}

export const CONDITION_META = {
  good:             { label: 'Good',            emoji: '✅', color: 'bg-green-100 text-green-700 border-green-200/60' },
  fair:             { label: 'Fair',             emoji: '🟡', color: 'bg-amber-100 text-amber-700 border-amber-200/60' },
  needs_attention:  { label: 'Needs Attention',  emoji: '⚠️', color: 'bg-orange-100 text-orange-700 border-orange-200/60' },
  damage:           { label: 'Damage Reported',  emoji: '🚨', color: 'bg-red-100 text-red-700 border-red-200/60' },
} as const;

export const SEVERITY_META = {
  low:      { label: 'Low',      color: 'bg-slate-100 text-slate-600' },
  medium:   { label: 'Medium',   color: 'bg-amber-100 text-amber-700' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
} as const;

export const DISPATCH_STATUS_META = {
  pending:   { label: 'Pending Approval', color: 'bg-slate-100 text-slate-600' },
  approved:  { label: 'Approved',         color: 'bg-blue-100 text-blue-700' },
  scheduled: { label: 'Scheduled',        color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed',        color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled',        color: 'bg-red-100 text-red-500' },
} as const;

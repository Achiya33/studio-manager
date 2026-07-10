// App constants and enums

export const ALBUM_STAGES = [
  { id: 'to-design', label: 'To Design', color: '#6366f1', icon: 'Palette' },
  { id: 'design-finish', label: 'Design Finish', color: '#8b5cf6', icon: 'Brush' },
  { id: 'send-to-client', label: 'Send to Client', color: '#3b82f6', icon: 'Send' },
  { id: 'design-revision', label: 'Design Revision', color: '#f97316', icon: 'RotateCcw' },
  { id: 'client-approval', label: 'Client Approval', color: '#f59e0b', icon: 'CheckCircle' },
  { id: 'upload-to-print', label: 'Upload to Print', color: '#10b981', icon: 'UploadCloud' },
];

export const SHOOT_TYPES = [
  { id: 'wedding', label: 'Wedding', color: '#f59e0b', icon: 'Heart' },
  { id: 'pre-shoot', label: 'Pre-Shoot', color: '#6366f1', icon: 'Camera' },
  { id: 'event', label: 'Event', color: '#10b981', icon: 'PartyPopper' },
  { id: 'other', label: 'Other', color: '#9ca3b4', icon: 'Image' },
];

export const SHOOT_STATUS = {
  UPCOMING: 'upcoming',
  TODAY: 'today',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'bank', label: 'Bank Transfer' },
  { id: 'card', label: 'Card Payment' },
  { id: 'online', label: 'Online Payment' },
];

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export const DEFAULT_PACKAGES = [
  { id: 'silver', name: 'Silver Package', price: 45000 },
  { id: 'gold', name: 'Gold Package', price: 85000 },
  { id: 'platinum', name: 'Platinum Package', price: 125000 },
  { id: 'custom', name: 'Custom Package', price: 0 },
];

// Staff-allowed stage transitions
export const STAFF_ALLOWED_STAGES = ['ready-for-pickup', 'delivered'];

export const getShootTypeConfig = (type) => {
  return SHOOT_TYPES.find(t => t.id === type) || SHOOT_TYPES[3];
};

export const getAlbumStageConfig = (stage) => {
  return ALBUM_STAGES.find(s => s.id === stage) || ALBUM_STAGES[0];
};

export interface Room {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

export interface Appliance {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  purchaseDate: string | null;
  maintenanceNotes: string | null;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  dueDate: string;
  recurrence: string | null;
  completedAt: string | null;
}

export interface GuideItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
}

export interface TripPlanner {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  qrCodeToken: string;
  shareLink: string;
  tripPlanners: TripPlanner[];
}

export interface PropertyFull {
  id: string;
  name: string;
  address: string;
  description: string | null;
  rules: string | null;
  wifiInfo: string | null;
  parkingInfo: string | null;
  latitude: number | null;
  longitude: number | null;
  // Listing browser fields
  town: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  petFriendly: boolean;
  beachSide: string | null;
  amenities: string[];
  isPublished: boolean;
  nightlyRate: number | null;
  coverPhotoUrl: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  rooms: Room[];
  appliances: Appliance[];
  maintenanceTasks: MaintenanceTask[];
  guideItems: GuideItem[];
  bookings: Booking[];
}

export interface PropertySummary {
  id: string;
  name: string;
  address: string;
  _count: { bookings: number; rooms: number };
}

export const GUIDE_CATEGORIES = [
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'bars', label: 'Bars', emoji: '🍹' },
  { value: 'activities', label: 'Activities', emoji: '🎯' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'beaches', label: 'Beaches', emoji: '🏖️' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎉' },
  { value: 'other', label: 'Other', emoji: '📌' },
] as const;

export const ROOM_TYPES = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'common', label: 'Common Area' },
  { value: 'outdoor', label: 'Outdoor' },
] as const;

export const RECURRENCE_OPTIONS = [
  { value: '', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

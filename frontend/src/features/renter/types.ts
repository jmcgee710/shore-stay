export interface Room {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

export interface GuideItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
}

export interface BookingData {
  id: string;
  startDate: string;
  endDate: string;
  property: {
    id: string;
    name: string;
    address: string;
    description: string | null;
    rules: string | null;
    wifiInfo: string | null;
    parkingInfo: string | null;
    latitude: number | null;
    longitude: number | null;
    rooms: Room[];
    guideItems: GuideItem[];
  };
}

export interface GroupEvent {
  id: string;
  title: string;
  datetime: string;
  category: string;
  notes: string | null;
  link: string | null;
  createdByPlannerId: string | null;
}

export const CATEGORIES = [
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'golf', label: 'Golf', emoji: '⛳' },
  { value: 'surf', label: 'Surf', emoji: '🏄' },
  { value: 'water', label: 'Water Sports', emoji: '🛥️' },
  { value: 'activity', label: 'Activity', emoji: '🎯' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎉' },
  { value: 'bars', label: 'Bars', emoji: '🍹' },
  { value: 'other', label: 'Other', emoji: '📌' },
] as const;

export function categoryEmoji(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.emoji ?? '📌';
}

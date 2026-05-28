export interface ListingSummary {
  id: string;
  name: string;
  address: string;
  town: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  petFriendly: boolean;
  beachSide: string | null;
  nightlyRate: number | null;
  coverPhotoUrl: string | null;
  description: string | null;
  amenities: string[];
  photos: { url: string }[];
}

export interface ListingDetail extends ListingSummary {
  ownerPhone: string | null;
  ownerEmail: string | null;
  latitude: number | null;
  longitude: number | null;
  photos: { id: string; url: string; caption: string | null; isCover: boolean }[];
  ownersPicks: OwnersPick[];
  bookings: { startDate: string; endDate: string }[];
}

export interface OwnersPick {
  id: string;
  name: string;
  category: string;
  ownerNote: string | null;
  link: string | null;
  photoUrl: string | null;
}

export interface SearchFilters {
  town: string;
  minBeds: string;
  minBaths: string;
  pets: boolean;
  beachSide: string;
  checkin: string;
  checkout: string;
}

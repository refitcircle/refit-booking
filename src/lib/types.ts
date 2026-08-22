export interface Course {
  id: string;
  name: string;
  description: string;
  location: string;
  icon: string;
  tag: string;
  min_spots: number;
  max_spots: number;
  current_spots: number;
  is_active: boolean;
  coming_soon: boolean;
  prices: Price[];
  sessions: Session[];
}

export interface Session {
  id: string;
  course_id: string;
  label: string;
  session_date: string;
  is_cancelled: boolean;
  bookings_count?: number;
}

export interface Price {
  id: string;
  course_id: string;
  label: string;
  price_key: 'unit' | 'pack' | 'pack5';
  amount: number; // centimes
  note: string | null;
}

export interface Booking {
  id: string;
  session_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  quantity: number;
  price_key: 'unit' | 'pack' | 'paid';
  payment_method: 'virement' | 'payconiq' | 'cash';
  total_amount: number | null;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  waitlist_pos: number | null;
  cancel_token: string;
  created_at: string;
}

export interface SgtSlot {
  id: string;
  time_label: string;
  max_spots: number;
  current_spots: number;
  is_active: boolean;
  interests?: SgtInterest[];
}

export interface SgtInterest {
  id: string;
  slot_id: string;
  name: string;
  email: string;
  level: 'deb' | 'int' | 'con';
  message: string | null;
  created_at: string;
}

export interface CourseInterest {
  id: string;
  course_id: string;
  name: string;
  email: string;
  message: string | null;
  created_at: string;
}

export const formatAmount = (centimes: number): string => {
  return (centimes / 100).toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  });
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

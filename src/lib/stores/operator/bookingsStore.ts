import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';

// Types
interface Booking {
  id: string;
  booking_number: string;
  client_id: string;
  user_id: string;
  room_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_confirmed: boolean;
  pin_code?: string;
  pin_used_at?: string;
  special_requests?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  created_by?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  created: string;
  updated: string;
  expand?: {
    client_id?: any;
    user_id?: any;
    room_id?: any;
    service_id?: any;
  };
}

interface Schedule {
  id: string;
  user_id: string;
  location_id: string;
  room_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_recurring: boolean;
  notes?: string;
  created: string;
  updated: string;
  expand?: {
    user_id?: any;
    location_id?: any;
    room_id?: any;
  };
}

interface Room {
  id: string;
  name: string;
  location_id: string;
  capacity: number;
  description?: string;
  is_active: boolean;
  created: string;
  updated: string;
  expand?: {
    location_id?: any;
  };
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  is_active: boolean;
  created: string;
  updated: string;
}

interface Client {
  id: string;
  phone_number: string;
  channel: string;
  nickname?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  preferred_language?: string;
  description?: string;
  is_blocked: boolean;
  blocked_reason?: string;
  blocked_at?: string;
  blocked_by?: string;
  last_visit_at?: string;
  total_visits: number;
  created_by?: string;
  created: string;
  updated: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: string;
  languages?: string[];
  phone?: string;
  contact_details?: any;
  services?: string[];
  is_active: boolean;
  has_accommodation: boolean;
  avatar?: string;
  last_login_at?: string;
  created_by?: string;
  created: string;
  updated: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
  created: string;
  updated: string;
}

interface OperatorBookingsState {
  bookings: Booking[];
  schedules: Schedule[];
  rooms: Room[];
  locations: Location[];
  clients: Client[];
  users: User[];
  services: Service[];
  loading: boolean;
  error: string | null;
  selectedLocation: string | null;
  selectedDate: string;
  viewMode: 'calendar' | 'grid';
  showBookingModal: boolean;
  showClientModal: boolean;
  selectedBooking: Booking | null;
  newBookingData: Partial<Booking>;
  newClientData: Partial<Client>;
}

// Initial state
const initialState: OperatorBookingsState = {
  bookings: [],
  schedules: [],
  rooms: [],
  locations: [],
  clients: [],
  users: [],
  services: [],
  loading: false,
  error: null,
  selectedLocation: null,
  selectedDate: new Date().toISOString().split('T')[0],
  viewMode: 'calendar',
  showBookingModal: false,
  showClientModal: false,
  selectedBooking: null,
  newBookingData: {},
  newClientData: {}
};

// Create the store
const operatorBookingsStore = writable<OperatorBookingsState>(initialState);

// Actions
export const operatorBookingsActions = {
  // Load initial data
  async loadData() {
    try {
      operatorBookingsStore.update(state => ({ ...state, loading: true, error: null }));
      
      const pb = await getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Load all necessary data
      const [bookings, schedules, rooms, locations, clients, users, services] = await Promise.all([
        pb.collection('bookings').getFullList({
          expand: 'client_id,user_id,room_id,service_id',
          sort: '-created'
        }),
        pb.collection('schedules').getFullList({
          expand: 'user_id,location_id,room_id',
          filter: 'is_available = true'
        }),
        pb.collection('rooms').getFullList({
          expand: 'location_id',
          filter: 'is_active = true'
        }),
        pb.collection('locations').getFullList({
          filter: 'is_active = true'
        }),
        pb.collection('clients').getFullList({
          sort: '-created'
        }),
        pb.collection('users').getFullList({
          filter: 'role != "administrator"'
        }),
        pb.collection('services').getFullList({
          filter: 'is_active = true'
        })
      ]);

      operatorBookingsStore.update(state => ({
        ...state,
        bookings,
        schedules,
        rooms,
        locations,
        clients,
        users,
        services,
        loading: false
      }));

    } catch (error) {
      console.error('Error loading operator data:', error);
      operatorBookingsStore.update(state => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  },

  // Search for clients by phone, email or username - returns multiple results
  async searchClient(query: string): Promise<(Client | User)[]> {
    try {
      const pb = await getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      console.log('Searching for clients with query:', query);
      const results: (Client | User)[] = [];

      // Search clients by phone number (exact match or contains)
      try {
        const clients = await pb.collection('clients').getFullList({
          filter: `phone_number ~ "${query}" || phone_number = "${query}"`,
          sort: '-created'
        });
        console.log('Found clients by phone:', clients);
        results.push(...clients);
      } catch (e) {
        console.log('No clients found by phone number');
      }

      // Search clients by email
      try {
        const clients = await pb.collection('clients').getFullList({
          filter: `email ~ "${query}" || email = "${query}"`,
          sort: '-created'
        });
        console.log('Found clients by email:', clients);
        // Avoid duplicates
        const existingIds = results.map(r => r.id);
        results.push(...clients.filter((c: any) => !existingIds.includes(c.id)));
      } catch (e) {
        console.log('No clients found by email');
      }

      // Search clients by name
      try {
        const clients = await pb.collection('clients').getFullList({
          filter: `first_name ~ "${query}" || last_name ~ "${query}" || nickname ~ "${query}"`,
          sort: '-created'
        });
        console.log('Found clients by name:', clients);
        // Avoid duplicates
        const existingIds = results.map(r => r.id);
        results.push(...clients.filter((c: any) => !existingIds.includes(c.id)));
      } catch (e) {
        console.log('No clients found by name');
      }

      // Search users by username
      try {
        const users = await pb.collection('users').getFullList({
          filter: `username ~ "${query}" || username = "${query}"`,
          sort: '-created'
        });
        console.log('Found users by username:', users);
        // Avoid duplicates
        const existingIds = results.map(r => r.id);
        results.push(...users.filter((u: any) => !existingIds.includes(u.id)));
      } catch (e) {
        console.log('No users found by username');
      }

      // Search users by email
      try {
        const users = await pb.collection('users').getFullList({
          filter: `email ~ "${query}" || email = "${query}"`,
          sort: '-created'
        });
        console.log('Found users by email:', users);
        // Avoid duplicates
        const existingIds = results.map(r => r.id);
        results.push(...users.filter((u: any) => !existingIds.includes(u.id)));
      } catch (e) {
        console.log('No users found by email');
      }

      // Search users by name
      try {
        const users = await pb.collection('users').getFullList({
          filter: `name ~ "${query}"`,
          sort: '-created'
        });
        console.log('Found users by name:', users);
        // Avoid duplicates
        const existingIds = results.map(r => r.id);
        results.push(...users.filter((u: any) => !existingIds.includes(u.id)));
      } catch (e) {
        console.log('No users found by name');
      }

      console.log('Total search results:', results.length);
      return results;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  },

  // Create new client
  async createClient(clientData: Partial<Client>): Promise<Client> {
    try {
      const pb = await getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newClient = await pb.collection('clients').create({
        phone_number: clientData.phone_number,
        channel: clientData.channel || 'in_person',
        nickname: clientData.nickname,
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        email: clientData.email,
        date_of_birth: clientData.date_of_birth,
        preferred_language: clientData.preferred_language,
        description: clientData.description,
        is_blocked: false,
        total_visits: 0
      });

      // Update store with new client
      operatorBookingsStore.update(state => ({
        ...state,
        clients: [...state.clients, newClient]
      }));

      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Create new booking
  async createBooking(bookingData: {
    client_id: string;
    user_id: string;
    room_id: string;
    service_id: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    special_requests?: string;
  }): Promise<Booking> {
    try {
      const pb = await getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Generate booking number
      const bookingNumber = `BK-${Date.now()}`;

      const newBooking = await pb.collection('bookings').create({
        booking_number: bookingNumber,
        client_id: bookingData.client_id,
        user_id: bookingData.user_id,
        room_id: bookingData.room_id,
        service_id: bookingData.service_id,
        date: bookingData.date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        duration_minutes: bookingData.duration_minutes,
        is_confirmed: false,
        special_requests: bookingData.special_requests
      }, {
        expand: 'client_id,user_id,room_id,service_id'
      });

      // Update store with new booking
      operatorBookingsStore.update(state => ({
        ...state,
        bookings: [newBooking, ...state.bookings]
      }));

      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Confirm booking
  async confirmBooking(bookingId: string): Promise<void> {
    try {
      const pb = await getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('bookings').update(bookingId, {
        is_confirmed: true,
        confirmed_at: new Date().toISOString(),
        confirmed_by: pb.authStore.model?.id
      });

      // Update store
      operatorBookingsStore.update(state => ({
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, is_confirmed: true, confirmed_at: new Date().toISOString() }
            : booking
        )
      }));

    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  },

  // UI Actions
  setSelectedLocation(locationId: string) {
    operatorBookingsStore.update(state => ({
      ...state,
      selectedLocation: locationId
    }));
  },

  setSelectedDate(date: string) {
    operatorBookingsStore.update(state => ({
      ...state,
      selectedDate: date
    }));
  },

  setViewMode(mode: 'calendar' | 'grid') {
    operatorBookingsStore.update(state => ({
      ...state,
      viewMode: mode
    }));
  },

  showBookingModal(booking?: Booking) {
    operatorBookingsStore.update(state => ({
      ...state,
      showBookingModal: true,
      selectedBooking: booking || null,
      newBookingData: {}
    }));
  },

  hideBookingModal() {
    operatorBookingsStore.update(state => ({
      ...state,
      showBookingModal: false,
      selectedBooking: null,
      newBookingData: {}
    }));
  },

  showClientModal() {
    operatorBookingsStore.update(state => ({
      ...state,
      showClientModal: true,
      newClientData: {}
    }));
  },

  hideClientModal() {
    operatorBookingsStore.update(state => ({
      ...state,
      showClientModal: false,
      newClientData: {}
    }));
  },

  updateNewBookingData(data: Partial<Booking>) {
    operatorBookingsStore.update(state => ({
      ...state,
      newBookingData: { ...state.newBookingData, ...data }
    }));
  },

  updateNewClientData(data: Partial<Client>) {
    operatorBookingsStore.update(state => ({
      ...state,
      newClientData: { ...state.newClientData, ...data }
    }));
  }
};

// Derived stores
export const filteredSchedules = derived(
  operatorBookingsStore,
  $store => {
    if (!$store.selectedLocation) return [];
    
    return $store.schedules.filter(schedule => 
      schedule.expand?.room_id?.expand?.location_id?.id === $store.selectedLocation
    );
  }
);

export const filteredRooms = derived(
  operatorBookingsStore,
  $store => {
    if (!$store.selectedLocation) return [];
    
    return $store.rooms.filter(room => 
      room.location_id === $store.selectedLocation
    );
  }
);

export const todayBookings = derived(
  operatorBookingsStore,
  $store => {
    return $store.bookings.filter(booking => 
      booking.date === $store.selectedDate &&
      booking.expand?.room_id?.location_id === $store.selectedLocation
    );
  }
);

export default operatorBookingsStore;

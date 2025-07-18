export interface MasseuseAvailability {
	date: string;
	start_time: string;
	end_time: string;
}

export interface Masseuse {
	id?: string;
	name: string;
	status: string | null;
	height_cm: number;
	weight_kg: number;
	breasts: number;
	age: number;
	availability: MasseuseAvailability[];
	// Additional fields for profile management
	email?: string;
	phone?: string;
	bio?: string;
	specializations?: string[];
	specialties?: string[];
	languages?: string[];
	experience?: string;
	certifications?: string[];
	hourlyRate?: number;
	location?: string;
	website?: string;
	instagram?: string;
	linkedin?: string;
	profileImage?: string;
}

export interface Location {
	id: string;
	name: string;
	address: string;
	rooms: Room[];
}

export interface Room {
	id: string;
	name: string;
	capacity: number;
	amenities: string[];
}

export interface Schedule {
	id: string;
	masseuseName: string;
	date: string;
	startTime: string;
	endTime: string;
	roomId: string;
	type: 'baseline' | 'custom';
	baselineSlot?: '09:00-16:00' | '16:00-23:00' | '09:00-23:00';
}

export interface Booking {
	id: string;
	clientId: string;
	clientName: string;
	clientPhone: string;
	masseuseId: string;
	masseuseName: string;
	serviceType: string;
	date: string;
	time: string;
	startTime: string;
	endTime: string;
	duration: number;
	price: number;
	roomId: string;
	locationId: string;
	pinCode: string;
	status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'confirmed';
	notes?: string;
	actualEndTime?: string;
	review?: {
		rating: number;
		comment: string;
		submittedAt: string;
	};
}

export interface ClientProfile {
	id: string;
	name: string;
	phone: string;
	email?: string;
	notes: string;
	medicalNotes?: string;
	bookingHistory: string[]; // booking IDs
	preferences: {
		massageTypes: string[];
		pressure: string;
		temperature: string;
		music: boolean;
		aromatherapy: boolean;
	};
	createdAt: string;
	lastVisit?: string;
}

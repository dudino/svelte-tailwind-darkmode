#!/usr/bin/env node

// Demo Data Import Script for PocketBase
// This script helps you import the demo data into your PocketBase instance

console.log('🎭 PocketBase Demo Data Import Guide');
console.log('=====================================\n');

console.log('This script provides you with demo data for your massage parlor management system.');
console.log('The demo data includes:\n');

console.log('👥 Users (5 users):');
console.log('   - admin@massage.com (Administrator)');
console.log('   - operator@massage.com (Operator)');
console.log('   - massage1@massage.com (Anna - Therapist)');
console.log('   - massage2@massage.com (Petra - Therapist)');
console.log('   - massage3@massage.com (Maria - Therapist)\n');

console.log('📍 Locations (3 locations):');
console.log('   - Prague Center Spa');
console.log('   - Brno Wellness Center');
console.log('   - Ostrava Relaxation Hub\n');

console.log('🏠 Rooms (6 rooms):');
console.log('   - Various room types with different amenities');
console.log('   - Different capacity and pricing\n');

console.log('💆 Services (10 services):');
console.log('   - Swedish Massage, Deep Tissue, Hot Stone');
console.log('   - Thai Massage, Aromatherapy, Sports Massage');
console.log('   - Reflexology, Couples Massage, Prenatal, Facial\n');

console.log('📱 Clients (6 clients):');
console.log('   - Mix of WhatsApp, Telegram, Phone, Walk-in clients');
console.log('   - Different languages and preferences');
console.log('   - One blocked client for testing\n');

console.log('📅 Schedules (5 schedule entries):');
console.log('   - Different time slots and availability');
console.log('   - Mix of confirmed and tentative schedules\n');

console.log('📝 Bookings (5 bookings):');
console.log('   - Various booking statuses');
console.log('   - Different services and time slots');
console.log('   - One cancelled booking\n');

console.log('📋 Notes (5 notes):');
console.log('   - General, complaint, and compliment notes');
console.log('   - Mix of private and public notes\n');

console.log('⭐ Reviews (5 reviews):');
console.log('   - Different ratings and feedback');
console.log('   - Some with management responses\n');

console.log('🔧 How to Import:');
console.log('================\n');

console.log('Method 1: Manual Import via PocketBase Admin');
console.log('1. Start your PocketBase server');
console.log('2. Go to the Admin UI (usually http://127.0.0.1:8090/_/)');
console.log('3. Navigate to each collection');
console.log('4. Use the "Import" feature to import the demo data');
console.log('5. Make sure to maintain the relationships between collections\n');

console.log('Method 2: API Import (Advanced)');
console.log('You can use the PocketBase API to programmatically import the data.');
console.log('Check the demo-data.json file for the structure.\n');

console.log('⚠️  Important Notes:');
console.log('===================');
console.log('- Import users first, then locations, rooms, services');
console.log('- Import clients before bookings and notes');
console.log('- Make sure to update the relation IDs after importing');
console.log('- All passwords for demo users are in format: [role]123456');
console.log('- Adjust the dates in schedules and bookings to current dates');
console.log('- You may need to update the created_by fields with actual user IDs\n');

console.log('📋 Collection Import Order:');
console.log('1. users (auth collection)');
console.log('2. locations');
console.log('3. rooms (depends on locations)');
console.log('4. services');
console.log('5. clients');
console.log('6. schedules (depends on users and rooms)');
console.log('7. bookings (depends on clients, users, rooms, services)');
console.log('8. notes (depends on clients, users, bookings)');
console.log('9. reviews (depends on bookings, clients, users)\n');

console.log('🎯 Demo Credentials:');
console.log('====================');
console.log('Administrator: admin@massage.com / admin123456');
console.log('Operator: operator@massage.com / operator123456');
console.log('Therapist 1: massage1@massage.com / user123456');
console.log('Therapist 2: massage2@massage.com / user123456');
console.log('Therapist 3: massage3@massage.com / user123456\n');

console.log('Demo data file created: demo-data.json');
console.log('Ready to import! 🚀');

#!/usr/bin/env node

import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

// PocketBase SDK Import Script
// This script imports demo data using the official PocketBase JavaScript SDK

const pb = new PocketBase('http://127.0.0.1:8090');

class PocketBaseSDKImporter {
  constructor() {
    this.createdRecords = {
      users: [],
      locations: [],
      rooms: [],
      services: [],
      clients: [],
      schedules: [],
      bookings: [],
      notes: [],
      reviews: []
    };
  }

  async authenticateAdmin() {
    console.log('🔐 Authenticating as admin...');
    
    try {
      // Try to authenticate with existing admin
      await pb.admins.authWithPassword('admin@example.com', 'admin123456');
      console.log('✅ Admin authenticated successfully');
    } catch (error) {
      console.log('ℹ️  Admin not found, you may need to create one first');
      console.log('   Visit http://127.0.0.1:8090/_/ to create an admin account');
      throw error;
    }
  }

  async importUsers(users) {
    console.log('\\n👥 Importing users...');
    
    for (const userData of users) {
      try {
        const user = await pb.collection('_pb_users_auth_').create({
          ...userData,
          emailVisibility: true,
          verified: true
        });
        
        this.createdRecords.users.push(user);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }
  }

  async importLocations(locations) {
    console.log('\\n📍 Importing locations...');
    
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (const locationData of locations) {
      try {
        const location = await pb.collection('pbc_locations').create({
          ...locationData,
          created_by: adminUser?.id
        });
        
        this.createdRecords.locations.push(location);
        console.log(`✅ Created location: ${location.name}`);
      } catch (error) {
        console.error(`❌ Error creating location:`, error.message);
      }
    }
  }

  async importRooms(rooms) {
    console.log('\\n🏠 Importing rooms...');
    
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    const locations = this.createdRecords.locations;
    
    for (let i = 0; i < rooms.length; i++) {
      try {
        const room = await pb.collection('pbc_rooms').create({
          ...rooms[i],
          location_id: locations[i % locations.length]?.id,
          created_by: adminUser?.id
        });
        
        this.createdRecords.rooms.push(room);
        console.log(`✅ Created room: ${room.name}`);
      } catch (error) {
        console.error(`❌ Error creating room:`, error.message);
      }
    }
  }

  async importServices(services) {
    console.log('\\n💆 Importing services...');
    
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (const serviceData of services) {
      try {
        const service = await pb.collection('pbc_services').create({
          ...serviceData,
          created_by: adminUser?.id
        });
        
        this.createdRecords.services.push(service);
        console.log(`✅ Created service: ${service.name}`);
      } catch (error) {
        console.error(`❌ Error creating service:`, error.message);
      }
    }
  }

  async importClients(clients) {
    console.log('\\n📱 Importing clients...');
    
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (const clientData of clients) {
      try {
        const client = await pb.collection('pbc_clients').create({
          ...clientData,
          created_by: adminUser?.id,
          blocked_by: clientData.is_blocked ? adminUser?.id : null
        });
        
        this.createdRecords.clients.push(client);
        console.log(`✅ Created client: ${client.phone_number} (${client.nickname})`);
      } catch (error) {
        console.error(`❌ Error creating client:`, error.message);
      }
    }
  }

  async importSchedules(schedules) {
    console.log('\\n📅 Importing schedules...');
    
    const users = this.createdRecords.users.filter(u => u.role === 'user');
    const rooms = this.createdRecords.rooms;
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (let i = 0; i < schedules.length; i++) {
      try {
        const schedule = await pb.collection('pbc_schedules').create({
          ...schedules[i],
          user_id: users[i % users.length]?.id,
          room_id: rooms[i % rooms.length]?.id,
          created_by: adminUser?.id,
          confirmed_by: schedules[i].is_confirmed ? adminUser?.id : null
        });
        
        this.createdRecords.schedules.push(schedule);
        console.log(`✅ Created schedule: ${schedule.date} ${schedule.timeslot}`);
      } catch (error) {
        console.error(`❌ Error creating schedule:`, error.message);
      }
    }
  }

  async importBookings(bookings) {
    console.log('\\n📝 Importing bookings...');
    
    const clients = this.createdRecords.clients.filter(c => !c.is_blocked);
    const users = this.createdRecords.users.filter(u => u.role === 'user');
    const rooms = this.createdRecords.rooms;
    const services = this.createdRecords.services;
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (let i = 0; i < bookings.length; i++) {
      try {
        const booking = await pb.collection('pbc_bookings').create({
          ...bookings[i],
          client_id: clients[i % clients.length]?.id,
          user_id: users[i % users.length]?.id,
          room_id: rooms[i % rooms.length]?.id,
          service_id: [services[i % services.length]?.id],
          created_by: adminUser?.id,
          confirmed_by: bookings[i].is_confirmed ? adminUser?.id : null,
          cancelled_by: bookings[i].cancelled_at ? adminUser?.id : null
        });
        
        this.createdRecords.bookings.push(booking);
        console.log(`✅ Created booking: ${booking.booking_number}`);
      } catch (error) {
        console.error(`❌ Error creating booking:`, error.message);
      }
    }
  }

  async importNotes(notes) {
    console.log('\\n📋 Importing notes...');
    
    const clients = this.createdRecords.clients;
    const users = this.createdRecords.users.filter(u => u.role === 'user');
    const bookings = this.createdRecords.bookings;
    
    for (let i = 0; i < notes.length; i++) {
      try {
        const note = await pb.collection('pbc_notes').create({
          ...notes[i],
          client_id: clients[i % clients.length]?.id,
          user_id: users[i % users.length]?.id,
          booking_id: i < bookings.length ? bookings[i].id : null
        });
        
        this.createdRecords.notes.push(note);
        console.log(`✅ Created note: ${note.type}`);
      } catch (error) {
        console.error(`❌ Error creating note:`, error.message);
      }
    }
  }

  async importReviews(reviews) {
    console.log('\\n⭐ Importing reviews...');
    
    const bookings = this.createdRecords.bookings;
    const clients = this.createdRecords.clients;
    const users = this.createdRecords.users.filter(u => u.role === 'user');
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (let i = 0; i < reviews.length && i < bookings.length; i++) {
      try {
        const review = await pb.collection('pbc_reviews').create({
          ...reviews[i],
          booking_id: bookings[i].id,
          client_id: clients[i % clients.length]?.id,
          user_id: users[i % users.length]?.id,
          responded_by: reviews[i].response ? adminUser?.id : null
        });
        
        this.createdRecords.reviews.push(review);
        console.log(`✅ Created review: ${review.rating} stars - ${review.title}`);
      } catch (error) {
        console.error(`❌ Error creating review:`, error.message);
      }
    }
  }

  async importAll() {
    try {
      console.log('🎭 Starting PocketBase Demo Data Import via SDK');
      console.log('=============================================\\n');

      // Read demo data
      const demoDataPath = path.join(process.cwd(), 'demo-data.json');
      const demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));

      // Authenticate
      await this.authenticateAdmin();

      // Import in dependency order
      await this.importUsers(demoData.users);
      await this.importLocations(demoData.locations);
      await this.importRooms(demoData.rooms);
      await this.importServices(demoData.services);
      await this.importClients(demoData.clients);
      await this.importSchedules(demoData.schedules);
      await this.importBookings(demoData.bookings);
      await this.importNotes(demoData.notes);
      await this.importReviews(demoData.reviews);

      console.log('\\n🎉 Import completed successfully!');
      console.log('\\n📊 Import Summary:');
      console.log('==================');
      
      Object.entries(this.createdRecords).forEach(([collection, records]) => {
        console.log(`${collection}: ${records.length} records`);
      });

      console.log('\\n🎯 Demo Credentials:');
      console.log('====================');
      const demoUsers = this.createdRecords.users;
      demoUsers.forEach(user => {
        const password = user.role === 'administrator' ? 'admin123456' : 
                        user.role === 'operator' ? 'operator123456' : 'user123456';
        console.log(`${user.role}: ${user.email} / ${password}`);
      });

      console.log('\\n🌐 Access your system:');
      console.log('======================');
      console.log('Admin UI: http://127.0.0.1:8090/_/');
      console.log('API Base: http://127.0.0.1:8090/api/');

    } catch (error) {
      console.error('\\n❌ Import failed:', error.message);
      if (error.message.includes('admin')) {
        console.log('\\n💡 Solution:');
        console.log('1. Visit http://127.0.0.1:8090/_/');
        console.log('2. Create an admin account');
        console.log('3. Update the credentials in this script');
        console.log('4. Run the import again');
      }
      process.exit(1);
    }
  }
}

// Check if PocketBase is running
async function checkPocketBase() {
  try {
    const response = await fetch('http://127.0.0.1:8090/api/health');
    if (!response.ok) {
      throw new Error('PocketBase health check failed');
    }
    console.log('✅ PocketBase server is running');
    return true;
  } catch (error) {
    console.error('❌ PocketBase server is not running or not accessible');
    console.error('   Make sure PocketBase is running on http://127.0.0.1:8090');
    console.error('   Run: ./pocketbase serve');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking PocketBase server...');
  
  const isRunning = await checkPocketBase();
  if (!isRunning) {
    process.exit(1);
  }

  const importer = new PocketBaseSDKImporter();
  await importer.importAll();
}

// Run the script
main().catch(console.error);

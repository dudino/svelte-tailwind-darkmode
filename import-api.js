#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// PocketBase API Import Script
// This script imports demo data via PocketBase REST API

const POCKETBASE_URL = 'http://127.0.0.1:8090';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123456';

class PocketBaseImporter {
  constructor() {
    this.authToken = null;
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
    
    const response = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error(`Admin authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.authToken = data.token;
    console.log('✅ Admin authenticated successfully');
  }

  async createRecord(collection, data) {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed to create ${collection} record:`, error);
      throw new Error(`Failed to create ${collection}: ${response.statusText}`);
    }

    const record = await response.json();
    this.createdRecords[collection].push(record);
    return record;
  }

  async importUsers(users) {
    console.log('\\n👥 Importing users...');
    
    for (const userData of users) {
      try {
        // Create user via auth collection
        const response = await fetch(`${POCKETBASE_URL}/api/collections/_pb_users_auth_/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({
            ...userData,
            emailVisibility: true,
            verified: true
          })
        });

        if (!response.ok) {
          const error = await response.text();
          console.error(`❌ Failed to create user ${userData.email}:`, error);
          continue;
        }

        const user = await response.json();
        this.createdRecords.users.push(user);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }

  async importLocations(locations) {
    console.log('\\n📍 Importing locations...');
    
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (const locationData of locations) {
      try {
        const location = await this.createRecord('pbc_locations', {
          ...locationData,
          created_by: adminUser?.id
        });
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
    
    for (let i = 0; i < rooms.length && i < locations.length; i++) {
      try {
        const room = await this.createRecord('pbc_rooms', {
          ...rooms[i],
          location_id: locations[i % locations.length].id,
          created_by: adminUser?.id
        });
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
        const service = await this.createRecord('pbc_services', {
          ...serviceData,
          created_by: adminUser?.id
        });
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
        const client = await this.createRecord('pbc_clients', {
          ...clientData,
          created_by: adminUser?.id,
          blocked_by: clientData.is_blocked ? adminUser?.id : undefined
        });
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
        const schedule = await this.createRecord('pbc_schedules', {
          ...schedules[i],
          user_id: users[i % users.length]?.id,
          room_id: rooms[i % rooms.length]?.id,
          created_by: adminUser?.id,
          confirmed_by: schedules[i].is_confirmed ? adminUser?.id : undefined
        });
        console.log(`✅ Created schedule: ${schedule.date} ${schedule.timeslot}`);
      } catch (error) {
        console.error(`❌ Error creating schedule:`, error.message);
      }
    }
  }

  async importBookings(bookings) {
    console.log('\\n📝 Importing bookings...');
    
    const clients = this.createdRecords.clients;
    const users = this.createdRecords.users.filter(u => u.role === 'user');
    const rooms = this.createdRecords.rooms;
    const services = this.createdRecords.services;
    const adminUser = this.createdRecords.users.find(u => u.role === 'administrator');
    
    for (let i = 0; i < bookings.length; i++) {
      try {
        const booking = await this.createRecord('pbc_bookings', {
          ...bookings[i],
          client_id: clients[i % clients.length]?.id,
          user_id: users[i % users.length]?.id,
          room_id: rooms[i % rooms.length]?.id,
          service_id: [services[i % services.length]?.id],
          created_by: adminUser?.id,
          confirmed_by: bookings[i].is_confirmed ? adminUser?.id : undefined,
          cancelled_by: bookings[i].cancelled_at ? adminUser?.id : undefined
        });
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
        const note = await this.createRecord('pbc_notes', {
          ...notes[i],
          client_id: clients[i % clients.length]?.id,
          user_id: users[i % users.length]?.id,
          booking_id: i < bookings.length ? bookings[i].id : undefined
        });
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
        const review = await this.createRecord('pbc_reviews', {
          ...reviews[i],
          booking_id: bookings[i].id,
          client_id: clients[i % clients.length]?.id,
          user_id: users[i % users.length]?.id,
          responded_by: reviews[i].response ? adminUser?.id : undefined
        });
        console.log(`✅ Created review: ${review.rating} stars - ${review.title}`);
      } catch (error) {
        console.error(`❌ Error creating review:`, error.message);
      }
    }
  }

  async importAll() {
    try {
      console.log('🎭 Starting PocketBase Demo Data Import via API');
      console.log('==============================================\\n');

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

    } catch (error) {
      console.error('\\n❌ Import failed:', error.message);
      process.exit(1);
    }
  }
}

// Check if PocketBase is running
async function checkPocketBase() {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/health`);
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

  const importer = new PocketBaseImporter();
  await importer.importAll();
}

// Run the script
main().catch(console.error);

// Demo Data Creation Script for Admin Panel
// Run this script to populate the database with sample data for all collections

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Demo data
const demoData = {
  locations: [
    {
      name: 'Prague Center',
      address: 'Wenceslas Square 1, 110 00 Prague 1, Czech Republic',
      phone: '+420 224 123 456',
      email: 'prague@affinity.cz',
      opening_hours: {
        monday: '9:00-21:00',
        tuesday: '9:00-21:00',
        wednesday: '9:00-21:00',
        thursday: '9:00-21:00',
        friday: '9:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-20:00'
      },
      description: 'Our flagship location in the heart of Prague',
      is_active: true
    },
    {
      name: 'Brno Wellness',
      address: 'Svobody Square 5, 602 00 Brno, Czech Republic',
      phone: '+420 543 123 789',
      email: 'brno@affinity.cz',
      opening_hours: {
        monday: '10:00-20:00',
        tuesday: '10:00-20:00',
        wednesday: '10:00-20:00',
        thursday: '10:00-20:00',
        friday: '10:00-21:00',
        saturday: '10:00-21:00',
        sunday: '11:00-19:00'
      },
      description: 'Modern wellness center in Brno',
      is_active: true
    }
  ],

  services: [
    {
      name: 'Classic Relaxation Massage',
      description: 'Full body relaxation massage using traditional techniques',
      duration_minutes: 60,
      price: 1200,
      category: 'massage',
      is_active: true
    },
    {
      name: 'Hot Stone Therapy',
      description: 'Therapeutic massage using heated stones for deep relaxation',
      duration_minutes: 90,
      price: 1800,
      category: 'massage',
      is_active: true
    },
    {
      name: 'Aromatherapy Session',
      description: 'Relaxing massage with essential oils',
      duration_minutes: 75,
      price: 1500,
      category: 'aromatherapy',
      is_active: true
    },
    {
      name: 'Deep Tissue Massage',
      description: 'Intensive massage for muscle tension relief',
      duration_minutes: 60,
      price: 1400,
      category: 'massage',
      is_active: true
    },
    {
      name: 'Couples Massage',
      description: 'Relaxing massage session for two people',
      duration_minutes: 90,
      price: 2800,
      category: 'couples',
      is_active: true
    }
  ],

  clients: [
    {
      name: 'Anna Novakova',
      email: 'anna.novakova@email.cz',
      phone: '+420 777 123 456',
      address: 'Karlova 15, Prague 1',
      date_of_birth: '1985-03-15',
      gender: 'female',
      emergency_contact_name: 'Petr Novak',
      emergency_contact_phone: '+420 777 654 321',
      medical_notes: 'Lower back sensitivity',
      preferences: 'Prefers gentle pressure, room temperature 22°C',
      status: 'active'
    },
    {
      name: 'Martin Svoboda',
      email: 'martin.svoboda@gmail.com',
      phone: '+420 602 987 654',
      address: 'Masarykova 32, Brno',
      date_of_birth: '1978-11-22',
      gender: 'male',
      emergency_contact_name: 'Eva Svobodova',
      emergency_contact_phone: '+420 602 111 222',
      medical_notes: 'Athletic build, no restrictions',
      preferences: 'Prefers firm pressure massage',
      status: 'active'
    },
    {
      name: 'Katerina Dvorakova',
      email: 'k.dvorakova@seznam.cz',
      phone: '+420 721 456 789',
      address: 'Narodni 28, Prague 2',
      date_of_birth: '1992-07-08',
      gender: 'female',
      medical_notes: 'Pregnant (2nd trimester)',
      preferences: 'Prenatal massage specialist required',
      status: 'active'
    },
    {
      name: 'Tomas Hora',
      email: 'tomas.hora@company.com',
      phone: '+420 608 333 444',
      address: 'Stefanikova 12, Brno',
      date_of_birth: '1965-12-03',
      gender: 'male',
      emergency_contact_name: 'Jana Horova',
      emergency_contact_phone: '+420 608 555 666',
      medical_notes: 'Arthritis in hands, avoid pressure on joints',
      preferences: 'Gentle massage, warm environment',
      status: 'active'
    }
  ]
};

async function createDemoData() {
  try {
    console.log('🚀 Starting demo data creation...');

    // 1. Create locations
    console.log('📍 Creating locations...');
    const locations = [];
    for (const locationData of demoData.locations) {
      try {
        const location = await pb.collection('locations').create(locationData);
        locations.push(location);
        console.log(`✅ Created location: ${location.name}`);
      } catch (err) {
        console.log(`⚠️ Location may already exist: ${locationData.name}`);
      }
    }

    // 2. Create services
    console.log('🛠️ Creating services...');
    const services = [];
    for (const serviceData of demoData.services) {
      try {
        const service = await pb.collection('services').create(serviceData);
        services.push(service);
        console.log(`✅ Created service: ${service.name}`);
      } catch (err) {
        console.log(`⚠️ Service may already exist: ${serviceData.name}`);
      }
    }

    // 3. Create rooms for each location
    console.log('🏠 Creating rooms...');
    const rooms = [];
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const roomsForLocation = [
        {
          name: `Massage Room 1`,
          location_id: location.id,
          description: 'Spacious room with natural light',
          capacity: 1,
          amenities: ['massage_table', 'sound_system', 'essential_oils'],
          is_active: true
        },
        {
          name: `Massage Room 2`,
          location_id: location.id,
          description: 'Cozy room perfect for relaxation',
          capacity: 1,
          amenities: ['massage_table', 'dimmed_lighting', 'heating'],
          is_active: true
        },
        {
          name: `Couples Suite`,
          location_id: location.id,
          description: 'Large room for couples treatments',
          capacity: 2,
          amenities: ['dual_massage_tables', 'sound_system', 'candles', 'essential_oils'],
          is_active: true
        }
      ];

      for (const roomData of roomsForLocation) {
        try {
          const room = await pb.collection('rooms').create(roomData);
          rooms.push(room);
          console.log(`✅ Created room: ${room.name} at ${location.name}`);
        } catch (err) {
          console.log(`⚠️ Room may already exist: ${roomData.name}`);
        }
      }
    }

    // 4. Create clients
    console.log('👥 Creating clients...');
    const clients = [];
    for (const clientData of demoData.clients) {
      try {
        const client = await pb.collection('clients').create(clientData);
        clients.push(client);
        console.log(`✅ Created client: ${client.name}`);
      } catch (err) {
        console.log(`⚠️ Client may already exist: ${clientData.email}`);
      }
    }

    // 5. Get users for staff assignments
    console.log('👤 Getting users for staff assignments...');
    const users = await pb.collection('users').getList(1, 10);
    if (users.items.length === 0) {
      console.log('⚠️ No users found. Please create users first.');
      return;
    }

    // 6. Create schedules
    console.log('📅 Creating schedules...');
    const schedules = [];
    for (let i = 0; i < Math.min(users.items.length, locations.length); i++) {
      const user = users.items[i];
      const location = locations[i % locations.length];
      const service = services[i % services.length];

      const scheduleData = {
        user_id: user.id,
        location_id: location.id,
        service_id: service.id,
        date: '2025-01-15',
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        notes: 'Regular working schedule'
      };

      try {
        const schedule = await pb.collection('schedules').create(scheduleData);
        schedules.push(schedule);
        console.log(`✅ Created schedule for ${user.email || user.name}`);
      } catch (err) {
        console.log(`⚠️ Schedule may already exist`);
      }
    }

    // 7. Create bookings
    console.log('📝 Creating bookings...');
    const bookings = [];
    for (let i = 0; i < Math.min(clients.length, 6); i++) {
      const client = clients[i];
      const service = services[i % services.length];
      const location = locations[i % locations.length];
      const user = users.items[i % users.items.length];
      const room = rooms.find(r => r.location_id === location.id);

      const bookingDates = [
        { date: '2025-01-20', time: '10:00' },
        { date: '2025-01-20', time: '14:00' },
        { date: '2025-01-21', time: '11:00' },
        { date: '2025-01-22', time: '15:00' },
        { date: '2025-01-23', time: '09:00' },
        { date: '2025-01-24', time: '16:00' }
      ];

      const booking = bookingDates[i];
      const endTime = new Date(`2000-01-01T${booking.time}`);
      endTime.setMinutes(endTime.getMinutes() + service.duration_minutes);

      const bookingData = {
        client_id: client.id,
        service_id: service.id,
        location_id: location.id,
        room_id: room?.id || null,
        user_id: user.id,
        date: booking.date,
        start_time: booking.time,
        end_time: endTime.toTimeString().slice(0, 5),
        status: ['pending', 'confirmed', 'completed'][i % 3],
        notes: `Booking for ${client.name}`,
        price: service.price
      };

      try {
        const createdBooking = await pb.collection('bookings').create(bookingData);
        bookings.push(createdBooking);
        console.log(`✅ Created booking for ${client.name}`);
      } catch (err) {
        console.log(`⚠️ Booking creation failed: ${err.message}`);
      }
    }

    // 8. Create reviews
    console.log('⭐ Creating reviews...');
    const reviews = [];
    for (let i = 0; i < Math.min(clients.length, 5); i++) {
      const client = clients[i];
      const service = services[i % services.length];
      const location = locations[i % locations.length];

      const reviewComments = [
        'Absolutely amazing experience! The massage was exactly what I needed after a stressful week. The therapist was professional and the atmosphere was very relaxing.',
        'Great service and very professional staff. The hot stone therapy was incredible and I felt completely rejuvenated afterwards. Will definitely book again!',
        'Perfect couples massage experience. My partner and I both enjoyed the session immensely. The facility is clean and the staff is very attentive.',
        'Good massage but the room was a bit cold. The therapist was skilled but could have been more attentive to my preferences. Overall decent experience.',
        'Outstanding service! This was my first aromatherapy session and it exceeded all expectations. The essential oils were divine and I slept better than I have in months.'
      ];

      const reviewData = {
        client_id: client.id,
        service_id: service.id,
        location_id: location.id,
        rating: [5, 5, 4, 3, 5][i],
        comment: reviewComments[i],
        status: 'published'
      };

      try {
        const review = await pb.collection('reviews').create(reviewData);
        reviews.push(review);
        console.log(`✅ Created review from ${client.name}`);
      } catch (err) {
        console.log(`⚠️ Review creation failed: ${err.message}`);
      }
    }

    console.log('\n🎉 Demo data creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Rooms: ${rooms.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Users: ${users.items.length} (existing)`);

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

// Run the script
createDemoData();

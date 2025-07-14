// Test script to verify booking functionality
import PocketBase from 'pocketbase';

async function testBookingFlow() {
  const pb = new PocketBase('http://127.0.0.1:8090');
  
  try {
    console.log('🔍 Testing PocketBase connection...');
    await pb.health.check();
    console.log('✅ PocketBase is running');

    // Check if we have test data
    console.log('\n📊 Checking test data...');
    
    const users = await pb.collection('users').getList(1, 5);
    console.log(`Users: ${users.items.length} found`);
    
    const rooms = await pb.collection('rooms').getList(1, 5);
    console.log(`Rooms: ${rooms.items.length} found`);
    
    const services = await pb.collection('services').getList(1, 5);
    console.log(`Services: ${services.items.length} found`);
    
    const clients = await pb.collection('clients').getList(1, 5);
    console.log(`Clients: ${clients.items.length} found`);

    const schedules = await pb.collection('schedules').getList(1, 5);
    console.log(`Schedules: ${schedules.items.length} found`);

    if (users.items.length === 0 || rooms.items.length === 0 || services.items.length === 0) {
      console.log('\n⚠️  Missing required test data. Please run setup scripts.');
      return;
    }

    console.log('\n🎯 Testing operator login...');
    try {
      await pb.collection('users').authWithPassword('operator@massage.com', 'operator123456');
      console.log('✅ Operator login successful');
      
      console.log('\n📅 Creating test booking...');
      const testBooking = await pb.collection('bookings').create({
        booking_number: `TEST-${Date.now()}`,
        client_id: clients.items[0]?.id || users.items[0].id,
        user_id: users.items.find(u => u.role === 'user')?.id || users.items[0].id,
        room_id: rooms.items[0].id,
        service_id: services.items[0].id,
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00',
        duration_minutes: 60,
        is_confirmed: false
      });
      
      console.log('✅ Test booking created:', testBooking.id);
      
      // Clean up test booking
      await pb.collection('bookings').delete(testBooking.id);
      console.log('✅ Test booking cleaned up');
      
    } catch (error) {
      console.log('❌ Operator login failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookingFlow();

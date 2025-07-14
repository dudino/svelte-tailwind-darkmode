// Test script to create a booking with PIN
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function createTestBooking() {
    try {
        // Login as admin first
        await pb.admins.authWithPassword('admin@massage.com', 'admin123456');
        
        // Get first user
        const users = await pb.collection('users').getList(1, 1);
        if (users.items.length === 0) {
            console.log('No users found');
            return;
        }
        
        // Get first client
        const clients = await pb.collection('clients').getList(1, 1);
        if (clients.items.length === 0) {
            console.log('No clients found');
            return;
        }
        
        // Get first room
        const rooms = await pb.collection('rooms').getList(1, 1);
        if (rooms.items.length === 0) {
            console.log('No rooms found');
            return;
        }
        
        const testPin = '1234';
        
        // Create test booking
        const booking = await pb.collection('bookings').create({
            user_id: users.items[0].id,
            client_id: clients.items[0].id,
            room_id: rooms.items[0].id,
            date: new Date().toISOString().split('T')[0],
            start_time: '10:00',
            end_time: '11:00',
            is_confirmed: true,
            pin_code: testPin,
            notes: 'Test booking for PIN verification'
        });
        
        console.log('Test booking created:', booking);
        console.log('PIN:', testPin);
        console.log('User ID:', users.items[0].id);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

createTestBooking();

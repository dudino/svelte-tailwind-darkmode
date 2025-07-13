// Test PocketBase clients collection access
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function testClientsAccess() {
  try {
    console.log('Testing unauthenticated access...');
    const unauthResult = await pb.collection('clients').getList(1, 5);
    console.log('Unauthenticated result:', unauthResult);
  } catch (error) {
    console.log('Unauthenticated error:', error.message);
  }

  try {
    // Try to authenticate as admin
    console.log('\nTesting admin authentication...');
    await pb.admins.authWithPassword('admin@example.com', 'password123');
    console.log('Admin authenticated successfully');
    
    const adminResult = await pb.collection('clients').getList(1, 5);
    console.log('Admin result:', adminResult);
  } catch (error) {
    console.log('Admin auth/access error:', error.message);
  }

  try {
    // Test with a regular user (if exists)
    console.log('\nTesting user authentication...');
    await pb.collection('users').authWithPassword('operator@example.com', 'password123');
    console.log('User authenticated successfully');
    
    const userResult = await pb.collection('clients').getList(1, 5);
    console.log('User result:', userResult);
  } catch (error) {
    console.log('User auth/access error:', error.message);
  }
}

testClientsAccess().catch(console.error);

#!/usr/bin/env node

// Quick verification script to check if PocketBase is ready for import

async function checkAdminAuth() {
  console.log('🔍 Checking admin authentication...');
  
  try {
    const response = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: 'admin@example.com',
        password: 'admin123456'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin authentication successful!');
      console.log(`   Admin: ${data.admin.email}`);
      return data.token;
    } else {
      console.log('❌ Admin authentication failed');
      console.log('   Please create admin account at http://127.0.0.1:8090/_/');
      console.log('   Use: admin@example.com / admin123456');
      return null;
    }
  } catch (error) {
    console.log('❌ Could not connect to PocketBase');
    return null;
  }
}

async function checkCollections(token) {
  console.log('🔍 Checking collections...');
  
  try {
    const response = await fetch('http://127.0.0.1:8090/api/collections', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const collections = data.items || [];
      
      // Check for our custom collections
      const requiredCollections = [
        'pbc_locations', 'pbc_rooms', 'pbc_services', 'pbc_clients',
        'pbc_schedules', 'pbc_bookings', 'pbc_notes', 'pbc_reviews'
      ];
      
      const foundCollections = collections.filter(c => 
        requiredCollections.includes(c.id) || c.id === '_pb_users_auth_'
      );
      
      console.log(`✅ Found ${foundCollections.length} collections`);
      foundCollections.forEach(c => console.log(`   - ${c.name} (${c.id})`));
      
      if (foundCollections.length >= 8) {
        console.log('✅ All required collections are ready!');
        return true;
      } else {
        console.log('⚠️  Missing collections. Please import pocketbase-collections.json');
        console.log('   Via Admin UI: Settings → Import collections');
        return false;
      }
    }
  } catch (error) {
    console.log('❌ Could not check collections');
    return false;
  }
}

async function main() {
  console.log('🎭 PocketBase Setup Verification');
  console.log('===============================\n');
  
  const token = await checkAdminAuth();
  if (!token) return;
  
  const hasCollections = await checkCollections(token);
  
  if (hasCollections) {
    console.log('\n🚀 Ready to import demo data!');
    console.log('Run: node import-sdk.js');
  } else {
    console.log('\n⏸️  Please complete setup first');
  }
}

main().catch(console.error);

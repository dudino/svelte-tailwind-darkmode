#!/usr/bin/env node

import fs from 'fs';

// Simple API test script to check PocketBase and guide setup

console.log('🎭 PocketBase Demo Data Import - Setup Check');
console.log('============================================\n');

async function checkPocketBase() {
  try {
    const response = await fetch('http://127.0.0.1:8090/api/health');
    if (response.ok) {
      console.log('✅ PocketBase server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ PocketBase server is not running');
    console.log('   Please start PocketBase with: ./pocketbase serve');
    return false;
  }
}

async function checkCollections() {
  try {
    const response = await fetch('http://127.0.0.1:8090/api/collections');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Collections endpoint accessible');
      
      // Look for our custom collections
      const collections = data.items || [];
      const customCollections = collections.filter(c => c.id.startsWith('pbc_') || c.id === '_pb_users_auth_');
      
      if (customCollections.length > 0) {
        console.log(`✅ Found ${customCollections.length} collections from schema`);
        customCollections.forEach(c => console.log(`   - ${c.name} (${c.id})`));
        return true;
      } else {
        console.log('⚠️  No custom collections found');
        console.log('   Please import pocketbase-collections.json first');
        console.log('   Via PocketBase Admin UI: http://127.0.0.1:8090/_/');
        return false;
      }
    }
  } catch (error) {
    console.log('❌ Could not check collections');
    return false;
  }
}

async function testAdminSetup() {
  console.log('\n🔐 Testing Admin Setup');
  console.log('======================');
  
  // Test common admin credentials
  const testCredentials = [
    { email: 'admin@example.com', password: 'admin123456' },
    { email: 'admin@pocketbase.com', password: 'admin123456' },
    { email: 'admin@admin.com', password: 'admin123456' },
    { email: 'admin', password: 'admin123456' }
  ];
  
  for (const creds of testCredentials) {
    try {
      const response = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: creds.email,
          password: creds.password
        })
      });
      
      if (response.ok) {
        console.log(`✅ Admin account found: ${creds.email}`);
        console.log('   You can proceed with the import!');
        return creds;
      }
    } catch (error) {
      // Continue to next credential
    }
  }
  
  console.log('❌ No admin account found with default credentials');
  console.log('\n💡 Solution:');
  console.log('1. Visit http://127.0.0.1:8090/_/');
  console.log('2. Create an admin account');
  console.log('3. Use one of these credentials in the import script:');
  testCredentials.forEach(c => console.log(`   - ${c.email} / ${c.password}`));
  console.log('   OR update the import script with your credentials');
  
  return null;
}

async function main() {
  const isRunning = await checkPocketBase();
  if (!isRunning) return;
  
  const hasCollections = await checkCollections();
  if (!hasCollections) return;
  
  const adminCreds = await testAdminSetup();
  
  if (adminCreds) {
    console.log('\n🚀 Ready to import!');
    console.log('==================');
    console.log('Run one of these commands:');
    console.log('- node import-sdk.js');
    console.log('- node import-api.js');
  } else {
    console.log('\n⏸️  Setup admin account first, then run the import');
  }
}

main().catch(console.error);

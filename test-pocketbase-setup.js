#!/usr/bin/env node
/**
 * PocketBase Collections Verification Script
 * Run this after setting up collections to verify everything is working
 */

const POCKETBASE_URL = 'http://localhost:8090';

async function testConnection() {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/health`);
    if (response.ok) {
      console.log('✅ PocketBase server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ PocketBase server is not running');
    console.log('   Please start PocketBase with: ./start-pocketbase.ps1');
    return false;
  }
}

async function testCollections() {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections`);
    if (response.ok) {
      const data = await response.json();
      const collections = data.items || [];
      
      console.log('📊 Available Collections:');
      collections.forEach(collection => {
        console.log(`   - ${collection.name} (${collection.type})`);
      });
      
      const expectedCollections = ['users', 'clients'];
      const hasRequired = expectedCollections.every(name => 
        collections.some(col => col.name === name)
      );
      
      if (hasRequired) {
        console.log('✅ All required collections are present');
      } else {
        console.log('⚠️  Some required collections are missing');
        console.log('   Expected: users, clients');
      }
      
      return hasRequired;
    }
  } catch (error) {
    console.log('❌ Could not fetch collections');
    return false;
  }
}

async function testAuth() {
  try {
    // Test with demo credentials
    const response = await fetch(`${POCKETBASE_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identity: 'admin@TimeIt.com',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      console.log('✅ Authentication test successful');
      console.log('   Demo user login working');
      return true;
    } else {
      console.log('⚠️  Authentication test failed');
      console.log('   Demo users may not be created yet');
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing PocketBase Setup...');
  console.log('================================');
  console.log('');
  
  const serverOk = await testConnection();
  if (!serverOk) return;
  
  console.log('');
  const collectionsOk = await testCollections();
  
  console.log('');
  const authOk = await testAuth();
  
  console.log('');
  console.log('📋 Summary:');
  console.log(`Server: ${serverOk ? '✅' : '❌'}`);
  console.log(`Collections: ${collectionsOk ? '✅' : '⚠️'}`);
  console.log(`Authentication: ${authOk ? '✅' : '⚠️'}`);
  
  if (serverOk && collectionsOk && authOk) {
    console.log('');
    console.log('🎉 PocketBase setup is complete and working!');
    console.log('   You can now use your Svelte app with authentication.');
  } else {
    console.log('');
    console.log('📝 Next steps:');
    if (!collectionsOk) {
      console.log('   1. Import collections: pocketbase-collections.json');
    }
    if (!authOk) {
      console.log('   2. Create demo users as described in POCKETBASE_SETUP.md');
    }
  }
}

runTests().catch(console.error);

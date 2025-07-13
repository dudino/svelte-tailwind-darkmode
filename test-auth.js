#!/usr/bin/env node

import PocketBase from 'pocketbase';

// Test script to check PocketBase SDK API methods

const pb = new PocketBase('http://127.0.0.1:8090');

console.log('🔍 PocketBase SDK Methods Test');
console.log('==============================\n');

console.log('Available methods on pb:');
console.log(Object.getOwnPropertyNames(pb).filter(prop => typeof pb[prop] === 'function'));

console.log('\nChecking pb.admins:');
console.log('pb.admins exists:', typeof pb.admins !== 'undefined');

if (pb.admins) {
  console.log('pb.admins methods:');
  console.log(Object.getOwnPropertyNames(pb.admins).filter(prop => typeof pb.admins[prop] === 'function'));
}

console.log('\nChecking collections:');
console.log('pb.collection method exists:', typeof pb.collection === 'function');

console.log('\nTesting admin authentication...');

// Test 1: Try modern admin auth
try {
  console.log('Trying pb.admins.authWithPassword...');
  await pb.admins.authWithPassword('admin@example.com', 'admin123456');
  console.log('✅ Admin auth successful with pb.admins');
} catch (error) {
  console.log('❌ pb.admins auth failed:', error.message);
  
  // Test 2: Try collection-based auth
  try {
    console.log('Trying pb.collection("_pb_admins_auth_").authWithPassword...');
    await pb.collection('_pb_admins_auth_').authWithPassword('admin@example.com', 'admin123456');
    console.log('✅ Admin auth successful with collection method');
  } catch (collError) {
    console.log('❌ Collection auth failed:', collError.message);
    
    // Test 3: Try different admin endpoint
    try {
      console.log('Trying direct fetch to admin auth endpoint...');
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
        console.log('✅ Direct fetch auth successful');
        console.log('Admin:', data.admin.email);
      } else {
        console.log('❌ Direct fetch failed:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('Error details:', errorData);
      }
    } catch (fetchError) {
      console.log('❌ Direct fetch error:', fetchError.message);
    }
  }
}

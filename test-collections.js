/**
 * Add demo data to PocketBase for testing dashboard
 */

const { getPocketBaseClient } = require('./src/lib/stores/authStore.js');

async function addDemoData() {
  console.log('Adding demo data to PocketBase...');
  
  try {
    // This is a simple Node.js script - we'll need to create a simpler version
    console.log('This script needs to be run in the browser context or with proper PocketBase SDK setup');
    
    // Instead, let's just check what collections exist
    const response = await fetch('http://127.0.0.1:8090/api/collections', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const collections = await response.json();
      console.log('Available collections:', collections.items?.map(c => c.name) || 'No collections found');
    } else {
      console.log('Failed to fetch collections:', response.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addDemoData();

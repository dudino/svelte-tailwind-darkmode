#!/usr/bin/env node

// Script to check what's actually in the notes collection

async function checkNotesData() {
  try {
    console.log('🔍 Checking Notes Collection Data');
    console.log('=================================\n');

    // Get all notes
    const notesResponse = await fetch('http://127.0.0.1:8090/api/collections/pbc_notes/records?expand=client_id,user_id');
    const notesData = await notesResponse.json();

    if (notesData.items && notesData.items.length > 0) {
      console.log(`Found ${notesData.items.length} notes:\n`);
      
      notesData.items.forEach((note, index) => {
        console.log(`Note ${index + 1}:`);
        console.log(`  ID: ${note.id}`);
        console.log(`  Type: ${note.type}`);
        console.log(`  Client ID (raw): ${note.client_id}`);
        console.log(`  User ID (raw): ${note.user_id}`);
        
        if (note.expand) {
          if (note.expand.client_id) {
            console.log(`  Client (expanded): ${note.expand.client_id.phone_number} (${note.expand.client_id.nickname})`);
          }
          if (note.expand.user_id) {
            console.log(`  User (expanded): ${note.expand.user_id.name || note.expand.user_id.email}`);
          }
        }
        console.log('');
      });
    } else {
      console.log('No notes found in the database.');
    }

    // Also check clients
    const clientsResponse = await fetch('http://127.0.0.1:8090/api/collections/pbc_clients/records');
    const clientsData = await clientsResponse.json();
    
    console.log('\n📱 Available Clients:');
    console.log('====================');
    if (clientsData.items) {
      clientsData.items.forEach(client => {
        console.log(`  ${client.id}: ${client.phone_number} (${client.nickname})`);
      });
    }

    // Check users
    const usersResponse = await fetch('http://127.0.0.1:8090/api/collections/_pb_users_auth_/records');
    const usersData = await usersResponse.json();
    
    console.log('\n👥 Available Users:');
    console.log('==================');
    if (usersData.items) {
      usersData.items.forEach(user => {
        console.log(`  ${user.id}: ${user.name || user.email} (${user.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    console.log('\n💡 Make sure PocketBase is running and you have proper access.');
  }
}

checkNotesData();

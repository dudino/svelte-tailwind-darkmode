#!/usr/bin/env node
/**
 * Alternative PocketBase Setup using Node.js and PocketBase SDK
 * This approach handles authentication properly
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function setupCollections() {
  console.log('🚀 Setting up PocketBase collections...');
  
  try {
    // Check if we need to create an admin first
    try {
      await pb.health.check();
      console.log('✅ PocketBase is running');
    } catch (error) {
      console.log('❌ PocketBase is not running. Please start it first.');
      process.exit(1);
    }

    // Try to authenticate as admin (this will fail if no admin exists)
    let isAdmin = false;
    try {
      // If there's already an admin, we'll get collections anyway
      const collections = await pb.collections.getList();
      console.log(`📊 Found ${collections.items.length} existing collections`);
    } catch (error) {
      console.log('ℹ️  No admin account detected or unauthorized');
    }

    // Create users collection if it doesn't exist
    try {
      await pb.collections.getOne('users');
      console.log('✅ Users collection already exists');
    } catch (error) {
      console.log('📋 Creating users collection...');
      
      const usersCollection = {
        name: 'users',
        type: 'auth',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
            options: { min: 1, max: 100 }
          },
          {
            name: 'role',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ['admin', 'operator', 'user']
            }
          },
          {
            name: 'status',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ['active', 'inactive']
            }
          },
          {
            name: 'phone',
            type: 'text',
            required: false,
            options: { min: 0, max: 20 }
          }
        ],
        options: {
          allowEmailAuth: true,
          allowUsernameAuth: false,
          requireEmail: true,
          minPasswordLength: 6
        }
      };

      try {
        await pb.collections.create(usersCollection);
        console.log('✅ Users collection created');
      } catch (createError) {
        console.log('⚠️  Could not create users collection:', createError.message);
        console.log('   This is normal if PocketBase requires admin setup first');
      }
    }

    // Create demo users
    console.log('👥 Creating demo users...');
    
    const demoUsers = [
      {
        email: 'admin@TimeIt.com',
        password: 'admin123',
        passwordConfirm: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        status: 'active',
        emailVisibility: true
      },
      {
        email: 'operator@TimeIt.com',
        password: 'operator123',
        passwordConfirm: 'operator123',
        name: 'Massage Operator',
        role: 'operator',
        status: 'active',
        emailVisibility: true
      },
      {
        email: 'user@TimeIt.com',
        password: 'user123',
        passwordConfirm: 'user123',
        name: 'Regular User',
        role: 'user',
        status: 'active',
        emailVisibility: true
      }
    ];

    for (const user of demoUsers) {
      try {
        await pb.collection('users').create(user);
        console.log(`✅ Created user: ${user.email}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  User already exists: ${user.email}`);
        } else {
          console.log(`⚠️  Could not create user ${user.email}:`, error.message);
        }
      }
    }

    // Test authentication
    console.log('🧪 Testing authentication...');
    try {
      const authData = await pb.collection('users').authWithPassword('admin@TimeIt.com', 'admin123');
      console.log('✅ Authentication successful!');
      console.log(`   Logged in as: ${authData.record.name} (${authData.record.role})`);
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
    }

    console.log('');
    console.log('🎉 Setup completed!');
    console.log('');
    console.log('Demo Login Credentials:');
    console.log('  Admin:    admin@TimeIt.com    / admin123');
    console.log('  Operator: operator@TimeIt.com / operator123');
    console.log('  User:     user@TimeIt.com     / user123');
    console.log('');
    console.log('Test your app at: http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupCollections();

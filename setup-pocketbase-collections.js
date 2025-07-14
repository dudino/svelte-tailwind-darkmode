#!/usr/bin/env node
/**
 * Automated PocketBase Setup Script
 * This script will create the required collections and demo users for the TimeIt application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PocketBase configuration export for import
const pbConfig = {
  collections: [
    {
      id: "users",
      name: "users",
      type: "auth",
      system: false,
      schema: [
        {
          id: "name",
          name: "name", 
          type: "text",
          system: false,
          required: true,
          unique: false,
          options: {
            min: 1,
            max: 100,
            pattern: ""
          }
        },
        {
          id: "role",
          name: "role",
          type: "select", 
          system: false,
          required: true,
          unique: false,
          options: {
            maxSelect: 1,
            values: ["admin", "operator", "user"]
          }
        },
        {
          id: "status", 
          name: "status",
          type: "select",
          system: false,
          required: true,
          unique: false,
          options: {
            maxSelect: 1,
            values: ["active", "inactive"]
          }
        },
        {
          id: "phone",
          name: "phone",
          type: "text",
          system: false,
          required: false,
          unique: false,
          options: {
            min: 0,
            max: 20,
            pattern: ""
          }
        }
      ],
      indexes: [],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {
        allowEmailAuth: true,
        allowUsernameAuth: false,
        allowOAuth2Auth: false,
        requireEmail: true,
        exceptEmailDomains: [],
        onlyEmailDomains: [],
        minPasswordLength: 6
      }
    },
    {
      id: "clients",
      name: "clients", 
      type: "base",
      system: false,
      schema: [
        {
          id: "name",
          name: "name",
          type: "text",
          system: false,
          required: true,
          unique: false,
          options: {
            min: 1,
            max: 100,
            pattern: ""
          }
        },
        {
          id: "email",
          name: "email",
          type: "email",
          system: false,
          required: false,
          unique: false,
          options: {
            exceptDomains: [],
            onlyDomains: []
          }
        },
        {
          id: "phone",
          name: "phone", 
          type: "text",
          system: false,
          required: false,
          unique: false,
          options: {
            min: 0,
            max: 20,
            pattern: ""
          }
        },
        {
          id: "status",
          name: "status",
          type: "select",
          system: false,
          required: true,
          unique: false,
          options: {
            maxSelect: 1,
            values: ["active", "inactive", "banned"]
          }
        },
        {
          id: "notes",
          name: "notes",
          type: "text",
          system: false,
          required: false,
          unique: false,
          options: {
            min: 0,
            max: 1000,
            pattern: ""
          }
        }
      ],
      indexes: [],
      listRule: null,
      viewRule: null, 
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {}
    }
  ]
};

// Export the configuration as JSON for import into PocketBase
const configJson = JSON.stringify(pbConfig, null, 2);
fs.writeFileSync(path.join(__dirname, 'pocketbase-collections.json'), configJson);

console.log('✅ PocketBase configuration exported to: pocketbase-collections.json');
console.log('');
console.log('📋 Manual Setup Instructions:');
console.log('=============================');
console.log('');
console.log('1. Open PocketBase Admin: http://localhost:8090/_/');
console.log('2. Create admin account (first time only)');
console.log('3. Go to Collections > Import collections');
console.log('4. Upload the generated pocketbase-collections.json file');
console.log('');
console.log('📝 After importing collections, create these demo users:');
console.log('');
console.log('Admin User:');
console.log('  Email: admin@TimeIt.com');
console.log('  Password: admin123');
console.log('  Name: System Administrator');
console.log('  Role: admin');
console.log('  Status: active');
console.log('');
console.log('Operator User:');
console.log('  Email: operator@TimeIt.com'); 
console.log('  Password: operator123');
console.log('  Name: Massage Operator');
console.log('  Role: operator');
console.log('  Status: active');
console.log('');
console.log('Regular User:');
console.log('  Email: user@TimeIt.com');
console.log('  Password: user123');
console.log('  Name: Regular User'); 
console.log('  Role: user');
console.log('  Status: active');
console.log('');
console.log('🚀 After setup, your app will be ready to use!');

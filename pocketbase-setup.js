/**
 * PocketBase Collections Setup Script
 * Run this script to automatically create the required collections for the Affinity application
 */

// Collection configurations
const collections = [
  {
    name: "users",
    type: "auth",
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: "role",
        type: "select",
        required: true,
        options: {
          values: ["admin", "operator", "user"],
          maxSelect: 1
        }
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          values: ["active", "inactive"],
          maxSelect: 1
        }
      },
      {
        name: "phone",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 20
        }
      },
      {
        name: "avatar",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"]
        }
      }
    ],
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
    name: "clients",
    type: "base",
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        options: {
          min: 1,
          max: 100
        }
      },
      {
        name: "email",
        type: "email",
        required: false
      },
      {
        name: "phone",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 20
        }
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          values: ["active", "inactive", "banned"],
          maxSelect: 1
        }
      },
      {
        name: "notes",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 1000
        }
      },
      {
        name: "created_by",
        type: "relation",
        required: true,
        options: {
          collectionId: "users",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1
        }
      }
    ]
  },
  {
    name: "appointments",
    type: "base",
    schema: [
      {
        name: "client",
        type: "relation",
        required: true,
        options: {
          collectionId: "clients",
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: "service_type",
        type: "select",
        required: true,
        options: {
          values: ["massage", "therapy", "consultation", "other"],
          maxSelect: 1
        }
      },
      {
        name: "scheduled_at",
        type: "date",
        required: true
      },
      {
        name: "duration",
        type: "number",
        required: true,
        options: {
          min: 15,
          max: 480
        }
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          values: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
          maxSelect: 1
        }
      },
      {
        name: "notes",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 1000
        }
      },
      {
        name: "created_by",
        type: "relation",
        required: true,
        options: {
          collectionId: "users",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1
        }
      }
    ]
  }
];

// Demo users to create
const demoUsers = [
  {
    email: "admin@affinity.com",
    password: "admin123",
    passwordConfirm: "admin123",
    name: "System Administrator",
    role: "admin",
    status: "active",
    emailVisibility: true
  },
  {
    email: "operator@affinity.com", 
    password: "operator123",
    passwordConfirm: "operator123",
    name: "Massage Operator",
    role: "operator",
    status: "active",
    emailVisibility: true
  },
  {
    email: "user@affinity.com",
    password: "user123", 
    passwordConfirm: "user123",
    name: "Regular User",
    role: "user",
    status: "active",
    emailVisibility: true
  }
];

console.log('PocketBase Collections Configuration:');
console.log('=====================================');
console.log('');
console.log('Collections to create:');
collections.forEach(collection => {
  console.log(`- ${collection.name} (${collection.type})`);
});
console.log('');
console.log('Demo users to create:');
demoUsers.forEach(user => {
  console.log(`- ${user.email} (${user.role})`);
});
console.log('');
console.log('To set up these collections:');
console.log('1. Go to http://localhost:8090/_/');
console.log('2. Create an admin account if this is your first time');
console.log('3. Create each collection manually with the schema defined above');
console.log('4. Add the demo users to test the authentication');
console.log('');
console.log('Alternatively, you can import this configuration using PocketBase admin interface.');

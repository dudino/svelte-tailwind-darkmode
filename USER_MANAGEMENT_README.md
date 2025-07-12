# User Management PWA with PocketBase

A comprehensive user authentication and management system built with SvelteKit and PocketBase, designed as a Progressive Web App (PWA) with offline-first capabilities.

## Features

### 🔐 Authentication System
- **Login/Registration**: Email-based authentication with password
- **Offline Authentication**: Continue working when offline using cached data
- **Role-Based Access**: Three user roles (User, Operator, Administrator)
- **Auto-sync**: Automatic synchronization when connection is restored

### 👥 User Management (Based on your specifications)
- **User Data Structure**:
  - userId* (required)
  - Role (User, Operator, Administrator)
  - Email* (required)
  - Nickname* (required)
  - Languages[] (Czech, English, Russian, etc.)
  - Phone* (required)
  - Contact details (firstName, lastName, dateOfBirth, idNumber, address)
  - Services[] (available services)
  - isActive (True/False)
  - hasAccommodation (True/False)

### 🌐 PWA Features
- **Offline-First**: Works without internet connection
- **Data Persistence**: IndexedDB for local storage
- **Background Sync**: Syncs changes when online
- **Responsive Design**: Works on mobile and desktop

### 🛠 Technical Features
- **SvelteKit**: Modern web framework
- **TypeScript**: Type-safe development
- **PocketBase**: Backend-as-a-Service
- **IndexedDB**: Local database storage
- **Wuchale**: Internationalization (i18n)

## Quick Start

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Set Up Environment
Copy the environment example file:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and configure your PocketBase URL:
\`\`\`env
VITE_POCKETBASE_URL=http://localhost:8090
\`\`\`

### 3. Set Up PocketBase

#### Option A: Use PocketBase Cloud
1. Visit [PocketBase.io](https://pocketbase.io/)
2. Create an account and project
3. Update your `.env` with the provided URL

#### Option B: Self-Host PocketBase
1. Download PocketBase from [GitHub](https://github.com/pocketbase/pocketbase/releases)
2. Run locally:
   \`\`\`bash
   ./pocketbase serve
   \`\`\`
3. Open http://localhost:8090/_/ to configure

### 4. Configure PocketBase Collections

Create a `users` collection with these fields:

| Field | Type | Options |
|-------|------|---------|
| userId | Text | Required, Unique |
| email | Email | Required, Unique |
| nickname | Text | Required |
| phone | Text | Required |
| role | Select | Options: user, operator, administrator |
| isActive | Bool | Default: true |
| hasAccommodation | Bool | Default: false |
| languages | JSON | Optional |
| services | JSON | Optional |
| contactDetails | JSON | Optional |

### 5. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:5173/user-management to test the system.

## Project Structure

\`\`\`
src/
├── lib/
│   ├── components/
│   │   └── UserManagement.svelte    # Main user management UI
│   ├── stores/
│   │   └── userStore.ts             # User authentication & management stores
│   ├── types/
│   │   └── user.ts                  # TypeScript type definitions
│   └── utils/
│       └── storage.ts               # IndexedDB storage utilities
├── locales/                         # Internationalization files
│   ├── en.svelte.js                # English translations
│   ├── cs.svelte.js                # Czech translations
│   └── ru.svelte.js                # Russian translations
└── routes/
    ├── +layout.ts                   # Layout configuration
    └── user-management/
        └── +page.svelte             # User management page
\`\`\`

## Usage Guide

### Authentication

#### Login
\`\`\`typescript
import { login } from '$lib/stores/userStore';

const result = await login('user@example.com', 'password');
if (result.success) {
    console.log('User logged in:', result.user);
}
\`\`\`

#### Register
\`\`\`typescript
import { register } from '$lib/stores/userStore';

const userData = {
    userId: 'unique-id',
    email: 'user@example.com',
    nickname: 'John Doe',
    phone: '+1234567890',
    password: 'securepassword',
    passwordConfirm: 'securepassword',
    role: 'user',
    isActive: true,
    hasAccommodation: false
};

const result = await register(userData);
\`\`\`

### User Management

#### Update User
\`\`\`typescript
import { updateUser } from '$lib/stores/userStore';

const result = await updateUser('user-id', {
    nickname: 'New Nickname',
    languages: ['en', 'cs'],
    services: ['service1', 'service2']
});
\`\`\`

#### Delete User
\`\`\`typescript
import { deleteUser } from '$lib/stores/userStore';

const result = await deleteUser('user-id');
\`\`\`

### Offline Functionality

The system automatically handles offline scenarios:

1. **Offline Operations**: All CRUD operations work offline
2. **Sync Queue**: Changes are queued for synchronization
3. **Auto-Sync**: When connection returns, queued changes sync automatically
4. **Conflict Resolution**: Server data takes precedence on conflicts

### Stores and Reactivity

\`\`\`typescript
import { 
    currentUser,      // Current authenticated user
    isAuthenticated,  // Boolean authentication status
    users,           // All users array
    syncStatus,      // 'online' | 'offline' | 'syncing'
    isLoading,       // Loading state
    error           // Error messages
} from '$lib/stores/userStore';

// Reactive updates
$: if ($currentUser) {
    console.log('User changed:', $currentUser.nickname);
}
\`\`\`

## Role-Based Permissions

Based on your requirements, the system implements three user roles:

### User / Masérka
- View own profile
- Edit own profile
- View own schedule
- Manage own bookings

### Operator
- All User permissions +
- View all schedules
- Manage bookings for all users
- View and manage clients
- Generate PIN codes
- Confirm bookings
- View reviews

### Administrator
- All Operator permissions +
- Create users
- Edit users
- Delete users
- List users
- Search users
- View user details
- Assign roles
- Change user status

## API Reference

### Authentication Functions

- `login(email, password)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Sign out current user

### User Management Functions

- `updateUser(userId, updateData)` - Update user information
- `deleteUser(userId)` - Delete user account
- `fetchUsersFromServer()` - Refresh users from server
- `loadUsersFromStorage()` - Load users from local storage

### Sync Functions

- `syncData()` - Manual synchronization with server
- Auto-sync triggers on:
  - Network connection restored
  - App initialization (if online)
  - After successful authentication

## Development

### Adding New Features

1. **New User Fields**: Update `User` interface in `src/lib/types/user.ts`
2. **New Permissions**: Modify `ROLE_PERMISSIONS` constant
3. **New Languages**: Add to `AVAILABLE_LANGUAGES` array
4. **New Services**: Add to `AVAILABLE_SERVICES` array

### Testing

The system includes a comprehensive test page at `/user-management` that demonstrates:
- User registration and login
- User listing and search
- User editing with all fields
- Role-based access control
- Offline functionality
- Sync status monitoring

### Build and Deploy

\`\`\`bash
# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## Troubleshooting

### Common Issues

1. **PocketBase Connection Failed**
   - Check if PocketBase server is running
   - Verify `VITE_POCKETBASE_URL` in `.env`
   - Check network connectivity

2. **Sync Not Working**
   - Ensure user is authenticated
   - Check browser console for errors
   - Verify PocketBase collection schema

3. **Locale Import Errors**
   - Ensure all locale files exist
   - Check `AVAILABLE_LOCALES` in `+layout.ts`
   - Run `npm run extract` to generate translations

### Debug Mode

Enable debug logging by setting:
\`\`\`javascript
localStorage.setItem('debug', 'userStore');
\`\`\`

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

MIT License - see LICENSE file for details.

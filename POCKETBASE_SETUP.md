# PocketBase Setup Guide for TimeIt Application

## Step 1: Access PocketBase Admin
1. Open your browser and go to: **http://localhost:8090/_/**
2. If this is your first time, you'll see a setup screen
3. Create an admin account with your preferred email and password

## Step 2: Import Collections
1. In the PocketBase admin interface, click on **"Collections"** in the sidebar
2. Click the **"Import collections"** button
3. Select the file: `pocketbase-collections.json` (generated in your project folder)
4. Click **"Import"** to create the collections

## Step 3: Create Demo Users
After importing collections, you'll have a `users` collection. Create these demo users:

### Admin User
- Go to Collections > users > "New record"
- **Email**: `admin@TimeIt.com`
- **Password**: `admin123`
- **Password confirm**: `admin123`
- **Name**: `System Administrator`
- **Role**: `admin`
- **Status**: `active`
- **Email visibility**: ✅ (checked)

### Operator User
- **Email**: `operator@TimeIt.com`
- **Password**: `operator123`
- **Password confirm**: `operator123`
- **Name**: `Massage Operator`
- **Role**: `operator`
- **Status**: `active`
- **Email visibility**: ✅ (checked)

### Regular User
- **Email**: `user@TimeIt.com`
- **Password**: `user123`
- **Password confirm**: `user123`
- **Name**: `Regular User`
- **Role**: `user`
- **Status**: `active`
- **Email visibility**: ✅ (checked)

## Step 4: Test the Application
1. Go to your Svelte app: **http://localhost:5173/login**
2. Try logging in with any of the demo credentials
3. The app should authenticate successfully and redirect you to the dashboard

## Collections Created
- **users** (auth collection): User authentication and profiles
- **clients** (base collection): Client management for the massage parlor
- **appointments** (future): Appointment scheduling (will be added later)

## Troubleshooting
- Make sure PocketBase is running on port 8090
- Check that your `.env` file has `VITE_POCKETBASE_URL=http://localhost:8090`
- Refresh your Svelte app after setting up users
- Check browser console for any authentication errors

## Next Steps
After setup is complete:
1. Test login with demo credentials
2. Explore the user management interface
3. Start adding real users and data as needed

# Operator Booking System

## Overview
The operator booking system allows operators to:

1. **View Bookings**: See current confirmed user schedules for each location and room
2. **Manage Schedules**: View available time slots in both calendar and grid view
3. **Create Bookings**: Add new bookings by searching for clients or creating new ones
4. **Client Management**: Search by phone, email, or username, or create new clients on the fly

## Features

### Calendar/Grid View
- **Calendar View**: Shows time slots with existing bookings displayed
- **Grid View**: Shows room cards with booking summaries
- **Location Filter**: Filter by specific massage parlor locations
- **Date Selection**: Choose specific dates to view/manage

### Booking Creation
- **Client Search**: Search by phone number, email, or username
- **New Client Creation**: If client doesn't exist, create a new one in the same modal
- **Service Selection**: Choose from available services with duration auto-calculation
- **Time Management**: Automatic end time calculation based on service duration
- **Room Assignment**: Select specific rooms or auto-assign

### PWA Integration
- **Offline Support**: Store works offline with local data caching
- **Real-time Updates**: Automatic sync with PocketBase backend
- **Responsive Design**: Works on mobile devices and tablets

## Components

### Main Page (`/operator`)
- `OperatorBookingsPage.svelte` - Main operator interface
- Location and date filters
- Calendar/Grid view toggle
- Add booking button

### Modals
- `BookingModal.svelte` - Create new bookings
- `ClientModal.svelte` - Create new clients when they don't exist

### Store
- `operatorBookingsStore.ts` - Centralized state management
- Real-time data loading from PocketBase
- Client search and creation functions
- Booking management operations

## Usage

1. **Login**: Use the demo operator account:
   - Email: `operator@massage.com`
   - Password: `operator123456`
2. **Access**: Navigate to `/operator` (requires operator or administrator role)
3. **Select Location**: Choose which massage parlor location to manage
4. **Choose Date**: Select the date to view/manage bookings
5. **View Mode**: Switch between calendar and grid view
6. **Add Booking**: Click "Add Booking" to create new appointments
7. **Client Search**: Type phone, email, or username to find existing clients
8. **New Clients**: If client doesn't exist, create them in the same workflow

## Demo Data
For testing purposes, you can use these sample data:
- **Phone Numbers**: `+420 123 456 789`, `+420 987 654 321`
- **Email Addresses**: `john@example.com`, `jane@example.com`
- **Service Duration**: Services automatically calculate end times
- **Time Slots**: 30-minute intervals from 8:00 AM to 10:00 PM

## Technical Details

### Authentication
- Role-based access (operator or administrator required)
- Automatic redirection for unauthorized users
- Session management with PocketBase

### Data Management
- Real-time sync with PocketBase collections
- Optimistic updates for better UX
- Error handling and retry mechanisms

### UI/UX
- Modern design with Tailwind CSS
- Responsive layout for all screen sizes
- Loading states and error feedback
- Toast notifications for user actions

## Troubleshooting

### Common Issues
1. **"Loading..." Screen**: Ensure you're logged in with operator or administrator role
2. **No Data Showing**: Check that PocketBase is running and connected
3. **Navigation Throttling**: Browser protection against rapid navigation - normal behavior
4. **Permission Denied**: Verify user role in PocketBase admin panel

### Debug Commands
Available in browser console:
```javascript
// Clear all local data
window.debugUtils.clearAllData()

// Reset database to initial state
window.debugUtils.resetDatabase()

// Clear failed sync items
window.debugUtils.clearFailedSyncItems()

// Reset demo users
window.debugUtils.resetDemoUsers()
```

### System Requirements
- Modern browser with IndexedDB support
- JavaScript enabled
- Local storage enabled
- PocketBase server running on port 8090 (default)

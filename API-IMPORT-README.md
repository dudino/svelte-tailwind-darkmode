# 🎭 PocketBase Demo Data Import

This directory contains everything you need to import comprehensive demo data into your PocketBase massage parlor management system via API.

## 📋 What's Included

### 📁 Files Created
- `demo-data.json` - Complete demo data in JSON format
- `import-sdk.js` - Import script using PocketBase JavaScript SDK (Recommended)
- `import-api.js` - Import script using direct REST API calls
- `setup-import.ps1` - PowerShell setup script for Windows
- `setup-import.sh` - Bash setup script for Linux/Mac
- `DEMO-DATA-GUIDE.md` - Detailed manual import guide

### 🎯 Demo Data Overview
- **5 Users**: Admin, Operator, 3 Therapists with different roles
- **3 Locations**: Prague, Brno, Ostrava wellness centers
- **6 Rooms**: Various types with different amenities and pricing
- **10 Services**: Complete massage and wellness service menu
- **6 Clients**: Multi-language clients with different communication preferences
- **5 Schedules**: Various availability patterns and time slots
- **5 Bookings**: Different booking statuses and scenarios
- **5 Notes**: Client feedback and operational notes
- **5 Reviews**: Customer reviews with management responses

## 🚀 Quick Start

### Prerequisites
1. **PocketBase Running**: Make sure PocketBase is running on `http://127.0.0.1:8090`
   ```bash
   ./pocketbase serve
   ```

2. **Admin Account**: Create an admin account at `http://127.0.0.1:8090/_/`

3. **Node.js Installed**: Required for running the import scripts

### Method 1: Automated Setup (Recommended)

#### Windows (PowerShell)
```powershell
.\setup-import.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x setup-import.sh
./setup-import.sh
```

### Method 2: Manual Import

1. **Install Dependencies**
   ```bash
   npm install pocketbase
   ```

2. **Update Credentials** in `import-sdk.js` (line 14):
   ```javascript
   await pb.admins.authWithPassword('your-admin@email.com', 'your-password');
   ```

3. **Run Import**
   ```bash
   node import-sdk.js
   ```

## 🔧 Import Methods

### 🎯 SDK Import (Recommended)
- Uses official PocketBase JavaScript SDK
- More reliable error handling
- Better type safety
- Automatic retry logic

**Usage:**
```bash
node import-sdk.js
```

### 🔗 API Import (Alternative)
- Direct REST API calls
- No external dependencies
- Good for understanding PocketBase API

**Usage:**
```bash
node import-api.js
```

## ⚙️ Configuration

### Default Admin Credentials (Update These!)
- **SDK Script**: `admin@example.com` / `admin123456`
- **API Script**: `admin@pocketbase.com` / `admin123456`

### Demo User Credentials (After Import)
| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@massage.com | admin123456 |
| Operator | operator@massage.com | operator123456 |
| Therapist | massage1@massage.com | user123456 |
| Therapist | massage2@massage.com | user123456 |
| Therapist | massage3@massage.com | user123456 |

## 📊 Import Process

The import follows the correct dependency order:

1. **Users** (Authentication collection)
2. **Locations** (Business locations)
3. **Rooms** (Depends on locations)
4. **Services** (Available services)
5. **Clients** (Customer database)
6. **Schedules** (Depends on users and rooms)
7. **Bookings** (Depends on clients, users, rooms, services)
8. **Notes** (Depends on clients, users, bookings)
9. **Reviews** (Depends on bookings, clients, users)

## 🔍 Troubleshooting

### Common Issues

#### 1. PocketBase Not Running
```
❌ PocketBase server is not running
```
**Solution**: Start PocketBase with `./pocketbase serve`

#### 2. Admin Authentication Failed
```
❌ Admin authentication failed
```
**Solution**: 
- Create admin account at `http://127.0.0.1:8090/_/`
- Update credentials in the import script

#### 3. Collection Not Found
```
❌ Failed to create [collection]: Collection not found
```
**Solution**: 
- Import your `pocketbase-collections.json` first
- Make sure all collections are created

#### 4. Relation Errors
```
❌ Error creating [record]: Invalid relation ID
```
**Solution**: The script handles this automatically, but check that parent records were created successfully

### Debug Mode
Add this to see detailed API responses:
```javascript
// Add to the top of import script
process.env.DEBUG = 'pocketbase:*';
```

## 🧪 Testing After Import

1. **Access Admin UI**: `http://127.0.0.1:8090/_/`
2. **Login with Demo Users**: Use credentials from the table above
3. **Test Role Permissions**: Different users should see different data
4. **Verify Relationships**: Check that bookings link to clients, rooms, etc.
5. **Test Business Logic**: Create new bookings, update schedules, etc.

## 📝 Customization

### Adding More Data
Modify `demo-data.json` to add:
- More users, clients, or services
- Additional locations or rooms
- Custom booking scenarios
- Different review patterns

### Updating Relationships
The scripts automatically assign relationships, but you can modify the logic in:
- `importBookings()` - How bookings are assigned to clients/users
- `importSchedules()` - How schedules are assigned to users/rooms
- `importNotes()` - How notes are linked to clients/bookings

### Business Rules
Customize the demo data to match your business:
- Update service prices and durations
- Modify room amenities and rates
- Adjust user roles and permissions
- Change location information

## 🔄 Re-importing Data

To clear and re-import:

1. **Clear Collections** (via Admin UI or API)
2. **Run Import Again**
3. **Update Any Custom Relations**

**Warning**: This will delete all existing data!

## 🌐 Production Notes

### Security
- Change all default passwords before production
- Update email addresses to real ones
- Review and adjust access rules
- Enable email verification

### Performance
- The import creates relationships efficiently
- All foreign keys are properly set
- Indexes are maintained automatically

### Backup
- Always backup before importing
- Test import on development first
- Verify all data after import

## 📚 Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [JavaScript SDK Guide](https://github.com/pocketbase/js-sdk)
- [REST API Reference](https://pocketbase.io/docs/api-records/)
- [Collection Schema Guide](https://pocketbase.io/docs/collections/)

## 🎉 Success!

After successful import, you'll have a fully functional massage parlor management system with:
- ✅ Multi-role user system
- ✅ Complete business data
- ✅ Realistic client scenarios
- ✅ Operational schedules and bookings
- ✅ Customer feedback system

Ready for development and testing! 🚀

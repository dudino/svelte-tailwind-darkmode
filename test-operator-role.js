// Test script to verify operator login and role
// Run this in browser console after logging in as operator

async function testOperatorRole() {
  try {
    const pb = await window.pocketbase;
    if (!pb) {
      console.error('PocketBase not available');
      return;
    }

    const authData = pb.authStore.model;
    console.log('Current auth data:', authData);
    
    if (authData) {
      console.log('User ID:', authData.id);
      console.log('Username:', authData.username);
      console.log('Email:', authData.email);
      console.log('Role:', authData.role);
      console.log('Is operator?', authData.role === 'operator');
      console.log('Is administrator?', authData.role === 'administrator');
      
      // Check if user has operator or admin role
      const hasOperatorAccess = ['operator', 'administrator'].includes(authData.role);
      console.log('Has operator access?', hasOperatorAccess);
    } else {
      console.log('No authenticated user');
    }
  } catch (error) {
    console.error('Error testing operator role:', error);
  }
}

// Export to window for easy access
window.testOperatorRole = testOperatorRole;

console.log('Operator role test script loaded. Run window.testOperatorRole() to test.');

import { initializeAdminCodes } from '../services/adminService'

// Function to initialize admin codes
export const initializeDefaultAdminCodes = async () => {
  try {
    await initializeAdminCodes()
    console.log('✅ Admin codes initialized successfully!')
    console.log('📋 Default admin codes:')
    console.log('   - RIDESAFE2024')
    console.log('   - ADMIN123')
    console.log('')
    console.log('🔐 You can use these codes to register as admin, or create new ones in the admin panel.')
  } catch (error) {
    console.error('❌ Error initializing admin codes:', error)
  }
}

// Call this function when needed
// initializeDefaultAdminCodes() 
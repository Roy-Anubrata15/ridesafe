// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin' | 'driver';
  createdAt: Date;
}

// Student Types
export interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
  parentId: string;
  pickupAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Driver Types
export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleNumber: string;
  experience: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Admin Types
export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  adminCode: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
  phone: string;
}

export interface RegisterFormData {
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  name: string;
  
  // User specific (simplified)
  studentName: string;
  
  // Driver specific
  licenseNumber: string;
  vehicleNumber: string;
  experience: string;
  
  // Admin specific
  adminCode: string;
} 
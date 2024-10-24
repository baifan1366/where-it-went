// Users Table Interface
export interface User {
  id: string; // UUID
  email: string;
  password_hash: string;
  language?: string; // Default is 'en'
  theme?: string; // Default is 'light'
  created_at?: Date; // Automatically generated timestamp
  updated_at?: Date; // Automatically generated timestamp
}

// Categories Table Interface
export interface Category {
  id: string; // UUID
  user_id: string; // UUID referencing Users table
  name: string;
  type: 'income' | 'expense'; // Either 'income' or 'expense'
  icon?: string;
  created_at?: Date; // Automatically generated timestamp
  updated_at?: Date; // Automatically generated timestamp
}

// Transactions Table Interface
export interface Transaction {
  id: string; // UUID
  user_id: string; // UUID referencing Users table
  category_id?: string; // UUID referencing Categories table, can be optional
  amount: number; // Amount of the transaction
  type: 'income' | 'expense'; // Either 'income' or 'expense'
  description?: string; // Optional description
  date: string; // Date of the transaction (in YYYY-MM-DD format)
  created_at?: Date; // Automatically generated timestamp
  updated_at?: Date; // Automatically generated timestamp
}

// Budgets Table Interface
export interface Budget {
  id: string; // UUID
  user_id: string; // UUID referencing Users table
  month: string; // YYYY-MM format
  initial_amount: number; // Initial budget amount
  used_amount?: number; // Default is 0
  created_at?: Date; // Automatically generated timestamp
  updated_at?: Date; // Automatically generated timestamp
}

// Monthly Reports Table Interface
export interface MonthlyReport {
  id: string; // UUID
  user_id: string; // UUID referencing Users table
  month: string; // YYYY-MM format
  total_income?: number; // Default is 0
  total_expense?: number; // Default is 0
  created_at?: Date; // Automatically generated timestamp
  updated_at?: Date; // Automatically generated timestamp
}

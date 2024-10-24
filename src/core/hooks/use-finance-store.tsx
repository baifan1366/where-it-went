import { Env } from '@env';
import { type AuthResponse, createClient } from '@supabase/supabase-js';
import { create } from 'zustand';

import { getItem, removeItem,setItem } from '@/core/storage';


// 创建一个适配器，使 MMKV 与 Supabase 兼容
const MMKVAdapter = {
  getItem: (key: string) => {
    const value = getItem<string>(key);
    return value === null ? null : value;
  },
  setItem: (key: string, value: string) => {
    setItem(key, value);
  },
  removeItem: (key: string) => {
    removeItem(key);
  },
};

// 创建 Supabase 客户端
const supabase = createClient(Env.SUPABASE_URL, Env.SUPABASE_ANON_KEY, {
  auth: {
    storage: MMKVAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
});

console.log('supabase', Env.SUPABASE_URL, Env.SUPABASE_ANON_KEY);

interface FinanceStore {
  //login
  login: (email: string, password: string) => Promise<AuthResponse['data']>

  // Users
  createUser: (email: string, password: string, language?: string, theme?: string) => Promise<any>
  getUserById: (id: string) => Promise<any>
  updateUser: (id: string, updates: Partial<User>) => Promise<any>
  deleteUser: (id: string) => Promise<any>

  // Categories
  createCategory: (userId: string, name: string, type: 'income' | 'expense') => Promise<any>
  getCategoryByCategoryId: (categoryId: string) => Promise<any>
  getCategoriesByUserId: (userId: string) => Promise<any>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<any>
  deleteCategory: (id: string) => Promise<any>

  // Transactions
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<any>
  getTransactionsByUserId: (userId: string) => Promise<any>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<any>
  deleteTransaction: (id: string) => Promise<any>

  // Budgets
  createBudget: (userId: string, month: string, initialAmount: number) => Promise<any>
  getBudgetsByUserId: (userId: string) => Promise<any>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<any>
  deleteBudget: (id: string) => Promise<any>

  // Monthly Reports
  createMonthlyReport: (userId: string, month: string, totalIncome: number, totalExpense: number) => Promise<any>
  getMonthlyReportsByUserId: (userId: string) => Promise<any>
  updateMonthlyReport: (id: string, updates: Partial<MonthlyReport>) => Promise<any>
  deleteMonthlyReport: (id: string) => Promise<any>

  // 添加 uploadIcon 
  uploadIcon: (file: File, fileName: string) => Promise<string | null>
}

interface User {
  id: string
  email: string
  language: string
  theme: string
}

interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
}

interface Transaction {
  id: string
  user_id: string
  category_id: string
  amount: number
  type: 'income' | 'expense'
  description?: string
  date: string
}

interface Budget {
  id: string
  user_id: string
  month: string
  initial_amount: number
  used_amount: number
}

interface MonthlyReport {
  id: string
  user_id: string
  month: string
  total_income: number
  total_expense: number
}

const useFinanceStore = create<FinanceStore>(() => ({
  //login
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },
  // Users
  createUser: async (email, password, language = 'en', theme = 'light') => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({ id: data.user?.id, email, language, theme })
    if (userError) throw userError
    return userData
  },
  getUserById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  updateUser: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    return data
  },
  deleteUser: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },

  // Categories
  createCategory: async (userId, name, type) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, type })
    if (error) throw error
    return data
  },
  getCategoryByCategoryId: async (categoryId) => {
    const { data, error } = await supabase
      .from('categories') 
      .select('*')
      .eq('id', categoryId)
    if (error) throw error
    return data
  },
  getCategoriesByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },
  updateCategory: async (id, updates) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    return data
  },
  deleteCategory: async (id) => {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },

  // Transactions
  createTransaction: async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
    if (error) throw error
    return data
  },
  getTransactionsByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },
  updateTransaction: async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    return data
  },
  deleteTransaction: async (id) => {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },

  // Budgets
  createBudget: async (userId, month, initialAmount) => {
    const { data, error } = await supabase
      .from('budgets')
      .insert({ user_id: userId, month, initial_amount: initialAmount })
    if (error) throw error
    return data
  },
  getBudgetsByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },
  updateBudget: async (id, updates) => {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    return data
  },
  deleteBudget: async (id) => {
    const { data, error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },

  // Monthly Reports
  createMonthlyReport: async (userId, month, totalIncome, totalExpense) => {
    const { data, error } = await supabase
      .from('monthly_reports')
      .insert({ user_id: userId, month, total_income: totalIncome, total_expense: totalExpense })
    if (error) throw error
    return data
  },
  getMonthlyReportsByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },
  updateMonthlyReport: async (id, updates) => {
    const { data, error } = await supabase
      .from('monthly_reports')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    return data
  },
  deleteMonthlyReport: async (id) => {
    const { data, error } = await supabase
      .from('monthly_reports')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },

  // 实现 uploadIcon 函数
  uploadIcon: async (file, fileName) => {
    const { error } = await supabase.storage
      .from('category-icons')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading file:', error)
      return null
    }
    
    // 获取上传文件的公共 URL
    const { data } = supabase
      .storage
      .from('category-icons')
      .getPublicUrl(fileName)

    return data.publicUrl
  },
}))

export default useFinanceStore

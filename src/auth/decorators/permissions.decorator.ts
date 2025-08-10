import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route or controller
 * @param permissions Array of permission keys required
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Common permission constants organized by module
 */
export const PERMISSIONS = {
  // Business management
  BUSINESS: {
    VIEW: 'business.view',
    UPDATE: 'business.update',
    DELETE: 'business.delete',
  },

  // Items management
  ITEMS: {
    VIEW: 'items.view',
    CREATE: 'items.create',
    UPDATE: 'items.update',
    DELETE: 'items.delete',
    READ: 'items.view', // Alias for backward compatibility
  },

  // Inventory management
  INVENTORY: {
    VIEW: 'inventory.view',
    MANAGE: 'inventory.manage',
    ADJUST: 'inventory.adjust',
  },

  // Orders management
  ORDERS: {
    VIEW: 'orders.view',
    CREATE: 'orders.create',
    UPDATE: 'orders.update',
    DELETE: 'orders.delete',
    MANAGE: 'orders.manage',
    READ: 'orders.view', // Alias for backward compatibility
  },

  // Customers management
  CUSTOMERS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete',
  },

  // Invoices management
  INVOICES: {
    VIEW: 'invoices.view',
    CREATE: 'invoices.create',
    UPDATE: 'invoices.update',
    DELETE: 'invoices.delete',
    SEND: 'invoices.send',
    VOID: 'invoices.void',
  },

  // Payments management
  PAYMENTS: {
    VIEW: 'payments.view',
    CREATE: 'payments.create',
    MANAGE: 'payments.manage',
    REFUND: 'payments.refund',
  },

  // Expenses management
  EXPENSES: {
    VIEW: 'expenses.view',
    CREATE: 'expenses.create',
    UPDATE: 'expenses.update',
    DELETE: 'expenses.delete',
    APPROVE: 'expenses.approve',
  },

  // Reports
  REPORTS: {
    VIEW: 'reports.view',
    EXPORT: 'reports.export',
  },

  // Settings
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },

  // Users and roles
  USERS: {
    VIEW: 'users.view',
    INVITE: 'users.invite',
    MANAGE: 'users.manage',
  },

  ROLES: {
    VIEW: 'roles.view',
    MANAGE: 'roles.manage',
  },
} as const;

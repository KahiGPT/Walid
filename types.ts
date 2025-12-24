
export enum Module {
  POS = 'POS',
  KDS = 'KDS',
  INVENTORY = 'INVENTORY',
  RECIPES = 'RECIPES',
  MENU_ENGINEERING = 'MENU_ENGINEERING',
  DASHBOARD = 'DASHBOARD',
  PURCHASING = 'PURCHASING',
  HR = 'HR',
  DISPATCHER = 'DISPATCHER',
  MARKETING = 'MARKETING',
  ACCOUNTING = 'ACCOUNTING',
  SETTINGS = 'SETTINGS',
  CALL_CENTER = 'CALL_CENTER',
  MESSAGES = 'MESSAGES'
}

/**
 * Branch representing a physical or virtual location.
 */
export interface Branch {
  id: string;
  name: string;
  type: 'STORE' | 'KITCHEN' | 'WAREHOUSE';
  currency: string;
  taxRate: number;
}

/**
 * Menu category for organizing dishes.
 */
export interface Category {
  id: string;
  name: string;
}

/**
 * Individual modifier option (e.g., "Extra Cheese").
 */
export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

/**
 * Group of modifiers (e.g., "Toppings").
 */
export interface ModifierGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
}

/**
 * Menu item representing a dish or beverage.
 */
export interface MenuItem {
  id: string;
  name: string;
  // Added nameAr property to support Arabic menu item names
  nameAr?: string;
  price: number;
  categoryId: string;
  cost: number;
  modifierGroupIds?: string[];
  image?: string;
}

/**
 * Item within a customer's cart or active order.
 */
export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  modifiers: ModifierOption[];
  notes?: string;
  fired?: boolean; // Track if item was sent to KDS
}

export enum OrderStatus {
  PENDING = 'PENDING',
  KITCHEN = 'KITCHEN',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  COMPLETED = 'COMPLETED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

export type DeliveryPlatform = 'OWN_FLEET' | 'TALABAT' | 'DELIVEROO' | 'CAREEM' | 'JAHEZ' | 'KEETA';

/**
 * Full order object.
 */
export interface Order {
  id: string;
  type: OrderType;
  table?: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  timestamp: Date;
  staffName: string;
  deliveryInfo?: {
    customerName: string;
    phone: string;
    address: string;
    platform: DeliveryPlatform;
    driverId?: string;
    driverName?: string;
    estimatedTime?: number;
    orderIdRef?: string;
  };
  payments?: Payment[];
}

/**
 * Payment transaction record.
 */
export interface Payment {
  method: 'CASH' | 'CARD' | 'LOYALTY';
  amount: number;
}

/**
 * Raw material or ingredient in stock.
 */
export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minLevel: number;
  costPerUnit: number;
  category: string;
  supplier: string;
  supplierId: string;
  image?: string;
}

/**
 * Component of a recipe.
 */
export interface RecipeIngredient {
  inventoryItemId: string;
  amount: number;
  yieldLoss: number;
}

/**
 * Formulation for a menu item.
 */
export interface Recipe {
  id: string;
  menuItemId: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  foodCostPercentage: number;
}

export type AICategory = 'COST_CONTROL' | 'MENU_PERFORMANCE' | 'STAFF' | 'INVENTORY';

/**
 * AI-generated business recommendation.
 */
export interface AIRecommendation {
  id: string;
  category: AICategory;
  title: string;
  problem: string;
  evidence: string;
  action: string;
  impact: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  BILL_PRINTED = 'BILL_PRINTED',
  RESERVED = 'RESERVED'
}

/**
 * Dining table definition.
 */
export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  seats: number;
  currentOrderId?: string;
  zone: string;
}

/**
 * Vendor for inventory items.
 */
export interface Supplier {
  id: string;
  name: string;
  rating: number;
  contactPhone: string;
  email: string;
  category: string;
  paymentTerms: string;
  leadTimeDays: number;
}

export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'RECEIVED' | 'CANCELLED';

/**
 * Item within a purchase order.
 */
export interface POItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

/**
 * Document for purchasing inventory from a supplier.
 */
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  items: POItem[];
  totalAmount: number;
  createdAt: Date;
  deliveryDate?: Date;
  requestedBy: string;
}

/**
 * Restaurant employee record.
 */
export interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  phone: string;
  hourlyRate: number;
  joinDate: Date;
  performanceScore: number;
}

/**
 * Scheduled work shift.
 */
export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  startTime: string;
  endTime: string;
  role: string;
}

/**
 * Clock-in/out record.
 */
export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}

/**
 * Delivery personnel.
 */
export interface Driver {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  batteryLevel: number;
  vehicleType: 'BIKE' | 'CAR';
  currentOrderId?: string;
}

/**
 * Customer profile for loyalty and CRM.
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpend: number;
  visitCount: number;
  lastVisit: Date;
  loyaltyPoints: number;
  tags: string[];
}

/**
 * Marketing outreach campaign.
 */
export interface Campaign {
  id: string;
  name: string;
  type: 'SMS' | 'EMAIL' | 'PUSH';
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  sentCount: number;
  engagementRate: number;
  revenueGenerated: number;
  startDate: Date;
}

export type ExpenseCategory = 'MAINTENANCE' | 'RENT' | 'SOFTWARE' | 'MARKETING' | 'UTILITIES' | 'OTHER';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';

/**
 * Operational expense record.
 */
export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  description: string;
  payee: string;
  paymentMethod: PaymentMethod;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

/**
 * End-of-day financial reconciliation report.
 */
export interface DailyClose {
  id: string;
  date: Date;
  grossSales: number;
  discounts: number;
  netSales: number;
  cashExpected: number;
  cashActual: number;
  cardTotal: number;
  deliveryTotal: number;
  variance: number;
  status: 'OPEN' | 'CLOSED';
  closedBy?: string;
}

/**
 * Global restaurant configuration.
 */
export interface GeneralSettings {
  restaurantName: string;
  branchName: string;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  printLanguage: 'EN' | 'AR' | 'BOTH';
}

export type Permission = 'POS_ACCESS' | 'POS_VOID' | 'POS_DISCOUNT' | 'VIEW_DASHBOARD' | 'MANAGE_INVENTORY' | 'MANAGE_STAFF' | 'VIEW_REPORTS' | 'SYSTEM_SETTINGS';

/**
 * System role grouping permissions.
 */
export interface Role {
  id: string;
  name: string;
  isSystem?: boolean;
  permissions: Permission[];
}

/**
 * Application user account.
 */
export interface SystemUser {
  id: string;
  username: string;
  email?: string;
  password?: string; // Mock password for demo auth
  pin?: string;      // Mock pin for demo auth
  roleId: string;
  roleName: string;
  staffId?: string;
  status: 'ACTIVE' | 'LOCKED';
  lastLogin?: Date;
}

/**
 * Security and action audit record.
 */
export interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

/**
 * Networked hardware printer.
 */
export interface Printer {
  id: string;
  name: string;
  type: 'RECEIPT' | 'KITCHEN' | 'LABEL';
  ipAddress: string;
  status: 'ONLINE' | 'OFFLINE' | 'PAPER_OUT';
  location: string;
}

/**
 * Calculated row for P&L reporting.
 */
export interface PnLRow {
  label: string;
  value: number;
  percentage: number;
  type: 'REVENUE' | 'COST' | 'PROFIT' | 'EXPENSE';
  level: number;
}

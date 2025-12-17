
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
  CALL_CENTER = 'CALL_CENTER'
}

export interface Branch {
  id: string;
  name: string;
  type: 'STORE' | 'KITCHEN' | 'WAREHOUSE';
  currency: string;
  taxRate: number;
}

export enum OrderType {
  DINE_IN = 'Dine In',
  TAKEAWAY = 'Takeaway',
  DELIVERY = 'Delivery'
}

export enum OrderStatus {
  PENDING = 'Pending',
  KITCHEN = 'Kitchen',
  READY = 'Ready', // Ready for Pickup
  OUT_FOR_DELIVERY = 'Out for Delivery',
  COMPLETED = 'Completed', // Delivered/Closed
  VOIDED = 'Voided'
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  BILL_PRINTED = 'BILL_PRINTED'
}

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  seats: number;
  currentOrderId?: string;
  zone: 'Indoor' | 'Terrace' | 'VIP';
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  categoryId: string;
  cost: number; // Theoretical cost
  image?: string;
  modifierGroupIds?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
}

export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  modifiers: ModifierOption[];
  notes?: string;
}

export type DeliveryPlatform = 'OWN_FLEET' | 'TALABAT' | 'DELIVEROO' | 'CAREEM';

export interface DeliveryInfo {
  customerName: string;
  phone: string;
  address: string;
  platform: DeliveryPlatform;
  driverId?: string;
  driverName?: string;
  estimatedTime?: number; // minutes
  orderIdRef?: string; // External Platform ID
}

export interface Payment {
  method: 'CASH' | 'CARD' | 'LOYALTY';
  amount: number;
  reference?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  table?: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  payments?: Payment[]; // Track split payments
  timestamp: Date;
  staffName: string;
  deliveryInfo?: DeliveryInfo;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minLevel: number;
  costPerUnit: number;
  category: string;
  supplier: string;
  supplierId?: string;
  image?: string;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  ingredients: {
    inventoryItemId: string;
    amount: number;
    yieldLoss: number; // % lost during prep
  }[];
  totalCost: number;
  foodCostPercentage: number;
}

export interface KPI {
  label: string;
  value: string;
  trend: number; // Positive or negative percentage
  isCurrency?: boolean;
}

// AI Engine Types
export type AICategory = 'COST_CONTROL' | 'MENU_PERFORMANCE' | 'SALES' | 'INVENTORY' | 'STAFF' | 'DELIVERY';
export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIRecommendation {
  id: string;
  category: AICategory;
  title: string;
  problem: string;
  evidence: string; // The data backing the claim
  action: string;
  impact: string; // Expected KPI improvement
  risk: AIRiskLevel;
}

// Purchasing Types
export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export interface Supplier {
  id: string;
  name: string;
  rating: number; // 1-5
  contactPhone: string;
  email: string;
  category: string;
  paymentTerms: string;
  leadTimeDays: number;
}

export interface POItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

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

// HR Types
export type StaffRole = 'MANAGER' | 'CHEF' | 'WAITER' | 'DRIVER' | 'CASHIER';
export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface StaffMember {
  id: string;
  fullName: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  hourlyRate: number;
  joinDate: Date;
  performanceScore: number; // 0-100
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  role: StaffRole;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}

// Dispatcher Types
export interface Driver {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentOrderId?: string;
  batteryLevel: number;
  vehicleType: 'BIKE' | 'CAR' | 'SCOOTER';
}

// Marketing Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpend: number;
  visitCount: number;
  lastVisit: Date;
  loyaltyPoints: number;
  tags: string[]; // e.g., 'VIP', 'Big Spender', 'Churn Risk'
}

export type CampaignType = 'SMS' | 'EMAIL' | 'PUSH';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  sentCount: number;
  engagementRate: number; // Open rate or Click rate (%)
  revenueGenerated: number;
  startDate: Date;
}

// Accounting Types
export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'MAINTENANCE' | 'MARKETING' | 'SOFTWARE' | 'OTHER';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD';

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  description: string;
  payee: string;
  paymentMethod: PaymentMethod;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DailyClose {
  id: string;
  date: Date;
  grossSales: number;
  discounts: number;
  netSales: number;
  cashExpected: number;
  cashActual: number; // User input
  cardTotal: number;
  deliveryTotal: number;
  variance: number; // Actual - Expected
  status: 'OPEN' | 'CLOSED';
  closedBy?: string;
  notes?: string;
}

export interface PnLRow {
  label: string;
  value: number;
  percentage: number;
  type: 'REVENUE' | 'COST' | 'EXPENSE' | 'PROFIT';
  level: 1 | 2 | 3; // Indentation level
}

// Settings & Admin Types
export type Permission = 
  | 'POS_ACCESS' | 'POS_VOID' | 'POS_DISCOUNT' 
  | 'VIEW_DASHBOARD' | 'MANAGE_INVENTORY' | 'MANAGE_STAFF' 
  | 'VIEW_REPORTS' | 'SYSTEM_SETTINGS';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  isSystem?: boolean; // Cannot delete system roles
}

export interface SystemUser {
  id: string;
  username: string;
  roleId: string;
  roleName: string;
  staffId?: string; // Link to HR
  lastLogin?: Date;
  status: 'ACTIVE' | 'LOCKED';
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface Printer {
  id: string;
  name: string;
  type: 'RECEIPT' | 'KITCHEN' | 'LABEL';
  ipAddress: string;
  status: 'ONLINE' | 'OFFLINE' | 'PAPER_OUT';
  location: string;
}

export interface GeneralSettings {
  restaurantName: string;
  branchName: string;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  printLanguage: 'EN' | 'AR' | 'BOTH';
}

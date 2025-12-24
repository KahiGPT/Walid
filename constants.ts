
import { Branch, Category, InventoryItem, MenuItem, Order, OrderStatus, OrderType, Recipe, AIRecommendation, Table, TableStatus, ModifierGroup, Supplier, PurchaseOrder, StaffMember, Shift, AttendanceRecord, Driver, Customer, Campaign, Expense, DailyClose, GeneralSettings, SystemUser, Role, AuditLog, Printer } from "./types";

export const BRANCHES: Branch[] = [
  { id: 'b1', name: 'Kuwait City - Downtown', type: 'STORE', currency: 'KWD', taxRate: 0 },
  { id: 'b2', name: 'Salmiya - Seaside', type: 'STORE', currency: 'KWD', taxRate: 0 },
  { id: 'b3', name: 'Dubai Mall', type: 'STORE', currency: 'AED', taxRate: 5 },
  { id: 'b4', name: 'Riyadh Park', type: 'STORE', currency: 'SAR', taxRate: 15 },
  { id: 'b5', name: 'Central Kitchen', type: 'KITCHEN', currency: 'KWD', taxRate: 0 },
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Main Courses' },
  { id: '2', name: 'Appetizers' },
  { id: '3', name: 'Beverages' },
  { id: '4', name: 'Desserts' },
];

export const MENU_ITEMS: MenuItem[] = [
  { 
    id: '101', 
    name: 'Chicken Machboos', 
    nameAr: 'مجبوس دجاج',
    price: 4.500, 
    categoryId: '1', 
    cost: 1.200, 
    modifierGroupIds: ['mg1', 'mg2'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '102', 
    name: 'Lamb Biryani', 
    nameAr: 'برياني لحم',
    price: 5.250, 
    categoryId: '1', 
    cost: 1.800, 
    modifierGroupIds: ['mg1', 'mg2'],
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '103', 
    name: 'Hummus', 
    nameAr: 'حمص',
    price: 1.250, 
    categoryId: '2', 
    cost: 0.300, 
    modifierGroupIds: ['mg1'],
    image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '104', 
    name: 'Fattoush', 
    nameAr: 'فتوش',
    price: 1.750, 
    categoryId: '2', 
    cost: 0.450,
    image: 'https://images.unsplash.com/photo-1529312266912-b33cf6227e2f?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '105', 
    name: 'Lemon Mint', 
    nameAr: 'ليمون نعناع',
    price: 1.500, 
    categoryId: '3', 
    cost: 0.200,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '106', 
    name: 'Soft Drink', 
    nameAr: 'مشروب غازي',
    price: 0.750, 
    categoryId: '3', 
    cost: 0.150,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '107', 
    name: 'Umm Ali', 
    nameAr: 'أم علي',
    price: 2.000, 
    categoryId: '4', 
    cost: 0.600,
    image: 'https://images.unsplash.com/photo-1593741683437-c368584371c0?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: '108', 
    name: 'Grilled Halloumi', 
    nameAr: 'حلوم مشوي',
    price: 2.250, 
    categoryId: '2', 
    cost: 0.800,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=150&q=80'
  },
];

export const TABLES: Table[] = [
  { id: 't1', name: 'T-01', status: TableStatus.AVAILABLE, seats: 4, zone: 'Indoor' },
  { id: 't2', name: 'T-02', status: TableStatus.OCCUPIED, seats: 2, currentOrderId: 'temp-1', zone: 'Indoor' },
  { id: 't3', name: 'T-03', status: TableStatus.AVAILABLE, seats: 4, zone: 'Indoor' },
  { id: 't4', name: 'T-04', status: TableStatus.BILL_PRINTED, seats: 6, currentOrderId: 'temp-2', zone: 'Indoor' },
  { id: 't5', name: 'VIP-1', status: TableStatus.RESERVED, seats: 8, zone: 'VIP' },
  { id: 't6', name: 'OUT-1', status: TableStatus.AVAILABLE, seats: 2, zone: 'Terrace' },
  { id: 't7', name: 'OUT-2', status: TableStatus.AVAILABLE, seats: 2, zone: 'Terrace' },
];

export const MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: 'mg1',
    name: 'Add-ons',
    minSelection: 0,
    maxSelection: 5,
    options: [
      { id: 'm1', name: 'Extra Cheese', price: 0.250 },
      { id: 'm2', name: 'Extra Sauce', price: 0.100 },
      { id: 'm3', name: 'Garlic Bread', price: 0.500 },
    ]
  },
  {
    id: 'mg2',
    name: 'Removal',
    minSelection: 0,
    maxSelection: 5,
    options: [
      { id: 'm4', name: 'No Onions', price: 0.000 },
      { id: 'm5', name: 'No Spicy', price: 0.000 },
    ]
  }
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Kuwait Flour Mills', rating: 4.8, contactPhone: '+965 2222 1111', email: 'orders@kfm.com', category: 'Dry Goods', paymentTerms: 'Net 30', leadTimeDays: 2 },
  { id: 'sup-2', name: 'Al-Wazzan Protein', rating: 4.5, contactPhone: '+965 2222 3333', email: 'sales@alwazzan.com', category: 'Proteins', paymentTerms: 'Net 15', leadTimeDays: 1 },
  { id: 'sup-3', name: 'Kuwait Agriculture Co.', rating: 3.9, contactPhone: '+965 5555 6666', email: 'veg@kac.com', category: 'Vegetables', paymentTerms: 'COD', leadTimeDays: 0 },
  { id: 'sup-4', name: 'Local Farm Fresh', rating: 5.0, contactPhone: '+965 9999 8888', email: 'contact@localfarm.com', category: 'Vegetables', paymentTerms: 'Net 15', leadTimeDays: 1 },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
  { 
    id: 'i1', 
    name: 'Basmati Rice', 
    unit: 'kg', 
    currentStock: 150, 
    minLevel: 50, 
    costPerUnit: 0.800, 
    category: 'Dry Goods', 
    supplier: 'Kuwait Flour Mills', 
    supplierId: 'sup-1',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: 'i2', 
    name: 'Whole Chicken', 
    unit: 'pcs', 
    currentStock: 45, 
    minLevel: 20, 
    costPerUnit: 1.100, 
    category: 'Protein', 
    supplier: 'Al-Wazzan Protein', 
    supplierId: 'sup-2',
    image: 'https://images.unsplash.com/photo-1587593810167-a649254a47ae?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: 'i3', 
    name: 'Lamb Shoulder', 
    unit: 'kg', 
    currentStock: 30, 
    minLevel: 10, 
    costPerUnit: 3.500, 
    category: 'Protein', 
    supplier: 'Al-Wazzan Protein', 
    supplierId: 'sup-2',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: 'i4', 
    name: 'Cooking Oil', 
    unit: 'L', 
    currentStock: 80, 
    minLevel: 20, 
    costPerUnit: 0.600, 
    category: 'Dry Goods', 
    supplier: 'Kuwait Flour Mills', 
    supplierId: 'sup-1',
    image: 'https://images.unsplash.com/photo-1474979266404-7cadd259c308?auto=format&fit=crop&w=150&q=80'
  },
  { 
    id: 'i5', 
    name: 'Tomatoes', 
    unit: 'kg', 
    currentStock: 12, 
    minLevel: 15, 
    costPerUnit: 0.400, 
    category: 'Vegetables', 
    supplier: 'Kuwait Agriculture Co.', 
    supplierId: 'sup-3',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80'
  },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2024-001',
    supplierId: 'sup-1',
    supplierName: 'Kuwait Flour Mills',
    status: 'RECEIVED',
    items: [
      { inventoryItemId: 'i1', name: 'Basmati Rice', quantity: 100, unit: 'kg', unitCost: 0.800, totalCost: 80 }
    ],
    totalAmount: 80.000,
    createdAt: new Date('2024-02-10'),
    requestedBy: 'Admin'
  },
  {
    id: 'PO-2024-002',
    supplierId: 'sup-3',
    supplierName: 'Kuwait Agriculture Co.',
    status: 'SENT',
    items: [
      { inventoryItemId: 'i5', name: 'Tomatoes', quantity: 20, unit: 'kg', unitCost: 0.400, totalCost: 8 }
    ],
    totalAmount: 8.000,
    createdAt: new Date(),
    deliveryDate: new Date(Date.now() + 86400000), // Tomorrow
    requestedBy: 'Chef Hassan'
  }
];

export const RECIPES: Recipe[] = [
  {
    id: 'r1',
    menuItemId: '101', // Machboos
    ingredients: [
      { inventoryItemId: 'i1', amount: 0.25, yieldLoss: 0 },
      { inventoryItemId: 'i2', amount: 0.5, yieldLoss: 10 },
      { inventoryItemId: 'i4', amount: 0.05, yieldLoss: 0 },
    ],
    totalCost: 1.200,
    foodCostPercentage: 26.6
  }
];

export const RECENT_ORDERS: Order[] = [
  {
    id: 'ORD-9921',
    type: OrderType.DINE_IN,
    table: 'T-04',
    status: OrderStatus.COMPLETED,
    items: [
      { ...MENU_ITEMS[0], cartId: 'ro-1', quantity: 2, modifiers: [] },
      { ...MENU_ITEMS[4], cartId: 'ro-2', quantity: 1, modifiers: [] },
      { ...MENU_ITEMS[2], cartId: 'ro-3', quantity: 1, modifiers: [] }
    ],
    total: 14.500,
    timestamp: new Date(),
    staffName: 'Ahmed A.'
  },
  {
    id: 'ORD-9922',
    type: OrderType.DELIVERY,
    status: OrderStatus.KITCHEN,
    items: [
      { ...MENU_ITEMS[1], cartId: 'ro-4', quantity: 1, modifiers: [] },
      { ...MENU_ITEMS[6], cartId: 'ro-5', quantity: 1, modifiers: [] },
      { ...MENU_ITEMS[5], cartId: 'ro-6', quantity: 2, modifiers: [] }
    ],
    total: 8.250,
    timestamp: new Date(),
    staffName: 'Sarah M.',
    deliveryInfo: {
      customerName: 'Sarah J.',
      phone: '5555-2222',
      address: 'Hawally',
      platform: 'OWN_FLEET'
    }
  },
  {
    id: 'ORD-9923',
    type: OrderType.TAKEAWAY,
    status: OrderStatus.PENDING,
    items: [
      { ...MENU_ITEMS[0], cartId: 'ro-7', quantity: 1, modifiers: [] },
      { ...MENU_ITEMS[5], cartId: 'ro-8', quantity: 1, modifiers: [] }
    ],
    total: 4.750,
    timestamp: new Date(),
    staffName: 'Ahmed A.'
  }
];

export const KDS_TICKETS: Order[] = [
  {
    id: 'ORD-8324',
    type: OrderType.DELIVERY,
    status: OrderStatus.PENDING,
    items: [
      { ...MENU_ITEMS.find(i => i.id === '101')!, cartId: 'k1-1', quantity: 1, modifiers: [] },
      { ...MENU_ITEMS.find(i => i.id === '102')!, cartId: 'k1-2', quantity: 1, modifiers: [] }
    ],
    total: 9.750,
    timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1 min ago
    staffName: 'Call Center'
  },
  {
    id: 'K-101',
    type: OrderType.DINE_IN,
    table: 'T-04',
    status: OrderStatus.KITCHEN,
    items: [
      { ...MENU_ITEMS.find(i => i.id === '101')!, cartId: 'k2-1', quantity: 2, modifiers: [], notes: 'Extra spicy' },
      { ...MENU_ITEMS.find(i => i.id === '103')!, cartId: 'k2-2', quantity: 1, modifiers: [{ id: 'm3', name: 'Garlic Bread', price: 0.500 }] }
    ],
    total: 10.750,
    timestamp: new Date(Date.now() - 1000 * 60 * 26), // 26 mins ago
    staffName: 'Ahmed'
  },
  {
    id: 'K-102',
    type: OrderType.DELIVERY,
    status: OrderStatus.KITCHEN,
    items: [
      { ...MENU_ITEMS.find(i => i.id === '102')!, cartId: 'k3-1', quantity: 1, modifiers: [] },
      { ...MENU_ITEMS.find(i => i.id === '104')!, cartId: 'k3-2', quantity: 2, modifiers: [] }
    ],
    total: 8.750,
    timestamp: new Date(Date.now() - 1000 * 60 * 13), // 13 mins ago
    staffName: 'Delivery'
  }
];

export const ALERTS = [
  { id: 1, type: 'critical', msg: 'Stock Alert: Tomatoes below min level (12kg)', module: 'INVENTORY' },
  { id: 2, type: 'warning', msg: 'High Food Cost: Lamb Biryani at 34% (Target 28%)', module: 'COST_CONTROL' },
  { id: 3, type: 'info', msg: 'Staff: Ali K. late for shift (20 mins)', module: 'HR' },
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { 
    id: 'ai-1',
    category: 'COST_CONTROL',
    title: 'Margin Erosion Alert', 
    problem: 'Lamb Biryani gross margin dropped by 6% this week.',
    evidence: 'Supplier "Mawashi" increased lamb shoulder price by 0.250 KWD/kg.',
    action: 'Increase dish price by 0.350 KWD or Reduce portion meat by 20g.',
    impact: '+45 KWD/day Profit', 
    risk: 'LOW'
  },
  { 
    id: 'ai-2',
    category: 'MENU_PERFORMANCE',
    title: 'Low Popularity Item', 
    problem: 'Grilled Halloumi sales are in the bottom 5% for 3 weeks.',
    evidence: 'Only 4 orders last week. High waste recorded.',
    action: 'Remove from menu or run "Add-on for 1 KWD" promo.',
    impact: '-15 KWD Waste/week', 
    risk: 'MEDIUM'
  },
  { 
    id: 'ai-3',
    category: 'STAFF',
    title: 'Upselling Opportunity', 
    problem: 'Waiter "Ahmed A." has 12% lower beverage attach rate than average.',
    evidence: 'Checks with mains only: 65% (Avg: 40%).',
    action: 'Assign "Beverage Upselling" training module.',
    impact: '+250 KWD/month Revenue', 
    risk: 'LOW'
  },
  { 
    id: 'ai-4',
    category: 'INVENTORY',
    title: 'Overstock Warning', 
    problem: 'Basmati Rice stock covers 45 days (Target: 15 days).',
    evidence: 'Current holding: 150kg. Avg Usage: 3.2kg/day.',
    action: 'Pause procurement orders for 2 weeks.',
    impact: 'Cashflow Optimization', 
    risk: 'LOW'
  },
];

export const STAFF_ROSTER: StaffMember[] = [
  { id: 'S-001', fullName: 'Ahmed Al-Salem', role: 'MANAGER', status: 'ACTIVE', phone: '9000-0001', hourlyRate: 3.500, joinDate: new Date('2022-01-15'), performanceScore: 92 },
  { id: 'S-002', fullName: 'Sarah Mahmoud', role: 'WAITER', status: 'ACTIVE', phone: '9000-0002', hourlyRate: 1.250, joinDate: new Date('2023-03-10'), performanceScore: 88 },
  { id: 'S-003', fullName: 'Hassan Ali', role: 'CHEF', status: 'ACTIVE', phone: '9000-0003', hourlyRate: 2.750, joinDate: new Date('2021-11-01'), performanceScore: 95 },
  { id: 'S-004', fullName: 'John Doe', role: 'WAITER', status: 'ON_LEAVE', phone: '9000-0004', hourlyRate: 1.250, joinDate: new Date('2023-06-20'), performanceScore: 76 },
  { id: 'S-005', fullName: 'Kumar P.', role: 'DRIVER', status: 'ACTIVE', phone: '9000-0005', hourlyRate: 1.100, joinDate: new Date('2023-01-05'), performanceScore: 90 },
];

export const SHIFTS: Shift[] = [
  { id: 'SH-1', staffId: 'S-001', staffName: 'Ahmed Al-Salem', date: new Date(), startTime: '09:00', endTime: '18:00', role: 'MANAGER' },
  { id: 'SH-2', staffId: 'S-002', staffName: 'Sarah Mahmoud', date: new Date(), startTime: '10:00', endTime: '19:00', role: 'WAITER' },
  { id: 'SH-3', staffId: 'S-003', staffName: 'Hassan Ali', date: new Date(), startTime: '08:00', endTime: '17:00', role: 'CHEF' },
];

export const ATTENDANCE_LOG: AttendanceRecord[] = [
  { id: 'AT-1', staffId: 'S-003', staffName: 'Hassan Ali', date: new Date(), checkIn: '07:55', status: 'PRESENT' },
  { id: 'AT-2', staffId: 'S-001', staffName: 'Ahmed Al-Salem', date: new Date(), checkIn: '09:15', status: 'LATE' },
  { id: 'AT-3', staffId: 'S-002', staffName: 'Sarah Mahmoud', date: new Date(), checkIn: '09:58', status: 'PRESENT' },
];

export const DRIVERS: Driver[] = [
  { id: 'D-1', name: 'Kumar P.', status: 'AVAILABLE', batteryLevel: 85, vehicleType: 'BIKE' },
  { id: 'D-2', name: 'Rajesh K.', status: 'BUSY', currentOrderId: 'ORD-9930', batteryLevel: 42, vehicleType: 'BIKE' },
  { id: 'D-3', name: 'Mohammed S.', status: 'OFFLINE', batteryLevel: 100, vehicleType: 'CAR' },
];

export const DISPATCH_ORDERS: Order[] = [
  // Ready for Pickup (Own Fleet)
  {
    id: 'ORD-9931', type: OrderType.DELIVERY, status: OrderStatus.READY, items: [{ ...MENU_ITEMS[0], cartId: 'dp-1', quantity: 1, modifiers: [] }], total: 12.500, timestamp: new Date(Date.now() - 1000 * 60 * 10), staffName: 'System',
    deliveryInfo: { customerName: 'Fahad Al-Otaibi', phone: '9999-1111', address: 'Block 3, Street 4, House 12, Jabriya', platform: 'OWN_FLEET', estimatedTime: 30 }
  },
  // Ready for Pickup (Aggregator)
  {
    id: 'ORD-9932', type: OrderType.DELIVERY, status: OrderStatus.READY, items: [{ ...MENU_ITEMS[1], cartId: 'dp-2', quantity: 1, modifiers: [] }, { ...MENU_ITEMS[2], cartId: 'dp-3', quantity: 1, modifiers: [] }], total: 8.200, timestamp: new Date(Date.now() - 1000 * 60 * 5), staffName: 'Talabat',
    deliveryInfo: { customerName: 'Talabat Customer #4291', phone: 'N/A', address: 'Salmiya', platform: 'TALABAT', orderIdRef: '#T-9281' }
  },
  // Out for Delivery
  {
    id: 'ORD-9930', type: OrderType.DELIVERY, status: OrderStatus.OUT_FOR_DELIVERY, items: [{ ...MENU_ITEMS[0], cartId: 'dp-4', quantity: 1, modifiers: [] }], total: 5.000, timestamp: new Date(Date.now() - 1000 * 60 * 25), staffName: 'System',
    deliveryInfo: { customerName: 'Sarah J.', phone: '5555-2222', address: 'Hawally', platform: 'OWN_FLEET', driverId: 'D-2', driverName: 'Rajesh K.' }
  },
  // Completed
  {
    id: 'ORD-9925', type: OrderType.DELIVERY, status: OrderStatus.COMPLETED, items: [], total: 11.500, timestamp: new Date(Date.now() - 1000 * 60 * 60), staffName: 'System',
    deliveryInfo: { customerName: 'Khalid M.', phone: '6666-7777', address: 'Mishref', platform: 'DELIVEROO' }
  }
];

export const CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'Fahad Al-Otaibi', phone: '9999-1111', email: 'fahad@example.com', totalSpend: 450.500, visitCount: 24, lastVisit: new Date('2024-02-15'), loyaltyPoints: 4500, tags: ['VIP', 'Big Spender'] },
  { id: 'C2', name: 'Sarah J.', phone: '5555-2222', email: 'sarah@example.com', totalSpend: 120.000, visitCount: 8, lastVisit: new Date('2024-02-10'), loyaltyPoints: 1200, tags: ['Regular'] },
  { id: 'C3', name: 'Mohammed Ali', phone: '6666-3333', email: 'moh@example.com', totalSpend: 25.000, visitCount: 2, lastVisit: new Date('2023-12-05'), loyaltyPoints: 250, tags: ['At Risk', 'New'] },
  { id: 'C4', name: 'Dana K.', phone: '9000-5555', email: 'dana@example.com', totalSpend: 850.000, visitCount: 45, lastVisit: new Date('2024-02-18'), loyaltyPoints: 8500, tags: ['VIP', 'Loyal'] },
];

export const CAMPAIGNS: Campaign[] = [
  { id: 'CMP-1', name: 'Weekend Biryani Promo', type: 'SMS', status: 'COMPLETED', sentCount: 1200, engagementRate: 18.5, revenueGenerated: 450.000, startDate: new Date('2024-02-01') },
  { id: 'CMP-2', name: 'Miss You (Churn)', type: 'EMAIL', status: 'ACTIVE', sentCount: 350, engagementRate: 45.2, revenueGenerated: 120.000, startDate: new Date('2024-02-14') },
  { id: 'CMP-3', name: 'New Menu Launch', type: 'PUSH', status: 'DRAFT', sentCount: 0, engagementRate: 0, revenueGenerated: 0, startDate: new Date('2024-03-01') },
];

export const EXPENSES: Expense[] = [
  { id: 'EX-001', date: new Date('2024-02-18'), amount: 12.500, category: 'MAINTENANCE', description: 'AC Repair - Dining Area', payee: 'Cool Tech Co.', paymentMethod: 'CASH', status: 'APPROVED' },
  { id: 'EX-002', date: new Date('2024-02-19'), amount: 5.000, category: 'OTHER', description: 'Staff Taxi Reimbursement', payee: 'Sarah M.', paymentMethod: 'CASH', status: 'APPROVED' },
  { id: 'EX-003', date: new Date('2024-02-20'), amount: 150.000, category: 'RENT', description: 'Monthly POS License', payee: 'Foodika Systems', paymentMethod: 'BANK_TRANSFER', status: 'PENDING' },
];

export const DAILY_CLOSES: DailyClose[] = [
  { 
    id: 'Z-1024', 
    date: new Date(Date.now() - 86400000), // Yesterday
    grossSales: 450.000, 
    discounts: 15.000, 
    netSales: 435.000, 
    cashExpected: 120.000, 
    cashActual: 120.000, 
    cardTotal: 250.000, 
    deliveryTotal: 65.000, 
    variance: 0, 
    status: 'CLOSED',
    closedBy: 'Ahmed Al-Salem'
  },
  { 
    id: 'Z-1025', 
    date: new Date(), // Today
    grossSales: 210.000, 
    discounts: 5.000, 
    netSales: 205.000, 
    cashExpected: 55.000, 
    cashActual: 0, 
    cardTotal: 120.000, 
    deliveryTotal: 30.000, 
    variance: 0, 
    status: 'OPEN',
  },
];

// Settings Data
export const GENERAL_SETTINGS: GeneralSettings = {
  restaurantName: 'Foodika Grill & Lounge',
  branchName: 'Kuwait City - Downtown',
  currency: 'KWD',
  taxRate: 0,
  serviceCharge: 10,
  printLanguage: 'EN'
};

export const ROLES_CONFIG: Role[] = [
  { id: 'ADMIN', name: 'Administrator', isSystem: true, permissions: ['POS_ACCESS', 'POS_VOID', 'POS_DISCOUNT', 'VIEW_DASHBOARD', 'MANAGE_INVENTORY', 'MANAGE_STAFF', 'VIEW_REPORTS', 'SYSTEM_SETTINGS'] },
  { id: 'MANAGER', name: 'Store Manager', isSystem: true, permissions: ['POS_ACCESS', 'POS_VOID', 'POS_DISCOUNT', 'VIEW_DASHBOARD', 'MANAGE_INVENTORY', 'MANAGE_STAFF', 'VIEW_REPORTS'] },
  { id: 'CASHIER', name: 'Cashier', permissions: ['POS_ACCESS', 'POS_DISCOUNT'] },
  { id: 'WAITER', name: 'Waiter', permissions: ['POS_ACCESS'] },
  { id: 'KITCHEN', name: 'Kitchen Staff', permissions: ['VIEW_DASHBOARD'] },
];

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'u1', username: 'admin', email: 'admin@foodika.app', roleId: 'ADMIN', roleName: 'Administrator', status: 'ACTIVE', lastLogin: new Date() },
  { id: 'u2', username: 'ahmed.m', email: 'ahmed.manager@foodika.app', roleId: 'MANAGER', roleName: 'Store Manager', staffId: 'S-001', status: 'ACTIVE', lastLogin: new Date(Date.now() - 86400000) },
  { id: 'u3', username: 'sarah.cash', email: 'sarah.c@foodika.app', roleId: 'CASHIER', roleName: 'Cashier', staffId: 'S-002', status: 'ACTIVE', lastLogin: new Date(Date.now() - 3600000) },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: new Date(), user: 'admin', action: 'VOID_ORDER', module: 'POS', details: 'Voided Order #9921 (Reason: Customer Changed Mind)', severity: 'WARNING' },
  { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 30), user: 'ahmed.m', action: 'PRICE_CHANGE', module: 'INVENTORY', details: 'Updated cost of Lamb Shoulder to 3.500', severity: 'INFO' },
  { id: 'log-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), user: 'system', action: 'AUTO_BACKUP', module: 'SYSTEM', details: 'Daily database backup completed', severity: 'INFO' },
  { id: 'log-4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), user: 'admin', action: 'USER_LOGIN_FAILED', module: 'SECURITY', details: 'Failed login attempt for user "unknown"', severity: 'CRITICAL' },
];

export const PRINTERS: Printer[] = [
  { id: 'p1', name: 'Main Cashier', type: 'RECEIPT', ipAddress: '192.168.1.201', status: 'ONLINE', location: 'Counter' },
  { id: 'p2', name: 'Kitchen Hot', type: 'KITCHEN', ipAddress: '192.168.1.202', status: 'ONLINE', location: 'Hot Kitchen' },
  { id: 'p3', name: 'Kitchen Cold', type: 'KITCHEN', ipAddress: '192.168.1.203', status: 'PAPER_OUT', location: 'Salad Station' },
  { id: 'p4', name: 'Bar', type: 'KITCHEN', ipAddress: '192.168.1.204', status: 'OFFLINE', location: 'Beverage Area' },
];

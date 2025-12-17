
import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS, TABLES, MODIFIER_GROUPS, RECENT_ORDERS } from '../constants';
import { CartItem, MenuItem, OrderType, Table, TableStatus, ModifierOption, ModifierGroup, Order, Branch, OrderStatus, Payment } from '../types';
import { Search, Grid, Trash2, Plus, Minus, CreditCard, ChefHat, User, MoreVertical, WifiOff, ArrowLeft, LayoutGrid, Delete, Check, X, Printer, Split, MoveRight, MoveLeft, Users, History, RefreshCcw, Loader2, Percent, FileText, Unlock, ChevronRight, MapPin, Utensils, ShoppingBag, Truck, Banknote, Star, CreditCard as CardIcon } from 'lucide-react';

type POSView = 'FLOOR_PLAN' | 'ORDER' | 'PAYMENT' | 'SPLIT';

interface POSProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentBranch: Branch;
  onPlaceOrder?: (order: Order) => void;
}

// --- SUB-COMPONENTS ---

const PaymentModal = ({ total, onClose, onComplete, currency }: { total: number, onClose: () => void, onComplete: (payments: Payment[]) => void, currency: string }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inputAmount, setInputAmount] = useState<string>('');

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  const handleNumPad = (val: string) => {
    if (val === 'back') {
      setInputAmount(prev => prev.slice(0, -1));
    } else if (val === 'clear') {
      setInputAmount('');
    } else {
      if (val === '.' && inputAmount.includes('.')) return;
      setInputAmount(prev => prev + val);
    }
  };

  const addPayment = (method: 'CASH' | 'CARD' | 'LOYALTY') => {
    // If input is empty, assume user wants to pay the full remaining amount
    let amount = inputAmount ? parseFloat(inputAmount) : remaining;
    
    if (amount <= 0) return;
    
    // For cash, we allow overpayment (change). For others, cap at remaining.
    if (method !== 'CASH' && amount > remaining) {
      amount = remaining;
    }

    setPayments(prev => [...prev, { method, amount }]);
    setInputAmount('');
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-4xl rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[600px]">
        
        {/* Left Side: Summary */}
        <div className="flex-1 bg-gray-50 dark:bg-neutral-900 p-6 flex flex-col border-r border-gray-200 dark:border-neutral-800">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Payment Summary</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400">Review breakdown below</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
              <span className="text-gray-500 dark:text-neutral-400 font-medium">Total Due</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{total.toFixed(3)} <span className="text-sm text-gray-500">{currency}</span></span>
            </div>
            
            <div className={`flex justify-between items-center p-4 rounded-xl border shadow-sm ${remaining > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400'}`}>
              <span className="font-medium">{remaining > 0 ? 'Remaining' : 'Change'}</span>
              <span className="text-2xl font-bold font-mono">{remaining > 0 ? remaining.toFixed(3) : change.toFixed(3)}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2">Tenders Applied</div>
            {payments.length === 0 && <div className="text-center py-4 text-gray-400 italic text-sm">No payments added yet.</div>}
            {payments.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 animate-in slide-in-from-left-2 duration-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${p.method === 'CASH' ? 'bg-green-100 text-green-600' : p.method === 'CARD' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {p.method === 'CASH' ? <Banknote size={16}/> : p.method === 'CARD' ? <CardIcon size={16}/> : <Star size={16}/>}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{p.method}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{p.amount.toFixed(3)}</span>
                  <button onClick={() => removePayment(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Keypad */}
        <div className="flex-[1.2] bg-white dark:bg-brand-surface p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <div className="flex-1">
                <input 
                  type="text" 
                  readOnly 
                  value={inputAmount} 
                  placeholder={remaining.toFixed(3)}
                  className={`w-full text-right text-4xl font-mono font-bold bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-neutral-700 ${inputAmount ? 'text-gray-900 dark:text-white' : 'text-gray-300'}`}
                />
             </div>
             <button onClick={() => handleNumPad('back')} className="p-3 text-gray-500 hover:text-red-500 transition-colors"><Delete size={28}/></button>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-3 mb-6">
             {/* Keypad */}
             <div className="col-span-3 grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6,7,8,9,'.',0,'C'].map(k => (
                  <button 
                    key={k} 
                    onClick={() => k === 'C' ? handleNumPad('clear') : handleNumPad(k.toString())}
                    className="h-16 rounded-xl bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-2xl font-bold text-gray-900 dark:text-white transition-all active:scale-95 shadow-sm border border-gray-200 dark:border-neutral-700"
                  >
                    {k}
                  </button>
                ))}
             </div>

             {/* Methods */}
             <div className="flex flex-col gap-3">
                <button onClick={() => addPayment('CASH')} className="flex-1 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 font-bold flex flex-col items-center justify-center gap-1 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all active:scale-95">
                   <Banknote size={20} /> <span className="text-xs">Cash</span>
                </button>
                <button onClick={() => addPayment('CARD')} className="flex-1 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 font-bold flex flex-col items-center justify-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all active:scale-95">
                   <CardIcon size={20} /> <span className="text-xs">Card</span>
                </button>
                <button onClick={() => addPayment('LOYALTY')} className="flex-1 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 font-bold flex flex-col items-center justify-center gap-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all active:scale-95">
                   <Star size={20} /> <span className="text-xs">Points</span>
                </button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button onClick={onClose} className="py-4 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
               Cancel
             </button>
             <button 
               onClick={() => onComplete(payments)}
               disabled={remaining > 0.001} // Float tolerance
               className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${remaining <= 0.001 ? 'bg-brand-red text-white hover:bg-brand-redHover shadow-red-900/30' : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed shadow-none'}`}
             >
               <Check size={20} /> Complete Order
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RefundModal = ({ order, onClose, onConfirm }: { order: any, onClose: () => void, onConfirm: (amount: number, reason: string) => void }) => {
  const [reason, setReason] = useState('Customer Complaint');
  const [amount, setAmount] = useState(order.total.toString());

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Process Refund</h3>
        <p className="text-gray-500 dark:text-neutral-400 text-sm mb-6">Order #{order.id} • {order.total.toFixed(3)} KWD</p>
        
        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Refund Reason</label>
             <select 
               value={reason} 
               onChange={(e) => setReason(e.target.value)}
               className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
             >
               <option>Customer Complaint</option>
               <option>Wrong Item</option>
               <option>Accidental Charge</option>
               <option>Order Cancelled</option>
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Refund Amount</label>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono font-bold"
             />
           </div>
        </div>

        <div className="flex gap-3 mt-8">
           <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-neutral-700">Cancel</button>
           <button onClick={() => onConfirm(parseFloat(amount) || 0, reason)} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-900/30">Confirm Refund</button>
        </div>
      </div>
    </div>
  );
};

const HistoryModal = ({ onClose, onNotify }: { onClose: () => void, onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) => {
  const [refundOrder, setRefundOrder] = useState<any>(null);

  const handleReprint = (id: string) => {
    onNotify(`Printing receipt for Order #${id}...`, 'info');
  };

  const handleRefundSuccess = (amount: number, reason: string) => {
    onNotify(`Refunded ${amount.toFixed(3)} KWD for Order #${refundOrder.id}`, 'success');
    setRefundOrder(null);
  };

  return (
    <>
      {refundOrder && (
        <RefundModal 
          order={refundOrder} 
          onClose={() => setRefundOrder(null)} 
          onConfirm={handleRefundSuccess} 
        />
      )}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-brand-surface w-full max-w-4xl rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History size={20} /> Order History
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 font-medium sticky top-0">
                 <tr>
                   <th className="p-4">Order ID</th>
                   <th className="p-4">Time</th>
                   <th className="p-4">Type</th>
                   <th className="p-4">Status</th>
                   <th className="p-4 text-right">Total</th>
                   <th className="p-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                 {RECENT_ORDERS.map(order => (
                   <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-700 dark:text-neutral-300">
                      <td className="p-4 font-mono text-gray-900 dark:text-white">{order.id}</td>
                      <td className="p-4 text-gray-500 dark:text-neutral-500">{order.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-4"><span className="bg-gray-200 dark:bg-neutral-800 px-2 py-1 rounded text-xs font-bold">{order.type}</span></td>
                      <td className="p-4">
                        <span className={`text-xs font-bold ${order.status === 'Completed' ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>{order.status}</span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold">{order.total.toFixed(3)}</td>
                      <td className="p-4 text-right">
                         <button onClick={() => handleReprint(order.id)} className="text-xs bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-white hover:text-black px-3 py-1.5 rounded font-bold mr-2 transition-colors">Reprint</button>
                         <button onClick={() => setRefundOrder(order)} className="text-xs bg-gray-200 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-500 px-3 py-1.5 rounded font-bold transition-colors">Refund</button>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </>
  );
};

const DiscountModal = ({ onClose, onApply }: { onClose: () => void, onApply: (type: 'PERCENT' | 'FIXED', value: number) => void }) => {
  const [value, setValue] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-brand-surface w-full max-w-sm rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Apply Discount</h3>
        
        <div className="flex gap-2 mb-4">
          <button onClick={() => setType('PERCENT')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${type === 'PERCENT' ? 'bg-brand-red text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>% Percentage</button>
          <button onClick={() => setType('FIXED')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${type === 'FIXED' ? 'bg-brand-red text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>Fixed Amount</button>
        </div>

        <input 
          type="number" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-4 text-2xl font-bold text-center text-gray-900 dark:text-white focus:border-brand-red outline-none mb-6"
          placeholder="0"
          autoFocus
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg font-bold">Cancel</button>
          <button onClick={() => onApply(type, parseFloat(value))} className="flex-1 py-3 bg-brand-red text-white rounded-lg font-bold shadow-lg shadow-red-900/30">Apply</button>
        </div>
      </div>
    </div>
  );
};

export const POS: React.FC<POSProps> = ({ onNotify, currentBranch, onPlaceOrder }) => {
  const [view, setView] = useState<POSView>('FLOOR_PLAN');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Computed Cart Totals
  const subtotal = cart.reduce((acc, item) => acc + (item.price + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)) * item.quantity, 0);
  const discount = 0; // Placeholder for now
  const tax = subtotal * (currentBranch.taxRate / 100);
  const total = subtotal - discount + tax;

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setOrderType(OrderType.DINE_IN);
    setView('ORDER');
  };

  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    if (type === OrderType.DINE_IN) {
      setView('FLOOR_PLAN');
    } else {
      setSelectedTable(null);
      setView('ORDER');
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    const newItem: CartItem = {
      ...item,
      cartId: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      modifiers: []
    };
    setCart([...cart, newItem]);
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleQuantityChange = (cartId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(1, item.quantity + change) };
      }
      return item;
    }));
  };

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) {
      onNotify("Cart is empty", "error");
      return;
    }

    if (orderType === OrderType.DINE_IN && !selectedTable) {
        onNotify("Please select a table for Dine In", "error");
        return;
    }

    // Open Payment Modal instead of immediate completion
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (payments: Payment[]) => {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      type: orderType,
      table: selectedTable?.name,
      status: OrderStatus.KITCHEN,
      items: cart,
      total: total,
      payments: payments, // Store payment breakdown
      timestamp: new Date(),
      staffName: 'Current User' // Should come from context
    };

    if (onPlaceOrder) {
      onPlaceOrder(order);
    }
    
    onNotify("Order placed successfully", "success");
    setCart([]);
    setSelectedTable(null);
    setShowPaymentModal(false);
    
    if (orderType === OrderType.DINE_IN) {
        setView('FLOOR_PLAN');
    }
  };

  const renderFloorPlan = () => (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Table</h2>
         <div className="flex gap-2">
            <button onClick={() => handleOrderTypeChange(OrderType.TAKEAWAY)} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-sm">
               <ShoppingBag size={20} /> Takeaway
            </button>
            <button onClick={() => handleOrderTypeChange(OrderType.DELIVERY)} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-sm">
               <Truck size={20} /> Delivery
            </button>
         </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TABLES.map(table => (
          <button
            key={table.id}
            onClick={() => handleTableSelect(table)}
            className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center aspect-square transition-all ${
              table.status === TableStatus.AVAILABLE 
                ? 'bg-white dark:bg-brand-surface border-gray-200 dark:border-neutral-700 hover:border-brand-red text-gray-900 dark:text-white' 
                : table.status === TableStatus.OCCUPIED 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400'
            }`}
          >
            <div className="text-2xl font-bold mb-1">{table.name}</div>
            <div className="text-sm font-medium opacity-70">{table.seats} Seats</div>
            <div className="mt-2 text-xs font-bold px-2 py-1 rounded bg-black/5 dark:bg-white/10 uppercase tracking-wide">
              {table.status}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderOrderView = () => (
    <div className="flex h-full">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black/50">
        
        {/* Order Type Selectors */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-brand-surface border-b border-gray-200 dark:border-neutral-800">
            <button 
                onClick={() => handleOrderTypeChange(OrderType.DINE_IN)}
                className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${orderType === OrderType.DINE_IN ? 'bg-brand-red text-white shadow-md' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
            >
                <Utensils size={16} /> Dine In
            </button>
            <button 
                onClick={() => handleOrderTypeChange(OrderType.TAKEAWAY)}
                className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${orderType === OrderType.TAKEAWAY ? 'bg-brand-red text-white shadow-md' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
            >
                <ShoppingBag size={16} /> Takeaway
            </button>
            <button 
                onClick={() => handleOrderTypeChange(OrderType.DELIVERY)}
                className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${orderType === OrderType.DELIVERY ? 'bg-brand-red text-white shadow-md' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
            >
                <Truck size={16} /> Delivery
            </button>
        </div>

        {/* Categories */}
        <div className="p-2 bg-white dark:bg-brand-surface border-b border-gray-200 dark:border-neutral-800 overflow-x-auto whitespace-nowrap flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-brand-red text-white' 
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MENU_ITEMS.filter(item => item.categoryId === selectedCategory && item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
              <button
                key={item.id}
                onClick={() => handleAddToCart(item)}
                className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col items-start text-left hover:border-brand-red transition-all group shadow-sm"
              >
                <div className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-red">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-neutral-500 mb-2">{item.nameAr}</div>
                <div className="mt-auto font-mono font-bold text-brand-red">{item.price.toFixed(3)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white dark:bg-brand-surface border-l border-gray-200 dark:border-neutral-800 flex flex-col shadow-xl z-10">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Current Order</h2>
            <button onClick={() => { setView('FLOOR_PLAN'); setSelectedTable(null); }} className="text-xs text-gray-500 hover:text-red-500">Close</button>
          </div>
          <div className="text-sm text-gray-500 dark:text-neutral-400 flex items-center justify-between">
             <span>{orderType === OrderType.DINE_IN ? (selectedTable ? `Table: ${selectedTable.name}` : 'No Table Selected') : orderType}</span>
             {orderType === OrderType.DINE_IN && !selectedTable && <button onClick={() => setView('FLOOR_PLAN')} className="text-brand-red text-xs font-bold hover:underline">Select Table</button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.cartId} className="flex justify-between items-start group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg">
                    <button onClick={() => handleQuantityChange(item.cartId, -1)} className="p-1 hover:text-red-500"><Minus size={14}/></button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.cartId, 1)} className="p-1 hover:text-green-500"><Plus size={14}/></button>
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                    {(item.price * item.quantity).toFixed(3)}
                  </div>
                </div>
              </div>
              <button onClick={() => handleRemoveFromCart(item.cartId)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-neutral-400">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-neutral-400">
            <span>Tax ({currentBranch.taxRate}%)</span>
            <span>{tax.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-neutral-800">
            <span>Total</span>
            <span>{total.toFixed(3)} KWD</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setShowDiscountModal(true)} className="py-3 rounded-lg border border-gray-300 dark:border-neutral-700 font-bold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300">Discount</button>
            <button onClick={handlePlaceOrderClick} className="py-3 rounded-lg bg-brand-red text-white font-bold text-sm hover:bg-brand-redHover shadow-lg shadow-red-900/20">Pay / Send</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-brand-black overflow-hidden relative">
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} onNotify={onNotify} />}
      {showDiscountModal && <DiscountModal onClose={() => setShowDiscountModal(false)} onApply={(type, val) => { onNotify(`Applied ${type} discount: ${val}`, 'success'); setShowDiscountModal(false); }} />}
      {showPaymentModal && <PaymentModal total={total} currency={currentBranch.currency} onClose={() => setShowPaymentModal(false)} onComplete={handlePaymentComplete} />}

      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-brand-surface border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="text-brand-red" /> POS Terminal
          </h1>
          <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700"></div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
            <MapPin size={16} />
            {currentBranch.name}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-900 border-none text-sm text-gray-900 dark:text-white w-64 focus:ring-1 focus:ring-brand-red outline-none"
            />
          </div>
          <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-600 dark:text-neutral-400 transition-colors" title="Order History">
            <History size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'FLOOR_PLAN' ? renderFloorPlan() : renderOrderView()}
      </div>
    </div>
  );
};

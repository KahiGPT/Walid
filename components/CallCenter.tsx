
import React, { useState, useEffect } from 'react';
import { MENU_ITEMS, CATEGORIES, CUSTOMERS, RECENT_ORDERS } from '../constants';
import { Customer, MenuItem, CartItem, Order, OrderType, OrderStatus } from '../types';
import { 
  Phone, User, Search, MapPin, Clock, Headset, 
  CreditCard, Plus, Minus, Trash2, CheckCircle, 
  History, Mic, Volume2, XCircle, Home, ShoppingBag, Edit2, Save, X, Calendar, ChevronRight, List, ChevronLeft
} from 'lucide-react';

interface CallCenterProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  onPlaceOrder?: (order: Order) => void;
}

// Mock Addresses for Customers (Initial State)
const INITIAL_MOCK_ADDRESSES: Record<string, string[]> = {
  'C1': ['Block 3, Street 4, House 12, Jabriya', 'Office: Al Hamra Tower, Floor 32'],
  'C2': ['Salmiya, Block 10, St 3, Bldg 14'],
  'C4': ['Mishref, Block 5, St 1, House 44']
};

// Mock Order History
const MOCK_HISTORY: Record<string, any[]> = {
  'C1': [
    { id: 'ORD-5521', date: new Date('2024-02-20T19:30:00'), total: 12.500, status: 'COMPLETED', items: [MENU_ITEMS[0], MENU_ITEMS[2]] },
    { id: 'ORD-5100', date: new Date('2024-02-14T13:15:00'), total: 4.750, status: 'COMPLETED', items: [MENU_ITEMS[1]] },
    { id: 'ORD-4922', date: new Date('2024-01-30T20:45:00'), total: 8.250, status: 'COMPLETED', items: [MENU_ITEMS[0], MENU_ITEMS[5]] },
  ],
  'C2': [
    { id: 'ORD-4492', date: new Date('2024-02-18T20:00:00'), total: 22.000, status: 'COMPLETED', items: [MENU_ITEMS[0], MENU_ITEMS[0], MENU_ITEMS[4]] },
  ],
  'C4': [
    { id: 'ORD-3321', date: new Date('2024-02-22T12:00:00'), total: 15.000, status: 'COMPLETED', items: [MENU_ITEMS[1], MENU_ITEMS[3]] },
  ]
};

const OrderDetailsModal = ({ order, onClose }: { order: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-sm rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Order Details</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
           <div className="flex justify-between items-start">
              <div>
                 <div className="text-lg font-bold text-gray-900 dark:text-white">{order.id}</div>
                 <div className="text-xs text-gray-500 dark:text-neutral-500 flex items-center gap-1">
                    <Calendar size={12} /> {(order.timestamp || order.date).toLocaleString()}
                 </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${['COMPLETED', 'Completed'].includes(order.status) ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900'}`}>
                 {order.status}
              </span>
           </div>

           {/* Client Details Section */}
           {order.deliveryInfo && (
             <div className="bg-gray-100 dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-red"></div>
                <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-neutral-500 tracking-wider mb-3">Client Details</div>
                
                <div className="flex items-start gap-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center border border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-300 shrink-0">
                      <User size={18} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{order.deliveryInfo.customerName}</div>
                      <div className="text-xs text-brand-red font-mono mt-0.5">{order.deliveryInfo.phone}</div>
                   </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800/50 p-2 rounded-lg border border-gray-200 dark:border-neutral-800">
                   <MapPin size={14} className="text-gray-400 dark:text-neutral-500 mt-0.5 shrink-0" />
                   <span className="leading-relaxed">{order.deliveryInfo.address || 'No address provided'}</span>
                </div>
             </div>
           )}
           
           {/* Items List */}
           <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-neutral-800">
              <div className="text-[10px] uppercase font-bold text-gray-500 dark:text-neutral-500 tracking-wider">Ordered Items</div>
              {order.items && order.items.length > 0 ? order.items.map((item: any, idx: number) => (
                 <div key={idx} className="flex justify-between text-sm">
                    <div className="flex gap-2">
                       <span className="text-gray-500 dark:text-neutral-500 font-mono">{(item.quantity || 1)}x</span>
                       <div>
                          <div className="text-gray-900 dark:text-neutral-200 font-medium">{item.name}</div>
                          {item.modifiers && item.modifiers.length > 0 && (
                             <div className="text-[10px] text-gray-500 dark:text-neutral-500">
                                + {item.modifiers.map((m: any) => m.name).join(', ')}
                             </div>
                          )}
                       </div>
                    </div>
                    <div className="text-gray-900 dark:text-white font-mono">
                       {((item.price + (item.modifiers?.reduce((s:number, m:any) => s + m.price, 0) || 0)) * (item.quantity || 1)).toFixed(3)}
                    </div>
                 </div>
              )) : (
                <div className="text-center text-gray-500 dark:text-neutral-500 text-xs italic py-2">No items listed</div>
              )}
           </div>
           
           <div className="pt-3 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-end">
              <span className="text-gray-500 dark:text-neutral-400 text-sm">Total Amount</span>
              <span className="text-xl font-bold text-brand-red font-mono">{order.total.toFixed(3)} KD</span>
           </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
           <button onClick={onClose} className="w-full py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-transparent hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-xl font-bold transition-colors">
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

export const CallCenter: React.FC<CallCenterProps> = ({ onNotify, onPlaceOrder }) => {
  const [activeCall, setActiveCall] = useState<Customer | null>(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const [incomingCaller, setIncomingCaller] = useState<Customer | null>(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [agentStatus, setAgentStatus] = useState<'AVAILABLE' | 'BUSY' | 'BREAK'>('AVAILABLE');
  
  // Daily Global History & Date Navigation
  const [dailyOrders, setDailyOrders] = useState<Order[]>(RECENT_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [historyDate, setHistoryDate] = useState(new Date());

  // Editing States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  const [customerAddresses, setCustomerAddresses] = useState<string[]>([]);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [tempAddressVal, setTempAddressVal] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');

  // Filter orders by selected date
  const filteredDailyOrders = dailyOrders.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate.getDate() === historyDate.getDate() &&
           orderDate.getMonth() === historyDate.getMonth() &&
           orderDate.getFullYear() === historyDate.getFullYear();
  });

  const nextDay = () => {
    const next = new Date(historyDate);
    next.setDate(historyDate.getDate() + 1);
    setHistoryDate(next);
  };

  const prevDay = () => {
    const prev = new Date(historyDate);
    prev.setDate(historyDate.getDate() - 1);
    setHistoryDate(prev);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Sync state when call starts
  useEffect(() => {
    if (activeCall) {
      setEditName(activeCall.name === 'Unknown Caller' ? '' : activeCall.name);
      setEditPhone(activeCall.phone);
      setCustomerAddresses(INITIAL_MOCK_ADDRESSES[activeCall.id] || []);
      setCustomerHistory(MOCK_HISTORY[activeCall.id] || []);
      setActiveTab('DETAILS');
      
      // Auto-enter edit mode for unknown callers
      if (activeCall.id.startsWith('unknown')) {
        setIsEditingProfile(true);
      }
    } else {
      // Reset
      setEditName('');
      setEditPhone('');
      setCustomerAddresses([]);
      setCustomerHistory([]);
      setIsEditingProfile(false);
      setEditingAddressIndex(null);
      setIsAddingAddress(false);
      setActiveTab('DETAILS');
    }
  }, [activeCall]);

  // Simulate Incoming Call
  const simulateCall = () => {
    const isUnknown = Math.random() > 0.6; // 40% chance of unknown caller
    
    if (isUnknown) {
      const randomPhone = `9000-${Math.floor(Math.random() * 8999) + 1000}`;
      setIncomingCaller({
        id: `unknown-${Date.now()}`,
        name: 'Unknown Caller',
        phone: randomPhone,
        email: '',
        totalSpend: 0,
        visitCount: 0,
        lastVisit: new Date(),
        loyaltyPoints: 0,
        tags: ['New Caller']
      });
    } else {
      const randomCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
      setIncomingCaller(randomCustomer);
    }
    setIsIncoming(true);
  };

  const acceptCall = () => {
    setActiveCall(incomingCaller);
    setIsIncoming(false);
    setIncomingCaller(null);
    setAgentStatus('BUSY');
    // Pre-select first address if available
    if (incomingCaller && INITIAL_MOCK_ADDRESSES[incomingCaller.id]?.length > 0) {
      setSelectedAddress(INITIAL_MOCK_ADDRESSES[incomingCaller.id][0]);
    } else {
      setSelectedAddress('');
    }
  };

  const rejectCall = () => {
    setIsIncoming(false);
    setIncomingCaller(null);
  };

  const endCall = () => {
    setActiveCall(null);
    setCart([]);
    setSelectedAddress('');
    setAgentStatus('AVAILABLE');
    onNotify('Call ended. Agent available.', 'info');
  };

  const saveProfile = () => {
    if (activeCall) {
      const updatedCall = { ...activeCall, name: editName || 'Guest', phone: editPhone };
      setActiveCall(updatedCall);
      setIsEditingProfile(false);
      onNotify('Customer profile updated.', 'success');
    }
  };

  // Address Actions
  const startEditAddress = (index: number) => {
    setEditingAddressIndex(index);
    setTempAddressVal(customerAddresses[index]);
  };

  const saveAddress = (index: number) => {
    if (tempAddressVal.trim()) {
      const newAddrs = [...customerAddresses];
      newAddrs[index] = tempAddressVal;
      setCustomerAddresses(newAddrs);
      // If this was the selected address, update selection
      if (selectedAddress === customerAddresses[index]) {
        setSelectedAddress(tempAddressVal);
      }
      setEditingAddressIndex(null);
    }
  };

  const addNewAddress = () => {
    if (tempAddressVal.trim()) {
      setCustomerAddresses([...customerAddresses, tempAddressVal]);
      setSelectedAddress(tempAddressVal);
      setTempAddressVal('');
      setIsAddingAddress(false);
    }
  };

  const deleteAddress = (index: number) => {
    const addrToRemove = customerAddresses[index];
    setCustomerAddresses(prev => prev.filter((_, i) => i !== index));
    if (selectedAddress === addrToRemove) setSelectedAddress('');
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.modifiers.length === 0);
      if (existing) {
        return prev.map(i => i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, cartId: Math.random().toString(), quantity: 1, modifiers: [] }];
    });
  };

  const repeatOrder = (items: MenuItem[]) => {
    items.forEach(item => addToCart(item));
    onNotify('Items added from history', 'success');
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      onNotify('Please select a delivery address', 'error');
      return;
    }

    if (onPlaceOrder && activeCall) {
      const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        type: OrderType.DELIVERY,
        status: OrderStatus.PENDING, 
        items: cart,
        total: total + 0.500, 
        timestamp: new Date(),
        staffName: 'Call Center',
        deliveryInfo: {
          customerName: activeCall.name,
          phone: activeCall.phone,
          address: selectedAddress,
          platform: 'OWN_FLEET',
          driverName: undefined
        }
      };
      
      // Add to global daily list
      setDailyOrders(prev => [newOrder, ...prev]);
      
      if (onPlaceOrder) onPlaceOrder(newOrder);
    }

    onNotify(`Order placed successfully for ${activeCall?.name}`, 'success');
    endCall();
  };

  // Filter menu items
  const filteredItems = MENU_ITEMS.filter(item => item.categoryId === activeCategory);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-brand-black relative overflow-hidden">
      
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

      {/* Incoming Call Overlay */}
      {isIncoming && incomingCaller && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-neutral-900 border border-brand-red rounded-2xl shadow-2xl p-6 w-96 animate-bounce-subtle flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 border-4 border-brand-red flex items-center justify-center mb-4 animate-pulse">
            <Phone size={32} className="text-black dark:text-white fill-black dark:fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{incomingCaller.name}</h2>
          <p className="text-gray-500 dark:text-neutral-400 font-mono text-lg mb-6">{incomingCaller.phone}</p>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={rejectCall}
              className="py-3 rounded-xl bg-gray-200 dark:bg-neutral-800 text-red-600 dark:text-red-500 font-bold hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={20} /> Decline
            </button>
            <button 
              onClick={acceptCall}
              className="py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/50"
            >
              <Phone size={20} className="fill-white" /> Accept
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 bg-white dark:bg-brand-surface border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Headset className="text-brand-red" /> Call Center
          </h1>
          <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700"></div>
          
          {/* Agent Status Toggle */}
          <div className="flex bg-gray-100 dark:bg-neutral-900 rounded-lg p-1">
            {['AVAILABLE', 'BUSY', 'BREAK'].map(status => (
              <button
                key={status}
                onClick={() => setAgentStatus(status as any)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${agentStatus === status 
                  ? (status === 'AVAILABLE' ? 'bg-green-600 text-white' : status === 'BUSY' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white') 
                  : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!activeCall && !isIncoming && (
            <button 
              onClick={simulateCall}
              className="bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-300 dark:border-neutral-700 transition-colors"
            >
              <Volume2 size={16} /> Simulate Call
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-xs">AG</div>
            <div className="text-sm">
              <div className="text-gray-900 dark:text-white font-bold">Agent Sarah</div>
              <div className="text-[10px] text-gray-500 dark:text-neutral-500">Extension: 402</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Customer Panel */}
        <div className="w-80 bg-white dark:bg-brand-surface border-r border-gray-200 dark:border-neutral-800 flex flex-col">
          {activeCall ? (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              
              {/* Customer Profile (Always Visible) */}
              <div className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-center relative overflow-hidden group mb-4 shrink-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
                
                {/* Avatar */}
                <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-gray-200 dark:border-neutral-700">
                  <User size={32} className="text-gray-400 dark:text-neutral-400" />
                </div>

                {isEditingProfile ? (
                  <div className="space-y-3">
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Customer Name"
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded p-2 text-gray-900 dark:text-white text-center text-sm focus:border-brand-red outline-none"
                      autoFocus
                    />
                    <input 
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded p-2 text-gray-900 dark:text-white text-center text-sm font-mono focus:border-brand-red outline-none"
                    />
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-gray-200 dark:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"><X size={16} /></button>
                      <button onClick={saveProfile} className="p-2 bg-brand-red rounded text-white hover:bg-red-600"><Save size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                      {activeCall.name}
                      <button onClick={() => setIsEditingProfile(true)} className="text-gray-500 dark:text-neutral-600 hover:text-black dark:hover:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </h2>
                    <div className="text-brand-red font-mono font-bold mb-2">{activeCall.phone}</div>
                    <div className="flex justify-center gap-2">
                      {activeCall.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-white dark:bg-neutral-800 px-2 py-1 rounded text-gray-500 dark:text-neutral-400 border border-gray-300 dark:border-neutral-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 dark:bg-neutral-900 rounded-lg p-1 mb-4 border border-gray-200 dark:border-neutral-800 shrink-0">
                 <button 
                   onClick={() => setActiveTab('DETAILS')}
                   className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'DETAILS' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}
                 >
                   Details & Address
                 </button>
                 <button 
                   onClick={() => setActiveTab('HISTORY')}
                   className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}
                 >
                   Order History
                 </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                
                {activeTab === 'DETAILS' ? (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-3 flex justify-between items-center sticky top-0 bg-white dark:bg-brand-surface py-2 z-10">
                      Delivery Addresses
                      {!isAddingAddress && (
                        <button 
                          onClick={() => { setIsAddingAddress(true); setTempAddressVal(''); }}
                          className="text-brand-red hover:text-black dark:hover:text-white flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-neutral-900 px-2 py-1 rounded border border-gray-200 dark:border-neutral-800"
                        >
                          <Plus size={10} /> Add New
                        </button>
                      )}
                    </h3>
                    
                    <div className="space-y-2">
                      {customerAddresses.map((addr, idx) => (
                        <div key={idx}>
                          {editingAddressIndex === idx ? (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-900 p-2 rounded-lg border border-brand-red">
                               <input 
                                 type="text" 
                                 value={tempAddressVal}
                                 onChange={(e) => setTempAddressVal(e.target.value)}
                                 className="flex-1 bg-transparent text-gray-900 dark:text-white text-xs outline-none"
                                 autoFocus
                               />
                               <button onClick={() => saveAddress(idx)} className="text-green-500"><CheckCircle size={14}/></button>
                               <button onClick={() => setEditingAddressIndex(null)} className="text-gray-500 dark:text-neutral-500"><XCircle size={14}/></button>
                            </div>
                          ) : (
                            <div 
                              className={`group w-full text-left p-3 rounded-lg border text-xs transition-all flex justify-between items-start cursor-pointer hover:border-gray-400 dark:hover:border-neutral-600 ${selectedAddress === addr ? 'bg-brand-red/10 border-brand-red text-black dark:text-white' : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400'}`}
                              onClick={() => setSelectedAddress(addr)}
                            >
                              <div className="flex gap-2 pr-2">
                                <MapPin size={14} className={`flex-shrink-0 mt-0.5 ${selectedAddress === addr ? 'text-brand-red' : 'text-gray-400 dark:text-neutral-600'}`} />
                                <span className="break-words">{addr}</span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={(e) => { e.stopPropagation(); startEditAddress(idx); }} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><Edit2 size={12}/></button>
                                 <button onClick={(e) => { e.stopPropagation(); deleteAddress(idx); }} className="text-gray-500 dark:text-neutral-500 hover:text-red-500"><Trash2 size={12}/></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add New Address Input */}
                      {isAddingAddress && (
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 p-2 rounded-lg border border-brand-red animate-in fade-in zoom-in-95 duration-200">
                            <input 
                              type="text" 
                              value={tempAddressVal}
                              onChange={(e) => setTempAddressVal(e.target.value)}
                              placeholder="Enter new address..."
                              className="flex-1 bg-transparent text-gray-900 dark:text-white text-xs outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-600"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && addNewAddress()}
                            />
                            <button onClick={addNewAddress} className="text-green-500 hover:text-green-400"><CheckCircle size={16}/></button>
                            <button onClick={() => setIsAddingAddress(false)} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><XCircle size={16}/></button>
                        </div>
                      )}

                      {customerAddresses.length === 0 && !isAddingAddress && (
                        <div className="text-center py-6 text-gray-500 dark:text-neutral-600 text-xs italic bg-gray-50 dark:bg-neutral-900/30 rounded-lg border border-dashed border-gray-300 dark:border-neutral-800">
                          No addresses saved. <br/> Add one to proceed.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-3 flex justify-between sticky top-0 bg-white dark:bg-brand-surface py-2 z-10">
                      Order History 
                      <span className="text-gray-600 dark:text-neutral-600 text-[10px]">{customerHistory.length} orders</span>
                    </h3>
                    <div className="space-y-2">
                      {customerHistory.length > 0 ? customerHistory.map((order, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 group hover:border-gray-400 dark:hover:border-neutral-600 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-2">
                                {order.id}
                                <span className="text-[9px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-900/50">
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Calendar size={10} /> {order.date.toLocaleDateString()} • {order.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-brand-red font-mono font-bold text-xs">{order.total.toFixed(3)}</div>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-gray-500 dark:text-neutral-400 mb-3 line-clamp-1">
                            {order.items.map((i: any) => i.name).join(', ')}
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); repeatOrder(order.items); }}
                            className="w-full text-[10px] bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-white px-2 py-2 rounded border border-gray-200 dark:border-neutral-700 flex items-center justify-center gap-1 transition-colors"
                          >
                            <History size={12} /> Repeat Order
                          </button>
                        </div>
                      )) : (
                        <div className="text-center py-6 text-gray-500 dark:text-neutral-600 text-xs italic bg-gray-50 dark:bg-neutral-900/30 rounded-lg border border-dashed border-gray-300 dark:border-neutral-800">
                          No order history found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={endCall}
                className="mt-auto w-full py-3 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-900 transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Phone size={18} className="rotate-[135deg]" /> End Call
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4">
              {/* Idle State Header */}
              <div className="w-full relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Lookup Phone / Name" 
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-neutral-900 rounded-lg p-1 border border-gray-200 dark:border-neutral-800">
                      <button onClick={prevDay} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                      <button onClick={nextDay} disabled={isToday(historyDate)} className={`p-1 rounded transition-colors ${isToday(historyDate) ? 'text-gray-300 dark:text-neutral-700 cursor-not-allowed' : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800'}`}><ChevronRight size={16} /></button>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <Calendar size={14} className="text-brand-red" />
                      {isToday(historyDate) ? "Today's Activity" : historyDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredDailyOrders.length > 0 ? filteredDailyOrders.map((order, idx) => (
                    <div 
                      key={order.id + idx} 
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 hover:border-gray-400 dark:hover:border-neutral-600 transition-colors cursor-pointer group shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white font-bold text-xs">{order.id}</span>
                          <span className="text-[10px] text-gray-500 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700">{new Date(order.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.status === 'Completed' ? 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/20' : 'text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'}`}>
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <div className="text-xs text-gray-500 dark:text-neutral-400">
                          {order.deliveryInfo?.customerName || 'Guest'}
                        </div>
                        <div className="text-brand-red font-mono font-bold text-xs">
                          {order.total.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-neutral-600">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center mb-2">
                        <History size={20} className="opacity-50" />
                      </div>
                      <p className="text-xs italic">No orders on {historyDate.toLocaleDateString()}.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: Menu Grid */}
        <div className="flex-1 bg-gray-100 dark:bg-black flex flex-col">
          {/* Categories */}
          <div className="h-14 border-b border-gray-200 dark:border-neutral-800 flex items-center px-4 gap-2 overflow-x-auto bg-white dark:bg-brand-surface/50">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${activeCategory === cat.id ? 'bg-brand-red border-brand-red text-white' : 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={!activeCall}
                  className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-left transition-all group relative overflow-hidden shadow-sm ${!activeCall ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-red active:scale-95'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-brand-red transition-colors">{item.name}</div>
                    <div className="text-xs font-mono text-gray-500 dark:text-neutral-400">{item.price.toFixed(3)}</div>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">{item.nameAr}</div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-red rounded-full p-1 text-white">
                    <Plus size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Order Cart */}
        <div className="w-80 bg-white dark:bg-brand-surface border-l border-gray-200 dark:border-neutral-800 flex flex-col shadow-xl z-10">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900 font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-red" /> Current Order
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-neutral-600 italic text-xs">
                No items in cart
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-3 flex justify-between items-center group">
                  <div>
                    <div className="text-gray-900 dark:text-white text-sm font-bold">{item.quantity}x {item.name}</div>
                    <div className="text-[10px] text-gray-500 dark:text-neutral-500 font-mono">{(item.price * item.quantity).toFixed(3)} KD</div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-gray-400 dark:text-neutral-600 hover:text-red-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900 space-y-4">
            {/* Delivery Info */}
            <div className="space-y-2">
               <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-400">
                 <span>Delivery Fee</span>
                 <span>0.500 KD</span>
               </div>
               <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-400">
                 <span>Est. Time</span>
                 <span className="flex items-center gap-1 text-gray-900 dark:text-white"><Clock size={12}/> 45 mins</span>
               </div>
               {selectedAddress ? (
                 <div className="bg-white dark:bg-neutral-800 p-2 rounded border border-gray-200 dark:border-neutral-700 text-[10px] text-gray-700 dark:text-neutral-300 truncate flex items-center gap-1">
                   <Home size={10} className="text-brand-red"/> {selectedAddress}
                 </div>
               ) : (
                 <div className="text-[10px] text-red-500 italic text-center animate-pulse">Select an address to proceed</div>
               )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm font-bold text-gray-500 dark:text-neutral-400">Total</span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{(total + 0.500).toFixed(3)} <span className="text-xs text-gray-500 dark:text-neutral-500">KD</span></span>
              </div>
              
              <button 
                disabled={cart.length === 0 || !activeCall || !selectedAddress}
                onClick={handlePlaceOrder}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${cart.length > 0 && activeCall && selectedAddress ? 'bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20' : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'}`}
              >
                <ShoppingBag size={18} /> Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

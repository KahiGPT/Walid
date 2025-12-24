import React, { useState, useEffect, useMemo } from 'react';
import { MODIFIER_GROUPS } from '../constants';
import { CartItem, MenuItem, OrderType, Table, TableStatus, ModifierOption, ModifierGroup, Order, Branch, OrderStatus, Payment } from '../types';
import { Search, Grid, Trash2, Plus, Minus, CreditCard, ChefHat, User, MoreVertical, WifiOff, ArrowLeft, LayoutGrid, Delete, Check, X, Printer, Split, MoveRight, MoveLeft, Users, History, RefreshCcw, Loader2, Percent, FileText, Unlock, ChevronRight, MapPin, Utensils, ShoppingBag, Truck, Banknote, Star, CreditCard as CardIcon, Image as ImageIcon, List, MessageSquare, Send, Gift, Ban, Move, Receipt, Timer, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

type POSView = 'FLOOR_PLAN' | 'ORDER' | 'PAYMENT' | 'SPLIT';

interface POSProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  currentBranch: Branch;
  onPlaceOrder?: (order: Order) => void;
  liveOrders: Order[]; 
  completedOrders: Order[]; 
}

const QuickTableModal = ({ 
  table,
  onClose, 
  onSave 
}: { 
  table?: Table | null;
  onClose: () => void; 
  onSave: (t: Partial<Table>) => void; 
}) => {
  const [formData, setFormData] = useState<Partial<Table>>(
    table ? { ...table } : {
      name: '',
      seats: 4,
      zone: 'Indoor',
      status: TableStatus.AVAILABLE
    }
  );

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-lg rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <LayoutGrid size={24} className="text-brand-red" /> {table ? 'Edit Table' : 'New Table'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"><X size={28}/></button>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-neutral-500 mb-3 uppercase tracking-wider">Table Name / ID</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-2xl p-5 text-xl text-gray-900 dark:text-white focus:border-brand-red outline-none ring-offset-2 focus:ring-2 focus:ring-brand-red/20 transition-all"
              placeholder="e.g. T-10"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-neutral-500 mb-3 uppercase tracking-wider">Seats</label>
                <input 
                type="number" 
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-2xl p-5 text-xl text-gray-900 dark:text-white focus:border-brand-red outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-neutral-500 mb-3 uppercase tracking-wider">Zone</label>
                <select 
                value={formData.zone}
                onChange={(e) => setFormData({...formData, zone: e.target.value})}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-2xl p-5 text-lg text-gray-900 dark:text-white focus:border-brand-red outline-none appearance-none"
                >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Terrace">Terrace</option>
                <option value="VIP">VIP</option>
                </select>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-4">
             <button onClick={onClose} className="px-8 py-4 rounded-2xl font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 text-lg transition-all">Cancel</button>
             <button 
               onClick={() => onSave(formData)}
               disabled={!formData.name}
               className="px-10 py-4 rounded-2xl font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-all active:scale-95"
             >
               {table ? 'Update Table' : 'Add Table'}
             </button>
        </div>
      </div>
    </div>
  );
};

export const POS: React.FC<POSProps> = ({ onNotify, currentBranch, onPlaceOrder, liveOrders, completedOrders }) => {
  const { tables, addTable, updateTable, categories, menuItems, currentUser } = useApp();
  const [view, setView] = useState<POSView>('FLOOR_PLAN');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickTableModal, setShowQuickTableModal] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price + item.modifiers.reduce((sum, mod) => sum + mod.price, 0)) * item.quantity, 0);
  const tax = subtotal * (currentBranch.taxRate / 100);
  const total = subtotal + tax;

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setOrderType(OrderType.DINE_IN);
    const activeTickets = liveOrders.filter(o => o.table === table.name && o.status !== OrderStatus.COMPLETED);
    const aggregatedItems: CartItem[] = [];
    activeTickets.forEach(ticket => ticket.items.forEach(item => aggregatedItems.push({ ...item, fired: true })));
    setCart(aggregatedItems);
    setView('ORDER');
  };

  const handleAddToCart = (item: MenuItem) => {
    const newItem: CartItem = {
      ...item,
      cartId: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      modifiers: [],
      fired: false 
    };
    setCart([...cart, newItem]);
  };

  const handleUpdateQty = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.cartId === cartId && !item.fired ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleQuickTableSave = (data: Partial<Table>) => {
    if (tableToEdit) {
      updateTable(tableToEdit.id, data);
      onNotify(`Table updated successfully.`, 'success');
    } else {
      const newTable: Table = {
        id: `t-${Date.now()}`,
        name: data.name!,
        seats: data.seats || 4,
        zone: data.zone || 'Indoor',
        status: TableStatus.AVAILABLE
      };
      addTable(newTable);
      onNotify(`Table ${newTable.name} added.`, 'success');
    }
    setShowQuickTableModal(false);
    setTableToEdit(null);
  };

  const handleFinishOrder = async () => {
    const newItems = cart.filter(i => !i.fired);
    if (newItems.length === 0) return;

    const order: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      type: orderType,
      table: selectedTable?.name,
      status: OrderStatus.PENDING,
      items: newItems,
      total: total,
      timestamp: new Date(),
      staffName: currentUser?.username || 'Terminal 04'
    };

    if (onPlaceOrder) {
      await onPlaceOrder(order);
      setCart([]);
      setView('FLOOR_PLAN');
      setSelectedTable(null);
    }
  };

  const renderFloorPlan = () => (
    <div className="p-10 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
         <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Select Table</h2>
         <div className="flex gap-6">
            <button onClick={() => { setOrderType(OrderType.TAKEAWAY); setView('ORDER'); }} className="bg-white dark:bg-neutral-800 border-4 border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white px-12 py-6 rounded-3xl font-black text-2xl flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-2xl transition-all active:scale-95">
               <ShoppingBag size={32} /> Takeaway
            </button>
         </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 pb-20">
        {tables.map(table => {
          const activeTickets = liveOrders.filter(o => o.table === table.name && o.status !== OrderStatus.COMPLETED);
          const status = activeTickets.length > 0 ? TableStatus.OCCUPIED : table.status;
          return (
            <button
              key={table.id}
              onClick={() => handleTableSelect(table)}
              className={`p-10 rounded-[40px] border-4 flex flex-col items-center justify-center aspect-square transition-all group relative ${
                status === TableStatus.AVAILABLE 
                  ? 'bg-white dark:bg-brand-surface border-gray-100 dark:border-neutral-800 hover:border-brand-red text-gray-900 dark:text-white shadow-xl hover:shadow-2xl' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
              }`}
            >
              <div className="text-5xl font-black mb-3">{table.name}</div>
              <div className="text-xl font-bold opacity-60 tracking-tight">{table.seats} Seats</div>
              <div className={`mt-6 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest ${status === TableStatus.AVAILABLE ? 'bg-green-100 text-green-600' : 'bg-red-600 text-white'}`}>
                {status}
              </div>
            </button>
          );
        })}
        <button
          onClick={() => { setTableToEdit(null); setShowQuickTableModal(true); }}
          className="p-10 rounded-[40px] border-4 border-dashed border-gray-300 dark:border-neutral-700 flex flex-col items-center justify-center aspect-square transition-all hover:border-brand-red text-gray-400 hover:text-brand-red hover:bg-gray-50 dark:hover:bg-neutral-900/30 group"
        >
          <Plus size={64} className="mb-6 transition-transform group-hover:scale-110" />
          <div className="text-xl font-black uppercase tracking-widest">Add Table</div>
        </button>
      </div>
    </div>
  );

  const renderOrderView = () => (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black/50">
        <div className="p-6 bg-white dark:bg-brand-surface border-b-2 border-gray-200 dark:border-neutral-800 overflow-x-auto whitespace-nowrap flex gap-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-10 py-6 rounded-3xl text-xl font-black transition-all shadow-md ${
                selectedCategory === cat.id 
                  ? 'bg-brand-red text-white scale-105 shadow-brand-red/30' 
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {menuItems.filter(item => item.categoryId === selectedCategory).map(item => (
              <button
                key={item.id}
                onClick={() => handleAddToCart(item)}
                className="bg-white dark:bg-brand-surface border-4 border-gray-200 dark:border-neutral-800 rounded-[40px] p-6 flex flex-col items-start text-left hover:border-brand-red transition-all group shadow-xl hover:shadow-2xl active:scale-[0.98] overflow-hidden"
              >
                <div className="w-full aspect-square rounded-[30px] overflow-hidden mb-6 bg-gray-100 dark:bg-neutral-800 relative shadow-inner">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={64} /></div>}
                </div>
                <div className="font-black text-gray-900 dark:text-white text-2xl line-clamp-2 mb-4 leading-tight tracking-tighter h-16">{item.name}</div>
                <div className="mt-auto flex justify-between items-center w-full">
                    <span className="font-mono font-black text-brand-red text-3xl">{item.price.toFixed(3)}</span>
                    <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-2xl group-hover:bg-brand-red group-hover:text-white transition-all shadow-sm">
                        <Plus size={32} strokeWidth={3} />
                    </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="w-[500px] bg-white dark:bg-brand-surface border-l-4 border-gray-200 dark:border-neutral-800 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.2)] z-10">
        <div className="p-8 border-b-2 border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h2 className="font-black text-3xl text-gray-900 dark:text-white tracking-tighter uppercase">Order Summary</h2>
          <button onClick={() => { setView('FLOOR_PLAN'); setSelectedTable(null); }} className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-2xl text-gray-500 hover:text-red-500 active:scale-90 transition-all"><X size={32}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {cart.map(item => (
                <div key={item.cartId} className="flex flex-col gap-6 p-7 bg-gray-50 dark:bg-neutral-800/50 rounded-[35px] border-2 border-gray-200 dark:border-neutral-700 animate-in slide-in-from-right-4 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                            <div className="font-black text-xl text-gray-900 dark:text-white leading-tight">{item.name}</div>
                            <div className="text-brand-red font-mono font-black text-2xl mt-2">{(item.price * item.quantity).toFixed(3)}</div>
                        </div>
                        <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"><Trash2 size={28} /></button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-white dark:bg-neutral-900 rounded-3xl border-4 border-gray-200 dark:border-neutral-700 shadow-lg overflow-hidden">
                            <button onClick={() => handleUpdateQty(item.cartId, -1)} className="w-16 h-16 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 active:scale-75 transition-all"><Minus size={32} strokeWidth={4}/></button>
                            <span className="w-16 text-center text-2xl font-black tabular-nums">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.cartId, 1)} className="w-16 h-16 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 active:scale-75 transition-all"><Plus size={32} strokeWidth={4}/></button>
                        </div>
                        {item.fired && <span className="text-xs font-black uppercase bg-green-500 text-white px-5 py-2 rounded-full tracking-widest shadow-lg shadow-green-900/20">Kitchen</span>}
                    </div>
                </div>
            ))}
            {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-gray-300 dark:text-neutral-700">
                    <ShoppingBag size={120} className="mb-8 opacity-20" />
                    <p className="text-2xl font-black uppercase tracking-widest italic">Terminal Ready</p>
                </div>
            )}
        </div>
        <div className="p-10 border-t-4 border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between text-gray-500 dark:text-neutral-400 font-black text-lg uppercase tracking-tight">
                    <span>Subtotal</span>
                    <span className="font-mono">{subtotal.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-400 dark:text-neutral-500 font-bold text-base uppercase tracking-widest">
                    <span>VAT (0%)</span>
                    <span className="font-mono">0.000</span>
                </div>
            </div>
            <div className="flex justify-between items-end border-t-4 border-gray-200 dark:border-neutral-800 pt-8">
                <span className="font-black text-3xl dark:text-white uppercase tracking-tighter">Total Due</span>
                <div className="text-right">
                    <span className="text-5xl font-black text-brand-red font-mono tracking-tighter">{total.toFixed(3)}</span>
                    <span className="text-lg font-black ml-2 text-gray-500 uppercase">KD</span>
                </div>
            </div>
            <button 
              onClick={handleFinishOrder}
              disabled={cart.filter(i => !i.fired).length === 0}
              className="w-full py-8 bg-brand-red text-white font-black text-3xl rounded-[40px] shadow-[0_20px_50px_rgba(239,68,68,0.4)] hover:bg-brand-redHover transition-all active:scale-[0.97] flex items-center justify-center gap-6 uppercase tracking-tighter disabled:opacity-50 disabled:grayscale"
            >
                <CreditCard size={40} strokeWidth={2.5} /> {orderType === OrderType.DINE_IN ? 'Send to Kitchen' : 'Pay Order'}
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-brand-black overflow-hidden relative">
      {showQuickTableModal && <QuickTableModal table={tableToEdit} onClose={() => setShowQuickTableModal(false)} onSave={handleQuickTableSave} />}
      <div className="h-24 bg-white dark:bg-brand-surface border-b-4 border-gray-200 dark:border-neutral-800 flex items-center justify-between px-10 shadow-md">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter"><LayoutGrid className="text-brand-red" size={36} /> Terminal 04</h1>
        <div className="flex items-center gap-8">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-red transition-colors" size={28} />
                <input type="text" placeholder="Quick Search Items..." className="pl-16 pr-10 py-5 rounded-[25px] bg-gray-100 dark:bg-neutral-800 border-none w-[400px] text-xl font-bold focus:ring-4 focus:ring-brand-red/10 transition-all outline-none shadow-inner" />
            </div>
            <button className="p-5 bg-gray-100 dark:bg-neutral-800 rounded-[25px] text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-90"><History size={32} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {view === 'FLOOR_PLAN' ? renderFloorPlan() : renderOrderView()}
      </div>
    </div>
  );
};
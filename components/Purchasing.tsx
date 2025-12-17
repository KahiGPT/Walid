
import React, { useState } from 'react';
import { SUPPLIERS, PURCHASE_ORDERS, INVENTORY_ITEMS } from '../constants';
import { Supplier, PurchaseOrder, POItem, POStatus } from '../types';
import { ShoppingCart, User, Plus, FileText, CheckCircle, Clock, Truck, Star, Phone, Mail, ChevronRight, X, Search, Calendar, AlertCircle } from 'lucide-react';

type ViewMode = 'DASHBOARD' | 'ORDERS' | 'SUPPLIERS';

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: POStatus }) => {
  const styles = {
    DRAFT: 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-400 border-gray-300 dark:border-neutral-700',
    PENDING_APPROVAL: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900',
    SENT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    RECEIVED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900',
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const AddSupplierModal = ({ onClose, onSave }: { onClose: () => void, onSave: (s: Supplier) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contactPhone: '',
    email: '',
    paymentTerms: 'Net 30',
    leadTimeDays: 1
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.contactPhone) return;
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      rating: 5.0, // Default new supplier rating
      ...formData
    };
    onSave(newSupplier);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Supplier</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Supplier Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="e.g. Fresh Farms Ltd."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Category</label>
            <input 
              type="text" 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="e.g. Vegetables"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Phone</label>
                <input 
                  type="text" 
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                  placeholder="+965..."
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                  placeholder="contact@..."
                />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Payment Terms</label>
                <select 
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                >
                   <option>COD</option>
                   <option>Net 15</option>
                   <option>Net 30</option>
                   <option>Net 60</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Lead Time (Days)</label>
                <input 
                  type="number" 
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({...formData, leadTimeDays: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                />
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800">Cancel</button>
           <button 
             onClick={handleSubmit}
             disabled={!formData.name}
             className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Save Supplier
           </button>
        </div>
      </div>
    </div>
  );
};

const CreatePO = ({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: (po: any) => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [items, setItems] = useState<{ itemId: string, qty: number }[]>([]);

  const supplier = SUPPLIERS.find(s => s.id === selectedSupplierId);
  const availableItems = INVENTORY_ITEMS.filter(i => i.supplierId === selectedSupplierId);

  const toggleItem = (itemId: string) => {
    setItems(prev => {
      const exists = prev.find(i => i.itemId === itemId);
      if (exists) return prev.filter(i => i.itemId !== itemId);
      return [...prev, { itemId, qty: 1 }];
    });
  };

  const updateQty = (itemId: string, qty: number) => {
    setItems(prev => prev.map(i => i.itemId === itemId ? { ...i, qty } : i));
  };

  const totalCost = items.reduce((acc, item) => {
    const invItem = availableItems.find(i => i.id === item.itemId);
    return acc + ((invItem?.costPerUnit || 0) * (item.qty || 0));
  }, 0);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-4xl rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="text-brand-red" /> Create Purchase Order
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Step {step} of 2: {step === 1 ? 'Select Supplier' : 'Add Items to Order'}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-brand-black/50">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUPPLIERS.map(sup => (
                <button 
                  key={sup.id}
                  onClick={() => { setSelectedSupplierId(sup.id); setStep(2); setItems([]); }}
                  className="p-5 rounded-xl bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-700 hover:border-brand-red dark:hover:border-brand-red text-left group transition-all hover:shadow-md dark:hover:bg-neutral-800 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-gray-700 dark:text-white group-hover:bg-brand-red group-hover:text-white transition-colors">
                      {sup.name.charAt(0)}
                    </div>
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-brand-red mb-1 transition-colors">{sup.name}</div>
                  <div className="text-sm text-gray-500 dark:text-neutral-400">{sup.category}</div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700/50 flex flex-col gap-1 text-xs text-gray-500 dark:text-neutral-500">
                    <span className="flex items-center gap-2"><Clock size={12}/> Lead Time: {sup.leadTimeDays} Days</span>
                    <span className="flex items-center gap-2"><FileText size={12}/> Terms: {sup.paymentTerms}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && supplier && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white dark:bg-brand-surface p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
                 <div className="h-12 w-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold text-xl border border-gray-200 dark:border-neutral-700">
                   {supplier.name.charAt(0)}
                 </div>
                 <div>
                   <div className="font-bold text-gray-900 dark:text-white text-lg">{supplier.name}</div>
                   <div className="text-sm text-gray-500 dark:text-neutral-400 flex items-center gap-3">
                     <span>{supplier.contactPhone}</span>
                     <span className="w-1 h-1 bg-gray-400 dark:bg-neutral-600 rounded-full"></span>
                     <span>{supplier.email}</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => setStep(1)} 
                   className="ml-auto text-sm bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 transition-colors"
                 >
                   Change Supplier
                 </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={18} className="text-brand-red" /> Catalog Items
                </h3>
                {availableItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-100 dark:bg-neutral-900/50 rounded-xl border border-dashed border-gray-300 dark:border-neutral-800">
                    <AlertCircle size={32} className="mx-auto mb-3 text-gray-400 dark:text-neutral-600" />
                    <div className="text-gray-500 dark:text-neutral-400 font-bold">No items found</div>
                    <p className="text-gray-400 dark:text-neutral-600 text-sm">No inventory items are linked to this supplier.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {availableItems.map(item => {
                      const selected = items.find(i => i.itemId === item.id);
                      return (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selected ? 'bg-brand-red/5 border-brand-red' : 'bg-white dark:bg-brand-surface border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600'}`}>
                          <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${selected ? 'bg-brand-red border-brand-red text-white' : 'border-gray-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-900'}`}>
                              {selected && <CheckCircle size={16} />}
                            </div>
                            <div>
                              <div className="text-gray-900 dark:text-white font-bold">{item.name}</div>
                              <div className="text-xs text-gray-500 dark:text-neutral-500 font-mono">{item.costPerUnit.toFixed(3)} KWD / {item.unit}</div>
                            </div>
                          </div>
                          
                          {selected && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                              <label className="text-xs text-gray-500 dark:text-neutral-500 font-bold uppercase mr-1">Qty</label>
                              <div className="flex items-center bg-gray-100 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
                                <input 
                                  type="number" 
                                  min="1"
                                  value={selected.qty}
                                  onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 0)}
                                  className="w-20 bg-transparent text-center text-gray-900 dark:text-white p-2 text-sm focus:outline-none font-mono font-bold"
                                  autoFocus
                                />
                                <span className="text-xs text-gray-500 dark:text-neutral-500 pr-3 bg-gray-100 dark:bg-neutral-900 h-full flex items-center font-bold border-l border-gray-200 dark:border-neutral-800 pl-3">
                                  {item.unit}
                                </span>
                              </div>
                              <div className="w-24 text-right font-mono font-bold text-gray-900 dark:text-white">
                                {(item.costPerUnit * selected.qty).toFixed(3)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
             <div>
               <div className="text-xs text-gray-500 dark:text-neutral-400 font-bold uppercase mb-1">Total Estimated Cost</div>
               <div className="text-3xl font-bold font-mono text-brand-red">{totalCost.toFixed(3)} <span className="text-sm text-gray-500 dark:text-neutral-500">KWD</span></div>
             </div>
             <div className="flex gap-3">
                <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
                  Cancel
                </button>
                <button 
                  disabled={items.length === 0}
                  onClick={() => onSubmit({ supplierId: selectedSupplierId, items, totalCost })}
                  className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${items.length > 0 ? 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-brand-red dark:hover:bg-brand-red hover:text-white shadow-brand-red/20' : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed'}`}
                >
                  <FileText size={18} /> Generate Purchase Order
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Purchasing: React.FC = () => {
  const [view, setView] = useState<ViewMode>('DASHBOARD');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);

  const handleCreatePO = (data: any) => {
    const supplier = suppliers.find(s => s.id === data.supplierId)!;
    const newPO: PurchaseOrder = {
      id: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: 'SENT',
      items: data.items.map((i: any) => {
        const inv = INVENTORY_ITEMS.find(inv => inv.id === i.itemId)!;
        return {
          inventoryItemId: inv.id,
          name: inv.name,
          quantity: i.qty,
          unit: inv.unit,
          unitCost: inv.costPerUnit,
          totalCost: inv.costPerUnit * i.qty
        };
      }),
      totalAmount: data.totalCost,
      createdAt: new Date(),
      requestedBy: 'Manager'
    };
    setOrders(prev => [newPO, ...prev]);
    setShowCreateModal(false);
    setView('ORDERS');
  };

  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers([...suppliers, newSup]);
    setShowAddSupplierModal(false);
  };

  const pendingCount = orders.filter(o => o.status === 'SENT' || o.status === 'PENDING_APPROVAL').length;
  const totalSpend = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black p-6 flex flex-col space-y-6 overflow-y-auto relative">
      {/* Create Modal */}
      {showCreateModal && <CreatePO onCancel={() => setShowCreateModal(false)} onSubmit={handleCreatePO} />}
      {showAddSupplierModal && <AddSupplierModal onClose={() => setShowAddSupplierModal(false)} onSave={handleAddSupplier} />}

      {/* Header & Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Truck className="text-brand-red" /> Purchasing Portal
        </h1>
        <div className="flex bg-gray-200 dark:bg-neutral-900 p-1 rounded-lg border border-gray-300 dark:border-neutral-800">
           <button onClick={() => setView('DASHBOARD')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Overview</button>
           <button onClick={() => setView('ORDERS')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'ORDERS' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Orders</button>
           <button onClick={() => setView('SUPPLIERS')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'SUPPLIERS' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Suppliers</button>
        </div>
        
        {/* Main Action Button */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-brand-red hover:bg-brand-redHover text-white rounded-xl text-base font-bold flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <Truck size={20} /> Create Purchase Order
        </button>
      </div>

      {view === 'DASHBOARD' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="text-gray-500 dark:text-neutral-400 text-sm font-medium mb-1">Pending Orders</div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">{pendingCount}</div>
               <div className="mt-4 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded inline-block border border-yellow-200 dark:border-yellow-900/50">Needs Receiving</div>
             </div>
             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="text-gray-500 dark:text-neutral-400 text-sm font-medium mb-1">Month-to-Date Spend</div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalSpend.toFixed(3)} KWD</div>
               <div className="mt-4 text-xs text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded inline-block border border-green-200 dark:border-green-900/50">Within Budget</div>
             </div>
             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="text-gray-500 dark:text-neutral-400 text-sm font-medium mb-1">Active Suppliers</div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">{suppliers.length}</div>
               <div className="mt-4 text-xs text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded inline-block border border-blue-200 dark:border-blue-900/50">All Operational</div>
             </div>
           </div>

           <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
             <div className="space-y-4">
               {orders.slice(0, 3).map(po => (
                 <div key={po.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="h-12 w-12 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-gray-500 dark:text-neutral-400 border border-gray-300 dark:border-neutral-700">
                       <FileText size={20} />
                     </div>
                     <div>
                       <div className="text-gray-900 dark:text-white font-bold">{po.supplierName}</div>
                       <div className="text-xs text-gray-500 dark:text-neutral-500">PO #{po.id} • {new Date(po.createdAt).toLocaleDateString()}</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="text-right">
                       <div className="text-gray-900 dark:text-white font-mono font-bold">{po.totalAmount.toFixed(3)}</div>
                       <div className="text-xs text-gray-500 dark:text-neutral-500">{po.items.length} Items</div>
                     </div>
                     <StatusBadge status={po.status} />
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {view === 'ORDERS' && (
        <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4 text-right">Total (KWD)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
              {orders.map(po => (
                <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-gray-700 dark:text-neutral-300">
                  <td className="p-4 font-mono text-gray-900 dark:text-white">{po.id}</td>
                  <td className="p-4 font-bold">{po.supplierName}</td>
                  <td className="p-4 text-gray-500 dark:text-neutral-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{po.items.length} items</td>
                  <td className="p-4 text-right font-mono text-gray-900 dark:text-white">{po.totalAmount.toFixed(3)}</td>
                  <td className="p-4 text-center"><StatusBadge status={po.status} /></td>
                  <td className="p-4 text-right">
                     {po.status === 'SENT' && (
                       <button className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded font-bold transition-colors shadow-lg shadow-green-900/20">Receive</button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'SUPPLIERS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="text-sm text-gray-500 dark:text-neutral-400">Total {suppliers.length} active suppliers</div>
             <button 
                onClick={() => setShowAddSupplierModal(true)}
                className="bg-gray-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow transition-all"
             >
                <Plus size={16} /> Add Supplier
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(sup => (
              <div key={sup.id} className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-gray-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 group-hover:bg-white dark:group-hover:bg-brand-surface group-hover:border-brand-red transition-all">
                    {sup.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-200 dark:border-yellow-900/50">
                    <Star size={12} className="fill-yellow-500" /> {sup.rating}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-red transition-colors">{sup.name}</h3>
                <p className="text-gray-500 dark:text-neutral-500 text-sm mb-4">{sup.category}</p>

                <div className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2"><Phone size={14} /> {sup.contactPhone}</div>
                  <div className="flex items-center gap-2"><Mail size={14} /> {sup.email}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> Lead Time: {sup.leadTimeDays} Days</div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-800 flex gap-2">
                  <button className="flex-1 py-2 bg-transparent border border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-500 rounded-lg text-xs font-bold transition-all">History</button>
                  <button 
                    onClick={() => { setShowCreateModal(true); }}
                    className="flex-1 py-2 bg-gray-900 dark:bg-neutral-900 border border-transparent dark:border-neutral-700 text-white hover:bg-brand-red hover:border-brand-red rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Create PO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

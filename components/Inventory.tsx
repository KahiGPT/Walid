import React, { useState, useMemo } from 'react';
import { INVENTORY_ITEMS, RECIPES, MENU_ITEMS, SUPPLIERS, MODIFIER_GROUPS, CATEGORIES } from '../constants';
import { InventoryItem, MenuItem, ModifierGroup, ModifierOption } from '../types';
import { Package, FileText, Settings, AlertTriangle, ArrowRightLeft, TrendingUp, Save, Search, Plus, Trash2, X, Check, ChevronRight, Truck, User, Calendar, Tag, Layers, Edit3, DollarSign, List, Image as ImageIcon, Upload } from 'lucide-react';

// --- Types for Local State ---
interface RecipeIngredient {
  id: string; // unique for the row
  inventoryItemId: string;
  amount: number;
  yieldLoss: number;
}

interface WasteLog {
  id: string;
  date: Date;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: string;
  recordedBy: string;
}

interface InventoryProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// --- SUB-COMPONENTS ---

const AddItemModal = ({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void; 
  onSave: (item: InventoryItem) => void; 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dry Goods',
    unit: 'kg',
    minLevel: '',
    costPerUnit: '',
    supplierId: '',
    image: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.costPerUnit || !formData.supplierId) return;
    
    const supplier = SUPPLIERS.find(s => s.id === formData.supplierId);
    
    const newItem: InventoryItem = {
      id: `i-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      currentStock: 0,
      minLevel: parseFloat(formData.minLevel) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
      supplier: supplier ? supplier.name : 'Unknown',
      supplierId: formData.supplierId,
      image: formData.image
    };
    
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="text-brand-red" /> Add New Item
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Item Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Olive Oil"
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Category</label>
                <select 
                   value={formData.category}
                   onChange={(e) => setFormData({...formData, category: e.target.value})}
                   className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                >
                   <option>Dry Goods</option>
                   <option>Protein</option>
                   <option>Vegetables</option>
                   <option>Fruit</option>
                   <option>Dairy</option>
                   <option>Beverages</option>
                   <option>Disposable</option>
                   <option>Cleaning</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Unit</label>
                <input 
                  type="text" 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="kg, pcs, L"
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Item Image</label>
            <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl h-32 bg-gray-50 dark:bg-neutral-900/50 hover:border-brand-red transition-all overflow-hidden cursor-pointer">
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={(e) => { e.preventDefault(); setFormData(prev => ({...prev, image: ''})); }} className="p-2 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-brand-red">
                  <Upload size={24} />
                  <span className="text-xs font-bold mt-2">Click to upload image</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Cost/Unit</label>
                <input 
                  type="number" 
                  step="0.001"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({...formData, costPerUnit: e.target.value})}
                  placeholder="0.000"
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Min Level</label>
                <input 
                  type="number" 
                  value={formData.minLevel}
                  onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono"
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Supplier</label>
            <div className="relative">
               <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
               <select 
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-3 pl-10 pr-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
               >
                  <option value="">-- Select Supplier --</option>
                  {SUPPLIERS.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
               </select>
            </div>
          </div>

          <button 
            disabled={!formData.name || !formData.costPerUnit || !formData.supplierId}
            onClick={handleSubmit}
            className="w-full py-3 bg-brand-red hover:bg-brand-redHover disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 mt-4 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Create Item
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuManager = ({ 
  items, 
  groups, 
  onSaveItem, 
  onNotify 
}: { 
  items: MenuItem[], 
  groups: ModifierGroup[], 
  onSaveItem: (item: MenuItem) => void, 
  onNotify: (msg: string, type: any) => void 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0].id);
  const [formImage, setFormImage] = useState('');
  const [formModifiers, setFormModifiers] = useState<string[]>([]);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormCost(item.cost.toString());
    setFormCategory(item.categoryId);
    setFormImage(item.image || '');
    setFormModifiers(item.modifierGroupIds || []);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormName('');
    setFormPrice('');
    setFormCost('');
    setFormCategory(CATEGORIES[0].id);
    setFormImage('');
    setFormModifiers([]);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const save = () => {
    if (!formName || !formPrice) return;
    
    const newItem: MenuItem = {
      id: editingItem ? editingItem.id : `menu-${Date.now()}`,
      name: formName,
      price: parseFloat(formPrice),
      cost: parseFloat(formCost) || 0,
      categoryId: formCategory,
      image: formImage,
      modifierGroupIds: formModifiers
    };
    
    onSaveItem(newItem);
    setShowModal(false);
    onNotify(editingItem ? 'Menu item updated' : 'Menu item created', 'success');
  };

  const toggleModifier = (id: string) => {
    setFormModifiers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center">
         <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
            <input type="text" placeholder="Search menu..." className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-red" />
         </div>
         <button onClick={handleCreate} className="bg-brand-red hover:bg-brand-redHover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20">
            <Plus size={18} /> New Dish
         </button>
      </div>

      <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
            <tr>
              <th className="p-4">Dish Name</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Cost</th>
              <th className="p-4 text-center">Modifiers</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-700 dark:text-neutral-300 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-400 dark:text-neutral-500">
                            <ImageIcon size={18} />
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {CATEGORIES.find(c => c.id === item.categoryId)?.name}
                </td>
                <td className="p-4 text-right font-mono text-gray-900 dark:text-white">{item.price.toFixed(3)}</td>
                <td className="p-4 text-right font-mono text-gray-500 dark:text-neutral-500">{item.cost.toFixed(3)}</td>
                <td className="p-4 text-center">
                  <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs text-gray-600 dark:text-neutral-400">
                    {item.modifierGroupIds?.length || 0} Groups
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface w-full max-w-lg rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingItem ? 'Edit Dish' : 'New Dish'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Dish Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Category</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Dish Image</label>
                <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl h-40 bg-gray-50 dark:bg-neutral-900/50 hover:border-brand-red transition-all overflow-hidden cursor-pointer">
                  {formImage ? (
                    <>
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={(e) => { e.preventDefault(); setFormImage(''); }} className="p-3 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><Trash2 size={24}/></button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-brand-red">
                      <Upload size={32} />
                      <span className="text-sm font-bold mt-2">Click to upload dish image</span>
                      <p className="text-[10px] uppercase mt-1 opacity-60">Aspect Ratio 1:1 Recommended</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Price (KWD)</label>
                  <input type="number" step="0.050" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Cost (KWD)</label>
                  <input type="number" step="0.001" value={formCost} onChange={e => setFormCost(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-3 uppercase tracking-wider">Linked Modifier Groups</label>
                <div className="flex flex-wrap gap-2">
                  {groups.map(grp => (
                    <button 
                      key={grp.id}
                      onClick={() => toggleModifier(grp.id)}
                      className={`px-6 py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                        formModifiers.includes(grp.id) 
                          ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white bg-transparent' 
                          : 'border-transparent bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-500 hover:bg-gray-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {grp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end gap-3">
               <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
               <button onClick={save} className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20">Save Dish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModifierManager = ({ 
  groups, 
  onSaveGroup, 
  onNotify 
}: { 
  groups: ModifierGroup[], 
  onSaveGroup: (grp: ModifierGroup) => void, 
  onNotify: (msg: string, type: any) => void 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formMin, setFormMin] = useState(0);
  const [formMax, setFormMax] = useState(1);
  const [formOptions, setFormOptions] = useState<ModifierOption[]>([]);
  
  // Option Entry
  const [optName, setOptName] = useState('');
  const [optPrice, setOptPrice] = useState('');

  const handleEdit = (group: ModifierGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormMin(group.minSelection);
    setFormMax(group.maxSelection);
    setFormOptions([...group.options]);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setFormName('');
    setFormMin(0);
    setFormMax(1);
    setFormOptions([]);
    setShowModal(true);
  };

  const addOption = () => {
    if (!optName) return;
    const newOpt: ModifierOption = {
      id: `opt-${Date.now()}`,
      name: optName,
      price: parseFloat(optPrice) || 0
    };
    setFormOptions([...formOptions, newOpt]);
    setOptName('');
    setOptPrice('');
  };

  const removeOption = (id: string) => {
    setFormOptions(formOptions.filter(o => o.id !== id));
  };

  const save = () => {
    if (!formName) return;
    const newGroup: ModifierGroup = {
      id: editingGroup ? editingGroup.id : `mg-${Date.now()}`,
      name: formName,
      minSelection: formMin,
      maxSelection: formMax,
      options: formOptions
    };
    onSaveGroup(newGroup);
    setShowModal(false);
    onNotify(editingGroup ? 'Modifier group updated' : 'Modifier group created', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-end">
         <button onClick={handleCreate} className="bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg border border-gray-200 dark:border-transparent">
            <Plus size={18} /> New Modifier Group
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-5 hover:border-gray-400 dark:hover:border-neutral-600 transition-colors group shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white text-lg">{group.name}</h3>
                   <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">Select: {group.minSelection} - {group.maxSelection}</div>
                </div>
                <button onClick={() => handleEdit(group)} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white p-1"><Edit3 size={16}/></button>
             </div>
             
             <div className="space-y-2">
                {group.options.slice(0, 4).map(opt => (
                  <div key={opt.id} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-neutral-900/50 rounded-lg">
                     <span className="text-gray-700 dark:text-neutral-300">{opt.name}</span>
                     <span className="text-brand-red font-mono">{opt.price > 0 ? `+${opt.price.toFixed(3)}` : 'Free'}</span>
                  </div>
                ))}
                {group.options.length > 4 && (
                  <div className="text-center text-xs text-gray-500 dark:text-neutral-600 italic pt-1">
                    +{group.options.length - 4} more options
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface w-full max-w-lg rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingGroup ? 'Edit Modifier Group' : 'New Modifier Group'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Group Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" placeholder="e.g. Pizza Toppings" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Min Selection</label>
                  <input type="number" value={formMin} onChange={e => setFormMin(parseInt(e.target.value))} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Max Selection</label>
                  <input type="number" value={formMax} onChange={e => setFormMax(parseInt(e.target.value))} className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-3 uppercase tracking-wider">Options</label>
                
                <div className="flex gap-2 mb-3">
                   <input type="text" value={optName} onChange={e => setOptName(e.target.value)} className="flex-[2] bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:border-brand-red outline-none" placeholder="Option Name" />
                   <input type="number" value={optPrice} onChange={e => setOptPrice(e.target.value)} className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:border-brand-red outline-none" placeholder="Price" />
                   <button onClick={addOption} disabled={!optName} className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-white dark:hover:text-black text-gray-600 dark:text-white px-3 rounded-lg"><Plus size={18}/></button>
                </div>

                <div className="space-y-2 bg-gray-100 dark:bg-neutral-900 rounded-xl p-2 min-h-[150px] border border-gray-200 dark:border-transparent">
                   {formOptions.length === 0 && <div className="text-center text-xs text-gray-500 dark:text-neutral-600 py-4">No options added yet</div>}
                   {formOptions.map(opt => (
                     <div key={opt.id} className="flex justify-between items-center p-2 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 group shadow-sm">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{opt.name}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-xs text-gray-500 dark:text-neutral-400 font-mono">{opt.price.toFixed(3)}</span>
                           <button onClick={() => removeOption(opt.id)} className="text-gray-400 dark:text-neutral-600 hover:text-red-500"><X size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end gap-3">
               <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
               <button onClick={save} className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20">Save Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LogWasteModal = ({ 
  inventory, 
  onClose, 
  onConfirm 
}: { 
  inventory: InventoryItem[]; 
  onClose: () => void; 
  onConfirm: (log: Omit<WasteLog, 'id' | 'date' | 'cost' | 'itemName' | 'unit'>) => void; 
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('Expired');
  const [recordedBy, setRecordedBy] = useState<string>('');

  const selectedItem = inventory.find(i => i.id === selectedId);
  const estimatedLoss = selectedItem && quantity ? (selectedItem.costPerUnit * parseFloat(quantity)) : 0;

  const handleSubmit = () => {
    if (selectedId && quantity && recordedBy) {
      onConfirm({
        itemId: selectedId,
        quantity: parseFloat(quantity),
        reason,
        recordedBy
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="text-brand-red" /> Log Waste
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Item</label>
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
            >
              <option value="">-- Select Item --</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Current: {item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Quantity</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono"
                />
                {selectedItem && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500 text-xs font-bold">
                    {selectedItem.unit}
                  </span>
                )}
              </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Reason</label>
               <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
               >
                  <option>Expired</option>
                  <option>Damaged</option>
                  <option>Preparation Error</option>
                  <option>Spilled</option>
                  <option>Quality Check</option>
                  <option>Other</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Recorded By</label>
            <div className="relative">
               <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
               <input 
                 type="text" 
                 value={recordedBy}
                 onChange={(e) => setRecordedBy(e.target.value)}
                 placeholder="Staff Name"
                 className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-3 pl-10 pr-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
               />
            </div>
          </div>

          {selectedItem && quantity && (
             <div className="bg-red-100 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-3 flex justify-between items-center mt-2">
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">Estimated Loss</span>
                <span className="text-red-700 dark:text-white font-mono font-bold">{estimatedLoss.toFixed(3)} KWD</span>
             </div>
          )}

          <button 
            disabled={!selectedId || !quantity || !recordedBy}
            onClick={handleSubmit}
            className="w-full py-3 bg-brand-red hover:bg-brand-redHover disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 mt-4"
          >
            Confirm Waste Log
          </button>
        </div>
      </div>
    </div>
  );
};

const WasteLogView = ({ inventory, onNotify }: { inventory: InventoryItem[], onNotify: (msg: string, type: any) => void }) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([
    { id: 'w1', date: new Date(Date.now() - 86400000), itemId: 'i5', itemName: 'Tomatoes', quantity: 2.5, unit: 'kg', cost: 1.000, reason: 'Spoiled', recordedBy: 'Chef Hassan' },
    { id: 'w2', date: new Date(Date.now() - 172800000), itemId: 'i2', itemName: 'Whole Chicken', quantity: 1, unit: 'pcs', cost: 1.100, reason: 'Dropped', recordedBy: 'Ahmed A.' },
  ]);

  const handleAddLog = (data: Omit<WasteLog, 'id' | 'date' | 'cost' | 'itemName' | 'unit'>) => {
    const item = inventory.find(i => i.id === data.itemId);
    if (!item) return;

    const newLog: WasteLog = {
      id: `w-${Date.now()}`,
      date: new Date(),
      itemId: data.itemId,
      itemName: item.name,
      quantity: data.quantity,
      unit: item.unit,
      cost: item.costPerUnit * data.quantity,
      reason: data.reason,
      recordedBy: data.recordedBy
    };

    setWasteLogs(prev => [newLog, ...prev]);
    setShowLogModal(false);
    onNotify('Waste logged successfully.', 'success');
  };

  const totalWasteValue = wasteLogs.reduce((acc, log) => acc + log.cost, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {showLogModal && (
        <LogWasteModal 
          inventory={inventory}
          onClose={() => setShowLogModal(false)}
          onConfirm={handleAddLog}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-brand-surface p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-500"><TrendingUp size={20} /></div>
               <span className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">MTD</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalWasteValue.toFixed(3)} KWD</div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Total Waste Value</div>
         </div>
         <div className="bg-white dark:bg-brand-surface p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400"><AlertTriangle size={20} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Spoiled</div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Top Reason</div>
         </div>
         <div className="bg-white dark:bg-brand-surface p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400"><Package size={20} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Tomatoes</div>
            <div className="text-xs text-gray-500 dark:text-neutral-400">Most Wasted Item</div>
         </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col h-[500px] shadow-sm">
         <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Waste Log History</h3>
            <button 
              onClick={() => setShowLogModal(true)}
              className="bg-brand-red hover:bg-brand-redHover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20"
            >
               <Trash2 size={16} /> Log Waste
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 font-medium sticky top-0">
                  <tr>
                     <th className="p-4">Date</th>
                     <th className="p-4">Item</th>
                     <th className="p-4">Reason</th>
                     <th className="p-4">Recorded By</th>
                     <th className="p-4 text-right">Quantity</th>
                     <th className="p-4 text-right">Cost Loss</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {wasteLogs.map(log => (
                     <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-gray-700 dark:text-neutral-300">
                        <td className="p-4 text-gray-500 dark:text-neutral-500">
                           <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {log.date.toLocaleDateString()}
                           </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{log.itemName}</td>
                        <td className="p-4">
                           <span className="bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-2 py-1 rounded text-xs">
                              {log.reason}
                           </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-neutral-400">{log.recordedBy}</td>
                        <td className="p-4 text-right font-mono text-gray-900 dark:text-white">
                           {log.quantity} <span className="text-gray-500 dark:text-neutral-500 text-xs">{log.unit}</span>
                        </td>
                        <td className="p-4 text-right font-mono text-red-500 dark:text-red-400 font-bold">
                           -{log.cost.toFixed(3)}
                        </td>
                     </tr>
                  ))}
                  {wasteLogs.length === 0 && (
                     <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-neutral-500 italic">
                           No waste records found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const ReceiveStockModal = ({ 
  inventory, 
  onClose, 
  onConfirm 
}: { 
  inventory: InventoryItem[]; 
  onClose: () => void; 
  onConfirm: (itemId: string, qty: number) => void; 
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [qty, setQty] = useState<string>('');

  const handleConfirm = () => {
    if (selectedId && parseFloat(qty) > 0) {
      onConfirm(selectedId, parseFloat(qty));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-brand-red" /> Receive Stock
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Select Item</label>
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
            >
              <option value="">-- Choose Item --</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Quantity Received</label>
            <div className="relative">
              <input 
                type="number" 
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono"
              />
              {selectedId && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500 text-sm font-bold">
                  {inventory.find(i => i.id === selectedId)?.unit}
                </span>
              )}
            </div>
          </div>

          <button 
            disabled={!selectedId || !qty}
            onClick={handleConfirm}
            className="w-full py-3 bg-brand-red hover:bg-brand-redHover disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 mt-4"
          >
            Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

const TransferModal = ({ 
  inventory, 
  onClose, 
  onConfirm 
}: { 
  inventory: InventoryItem[]; 
  onClose: () => void; 
  onConfirm: (itemId: string, qty: number, toLocation: string) => void; 
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('Kitchen');

  const handleConfirm = () => {
    if (selectedId && parseFloat(qty) > 0) {
      onConfirm(selectedId, parseFloat(qty), toLocation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="text-gray-400 dark:text-neutral-400" /> Internal Transfer
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Item to Transfer</label>
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
            >
              <option value="">-- Choose Item --</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">From Location</label>
                <div className="w-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-gray-500 dark:text-neutral-400 text-sm cursor-not-allowed">
                  Main Storage
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">To Location</label>
                <select 
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
                >
                  <option value="Kitchen">Main Kitchen</option>
                  <option value="Bar">Beverage Bar</option>
                  <option value="Patio">Patio Station</option>
                </select>
             </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Quantity</label>
            <div className="relative">
              <input 
                type="number" 
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono text-sm"
              />
              {selectedId && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500 text-sm font-bold">
                  {inventory.find(i => i.id === selectedId)?.unit}
                </span>
              )}
            </div>
          </div>

          <button 
            disabled={!selectedId || !qty}
            onClick={handleConfirm}
            className="w-full py-3 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-500 text-white dark:text-black rounded-lg font-bold transition-all mt-4"
          >
            Transfer Stock
          </button>
        </div>
      </div>
    </div>
  );
};

const AdjustStockModal = ({ 
  item, 
  onClose, 
  onSave 
}: { 
  item: InventoryItem; 
  onClose: () => void; 
  onSave: (id: string, newStock: number) => void; 
}) => {
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [reason, setReason] = useState('Purchase');

  const newStock = item.currentStock + adjustAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-brand-surface w-full max-sm rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Adjust Stock</h3>
        <p className="text-gray-500 dark:text-neutral-400 text-sm mb-6">{item.name} • Current: {item.currentStock} {item.unit}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Adjustment Amount (+/-)</label>
            <div className="flex gap-2">
               <input 
                 type="number" 
                 value={adjustAmount} 
                 onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                 className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono"
                 autoFocus
               />
               <div className="bg-gray-100 dark:bg-neutral-800 flex items-center px-4 rounded-lg text-gray-600 dark:text-neutral-400 text-sm font-bold border border-gray-200 dark:border-neutral-700">
                 {item.unit}
               </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Reason</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
            >
              <option>Purchase / Delivery</option>
              <option>Waste / Spoilage</option>
              <option>Inventory Correction</option>
              <option>Transfer</option>
            </select>
          </div>

          <div className="bg-gray-100 dark:bg-neutral-900/50 p-3 rounded-lg flex justify-between items-center border border-gray-200 dark:border-neutral-800">
             <span className="text-sm text-gray-600 dark:text-neutral-400 font-medium">New Stock Level</span>
             <span className={`font-mono font-bold ${newStock < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{newStock} {item.unit}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
          <button onClick={() => onSave(item.id, newStock)} className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold hover:bg-black dark:hover:bg-neutral-200 shadow-lg">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const StockTable: React.FC<{ items: InventoryItem[], onAdjust: (item: InventoryItem) => void }> = ({ items, onAdjust }) => (
  <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
        <tr>
          <th className="p-4">Item Name</th>
          <th className="p-4">Supplier</th>
          <th className="p-4 text-right">Stock Level</th>
          <th className="p-4 text-right">Unit Cost</th>
          <th className="p-4 text-right">Total Value</th>
          <th className="p-4 text-center">Status</th>
          <th className="p-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
        {items.map((item) => {
          const isLow = item.currentStock <= item.minLevel;
          return (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-700 dark:text-neutral-300 transition-colors group">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700" />
                  ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-400 dark:text-neutral-500">
                          <Package size={18} />
                      </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="text-xs text-gray-500 dark:text-neutral-500">{item.category}</div>
                       {isLow && <Tag size={12} className="text-red-500" />}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-600 dark:text-neutral-400">{item.supplier}</td>
              <td className="p-4 text-right font-mono">
                {item.currentStock} <span className="text-gray-500 dark:text-neutral-500 text-xs">{item.unit}</span>
              </td>
              <td className="p-4 text-right font-mono text-gray-500 dark:text-neutral-400">{item.costPerUnit.toFixed(3)}</td>
              <td className="p-4 text-right font-mono text-gray-900 dark:text-white">{(item.currentStock * item.costPerUnit).toFixed(3)}</td>
              <td className="p-4 text-center">
                {isLow ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 text-[10px] font-bold uppercase border border-red-200 dark:border-red-900 tracking-wider">
                    <AlertTriangle size={10} /> Low
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 text-[10px] font-bold uppercase border border-green-200 dark:border-green-900 tracking-wider">
                    OK
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => onAdjust(item)}
                  className="text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-xs font-bold transition-colors"
                >
                  Adjust
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const RecipeBuilder: React.FC<{ inventory: InventoryItem[], onNotify: (msg: string, type: any) => void }> = ({ inventory, onNotify }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(MENU_ITEMS[0].id);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

  // Initialize with dummy data if switching items (simulation)
  React.useEffect(() => {
    const existing = RECIPES.find(r => r.menuItemId === selectedItemId);
    if (existing) {
      setIngredients(existing.ingredients.map((ing, idx) => ({
        id: `local-${idx}`,
        inventoryItemId: ing.inventoryItemId,
        amount: ing.amount,
        yieldLoss: ing.yieldLoss
      })));
    } else {
      setIngredients([]);
    }
  }, [selectedItemId]);

  const selectedItem = MENU_ITEMS.find(i => i.id === selectedItemId);
  
  const handleAddIngredient = (invItemId: string) => {
    setIngredients(prev => [
      ...prev, 
      { id: Math.random().toString(), inventoryItemId: invItemId, amount: 1, yieldLoss: 0 }
    ]);
    setIsAddingIngredient(false);
  };

  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: number) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = () => {
    onNotify(`Recipe for ${selectedItem?.name} updated successfully.`, 'success');
  };

  // Calculations
  const totalCost = ingredients.reduce((sum, ing) => {
    const invItem = inventory.find(i => i.id === ing.inventoryItemId);
    if (!invItem) return sum;
    const yieldFactor = 1 - (ing.yieldLoss / 100);
    const cost = (invItem.costPerUnit * ing.amount) / (yieldFactor || 1);
    return sum + cost;
  }, 0);

  const foodCostPercent = selectedItem ? (totalCost / selectedItem.price) * 100 : 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Sidebar: Menu Selector */}
      <div className="lg:col-span-3 bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-4 flex flex-col h-full overflow-hidden shadow-sm">
        <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-xs">Select Dish</h3>
        <div className="relative mb-4">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
           <input 
             type="text" 
             placeholder="Search menu..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-neutral-500"
           />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          {MENU_ITEMS
            .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(item => (
            <button 
              key={item.id} 
              onClick={() => setSelectedItemId(item.id)}
              className={`w-full text-left p-3 rounded-lg flex justify-between items-center group transition-all ${selectedItemId === item.id ? 'bg-gray-100 dark:bg-neutral-800 border-l-2 border-brand-red shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50 border-l-2 border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                 {item.image ? (
                    <img src={item.image} className="w-8 h-8 rounded object-cover bg-gray-200 dark:bg-neutral-900" />
                 ) : (
                    <div className="w-8 h-8 rounded bg-gray-200 dark:bg-neutral-900 flex items-center justify-center text-gray-500 dark:text-neutral-500"><ImageIcon size={14}/></div>
                 )}
                 <div>
                    <div className={`text-sm font-medium ${selectedItemId === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'}`}>{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-neutral-600 font-mono">{item.price.toFixed(3)} KWD</div>
                 </div>
              </div>
              {selectedItemId === item.id && <ChevronRight size={14} className="text-brand-red" />}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Editor */}
      <div className="lg:col-span-9 bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col h-full overflow-hidden relative shadow-sm">
        {selectedItem && (
          <>
            {/* Header Stats */}
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  {selectedItem.name} 
                  <span className="text-sm font-normal text-gray-600 dark:text-neutral-500 bg-gray-200 dark:bg-neutral-800 px-2 py-1 rounded font-mono">{MENU_ITEMS.find(m => m.id === selectedItemId)?.price.toFixed(3)} KWD</span>
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1 font-medium">Configure recipe ingredients to calculate Food Cost.</p>
              </div>
              
              <div className="flex gap-4">
                 <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold tracking-widest">Total Cost</div>
                    <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">{totalCost.toFixed(3)}</div>
                 </div>
                 <div className="w-px bg-gray-300 dark:bg-neutral-700 h-10"></div>
                 <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold tracking-widest">Food Cost %</div>
                    <div className={`text-xl font-bold font-mono ${foodCostPercent > 35 ? 'text-red-500' : foodCostPercent > 28 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {foodCostPercent.toFixed(1)}%
                    </div>
                 </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-inner">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 font-bold uppercase tracking-tighter text-[10px]">
                    <tr>
                      <th className="p-3 text-left">Ingredient</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3 text-center">Qty / Unit</th>
                      <th className="p-3 text-center">Yield Loss %</th>
                      <th className="p-3 text-right">Net Cost</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-800 text-gray-700 dark:text-neutral-300">
                    {ingredients.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-neutral-500 italic">
                           No ingredients added yet. Click "Add Ingredient" to start.
                        </td>
                      </tr>
                    )}
                    {ingredients.map(ing => {
                      const invItem = inventory.find(i => i.id === ing.inventoryItemId);
                      if (!invItem) return null;
                      
                      const yieldFactor = 1 - (ing.yieldLoss / 100);
                      const netCost = (invItem.costPerUnit * ing.amount) / (yieldFactor || 1);

                      return (
                        <tr key={ing.id} className="hover:bg-gray-100 dark:hover:bg-neutral-800/30 group">
                          <td className="p-3 font-bold text-gray-900 dark:text-white">
                             {invItem.name}
                          </td>
                          <td className="p-3 text-right font-mono text-gray-500 dark:text-neutral-500">
                             {invItem.costPerUnit.toFixed(3)}
                          </td>
                          <td className="p-3">
                             <div className="flex items-center justify-center gap-2">
                                <input 
                                  type="number" 
                                  min="0"
                                  step="0.01"
                                  value={ing.amount}
                                  onChange={(e) => updateIngredient(ing.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-20 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded p-1 text-center text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono font-bold"
                                />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-500 w-8 uppercase">{invItem.unit}</span>
                             </div>
                          </td>
                          <td className="p-3">
                             <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  value={ing.yieldLoss}
                                  onChange={(e) => updateIngredient(ing.id, 'yieldLoss', parseFloat(e.target.value) || 0)}
                                  className={`w-16 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded p-1 text-center focus:border-brand-red outline-none font-mono ${ing.yieldLoss > 0 ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-white'}`}
                                />
                                <span className="text-xs text-gray-500 dark:text-neutral-500">%</span>
                             </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                             {netCost.toFixed(3)}
                          </td>
                          <td className="p-3 text-center">
                             <button onClick={() => removeIngredient(ing.id)} className="text-gray-400 dark:text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 dark:bg-neutral-800/30 font-bold border-t border-gray-200 dark:border-neutral-700">
                      <td colSpan={4} className="p-4 text-right text-gray-900 dark:text-white font-bold uppercase tracking-widest text-xs">Total Net Recipe Cost</td>
                      <td className="p-4 text-right text-brand-red font-mono text-lg">{totalCost.toFixed(3)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <button 
                onClick={() => setIsAddingIngredient(true)}
                className="mt-4 w-full py-4 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 font-bold"
              >
                <Plus size={18} /> Add Ingredient
              </button>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-3">
               <button className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800">Discard Changes</button>
               <button 
                 onClick={handleSave}
                 className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover flex items-center gap-2 shadow-lg shadow-red-900/20"
               >
                 <Save size={18} /> Save Recipe Formulation
               </button>
            </div>

            {/* Ingredient Selector Modal Overlay */}
            {isAddingIngredient && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col animate-in fade-in duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                     <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Choose Ingredient</h3>
                     <button onClick={() => setIsAddingIngredient(false)} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                     <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
                        <input type="text" placeholder="Search inventory catalog..." className="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-red" autoFocus />
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-100/50 dark:bg-black/50 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {inventory.map(item => (
                           <button 
                             key={item.id}
                             onClick={() => handleAddIngredient(item.id)}
                             className="text-left bg-white dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-brand-red dark:hover:border-brand-red hover:shadow-md transition-all group"
                           >
                              <div className="flex items-center gap-3">
                                 {item.image ? (
                                    <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700" />
                                 ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-400 dark:text-neutral-500"><ImageIcon size={18}/></div>
                                 )}
                                 <div>
                                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-brand-red text-sm">{item.name}</div>
                                    <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase tracking-tight">{item.currentStock} {item.unit} in stock • {item.costPerUnit.toFixed(3)} KWD</div>
                                 </div>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const Inventory: React.FC<InventoryProps> = ({ onNotify }) => {
  const [tab, setTab] = useState<'STOCK' | 'RECIPES' | 'WASTE' | 'MENU'>('STOCK');
  const [menuSubTab, setMenuSubTab] = useState<'ITEMS' | 'MODIFIERS'>('ITEMS');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(MODIFIER_GROUPS);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  
  // New State for Global Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const handleAdjustStock = (id: string, newStock: number) => {
    setInventoryItems(prev => prev.map(i => i.id === id ? { ...i, currentStock: newStock } : i));
    setAdjustItem(null);
    onNotify('Stock level synchronized successfully.', 'success');
  };

  const handleReceiveStock = (itemId: string, qty: number) => {
    setInventoryItems(prev => prev.map(i => i.id === itemId ? { ...i, currentStock: i.currentStock + qty } : i));
    setShowReceiveModal(false);
    onNotify('Stock intake recorded successfully.', 'success');
  };

  const handleTransferStock = (itemId: string, qty: number, toLocation: string) => {
    setInventoryItems(prev => prev.map(i => i.id === itemId ? { ...i, currentStock: Math.max(0, i.currentStock - qty) } : i));
    setShowTransferModal(false);
    onNotify(`Internal stock transfer to ${toLocation} complete.`, 'success');
  };

  const handleAddItem = (item: InventoryItem) => {
    setInventoryItems(prev => [...prev, item]);
    setShowAddItemModal(false);
    onNotify('New SKU added to inventory master.', 'success');
  };

  const handleSaveMenuItem = (item: MenuItem) => {
    setMenuItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
            return prev.map(i => i.id === item.id ? item : i);
        }
        return [...prev, item];
    });
  };

  const handleSaveModifierGroup = (group: ModifierGroup) => {
    setModifierGroups(prev => {
        const existing = prev.find(g => g.id === group.id);
        if (existing) {
            return prev.map(g => g.id === group.id ? group : g);
        }
        return [...prev, group];
    });
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black p-6 space-y-6 overflow-y-auto">
      {/* Modals */}
      {adjustItem && (
        <AdjustStockModal 
          item={adjustItem} 
          onClose={() => setAdjustItem(null)} 
          onSave={handleAdjustStock} 
        />
      )}

      {showReceiveModal && (
        <ReceiveStockModal 
          inventory={inventoryItems}
          onClose={() => setShowReceiveModal(false)}
          onConfirm={handleReceiveStock}
        />
      )}

      {showTransferModal && (
        <TransferModal 
          inventory={inventoryItems}
          onClose={() => setShowTransferModal(false)}
          onConfirm={handleTransferStock}
        />
      )}

      {showAddItemModal && (
        <AddItemModal 
          onClose={() => setShowAddItemModal(false)} 
          onSave={handleAddItem} 
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Back of House Operations</h1>
        <div className="flex bg-white dark:bg-neutral-900 p-1 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
          <button onClick={() => setTab('STOCK')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${tab === 'STOCK' ? 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
            <Package size={16} /> Inventory
          </button>
          <button onClick={() => setTab('RECIPES')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${tab === 'RECIPES' ? 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
            <FileText size={16} /> Recipes
          </button>
          <button onClick={() => setTab('MENU')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${tab === 'MENU' ? 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
            <List size={16} /> Menu
          </button>
          <button onClick={() => setTab('WASTE')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${tab === 'WASTE' ? 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
            <Trash2 size={16} /> Waste
          </button>
        </div>
      </div>

      <div className="min-h-[500px]">
        {tab === 'STOCK' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex flex-wrap gap-4 mb-4">
               <button 
                onClick={() => setShowAddItemModal(true)}
                className="bg-brand-red hover:bg-brand-redHover text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all"
               >
                 <Plus size={18} /> New SKU
               </button>
               <button 
                onClick={() => setShowReceiveModal(true)}
                className="bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold border border-gray-300 dark:border-neutral-700 shadow-sm active:scale-95 transition-all"
               >
                 <Package size={18} /> Intake Stock
               </button>
               <button 
                onClick={() => setShowTransferModal(true)}
                className="bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold border border-gray-300 dark:border-neutral-700 shadow-sm active:scale-95 transition-all"
               >
                 <ArrowRightLeft size={18} /> Transfer
               </button>
             </div>
             <StockTable items={inventoryItems} onAdjust={setAdjustItem} />
          </div>
        )}
        
        {tab === 'MENU' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex bg-white dark:bg-neutral-900 p-1 rounded-lg border border-gray-200 dark:border-neutral-800 w-fit mb-4">
                 <button onClick={() => setMenuSubTab('ITEMS')} className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${menuSubTab === 'ITEMS' ? 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Dishes & Items</button>
                 <button onClick={() => setMenuSubTab('MODIFIERS')} className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${menuSubTab === 'MODIFIERS' ? 'bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Modifier Config</button>
              </div>
              
              {menuSubTab === 'ITEMS' ? (
                 <MenuManager items={menuItems} groups={modifierGroups} onSaveItem={handleSaveMenuItem} onNotify={onNotify} />
              ) : (
                 <ModifierManager groups={modifierGroups} onSaveGroup={handleSaveModifierGroup} onNotify={onNotify} />
              )}
           </div>
        )}

        {tab === 'RECIPES' && <RecipeBuilder inventory={inventoryItems} onNotify={onNotify} />}
        {tab === 'WASTE' && <WasteLogView inventory={inventoryItems} onNotify={onNotify} />}
      </div>
    </div>
  );
};
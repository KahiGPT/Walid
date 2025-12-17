
import React, { useState, useEffect } from 'react';
import { KDS_TICKETS } from '../constants';
import { Order, OrderStatus, OrderType } from '../types';
import { Clock, CheckCircle, ChefHat, AlertCircle, Utensils, ShoppingBag, Truck } from 'lucide-react';

interface TicketCardProps {
  order: Order;
  onBump: (id: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ order, onBump }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      setElapsed(Math.floor((new Date().getTime() - order.timestamp.getTime()) / 1000 / 60));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, [order.timestamp]);

  let statusColor = 'bg-green-600'; // < 10 mins
  if (elapsed >= 10) statusColor = 'bg-yellow-600'; // 10-20 mins
  if (elapsed >= 20) statusColor = 'bg-red-600'; // > 20 mins

  const OrderIcon = {
    [OrderType.DINE_IN]: Utensils,
    [OrderType.TAKEAWAY]: ShoppingBag,
    [OrderType.DELIVERY]: Truck
  }[order.type];

  return (
    <div className="flex-shrink-0 w-80 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden flex flex-col h-[450px] shadow-lg animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className={`${statusColor} p-3 flex justify-between items-center text-white shadow-sm`}>
        <div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <OrderIcon size={18} />
            <span>#{order.id.split('-')[1]}</span>
          </div>
          <div className="text-xs opacity-90 font-medium">{order.type} • {order.table || order.staffName}</div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-xl flex items-center gap-1">
             <Clock size={16} /> {elapsed}m
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{order.status}</div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-brand-surface/50">
        {order.items.map((item, idx) => (
          <div key={idx} className="border-b border-gray-200 dark:border-neutral-700/50 pb-3 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white font-bold px-2 py-0.5 rounded text-lg border border-gray-300 dark:border-neutral-700">
                {item.quantity}
              </span>
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{item.name}</div>
                <div className="text-gray-500 dark:text-neutral-500 text-xs mt-0.5" dir="rtl">{item.nameAr}</div>
                
                {/* Modifiers */}
                {item.modifiers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.modifiers.map(m => (
                      <span key={m.id} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded">
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
                {/* Notes */}
                {item.notes && (
                  <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-500 font-medium bg-yellow-100 dark:bg-yellow-900/10 px-2 py-1 rounded inline-block border border-yellow-200 dark:border-yellow-900/20">
                    Note: {item.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Action */}
      <div className="p-3 bg-gray-100 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
        <button 
          onClick={() => onBump(order.id)}
          className="w-full py-4 rounded-lg bg-white dark:bg-neutral-800 hover:bg-brand-red hover:text-white border border-gray-300 dark:border-neutral-700 hover:border-brand-red text-gray-700 dark:text-neutral-400 font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
          {order.status === OrderStatus.PENDING ? (
            <>
              <ChefHat size={20} className="group-hover:animate-bounce" /> Start Cooking
            </>
          ) : (
            <>
              <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> BUMP TICKET
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface KDSProps {
  tickets?: Order[];
  onBump?: (id: string) => void;
}

export const KDS: React.FC<KDSProps> = ({ tickets = KDS_TICKETS, onBump }) => {
  // Use passed props, fallback to constants for standalone viewing (though App controls state now)
  const activeTickets = tickets; 
  const [filter, setFilter] = useState<'ALL' | OrderType>('ALL');

  const filteredTickets = filter === 'ALL' ? activeTickets : activeTickets.filter(t => t.type === filter);
  
  // Stats
  const avgTime = 12; // Mock
  const totalTickets = activeTickets.length;
  const criticalTickets = activeTickets.filter(t => (new Date().getTime() - t.timestamp.getTime()) / 1000 / 60 > 20).length;

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-brand-black overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-brand-surface border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
           <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <ChefHat className="text-brand-red" /> Kitchen Display
           </h1>
           <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700"></div>
           <div className="flex gap-1 bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg">
              {['ALL', OrderType.DINE_IN, OrderType.DELIVERY, OrderType.TAKEAWAY].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${filter === f ? 'bg-gray-800 dark:bg-neutral-700 text-white' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>

        <div className="flex gap-6 text-sm">
          <div className="flex flex-col items-end">
             <span className="text-gray-500 dark:text-neutral-500 text-[10px] uppercase font-bold">Open Tickets</span>
             <span className="text-gray-900 dark:text-white font-mono font-bold text-lg leading-none">{totalTickets}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-gray-500 dark:text-neutral-500 text-[10px] uppercase font-bold">Critical (>20m)</span>
             <span className={`font-mono font-bold text-lg leading-none ${criticalTickets > 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>{criticalTickets}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-gray-500 dark:text-neutral-500 text-[10px] uppercase font-bold">Avg Bump Time</span>
             <span className="text-brand-red font-mono font-bold text-lg leading-none">{avgTime}m</span>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-100 dark:bg-brand-black">
        {filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-neutral-600">
            <CheckCircle size={64} className="opacity-20 mb-4" />
            <h2 className="text-2xl font-bold text-gray-500 dark:text-neutral-700">All Clear!</h2>
            <p>No active orders in the kitchen.</p>
          </div>
        ) : (
          <div className="flex gap-4 h-full">
            {filteredTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                order={ticket} 
                onBump={onBump || (() => {})} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

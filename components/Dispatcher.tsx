
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DRIVERS } from '../constants';
import { Order, OrderStatus, Driver, DeliveryPlatform, OrderType } from '../types';
import { Bike, Car, Battery, MapPin, Phone, CheckCircle, Navigation, Search, Plus, Minus } from 'lucide-react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

interface DispatcherProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, action: 'ASSIGN' | 'COMPLETE', driverId?: string, driverName?: string) => void;
}

// Helper: Haversine Distance Calculation
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

const PlatformBadge: React.FC<{ platform: DeliveryPlatform }> = ({ platform }) => {
  const styles = {
    OWN_FLEET: 'bg-brand-red text-white',
    TALABAT: 'bg-orange-500 text-white',
    DELIVEROO: 'bg-teal-500 text-white',
    CAREEM: 'bg-green-500 text-white'
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${styles[platform]}`}>{platform.replace('_', ' ')}</span>;
};

const DriverCard: React.FC<{ 
  driver: Driver & { distance?: number }; 
  onAssign?: () => void; 
  onClick?: () => void;
  isSelected?: boolean;
}> = ({ driver, onAssign, onClick, isSelected }) => (
  <div 
    onClick={onClick}
    className={`rounded-lg p-3 border flex items-center justify-between group transition-all cursor-pointer ${isSelected ? 'bg-gray-100 dark:bg-neutral-800 border-brand-red shadow-lg shadow-brand-red/10' : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500'}`}
  >
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-300'}`}>
           {driver.vehicleType === 'BIKE' ? <Bike size={20} /> : <Car size={20} />}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800 ${
          driver.status === 'AVAILABLE' ? 'bg-green-500' : 
          driver.status === 'BUSY' ? 'bg-red-500' : 'bg-neutral-500'
        }`}></div>
      </div>
      <div>
        <div className={`font-bold text-sm transition-colors ${isSelected ? 'text-brand-red' : 'text-gray-900 dark:text-white'}`}>{driver.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-500">
           {driver.distance !== undefined && (
             <span className="text-brand-red font-bold flex items-center gap-1">
               <Navigation size={10} /> {driver.distance.toFixed(1)} km •
             </span>
           )}
           <span className="flex items-center gap-1"><Battery size={10} className={driver.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'} /> {driver.batteryLevel}%</span>
           <span>• {driver.status}</span>
        </div>
      </div>
    </div>
    {driver.status === 'AVAILABLE' && onAssign && (
      <button 
        onClick={(e) => { e.stopPropagation(); onAssign(); }} 
        className="bg-gray-200 dark:bg-neutral-700 hover:bg-brand-red hover:text-white text-gray-700 dark:text-neutral-300 text-xs font-bold px-3 py-1.5 rounded transition-colors"
      >
        Assign
      </button>
    )}
  </div>
);

const DeliveryOrderCard: React.FC<{ order: Order; onAction: (id: string, action: string) => void }> = ({ order, onAction }) => {
  const isLate = (new Date().getTime() - order.timestamp.getTime()) / 1000 / 60 > 45;

  return (
    <div className={`bg-white dark:bg-brand-surface rounded-xl border p-4 shadow-sm flex flex-col gap-3 transition-all ${isLate ? 'border-red-500/50' : 'border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-900 dark:text-white font-bold text-lg">#{order.id.split('-')[1] || order.id}</span>
          {order.deliveryInfo?.platform && <PlatformBadge platform={order.deliveryInfo.platform} />}
        </div>
        <div className="text-xs text-gray-500 dark:text-neutral-400 font-mono">
           {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      <div>
        <div className="text-gray-900 dark:text-white font-bold text-sm truncate">{order.deliveryInfo?.customerName}</div>
        <div className="text-gray-500 dark:text-neutral-500 text-xs flex items-center gap-1 mt-1">
          <MapPin size={10} /> {order.deliveryInfo?.address}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-neutral-800 mt-1">
        <div className="text-gray-900 dark:text-white font-mono font-bold text-sm">{order.total.toFixed(3)} KWD</div>
        
        {order.status === OrderStatus.READY && order.deliveryInfo?.platform === 'OWN_FLEET' && (
          <button onClick={() => onAction(order.id, 'ASSIGN')} className="text-xs bg-brand-red text-white px-3 py-1.5 rounded font-bold hover:bg-red-600">
             Assign Driver
          </button>
        )}
        
        {order.status === OrderStatus.READY && order.deliveryInfo?.platform !== 'OWN_FLEET' && (
          <button onClick={() => onAction(order.id, 'COMPLETE')} className="text-xs bg-gray-100 dark:bg-neutral-800 text-orange-500 border border-orange-200 dark:border-orange-900/50 px-3 py-1.5 rounded font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20">
             Confirm Pickup
          </button>
        )}

        {order.status === OrderStatus.OUT_FOR_DELIVERY && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 dark:text-neutral-400">{order.deliveryInfo?.driverName}</div>
            <button onClick={() => onAction(order.id, 'COMPLETE')} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-900 px-2 py-1 rounded font-bold hover:bg-green-500 hover:text-white transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal component for the Live Map
const LiveMap = ({ drivers, selectedDriverId, driverLocations }: { drivers: Driver[], selectedDriverId: string | null, driverLocations: Record<string, {lat: number, lng: number}> }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const { theme } = useApp();
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [29.3759, 47.9774],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    if (!mapInstance.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20
    }).addTo(mapInstance.current);

  }, [theme]);

  // Update Markers
  useEffect(() => {
    if (!mapInstance.current) return;

    drivers.forEach(driver => {
      const loc = driverLocations[driver.id] || { lat: 29.3759, lng: 47.9774 };
      const color = driver.status === 'AVAILABLE' ? '#22c55e' : driver.status === 'BUSY' ? '#ef4444' : '#525252';
      const isSelected = driver.id === selectedDriverId;
      
      const size = isSelected ? 32 : 16; 
      const fontSize = isSelected ? 12 : 10;
      const zIndexOffset = isSelected ? 1000 : 0;

      const customIcon = L.divIcon({
        className: 'custom-driver-icon',
        html: `<div style="
          background-color: ${color}; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 0 15px ${isSelected ? color : 'rgba(0,0,0,0.5)'};
          position: relative;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        ">
          <div style="
            position: absolute; 
            top: -${isSelected ? 30 : 20}px; 
            left: 50%; 
            transform: translateX(-50%); 
            white-space: nowrap; 
            background: rgba(0,0,0,0.8); 
            color: white; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: ${fontSize}px; 
            font-weight: bold; 
            pointer-events: none;
            border: 1px solid ${isSelected ? color : 'transparent'};
          ">
            ${driver.name.split(' ')[0]}
          </div>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });

      if (markersRef.current[driver.id]) {
        markersRef.current[driver.id].setLatLng([loc.lat, loc.lng]);
        markersRef.current[driver.id].setIcon(customIcon);
        markersRef.current[driver.id].setZIndexOffset(zIndexOffset);
      } else {
        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon, zIndexOffset }).addTo(mapInstance.current!);
        markersRef.current[driver.id] = marker;
      }
    });
  }, [drivers, driverLocations, selectedDriverId]);

  const handleZoomIn = () => mapInstance.current?.zoomIn();
  const handleZoomOut = () => mapInstance.current?.zoomOut();

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full bg-gray-200 dark:bg-neutral-800" />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[400]">
        <button onClick={handleZoomIn} className="p-2 bg-white dark:bg-neutral-800 text-black dark:text-white rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-lg"><Plus size={20} /></button>
        <button onClick={handleZoomOut} className="p-2 bg-white dark:bg-neutral-800 text-black dark:text-white rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-lg"><Minus size={20} /></button>
      </div>
    </div>
  );
};

export const Dispatcher: React.FC<DispatcherProps> = ({ orders, onUpdateOrder }) => {
  const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Driver Location State (Lifted from Map)
  const [driverLocations, setDriverLocations] = useState<Record<string, { lat: number, lng: number }>>({
    'D-1': { lat: 29.3780, lng: 47.9800 },
    'D-2': { lat: 29.3700, lng: 47.9700 },
    'D-3': { lat: 29.3650, lng: 47.9650 }, 
  });

  // Simulate Driver Movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          next[key] = {
            lat: next[key].lat + (Math.random() - 0.5) * 0.0005,
            lng: next[key].lng + (Math.random() - 0.5) * 0.0005
          };
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const readyOrders = orders.filter(o => o.type === OrderType.DELIVERY && o.status === OrderStatus.READY);
  const outOrders = orders.filter(o => o.type === OrderType.DELIVERY && o.status === OrderStatus.OUT_FOR_DELIVERY);
  const completedOrders = orders.filter(o => o.type === OrderType.DELIVERY && o.status === OrderStatus.COMPLETED);

  // Helper to generate a consistent mock location for an order based on ID
  const getOrderLocation = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
        lat: 29.3759 + ((hash % 100) - 50) / 1000, 
        lng: 47.9774 + ((hash % 50) - 25) / 1000
    };
  };

  // Calculate available drivers sorted by distance to the selected order
  const availableDriversWithDist = useMemo(() => {
    if (!selectedOrderId) return [];
    const orderLoc = getOrderLocation(selectedOrderId);
    return drivers
        .filter(d => d.status === 'AVAILABLE')
        .map(d => {
            const dLoc = driverLocations[d.id] || { lat: 29.3759, lng: 47.9774 };
            return {
                ...d,
                distance: getDistanceFromLatLonInKm(orderLoc.lat, orderLoc.lng, dLoc.lat, dLoc.lng)
            };
        })
        .sort((a, b) => a.distance - b.distance);
  }, [drivers, selectedOrderId, driverLocations]);

  const handleOrderAction = (orderId: string, action: string) => {
    if (action === 'ASSIGN') {
      setSelectedOrderId(orderId);
    } else if (action === 'COMPLETE') {
      onUpdateOrder(orderId, 'COMPLETE');
      
      const order = orders.find(o => o.id === orderId);
      if (order?.deliveryInfo?.driverId) {
        setDrivers(prev => prev.map(d => d.id === order.deliveryInfo!.driverId ? { ...d, status: 'AVAILABLE' } : d));
      }
    }
  };

  const assignDriver = (driverId: string) => {
    if (!selectedOrderId) return;
    const driver = drivers.find(d => d.id === driverId);
    
    // Update global order state -> OUT_FOR_DELIVERY
    onUpdateOrder(selectedOrderId, 'ASSIGN', driverId, driver?.name);

    // Update local driver state -> BUSY
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'BUSY' } : d));
    setSelectedOrderId(null);
  };

  return (
    <div className="h-full flex bg-gray-50 dark:bg-brand-black overflow-hidden relative">
      {/* Assign Driver Modal Overlay */}
      {selectedOrderId && (
        <div className="absolute inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-700 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-900">
              <h3 className="font-bold text-gray-900 dark:text-white">Select Driver</h3>
              <button onClick={() => setSelectedOrderId(null)} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><CheckCircle className="rotate-45" size={24} /></button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900/50 border-b border-gray-200 dark:border-neutral-800">
               <div className="text-xs text-gray-500 dark:text-neutral-400">Suggesting drivers nearest to delivery location...</div>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              <div className="text-sm text-gray-500 dark:text-neutral-400 mb-2">Available Drivers (Sorted by Proximity)</div>
              {availableDriversWithDist.map(driver => (
                <DriverCard key={driver.id} driver={driver} onAssign={() => assignDriver(driver.id)} />
              ))}
              {availableDriversWithDist.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-neutral-500 italic">No drivers available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Drivers & Map */}
      <div className="w-80 bg-white dark:bg-brand-surface border-r border-gray-200 dark:border-neutral-800 flex flex-col z-10">
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Navigation className="text-brand-red" /> Dispatcher
           </h2>
           <div className="mt-4 relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-neutral-500"
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-3">Active Fleet ({drivers.length})</h3>
            <div className="space-y-2">
              {drivers.map(driver => (
                <DriverCard 
                  key={driver.id} 
                  driver={driver} 
                  onClick={() => setSelectedDriverId(driver.id)}
                  isSelected={selectedDriverId === driver.id}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col h-64">
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Live Map</h3>
               <span className="text-[10px] text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Online</span>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden relative shadow-inner">
               <LiveMap drivers={drivers} selectedDriverId={selectedDriverId} driverLocations={driverLocations} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-[800px]">
          
          {/* Column 1: Ready for Pickup */}
          <div className="flex-1 flex flex-col bg-gray-100 dark:bg-neutral-900/30 rounded-2xl border border-gray-200 dark:border-neutral-800/50 overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/80 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
               <h3 className="font-bold text-gray-900 dark:text-white">Ready for Pickup</h3>
               <span className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-xs font-bold px-2 py-1 rounded-full border border-gray-200 dark:border-transparent shadow-sm">{readyOrders.length}</span>
             </div>
             <div className="p-4 space-y-3 overflow-y-auto flex-1">
               {readyOrders.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 dark:text-neutral-600">No orders waiting</div>
               ) : (
                 readyOrders.map(order => (
                   <DeliveryOrderCard key={order.id} order={order} onAction={handleOrderAction} />
                 ))
               )}
             </div>
          </div>

          {/* Column 2: Out for Delivery */}
          <div className="flex-1 flex flex-col bg-gray-100 dark:bg-neutral-900/30 rounded-2xl border border-gray-200 dark:border-neutral-800/50 overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/80 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
               <h3 className="font-bold text-blue-600 dark:text-blue-400">Out for Delivery</h3>
               <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full border border-blue-200 dark:border-blue-900">{outOrders.length}</span>
             </div>
             <div className="p-4 space-y-3 overflow-y-auto flex-1">
               {outOrders.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 dark:text-neutral-600">No active deliveries</div>
               ) : (
                 outOrders.map(order => (
                   <DeliveryOrderCard key={order.id} order={order} onAction={handleOrderAction} />
                 ))
               )}
             </div>
          </div>

          {/* Column 3: History (Recent) */}
          <div className="w-80 flex flex-col bg-white dark:bg-neutral-900/10 rounded-2xl border border-gray-200 dark:border-neutral-800/30 overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/80 backdrop-blur sticky top-0 z-10">
               <h3 className="font-bold text-gray-500 dark:text-neutral-400">Recent Completed</h3>
             </div>
             <div className="p-4 space-y-3 overflow-y-auto flex-1 opacity-60 hover:opacity-100 transition-opacity">
               {completedOrders.slice(0, 8).map(order => (
                 <div key={order.id} className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-lg border border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-gray-700 dark:text-neutral-300">#{order.id.split('-')[1] || order.id}</div>
                      <div className="text-xs text-gray-500 dark:text-neutral-500">{order.deliveryInfo?.platform}</div>
                    </div>
                    <div className="text-green-500"><CheckCircle size={16} /></div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

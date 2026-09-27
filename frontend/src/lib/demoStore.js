// Demo data store — used when Firebase is not configured
// This provides a full working demo with localStorage persistence

import { addDays, subDays, format } from 'date-fns';

const STORAGE_KEY = 'studio_manager_data';

const generateId = () => Math.random().toString(36).substr(2, 9);

const now = new Date();

const defaultData = {
  users: [
    { uid: 'admin-1', email: 'admin@studio.com', displayName: 'Achintha', role: 'admin', createdAt: now.toISOString() },
    { uid: 'staff-1', email: 'staff@studio.com', displayName: 'Kasun', role: 'staff', createdAt: now.toISOString() },
  ],
  clients: [
    { id: 'c1', name: 'Kamal Perera', phone: '+94771234567', email: 'kamal@email.com', address: 'No. 45, Galle Road, Colombo 03', notes: 'Regular client', createdAt: subDays(now, 30).toISOString() },
    { id: 'c2', name: 'Nimalka Fernando', phone: '+94772345678', email: 'nimalka@email.com', address: '12, Temple Road, Kandy', notes: 'Referred by Kamal', createdAt: subDays(now, 25).toISOString() },
    { id: 'c3', name: 'Supun Silva', phone: '+94773456789', email: 'supun@email.com', address: '78, Lake Drive, Galle', notes: '', createdAt: subDays(now, 20).toISOString() },
    { id: 'c4', name: 'Dilini Jayasinghe', phone: '+94774567890', email: 'dilini@email.com', address: '23, Hill Street, Nuwara Eliya', notes: 'VIP client', createdAt: subDays(now, 15).toISOString() },
    { id: 'c5', name: 'Ravindu Wickrama', phone: '+94775678901', email: 'ravindu@email.com', address: '56, Beach Road, Negombo', notes: '', createdAt: subDays(now, 10).toISOString() },
    { id: 'c6', name: 'Amaya De Silva', phone: '+94776789012', email: 'amaya@email.com', address: '90, Park Avenue, Colombo 07', notes: 'Corporate events', createdAt: subDays(now, 5).toISOString() },
  ],
  shoots: [
    { id: 's1', clientId: 'c1', clientName: 'Kamal Perera', type: 'wedding', date: addDays(now, 2).toISOString(), time: '09:00', location: 'Cinnamon Grand, Colombo', package: 'Gold Package', packageAmount: 85000, status: 'upcoming', notes: 'Grand wedding, 500+ guests', createdAt: subDays(now, 20).toISOString() },
    { id: 's2', clientId: 'c2', clientName: 'Nimalka Fernando', type: 'pre-shoot', date: addDays(now, 5).toISOString(), time: '15:00', location: 'Sigiriya Rock Fortress', package: 'Silver Package', packageAmount: 45000, status: 'upcoming', notes: 'Outdoor pre-shoot', createdAt: subDays(now, 15).toISOString() },
    { id: 's3', clientId: 'c3', clientName: 'Supun Silva', type: 'event', date: addDays(now, 7).toISOString(), time: '18:00', location: 'Hilton Colombo', package: 'Platinum Package', packageAmount: 125000, status: 'upcoming', notes: 'Corporate annual dinner', createdAt: subDays(now, 10).toISOString() },
    { id: 's4', clientId: 'c4', clientName: 'Dilini Jayasinghe', type: 'wedding', date: addDays(now, 14).toISOString(), time: '10:00', location: 'Temple of the Tooth, Kandy', package: 'Platinum Package', packageAmount: 125000, status: 'upcoming', notes: 'Traditional Kandyan wedding', createdAt: subDays(now, 8).toISOString() },
    { id: 's5', clientId: 'c5', clientName: 'Ravindu Wickrama', type: 'pre-shoot', date: subDays(now, 10).toISOString(), time: '06:00', location: 'Galle Fort', package: 'Silver Package', packageAmount: 45000, status: 'completed', notes: 'Sunrise shoot completed', createdAt: subDays(now, 30).toISOString() },
    { id: 's6', clientId: 'c6', clientName: 'Amaya De Silva', type: 'event', date: subDays(now, 5).toISOString(), time: '19:00', location: 'Shangri-La Colombo', package: 'Gold Package', packageAmount: 85000, status: 'completed', notes: 'Product launch event', createdAt: subDays(now, 20).toISOString() },
    { id: 's7', clientId: 'c1', clientName: 'Kamal Perera', type: 'pre-shoot', date: subDays(now, 15).toISOString(), time: '16:00', location: 'Beira Lake, Colombo', package: 'Silver Package', packageAmount: 45000, status: 'completed', notes: 'Engagement pre-shoot', createdAt: subDays(now, 25).toISOString() },
  ],
  albums: [
    { id: 'a1', shootId: 's5', clientId: 'c5', clientName: 'Ravindu Wickrama', shootType: 'pre-shoot', shootDate: subDays(now, 10).toISOString(), stage: 'designing', notes: 'Designer: Kasun', priority: 'normal', stageHistory: [{ stage: 'to-design', movedAt: subDays(now, 9).toISOString(), movedBy: 'admin-1' }, { stage: 'designing', movedAt: subDays(now, 5).toISOString(), movedBy: 'admin-1' }], createdAt: subDays(now, 9).toISOString() },
    { id: 'a2', shootId: 's6', clientId: 'c6', clientName: 'Amaya De Silva', shootType: 'event', shootDate: subDays(now, 5).toISOString(), stage: 'to-design', notes: '', priority: 'high', stageHistory: [{ stage: 'to-design', movedAt: subDays(now, 4).toISOString(), movedBy: 'admin-1' }], createdAt: subDays(now, 4).toISOString() },
    { id: 'a3', shootId: 's7', clientId: 'c1', clientName: 'Kamal Perera', shootType: 'pre-shoot', shootDate: subDays(now, 15).toISOString(), stage: 'client-approval', notes: 'Sent 20 photos for selection', priority: 'normal', stageHistory: [{ stage: 'to-design', movedAt: subDays(now, 14).toISOString(), movedBy: 'admin-1' }, { stage: 'designing', movedAt: subDays(now, 10).toISOString(), movedBy: 'admin-1' }, { stage: 'client-approval', movedAt: subDays(now, 3).toISOString(), movedBy: 'admin-1' }], createdAt: subDays(now, 14).toISOString() },
    { id: 'a4', shootId: 'demo-1', clientId: 'c2', clientName: 'Nimalka Fernando', shootType: 'wedding', shootDate: subDays(now, 45).toISOString(), stage: 'sent-for-printing', notes: 'Premium leather album', priority: 'normal', stageHistory: [{ stage: 'to-design', movedAt: subDays(now, 44).toISOString(), movedBy: 'admin-1' }, { stage: 'designing', movedAt: subDays(now, 35).toISOString(), movedBy: 'admin-1' }, { stage: 'client-approval', movedAt: subDays(now, 20).toISOString(), movedBy: 'admin-1' }, { stage: 'sent-for-printing', movedAt: subDays(now, 7).toISOString(), movedBy: 'admin-1' }], createdAt: subDays(now, 44).toISOString() },
    { id: 'a5', shootId: 'demo-2', clientId: 'c3', clientName: 'Supun Silva', shootType: 'event', shootDate: subDays(now, 60).toISOString(), stage: 'ready-for-pickup', notes: 'Call client to pick up', priority: 'high', stageHistory: [{ stage: 'to-design', movedAt: subDays(now, 59).toISOString(), movedBy: 'admin-1' }, { stage: 'designing', movedAt: subDays(now, 50).toISOString(), movedBy: 'admin-1' }, { stage: 'client-approval', movedAt: subDays(now, 35).toISOString(), movedBy: 'admin-1' }, { stage: 'sent-for-printing', movedAt: subDays(now, 20).toISOString(), movedBy: 'admin-1' }, { stage: 'ready-for-pickup', movedAt: subDays(now, 2).toISOString(), movedBy: 'staff-1' }], createdAt: subDays(now, 59).toISOString() },
    { id: 'a6', shootId: 'demo-3', clientId: 'c4', clientName: 'Dilini Jayasinghe', shootType: 'wedding', shootDate: subDays(now, 90).toISOString(), stage: 'delivered', notes: 'Client very happy!', priority: 'normal', stageHistory: [{ stage: 'to-design', movedAt: subDays(now, 89).toISOString(), movedBy: 'admin-1' }, { stage: 'designing', movedAt: subDays(now, 75).toISOString(), movedBy: 'admin-1' }, { stage: 'client-approval', movedAt: subDays(now, 60).toISOString(), movedBy: 'admin-1' }, { stage: 'sent-for-printing', movedAt: subDays(now, 45).toISOString(), movedBy: 'admin-1' }, { stage: 'ready-for-pickup', movedAt: subDays(now, 30).toISOString(), movedBy: 'staff-1' }, { stage: 'delivered', movedAt: subDays(now, 25).toISOString(), movedBy: 'staff-1' }], createdAt: subDays(now, 89).toISOString() },
  ],
  payments: [
    { id: 'p1', shootId: 's1', clientId: 'c1', clientName: 'Kamal Perera', totalAmount: 85000, paidAmount: 25000, balance: 60000, status: 'partial', transactions: [{ amount: 25000, date: subDays(now, 20).toISOString(), method: 'cash', note: 'Advance payment', recordedBy: 'admin-1' }], createdAt: subDays(now, 20).toISOString() },
    { id: 'p2', shootId: 's2', clientId: 'c2', clientName: 'Nimalka Fernando', totalAmount: 45000, paidAmount: 15000, balance: 30000, status: 'partial', transactions: [{ amount: 15000, date: subDays(now, 15).toISOString(), method: 'bank', note: 'Advance', recordedBy: 'admin-1' }], createdAt: subDays(now, 15).toISOString() },
    { id: 'p3', shootId: 's3', clientId: 'c3', clientName: 'Supun Silva', totalAmount: 125000, paidAmount: 50000, balance: 75000, status: 'partial', transactions: [{ amount: 50000, date: subDays(now, 10).toISOString(), method: 'bank', note: '40% advance', recordedBy: 'admin-1' }], createdAt: subDays(now, 10).toISOString() },
    { id: 'p4', shootId: 's4', clientId: 'c4', clientName: 'Dilini Jayasinghe', totalAmount: 125000, paidAmount: 125000, balance: 0, status: 'paid', transactions: [{ amount: 50000, date: subDays(now, 8).toISOString(), method: 'bank', note: 'Advance', recordedBy: 'admin-1' }, { amount: 75000, date: subDays(now, 1).toISOString(), method: 'cash', note: 'Final payment', recordedBy: 'admin-1' }], createdAt: subDays(now, 8).toISOString() },
    { id: 'p5', shootId: 's5', clientId: 'c5', clientName: 'Ravindu Wickrama', totalAmount: 45000, paidAmount: 45000, balance: 0, status: 'paid', transactions: [{ amount: 20000, date: subDays(now, 30).toISOString(), method: 'cash', note: 'Advance', recordedBy: 'admin-1' }, { amount: 25000, date: subDays(now, 10).toISOString(), method: 'cash', note: 'Balance', recordedBy: 'admin-1' }], createdAt: subDays(now, 30).toISOString() },
    { id: 'p6', shootId: 's6', clientId: 'c6', clientName: 'Amaya De Silva', totalAmount: 85000, paidAmount: 85000, balance: 0, status: 'paid', transactions: [{ amount: 85000, date: subDays(now, 20).toISOString(), method: 'bank', note: 'Full payment upfront', recordedBy: 'admin-1' }], createdAt: subDays(now, 20).toISOString() },
  ],
  notifications: [
    { id: 'n1', userId: 'admin-1', title: 'Upcoming Wedding Shoot', message: 'Wedding shoot for Kamal Perera at Cinnamon Grand in 2 days', type: 'shoot-reminder', read: false, createdAt: now.toISOString() },
    { id: 'n2', userId: 'admin-1', title: 'Album Ready for Pickup', message: "Supun Silva's event album is ready. Notify the client.", type: 'album-update', read: false, createdAt: subDays(now, 2).toISOString() },
    { id: 'n3', userId: 'admin-1', title: 'Payment Received', message: 'Dilini Jayasinghe paid Rs. 75,000 - Final payment', type: 'payment-due', read: true, createdAt: subDays(now, 1).toISOString() },
  ],
  packages: [
    { id: 'silver', name: 'Silver Package', price: 45000, description: 'Basic coverage, 200 edited photos, 1 album' },
    { id: 'gold', name: 'Gold Package', price: 85000, description: 'Full day coverage, 500 edited photos, 2 albums, highlights video' },
    { id: 'platinum', name: 'Platinum Package', price: 125000, description: 'Multi-day coverage, unlimited photos, 3 premium albums, cinematic video, drone shots' },
    { id: 'custom', name: 'Custom Package', price: 0, description: 'Customized to your needs' },
  ],
};

class DemoStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load stored data:', e);
    }
    return JSON.parse(JSON.stringify(defaultData));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  // Generic CRUD
  getAll(collection) {
    return [...(this.data[collection] || [])];
  }

  getById(collection, id) {
    return this.data[collection]?.find(item => item.id === id || item.uid === id) || null;
  }

  add(collection, item) {
    const newItem = { ...item, id: item.id || generateId(), createdAt: new Date().toISOString() };
    this.data[collection] = [...(this.data[collection] || []), newItem];
    this.save();
    return newItem;
  }

  update(collection, id, updates) {
    this.data[collection] = this.data[collection].map(item =>
      (item.id === id || item.uid === id) ? { ...item, ...updates } : item
    );
    this.save();
    return this.getById(collection, id);
  }

  remove(collection, id) {
    this.data[collection] = this.data[collection].filter(item => item.id !== id && item.uid !== id);
    this.save();
  }

  // Query helpers
  getByField(collection, field, value) {
    return this.data[collection]?.filter(item => item[field] === value) || [];
  }

  resetData() {
    this.data = JSON.parse(JSON.stringify(defaultData));
    this.save();
  }
}

export const demoStore = new DemoStore();
export { generateId };

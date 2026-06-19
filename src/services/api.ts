import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Accident, Contact, Alert, DashboardStats, Severity } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const API_BASE = '/api';

export const apiService = {
  // Accident Detection (Express API)
  detectAccident: async (data: { speed: number; acceleration: number[]; impact: number[]; location?: any; phoneNumber?: string }) => {
    const response = await fetch(`${API_BASE}/accidents/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Detection failed (${response.status}): ${text.substring(0, 100)}`);
    }
    return response.json() as Promise<{ severity: Severity; confidence: number; timestamp: string; location: any }>;
  },

  // Stats (Express API)
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Stats fetch failed (${response.status}): ${text.substring(0, 100)}`);
    }
    return response.json() as Promise<DashboardStats>;
  },

  getSystemConfig: async () => {
    const response = await fetch(`${API_BASE}/config`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Config fetch failed (${response.status}): ${text.substring(0, 100)}`);
    }
    return response.json() as Promise<{ smsActive: boolean; region: string }>;
  },

  // Emergency Contacts (Firestore)
  addContact: async (contact: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    const path = 'contacts';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...contact,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  getContacts: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    const path = 'contacts';
    try {
      const q = query(collection(db, path), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  // Accident History (Firestore)
  saveAccident: async (accident: Omit<Accident, 'id' | 'userId' | 'timestamp'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    const path = 'accidents';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...accident,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  getAccidents: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    const path = 'accidents';
    try {
      const q = query(collection(db, path), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Accident));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  // Alerts History (Firestore)
  saveAlert: async (alert: Omit<Alert, 'id' | 'userId' | 'timestamp'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    const path = 'alerts';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...alert,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  getAlerts: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    const path = 'alerts';
    try {
      const q = query(collection(db, path), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }
};

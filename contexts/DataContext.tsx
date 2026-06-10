import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, writeBatch, getDocs,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type WorkType = "pairs" | "kg" | "piece";
export type PaymentMode = "UPI" | "cash" | "bank" | "other";
export type PaymentStatus = "pending" | "paid";

export interface WorkEntry {
  id: string;
  laborerId: string;
  date: string;
  workType: WorkType;
  itemName?: string;
  quantity: number;
  rate: number;
  total: number;
  notes: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
}

export interface Payment {
  id: string;
  laborerId: string;
  date: string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  notes: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
}

export interface Laborer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
}

export interface AdminRecord {
  uid: string;
  name: string;
  email: string;
  lastSeen: any;
  joinedAt: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  createdByName?: string;
}

export interface WorkItemName {
  id: string;
  name: string;
  createdAt: string;
  createdBy?: string;
}

interface DataContextType {
  laborers: Laborer[];
  entries: WorkEntry[];
  payments: Payment[];
  admins: AdminRecord[];
  inventory: InventoryItem[];
  workItemNames: WorkItemName[];
  firestoreError: string | null;
  addLaborer: (name: string, phone: string) => Promise<void>;
  updateLaborer: (id: string, name: string, phone: string) => Promise<void>;
  deleteLaborer: (id: string) => Promise<void>;
  addEntry: (entry: Omit<WorkEntry, "id" | "createdAt">) => Promise<void>;
  updateEntry: (id: string, entry: Partial<WorkEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, "id" | "createdAt">) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  markPaymentPaid: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, "id" | "createdAt">) => Promise<void>;
  updateInventoryItem: (id: string, changes: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addWorkItemName: (name: string) => Promise<void>;
  deleteWorkItemName: (id: string) => Promise<void>;
  clearSeasonEntries: () => Promise<number>;
  getLaborerEntries: (laborerId: string) => WorkEntry[];
  getLaborerPayments: (laborerId: string) => Payment[];
  getLaborerTotal: (laborerId: string) => number;
  getLaborerPaid: (laborerId: string) => number;
  getLaborerBalance: (laborerId: string) => number;
  getFilteredEntries: (laborerId?: string, startDate?: string, endDate?: string) => WorkEntry[];
  isLoading: boolean;
  exportData: () => string;
  importData: (data: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [workItemNames, setWorkItemNames] = useState<WorkItemName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLaborers([]); setEntries([]); setPayments([]); setAdmins([]); setInventory([]); setWorkItemNames([]);
      setIsLoading(false);
      setFirestoreError(null);
      return;
    }

    setIsLoading(true);
    setFirestoreError(null);

    const handleError = (err: any) => {
      setIsLoading(false);
      if (err?.code === "permission-denied") setFirestoreError("permission-denied");
    };

    const unsubLaborers = onSnapshot(
      query(collection(db, "laborers"), orderBy("createdAt", "asc")),
      (snap) => { setLaborers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Laborer))); setIsLoading(false); },
      handleError
    );
    const unsubEntries = onSnapshot(
      query(collection(db, "entries"), orderBy("date", "desc")),
      (snap) => setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkEntry))),
      handleError
    );
    const unsubPayments = onSnapshot(
      query(collection(db, "payments"), orderBy("date", "desc")),
      (snap) => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment))),
      handleError
    );
    const unsubAdmins = onSnapshot(
      collection(db, "admins"),
      (snap) => setAdmins(snap.docs.map(d => ({ ...d.data() } as AdminRecord))),
      handleError
    );
    const unsubInventory = onSnapshot(
      query(collection(db, "inventory"), orderBy("createdAt", "desc")),
      (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem))),
      handleError
    );
    const unsubWorkItems = onSnapshot(
      query(collection(db, "workItemNames"), orderBy("createdAt", "asc")),
      (snap) => setWorkItemNames(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkItemName))),
      handleError
    );

    return () => { unsubLaborers(); unsubEntries(); unsubPayments(); unsubAdmins(); unsubInventory(); unsubWorkItems(); };
  }, [user]);

  const addLaborer = useCallback(async (name: string, phone: string) => {
    await addDoc(collection(db, "laborers"), { name, phone, createdAt: new Date().toISOString(), createdBy: user?.uid ?? "", createdByName: user?.displayName ?? "" });
  }, [user]);

  const updateLaborer = useCallback(async (id: string, name: string, phone: string) => {
    await updateDoc(doc(db, "laborers", id), { name, phone });
  }, []);

  const deleteLaborer = useCallback(async (id: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, "laborers", id));
    entries.filter(e => e.laborerId === id).forEach(e => batch.delete(doc(db, "entries", e.id)));
    payments.filter(p => p.laborerId === id).forEach(p => batch.delete(doc(db, "payments", p.id)));
    await batch.commit();
  }, [entries, payments]);

  const addEntry = useCallback(async (entry: Omit<WorkEntry, "id" | "createdAt">) => {
    await addDoc(collection(db, "entries"), { ...entry, createdAt: new Date().toISOString(), createdBy: user?.uid ?? "", createdByName: user?.displayName ?? "" });
  }, [user]);

  const updateEntry = useCallback(async (id: string, changes: Partial<WorkEntry>) => {
    await updateDoc(doc(db, "entries", id), changes as Record<string, unknown>);
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "entries", id));
  }, []);

  const addPayment = useCallback(async (payment: Omit<Payment, "id" | "createdAt">) => {
    await addDoc(collection(db, "payments"), { ...payment, createdAt: new Date().toISOString(), createdBy: user?.uid ?? "", createdByName: user?.displayName ?? "" });
  }, [user]);

  const updatePayment = useCallback(async (id: string, changes: Partial<Payment>) => {
    await updateDoc(doc(db, "payments", id), changes as Record<string, unknown>);
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "payments", id));
  }, []);

  const markPaymentPaid = useCallback(async (id: string) => {
    await updateDoc(doc(db, "payments", id), { status: "paid" });
  }, []);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, "id" | "createdAt">) => {
    await addDoc(collection(db, "inventory"), { ...item, createdAt: new Date().toISOString(), createdBy: user?.uid ?? "", createdByName: user?.displayName ?? "" });
  }, [user]);

  const updateInventoryItem = useCallback(async (id: string, changes: Partial<InventoryItem>) => {
    await updateDoc(doc(db, "inventory", id), { ...changes as Record<string, unknown>, updatedAt: new Date().toISOString() });
  }, []);

  const deleteInventoryItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "inventory", id));
  }, []);

  const addWorkItemName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addDoc(collection(db, "workItemNames"), { name: trimmed, createdAt: new Date().toISOString(), createdBy: user?.uid ?? "" });
  }, [user]);

  const deleteWorkItemName = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workItemNames", id));
  }, []);

  const clearSeasonEntries = useCallback(async (): Promise<number> => {
    const snap = await getDocs(collection(db, "entries"));
    const batchSize = 400;
    let deleted = 0;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      docs.slice(i, i + batchSize).forEach(d => batch.delete(d.ref));
      await batch.commit();
      deleted += Math.min(batchSize, docs.length - i);
    }
    return deleted;
  }, []);

  const getLaborerEntries = useCallback((laborerId: string) =>
    entries.filter(e => e.laborerId === laborerId).sort((a, b) => b.date.localeCompare(a.date)), [entries]);

  const getLaborerPayments = useCallback((laborerId: string) =>
    payments.filter(p => p.laborerId === laborerId).sort((a, b) => b.date.localeCompare(a.date)), [payments]);

  const getLaborerTotal = useCallback((laborerId: string) =>
    entries.filter(e => e.laborerId === laborerId).reduce((s, e) => s + e.total, 0), [entries]);

  const getLaborerPaid = useCallback((laborerId: string) =>
    payments.filter(p => p.laborerId === laborerId && p.status === "paid").reduce((s, p) => s + p.amount, 0), [payments]);

  const getLaborerBalance = useCallback((laborerId: string) =>
    getLaborerTotal(laborerId) - getLaborerPaid(laborerId), [getLaborerTotal, getLaborerPaid]);

  const getFilteredEntries = useCallback((laborerId?: string, startDate?: string, endDate?: string) => {
    let filtered = [...entries];
    if (laborerId) filtered = filtered.filter(e => e.laborerId === laborerId);
    if (startDate) filtered = filtered.filter(e => e.date >= startDate);
    if (endDate) filtered = filtered.filter(e => e.date <= endDate);
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  const exportData = useCallback(() =>
    JSON.stringify({ laborers, entries, payments, inventory, exportedAt: new Date().toISOString(), version: 4 }), [laborers, entries, payments, inventory]);

  const importData = useCallback(async (dataStr: string): Promise<boolean> => {
    try {
      const data = JSON.parse(dataStr);
      if (!data.laborers || !data.entries) return false;
      const batch = writeBatch(db);
      for (const l of data.laborers as Laborer[]) {
        if (!laborers.find(x => x.id === l.id)) batch.set(doc(db, "laborers", l.id), { ...l, importedBy: user?.uid ?? "" });
      }
      for (const e of data.entries as WorkEntry[]) {
        if (!entries.find(x => x.id === e.id)) batch.set(doc(db, "entries", e.id), { ...e, importedBy: user?.uid ?? "" });
      }
      for (const p of ((data.payments || []) as Payment[])) {
        if (!payments.find(x => x.id === p.id)) batch.set(doc(db, "payments", p.id), { ...p, importedBy: user?.uid ?? "" });
      }
      await batch.commit();
      return true;
    } catch { return false; }
  }, [laborers, entries, payments, user]);

  return (
    <DataContext.Provider value={{
      laborers, entries, payments, admins, inventory, workItemNames, firestoreError,
      addLaborer, updateLaborer, deleteLaborer,
      addEntry, updateEntry, deleteEntry,
      addPayment, updatePayment, deletePayment, markPaymentPaid,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
      addWorkItemName, deleteWorkItemName, clearSeasonEntries,
      getLaborerEntries, getLaborerPayments,
      getLaborerTotal, getLaborerPaid, getLaborerBalance,
      getFilteredEntries, isLoading, exportData, importData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

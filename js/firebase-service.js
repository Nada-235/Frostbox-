import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, arrayUnion, enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

let db = null;
const unsubscribers = { household: null, items: null, shopping: null };

export function isConfigured(){
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';
}

export function initFirebase(){
  if(!isConfigured()) return false;
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  try{ enableIndexedDbPersistence(db); }
  catch(e){ /* fails harmlessly if multiple tabs are open */ }
  return true;
}

/* ---- Household lifecycle ---- */
export async function createHousehold(code, memberName){
  await setDoc(doc(db, 'households', code), { members: [memberName], createdAt: Date.now() });
}
export async function findHousehold(code){
  const snap = await getDoc(doc(db, 'households', code));
  return snap.exists();
}
export async function joinHouseholdAsMember(code, memberName){
  await updateDoc(doc(db, 'households', code), { members: arrayUnion(memberName) });
}

/** Wires up real-time listeners. Callbacks receive plain arrays/objects, no Firestore types leak out. */
export function subscribeToHousehold(code, { onMembers, onItems, onShopping }){
  unsubscribers.household = onSnapshot(doc(db, 'households', code), snap => {
    onMembers((snap.data() || {}).members || []);
  });
  unsubscribers.items = onSnapshot(collection(db, 'households', code, 'items'), snap => {
    onItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  unsubscribers.shopping = onSnapshot(collection(db, 'households', code, 'shopping'), snap => {
    onShopping(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
export function unsubscribeFromHousehold(){
  Object.keys(unsubscribers).forEach(key => {
    if(unsubscribers[key]) unsubscribers[key]();
    unsubscribers[key] = null;
  });
}

/* ---- Fridge items ---- */
export async function saveFridgeItem(code, item){
  const { id, ...data } = item;
  await setDoc(doc(db, 'households', code, 'items', id), data);
}
export async function deleteFridgeItem(code, id){
  await deleteDoc(doc(db, 'households', code, 'items', id));
}
export async function markReminderFired(code, id){
  try{ await updateDoc(doc(db, 'households', code, 'items', id), { reminderFired: true }); }
  catch(e){ /* best-effort; a missed flag just means one duplicate notification */ }
}

/* ---- Shopping list ---- */
export async function saveShoppingItem(code, item){
  const { id, ...data } = item;
  await setDoc(doc(db, 'households', code, 'shopping', id), data);
}
export async function quickAddShoppingItem(code, id, name){
  await setDoc(doc(db, 'households', code, 'shopping', id), { name, checked: false, category: 'other', prices: [] });
}
export async function toggleShoppingItem(code, id, checked){
  await updateDoc(doc(db, 'households', code, 'shopping', id), { checked });
}
export async function deleteShoppingItem(code, id){
  await deleteDoc(doc(db, 'households', code, 'shopping', id));
}

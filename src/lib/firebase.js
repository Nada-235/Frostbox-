import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, arrayUnion, arrayRemove, deleteField
} from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';
import { catalogIdFromName } from './utils.js';

let db = null;
let auth = null;
const unsubscribers = { household: null, items: null, shopping: null, catalog: null };

export function isConfigured(){
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';
}

export async function initFirebase(){
  if(!isConfigured()) return false;
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  return true;
}

export function getCurrentUser(){ return auth?.currentUser || null; }

export function waitForAuth(){
  return new Promise(resolve => {
    if(!auth) return resolve(null);
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function signInWithGoogle(){
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try{
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch(error){
    if(error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment'){
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function signOutGoogle(){
  unsubscribeFromHousehold();
  await signOut(auth);
}

function uid(){
  const value = auth?.currentUser?.uid;
  if(!value) throw new Error('Firebase Authentication is required.');
  return value;
}

/* ---- Account membership ---- */
export async function getMyHousehold(){
  const userId = uid();
  const snap = await getDoc(doc(db, 'users', userId));
  if(!snap.exists()) return null;
  return snap.data() || null;
}

async function saveMyHousehold(code, name, role){
  const userId = uid();
  await setDoc(doc(db, 'users', userId), {
    householdCode: code,
    displayName: name,
    role,
    updatedAt: Date.now(),
  });
}

/* ---- Household lifecycle ---- */
export async function createHousehold(code, memberName){
  const userId = uid();
  await setDoc(doc(db, 'households', code), {
    members: [memberName],
    memberProfiles: { [userId]: memberName },
    adminName: memberName,
    adminUid: userId,
    createdAt: Date.now(),
  });
  await saveMyHousehold(code, memberName, 'admin');
}
export async function findHousehold(code){
  const snap = await getDoc(doc(db, 'households', code));
  return snap.exists();
}
export async function joinHouseholdAsMember(code, memberName){
  const userId = uid();
  await updateDoc(doc(db, 'households', code), {
    members: arrayUnion(memberName),
    [`memberProfiles.${userId}`]: memberName,
  });
  await saveMyHousehold(code, memberName, 'member');
}
export async function removeHouseholdMember(code, memberName, memberUid){
  const userId = uid();
  const ref = doc(db, 'households', code);
  const snap = await getDoc(ref);
  if(!snap.exists()) return false;
  const data = snap.data() || {};
  if(data.adminUid !== userId || memberUid === data.adminUid) return false;
  await updateDoc(ref, {
    members: arrayRemove(memberName),
    [`memberProfiles.${memberUid}`]: deleteField(),
  });
  return true;
}
export function currentUserId(){ return auth?.currentUser?.uid || null; }

/** Wires up real-time listeners. */
export function subscribeToHousehold(code, { onMembers, onItems, onShopping, onCatalog }){
  unsubscribers.household = onSnapshot(doc(db, 'households', code), snap => {
    const data = snap.data() || {};
    onMembers(data.members || [], data.adminUid || null, data.memberProfiles || {});
  });
  unsubscribers.items = onSnapshot(collection(db, 'households', code, 'items'), snap => {
    onItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  unsubscribers.shopping = onSnapshot(collection(db, 'households', code, 'shopping'), snap => {
    onShopping(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  unsubscribers.catalog = onSnapshot(collection(db, 'households', code, 'catalog'), snap => {
    onCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
export async function deleteFridgeItem(code, id){ await deleteDoc(doc(db, 'households', code, 'items', id)); }
export async function markReminderFired(code, id){
  try{ await updateDoc(doc(db, 'households', code, 'items', id), { reminderFired: true }); }
  catch(e){ /* best-effort */ }
}

/* ---- Shopping list ---- */
export async function saveShoppingItem(code, item){
  const { id, ...data } = item;
  await setDoc(doc(db, 'households', code, 'shopping', id), data);
}
export async function quickAddShoppingItem(code, id, name){
  await setDoc(doc(db, 'households', code, 'shopping', id), { name, checked: false, category: 'other' });
}
export async function toggleShoppingItem(code, id, checked){
  await updateDoc(doc(db, 'households', code, 'shopping', id), { checked });
}
export async function deleteShoppingItem(code, id){ await deleteDoc(doc(db, 'households', code, 'shopping', id)); }

/* ---- Item catalog ---- */
export async function upsertCatalogItem(code, item){
  const { name, ...rest } = item;
  const id = catalogIdFromName(name);
  await setDoc(doc(db, 'households', code, 'catalog', id), { name, ...rest, updatedAt: Date.now() }, { merge: true });
  return id;
}
export async function deleteCatalogItem(code, id){ await deleteDoc(doc(db, 'households', code, 'catalog', id)); }

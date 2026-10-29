// MediStock - IndexedDB Database Layer
const DB_NAME = 'MediStockDB';
const DB_VERSION = 1;

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Users
      if (!database.objectStoreNames.contains('users')) {
        const userStore = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('username', 'username', { unique: true });
      }

      // Medicamentos (master)
      if (!database.objectStoreNames.contains('medicamentos')) {
        const medStore = database.createObjectStore('medicamentos', { keyPath: 'id', autoIncrement: true });
        medStore.createIndex('barcode', 'barcode', { unique: true });
        medStore.createIndex('nombreComercial', 'nombreComercial', { unique: false });
        medStore.createIndex('principioActivo', 'principioActivo', { unique: false });
      }

      // Lotes
      if (!database.objectStoreNames.contains('lotes')) {
        const loteStore = database.createObjectStore('lotes', { keyPath: 'id', autoIncrement: true });
        loteStore.createIndex('medicamentoId', 'medicamentoId', { unique: false });
        loteStore.createIndex('numeroLote', 'numeroLote', { unique: false });
        loteStore.createIndex('caducidad', 'caducidad', { unique: false });
      }

      // Movimientos (entradas / salidas)
      if (!database.objectStoreNames.contains('movimientos')) {
        const movStore = database.createObjectStore('movimientos', { keyPath: 'id', autoIncrement: true });
        movStore.createIndex('medicamentoId', 'medicamentoId', { unique: false });
        movStore.createIndex('loteId', 'loteId', { unique: false });
        movStore.createIndex('fecha', 'fecha', { unique: false });
        movStore.createIndex('tipo', 'tipo', { unique: false });
      }

      // Config
      if (!database.objectStoreNames.contains('config')) {
        database.createObjectStore('config', { keyPath: 'key' });
      }
    };
  });
}

// ========== USERS ==========
async function getUsers() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getUserByUsername(username) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('username');
    const req = index.get(username);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}


async function getUserByQrToken(token) {
  const users = await getUsers();
  return users.find(u => u.qrToken === token && u.activo) || null;
}

function generateQrToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function addUser(user) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    const req = store.add(user);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function updateUser(user) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    const req = store.put(user);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteUser(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ========== MEDICAMENTOS ==========
async function getMedicamentos() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('medicamentos', 'readonly');
    const store = tx.objectStore('medicamentos');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getMedicamentoById(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('medicamentos', 'readonly');
    const store = tx.objectStore('medicamentos');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getMedicamentoByBarcode(barcode) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('medicamentos', 'readonly');
    const store = tx.objectStore('medicamentos');
    const index = store.index('barcode');
    const req = index.get(barcode);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addMedicamento(med) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('medicamentos', 'readwrite');
    const store = tx.objectStore('medicamentos');
    const req = store.add(med);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function updateMedicamento(med) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('medicamentos', 'readwrite');
    const store = tx.objectStore('medicamentos');
    const req = store.put(med);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteMedicamento(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('medicamentos', 'readwrite');
    const store = tx.objectStore('medicamentos');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ========== LOTES ==========
async function getLotesByMedicamento(medicamentoId) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('lotes', 'readonly');
    const store = tx.objectStore('lotes');
    const index = store.index('medicamentoId');
    const req = index.getAll(medicamentoId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getLoteById(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('lotes', 'readonly');
    const store = tx.objectStore('lotes');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addLote(lote) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('lotes', 'readwrite');
    const store = tx.objectStore('lotes');
    const req = store.add(lote);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function updateLote(lote) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('lotes', 'readwrite');
    const store = tx.objectStore('lotes');
    const req = store.put(lote);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllLotes() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('lotes', 'readonly');
    const store = tx.objectStore('lotes');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ========== MOVIMIENTOS ==========
async function addMovimiento(mov) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('movimientos', 'readwrite');
    const store = tx.objectStore('movimientos');
    const req = store.add(mov);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getMovimientosByMedicamento(medicamentoId) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('movimientos', 'readonly');
    const store = tx.objectStore('movimientos');
    const index = store.index('medicamentoId');
    const req = index.getAll(medicamentoId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllMovimientos() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('movimientos', 'readonly');
    const store = tx.objectStore('movimientos');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ========== CONFIG ==========
async function getConfig(key) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('config', 'readonly');
    const store = tx.objectStore('config');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

async function setConfig(key, value) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('config', 'readwrite');
    const store = tx.objectStore('config');
    const req = store.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ========== HELPERS ==========
async function getStockTotal(medicamentoId) {
  const lotes = await getLotesByMedicamento(medicamentoId);
  return lotes.reduce((sum, l) => sum + (l.cantidad || 0), 0);
}

async function initDefaultAdmin() {
  const users = await getUsers();
  if (users.length === 0) {
    await addUser({
      username: 'admin',
      password: 'admin123',
      nombre: 'Administrador',
      rol: 'admin',
      activo: true,
      qrToken: generateQrToken()
    });
    await addUser({
      username: 'operario',
      password: 'operario123',
      nombre: 'Operario Demo',
      rol: 'operario',
      activo: true,
      qrToken: generateQrToken()
    });
  } else {
    // Asegurar que usuarios antiguos tengan token QR
    for (const u of users) {
      if (!u.qrToken) {
        u.qrToken = generateQrToken();
        await updateUser(u);
      }
    }
  }
}

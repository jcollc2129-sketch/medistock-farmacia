// MediStock Farmacia - Main Application
let currentUser = null;
let html5QrCode = null;
let currentPhoto = null;
let editingMedId = null;

// ========== INIT ==========
document.addEventListener('change', (e) => {
  if (e.target && (e.target.id === 'mov-med-select' || e.target.id === 'mov-tipo' || e.target.id === 'mov-med-id')) {
    updateMedicoField();
  }
});
document.addEventListener('DOMContentLoaded', async () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('SW registered');
    } catch (e) {
      console.log('SW registration failed', e);
    }
  }

  await openDB();
  await initDefaultAdmin();
  const seed = await seedDotacionIfEmpty();
  if (seed.seeded) {
    console.log('Dotación cargo cargada:', seed.count, 'medicamentos');
  }
  const seed2 = await seedNoCargoIfEmpty();
  if (seed2.seeded) {
    console.log('No cargo cargados:', seed2.count, 'medicamentos');
  }
  const seed3 = await seedHospitalarioIfEmpty();
  if (seed3.seeded) {
    console.log('Hospitalario cargados:', seed3.count, 'medicamentos');
  }
  const seed4 = await seedEstupefacientesIfEmpty();
  if (seed4.seeded) {
    console.log('Estupefacientes cargados:', seed4.count);
  }
  // Siempre intentar completar catálogos (solo añade los que faltan)
  try {
    if (typeof importarHospitalarioFaltante === 'function') {
      const h = await importarHospitalarioFaltante();
      if (h > 0) console.log('Hospitalario extra:', h);
    }
    if (typeof importarEstupefacientesFaltante === 'function') {
      const e = await importarEstupefacientesFaltante();
      if (e > 0) console.log('Estupefacientes extra:', e);
    }
  } catch (err) { console.warn(err); }
  checkSession();
});

function checkSession() {
  const saved = localStorage.getItem('medistock_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    showApp();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
}

// ========== AUTH ==========
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  const user = await getUserByUsername(username);
  if (!user || user.password !== password || !user.activo) {
    errorEl.textContent = 'Usuario o contraseña incorrectos';
    errorEl.style.display = 'block';
    return;
  }

  currentUser = { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol };
  localStorage.setItem('medistock_user', JSON.stringify(currentUser));
  showApp();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('medistock_user');
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-form').reset();
  document.getElementById('login-error').style.display = 'none';
  stopScanner();
}

function startLoginQrScanner() {
  startScanner('_login_qr_');
}

async function handleQrLogin(raw) {
  let token = (raw || '').trim();
  // Aceptar formato MEDISTOCK:TOKEN:XXXX o solo el token
  if (token.startsWith('MEDISTOCK:')) {
    const parts = token.split(':');
    token = parts[parts.length - 1];
  }
  const user = await getUserByQrToken(token);
  const errorEl = document.getElementById('login-error');
  if (!user) {
    if (errorEl) {
      errorEl.textContent = 'Código QR no válido o usuario inactivo';
      errorEl.style.display = 'block';
    }
    showToast('Código QR no válido');
    return;
  }
  currentUser = { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol };
  localStorage.setItem('medistock_user', JSON.stringify(currentUser));
  if (errorEl) errorEl.style.display = 'none';
  showApp();
  showToast('Bienvenido/a, ' + user.nombre);
}

async function showUserQr(userId) {
  const users = await getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;
  if (!user.qrToken) {
    user.qrToken = generateQrToken();
    await updateUser(user);
  }
  document.getElementById('qr-user-title').textContent = 'QR de ' + user.nombre;
  document.getElementById('qr-user-subtitle').textContent = '@' + user.username + ' · ' + user.rol;
  document.getElementById('qr-user-token').textContent = user.qrToken;
  const box = document.getElementById('qr-user-canvas');
  box.innerHTML = '';
  const payload = 'MEDISTOCK:LOGIN:' + user.qrToken;
  if (typeof QRCode !== 'undefined') {
    // qrcode npm build exposes QRCode.toCanvas
    const canvas = document.createElement('canvas');
    box.appendChild(canvas);
    QRCode.toCanvas(canvas, payload, { width: 220, margin: 2, color: { dark: '#0f766e', light: '#ffffff' } }, function (err) {
      if (err) {
        box.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(payload) + '" alt="QR" style="width:220px;height:220px;">';
      }
    });
  } else {
    box.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(payload) + '" alt="QR" style="width:220px;height:220px;">';
  }
  document.getElementById('modal-qr-user').classList.add('show');
}

function closeModalQrUser() {
  document.getElementById('modal-qr-user').classList.remove('show');
}


async function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('header-user').textContent = `${currentUser.nombre} (${currentUser.rol})`;
  // Sincronizar al entrar
  try {
    const result = await pullFromCloud();
    if (result.imported) {
      showToast('Datos sincronizados desde la nube');
    }
  } catch (e) {
    console.warn(e);
  }
  updateSyncStatus(navigator.onLine);
  navigate('dashboard');
}

// ========== NAVIGATION ==========
function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`screen-${screen}`);
  if (el) el.classList.add('active');

  const nav = document.querySelector(`.nav-item[data-screen="${screen}"]`);
  if (nav) nav.classList.add('active');

  // Load data for screen
  if (screen === 'dashboard') loadDashboard();
  if (screen === 'inventario') loadInventario();
  if (screen === 'alertas') loadAlertas();
  if (screen === 'usuarios') loadUsuarios();
  if (screen === 'movimientos') loadMovimientos();
  if (screen === 'cargo') loadCargoList();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  const meds = await getMedicamentos();
  const lotes = await getAllLotes();
  const movs = await getAllMovimientos();

  const totalMeds = meds.length;
  const totalStock = lotes.reduce((s, l) => s + (l.cantidad || 0), 0);

  const hoy = new Date();
  const en30 = new Date();
  en30.setDate(en30.getDate() + 30);

  let caducados = 0;
  let proximos = 0;
  lotes.forEach(l => {
    if (l.cantidad <= 0) return;
    const cad = new Date(l.caducidad);
    if (cad < hoy) caducados++;
    else if (cad <= en30) proximos++;
  });

  document.getElementById('stat-meds').textContent = totalMeds;
  document.getElementById('stat-stock').textContent = totalStock;
  document.getElementById('stat-caducados').textContent = caducados;
  document.getElementById('stat-proximos').textContent = proximos;

  // Recent movements
  const recent = movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 8);
  const container = document.getElementById('recent-movs');
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📋</div>Sin movimientos aún</div>';
    return;
  }

  let html = '';
  for (const m of recent) {
    const med = meds.find(x => x.id === m.medicamentoId);
    const nombre = med ? med.nombreComercial : 'Desconocido';
    html += `
      <div class="mov-item">
        <div>
          <div class="mov-tipo ${m.tipo}">${m.tipo === 'entrada' ? '➕ Entrada' : '➖ Salida'} · ${m.cantidad} uds</div>
          <div class="text-sm" style="font-weight:600">${escapeHtml(nombre)}</div>
          ${renderMovAudit(m)}
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

// ========== INVENTARIO ==========
async function loadInventario(filter = '') {
  const meds = await getMedicamentos();
  const container = document.getElementById('med-list');
  const q = filter.toLowerCase().trim();

  let filtered = meds;
  if (q) {
    filtered = meds.filter(m =>
      (m.nombreComercial || '').toLowerCase().includes(q) ||
      (m.principioActivo || '').toLowerCase().includes(q) ||
      (m.barcode || '').includes(q) ||
      (m.ubicacion || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">💊</div>No hay medicamentos<br><button class="btn btn-primary mt-16" onclick="openNuevoMed()">+ Añadir primero</button></div>';
    return;
  }

  // Sort by name
  filtered.sort((a, b) => (a.nombreComercial || '').localeCompare(b.nombreComercial || ''));

  let html = '';
  for (const m of filtered) {
    const stock = await getStockTotal(m.id);
    const catMap = {
      comprimidos: 'badge-comprimidos', capsulas: 'badge-capsulas',
      ampollas: 'badge-ampollas', vial: 'badge-vial', jarabe: 'badge-jarabe',
      crema: 'badge-crema', otico: 'badge-otico', oftalmologico: 'badge-oftalmologico',
      ovulos: 'badge-ovulos', sobres: 'badge-sobres', gotas: 'badge-gotas',
      supositorios: 'badge-supositorios'
    };
    const catBadge = catMap[m.categoria] || 'badge-otros';
    const catLabels = {
      comprimidos: 'Comprimidos', capsulas: 'Cápsulas', ampollas: 'Ampollas',
      vial: 'Vial', jarabe: 'Jarabe', crema: 'Crema', otico: 'Ótico',
      oftalmologico: 'Oftalmológico', ovulos: 'Óvulos', sobres: 'Sobres',
      gotas: 'Gotas', supositorios: 'Supositorios', otros: 'Otros'
    };
    const catLabel = catLabels[m.categoria] || m.categoria || 'Otros';
    const min = m.stockMinimo != null ? m.stockMinimo : 0;
    const stockBadge = (min > 0 && stock < min) || stock <= 5 ? 'badge-bajo' : 'badge-stock';

    html += `
      <div class="card med-item" onclick="openDetalleMed(${m.id})">
        ${m.foto
          ? `<img class="med-photo" src="${m.foto}" alt="">`
          : `<div class="med-photo placeholder">💊</div>`}
        <div class="med-info">
          <div class="name">${escapeHtml(m.nombreComercial || m.principioActivo || 'Sin nombre')}</div>
          <div class="principio">${escapeHtml([m.principioActivo, m.dosis, m.presentacion].filter(Boolean).join(' · '))}</div>
          <div class="meta">
            <span class="badge ${catBadge}">${catLabel}</span>
            <span class="badge ${stockBadge}">${stock}${min > 0 ? '/' + min : ''} uds</span>
            <span class="badge ${
              (m.tipoStock === 'estupefaciente' || m.esEstupefaciente) ? 'badge-estup' :
              m.tipoStock === 'no_cargo' ? 'badge-no-cargo' :
              m.tipoStock === 'hospitalario' ? 'badge-hosp' : 'badge-cargo'
            }">${
              (m.tipoStock === 'estupefaciente' || m.esEstupefaciente) ? '⚠️ Estupefaciente' :
              m.tipoStock === 'no_cargo' ? 'No cargo' :
              m.tipoStock === 'hospitalario' ? 'Hospitalario' : 'Cargo'
            }</span>
            ${m.ubicacion ? ` · 📍 ${escapeHtml(m.ubicacion)}` : ''}
          </div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

function filterInventario() {
  const q = document.getElementById('search-inventario').value;
  loadInventario(q);
}

// ========== DETALLE MEDICAMENTO ==========
async function openDetalleMed(id) {
  const med = await getMedicamentoById(id);
  if (!med) return;

  const lotes = await getLotesByMedicamento(id);
  const movs = await getMovimientosByMedicamento(id);
  const stock = await getStockTotal(id);

  const hoy = new Date();
  const en30 = new Date();
  en30.setDate(en30.getDate() + 30);

  document.getElementById('detalle-titulo').textContent = med.nombreComercial || med.principioActivo;
  document.getElementById('detalle-principio').textContent = med.principioActivo || '—';
  const elDosis = document.getElementById('detalle-dosis');
  if (elDosis) elDosis.textContent = med.dosis || '—';
  const elPres = document.getElementById('detalle-presentacion');
  if (elPres) elPres.textContent = med.presentacion || '—';
  const elGrupo = document.getElementById('detalle-grupo');
  if (elGrupo) elGrupo.textContent = med.grupoTerapeutico || '—';
  const elMin = document.getElementById('detalle-stock-minimo');
  if (elMin) elMin.textContent = (med.stockMinimo != null ? med.stockMinimo : 0) + ' uds';
  const elTipo = document.getElementById('detalle-tipo-stock');
  if (elTipo) {
    if (med.tipoStock === 'estupefaciente' || med.esEstupefaciente) elTipo.textContent = '⚠️ Estupefaciente';
    else if (med.tipoStock === 'no_cargo') elTipo.textContent = 'No cargo';
    else if (med.tipoStock === 'hospitalario') elTipo.textContent = 'Uso hospitalario';
    else elTipo.textContent = 'Cargo';
  }
  document.getElementById('detalle-barcode').textContent = med.barcode || '—';
  document.getElementById('detalle-categoria').textContent = med.categoria || '—';
  document.getElementById('detalle-ubicacion').textContent = med.ubicacion || '—';
  document.getElementById('detalle-stock').textContent = stock + ' unidades';

  // Foto
  const fotoEl = document.getElementById('detalle-foto');
  if (med.foto) {
    fotoEl.src = med.foto;
    fotoEl.style.display = 'block';
  } else {
    fotoEl.style.display = 'none';
  }

  // Lotes
  let lotesHtml = '';
  if (lotes.length === 0) {
    lotesHtml = '<p class="text-muted text-sm">Sin lotes registrados</p>';
  } else {
    lotes.sort((a, b) => new Date(a.caducidad) - new Date(b.caducidad));
    for (const l of lotes) {
      if (l.cantidad <= 0) continue;
      const cad = new Date(l.caducidad);
      let cls = '';
      if (cad < hoy) cls = 'caducado';
      else if (cad <= en30) cls = 'proximo';

      lotesHtml += `
        <div class="lote-item ${cls}">
          <div class="lote-header">
            <span>Lote: ${escapeHtml(l.numeroLote)}</span>
            <span>${l.cantidad} uds</span>
          </div>
          <div class="lote-meta">Caducidad: ${formatDateShort(l.caducidad)} ${cls === 'caducado' ? '⚠️ CADUCADO' : cls === 'proximo' ? '⏰ Próximo' : ''}</div>
        </div>`;
    }
  }
  document.getElementById('detalle-lotes').innerHTML = lotesHtml;

  // Movimientos
  let movHtml = '';
  const recentMovs = movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 15);
  if (recentMovs.length === 0) {
    movHtml = '<p class="text-muted text-sm">Sin movimientos</p>';
  } else {
    for (const m of recentMovs) {
      movHtml += `
        <div class="mov-item">
          <div>
            <div class="mov-tipo ${m.tipo}">${m.tipo === 'entrada' ? '➕ Entrada' : '➖ Salida'} · ${m.cantidad} uds</div>
            ${renderMovAudit(m)}
          </div>
        </div>`;
    }
  }
  document.getElementById('detalle-movs').innerHTML = movHtml;

  // Store current id for actions
  document.getElementById('detalle-med-id').value = id;

  // Show modal
  document.getElementById('modal-detalle').classList.add('show');
}

function closeDetalle() {
  document.getElementById('modal-detalle').classList.remove('show');
}

// ========== NUEVO / EDITAR MEDICAMENTO ==========
function openNuevoMed() {
  editingMedId = null;
  currentPhoto = null;
  document.getElementById('form-med-title').textContent = 'Nuevo medicamento';
  document.getElementById('form-med').reset();
  document.getElementById('med-foto-preview').style.display = 'none';
  document.getElementById('med-foto-preview').src = '';
  document.getElementById('modal-med').classList.add('show');
  stopScanner();
}

async function openEditarMed() {
  const id = parseInt(document.getElementById('detalle-med-id').value);
  const med = await getMedicamentoById(id);
  if (!med) return;

  editingMedId = id;
  currentPhoto = med.foto || null;
  document.getElementById('form-med-title').textContent = 'Editar medicamento';
  document.getElementById('med-barcode').value = med.barcode || '';
  document.getElementById('med-nombre').value = med.nombreComercial || '';
  document.getElementById('med-principio').value = med.principioActivo || '';
  document.getElementById('med-dosis').value = med.dosis || '';
  document.getElementById('med-presentacion').value = med.presentacion || '';
  document.getElementById('med-grupo').value = med.grupoTerapeutico || '';
  document.getElementById('med-stock-minimo').value = med.stockMinimo != null ? med.stockMinimo : 0;
  const ts = document.getElementById('med-tipo-stock');
  if (ts) ts.value = med.tipoStock || 'cargo';
  const est = document.getElementById('med-estupefaciente');
  if (est) est.checked = !!med.esEstupefaciente;
  document.getElementById('med-categoria').value = med.categoria || 'comprimidos';
  document.getElementById('med-ubicacion').value = med.ubicacion || '';
  document.getElementById('med-notas').value = med.notas || '';

  const preview = document.getElementById('med-foto-preview');
  if (med.foto) {
    preview.src = med.foto;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  closeDetalle();
  document.getElementById('modal-med').classList.add('show');
}

function closeModalMed() {
  document.getElementById('modal-med').classList.remove('show');
  stopScanner();
}

async function saveMedicamento(e) {
  e.preventDefault();
  const barcode = document.getElementById('med-barcode').value.trim();
  const nombre = document.getElementById('med-nombre').value.trim();
  const principio = document.getElementById('med-principio').value.trim();
  const dosis = document.getElementById('med-dosis').value.trim();
  const presentacion = document.getElementById('med-presentacion').value.trim();
  const grupo = document.getElementById('med-grupo').value.trim();
  const stockMinimo = parseInt(document.getElementById('med-stock-minimo').value) || 0;
  const tipoStock = (document.getElementById('med-tipo-stock') || {}).value || 'cargo';
  let esEstupefaciente = !!(document.getElementById('med-estupefaciente') || {}).checked;
  if (tipoStock === 'estupefaciente') esEstupefaciente = true;
  const categoria = document.getElementById('med-categoria').value;
  const ubicacion = document.getElementById('med-ubicacion').value.trim();
  const notas = document.getElementById('med-notas').value.trim();

  if (!principio && !nombre) {
    showToast('Indica al menos principio activo o nombre comercial');
    return;
  }

  // Check unique barcode
  if (barcode) {
    const existing = await getMedicamentoByBarcode(barcode);
    if (existing && existing.id !== editingMedId) {
      showToast('Ya existe un medicamento con ese código de barras');
      return;
    }
  }

  const data = {
    barcode: barcode || null,
    nombreComercial: nombre || (principio + (dosis ? ' ' + dosis : '')),
    principioActivo: principio,
    dosis,
    presentacion,
    grupoTerapeutico: grupo,
    stockMinimo,
    tipoStock,
    esEstupefaciente,
    categoria,
    ubicacion,
    notas,
    foto: currentPhoto,
    updatedAt: new Date().toISOString()
  };

  if (editingMedId) {
    data.id = editingMedId;
    await updateMedicamento(data);
    showToast('Medicamento actualizado');
    scheduleSync();
  } else {
    data.createdAt = new Date().toISOString();
    await addMedicamento(data);
    showToast('Medicamento creado');
  }
  scheduleSync();

  closeModalMed();
  loadInventario();
  loadDashboard();
}

// ========== FOTO ==========
function capturePhoto() {
  document.getElementById('med-foto-input').click();
}

function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    // Compress a bit
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 600;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = (h * maxW) / w;
        w = maxW;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      currentPhoto = canvas.toDataURL('image/jpeg', 0.7);
      const preview = document.getElementById('med-foto-preview');
      preview.src = currentPhoto;
      preview.style.display = 'block';
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  currentPhoto = null;
  document.getElementById('med-foto-preview').style.display = 'none';
  document.getElementById('med-foto-input').value = '';
}

// ========== BARCODE SCANNER ==========
function startScanner(targetInputId) {
  const overlay = document.getElementById('scanner-overlay');
  const container = document.getElementById('scanner-container');
  if (!overlay || !container) {
    showToast('Error del escáner');
    return;
  }
  overlay.style.display = 'flex';
  container.innerHTML = '';

  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
  }

  html5QrCode = new Html5Qrcode('scanner-container');
  const config = { fps: 10, qrbox: { width: 280, height: 160 } };

  html5QrCode.start(
    { facingMode: 'environment' },
    config,
    (decodedText) => {
      stopScanner();
      if (targetInputId === '_login_qr_') {
        handleQrLogin(decodedText);
        return;
      }
      const input = document.getElementById(targetInputId);
      if (input) input.value = decodedText;
      showToast('Código leído: ' + decodedText);

      if (targetInputId === 'mov-barcode') {
        lookupBarcodeForMov(decodedText);
      }
    },
    () => {}
  ).catch(err => {
    showToast('No se pudo acceder a la cámara. Usa HTTPS o permite el permiso.');
    console.error(err);
    stopScanner();
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    }).catch(() => {});
  }
  const overlay = document.getElementById('scanner-overlay');
  const container = document.getElementById('scanner-container');
  if (overlay) overlay.style.display = 'none';
  if (container) container.innerHTML = '';
}

async function lookupBarcodeForMov(barcode) {
  if (!barcode || barcode.trim().length < 3) return;
  const med = await getMedicamentoByBarcode(barcode.trim());
  const nuevoMedGroup = document.getElementById('nuevo-med-group');
  if (med) {
    document.getElementById('mov-med-id').value = med.id;
    document.getElementById('mov-med-nombre').textContent = med.nombreComercial;
    document.getElementById('mov-med-info').style.display = 'block';
    updateMedicoField();
    const select = document.getElementById('mov-med-select');
    if (select) select.value = med.id;
    if (nuevoMedGroup) nuevoMedGroup.style.display = 'none';
    loadLotesForMov(med.id);
  } else {
    document.getElementById('mov-med-info').style.display = 'none';
    document.getElementById('mov-med-id').value = '';
    const select = document.getElementById('mov-med-select');
    if (select) select.value = '';
    // Si es entrada, mostrar campos para crear el medicamento
    if (document.getElementById('mov-tipo').value === 'entrada' && nuevoMedGroup) {
      nuevoMedGroup.style.display = 'block';
    }
  }
}

// ========== ENTRADA / SALIDA ==========

const MOTIVOS_ENTRADA = [
  'Compra / recepción de pedido',
  'Devolución a farmacia',
  'Ajuste de inventario',
  'Otro'
];
const MOTIVOS_SALIDA = [
  'Uso',
  'Caducado',
  'Otro'
];

function fillMotivos(tipo) {
  const sel = document.getElementById('mov-motivo');
  const label = document.getElementById('mov-motivo-label');
  const list = tipo === 'salida' ? MOTIVOS_SALIDA : MOTIVOS_ENTRADA;
  if (label) label.textContent = tipo === 'salida' ? 'Motivo de salida *' : 'Motivo de entrada *';
  sel.innerHTML = list.map(m => `<option value="${m}">${m}</option>`).join('');
  const otroGroup = document.getElementById('mov-motivo-otro-group');
  if (otroGroup) otroGroup.style.display = 'none';
  const otro = document.getElementById('mov-motivo-otro');
  if (otro) otro.value = '';
  sel.onchange = () => {
    if (otroGroup) otroGroup.style.display = sel.value === 'Otro' ? 'block' : 'none';
  };

  // Destino solo en salidas por "Uso"
  const destGroup = document.getElementById('mov-destino-group');
  const destOtroGroup = document.getElementById('mov-destino-otro-group');
  const destSel = document.getElementById('mov-destino');
  if (destGroup) {
    if (tipo === 'salida') {
      destGroup.style.display = 'block';
      if (destSel) destSel.value = '';
      const syncDestino = () => {
        const motivo = sel.value;
        // Destino obligatorio si es Uso
        if (motivo === 'Uso') {
          destGroup.style.display = 'block';
        } else if (motivo === 'Caducado') {
          destGroup.style.display = 'none';
          if (destOtroGroup) destOtroGroup.style.display = 'none';
          if (destSel) destSel.value = '';
        } else {
          destGroup.style.display = 'block';
        }
        if (destOtroGroup) {
          destOtroGroup.style.display = (destSel && destSel.value === 'Otro destino') ? 'block' : 'none';
        }
      };
      sel.onchange = () => {
        if (otroGroup) otroGroup.style.display = sel.value === 'Otro' ? 'block' : 'none';
        syncDestino();
      };
      if (destSel) {
        destSel.onchange = () => {
          if (destOtroGroup) destOtroGroup.style.display = destSel.value === 'Otro destino' ? 'block' : 'none';
        };
      }
      syncDestino();
    } else {
      destGroup.style.display = 'none';
      if (destOtroGroup) destOtroGroup.style.display = 'none';
      if (destSel) destSel.value = '';
    }
  }

  const hint = document.getElementById('mov-audit-hint');
  if (hint && currentUser) {
    hint.textContent = tipo === 'salida'
      ? `Control: la retirada quedará a nombre de ${currentUser.nombre} (@${currentUser.username}) con fecha y hora.`
      : `Quedará registrado: ${currentUser.nombre} · fecha y hora del movimiento.`;
  }
  updateMedicoField();
}

async function openMovimiento(tipo) {
  document.getElementById('mov-tipo').value = tipo;
  document.getElementById('form-mov-title').textContent = tipo === 'entrada' ? '➕ Nueva Entrada' : '➖ Nueva Salida';
  document.getElementById('form-mov').reset();
  document.getElementById('mov-tipo').value = tipo;
  fillMotivos(tipo);
  document.getElementById('mov-med-id').value = '';
  document.getElementById('mov-med-info').style.display = 'none';
  document.getElementById('mov-lotes-select').innerHTML = '<option value="">— Ninguno / Crear nuevo —</option>';
  const obs = document.getElementById('mov-observaciones');
  if (obs) obs.value = '';
  
  // Rellenar lista de medicamentos
  const meds = await getMedicamentos();
  const select = document.getElementById('mov-med-select');
  select.innerHTML = '<option value="">— Elige un medicamento —</option>';
  meds.sort((a, b) => (a.nombreComercial || '').localeCompare(b.nombreComercial || '')).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nombreComercial + (m.barcode ? ` (${m.barcode})` : '');
    select.appendChild(opt);
  });
  
  // Mostrar u ocultar campos según el tipo
  const nuevoLoteGroup = document.getElementById('nuevo-lote-group');
  const nuevoMedGroup = document.getElementById('nuevo-med-group');
  if (tipo === 'entrada') {
    nuevoLoteGroup.style.display = 'block';
    nuevoMedGroup.style.display = 'block'; // Permitir crear medicamento nuevo
  } else {
    nuevoLoteGroup.style.display = 'none';
    nuevoMedGroup.style.display = 'none';
  }
  
  document.getElementById('modal-mov').classList.add('show');
  stopScanner();
}

async function onMedSelectChange(medId) {
  const nuevoMedGroup = document.getElementById('nuevo-med-group');
  if (!medId) {
    document.getElementById('mov-med-id').value = '';
    document.getElementById('mov-med-info').style.display = 'none';
    document.getElementById('mov-lotes-select').innerHTML = '<option value="">— Ninguno / Crear nuevo —</option>';
    // Si es entrada, mostrar campos de medicamento nuevo
    if (document.getElementById('mov-tipo').value === 'entrada') {
      nuevoMedGroup.style.display = 'block';
    }
    return;
  }
  const med = await getMedicamentoById(parseInt(medId));
  if (med) {
    document.getElementById('mov-med-id').value = med.id;
    document.getElementById('mov-med-nombre').textContent = med.nombreComercial;
    document.getElementById('mov-med-info').style.display = 'block';
    updateMedicoField();
    document.getElementById('mov-barcode').value = med.barcode || '';
    nuevoMedGroup.style.display = 'none'; // Ya existe, ocultar creación
    loadLotesForMov(med.id);
  }
}

function closeModalMov() {
  document.getElementById('modal-mov').classList.remove('show');
  stopScanner();
}

async function loadLotesForMov(medId) {
  const lotes = await getLotesByMedicamento(medId);
  const select = document.getElementById('mov-lotes-select');
  select.innerHTML = '<option value="">— Ninguno / Crear nuevo —</option>';

  const hoy = new Date();
  lotes.filter(l => l.cantidad > 0).sort((a, b) => new Date(a.caducidad) - new Date(b.caducidad)).forEach(l => {
    const cad = new Date(l.caducidad);
    const status = cad < hoy ? ' (CADUCADO)' : '';
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = `Lote ${l.numeroLote} · ${l.cantidad} uds · Cad: ${formatDateShort(l.caducidad)}${status}`;
    select.appendChild(opt);
  });
}

async function saveMovimiento(e) {
  e.preventDefault();
  const tipo = document.getElementById('mov-tipo').value;
  let medId = parseInt(document.getElementById('mov-med-id').value);
  const cantidad = parseInt(document.getElementById('mov-cantidad').value);
  let motivo = document.getElementById('mov-motivo').value;
  if (motivo === 'Otro') {
    const otro = (document.getElementById('mov-motivo-otro') || {}).value || '';
    motivo = otro.trim() ? ('Otro: ' + otro.trim()) : 'Otro';
  }
  if (!motivo) {
    showToast('Indica el motivo del movimiento');
    return;
  }
  const observaciones = (document.getElementById('mov-observaciones') || {}).value || '';
  let destino = '';
  if (tipo === 'salida') {
    const destSel = document.getElementById('mov-destino');
    destino = destSel ? destSel.value : '';
    if (destino === 'Otro destino') {
      const dOtro = (document.getElementById('mov-destino-otro') || {}).value || '';
      destino = dOtro.trim() ? dOtro.trim() : 'Otro destino';
    }
    if (motivo === 'Uso' && !destino) {
      showToast('Indica el destino de la salida (consulta, carro, quirófano...)');
      return;
    }
    if (motivo === 'Caducado') destino = 'Caducado / baja';
  }
  let medicoSolicitante = '';
  if (tipo === 'salida') {
    let medCheck = null;
    try { medCheck = await getMedicamentoById(Number(medId)); } catch (e) {}
    if (medCheck && medCheck.esEstupefaciente) {
      medicoSolicitante = ((document.getElementById('mov-medico') || {}).value || '').trim();
      if (!medicoSolicitante) {
        showToast('⚠️ Estupefaciente: indica el nombre del médico solicitante');
        return;
      }
    }
  }
  const loteId = document.getElementById('mov-lotes-select').value;
  const nuevoLote = document.getElementById('mov-nuevo-lote').value.trim();
  const nuevaCaducidad = document.getElementById('mov-nueva-caducidad').value;
  const barcode = document.getElementById('mov-barcode').value.trim();

  // Si no hay medicamento seleccionado y es entrada → intentar crear uno nuevo
  if ((!medId || isNaN(medId)) && tipo === 'entrada') {
    const nombre = document.getElementById('mov-nuevo-nombre').value.trim();
    const principio = document.getElementById('mov-nuevo-principio').value.trim();
    const categoria = document.getElementById('mov-nuevo-categoria').value;
    const ubicacion = document.getElementById('mov-nuevo-ubicacion').value.trim();

    if (!nombre) {
      showToast('Indica el nombre del medicamento o selecciónalo de la lista');
      return;
    }

    // Comprobar si el código de barras ya existe
    if (barcode) {
      const existing = await getMedicamentoByBarcode(barcode);
      if (existing) {
        medId = existing.id;
      }
    }

    if (!medId || isNaN(medId)) {
      medId = await addMedicamento({
        barcode: barcode || null,
        nombreComercial: nombre,
        principioActivo: principio,
        categoria: categoria || 'otros',
        ubicacion: ubicacion,
        notas: '',
        foto: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast('Medicamento creado y entrada registrada');
    }
  }

  if (!medId || isNaN(medId)) {
    showToast('Primero selecciona o crea un medicamento');
    return;
  }
  if (!cantidad || cantidad <= 0) {
    showToast('Indica una cantidad válida');
    return;
  }

  let finalLoteId = loteId ? parseInt(loteId) : null;

  if (tipo === 'entrada') {
    if (finalLoteId) {
      const lote = await getLoteById(finalLoteId);
      lote.cantidad += cantidad;
      await updateLote(lote);
    } else {
      const caducidadFinal = nuevaCaducidad || getDefaultCaducidad();
      finalLoteId = await addLote({
        medicamentoId: medId,
        numeroLote: nuevoLote || 'S/N',
        caducidad: caducidadFinal,
        cantidad: cantidad,
        createdAt: new Date().toISOString()
      });
    }
  } else {
    if (!finalLoteId) {
      showToast('Para una salida debes seleccionar un lote');
      return;
    }
    const lote = await getLoteById(finalLoteId);
    if (lote.cantidad < cantidad) {
      showToast(`Stock insuficiente en el lote (disponible: ${lote.cantidad})`);
      return;
    }
    lote.cantidad -= cantidad;
    await updateLote(lote);
  }

  const ahora = new Date();
  await addMovimiento({
    medicamentoId: medId,
    loteId: finalLoteId,
    tipo,
    cantidad,
    motivo,
    destino: destino || null,
    medicoSolicitante: medicoSolicitante || null,
    observaciones: (observaciones || '').trim() || null,
    usuario: currentUser.nombre,
    username: currentUser.username,
    usuarioId: currentUser.id,
    rol: currentUser.rol,
    fecha: ahora.toISOString()
  });

  showToast(tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada');
  scheduleSync();
  closeModalMov();
  loadDashboard();
  loadInventario();
}

// Caducidad por defecto: dentro de 2 años
function getDefaultCaducidad() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().split('T')[0];
}

// Toggle: en entrada el grupo de nuevo lote siempre visible; en salida se oculta
function onLoteSelectChange() {
  const tipo = document.getElementById('mov-tipo').value;
  const nuevoGroup = document.getElementById('nuevo-lote-group');
  if (tipo === 'entrada') {
    nuevoGroup.style.display = 'block';
  } else {
    nuevoGroup.style.display = 'none';
  }
}

// ========== ALERTAS ==========
async function loadAlertas() {
  const lotes = await getAllLotes();
  const meds = await getMedicamentos();
  const hoy = new Date();
  const en30 = new Date();
  en30.setDate(en30.getDate() + 30);
  const en90 = new Date();
  en90.setDate(en90.getDate() + 90);

  const alerts = [];

  // Caducidad
  for (const l of lotes) {
    if (l.cantidad <= 0) continue;
    const cad = new Date(l.caducidad);
    const med = meds.find(m => m.id === l.medicamentoId);
    if (!med) continue;

    let nivel = null;
    if (cad < hoy) nivel = 'caducado';
    else if (cad <= en30) nivel = 'proximo30';
    else if (cad <= en90) nivel = 'proximo90';

    if (nivel) {
      alerts.push({
        tipo: 'caducidad',
        med,
        lote: l,
        nivel,
        dias: Math.ceil((cad - hoy) / (1000 * 60 * 60 * 24))
      });
    }
  }

  // Stock bajo mínimo (dotación)
  for (const med of meds) {
    const min = med.stockMinimo != null ? med.stockMinimo : 0;
    if (min <= 0) continue;
    const stock = await getStockTotal(med.id);
    if (stock < min) {
      alerts.push({
        tipo: 'stock',
        med,
        stock,
        min,
        nivel: 'bajo_minimo'
      });
    }
  }

  alerts.sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'stock' ? -1 : 1;
    if (a.tipo === 'caducidad') return new Date(a.lote.caducidad) - new Date(b.lote.caducidad);
    return (a.stock / a.min) - (b.stock / b.min);
  });

  const container = document.getElementById('alertas-list');
  if (alerts.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">✅</div>No hay alertas de caducidad ni de stock mínimo</div>';
    return;
  }

  let html = '';
  for (const a of alerts) {
    if (a.tipo === 'stock') {
      html += `
      <div class="alert-item" onclick="openDetalleMed(${a.med.id})">
        <div class="med-photo placeholder">📉</div>
        <div class="med-info">
          <div class="name">${escapeHtml(a.med.nombreComercial || a.med.principioActivo)}</div>
          <div class="principio">Stock ${a.stock} / mínimo ${a.min}</div>
          <div class="meta">
            <span class="badge badge-bajo">BAJO MÍNIMO</span>
            ${a.med.grupoTerapeutico ? escapeHtml(a.med.grupoTerapeutico) : ''}
          </div>
        </div>
      </div>`;
      continue;
    }
    const badge = a.nivel === 'caducado' ? 'badge-caducado' :
                  a.nivel === 'proximo30' ? 'badge-proximo' : 'badge-bajo';
    const label = a.nivel === 'caducado' ? 'CADUCADO' : `${a.dias} días`;

    html += `
      <div class="alert-item" onclick="openDetalleMed(${a.med.id})">
        ${a.med.foto
          ? `<img class="med-photo" src="${a.med.foto}" alt="">`
          : `<div class="med-photo placeholder">💊</div>`}
        <div class="med-info">
          <div class="name">${escapeHtml(a.med.nombreComercial || a.med.principioActivo)}</div>
          <div class="principio">Lote ${escapeHtml(a.lote.numeroLote)} · ${a.lote.cantidad} uds</div>
          <div class="meta">
            <span class="badge ${badge}">${label}</span>
            Cad: ${formatDateShort(a.lote.caducidad)}
          </div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

// ========== MOVIMIENTOS GLOBALES ==========
async function loadMovimientos() {
  const movs = await getAllMovimientos();
  const meds = await getMedicamentos();
  const container = document.getElementById('movimientos-list');

  const sorted = movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 50);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📋</div>Sin movimientos registrados</div>';
    return;
  }

  let html = '';
  for (const m of sorted) {
    const med = meds.find(x => x.id === m.medicamentoId);
    const nombre = med ? (med.nombreComercial || med.principioActivo) : '—';
    html += `
      <div class="card mov-card ${m.tipo}">
        <div class="mov-tipo ${m.tipo}">${m.tipo === 'entrada' ? '➕ ENTRADA' : '➖ SALIDA'} · ${m.cantidad} uds</div>
        <div class="text-sm" style="font-weight:700;margin:4px 0">${escapeHtml(nombre)}</div>
        ${renderMovAudit(m)}
      </div>`;
  }
  container.innerHTML = html;
}

// ========== USUARIOS ==========
async function loadUsuarios() {
  if (currentUser.rol !== 'admin') {
    document.getElementById('usuarios-list').innerHTML = '<div class="empty-state">Solo administradores pueden gestionar usuarios</div>';
    return;
  }

  const users = await getUsers();
  const container = document.getElementById('usuarios-list');

  let html = '';
  for (const u of users) {
    html += `
      <div class="card flex-between">
        <div>
          <div style="font-weight:700">${escapeHtml(u.nombre)}</div>
          <div class="text-sm text-muted">@${escapeHtml(u.username)} · ${u.rol}</div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-secondary" onclick="showUserQr(${u.id})">📱 QR</button>
          ${u.username !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id})">Eliminar</button>` : ''}
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

function openNuevoUsuario() {
  document.getElementById('form-user').reset();
  document.getElementById('modal-user').classList.add('show');
}

function closeModalUser() {
  document.getElementById('modal-user').classList.remove('show');
}

async function saveUsuario(e) {
  e.preventDefault();
  const username = document.getElementById('user-username').value.trim();
  const password = document.getElementById('user-password').value;
  const nombre = document.getElementById('user-nombre').value.trim();
  const rol = document.getElementById('user-rol').value;

  if (!username || !password || !nombre) {
    showToast('Completa todos los campos');
    return;
  }

  const existing = await getUserByUsername(username);
  if (existing) {
    showToast('Ese nombre de usuario ya existe');
    return;
  }

  await addUser({ username, password, nombre, rol, activo: true, qrToken: generateQrToken() });
  showToast('Usuario creado');
  scheduleSync();
  closeModalUser();
  loadUsuarios();
}

async function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  await deleteUser(id);
  showToast('Usuario eliminado');
  scheduleSync();
  loadUsuarios();
}


function renderMovAudit(m) {
  const quien = m.usuario || m.username || '—';
  const userTag = m.username ? ` (@${m.username})` : '';
  const cuando = formatDate(m.fecha);
  if (m.tipo === 'salida') {
    let extra = '';
    if (m.destino) extra += `<div class="mov-audit">📍 Destino: <strong>${escapeHtml(m.destino)}</strong></div>`;
    if (m.medicoSolicitante) extra += `<div class="mov-audit" style="color:#9f1239">⚠️ Médico solicitante: <strong>${escapeHtml(m.medicoSolicitante)}</strong></div>`;
    if (m.observaciones) extra += `<div class="mov-audit">📝 ${escapeHtml(m.observaciones)}</div>`;
    return `<div class="mov-audit">👤 Retirado por: <strong>${escapeHtml(quien)}</strong>${escapeHtml(userTag)} · 🕒 ${cuando}</div>
            <div class="mov-audit">📋 Motivo: <strong>${escapeHtml(m.motivo || '—')}</strong></div>
            ${extra}`;
  }
  return `<div class="mov-audit">👤 Registrado por: <strong>${escapeHtml(quien)}</strong>${escapeHtml(userTag)} · 🕒 ${cuando}</div>
          <div class="mov-audit">📋 Motivo: <strong>${escapeHtml(m.motivo || '—')}</strong>${m.observaciones ? ' · ' + escapeHtml(m.observaciones) : ''}</div>`;
}

// ========== UTILS ==========
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// Quick actions from detalle
function fromDetalleEntrada() {
  const id = document.getElementById('detalle-med-id').value;
  closeDetalle();
  openMovimiento('entrada').then(() => {
    setTimeout(async () => {
      const med = await getMedicamentoById(parseInt(id));
      if (med) {
        document.getElementById('mov-barcode').value = med.barcode || '';
        document.getElementById('mov-med-id').value = med.id;
        document.getElementById('mov-med-nombre').textContent = med.nombreComercial;
        document.getElementById('mov-med-info').style.display = 'block';
        const select = document.getElementById('mov-med-select');
        if (select) select.value = med.id;
        loadLotesForMov(med.id);
      }
    }, 150);
  });
}

function fromDetalleSalida() {
  const id = document.getElementById('detalle-med-id').value;
  closeDetalle();
  openMovimiento('salida').then(() => {
    setTimeout(async () => {
      const med = await getMedicamentoById(parseInt(id));
      if (med) {
        document.getElementById('mov-barcode').value = med.barcode || '';
        document.getElementById('mov-med-id').value = med.id;
        document.getElementById('mov-med-nombre').textContent = med.nombreComercial;
        document.getElementById('mov-med-info').style.display = 'block';
        const select = document.getElementById('mov-med-select');
        if (select) select.value = med.id;
        loadLotesForMov(med.id);
      }
    }, 150);
  });
}


async function cargarDotacion() {
  if (!currentUser || currentUser.rol !== 'admin') {
    showToast('Solo administradores');
    return;
  }
  if (!confirm('¿Añadir medicamentos de la dotación mínima que aún no estén en el inventario?')) return;
  showToast('Cargando dotación...');
  const n = await importarDotacionFaltante();
  const n2 = await importarNoCargoFaltante();
  const n3 = await importarHospitalarioFaltante();
  const n4 = await importarEstupefacientesFaltante();
  showToast(`Catálogos: +${n} cargo, +${n2} no cargo, +${n3} hosp., +${n4} estupef.`);
  scheduleSync();
  loadInventario();
  loadDashboard();
}


let filtroCargoActual = 'cargo';

function setFiltroCargo(tipo) {
  filtroCargoActual = tipo;
  const map = {
    cargo: 'btn-filtro-cargo',
    no_cargo: 'btn-filtro-no-cargo',
    hospitalario: 'btn-filtro-hosp',
    estupefaciente: 'btn-filtro-estup',
    todos: 'btn-filtro-todos'
  };
  Object.keys(map).forEach(t => {
    const btn = document.getElementById(map[t]);
    if (!btn) return;
    btn.className = 'btn btn-sm ' + (filtroCargoActual === t ? 'btn-primary' : 'btn-secondary');
    btn.style.flex = '1';
  });
  const hint = document.getElementById('cargo-hint');
  if (hint) {
    if (tipo === 'cargo') hint.textContent = 'Dotación mínima (cargo) — control de stock obligatorio';
    else if (tipo === 'no_cargo') hint.textContent = 'No cargo — pedidos y control por separado';
    else if (tipo === 'hospitalario') hint.textContent = 'Uso hospitalario — stock y pedidos de hospital';
    else if (tipo === 'estupefaciente') hint.textContent = 'Estupefacientes — requieren médico solicitante al retirar';
    else hint.textContent = 'Todos los medicamentos';
  }
  loadCargoList();
}

async function loadCargoList() {
  const meds = await getMedicamentos();
  const q = ((document.getElementById('search-cargo') || {}).value || '').toLowerCase().trim();
  let list = meds;
  if (filtroCargoActual === 'cargo') {
    list = meds.filter(m => (m.tipoStock || 'cargo') === 'cargo');
  } else if (filtroCargoActual === 'no_cargo') {
    list = meds.filter(m => m.tipoStock === 'no_cargo');
  } else if (filtroCargoActual === 'hospitalario') {
    list = meds.filter(m => m.tipoStock === 'hospitalario');
  } else if (filtroCargoActual === 'estupefaciente') {
    list = meds.filter(m => m.tipoStock === 'estupefaciente' || m.esEstupefaciente);
  }
  if (q) {
    list = list.filter(m =>
      (m.nombreComercial || '').toLowerCase().includes(q) ||
      (m.principioActivo || '').toLowerCase().includes(q) ||
      (m.presentacion || '').toLowerCase().includes(q)
    );
  }
  list.sort((a, b) => (a.nombreComercial || '').localeCompare(b.nombreComercial || ''));
  const container = document.getElementById('cargo-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📦</div>No hay medicamentos en este listado<br><button class="btn btn-primary mt-16" onclick="cargarCatalogos()">Cargar catálogos</button></div>';
    return;
  }
  let html = '';
  for (const m of list) {
    const stock = await getStockTotal(m.id);
    const min = m.stockMinimo != null ? m.stockMinimo : 0;
    const bajo = min > 0 && stock < min;
    html += `
      <div class="card med-item" onclick="openDetalleMed(${m.id})">
        <div class="med-photo placeholder">${(m.tipoStock === 'estupefaciente' || m.esEstupefaciente) ? '⚠️' : (m.tipoStock === 'no_cargo' ? '📋' : (m.tipoStock === 'hospitalario' ? '🏥' : '📦'))}</div>
        <div class="med-info">
          <div class="name">${escapeHtml(m.nombreComercial || m.principioActivo)}</div>
          <div class="principio">${escapeHtml([m.presentacion, m.principioActivo].filter(Boolean).join(' · '))}</div>
          <div class="meta">
            <span class="badge ${bajo ? 'badge-bajo' : 'badge-stock'}">${stock}${min > 0 ? '/' + min : ''} uds</span>
            <span class="badge ${
              (m.tipoStock === 'estupefaciente' || m.esEstupefaciente) ? 'badge-estup' :
              m.tipoStock === 'no_cargo' ? 'badge-no-cargo' :
              m.tipoStock === 'hospitalario' ? 'badge-hosp' : 'badge-cargo'
            }">${
              (m.tipoStock === 'estupefaciente' || m.esEstupefaciente) ? '⚠️ Estupefaciente' :
              m.tipoStock === 'no_cargo' ? 'No cargo' :
              m.tipoStock === 'hospitalario' ? 'Hospitalario' : 'Cargo'
            }</span>
          </div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

function filterCargoList() {
  loadCargoList();
}

async function cargarCatalogos() {
  if (!currentUser || currentUser.rol !== 'admin') {
    showToast('Solo administradores');
    return;
  }
  showToast('Cargando catálogos...');
  const n1 = await importarDotacionFaltante();
  const n2 = await importarNoCargoFaltante();
  const n3 = await importarHospitalarioFaltante();
  const n4 = await importarEstupefacientesFaltante();
  showToast(`Añadidos: ${n1} cargo, ${n2} no cargo, ${n3} hosp., ${n4} estupef.`);
  scheduleSync();
  loadCargoList();
  loadInventario();
  loadDashboard();
}


async function updateMedicoField() {
  const group = document.getElementById('mov-medico-group');
  const input = document.getElementById('mov-medico');
  if (!group) return;
  const tipo = (document.getElementById('mov-tipo') || {}).value || 'salida';
  const medId = (document.getElementById('mov-med-id') || {}).value
    || (document.getElementById('mov-med-select') || {}).value;
  let esEst = false;
  if (tipo === 'salida' && medId) {
    try {
      const med = await getMedicamentoById(Number(medId) || medId);
      esEst = !!(med && med.esEstupefaciente);
    } catch (e) {}
  }
  group.style.display = esEst ? 'block' : 'none';
  if (!esEst && input) input.value = '';
  if (esEst) {
    const hint = document.getElementById('mov-audit-hint');
    if (hint) hint.textContent = '⚠️ ESTUPEFACIENTE: indica el médico solicitante. Quedará registrado quién retira y el médico.';
  }
}

// Sync checkbox when choosing tipo estupefaciente
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'med-tipo-stock') {
    const est = document.getElementById('med-estupefaciente');
    if (est && e.target.value === 'estupefaciente') est.checked = true;
  }
});

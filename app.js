// app.js - Lógica principal con Mensajería, Notificaciones, Escala de Calendario y Contraste Oscuro

import { 
  getServiceInfo, saveServiceInfo, 
  getGuards, saveGuards, 
  getUsers, saveUsers, loginUser, getActiveSession, logoutActiveUser, registerNewUser, resetToDefaults,
  getMessages, saveMessages, getMessagesBetween, sendDirectMessage, markMessagesAsRead,
  getNotifications, saveNotifications, getNotificationsFor, addNotification, markNotificationsAsRead
} from './database.js';

// --- Estado Global de la Aplicación ---
let state = {
  serviceInfo: getServiceInfo(),
  guards: getGuards(),
  currentUser: null, // Cuenta de usuario logueada
  currentProfile: "user", // "user" | "admin"
  activeAdminTab: "admin-subview-planilla",
  activeGuardTab: "guard-view-cuadrante", // "guard-view-cuadrante" | "guard-view-mensajes"
  selectedGuardId: "",
  theme: "dark",
  editingGuardId: null,
  modalActiveDay: null,
  activeGuardChatId: null // Guardia seleccionado para chatear en el panel de Admin
};

const SPANISH_MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// --- Elementos del DOM ---
// Auth Screens
const authScreen = document.getElementById("auth-screen");
const appWrapper = document.getElementById("app-wrapper");
const boxLogin = document.getElementById("box-login");
const boxRegister = document.getElementById("box-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const authAlert = document.getElementById("auth-alert");
const linkToRegister = document.getElementById("link-to-register");
const linkToLogin = document.getElementById("link-to-login");
const sessionUserBadge = document.getElementById("session-user-badge");
const btnLogout = document.getElementById("btn-logout");

// Auth Inputs
const loginNombre = document.getElementById("login-nombre");
const loginPassword = document.getElementById("login-password");
const regNombre = document.getElementById("reg-nombre");
const regApellido = document.getElementById("reg-apellido");
const regEmail = document.getElementById("reg-email");
const regTelefono = document.getElementById("reg-telefono");
const regTipo = document.getElementById("reg-tipo");
const regPassword = document.getElementById("reg-password");

// Layout Profiles
const profileUserBtn = document.getElementById("profile-user-btn");
const profileAdminBtn = document.getElementById("profile-admin-btn");
const adminProfileToggle = document.getElementById("admin-profile-toggle");
const panelGuardia = document.getElementById("panel-guardia");
const panelAdmin = document.getElementById("panel-admin");
const themeToggleBtn = document.getElementById("theme-toggle");

// Admin Inputs
const adminServiceName = document.getElementById("admin-service-name");
const adminCoordinatorName = document.getElementById("admin-coordinator-name");
const adminMonthSelect = document.getElementById("admin-month-select");
const adminYearInput = document.getElementById("admin-year-input");
const bannerRevisionDate = document.getElementById("banner-revision-date");

// Admin Tabs & Views
const tabButtons = document.querySelectorAll(".tab-btn");
const adminSubviews = document.querySelectorAll(".admin-subview");

// Planilla Grid
const interactiveExcelGrid = document.getElementById("interactive-excel-grid");
const gridHeaderRowDays = document.getElementById("grid-header-row-days");
const gridHeaderRowNums = document.getElementById("grid-header-row-nums");
const gridTbodyGuards = document.getElementById("grid-tbody-guards");
const gridTotalRow = document.getElementById("grid-total-row");
const printPlanillaBtn = document.getElementById("print-planilla-btn");
const resetDbBtn = document.getElementById("reset-db-btn");

// Admin Calendar
const adminCalendarDays = document.getElementById("admin-calendar-days");
const adminCalendarTitle = document.getElementById("admin-calendar-title");

// Guard Personal Dashboard & Tabs
const guardSelector = document.getElementById("guard-selector");
const guardGreeting = document.getElementById("guard-greeting");
const guardTotalHours = document.getElementById("guard-total-hours");
const guardTotalShiftsDesc = document.getElementById("guard-total-shifts-desc");
const guardHoursProgressBar = document.getElementById("guard-hours-progress-bar");
const guardCoordinatorName = document.getElementById("guard-coordinator-name");
const guardServiceTitle = document.getElementById("guard-service-title");
const nextShiftTitle = document.getElementById("next-shift-title");
const nextShiftDetail = document.getElementById("next-shift-detail");
const nextShiftBadge = document.getElementById("next-shift-badge");
const nextShiftBadgeText = document.getElementById("next-shift-badge-text");
const guardCalendarDays = document.getElementById("guard-calendar-days");

const guardTabCuadrante = document.getElementById("guard-tab-cuadrante");
const guardTabMensajes = document.getElementById("guard-tab-mensajes");
const guardUnreadBadge = document.getElementById("guard-unread-badge");
const guardSubviews = document.querySelectorAll(".guard-subview-panel");

// Guard Messaging & Notifications
const guardNotificationsList = document.getElementById("guard-notifications-list");
const guardChatMessages = document.getElementById("guard-chat-messages");
const guardChatForm = document.getElementById("guard-chat-form");
const guardChatInput = document.getElementById("guard-chat-input");

// Admin Messaging
const adminChatGuardsList = document.getElementById("admin-chat-guards-list");
const adminChatTitle = document.getElementById("admin-chat-title");
const adminChatSubtitle = document.getElementById("admin-chat-subtitle");
const adminChatMessages = document.getElementById("admin-chat-messages");
const adminChatForm = document.getElementById("admin-chat-form");
const adminChatInput = document.getElementById("admin-chat-input");
const adminChatSendBtn = document.getElementById("admin-chat-send-btn");

// Modals
const dayEditorModal = document.getElementById("day-editor-modal");
const btnCloseDayModal = document.getElementById("btn-close-day-modal");
const btnSaveDayModal = document.getElementById("btn-save-day-modal");
const modalDayLabel = document.getElementById("modal-day-label");
const modalGuardsShiftsList = document.getElementById("modal-guards-shifts-list");

const confirmResetModal = document.getElementById("confirm-reset-modal");
const btnCancelReset = document.getElementById("btn-cancel-reset");
const btnConfirmReset = document.getElementById("btn-confirm-reset");

// Guard DB Form
const guardForm = document.getElementById("guard-form");
const guardFormTitle = document.getElementById("guard-form-title");
const formGuardId = document.getElementById("form-guard-id");
const formGuardAsoc = document.getElementById("form-guard-asoc");
const formGuardName = document.getElementById("form-guard-name");
const btnCancelGuardForm = document.getElementById("btn-cancel-guard-form");
const guardsListContainer = document.getElementById("guards-list-container");

let activePopover = null;

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupEventListeners();
  checkSession();
});

// --- Verificar Sesión Activa ---
function checkSession() {
  const session = getActiveSession();
  if (session) {
    initUserSession(session);
  } else {
    showAuthScreen();
  }
}

function showAuthScreen() {
  authScreen.style.display = "flex";
  appWrapper.style.display = "none";
  boxLogin.style.display = "block";
  boxRegister.style.display = "none";
}

function initUserSession(user) {
  state.currentUser = user;
  state.guards = getGuards(); // recargar
  state.serviceInfo = getServiceInfo();

  authScreen.style.display = "none";
  appWrapper.style.display = "flex";
  
  sessionUserBadge.textContent = `${user.nombre} (${user.tipo.toUpperCase()})`;

  loadDataToInputs();
  populateGuardSelector();

  if (user.tipo === "admin") {
    adminProfileToggle.style.display = "flex";
    guardSelector.style.display = "block";
    switchProfile("admin");
  } else {
    adminProfileToggle.style.display = "none";
    guardSelector.style.display = "none";
    
    if (user.guardId) {
      state.selectedGuardId = user.guardId;
    } else {
      const match = state.guards.find(g => g.name.includes(user.nombre.toUpperCase()));
      state.selectedGuardId = match ? match.id : (state.guards[0] ? state.guards[0].id : "");
    }
    
    // Forzar tab de cuadrante por defecto para guardia
    switchGuardTab("guard-view-cuadrante");
    switchProfile("user");
  }
}

// --- Manejo de Temas ---
function initTheme() {
  const savedTheme = localStorage.getItem("seguridad_theme") || "dark";
  state.theme = savedTheme;
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    updateThemeIcon(true);
  } else {
    document.body.classList.remove("light-theme");
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  if (state.theme === "dark") {
    state.theme = "light";
    document.body.classList.add("light-theme");
    updateThemeIcon(true);
  } else {
    state.theme = "dark";
    document.body.classList.remove("light-theme");
    updateThemeIcon(false);
  }
  localStorage.setItem("seguridad_theme", state.theme);
}

function updateThemeIcon(isLight) {
  themeToggleBtn.innerHTML = isLight 
    ? `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`
    : `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>`;
}

// --- Configurar Event Listeners ---
function setupEventListeners() {
  // Login/Registro toggle
  linkToRegister.addEventListener("click", (e) => {
    e.preventDefault();
    boxLogin.style.display = "none";
    boxRegister.style.display = "block";
    hideAuthAlert();
  });

  linkToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    boxLogin.style.display = "block";
    boxRegister.style.display = "none";
    hideAuthAlert();
  });

  // Login Submit
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = loginNombre.value;
    const pass = loginPassword.value;
    const tipo = document.getElementById("login-tipo").value;
    
    const user = loginUser(nombre, pass, tipo);
    if (user) {
      initUserSession(user);
      loginNombre.value = "";
      loginPassword.value = "";
    } else {
      showAuthAlert("Nombre, contraseña o tipo de usuario incorrectos.");
    }
  });

  // Registro Submit
  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = regNombre.value;
    const apellido = regApellido.value;
    const email = regEmail.value;
    const tel = regTelefono.value;
    const tipo = regTipo.value;
    const pass = regPassword.value;

    const res = registerNewUser(nombre, apellido, email, tel, tipo, pass);
    if (res.success) {
      initUserSession(res.user);
      regNombre.value = "";
      regApellido.value = "";
      regEmail.value = "";
      regTelefono.value = "";
      regPassword.value = "";
    } else {
      showAuthAlert(res.message);
    }
  });

  // Logout
  btnLogout.addEventListener("click", () => {
    logoutActiveUser();
    state.currentUser = null;
    showAuthScreen();
  });

  // Perfil toggle (Solo Admin)
  profileUserBtn.addEventListener("click", () => switchProfile("user"));
  profileAdminBtn.addEventListener("click", () => switchProfile("admin"));
  
  // Theme
  themeToggleBtn.addEventListener("click", toggleTheme);
  
  // Guard selector
  guardSelector.addEventListener("change", (e) => {
    state.selectedGuardId = e.target.value;
    renderUserDashboard();
  });
  
  // Inputs Admin
  adminServiceName.addEventListener("input", (e) => {
    state.serviceInfo.name = e.target.value.toUpperCase();
    saveServiceInfo(state.serviceInfo);
    updateGuardPanelStaticData();
  });
  
  adminCoordinatorName.addEventListener("input", (e) => {
    state.serviceInfo.coordinator = e.target.value.toUpperCase();
    saveServiceInfo(state.serviceInfo);
    updateGuardPanelStaticData();
  });
  
  adminMonthSelect.addEventListener("change", (e) => {
    state.serviceInfo.month = parseInt(e.target.value);
    saveServiceInfo(state.serviceInfo);
    updateRevisionDateInBanner();
    renderAll();
  });
  
  adminYearInput.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    if (val >= 2020 && val <= 2035) {
      state.serviceInfo.year = val;
      saveServiceInfo(state.serviceInfo);
      updateRevisionDateInBanner();
      renderAll();
    }
  });

  // Pestañas Administrador
  tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget.getAttribute("data-target");
      if (!target.startsWith("admin-subview")) return; // solo pestañas admin
      
      state.activeAdminTab = target;
      
      tabButtons.forEach(b => {
        if (b.getAttribute("data-target")?.startsWith("admin-subview")) {
          b.classList.remove("active");
        }
      });
      e.currentTarget.classList.add("active");
      
      adminSubviews.forEach(view => {
        if (view.id === target) {
          view.classList.add("active");
          view.style.display = (target === "admin-subview-mensajeria") ? "grid" : "flex";
        } else {
          view.classList.remove("active");
          view.style.display = "none";
        }
      });
      
      if (target === "admin-subview-mensajeria") {
        renderAdminChatGuards();
        renderAdminChatMessages();
      }
      
      closePopover();
    });
  });

  // Pestañas Guardia
  guardTabCuadrante.addEventListener("click", () => switchGuardTab("guard-view-cuadrante"));
  guardTabMensajes.addEventListener("click", () => switchGuardTab("guard-view-mensajes"));

  // Formulario de Chat de Guardia
  guardChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = guardChatInput.value.trim();
    if (!text) return;
    
    const guard = state.guards.find(g => g.id === state.selectedGuardId);
    const senderName = guard ? guard.name : state.currentUser.nombre;
    
    sendDirectMessage(state.selectedGuardId, "admin", senderName, text);
    guardChatInput.value = "";
    renderGuardMessagesAndNotifications();
  });

  // Formulario de Chat de Administrador
  adminChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = adminChatInput.value.trim();
    if (!text || !state.activeGuardChatId) return;

    sendDirectMessage("admin", state.activeGuardChatId, "ADMINISTRACIÓN", text);
    adminChatInput.value = "";
    renderAdminChatMessages();
  });

  // Guard Database Form
  guardForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveGuardForm();
  });

  btnCancelGuardForm.addEventListener("click", resetGuardForm);

  // Print & Reset
  printPlanillaBtn.addEventListener("click", () => {
    closePopover();
    window.print();
  });
  
  resetDbBtn.addEventListener("click", () => {
    confirmResetModal.classList.add("active");
  });
  
  btnCancelReset.addEventListener("click", () => {
    confirmResetModal.classList.remove("active");
  });
  
  btnConfirmReset.addEventListener("click", () => {
    const resetData = resetToDefaults();
    state.serviceInfo = resetData.serviceInfo;
    state.guards = resetData.guards;
    confirmResetModal.classList.remove("active");
    
    logoutActiveUser();
    state.currentUser = null;
    showAuthScreen();
  });

  // Modales
  btnCloseDayModal.addEventListener("click", () => {
    dayEditorModal.classList.remove("active");
  });
  
  btnSaveDayModal.addEventListener("click", saveDayModalShifts);

  document.addEventListener("click", (e) => {
    if (activePopover && !activePopover.contains(e.target) && !e.target.classList.contains('shift-cell')) {
      closePopover();
    }
  });
}

// --- Guard Tab Switcher ---
function switchGuardTab(tabId) {
  state.activeGuardTab = tabId;
  
  // Toggle buttons
  if (tabId === "guard-view-cuadrante") {
    guardTabCuadrante.classList.add("active");
    guardTabMensajes.classList.remove("active");
  } else {
    guardTabCuadrante.classList.remove("active");
    guardTabMensajes.classList.add("active");
    
    // Al entrar a la mensajería, marcar leídos
    markMessagesAsRead("admin", state.selectedGuardId);
    markNotificationsAsRead(state.selectedGuardId);
    updateGuardUnreadBadge();
  }

  // Toggle views
  guardSubviews.forEach(view => {
    if (view.id === tabId) {
      view.classList.add("active-subview");
      view.style.display = (tabId === "guard-view-mensajes") ? "grid" : "flex";
    } else {
      view.classList.remove("active-subview");
      view.style.display = "none";
    }
  });

  if (tabId === "guard-view-mensajes") {
    renderGuardMessagesAndNotifications();
  }
}

function updateGuardUnreadBadge() {
  const messages = getMessages().filter(m => m.from === "admin" && m.to === state.selectedGuardId && !m.read);
  const notifications = getNotificationsFor(state.selectedGuardId).filter(n => !n.read);
  
  const hasUnread = messages.length > 0 || notifications.length > 0;
  guardUnreadBadge.style.display = hasUnread ? "inline-block" : "none";
}

// --- Alertas de Auth ---
function showAuthAlert(msg) {
  authAlert.textContent = msg;
  authAlert.style.display = "block";
}

function hideAuthAlert() {
  authAlert.style.display = "none";
  authAlert.textContent = "";
}

// --- Carga Inicial de Inputs ---
function loadDataToInputs() {
  adminServiceName.value = state.serviceInfo.name;
  adminCoordinatorName.value = state.serviceInfo.coordinator;
  adminMonthSelect.value = state.serviceInfo.month;
  adminYearInput.value = state.serviceInfo.year;
  updateRevisionDateInBanner();
  updateGuardPanelStaticData();
}

function updateRevisionDateInBanner() {
  const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const m = shortMonths[state.serviceInfo.month];
  bannerRevisionDate.textContent = `1-${m}`;
}

function updateGuardPanelStaticData() {
  guardCoordinatorName.textContent = state.serviceInfo.coordinator || "--";
  guardServiceTitle.textContent = `Servicio: ${state.serviceInfo.name || "--"}`;
}

// --- Cambio de Perfil ---
function switchProfile(profile) {
  state.currentProfile = profile;
  closePopover();
  
  if (profile === "user") {
    profileUserBtn.classList.add("active");
    profileAdminBtn.classList.remove("active");
    panelGuardia.classList.add("active");
    panelAdmin.classList.remove("active");
    populateGuardSelector();
    renderUserDashboard();
  } else {
    profileUserBtn.classList.remove("active");
    profileAdminBtn.classList.add("active");
    panelGuardia.classList.remove("active");
    panelAdmin.classList.add("active");
    renderAdminViews();
  }
}

// --- Populate Guard Selector ---
function populateGuardSelector() {
  guardSelector.innerHTML = "";
  state.guards.forEach(guard => {
    const opt = document.createElement("option");
    opt.value = guard.id;
    opt.textContent = `${guard.asoc} - ${guard.name}`;
    guardSelector.appendChild(opt);
  });
  
  if (state.guards.length > 0) {
    if (!state.guards.some(g => g.id === state.selectedGuardId)) {
      state.selectedGuardId = state.guards[0].id;
    }
    guardSelector.value = state.selectedGuardId;
  }
}

// --- Renderizado Global ---
function renderAll() {
  if (state.currentProfile === "user") {
    renderUserDashboard();
  } else {
    renderAdminViews();
  }
}

function renderAdminViews() {
  renderPlanillaGrid();
  renderAdminCalendar();
  renderGuardsDatabaseList();
  if (state.activeAdminTab === "admin-subview-mensajeria") {
    renderAdminChatGuards();
    renderAdminChatMessages();
  }
}

// --- Helpers de Fecha ---
function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getDayOfWeekLetter(year, month, day) {
  const d = new Date(year, month, day);
  return DAY_LETTERS[d.getDay()];
}

// --- Helper Notificación de Turno ---
function logShiftChangeNotification(guardId, day, oldShift, newShift) {
  if (oldShift === newShift) return;

  const shortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const dateStr = `${day} de ${shortMonths[state.serviceInfo.month]}`;
  let text = "";

  const shiftNames = {
    "D": "Turno Día (12h)",
    "N": "Turno Noche (12h)",
    "F": "Franco",
    "": "Sin asignación (Vacío)"
  };

  const oldName = shiftNames[oldShift || ""];
  const newName = shiftNames[newShift || ""];

  if (!oldShift) {
    text = `Se te ha asignado el ${newName} para el día ${dateStr}.`;
  } else if (!newShift) {
    text = `Se ha cancelado tu turno de ${oldName} para el día ${dateStr}.`;
  } else {
    text = `Tu turno del día ${dateStr} cambió de ${oldName} a ${newName}.`;
  }

  addNotification(guardId, text);
}

// ================= RENDERIZADO DE PLANILLA EXCEL =================
function renderPlanillaGrid() {
  const month = state.serviceInfo.month;
  const year = state.serviceInfo.year;
  const numDays = daysInMonth(month, year);

  // 1. Renderizar Cabecera de Días
  gridHeaderRowDays.innerHTML = `
    <th rowspan="2" class="sticky-col-n">N°</th>
    <th rowspan="2" class="sticky-col-asoc">asoc</th>
    <th rowspan="2" class="sticky-col-name">APELLIDO Y NOMBRES</th>
  `;
  
  for (let d = 1; d <= numDays; d++) {
    const dayL = getDayOfWeekLetter(year, month, d);
    const th = document.createElement("th");
    th.className = "day-header";
    th.textContent = dayL;
    
    if (dayL === 'S' || dayL === 'D') {
      th.style.color = '#ef4444';
    }
    gridHeaderRowDays.appendChild(th);
  }
  
  gridHeaderRowDays.innerHTML += `<th rowspan="2" class="total-header">TOTAL</th>`;

  // 2. Renderizar Cabecera de Números
  gridHeaderRowNums.innerHTML = "";
  for (let d = 1; d <= numDays; d++) {
    const th = document.createElement("th");
    th.className = "day-header";
    th.textContent = d;
    
    const dayL = getDayOfWeekLetter(year, month, d);
    if (dayL === 'S' || dayL === 'D') {
      th.style.color = '#ef4444';
    }
    gridHeaderRowNums.appendChild(th);
  }

  // 3. Renderizar Filas de Guardias
  gridTbodyGuards.innerHTML = "";
  state.guards.forEach((guard, idx) => {
    const tr = document.createElement("tr");
    
    const tdIdx = document.createElement("td");
    tdIdx.className = "sticky-col-n";
    tdIdx.textContent = idx + 1;
    tr.appendChild(tdIdx);
    
    const tdAsoc = document.createElement("td");
    tdAsoc.className = "sticky-col-asoc";
    tdAsoc.textContent = guard.asoc;
    tr.appendChild(tdAsoc);
    
    const tdName = document.createElement("td");
    tdName.className = "sticky-col-name";
    tdName.textContent = guard.name;
    tr.appendChild(tdName);

    let guardHoursSum = 0;
    
    for (let d = 1; d <= numDays; d++) {
      const tdShift = document.createElement("td");
      tdShift.className = "shift-cell";
      
      const shiftVal = guard.shifts[d] || "";
      
      if (shiftVal === "D") {
        tdShift.classList.add("shift-dia");
        tdShift.textContent = "12";
        guardHoursSum += 12;
      } else if (shiftVal === "N") {
        tdShift.classList.add("shift-noche");
        tdShift.textContent = "12";
        guardHoursSum += 12;
      } else if (shiftVal === "F") {
        tdShift.classList.add("shift-franco");
        tdShift.textContent = "F";
      } else {
        tdShift.classList.add("shift-empty");
        tdShift.textContent = "";
      }

      tdShift.addEventListener("click", (e) => {
        openShiftPopover(e, guard.id, d);
      });

      tr.appendChild(tdShift);
    }

    const tdTotal = document.createElement("td");
    tdTotal.style.fontWeight = "700";
    tdTotal.textContent = guardHoursSum;
    tr.appendChild(tdTotal);

    gridTbodyGuards.appendChild(tr);
  });

  // 4. Renderizar Fila de Horas Diarias (Bottom)
  gridTotalRow.innerHTML = `<td colspan="3" class="sticky-col-name">HORAS DIARIAS</td>`;
  
  let grandTotalHours = 0;
  
  for (let d = 1; d <= numDays; d++) {
    let dayHours = 0;
    state.guards.forEach(guard => {
      const shiftVal = guard.shifts[d] || "";
      if (shiftVal === "D" || shiftVal === "N") {
        dayHours += 12;
      }
    });
    
    const tdDayTotal = document.createElement("td");
    tdDayTotal.style.fontWeight = "700";
    tdDayTotal.textContent = dayHours;
    gridTotalRow.appendChild(tdDayTotal);
    
    grandTotalHours += dayHours;
  }

  const tdGrandTotal = document.createElement("td");
  tdGrandTotal.style.fontWeight = "800";
  tdGrandTotal.style.color = "#10b981";
  tdGrandTotal.textContent = grandTotalHours;
  gridTotalRow.appendChild(tdGrandTotal);
}

// --- Popover para editar turnos inline ---
function openShiftPopover(event, guardId, day) {
  event.stopPropagation();
  closePopover();

  const cell = event.currentTarget;
  const rect = cell.getBoundingClientRect();

  const popover = document.createElement("div");
  popover.className = "popover-menu";
  
  const options = [
    { label: "Día (12h)", value: "D", colorClass: "dia" },
    { label: "Noche (12h)", value: "N", colorClass: "noche" },
    { label: "Franco (F)", value: "F", colorClass: "franco" },
    { label: "Limpiar", value: "", colorClass: "empty" }
  ];

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "popover-item";
    btn.innerHTML = `
      <span class="popover-dot ${opt.colorClass}"></span>
      <span>${opt.label}</span>
    `;
    btn.addEventListener("click", () => {
      const guard = state.guards.find(g => g.id === guardId);
      const oldShift = guard ? guard.shifts[day] : "";
      
      updateGuardShift(guardId, day, opt.value);
      logShiftChangeNotification(guardId, day, oldShift, opt.value);
      closePopover();
    });
    popover.appendChild(btn);
  });

  document.body.appendChild(popover);
  activePopover = popover;

  const popoverHeight = popover.offsetHeight;
  const popoverWidth = popover.offsetWidth;
  
  let top = rect.bottom + window.scrollY;
  let left = rect.left + window.scrollX - (popoverWidth / 2) + (rect.width / 2);

  if (top + popoverHeight > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - popoverHeight - 5;
  }
  if (left < 10) {
    left = 10;
  } else if (left + popoverWidth > window.innerWidth - 10) {
    left = window.innerWidth - popoverWidth - 10;
  }

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

function closePopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
}

function updateGuardShift(guardId, day, shiftValue) {
  state.guards = state.guards.map(g => {
    if (g.id === guardId) {
      const updatedShifts = { ...g.shifts };
      if (shiftValue === "") {
        delete updatedShifts[day];
      } else {
        updatedShifts[day] = shiftValue;
      }
      return { ...g, shifts: updatedShifts };
    }
    return g;
  });

  saveGuards(state.guards);
  renderAll();
}

// ================= RENDERIZADO DEL CALENDARIO ADMINISTRADOR =================
function renderAdminCalendar() {
  const month = state.serviceInfo.month;
  const year = state.serviceInfo.year;

  adminCalendarTitle.textContent = `Asignaciones de ${SPANISH_MONTHS[month]} ${year}`;
  adminCalendarDays.innerHTML = "";

  const numDays = daysInMonth(month, year);
  let firstDayIndex = new Date(year, month, 1).getDay();
  let offset = (firstDayIndex === 0) ? 6 : (firstDayIndex - 1);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const numDaysPrev = daysInMonth(prevMonth, prevYear);

  for (let i = offset - 1; i >= 0; i--) {
    const dayVal = numDaysPrev - i;
    const div = document.createElement("div");
    div.className = "calendar-cell other-month";
    div.innerHTML = `<span class="calendar-day-num">${dayVal}</span>`;
    adminCalendarDays.appendChild(div);
  }

  const todayDate = new Date();
  const isCurrentMonthYear = todayDate.getMonth() === month && todayDate.getFullYear() === year;
  const todayDayNum = todayDate.getDate();

  for (let d = 1; d <= numDays; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    if (isCurrentMonthYear && d === todayDayNum) {
      cell.classList.add("today");
    }

    const spanNum = document.createElement("span");
    spanNum.className = "calendar-day-num";
    spanNum.textContent = d;
    cell.appendChild(spanNum);

    const badgeList = document.createElement("div");
    badgeList.className = "calendar-badges-list";

    let count = 0;
    const maxVisibleBadges = 3;

    state.guards.forEach(guard => {
      const shiftVal = guard.shifts[d];
      if (shiftVal) {
        if (count < maxVisibleBadges) {
          const badge = document.createElement("div");
          
          if (shiftVal === "D") {
            badge.className = "calendar-guard-badge dia";
            badge.innerHTML = `<span>D</span> <strong>${guard.name.split(' ')[0]}</strong>`;
          } else if (shiftVal === "N") {
            badge.className = "calendar-guard-badge noche";
            badge.innerHTML = `<span>N</span> <strong>${guard.name.split(' ')[0]}</strong>`;
          } else if (shiftVal === "F") {
            badge.className = "calendar-guard-badge franco";
            badge.innerHTML = `<span>F</span> <strong>${guard.name.split(' ')[0]}</strong>`;
          }
          
          badgeList.appendChild(badge);
        }
        count++;
      }
    });

    if (count > maxVisibleBadges) {
      const more = document.createElement("div");
      more.className = "more-badge";
      more.textContent = `+ ${count - maxVisibleBadges} más`;
      badgeList.appendChild(more);
    }

    cell.appendChild(badgeList);

    cell.addEventListener("click", () => {
      openDayEditorModal(d);
    });

    adminCalendarDays.appendChild(cell);
  }

  const totalCells = offset + numDays;
  const nextMonthCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= nextMonthCells; d++) {
    const div = document.createElement("div");
    div.className = "calendar-cell other-month";
    div.innerHTML = `<span class="calendar-day-num">${d}</span>`;
    adminCalendarDays.appendChild(div);
  }
}

// --- Modal de Asignación por Día ---
function openDayEditorModal(day) {
  state.modalActiveDay = day;
  const month = state.serviceInfo.month;
  const year = state.serviceInfo.year;
  const dayL = getDayOfWeekLetter(year, month, day);
  
  const dayOfWeekNames = {
    'L': 'Lunes', 'J': 'Jueves', 'V': 'Viernes', 'S': 'Sábado', 'D': 'Domingo'
  };
  
  let dayName = dayOfWeekNames[dayL] || 'Día';
  if (dayL === 'M') {
    const fullDayOfWeek = new Date(year, month, day).getDay();
    dayName = fullDayOfWeek === 2 ? 'Martes' : 'Miércoles';
  }

  modalDayLabel.textContent = `${dayName} ${day} de ${SPANISH_MONTHS[month]} del ${year}`;
  modalGuardsShiftsList.innerHTML = "";

  state.guards.forEach(guard => {
    const row = document.createElement("div");
    row.className = "guard-shift-row";
    
    row.innerHTML = `
      <div class="guard-row-info">
        <span class="guard-row-name">${guard.name}</span>
        <span class="guard-row-asoc">Asoc: ${guard.asoc}</span>
      </div>
      <div class="shift-picker" data-guard-id="${guard.id}">
        <button class="picker-opt" data-shift="D" title="Turno Día">D</button>
        <button class="picker-opt" data-shift="N" title="Turno Noche">N</button>
        <button class="picker-opt" data-shift="F" title="Franco">F</button>
        <button class="picker-opt" data-shift="empty" title="Limpiar">&times;</button>
      </div>
    `;

    const activeShift = guard.shifts[day] || "empty";
    const opts = row.querySelectorAll(".picker-opt");
    
    opts.forEach(opt => {
      const shiftVal = opt.getAttribute("data-shift");
      if (shiftVal === activeShift) {
        opt.classList.add("selected");
      }
      
      opt.addEventListener("click", (e) => {
        opts.forEach(o => o.classList.remove("selected"));
        e.currentTarget.classList.add("selected");
      });
    });

    modalGuardsShiftsList.appendChild(row);
  });

  dayEditorModal.classList.add("active");
}

function saveDayModalShifts() {
  const day = state.modalActiveDay;
  if (!day) return;

  state.guards = state.guards.map(guard => {
    const picker = modalGuardsShiftsList.querySelector(`.shift-picker[data-guard-id="${guard.id}"]`);
    const selectedOpt = picker.querySelector(".picker-opt.selected");
    const shiftVal = selectedOpt ? selectedOpt.getAttribute("data-shift") : "empty";

    const oldShift = guard.shifts[day] || "";
    const newShift = shiftVal === "empty" ? "" : shiftVal;

    logShiftChangeNotification(guard.id, day, oldShift, newShift);

    const updatedShifts = { ...guard.shifts };
    if (shiftVal === "empty") {
      delete updatedShifts[day];
    } else {
      updatedShifts[day] = shiftVal;
    }

    return { ...guard, shifts: updatedShifts };
  });

  saveGuards(state.guards);
  dayEditorModal.classList.remove("active");
  renderAll();
}

// ================= GESTIÓN DE PERSONAL (GUARDS DATABASE) =================
function renderGuardsDatabaseList() {
  guardsListContainer.innerHTML = "";
  
  if (state.guards.length === 0) {
    guardsListContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:1rem;">No hay personal registrado</div>`;
    return;
  }

  state.guards.forEach(guard => {
    const item = document.createElement("div");
    item.className = "guard-list-item";
    
    item.innerHTML = `
      <div class="guard-item-details">
        <span class="guard-item-name">${guard.name}</span>
        <span class="guard-item-id">N° Socio: ${guard.asoc}</span>
      </div>
      <div class="action-buttons">
        <button class="icon-btn edit-guard" data-id="${guard.id}" title="Editar Datos">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="icon-btn delete delete-guard" data-id="${guard.id}" title="Eliminar Guardia">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;

    item.querySelector(".edit-guard").addEventListener("click", () => editGuardDetails(guard.id));
    item.querySelector(".delete-guard").addEventListener("click", () => deleteGuard(guard.id));

    guardsListContainer.appendChild(item);
  });
}

function editGuardDetails(guardId) {
  const guard = state.guards.find(g => g.id === guardId);
  if (!guard) return;

  state.editingGuardId = guardId;
  formGuardId.value = guard.id;
  formGuardAsoc.value = guard.asoc;
  formGuardName.value = guard.name;

  guardFormTitle.innerHTML = `
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
    Modificar Guardia
  `;
  btnCancelGuardForm.style.display = "inline-flex";
}

function deleteGuard(guardId) {
  const guard = state.guards.find(g => g.id === guardId);
  if (!guard) return;

  if (confirm(`¿Estás seguro de que quieres eliminar a ${guard.name}? Se perderán sus turnos registrados en este mes y su cuenta de usuario.`)) {
    // 1. Quitar Guardia
    state.guards = state.guards.filter(g => g.id !== guardId);
    saveGuards(state.guards);

    // 2. Quitar su cuenta de usuario
    let users = getUsers();
    users = users.filter(u => u.guardId !== guardId);
    saveUsers(users);

    populateGuardSelector();
    renderAll();
    
    if (state.editingGuardId === guardId) {
      resetGuardForm();
    }
  }
}

function saveGuardForm() {
  const asoc = formGuardAsoc.value.trim();
  const name = formGuardName.value.trim().toUpperCase();

  if (!asoc || !name) return;

  if (state.editingGuardId) {
    // Editar
    state.guards = state.guards.map(g => {
      if (g.id === state.editingGuardId) {
        return { ...g, asoc, name };
      }
      return g;
    });

    // Actualizar nombre y apellido en el usuario también
    let users = getUsers();
    users = users.map(u => {
      if (u.guardId === state.editingGuardId) {
        const parts = name.split(' ');
        const surname = parts[0] || "USUARIO";
        const firstname = parts.slice(1).join(' ') || "GUARDIA";
        return { ...u, nombre: surname, apellido: firstname };
      }
      return u;
    });
    saveUsers(users);
  } else {
    // Agregar nuevo guardia
    const newGuardId = "guard_" + Date.now();
    const newGuard = {
      id: newGuardId,
      asoc,
      name,
      shifts: {}
    };
    state.guards.push(newGuard);
    saveGuards(state.guards);

    // AUTO-CREAR cuenta de usuario real ligada
    const parts = name.split(' ');
    const username = parts[0] || "USUARIO";
    const surname = parts.slice(1).join(' ') || "GUARDIA";
    
    let users = getUsers();
    const searchName = username.toUpperCase();
    if (!users.some(u => u.nombre === searchName)) {
      users.push({
        nombre: searchName,
        apellido: surname,
        email: username.toLowerCase() + "@solucionar.com",
        telefono: "11559900",
        tipo: "guardia",
        contrasena: "123",
        guardId: newGuardId
      });
      saveUsers(users);
    }
  }

  resetGuardForm();
  populateGuardSelector();
  renderAll();
}

function resetGuardForm() {
  state.editingGuardId = null;
  formGuardId.value = "";
  formGuardAsoc.value = "";
  formGuardName.value = "";
  
  guardFormTitle.innerHTML = `
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    Registrar Nuevo Guardia
  `;
  btnCancelGuardForm.style.display = "none";
}

// ================= MENSAJERÍA ADMINISTRADOR (CHAT VIEWS) =================
function renderAdminChatGuards() {
  adminChatGuardsList.innerHTML = "";
  
  const messages = getMessages();
  
  state.guards.forEach(guard => {
    const item = document.createElement("div");
    item.className = "chat-guard-item";
    if (state.activeGuardChatId === guard.id) {
      item.classList.add("active");
    }

    // Contar no leídos de este guardia
    const unreadCount = messages.filter(m => m.from === guard.id && m.to === "admin" && !m.read).length;
    const badgeHTML = unreadCount > 0 ? `<span class="chat-badge-unread">${unreadCount}</span>` : "";

    item.innerHTML = `
      <div class="chat-guard-info">
        <span class="chat-guard-name">${guard.name}</span>
        <span class="chat-guard-asoc">Socio: ${guard.asoc}</span>
      </div>
      ${badgeHTML}
    `;

    item.addEventListener("click", () => {
      state.activeGuardChatId = guard.id;
      
      // Marcar leídos
      markMessagesAsRead(guard.id, "admin");
      
      // Renderizar listado de nuevo para remover badges e historial
      renderAdminChatGuards();
      renderAdminChatMessages();
    });

    adminChatGuardsList.appendChild(item);
  });
}

function renderAdminChatMessages() {
  adminChatMessages.innerHTML = "";
  
  if (!state.activeGuardChatId) {
    adminChatMessages.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.9rem;">
        Haz clic en un guardia de seguridad a la izquierda para ver su historial de mensajes.
      </div>
    `;
    adminChatInput.disabled = true;
    adminChatSendBtn.disabled = true;
    return;
  }

  // Activar entrada
  adminChatInput.disabled = false;
  adminChatSendBtn.disabled = false;

  const guard = state.guards.find(g => g.id === state.activeGuardChatId);
  if (guard) {
    adminChatTitle.textContent = guard.name;
    adminChatSubtitle.textContent = `Socio N° ${guard.asoc} - Chat Activo`;
  }

  const list = getMessagesBetween("admin", state.activeGuardChatId);
  
  if (list.length === 0) {
    adminChatMessages.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.95rem;">
        No hay mensajes registrados. ¡Escribe el primer mensaje!
      </div>
    `;
    return;
  }

  list.forEach(m => {
    const wrap = document.createElement("div");
    wrap.className = `chat-bubble-wrapper ${m.from === "admin" ? "from-me" : "from-other"}`;
    
    const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrap.innerHTML = `
      <div class="chat-bubble-meta">${m.senderName} • ${time}</div>
      <div class="chat-bubble">${m.text}</div>
    `;
    adminChatMessages.appendChild(wrap);
  });

  adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
}

// ================= PORTAL DE GUARDIA (USER DASHBOARD) =================
function renderUserDashboard() {
  const guardId = state.selectedGuardId;
  const guard = state.guards.find(g => g.id === guardId);
  
  updateGuardPanelStaticData();
  updateGuardUnreadBadge();
  
  if (!guard) {
    guardGreeting.textContent = "No hay guardias seleccionados";
    guardTotalHours.textContent = "0";
    guardTotalShiftsDesc.textContent = "0 turnos este mes";
    guardHoursProgressBar.style.width = "0%";
    nextShiftTitle.textContent = "Sin datos";
    nextShiftDetail.textContent = "Contacta al administrador para que configure tus turnos.";
    nextShiftBadge.className = "shift-status-badge ninguno";
    nextShiftBadgeText.textContent = "Inactivo";
    guardCalendarDays.innerHTML = "";
    return;
  }

  const firstName = guard.name.split(' ')[0];
  guardGreeting.textContent = `Hola, ${firstName} 👋`;

  let hoursSum = 0;
  let shiftCount = 0;
  
  Object.values(guard.shifts).forEach(val => {
    if (val === "D" || val === "N") {
      hoursSum += 12;
      shiftCount++;
    }
  });

  guardTotalHours.textContent = hoursSum;
  guardTotalShiftsDesc.textContent = `${shiftCount} turnos de 12 horas en este mes`;
  
  const progressPercent = Math.min((hoursSum / 288) * 100, 100);
  guardHoursProgressBar.style.width = `${progressPercent}%`;

  const today = new Date();
  let searchStartDay = 1;
  
  if (today.getMonth() === state.serviceInfo.month && today.getFullYear() === state.serviceInfo.year) {
    searchStartDay = today.getDate();
  } else {
    searchStartDay = 13;
  }

  const numDays = daysInMonth(state.serviceInfo.month, state.serviceInfo.year);
  let nextShiftDay = -1;
  let nextShiftType = "";

  for (let d = searchStartDay; d <= numDays; d++) {
    const shift = guard.shifts[d];
    if (shift === "D" || shift === "N") {
      nextShiftDay = d;
      nextShiftType = shift;
      break;
    }
  }

  if (nextShiftDay === -1) {
    for (let d = 1; d < searchStartDay; d++) {
      const shift = guard.shifts[d];
      if (shift === "D" || shift === "N") {
        nextShiftDay = d;
        nextShiftType = shift;
        break;
      }
    }
  }

  if (nextShiftDay !== -1) {
    const dayL = getDayOfWeekLetter(state.serviceInfo.year, state.serviceInfo.month, nextShiftDay);
    const dayOfWeekNames = {
      'L': 'Lunes', 'J': 'Jueves', 'V': 'Viernes', 'S': 'Sábado', 'D': 'Domingo'
    };
    
    let dayName = dayOfWeekNames[dayL] || 'Día';
    if (dayL === 'M') {
      const fullDayOfWeek = new Date(state.serviceInfo.year, state.serviceInfo.month, nextShiftDay).getDay();
      dayName = fullDayOfWeek === 2 ? 'Martes' : 'Miércoles';
    }

    const typeStr = nextShiftType === "D" ? "Turno Día" : "Turno Noche";
    const hoursStr = nextShiftType === "D" ? "06:00 - 18:00 hs" : "18:00 - 06:00 hs";
    const relationStr = nextShiftDay === today.getDate() && today.getMonth() === state.serviceInfo.month ? "Hoy" : (nextShiftDay === today.getDate() + 1 && today.getMonth() === state.serviceInfo.month ? "Mañana" : `${dayName} ${nextShiftDay}`);

    nextShiftTitle.textContent = `${relationStr} de ${SPANISH_MONTHS[state.serviceInfo.month]}`;
    nextShiftDetail.textContent = `${typeStr} / Horario: ${hoursStr}`;
    
    nextShiftBadge.className = `shift-status-badge ${nextShiftType === "D" ? "dia" : "noche"}`;
    nextShiftBadgeText.textContent = typeStr;
  } else {
    nextShiftTitle.textContent = "Sin turnos programados";
    nextShiftDetail.textContent = "No tienes turnos de trabajo registrados en este mes.";
    nextShiftBadge.className = "shift-status-badge franco";
    nextShiftBadgeText.textContent = "Franco";
  }

  renderGuardPersonalCalendar(guard);
  
  if (state.activeGuardTab === "guard-view-mensajes") {
    renderGuardMessagesAndNotifications();
  }
}

function renderGuardPersonalCalendar(guard) {
  const month = state.serviceInfo.month;
  const year = state.serviceInfo.year;
  const numDays = daysInMonth(month, year);
  
  guardCalendarDays.innerHTML = "";
  
  let firstDayIndex = new Date(year, month, 1).getDay();
  let offset = (firstDayIndex === 0) ? 6 : (firstDayIndex - 1);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const numDaysPrev = daysInMonth(prevMonth, prevYear);

  for (let i = offset - 1; i >= 0; i--) {
    const dayVal = numDaysPrev - i;
    const div = document.createElement("div");
    div.className = "calendar-cell other-month";
    div.innerHTML = `<span class="calendar-day-num">${dayVal}</span>`;
    guardCalendarDays.appendChild(div);
  }

  const todayDate = new Date();
  const isCurrentMonthYear = todayDate.getMonth() === month && todayDate.getFullYear() === year;
  const todayDayNum = todayDate.getDate();

  for (let d = 1; d <= numDays; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell readonly";
    if (isCurrentMonthYear && d === todayDayNum) {
      cell.classList.add("today");
    }

    const spanNum = document.createElement("span");
    spanNum.className = "calendar-day-num";
    spanNum.textContent = d;
    cell.appendChild(spanNum);

    const shiftVal = guard.shifts[d];
    if (shiftVal) {
      const badge = document.createElement("div");
      
      if (shiftVal === "D") {
        badge.className = "calendar-guard-badge dia";
        badge.style.fontSize = "0.75rem";
        badge.style.padding = "0.3rem 0.5rem";
        badge.innerHTML = `<strong>TURNO DÍA</strong><span style="font-size:0.6rem; opacity:0.8;">06-18h</span>`;
      } else if (shiftVal === "N") {
        badge.className = "calendar-guard-badge noche";
        badge.style.fontSize = "0.75rem";
        badge.style.padding = "0.3rem 0.5rem";
        badge.innerHTML = `<strong>TURNO NOCHE</strong><span style="font-size:0.6rem; opacity:0.8;">18-06h</span>`;
      } else if (shiftVal === "F") {
        badge.className = "calendar-guard-badge franco";
        badge.style.fontSize = "0.75rem";
        badge.style.padding = "0.3rem 0.5rem";
        badge.innerHTML = `<strong>FRANCO</strong>`;
      }
      
      cell.appendChild(badge);
    }

    guardCalendarDays.appendChild(cell);
  }

  const totalCells = offset + numDays;
  const nextMonthCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= nextMonthCells; d++) {
    const div = document.createElement("div");
    div.className = "calendar-cell other-month";
    div.innerHTML = `<span class="calendar-day-num">${d}</span>`;
    guardCalendarDays.appendChild(div);
  }
}

// ================= MESSAGES AND SYSTEM ALERTS (USER SUBVIEW 2) =================
function renderGuardMessagesAndNotifications() {
  const guardId = state.selectedGuardId;
  
  // 1. Renderizar Notificaciones
  guardNotificationsList.innerHTML = "";
  const notifs = getNotificationsFor(guardId);
  
  if (notifs.length === 0) {
    guardNotificationsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem 1rem;">
        No tienes alertas de asignación en este momento.
      </div>
    `;
  } else {
    notifs.forEach(n => {
      const card = document.createElement("div");
      card.className = "notification-card";
      
      const time = new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
                   new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      card.innerHTML = `
        <div class="notification-text">${n.text}</div>
        <div class="notification-time">${time}</div>
      `;
      guardNotificationsList.appendChild(card);
    });
  }

  // 2. Renderizar Mensajería con Admin
  guardChatMessages.innerHTML = "";
  const messages = getMessagesBetween(guardId, "admin");
  
  if (messages.length === 0) {
    guardChatMessages.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.9rem; text-align: center;">
        No hay mensajes en este chat. ¡Envía tu consulta a Administración!
      </div>
    `;
  } else {
    messages.forEach(m => {
      const wrap = document.createElement("div");
      wrap.className = `chat-bubble-wrapper ${m.from === guardId ? "from-me" : "from-other"}`;
      
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      wrap.innerHTML = `
        <div class="chat-bubble-meta">${m.senderName} • ${time}</div>
        <div class="chat-bubble">${m.text}</div>
      `;
      guardChatMessages.appendChild(wrap);
    });
  }
  
  guardChatMessages.scrollTop = guardChatMessages.scrollHeight;
}

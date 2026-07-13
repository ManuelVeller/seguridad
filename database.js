// database.js - Gestión de datos con 8 guardias ficticios aleatorios, mensajería y notificaciones

const INITIAL_SERVICE_INFO = {
  name: "HOTEL CAPITALINAS",
  coordinator: "HERRERA JORGE HERNAN",
  month: 6, // Julio
  year: 2026
};

// 8 Guardias de seguridad con nombres aleatorios y N° de socios de 5 dígitos al azar
const INITIAL_GUARDS = [
  {
    id: "g1",
    asoc: "19385",
    name: "GOMEZ CARLOS ALBERTO",
    shifts: {
      1: "D", 2: "D", 3: "D", 4: "D", 5: "F", 6: "F", 7: "F", 8: "F",
      9: "D", 10: "D", 11: "D", 12: "D", 13: "F", 14: "F", 15: "F", 16: "F",
      17: "D", 18: "D", 19: "D", 20: "D", 21: "F", 22: "F", 23: "F", 24: "F",
      25: "D", 26: "D", 27: "D", 28: "D", 29: "F", 30: "F", 31: "F"
    }
  },
  {
    id: "g2",
    asoc: "14832",
    name: "RODRIGUEZ MARIA BELEN",
    shifts: {
      1: "N", 2: "N", 3: "N", 4: "N", 5: "F", 6: "F", 7: "F", 8: "F",
      9: "N", 10: "N", 11: "N", 12: "N", 13: "F", 14: "F", 15: "F", 16: "F",
      17: "N", 18: "N", 19: "N", 20: "N", 21: "F", 22: "F", 23: "F", 24: "F",
      25: "N", 26: "N", 27: "N", 28: "N", 29: "F", 30: "F", 31: "F"
    }
  },
  {
    id: "g3",
    asoc: "15947",
    name: "FERNANDEZ LUIS DANIEL",
    shifts: {
      1: "F", 2: "F", 3: "F", 4: "F", 5: "D", 6: "D", 7: "D", 8: "D",
      9: "F", 10: "F", 11: "F", 12: "F", 13: "D", 14: "D", 15: "D", 16: "D",
      17: "F", 18: "F", 19: "F", 20: "F", 21: "D", 22: "D", 23: "D", 24: "D",
      25: "F", 26: "F", 27: "F", 28: "F", 29: "D", 30: "D", 31: "D"
    }
  },
  {
    id: "g4",
    asoc: "11039",
    name: "MARTINEZ ANA LAURA",
    shifts: {
      1: "F", 2: "F", 3: "F", 4: "F", 5: "N", 6: "N", 7: "N", 8: "N",
      9: "F", 10: "F", 11: "F", 12: "F", 13: "N", 14: "N", 15: "N", 16: "N",
      17: "F", 18: "F", 19: "F", 20: "F", 21: "N", 22: "N", 23: "N", 24: "N",
      25: "F", 26: "F", 27: "F", 28: "F", 29: "N", 30: "N", 31: "N"
    }
  },
  {
    id: "g5",
    asoc: "18451",
    name: "DIAZ JORGE HORACIO",
    shifts: {
      1: "D", 2: "D", 3: "F", 4: "F", 5: "N", 6: "N", 7: "F", 8: "F",
      9: "D", 10: "D", 11: "F", 12: "F", 13: "N", 14: "N", 15: "F", 16: "F",
      17: "D", 18: "D", 19: "F", 20: "F", 21: "N", 22: "N", 23: "F", 24: "F",
      25: "D", 26: "D", 27: "F", 28: "F", 29: "N", 30: "N", 31: "F"
    }
  },
  {
    id: "g6",
    asoc: "12964",
    name: "LOPEZ VALERIA SOFIA",
    shifts: {
      1: "N", 2: "N", 3: "F", 4: "F", 5: "D", 6: "D", 7: "F", 8: "F",
      9: "N", 10: "N", 11: "F", 12: "F", 13: "D", 14: "D", 15: "F", 16: "F",
      17: "N", 18: "N", 19: "F", 20: "F", 21: "D", 22: "D", 23: "F", 24: "F",
      25: "N", 26: "N", 27: "F", 28: "F", 29: "D", 30: "D", 31: "F"
    }
  },
  {
    id: "g7",
    asoc: "13782",
    name: "ALVAREZ NESTOR OMAR",
    shifts: {
      1: "F", 2: "F", 3: "D", 4: "D", 5: "F", 6: "F", 7: "N", 8: "N",
      9: "F", 10: "F", 11: "D", 12: "D", 13: "F", 14: "F", 15: "N", 16: "N",
      17: "F", 18: "F", 19: "D", 20: "D", 21: "F", 22: "F", 23: "N", 24: "N",
      25: "F", 26: "F", 27: "D", 28: "D", 29: "F", 30: "F", 31: "N"
    }
  },
  {
    id: "g8",
    asoc: "16215",
    name: "ROMERO CARLA ELISABET",
    shifts: {
      1: "F", 2: "F", 3: "N", 4: "N", 5: "F", 6: "F", 7: "D", 8: "D",
      9: "F", 10: "F", 11: "N", 12: "N", 13: "F", 14: "F", 15: "D", 16: "D",
      17: "F", 18: "F", 19: "N", 20: "N", 21: "F", 22: "F", 23: "D", 24: "D",
      25: "F", 26: "F", 27: "N", 28: "N", 29: "F", 30: "F", 31: "D"
    }
  }
];

// Cuentas de usuario iniciales asociadas a los perfiles aleatorios
const INITIAL_USERS = [
  {
    nombre: "ADMIN",
    apellido: "COOPERATIVA",
    email: "admin@solucionar.com",
    telefono: "11223344",
    tipo: "admin",
    contrasena: "admin"
  },
  {
    nombre: "GOMEZ",
    apellido: "CARLOS ALBERTO",
    email: "gomez.c@solucionar.com",
    telefono: "11342151",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g1"
  },
  {
    nombre: "RODRIGUEZ",
    apellido: "MARIA BELEN",
    email: "rodriguez.m@solucionar.com",
    telefono: "11874221",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g2"
  },
  {
    nombre: "FERNANDEZ",
    apellido: "LUIS DANIEL",
    email: "fernandez.l@solucionar.com",
    telefono: "11529147",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g3"
  },
  {
    nombre: "MARTINEZ",
    apellido: "ANA LAURA",
    email: "martinez.a@solucionar.com",
    telefono: "11419302",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g4"
  },
  {
    nombre: "DIAZ",
    apellido: "JORGE HORACIO",
    email: "diaz.j@solucionar.com",
    telefono: "11294154",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g5"
  },
  {
    nombre: "LOPEZ",
    apellido: "VALERIA SOFIA",
    email: "lopez.v@solucionar.com",
    telefono: "11985472",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g6"
  },
  {
    nombre: "ALVAREZ",
    apellido: "NESTOR OMAR",
    email: "alvarez.n@solucionar.com",
    telefono: "11487229",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g7"
  },
  {
    nombre: "ROMERO",
    apellido: "CARLA ELISABET",
    email: "romero.c@solucionar.com",
    telefono: "11394158",
    tipo: "guardia",
    contrasena: "123",
    guardId: "g8"
  }
];

// Mensajes iniciales de bienvenida
const INITIAL_MESSAGES = [
  {
    id: "msg_init_1",
    from: "admin",
    to: "g1",
    senderName: "ADMINISTRACIÓN",
    text: "Bienvenido a Solucionar Seguridad Privada. Aquí podrás consultar tu cuadrante de turnos mensual.",
    timestamp: Date.now() - 3600000 * 2, // Hace 2 horas
    read: false
  },
  {
    id: "msg_init_2",
    from: "g1",
    to: "admin",
    senderName: "GOMEZ CARLOS ALBERTO",
    text: "Muchas gracias, ya puedo visualizar mis turnos correctamente.",
    timestamp: Date.now() - 3600000 * 1, // Hace 1 hora
    read: true
  }
];

// Alertas de asignación iniciales
const INITIAL_NOTIFICATIONS = [
  {
    id: "not_init_1",
    userId: "g1",
    text: "El administrador te asignó el Turno de Día en el Hotel Capitalinas.",
    timestamp: Date.now() - 3600000 * 4,
    read: false
  }
];

const STORAGE_KEYS = {
  SERVICE_INFO: "seguridad_service_info",
  GUARDS: "seguridad_guards",
  USERS: "seguridad_users",
  SESSION: "seguridad_session",
  MESSAGES: "seguridad_messages",
  NOTIFICATIONS: "seguridad_notifications"
};

// --- Getters y Setters Básicos ---
export function getServiceInfo() {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICE_INFO);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return { ...INITIAL_SERVICE_INFO };
}

export function saveServiceInfo(info) {
  localStorage.setItem(STORAGE_KEYS.SERVICE_INFO, JSON.stringify(info));
}

export function getGuards() {
  const data = localStorage.getItem(STORAGE_KEYS.GUARDS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return JSON.parse(JSON.stringify(INITIAL_GUARDS));
}

export function saveGuards(guards) {
  localStorage.setItem(STORAGE_KEYS.GUARDS, JSON.stringify(guards));
}

export function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return JSON.parse(JSON.stringify(INITIAL_USERS));
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// --- Autenticación ---
export function loginUser(nombre, contrasena, tipo) {
  const users = getUsers();
  const searchName = nombre.trim().toUpperCase();
  
  const user = users.find(u => u.nombre.toUpperCase() === searchName && u.contrasena === contrasena && u.tipo === tipo);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  }
  return null;
}

export function getActiveSession() {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (session) {
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function logoutActiveUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function registerNewUser(nombre, apellido, email, telefono, tipo, contrasena) {
  const users = getUsers();
  const nombreUpper = nombre.trim().toUpperCase();
  const apellidoUpper = apellido.trim().toUpperCase();
  
  if (users.some(u => u.nombre.toUpperCase() === nombreUpper)) {
    return { success: false, message: "El nombre de usuario ya está registrado." };
  }

  const newUser = {
    nombre: nombreUpper,
    apellido: apellidoUpper,
    email: email.trim(),
    telefono: telefono.trim(),
    tipo: tipo,
    contrasena: contrasena
  };

  if (tipo === "guardia") {
    const guards = getGuards();
    const newGuardId = "guard_u_" + Date.now();
    const newAsoc = String(Math.floor(Math.random() * 90000) + 10000); // 5 dígitos
    
    const newGuard = {
      id: newGuardId,
      asoc: newAsoc,
      name: `${nombreUpper} ${apellidoUpper}`,
      shifts: {}
    };
    
    guards.push(newGuard);
    saveGuards(guards);
    newUser.guardId = newGuardId;
  }

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));

  return { success: true, user: newUser };
}

// --- Mensajería ---
export function getMessages() {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return JSON.parse(JSON.stringify(INITIAL_MESSAGES));
}

export function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getMessagesBetween(userIdA, userIdB) {
  const messages = getMessages();
  return messages.filter(m => 
    (m.from === userIdA && m.to === userIdB) || 
    (m.from === userIdB && m.to === userIdA)
  ).sort((a, b) => a.timestamp - b.timestamp);
}

export function sendDirectMessage(fromId, toId, senderName, text) {
  const messages = getMessages();
  const newMsg = {
    id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    from: fromId,
    to: toId,
    senderName: senderName,
    text: text,
    timestamp: Date.now(),
    read: false
  };
  messages.push(newMsg);
  saveMessages(messages);
  return newMsg;
}

export function markMessagesAsRead(fromUserId, toUserId) {
  let messages = getMessages();
  let updated = false;
  messages = messages.map(m => {
    if (m.from === fromUserId && m.to === toUserId && !m.read) {
      updated = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (updated) {
    saveMessages(messages);
  }
}

// --- Notificaciones ---
export function getNotifications() {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
}

export function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function getNotificationsFor(userId) {
  const notifications = getNotifications();
  return notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp); // Últimas primero
}

export function addNotification(userId, text) {
  const notifications = getNotifications();
  const newNotif = {
    id: "not_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    userId: userId,
    text: text,
    timestamp: Date.now(),
    read: false
  };
  notifications.push(newNotif);
  saveNotifications(notifications);
  return newNotif;
}

export function markNotificationsAsRead(userId) {
  let notifications = getNotifications();
  let updated = false;
  notifications = notifications.map(n => {
    if (n.userId === userId && !n.read) {
      updated = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (updated) {
    saveNotifications(notifications);
  }
}

// --- Resetear todo ---
export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.SERVICE_INFO);
  localStorage.removeItem(STORAGE_KEYS.GUARDS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  return {
    serviceInfo: { ...INITIAL_SERVICE_INFO },
    guards: JSON.parse(JSON.stringify(INITIAL_GUARDS)),
    users: JSON.parse(JSON.stringify(INITIAL_USERS))
  };
}

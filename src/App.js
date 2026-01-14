// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Lock,
  Phone,
  Star,
  Droplet,
  Calendar,
  Truck,
  MessageCircle,
  Settings,
  Edit2,
  ArrowLeft,
  Trash2,
  Plus,
  User,
  CheckCircle,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Key,
  Send,
  Minus,
  MapPin,
  Clock,
  Menu,
  X,
  Smartphone,
  Printer,
  Save,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
  MessageSquare,
  Camera,
  Users,
  DollarSign,
  RotateCcw,
  Percent,
  Search,
  QrCode,
  BellRing,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Unlock,
  ImageIcon as PhotoIcon,
  Wallet,
} from "lucide-react";

// Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDoc,
  arrayUnion,
  arrayRemove,
  orderBy  // <--- ¡ESTE ES EL QUE FALTABA!
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyA8Ujw8L5uErmgL_x3fNRx530fSWjavu7M",
  authDomain: "fast-wave-laundry-86d9f.firebaseapp.com",
  projectId: "fast-wave-laundry-86d9f",
  storageBucket: "fast-wave-laundry-86d9f.firebasestorage.app",
  messagingSenderId: "715908594206",
  appId: "1:715908594206:web:bba503cfb667cb4c390c0f",
  measurementId: "G-RV7JTXY252",
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn("Error Firebase:", error);
}

// --- 2. UTILS & HOOKS ---
const useTailwind = () => {
  useEffect(() => {
    // --- FIX PRINCIPAL PARA CELULARES ---
    let meta = document.querySelector("meta[name='viewport']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
      document.getElementsByTagName("head")[0].appendChild(meta);
    } else {
       if (!meta.content.includes('viewport-fit=cover')) {
           meta.content += ', viewport-fit=cover';
       }
    }

    // PRECARGA DE ESTILOS CRÍTICOS (CSS PLAN B)
    if (!document.querySelector("#critical-fix")) {
      const style = document.createElement("style");
      style.id = "critical-fix";
      style.innerHTML = `
        /* Seguridad para móviles */
        body { 
            margin: 0; 
            padding: 0; 
            -webkit-tap-highlight-color: transparent; 
            font-family: sans-serif; 
            background-color: #fff; 
        }
        
        /* --- FIX APPLE SAFE AREA --- */
        nav {
            padding-top: env(safe-area-inset-top) !important;
            height: auto !important;
            min-height: 80px;
        }

        /* Fix calendario iPhone */
        input[type="date"], input[type="time"] {
          -webkit-appearance: none !important;
          appearance: none !important;
          background-color: #fff !important;
          min-height: 50px !important;
          padding: 10px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0.5rem !important;
          width: 100% !important;
          display: block !important;
        }
        svg { max-width: 100%; height: auto; }
      `;
      document.head.appendChild(style);
    }

    if (!document.querySelector("#tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        window.tailwindLoaded = true;
      };
      document.head.appendChild(script);
    }
  }, []);
};

const useAppMode = (customIcon) => {
  useEffect(() => {
    // Script de Stripe se carga aquí por seguridad
    if (!document.querySelector("#stripe-js")) {
      const script = document.createElement("script");
      script.id = "stripe-js";
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  useEffect(() => {
    if (customIcon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = customIcon;
      let appleLink = document.querySelector("link[rel~='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement("link");
        appleLink.rel = "apple-touch-icon";
        document.getElementsByTagName("head")[0].appendChild(appleLink);
      }
      appleLink.href = customIcon;
    }
  }, [customIcon]);
};

// --- 3. FUNCIONES GLOBALES ---

const getClientWhatsApp = (o) => {
  if (!o) return "#";
  const p = o.customer.phone.replace(/\D/g, "");
  const txt = `Hola ${o.customer.name}, recibo de orden #${
    o.orderNumber
  }. Total: $${o.total.toFixed(2)}.`;
  return `https://wa.me/${p}?text=${encodeURIComponent(txt)}`;
};

const getClientSMS = (o) => {
  if (!o) return "#";
  const p = o.customer.phone.replace(/\D/g, "");
  const txt = `Fast Wave: Orden #${o.orderNumber}. Total: $${o.total.toFixed(
    2
  )}.`;
  return `sms:${p}?body=${encodeURIComponent(txt)}`;
};

const getOwnerWhatsApp = (o, phoneConfig) => {
  if (!o) return "#";
  const p = (phoneConfig || "").replace(/\D/g, "");
  return `https://wa.me/${p}?text=Order%20${o.orderNumber}`;
};

const getOwnerSMS = (o, phoneConfig) => {
  if (!o) return "#";
  const p = (phoneConfig || "").replace(/\D/g, "");
  return `sms:${p}?body=Order%20${o.orderNumber}`;
};

const showNativeNotification = (msg, isError = false) => {
  const div = document.createElement("div");
  div.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-[120] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in ${
    isError ? "bg-red-500" : "bg-cyan-900"
  }`;
  div.innerHTML = `<span class="text-white font-bold text-sm">${msg}</span>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
};

const printSpecificOrder = (orderId) => {
  const ticketElement = document.getElementById(`order-card-${orderId}`);
  if (!ticketElement) {
    showNativeNotification("Error: Ticket no encontrado.", true);
    return;
  }
  const style = document.createElement("style");
  style.id = "print-style-temp";
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      #order-card-${orderId}, #order-card-${orderId} * { visibility: visible; }
      #order-card-${orderId} {
        position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 10px; background: white; z-index: 9999;
      }
      .no-print { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => {
    const s = document.getElementById("print-style-temp");
    if (s) s.remove();
  }, 1000);
};

const generateShortId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// --- 4. CONSTANTES Y DATOS ---
const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
];

const INITIAL_SERVICES = [
  {
    id: "wash_fold",
    name_en: "Wash & Fold (per lb)",
    name_es: "Lavado y Doblado (por lb)",
    name_fr: "Lavage et Pliage (par lb)",
    name_hi: "धलाई और तह (प्रति lb)",
    price: 1.5,
    image:
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80",
    type: "image",
  },
  {
    id: "dry_clean_shirt",
    name_en: "Dry Clean Shirt",
    name_es: "Lavado en Seco Camisa",
    name_fr: "Chemise Nettoyage à Sec",
    name_hi: "ड्राई क्लीन शर्ट",
    price: 5.0,
    image:
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "image",
  },
  {
    id: "dry_clean_suit",
    name_en: "Dry Clean Suit",
    name_es: "Lavado en Seco Traje",
    name_fr: "Costume Nettoyage à Sec",
    name_hi: "ड्राई क्लीन सूट",
    price: 15.0,
    image:
      "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "image",
  },
  {
    id: "ironing",
    name_en: "Ironing Service",
    name_es: "Servicio de Planchado",
    name_fr: "Service de Repassage",
    name_hi: "इस्त्री सेवा",
    price: 3.0,
    type: "component",
    componentName: "CustomIronIcon",
  },
  {
    id: "bedding",
    name_en: "Bedding / Comforter",
    name_es: "Ropa de Cama",
    name_fr: "Literie / Edredon",
    name_hi: "बिस्तर / रजाई",
    price: 20.0,
    image:
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400",
    type: "image",
  },
];

const AVOID_PRODUCTS = [
  { id: "softener", label_en: "No Softener", label_es: "Sin Suavizante" },
  { id: "bleach", label_en: "No Bleach", label_es: "Sin Cloro" },
  { id: "scented", label_en: "No Scent", label_es: "Sin Perfume" },
];

const AROMAS = [
  { id: "Floral", en: "Floral", es: "Floral" },
  { id: "Fresh", en: "Fresh", es: "Fresco" },
  { id: "Citrus", en: "Citrus", es: "Cítrico" },
  { id: "Woody", en: "Woody", es: "Amaderado" },
  { id: "Unscented", en: "Unscented", es: "Sin Olor" },
];

const ENGLISH_CONTENT = {
  brandName: "Fast Wave",
  brandSubtitle: "Laundry Service",
  title: "Fast Wave Laundry",
  heroSubtitle:
    "We are Professionals. We Pick Up, Wash & Deliver Right to Your Door!",
  orderNow: "Schedule Pickup",
  sendOrder: "View Basket",
  services: "Our Premium Services",
  productsToAvoid: "Allergies / Preferences",
  preferredAroma: "Select Your Scent",
  details: "Order Details",
  pickupInfo: "Pickup Info",
  deliveryInfo: "Delivery Info",
  payment: "Payment Method",
  total: "Total",
  submit: "Review Order",
  status: {
    pending: "Pending",
    confirmed: "Confirmed",
    picked_up: "Picked Up",
    cleaning: "Washing",
    delivering: "Delivering",
    completed: "Completed",
  },
  express: "Express Wash",
  member: "I am a Member",
  successMsg: "Order Received!",
  successSub: "To confirm, please send details via WhatsApp or SMS below.",
  orderNumberIs: "Order #",
  back: "Back",
  adminTitle: "Admin Dashboard",
  adminOrders: "Orders",
  adminServices: "Services",
  adminSettings: "Settings",
  deleteOrder: "Delete Order",
  editServices: "Edit Services",
  genSettings: "General Settings",
  save: "Save Changes",
  login: "Admin Login",
  enter: "Enter",
  wrongPin: "Wrong Credentials",
  payCashLabel: "Pay Cash",
  payCardLabel: "Credit/Debit Card",
  payOnlineLabel: "Pay Online",
  nameLabel: "Full Name",
  phoneLabel: "Phone Number",
  addressLabel: "Address",
  emptyCart: "Your cart is empty",
  usernameLabel: "Username",
  passwordLabel: "Password",
  trackOrder: "Track Order",
  yourOrders: "Your Orders",
  joinMemberTitle: "Join Membership?",
  joinYes: "Yes, Join & Save",
  joinNo: "No, Continue",
  rejoinTitle: "Rejoin Membership",
  rejoinYes: "Pay Fee & Rejoin",
  qrCode: "App QR Code",
  shareApp: "Share App",
  copyLink: "Copy Link",
  paymentSuccess: "Payment Successful",
  alertTitle: "Order Updated!",
  alertMsg: "The admin has modified your order details.",
  btnUnderstood: "Understood",
  pickupDate: "Pickup Date",
  pickupTime: "Pickup Time",
  deliveryDate: "Delivery Date",
  deliveryTime: "Delivery Time",
  customerInfo: "Customer Info",
  payWallet: "Pay with Wallet",
  stripeLocked: "Locked (Click to Edit)",
  unlock: "Unlock",
  pinLabel: "Recovery PIN (6 digits)",
  forgotPass: "Forgot Password?",
  recover: "Recover Access",
  newPass: "New Password",
  enterPin: "Enter 6-digit PIN",
  fillDetails: "Please fill in all details.",
  memberAdded: "Member Added!",
  deleteConfirm: "Delete this item?",
  idRequired: "ID Required",
  saved: "Saved!",
  passResetSuccess: "Password Reset Successful! Login now.",
  enterNewPass: "Enter a new password",
  invalidPin: "Invalid Recovery PIN",
  orderUpdated: "Order Updated & Client Notified",
  savingsToday: "Savings TODAY:",
  ifYouUse: "If you use our service",
  timesIn: "times in",
  couldSave: "you could save:",
  cost: "Cost",
  for: "for",
  noThanks: "No thanks, I'll pay full price",
  areYouSure: "Are you sure?",
  loseSavings: "You are about to lose a saving of",
  yesLose: "Yes, lose savings",
  yesJoin: "Yes, Join & Save",
  activateMembership: "Activate Membership",
  joinClub: "Join the VIP Club & Save!",
  enterDetails:
    "Unlock exclusive discounts, priority delivery, and special offers just for members.",
  cancelMembership: "Cancel Membership?",
  loseDiscounts: "You will lose your accumulated discounts.",
  yesCancel: "Yes, Cancel",
  map: "Map",
  chat: "Chat",
  deleteReceipt: "Delete Receipt",
  whatsappNum: "WhatsApp Number",
  customIcon: "Custom App Icon",
  heroImage: "Hero Image (Main)",
  chooseFile: "Choose File",
  choosePhoto: "Choose Photo",
  discountPercent: "Discount (Member %)",
  expressFee: "Express Fee (%)",
  taxPercent: "Tax (%)",
  paymentGateway: "Payment Gateway (Stripe)",
  publishableKey: "Publishable API Key",
  secretKey: "Secret API Key",
  zelleConfig: "Zelle Configuration",
  zellePlace: "Zelle Number/Email",
  payInstPlace: "Payment Instructions...",
  membershipRules: "Membership Rules",
  memCost: "Membership Cost ($)",
  memDuration: "Duration (Text)",
  estUses: "Est. Uses (for Calc)",
  manageMembers: "Manage Members",
  addMember: "Add Member",
  secSettings: "Security Settings",
  changeUser: "Change Admin Username",
  changePass: "Change Admin Password",
  changePin: "Change Recovery PIN",
  newUserPlace: "New Username (Leave empty to keep)",
  newPassPlace: "New Password (Leave empty to keep)",
  newPinPlace: "New PIN (Leave empty to keep)",
  printAll: "Print All",
  enableApple: "Enable Apple Pay",
  enableGoogle: "Enable Google Pay",
  subtotal: "Subtotal",
  expressFeeLabel: "Express Fee",
  memberDiscountLabel: "Member Discount",
  messages: "Messages",
  writeReply: "Write a reply...",
  client: "CLIENT",
  schedule: "SCHEDULE",
  item: "Item",
  cancel: "Cancel",
  saveChanges: "Save Changes",
  resetPassword: "Reset Password",
  enterPinInstruction: "Enter your 6-digit PIN to reset password.",
  noMessages: "No messages yet.",
  cardHolderLabel: "Cardholder Name",
  cardDetailsLabel: "Card Details",
  secureStripe: "Secure by Stripe",
  payNow: "Pay Now",
  confirmOrderBtn: "Confirm Order",
  viewReceipt: "View Receipt",
  notifyOwner: "Notify",
  sendSMS: "Send Confirmation SMS",
  totalDue: "Total Due",
  sendTo: "Send to:",
  searchPlaceholder: "Search...",
  cash: "Cash",
  card: "Credit Card",
  online: "Zelle/Online",
  
};

const LANGUAGES = {
  en: ENGLISH_CONTENT,
  es: {
    ...ENGLISH_CONTENT,
    brandName: "Fast Wave",
    brandSubtitle: "Servicio de Lavandería",
    title: "Fast Wave Lavandería",
    heroSubtitle:
      "Somos Profesionales. Recogemos, Lavamos y Entregamos su Ropa en su Puerta.",
    orderNow: "Programar Recogida",
    sendOrder: "Ver Canasta",
    services: "Servicios Premium",
    productsToAvoid: "Alergias / Preferencias",
    preferredAroma: "Elige tu Aroma",
    details: "Detalles del Pedido",
    pickupInfo: "Información de Recogida",
    deliveryInfo: "Información de Entrega",
    payment: "Método de Pago",
    total: "Total Estimado",
    submit: "Confirmar Pedido",
    status: {
      pending: "Pendiente",
      confirmed: "Confirmado",
      picked_up: "Recogido",
      cleaning: "Lavando",
      delivering: "En Reparto",
      completed: "Completado",
    },
    express: "Lavado Express",
    member: "Soy Miembro",
    successMsg: "¡Orden Recibida!",
    successSub: "Para confirmar, envía el pedido por WhatsApp o SMS.",
    orderNumberIs: "Orden #",
    back: "Volver",
    adminTitle: "Panel de Administración",
    adminOrders: "Pedidos",
    adminServices: "Servicios",
    adminSettings: "Ajustes",
    deleteOrder: "Borrar Orden",
    editServices: "Editar Servicios",
    genSettings: "Configuración General",
    save: "Guardar Cambios",
    login: "Acceso Admin",
    enter: "Entrar",
    wrongPin: "Credenciales Incorrectas",
    payCashLabel: "Pagar Efectivo",
    payCardLabel: "Tarjeta Crédito/Débito",
    payOnlineLabel: "Pagar Online",
    nameLabel: "Nombre Completo",
    phoneLabel: "Teléfono",
    addressLabel: "Dirección",
    emptyCart: "Tu carrito está vacío",
    usernameLabel: "Usuario",
    passwordLabel: "Contraseña",
    trackOrder: "Rastrear Orden",
    yourOrders: "Tus Pedidos",
    joinMemberTitle: "¿Unirte a la Membresía?",
    joinYes: "Sí, Unirme y Ahorrar",
    joinNo: "No, Continuar",
    rejoinTitle: "Reactivar Membresía",
    rejoinYes: "Pagar Cargo y Reactivar",
    qrCode: "Código QR de App",
    shareApp: "Compartir App",
    copyLink: "Copiar Enlace",
    paymentSuccess: "Pago Exitoso",
    alertTitle: "¡Orden Modificada!",
    alertMsg: "El administrador ha realizado cambios en tu pedido.",
    btnUnderstood: "Entendido",
    pickupDate: "Fecha de Recogida",
    pickupTime: "Hora de Recogida",
    deliveryDate: "Fecha de Entrega",
    deliveryTime: "Hora de Entrega",
    customerInfo: "Info del Cliente",
    payWallet: "Pagar con Billetera",
    stripeLocked: "Claves Protegidas (Click para Editar)",
    unlock: "Desbloquear",
    pinLabel: "PIN de Recuperación (6 dígitos)",
    forgotPass: "¿Olvidaste tu contraseña?",
    recover: "Recuperar Acceso",
    newPass: "Nueva Contraseña",
    enterPin: "Ingresa PIN de 6 dígitos",
    fillDetails: "Por favor completa tu información.",
    memberAdded: "¡Miembro Agregado!",
    deleteConfirm: "¿Borrar este elemento?",
    idRequired: "ID Requerido",
    saved: "¡Guardado!",
    passResetSuccess: "¡Contraseña restablecida! Inicia sesión.",
    enterNewPass: "Ingresa nueva contraseña",
    invalidPin: "PIN Incorrecto",
    orderUpdated: "Orden Actualizada y Cliente Notificado",
    savingsToday: "Ahorro HOY:",
    ifYouUse: "Si usas el servicio",
    timesIn: "veces en",
    couldSave: "podrías ahorrar:",
    cost: "Costo",
    for: "por",
    noThanks: "No gracias, pagaré precio completo",
    areYouSure: "¿Estás seguro?",
    loseSavings: "Estás a punto de perder un ahorro de",
    yesLose: "Sí, perder ahorro",
    yesJoin: "Sí, Unirme y Ahorrar",
    activateMembership: "Activar Membresía",
    joinClub: "¡Únete al Club VIP y Ahorra!",
    enterDetails:
      "Accede a descuentos exclusivos, entregas prioritarias y ofertas especiales solo para miembros.",
    cancelMembership: "¿Cancelar Membresía?",
    loseDiscounts: "Perderás tus descuentos acumulados.",
    yesCancel: "Sí, Cancelar",
    map: "Mapa",
    chat: "Chat",
    deleteReceipt: "Borrar Recibo",
    whatsappNum: "Número WhatsApp",
    customIcon: "Icono de App",
    heroImage: "Imagen Principal",
    chooseFile: "Elegir Archivo",
    choosePhoto: "Elegir Foto",
    discountPercent: "Descuento (Miembro %)",
    expressFee: "Tarifa Express (%)",
    taxPercent: "Impuesto (%)",
    paymentGateway: "Pasarela de Pago (Stripe)",
    publishableKey: "Clave API Pública",
    secretKey: "Clave API Secreta",
    zelleConfig: "Configuración Zelle",
    zellePlace: "Número/Email Zelle",
    payInstPlace: "Instrucciones de Pago...",
    membershipRules: "Reglas de Membresía",
    memCost: "Costo Membresía ($)",
    memDuration: "Duración (Texto)",
    estUses: "Usos Estimados (Calc)",
    manageMembers: "Gestionar Miembros",
    addMember: "Agregar Miembro",
    secSettings: "Seguridad",
    changeUser: "Cambiar Usuario Admin",
    changePass: "Cambiar Contraseña",
    changePin: "Cambiar PIN Recuperación",
    newUserPlace: "Nuevo Usuario (Vacío para mantener)",
    newPassPlace: "Nueva Contraseña (Vacío para mantener)",
    newPinPlace: "Nuevo PIN (Vacío para mantener)",
    printAll: "Imprimir Todo",
    enableApple: "Activar Apple Pay",
    enableGoogle: "Activar Google Pay",
    subtotal: "Subtotal",
    expressFeeLabel: "Tarifa Express",
    memberDiscountLabel: "Descuento Miembro",
    messages: "Mensajes",
    writeReply: "Escribe una respuesta...",
    client: "CLIENTE",
    schedule: "HORARIO",
    item: "Artículo",
    cancel: "Cancelar",
    saveChanges: "Guardar Cambios",
    resetPassword: "Restablecer Contraseña",
    enterPinInstruction: "Ingresa tu PIN de 6 dígitos para restablecer.",
    noMessages: "No hay mensajes aún.",
    cardHolderLabel: "Nombre en Tarjeta",
    cardDetailsLabel: "Datos de Tarjeta",
    secureStripe: "Procesado seguro por Stripe",
    payNow: "Pagar Ahora",
    confirmOrderBtn: "Confirmar Orden",
    viewReceipt: "Ver Recibo",
    notifyOwner: "Notificar",
    sendSMS: "Enviar SMS de Confirmación",
    totalDue: "Total a Pagar",
    sendTo: "Enviar a:",
    searchPlaceholder: "Buscar...",
    cash: "Efectivo",
    card: "Tarjeta Crédito",
    online: "Zelle/Online",
    
  },
  fr: {
    ...ENGLISH_CONTENT,
    brandSubtitle: "Service de Blanchisserie",
    title: "Fast Wave Blanchisserie",
    heroSubtitle:
      "Nous sommes des professionnels. Nous ramassons, lavons et livrons à votre porte !",
    orderNow: "Planifier le ramassage",
    sendOrder: "Voir le panier",
    services: "Nos Services Premium",
    productsToAvoid: "Allergies / Préférences",
    preferredAroma: "Choisissez votre parfum",
    details: "Détails de la commande",
    pickupInfo: "Info ramassage",
    deliveryInfo: "Info livraison",
    payment: "Méthode de paiement",
    total: "Total",
    submit: "Commander",
    status: {
      pending: "En attente",
      confirmed: "Confirmé",
      picked_up: "Ramassé",
      cleaning: "Lavage",
      delivering: "Livraison",
      completed: "Terminé",
    },
    payCashLabel: "Espèces",
    payCardLabel: "Carte de Crédit",
    payOnlineLabel: "Payer en ligne",
    subtotal: "Sous-total",
    expressFeeLabel: "Frais Express",
    memberDiscountLabel: "Remise Membre",
    messages: "Messages",
    client: "CLIENT",
    schedule: "HORAIRE",
    item: "Article",
    cancel: "Annuler",
    saveChanges: "Sauvegarder",
    payNow: "Payer maintenant",
    confirmOrderBtn: "Confirmer",
    totalDue: "Total à payer",
    viewReceipt: "Voir le reçu",
    notifyOwner: "Notifier",
    cash: "Espèces",
    card: "Carte Crédit",
    online: "En Ligne",
    
  },
  hi: {
    ...ENGLISH_CONTENT,
    brandSubtitle: "लॉन्ड्री सेवा",
    title: "फास्ट वेव लॉन्ड्री",
    heroSubtitle:
      "हम पेशेवर हैं। हम आपके दरवाजे से कपड़े उठाते हैं, धोते हैं और पहुँचाते हैं!",
    orderNow: "पिकअप शेड्यूल करें",
    sendOrder: "टोकरी देखें",
    services: "हमारी प्रीमियम सेवाएँ",
    status: {
      pending: "लंबित",
      confirmed: "पुष्टि",
      picked_up: "पिक अप",
      cleaning: "धुलाई",
      delivering: "वितरण",
      completed: "पूर्ण",
    },
    payCashLabel: "नकद भुगतान",
    payCardLabel: "क्रेडिट कार्ड",
    payOnlineLabel: "ऑनलाइन भुगतान",
    total: "कुल",
    submit: "ऑर्डर दें",
    subtotal: "उपयोग",
    expressFeeLabel: "एक्सप्रेस शुल्क",
    memberDiscountLabel: "सदस्य छूट",
    messages: "संदेश",
    client: "ग्राहक",
    schedule: "अनुसूची",
    item: "वस्तु",
    cancel: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    payNow: "अभी भुगतान करें",
    confirmOrderBtn: "ऑर्डर की पुष्टि करें",
    totalDue: "देय कुल",
    viewReceipt: "रसीद देखें",
    notifyOwner: "सूचित करें",
    cash: "नकद",
    card: "कार्ड",
    online: "ऑनलाइन",
    
  },
};

// --- FIX GLOBAL: DEFINIR ESTO AQUÍ PARA QUE TODOS LO VEAN ---
const getServiceName = (s, lang = 'en') => {
  if (!s) return "";
  return s[`name_${lang}`] || s.name_en || s.name_es || s.id || "";
};

const getLabel = (id, type, lang) => {
  if (!id) return "";
  if (type === "aroma") {
    const item = AROMAS.find((a) => a.id === id);
    return item ? item[lang] || item["en"] : id;
  }
  if (type === "allergy") {
    const item = AVOID_PRODUCTS.find((p) => p.id === id);
    return item ? (lang === "es" ? item.label_es : item.label_en) : id;
  }
  return id;
};
const validateScheduleLogic = (pd, pt, dd, dt) => {
  if (!pd || !dd || !pt || !dt) return null;

  const pickupTime = (pt.split(" - ")[0] || pt).trim();       // "08:00 AM"
  const deliveryTime = (dt.split(" - ")[0] || dt).trim();     // "10:00 AM"

  const start = new Date(`${pd} ${pickupTime}`);
  const end = new Date(`${dd} ${deliveryTime}`);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (start < todayStart) return "errorPastDate";
  if (end <= start) return "errorDeliveryOrder";
  return null;
};

const handleImageUpload = (e, callback) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  }
};
// --- PARTE 2: COMPONENTES UI, ICONOS Y PANELES ---

const CustomToast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  if (!message) return null;
  const bgClass = type === "error" ? "bg-red-500" : "bg-cyan-900";
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-fade-in ${bgClass}`}
    >
      {" "}
      {type === "error" ? (
        <AlertTriangle className="w-5 h-5 text-white" />
      ) : (
        <Check className="w-5 h-5 text-white" />
      )}{" "}
      <span className="text-white font-bold text-sm">{message}</span>{" "}
    </div>
  );
};

const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      {" "}
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center transform scale-100 transition-all">
        {" "}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {" "}
          <AlertTriangle className="w-6 h-6 text-red-500" />{" "}
        </div>{" "}
        <h3 className="text-xl font-black text-gray-800 mb-2">{title}</h3>{" "}
        <p className="text-gray-500 mb-6 text-sm">{message}</p>{" "}
        <div className="flex gap-3 justify-center">
          {" "}
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>{" "}
          <button
            onClick={onConfirm}
            type="button"
            className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-200"
          >
            Confirm
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

const BrandLogo = ({ customIcon, t }) => (
  <div className="relative flex items-center justify-center px-5 py-2 overflow-hidden rounded-full border-2 border-cyan-100 shadow-sm group hover:shadow-md transition-all cursor-pointer bg-white">
    {" "}
    <div className="relative z-10 flex items-center">
      {" "}
      {customIcon && (
        <img
          src={customIcon}
          alt="Icon"
          className="w-6 h-6 mr-2 object-contain rounded-full"
        />
      )}{" "}
      <div className="flex flex-col items-center">
        {" "}
        <span className="font-black text-xl text-cyan-900 leading-none tracking-tight">
          {t ? t.brandName : "Fast Wave"}
        </span>{" "}
        <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-widest">
          {t ? t.brandSubtitle : "Laundry Service"}
        </span>{" "}
      </div>{" "}
    </div>{" "}
  </div>
);

const CustomIronIcon = () => (
  <svg
    viewBox="0 0 64 64"
    className="w-full h-full p-4"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#475569"
      d="M4 46h56c2.2 0 4 1.8 4 4s-1.8 4-4 4H4c-2.2 0-4-1.8-4-4s1.8-4 4-4z"
    />
    <path fill="#0891b2" d="M8 46h48c0-14-10-26-26-26h-4c-10 0-16 8-16 26z" />
    <path
      fill="none"
      stroke="#155e75"
      strokeWidth="6"
      strokeLinecap="round"
      d="M22 20V12c0-4.4 4.4-8 8.8-8h10.4c8.8 0 12.8 7.2 12.8 16v12"
    />
    <circle cx="34" cy="34" r="2" fill="#155e75" />
  </svg>
);

const CustomPackageIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const CustomLoaderIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

const ServiceEditor = ({ services, setServices, t, showAlert }) => {
  const [newService, setNewService] = useState({
    

    id: "",
    name_en: "",
    name_es: "",
    name_fr: "",
    name_hi: "",
    price: 0,
    image: "",
  });
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const handleServiceChange = (id, field, value) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setServices(updated);
  };
  const confirmDelete = () => {
    if (itemToDelete) {
      setServices(services.filter((s) => s.id !== itemToDelete));
      setItemToDelete(null);
    }
  };
  const handleAddService = () => {
    if (!newService.id) return showAlert(t.idRequired, "error");
    setServices([...services, newService]);
    setNewService({
      id: "",
      name_en: "",
      name_es: "",
      name_fr: "",
      name_hi: "",
      price: 0,
      image: "",
    });
  };
  const saveServices = async () => {
    if (db) {
      await setDoc(
        doc(db, "settings", "services"),
        { list: services },
        { merge: true }
      );
      showAlert(t.saved, "success");
    }
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <ConfirmationModal
        show={!!itemToDelete}
        title={t.deleteConfirm}
        message={t.areYouSure}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-cyan-900 flex items-center">
          <Edit2 className="w-6 h-6 mr-2" /> {t.editServices}
        </h3>
        <button
          onClick={saveServices}
          type="button"
          className="bg-cyan-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition flex items-center shadow-lg"
        >
          <Save className="w-5 h-5 mr-2" /> {t.save}
        </button>
      </div>
      <div className="space-y-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-12 gap-4 items-center relative group"
          >
            {" "}
            <div className="col-span-12 md:col-span-1 flex justify-center">
              {" "}
              <label className="cursor-pointer relative">
                {" "}
                <img
                  src={s.image || "https://via.placeholder.com/60"}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100 shadow-sm hover:opacity-70"
                  alt={s.name_en}
                />{" "}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(e, (url) =>
                      handleServiceChange(s.id, "image", url)
                    )
                  }
                />{" "}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 rounded-lg">
                  <Camera className="text-white w-6 h-6" />
                </div>{" "}
              </label>{" "}
            </div>{" "}
            <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3">
              {" "}
              <input
                className="p-2 border rounded text-sm"
                placeholder="Spanish"
                value={s.name_es}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_es", e.target.value)
                }
              />{" "}
              <input
                className="p-2 border rounded text-sm"
                placeholder="English"
                value={s.name_en}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_en", e.target.value)
                }
              />{" "}
              <input
                className="p-2 border rounded text-sm"
                placeholder="French"
                value={s.name_fr || ""}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_fr", e.target.value)
                }
              />{" "}
              <input
                className="p-2 border rounded text-sm"
                placeholder="Hindi"
                value={s.name_hi || ""}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_hi", e.target.value)
                }
              />{" "}
            </div>{" "}
            <div className="col-span-12 md:col-span-2 flex flex-col gap-2">
              {" "}
              <div className="relative">
                {" "}
                <span className="absolute left-3 top-2 text-green-600 font-bold">
                  $
                </span>{" "}
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 pl-6 border-2 border-green-100 rounded text-green-700 font-black text-center"
                  value={s.price}
                  onChange={(e) =>
                    handleServiceChange(
                      s.id,
                      "price",
                      parseFloat(e.target.value)
                    )
                  }
                />{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={() => setItemToDelete(s.id)}
              type="button"
              className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>{" "}
          </div>
        ))}
        <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 flex flex-col gap-4">
          {" "}
          <p className="font-bold text-gray-500 text-sm">
            Add New Service
          </p>{" "}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {" "}
            <input
              className="p-2 border rounded"
              placeholder="ID"
              value={newService.id}
              onChange={(e) =>
                setNewService({ ...newService, id: e.target.value })
              }
            />{" "}
            <input
              className="p-2 border rounded"
              placeholder="ES"
              value={newService.name_es}
              onChange={(e) =>
                setNewService({ ...newService, name_es: e.target.value })
              }
            />{" "}
            <input
              className="p-2 border rounded"
              placeholder="EN"
              value={newService.name_en}
              onChange={(e) =>
                setNewService({ ...newService, name_en: e.target.value })
              }
            />{" "}
            <input
              className="p-2 border rounded"
              placeholder="FR"
              value={newService.name_fr}
              onChange={(e) =>
                setNewService({ ...newService, name_fr: e.target.value })
              }
            />{" "}
            <input
              className="p-2 border rounded"
              placeholder="HI"
              value={newService.name_hi}
              onChange={(e) =>
                setNewService({ ...newService, name_hi: e.target.value })
              }
            />{" "}
            <input
              type="number"
              className="p-2 border rounded"
              placeholder="$"
              value={newService.price}
              onChange={(e) =>
                setNewService({
                  ...newService,
                  price: parseFloat(e.target.value),
                })
              }
            />{" "}
          </div>{" "}
          <button
            onClick={handleAddService}
            type="button"
            className="bg-gray-800 text-white py-2 rounded font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>{" "}
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({ config, setConfig, t, showAlert }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [membersList, setMembersList] = useState([]);
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [stripeLocked, setStripeLocked] = useState(true);
  const [unlockPass, setUnlockPass] = useState("");
  const [memberToDelete, setMemberToDelete] = useState(null);

  // --- EFECTO VISUAL: CAMBIAR COLORES EN VIVO ---
  useEffect(() => {
    if (localConfig.primaryColor) {
      const styleId = "dynamic-theme-styles";
      let style = document.getElementById(styleId);
      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.innerHTML = `
        .bg-cyan-900, .bg-slate-900, .bg-gray-900, .bg-blue-600 { background-color: ${localConfig.primaryColor} !important; }
        .text-cyan-900, .text-blue-600, .text-cyan-700 { color: ${localConfig.primaryColor} !important; }
        .ring-cyan-200 { --tw-ring-color: ${localConfig.primaryColor}40 !important; }
        .bg-cyan-50, .bg-blue-50 { background-color: ${localConfig.secondaryColor || "#f0f9ff"} !important; }
        .border-cyan-100 { border-color: ${localConfig.primaryColor}20 !important; }
      `;
    }
  }, [localConfig.primaryColor, localConfig.secondaryColor]);

  useEffect(() => {
    setLocalConfig(config);
    if (db) {
      onSnapshot(doc(db, "settings", "members"), (doc) => {
        if (doc.exists()) setMembersList(doc.data().list || []);
      });
    }
  }, [config]);

  const handleSave = async () => {
    let updates = { ...localConfig };
    if (newUsername.trim()) updates.adminUsername = newUsername;
    if (newPassword.trim()) updates.adminPassword = newPassword;
    if (newPin.trim()) updates.recoveryPin = newPin;

    if (db) {
      // Guardamos la configuración general, incluyendo nombre de tienda y colores
      await setDoc(doc(db, "settings", "general"), updates, { merge: true });
      setConfig(updates);
      setNewUsername("");
      setNewPassword("");
      setNewPin("");
      showAlert(t.saved, "success");
    }
  };

  const addMember = async () => {
    if (db && newMemberPhone) {
      await setDoc(
        doc(db, "settings", "members"),
        { list: arrayUnion(newMemberPhone) },
        { merge: true }
      );
      setNewMemberPhone("");
      showAlert(t.memberAdded, "success");
    }
  };

  const confirmMemberDelete = async () => {
    if (db && memberToDelete) {
      await updateDoc(doc(db, "settings", "members"), {
        list: arrayRemove(memberToDelete),
      });
      setMemberToDelete(null);
    }
  };

  const handleUnlockStripe = () => {
    if (unlockPass === (config.adminPassword || "1234")) {
      setStripeLocked(false);
      setUnlockPass("");
    } else {
      showAlert(t.wrongPin, "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <ConfirmationModal
        show={!!memberToDelete}
        title={t.deleteConfirm}
        message={`${memberToDelete}?`}
        onConfirm={confirmMemberDelete}
        onCancel={() => setMemberToDelete(null)}
      />
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-gray-800">{t.genSettings}</h3>
        <button
          onClick={handleSave}
          type="button"
          className="bg-cyan-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center"
        >
          <Save className="w-5 h-5 mr-2" /> {t.save}
        </button>
      </div>

      <div className="space-y-6">
        {/* --- NUEVA SECCIÓN: IDENTIDAD DE LA TIENDA (NOMBRE Y COLORES) --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center">
            <Edit2 className="w-5 h-5 mr-2" /> Identidad de la Tienda
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Nombre de la Tienda
              </label>
              <input
                className="w-full p-3 border rounded-xl font-bold text-lg"
                value={localConfig.brandName || ""}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, brandName: e.target.value })
                }
                placeholder="Ej: Fast Wave Laundry"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Color Principal
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-10 border rounded cursor-pointer"
                  value={localConfig.primaryColor || "#164e63"}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      primaryColor: e.target.value,
                    })
                  }
                />
                <span className="text-xs font-mono">
                  {localConfig.primaryColor || "#164e63"}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Color de Fondo (Suave)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-10 border rounded cursor-pointer"
                  value={localConfig.secondaryColor || "#ecfeff"}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      secondaryColor: e.target.value,
                    })
                  }
                />
                <span className="text-xs font-mono">
                  {localConfig.secondaryColor || "#ecfeff"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- ALERTAS SMS --- */}
        <div className="bg-green-50 border-2 border-green-100 p-6 rounded-2xl">
          <label className="flex items-center text-green-800 font-bold mb-2">
            <Smartphone className="w-5 h-5 mr-2" /> Teléfono para Alertas
            (WhatsApp/SMS)
          </label>
          <p className="text-xs text-green-600 mb-2">
            * Este número recibirá los mensajes de "Nueva Orden".
          </p>
          <input
            className="w-full text-2xl font-black p-4 rounded-xl border-2 border-green-200 text-gray-800 focus:border-green-500 outline-none"
            value={localConfig.phone || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, phone: e.target.value })
            }
            placeholder="+1 555 000 0000"
          />
        </div>
{/* --- CORREO DE NOTIFICACIONES (EMAILJS) --- */}
        <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-2xl mt-4">
          <label className="flex items-center text-orange-800 font-bold mb-2">
            <Send className="w-5 h-5 mr-2" /> Correo para Notificaciones
          </label>
          <input
            className="w-full text-lg p-3 rounded-xl border-2 border-orange-200 text-gray-800 focus:border-orange-500 outline-none"
            value={localConfig.adminEmail || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, adminEmail: e.target.value })
            }
            placeholder="tu-email@gmail.com"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-50 border-2 border-cyan-100 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border overflow-hidden">
              {localConfig.customIcon ? (
                <img
                  src={localConfig.customIcon}
                  className="w-full h-full object-cover"
                  alt="icon"
                />
              ) : (
                <Camera className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-cyan-900 font-bold mb-1">
                {t.customIcon}
              </label>
              <label className="cursor-pointer bg-cyan-200 text-cyan-800 px-4 py-2 rounded-xl font-bold text-xs hover:bg-cyan-300 transition inline-block">
                {t.chooseFile}{" "}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(e, (url) =>
                      setLocalConfig({ ...localConfig, customIcon: url })
                    )
                  }
                />
              </label>
            </div>
          </div>
          <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border overflow-hidden">
              {localConfig.heroImage ? (
                <img
                  src={localConfig.heroImage}
                  className="w-full h-full object-cover"
                  alt="hero"
                />
              ) : (
                <PhotoIcon className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-indigo-900 font-bold mb-1">
                {t.heroImage}
              </label>
              <label className="cursor-pointer bg-indigo-200 text-indigo-800 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-300 transition inline-block">
                {t.choosePhoto}{" "}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(e, (url) =>
                      setLocalConfig({ ...localConfig, heroImage: url })
                    )
                  }
                />
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {" "}
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              {t.discountPercent}
            </label>
            <input
              type="number"
              className="w-full text-xl font-black p-2 border rounded"
              value={localConfig.discountPercent || 10}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  discountPercent: parseFloat(e.target.value),
                })
              }
            />
          </div>{" "}
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              {t.expressFee}
            </label>
            <input
              type="number"
              className="w-full text-xl font-black p-2 border rounded"
              value={localConfig.expressPercent || 20}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  expressPercent: parseFloat(e.target.value),
                })
              }
            />
          </div>{" "}
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              {t.taxPercent}
            </label>
            <input
              type="number"
              className="w-full text-xl font-black p-2 border rounded"
              value={localConfig.taxPercent || 0}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  taxPercent: parseFloat(e.target.value),
                })
              }
            />
          </div>{" "}
        </div>
        <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl">
          {" "}
          <label className="flex items-center text-blue-900 font-bold mb-3">
            <CreditCard className="w-5 h-5 mr-2" /> {t.paymentGateway}
          </label>{" "}
          <div className="bg-white p-4 rounded-xl border border-blue-200 relative space-y-4">
            {" "}
            <div>
              <label className="block text-xs font-bold text-blue-400 mb-1 uppercase">
                {t.publishableKey}
              </label>
              {stripeLocked ? (
                <div className="flex items-center text-gray-400 gap-2 bg-gray-100 px-3 py-2 rounded-lg w-full">
                  <Lock className="w-4 h-4" />
                  <span className="font-mono text-sm">
                    ••••••••••••••••••••••••••
                  </span>
                </div>
              ) : (
                <input
                  className="w-full p-2 font-mono text-sm bg-transparent outline-none text-gray-700 border-b border-blue-300"
                  value={localConfig.stripePublicKey || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      stripePublicKey: e.target.value,
                    })
                  }
                  placeholder="pk_live_..."
                />
              )}
            </div>{" "}
            <div>
              <label className="block text-xs font-bold text-blue-400 mb-1 uppercase">
                {t.secretKey}
              </label>
              {stripeLocked ? (
                <div className="flex items-center text-gray-400 gap-2 bg-gray-100 px-3 py-2 rounded-lg w-full">
                  <Lock className="w-4 h-4" />
                  <span className="font-mono text-sm">
                    ••••••••••••••••••••••••••
                  </span>
                </div>
              ) : (
                <input
                  className="w-full p-2 font-mono text-sm bg-transparent outline-none text-gray-700 border-b border-blue-300"
                  value={localConfig.stripeSecretKey || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      stripeSecretKey: e.target.value,
                    })
                  }
                  placeholder="sk_live_..."
                />
              )}
            </div>{" "}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {" "}
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Wallet className="w-4 h-4 mr-2 text-blue-600" />{" "}
                  {t.enableApple}
                </label>
                <input
                  type="checkbox"
                  disabled={stripeLocked}
                  checked={localConfig.enableApple || false}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      enableApple: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-blue-600 disabled:opacity-50"
                />
              </div>{" "}
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Wallet className="w-4 h-4 mr-2 text-blue-600" />{" "}
                  {t.enableGoogle}
                </label>
                <input
                  type="checkbox"
                  disabled={stripeLocked}
                  checked={localConfig.enableGoogle || false}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      enableGoogle: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-blue-600 disabled:opacity-50"
                />
              </div>{" "}
            </div>{" "}
            {stripeLocked && (
              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-blue-100">
                <input
                  type="password"
                  placeholder="Admin Pass"
                  className="border rounded p-2 text-sm w-32"
                  value={unlockPass}
                  onChange={(e) => setUnlockPass(e.target.value)}
                />
                <button
                  onClick={handleUnlockStripe}
                  type="button"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center"
                >
                  <Unlock className="w-4 h-4 mr-1" /> {t.unlock}
                </button>
              </div>
            )}{" "}
          </div>{" "}
          <p className="text-xs text-blue-400 mt-2 ml-1 flex items-center">
            {stripeLocked ? t.stripeLocked : "Unlocked"}
          </p>{" "}
        </div>
        <div className="bg-purple-50 border-2 border-purple-100 p-6 rounded-2xl">
          {" "}
          <label className="flex items-center text-purple-900 font-bold mb-3">
            <ExternalLink className="w-5 h-5 mr-2" /> {t.zelleConfig}
          </label>{" "}
          <input
            className="w-full p-3 mb-3 rounded-xl border border-purple-200 font-bold text-lg"
            value={localConfig.zelleNumber || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, zelleNumber: e.target.value })
            }
            placeholder={t.zellePlace}
          />{" "}
          <textarea
            className="w-full p-3 rounded-xl border border-purple-200 text-sm h-20"
            value={localConfig.zelleMessage || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, zelleMessage: e.target.value })
            }
            placeholder={t.payInstPlace}
          />{" "}
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-100 p-6 rounded-2xl">
          {" "}
          <h4 className="font-bold text-yellow-800 flex items-center mb-4">
            <Star className="w-5 h-5 mr-2" /> {t.membershipRules}
          </h4>{" "}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {" "}
            <div>
              <label className="text-xs font-bold text-yellow-700">
                {t.memCost}
              </label>
              <input
                type="number"
                className="w-full p-2 rounded border-yellow-200 border"
                value={localConfig.rejoinFee || 10}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    rejoinFee: parseFloat(e.target.value),
                  })
                }
              />
            </div>{" "}
            <div>
              <label className="text-xs font-bold text-yellow-700">
                {t.memDuration}
              </label>
              <input
                className="w-full p-2 rounded border-yellow-200 border"
                placeholder="e.g. 1 Month"
                value={localConfig.rejoinDuration || "1 Month"}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    rejoinDuration: e.target.value,
                  })
                }
              />
            </div>{" "}
            <div>
              <label className="text-xs font-bold text-yellow-700">
                {t.estUses}
              </label>
              <input
                type="number"
                className="w-full p-2 rounded border-yellow-200 border"
                value={localConfig.minVisits || 2}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    minVisits: parseFloat(e.target.value),
                  })
                }
              />
            </div>{" "}
          </div>{" "}
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            {" "}
            <h5 className="font-bold text-gray-700 mb-3 text-sm">
              {t.manageMembers} ({membersList.length})
            </h5>{" "}
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 p-2 border rounded-lg bg-gray-50"
                placeholder="Phone Number"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
              />
              <button
                onClick={addMember}
                type="button"
                className="bg-yellow-500 text-white font-bold px-4 rounded-lg shadow-sm hover:bg-yellow-600"
              >
                {t.addMember}
              </button>
            </div>{" "}
            <div className="max-h-40 overflow-y-auto space-y-1">
              {membersList.map((m) => (
                <div
                  key={m}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0"
                >
                  <span className="font-mono text-sm text-gray-600">{m}</span>
                  <button
                    onClick={() => setMemberToDelete(m)}
                    type="button"
                    className="text-red-400 hover:text-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>{" "}
          </div>{" "}
        </div>
        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl">
          {" "}
          <h4 className="font-bold text-red-800 flex items-center mb-4">
            <ShieldCheck className="w-5 h-5 mr-2" /> {t.secSettings}
          </h4>{" "}
          <div className="space-y-3">
            {" "}
            <div>
              <label className="text-xs font-bold text-red-700">
                {t.changeUser}
              </label>
              <input
                className="w-full p-3 rounded-xl border border-red-200"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t.newUserPlace}
              />
            </div>{" "}
            <div>
              <label className="text-xs font-bold text-red-700">
                {t.changePass}
              </label>
              <input
                className="w-full p-3 rounded-xl border border-red-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.newPassPlace}
              />
            </div>{" "}
            <div>
              <label className="text-xs font-bold text-red-700">
                {t.pinLabel}
              </label>
              <input
                className="w-full p-3 rounded-xl border border-red-200"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={t.newPinPlace}
              />
            </div>{" "}
          </div>{" "}
        </div>
      </div>
    </div>
  );
};
// --- PARTE 3: HELPER, ADMIN, TARJETAS Y FORMULARIO DE PAGO ---


const AdminView = ({
  t,
  config,
  setConfig,
  services,
  setServices,
  setView,
  lang,
  showAlert,
}) => {
  const [authInput, setAuthInput] = useState({ user: "", pass: "" });
  const [isAuth, setIsAuth] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminShareData, setAdminShareData] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryPin, setRecoveryPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditingOrder, setIsEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [chatInput, setChatInput] = useState("");
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    if (!isAuth) return;
    let unsub = () => {};
    if (db) {
    // --- CÓDIGO NUEVO: Pedimos la lista ya ordenada ---
      const q = query(collection(db, "orders"), orderBy("date", "desc"));

      unsub = onSnapshot(q, (snap) => {
        setOrders(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      });
      // -------------------------------------------------
    }
    return () => unsub();
  }, [isAuth]);
  const printAllOrders = () => {
    window.print();
  };
  const handleLogin = (e) => {
    e.preventDefault();
    const validUser = config.adminUsername || "admin";
    const validPass = config.adminPassword || "1234";
    if (
      authInput.user.trim().toLowerCase() === validUser.toLowerCase() &&
      authInput.pass.trim() === validPass
    ) {
      setIsAuth(true);
    } else {
      showAlert(t.wrongPin, "error");
    }
  };
  const handleRecovery = async () => {
    const validPin = config.recoveryPin || "123456";
    if (recoveryPin === validPin) {
      if (newPassword) {
        if (db) {
          await setDoc(
            doc(db, "settings", "general"),
            { adminPassword: newPassword },
            { merge: true }
          );
          setConfig({ ...config, adminPassword: newPassword });
          setIsRecovering(false);
          showAlert(t.passResetSuccess, "success");
        }
      } else {
        showAlert(t.enterNewPass, "error");
      }
    } else {
      showAlert(t.invalidPin, "error");
    }
  };
  const updateOrderStatus = async (id, status) => {
    if (db) await updateDoc(doc(db, "orders", id), { status });
  };
  const confirmOrderDelete = async () => {
    if (db && orderToDelete) {
      await deleteDoc(doc(db, "orders", orderToDelete));
      setOrderToDelete(null);
    }
  };
  const startEditing = (order) => {
    setIsEditingOrder(order.id);
    setEditForm({
      total: order.total,
      pickupDate: order.details.pickupDate,
      pickupTime: order.details.pickupTime,
      deliveryDate: order.details.deliveryDate,
      deliveryTime: order.details.deliveryTime,
      address: order.customer.address,
    });
  };
  const saveOrderEdit = async (id) => {
    if (db) {
      await updateDoc(doc(db, "orders", id), {
        total: parseFloat(editForm.total),
        "details.pickupDate": editForm.pickupDate,
        "details.pickupTime": editForm.pickupTime,
        "details.deliveryDate": editForm.deliveryDate,
        "details.deliveryTime": editForm.deliveryTime,
        "customer.address": editForm.address,
        wasModifiedByAdmin: true,
        scheduleUpdatedByAdmin: true,
      });
      setIsEditingOrder(null);
      showAlert(t.orderUpdated, "success");
    }
  };
  const cancelEdit = () => {
    setIsEditingOrder(null);
    setEditForm({});
  };
  const sendChatMessage = async (orderId, currentMessages = []) => {
    if (!chatInput.trim() || !db) return;
    const newMessage = {
      text: chatInput,
      sender: "admin",
      date: new Date().toISOString(),
    };
    await updateDoc(doc(db, "orders", orderId), {
      chat: [...(currentMessages || []), newMessage],
    });
    setChatInput("");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm">
          <h2 className="text-2xl font-black text-center text-gray-800 mb-6">
            {isRecovering ? t.recover : t.login}
          </h2>
          {!isRecovering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                value={authInput.user}
                onChange={(e) =>
                  setAuthInput({ ...authInput, user: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
                placeholder={t.usernameLabel}
              />
              <input
                type="password"
                value={authInput.pass}
                onChange={(e) =>
                  setAuthInput({ ...authInput, pass: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
                placeholder={t.passwordLabel}
              />
              <button className="w-full bg-cyan-900 text-white font-bold py-3 rounded-lg hover:bg-black transition">
                {t.enter}
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsRecovering(true)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {t.forgotPass}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-gray-500 text-center">
                {t.enterPinInstruction}
              </p>
              <input
                type="password"
                maxLength={6}
                value={recoveryPin}
                onChange={(e) => setRecoveryPin(e.target.value)}
                className="w-full p-3 border rounded-lg text-center font-bold tracking-widest"
                placeholder="PIN"
              />
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder={t.newPass}
              />
              <button
                onClick={handleRecovery}
                type="button"
                className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition"
              >
                {t.resetPassword}
              </button>
              <button
                onClick={() => setIsRecovering(false)}
                type="button"
                className="w-full text-gray-400 text-sm"
              >
                {t.back}
              </button>
            </div>
          )}
          {!isRecovering && (
            <button
              onClick={() => setView("home")}
              type="button"
              className="mt-4 text-sm text-gray-400 w-full text-center"
            >
              {t.back}
            </button>
          )}
        </div>
      </div>
    );
  }
 // --- BUSCA ESTO EN AdminView Y REEMPLÁZALO ---
 const filteredOrders = orders.filter((o) => {
    // --- 🛡️ BLINDAJE TOTAL (Línea Nueva) ---
    // Si la orden no tiene datos de cliente, la IGNORAMOS completamente.
    // Esto hace que desaparezca de la lista y no rompa la app.
    if (!o.customer) return false; 

    const search = searchTerm.toLowerCase();
    
    // Ahora podemos leer tranquilos porque ya sabemos que el cliente existe
    const clientName = o.customer.name ? o.customer.name.toLowerCase() : "";
    const clientPhone = o.customer.phone ? o.customer.phone : "";
    const orderNum = o.orderNumber ? o.orderNumber.toLowerCase() : "";

    return (
      clientName.includes(search) ||
      clientPhone.includes(search) ||
      orderNum.includes(search)
    );
  });
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ConfirmationModal
        show={!!orderToDelete}
        title={t.deleteOrder}
        message={t.areYouSure}
        onConfirm={confirmOrderDelete}
        onCancel={() => setOrderToDelete(null)}
      />
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-30 no-print">
        <h2 className="font-black text-xl text-cyan-900 flex items-center">
          <span className="ml-3 hidden md:inline text-gray-400">
            | {t.adminTitle}
          </span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setView("home")}
            type="button"
            className="text-sm font-bold text-gray-500"
          >
            {t.back}
          </button>
          <button
            onClick={() => setIsAuth(false)}
            type="button"
            className="text-sm font-bold text-red-500"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <button
              onClick={() => setTab("orders")}
              type="button"
              className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${
                tab === "orders"
                  ? "bg-cyan-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {t.adminOrders}
            </button>
            <button
              onClick={() => setTab("services")}
              type="button"
              className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${
                tab === "services"
                  ? "bg-cyan-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {t.adminServices}
            </button>
            <button
              onClick={() => setTab("settings")}
              type="button"
              className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${
                tab === "settings"
                  ? "bg-cyan-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {t.adminSettings}
            </button>
            {/* --- BOTÓN DE NOTIFICACIONES --- */}
            <button
              onClick={() => setTab("inbox")}
              className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${
                tab === "inbox" ? "bg-cyan-900 text-white" : "bg-white text-gray-600"
              }`}
            >
             {lang === "es" ? "Notificaciones" : "Notifications"}
            </button>
          </div> 
          {tab === "orders" && (
            <button
              onClick={printAllOrders}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center hover:bg-gray-200 transition w-full md:w-auto justify-center"
            >
              <Printer className="w-5 h-5 mr-2" /> {t.printAll}
            </button>
          )}
        </div>
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="relative mb-4 no-print">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 border rounded-xl shadow-sm outline-none"
              />
            </div>
            {filteredOrders.map((o) => (
              <div
                id={`order-card-${o.id}`}
                key={o.id}
                className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md cursor-pointer ${
                  expandedOrder === o.id ? "ring-2 ring-cyan-200" : ""
                }`}
                onClick={() =>
                  setExpandedOrder(expandedOrder === o.id ? null : o.id)
                }
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">
                        #{o.orderNumber || o.id.slice(0, 6)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          o.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800">
                      {o.customer.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString()} •{" "}
                      {o.items
                        ? Object.values(o.items).reduce((a, b) => a + b, 0)
                        : 0}{" "}
                      items
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 mt-2 md:mt-0 no-print"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="bg-white border border-gray-300 text-xs rounded p-2 font-bold focus:outline-none"
                    >
                      {Object.keys(t.status).map((s) => (
                        <option key={s} value={s}>
                          {t.status[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setAdminShareData(o)}
                      type="button"
                      className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-gray-100 rounded-full transition"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => printSpecificOrder(o.id)}
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setOrderToDelete(o.id)}
                      type="button"
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {expandedOrder === o.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {expandedOrder === o.id && (
                  <div
                    className="mt-6 pt-6 border-t border-dashed border-gray-200 text-sm animate-fade-in cursor-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {" "}
                    <div className="flex justify-end mb-4 no-print">
                      {" "}
                      {isEditingOrder === o.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded font-bold"
                          >
                            {t.cancel}
                          </button>
                          <button
                            onClick={() => saveOrderEdit(o.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded font-bold"
                          >
                            {t.saveChanges}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(o)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded font-bold flex items-center"
                        >
                          <Edit2 className="w-3 h-3 mr-1" /> Edit Order
                        </button>
                      )}{" "}
                    </div>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {" "}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {" "}
                        <p className="font-bold text-gray-800 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-cyan-600" />{" "}
                          {t.client}
                        </p>{" "}
                        <p className="mb-1">
                          <span className="font-bold">Tel:</span>{" "}
                          <a
                            href={`tel:${o.customer.phone}`}
                            className="text-cyan-600 hover:underline"
                          >
                            {o.customer.phone}
                          </a>
                        </p>{" "}
                        <p className="mb-2">
                          <span className="font-bold">Dir:</span>{" "}
                          {isEditingOrder === o.id ? (
                            <input
                              value={editForm.address}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  address: e.target.value,
                                })
                              }
                              className="border rounded p-1 ml-2 w-full mt-1"
                            />
                          ) : (
                            <span className="flex items-center">
                              {o.customer.address}{" "}
                              <a
                                href={`https://www.google.com/maps?q=${encodeURIComponent(
                              o.customer.address.replace(/\n/g, " ")
                               )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 text-cyan-600 hover:text-cyan-800"
                              >
                                <MapPin className="w-4 h-4" />
                              </a>
                            </span>
                          )}
                        </p>{" "}
                      </div>{" "}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {" "}
                        <p className="font-bold text-gray-800 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-cyan-600" />{" "}
                          {t.schedule}
                        </p>{" "}
                        <div className="mb-2">
                          <span className="block text-xs text-gray-400 font-bold uppercase">
                            {t.pickupInfo}
                          </span>
                          {isEditingOrder === o.id ? (
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={editForm.pickupDate}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    pickupDate: e.target.value,
                                  })
                                }
                                className="border rounded p-1 text-xs"
                              />
                              <input
                                type="text"
                                value={editForm.pickupTime}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    pickupTime: e.target.value,
                                  })
                                }
                                className="border rounded p-1 text-xs"
                              />
                            </div>
                          ) : (
                            <>
                              <span className="font-bold text-gray-700">
                                {o.details.pickupDate}
                              </span>{" "}
                              <span className="text-gray-500">
                                ({o.details.pickupTime})
                              </span>
                            </>
                          )}
                        </div>{" "}
                        <div>
                          <span className="block text-xs text-gray-400 font-bold uppercase">
                            {t.deliveryInfo}
                          </span>
                          {isEditingOrder === o.id ? (
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={editForm.deliveryDate}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    deliveryDate: e.target.value,
                                  })
                                }
                                className="border rounded p-1 text-xs"
                              />
                              <input
                                type="text"
                                value={editForm.deliveryTime}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    deliveryTime: e.target.value,
                                  })
                                }
                                className="border rounded p-1 text-xs"
                              />
                            </div>
                          ) : (
                            <>
                              <span className="font-bold text-gray-700">
                                {o.details.deliveryDate}
                              </span>{" "}
                              <span className="text-gray-500">
                                ({o.details.deliveryTime})
                              </span>
                            </>
                          )}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
                      {" "}
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between font-bold text-xs text-gray-500 uppercase">
                        <span>{t.item}</span>
                        <span>{t.total}</span>
                      </div>{" "}
                      <div className="p-4 space-y-2">
                        {o.items &&
                          Object.entries(o.items).map(([k, v]) => {
                            const s = services.find((x) => x.id === k);
                            // --- USO DE HELPER ARREGLADO ---
                            const name = getServiceName(s, lang) || k;
                            return (
                              <div
                                key={k}
                                className="flex justify-between text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                              >
                                <span>
                                  <span className="font-bold text-gray-800">
                                    {v}x
                                  </span>{" "}
                                  {name}
                                </span>
                                <span className="font-bold text-gray-600">
                                  ${((s?.price || 0) * v).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                      </div>{" "}
                      <div className="bg-gray-50 p-4 border-t border-gray-100">
                        {" "}
                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-800 text-lg">
                            TOTAL
                          </span>
                          {isEditingOrder === o.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.total}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  total: e.target.value,
                                })
                              }
                              className="border-2 border-cyan-500 rounded p-1 text-right font-black text-xl w-32"
                            />
                          ) : (
                            <span className="font-black text-2xl text-cyan-700">
                              ${o.total.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-800 font-bold uppercase text-center bg-gray-100 p-2 rounded border border-gray-200">
                          {t.payment}:{" "}
                          {t[o.details.paymentMethod] ||
                            o.details.paymentMethod}{" "}
                          ({o.paymentStatus})
                        </div>
                      </div>{" "}
                      <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 no-print">
                        {" "}
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                          {t.messages}
                        </h4>{" "}
                        <div className="max-h-40 overflow-y-auto space-y-2 mb-2 p-2">
                          {o.chat ? (
                            o.chat.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex ${
                                  msg.sender === "admin"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <span
                                  className={`px-3 py-1.5 rounded-lg text-xs max-w-[80%] ${
                                    msg.sender === "admin"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-white border text-gray-600"
                                  }`}
                                >
                                  {msg.text}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic text-center">
                              {t.noMessages}
                            </p>
                          )}
                        </div>{" "}
                        <div className="flex gap-2">
                          <input
                            className="flex-1 border rounded px-2 text-xs"
                            placeholder={t.writeReply}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && sendChatMessage(o.id, o.chat)
                            }
                          />
                          <button
                            onClick={() => sendChatMessage(o.id, o.chat)}
                            className="bg-blue-600 text-white p-2 rounded"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {tab === "services" && (
          <ServiceEditor
            services={services}
            setServices={setServices}
            t={t}
            showAlert={showAlert}
          />
        )}
        {tab === "settings" && (
          <SettingsPanel
            config={config}
            setConfig={setConfig}
            t={t}
            showAlert={showAlert}
          />
        )}
       
      </div>
      {adminShareData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setAdminShareData(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              X
            </button>
            <h3 className="font-black text-xl mb-4 text-gray-800">
              {t.shareApp || "Share"}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <a
                href={getClientWhatsApp(adminShareData)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-4 bg-green-100 text-green-800 rounded-xl font-bold hover:bg-green-200 transition"
              >
                <MessageCircle className="mr-3 w-5 h-5" /> WhatsApp Cliente
              </a>
              <a
                href={getClientSMS(adminShareData)}
                className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-xl font-bold hover:bg-blue-200 transition"
              >
                <Smartphone className="mr-3 w-5 h-5" /> SMS Cliente
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const OrderCard = ({
  o,
  showActions = true,
  services,
  lang,
  t,
  onDelete,
  onShare,
  onChatSend,
}) => {
  const [localChatInput, setLocalChatInput] = useState("");
  const handleSend = () => {
    if (localChatInput.trim()) {
      onChatSend(o.id, localChatInput);
      setLocalChatInput("");
    }
  };
  
  if (!o || !o.details) return null;

  return (
    <div
      id={`order-card-${o.id}`}
      className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 mb-4 relative cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4 border-b border-dashed pb-4 border-gray-200">
        <div>
          <span className="font-mono text-xl font-black text-cyan-700">
            #{o.orderNumber || (o.id ? o.id.slice(0, 6) : "ORD")}
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}
            {o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : ""}
          </p>
          <span
            className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold uppercase ${
              o.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {o.status || "Pending"}
          </span>
          {o.paymentStatus === "paid" && (
            <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
              PAID
            </span>
          )}
        </div>
        <div className="text-right no-print">
          <button
            onClick={() => onShare(o)}
            type="button"
            className="text-gray-400 hover:text-cyan-600"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-start">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-cyan-500" />
          <span>{o.customer.address}</span>
          <a
            href={`https://www.google.com/maps?q=${encodeURIComponent(
          o.customer.address.replace(/\n/g, " ")
          )}`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex items-center text-cyan-600 hover:underline font-bold text-xs no-print"
          >
            <ExternalLink className="w-3 h-3 mr-1" /> {t.map}
          </a>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
          <span>
            {t.pickupInfo}: {o.details.pickupDate} ({o.details.pickupTime})
          </span>
        </div>
        <div className="flex items-center">
          <Truck className="w-4 h-4 mr-2 text-cyan-500" />
          <span>
            {t.deliveryInfo}: {o.details.deliveryDate} ({o.details.deliveryTime}
            )
          </span>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        {Object.entries(o.items || {}).map(([id, qty]) => {
          const s = services.find((x) => x.id === id);
          // --- USO DE HELPER ARREGLADO ---
          const translatedName = getServiceName(s, lang) || id;
          return (
            <div
              key={id}
              className="flex justify-between py-1 text-sm border-b border-gray-200 last:border-0"
            >
              <span>
                {qty} x {translatedName}
              </span>
              <span className="font-bold">
                ${((s?.price || 0) * qty).toFixed(2)}
              </span>
            </div>
          );
        })}
        <div className="mt-3 pt-2 border-t border-dashed text-sm space-y-1 text-gray-500">
          {(o.express || o.isMember) && (
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span>
                $
                {(
                  o.total -
                  (o.expressFeeAmount || 0) +
                  (o.discountAmount || 0)
                ).toFixed(2)}
              </span>
            </div>
          )}
          {o.express && (
            <div className="flex justify-between text-cyan-600">
              <span>{t.expressFeeLabel}</span>
              <span>+${(o.expressFeeAmount || 0).toFixed(2)}</span>
            </div>
          )}
          {o.isMember && (
            <div className="flex justify-between text-yellow-600">
              <span>{t.memberDiscountLabel}</span>
              <span>-${(o.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
            <span className="font-bold text-gray-800 text-base">TOTAL</span>
            <span className="font-black text-xl text-cyan-700">
              ${o.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-800 font-bold uppercase text-center bg-gray-100 p-2 rounded border border-gray-200">
          {t.payment}: {t[o.details.paymentMethod] || o.details.paymentMethod} (
          {o.paymentStatus})
        </div>

        {(o.aroma || o.allergies?.length > 0) && (
          <div className="mt-2 pt-2 border-t border-dashed text-xs text-gray-500">
            {o.aroma && (
              <div className="flex justify-between">
                <span className="text-purple-600 font-bold">Aroma:</span>
                <span>{getLabel(o.aroma, "aroma", lang)}</span>
              </div>
            )}
            {o.allergies?.length > 0 && (
              <div className="flex justify-between">
                <span className="text-red-600 font-bold">Allergies:</span>
                <span>
                  {o.allergies
                    .map((a) => getLabel(a, "allergy", lang))
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-100 no-print">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
              {t.messages}
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 mb-2 p-2">
              {o.chat && o.chat.length > 0 ? (
                o.chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "client" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs max-w-[80%] ${
                        msg.sender === "client"
                          ? "bg-blue-600 text-white"
                          : "bg-white border text-gray-600"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic text-center">
                  {t.noMessages}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-2 text-xs py-2"
                placeholder="Message..."
                value={localChatInput}
                onChange={(e) => setLocalChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                type="button"
                className="bg-blue-600 text-white p-2 rounded"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
      {showActions && o.status === "completed" && (
        <button
          onClick={() => onDelete(o.id)}
          type="button"
          className="w-full mt-4 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition no-print"
        >
          <Trash2 className="w-4 h-4 mr-2" /> {t.deleteReceipt}
        </button>
      )}
    </div>
  );
};
const MembershipPromoButton = ({
  isMember,
  config,
  cartTotals,
  potentialSavings,
  lang,
  t,
  onClick,
  float = false,
}) => {
  const estimatedUses = config.minVisits || 2;
  const totalProjectedSavings = (potentialSavings || 0) * estimatedUses;
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-2xl flex flex-col items-center justify-center text-center font-bold shadow-xl border-4 border-white transition cursor-pointer ${
        float
          ? "fixed bottom-24 right-4 z-40 w-24 h-24 rounded-full rotate-0 shadow-xl"
          : "p-6 w-full h-full"
      } ${
        isMember
          ? "bg-green-500 text-white"
          : "bg-yellow-400 text-cyan-900 animate-pulse"
      }`}
    >
      {isMember ? (
        <>
          <CheckCircle className={`${float ? "w-5 h-5" : "w-8 h-8 mb-2"}`} />
          <span className={float ? "text-[10px]" : "text-lg"}>{t.member}</span>
          <span className="text-[9px] opacity-90">{t.saved}</span>
          <span
            className={float ? "text-sm font-black" : "text-2xl font-black"}
          >
            ${(cartTotals?.discount || 0).toFixed(2)}
          </span>
        </>
      ) : (
        <>
          <span
            className={float ? "text-sm font-black" : "text-2xl font-black"}
          >
            {config.discountPercent}% OFF
          </span>
          <span
            className={
              float ? "text-[10px] leading-tight block" : "text-xs block"
            }
          >
            {t.joinClub}
          </span>
          <span className="text-[9px] mt-1">{t.save}</span>
          <span className={float ? "text-sm font-black" : "text-xl font-black"}>
            $
            {(totalProjectedSavings > 0
              ? totalProjectedSavings
              : potentialSavings || 0
            ).toFixed(2)}
          </span>
        </>
      )}
    </button>
  );
};

// --- CHECKOUT FORM MODERNO (SIN BOTONES MANUALES) ---
const CheckoutForm = ({ amount, onSuccess, onError, payBtnText }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, 
      },
      redirect: "if_required", 
    });

    if (error) {
      setErrorMessage(error.message);
      onError(error.message);
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PaymentElement />
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex justify-center items-center mt-6 ${
          isProcessing
            ? "bg-gray-600 cursor-wait"
            : "bg-cyan-900 hover:bg-black"
        }`}
      >
        {isProcessing ? (
          <CustomLoaderIcon className="animate-spin w-5 h-5" />
        ) : (
          payBtnText
        )}
      </button>
    </form>
  );
};
// --- PARTE 4: LÓGICA PRINCIPAL (FastWaveApp) ---

export default function FastWaveApp() {
  const [view, setView] = useState("home");
  const [cart, setCart] = useState({});
  const [isExpress, setIsExpress] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [lang, setLang] = useState("en");
  const [allergies, setAllergies] = useState([]);
  const [aroma, setAroma] = useState("Fresh");
  const [toast, setToast] = useState({ message: null, type: "success" });
  const [formErrors, setFormErrors] = useState({});
  const [isAppReady, setIsAppReady] = useState(false); 

  // --- ESTADO PARA PAYMENT ELEMENT (STRIPE MODERNO) ---
  const [clientSecret, setClientSecret] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingMethod, setPendingMethod] = useState(null);
  
  // Stripe Objects
  const [stripeObj, setStripeObj] = useState(null);
  const lastStripeKeyRef = useRef(null);

  // Otros estados
  const [form, setForm] = useState(() => {
    const savedName = localStorage.getItem("fw_name");
    const savedPhone = localStorage.getItem("fw_phone");
    return {
      name: savedName || "",
      phone: savedPhone || "",
      address: "",
      pickupDate: "",
      pickupTime: TIME_SLOTS[0],
      deliveryDate: "",
      deliveryTime: TIME_SLOTS[0],
      paymentMethod: "cash",
    };
  });
  
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [config, setConfig] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemAddedMsg, setItemAddedMsg] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  
  // Modales
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  const [showHomeJoinModal, setShowHomeJoinModal] = useState(false);
  const [showCancelMemberModal, setShowCancelMemberModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showLossWarning, setShowLossWarning] = useState(false);
  
  const [shareData, setShareData] = useState(null);
  const [members, setMembers] = useState([]);
  const [pastMembers, setPastMembers] = useState([]);
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [qrModal, setQRModal] = useState({ show: false, url: "" });
  const [dateErrorMsg, setDateErrorMsg] = useState(null);
  const [adminUpdateAlert, setAdminUpdateAlert] = useState(null);

  const showAlert = (msg, type = "success") => setToast({ message: msg, type });
  const closeToast = () => setToast({ ...toast, message: null });
    
  useTailwind();
  useAppMode(config.customIcon);
  const t = LANGUAGES[lang] || LANGUAGES["en"];

  // ✅ ARREGLO 1: Helper function definida aquí para evitar errores de "not defined"
  const getServiceName = (s) => {
    if (!s) return "";
    return s[`name_${lang}`] || s.name_en || s.name_es || s.id || "";
  };

  // ✅ ARREGLO 2: CÁLCULOS AQUÍ ARRIBA (Antes de usarlos)
  // Esto evita la pantalla blanca.
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const calculateTotals = () => {
    const subtotal = Object.entries(cart).reduce((acc, [id, qty]) => {
      const s = services.find((x) => x.id === id);
      return acc + (s?.price || 0) * qty;
    }, 0);
    const expressFee = isExpress
      ? subtotal * ((config.expressPercent || 20) / 100)
      : 0;
    const discount = isMember
      ? (subtotal + expressFee) * ((config.discountPercent || 10) / 100)
      : 0;
    const taxable = subtotal + expressFee - discount;
    const tax = taxable * ((config.taxPercent || 0) / 100);
    return { subtotal, expressFee, discount, tax, finalTotal: taxable + tax };
  };
  
  // Ahora sí podemos declarar cartTotals sin que rompa la app
  const cartTotals = calculateTotals();

  // --- PLAN C: CARGA FORZADA ---
  useEffect(() => {
    const timer = setTimeout(() => setIsAppReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("fw_name", form.name);
  }, [form.name]);
  
  useEffect(() => {
    localStorage.setItem("fw_phone", form.phone);
  }, [form.phone]);

   // Carga settings + inicializa Stripe
  useEffect(() => {
    if (!db) return;

    const unsubConfig = onSnapshot(doc(db, "settings", "general"), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() || {};
      setConfig(data);

      const pk = (data.stripePublicKey || "").trim();

      // Si cambió la llave, recargamos Stripe una sola vez
      if (pk && pk !== lastStripeKeyRef.current) {
        lastStripeKeyRef.current = pk;

        loadStripe(pk)
          .then((s) => {
            setStripeObj(s || null);
          })
          .catch((err) => {
            console.error("Error loading Stripe:", err);
            setStripeObj(null);
          });
      }

      // Si no hay pk, deshabilitamos Stripe
      if (!pk) {
        lastStripeKeyRef.current = null;
        setStripeObj(null);
      }
    });

    const unsubServices = onSnapshot(doc(db, "settings", "services"), (snap) => {
      if (snap.exists()) setServices(snap.data().list || []);
    });

    const unsubMembers = onSnapshot(doc(db, "settings", "members"), (snap) => {
      if (snap.exists()) {
        setMembers(snap.data().list || []);
        setPastMembers(snap.data().history || []);
      }
    });

    return () => {
      unsubConfig();
      unsubServices();
      unsubMembers();
    };
  }, []);

  useEffect(() => {
    if (form.phone.trim().length > 7 && members.includes(form.phone.trim())) {
      setIsMember(true);
    } else {
      setIsMember(false);
    }
  }, [form.phone, members]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("myOrders") || "[]");
    if (saved.length > 0 && db) {
      const q = query(
        collection(db, "orders"),
        where("__name__", "in", saved.slice(-10))
      );
      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyOrders(list);
        const modifiedOrder = list.find((o) => o.wasModifiedByAdmin === true);
        if (modifiedOrder) {
          setAdminUpdateAlert(modifiedOrder);
        }
      });
      return () => unsub();
    } else {
      setMyOrders([]);
    }
  }, [lastOrder]);

  const dismissAdminAlert = async () => {
    if (adminUpdateAlert && db) {
      await updateDoc(doc(db, "orders", adminUpdateAlert.id), {
        wasModifiedByAdmin: false,
      });
      setAdminUpdateAlert(null);
    }
  };
  const updateCart = (id, qty) => {
    setCart((prev) => {
      const newQty = (prev[id] || 0) + qty;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
    if (qty > 0) {
      setItemAddedMsg(id);
      setTimeout(() => setItemAddedMsg(null), 800);
    }
  };

  const currentSavings =
    (cartTotals.subtotal + cartTotals.expressFee) *
    ((config.discountPercent || 10) / 100);
  const estimatedUses = config.minVisits || 2;
  const totalProjectedSavings = currentSavings * estimatedUses;
  const membershipCost = config.rejoinFee || 10;
  const membershipDuration = config.rejoinDuration || "1 Month";

  const handleHomeMemberClick = () => {
    if (isMember) {
      setShowCancelMemberModal(true);
    } else {
      setShowHomeJoinModal(true);
    }
  };
  const joinFromHome = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      showAlert(t.fillDetails, "error");
      return;
    }
    if (db)
      await setDoc(
        doc(db, "settings", "members"),
        { list: arrayUnion(form.phone.trim()) },
        { merge: true }
      );
    setIsMember(true);
    setShowHomeJoinModal(false);
    setShowCelebrationModal(true);
  };
  const joinMembershipFromCheckout = async () => {
    if (db && form.phone.trim())
      await setDoc(
        doc(db, "settings", "members"),
        { list: arrayUnion(form.phone.trim()) },
        { merge: true }
      );
    setIsMember(true);
    setShowMemberModal(false);
    setShowCelebrationModal(true);
  };
  const continueFromCelebration = () => {
    setShowCelebrationModal(false);
    if (view === "cart" && pendingMethod) openPaymentModal(pendingMethod);
  };
  const handleNoAndContinue = () => {
    setShowMemberModal(false);
    setShowLossWarning(true);
  };
  const confirmLossAndPay = () => {
    setShowLossWarning(false);
    openPaymentModal(pendingMethod);
  };
  const goBackToOffer = () => {
    setShowLossWarning(false);
    setShowMemberModal(true);
  };
  const cancelMembership = async () => {
    if (db && form.phone.trim())
      await updateDoc(doc(db, "settings", "members"), {
        list: arrayRemove(form.phone.trim()),
      });
    setIsMember(false);
    setShowCancelMemberModal(false);
    showAlert(t.cancelMembership, "success");
  };
  const rejoinMembership = async () => {
    if (db && form.phone.trim())
      await updateDoc(doc(db, "settings", "members"), {
        history: arrayRemove(form.phone.trim()),
        list: arrayUnion(form.phone.trim()),
      });
    setIsMember(true);
    setShowRejoinModal(false);
    openPaymentModal(pendingMethod);
  };

  const validateForm = () => {
    let errors = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.phone.trim()) errors.phone = true;
    if (!form.address.trim()) errors.address = true;
    if (!form.pickupDate) errors.pickupDate = true;
    if (!form.deliveryDate) errors.deliveryDate = true;
    setFormErrors(errors);
    const logicError = validateScheduleLogic(
      form.pickupDate,
      form.pickupTime,
      form.deliveryDate,
      form.deliveryTime
    );
    if (logicError) {
      setDateErrorMsg(t[logicError]);
      return false;
    } else {
      setDateErrorMsg(null);
    }
    if (Object.keys(errors).length > 0) return false;
    return true;
  };

  const handleMethodClick = (method) => {
    setPendingMethod(method);
    setForm((prev) => ({ ...prev, paymentMethod: method }));
    if (!validateForm()) {
      showAlert(t.fillDetails, "error");
      return;
    }
    if (!isMember && !pastMembers.includes(form.phone.trim())) {
      setSavingsAmount(currentSavings);
      setShowMemberModal(true);
      return;
    } else if (!isMember && pastMembers.includes(form.phone.trim())) {
      setShowRejoinModal(true);
      return;
    }
    openPaymentModal(method);
  };

  // --- LÓGICA DE PAGO (Stripe PaymentElement) ---
  const openPaymentModal = async (method) => {
    setPaymentError(null);
    setClientSecret(null);
    setIsProcessingPayment(true);

    // Si es tarjeta (que incluye Apple/Google Pay en el modo moderno)
    if (method === "card") {
      setIsLoadingPayment(true);

      try {
        // Llamada al servidor para crear el PaymentIntent
        const res = await fetch("https://us-central1-fast-wave-laundry-86d9f.cloudfunctions.net/createPaymentIntent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: Math.round(cartTotals.finalTotal * 100),
    currency: "usd",
  }),
});

const text = await res.text();
let data;
try { data = JSON.parse(text); } catch { data = { raw: text }; }

if (!res.ok) {
  throw new Error(data?.error || `HTTP ${res.status}: ${text?.slice(0, 120)}`);
}

if (!data?.clientSecret) throw new Error("No clientSecret returned");
setClientSecret(data.clientSecret);
;

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setPaymentError("Error starting payment. Check server connection.");
      } finally {
        setIsLoadingPayment(false);
      }

    }
  };

  // --- MANEJO DE PAGO MANUAL (Cash / Zelle) ---
  const handlePayNow = async () => {
    setPaymentError(null);
    
    if (form.paymentMethod === "card") return;

    if (form.paymentMethod === "cash" || form.paymentMethod === "online") {
      setIsLoadingPayment(true);
      setTimeout(() => {
        setIsLoadingPayment(false);
        setPaymentSuccess(true);
      }, 1000);
      return;
    }
  };

  const handlePaymentComplete = () => {
    setIsProcessingPayment(false);
    setPaymentSuccess(false);
    const isPaid = form.paymentMethod !== "cash";
    submitOrder(false, false, isPaid, form.paymentMethod);
  };

  // --- FUNCIÓN SUBMIT ORDER ---
  const submitOrder = async (
    forceMember = false,
    isRejoin = false,
    isPaid = false,
    methodOverride = null
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const orderNum = generateShortId();
    const currentIsMember = forceMember || isMember;
    let finalTotal = cartTotals.finalTotal;
    let finalExpressFee = cartTotals.expressFee;
    let finalDiscount = cartTotals.discount;

    if (forceMember || isMember) {
      const subtotal = cartTotals.subtotal;
      const express = subtotal * ((config.expressPercent || 20) / 100);
      const disc =
        (subtotal + express) * ((config.discountPercent || 10) / 100);
      const tax =
        (subtotal + express - disc) * ((config.taxPercent || 0) / 100);
      finalExpressFee = express;
      finalDiscount = disc;
      finalTotal = subtotal + express - disc + tax;
    }
    if (isRejoin) finalTotal += parseFloat(config.rejoinFee) || 10;

    const orderData = {
      customerName: form.name,  // <--- Etiqueta para el Servidor
      total: Number(cartTotals.finalTotal).toFixed(2), // <--- Total bonito (ej: 25.50)
      customer: { name: form.name, phone: form.phone, address: form.address },
      items: cart,
      details: {
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        deliveryDate: form.deliveryDate,
        deliveryTime: form.deliveryTime,
        paymentMethod: methodOverride || form.paymentMethod,
      },
      express: isExpress,
      isMember: currentIsMember,
      wasRejoin: isRejoin,
      expressFeeAmount: finalExpressFee,
      discountAmount: finalDiscount,
      allergies,
      aroma,
      total: finalTotal,
      paymentStatus: isPaid ? "paid" : "pending",
      status: "pending",
      createdAt: new Date().toISOString(),
      adminNote: "",
      customerResponse: "",
      orderNumber: orderNum,
      scheduleUpdatedByAdmin: false,
      chat: [],
    };

   // Definimos la orden local por si falla internet
  const finalOrderLocal = { id: "LOCAL-" + orderNum, ...orderData };

  try {
    if (db) {
     // 1. INTENTAMOS GUARDAR LA ORDEN EN FIREBASE CON FECHA EXACTA
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        date: new Date().toISOString() // <--- ESTO ES VITAL PARA ORDENAR DESPUÉS
      });
      
      // Si llegamos aquí, la orden SE GUARDÓ. Ahora preparamos la confirmación.
      const finalOrderDB = { id: docRef.id, ...orderData };
      setLastOrder(finalOrderDB);

      // 2. CREAMOS LA NOTIFICACIÓN (Usando orderData.total que es más seguro)
      await addDoc(collection(db, "admin_notifications"), {
        
        type: "NEW_ORDER",
        title: "Nueva Orden",
        message: `Cliente: ${form.name} - Total: $${Number(orderData.total).toFixed(2)}`,
        date: new Date().toISOString(),
        read: false,
        orderId: docRef.id
      });
// 2B. --- ENVÍO DE CORREO AUTOMÁTICO (EMAILJS) ---
        if (config.adminEmail) {
          
          const SERVICE_ID = "service_bkbc9ye";   
          const TEMPLATE_ID = "template_52asres"; 
          const PUBLIC_KEY = "AFILo6XhfEoEPYVBK";
          
          const templateParams = {
            to_email: config.adminEmail, 
            customer_name: form.name,
            phone: form.phone,
            total_price: Number(orderData.total).toFixed(2),
            
            // --- CAMBIA ESTA LÍNEA ---
            order_id: orderNum   // Antes decía: docRef.id
            // -------------------------
          };

          emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
            .then(() => console.log("Correo enviado con éxito"))
            .catch((err) => console.error("Error al enviar correo:", err));
        }

      // 3. GUARDAMOS EN EL HISTORIAL DEL TELÉFONO
      const saved = JSON.parse(localStorage.getItem("myOrders") || "[]");
      localStorage.setItem("myOrders", JSON.stringify([...saved, docRef.id]));
      
    } else {
      // Si no hay conexión a base de datos configurada
      setLastOrder(finalOrderLocal);
    }
  } catch (e) {
    // --- SI ALGO FALLA, ESTO TE DIRÁ QUÉ FUE ---
    console.error("Error crítico:", e);
    alert("Ocurrió un error al guardar: " + e.message); 
    
    // Activamos modo offline para no perder la venta
    setLastOrder(finalOrderLocal);
  }

    setCart({});
    setForm((prev) => ({
      ...prev,
      address: "",
      pickupDate: "",
      pickupTime: TIME_SLOTS[0],
      deliveryDate: "",
      deliveryTime: TIME_SLOTS[0],
      paymentMethod: "cash",
    }));
    setIsExpress(false);
    setAllergies([]);
    setIsSubmitting(false);
    setView("success");
  };

  const sendClientMessage = async (orderId, msgText) => {
    if (!db) return;
    const newMessage = {
      text: msgText,
      sender: "client",
      date: new Date().toISOString(),
    };
    const orderRef = doc(db, "orders", orderId);
    try {
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const currentChat = snap.data().chat || [];
        await updateDoc(orderRef, { chat: [...currentChat, newMessage] });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const shareOrder = (o) => {
    setShareData(o);
  };
  const deleteLocalOrder = (id) => {
    const saved = JSON.parse(localStorage.getItem("myOrders") || "[]").filter(
      (x) => x !== id
    );
    localStorage.setItem("myOrders", JSON.stringify(saved));
    setMyOrders((prev) => prev.filter((o) => o.id !== id));
  };

  if (!isAppReady) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          zIndex: 20000,
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <svg
          style={{
            animation: "spin 1s linear infinite",
            width: "50px",
            height: "50px",
          }}
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="#0891b2"
            strokeWidth="4"
            d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2"
          ></path>
        </svg>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans text-gray-800"
      style={{ opacity: 0, animation: "fadeIn 0.5s ease-out forwards" }}
    >
      <style>{`
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>
      <CustomToast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
      <nav className="bg-white backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-cyan-100 no-print pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setView("home")}
          >
            <BrandLogo customIcon={config.customIcon} t={t} />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={() =>
                setQRModal({ show: true, url: window.location.href })
              }
              className="p-2 text-gray-600 hover:text-cyan-600"
            >
              <QrCode className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setView("track")}
              className="flex items-center font-bold bg-gray-100 px-3 py-2 rounded-lg"
            >
              <CustomPackageIcon className="w-4 h-4 mr-2" /> {t.trackOrder}
            </button>
            <div className="flex items-center bg-cyan-50 px-4 py-2 rounded-full text-cyan-800 font-mono text-sm">
              <Phone className="h-4 w-4 mr-2" /> {config.phone}
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-gray-100 rounded px-2 py-1 text-sm"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="hi">🇮🇳 HI</option>
            </select>
            <button
              type="button"
              onClick={() => setView("cart")}
              className="relative p-3 text-gray-500"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setView("admin")}
              className="p-2 text-gray-400"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setQRModal({ show: true, url: window.location.href })
              }
              className="p-2 text-gray-600"
            >
              <QrCode className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setView("cart")}
              className="relative p-2"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-cyan-800"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 shadow-xl absolute w-full z-40">
            <button
              type="button"
              onClick={() => {
                setView("home");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setView("track");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold"
            >
              My Orders
            </button>
            <button
              type="button"
              onClick={() => {
                setView("cart");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold"
            >
              Cart ({cartCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setView("admin");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold flex items-center text-gray-500"
            >
              <Lock className="w-4 h-4 mr-2" /> {t.login}
            </button>
            <div className="flex justify-between items-center pt-4 border-t">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-gray-100 rounded px-2 py-1 text-sm"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="hi">🇮🇳 HI</option>
              </select>
            </div>
          </div>
        )}
      </nav>

      {adminUpdateAlert && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-t-8 border-yellow-400 max-w-md w-full relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] bg-yellow-100 rounded-full w-20 h-20"></div>
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4 relative z-10" />
            <h3 className="font-black text-2xl mb-2 text-gray-800">
              {t.alertTitle}
            </h3>
            <p className="mb-6 text-gray-600 leading-relaxed">{t.alertMsg}</p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Nuevo Total
              </p>
              <p className="text-xl font-black text-cyan-700">
                ${adminUpdateAlert.total.toFixed(2)}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-2 mb-1">
                Recogida
              </p>
              <p className="font-bold text-gray-700">
                {adminUpdateAlert.details.pickupDate} -{" "}
                {adminUpdateAlert.details.pickupTime}
              </p>
            </div>
            <button
              onClick={dismissAdminAlert}
              className="bg-yellow-500 text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              {t.btnUnderstood}
            </button>
          </div>
        </div>
      )}

      {view === "home" && (
        <div className="animate-fade-in">
          <div className="relative h-[550px] flex items-center justify-center bg-cyan-900 text-white text-center px-4 overflow-hidden">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage: `url('${
                  config.heroImage ||
                  "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80"
                }')`,
              }}
            ></div>
            <div className="relative z-10 max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-black mb-4 drop-shadow-lg">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-white text-cyan-900 px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition"
                >
                  {t.orderNow}
                </button>
                <button
                  type="button"
                  onClick={() => setView("cart")}
                  className="bg-cyan-500 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition border-2 border-white/20 flex items-center justify-center"
                >
                  <ShoppingBag className="mr-2 w-5 h-5" /> {t.sendOrder}
                </button>
              </div>
            </div>
            <div className="absolute top-10 right-10 z-20 hidden md:block">
              <MembershipPromoButton
                isMember={isMember}
                config={config}
                cartTotals={cartTotals}
                potentialSavings={currentSavings}
                lang={lang}
                t={t}
                onClick={handleHomeMemberClick}
                float={false}
              />
            </div>
          </div>
          <div id="services" className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-black text-center mb-12 text-gray-900">
              {t.services}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden group transition relative"
                >
                  {itemAddedMsg === s.id && (
                    <div className="absolute inset-0 bg-cyan-600/80 z-20 flex items-center justify-center animate-fade-in">
                      <CheckCircle className="text-white w-12 h-12" />
                    </div>
                  )}
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {s.image ? (
                      <img
                        src={s.image}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        alt={s.name_en}
                      />
                    ) : (
                      <div className="w-20 h-20">
                        <CustomIronIcon />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{getServiceName(s)}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-600 text-lg">
                        ${s.price}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCart(s.id, -1)}
                          className="w-8 h-8 bg-gray-200 rounded-full font-bold text-gray-600"
                        >
                          -
                        </button>
                        <span className="font-bold">{cart[s.id] || 0}</span>
                        <button
                          type="button"
                          onClick={() => updateCart(s.id, 1)}
                          className="w-8 h-8 bg-cyan-600 text-white rounded-full font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-24">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  <Droplet className="mr-2 text-purple-500" />{" "}
                  {t.preferredAroma}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {AROMAS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAroma(a.id)}
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        aroma === a.id
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {a[lang] || a.en}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  <AlertCircle className="mr-2 text-red-500" />{" "}
                  {t.productsToAvoid}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {AVOID_PRODUCTS.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={allergies.includes(p.id)}
                        onChange={() =>
                          setAllergies((x) =>
                            x.includes(p.id)
                              ? x.filter((y) => y !== p.id)
                              : [...x, p.id]
                          )
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {lang === "es" ? p.label_es : p.label_en}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-32 items-stretch">
              <label
                className={`p-6 border-2 rounded-2xl flex items-center cursor-pointer transition-all hover:shadow-md ${
                  isExpress ? "border-cyan-500 bg-cyan-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isExpress}
                  onChange={() => setIsExpress(!isExpress)}
                  className="w-6 h-6 mr-4 accent-cyan-600"
                />
                <div>
                  <span className="font-bold text-lg block">{t.express}</span>
                  <span className="text-sm text-cyan-700">
                    +{config.expressPercent}% Fee
                  </span>
                </div>
              </label>
              <MembershipPromoButton
                isMember={isMember}
                config={config}
                cartTotals={cartTotals}
                potentialSavings={currentSavings}
                lang={lang}
                t={t}
                onClick={handleHomeMemberClick}
                float={false}
              />
            </div>
            {cartCount > 0 && (
              <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 animate-bounce-slow">
                <button
                  type="button"
                  onClick={() => setView("cart")}
                  className="bg-gray-900 text-white w-full max-w-md py-4 px-8 rounded-full shadow-2xl flex justify-between items-center border-4 border-white/20 backdrop-blur-lg"
                >
                  <div className="flex items-center">
                    <span className="bg-cyan-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-lg">
                      {cartCount}
                    </span>
                    <span className="font-bold text-lg">{t.sendOrder}</span>
                  </div>
                  <span className="font-mono text-2xl font-black">
                    ${cartTotals.finalTotal.toFixed(2)}
                  </span>
                </button>
              </div>
            )}
            <div className="md:hidden">
              <MembershipPromoButton
                isMember={isMember}
                config={config}
                cartTotals={cartTotals}
                potentialSavings={currentSavings}
                lang={lang}
                t={t}
                onClick={handleHomeMemberClick}
                float={true}
              />
            </div>
          </div>
        </div>
      )}

      {view === "cart" && (
       
  

        <div className="max-w-4xl mx-auto p-6 pb-24 animate-fade-in">
          <h2 className="text-3xl font-black mb-6">{t.sendOrder}</h2>
          {cartCount === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <p className="text-gray-400">{t.emptyCart}</p>
              <button
                type="button"
                onClick={() => setView("home")}
                className="mt-4 text-cyan-600 font-bold"
              >
                {t.back}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">
                    {t.customerInfo}
                  </h3>
                  <div className="space-y-3">
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className={`w-full p-3 border rounded ${
                        formErrors.name ? "border-red-500 bg-red-50" : ""
                      }`}
                      placeholder={t.nameLabel}
                    />
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className={`w-full p-3 border rounded ${
                        formErrors.phone ? "border-red-500 bg-red-50" : ""
                      }`}
                      placeholder={t.phoneLabel}
                    />
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className={`w-full p-3 border rounded ${
                        formErrors.address ? "border-red-500 bg-red-50" : ""
                      }`}
                      placeholder={t.addressLabel}
                    />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">
                    {t.pickupInfo}
                  </h3>
                  {dateErrorMsg && (
                    <div className="text-red-500 text-xs mb-2">
                      {dateErrorMsg}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1 block">
                        {t.pickupDate}
                      </label>
                      <input
                        type="date"
                        value={form.pickupDate}
                        onChange={(e) =>
                          setForm({ ...form, pickupDate: e.target.value })
                        }
                        className={`w-full p-2 border rounded ${
                          formErrors.pickupDate
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block">
                        {t.pickupTime}
                      </label>
                      <select
                        value={form.pickupTime}
                        onChange={(e) =>
                          setForm({ ...form, pickupTime: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block">
                        {t.deliveryDate}
                      </label>
                      <input
                        type="date"
                        value={form.deliveryDate}
                        onChange={(e) =>
                          setForm({ ...form, deliveryDate: e.target.value })
                        }
                        className={`w-full p-2 border rounded ${
                          formErrors.deliveryDate
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block">
                        {t.deliveryTime}
                      </label>
                      <select
                        value={form.deliveryTime}
                        onChange={(e) =>
                          setForm({ ...form, deliveryTime: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">{t.details}</h3>
                  {Object.entries(cart).map(([id, qty]) => {
                    const s = services.find((x) => x.id === id);
                    return (
                      <div
                        key={id}
                        className="flex justify-between text-sm mb-2"
                      >
                        <span>
                          {qty}x {getServiceName(s)}
                        </span>
                        <span>${(s?.price * qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t mt-4 pt-4 flex justify-between font-black text-xl">
                    <span>{t.total}</span>
                    <span>${cartTotals.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">{t.payment}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleMethodClick("cash")}
                      className={`p-3 border rounded flex flex-col items-center ${
                        form.paymentMethod === "cash"
                          ? "bg-green-50 border-green-500"
                          : ""
                      }`}
                    >
                      <DollarSign className="mb-1 text-green-600" />{" "}
                      {t.payCashLabel}
                    </button>
                    {/* Botón de Tarjeta / Stripe */}
                    <button
                      type="button"
                      onClick={() => handleMethodClick("card")}
                      className={`p-3 border rounded flex flex-col items-center ${
                        form.paymentMethod === "card"
                          ? "bg-blue-50 border-blue-500"
                          : ""
                      }`}
                    >
                      <CreditCard className="mb-1 text-blue-600" />{" "}
                      {t.payCardLabel}
                    </button>
                    {/* Botón Zelle */}
                    <button
                      type="button"
                      onClick={() => handleMethodClick("online")}
                      className={`p-3 border rounded flex flex-col items-center ${
                        form.paymentMethod === "online"
                          ? "bg-purple-50 border-purple-500"
                          : ""
                      }`}
                    >
                      <ExternalLink className="mb-1 text-purple-600" /> Zelle
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setView("home")}
                  className="w-full text-center text-gray-400 text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "success" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-cyan-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full animate-fade-in my-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-800 mb-1">
              {t.successMsg}
            </h1>
            <p className="text-gray-500 mb-6 text-sm">{t.successSub}</p>
            {lastOrder && (
              <OrderCard
                o={lastOrder}
                showActions={false}
                services={services}
                lang={lang}
                t={t}
                onShare={shareOrder}
                onChatSend={sendClientMessage}
              />
            )}
            <div className="space-y-3 mt-4">
              <a
                href={getOwnerWhatsApp(lastOrder, config.phone)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-green-600 transition flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" /> {t.notifyOwner}
              </a>
              <a
                href={getOwnerSMS(lastOrder, config.phone)}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-blue-600 transition flex items-center justify-center"
              >
                <Smartphone className="w-5 h-5 mr-2" /> {t.sendSMS}
              </a>
            </div>
            <button
              type="button"
              onClick={() => setView("track")}
              className="w-full text-cyan-600 font-bold mt-4 hover:underline"
            >
              {t.trackOrder}
            </button>
            <button
              type="button"
              onClick={() => setView("home")}
              className="w-full text-gray-400 text-sm mt-4"
            >
              {t.back}
            </button>
          </div>
        </div>
      )}

      {view === "track" && (
        <div className="min-h-screen bg-slate-50 p-4 pb-24">
          <div className="flex justify-between mb-6">
            <button
              type="button"
              onClick={() => setView("home")}
              className="font-bold text-gray-600"
            >
              <ArrowLeft className="inline mr-2" /> {t.back}
            </button>
            <h2 className="text-2xl font-black">{t.yourOrders}</h2>
          </div>
          <div className="space-y-4">
            {myOrders.map((o) => (
              <OrderCard
                key={o.id}
                o={o}
                services={services}
                lang={lang}
                t={t}
                onDelete={deleteLocalOrder}
                onShare={shareOrder}
                onChatSend={sendClientMessage}
              />
            ))}
          </div>
        </div>
      )}
{/* CART */}
{view === "cart" && (
  <div className="max-w-4xl mx-auto p-6 pb-24">
    {/* TODO tu código del carrito */}
  </div>
)}

{/* CART */}
{view === "cart" && (
  <div className="max-w-4xl mx-auto p-6 pb-24">
    {/* TODO tu código del carrito */}
  </div>
)}

{/* ADMIN */}
{view === "admin" && (
  <div className="max-w-6xl mx-auto p-6 pb-24">
    <AdminView
      t={t}
      config={config}
      setConfig={setConfig}
      services={services}
      setServices={setServices}
      setView={setView}
      lang={lang}
      showAlert={showAlert}
    />
  </div>
)}

{/* MODAL JOIN CLUB (NO SALE EN ADMIN) */}
{view !== "admin" && showMemberModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

      <h3 className="font-black text-3xl mb-1 text-gray-800">
        {t.joinClub}
      </h3>

      <p className="text-gray-500 mb-6 text-sm">{t.enterDetails}</p>

      <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-600">
            {t.savingsToday}
          </span>
          <span className="text-xl font-black text-green-600">
            ${currentSavings.toFixed(2)}
          </span>
        </div>

        <div className="h-px bg-green-200 my-2"></div>

        <p className="text-xs text-green-700 leading-tight">
          {t.ifYouUse} {estimatedUses} {t.timesIn} {membershipDuration},{" "}
          {t.couldSave}
        </p>

        <p className="text-2xl font-black text-green-700 mt-1">
          ${totalProjectedSavings.toFixed(2)}
        </p>
      </div>

      <p className="mb-4 text-sm font-bold text-gray-700">
        {t.cost}: ${membershipCost} {t.for} {membershipDuration}
      </p>

      <button
        type="button"
        onClick={joinMembershipFromCheckout}
        className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-4 rounded-xl font-black text-lg mb-3 shadow-lg hover:scale-105 transition transform"
      >
        {t.yesJoin}
      </button>

      <button
        type="button"
        onClick={handleNoAndContinue}
        className="w-full text-gray-400 font-bold py-2 text-sm hover:text-gray-600"
      >
        {t.noThanks}
      </button>
    </div>
  </div>
)}

      {showLossWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl text-center max-w-sm w-full">
            <h3 className="font-black text-xl mb-2 text-red-600">
              {t.areYouSure}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.loseSavings} ${savingsAmount.toFixed(2)}.
            </p>
            <button
              type="button"
              onClick={confirmLossAndPay}
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl mb-2"
            >
              {t.yesLose}
            </button>
            <button
              type="button"
              onClick={goBackToOffer}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-md"
            >
              {t.yesJoin}
            </button>
          </div>
        </div>
      )}
      {showRejoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl text-center">
            <h3 className="font-black text-2xl mb-4">{t.rejoinTitle}</h3>
            <button
              type="button"
              onClick={rejoinMembership}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold mb-2"
            >
              {t.rejoinYes}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejoinModal(false);
                openPaymentModal(pendingMethod);
              }}
              className="w-full text-gray-500"
            >
              {t.joinNo}
            </button>
          </div>
        </div>
      )}
      {showHomeJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowHomeJoinModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
            <h3 className="font-black text-xl mb-4 text-center text-cyan-900">
              {t.joinClub}
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {t.enterDetails}
            </p>
            <input
              className="w-full p-3 border rounded mb-3"
              placeholder={t.nameLabel}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full p-3 border rounded mb-4"
              placeholder={t.phoneLabel}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button
              type="button"
              onClick={joinFromHome}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-600 transition"
            >
              {t.activateMembership}
            </button>
          </div>
        </div>
      )}
      {showCancelMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center shadow-2xl">
            <h3 className="font-black text-xl mb-2 text-red-600">
              {t.cancelMembership}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{t.loseDiscounts}</p>
            <button
              type="button"
              onClick={cancelMembership}
              className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-xl mb-2 hover:bg-red-200"
            >
              {t.yesCancel}
            </button>
            <button
              type="button"
              onClick={() => setShowCancelMemberModal(false)}
              className="w-full text-gray-400 py-2 hover:text-gray-600"
            >
              {t.back}
            </button>
          </div>
        </div>
      )}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-50 opacity-50 z-0"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="font-black text-3xl mb-2 text-cyan-900 leading-tight">
                {lang === "es"
                  ? "¡YA ERES MIEMBRO!"
                  : "YOU ARE NOW A MEMBER!"}
              </h3>
              <p className="text-lg text-gray-600 mb-6 font-bold">
                {lang === "es"
                  ? "¡Prepárate para ahorrar en grande!"
                  : "Get ready for big savings!"}
              </p>
              <button
                type="button"
                onClick={continueFromCelebration}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-105 transition text-xl"
              >
                {lang === "es" ? "CONTINUAR" : "CONTINUE"}
              </button>
            </div>
          </div>
        </div>
      )}
      {shareData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setShareData(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              X
            </button>
            <h3 className="font-black text-xl mb-4 text-gray-800">
              {t.shareApp || "Share"}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <a
                href={getClientWhatsApp(shareData)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-4 bg-green-100 text-green-800 rounded-xl font-bold hover:bg-green-200 transition"
              >
                <MessageCircle className="mr-3 w-5 h-5" /> WhatsApp Cliente
              </a>
              <a
                href={getClientSMS(shareData)}
                className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-xl font-bold hover:bg-blue-200 transition"
              >
                <Smartphone className="mr-3 w-5 h-5" /> SMS Cliente
              </a>
            </div>
          </div>
        </div>
      )}
      {qrModal.show && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative">
            <button
              type="button"
              onClick={() => setQRModal({ show: false, url: "" })}
              className="absolute top-2 right-2"
            >
              X
            </button>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrModal.url}`}
              className="mx-auto mb-4"
            />
            <div className="flex justify-center gap-4">
              <a
                href={`https://wa.me/?text=${qrModal.url}`}
                className="bg-green-100 p-2 rounded"
              >
                Whatsapp
              </a>
              <a
                href={`sms:?body=${qrModal.url}`}
                className="bg-blue-100 p-2 rounded"
              >
                SMS
              </a>
              <a
                href={`mailto:?body=${qrModal.url}`}
                className="bg-gray-100 p-2 rounded"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      )}

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsProcessingPayment(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
            {!paymentSuccess ? (
              <div className="py-2">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                  {form.paymentMethod === "cash"
                    ? t.payCashLabel
                    : form.paymentMethod === "online"
                    ? t.payOnlineLabel
                    : form.paymentMethod === "card"
                    ? t.payCardLabel
                    : t.payWallet}
                </h3>
                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {paymentError}
                  </div>
                )}
                {/* --- AQUI ESTA LA LOGICA MODERNA DE STRIPE ELEMENTS QUE PEDISTE --- */}
                {form.paymentMethod === "card" ? (
                  <div className="mb-6">
                    {clientSecret && stripeObj ? (
                      <Elements
                        stripe={stripeObj}
                        options={{
                          clientSecret: clientSecret,
                          appearance: { theme: "stripe" },
                        }}
                      >
                        <CheckoutForm
                          amount={cartTotals.finalTotal}
                          onSuccess={handlePaymentComplete}
                          onError={(msg) => setPaymentError(msg)}
                          payBtnText={t.payNow}
                        />
                      </Elements>
                    ) : (
                      <div className="flex justify-center p-4">
                        <CustomLoaderIcon className="animate-spin w-8 h-8 text-cyan-600" />
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2 text-center flex justify-center items-center">
                      <Lock className="w-3 h-3 mr-1" /> {t.secureStripe}
                    </p>
                  </div>
                ) : (
                  <>
                    {form.paymentMethod === "online" && (
                      <div className="bg-purple-50 p-4 rounded mb-4 text-sm text-center">
                        <p className="font-bold text-purple-800">
                          {t.sendTo} {config.zelleNumber || "--"}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {config.zelleMessage}
                        </p>
                        <p className="text-2xl font-black mt-2 text-purple-900">
                          ${cartTotals.finalTotal.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {form.paymentMethod === "cash" && (
                      <div className="bg-green-50 p-4 rounded mb-4 text-center">
                        <p className="text-green-800 font-bold mb-2">
                          {t.totalDue}
                        </p>
                        <span className="text-3xl font-black text-green-600">
                          ${cartTotals.finalTotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {/* Botón para métodos NO-TARJETA (Cash, Zelle, Wallet viejo) */}
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isLoadingPayment}
                      className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex justify-center items-center ${
                        isLoadingPayment
                          ? "bg-gray-400 cursor-wait"
                          : "bg-cyan-900 hover:bg-black"
                      }`}
                    >
                      {isLoadingPayment ? (
                        <CustomLoaderIcon className="animate-spin w-5 h-5" />
                      ) : form.paymentMethod === "cash" ? (
                        t.confirmOrderBtn
                      ) : (
                        t.payNow
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="py-4 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">
                  {t.paymentSuccess}
                </h3>
                <button
                  type="button"
                  onClick={handlePaymentComplete}
                  className="w-full bg-gray-900 text-white py-2 rounded-lg"
                >
                  {t.viewReceipt}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
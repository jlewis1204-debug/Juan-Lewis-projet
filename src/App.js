import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Lock, Phone, Star, Droplet,
  Calendar, Truck, MessageCircle, Settings, 
  Edit2, ArrowLeft, Trash2, Plus, User, CheckCircle, CreditCard, AlertCircle,
  ShieldCheck, Key, Send, Minus, MapPin, Clock, Menu, X, Smartphone, Printer, Save, XCircle, ExternalLink, ChevronDown, ChevronUp, Share2, MessageSquare
} from 'lucide-react';

// --- IMPORTACIONES DE FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, onSnapshot, 
  updateDoc, setDoc, deleteDoc, addDoc, query, where, getDoc
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// --- TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyA8Ujw8L5uErmgL_x3fNRx530fSWjavu7M",
  authDomain: "fast-wave-laundry-86d9f.firebaseapp.com",
  projectId: "fast-wave-laundry-86d9f",
  storageBucket: "fast-wave-laundry-86d9f.firebasestorage.app",
  messagingSenderId: "715908594206",
  appId: "1:715908594206:web:bba503cfb667cb4c390c0f",
  measurementId: "G-RV7JTXY252"
};

// Inicializar Firebase (Modo Seguro)
let db, auth;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Error iniciando Firebase:", error);
}

// --- AUTO-CARGA DE ESTILOS TAILWIND ---
const useTailwind = () => {
  useEffect(() => {
    if (!document.querySelector('#tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
};

// --- CONFIGURACIÓN "MODO APP" (PWA) MEJORADA ---
const useAppMode = () => {
  useEffect(() => {
    // ICONO NUEVO: Color Cyan/Azul (Lavadora estilizada)
    const iconUrl = "https://cdn-icons-png.flaticon.com/512/3003/3003984.png"; 

    const manifest = {
      name: "Fast Wave Laundry",
      short_name: "Fast Wave",
      start_url: ".",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#06b6d4", // Cyan de la marca
      icons: [
        { src: iconUrl, sizes: "192x192", type: "image/png" },
        { src: iconUrl, sizes: "512x512", type: "image/png" }
      ]
    };
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
    link.href = manifestURL;

    const metaTags = [{ name: 'apple-mobile-web-app-capable', content: 'yes' }, { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }, { name: 'theme-color', content: '#06b6d4' }];
    metaTags.forEach(tagInfo => { let meta = document.querySelector(`meta[name="${tagInfo.name}"]`); if (!meta) { meta = document.createElement('meta'); meta.name = tagInfo.name; document.head.appendChild(meta); } meta.content = tagInfo.content; });
    
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]'); 
    if (!appleIcon) { appleIcon = document.createElement('link'); appleIcon.rel = 'apple-touch-icon'; document.head.appendChild(appleIcon); } 
    appleIcon.href = iconUrl;
  }, []);
};

// --- HELPER: GENERAR ID CORTO (6 Caracteres) ---
const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- CONSTANTES ---
const TIME_SLOTS = [
  "08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"
];

// --- ICONOS MANUALES (SVG) ---
const CustomIronIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full p-4" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ironBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <linearGradient id="ironSole" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <path fill="url(#ironSole)" d="M4 46h56c2.2 0 4 1.8 4 4s-1.8 4-4 4H4c-2.2 0-4-1.8-4-4s1.8-4 4-4z" />
    <path fill="url(#ironBody)" d="M8 46h48c0-14-10-26-26-26h-4c-10 0-16 8-16 26z" />
    <path fill="none" stroke="#155e75" strokeWidth="6" strokeLinecap="round" d="M22 20V12c0-4.4 4.4-8 8.8-8h10.4c8.8 0 12.8 7.2 12.8 16v12" />
    <circle cx="34" cy="34" r="5" fill="#fff" opacity="0.9" />
    <circle cx="34" cy="34" r="2" fill="#155e75" />
  </svg>
);

const CustomPackageIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const CustomInfoIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const CustomReceiptIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path><line x1="16" y1="8" x2="8" y2="8"></line><line x1="16" y1="12" x2="8" y2="12"></line><line x1="16" y1="16" x2="8" y2="16"></line></svg>
);
const CustomLoaderIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
);
const CustomUploadIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const CustomCameraIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
);

// --- COMPONENTE LOGO ACTUALIZADO ---
const BrandLogo = () => (
  <div className="relative flex items-center justify-center px-5 py-2 overflow-hidden rounded-full border-2 border-cyan-100 shadow-sm group hover:shadow-md transition-all cursor-pointer">
    {/* Fondo Azul/Cyan en lugar de gris */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 via-white to-cyan-50"></div>
    <div className="relative z-10 flex flex-col items-center">
        <span className="font-black text-xl text-cyan-900 leading-none tracking-tight drop-shadow-sm">Fast Wave</span>
        <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-widest">Laundry Service</span>
    </div>
  </div>
);

const INITIAL_SERVICES = [
  { id: 'wash_fold', name_en: 'Wash & Fold (per lb)', name_es: 'Lavado y Doblado (por lb)', name_fr: 'Lavage et Pliage', name_hi: 'धलाई और तह', price: 1.50, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80', type: 'image' },
  { id: 'dry_clean_shirt', name_en: 'Dry Clean Shirt', name_es: 'Lavado en Seco Camisa', name_fr: 'Chemise', name_hi: 'शर्ट', price: 5.00, image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400', type: 'image' },
  { id: 'dry_clean_suit', name_en: 'Dry Clean Suit', name_es: 'Lavado en Seco Traje', name_fr: 'Costume', name_hi: 'सूट', price: 15.00, image: 'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=400', type: 'image' },
  { id: 'ironing', name_en: 'Ironing Service', name_es: 'Servicio de Planchado', name_fr: 'Repassage', name_hi: 'इस्त्री', price: 3.00, type: 'component', componentName: 'CustomIronIcon' }, 
  { id: 'bedding', name_en: 'Bedding / Comforter', name_es: 'Ropa de Cama', name_fr: 'Literie', name_hi: 'बिस्तर', price: 20.00, image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400', type: 'image' },
];

const AVOID_PRODUCTS = [
  { id: 'softener', label_en: 'No Softener', label_es: 'Sin Suavizante', label_fr: 'Sans Adoucissant', label_hi: 'कोई सॉफ़्नर नहीं' },
  { id: 'bleach', label_en: 'No Bleach', label_es: 'Sin Cloro', label_fr: 'Sans Javel', label_hi: 'कोई ब्लीच नहीं' },
  { id: 'scented', label_en: 'No Scent', label_es: 'Sin Perfume', label_fr: 'Sans Parfum', label_hi: 'कोई सुगंध नहीं' },
];

const AROMAS = [
    { id: 'Floral', en: 'Floral', es: 'Floral', fr: 'Floral', hi: 'पुष्प' },
    { id: 'Fresh', en: 'Fresh', es: 'Fresco', fr: 'Frais', hi: 'ताज़ा' },
    { id: 'Citrus', en: 'Citrus', es: 'Cítrico', fr: 'Agrumes', hi: 'खट्टे' },
    { id: 'Woody', en: 'Woody', es: 'Amaderado', fr: 'Boisé', hi: 'लकड़ी' },
    { id: 'Unscented', en: 'Unscented', es: 'Sin Olor', fr: 'Sans Parfum', hi: 'बिना सुगंध' },
];

const LANGUAGES = {
  en: {
    title: "Fast Wave Laundry",
    heroSubtitle: "Fresh Clothes, Delivered Right to Your Door!",
    orderNow: "Start Washing",
    sendOrder: "Send Order",
    services: "Our Services",
    productsToAvoid: "Allergies / Avoid",
    preferredAroma: "Scent Selection",
    details: "Order Details",
    pickupInfo: "Pickup Info",
    deliveryInfo: "Delivery Info",
    payment: "Payment Method",
    total: "Total",
    submit: "Review Order",
    status: { pending: "Pending", confirmed: "Confirmed", picked_up: "Picked Up", cleaning: "Washing", delivering: "Delivering", completed: "Completed" },
    express: "Express Wash",
    member: "I am a Member",
    discountMsg: "Discount Applied!",
    successMsg: "Order Received!",
    successSub: "To confirm, please send details via WhatsApp or SMS below.",
    orderNumberIs: "Order #",
    back: "Back",
    adminTitle: "Admin Dashboard",
    adminOrders: "Orders",
    adminServices: "Services",
    adminSettings: "Settings",
    statsTitle: "Business Stats",
    totalOrders: "Total Orders",
    totalRevenue: "Total Revenue",
    deleteOrder: "Delete Order",
    editServices: "Edit Services",
    genSettings: "General Settings",
    save: "Save Changes",
    zelleConf: "Zelle Configuration",
    busPhone: "WhatsApp Number",
    disc: "Discount",
    nameEs: "Name (Spanish)",
    nameEn: "Name (English)",
    nameFr: "Name (French)",
    nameHi: "Name (Hindi)",
    price: "Price ($)",
    addNew: "Add New",
    login: "Admin Login",
    enter: "Enter",
    wrongPin: "Wrong Credentials",
    sendWhastapp: "Confirm via WhatsApp",
    sendSMS: "Confirm via SMS",
    payCash: "Cash / Card on Delivery",
    payOnline: "Zelle / Transfer",
    pickupDate: "Pickup Date",
    pickupTime: "Pickup Time",
    deliveryDate: "Delivery Date",
    deliveryTime: "Delivery Time",
    payCashLabel: "Pay on Delivery",
    payCashSub: "Cash or Card",
    payOnlineLabel: "Pay Online",
    payOnlineSub: "Zelle Transfer",
    zelleNote: "Please send screenshot",
    forgotPass: "Forgot Credentials?",
    recoverTitle: "Recover Access",
    recoverDesc: "Enter recovery PIN to reveal login details.",
    enterPin: "Enter PIN",
    reset: "Reveal",
    wrongRecPin: "Wrong PIN",
    securitySettings: "Security Settings",
    changeUser: "Change Admin Username",
    changePass: "Change Admin Password",
    changePin: "Change Recovery PIN",
    currentPass: "Current Password",
    newPass: "New Password",
    whatsappLabel: "WhatsApp Number",
    fee: "Fee",
    off: "OFF",
    nameLabel: "Full Name",
    phoneLabel: "Phone Number",
    addressLabel: "Address",
    sending: "Sending...",
    orderSent: "Order Sent Successfully!",
    emptyCart: "Your cart is empty",
    usernameLabel: "Username",
    passwordLabel: "Password",
    credsTitle: "Your Credentials:",
    user: "User:",
    pass: "Pass:",
    expressLabel: "Express Time Label",
    expressPercentLabel: "Express Fee (%)",
    trackOrder: "Track Order",
    yourOrders: "Your Orders",
    editingOrder: "Editing Order",
    customerInfo: "Customer Info",
    pickupSchedule: "Pickup Schedule",
    deliverySchedule: "Delivery Schedule",
    adminNoteLabel: "Admin Note / Reason for Change",
    adminNotePlaceholder: "Explain why you changed the schedule or options (visible to client)...",
    updateFromLaundry: "Update from Laundry:",
    uploadImage: "Upload Image",
    uploadTip: "Click to upload",
    fillRequired: "Please fill in all required fields (highlighted in red).",
    share: "Share Receipt",
    deleteReceipt: "Delete Receipt",
    replyToAdmin: "Reply to Admin",
    sendReply: "Send",
    replySent: "Reply Sent!",
    orderCompleted: "Order Completed"
  },
  es: {
    title: "Fast Wave Lavandería",
    heroSubtitle: "¡Ropa fresca, entregada en tu puerta!",
    orderNow: "Empezar Lavado",
    sendOrder: "Ir al Carrito",
    services: "Nuestros Servicios",
    productsToAvoid: "Alergias / Evitar",
    preferredAroma: "Selección de Aroma",
    details: "Detalles del Pedido",
    pickupInfo: "Información de Recogida",
    deliveryInfo: "Información de Entrega",
    payment: "Método de Pago",
    total: "Total Estimado",
    submit: "Confirmar Pedido",
    status: { pending: "Pendiente", confirmed: "Confirmado", picked_up: "Recogido", cleaning: "Lavando", delivering: "En Reparto", completed: "Completado" },
    express: "Lavado Express",
    member: "Soy Miembro",
    discountMsg: "¡Descuento Aplicado!",
    successMsg: "¡Orden Recibida!",
    successSub: "Para confirmar, envía el pedido por WhatsApp o SMS.",
    orderNumberIs: "Orden #",
    back: "Volver",
    adminTitle: "Panel de Administración",
    adminOrders: "Pedidos",
    adminServices: "Servicios",
    adminSettings: "Ajustes",
    statsTitle: "Estadísticas",
    totalOrders: "Total de Pedidos",
    totalRevenue: "Ingresos Totales",
    deleteOrder: "Borrar Orden",
    editServices: "Editar Servicios",
    genSettings: "Configuración General",
    save: "Guardar Cambios",
    zelleConf: "Configuración de Zelle",
    busPhone: "Número de WhatsApp",
    disc: "Descuento",
    nameEs: "Nombre (Español)",
    nameEn: "Nombre (Inglés)",
    nameFr: "Nombre (Francés)",
    nameHi: "Nombre (Hindi)",
    price: "Precio ($)",
    addNew: "Agregar Nuevo",
    login: "Acceso Admin",
    enter: "Entrar",
    wrongPin: "Credenciales Incorrectas",
    sendWhastapp: "Confirmar por WhatsApp",
    sendSMS: "Confirmar por SMS",
    payCash: "Efectivo / Tarjeta al recibir",
    payOnline: "Zelle / Transferencia",
    pickupDate: "Fecha de Recogida",
    pickupTime: "Hora de Recogida",
    deliveryDate: "Fecha de Entrega",
    deliveryTime: "Hora de Entrega",
    payCashLabel: "Pagar al Recibir",
    payOnlineLabel: "Pagar Online",
    zelleNote: "Enviar captura",
    forgotPass: "¿Olvidaste tus datos?",
    recoverTitle: "Recuperar Acceso",
    recoverDesc: "Introduce tu PIN de recuperación para ver tus datos.",
    enterPin: "Ingresar PIN",
    reset: "Revelar",
    wrongRecPin: "PIN Incorrecto",
    securitySettings: "Seguridad",
    changeUser: "Cambiar Usuario Admin",
    changePass: "Cambiar Contraseña Admin",
    changePin: "Cambiar PIN Recuperación",
    currentPass: "Contraseña Actual",
    newPass: "Nueva Contraseña",
    whatsappLabel: "Número de WhatsApp",
    fee: "Cargo",
    off: "DCTO",
    nameLabel: "Nombre Completo",
    phoneLabel: "Teléfono",
    addressLabel: "Dirección",
    sending: "Enviando Orden...",
    orderSent: "¡Orden Enviada!",
    emptyCart: "Tu carrito está vacío",
    usernameLabel: "Usuario",
    passwordLabel: "Contraseña",
    credsTitle: "Tus Credenciales:",
    user: "Usuario:",
    pass: "Clave:",
    expressLabel: "Etiqueta Tiempo Express",
    expressPercentLabel: "Recargo Express (%)",
    trackOrder: "Rastrear Orden",
    yourOrders: "Tus Pedidos",
    editingOrder: "Editando Orden",
    customerInfo: "Info del Cliente",
    pickupSchedule: "Horario de Recogida",
    deliverySchedule: "Horario de Entrega",
    adminNoteLabel: "Nota de Admin / Razón del Cambio",
    adminNotePlaceholder: "Explica por qué cambiaste el horario u opciones (visible para el cliente)...",
    updateFromLaundry: "Actualización de Lavandería:",
    uploadImage: "Subir Imagen",
    uploadTip: "Clic para subir",
    fillRequired: "Por favor llena los campos requeridos (marcados en rojo).",
    share: "Compartir Recibo",
    deleteReceipt: "Borrar Recibo",
    replyToAdmin: "Responder al Admin",
    sendReply: "Enviar",
    replySent: "¡Enviado!",
    orderCompleted: "Orden Completada"
  },
  fr: {
    title: "Fast Wave Pressing",
    heroSubtitle: "Vêtements frais, livrés à votre porte !",
    orderNow: "Commencer",
    sendOrder: "Voir Panier",
    services: "Nos Services",
    productsToAvoid: "Allergies / Éviter",
    preferredAroma: "Parfum",
    details: "Détails de la commande",
    pickupInfo: "Ramassage",
    deliveryInfo: "Livraison",
    payment: "Paiement",
    total: "Total",
    submit: "Commander",
    status: { pending: "En attente", confirmed: "Confirmé", picked_up: "Ramassé", cleaning: "Lavage", delivering: "Livraison", completed: "Terminé" },
    express: "Lavage Express",
    member: "Membre",
    discountMsg: "Remise appliquée !",
    successMsg: "Commande Reçue !",
    successSub: "Pour confirmer, envoyez les détails via WhatsApp ou SMS.",
    orderNumberIs: "Commande #",
    back: "Retour",
    adminTitle: "Tableau de bord",
    adminOrders: "Commandes",
    adminServices: "Services",
    adminSettings: "Paramètres",
    statsTitle: "Statistiques",
    totalOrders: "Total Commandes",
    totalRevenue: "Revenu Total",
    deleteOrder: "Supprimer",
    editServices: "Modifier Services",
    genSettings: "Paramètres Généraux",
    save: "Enregistrer",
    zelleConf: "Config Zelle",
    busPhone: "Numéro WhatsApp",
    disc: "Remise",
    nameEs: "Nom (Espagnol)",
    nameEn: "Nom (Anglais)",
    nameFr: "Nom (Français)",
    nameHi: "Nom (Hindi)",
    price: "Prix ($)",
    addNew: "Ajouter",
    login: "Connexion Admin",
    enter: "Entrer",
    wrongPin: "Identifiants incorrects",
    sendWhastapp: "Confirmer via WhatsApp",
    sendSMS: "Confirmer via SMS",
    payCash: "Espèces / Carte à la livraison",
    payOnline: "Zelle / Virement",
    pickupDate: "Date de ramassage",
    pickupTime: "Heure de ramassage",
    deliveryDate: "Date de livraison",
    deliveryTime: "Heure de livraison",
    payCashLabel: "Payer à la livraison",
    payCashSub: "Espèces ou Carte",
    payOnlineLabel: "Payer en ligne",
    payOnlineSub: "Virement Zelle",
    zelleNote: "Envoyer capture d'écran",
    forgotPass: "Oublié ?",
    recoverTitle: "Récupérer accès",
    recoverDesc: "Entrez le PIN de récupération.",
    enterPin: "Entrer PIN",
    reset: "Révéler",
    wrongRecPin: "Mauvais PIN",
    securitySettings: "Sécurité",
    changeUser: "Changer Utilisateur",
    changePass: "Changer Mot de passe",
    changePin: "Changer PIN",
    currentPass: "Mot de passe actuel",
    newPass: "Nouveau mot de passe",
    whatsappLabel: "Numéro WhatsApp",
    fee: "Frais",
    off: "REMISE",
    nameLabel: "Nom complet",
    phoneLabel: "Téléphone",
    addressLabel: "Adresse",
    sending: "Envoi...",
    orderSent: "Envoyé !",
    emptyCart: "Panier vide",
    usernameLabel: "Utilisateur",
    passwordLabel: "Mot de passe",
    credsTitle: "Vos identifiants :",
    user: "Utilisateur :",
    pass: "Mdp :",
    expressLabel: "Label Express",
    expressPercentLabel: "Frais Express (%)",
    trackOrder: "Suivre commande",
    yourOrders: "Vos commandes",
    editingOrder: "Modifier commande",
    customerInfo: "Info Client",
    pickupSchedule: "Horaire Ramassage",
    deliverySchedule: "Horaire Livraison",
    adminNoteLabel: "Note Admin / Raison",
    adminNotePlaceholder: "Expliquez le changement...",
    updateFromLaundry: "Mise à jour :",
    uploadImage: "Télécharger image",
    uploadTip: "Cliquer pour télécharger",
    fillRequired: "Remplissez les champs requis (en rouge).",
    share: "Partager",
    deleteReceipt: "Supprimer",
    replyToAdmin: "Répondre",
    sendReply: "Envoyer",
    replySent: "Envoyé!",
    orderCompleted: "Commande Terminée"
  },
  hi: {
    title: "Fast Wave Laundry",
    heroSubtitle: "साफ़ कपड़े, आपके दरवाजे पर!",
    orderNow: "धुलाई शुरू करें",
    sendOrder: "ऑर्डर भेजें",
    services: "हमारी सेवाएँ",
    productsToAvoid: "एलर्जी / बचें",
    preferredAroma: "सुगंध चयन",
    details: "ऑर्डर विवरण",
    pickupInfo: "पिकअप जानकारी",
    deliveryInfo: "डिलीवरी जानकारी",
    payment: "भुगतान विधि",
    total: "कुल",
    submit: "ऑर्डर की समीक्षा करें",
    status: { pending: "लंबित", confirmed: "पुष्टि की गई", picked_up: "पिक अप किया गया", cleaning: "धुलाई", delivering: "डिलीवरी", completed: "पूर्ण" },
    express: "एक्सप्रेस धुलाई",
    member: "मैं सदस्य हूँ",
    discountMsg: "छूट लागू!",
    successMsg: "ऑर्डर प्राप्त हुआ!",
    successSub: "पुष्टि करने के लिए, कृपया व्हाट्सएप या एसएमएस के माध्यम से विवरण भेजें।",
    orderNumberIs: "ऑर्डर #",
    back: "वापस",
    adminTitle: "व्यवस्थापक डैशबोर्ड",
    adminOrders: "ऑर्डर",
    adminServices: "सेवाएँ",
    adminSettings: "सेटिंग्स",
    statsTitle: "व्यापार आँकड़े",
    totalOrders: "कुल ऑर्डर",
    totalRevenue: "कुल राजस्व",
    deleteOrder: "ऑर्डर हटाएं",
    editServices: "सेवाएँ संपादित करें",
    genSettings: "सामान्य सेटिंग्स",
    save: "परिवर्तन सहेजें",
    zelleConf: "Zelle कॉन्फ़िगरेशन",
    busPhone: "व्हाट्सएप नंबर",
    disc: "छूट",
    nameEs: "नाम (स्पेनिश)",
    nameEn: "नाम (अंग्रेज़ी)",
    nameFr: "नाम (फ्रेंच)",
    nameHi: "नाम (हिंदी)",
    price: "कीमत ($)",
    addNew: "नया जोड़ें",
    login: "व्यवस्थापक लॉगिन",
    enter: "प्रवेश करें",
    wrongPin: "गलत क्रेडेंशियल्स",
    sendWhastapp: "व्हाट्सएप द्वारा पुष्टि करें",
    sendSMS: "एसएमएस द्वारा पुष्टि करें",
    payCash: "डिलीवरी पर नकद / कार्ड",
    payOnline: "Zelle / ट्रांसफर",
    pickupDate: "पिकअप तिथि",
    pickupTime: "पिकअप समय",
    deliveryDate: "डिलीवरी तिथि",
    deliveryTime: "डिलीवरी समय",
    payCashLabel: "डिलीवरी पर भुगतान",
    payCashSub: "नकद या कार्ड",
    payOnlineLabel: "ऑनलाइन भुगतान",
    payOnlineSub: "Zelle ट्रांसफर",
    zelleNote: "कृपया स्क्रीनशॉट भेजें",
    forgotPass: "क्रेडेंशियल्स भूल गए?",
    recoverTitle: "एक्सेस पुनर्प्राप्त करें",
    recoverDesc: "लॉगिन विवरण प्रकट करने के लिए रिकवरी पिन दर्ज करें।",
    enterPin: "पिन दर्ज करें",
    reset: "प्रकट करें",
    wrongRecPin: "गलत पिन",
    securitySettings: "सुरक्षा सेटिंग्स",
    changeUser: "व्यवस्थापक उपयोगकर्ता बदलें",
    changePass: "व्यवस्थापक पासवर्ड बदलें",
    changePin: "रिकवरी पिन बदलें",
    currentPass: "वर्तमान पासवर्ड",
    newPass: "नया पासवर्ड",
    whatsappLabel: "व्हाट्सएप नंबर",
    fee: "शुल्क",
    off: "छूट",
    nameLabel: "पूरा नाम",
    phoneLabel: "फ़ोन नंबर",
    addressLabel: "पता",
    sending: "भेज रहा है...",
    orderSent: "ऑर्डर सफलतापूर्वक भेजा गया!",
    emptyCart: "आपकी टोकरी खाली है",
    usernameLabel: "उपयोगकर्ता नाम",
    passwordLabel: "पासवर्ड",
    credsTitle: "आपकी साख:",
    user: "उपयोगकर्ता:",
    pass: "पासवर्ड:",
    expressLabel: "एक्सप्रेस समय लेबल",
    expressPercentLabel: "एक्सप्रेस शुल्क (%)",
    trackOrder: "ऑर्डर ट्रैक करें",
    yourOrders: "आपके ऑर्डर",
    editingOrder: "ऑर्डर संपादन",
    customerInfo: "ग्राहक जानकारी",
    pickupSchedule: "पिकअप अनुसूची",
    deliverySchedule: "डिलीवरी अनुसूची",
    adminNoteLabel: "व्यवस्थापक नोट / परिवर्तन का कारण",
    adminNotePlaceholder: "समझाएं कि आपने अनुसूची या विकल्प क्यों बदले...",
    updateFromLaundry: "लॉन्ड्री से अपडेट:",
    uploadImage: "छवि अपलोड करें",
    uploadTip: "अपलोड करने के लिए क्लिक करें",
    fillRequired: "आवश्यक फ़ील्ड भरें।",
    share: "साझा करें",
    deleteReceipt: "हटाएं",
    replyToAdmin: "जवाब दें",
    sendReply: "भेजें",
    replySent: "भेजा गया",
    orderCompleted: "आदेश पूरा हुआ"
  },
};

// --- COMPONENTES DE ADMIN ---

const ServiceEditor = ({ services, setServices, t }) => {
  const [localServices, setLocalServices] = useState(services);
  const [saveStatus, setSaveStatus] = useState('idle');

  const updateField = (id, field, value) => { 
    setLocalServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s)); 
  };

  const handleImageUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField(id, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
    
  const saveServices = async () => { 
    setSaveStatus('saving'); 
    try {
      const finalServices = localServices.map(s => ({...s, price: parseFloat(s.price) || 0})); 
      if(db) await setDoc(doc(db, 'settings', 'services'), { list: finalServices }); 
      setServices(finalServices); 
      setSaveStatus('saved'); 
    } catch(e) {
      console.error(e);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus('idle'), 2000); 
  };
    
  const addNew = () => setLocalServices([...localServices, { id: Date.now().toString(), name_es: 'Nuevo', name_en: 'New', name_fr: 'Nouveau', name_hi: 'नया', price: 0, image: '', type: 'image' }]);
  const remove = (id) => setLocalServices(prev => prev.filter(s => s.id !== id));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
      <h3 className="text-xl font-bold mb-4 flex items-center text-cyan-800"><Edit2 className="w-5 h-5 mr-2"/> {t.editServices}</h3>
      <div className="space-y-4">
        {localServices.map((s) => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded border border-gray-200">
            <div className="md:col-span-1 flex flex-col items-center justify-center relative group">
               {s.image ? (
                  <>
                    <img src={s.image} alt="service" className="w-12 h-12 object-cover rounded-lg shadow-sm" onError={(e) => e.target.src='https://via.placeholder.com/40'} />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity text-[10px] font-bold text-center leading-tight">
                        <CustomUploadIcon className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, s.id)} />
                    </label>
                  </>
               ) : (
                  <>
                    {s.type === 'component' && s.componentName === 'CustomIronIcon' ? (
                       <div className="w-12 h-12"><CustomIronIcon /></div>
                    ) : (
                       <img src={s.image || 'https://via.placeholder.com/40'} alt="service" className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity text-[10px] font-bold text-center leading-tight">
                        <CustomUploadIcon className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, s.id)} />
                    </label>
                  </>
               )}
            </div>
            {/* Added Inputs for FR and HI so dynamic items can also be translated */}
            <div className="md:col-span-2"><input className="w-full p-2 border rounded text-xs" placeholder="ES Name" value={s.name_es || ''} onChange={e => updateField(s.id, 'name_es', e.target.value)} /></div>
            <div className="md:col-span-2"><input className="w-full p-2 border rounded text-xs" placeholder="EN Name" value={s.name_en || ''} onChange={e => updateField(s.id, 'name_en', e.target.value)} /></div>
            <div className="md:col-span-2"><input className="w-full p-2 border rounded text-xs" placeholder="FR Name" value={s.name_fr || ''} onChange={e => updateField(s.id, 'name_fr', e.target.value)} /></div>
            <div className="md:col-span-2"><input className="w-full p-2 border rounded text-xs" placeholder="HI Name" value={s.name_hi || ''} onChange={e => updateField(s.id, 'name_hi', e.target.value)} /></div>
            
            <div className="md:col-span-2 relative">
                <input className="w-full p-2 border rounded text-xs text-gray-400" placeholder="Img" value={s.image ? (s.image.startsWith('data:') ? 'Uploaded' : 'URL') : ''} disabled />
                <label className="absolute right-1 top-1 bg-gray-200 hover:bg-gray-300 p-1 rounded cursor-pointer" title={t.uploadImage}>
                    <CustomCameraIcon className="w-4 h-4 text-gray-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, s.id)} />
                </label>
            </div>

            <div className="md:col-span-1 text-center flex justify-center"><button onClick={() => remove(s.id)} className="text-white bg-red-500 hover:bg-red-600 p-2 rounded w-8 h-8 flex items-center justify-center"><Trash2 className="w-4 h-4"/></button></div>
             <div className="md:col-span-12 mt-1 px-1">
                 <input type="number" className="w-full p-2 border rounded font-bold text-green-700 text-center" placeholder="Price" value={s.price} onChange={e => updateField(s.id, 'price', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={addNew} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center"><Plus className="w-4 h-4 mr-2"/> {t.addNew}</button>
        <button onClick={saveServices} disabled={saveStatus !== 'idle'} className={`flex-1 px-4 py-3 text-white rounded-lg font-bold flex justify-center items-center shadow-lg transition-all duration-300 ${saveStatus === 'saved' ? 'bg-green-500' : saveStatus === 'saving' ? 'bg-cyan-400' : 'bg-cyan-600'}`}>
            {saveStatus === 'saved' ? "Saved!" : saveStatus === 'saving' ? "..." : t.save}
        </button>
      </div>
    </div>
  );
};

const SettingsPanel = ({ config, setConfig, t }) => {
    // ... existing settings panel code ...
    const [editConfig, setEditConfig] = useState({ ...config });
    const [saveStatus, setSaveStatus] = useState('idle');
    const [newUser, setNewUser] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPin, setNewPin] = useState('');

    const saveSettings = async () => {
        setSaveStatus('saving');
        
        const finalConfig = { 
            ...editConfig, 
            discountPercent: parseFloat(editConfig.discountPercent) || 0, 
            expressPercent: parseFloat(editConfig.expressPercent) || 20,
            adminUsername: newUser ? newUser : (editConfig.adminUsername || 'admin'),
            adminPassword: newPass ? newPass : (editConfig.adminPassword || '1234'), 
            recoveryPin: newPin ? newPin : (editConfig.recoveryPin || '0000'),
            phone: editConfig.phone || '',
            zelleNumber: editConfig.zelleNumber || '',
            zelleMessage: editConfig.zelleMessage || '',
            expressText: editConfig.expressText || '24h'
        };

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 10000)
        );

        try {
            if (auth && !auth.currentUser) {
               await signInAnonymously(auth);
            }

            if(db) {
                await Promise.race([
                    setDoc(doc(db, 'settings', 'general'), finalConfig),
                    timeoutPromise
                ]);
            }
            
            setConfig(finalConfig);
            setNewUser('');
            setNewPass('');
            setNewPin('');
            setSaveStatus('saved');
        } catch(e) { 
            console.error("Error saving:", e); 
            setSaveStatus('error');
            if (e.message === "Timeout") {
                alert("Connection slow. Please try again.");
            } else if (e.code === 'permission-denied') {
                alert("PERMISSION ERROR: Check Firestore rules.");
            }
        }
        
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800"><Settings className="w-5 h-5 mr-2"/> {t.genSettings}</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                 <label className="block text-sm font-bold text-green-800 mb-1 flex items-center"><MessageCircle className="w-4 h-4 mr-2"/> {t.busPhone}</label>
                 <input value={editConfig.phone || ''} onChange={(e) => setEditConfig({ ...editConfig, phone: e.target.value })} className="w-full p-3 border border-green-300 rounded-lg bg-white font-bold text-lg" placeholder="Ej: 16098287989" />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t.disc} (Member %)</label>
                      <input type="number" value={editConfig.discountPercent} onChange={(e) => setEditConfig({ ...editConfig, discountPercent: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50" />
                  </div>
                  <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.expressPercentLabel}</label>
                      <input type="number" value={editConfig.expressPercent || 20} onChange={(e) => setEditConfig({ ...editConfig, expressPercent: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.expressLabel}</label>
                  <input type="text" value={editConfig.expressText || '24h'} onChange={(e) => setEditConfig({ ...editConfig, expressText: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50" placeholder="e.g. 6h" />
              </div>
              <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-100"><h4 className="font-bold text-purple-900 mb-4 flex items-center"><CreditCard className="w-5 h-5 mr-2"/> {t.zelleConf}</h4><input value={editConfig.zelleNumber || ''} onChange={(e) => setEditConfig({ ...editConfig, zelleNumber: e.target.value })} className="w-full p-3 border border-purple-200 rounded-lg bg-white" placeholder="Zelle Email/Phone" /><textarea value={editConfig.zelleMessage || ''} onChange={(e) => setEditConfig({ ...editConfig, zelleMessage: e.target.value })} className="w-full p-3 border border-purple-200 rounded-lg bg-white mt-2" placeholder="Zelle Instructions" /></div>
              <div className="p-5 bg-red-50 rounded-xl border-2 border-red-100">
                  <h4 className="font-bold text-red-900 mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2"/> {t.securitySettings}</h4>
                  <div className="grid grid-cols-1 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-red-700 mb-1">{t.changeUser}</label>
                          <input type="text" value={newUser} onChange={(e) => setNewUser(e.target.value)} className="w-full p-3 border border-red-200 rounded-lg bg-white" placeholder="New Username" autoComplete="off" />
                          <p className="text-[10px] text-gray-500 mt-1">Leave empty to keep current.</p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-red-700 mb-1">{t.changePass}</label>
                          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-3 border border-red-200 rounded-lg bg-white" placeholder="New Password" autoComplete="new-password" />
                          <p className="text-[10px] text-gray-500 mt-1">Leave empty to keep current.</p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-red-700 mb-1">{t.changePin}</label>
                          <input type="text" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full p-3 border border-red-200 rounded-lg bg-white" placeholder="New PIN (Recovery)" />
                          <p className="text-[10px] text-gray-500 mt-1">Default is 0000.</p>
                      </div>
                  </div>
              </div>
            </div>
            <button onClick={saveSettings} disabled={saveStatus !== 'idle'} className={`w-full py-4 rounded-xl font-bold mt-8 flex items-center justify-center shadow-lg transition-all duration-300 text-white ${saveStatus === 'saved' ? 'bg-green-600' : saveStatus === 'saving' ? 'bg-cyan-500' : 'bg-cyan-600'}`}>
                {saveStatus === 'saved' ? "Saved!" : saveStatus === 'saving' ? "..." : t.save}
            </button>
        </div>
    );
};

// --- VISTAS PRINCIPALES ---

const AdminView = ({ t, config, setConfig, services, setServices, setView, lang }) => {
    // ... (same as before) ...
    const [authInput, setAuthInput] = useState({ user: '', pass: '' });
    const [recoveryInput, setRecoveryInput] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const [recoveredCreds, setRecoveredCreds] = useState(null);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState('orders');
    const [loginStatus, setLoginStatus] = useState('idle');
    const [expandedOrder, setExpandedOrder] = useState(null); 
    
    const [editingOrder, setEditingOrder] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        if (!isAuth) return;
        let unsub = () => {};
        if (db) {
            try {
                unsub = onSnapshot(collection(db, 'orders'), (snap) => {
                    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
                });
            } catch (e) { console.warn("Firestore access restricted in demo"); }
        }
        return () => unsub();
    }, [isAuth]);

    const handleLogin = (e) => {
        e.preventDefault();
        const validUser = config.adminUsername || 'admin';
        const validPass = config.adminPassword || '1234';
        
        if (authInput.user.toLowerCase() === validUser.toLowerCase() && authInput.pass === validPass) {
            setIsAuth(true);
            setLoginStatus('idle');
        } else {
            setLoginStatus('error');
            setTimeout(() => setLoginStatus('idle'), 2000);
        }
    };
    
    const handleRecovery = (e) => {
        e.preventDefault();
        const validPin = config.recoveryPin || '0000';
        if (recoveryInput === validPin) {
            setRecoveredCreds({
                user: config.adminUsername || 'admin',
                pass: config.adminPassword || '1234'
            });
        } else {
            alert(t.wrongRecPin);
        }
    };

    const updateOrderStatus = async (id, status) => { 
        if(db) await updateDoc(doc(db, 'orders', id), { status }); 
        setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o));
    };

    const deleteOrder = async (id) => { 
        if(window.confirm(t.deleteOrder + "?")) {
            if(db) await deleteDoc(doc(db, 'orders', id)); 
            setOrders(prev => prev.filter(o => o.id !== id));
        }
    };
    
    const startEditing = (order) => {
        setEditingOrder(order.id);
        setEditForm({
            name: order.customer.name,
            phone: order.customer.phone,
            address: order.customer.address,
            express: order.express || false,
            isMember: order.isMember || false,
            notes: order.notes || '',
            pickupDate: order.details?.pickupDate || '',
            pickupTime: order.details?.pickupTime || TIME_SLOTS[0],
            deliveryDate: order.details?.deliveryDate || '',
            deliveryTime: order.details?.deliveryTime || TIME_SLOTS[0],
            adminNote: order.adminNote || ''
        });
    };

    const shareOrder = (order) => {
        const text = `Fast Wave Receipt #${order.orderNumber || order.id.slice(0,6)}\nTotal: $${order.total?.toFixed(2)}\nStatus: ${order.status}\nLink: ${window.location.origin}`;
        if (navigator.share) {
            navigator.share({
                title: 'Fast Wave Receipt',
                text: text,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text);
            alert("Receipt info copied to clipboard!");
        }
    };

    const saveOrderChanges = async (order) => {
        let subtotal = Object.entries(order.items).reduce((acc, [id, qty]) => {
            const s = services.find(x => x.id === id);
            return acc + ((s?.price || 0) * qty);
        }, 0);
        
        let total = subtotal;
        const expressPct = config.expressPercent || 20;
        const discountPct = config.discountPercent || 10;

        if (editForm.express) total += subtotal * (expressPct / 100);
        if (editForm.isMember) total -= total * (discountPct / 100);

        const updatedData = {
            'customer.name': editForm.name,
            'customer.phone': editForm.phone,
            'customer.address': editForm.address,
            express: editForm.express,
            isMember: editForm.isMember,
            notes: editForm.notes,
            total: total,
            'details.pickupDate': editForm.pickupDate,
            'details.pickupTime': editForm.pickupTime,
            'details.deliveryDate': editForm.deliveryDate,
            'details.deliveryTime': editForm.deliveryTime,
            adminNote: editForm.adminNote
        };

        if(db) await updateDoc(doc(db, 'orders', order.id), updatedData);
        setEditingOrder(null);
    };

    const printOrder = (order) => {
        const printWindow = window.open('', '_blank');
        const itemsList = Object.entries(order.items).map(([id, qty]) => {
             const s = services.find(x => x.id === id);
             return `<li>${qty}x ${s ? s.name_en : id}</li>`;
        }).join('');
        
        let subtotal = Object.entries(order.items).reduce((acc, [id, qty]) => {
            const s = services.find(x => x.id === id);
            return acc + ((s?.price || 0) * qty);
        }, 0);
        
        const expressPct = config.expressPercent || 20;
        const discountPct = config.discountPercent || 10;
        const expressFee = order.express ? subtotal * (expressPct / 100) : 0;
        const preDiscountTotal = subtotal + expressFee;
        const discount = order.isMember ? preDiscountTotal * (discountPct / 100) : 0;
        const finalTotal = order.total || (preDiscountTotal - discount);

        printWindow.document.write(`
            <html>
            <head>
                <title>Order #${order.orderNumber || order.id.slice(0,6)}</title>
                <style>
                    body { font-family: monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
                    h1 { border-bottom: 2px solid black; padding-bottom: 10px; text-align: center; }
                    .section { margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
                    .item-row { display: flex; justify-content: space-between; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; border-top: 2px solid black; padding-top: 10px; margin-top: 10px; }
                    .detail-row { display: flex; justify-content: space-between; color: #555; font-size: 0.9em; }
                    .admin-note { background: #f0f9ff; padding: 10px; border: 1px solid #bae6fd; margin-top: 10px; font-style: italic; }
                </style>
            </head>
            <body>
                <h1>Fast Wave Laundry</h1>
                <div class="section">
                    <strong>Order:</strong> #${order.orderNumber || order.id.slice(0,6)}<br>
                    <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                    <strong>Status:</strong> ${order.status.toUpperCase()}
                </div>
                <div class="section">
                    <strong>Customer:</strong><br>
                    ${order.customer.name}<br>
                    ${order.customer.phone}<br>
                    ${order.customer.address}
                </div>
                 <div class="section">
                    <strong>Schedule:</strong><br>
                    Pickup: ${order.details.pickupDate} ${order.details.pickupTime}<br>
                    Delivery: ${order.details.deliveryDate} ${order.details.deliveryTime}
                </div>
                <div class="section">
                    <strong>Items:</strong><br>
                    ${Object.entries(order.items).map(([id, qty]) => {
                        const s = services.find(x => x.id === id);
                        const price = s ? s.price : 0;
                        return `<div class="item-row"><span>${qty}x ${s ? s.name_en : id}</span><span>$${(price * qty).toFixed(2)}</span></div>`;
                    }).join('')}
                </div>
                
                <div class="section">
                    <div class="detail-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
                    ${order.express ? `<div class="detail-row"><span>Express Fee (${expressPct}%):</span><span>+$${expressFee.toFixed(2)}</span></div>` : ''}
                    ${order.isMember ? `<div class="detail-row"><span>Member Discount (${discountPct}%):</span><span>-$${discount.toFixed(2)}</span></div>` : ''}
                </div>
                
                <div class="total-row">
                    <span>TOTAL:</span><span>$${finalTotal.toFixed(2)}</span>
                </div>
                
                <div class="section" style="margin-top: 20px; border: none;">
                      ${order.aroma ? `<strong>Aroma:</strong> ${order.aroma}<br>` : ''}
                      ${order.allergies?.length ? `<strong>Allergies:</strong> ${order.allergies.join(', ')}<br>` : ''}
                      <br>
                      <strong>Payment:</strong> ${order.details.paymentMethod.toUpperCase()}
                      ${order.adminNote ? `<div class="admin-note"><strong>Admin Note:</strong> ${order.adminNote}</div>` : ''}
                      ${order.customerResponse ? `<div class="admin-note" style="background: #f0fdf4; border-color: #bbf7d0;"><strong>Customer Reply:</strong> ${order.customerResponse}</div>` : ''}
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!isAuth) {
        // ... (same auth logic) ...
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
               <button onClick={() => setView('home')} className="absolute top-4 left-4 text-gray-500 font-bold flex items-center"><ArrowLeft className="mr-2"/> {t.back}</button>
               {isRecoveryMode ? (
                   <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm animate-fade-in text-center">
                       <Key className="w-12 h-12 text-yellow-500 mx-auto mb-4"/>
                       <h2 className="text-2xl font-black text-gray-800 mb-2">{t.recoverTitle}</h2>
                       <p className="text-sm text-gray-500 mb-6">{t.recoverDesc}</p>
                       
                       {recoveredCreds ? (
                           <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6 text-left">
                               <h3 className="text-green-800 font-bold text-sm mb-2">{t.credsTitle}</h3>
                               <p className="text-sm text-green-700"><strong>{t.user}</strong> {recoveredCreds.user}</p>
                               <p className="text-sm text-green-700"><strong>{t.pass}</strong> {recoveredCreds.pass}</p>
                               <button onClick={() => setIsRecoveryMode(false)} className="mt-4 text-xs font-bold text-green-600 underline">Go to Login</button>
                           </div>
                       ) : (
                           <form onSubmit={handleRecovery} className="space-y-4">
                               <input type="text" value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} placeholder={t.enterPin} className="w-full p-3 border rounded-lg text-center tracking-widest font-bold text-xl" />
                               <button className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition">{t.reset}</button>
                           </form>
                       )}
                       <button onClick={() => setIsRecoveryMode(false)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                   </div>
               ) : (
                   <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm animate-fade-in">
                       <div className="flex justify-center mb-6"><div className="p-3 bg-cyan-100 rounded-full"><Lock className="w-8 h-8 text-cyan-700"/></div></div>
                       <h2 className="text-2xl font-black text-center text-gray-800 mb-6">{t.login}</h2>
                       <form onSubmit={handleLogin} className="space-y-4">
                           <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.usernameLabel}</label><input value={authInput.user} onChange={(e) => setAuthInput({...authInput, user: e.target.value})} className="w-full p-3 border rounded-lg focus:border-cyan-500 outline-none" placeholder="admin" /></div>
                           <div><label className="block text-xs font-bold text-gray-500 mb-1">{t.passwordLabel}</label><input type="password" value={authInput.pass} onChange={(e) => setAuthInput({...authInput, pass: e.target.value})} className="w-full p-3 border rounded-lg focus:border-cyan-500 outline-none" placeholder="••••" /></div>
                           {loginStatus === 'error' && <p className="text-red-500 text-sm font-bold text-center animate-shake">{t.wrongPin}</p>}
                           <button className="w-full bg-cyan-900 text-white font-bold py-3 rounded-lg hover:bg-black transition">{t.enter}</button>
                       </form>
                       <p onClick={() => setIsRecoveryMode(true)} className="text-center text-xs text-gray-400 mt-6 cursor-pointer hover:text-cyan-600 transition">{t.forgotPass}</p>
                   </div>
               )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-30">
                <h2 className="font-black text-xl text-cyan-900 flex items-center"><BrandLogo /> <span className="ml-3 hidden md:inline text-gray-400">| {t.adminTitle}</span></h2>
                <div className="flex gap-4">
                    <button onClick={() => setView('home')} className="text-sm font-bold text-gray-500 hover:text-cyan-600 flex items-center"><ArrowLeft className="w-4 h-4 mr-1"/> {t.back}</button>
                    <button onClick={() => setIsAuth(false)} className="text-sm font-bold text-red-500 hover:text-red-700">Logout</button>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto p-6">
                 {/* ... stats ... */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                         <div className="p-3 bg-blue-100 rounded-full mr-4"><ShoppingBag className="w-6 h-6 text-blue-600"/></div>
                         <div><p className="text-sm text-gray-500 font-bold uppercase">{t.totalOrders}</p><p className="text-3xl font-black text-gray-800">{orders.length}</p></div>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                         <div className="p-3 bg-green-100 rounded-full mr-4"><DollarSignIcon className="w-6 h-6 text-green-600"/></div>
                         <div><p className="text-sm text-gray-500 font-bold uppercase">{t.totalRevenue}</p><p className="text-3xl font-black text-gray-800">${orders.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2)}</p></div>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                         <div className="p-3 bg-purple-100 rounded-full mr-4"><Star className="w-6 h-6 text-purple-600"/></div>
                         <div><p className="text-sm text-gray-500 font-bold uppercase">Members</p><p className="text-3xl font-black text-gray-800">{orders.filter(o => o.isMember).length}</p></div>
                     </div>
                 </div>

                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                     <button onClick={() => setTab('orders')} className={`px-6 py-2 rounded-full font-bold transition ${tab === 'orders' ? 'bg-cyan-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{t.adminOrders}</button>
                     <button onClick={() => setTab('services')} className={`px-6 py-2 rounded-full font-bold transition ${tab === 'services' ? 'bg-cyan-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{t.adminServices}</button>
                     <button onClick={() => setTab('settings')} className={`px-6 py-2 rounded-full font-bold transition ${tab === 'settings' ? 'bg-cyan-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{t.adminSettings}</button>
                 </div>

                 {tab === 'orders' && (
                     <div className="space-y-4">
                         {orders.map(o => (
                             <div key={o.id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md cursor-pointer ${expandedOrder === o.id ? 'ring-2 ring-cyan-200' : ''}`} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                                 {editingOrder === o.id ? (
                                     <div className="animate-fade-in bg-blue-50 p-4 rounded-lg border border-blue-200" onClick={e => e.stopPropagation()}>
                                         <h4 className="font-bold text-blue-800 mb-4 flex items-center"><Edit2 className="w-4 h-4 mr-2"/> {t.editingOrder} #{o.orderNumber || o.id.slice(0,6)}</h4>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500">{t.customerInfo}</label>
                                                <input className="w-full p-2 border rounded mt-1 text-sm" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                                                <input className="w-full p-2 border rounded mt-1 text-sm" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" />
                                                
                                                <div className="flex gap-2 items-center mt-1">
                                                    <textarea className="w-full p-2 border rounded text-sm" rows="2" value={editForm.address} onChange={e=>setEditForm({...editForm, address: e.target.value})} placeholder="Address" />
                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editForm.address)}`} target="_blank" rel="noopener noreferrer" className="bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition" title="Open in Maps">
                                                        <MapPin className="w-5 h-5"/>
                                                    </a>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Options</label>
                                                <label className="flex items-center space-x-2"><input type="checkbox" checked={editForm.express} onChange={e=>setEditForm({...editForm, express: e.target.checked})}/> <span className="text-sm">Express</span></label>
                                                <label className="flex items-center space-x-2 mt-2"><input type="checkbox" checked={editForm.isMember} onChange={e=>setEditForm({...editForm, isMember: e.target.checked})}/> <span className="text-sm">Member</span></label>
                                                <textarea className="w-full p-2 border rounded mt-2 text-sm" value={editForm.notes} onChange={e=>setEditForm({...editForm, notes: e.target.value})} placeholder="Internal Notes" />
                                            </div>
                                         </div>
                                         
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-3 rounded border border-blue-100">
                                             <div>
                                                 <label className="block text-xs font-bold text-blue-600 mb-1">{t.pickupSchedule}</label>
                                                 <input type="date" className="w-full p-2 border rounded text-xs mb-1" value={editForm.pickupDate} onChange={e=>setEditForm({...editForm, pickupDate: e.target.value})} />
                                                 <select className="w-full p-2 border rounded text-xs" value={editForm.pickupTime} onChange={e=>setEditForm({...editForm, pickupTime: e.target.value})}>{TIME_SLOTS.map(s=><option key={s}>{s}</option>)}</select>
                                             </div>
                                             <div>
                                                 <label className="block text-xs font-bold text-green-600 mb-1">{t.deliverySchedule}</label>
                                                 <input type="date" className="w-full p-2 border rounded text-xs mb-1" value={editForm.deliveryDate} onChange={e=>setEditForm({...editForm, deliveryDate: e.target.value})} />
                                                 <select className="w-full p-2 border rounded text-xs" value={editForm.deliveryTime} onChange={e=>setEditForm({...editForm, deliveryTime: e.target.value})}>{TIME_SLOTS.map(s=><option key={s}>{s}</option>)}</select>
                                             </div>
                                         </div>

                                         <div className="mb-4">
                                             <label className="block text-xs font-bold text-red-500 mb-1">{t.adminNoteLabel}</label>
                                             <textarea className="w-full p-2 border-2 border-red-100 rounded text-sm focus:border-red-300 outline-none" rows="2" placeholder={t.adminNotePlaceholder} value={editForm.adminNote} onChange={e=>setEditForm({...editForm, adminNote: e.target.value})} />
                                         </div>

                                         <div className="flex justify-end gap-2">
                                             <button onClick={()=>setEditingOrder(null)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
                                             <button onClick={()=>saveOrderChanges(o)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Save Changes</button>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="flex flex-col gap-4">
                                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">#{o.orderNumber || o.id.slice(0,6)}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        o.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>{t.status[o.status]}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-800 flex items-center">{o.customer.name} {expandedOrder === o.id ? <ChevronUp className="w-4 h-4 ml-2 text-gray-400"/> : <ChevronDown className="w-4 h-4 ml-2 text-gray-400"/>}</h3>
                                                <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()} • {o.items ? Object.values(o.items).reduce((a,b)=>a+b,0) : 0} items</p>
                                                {o.adminNote && <p className="text-xs text-red-500 mt-1 font-bold">Note: {o.adminNote}</p>}
                                                {o.customerResponse && <p className="text-xs text-green-600 mt-1 font-bold">Reply: {o.customerResponse}</p>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 md:mt-0" onClick={e => e.stopPropagation()}>
                                                <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="bg-gray-50 border border-gray-200 text-xs rounded p-2 font-bold outline-none cursor-pointer hover:border-cyan-500 transition">
                                                    {Object.keys(t.status).map(s => <option key={s} value={s}>{t.status[s]}</option>)}
                                                </select>
                                                <button onClick={() => shareOrder(o)} className="p-2 text-gray-500 hover:bg-gray-100 rounded" title="Share"><Share2 className="w-4 h-4"/></button>
                                                <button onClick={() => startEditing(o)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit2 className="w-4 h-4"/></button>
                                                <button onClick={() => printOrder(o)} className="p-2 text-gray-500 hover:bg-gray-100 rounded" title="Print"><Printer className="w-4 h-4"/></button>
                                                <button onClick={() => deleteOrder(o.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                         </div>
                                         
                                         {/* EXPANDED DETAILS */}
                                         {expandedOrder === o.id && (
                                             <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                     <div className="bg-gray-50 p-3 rounded">
                                                         <h5 className="font-bold text-gray-700 mb-2">Customer Details</h5>
                                                         <p><span className="font-bold">Phone:</span> {o.customer.phone}</p>
                                                         <p><span className="font-bold">Address:</span> {o.customer.address}</p>
                                                         <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customer.address)}`} target="_blank" rel="noreferrer" className="text-cyan-600 font-bold text-xs mt-1 inline-flex items-center hover:underline"><MapPin className="w-3 h-3 mr-1"/> View Map</a>
                                                     </div>
                                                     <div className="bg-gray-50 p-3 rounded">
                                                         <h5 className="font-bold text-gray-700 mb-2">Schedule</h5>
                                                         <p><span className="font-bold">Pickup:</span> {o.details.pickupDate} ({o.details.pickupTime})</p>
                                                         <p><span className="font-bold">Delivery:</span> {o.details.deliveryDate} ({o.details.deliveryTime})</p>
                                                     </div>
                                                 </div>
                                                 <div className="mt-4">
                                                     <h5 className="font-bold text-gray-700 mb-2 text-sm">Items & Costs</h5>
                                                     <div className="space-y-1">
                                                         {Object.entries(o.items).map(([id, qty]) => {
                                                             const s = services.find(x => x.id === id);
                                                             return (
                                                                 <div key={id} className="flex justify-between text-sm border-b border-gray-100 pb-1">
                                                                     <span>{qty}x {s ? s.name_en : id}</span>
                                                                     <span className="font-bold text-gray-600">${((s?.price || 0) * qty).toFixed(2)}</span>
                                                                 </div>
                                                             )
                                                         })}
                                                     </div>
                                                     <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed">
                                                         <span className="font-bold text-cyan-800">TOTAL</span>
                                                         <span className="font-black text-xl text-cyan-600">${o.total?.toFixed(2)}</span>
                                                     </div>
                                                     <div className="mt-2 text-xs text-gray-500 flex gap-2">
                                                         {o.aroma && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Aroma: {o.aroma}</span>}
                                                         {o.express && <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded">Express</span>}
                                                         {o.isMember && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Member</span>}
                                                     </div>
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         ))}
                         {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders yet.</p>}
                     </div>
                 )}
                 {tab === 'services' && <ServiceEditor services={services} setServices={setServices} t={t} />}
                 {tab === 'settings' && <SettingsPanel config={config} setConfig={setConfig} t={t} />}
            </div>
        </div>
    );
};

// --- ICONO DE DINERO FALTANTE ---
const DollarSignIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

// --- APP COMPONENT ---
export default function FastWaveApp() {
  const [view, setView] = useState('home');
  const [cart, setCart] = useState({});
  const [isExpress, setIsExpress] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [lang, setLang] = useState('en');
  const [allergies, setAllergies] = useState([]);
  const [aroma, setAroma] = useState('Fresh');
  const [form, setForm] = useState({ name: '', phone: '', address: '', pickupDate: '', pickupTime: TIME_SLOTS[0], deliveryDate: '', deliveryTime: TIME_SLOTS[0], paymentMethod: 'cash' });
  const [formErrors, setFormErrors] = useState({}); // Nuevo estado para errores
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [config, setConfig] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemAddedMsg, setItemAddedMsg] = useState(null);
  const [myOrders, setMyOrders] = useState([]); 
  const [customerReply, setCustomerReply] = useState({}); // Estado para respuestas del cliente

  useTailwind();
  useAppMode();

  useEffect(() => {
     if(db) {
         const unsubscribeServices = onSnapshot(doc(db, 'settings', 'services'), (snap) => {
             if(snap.exists()) {
                 setServices(snap.data().list);
             }
         });
         
         const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
             if(snap.exists()) setConfig(snap.data());
         });

         return () => {
             unsubscribeServices();
             unsubscribeConfig();
         };
     }
  }, []);

  useEffect(() => {
      if (view === 'track' && config.phone) {
          const savedOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
          if (savedOrders.length > 0 && db) {
              const q = query(collection(db, 'orders'), where('__name__', 'in', savedOrders.slice(0, 10))); 
              const unsub = onSnapshot(q, (snap) => {
                  setMyOrders(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
              });
              return () => unsub();
          } else {
              setMyOrders([]); // Reset if no orders
          }
      }
  }, [view]);

  const t = LANGUAGES[lang];

  const updateCart = (id, qty) => {
    setCart((prev) => {
      const newQty = (prev[id] || 0) + qty;
      if (newQty <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: newQty };
    });
    if (qty > 0) {
        setItemAddedMsg(id);
        setTimeout(() => setItemAddedMsg(null), 800);
    }
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  
  const calculateTotals = () => {
      const subtotal = Object.entries(cart).reduce((acc, [id, qty]) => {
          const s = services.find(x => x.id === id);
          return acc + ((s?.price || 0) * qty);
      }, 0);
      
      const expressPct = config.expressPercent || 20;
      const discountPct = config.discountPercent || 10;
      
      const expressFee = isExpress ? subtotal * (expressPct / 100) : 0;
      const discount = isMember ? (subtotal + expressFee) * (discountPct / 100) : 0;
      return { subtotal, expressFee, discount, finalTotal: (subtotal + expressFee) - discount };
  };

  const cartTotals = calculateTotals();

  const validateForm = () => {
      let errors = {};
      if (!form.name.trim()) errors.name = true;
      if (!form.phone.trim()) errors.phone = true;
      if (!form.address.trim()) errors.address = true;
      if (!form.pickupDate) errors.pickupDate = true;
      if (!form.deliveryDate) errors.deliveryDate = true;
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if invalid

    setIsSubmitting(true);
    const orderNum = generateShortId();

    const orderData = {
      customer: { name: form.name, phone: form.phone, address: form.address },
      items: cart,
      details: {
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          deliveryDate: form.deliveryDate,
          deliveryTime: form.deliveryTime,
          paymentMethod: form.paymentMethod
      },
      express: isExpress,
      isMember: isMember,
      allergies,
      aroma,
      total: cartTotals.finalTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      adminNote: '',
      customerResponse: '',
      orderNumber: orderNum 
    };

    try {
      if(db) {
          const docRef = await addDoc(collection(db, 'orders'), orderData);
          const finalOrder = { id: docRef.id, ...orderData };
          setLastOrder(finalOrder);
          const currentSaved = JSON.parse(localStorage.getItem('myOrders') || '[]');
          localStorage.setItem('myOrders', JSON.stringify([...currentSaved, docRef.id]));
      } else {
          setLastOrder({ id: "DEMO-123", ...orderData, orderNumber: orderNum });
      }
      setCart({});
      setForm({ name: '', phone: '', address: '', pickupDate: '', pickupTime: TIME_SLOTS[0], deliveryDate: '', deliveryTime: TIME_SLOTS[0], paymentMethod: 'cash' });
      setAllergies([]);
      setView('success');
    } catch (e) {
      console.error(e);
      alert("Error sending order. Please try again.");
    }
    setIsSubmitting(false);
  };

  const getOwnerWhatsApp = () => {
      if (!lastOrder) return "#";
      const cleanPhone = (config.phone || '').replace(/\D/g, ''); 
      const displayId = lastOrder.orderNumber || lastOrder.id.slice(0,6);

      // LISTA DETALLADA PARA WHATSAPP
      const itemsList = Object.entries(lastOrder.items).map(([id, qty]) => {
            const s = services.find(x => x.id === id);
            const name = s ? (lang === 'es' ? s.name_es : s.name_en) : id;
            const lineTotal = s ? (s.price * qty).toFixed(2) : '0.00';
            return `• ${qty} x ${name}..... $${lineTotal}`; 
      }).join('%0a');

      let extras = "";
      if(lastOrder.express) extras += `%0a⚡ Express Service: Yes`;
      if(lastOrder.isMember) extras += `%0a⭐ Member Discount: Yes`;
      
      const msg = `
🧾 *RECEIPT #${displayId}*
--------------------------------
👤 *Customer:* ${lastOrder.customer.name}
📞 *Phone:* ${lastOrder.customer.phone}
📍 *Address:* ${lastOrder.customer.address}
--------------------------------
📅 *PICKUP:*
${lastOrder.details.pickupDate} - ${lastOrder.details.pickupTime}

🚚 *DELIVERY:*
${lastOrder.details.deliveryDate} - ${lastOrder.details.deliveryTime}
--------------------------------
🧺 *ORDER DETAILS:*
${itemsList}
--------------------------------
${extras ? extras + '%0a--------------------------------' : ''}
💰 *TOTAL: $${lastOrder.total?.toFixed(2)}*
💳 *Payment:* ${lastOrder.details.paymentMethod.toUpperCase()}
--------------------------------
📝 *Notes:* ${lastOrder.aroma ? lastOrder.aroma : 'None'}
`;
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg.trim())}`; 
  };

  const getOwnerSMS = () => { 
      if (!lastOrder) return "#"; 
      const cleanPhone = (config.phone || '').replace(/\D/g,''); 
      const displayId = lastOrder.orderNumber || lastOrder.id.slice(0,6);
      
      // Construct a detailed text message for SMS
      let msg = `Fast Wave Order #${displayId}\n`;
      msg += `Customer: ${lastOrder.customer.name}\n`;
      msg += `Items:\n`;
      Object.entries(lastOrder.items).forEach(([id, qty]) => {
         const s = services.find(x => x.id === id);
         const name = s ? (lang === 'es' ? s.name_es : s.name_en) : id;
         msg += `- ${qty}x ${name}\n`;
      });
      msg += `Total: $${lastOrder.total?.toFixed(2)}\n`;
      msg += `Pickup: ${lastOrder.details.pickupDate}\n`;
      msg += `Address: ${lastOrder.customer.address}`;

      return `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`; 
  };

  const sendCustomerReply = async (orderId, replyText) => {
      if (!replyText.trim()) return;
      if (db) {
          await updateDoc(doc(db, 'orders', orderId), { customerResponse: replyText });
          alert(t.replySent);
          setCustomerReply({ ...customerReply, [orderId]: '' });
      }
  };

  const deleteLocalOrder = (orderId) => {
      if(window.confirm("Delete this receipt from your history?")) {
          const currentSaved = JSON.parse(localStorage.getItem('myOrders') || '[]');
          const newSaved = currentSaved.filter(id => id !== orderId);
          localStorage.setItem('myOrders', JSON.stringify(newSaved));
          setMyOrders(prev => prev.filter(o => o.id !== orderId));
      }
  };

  const shareOrder = (order) => {
      const text = `Fast Wave Receipt #${order.orderNumber || order.id.slice(0,6)}\nTotal: $${order.total?.toFixed(2)}\nStatus: ${order.status}\nLink: ${window.location.origin}`;
      if (navigator.share) {
          navigator.share({
              title: 'Fast Wave Receipt',
              text: text,
              url: window.location.href
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(text);
          alert("Receipt info copied to clipboard!");
      }
  };

  if (view === 'success') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-cyan-50 font-sans">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full animate-fade-in">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-3xl font-black text-gray-800 mb-2">{t.successMsg}</h1>
            <p className="text-gray-500 mb-6">{t.successSub}</p>
            <div className="bg-gray-100 p-4 rounded-xl mb-8 border-2 border-dashed border-gray-300"><p className="text-sm text-gray-500 uppercase font-bold">{t.orderNumberIs}</p><p className="text-xl font-mono font-black text-cyan-600 break-all">{lastOrder?.orderNumber || lastOrder?.id.slice(0,6)}</p></div>
            <a href={getOwnerWhatsApp()} target="_blank" rel="noreferrer" className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-black text-lg shadow-xl hover:bg-green-600 transition flex items-center justify-center mb-4 transform hover:scale-105 animate-pulse border-4 border-green-200"><MessageCircle className="w-6 h-6 mr-3"/> {t.sendWhastapp}</a>
            <a href={getOwnerSMS()} className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl font-black text-lg shadow-xl hover:bg-blue-600 transition flex items-center justify-center mb-4 transform hover:scale-105 border-4 border-blue-200"><Smartphone className="w-6 h-6 mr-3"/> {t.sendSMS}</a>
            <button onClick={() => setView('track')} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center mt-4"><CustomReceiptIcon className="w-5 h-5 mr-2"/> {t.trackOrder}</button>
            <button onClick={() => setView('home')} className="w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center mt-2"><ArrowLeft className="w-5 h-5 mr-2"/> {t.back}</button>
          </div>
        </div>
      );
  }

  // --- VISTA MEJORADA: TRACKING / RECIBO DEL CLIENTE ---
  if (view === 'track') {
      return (
          <div className="min-h-screen bg-slate-50 p-4 font-sans pb-24">
             <button onClick={() => setView('home')} className="mb-6 flex items-center text-gray-600 font-bold"><ArrowLeft className="mr-2"/> {t.back}</button>
             <h2 className="text-2xl font-black mb-6">{t.yourOrders}</h2>
             
             {myOrders.length === 0 ? (
                 <p className="text-center text-gray-400 mt-10">No orders found.</p>
             ) : (
                 <div className="space-y-6">
                     {myOrders.map(o => (
                         // CAMBIO DE COLOR SI ESTA COMPLETADO
                         <div key={o.id} className={`p-6 rounded-2xl shadow-lg border-2 relative overflow-hidden transition-all ${o.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                             {o.status === 'completed' && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">{t.orderCompleted}</div>}
                             
                             <div className="flex justify-between items-start mb-4 border-b border-dashed pb-4">
                                 <div>
                                     <span className="font-mono text-xl font-black text-cyan-700">#{o.orderNumber || o.id.slice(0,6)}</span>
                                     <p className="text-xs text-gray-400 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                                     <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold uppercase ${o.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-700'}`}>{t.status[o.status] || o.status}</span>
                                 </div>
                                 <div className="text-right">
                                     <button onClick={() => shareOrder(o)} className="text-gray-400 hover:text-cyan-600 mb-2 block ml-auto"><Share2 className="w-5 h-5"/></button>
                                 </div>
                             </div>

                             {/* DETALLES TIPO RECIBO */}
                             <div className="space-y-2 text-sm text-gray-600 mb-4">
                                 <div className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-cyan-500"/> <span>{o.customer.address}</span></div>
                                 <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-cyan-500"/> <span>Pickup: {o.details.pickupDate} ({o.details.pickupTime})</span></div>
                                 <div className="flex items-center"><Truck className="w-4 h-4 mr-2 text-cyan-500"/> <span>Delivery: {o.details.deliveryDate} ({o.details.deliveryTime})</span></div>
                             </div>

                             <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                 {Object.entries(o.items).map(([k,v]) => {
                                     const s = services.find(x=>x.id===k);
                                     const totalLine = (s?.price || 0) * v;
                                     return (
                                        <div key={k} className="flex justify-between py-1 text-sm border-b border-gray-200 last:border-0">
                                            <span>{v} x {s ? ((lang === 'es' && s.name_es) ? s.name_es : (lang === 'fr' && s.name_fr) ? s.name_fr : (lang === 'hi' && s.name_hi) ? s.name_hi : s.name_en) : k}</span>
                                            <span className="font-bold">${totalLine.toFixed(2)}</span>
                                        </div>
                                     )
                                 })}
                                 <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-300">
                                     <span className="font-bold text-gray-800">TOTAL</span>
                                     <span className="font-black text-xl text-cyan-700">${o.total?.toFixed(2)}</span>
                                 </div>
                             </div>
                             
                             {/* NOTAS DEL ADMIN Y RESPUESTA DEL CLIENTE */}
                             {o.adminNote && (
                                 <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm text-blue-800 rounded-r">
                                     <p className="font-bold text-xs uppercase mb-1 flex items-center"><CustomInfoIcon className="w-3 h-3 mr-1"/> {t.updateFromLaundry}</p>
                                     <p>{o.adminNote}</p>
                                 </div>
                             )}

                             {/* SECCION PARA RESPONDER AL ADMIN */}
                             <div className="mt-4 pt-4 border-t border-gray-100">
                                 {o.customerResponse ? (
                                     <div className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-100">
                                         <span className="font-bold block text-xs uppercase">Your Reply:</span>
                                         {o.customerResponse}
                                     </div>
                                 ) : (
                                     <div className="flex gap-2">
                                         <input 
                                            className="flex-1 border rounded px-3 py-2 text-sm" 
                                            placeholder="Reply to admin..." 
                                            value={customerReply[o.id] || ''} 
                                            onChange={(e) => setCustomerReply({...customerReply, [o.id]: e.target.value})}
                                         />
                                         <button onClick={() => sendCustomerReply(o.id, customerReply[o.id])} className="bg-cyan-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-cyan-700"><Send className="w-4 h-4"/></button>
                                     </div>
                                 )}
                             </div>

                             {/* BOTON DE BORRAR SOLO SI ESTA COMPLETADO */}
                             {o.status === 'completed' && (
                                 <button onClick={() => deleteLocalOrder(o.id)} className="w-full mt-4 bg-gray-200 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition">
                                     <Trash2 className="w-4 h-4 mr-2"/> {t.deleteReceipt}
                                 </button>
                             )}
                         </div>
                     ))}
                 </div>
             )}
          </div>
      )
  }

  if (view === 'admin') return <AdminView t={t} config={config} setConfig={setConfig} services={services} setServices={setServices} setView={setView} lang={lang} />;

  // ... (Vistas HOME y CART con validacion visual) ...
   
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {/* ... Navbar igual ... */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-cyan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer transform hover:scale-105 transition" onClick={() => setView('home')}>
              <BrandLogo />
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => setView('track')} className="flex items-center text-gray-600 hover:text-cyan-600 font-bold bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition mr-2">
                 <CustomPackageIcon className="w-4 h-4 mr-2" />
                 {t.trackOrder || "My Orders"}
              </button>
              
              <div className="flex items-center bg-cyan-50 px-4 py-2 rounded-full text-cyan-800 font-mono text-sm border border-cyan-100">
                <Phone className="h-4 w-4 mr-2" /> {config.phone}
              </div>
              <div className="relative group">
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-gray-100 text-sm rounded-lg pl-3 pr-8 py-2 border-none outline-none cursor-pointer font-bold text-gray-700 appearance-none hover:bg-gray-200 transition">
                    <option value="en">🇺🇸 EN</option>
                    <option value="es">🇪🇸 ES</option>
                    <option value="fr">🇫🇷 FR</option>
                    <option value="hi">🇮🇳 HI</option>
                </select>
              </div>
              <button onClick={() => setView('cart')} className="relative p-3 text-gray-500 hover:text-cyan-600 transition bg-gray-50 rounded-full hover:bg-cyan-50">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (<span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm animate-bounce">{cartCount}</span>)}
              </button>
              <button onClick={() => setView('admin')} className="text-gray-400 hover:text-cyan-800 p-2"><Lock className="h-4 w-4" /></button>
            </div>

            <div className="md:hidden flex items-center gap-3">
                 <button onClick={() => setView('cart')} className="relative p-2 text-gray-600">
                    <ShoppingBag className="h-6 w-6" />
                    {cartCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                 </button>
                 <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-cyan-800">
                    {mobileMenuOpen ? <X className="w-7 h-7"/> : <Menu className="w-7 h-7"/>}
                 </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 p-4 shadow-xl absolute w-full z-40 animate-fade-in-down">
                <div className="space-y-4">
                    <button onClick={()=>{setView('home'); setMobileMenuOpen(false)}} className="block w-full text-left font-bold text-gray-700 py-2">Home</button>
                    <button onClick={()=>{setView('track'); setMobileMenuOpen(false)}} className="block w-full text-left font-bold text-gray-700 py-2">My Orders</button>
                    <button onClick={()=>{setView('cart'); setMobileMenuOpen(false)}} className="block w-full text-left font-bold text-gray-700 py-2">Cart ({cartCount})</button>
                    <button onClick={()=>{setView('admin'); setMobileMenuOpen(false)}} className="block w-full text-left font-bold text-gray-700 py-2">Admin Login</button>
                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-mono text-cyan-700 flex items-center"><Phone className="w-4 h-4 mr-2"/> {config.phone}</span>
                        <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-gray-100 rounded px-2 py-1 text-sm"><option value="en">EN</option><option value="es">ES</option><option value="fr">FR</option><option value="hi">HI</option></select>
                    </div>
                </div>
            </div>
        )}
      </nav>

      {view === 'home' && (
        <div className="animate-fade-in">
          {/* ... Hero and Services sections remain same ... */}
          <div className="relative h-[550px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-cyan-900/50 mix-blend-multiply"></div>
            </div>
            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4 tracking-tight leading-tight">{t.title}</h1>
              <p className="text-xl md:text-2xl text-cyan-50 font-light mb-10 italic max-w-3xl mx-auto leading-relaxed">"{t.heroSubtitle}"</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="group bg-white text-cyan-700 text-xl font-bold py-4 px-10 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <span className="mr-2">{t.orderNow}</span>
                </button>
                <button onClick={() => setView('cart')} className="group bg-cyan-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-2xl hover:scale-105 hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center border-2 border-white/30">
                    <ShoppingBag className="w-6 h-6 mr-2" /> {t.sendOrder}
                </button>
              </div>
            </div>
            <div className="absolute top-10 right-10 bg-yellow-400 text-cyan-900 w-24 h-24 rounded-full flex items-center justify-center text-center font-bold text-xs shadow-xl border-4 border-white rotate-12 z-30 animate-pulse">{config.discountPercent}% OFF<br/>Member</div>
          </div>

          <div id="services" className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12"><h2 className="text-3xl font-black text-gray-900">{t.services}</h2><div className="w-24 h-1.5 bg-cyan-500 mx-auto mt-4 rounded-full"></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group relative">
                  {/* Feedback visual */}
                  {itemAddedMsg === s.id && (
                      <div className="absolute inset-0 bg-cyan-600/80 z-20 flex items-center justify-center animate-fade-in">
                          <CheckCircle className="text-white w-12 h-12"/>
                      </div>
                  )}
                  <div className="h-40 overflow-hidden relative bg-white flex items-center justify-center">
                      {(s.image && s.image !== '') ? (
                          <img src={s.image} alt={s.name_en} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" onError={(e) => {e.target.src='https://placehold.co/400?text=' + s.name_en}} />
                      ) : s.type === 'component' && s.componentName === 'CustomIronIcon' ? (
                        <div className="w-20 h-20"><CustomIronIcon /></div>
                      ) : (
                          <img src={s.image} alt={s.name_en} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" onError={(e) => {e.target.src='https://placehold.co/400?text=' + s.name_en}} />
                      )}
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-grow bg-white">
                    <div><h3 className="font-bold text-lg mb-1 leading-tight">{ (lang === 'es' && s.name_es) ? s.name_es : (lang === 'fr' && s.name_fr) ? s.name_fr : (lang === 'hi' && s.name_hi) ? s.name_hi : s.name_en }</h3><p className="text-2xl font-bold text-cyan-600">${s.price?.toFixed(2)}</p></div>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl mt-4"><button onClick={() => updateCart(s.id, -1)} className="w-10 h-10 rounded-full bg-white shadow text-gray-400 hover:text-red-500 font-bold text-xl transition">-</button><span className="font-bold text-xl">{cart[s.id] || 0}</span><button onClick={() => updateCart(s.id, 1)} className="w-10 h-10 rounded-full bg-cyan-600 shadow text-white hover:bg-cyan-700 font-bold text-xl transition">+</button></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"><h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center"><Droplet className="w-6 h-6 text-purple-500 mr-2" /> {t.preferredAroma}</h3><div className="flex flex-wrap gap-3">{AROMAS.map((a) => (<button key={a.id} onClick={() => setAroma(a.id)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${aroma === a.id ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{lang === 'es' ? a.es : lang === 'fr' ? a.fr : lang === 'hi' ? a.hi : a.en}</button>))}</div></div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"><h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center"><AlertCircle className="w-6 h-6 text-red-500 mr-2" /> {t.productsToAvoid}</h3><div className="grid grid-cols-2 gap-3">{AVOID_PRODUCTS.map((p) => (<label key={p.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${allergies.includes(p.id) ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}><input type="checkbox" checked={allergies.includes(p.id)} onChange={() => setAllergies((x) => x.includes(p.id) ? x.filter((y) => y !== p.id) : [...x, p.id])} className="w-5 h-5 accent-red-500 mr-3" /><span className="text-sm font-medium text-gray-700">{lang === 'es' ? p.label_es : lang === 'fr' ? p.label_fr : lang === 'hi' ? p.label_hi : p.label_en}</span></label>))}</div></div>
            </div>
            
            {/* ZONA DE PRECIOS CLAROS */}
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-32">
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${isExpress ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-gray-200 bg-white'}`}>
                    <input type="checkbox" checked={isExpress} onChange={() => setIsExpress(!isExpress)} className="w-6 h-6 accent-cyan-600 mr-4" />
                    <div>
                        <span className="font-bold text-lg block text-gray-800">{t.express} ({config.expressText || '24h'})</span>
                        <span className="text-sm text-cyan-700 font-bold">
                            {cartCount > 0 ? `+ $${cartTotals.expressFee.toFixed(2)}` : `+${config.expressPercent || 20}%`} {t.fee}
                        </span>
                    </div>
                </label>
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${isMember ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' : 'border-gray-200 bg-white'}`}>
                    <input type="checkbox" checked={isMember} onChange={() => setIsMember(!isMember)} className="w-6 h-6 accent-yellow-500 mr-4" />
                    <div>
                        <span className="font-bold text-lg block text-gray-800">{t.member}</span>
                        <span className="text-sm text-yellow-600 font-bold">
                             {cartCount > 0 ? `- $${cartTotals.discount.toFixed(2)}` : `${config.discountPercent}% ${t.off}`}
                        </span>
                    </div>
                    <Star className="w-8 h-8 text-yellow-400 ml-4 fill-current" />
                </label>
            </div>
          </div>
          {cartCount > 0 && (<div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 animate-bounce-slow"><button onClick={() => setView('cart')} className="bg-gray-900 text-white w-full max-w-md py-4 px-8 rounded-full shadow-2xl flex justify-between items-center hover:scale-105 transition transform border-4 border-white/20 backdrop-blur-lg"><div className="flex items-center"><span className="bg-cyan-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-lg">{cartCount}</span><span className="font-bold text-lg">{t.sendOrder}</span></div><span className="font-mono text-2xl font-black tracking-tight">${cartTotals.finalTotal.toFixed(2)}</span></button></div>)}
        </div>
      )}

      {view === 'cart' && (
        <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in pb-20">
          <button onClick={() => setView('home')} className="mb-8 text-gray-500 font-bold hover:text-cyan-600 flex items-center transition bg-white px-4 py-2 rounded-lg shadow-sm"><ArrowLeft className="w-5 h-5 mr-2"/> {t.back}</button>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800"><ShoppingBag className="mr-3" /> {t.total}</h2>
            {Object.keys(cart).length === 0 ? <p className="text-gray-400 text-center py-4">{t.emptyCart}</p> : (
              <div className="space-y-3">
                {Object.entries(cart).map(([id, q]) => { const s = services.find((x) => x.id === id); return (<div key={id} className="flex justify-between text-gray-700 border-b border-gray-50 pb-2"><span><span className="font-bold text-gray-900">{q}x</span> {lang === 'es' ? s.name_es : lang === 'fr' ? s.name_fr : lang === 'hi' ? s.name_hi : s.name_en}</span><span className="font-bold">${(s.price * q).toFixed(2)}</span></div>); })}
                
                {isExpress && (
                    <div className="flex justify-between text-cyan-600 font-bold pt-2 border-t border-dashed border-gray-200">
                        <span>{t.express} ({config.expressText})</span>
                        <span>+${cartTotals.expressFee.toFixed(2)}</span>
                    </div>
                )}
                {isMember && (
                    <div className="flex justify-between text-yellow-600 font-bold pt-2">
                        <span>{t.member}</span>
                        <span>-${cartTotals.discount.toFixed(2)}</span>
                    </div>
                )}
                
                <div className="flex justify-between items-center pt-6 mt-4 border-t-2 border-dashed border-gray-200"><span className="text-gray-500 font-bold">Total to Pay</span><span className="text-4xl font-black text-cyan-600">${cartTotals.finalTotal.toFixed(2)}</span></div>
              </div>
            )}
          </div>

          {cartCount > 0 && (
            <form onSubmit={submitOrder} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              {Object.keys(formErrors).length > 0 && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold text-sm mb-4 animate-shake">{t.fillRequired}</div>}
              
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center"><User className="mr-2" /> {t.details}</h3>
              <div className="grid gap-4">
                <input required placeholder={t.nameLabel} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full p-4 bg-gray-50 rounded-xl border focus:bg-white focus:border-cyan-500 outline-none transition ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                <div>
                   <label className="text-xs font-bold text-green-600 ml-1 mb-1 block">{t.whatsappLabel}</label>
                   <input required placeholder="Number (e.g. 5551234567)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`w-full p-4 bg-gray-50 rounded-xl border-2 border-green-100 focus:bg-white focus:border-green-500 outline-none transition ${formErrors.phone ? '!border-red-500 bg-red-50' : ''}`} />
                </div>
                <textarea required placeholder={t.addressLabel} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`w-full p-4 bg-gray-50 rounded-xl border focus:bg-white focus:border-cyan-500 outline-none transition ${formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className={`bg-blue-50 p-4 rounded-xl border ${formErrors.pickupDate ? 'border-red-500' : 'border-blue-100'}`}>
                    <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center uppercase tracking-wide"><Truck className="w-4 h-4 mr-2" /> {t.pickupInfo}</label>
                    <div className="space-y-2"><div><span className="text-xs text-blue-600 font-bold ml-1">{t.pickupDate}</span><input required type="date" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} className="w-full p-3 bg-white rounded-lg border border-blue-200 focus:border-blue-500" /></div><div><span className="text-xs text-blue-600 font-bold ml-1">{t.pickupTime}</span><select className="w-full p-3 bg-white rounded-lg border border-blue-200 focus:border-blue-500" value={form.pickupTime} onChange={(e) => setForm({...form, pickupTime: e.target.value})}>{TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}</select></div></div>
                  </div>
                  <div className={`bg-green-50 p-4 rounded-xl border ${formErrors.deliveryDate ? 'border-red-500' : 'border-green-100'}`}>
                    <label className="block text-sm font-bold text-green-800 mb-2 flex items-center uppercase tracking-wide"><Calendar className="w-4 h-4 mr-2" /> {t.deliveryInfo}</label>
                    <div className="space-y-2"><div><span className="text-xs text-green-600 font-bold ml-1">{t.deliveryDate}</span><input required type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className="w-full p-3 bg-white rounded-lg border border-green-200 focus:border-green-500" /></div><div><span className="text-xs text-green-600 font-bold ml-1">{t.deliveryTime}</span><select className="w-full p-3 bg-white rounded-lg border border-green-200 focus:border-green-500" value={form.deliveryTime} onChange={(e) => setForm({...form, deliveryTime: e.target.value})}>{TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}</select></div></div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center"><CreditCard className="mr-2" /> {t.payment}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition ${form.paymentMethod === 'cash' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}><input type="radio" name="payment" value="cash" checked={form.paymentMethod === 'cash'} onChange={() => setForm({ ...form, paymentMethod: 'cash' })} className="w-5 h-5 accent-cyan-600 mr-3" /><div className="flex flex-col"><span className="font-bold text-gray-800">{t.payCashLabel}</span><span className="text-xs text-gray-500">{t.payCashSub}</span></div></label>
                  <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition ${form.paymentMethod === 'online' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}><input type="radio" name="payment" value="online" checked={form.paymentMethod === 'online'} onChange={() => setForm({ ...form, paymentMethod: 'online' })} className="w-5 h-5 accent-purple-600 mr-3" /><div className="flex flex-col"><span className="font-bold text-purple-900">{t.payOnlineLabel}</span><span className="text-xs text-purple-600">{t.payOnlineSub}</span></div></label>
                </div>
                {form.paymentMethod === 'online' && (<div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-2 text-sm text-purple-900"><p><strong>Zelle:</strong> {config.zelleNumber || config.phone}</p><p>{config.zelleMessage || t.zelleNote}</p></div>)}
              </div>

              <button className="w-full bg-gray-900 text-white py-5 rounded-xl font-bold text-xl shadow-xl hover:bg-black transition transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><CustomLoaderIcon className="animate-spin w-5 h-5 mr-2"/> {t.sending}</>
                ) : (
                    <>{t.submit} <Send className="w-5 h-5 ml-2" /></>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
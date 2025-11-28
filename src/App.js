import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Lock, Phone, Star, Droplet,
  Calendar, Truck, MessageCircle, Settings, 
  Edit2, ArrowLeft, Trash2, Plus, User, CheckCircle, CreditCard, AlertCircle,
  ShieldCheck, Key, Send
} from 'lucide-react';

// --- AUTO-CARGA DE ESTILOS (Tailwind CSS) ---
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

// --- CONFIGURACIÓN DE PERSISTENCIA ---
const LOCAL_STORAGE_KEY = 'fastwave_data_v82_hero_bg_update';

const getLocalData = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { orders: [], services: [], config: null };
  } catch (e) {
    return { orders: [], services: [], config: null };
  }
};

const saveLocalData = (data) => {
  try {
    const current = getLocalData();
    const newData = { ...current, ...data };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
  } catch (e) {
    console.error("Error saving local data", e);
  }
};

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM"
];

// --- COMPONENTE DE PLANCHA SVG (ICONO PERSONALIZADO) ---
const IronIcon = () => (
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
    {/* Suela */}
    <path fill="url(#ironSole)" d="M4 46h56c2.2 0 4 1.8 4 4s-1.8 4-4 4H4c-2.2 0-4-1.8-4-4s1.8-4 4-4z" />
    {/* Cuerpo */}
    <path fill="url(#ironBody)" d="M8 46h48c0-14-10-26-26-26h-4c-10 0-16 8-16 26z" />
    {/* Asa */}
    <path fill="none" stroke="#155e75" strokeWidth="6" strokeLinecap="round" d="M22 20V12c0-4.4 4.4-8 8.8-8h10.4c8.8 0 12.8 7.2 12.8 16v12" />
    {/* Dial */}
    <circle cx="34" cy="34" r="5" fill="#fff" opacity="0.9" />
    <circle cx="34" cy="34" r="2" fill="#155e75" />
  </svg>
);

// --- LOGO ---
const BrandLogo = () => (
  <div className="relative flex items-center justify-center px-5 py-2 overflow-hidden rounded-full border-2 border-cyan-100 shadow-sm group hover:shadow-md transition-all">
    <img
      src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=300&q=80" 
      alt="Fast Wave Laundry Logo Background"
      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/95 backdrop-blur-[1px]"></div>
    <div className="relative z-10 flex flex-col items-center">
        <span className="font-black text-xl text-cyan-900 leading-none tracking-tight drop-shadow-sm">Fast Wave</span>
        <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-widest">Laundry Service</span>
    </div>
  </div>
);

// --- SERVICIOS ---
const INITIAL_SERVICES = [
  { 
    id: 'wash_fold', 
    name_en: 'Wash & Fold (per lb)', 
    name_es: 'Lavado y Doblado (por lb)', 
    name_fr: 'Lavage et Pliage (par lb)', 
    name_hi: 'धलाई और तह (प्रति पाउंड)', 
    price: 1.50, 
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80',
    type: 'image'
  },
  { 
    id: 'dry_clean_shirt', 
    name_en: 'Dry Clean Shirt', 
    name_es: 'Lavado en Seco Camisa', 
    name_fr: 'Nettoyage à Sec Chemise', 
    name_hi: 'ड्राई क्लीन शर्ट', 
    price: 5.00, 
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image'
  },
  { 
    id: 'dry_clean_suit', 
    name_en: 'Dry Clean Suit', 
    name_es: 'Lavado en Seco Traje', 
    name_fr: 'Nettoyage à Sec Costume', 
    name_hi: 'ड्राई क्लीन सूट', 
    price: 15.00, 
    image: 'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image'
  },
  { 
    id: 'ironing', 
    name_en: 'Ironing Service', 
    name_es: 'Servicio de Planchado', 
    name_fr: 'Service de Repassage', 
    name_hi: 'इस्त्री सेवा', 
    price: 3.00, 
    type: 'component', 
    componentName: 'IronIcon'
  }, 
  { 
    id: 'bedding', 
    name_en: 'Bedding / Comforter', 
    name_es: 'Ropa de Cama / Edredón', 
    name_fr: 'Literie / Couette', 
    name_hi: 'बिस्तर / रजाई', 
    price: 20.00, 
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image'
  },
];

// --- MOCKS DE BASE DE DATOS (RESTAURADOS) ---
const mockAuth = {
  currentUser: { uid: 'DEMO_ADMIN' },
  onAuthStateChanged: (cb) => { cb({ uid: 'DEMO_ADMIN' }); return () => {}; },
  signInAnonymously: async () => {},
};

const mockDb = {
  onSnapshot: (q, cb) => {
      const local = getLocalData();
      if (q?.id === 'config') {
        const defaultConfig = { 
            phone: '609-828-7989', 
            discountPercent: 5, 
            zelleNumber: '', 
            zelleMessage: '',
            adminPassword: '1234',
            recoveryPin: '0000'
        };
        cb({ exists: () => true, data: () => local.config || defaultConfig });
      } else if (q?.id === 'services') {
        cb({ exists: () => true, data: () => ({ list: INITIAL_SERVICES }) });
      } else if (q?.id === 'orders_query') {
        cb({ docs: (local.orders || []).map(o => ({ id: o.id, data: () => o })) });
      }
      return () => {};
  },
  setDoc: async (ref, data) => { if(ref.id === 'services') saveLocalData({ services: data.list }); if(ref.id === 'config') saveLocalData({ config: data }); },
  updateDoc: async (ref, data) => { const local = getLocalData(); const updatedOrders = local.orders.map(o => o.id === ref.id ? { ...o, ...data } : o); saveLocalData({ orders: updatedOrders }); },
  addDoc: async (ref, data) => { const local = getLocalData(); const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`; const newOrder = { ...data, id: newId }; saveLocalData({ orders: [newOrder, ...local.orders] }); return { id: newId }; },
  deleteDoc: async (ref) => { const local = getLocalData(); const filtered = local.orders.filter(o => o.id !== ref.id); saveLocalData({ orders: filtered }); },
};

// Variables globales para la app
let auth = mockAuth;
let db = mockDb;

// --- DATOS TRADUCIBLES ---
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

// --- TRADUCCIONES ---
const LANGUAGES = {
  en: {
    title: "Fast Wave Laundry",
    heroSubtitle: "Fresh Clothes, Delivered Right to Your Door! Offering convenient pick-up, professional washing, and prompt delivery services.",
    orderNow: "Start Washing",
    sendOrder: "Send Your Order",
    services: "Our Services",
    productsToAvoid: "Allergies / Avoid",
    preferredAroma: "Scent Selection",
    details: "Order Details",
    pickupInfo: "Pickup Information",
    deliveryInfo: "Delivery Information",
    payment: "Payment Method",
    total: "Estimated Total",
    submit: "Review Order",
    status: { pending: "Pending", confirmed: "Confirmed", picked_up: "Picked Up", cleaning: "Washing", delivering: "Delivering", completed: "Completed" },
    express: "Express Wash (24h)",
    member: "I am a Member",
    discountMsg: "Discount Applied!",
    successMsg: "One Last Step!",
    successSub: "To confirm your order, you MUST send the details via WhatsApp below.",
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
    wrongPin: "Wrong Password",
    sendWhastapp: "CONFIRM ORDER VIA WHATSAPP",
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
    forgotPass: "Forgot Password?",
    recoverTitle: "Recover Password",
    recoverDesc: "Enter your recovery PIN to reset access.",
    enterPin: "Enter PIN",
    reset: "Reset",
    wrongRecPin: "Wrong PIN",
    securitySettings: "Security Settings",
    changePass: "Change Admin Password",
    changePin: "Change Recovery PIN",
    currentPass: "Current Password",
    newPass: "New Password",
    whatsappLabel: "WhatsApp Number",
    fee: "Fee",
    off: "OFF"
  },
  es: {
    title: "Fast Wave Lavandería",
    heroSubtitle: "¡Ropa fresca, entregada en tu puerta! Ofrecemos recogida conveniente, lavado profesional y entrega rápida.",
    orderNow: "Empezar Lavado",
    sendOrder: "Envía tu Orden",
    services: "Nuestros Servicios",
    productsToAvoid: "Alergias / Evitar",
    preferredAroma: "Selección de Aroma",
    details: "Detalles del Pedido",
    pickupInfo: "Información de Recogida",
    deliveryInfo: "Información de Entrega",
    payment: "Método de Pago",
    total: "Total Estimado",
    submit: "Revisar Pedido",
    status: { pending: "Pendiente", confirmed: "Confirmado", picked_up: "Recogido", cleaning: "Lavando", delivering: "En Reparto", completed: "Completado" },
    express: "Lavado Express (24h)",
    member: "Soy Miembro",
    discountMsg: "¡Descuento Aplicado!",
    successMsg: "¡Último Paso!",
    successSub: "Para confirmar, DEBES enviar el pedido por WhatsApp usando el botón abajo.",
    orderNumberIs: "Orden #",
    back: "Volver",
    adminTitle: "Panel de Administración",
    adminOrders: "Pedidos",
    adminServices: "Servicios",
    adminSettings: "Ajustes",
    statsTitle: "Estadísticas del Negocio",
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
    wrongPin: "Contraseña Incorrecta",
    sendWhastapp: "CONFIRMAR ORDEN POR WHATSAPP",
    payCash: "Efectivo / Tarjeta al recibir",
    payOnline: "Zelle / Transferencia",
    pickupDate: "Fecha de Recogida",
    pickupTime: "Hora de Recogida",
    deliveryDate: "Fecha de Entrega",
    deliveryTime: "Hora de Entrega",
    payCashLabel: "Pagar al Recibir",
    payOnlineLabel: "Pagar Online",
    zelleNote: "Enviar captura por WhatsApp",
    forgotPass: "¿Olvidaste la contraseña?",
    recoverTitle: "Recuperar Contraseña",
    recoverDesc: "Introduce tu PIN de recuperación para acceder.",
    enterPin: "Ingresar PIN",
    reset: "Restablecer",
    wrongRecPin: "PIN Incorrecto",
    securitySettings: "Seguridad",
    changePass: "Cambiar Contraseña Admin",
    changePin: "Cambiar PIN de Recuperación",
    currentPass: "Contraseña Actual",
    newPass: "Nueva Contraseña",
    whatsappLabel: "Número de WhatsApp",
    fee: "Cargo",
    off: "DCTO"
  },
  fr: {
    title: "Fast Wave Blanchisserie",
    heroSubtitle: "Vêtements frais, livrés à votre porte ! Ramassage pratique, lavage professionnel et livraison rapide.",
    orderNow: "Commencer",
    sendOrder: "Envoyer Commande",
    services: "Nos Services",
    productsToAvoid: "Allergies / Éviter",
    preferredAroma: "Sélection de Parfum",
    details: "Détails de la Commande",
    pickupInfo: "Info Ramassage",
    deliveryInfo: "Info Livraison",
    payment: "Paiement",
    total: "Total Estimé",
    submit: "Vérifier Commande",
    status: { pending: "En Attente", confirmed: "Confirmé", picked_up: "Ramassé", cleaning: "Lavage", delivering: "Livraison", completed: "Terminé" },
    express: "Express (24h)",
    member: "Je suis Membre",
    discountMsg: "Remise!",
    successMsg: "Dernière Étape!",
    successSub: "Pour confirmer, vous DEVEZ envoyer les détails via WhatsApp ci-dessous.",
    orderNumberIs: "N°",
    back: "Retour",
    adminTitle: "Admin",
    adminOrders: "Commandes",
    adminServices: "Services",
    adminSettings: "Réglages",
    statsTitle: "Stats",
    totalOrders: "Total",
    totalRevenue: "Revenus",
    deleteOrder: "Supprimer",
    editServices: "Modifier",
    genSettings: "Général",
    save: "Enregistrer",
    zelleConf: "Zelle",
    busPhone: "WhatsApp",
    disc: "Remise",
    nameEs: "Nom (ES)",
    nameEn: "Nom (EN)",
    nameFr: "Nom (FR)",
    nameHi: "Nom (HI)",
    price: "Prix",
    addNew: "Ajouter",
    login: "Login",
    enter: "Entrer",
    wrongPin: "Erreur Mot de Passe",
    sendWhastapp: "CONFIRMER VIA WHATSAPP",
    payCash: "Espèces / Carte",
    payOnline: "Zelle / Virement",
    pickupDate: "Date Ramassage",
    pickupTime: "Heure Ramassage",
    deliveryDate: "Date Livraison",
    deliveryTime: "Heure Livraison",
    payCashLabel: "À la livraison",
    payOnlineLabel: "En ligne",
    zelleNote: "Envoyer capture",
    forgotPass: "Mot de passe oublié?",
    recoverTitle: "Récupérer",
    recoverDesc: "Entrez votre PIN de récupération.",
    enterPin: "Entrer PIN",
    reset: "Réinitialiser",
    wrongRecPin: "PIN Incorrect",
    securitySettings: "Sécurité",
    changePass: "Changer Mot de Passe",
    changePin: "Changer PIN",
    currentPass: "Actuel",
    newPass: "Nouveau",
    whatsappLabel: "Numéro WhatsApp",
    fee: "Frais",
    off: "REMISE"
  },
  hi: {
    title: "फास्ट वेव लॉन्ड्री",
    heroSubtitle: "ताज़ा कपड़े, सीधे आपके दरवाजे पर! सुविधाजनक पिक-अप, पेशेवर धुलाई और शीघ्र वितरण सेवाएँ।",
    orderNow: "शुरू करें",
    sendOrder: "ऑर्डर भेजें",
    services: "हमारी सेवाएँ",
    productsToAvoid: "एलर्जी / बचें",
    preferredAroma: "सुगंध चयन",
    details: "विवरण",
    pickupInfo: "पिकअप जानकारी",
    deliveryInfo: "वितरण जानकारी",
    payment: "भुगतान",
    total: "कुल",
    submit: "ऑर्डर की समीक्षा करें",
    status: { pending: "लंबित", confirmed: "पुष्टि", picked_up: "पिकअप", cleaning: "धुलाई", delivering: "वितरण", completed: "पूर्ण" },
    express: "एक्सप्रेस (24h)",
    member: "सदस्य हूँ",
    discountMsg: "छूट!",
    successMsg: "अंतिम चरण!",
    successSub: "पुष्टि करने के लिए, आपको नीचे व्हाट्सएप के माध्यम से विवरण भेजना होगा।",
    orderNumberIs: "ऑर्डर #",
    back: "वापस",
    adminTitle: "एडमिन",
    adminOrders: "ऑर्डर",
    adminServices: "सेवाएँ",
    adminSettings: "सेटिंग्स",
    statsTitle: "आँकड़े",
    totalOrders: "कुल ऑर्डर",
    totalRevenue: "राजस्व",
    deleteOrder: "हटाएँ",
    editServices: "संपादित करें",
    genSettings: "सेटिंग्स",
    save: "सहेजें",
    zelleConf: "ज़ेल",
    busPhone: "व्हाट्सएप",
    disc: "छूट",
    nameEs: "नाम (ES)",
    nameEn: "नाम (EN)",
    nameFr: "नाम (FR)",
    nameHi: "नाम (HI)",
    price: "कीमत",
    addNew: "जोड़ें",
    login: "लॉगिन",
    enter: "प्रवेश",
    wrongPin: "गलत पासवर्ड",
    sendWhastapp: "व्हाट्सएप पर पुष्टि करें",
    payCash: "नकद / कार्ड",
    payOnline: "ज़ेल / ट्रांसफर",
    pickupDate: "पिकअप तिथि",
    pickupTime: "समय",
    deliveryDate: "वितरण तिथि",
    deliveryTime: "समय",
    payCashLabel: "डिलीवरी पर",
    payOnlineLabel: "ऑनलाइन",
    zelleNote: "स्क्रीनशॉट भेजें",
    forgotPass: "पासवर्ड भूल गए?",
    recoverTitle: "पासवर्ड पुनर्प्राप्त करें",
    recoverDesc: "एक्सेस रीसेट करने के लिए अपना रिकवरी पिन दर्ज करें।",
    enterPin: "पिन दर्ज करें",
    reset: "रीसेट",
    wrongRecPin: "गलत पिन",
    securitySettings: "सुरक्षा",
    changePass: "पासवर्ड बदलें",
    changePin: "पिन बदलें",
    currentPass: "वर्तमान",
    newPass: "नया",
    whatsappLabel: "व्हाट्सएप नंबर",
    fee: "शुल्क",
    off: "छूट"
  }
};

// ---------- COMPONENTES DE ADMIN ----------

const ServiceEditor = ({ services, setServices, t }) => {
  const [localServices, setLocalServices] = useState(services);
  const [saveStatus, setSaveStatus] = useState('idle');
  useEffect(() => setLocalServices(services), [services]);
  const updateField = (id, field, value) => { setLocalServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s)); };
  const saveServices = async () => { setSaveStatus('saving'); const finalServices = localServices.map(s => ({...s, price: parseFloat(s.price) || 0})); await db.setDoc({id: 'services'}, { list: finalServices }); setServices(finalServices); setTimeout(() => setSaveStatus('saved'), 600); setTimeout(() => setSaveStatus('idle'), 2000); };
  const addNew = () => setLocalServices([...localServices, { id: Date.now().toString(), name_es: 'Nuevo', name_en: 'New', name_fr: 'Nouveau', name_hi: 'नया', price: 0, image: 'https://via.placeholder.com/150', type: 'image' }]);
  const remove = (id) => setLocalServices(prev => prev.filter(s => s.id !== id));
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
      <h3 className="text-xl font-bold mb-4 flex items-center text-cyan-800"><Edit2 className="w-5 h-5 mr-2"/> {t.editServices}</h3>
      <div className="space-y-4">
        {localServices.map((s) => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded border border-gray-200">
            <div className="md:col-span-1"> 
               {s.type === 'component' && s.componentName === 'IronIcon' ? (
                 <IronIcon />
               ) : (
                  <img src={s.image} alt="service" className="w-12 h-12 object-cover rounded-lg mx-auto" onError={(e) => e.target.src='https://placehold.co/100?text=?'} />
               )}
            </div>
            <div className="md:col-span-3"><input className="w-full p-2 border rounded text-xs" placeholder="ES Name" value={s.name_es} onChange={e => updateField(s.id, 'name_es', e.target.value)} /></div>
            <div className="md:col-span-3"><input className="w-full p-2 border rounded text-xs" placeholder="EN Name" value={s.name_en} onChange={e => updateField(s.id, 'name_en', e.target.value)} /></div>
            <div className="md:col-span-2"><input className="w-full p-2 border rounded text-xs" placeholder="Image URL" value={s.image || ''} disabled={s.type === 'component'} onChange={e => updateField(s.id, 'image', e.target.value)} /></div>
            <div className="md:col-span-2"><input type="number" className="w-full p-2 border rounded font-bold text-green-700" value={s.price} onChange={e => updateField(s.id, 'price', e.target.value)} /></div>
            <div className="md:col-span-1 text-center flex justify-center"><button onClick={() => remove(s.id)} className="text-white bg-red-500 hover:bg-red-600 p-2 rounded w-8 h-8 flex items-center justify-center"><Trash2 className="w-4 h-4"/></button></div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={addNew} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center"><Plus className="w-4 h-4 mr-2"/> {t.addNew}</button>
        <button onClick={saveServices} disabled={saveStatus !== 'idle'} className={`flex-1 px-4 py-3 text-white rounded-lg font-bold flex justify-center items-center shadow-lg transition-all duration-300 ${saveStatus === 'saved' ? 'bg-green-500' : saveStatus === 'saving' ? 'bg-cyan-400' : 'bg-cyan-600'}`}>{saveStatus === 'saved' ? "Saved!" : saveStatus === 'saving' ? 'Saving...' : t.save}</button>
      </div>
    </div>
  );
};

const SettingsPanel = ({ config, setConfig, t }) => {
    const [editConfig, setEditConfig] = useState({ ...config });
    const [saveStatus, setSaveStatus] = useState('idle');
    const [newPass, setNewPass] = useState('');
    const [newPin, setNewPin] = useState('');
    useEffect(() => { setEditConfig({...config}) }, [config]);
    const saveSettings = async () => {
        setSaveStatus('saving');
        const finalConfig = { ...editConfig, discountPercent: parseFloat(editConfig.discountPercent) || 0, adminPassword: newPass ? newPass : editConfig.adminPassword, recoveryPin: newPin ? newPin : editConfig.recoveryPin };
        await db.setDoc({id: 'config'}, finalConfig); setConfig(finalConfig); setNewPass(''); setNewPin('');
        setTimeout(() => setSaveStatus('saved'), 600); setTimeout(() => setSaveStatus('idle'), 2000);
    };
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800"><Settings className="w-5 h-5 mr-2"/> {t.genSettings}</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                 <label className="block text-sm font-bold text-green-800 mb-1 flex items-center"><MessageCircle className="w-4 h-4 mr-2"/> {t.busPhone}</label>
                 <input value={editConfig.phone} onChange={(e) => setEditConfig({ ...editConfig, phone: e.target.value })} className="w-full p-3 border border-green-300 rounded-lg bg-white font-bold text-lg" placeholder="Ej: 16098287989" />
            </div>
            <div className="space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.disc} (%)</label><input type="number" value={editConfig.discountPercent} onChange={(e) => setEditConfig({ ...editConfig, discountPercent: e.target.value })} className="w-full p-3 border rounded-lg bg-gray-50" /></div>
              <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-100"><h4 className="font-bold text-purple-900 mb-4 flex items-center"><CreditCard className="w-5 h-5 mr-2"/> {t.zelleConf}</h4><input value={editConfig.zelleNumber || ''} onChange={(e) => setEditConfig({ ...editConfig, zelleNumber: e.target.value })} className="w-full p-3 border border-purple-200 rounded-lg bg-white" placeholder="Ej: user@email.com" /></div>
              <div className="p-5 bg-red-50 rounded-xl border-2 border-red-100"><h4 className="font-bold text-red-900 mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2"/> {t.securitySettings}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-red-700 mb-1">{t.changePass}</label><input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-3 border border-red-200 rounded-lg bg-white" placeholder="New Password" /><p className="text-[10px] text-gray-500 mt-1">Leave empty to keep current.</p></div><div><label className="block text-xs font-bold text-red-700 mb-1">{t.changePin}</label><input type="text" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full p-3 border border-red-200 rounded-lg bg-white" placeholder="New PIN (Recovery)" /><p className="text-[10px] text-gray-500 mt-1">Default is 0000.</p></div></div></div>
            </div>
            <button onClick={saveSettings} disabled={saveStatus !== 'idle'} className={`w-full py-4 rounded-xl font-bold mt-8 flex items-center justify-center shadow-lg transition-all duration-300 text-white ${saveStatus === 'saved' ? 'bg-green-600' : saveStatus === 'saving' ? 'bg-cyan-500' : 'bg-cyan-600'}`}>{saveStatus === 'saved' ? "Saved!" : saveStatus === 'saving' ? 'Saving...' : t.save}</button>
        </div>
    );
};

const AdminPanel = ({ user, setView, t, config, setConfig, services, setServices }) => {
  const [orders, setOrders] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [tab, setTab] = useState('orders');

  useEffect(() => { if (!user) return; const unsub = db.onSnapshot({id: 'orders_query'}, (snap) => setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))); return () => unsub(); }, [user]);

  const handleLogin = (e) => { e.preventDefault(); if (passwordInput === config.adminPassword) { setIsAuthenticated(true); } else { alert(t.wrongPin); } };
  const handleRecovery = (e) => { e.preventDefault(); if (recoveryInput === config.recoveryPin) { setIsAuthenticated(true); setIsRecoveryMode(false); alert("Recovered! Please change your password in Settings."); } else { alert(t.wrongRecPin); } };
  const updateStatus = async (orderId, newStatus) => { await db.updateDoc({id: orderId}, { status: newStatus }); setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o)); };
  const deleteOrder = async (orderId) => { if(window.confirm("Are you sure?")) { await db.deleteDoc({id: orderId}); setOrders(prev => prev.filter(o => o.id !== orderId)); } };
  const getWhatsApp = (order) => { const phone = (order.customer.phone || '').replace(/\D/g, ''); return `https://wa.me/${phone}`; };
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  if (!isAuthenticated) {
      if (isRecoveryMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full animate-fade-in">
                    <div className="bg-yellow-100 p-4 rounded-full inline-flex mb-4"><Key className="w-8 h-8 text-yellow-600" /></div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">{t.recoverTitle}</h2>
                    <p className="text-sm text-gray-500 mb-4">{t.recoverDesc}</p>
                    <form onSubmit={handleRecovery}>
                        <input type="password" value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} placeholder="PIN (0000)" className="w-full p-4 border-2 rounded-xl mb-4 text-center text-2xl outline-none focus:border-yellow-500" />
                        <button className="w-full bg-yellow-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-yellow-600 transition">{t.reset}</button>
                    </form>
                    <button onClick={() => setIsRecoveryMode(false)} className="mt-6 text-gray-500 font-bold flex items-center justify-center w-full hover:text-gray-800">{t.back}</button>
                </div>
            </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
            <div className="bg-cyan-100 p-4 rounded-full inline-flex mb-4"><Lock className="w-8 h-8 text-cyan-600" /></div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{t.login}</h2>
            <form onSubmit={handleLogin}>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" className="w-full p-4 border-2 rounded-xl mb-4 text-center text-2xl outline-none focus:border-cyan-500" />
                <button className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-cyan-700 transition">{t.enter}</button>
            </form>
            <div className="mt-4 flex justify-between items-center text-sm">
                <button onClick={() => setView('home')} className="text-gray-400 hover:text-gray-600 flex items-center"><ArrowLeft className="w-4 h-4 mr-1"/> {t.back}</button>
                <button onClick={() => setIsRecoveryMode(true)} className="text-cyan-600 font-bold hover:underline">{t.forgotPass}</button>
            </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <div className="bg-cyan-800 text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
          <h2 className="text-xl font-bold">{t.adminTitle}</h2>
          <button onClick={() => setView('home')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm flex items-center transition"><ArrowLeft className="w-4 h-4 mr-2"/> {t.back}</button>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('orders')} className={`px-6 py-3 rounded-xl font-bold transition flex items-center ${tab === 'orders' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>📦 {t.adminOrders} {orders.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{orders.length}</span>}</button>
          <button onClick={() => setTab('services')} className={`px-6 py-3 rounded-xl font-bold transition ${tab === 'services' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>🏷️ {t.adminServices}</button>
          <button onClick={() => setTab('settings')} className={`px-6 py-3 rounded-xl font-bold transition ${tab === 'settings' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>⚙️ {t.adminSettings}</button>
        </div>
        {tab === 'orders' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-500 text-white p-4 rounded-xl shadow-lg"><div className="text-blue-100 text-sm font-bold uppercase">{t.totalOrders}</div><div className="text-3xl font-black">{orders.length}</div></div>
                <div className="bg-green-500 text-white p-4 rounded-xl shadow-lg"><div className="text-green-100 text-sm font-bold uppercase">{t.totalRevenue}</div><div className="text-3xl font-black">${totalRevenue.toFixed(2)}</div></div>
            </div>
            <div className="grid gap-4">
              {orders.length === 0 && <div className="text-center text-gray-400 py-10">No pending orders.</div>}
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-lg text-xs font-bold text-gray-500">#{order.id}</div>
                  <div className="flex flex-col md:flex-row justify-between mb-4 mt-2">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{t.status[order.status] || order.status}</span>
                      <h3 className="font-bold text-xl mt-2">{order.customer.name}</h3>
                      <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      <div className="text-sm text-gray-700 mt-3 grid grid-cols-2 gap-2 max-w-md">
                          <div className="bg-blue-50 p-2 rounded border border-blue-100"><p className="text-xs text-blue-800 font-bold uppercase mb-1">Pickup</p><p>{order.details?.pickupDate}</p><p>{order.details?.pickupTime}</p></div>
                          <div className="bg-green-50 p-2 rounded border border-green-100"><p className="text-xs text-green-800 font-bold uppercase mb-1">Delivery</p><p>{order.details?.deliveryDate}</p><p>{order.details?.deliveryTime}</p></div>
                      </div>
                    </div>
                    <div className="text-right mt-4 md:mt-0 flex flex-col justify-between items-end">
                      <p className="text-3xl font-bold text-cyan-600">${order.total?.toFixed(2)}</p>
                      <div className="flex gap-2 mt-2">
                          <a href={getWhatsApp(order)} target="_blank" rel="noreferrer" className="inline-flex items-center text-green-600 font-bold text-sm bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100"><MessageCircle className="w-4 h-4 mr-2"/> Chat Customer</a>
                          <button onClick={() => deleteOrder(order.id)} className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"><Trash2 className="w-5 h-5"/></button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded mb-4 text-sm border">{Object.entries(order.items || {}).map(([k, v]) => (<span key={k} className="mr-3 bg-white border px-2 py-1 rounded inline-block mb-1 font-bold">{v}x {k}</span>))}</div>
                  <div className="flex gap-2 overflow-x-auto pb-2">{['confirmed', 'cleaning', 'delivering', 'completed'].map((st) => (<button key={st} onClick={() => updateStatus(order.id, st)} disabled={order.status === st} className={`px-4 py-2 rounded text-sm font-bold border transition ${order.status === st ? 'bg-cyan-600 text-white' : 'bg-white hover:bg-gray-50'}`}>{t.status[st] || st}</button>))}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'services' && <ServiceEditor services={services} setServices={setServices} t={t} />}
        {tab === 'settings' && <SettingsPanel config={config} setConfig={setConfig} t={t} />}
      </div>
    </div>
  );
};

// ---------- APP PRINCIPAL ----------

export default function App() {
  useTailwind();
  
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [lang, setLang] = useState('en');
  const [cart, setCart] = useState({});
  const [allergies, setAllergies] = useState([]);
  const [aroma, setAroma] = useState('Fresh');
  const [isExpress, setIsExpress] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    pickupDate: '', pickupTime: TIME_SLOTS[0],
    deliveryDate: '', deliveryTime: TIME_SLOTS[0],
    paymentMethod: 'cash',
  });

  const [config, setConfig] = useState({
    phone: '6098287989',
    discountPercent: 5,
    zelleNumber: '',
    zelleMessage: '',
    adminPassword: '1234',
    recoveryPin: '0000'
  });

  const [services, setServices] = useState(INITIAL_SERVICES);
  const t = LANGUAGES[lang] || LANGUAGES.en;

  useEffect(() => {
    auth.signInAnonymously().catch(console.error);
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    const unsubConfig = db.onSnapshot({id: 'config'}, (snap) => { if (snap.exists()) { const data = snap.data(); setConfig(prev => ({...prev, ...data})); } });
    const unsubServices = db.onSnapshot({id: 'services'}, (snap) => { if (snap.exists() && snap.data().list) setServices(snap.data().list); });
    return () => { unsubAuth(); unsubConfig(); unsubServices(); };
  }, []);

  const updateCart = (id, delta) => setCart((prev) => { const val = (prev[id] || 0) + delta; if (val <= 0) { const copy = { ...prev }; delete copy[id]; return copy; } return { ...prev, [id]: val }; });
  const getTotal = () => { let sum = Object.entries(cart).reduce((acc, [id, qty]) => { const s = services.find((x) => x.id === id); return acc + ((s?.price || 0) * qty); }, 0); if (isExpress) sum *= 1.2; if (isMember) sum *= 1 - config.discountPercent / 100; return sum; };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!user) return;
    let orderData = { customer: { name: form.name, phone: form.phone, address: form.address, uid: user.uid }, details: { ...form, zelleNumberUsed: config.zelleNumber }, items: cart, allergies, aroma, express: isExpress, isMember, total: getTotal(), status: 'pending', createdAt: Date.now(), };
    const ref = await db.addDoc({id: 'orders_query'}, orderData);
    orderData.id = ref.id;
    setLastOrder(orderData); 
    setCart({});
    setView('success');
  };

  const getOwnerWhatsApp = () => { if (!lastOrder) return "#"; const cleanPhone = config.phone.replace(/\D/g,''); const itemsList = Object.entries(lastOrder.items).map(([k,v]) => `${v}x ${k}`).join(', '); const msg = `👋 *NEW ORDER ${lastOrder.id}* \n\n👤 ${lastOrder.customer.name}\n📍 ${lastOrder.customer.address}\n\n🧺 *Items:* ${itemsList}\n💰 *Total:* $${lastOrder.total?.toFixed(2)}\n\n📅 *PICKUP:* ${lastOrder.details.pickupDate} @ ${lastOrder.details.pickupTime}\n📅 *DELIVERY:* ${lastOrder.details.deliveryDate} @ ${lastOrder.details.deliveryTime}`; return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`; };

  if (view === 'admin') return <AdminPanel user={user} setView={setView} t={t} config={config} setConfig={setConfig} services={services} setServices={setServices} />;

  if (view === 'success')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-cyan-50 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full animate-fade-in">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-black text-gray-800 mb-2">{t.successMsg}</h1>
          <p className="text-gray-500 mb-6">{t.successSub}</p>
          <div className="bg-gray-100 p-4 rounded-xl mb-8 border-2 border-dashed border-gray-300"><p className="text-sm text-gray-500 uppercase font-bold">{t.orderNumberIs}</p><p className="text-3xl font-mono font-black text-cyan-600">{lastOrder?.id}</p></div>
          <a href={getOwnerWhatsApp()} target="_blank" rel="noreferrer" className="w-full bg-green-500 text-white py-5 px-6 rounded-xl font-black text-xl shadow-xl hover:bg-green-600 transition flex items-center justify-center mb-4 transform hover:scale-105 animate-pulse border-4 border-green-200"><MessageCircle className="w-8 h-8 mr-3"/> {t.sendWhastapp}</a>
          <button onClick={() => setView('home')} className="w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center"><ArrowLeft className="w-5 h-5 mr-2"/> {t.back}</button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-gray-800">
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-cyan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
              {/* NUEVO LOGO CON IMAGEN DE FONDO */}
              <BrandLogo />
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-cyan-50 px-3 py-1 rounded-full text-cyan-800 mr-2 font-mono text-sm"><Phone className="h-4 w-4 mr-2" /> {config.phone}</div>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-gray-100 text-sm rounded-lg px-2 py-1 border-none outline-none cursor-pointer font-bold text-gray-700"><option value="en">🇺🇸 EN</option><option value="es">🇪🇸 ES</option><option value="fr">🇫🇷 FR</option><option value="hi">🇮🇳 HI</option></select>
              <button onClick={() => setView('cart')} className="relative p-3 text-gray-500 hover:text-cyan-600 transition"><ShoppingBag className="h-6 w-6" />{Object.values(cart).reduce((a, b) => a + b, 0) > 0 && (<span className="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm">{Object.values(cart).reduce((a, b) => a + b, 0)}</span>)}</button>
              <button onClick={() => setView('admin')} className="text-xs text-gray-400 hover:text-cyan-800"><Lock className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative h-[550px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-cyan-900/50 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4 tracking-tight leading-tight">{t.title}</h1>
          <p className="text-xl md:text-2xl text-cyan-50 font-light mb-10 italic max-w-3xl mx-auto leading-relaxed">"{t.heroSubtitle}"</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {/* BOTÓN ORIGINAL: SCROLL A SERVICIOS */}
            <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="group bg-white text-cyan-700 text-xl font-bold py-4 px-10 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <span className="mr-2">{t.orderNow}</span>
            </button>

            {/* NUEVO BOTÓN AL FRENTE: IR AL CARRITO/ORDENAR DIRECTO */}
            <button onClick={() => setView('cart')} className="group bg-cyan-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-2xl hover:scale-105 hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center border-2 border-white/30">
                <ShoppingBag className="w-6 h-6 mr-2" /> {t.sendOrder}
            </button>
          </div>
        </div>
        <div className="absolute top-10 right-10 bg-yellow-400 text-cyan-900 w-24 h-24 rounded-full flex items-center justify-center text-center font-bold text-xs shadow-xl border-4 border-white rotate-12 z-30 animate-pulse">{config.discountPercent}% OFF<br/>Member</div>
      </div>

      {view === 'home' && (
        <>
          <div id="services" className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12"><h2 className="text-3xl font-black text-gray-900">{t.services}</h2><div className="w-24 h-1.5 bg-cyan-500 mx-auto mt-4 rounded-full"></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group">
                  <div className="h-40 overflow-hidden relative bg-white flex items-center justify-center">
                      {s.type === 'component' && s.componentName === 'IronIcon' ? (
                        <IronIcon />
                      ) : (
                          <img src={s.image} alt={s.name_en} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" onError={(e) => {e.target.src='https://placehold.co/400?text=' + s.name_en}} />
                      )}
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-grow bg-white">
                    <div><h3 className="font-bold text-lg mb-1 leading-tight">{lang === 'es' ? s.name_es : lang === 'fr' ? s.name_fr : lang === 'hi' ? s.name_hi : s.name_en}</h3><p className="text-2xl font-bold text-cyan-600">${s.price?.toFixed(2)}</p></div>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl mt-4"><button onClick={() => updateCart(s.id, -1)} className="w-10 h-10 rounded-full bg-white shadow text-gray-400 hover:text-red-500 font-bold text-xl transition">-</button><span className="font-bold text-xl">{cart[s.id] || 0}</span><button onClick={() => updateCart(s.id, 1)} className="w-10 h-10 rounded-full bg-cyan-600 shadow text-white hover:bg-cyan-700 font-bold text-xl transition">+</button></div>
                  </div>
                </div>
              ))}
            </div>
            {/* ... (Resto de secciones) ... */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"><h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center"><Droplet className="w-6 h-6 text-purple-500 mr-2" /> {t.preferredAroma}</h3><div className="flex flex-wrap gap-3">{AROMAS.map((a) => (<button key={a.id} onClick={() => setAroma(a.id)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${aroma === a.id ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{lang === 'es' ? a.es : lang === 'fr' ? a.fr : lang === 'hi' ? a.hi : a.en}</button>))}</div></div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"><h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center"><AlertCircle className="w-6 h-6 text-red-500 mr-2" /> {t.productsToAvoid}</h3><div className="grid grid-cols-2 gap-3">{AVOID_PRODUCTS.map((p) => (<label key={p.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${allergies.includes(p.id) ? 'border-red-400 bg-red-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}><input type="checkbox" checked={allergies.includes(p.id)} onChange={() => setAllergies((x) => x.includes(p.id) ? x.filter((y) => y !== p.id) : [...x, p.id])} className="w-5 h-5 accent-red-500 mr-3" /><span className="text-sm font-medium text-gray-700">{lang === 'es' ? p.label_es : lang === 'fr' ? p.label_fr : lang === 'hi' ? p.label_hi : p.label_en}</span></label>))}</div></div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-32">
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${isExpress ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-gray-200 bg-white'}`}><input type="checkbox" checked={isExpress} onChange={() => setIsExpress(!isExpress)} className="w-6 h-6 accent-cyan-600 mr-4" /><div><span className="font-bold text-lg block text-gray-800">{t.express}</span><span className="text-sm text-cyan-700 font-bold">+20% {t.fee}</span></div></label>
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${isMember ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' : 'border-gray-200 bg-white'}`}><input type="checkbox" checked={isMember} onChange={() => setIsMember(!isMember)} className="w-6 h-6 accent-yellow-500 mr-4" /><div><span className="font-bold text-lg block text-gray-800">{t.member}</span><span className="text-sm text-yellow-600 font-bold">{config.discountPercent}% {t.off}</span></div><Star className="w-8 h-8 text-yellow-400 ml-4 fill-current" /></label>
            </div>
          </div>
          {Object.keys(cart).length > 0 && (<div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 animate-bounce-slow"><button onClick={() => setView('cart')} className="bg-gray-900 text-white w-full max-w-md py-4 px-8 rounded-full shadow-2xl flex justify-between items-center hover:scale-105 transition transform border-4 border-white/20 backdrop-blur-lg"><div className="flex items-center"><span className="bg-cyan-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-lg">{Object.values(cart).reduce((a, b) => a + b, 0)}</span><span className="font-bold text-lg">{t.orderNow}</span></div><span className="font-mono text-2xl font-black tracking-tight">${getTotal().toFixed(2)}</span></button></div>)}
        </>
      )}

      {view === 'cart' && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button onClick={() => setView('home')} className="mb-8 text-gray-500 font-bold hover:text-cyan-600 flex items-center transition bg-white px-4 py-2 rounded-lg shadow-sm"><ArrowLeft className="w-5 h-5 mr-2"/> {t.back}</button>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800"><ShoppingBag className="mr-3" /> {t.total}</h2>
            {Object.keys(cart).length === 0 ? <p className="text-gray-400 text-center py-4">Empty Cart</p> : (
              <div className="space-y-3">
                {Object.entries(cart).map(([id, q]) => { const s = services.find((x) => x.id === id); return (<div key={id} className="flex justify-between text-gray-700 border-b border-gray-50 pb-2"><span><span className="font-bold text-gray-900">{q}x</span> {lang === 'es' ? s.name_es : lang === 'fr' ? s.name_fr : lang === 'hi' ? s.name_hi : s.name_en}</span><span className="font-bold">${(s.price * q).toFixed(2)}</span></div>); })}
                {isExpress && <div className="flex justify-between text-cyan-600 font-bold pt-2"><span>Express (+20%)</span><span>+${(getTotal() - getTotal() / 1.2).toFixed(2)}</span></div>}
                {isMember && <div className="flex justify-between text-yellow-600 font-bold pt-2"><span>Member Discount (-{config.discountPercent}%)</span><span>-${(getTotal() * (config.discountPercent / 100)).toFixed(2)}</span></div>}
                <div className="flex justify-between items-center pt-6 mt-4 border-t-2 border-dashed border-gray-200"><span className="text-gray-500 font-bold">Total to Pay</span><span className="text-4xl font-black text-cyan-600">${getTotal().toFixed(2)}</span></div>
              </div>
            )}
          </div>

          {Object.keys(cart).length > 0 && (
            <form onSubmit={submitOrder} className="space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center"><User className="mr-2" /> {t.details}</h3>
              <div className="grid gap-4">
                <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border focus:bg-white focus:border-cyan-500 outline-none transition" />
                <div>
                   <label className="text-xs font-bold text-green-600 ml-1 mb-1 block">{t.whatsappLabel}</label>
                   <input required placeholder="WhatsApp Number" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-green-100 focus:bg-white focus:border-green-500 outline-none transition" />
                </div>
                <input required placeholder="Full Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border focus:bg-white focus:border-cyan-500 outline-none transition" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center uppercase tracking-wide"><Truck className="w-4 h-4 mr-2" /> {t.pickupInfo}</label>
                    <div className="space-y-2"><div><span className="text-xs text-blue-600 font-bold ml-1">{t.pickupDate}</span><input required type="date" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} className="w-full p-3 bg-white rounded-lg border border-blue-200 focus:border-blue-500" /></div><div><span className="text-xs text-blue-600 font-bold ml-1">{t.pickupTime}</span><select className="w-full p-3 bg-white rounded-lg border border-blue-200 focus:border-blue-500" value={form.pickupTime} onChange={(e) => setForm({...form, pickupTime: e.target.value})}>{TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}</select></div></div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
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

              <button className="w-full bg-gray-900 text-white py-5 rounded-xl font-bold text-xl shadow-xl hover:bg-black transition transform hover:scale-[1.02] flex items-center justify-center">
                {t.submit} <Send className="w-5 h-5 ml-2" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
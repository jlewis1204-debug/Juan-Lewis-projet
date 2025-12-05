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
} from "lucide-react";
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
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

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

let db, auth;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Error Firebase:", error);
}

// --- 2. UTILS ---
const useTailwind = () => {
  useEffect(() => {
    if (!document.querySelector("#tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
};

const useAppMode = (customIcon) => {
  useEffect(() => {
    if (!document.querySelector("#stripe-js")) {
      const script = document.createElement("script");
      script.id = "stripe-js";
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [customIcon]);
};

const generateShortId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// --- 3. DATOS ---
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
    alertTitle: "Schedule Updated!",
    alertMsg: "The laundry has updated the schedule for one of your orders.",
    btnUnderstood: "Understood",
    pickupDate: "Pickup Date",
    pickupTime: "Pickup Time",
    deliveryDate: "Delivery Date",
    deliveryTime: "Delivery Time",
    customerInfo: "Customer Info",
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
    alertTitle: "¡Horario Actualizado!",
    alertMsg: "La lavandería ha actualizado el horario de una de tus órdenes.",
    btnUnderstood: "Entendido",
    pickupDate: "Fecha de Recogida",
    pickupTime: "Hora de Recogida",
    deliveryDate: "Fecha de Entrega",
    deliveryTime: "Hora de Entrega",
    customerInfo: "Info del Cliente",
  },
  fr: {
    title: "Fast Wave Pressing",
    heroSubtitle: "Vêtements frais, livrés à votre porte!",
    orderNow: "Commencer",
    sendOrder: "Envoyer",
    services: "Nos Services",
    productsToAvoid: "Allergies / Éviter",
    preferredAroma: "Parfum",
    details: "Détails de la commande",
    pickupInfo: "Info Retrait",
    deliveryInfo: "Info Livraison",
    payment: "Méthode de paiement",
    total: "Total",
    submit: "Confirmer",
    status: {
      pending: "En attente",
      confirmed: "Confirmé",
      picked_up: "Ramassé",
      cleaning: "Lavage",
      delivering: "En livraison",
      completed: "Terminé",
    },
    express: "Lavage Express",
    member: "Je suis Membre",
    successMsg: "Commande Reçue!",
    successSub: "Pour confirmer, envoyez les détails par WhatsApp ou SMS.",
    orderNumberIs: "Commande #",
    back: "Retour",
    adminTitle: "Tableau de bord",
    adminOrders: "Commandes",
    adminServices: "Services",
    adminSettings: "Paramètres",
    deleteOrder: "Supprimer",
    editServices: "Modifier Services",
    genSettings: "Paramètres Généraux",
    save: "Sauvegarder",
    login: "Connexion Admin",
    enter: "Entrer",
    wrongPin: "Identifiants incorrects",
    payCashLabel: "Espèces",
    payCardLabel: "Carte Crédit/Débit",
    payOnlineLabel: "Payer en ligne",
    nameLabel: "Nom complet",
    phoneLabel: "Téléphone",
    addressLabel: "Adresse",
    emptyCart: "Votre panier est vide",
    usernameLabel: "Utilisateur",
    passwordLabel: "Mot de passe",
    trackOrder: "Suivre commande",
    yourOrders: "Vos commandes",
    joinMemberTitle: "Devenir Membre?",
    joinYes: "Oui, Rejoindre",
    joinNo: "Non, Continuer",
    rejoinTitle: "Réactiver Membre",
    rejoinYes: "Payer et Réactiver",
    qrCode: "Code QR App",
    shareApp: "Partager",
    copyLink: "Copier Lien",
    paymentSuccess: "Paiement Réussi",
    alertTitle: "Horaire Mis à Jour!",
    alertMsg: "La laverie a mis à jour l'horaire.",
    btnUnderstood: "Compris",
    pickupDate: "Date Retrait",
    pickupTime: "Heure Retrait",
    deliveryDate: "Date Livraison",
    deliveryTime: "Heure Livraison",
    customerInfo: "Info Client",
  },
  hi: {
    title: "फास्ट वेव लॉन्ड्री",
    heroSubtitle: "ताजे कपड़े, सीधे आपके दरवाजे पर!",
    orderNow: "धुलाई शुरू करें",
    sendOrder: "ऑर्डर भेजें",
    services: "हमारी सेवाएँ",
    productsToAvoid: "एलर्जी / बचें",
    preferredAroma: "सुगंध चयन",
    details: "ऑर्डर विवरण",
    pickupInfo: "पिकअप जानकारी",
    deliveryInfo: "डिलीवरी जानकारी",
    payment: "भुगतान का तरीका",
    total: "कुल",
    submit: "ऑर्डर की समीक्षा",
    status: {
      pending: "लंबित",
      confirmed: "पुष्टि",
      picked_up: "पिक अप",
      cleaning: "धुलाई",
      delivering: "वितरण",
      completed: "पूर्ण",
    },
    express: "एक्सप्रेस धुलाई",
    member: "मैं सदस्य हूँ",
    successMsg: "ऑर्डर प्राप्त हुआ!",
    successSub: "पुष्टि के लिए, कृपया व्हाट्सएप या एसएमएस भेजें।",
    orderNumberIs: "ऑर्डर #",
    back: "वापस",
    adminTitle: "एडमिन डैशबोर्ड",
    adminOrders: "ऑर्डर",
    adminServices: "सेवाएँ",
    adminSettings: "सेटिंग्स",
    deleteOrder: "ऑर्डर हटाएं",
    editServices: "सेवाएँ संपादित करें",
    genSettings: "सामान्य सेटिंग्स",
    save: "सहेजें",
    login: "एडमिन लॉगिन",
    enter: "प्रवेश",
    wrongPin: "गलत क्रेडेंशियल्स",
    payCashLabel: "नकद भुगतान",
    payCardLabel: "क्रेडिट/डेबिट कार्ड",
    payOnlineLabel: "ऑनलाइन भुगतान",
    nameLabel: "पूरा नाम",
    phoneLabel: "फ़ोन नंबर",
    addressLabel: "पता",
    emptyCart: "आपकी गाड़ी खाली है",
    usernameLabel: "उपयोगकर्ता",
    passwordLabel: "पासवर्ड",
    trackOrder: "ऑर्डर ट्रैक करें",
    yourOrders: "आपके ऑर्डर",
    joinMemberTitle: "सदस्य बनें?",
    joinYes: "हाँ, जुड़ें और बचाएं",
    joinNo: "नहीं, जारी रखें",
    rejoinTitle: "सदस्यता पुन: सक्रिय करें",
    rejoinYes: "शुल्क दें और जुड़ें",
    qrCode: "ऐप क्यूआर कोड",
    shareApp: "शेयर ऐप",
    copyLink: "लिंक कॉपी करें",
    paymentSuccess: "भुगतान सफल",
    alertTitle: "समय सारिणी अपडेट!",
    alertMsg: "लॉन्ड्री ने आपके ऑर्डर का समय अपडेट किया है।",
    btnUnderstood: "समझ गया",
    pickupDate: "पिकअप तिथि",
    pickupTime: "पिकअप समय",
    deliveryDate: "डिलीवरी तिथि",
    deliveryTime: "डिलीवरी समय",
    customerInfo: "ग्राहक जानकारी",
  },
};

// --- ICONOS ---
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
const BrandLogo = ({ customIcon }) => (
  <div className="relative flex items-center justify-center px-5 py-2 overflow-hidden rounded-full border-2 border-cyan-100 shadow-sm group hover:shadow-md transition-all cursor-pointer bg-white">
    <div className="relative z-10 flex items-center">
      {customIcon && (
        <img
          src={customIcon}
          alt="Icon"
          className="w-6 h-6 mr-2 object-contain rounded-full"
        />
      )}
      <div className="flex flex-col items-center">
        <span className="font-black text-xl text-cyan-900 leading-none tracking-tight">
          Fast Wave
        </span>
        <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-widest">
          Laundry Service
        </span>
      </div>
    </div>
  </div>
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
const CustomReceiptIcon = ({ className }) => (
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
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"></path>
    <line x1="16" y1="8" x2="8" y2="8"></line>
    <line x1="16" y1="12" x2="8" y2="12"></line>
    <line x1="16" y1="16" x2="8" y2="16"></line>
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
const CustomInfoIcon = ({ className }) => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- HELPERS ---
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
  if (!pd || !dd) return null;
  const start = new Date(`${pd}T${pt.split(" ")[0]}`);
  const end = new Date(`${dd}T${dt.split(" ")[0]}`);
  if (start < new Date().setHours(0, 0, 0, 0)) return "errorPastDate";
  if (end <= start) return "errorDeliveryOrder";
  return null;
};

// --- HELPER SUBIDA DE IMAGEN ---
const handleImageUpload = (e, callback) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  }
};

// --- ADMIN COMPONENTS ---
const ServiceEditor = ({ services, setServices, t }) => {
  const [newService, setNewService] = useState({
    id: "",
    name_en: "",
    name_es: "",
    name_fr: "",
    name_hi: "",
    price: 0,
    image: "",
  });
  const handleServiceChange = (id, field, value) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setServices(updated);
  };
  const handleDeleteService = (id) => {
    if (window.confirm("Delete?")) {
      setServices(services.filter((s) => s.id !== id));
    }
  };
  const handleAddService = () => {
    if (!newService.id) return alert("ID required");
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
      alert("Saved!");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-cyan-900 flex items-center">
          <Edit2 className="w-6 h-6 mr-2" /> {t.editServices}
        </h3>
        <button
          onClick={saveServices}
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
            <div className="col-span-12 md:col-span-1 flex justify-center">
              <label className="cursor-pointer relative">
                <img
                  src={s.image || "https://via.placeholder.com/60"}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100 shadow-sm hover:opacity-70"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(e, (url) =>
                      handleServiceChange(s.id, "image", url)
                    )
                  }
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 rounded-lg">
                  <Camera className="text-white w-6 h-6" />
                </div>
              </label>
            </div>
            <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                className="p-2 border rounded text-sm"
                placeholder="Spanish"
                value={s.name_es}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_es", e.target.value)
                }
              />
              <input
                className="p-2 border rounded text-sm"
                placeholder="English"
                value={s.name_en}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_en", e.target.value)
                }
              />
              <input
                className="p-2 border rounded text-sm"
                placeholder="French"
                value={s.name_fr || ""}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_fr", e.target.value)
                }
              />
              <input
                className="p-2 border rounded text-sm"
                placeholder="Hindi"
                value={s.name_hi || ""}
                onChange={(e) =>
                  handleServiceChange(s.id, "name_hi", e.target.value)
                }
              />
            </div>
            <div className="col-span-12 md:col-span-2 flex flex-col gap-2">
              <div className="relative">
                <span className="absolute left-3 top-2 text-green-600 font-bold">
                  $
                </span>
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
                />
              </div>
            </div>
            <button
              onClick={() => handleDeleteService(s.id)}
              className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 flex flex-col gap-4">
          <p className="font-bold text-gray-500 text-sm">Add New Service</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <input
              className="p-2 border rounded"
              placeholder="ID"
              value={newService.id}
              onChange={(e) =>
                setNewService({ ...newService, id: e.target.value })
              }
            />
            <input
              className="p-2 border rounded"
              placeholder="ES"
              value={newService.name_es}
              onChange={(e) =>
                setNewService({ ...newService, name_es: e.target.value })
              }
            />
            <input
              className="p-2 border rounded"
              placeholder="EN"
              value={newService.name_en}
              onChange={(e) =>
                setNewService({ ...newService, name_en: e.target.value })
              }
            />
            <input
              className="p-2 border rounded"
              placeholder="FR"
              value={newService.name_fr}
              onChange={(e) =>
                setNewService({ ...newService, name_fr: e.target.value })
              }
            />
            <input
              className="p-2 border rounded"
              placeholder="HI"
              value={newService.name_hi}
              onChange={(e) =>
                setNewService({ ...newService, name_hi: e.target.value })
              }
            />
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
            />
          </div>
          <button
            onClick={handleAddService}
            className="bg-gray-800 text-white py-2 rounded font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({ config, setConfig, t }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [membersList, setMembersList] = useState([]);
  const [newMemberPhone, setNewMemberPhone] = useState("");
  useEffect(() => {
    setLocalConfig(config);
    if (db) {
      onSnapshot(doc(db, "settings", "members"), (doc) => {
        if (doc.exists()) setMembersList(doc.data().list || []);
      });
    }
  }, [config]);
  const handleSave = async () => {
    if (db) {
      await setDoc(doc(db, "settings", "general"), localConfig, {
        merge: true,
      });
      setConfig(localConfig);
      alert("Saved!");
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
    }
  };
  const removeMember = async (phone) => {
    if (db && window.confirm(`Remove ${phone}?`)) {
      await updateDoc(doc(db, "settings", "members"), {
        list: arrayRemove(phone),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-gray-800">General Settings</h3>
        <button
          onClick={handleSave}
          className="bg-cyan-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center"
        >
          <Save className="w-5 h-5 mr-2" /> Save Changes
        </button>
      </div>
      <div className="space-y-6">
        <div className="bg-green-50 border-2 border-green-100 p-6 rounded-2xl">
          <label className="flex items-center text-green-800 font-bold mb-2">
            <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Number
          </label>
          <input
            className="w-full text-2xl font-black p-4 rounded-xl border-2 border-green-200 text-gray-800 focus:border-green-500 outline-none"
            value={localConfig.phone || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, phone: e.target.value })
            }
          />
        </div>
        <div className="bg-cyan-50 border-2 border-cyan-100 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border overflow-hidden">
            {localConfig.customIcon ? (
              <img
                src={localConfig.customIcon}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <label className="block text-cyan-900 font-bold mb-1">
              Custom App Icon
            </label>
            <div className="flex gap-2">
              <label className="cursor-pointer bg-cyan-200 text-cyan-800 px-4 py-2 rounded-xl font-bold text-xs hover:bg-cyan-300 transition">
                Choose File
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Discount (Member %)
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
          </div>
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Express Fee (%)
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
          </div>
          <div className="bg-white p-4 rounded-2xl border shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Tax (%)
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
          </div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl">
          <label className="flex items-center text-blue-900 font-bold mb-3">
            <CreditCard className="w-5 h-5 mr-2" /> Payment Gateway (Stripe)
          </label>
          <div className="bg-white p-4 rounded-xl border border-blue-200">
            <label className="block text-xs font-bold text-blue-400 mb-1 uppercase">
              Publishable API Key
            </label>
            <input
              className="w-full p-2 font-mono text-sm bg-transparent outline-none text-gray-700"
              value={localConfig.stripePublicKey || ""}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  stripePublicKey: e.target.value,
                })
              }
              placeholder="pk_live_..."
            />
          </div>
          <p className="text-xs text-blue-400 mt-2 ml-1">
            Enter your Stripe Public Key to enable real card processing.
          </p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-100 p-6 rounded-2xl">
          <label className="flex items-center text-purple-900 font-bold mb-3">
            <ExternalLink className="w-5 h-5 mr-2" /> Zelle Configuration
          </label>
          <input
            className="w-full p-3 mb-3 rounded-xl border border-purple-200 font-bold text-lg"
            value={localConfig.zelleNumber || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, zelleNumber: e.target.value })
            }
            placeholder="Zelle Number/Email"
          />
          <textarea
            className="w-full p-3 rounded-xl border border-purple-200 text-sm h-20"
            value={localConfig.zelleMessage || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, zelleMessage: e.target.value })
            }
            placeholder="Payment Instructions..."
          />
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-100 p-6 rounded-2xl">
          <h4 className="font-bold text-yellow-800 flex items-center mb-4">
            <Star className="w-5 h-5 mr-2" /> Membership Rules
          </h4>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-yellow-700">
                Min Visits
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
            </div>
            <div>
              <label className="text-xs font-bold text-yellow-700">
                Rejoin Fee ($)
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
            </div>
            <div>
              <label className="text-xs font-bold text-yellow-700">
                Penalty
              </label>
              <input
                className="w-full p-2 rounded border-yellow-200 border"
                value={localConfig.rejoinDuration || "2 months"}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    rejoinDuration: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            <h5 className="font-bold text-gray-700 mb-3 text-sm">
              Manage Members ({membersList.length})
            </h5>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 p-2 border rounded-lg bg-gray-50"
                placeholder="Phone Number"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
              />
              <button
                onClick={addMember}
                className="bg-yellow-500 text-white font-bold px-4 rounded-lg shadow-sm hover:bg-yellow-600"
              >
                Add Member
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {membersList.map((m) => (
                <div
                  key={m}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0"
                >
                  <span className="font-mono text-sm text-gray-600">{m}</span>
                  <button
                    onClick={() => removeMember(m)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl">
          <h4 className="font-bold text-red-800 flex items-center mb-4">
            <ShieldCheck className="w-5 h-5 mr-2" /> Security Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-red-700">
                Change Admin Username
              </label>
              <input
                className="w-full p-3 rounded-xl border border-red-200"
                value={localConfig.adminUsername || ""}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    adminUsername: e.target.value,
                  })
                }
                placeholder="New Username"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-red-700">
                Change Admin Password
              </label>
              <input
                className="w-full p-3 rounded-xl border border-red-200"
                value={localConfig.adminPassword || ""}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    adminPassword: e.target.value,
                  })
                }
                placeholder="New Password"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-red-700">
                Change Recovery PIN
              </label>
              <input
                className="w-full p-3 rounded-xl border border-red-200"
                value={localConfig.recoveryPin || ""}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    recoveryPin: e.target.value,
                  })
                }
                placeholder="New PIN (Default 0000)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN VIEW (CON CHAT REAL) ---
const AdminView = ({
  t,
  config,
  setConfig,
  services,
  setServices,
  setView,
  lang,
}) => {
  const [authInput, setAuthInput] = useState({ user: "", pass: "" });
  const [isAuth, setIsAuth] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminShareData, setAdminShareData] = useState(null);

  // CHAT STATE
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!isAuth) return;
    let unsub = () => {};
    if (db) {
      unsub = onSnapshot(collection(db, "orders"), (snap) => {
        setOrders(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      });
    }
    return () => unsub();
  }, [isAuth]);

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
      alert(t.wrongPin);
    }
  };

  const updateOrderStatus = async (id, status) => {
    if (db) await updateDoc(doc(db, "orders", id), { status });
  };
  const deleteOrder = async (id) => {
    if (window.confirm(t.deleteOrder + "?")) {
      if (db) await deleteDoc(doc(db, "orders", id));
    }
  };

  const sendChatMessage = async (orderId, currentMessages = []) => {
    if (!chatInput.trim() || !db) return;
    const newMessage = {
      text: chatInput,
      sender: "admin",
      date: new Date().toISOString(),
    };
    const updatedMessages = [...(currentMessages || []), newMessage];
    await updateDoc(doc(db, "orders", orderId), { chat: updatedMessages });
    setChatInput("");
  };

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
  const getServiceName = (s) => (s ? s[`name_${lang}`] || s.name_en : "");

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm">
          <h2 className="text-2xl font-black text-center text-gray-800 mb-6">
            {t.login}
          </h2>
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
          </form>
          <button
            onClick={() => setView("home")}
            className="mt-4 text-sm text-gray-400 w-full text-center"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const search = searchTerm.toLowerCase();
    return (
      o.customer.name.toLowerCase().includes(search) ||
      o.customer.phone.includes(search) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(search))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <h2 className="font-black text-xl text-cyan-900 flex items-center">
          <BrandLogo customIcon={config.customIcon} />{" "}
          <span className="ml-3 hidden md:inline text-gray-400">| Admin</span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setView("home")}
            className="text-sm font-bold text-gray-500"
          >
            {t.back}
          </button>
          <button
            onClick={() => setIsAuth(false)}
            className="text-sm font-bold text-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setTab("orders")}
            className={`px-6 py-2 rounded-full font-bold transition ${
              tab === "orders"
                ? "bg-cyan-900 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {t.adminOrders}
          </button>
          <button
            onClick={() => setTab("services")}
            className={`px-6 py-2 rounded-full font-bold transition ${
              tab === "services"
                ? "bg-cyan-900 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {t.adminServices}
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`px-6 py-2 rounded-full font-bold transition ${
              tab === "settings"
                ? "bg-cyan-900 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {t.adminSettings}
          </button>
        </div>

        {tab === "orders" && (
          <div className="space-y-4">
            <div className="relative mb-4">
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
                    className="flex items-center gap-3 mt-2 md:mt-0"
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
                      className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-gray-100 rounded-full transition"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
                      title="Print"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteOrder(o.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      title="Delete"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="font-bold text-gray-800 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-cyan-600" />{" "}
                          CLIENTE
                        </p>
                        <p className="mb-1">
                          <span className="font-bold">Tel:</span>{" "}
                          <a
                            href={`tel:${o.customer.phone}`}
                            className="text-cyan-600 hover:underline"
                          >
                            {o.customer.phone}
                          </a>
                        </p>
                        <p className="mb-2">
                          <span className="font-bold">Dir:</span>{" "}
                          {o.customer.address}
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            o.customer.address
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-600 text-xs font-bold flex items-center hover:underline"
                        >
                          <MapPin className="w-3 h-3 mr-1" /> Ver en Mapa
                        </a>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="font-bold text-gray-800 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-cyan-600" />{" "}
                          HORARIO
                        </p>
                        <div className="mb-2">
                          <span className="block text-xs text-gray-400 font-bold uppercase">
                            Recogida
                          </span>
                          <span className="font-bold text-gray-700">
                            {o.details.pickupDate}
                          </span>{" "}
                          <span className="text-gray-500">
                            ({o.details.pickupTime})
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-400 font-bold uppercase">
                            Entrega
                          </span>
                          <span className="font-bold text-gray-700">
                            {o.details.deliveryDate}
                          </span>{" "}
                          <span className="text-gray-500">
                            ({o.details.deliveryTime})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between font-bold text-xs text-gray-500 uppercase">
                        <span>Item</span>
                        <span>Total</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {o.items &&
                          Object.entries(o.items).map(([k, v]) => {
                            const s = services.find((x) => x.id === k);
                            const name = s ? s[`name_${lang}`] || s.name_en : k;
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
                      </div>
                      <div className="bg-gray-50 p-4 border-t border-gray-100">
                        <div className="space-y-1 text-sm text-gray-600">
                          {(o.express || o.isMember) && (
                            <div className="flex justify-between text-gray-500">
                              <span>Subtotal</span>
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
                              <span>Express Fee</span>
                              <span>
                                +${(o.expressFeeAmount || 0).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {o.isMember && (
                            <div className="flex justify-between text-yellow-600">
                              <span>Member Discount</span>
                              <span>
                                -${(o.discountAmount || 0).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-800 text-lg">
                              TOTAL
                            </span>
                            <span className="font-black text-2xl text-cyan-700">
                              ${o.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                o.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {o.details.paymentMethod} - {o.paymentStatus}
                            </span>
                          </div>
                        </div>
                        {(o.aroma || o.allergies?.length > 0) && (
                          <div className="mt-4 pt-3 border-t border-gray-200 text-xs">
                            {o.aroma && (
                              <div className="flex gap-2 mb-1">
                                <span className="font-bold text-purple-600 bg-purple-50 px-2 rounded">
                                  Aroma: {o.aroma}
                                </span>
                              </div>
                            )}
                            {o.allergies?.length > 0 && (
                              <div className="flex gap-2">
                                <span className="font-bold text-red-600 bg-red-50 px-2 rounded">
                                  Alergias: {o.allergies.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CHAT DEL ADMIN */}
                        <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                            Mensajes
                          </h4>
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
                                No messages yet.
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              className="flex-1 border rounded px-2 text-xs"
                              placeholder="Escribe una respuesta..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                sendChatMessage(o.id, o.chat)
                              }
                            />
                            <button
                              onClick={() => sendChatMessage(o.id, o.chat)}
                              className="bg-blue-600 text-white p-2 rounded"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "services" && (
          <ServiceEditor services={services} setServices={setServices} t={t} />
        )}
        {tab === "settings" && (
          <SettingsPanel config={config} setConfig={setConfig} t={t} />
        )}
      </div>

      {/* MODAL COMPARTIR ADMIN */}
      {adminShareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setAdminShareData(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              X
            </button>
            <h3 className="font-black text-xl mb-4 text-gray-800">
              Enviar al Cliente
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

// --- APP COMPONENT (CLIENTE) ---
export default function FastWaveApp() {
  const [view, setView] = useState("home");
  const [cart, setCart] = useState({});
  const [isExpress, setIsExpress] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [lang, setLang] = useState("en");
  const [allergies, setAllergies] = useState([]);
  const [aroma, setAroma] = useState("Fresh");

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

  const [formErrors, setFormErrors] = useState({});
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [config, setConfig] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemAddedMsg, setItemAddedMsg] = useState(null);
  const [myOrders, setMyOrders] = useState([]);

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
  const [scheduleUpdateAlert, setScheduleUpdateAlert] = useState(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [pendingMethod, setPendingMethod] = useState(null);

  const [stripeObj, setStripeObj] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [cardHolderName, setCardHolderName] = useState("");

  // CHAT CLIENTE
  const [chatInput, setChatInput] = useState("");

  useTailwind();
  useAppMode(config.customIcon);
  const t = LANGUAGES[lang];

  useEffect(() => {
    localStorage.setItem("fw_name", form.name);
  }, [form.name]);
  useEffect(() => {
    localStorage.setItem("fw_phone", form.phone);
  }, [form.phone]);

  useEffect(() => {
    if (db) {
      const unsubConfig = onSnapshot(doc(db, "settings", "general"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setConfig(data);
          if (data.stripePublicKey && window.Stripe)
            setStripeObj(window.Stripe(data.stripePublicKey));
        }
      });
      const unsubServices = onSnapshot(
        doc(db, "settings", "services"),
        (snap) => {
          if (snap.exists()) setServices(snap.data().list);
        }
      );
      const unsubMembers = onSnapshot(
        doc(db, "settings", "members"),
        (snap) => {
          if (snap.exists()) {
            setMembers(snap.data().list || []);
            setPastMembers(snap.data().history || []);
          }
        }
      );
      return () => {
        unsubConfig();
        unsubServices();
        unsubMembers();
      };
    }
  }, []);

  useEffect(() => {
    if (
      isProcessingPayment &&
      form.paymentMethod === "card" &&
      stripeObj &&
      !paymentSuccess
    ) {
      const timer = setTimeout(() => {
        const mountPoint = document.getElementById("card-element");
        if (mountPoint && !mountPoint.hasChildNodes()) {
          const elements = stripeObj.elements();
          const card = elements.create("card", {
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#fa755a", iconColor: "#fa755a" },
            },
            hidePostalCode: true,
          });
          card.mount("#card-element");
          setCardElement(card);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProcessingPayment, form.paymentMethod, stripeObj, paymentSuccess]);

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
        const upd = list.find((o) => o.scheduleUpdatedByAdmin === true);
        if (upd) setScheduleUpdateAlert(upd);
      });
      return () => unsub();
    } else {
      setMyOrders([]);
    }
  }, [lastOrder]);

  const getServiceName = (s) => (s ? s[`name_${lang}`] || s.name_en : "");
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
  const cartTotals = calculateTotals();
  const potentialSavings =
    (cartTotals.subtotal + cartTotals.expressFee) *
    ((config.discountPercent || 10) / 100);

  const handleHomeMemberClick = () => {
    if (isMember) {
      setShowCancelMemberModal(true);
    } else {
      setShowHomeJoinModal(true);
    }
  };
  const joinFromHome = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert(
        lang === "es"
          ? "Nombre y teléfono requeridos."
          : "Name and phone required."
      );
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
    alert(lang === "es" ? "Membresía cancelada." : "Membership cancelled.");
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
  const handleJoinAndContinue = () => {
    joinMembershipFromCheckout();
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
      alert(
        lang === "es"
          ? "Por favor completa tu información personal."
          : "Please fill in customer details."
      );
      return;
    }
    if (!isMember && !pastMembers.includes(form.phone.trim())) {
      const discount =
        (cartTotals.subtotal + cartTotals.expressFee) *
        ((config.discountPercent || 10) / 100);
      setSavingsAmount(discount);
      setShowMemberModal(true);
      return;
    } else if (!isMember && pastMembers.includes(form.phone.trim())) {
      setShowRejoinModal(true);
      return;
    }
    openPaymentModal(method);
  };
  const openPaymentModal = (method) => {
    setIsProcessingPayment(true);
  };

  const handlePayNow = async () => {
    if (form.paymentMethod === "cash" || form.paymentMethod === "online") {
      setIsLoadingPayment(true);
      setTimeout(() => {
        setIsLoadingPayment(false);
        setPaymentSuccess(true);
      }, 1000);
      return;
    }
    if (form.paymentMethod === "card") {
      if (!stripeObj || !cardElement) {
        alert(
          lang === "es" ? "Error: Stripe no listo." : "Error: Stripe not ready."
        );
        return;
      }
      setIsLoadingPayment(true);
      const { token, error } = await stripeObj.createToken(cardElement, {
        name: cardHolderName || form.name,
      });
      if (error) {
        setIsLoadingPayment(false);
        alert(
          (lang === "es" ? "PAGO RECHAZADO: " : "PAYMENT DECLINED: ") +
            error.message
        );
        if (cardElement) cardElement.clear();
      } else {
        setIsLoadingPayment(false);
        setPaymentSuccess(true);
      }
    } else if (["apple_pay", "google_pay"].includes(form.paymentMethod)) {
      if (!stripeObj) return;
      const pr = stripeObj.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Laundry Service",
          amount: Math.round(cartTotals.finalTotal * 100),
        },
        requestPayerName: true,
      });
      const canPay = await pr.canMakePayment();
      if (canPay) {
        pr.show();
        pr.on("paymentmethod", async (ev) => {
          ev.complete("success");
          setPaymentSuccess(true);
        });
      } else {
        alert(
          lang === "es"
            ? "Billetera digital no disponible."
            : "Digital wallet not available."
        );
      }
    }
  };

  const handlePaymentComplete = () => {
    setIsProcessingPayment(false);
    setPaymentSuccess(false);
    setCardHolderName("");
    if (cardElement) cardElement.clear();
    const isPaid = form.paymentMethod !== "cash";
    submitOrder(false, false, isPaid, form.paymentMethod);
  };

  const submitOrder = async (
    forceMember = false,
    isRejoin = false,
    isPaid = false,
    methodOverride = null
  ) => {
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
    try {
      if (db) {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        const finalOrder = { id: docRef.id, ...orderData };
        const saved = JSON.parse(localStorage.getItem("myOrders") || "[]");
        localStorage.setItem("myOrders", JSON.stringify([...saved, docRef.id]));
        setLastOrder(finalOrder);
      } else {
        setLastOrder({ id: "DEMO-123", ...orderData, orderNumber: orderNum });
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
      setView("success");
    } catch (e) {
      alert("Error sending order.");
    }
    setIsSubmitting(false);
  };

  // CHAT FUNCTION CLIENTE
  const sendClientMessage = async (orderId, currentMessages = []) => {
    if (!chatInput.trim() || !db) return;
    const newMessage = {
      text: chatInput,
      sender: "client",
      date: new Date().toISOString(),
    };
    const updatedMessages = [...(currentMessages || []), newMessage];
    await updateDoc(doc(db, "orders", orderId), { chat: updatedMessages });
    setChatInput("");
  };

  const getOwnerWhatsApp = (o) => {
    if (!o) return "#";
    const p = (config.phone || "").replace(/\D/g, "");
    return `https://wa.me/${p}?text=Order%20${o.orderNumber}`;
  };
  const getOwnerSMS = (o) => {
    if (!o) return "#";
    const p = (config.phone || "").replace(/\D/g, "");
    return `sms:${p}?body=Order%20${o.orderNumber}`;
  };
  const shareOrder = (o) => {
    setShareData(o);
  };
  const dismissScheduleAlert = async () => {
    if (scheduleUpdateAlert && db) {
      await updateDoc(doc(db, "orders", scheduleUpdateAlert.id), {
        scheduleUpdatedByAdmin: false,
      });
      setScheduleUpdateAlert(null);
    }
  };
  const deleteLocalOrder = (id) => {
    const saved = JSON.parse(localStorage.getItem("myOrders") || "[]").filter(
      (x) => x !== id
    );
    localStorage.setItem("myOrders", JSON.stringify(saved));
    setMyOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // --- COMPONENTE BOTÓN VENDEDOR ---
  const MembershipPromoButton = ({ float = false }) => (
    <button
      onClick={handleHomeMemberClick}
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
          <span className={float ? "text-[10px]" : "text-lg"}>
            {lang === "es" ? "Eres Miembro" : "Member"}
          </span>
          <span className="text-[9px] opacity-90">
            {lang === "es" ? "Ahorraste:" : "Saved:"}
          </span>
          <span
            className={float ? "text-sm font-black" : "text-2xl font-black"}
          >
            ${cartTotals.discount.toFixed(2)}
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
            {lang === "es" ? "Únete" : "Join"}
          </span>
          <span className="text-[9px] mt-1">
            {lang === "es" ? "Ahorra" : "Save"}
          </span>
          <span className={float ? "text-sm font-black" : "text-xl font-black"}>
            ${potentialSavings.toFixed(2)}
          </span>
        </>
      )}
    </button>
  );

  // --- COMPONENTE RECIBO (CLIENTE) ---
  const OrderCard = ({ o, showActions = true }) => {
    const expressVal =
      o.expressFeeAmount !== undefined
        ? o.expressFeeAmount
        : o.express
        ? o.total * 0.2
        : 0;
    const discountVal =
      o.discountAmount !== undefined ? o.discountAmount : o.isMember ? 5 : 0;
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 mb-4 relative">
        <div className="flex justify-between items-start mb-4 border-b border-dashed pb-4 border-gray-200">
          <div>
            <span className="font-mono text-xl font-black text-cyan-700">
              #{o.orderNumber || o.id.slice(0, 6)}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(o.createdAt).toLocaleDateString()}{" "}
              {new Date(o.createdAt).toLocaleTimeString()}
            </p>
            <span
              className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                o.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {o.status}
            </span>
            {o.paymentStatus === "paid" && (
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                PAID
              </span>
            )}
          </div>
          <div className="text-right">
            <button
              onClick={() => shareOrder(o)}
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
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
            <span>
              Pickup: {o.details.pickupDate} ({o.details.pickupTime})
            </span>
          </div>
          <div className="flex items-center">
            <Truck className="w-4 h-4 mr-2 text-cyan-500" />
            <span>
              Delivery: {o.details.deliveryDate} ({o.details.deliveryTime})
            </span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl mb-4">
          {Object.entries(o.items).map(([id, qty]) => {
            const s = services.find((x) => x.id === id);
            const translatedName = s ? getServiceName(s) : id;
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
                <span>Subtotal</span>
                <span>${(o.total - expressVal + discountVal).toFixed(2)}</span>
              </div>
            )}
            {o.express && (
              <div className="flex justify-between text-cyan-600">
                <span>Express Fee</span>
                <span>+${expressVal.toFixed(2)}</span>
              </div>
            )}
            {o.isMember && (
              <div className="flex justify-between text-yellow-600">
                <span>Member Discount</span>
                <span>-${discountVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
              <span className="font-bold text-gray-800 text-base">TOTAL</span>
              <span className="font-black text-xl text-cyan-700">
                ${o.total.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 uppercase text-center">
            {o.details.paymentMethod} ({o.paymentStatus})
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

        {/* CHAT DE CLIENTE EN EL RECIBO */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                Chat con Admin
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 mb-2 p-2">
                {o.chat && o.chat.length > 0 ? (
                  o.chat.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.sender === "client"
                          ? "justify-end"
                          : "justify-start"
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
                    No messages yet.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded px-2 text-xs py-2"
                  placeholder="Escribe tu mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendClientMessage(o.id, o.chat)
                  }
                />
                <button
                  onClick={() => sendClientMessage(o.id, o.chat)}
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
            onClick={() => deleteLocalOrder(o.id)}
            className="w-full mt-4 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Receipt
          </button>
        )}
      </div>
    );
  };

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-cyan-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-20 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setView("home")}
          >
            <BrandLogo customIcon={config.customIcon} />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() =>
                setQRModal({ show: true, url: window.location.href })
              }
              className="p-2 text-gray-600 hover:text-cyan-600"
            >
              <QrCode className="w-6 h-6" />
            </button>
            <button
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
              onClick={() => setView("admin")}
              className="p-2 text-gray-400"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() =>
                setQRModal({ show: true, url: window.location.href })
              }
              className="p-2 text-gray-600"
            >
              <QrCode className="w-6 h-6" />
            </button>
            <button onClick={() => setView("cart")} className="relative p-2">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
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
              onClick={() => {
                setView("home");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold"
            >
              Home
            </button>
            <button
              onClick={() => {
                setView("track");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold"
            >
              My Orders
            </button>
            <button
              onClick={() => {
                setView("cart");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 font-bold"
            >
              Cart ({cartCount})
            </button>
            <div className="flex justify-between items-center pt-4 border-t">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-gray-100 rounded px-2 py-1 text-sm"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="hi">HI</option>
              </select>
            </div>
          </div>
        )}
      </nav>

      {scheduleUpdateAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center border-l-8 border-yellow-400">
            <h3 className="font-black text-xl mb-2">{t.alertTitle}</h3>
            <p className="mb-4 text-sm text-gray-600">{t.alertMsg}</p>
            <button
              onClick={dismissScheduleAlert}
              className="bg-yellow-500 text-white w-full py-3 rounded-xl font-bold"
            >
              {t.btnUnderstood}
            </button>
          </div>
        </div>
      )}

      {/* MODAL PAGO */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button
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
                    : t.payCardLabel}
                </h3>
                {form.paymentMethod === "card" && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {lang === "es" ? "Nombre en Tarjeta" : "Cardholder Name"}
                    </label>
                    <input
                      className="w-full p-3 border rounded mb-3 bg-gray-50"
                      placeholder={
                        lang === "es" ? "Nombre Completo" : "Full Name"
                      }
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                    />
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      {lang === "es" ? "Datos de Tarjeta" : "Card Details"}
                    </label>
                    <div className="p-3 border rounded bg-white shadow-sm">
                      <div id="card-element"></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center flex justify-center items-center">
                      <Lock className="w-3 h-3 mr-1" />{" "}
                      {lang === "es"
                        ? "Procesado seguro por Stripe"
                        : "Secure by Stripe"}
                    </p>
                  </div>
                )}
                {form.paymentMethod === "online" && (
                  <div className="bg-purple-50 p-4 rounded mb-4 text-sm text-center">
                    <p className="font-bold text-purple-800">
                      {lang === "es" ? "Enviar a:" : "Send to:"}{" "}
                      {config.zelleNumber || "--"}
                    </p>
                    <p className="text-gray-600 mt-1">{config.zelleMessage}</p>
                    <p className="text-2xl font-black mt-2 text-purple-900">
                      ${cartTotals.finalTotal.toFixed(2)}
                    </p>
                  </div>
                )}
                {form.paymentMethod === "cash" && (
                  <div className="bg-green-50 p-4 rounded mb-4 text-center">
                    <p className="text-green-800 font-bold mb-2">
                      {lang === "es" ? "Total a Pagar" : "Total Due"}
                    </p>
                    <span className="text-3xl font-black text-green-600">
                      ${cartTotals.finalTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <button
                  onClick={handlePayNow}
                  disabled={isLoadingPayment}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex justify-center items-center ${
                    isLoadingPayment ? "bg-gray-400" : "bg-cyan-900"
                  }`}
                >
                  {isLoadingPayment ? (
                    <CustomLoaderIcon className="animate-spin w-5 h-5" />
                  ) : form.paymentMethod === "cash" ? (
                    lang === "es" ? (
                      "Confirmar Orden"
                    ) : (
                      "Confirm Order"
                    )
                  ) : lang === "es" ? (
                    "Pagar Ahora"
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            ) : (
              <div className="py-4 text-center animate-fade-in">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-gray-800 mb-2">
                  {t.paymentSuccess}
                </h3>
                <button
                  onClick={handlePaymentComplete}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg"
                >
                  {lang === "es" ? "Ver Recibo" : "View Receipt"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA HOME */}
      {view === "home" && (
        <div className="animate-fade-in">
          <div className="relative h-[550px] flex items-center justify-center bg-cyan-900 text-white text-center px-4 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40"></div>
            <div className="relative z-10 max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-black mb-4 drop-shadow-lg">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
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
                  onClick={() => setView("cart")}
                  className="bg-cyan-500 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition border-2 border-white/20 flex items-center justify-center"
                >
                  <ShoppingBag className="mr-2 w-5 h-5" /> {t.sendOrder}
                </button>
              </div>
            </div>
            <div className="absolute top-10 right-10 z-20 hidden md:block">
              <MembershipPromoButton />
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
                          onClick={() => updateCart(s.id, -1)}
                          className="w-8 h-8 bg-gray-200 rounded-full font-bold text-gray-600"
                        >
                          -
                        </button>
                        <span className="font-bold">{cart[s.id] || 0}</span>
                        <button
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

            {/* OPCIONES EXPRESS */}
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
              <MembershipPromoButton />
            </div>

            {cartCount > 0 && (
              <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 animate-bounce-slow">
                <button
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
              <MembershipPromoButton float={true} />
            </div>
          </div>
        </div>
      )}

      {/* VISTA: CARRITO */}
      {view === "cart" && (
        <div className="max-w-4xl mx-auto p-6 pb-24 animate-fade-in">
          <h2 className="text-3xl font-black mb-6">{t.sendOrder}</h2>
          {cartCount === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <p className="text-gray-400">{t.emptyCart}</p>
              <button
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
                      className="w-full p-3 border rounded"
                      placeholder={t.nameLabel}
                    />
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full p-3 border rounded"
                      placeholder={t.phoneLabel}
                    />
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className="w-full p-3 border rounded"
                      placeholder={t.addressLabel}
                    />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">
                    {t.pickupInfo || "Schedule"}
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
                        className="w-full p-2 border rounded"
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
                        className="w-full p-2 border rounded"
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
                    <span>Total</span>
                    <span>${cartTotals.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">{t.payment}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
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
                    <button
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
                    <button
                      onClick={() => handleMethodClick("online")}
                      className={`p-3 border rounded flex flex-col items-center ${
                        form.paymentMethod === "online"
                          ? "bg-purple-50 border-purple-500"
                          : ""
                      }`}
                    >
                      <ExternalLink className="mb-1 text-purple-600" /> Zelle
                    </button>
                    <button
                      onClick={() => handleMethodClick("apple_pay")}
                      className={`p-3 border rounded flex flex-col items-center ${
                        form.paymentMethod === "apple_pay"
                          ? "bg-gray-100 border-gray-500"
                          : ""
                      }`}
                    >
                      <Smartphone className="mb-1 text-gray-800" /> Apple Pay
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setView("home")}
                  className="w-full text-center text-gray-400 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA: SUCCESS */}
      {view === "success" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-cyan-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full animate-fade-in my-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-800 mb-1">
              {t.successMsg}
            </h1>
            <p className="text-gray-500 mb-6 text-sm">{t.successSub}</p>

            {lastOrder && <OrderCard o={lastOrder} showActions={false} />}

            <div className="space-y-3 mt-4">
              <a
                href={getOwnerWhatsApp(lastOrder)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-green-600 transition flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {lang === "es"
                  ? `Notificar a ${config.title || "Fast Wave"}`
                  : `Notify ${config.title || "Fast Wave"}`}
              </a>
              <a
                href={getOwnerSMS(lastOrder)}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-blue-600 transition flex items-center justify-center"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                {lang === "es"
                  ? "Enviar SMS de Confirmación"
                  : "Send Confirmation SMS"}
              </a>
            </div>
            <button
              onClick={() => setView("track")}
              className="w-full text-cyan-600 font-bold mt-4 hover:underline"
            >
              {t.trackOrder}
            </button>
            <button
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
              onClick={() => setView("home")}
              className="font-bold text-gray-600"
            >
              <ArrowLeft className="inline mr-2" /> {t.back}
            </button>
            <h2 className="text-2xl font-black">{t.yourOrders}</h2>
          </div>
          <div className="space-y-4">
            {myOrders.map((o) => (
              <OrderCard key={o.id} o={o} />
            ))}
          </div>
        </div>
      )}

      {view === "admin" && (
        <AdminView
          t={t}
          config={config}
          setConfig={setConfig}
          services={services}
          setServices={setServices}
          setView={setView}
          lang={lang}
        />
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl text-center max-w-sm w-full">
            <h3 className="font-black text-2xl mb-2 text-cyan-900">
              {lang === "es" ? "¡Espera! Ahorra Dinero" : "Wait! Save Money"}
            </h3>
            <p className="text-gray-600 mb-4">
              {lang === "es"
                ? `Puedes ahorrar $${savingsAmount.toFixed(
                    2
                  )} en esta orden si te unes ahora.`
                : `You can save $${savingsAmount.toFixed(
                    2
                  )} on this order if you join now.`}
            </p>
            <button
              onClick={handleJoinAndContinue}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold mb-2 shadow-md"
            >
              {lang === "es" ? "Sí, Unirme y Ahorrar" : "Yes, Join & Save"}
            </button>
            <button
              onClick={handleNoAndContinue}
              className="w-full text-gray-400 font-bold py-2"
            >
              {lang === "es"
                ? "No, pagar precio completo"
                : "No, pay full price"}
            </button>
          </div>
        </div>
      )}
      {showLossWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl text-center max-w-sm w-full">
            <h3 className="font-black text-xl mb-2 text-red-600">
              {lang === "es" ? "¿Estás seguro?" : "Are you sure?"}
            </h3>
            <p className="text-gray-600 mb-6">
              {lang === "es"
                ? `Estás a punto de perder un ahorro de $${savingsAmount.toFixed(
                    2
                  )}.`
                : `You are about to lose a saving of $${savingsAmount.toFixed(
                    2
                  )}.`}
            </p>
            <button
              onClick={confirmLossAndPay}
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl mb-2"
            >
              {lang === "es" ? "Sí, perder ahorro" : "Yes, lose savings"}
            </button>
            <button
              onClick={goBackToOffer}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-md"
            >
              {lang === "es" ? "¡No! Quiero ahorrar" : "No! I want to save"}
            </button>
          </div>
        </div>
      )}
      {showRejoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl text-center">
            <h3 className="font-black text-2xl mb-4">{t.rejoinTitle}</h3>
            <button
              onClick={rejoinMembership}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold mb-2"
            >
              {t.rejoinYes}
            </button>
            <button
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
              onClick={() => setShowHomeJoinModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>
            <h3 className="font-black text-xl mb-4 text-center text-cyan-900">
              {lang === "es" ? "Únete al Club" : "Join the Club"}
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {lang === "es"
                ? "Ingresa tus datos para activar tu descuento."
                : "Enter your details to unlock your discount."}
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
              onClick={joinFromHome}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-600 transition"
            >
              {lang === "es" ? "Activar Membresía" : "Activate Membership"}
            </button>
          </div>
        </div>
      )}
      {showCancelMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center shadow-2xl">
            <h3 className="font-black text-xl mb-2 text-red-600">
              {lang === "es" ? "¿Cancelar Membresía?" : "Cancel Membership?"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {lang === "es"
                ? "Perderás tus descuentos acumulados."
                : "You will lose your accumulated discounts."}
            </p>
            <button
              onClick={cancelMembership}
              className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-xl mb-2 hover:bg-red-200"
            >
              {lang === "es" ? "Sí, Cancelar" : "Yes, Cancel"}
            </button>
            <button
              onClick={() => setShowCancelMemberModal(false)}
              className="w-full text-gray-400 py-2 hover:text-gray-600"
            >
              {lang === "es" ? "Volver" : "Back"}
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
                {lang === "es" ? "¡YA ERES MIEMBRO!" : "YOU ARE NOW A MEMBER!"}
              </h3>
              <p className="text-lg text-gray-600 mb-6 font-bold">
                {lang === "es"
                  ? "¡Prepárate para ahorrar en grande!"
                  : "Get ready for big savings!"}
              </p>
              <button
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative">
            <button
              onClick={() => setShareData(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold"
            >
              X
            </button>
            <h3 className="font-black text-xl mb-4">
              {lang === "es" ? "Compartir Recibo" : "Share Receipt"}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <a
                href={getOwnerWhatsApp(shareData)}
                target="_blank"
                className="flex items-center justify-center p-3 bg-green-100 text-green-800 rounded-lg font-bold hover:bg-green-200"
              >
                <MessageCircle className="mr-2" /> WhatsApp
              </a>
              <a
                href={getOwnerSMS(shareData)}
                className="flex items-center justify-center p-3 bg-blue-100 text-blue-800 rounded-lg font-bold hover:bg-blue-200"
              >
                <Smartphone className="mr-2" /> SMS
              </a>
              <a
                href={`mailto:?subject=Receipt&body=Order%20${shareData.orderNumber}`}
                className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg font-bold hover:bg-gray-200"
              >
                <ExternalLink className="mr-2" /> Email
              </a>
            </div>
          </div>
        </div>
      )}

      {qrModal.show && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center relative">
            <button
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
    </div>
  );
}

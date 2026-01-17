/* =========================================
   MASTER DATABASE (UNIFICADA: TIENDAS + CREADORES)
   ========================================= */

export const MASTER_DB = [
    // --- 1. COMERCIOS (PRODUCTOS) ---
    { 
      id: "shop_carrefour", // ID ÚNICO
      type: ["product", "shop"], 
      mentionLevel: 1, 
      distance: "200m",
      
      name: "Aceite Oliva 1L", 
      shopName: "Carrefour Express",
      city: "Oviedo", 
      region: "Asturias", 
      country: "España",
      scope: ["city"], 
      category: "Alimentación", 
      price: "1.50€", 
      moonPrice: "350 🌑",
      message: "Abierto hasta las 22:00h. Pan recién hecho.", 
      offerText: "BAJADA DE PRECIOS",
      
      neonColor: "text-blue-500", 
      style: "bg-gradient-to-br from-blue-400/20 to-black/80 border border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] text-blue-100",
      img: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=60&w=600&auto=format&fit=crop",
      
      // Datos extra para Lives (vacíos si no es creador)
      isLive: false
    },
    
    { 
      id: "shop_mediamarkt", 
      type: ["product", "shop"],
      mentionLevel: 2, 
      distance: "2.5km",
      
      name: "Sony PlayStation 5", 
      shopName: "MediaMarkt",
      city: "Madrid", 
      region: "Madrid", 
      country: "España",
      scope: ["city", "national"], 
      category: "Tecnología", 
      price: "499€", 
      moonPrice: "85.000 🌑",
      message: "Últimas unidades en stock local.", 
      offerText: "PLAN RENOVE PS5",
      
      neonColor: "text-blue-500", 
      style: "bg-gradient-to-br from-blue-700/20 to-black/80 border border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.6)] text-blue-100",
      img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=60&w=600&auto=format&fit=crop",
      isLive: false
    },

    { 
      id: "shop_apple", 
      type: ["product", "shop"],
      mentionLevel: 2, 
      distance: "Global",
      
      name: "iPhone 16 Pro", 
      shopName: "Apple",
      city: "Cupertino", 
      region: "California", 
      country: "USA",
      scope: ["international"], 
      category: "Tech", 
      price: "1.300€", 
      moonPrice: "280k 🌑",
      message: "Nueva Inteligencia Artificial integrada.", 
      offerText: "FINANCIA AL 0%",
      
      neonColor: "text-white", 
      style: "bg-white/10 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]",
      img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=60&w=600&auto=format&fit=crop",
      isLive: false
    },

    { 
      id: "shop_manolo", 
      type: ["product", "shop"],
      mentionLevel: 1,
      distance: "500m",
      
      name: "Aceite Oliva Virgen 1L", 
      shopName: "Tienda de Manolo",
      city: "Sevilla", 
      region: "Andalucía", 
      country: "España",
      scope: ["city"], 
      category: "Alimentación", 
      price: "6.50€", 
      moonPrice: "1.200 🌑",
      message: "Enamorado del futbol andaluz!", 
      offerText: "2x1 EN ACEITES",
      
      neonColor: "text-green-500", 
      style: "bg-gradient-to-br from-green-600/20 to-black/80 border border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)] text-green-100",
      img: "https://images.unsplash.com/photo-1474979266404-7cadd9a42018?q=60&w=600&auto=format&fit=crop",
      isLive: false
    },

    // --- 2. SERVICIOS (PROFESIONALES) ---
    { 
      id: "serv_lorena", 
      type: ["service", "shop"], // <--- Añadido 'shop' para que salga en búsquedas generales
      mentionLevel: 2,
      distance: "1.5km",
      
      name: "Lorena Legal", 
      shopName: "Despacho Sánchez",
      city: "Barcelona", 
      region: "Cataluña", 
      country: "España",
      scope: ["city"], 
      category: "Abogados", 
      price: "60€", 
      moonPrice: "12.000 🌑", 
      message: "Primera consulta gratuita si contratas.", 
      offerText: "1ª CITA GRATIS",
      
      neonColor: "text-purple-500",
      style: "bg-gradient-to-br from-purple-600/20 to-black/80 border border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)] text-purple-100",
      img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=60&w=600&auto=format&fit=crop",
      isLive: false
    },
    
    { 
      id: "serv_rutero", 
      type: ["service", "shop"],
      mentionLevel: 1,
      distance: "12km",
      
      name: "Menú del Día", 
      shopName: "Gasolinera El Rutero",
      city: "Burgos", 
      region: "Castilla y León", 
      country: "España",
      scope: ["city"], 
      category: "Restauración", 
      price: "8.50€", 
      moonPrice: "200 🌑",
      message: "Parada obligatoria de camioneros.", 
      offerText: "POSTRE GRATIS",
      
      neonColor: "text-orange-400", 
      style: "bg-gradient-to-br from-gray-700/20 to-black/80 border border-gray-500",
      img: "https://images.unsplash.com/photo-1565060169194-192f80878e8b?auto=format&fit=crop&q=60&w=600",
      isLive: false
    },

    // --- 3. CREADORES (FUSIÓN: AHORA SON ITEMS DE LA DB) ---
    // Esto permite que al hacer clic en "CARD", se abra la Terminal de Compra normal
    { 
      id: "creator_ana", 
      type: ["creator", "live", "service"], 
      mentionLevel: 2, 
      distance: "Online",
      
      name: "Debate: Futuro 5G", // Título del Live
      shopName: "Ana_Tech",      // Nombre del Creador
      city: "Madrid", 
      country: "España",
      scope: ["national"],
      category: "Tecnología",
      
      price: "25€", // Vende Merchandising o Consultas
      moonPrice: "2.500 🌑",
      message: "Merchandising Oficial y Cursos.",
      offerText: "🔴 EN VIVO",

      // Datos específicos de Live
      isLive: true,
      viewers: 120, 
      audioFile: "/audio/channel_13.mp3",
      role: "CREATOR LVL 5",
      rep: "98%",
      
      neonColor: "text-red-500",
      style: "bg-gradient-to-br from-red-900/40 to-black border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] text-white",
      img: "https://i.pravatar.cc/150?u=a",

      // Datos de Identidad
      slides_url: "https://docs.google.com/presentation/...", 
      logs: [{ title: 'ENSAYO: "La Caída del Bitcoin"', category: 'OPINIÓN', author: 'Ana_Tech' }],
      top_20: [
          { id: 1, title: 'Track: Neon Tears', author: 'Suno AI' },
          { id: 2, title: 'Live: Chef Paco', author: 'Chef_Paco' }
      ]
    },
    
    { 
      id: "creator_paco", 
      type: ["creator", "live", "shop"], 
      mentionLevel: 1, 
      distance: "Online",
      
      name: "Cocinando en vivo", 
      shopName: "Chef_Paco",
      city: "Valencia",
      country: "España", 
      scope: ["national"],
      category: "Cocina",
      
      price: "15€", 
      moonPrice: "1.500 🌑",
      message: "Compra mi libro de recetas.",
      offerText: "🔴 EN VIVO",
      
      isLive: true,
      viewers: 85, 
      audioFile: "/audio/channel_14.mp3",
      role: "CREATOR LVL 3",
      rep: "100%",

      neonColor: "text-yellow-500",
      style: "bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] text-yellow-100",
      img: "https://i.pravatar.cc/150?u=b",

      slides_url: "", 
      logs: [],
      top_20: []
    },

    { 
      id: "creator_crypto", 
      type: ["creator", "live", "service"], 
      mentionLevel: 1, 
      distance: "Online",
      
      name: "Análisis Nova Coin", 
      shopName: "CryptoBro",
      city: "Andorra",
      country: "Andorra", 
      scope: ["international"],
      category: "Finanzas",
      
      price: "100€", 
      moonPrice: "10.000 🌑",
      message: "Asesoría 1 a 1.",
      offerText: "🔴 EN VIVO",
      
      isLive: true,
      viewers: 340, 
      audioFile: "/audio/channel_15.mp3",
      role: "ANALYST LVL 9",
      rep: "88%",

      neonColor: "text-cyan-500",
      style: "bg-gradient-to-br from-cyan-900/20 to-black border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-cyan-100",
      img: "https://i.pravatar.cc/150?u=c",

      slides_url: "", 
      logs: [],
      top_20: []
    }
];
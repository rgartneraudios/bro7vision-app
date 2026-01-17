// src/data/MoonMatrix.js

export const PARITY_VALUE = 0.010; // 1 GÉNESIS = 0.01€ (Referencia absoluta)

export const MOON_MATRIX = {
  // FASE 1: NOVA (LUNA NUEVA)
  // Momento "Barato" para comprar (IN bajo).
  nova: {
    label: 'Nova',
    color: 'neutral', // Usamos 'neutral' para simular el NEGRO sin romper el código
    IN: 0.0090,       
    L1: 0.0095,        
    L2: 0.0190,        
    L3: 0.0330,        
    L4: 0.0440, 
    OUT: 0.0105      
  },

  // FASE 2: CRESCENS (CRECIENTE)
  // Subiendo hacia la paridad.
  crescens: {
    label: 'Crescens',
    color: 'gray',    // GRIS
    IN: 0.0095,       
    L1: 0.0090,        
    L2: 0.0180,
    L3: 0.0315,        
    L4: 0.0420,
    OUT: 0.0110       
  },

  // FASE 3: PLENA (LUNA LLENA)
  // Momento "Caro" (Moneda Fuerte).
  plena: {
    label: 'Plena',
    color: 'zinc',    // Usamos 'zinc' (Plata/Blanco) para simular BLANCO
    IN: 0.0110,       
    L1: 0.0105,        
    L2: 0.0210,
    L3: 0.0270,       
    L4: 0.0360,
    OUT: 0.0095       
  },

  // FASE 4: DECRESCENS (MENGUANTE)
  // Bajando de nuevo.
  decrescens: {
    label: 'Decrescens',
    color: 'orange',  // NARANJA
    IN: 0.0105,       
    L1: 0.0110,        
    L2: 0.0220,
    L3: 0.0285,        
    L4: 0.0380,
    OUT: 0.0090       
  },

  // REFERENCIA FIAT (ESTABLE)
  fiat: {
    label: 'Fiat Ref',
    color: 'blue',
    IN: 0.0100,
    L1: 0.0100,
    L2: 0.0200,
    L3: 0.0300,
    L4: 0.0400,
    OUT: 0.0100
  }
};

// --- FUNCIONES DE CÁLCULO ---

// 1. Convertir GÉNESIS a MOON COINS
export const convertGenesisToMoon = (genesisAmount, targetCoinKey) => {
    const fiatValue = genesisAmount * PARITY_VALUE; 
    const coinPrice = MOON_MATRIX[targetCoinKey].IN; 
    return Math.floor(fiatValue / coinPrice);
};

// 2. Calcular Precio Dinámico de Productos
export const calculateDynamicPrice = (standardCoins, currentPhase, userCoinType) => {
    if (!userCoinType || !MOON_MATRIX[userCoinType]) return 0;
    
    // Fórmula Forex Interno: (Precio Base * Valor OUT Fase Actual) / Valor IN Moneda Usuario
    const outValue = MOON_MATRIX[currentPhase].OUT; 
    const inValue = MOON_MATRIX[userCoinType].IN;   
    
    if (inValue === 0) return 0;

    const finalCoins = (standardCoins * outValue) / inValue;
    return Math.ceil(finalCoins);
};

// 3. Calcular Coste de Servicios (Ads/Mentions)
export const calculateServiceCost = (fiatPrice, targetCoinKey, level = 'L1') => {
    if (!MOON_MATRIX[targetCoinKey]) return 0;
    // Accedemos al valor L1, L2, L3 o L4 según corresponda
    const coinValue = MOON_MATRIX[targetCoinKey][level] || MOON_MATRIX[targetCoinKey].L1;
    return Math.ceil(fiatPrice / coinValue);
};

// 4. Alquimia Inversa
export const getAlchemyCoin = (outValue) => {
    const match = Object.entries(MOON_MATRIX).find(([key, data]) => {
        return Math.abs(data.IN - outValue) < 0.0001; 
    });
    return match ? match[0] : null;
};
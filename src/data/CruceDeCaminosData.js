export const EMOTIONAL_MATRIX = {
    2:  { "-1": 'CALMA', "-2": 'CALMA' },
    1:  { 1: 'EGO', "-1": 'PAUSA', "-2": 'DECEPCION' },
    0:  { 2: 'CRITICA', 1: 'VENTAJA', "-1": 'DESENCANTO', "-2": 'INSEGURIDAD' },
    "-1": { 2: 'IMPULSO', 1: 'ANIMO', "-1": 'DESILUSION' },
    "-2": { 2: 'RECLAMO', 1: 'VICTIMISMO' }
};

export const SCENARIOS = [
    {
        id: 'sneaker_hot',
        category: 'TIENDA', // <--- ASEGÚRATE QUE ESTÉ EN MAYÚSCULAS
        title: 'EL PRISAS',
        cover: '/images/CruceDeCaminos/previo.png',
        inicioImg: '/images/CruceDeCaminos/inicio.png',
        outImg: '/images/CruceDeCaminos/out.png',
        ventaImg: '/images/CruceDeCaminos/venta.png',
        superImg: '/images/CruceDeCaminos/super.png',
        videoSrc: '/videos/CC_tienda.mp4',
        p2Inercia: { 1: 1, 3: 2, 5: -1, 7: 1 }, 
        context: "HAY UN CLIENTE MIRANDO EL ESCAPARATE. PARECE INDECISO Y TIENE PRISA.",
        dialogues: {
            intro: "OYE, ESAS DEL ESTANTE... ¿SON EL DROP DE HOY O RESTOCK?",
            INTRO_ZEN: "¡QUÉ LINDA TIENDA! NO LA CONOCÍA. ¿ESAS ZAPAS PARECEN DROPS, NO?",
            EGO: "MIRA, NO HACE FALTA QUE SALGAS A BUSCARME. ¿ESAS SON EL DROP?",
            CRITICA: "ESTÁN BIEN... PERO LA COSTURA ME PARECE CUTRE PARA ESTE PRECIO.",
            VENTAJA: "ME MOLAN... PERO SEGURO QUE TIENES ALGÚN DESCUENTO POR AHÍ, ¿NO?",
            IMPULSO: "¡VENGA YA! DESPIERTA UN POCO. QUIERO VER SI ESTAS ZAPAS VALEN LA PENA.",
            ANIMO: "NO TE QUEDES AHÍ APALANCADO. PONLE GANAS Y CERRAMOS EL TRATO YA.",
            RECLAMO: "¡EY! ¿HOLA? ¿HAY ALGUIEN TRABAJANDO AQUÍ? ¡ATIÉNDEME!",
            VICTIMISMO: "PARECE QUE SI NO VENGO CON UN OUTFIT DE MIL PAVOS NI ME MIRÁIS... QUÉ TRISTE.",
            CALMA: "BAJA UN CAMBIO, COLEGA. VAMOS A RELAJARNOS UN POCO.",
            PAUSA: "VALE, VALE... DÉJAME UN SEGUNDO QUE ME LO PIENSE.",
            DECEPCION: "ESPERABA OTRO ROLLO EN ESTA TIENDA... ESTO ME HA DEJADO FRÍO.",
            DESENCANTO: "SON BONITAS, SÍ... PERO SE ME HA PASADO EL HYPE.",
            INSEGURIDAD: "EL DISEÑO ES TOP, PERO ME DA MIEDO QUE SE ME ROMPAN PRONTO.",
            DESILUSION: "PARA VER CARAS LARGAS PREFIERO COMPRAR ONLINE.",
            FINAL_HOT: "VENGA, ME LAS QUEDO. PONLAS EN UNA BOLSA.",
            FINAL_ZEN: "¡VENTA MAESTRA! ME LLEVO EL KIT DE LIMPIEZA TAMBIÉN.",
            FINAL_COLD: "AL FINAL ME LAS LLEVO, PERO POR LOS PELOS."
        }
    },
    {
        id: 'sneaker_cold',
        category: 'TIENDA', // <--- MAYÚSCULAS
        title: 'EL ESPECTRO',
        cover: '/images/CruceDeCaminos/previo2.png',
        inicioImg: '/images/CruceDeCaminos/inicio2.png',
        outImg: '/images/CruceDeCaminos/out2.png',
        ventaImg: '/images/CruceDeCaminos/venta2.png',
        superImg: '/images/CruceDeCaminos/super2.png',
        videoSrc: '/videos/CC_tienda.mp4',
        p2Inercia: { 1: -1, 3: -2, 5: -1, 7: -1 }, 
        context: "UN CLIENTE ENTRA MIRANDO SU MÓVIL. NI SIQUIERA HA LEVANTADO LA VISTA.",
        dialogues: {
            intro: "Mmmm... no sé. Creo que solo estoy de paso. No busco nada.",
            INTRO_ZEN: "Hola... qué sitio más tranquilo. Estaba mirando algo online pero me he pasado.",
            EGO: "Oye, relaja. Que entre a la tienda no significa que me tengas que dar una charla.",
            CRITICA: "No sé yo... estas suelas parecen baratas. ¿Seguro que son originales?",
            VENTAJA: "Si me las dejas a precio de outlet me las llevo, si no, paso.",
            IMPULSO: "¡Eh! Despierta. Si te pido la talla es para que me la traigas.",
            ANIMO: "Bueno, sácame el 42. Si me quedan bien, igual te ahorro el trabajo.",
            RECLAMO: "Increíble. Estoy aquí con la cartera en la mano y parece que hablo solo.",
            VICTIMISMO: "Claro, como no parezco un influencer pasáis de atenderme. Típico.",
            CALMA: "Venga, respira hondo. No me vas a convencer por meterle más prisa.",
            PAUSA: "Déjame mirar un momento el móvil para comparar precios.",
            DECEPCION: "Vaya... me habían hablado bien de este sitio pero es flojo.",
            DESENCANTO: "Casi que prefiero mirarlas otro día. Se me han quitado las ganas.",
            INSEGURIDAD: "No sé si este color me pega... me veo raro.",
            DESILUSION: "Para estar aquí perdiendo el tiempo, me voy a casa.",
            FINAL_HOT: "Venga, ponmelas. Me las llevo por no dar más vueltas.",
            FINAL_ZEN: "¡Qué buena tarde! Me habéis asesorado genial.",
            FINAL_COLD: "Me las quedo porque me hacen falta, pero sin entusiasmo."
        }
    },
    {
        id: 'sneaker_dream',
        category: 'TIENDA', // <--- MAYÚSCULAS
        title: 'LA SOÑADORA',
        cover: '/images/CruceDeCaminos/previo3.png',
        inicioImg: '/images/CruceDeCaminos/inicio3.png',
        outImg: '/images/CruceDeCaminos/out3.png',
        ventaImg: '/images/CruceDeCaminos/venta3.png',
        superImg: '/images/CruceDeCaminos/super3.png',
        videoSrc: '/videos/CC_tienda.mp4',
        p2Inercia: { 1: -1, 3: 1, 5: -1, 7: 0 }, 
        context: "UNA CHICA OBSERVA SU REFLEJO Y LAS ZAPATILLAS. PARECE QUE DESEA ALGO.",
        dialogues: {
            intro: "HOLA... NO SÉ SI ESTAS SON PARA MÍ, PERO SON PRECIOSAS...",
            INTRO_ZEN: "HOLA. TIENES UNA TIENDA MÁGICA. MIRABA EL REFLEJO DE ESTAS JORDAN...",
            EGO: "SÓLO ESTOY MIRANDO, NO NECESITO QUE ME PRESIONEN...",
            CRITICA: "SON LINDAS, PERO LAS SIENTO UN POCO RÍGIDAS... ¿VALEN LO QUE DICEN?",
            VENTAJA: "ME ENCANTARÍA LLEVÁRMELAS... ¿HACÉIS ALGUNA ATENCIÓN ESPECIAL?",
            IMPULSO: "¡DIME ALGO! ¿CREES QUE ME QUEDARÍAN BIEN O SÓLO QUIERES VENDER?",
            ANIMO: "ME GUSTA TU ENERGÍA. SI ME AYUDAS CON LA TALLA, ME LAS QUEDO.",
            RECLAMO: "PERDONA... LLEVO AQUÍ UN RATO Y PARECE QUE NO EXISTO.",
            VICTIMISMO: "SIEMPRE ME PASA IGUAL, PARECE QUE TENGO QUE PEDIR PERMISO.",
            CALMA: "VAMOS DESPACIO... ME GUSTA TOMARME MI TIEMPO PARA DECIDIR.",
            PAUSA: "VALE... DÉJAME SENTIRLAS UN MOMENTO. NO CORRAMOS.",
            DECEPCION: "PENSÉ QUE SERÍA MÁS FÁCIL... ME HE QUEDADO UN POCO TRISTE.",
            DESENCANTO: "SÍ, SON BONITAS, PERO SE ME HAN QUITADO LAS GANAS...",
            INSEGURIDAD: "NO SÉ SI ME PEGAN... ¿Y SI ME ARREPIENTO MAÑANA?",
            DESILUSION: "CREO QUE MEJOR VUELVO OTRO DÍA, NO SIENTO EL MOMENTO.",
            FINAL_HOT: "VENGA, ME LAS LLEVO. GRACIAS POR EL EMPUJÓN.",
            FINAL_ZEN: "¡QUÉ ILUSIÓN! ME LAS LLEVO PUESTAS. ERES ENCANTADOR/A.",
            FINAL_COLD: "BUENO, ME LAS QUEDO... ESPERO NO HABERME EQUIVOCADO."
        }
    }
];
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
    },
    
    // --- CATEGORÍA: CITAS ---
    { 
        id: 'date_boy', 
        category: 'CITAS', 
        title: 'EL INTENSO', 
        cover: '/images/CruceDeCaminos/c_previo.png', 
        inicioImg: '/images/CruceDeCaminos/c_inicio.png', 
        outImg: '/images/CruceDeCaminos/c_out.png', 
        ventaImg: '/images/CruceDeCaminos/c_bote.png', 
        superImg: '/images/CruceDeCaminos/c_dormitorio.png', 
        videoSrc: '/videos/CC_cita_boy.mp4', 
        p2Inercia: { 1: 1, 3: 1, 5: 2, 7: 1 }, 
        context: "HAS QUEDADO CON ÉL EN UN BAR. SE LE VE NERVIOSO Y HABLA DEMASIADO DE SÍ MISMO.", 
        dialogues: {
            intro: "HOLA... ESTÁS INCREÍBLE. ESTABA PENSANDO QUE PODRÍAMOS IR A UN SITIO MÁS PRIVADO LUEGO...",
            INTRO_ZEN: "HOLA. GRACIAS POR VENIR. ME GUSTA MUCHO ESTE SITIO, ¿ESTÁS CÓMODA?",
            EGO: "MIRA, NO ME GUSTA QUE ME CORTES CUANDO ESTOY HABLANDO DE MIS PLANES.",
            CRITICA: "TE VEO UN POCO DISTRAÍDA... ¿ES POR LO QUE HE DICHO DEL RESTAURANTE?",
            VENTAJA: "OYE, YA QUE TE GUSTA TANTO ESTE VINO... PODRÍAMOS PEDIR OTRA EN MI CASA.",
            IMPULSO: "¡REACCIONA! DIME ALGO, PARECE QUE ESTOY HABLANDO SOLO.",
            ANIMO: "ME GUSTA CUANDO ME MIRAS ASÍ. CREO QUE ESTA NOCHE VA A SER ESPECIAL.",
            RECLAMO: "¿ME ESTÁS ESCUCHANDO? LLEVAS DIEZ MINUTOS MIRANDO EL MÓVIL.",
            VICTIMISMO: "SIEMPRE ME PASA IGUAL, ACABO CON CHICAS QUE NO ME ENTIENDEN.",
            CALMA: "SÍ, TIENES RAZÓN. QUIZÁS ESTOY CORRIENDO MUCHO. VAMOS A RELAJARNOS.",
            PAUSA: "VALE... HABLEMOS DE OTRA COSA. NO QUIERO QUE TE SIENTAS PRESIONADA.",
            DECEPCION: "PENSÉ QUE HABÍA MÁS CHISPA ENTRE NOSOTROS... ME HE QUEDADO UN POCO PLOFF.",
            DESENCANTO: "SABES... DE REPENTE ME HE SENTIDO EXTRAÑO. IGUAL ES EL SITIO.",
            INSEGURIDAD: "A VECES PIENSO QUE SOY DEMASIADO PARA TI... O AL REVÉS, NO SÉ.",
            DESILUSION: "CREO QUE MEJOR PEDIMOS LA CUENTA. NO SIENTO QUE ESTO FLUYA.",
            FINAL_HOT: "VENGA, VAMOS A ESE PASEO EN BOTE QUE ME HAS DICHO.",
            FINAL_ZEN: "ESTOY TAN BIEN CONTIGO... NO QUIERO QUE ESTO ACABE. ¿VAMOS A MI CASA?",
            FINAL_COLD: "HA ESTADO BIEN EL PASEO. NOS VEMOS LUEGO."
        }
    },
    { 
        id: 'date_girl', 
        category: 'CITAS', 
        title: 'LA DISTANTE', 
        cover: '/images/CruceDeCaminos/c_previo2.png', 
        inicioImg: '/images/CruceDeCaminos/c_inicio2.png', 
        outImg: '/images/CruceDeCaminos/c_out2.png', 
        ventaImg: '/images/CruceDeCaminos/c_cine2.png', 
        superImg: '/images/CruceDeCaminos/c_dormitorio2.png', 
        videoSrc: '/videos/CC_cita_girl.mp4', 
        p2Inercia: { 1: -1, 3: -2, 5: -1, 7: -1 }, 
        context: "ELLA ESTÁ SENTADA EN LA BARRA. APENAS TE MIRA AL LLEGAR, PARECE ALGO ABURRIDA.", 
        dialogues: {
            intro: "HOLA. LLEGAS PUNTUAL. ESTABA POR PEDIR ALGO YO SOLA.",
            INTRO_ZEN: "HOLA... QUÉ SITIO TAN TRANQUILO HAS ELEGIDO. ME GUSTA.",
            EGO: "NO SÉ SI ESE COMENTARIO ERA PARA IMPRESIONARME, PERO NO LO HAS CONSEGUIDO.",
            CRITICA: "TE VEO MUY SEGURO DE TI MISMO... ¿SIEMPRE ERES ASÍ DE ARROGANTE?",
            VENTAJA: "SI ME VAS A INVITAR TÚ A LA CENA, IGUAL ME QUEDO UN RATO MÁS.",
            IMPULSO: "DIME ALGO QUE ME SORPRENDA. ME ESTOY QUEDANDO DORMIDA AQUÍ MISMO.",
            ANIMO: "BUENO... PARECE QUE DETRÁS DE ESA CARA DE SERIO HAY ALGUIEN INTERESANTE.",
            RECLAMO: "SI VAS A ESTAR MIRANDO A OTRAS PERSONAS, MEJOR ME VOY SOLA.",
            VICTIMISMO: "CLARO, COMO NO SOY EL TIPO DE CHICA QUE BUSCAS, YA NO TE ESFUERZAS.",
            CALMA: "ME GUSTA QUE SEPAS ESCUCHAR. NO ES MUY COMÚN ÚLTIMAMENTE.",
            PAUSA: "VALE, NO ME PRESIONES CON TANTAS PREGUNTAS PERSONALES. VAMOS DESPACIO.",
            DECEPCION: "ESPERABA OTRO TIPO DE CONEXIÓN... ESTO ESTÁ SIENDO ALGO FRÍO.",
            DESENCANTO: "NO SÉ... DE REPENTE SE ME HAN QUITADO LAS GANAS DE SEGUIR AQUÍ.",
            INSEGURIDAD: "A VECES SIENTO QUE BUSCAMOS COSAS MUY DISTINTAS EN LA VIDA.",
            DESILUSION: "CREO QUE MEJOR LO DEJAMOS AQUÍ. NO CREO QUE TENGAMOS MUCHO EN COMÚN.",
            FINAL_HOT: "VENGA, ME HAS CONVENCIDO. VAMOS AL CINE A VER ESA PELI.",
            FINAL_ZEN: "NO QUIERO QUE ESTA NOCHE TERMINE AQUÍ... ¿VAMOS A MI CASA?",
            FINAL_COLD: "HA ESTADO BIEN LA PELÍCULA, PERO CADA UNO A SU CASA."
        }
       }, 
        { 
        id: 'date_sophisticated', 
        category: 'CITAS', 
        title: 'LA ENIGMÁTICA', 
        cover: '/images/CruceDeCaminos/c_previo3.png', 
        inicioImg: '/images/CruceDeCaminos/c_inicio3.png', 
        outImg: '/images/CruceDeCaminos/c_out3.png', 
        ventaImg: '/images/CruceDeCaminos/c_opera3.png', 
        superImg: '/images/CruceDeCaminos/c_dormitorio.png', 
        videoSrc: '/videos/CC_cita_girl2.mp4', 
        // Inercia de "Test": Empieza suave, pero en el paso 3 te pone a prueba bajando al frío 
        // para ver si tienes la energía de subirla.
        p2Inercia: { 1: 0, 3: -1, 5: 1, 7: -1 }, 
        context: "ESTÁ EN LA BARRA DISFRUTANDO DE UN MARTINI ROSSO CON UNA VESTIMENTA IMPECABLE.", 
        dialogues: {
            intro: "HOLA. TIENES ASPECTO DE TENER BUEN GUSTO... SORPRÉNDEME CON ALGO QUE NO HAYA ESCUCHADO MIL VECES.",
            INTRO_ZEN: "HOLA. ME GUSTA LA GENTE QUE SABE RESPETAR EL ESPACIO AJENO. ¿QUÉ ESTÁS BEBIENDO?",
            EGO: "QUE TE HAYA SONREÍDO NO TE DA DERECHO A DARME UNA LECCIÓN DE VIDA. BAJA EL TONO POR FAVOR.",
            CRITICA: "INTERESANTE... DICES COSAS QUE PARECEN INTELIGENTES, PERO TE FALTA UN POCO DE FONDO, ¿NO CREES?",
            VENTAJA: "ME GUSTA TU VIBRA... PERO SOY UNA MUJER CARA DE MANTENER EMOCIONALMENTE. ¿ESTÁS A LA ALTURA?",
            IMPULSO: "DIME ALGO QUE ME HAGA OLVIDAR EL MÓVIL. ME ESTOY ABURRIENDO Y EL CÓCTEL SE ACABA.",
            ANIMO: "VAYA... PARECE QUE DETRÁS DE ESA FACHADA HAY ALGUIEN CON QUIÉN SE PUEDE HABLAR DE VERDAD.",
            RECLAMO: "¿HOLA? SI VAS A ESTAR MIRANDO LAS MUSARAÑAS, MEJOR PIDO LA CUENTA Y ME VOY SOLA.",
            VICTIMISMO: "CLARO, OTRA NOCHE MÁS SIENDO LA DECORACIÓN DE UN BAR PORQUE NADIE SABE CONECTAR.",
            CALMA: "ME GUSTA ESA SERENIDAD. LA MAYORÍA DE LOS HOMBRES ESTÁN DESESPERADOS POR IMPRESIONARME.",
            PAUSA: "VALE... ME GUSTA QUE NO TENGAS PRISA. DISFRUTEMOS DE LA MÚSICA UN MOMENTO.",
            DECEPCION: "PENSÉ QUE TENÍAS MÁS CLASE. ESTA CONVERSACIÓN SE ESTÁ VOLVIENDO MUY... ORDINARIA.",
            DESENCANTO: "SABES... DE REPENTE SE ME HA PASADO EL INTERÉS. IGUAL NO ERES QUIEN YO CREÍA.",
            INSEGURIDAD: "A VECES PIENSO QUE ESTE MUNDO ES DEMASIADO SUPERFICIAL PARA ALGUIEN COMO YO.",
            DESILUSION: "CREO QUE MEJOR ME VOY A CASA. NO SIENTO ESA CHISPA QUE BUSCO.",
            FINAL_HOT: "ERES UN ATREVIDO... PERO ME GUSTA. VAMOS A ESE PALCO DE LA ÓPERA QUE MENCIONASTE.",
            FINAL_ZEN: "HACE TIEMPO QUE NO CONECTABA ASÍ CON ALGUIEN. NO QUIERO QUE ESTO TERMINE... ¿VAMOS A MI CASA?",
            FINAL_COLD: "HA ESTADO BIEN LA CHARLA. IGUAL NOS VEMOS EN EL TEATRO ALGÚN DÍA."
        }
    },
    

    // --- CATEGORÍA: TRABAJO ---
    { 
        id: 'job_boss', 
        category: 'TRABAJO', 
        title: 'EL JEFE', 
        cover: '/images/CruceDeCaminos/t_previo.png', 
        inicioImg: '/images/CruceDeCaminos/t_inicio.png', 
        outImg: '/images/CruceDeCaminos/t_out.png', 
        ventaImg: '/images/CruceDeCaminos/t_trabajo.png', 
        superImg: '/images/CruceDeCaminos/t_aumento.png', 
        videoSrc: '/videos/CC_oficina.mp4', 
        p2Inercia: { 1: 2, 3: 2, 5: 1, 7: 2 }, 
        context: "TU JEFE TE HA LLAMADO AL DESPACHO. TIENE LOS INFORMES Y NO PARECE FELIZ.", 
        dialogues: {
            intro: "SIÉNTATE. TENEMOS QUE HABLAR DE LOS RESULTADOS DEL ÚLTIMO TRIMESTRE.",
            INTRO_ZEN: "HOLA. PASA, POR FAVOR. ME GUSTARÍA COMENTARTE ALGUNAS IDEAS NUEVAS.",
            EGO: "NO ME INTERESAN TUS EXCUSAS. LOS NÚMEROS SON LOS QUE SON.",
            CRITICA: "CREO QUE TE HAS RELAJADO DEMASIADO ÚLTIMAMENTE. ¿QUÉ ESTÁ PASANDO?",
            VENTAJA: "YA QUE ESTAMOS AQUÍ... ¿CREES QUE ERES EL ÚNICO QUE MERECE UN CAMBIO?",
            IMPULSO: "¡REACCIONA! NECESITO SOLUCIONES, NO QUE TE QUEDES AHÍ MIRANDO.",
            ANIMO: "ME GUSTA ESA ACTITUD. SI SIGUES ASÍ, LLEGARÁS LEJOS EN ESTA EMPRESA.",
            RECLAMO: "PARECE QUE MI TIEMPO NO TE IMPORTA NADA. ESTOY HABLANDO CONTIGO.",
            VICTIMISMO: "PARECE QUE SOY EL ÚNICO QUE SE PREOCUPA POR EL FUTURO DE ESTE EQUIPO.",
            CALMA: "VALE, VEO QUE TIENES TUS RAZONES. VAMOS A ANALIZARLO CON CALMA.",
            PAUSA: "ESTÁ BIEN. TÓMATE UN DÍA PARA PENSARLO Y VOLVEMOS A HABLAR.",
            DECEPCION: "ESPERABA MUCHO MÁS DE TI EN ESTE PROYECTO. ME HAS FALLADO.",
            DESENCANTO: "NO SÉ SI ERES LA PERSONA ADECUADA PARA ESTE PUESTO A LARGO PLAZO.",
            INSEGURIDAD: "A VECES PIENSO QUE ESTA EMPRESA SE TE QUEDA GRANDE.",
            DESILUSION: "CREO QUE MEJOR BUSCAMOS A OTRA PERSONA PARA ESTA RESPONSABILIDAD.",
            FINAL_HOT: "VALE, SIGUE CON TU TRABAJO. ESPERO VER RESULTADOS PRONTO.",
            FINAL_ZEN: "HAS HECHO UN TRABAJO IMPECABLE. TE MERECES ESE AUMENTO.",
            FINAL_COLD: "BUENO, TERMINA LO QUE TIENES PENDIENTE Y YA VEREMOS."
        }
    },
    
    // --- ESCENARIO: EL REPARTIDOR (TRABAJO) ---
{ 
    id: 'job_delivery', 
    category: 'TRABAJO', 
    title: 'EL REPARTIDOR', 
    cover: '/images/CruceDeCaminos/t_previo2.png', 
    inicioImg: '/images/CruceDeCaminos/t_inicio2.png', 
    outImg: '/images/CruceDeCaminos/t_out2.png', 
    ventaImg: '/images/CruceDeCaminos/t_entrega2.png', // Realizar trabajo
    superImg: '/images/CruceDeCaminos/t_propina2.png', // Propina
    videoSrc: '/videos/CC_reparto.mp4', 
    p2Inercia: { 1: 1, 3: 2, 5: 1, 7: 1 }, // Cliente agresivo y con prisa
    context: "LLEGAS TARDE A UNA ENTREGA DE ALTA PRIORIDAD. EL CLIENTE TE ESPERA EN LA PUERTA Y NO TIENE BUENA CARA.", 
    dialogues: {
        intro: "LLEGAS TARDE. EL PAQUETE ES URGENTE Y ME HAS HECHO PERDER TODA LA MAÑANA. ¿TIENES ALGUNA EXCUSA O ME DAS MI PEDIDO YA?",
        INTRO_ZEN: "POR FIN LLEGAS. ESTABA PREOCUPADO POR EL CONTENIDO. ¿HA HABIDO ALGÚN PROBLEMA EN EL CAMINO?",
        EGO: "MIRA, NO ME CUENTES TU VIDA. AQUÍ EL QUE PAGA EL SERVICIO SOY YO Y EXIJO PUNTUALIDAD. DAME ESO.",
        CRITICA: "VEO QUE LA CAJA TIENE UN RASGUÑO... ¿SIEMPRE TRATÁIS ASÍ LA MERCANCÍA DE VALOR?",
        VENTAJA: "DAME EL PAQUETE. Y ESPERO QUE EL SEGURO CUBRA CUALQUIER FALLO, PORQUE PIENSO REVISARLO AL DETALLE.",
        IMPULSO: "¡REACCIONA! TENGO PRISA. DAME EL TERMINAL PARA FIRMAR Y DEJA DE MIRARME COMO SI NO SUPIERAS QUÉ HACER.",
        ANIMO: "VALE, VEO QUE AL MENOS TE PREOCUPAS PORQUE LLEGUE BIEN. FIRMARÉ AQUÍ SI ME ASEGURAS QUE TODO ESTÁ EN ORDEN.",
        RECLAMO: "¡EY! ¿ME ESTÁS ESCUCHANDO? ESTOY HABLANDO DE UNA QUEJA FORMAL Y PARECE QUE ESTÁS EN LAS NUBES.",
        VICTIMISMO: "CLARO, COMO SÓLO SOY UN CLIENTE PARTICULAR OS DA IGUAL DEJARME PARA EL FINAL DE LA RUTA. QUÉ POCO PROFESIONAL.",
        CALMA: "ESTÁ BIEN, RESPIRA. VEO QUE HAS VENIDO CORRIENDO. VAMOS A COMPROBAR QUE TODO ESTÉ BIEN SIN PRECIPITARNOS.",
        PAUSA: "VALE... DÉJAME COMPROBAR EL CÓDIGO DE ENVÍO UN SEGUNDO. NO ME ATABALES.",
        DECEPCION: "ESPERABA OTRO TRATO DE ESTA EMPRESA. ME HABÍAN DICHO QUE ERÁIS LOS MEJORES, PERO VEO QUE NO.",
        DESENCANTO: "SABES... TENÍA PENSADO USAROS PARA TODOS MIS ENVÍOS, PERO ESTA EXPERIENCIA ME HA DEJADO MUY FRÍO.",
        INSEGURIDAD: "NO SÉ SI DEBERÍA ACEPTAR EL PAQUETE EN ESTE ESTADO. ¿Y SI DENTRO ESTÁ TODO ROTO?",
        DESILUSION: "MIRA, DÉJALO. DAME EL PAQUETE Y VETE. YA RECLAMARÉ A LA CENTRAL PORQUE ESTO NO TIENE NOMBRE.",
        FINAL_HOT: "VALE, AQUÍ TIENES LA FIRMA. PERO NO ESPERES QUE TE PONGA UNA BUENA VALORACIÓN.",
        FINAL_ZEN: "HAS SABIDO GESTIONAR MUY BIEN EL PROBLEMA. AQUÍ TIENES UNA PROPINA POR LAS MOLESTIAS. BUEN TRABAJO.",
        FINAL_COLD: "BUENO, PAQUETE ENTREGADO. TERMINA TU RUTA Y QUE TENGAS MÁS CUIDADO LA PRÓXIMA VEZ."
    }
},

// --- ESCENARIO: LA FREELANCE (TRABAJO) ---
{ 
    id: 'job_freelance', 
    category: 'TRABAJO', 
    title: 'LA FREELANCE', 
    cover: '/images/CruceDeCaminos/t_previo3.png', 
    inicioImg: '/images/CruceDeCaminos/t_inicio3.png', 
    outImg: '/images/CruceDeCaminos/t_out3.png', 
    ventaImg: '/images/CruceDeCaminos/t_encargo3.png', // Más trabajo
    superImg: '/images/CruceDeCaminos/t_aumento3.png', // Aumento/Bonus
    videoSrc: '/videos/CC_freelance.mp4', 
    p2Inercia: { 1: -1, 3: -2, 5: -1, 7: -1 }, // Cliente "Ghost" que se enfría y desaparece
    context: "ESTÁS FRENTE AL MONITOR. TE LLEGA UN MENSAJE DE TU CLIENTE PRINCIPAL SOBRE EL ÚLTIMO PROYECTO. SU TONO ES DISTANTE.", 
    dialogues: {
        intro: "[ CHAT_LOG ]: HE VISTO EL AVANCE. NO ES EXACTAMENTE LO QUE ACORDAMOS. NECESITO CAMBIOS PARA HOY MISMO O NO PODREMOS SEGUIR.",
        INTRO_ZEN: "[ CHAT_LOG ]: HOLA. GRACIAS POR ENVIARLO A TIEMPO. VOY A REVISARLO, PERO TIENE BUENA PINTA.",
        EGO: "OYE, TE PAGO POR SEGUIR MIS INDICACIONES, NO PARA QUE TE PONGAS CREATIVO POR TU CUENTA. AJÚSTATE AL BRIEF.",
        CRITICA: "NO ENTIENDO ESTA PARTE DEL DISEÑO. ¿ESTÁS SEGURO DE QUE SABES LO QUE ESTÁS HACIENDO O HAS COPIADO LA IDEA?",
        VENTAJA: "SI QUIERES QUE TE PAGUE EL EXTRA POR URGENCIA, VAS A TENER QUE ENTREGARLO ANTES DE LAS 5 SIN ERRORES.",
        IMPULSO: "¡CONTESTA! LLEVO UNA HORA ESPERANDO UNA SEÑAL DE VIDA Y EL PROYECTO ESTÁ PARADO POR TU CULPA.",
        ANIMO: "ME GUSTA POR DÓNDE VAS. SI LOGRAS PULIR ESTE DETALLE, TE ENCARGARÉ EL SIGUIENTE MÓDULO MAÑANA MISMO.",
        RECLAMO: "INCREÍBLE. ESTOY AQUÍ ESCRIBIÉNDOTE Y PARECE QUE ESTOY HABLANDO CON UN BOT. DIME ALGO YA.",
        VICTIMISMO: "AL FINAL TENDRÉ QUE HACERLO YO TODO PORQUE PARECE QUE NO OS TOMÁIS EN SERIO LOS PLAZOS DE LOS DEMÁS.",
        CALMA: "VALE, ENTIENDO TUS ARGUMENTOS TÉCNICOS. VAMOS A DARLE UNA VUELTA SIN PRISAS PARA QUE QUEDE PERFECTO.",
        PAUSA: "ESTÁ BIEN... ME GUSTA TU CALMA. ME HAS HECHO PENSAR. DÉJAME QUE LO CONSULTE CON EL EQUIPO.",
        DECEPCION: "PENSÉ QUE HABÍAMOS CONECTADO CON EL CONCEPTO, PERO ESTO ME PARECE MUY FLOJO POR TU PARTE.",
        DESENCANTO: "MIRA, YA NO LO VEO CLARO. IGUAL DEBERÍAMOS DEJAR EL PROYECTO AQUÍ Y BUSCAR OTRA SOLUCIÓN.",
        INSEGURIDAD: "A VECES PIENSO QUE ESTE TRABAJO TE QUEDA GRANDE Y QUE NO VAS A PODER CON LA ENTREGA FINAL.",
        DESILUSION: "SI NO TIENES GANAS DE TRABAJAR EN ESTO, DÍMELO. PREFIERO CORTAR AHORA QUE PERDER MÁS TIEMPO.",
        FINAL_HOT: "VALE, EL CAMBIO ES CORRECTO. SIGUE CON EL TRABAJO Y NO TE DESVÍES DEL PLAN.",
        FINAL_ZEN: "PROYECTO APROBADO. HAS GESTIONADO TODO DE FORMA INCREÍBLE. TE HE ENVIADO UN BONUS Y SUBIMOS TU TARIFA.",
        FINAL_COLD: "ESTÁ BIEN POR AHORA. TERMINA LO QUE QUEDA Y YA HABLAREMOS DEL SIGUIENTE ENCARGO."
    }
}
];
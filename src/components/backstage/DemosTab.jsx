import React, { useState } from 'react';
import { PROMPT_GENERAL } from '../../data/prompts/backstagePrompts.js';

const DemoViewer = ({ titulo, subtitulo, videoUrl, vertical = false }) => (
  <div className="flex flex-col gap-2 items-center text-center">
    <div className="text-2xl text-gray-400 uppercase tracking-widest font-bold"
      style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {titulo}
    </div>
    <p style={{ fontFamily: "'Inter', sans-serif" }}
      className="text-xl text-gray-600 mb-1">{subtitulo}</p>
    <div
      className="rounded overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] bg-black mx-auto"
      style={{
        aspectRatio: vertical ? '9/16' : '16/9',
        width: vertical ? '420px' : '720px',
      }}
    >
      <video
        src={videoUrl}
        controls
        playsInline
        className="w-full h-full object-cover"
      />
</div>
            <div className="h-12" />
          </div>
);

const HEADING      = "'Noto Sans', sans-serif";
const INTER        = "'Inter', sans-serif";
const SPACE_GROTESK = "'Space Grotesk', sans-serif";

const ESPACIOS_TABS = [
  { id: 'tarjetas',  label: 'AHORRA CON TARJETAS DE REGALO' },
  { id: 'prompt_ia', label: 'PROMPT IA'                     },
];

const PromptBlock = ({ tabLabel = '', promptText = '', showIntro = true }) => {
  const [copiado, setCopiado] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  return (
    <div className="flex flex-col items-center text-center gap-5 w-full max-w-3xl mx-auto mt-10 pt-10 border-t border-white/10">
      {showIntro && (
        <div style={{ fontFamily: INTER }}
          className="text-lg text-white/90 leading-relaxed font-medium">
          <p>En Bro7Vision hemos preparado un Prompt especial para este espacio.</p>
          <p>Cópialo y llévalo a tu IA favorita.</p>
          <br />
          <p>Dentro encontrarás todo lo que necesita saber:</p>
          <p>qué es Bro7Vision, cómo funciona este formato,</p>
          <p>las dimensiones y características técnicas del espacio</p>
          <p>y ejemplos visuales con enlaces directos</p>
          <p>para que tu IA los analice si puede navegar.</p>
          <br />
          <p>Pulsa el botón, pégalo y deja que tu IA trabaje.</p>
          <p>A ver qué te cuenta.</p>
        </div>
      )}
      <button
        onClick={handleCopy}
        style={{ fontFamily: HEADING }}
        className="px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-[0_0_30px_rgba(0,255,200,0.3)] hover:shadow-[0_0_50px_rgba(0,255,200,0.5)]"
      >
        {copiado ? '¡COPIADO!' : `COPIAR PROMPT ${tabLabel}`}
      </button>
      <p style={{ fontFamily: INTER }} className="text-base text-gray-500 mt-2">
        ¿Prefieres una propuesta personalizada? →{' '}
        <a href="mailto:contacto@bro7vision.com" className="text-cyan-400 hover:text-cyan-300 underline">contacto@bro7vision.com</a>
      </p>
    </div>
  );
};

const CopyButtonInline = ({ promptText = '' }) => {
  const [copiado, setCopiado] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  return (
    <div className="flex flex-col items-center text-center gap-5 w-full max-w-3xl mx-auto">
      <button
        onClick={handleCopy}
        style={{ fontFamily: HEADING }}
        className="px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-[0_0_30px_rgba(0,255,200,0.3)] hover:shadow-[0_0_50px_rgba(0,255,200,0.5)]"
      >
        {copiado ? '¡COPIADO!' : 'COPIAR PROMPT IA'}
      </button>
      <p style={{ fontFamily: INTER }} className="text-base text-gray-500 mt-2">
        ¿Prefieres una propuesta personalizada? →{' '}
        <a href="mailto:contacto@bro7vision.com" className="text-cyan-400 hover:text-cyan-300 underline">contacto@bro7vision.com</a>
      </p>
    </div>
  );
};

const ComoFuncionaTabs = () => {
  const [active, setActive] = useState('tarjetas');
  return (
    <div className="flex flex-col gap-0">
      <div className="flex border-b border-white/10 justify-center">
        {ESPACIOS_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{ fontFamily: HEADING }}
            className={`px-4 py-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
              active === t.id
                ? 'text-white border-b-2 border-cyan-400 bg-cyan-900/20 shadow-[0_0_20px_rgba(0,255,200,0.15)]'
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'tarjetas' && (
        <div className="flex flex-col items-center py-12 px-6 text-gray-700"
          style={{ fontFamily: INTER }}>

          <div style={{ fontFamily: INTER }}
            className="text-xl md:text-2xl text-gray-300 leading-relaxed md:leading-loose text-center font-medium max-w-6xl mx-auto mb-12">

            <p className="mb-1 text-white font-bold">Las <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">Tarjetas de Regalo</span> son tu moneda de publicidad.</p>

            <div className="h-6" />

            <p className="mb-1">En lugar de pagar toda tu campaña en efectivo, puedes cubrir parte del coste</p>
            <p className="mb-1">con tarjetas reales que los usuarios de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span> canjean con sus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Lunas</span>.</p>

            <div className="h-8" />

            <p className="mb-1 text-white font-bold">Así funciona el sistema:</p>

            <p className="mb-1"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span> siempre cobra un seguro publicitario mínimo en efectivo.</p>
            <p className="mb-1">Es el <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">20%</span> de tu presupuesto, con un máximo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">60€</span>.</p>
            <p className="mb-1">El resto lo puedes cubrir con <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">tarjetas</span>.</p>

            <div className="h-8" />

            <p className="mb-1 text-white font-bold">Cuatro tipos de tarjeta, con ratios de cobertura:</p>

            <div className="h-6" />

            <img
              src="/images/demotarjetas.webp"
              alt="Tipos de Tarjetas de Regalo Brovision"
              className="mx-auto"
              style={{ maxWidth: 600, width: '100%', display: 'block', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)', margin: '8px auto 24px' }}
            />

            <p className="mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-400 font-bold">Luna 100</span>
              {' '}— Descuento del 100% en el producto o servicio que describas.
            </p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• Ideal para muestras gratuitas, primeras visitas o contenidos digitales de captación.</p>
            <p className="mb-4 text-left max-w-2xl mx-auto">• No tiene ratio: el comercio asume el coste íntegro del obsequio.</p>

            <p className="mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-400 font-bold">Luna Plata</span>
              {' '}— tarjeta de regalo condicional a compra mínima. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">Ratio 0.50</span>.
            </p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">100€</span> en tarjetas Plata cubren <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">50€</span> de campaña.</p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• Hay tarjetas de Envío Gratis, 3€, 5€, 10€, 20€, 40€, 60€, 100€, 200€</p>
            <p className="mb-4 text-left max-w-2xl mx-auto">• El valor de compra mínima lo añades tú, según necesidad de ventas.</p>

            <p className="mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Luna Oro</span>
              {' '}— tarjeta de regalo de compra libre (1€ = 1€). <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">Ratio 0.80</span>.
            </p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">100€</span> en tarjetas Oro cubren <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">80€</span> de campaña.</p>
            <p className="mb-4 text-left max-w-2xl mx-auto">• Hay tarjetas de 5€, 10€, 20€, 40€, 60€, 100€, 200€</p>

            <p className="mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500 font-bold">Luna Diamante</span>
              {' '}— tarjeta de regalo por producto o pack concreto. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">Ratio 0.80</span>.
            </p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• 200€, 500€ o 1.000€ en artículos reales.</p>
            <p className="mb-4 text-left max-w-2xl mx-auto">• El <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Estudio</span> revisa y activa cada premio antes de publicarlo.</p>

            <div className="h-8" />

            <p className="mb-1">Esto quiere decir que si tu negocio precisa espacios publicitarios</p>
            <p className="mb-1">por valor de 500€, puedes cubrirlos con distintas tarjetas de regalo,</p>
            <p className="mb-1">y solo abonar esos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">60€</span> de seguro publicitario de tope. ¿Es posible?</p>
            <p className="mb-1">Sí, esto es posible y para ello <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span> ha desarrollado un <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Prompt</span>.</p>
            <p className="mb-1">Para que lo puedas analizar junto a tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">IA</span>, y así elaborar</p>
            <p className="mb-1">la mejor estrategia para tu negocio.</p>

            <div className="h-6" />

            <p className="mb-1">La estrategia base consiste en calcular</p>
            <p className="mb-1">el presupuesto total de los espacios publicitarios que necesites</p>
            <p className="mb-1">y sobre todo medir los <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">precios por alcance geográfico</span>.</p>

            <div className="h-6" />

            <p className="mb-1">Una vez que tengas el coste total de lo que necesitas, hay que construir un <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Nido</span></p>
            <p className="mb-1">con un surtido de varios tipos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">Tarjetas de regalo</span> inactivas,</p>
            <p className="mb-1">para luego activarlas en el <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Carrito</span> general para que se descuente</p>
            <p className="mb-1">el monto a abonar por esos espacios publicitarios que necesitas.</p>

            <div className="h-8" />

            <p className="mb-1 text-white font-bold">DÓNDE CREAR LAS TARJETAS Y CAMPAÑAS:</p>
            <p className="mb-1">Todo se gestiona desde el <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Backstage</span> de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span>, en la pestaña <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">"COMERCIO"</span>.</p>
            <p className="mb-1">Ahí encontrarás:</p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• "Tarjetas de Regalo" para crear tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Nido</span> de tarjetas y Campañas.</p>
            <p className="mb-4 text-left max-w-2xl mx-auto">• "Carrito" para revisar tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Nido</span> y activar las tarjetas antes de confirmar tu campaña</p>
            <p className="mb-1">El comercio debe tener cuenta activa en <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span> para acceder al <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Backstage</span>.</p>
            <p className="mb-1">Si aún no tienes cuenta, solicítala en tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Booster Studio</span>, donde está tu perfil en la pestaña ANUNCIANTE o escribe a{' '}
              <a href="mailto:contacto@bro7vision.com" className="text-cyan-400 hover:text-cyan-300 underline">contacto@bro7vision.com</a>
            </p>

            <div className="h-8" />

            <p className="mb-1 text-white font-bold">El Nido.</p>
            <p className="mb-1">Antes de contratar publicidad, creas tus tarjetas y las dejas en el <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Nido</span></p>
            <p className="mb-1">con un nombre de campaña.</p>
            <p className="mb-1">Cuando vayas al <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Carrito</span> a confirmar tu contrato,</p>
            <p className="mb-1">el sistema aplica el descuento automáticamente.</p>

            <div className="h-8" />

            <p className="mb-1">¿No sabes por dónde empezar?</p>
            <p className="mb-1">En la pestaña <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">PROMPT IA</span> tienes un mega Prompt para copiarlo</p>
            <p className="mb-1">y llevarlo a tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">IA favorita</span>.</p>
            <p className="mb-1">Te hará las preguntas clave y calculará una <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">campaña publicitaria óptima</span>.</p>

          </div>

        </div>
      )}

      {active === 'prompt_ia' && (
        <div className="flex flex-col items-center py-12 px-6 text-gray-700"
          style={{ fontFamily: INTER }}>

          <div style={{ fontFamily: INTER }}
            className="text-xl md:text-2xl text-gray-300 leading-relaxed md:leading-loose text-center font-medium max-w-6xl mx-auto mb-12">

            <p className="mb-4">En <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span> hemos preparado un <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Prompt</span> especial para todos los espacios.</p>

            <div className="h-6" />

            <p className="mb-4">Cópialo y llévalo a tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">IA favorita</span>.</p>

            <div className="h-6" />

            <p className="mb-4">Dentro encontrarás todo lo que necesita saber:</p>

            <p className="mb-2 text-left max-w-2xl mx-auto">• Qué es <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Bro7Vision</span></p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• Cómo armar una <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">campaña publicitaria</span> eficiente</p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• Cómo diseñar y combinar las <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">tarjetas de regalo</span></p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• Medir los <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">alcances geográficos</span>, calcular <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-400 font-bold">precios</span></p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• Cómo funcionan los <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">formatos</span>, las <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">dimensiones</span></p>
            <p className="mb-2 text-left max-w-2xl mx-auto">• <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">Características técnicas</span> de los mismos</p>
            <p className="mb-4 text-left max-w-2xl mx-auto">• <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">Ejemplos visuales</span> con enlaces directos</p>

            <p className="mb-4">Para que tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">IA</span> los analice si puede navegar.</p>

            <div className="h-6" />

            <p className="mb-4">Pulsa el botón, pégalo y deja que tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold">IA</span> trabaje.</p>

            <div className="h-6" />

            <p className="">A ver qué te cuenta.</p>

          </div>

          <CopyButtonInline promptText={PROMPT_GENERAL} />

        </div>
      )}

    </div>
  );
};

const MANIFIESTO = [
  {
    titulo: 'Sin molestia, sin rechazo',
    color: 'text-cyan-400',
    cuerpo: [
      [{ t: 'La publicidad invasiva molesta al usuario' }],
      [{ t: 'y en consecuencia ' }, { t: 'daña a la marca.', c: 'text-cyan-400' }],
      [{ t: 'Un anuncio que interrumpe una tarea' }],
      [{ t: 'genera una ' }, { t: 'asociación negativa', c: 'text-cyan-400' }, { t: ' automática e inconsciente.' }],
      [{ t: 'Brovision', c: 'text-cyan-400' }, { t: ' diseña cada espacio publicitario' }],
      [{ t: 'para que aparezca de forma natural,' }],
      [{ t: 'sin bloquear, sin interrumpir.', c: 'text-cyan-400' }],
      [{ t: 'El espectador nunca siente que le están vendiendo algo.' }],
      [{ t: 'Y eso ' }, { t: 'cambia todo.', c: 'text-cyan-400' }],
    ],
  },
  {
    titulo: 'La publicidad que acompaña',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600',
    cuerpo: [
      [{ t: 'En Brovision', c: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500' }],
      [{ t: 'el anunciante acompaña al usuario mientras gana puntos.' }],
      [{ t: 'El cerebro registra la marca' }],
      [{ t: 'como parte de una ' }, { t: 'experiencia positiva.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500' }],
      [{ t: 'La simpatía hacia la marca no se construye con insistencia.' }],
      [{ t: 'Se construye con ' }, { t: 'presencia en el momento correcto.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500' }],
    ],
  },
  {
    titulo: 'Sin engaños',
    color: 'text-lime-200',
    cuerpo: [
      [{ t: 'Existen formatos publicitarios que ' }, { t: 'simulan ser contenido editorial.', c: 'text-lime-200' }],
      [{ t: 'Podcasts donde el invitado llegó ' }, { t: '"por mérito"', c: 'text-lime-200' }],
      [{ t: 'o entrevistas donde la ' }, { t: 'objetividad tiene precio.', c: 'text-lime-200' }],
      [{ t: 'El espectador lo intuye aunque no lo sepa.' }],
      [{ t: 'Nuestra publicidad es ' }, { t: 'visible y transparente.', c: 'text-lime-200' }],
      [{ t: 'El usuario sabe que existe y la acepta porque le aporta ' }, { t: 'algo a cambio.', c: 'text-lime-200' }],
    ],
  },
  {
    titulo: 'Dos formatos, una dirección',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600',
    cuerpo: [
      [{ t: 'Nuestros espacios son de dos tipos:' }],
      [{ t: 'Publicidad muda', c: 'text-pink-200' }],
      [{ t: '(Fondos Reality Trivia, Slide Rail, Games, Tarjetas de Regalo)', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
      [{ t: 'presencia visual limpia', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }, { t: ' mientras el usuario juega o explora;' }],
      [{ t: 'Menciones Bro7Band', c: 'text-pink-200' }, { t: ' :' }],
      [{ t: 'integración no intrusiva dentro del universo de los personajes.' }],
      [{ t: 'Formatos distintos, mismo principio:' }],
      [{ t: 'transparencia, contexto positivo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }, { t: ' y ' }, { t: 'potencial real de conversión.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500' }],
    ],
  },
  {
    titulo: 'La claridad que multiplica tus conversiones',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-fuchsia-600',
    cuerpo: [
      [{ t: 'Con ' }, { t: 'Brovision', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' puedes por primera vez analizar' }],
      [{ t: 'el rendimiento de tu campaña ' }, { t: 'sin interferencias.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'Al eliminar las ' }, { t: 'variables', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' que contaminan cualquier ' }, { t: 'análisis convencional:', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'el ' }, { t: 'formato invasivo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' que genera rechazo, el ' }, { t: 'algoritmo', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' que ' }, { t: 'decide por ti,', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'el ' }, { t: 'momento de interrupción', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' que predispone negativamente al usuario' }],
      [{ t: 'lo que queda es una ' }, { t: 'lectura limpia y accionable.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ spacer: true }],
      [{ t: 'Si los resultados no son los esperados, sabes ' }, { t: 'exactamente dónde mirar:', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'la ' }, { t: 'imagen de marca', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' que proyectas, la ' }, { t: 'claridad de tu comunicación', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ t: 'o la ' }, { t: 'competitividad de tu oferta.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }, { t: ' ' }, { t: 'Sin excusas externas. Sin ruido.', c: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-fuchsia-500' }],
      [{ spacer: true }],
      [{ t: 'Esa claridad es la herramienta más poderosa para crecer.', c: 'text-white', s: '0 0 12px rgba(255,255,255,0.35)' }],
    ],
  },
];

const FILAS_TABLA = [
  ['¿El usuario sabe que es publicidad?', 'No siempre', 'Siempre'],
  ['¿Interrumpe la experiencia?', 'Sí', 'No'],
  ['¿El usuario lo acepta?', 'Lo tolera', 'Lo busca'],
  ['¿Genera simpatía hacia la marca?', 'Neutral / rechazo', 'Positiva'],
  ['¿Depende de algoritmos externos?', 'Sí', 'No'],
  ['¿Permite detectar fallos reales?', 'No', 'Sí'],
  ['¿Es honesta con el espectador?', 'No siempre', 'Siempre'],
];

const EstudioMarketingTab = () => {
  const [subTab, setSubTab] = useState('blog');

  return (
    <div className="w-full px-8 md:px-20 py-12 flex flex-col items-center">

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;700&display=swap');`}</style>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-16 w-full justify-center">
        {[
          { id: 'blog',    label: 'QUÉ ES BRO7VISION' },
          { id: 'estudio', label: 'FORMATOS PUBLICITARIOS' },
          { id: 'demos',   label: 'DEMOS & GUÍA'       },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{ fontFamily: HEADING }}
            className={`px-8 py-4 text-sm md:text-base font-black uppercase tracking-widest transition-all ${
              subTab === t.id
                ? 'text-white border-b-2 border-cyan-400'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ───── TAB: FORMATOS PUBLICITARIOS ───── */}
      {subTab === 'estudio' && (
        <div className="flex flex-col gap-16 px-2 py-4 items-center w-full max-w-5xl">

          {/* ─── PC / TABLET ─── */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <h3 className="text-2xl text-white uppercase tracking-widest font-bold"
              style={{ fontFamily: HEADING }}>
              9 CANALES REALITY — PC / TABLET
            </h3>
            <div style={{ fontFamily: INTER }}
              className="text-lg text-white/90 leading-relaxed text-center max-w-3xl font-medium">
              <p>Tu publicidad integrada en un escenario inmersivo de 16:9.</p>
              <p>El anuncio aparece y desaparece de forma natural sobre el fondo, sin interrumpir.</p>
              <p>Lo que lo hace diferente</p>
              <p>es que tú mismo formulas una pregunta al participante relacionada con tu marca</p>
              <p>y el usuario necesita contemplar tu anuncio para poder responderla.</p>
              <br />
              <p>Los Trivia varían en cada canal y se renuevan en cada fase lunar.</p>
              <p>Los usuarios pasan por ellos para ganar sus Lunas.</p>
              <p className="text-white font-bold">Tu presencia está garantizada.</p>
              <br />
              <p className="text-white/80 text-base">Formato requerido: video o banner vertical 9:16,</p>
              <p className="text-white/80 text-base">incrustado en el lateral derecho del escenario.</p>
            </div>
            <DemoViewer
              titulo="VIDEO DEMO"
              subtitulo=""
              videoUrl="https://media.bro7vision.com/HorizontalDemo.mp4"
              vertical={false}
            />
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

          {/* ─── MÓVIL ─── */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <h3 className="text-2xl text-white uppercase tracking-widest font-bold"
              style={{ fontFamily: HEADING }}>
              9 CANALES REALITY — MÓVIL
            </h3>
            <div style={{ fontFamily: INTER }}
              className="text-lg text-white/90 leading-relaxed text-center max-w-3xl font-medium">
              <p>La misma mecánica en formato vertical inmersivo 9:16.</p>
              <p>El usuario está en modo exploración en su móvil</p>
              <p>y tu marca aparece integrada mientras participa en el Trivia de su canal.</p>
              <p>Una pregunta vinculada a tu anuncio asegura que el usuario lo observe de verdad,</p>
              <p>no de reojo.</p>
              <br />
              <p>Los Trivia varían en cada canal y se renuevan en cada fase lunar.</p>
              <p>Los usuarios pasan por ellos para ganar sus Lunas.</p>
              <p className="text-white font-bold">Tu presencia está garantizada.</p>
              <br />
              <p className="text-white/80 text-base">Formato requerido: video o banner horizontal 16:9,</p>
              <p className="text-white/80 text-base">adaptado al escenario móvil.</p>
            </div>
            <DemoViewer
              titulo="VIDEO DEMO"
              subtitulo=""
              videoUrl="https://media.bro7vision.com/VerticalDemo1.mp4"
              vertical={true}
            />
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

          {/* ─── MENCIONES BRO7BAND ─── */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <h3 className="text-2xl text-white uppercase tracking-widest font-bold"
              style={{ fontFamily: HEADING }}>
              MENCIONES EN BRO7BAND
            </h3>
            <div style={{ fontFamily: INTER }}
              className="text-lg text-white/90 leading-relaxed text-center max-w-3xl font-medium">
              <p>Bro7Band está formado por 10 grupos de personajes únicos.</p>
              <p>Cada uno con su voz, su estilo y su propia audiencia.</p>
              <br />
              <p>En cada fase lunar,</p>
              <p>9 grupos emiten un audio exclusivo</p>
              <p>con una Palabra Clave oculta en el mensaje.</p>
              <p>Los usuarios la buscan activamente para llevarse sus Lunas.</p>
              <br />
              <p>Lo que lo hace diferente</p>
              <p>es que tu negocio puede ser esa Palabra Clave.</p>
              <p>Tu marca, pronunciada por los personajes.</p>
              <p>Tu nombre, en boca de todos.</p>
              <br />
              <p>El décimo grupo reúne a toda la banda</p>
              <p>en episodios especiales de la Saga Bro7Band</p>
              <p>y en el podcast de los OSOS:</p>
              <p>Lara, Tito y Puffo, generado con Inteligencia Artificial.</p>
              <p>Tu Marca, Producto o Servicio</p>
              <p>también tienen hueco en su micrófono.</p>
            </div>

            <img
              src="/images/menciones_broband.webp"
              alt="Menciones Bro7Band"
              className="w-full max-w-3xl rounded-lg border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            />
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

          {/* ─── SLIDE RAIL ─── */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <h3 className="text-2xl text-white uppercase tracking-widest font-bold"
              style={{ fontFamily: HEADING }}>
              SLIDE RAIL TRIVIA — CANJES DE LUNAS | SHOP AMIGOS
            </h3>
            <div style={{ fontFamily: INTER }}
              className="text-lg text-white/90 leading-relaxed text-center max-w-3xl font-medium">
              <p>Slide Rail Trivia vive en dos sectores clave:</p>
              <p>Canjes de Lunas y Shop Amigos.</p>
              <br />
              <p>En el lateral izquierdo circula un carrusel de 8 banners.</p>
              <p>Los slots 1, 3, 5 y 7 son de Bro7Vision.</p>
              <p>Los slots 2, 4, 6 y 8 son tuyos.</p>
              <br />
              <p>En el lateral derecho, el Trivia.</p>
              <p>El usuario debe decidir si lo que ve en el banner numerado</p>
              <p>es verdadero o falso.</p>
              <p>Cada respuesta le acerca a sus Lunas.</p>
              <br />
              <p>Lo que lo hace diferente</p>
              <p>es que el usuario estudia tu banner para poder jugar.</p>
              <p>No lo ignora. Lo necesita.</p>
              <br />
              <p>Las posibilidades creativas son infinitas.</p>
              <p>Tu imagen, tu mensaje, tu marca</p>
              <p>en el centro de la acción.</p>
              <br />
              <p>Formato recomendado: vertical.</p>
              <p>Dimensiones: 450 × 1080 px.</p>
            </div>
            <img
              src="/images/slideRail_Trivia.webp"
              alt="Slide Rail Trivia"
              className="w-full max-w-3xl rounded-lg border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            />
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

          {/* ─── GAMES ─── */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <h3 className="text-2xl text-white uppercase tracking-widest font-bold"
              style={{ fontFamily: HEADING }}>
              GAMES — COSMIC PORTAL | THE SEVEN GATES
            </h3>
            <div style={{ fontFamily: INTER }}
              className="text-lg text-white/90 leading-relaxed text-center max-w-3xl font-medium">
              <p>En el sector Games hay dos Trivias</p>
              <p>donde tu Marca, Producto o Servicio</p>
              <p>pueden estar en el centro del juego.</p>
              <br />
              <p>Cosmic Portal y The Seven Gates</p>
              <p>renuevan sus preguntas en cada fase lunar,</p>
              <p>generadas con Inteligencia Artificial,</p>
              <p>con temáticas modernas y sorprendentes.</p>
              <br />
              <p>Lo que lo hace diferente</p>
              <p>es que tu marca aparece resaltada en color</p>
              <p>como pista para que el usuario acierte.</p>
              <p>El jugador la lee, la recuerda y gana sus Lunas.</p>
              <br />
              <p>Tú le ayudas a ganar.</p>
              <p>Él te recuerda a ti.</p>
              <p>Así funcionan las conversiones aquí.</p>
            </div>
            <img
              src="/images/games_promos.webp"
              alt="Games Promos"
              className="w-full max-w-3xl rounded-lg border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            />
          </div>

        </div>
      )}

      {/* ───── TAB: CÓMO FUNCIONA (LANDING) ───── */}
      {subTab === 'blog' && (
        <div className="w-full flex flex-col items-center gap-24">

          {/* ═══════════ HERO ═══════════ */}
          <div className="flex flex-col items-center text-center gap-6 w-full">
            <span
              style={{ fontFamily: HEADING }}
              className="text-4xl tracking-[0.3em] text-cyan-400 border border-cyan-500/30 rounded-full px-10 py-4 uppercase bg-cyan-950/20 font-black"
            >
              Por qué Bro7Vision
            </span>
            <div className="h-6" />
            <h1
              style={{ fontFamily: HEADING, fontWeight: 900 }}
              className="text-4xl md:text-5xl lg:text-6xl leading-tight text-center"
            >
              <span className="text-white block">La publicidad que el espectador agradece</span>
              <span className="block mt-2 text-amber-400">existe!</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">Y convierte más.</span>
            </h1>
            <div style={{ fontFamily: INTER }} className="text-xl md:text-2xl text-gray-300 leading-relaxed md:leading-loose text-center max-w-3xl mx-auto mt-8 font-medium">
              <p className="mb-1">Bro7Vision es una plataforma de entretenimiento interactivo.</p>
              <p className="mb-1">Los visitantes entran a explorar, descubrir y ganar{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>Lunas</span>
              </p>
              <p className="mb-1">sus puntos canjeables por tarjetas de regalo reales.</p>
              <p className="mb-1">En el sector{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold" style={{ textShadow: '0 0 20px rgba(168,85,247,0.5), 0 0 60px rgba(236,72,153,0.3)' }}>Bro7Band</span>
              </p>
              <p className="mb-1">conviven los Personajes del universo Brovision</p>
              <p className="mb-1">con Inteligencia Artificial:</p>
              <p className="mb-1">los usuarios los siguen, escuchan sus historias</p>
              <p className="mb-1">y ganan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 font-bold" style={{ textShadow: '0 0 20px rgba(0,255,200,0.5), 0 0 60px rgba(168,85,247,0.3)' }}>Lunas</span>
                {' '}interactuando con ellos.</p>
              <p className="mt-4 text-white font-bold" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
                Tu marca vive dentro de esa experiencia.
              </p>
              <p className="text-white font-bold" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
                No encima de ella.
              </p>
            </div>
            <div className="h-12" />
            <div style={{ fontFamily: INTER }} className="text-2xl md:text-3xl leading-relaxed text-center font-bold text-gray-300">
              <p className="mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Bro7Vision</span> te ofrece
              </p>
              <p className="mb-3">
                una <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Publicidad</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">transparente, efectiva</span>
              </p>
              <p className="mb-3">
                y que el <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">espectador agradece</span>.
              </p>
              <p className="mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">No irrumpe</span> en su tarea.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Sin engaños</span>.
              </p>
              <p className="mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Sin algoritmos</span> que decidan por el{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">anunciante</span>.
              </p>
            </div>
          </div>

          {/* ═══════════ MANIFIESTO — BLOQUES CENTRADOS ═══════════ */}
          <div className="w-full flex flex-col items-center gap-14">
            {MANIFIESTO.map((bloque, i) => (
              <div key={i} className="w-full max-w-6xl flex flex-col items-center gap-5">
                <h2
                  style={{ fontFamily: HEADING, fontWeight: 700 }}
                  className={`text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest text-center ${bloque.color}`}
                >
                  {Array.isArray(bloque.titulo) ? (
                    bloque.titulo.map((linea, ti) => (
                      <span key={ti} className="block">{linea}</span>
                    ))
                  ) : (
                    bloque.titulo
                  )}
                </h2>
                <div
                  style={{ fontFamily: INTER }}
                  className="text-xl md:text-2xl text-gray-300 leading-relaxed md:leading-loose text-center font-medium"
                >
                  {bloque.cuerpo.map((linea, j) => (
                    linea[0]?.spacer ? (
                      <div key={j} className="h-8" />
                    ) : (
                      <p key={j} className="mb-1">
                        {linea.map((seg, k) =>
                          seg.c || seg.s ? (
                            <span key={k} className={seg.c || ''} style={seg.s ? { textShadow: seg.s } : undefined}>{seg.t}</span>
                          ) : (
                            <span key={k}>{seg.t}</span>
                          )
                        )}
                      </p>
                    )
                  ))}
                </div>
                {i < MANIFIESTO.length - 1 && (
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-4" />
                )}
              </div>
            ))}
          </div>

          {/* ═══════════ TABLA COMPARATIVA ═══════════ */}
          <div className="w-full max-w-6xl">
            <h4
              style={{ fontFamily: HEADING, fontWeight: 700 }}
              className="text-sm text-gray-500 uppercase tracking-widest mb-6 text-center"
            >
              Comparativa
            </h4>
            <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5">
              <table className="w-full text-sm md:text-base" style={{ fontFamily: INTER }}>
                <thead>
                  <tr className="border-b border-white/10 bg-white/10">
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold"></th>
                    <th className="text-center px-6 py-4 text-gray-400 font-semibold">Publicidad convencional</th>
                    <th className="text-center px-6 py-4 text-cyan-400 font-semibold">Brovision</th>
                  </tr>
                </thead>
                <tbody>
                  {FILAS_TABLA.map(([concepto, conv, brov], i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-black/20' : ''}`}>
                      <td className="px-6 py-4 text-gray-300">{concepto}</td>
                      <td className="px-6 py-4 text-center text-red-400">{conv}</td>
                      <td className="px-6 py-4 text-center text-emerald-400 font-semibold">{brov}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════ CTA ═══════════ */}
          <div className="w-full max-w-4xl text-center flex flex-col items-center gap-6 pb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <h3
              style={{ fontFamily: HEADING, fontWeight: 900 }}
              className="text-3xl md:text-5xl text-white leading-tight"
            >
              Tu marca merece un espacio transparente
            </h3>
            <p
              style={{ fontFamily: INTER }}
              className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed"
            >
             Contrata tu espacio en la próxima fase lunar y descubre lo que ocurre cuando la publicidad deja de molestar y empieza a conectar de verdad.
            </p>
            <button
              style={{ fontFamily: HEADING }}
              className="mt-2 px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transition-all shadow-[0_0_30px_rgba(0,255,200,0.3)] hover:shadow-[0_0_50px_rgba(0,255,200,0.5)]"
            >
              BRO7VISION.COM
            </button>
          </div>

        </div>
      )}

      {/* ───── TAB: DEMOS & GUÍA ───── */}
      {subTab === 'demos' && (
        <div className="w-full max-w-6xl">
          <ComoFuncionaTabs />
        </div>
      )}

    </div>
  );
};

export default EstudioMarketingTab;
// src/components/RacoonTerminal.jsx (SCROLL FIX FINAL)
import React, { useState } from 'react';

const RacoonTerminal = ({ searchQuery }) => {
  const [tab, setTab] = useState('faq');

  return (
    <div className="w-full h-full bg-[#080808] border border-orange-500/30 rounded-xl overflow-hidden flex flex-col font-mono shadow-2xl">
        
        {/* HEADER */}
        <div className="flex border-b border-white/10 bg-black/50 shrink-0">
            <button onClick={() => setTab('drops')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${tab === 'drops' ? 'text-orange-400 bg-orange-900/10 border-b-2 border-orange-500' : 'text-gray-600'}`}>📦 Drops</button>
            <button onClick={() => setTab('clusters')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${tab === 'clusters' ? 'text-orange-400 bg-orange-900/10 border-b-2 border-orange-500' : 'text-gray-600'}`}>🏘️ Clusters</button>
            <button onClick={() => setTab('faq')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${tab === 'faq' ? 'text-orange-400 bg-orange-900/10 border-b-2 border-orange-500' : 'text-gray-600'}`}>❓ Ayuda / FAQ</button>
        </div>

        {/* BODY - CAMBIO CRÍTICO AQUI: Quitamos 'flex items-center' para arreglar el scroll */}
        <div className="flex-1 relative bg-gradient-to-b from-black to-[#111] overflow-hidden">
            
            {tab === 'faq' ? (
                // El contenedor interior ahora tiene altura completa y scroll
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-3xl mx-auto space-y-6 pb-20"> {/* pb-20 añade aire al final */}
                        <h3 className="text-3xl text-orange-500 font-black mb-8 border-b border-orange-500/30 pb-4">
                            CENTRO DE INFORMACIÓN (FASE 0)
                        </h3>
                        
                        {/* PREGUNTAS Y RESPUESTAS */}
                        <div className="space-y-4">
                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Qué tipo de contenido puedo subir?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p><strong>Permitido:</strong> Música propia con Licencia Creative Commons 4.0, Música sin Copyright, Podcasts, Arte visual, Ofertas comerciales.</p>
                                    <p className="mt-2 text-red-400 font-bold">PROHIBIDO:</p>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>Contenido Triple X (Adultos).</li>
                                        <li>Material con Copyright comercial restrictivo.</li>
                                        <li>Discurso de odio.</li>
                                        <li>Contenido violento.</li>
                                    </ul>
                                </div>
                            </details>
                            
                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Cómo se hace para subir contenido?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p>En <strong>Booster Modal</strong>, en la sección "Señal" puedes subir el link de audio y hasta 3 links de video, que tengas ya subidos a  plataformas como Dropbox , Discord, o por medio de tu NAS via Cloudfare. De ahí copias los links para publicar en BRO7VISION. Para las imágenes, puedes usar plataformas como Postimages.com  En este caso debes elegir el link de "Enlace directo" ya que hay varios.</p>
                                </div>
                            </details>

                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Puedo vender productos hoy?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p>En <strong>Fase 0 (Génesis)</strong>, las actividades comerciales directas están cerradas. Usa tu Profile Card como escaparate y redirige a tus redes externas.</p>
                                </div>
                            </details>

                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Necesito verificarme?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p><strong>Fase 0:</strong> NO es necesario.</p>
                                    <p className="mt-2"><strong>Fase 1:</strong> SÍ. Para operar como comercio, deberás verificar tu identidad (Autónomo/Empresa).</p>
                                </div>
                            </details>

                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>Economía: ¿Que son las Moon Coins?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <ul className="space-y-3">
                                        <li><strong className="text-yellow-400">🌕 MOON COINS:</strong> Monedas digitales sincronizadas con la Luna. Para comprar Mentions y enviar Halos de Luz. Las puedes comprar o ganar dentro de BRO7VISION jugando en el sector Games o viendo Publicidad en nuestro sector de Brostories..</li>
				</ul>
                                </div>
                            </details>

                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Qué es BroStories y BroTuner?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p className="mb-2"><strong className="text-cyan-400">🎬 BRO-STORIES:</strong> Cine inmersivo con publicidad integrada en la trama.</p>
                                    <p><strong className="text-fuchsia-400">📻 BRO-TUNER:</strong> Radio multicanal con estilos curados y publicidad no intrusiva.</p>
                                </div>
                            </details>
                          
           	
	<details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Puedo tener más de un perfil?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p>Actualmente, asignamos una única <strong>Identidad Digital</strong> por Ciudadano (Email).</p>
                                    <p className="mt-2">Sin embargo, tu perfil es <strong>Híbrido</strong>: puedes actuar como Creador, Comercio y Usuario a la vez desde la misma cuenta, configurando tus roles en el <em>Booster Studio</em>.</p>
                                </div>
                            </details>

                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Qué es un Halo de Luz?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p>Es la evolución del "Like". No es solo un clic, es un <strong>obsequio de Energía </strong> que envías a un Creador o Comercio.</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li><strong>Tiene Coste:</strong> Enviarlo te cuesta 100 Puntos Génesis. Son valiosos, cuídalos!</li>
            <li><strong>Tiene Recompensa:</strong> Esos puntos se transfieren directamente al Creador como agradecimiento.</li>
            <li><strong>Filosofía:</strong> Economía circular. Tú ganas puntos explorando y los usas para apoyar el contenido libre que te gusta. Sin intermediarios.</li>
                                   </ul>
                                </div>
                            </details>
                            
                            <details className="bg-white/5 p-5 rounded-lg cursor-pointer group open:bg-white/10 transition-all border border-transparent open:border-orange-500/30">
                                <summary className="font-bold text-white text-lg md:text-xl uppercase group-hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                                    <span>¿Qué son los Ecos de texto y audio?</span>
                                    <span className="text-orange-500 text-2xl">+</span>
                                </summary>
                                <div className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed pl-4 border-l-2 border-orange-500">
                                    <p>Los Ecos son la evolución de los comentarios. Para evitar a los bots, los ecos tanto de texto o de audio, tienen un 				coste de 100 puntos Génesis. Son valiosos, cuídalos!.</p>
                                   </div>
                            </details>

	
                            
                        </div>
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center animate-fadeIn p-8 border border-dashed border-white/20 rounded-xl">
                        <div className="text-5xl mb-4 grayscale opacity-50">🚧</div>
                        <p className="text-orange-400 font-bold uppercase tracking-widest text-lg mb-2">MÓDULO EN CONSTRUCCIÓN</p>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            La logística descentralizada (Drops) y los servicios vecinales (Clusters) se activarán en la <strong>Fase 1 (Nova)</strong>.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default RacoonTerminal;
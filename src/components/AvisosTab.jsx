// src/components/AvisosTab.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AvisosTab = () => {
  const [misAvisos, setMisAvisos] = useState([]);
  const [mensajesRecibidos, setMensajesRecibidos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: avisos } = await supabase
        .from('avisos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (avisos) setMisAvisos(avisos);

      const { data: mensajes } = await supabase
        .from('mensajes_privados')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });
      if (mensajes) setMensajesRecibidos(mensajes);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">

      <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-2xl shrink-0">📢</span>
        <div>
          <p className="text-sm font-bold text-blue-300 mb-1">¿Quieres publicar un aviso?</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Díselo a <span className="text-blue-300 font-bold">Evelyn</span> en el sector Avisos.
            Si no estás ahí, pídele a los <span className="text-cyan-300 font-bold">Osos</span> que
            te pasen — ellos te llevan directamente.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border border-blue-500/50 flex items-center justify-center bg-blue-500/10 shadow-[0_0_20px_rgba(30,58,138,0.4)]">
          <span className="text-2xl">📢</span>
        </div>
        <div>
          <h3 className="text-xl font-black text-blue-400 tracking-widest uppercase">Tablón de Avisos</h3>
          <p className="text-xs text-blue-200/50 font-bold tracking-widest">TUS PUBLICACIONES Y CONEXIONES RECIBIDAS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Mis avisos publicados */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">
            📋 Mis Avisos publicados
          </p>
          {misAvisos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-xs italic">No tienes avisos publicados todavía.</p>
              <p className="text-[10px] text-gray-700 mt-1">Dile a Evelyn que quieres publicar uno.</p>
            </div>
          ) : (
            misAvisos.map(aviso => {
              const conexiones = mensajesRecibidos.filter(m => m.aviso_id === aviso.id);
              const sinLeer = conexiones.filter(m => !m.leido).length;
              const expirado = new Date(aviso.expires_at) < new Date();
              return (
                <div key={aviso.id}
                  className={`p-4 rounded-2xl border transition-all
                    ${expirado
                      ? 'bg-black/20 border-white/5 opacity-50'
                      : 'bg-blue-950/20 border-blue-500/30 hover:border-blue-400/50'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                        {aviso.type}
                      </span>
                      <p className="text-sm font-bold text-white mt-0.5">{aviso.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {sinLeer > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                          {sinLeer} nueva{sinLeer > 1 ? 's' : ''}
                        </span>
                      )}
                      {expirado && (
                        <span className="text-[9px] text-red-500 font-bold uppercase">Expirado</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{aviso.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-gray-600">
                      📍 {aviso.city} · {new Date(aviso.created_at).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-[9px] text-blue-500 font-bold">
                      {conexiones.length} conexión{conexiones.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Conexiones recibidas */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center justify-between">
            <span>📥 Conexiones recibidas</span>
            {mensajesRecibidos.filter(m => !m.leido).length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {mensajesRecibidos.filter(m => !m.leido).length} sin leer
              </span>
            )}
          </p>
          {mensajesRecibidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <span className="text-4xl mb-3">📬</span>
              <p className="text-xs italic">Nadie se ha conectado todavía.</p>
              <p className="text-[10px] text-gray-700 mt-1">Cuando alguien pague por conectar, aparece aquí.</p>
            </div>
          ) : (
            mensajesRecibidos.map(msg => {
              const avisoRelacionado = misAvisos.find(a => a.id === msg.aviso_id);
              return (
                <div key={msg.id}
                  className={`p-4 rounded-2xl border transition-all
                    ${!msg.leido
                      ? 'bg-blue-950/30 border-blue-500/50 shadow-[0_0_12px_rgba(30,58,138,0.3)]'
                      : 'bg-black/20 border-white/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-blue-300">@{msg.from_alias}</p>
                    {!msg.leido && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,1)]" />
                    )}
                  </div>
                  {avisoRelacionado && (
                    <p className="text-[10px] text-gray-500 mb-1">
                      Re: <span className="text-gray-400">{avisoRelacionado.title}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-300 leading-relaxed">{msg.text}</p>
                  <p className="text-[9px] text-gray-600 mt-2">
                    {new Date(msg.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default AvisosTab;

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const EXO2 = "'Exo 2', sans-serif";
const INTER = "'Inter', sans-serif";

const BoosterAnunciante = ({ session }) => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState(null);

  const [form, setForm] = useState({
    razon_social:       '',
    email:              session?.user?.email || '',
    telefono:           '',
    web_url:            '',
    descripcion:        '',
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchSolicitud = async () => {
      const { data } = await supabase
        .from('bs_solicitudes')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      setSolicitud(data);
      setLoading(false);
    };
    fetchSolicitud();
  }, [session]);

  const handleSend = async () => {
    if (!form.razon_social.trim()) { setError('El nombre del negocio es obligatorio.'); return; }
    if (!form.email.trim())        { setError('El email es obligatorio.'); return; }

    setSending(true);
    setError(null);

    const { error: err } = await supabase.from('bs_solicitudes').insert([{
      user_id:            session.user.id,
      razon_social:       form.razon_social.trim(),
      email:              form.email.trim(),
      telefono:           form.telefono.trim() || null,
      web_url:            form.web_url.trim()  || null,
      descripcion:        form.descripcion.trim() || null,
      nombre_artistico:   form.razon_social.trim(),
      tipo:               'anunciante',
      estado:             'EN_CASTING',
    }]);

    if (err) { setError(err.message); setSending(false); return; }

    const { data } = await supabase
      .from('bs_solicitudes')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    setSolicitud(data);
    setSending(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <span style={{ fontFamily: INTER }} className="text-xl text-gray-500">Cargando...</span>
    </div>
  );

  if (solicitud?.estado === 'APROBADO') return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
      <div className="text-5xl">✅</div>
      <p style={{ fontFamily: EXO2, fontWeight: 800 }} className="text-4xl text-emerald-400 uppercase tracking-widest">
        Anunciante Aprobado
      </p>
      <p style={{ fontFamily: INTER }} className="text-2xl text-gray-400 leading-relaxed">
        Ya tienes acceso al Backstage. Usa el botón en la puerta lateral izquierda para acceder.
      </p>
    </div>
  );

  if (solicitud && solicitud.estado !== 'APROBADO') return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
      <div className="text-5xl">⏳</div>
      <p style={{ fontFamily: EXO2, fontWeight: 800 }} className="text-3xl text-yellow-400 uppercase tracking-widest">
        Solicitud en Revisión
      </p>
      <p style={{ fontFamily: INTER }} className="text-2xl text-gray-400 leading-relaxed">
        Tu solicitud fue recibida. Te avisaremos por email cuando sea aprobada.
      </p>
      <div style={{ fontFamily: INTER }} className="text-xl text-gray-600 bg-white/5 border border-white/8 rounded px-4 py-3 w-full text-left mt-2">
        <span className="text-gray-500">Negocio:</span>{' '}
        <span className="text-white/70">{solicitud.razon_social}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-1 py-2 booster-anunciante-scroll">

      <p style={{ fontFamily: INTER }} className="text-xl text-gray-400 leading-relaxed">
        Deja tus datos y revisamos tu solicitud. Cuando veas la luz verde tienes acceso directo al Backstage de anunciantes.
      </p>

      <div>
        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xl text-gray-400 uppercase tracking-widest mb-1.5">
          Nombre del negocio *
        </label>
        <input
          type="text"
          value={form.razon_social}
          onChange={e => setForm(f => ({ ...f, razon_social: e.target.value }))}
          placeholder="Tu empresa o marca"
          style={{ fontFamily: INTER }}
          className="w-full bg-zinc-900 border border-white/10 text-white text-2xl px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      <div>
        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xl text-gray-400 uppercase tracking-widest mb-1.5">
          Email de contacto *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="contacto@tuempresa.com"
          style={{ fontFamily: INTER }}
          className="w-full bg-zinc-900 border border-white/10 text-white text-2xl px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      <div>
        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xl text-gray-400 uppercase tracking-widest mb-1.5">
          Teléfono <span className="normal-case font-normal text-gray-600">(opcional)</span>
        </label>
        <input
          type="tel"
          value={form.telefono}
          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
          placeholder="+34 600 000 000"
          style={{ fontFamily: INTER }}
          className="w-full bg-zinc-900 border border-white/10 text-white text-2xl px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      <div>
        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xl text-gray-400 uppercase tracking-widest mb-1.5">
          Web o red social <span className="normal-case font-normal text-gray-600">(opcional)</span>
        </label>
        <input
          type="url"
          value={form.web_url}
          onChange={e => setForm(f => ({ ...f, web_url: e.target.value }))}
          placeholder="https://tuempresa.com"
          style={{ fontFamily: INTER }}
          className="w-full bg-zinc-900 border border-white/10 text-white text-2xl px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors placeholder-gray-600"
        />
      </div>

      <div>
        <label style={{ fontFamily: INTER, fontWeight: 600 }} className="block text-xl text-gray-400 uppercase tracking-widest mb-1.5">
          Descripción breve <span className="normal-case font-normal text-gray-600">(opcional)</span>
        </label>
        <textarea
          value={form.descripcion}
          onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          maxLength={300}
          rows={3}
          placeholder="A qué te dedicas, qué quieres promocionar..."
          style={{ fontFamily: INTER }}
          className="w-full bg-zinc-900 border border-white/10 text-white text-2xl px-3 py-2.5 rounded focus:border-purple-500 focus:outline-none transition-colors resize-none placeholder-gray-600"
        />
        <div className="text-right text-xl text-gray-600 mt-1">{form.descripcion.length}/300</div>
      </div>

      {error && (
        <div style={{ fontFamily: INTER }} className="text-2xl text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        style={{ fontFamily: EXO2, fontWeight: 700 }}
        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-2xl font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(168,85,247,0.25)]"
      >
        {sending ? 'ENVIANDO...' : 'SOLICITAR ACCESO COMO ANUNCIANTE'}
      </button>

      <style>{`
        .booster-anunciante-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .booster-anunciante-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .booster-anunciante-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #d946ef, #06b6d4);
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(168,85,247,0.5), 0 0 4px rgba(6,182,212,0.5);
        }
        .booster-anunciante-scroll {
          scrollbar-width: thin;
          scrollbar-color: #a855f7 #1a1a1a;
        }
      `}</style>

    </div>
  );
};

export default BoosterAnunciante;
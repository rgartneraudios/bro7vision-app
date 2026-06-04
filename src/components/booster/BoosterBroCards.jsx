import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import BroCardStripPS from '../BroCardStripPS';

const BoosterBroCards = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descriptions, setDescripciones] = useState({});
  const [guardando, setGuardando] = useState({});

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('comercio_cupones')
          .select('*')
          .eq('id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setCupones(data);
          const descMap = {};
          data.forEach(c => {
             descMap[c.id] = c.description || '';
          });
          setDescripciones(descMap);
        }
      } catch (err) {
        console.error('Error cargando cupones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCupones();
  }, []);

  const handleDescripcionChange = (id, value) => {
    setDescripciones(prev => ({ ...prev, [id]: value }));
  };

  const handleGuardar = async (cuponId) => {
    setGuardando(prev => ({ ...prev, [cuponId]: true }));
    try {
      const { error } = await supabase
        .from('comercio_cupones')
          .update({ description: descriptions[cuponId] })
        .eq('id', cuponId);

      if (error) throw error;

      setCupones(prev =>
        prev.map(c => c.id === cuponId ? { ...c, description: descriptions[cuponId] } : c)
      );
    } catch (err) {
      console.error('Error guardando descripción:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardando(prev => ({ ...prev, [cuponId]: false }));
    }
  };

  const mapToCard = (c) => ({
    ...c,
    nombre: c.comercio_nombre || 'COMERCIO',
    banner_url: c.banner_url || c.mini_url || '',
    fase_lunar: '',
    vencimiento: '',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">
          Cargando tus BroCards...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-4xl">📦</span>
        <div>
          <h3 className="text-xl font-black text-emerald-400 tracking-widest uppercase">
            Mis BroCards
          </h3>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-0.5">
            {cupones.length} {cupones.length === 1 ? 'cupón' : 'cupones'} en tu inventario
          </p>
        </div>
      </div>

      {cupones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border border-white/5 rounded-3xl bg-white/2">
          <span className="text-5xl opacity-30">📦</span>
          <p className="text-gray-600 text-xs uppercase tracking-widest text-center">
            Aún no tienes cupones creados
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {cupones.map((c) => {
            const card = mapToCard(c);
            return (
              <div key={c.id} className="space-y-4">
                <BroCardStripPS cards={[card]} columns={1} visible={true} />

                <div className="bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-widest block">
                    Descripción del cupón
                  </label>
                  <textarea
                    value={descriptions[c.id] || ''}
                    onChange={(e) => handleDescripcionChange(c.id, e.target.value)}
                    placeholder="Describe tu oferta para el Montador..."
                    rows={3}
                    className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleGuardar(c.id)}
                      disabled={guardando[c.id]}
                      className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full border border-emerald-500/30 transition-all disabled:opacity-50"
                    >
                      {guardando[c.id] ? '⏳ GUARDANDO...' : '💾 GUARDAR'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoosterBroCards;

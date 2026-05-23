// src/components/MarketTab.jsx
// ─────────────────────────────────────────────────────────────────────
// Sistema de Campaña Lunar - Inventario destacado_ps (Fuentes Escaladas)
// ─────────────────────────────────────────────────────────────────────
// Tabla: profiles
// Columna: destacados_ps (objeto JSON con vitrina[] + referencias[])
// ─────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getMoonSuffix } from '../utils/moonUtils';

// ── Constantes ──────────────────────────────────────────────────────
const MAX_REFERENCIAS = 50;
const MAX_VITRINA     = 3;

const ALCANCE_OPTIONS = [
  { value: 'LOCAL',          label: 'Local',          color: '#22d3ee',  desc: 'Solo tu ciudad' },
  { value: 'NACIONAL',       label: 'Nacional',       color: '#fbbf24',  desc: 'Todo el país' },
  { value: 'INTERNACIONAL',  label: 'Internacional',  color: '#a855f7',  desc: 'Cualquier país' },
];

const SECTOR_OPTIONS = [
  { value: 'PRODUCTO',  label: '📦 Producto',  color: '#fbbf24' },
  { value: 'SERVICIO',  label: '🛠 Servicio',  color: '#22d3ee' },
];

// Lunas con su % y condición exacta
const LUNA_CONFIG = {
  nova:       { emoji: '🌑', color: '#A855F7', label: 'Nova',       pct: '10%',  cond: '1 artículo mín.',    condicional: false },
  crescens:   { emoji: '🌙', color: '#79FF1A', label: 'Crescens',   pct: '15%',  cond: '1 artículo mín.',    condicional: false },
  plena:      { emoji: '🌕', color: '#FFFFFF', label: 'Plena',      pct: '20%',  cond: 'mín. 2 artículos',   condicional: true  },
  decrescens: { emoji: '🌗', color: '#F97316', label: 'Decrescens', pct: '20%',  cond: 'mín. 3 artículos',   condicional: true  },
};

const THEMES = {
  cyan: { border: '#22d3ee', glow: 'rgba(34,211,238,0.3)', text: '#22d3ee', bg: 'cyan-500/10' },
  gold: { border: '#fbbf24', glow: 'rgba(251,191,36,0.3)', text: '#fbbf24', bg: 'amber-500/10' },
};

// ── Helper: referencia vacía ─────────────────────────────────────────
const nuevaReferencia = (campana = 'siguiente') => ({
  id:               `ref-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
  campana_semana:   campana,
  sector:           'PRODUCTO',
  producto_codigo:  '',
  producto_titulo:  '',
  categoria:        '',
  tallas:           '',
  peso:             '',
  material:         '',
  origen:           '',
  descripcion:      '',
  precio_original:  0,
  precio_descuento: 0,
  stock_inicial:    10,
  stock_actual:     10,
  alcance:          'LOCAL',
  lunas:            { nova: true, crescens: false, plena: false, decrescens: false },
  image_url:        '',
  orden_vitrina:    null,   // 1 | 2 | 3 | null
  created_at:       new Date().toISOString(),
  updated_at:       new Date().toISOString(),
});

// ── Subcomponente: selector de Lunas con descripción ────────────────
function LunasSelector({ lunas, onChange, disabled }) {
  return (
    <div>
      <label style={{
        fontSize: '12px', color: '#9CA3AF',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'block', marginBottom: '10px', fontWeight: 700,
      }}>
        Fases Lunares con Descuento
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(LUNA_CONFIG).map(([key, cfg]) => {
          const activa = lunas?.[key] === true;
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onChange(key)}
              disabled={disabled}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${activa ? cfg.color + '60' : '#ffffff10'}`,
                background: activa ? cfg.color + '15' : 'rgba(0,0,0,0.3)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '18px',
                  filter: activa ? `drop-shadow(0 0 6px ${cfg.color})` : 'grayscale(1)',
                  transition: 'all 0.2s',
                }}>
                  {cfg.emoji}
                </span>
                <span style={{
                  fontSize: '13px', fontWeight: 700,
                  color: activa ? cfg.color : '#9CA3AF',
                  transition: 'color 0.2s',
                }}>
                  {cfg.label}
                </span>
                <span style={{
                  fontSize: '12px', fontWeight: 800,
                  color: activa ? cfg.color : '#6B7280',
                }}>
                  {cfg.pct}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {cfg.condicional && (
                  <span style={{
                    fontSize: '11px', color: '#F97316',
                    background: 'rgba(249,115,22,0.15)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    padding: '2px 6px', borderRadius: '4px',
                    fontWeight: 700,
                  }}>
                    ⚠️ {cfg.cond}
                  </span>
                )}
                {!cfg.condicional && (
                  <span style={{
                    fontSize: '11px', color: '#9CA3AF',
                    padding: '2px 6px',
                  }}>
                    {cfg.cond}
                  </span>
                )}
                <div style={{
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  background: activa ? cfg.color : 'transparent',
                  border: `2px solid ${activa ? cfg.color : '#6B7280'}`,
                  boxShadow: activa ? `0 0 8px ${cfg.color}` : 'none',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Subcomponente: card de referencia (colapsable) ───────────────────
function ReferenciaCard({ referencia: producto, campana, idx, esEditable, onUpdate, onDelete, onToggleLuna, onSubirImagen }) {
  const [abierto, setAbierto] = useState(false);
  const esVitrina = producto.orden_vitrina !== null && producto.orden_vitrina !== undefined;
  const sectorCfg = SECTOR_OPTIONS.find(s => s.value === producto.sector) || SECTOR_OPTIONS[0];
  const alcanceCfg = ALCANCE_OPTIONS.find(a => a.value === producto.alcance) || ALCANCE_OPTIONS[0];
  const sinStock = producto.stock_actual === 0;

  return (
    <div style={{
      background: esVitrina ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${esVitrina ? '#fbbf2440' : sinStock ? '#ef444440' : '#ffffff15'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      opacity: sinStock ? 0.6 : 1,
      transition: 'all 0.2s',
    }}>
      {/* Cabecera colapsable */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        style={{
          width: '100%', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {/* Número */}
          <span style={{
            fontSize: '12px', color: '#9CA3AF', fontWeight: 700,
            flexShrink: 0,
          }}>
            #{idx + 1}
          </span>

          {/* Badge vitrina */}
          {esVitrina && (
            <span style={{
              fontSize: '11px', fontWeight: 800,
              color: '#fbbf24', background: 'rgba(251,191,36,0.15)',
              border: '1px solid rgba(251,191,36,0.4)',
              padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
            }}>
              ⭐ VITRINA {producto.orden_vitrina}
            </span>
          )}

          {/* Badge sector */}
          <span style={{
            fontSize: '11px', fontWeight: 700,
            color: sectorCfg.color,
            background: sectorCfg.color + '20',
            border: `1px solid ${sectorCfg.color}40`,
            padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
          }}>
            {sectorCfg.label}
          </span>

          {/* Badge alcance */}
          <span style={{
            fontSize: '11px', fontWeight: 700,
            color: alcanceCfg.color,
            background: alcanceCfg.color + '15',
            border: `1px solid ${alcanceCfg.color}30`,
            padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
          }}>
            {alcanceCfg.label}
          </span>

          {/* Título */}
          <span style={{
            fontSize: '14px', color: sinStock ? '#9CA3AF' : '#E5E7EB',
            fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {producto.producto_titulo || '(sin título)'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Stock pill */}
          <span style={{
            fontSize: '12px', fontWeight: 700,
            color: sinStock ? '#ef4444' : producto.stock_actual <= 3 ? '#f59e0b' : '#10b981',
            background: sinStock ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${sinStock ? '#ef444430' : '#10b98130'}`,
            padding: '3px 9px', borderRadius: '20px',
          }}>
            {sinStock ? '⛔ Sin stock' : `${producto.stock_actual}/${producto.stock_inicial}`}
          </span>

          {esEditable && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete(producto.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9CA3AF', padding: '4px' }}
            >🗑</button>
          )}

          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{abierto ? '▼' : '▶'}</span>
        </div>
      </button>

      {/* Cuerpo expandible */}
      {abierto && (
        <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Sector */}
          <div>
            <label style={labelStyle}>Sector</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SECTOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => esEditable && onUpdate(producto.id, 'sector', opt.value)}
                  disabled={!esEditable}
                  style={{
                    flex: 1, padding: '8px 6px',
                    borderRadius: '8px', border: `1px solid ${producto.sector === opt.value ? opt.color + '80' : '#ffffff20'}`,
                    background: producto.sector === opt.value ? opt.color + '20' : 'rgba(0,0,0,0.3)',
                    color: producto.sector === opt.value ? opt.color : '#9CA3AF',
                    fontSize: '12px', fontWeight: 700, cursor: esEditable ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alcance */}
          <div>
            <label style={labelStyle}>Alcance</label>
            <select
              value={producto.alcance}
              onChange={e => onUpdate(producto.id, 'alcance', e.target.value)}
              disabled={!esEditable}
              style={inputStyle}
            >
              {ALCANCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
              ))}
            </select>
          </div>

          {/* Orden vitrina */}
          <div>
            <label style={labelStyle}>Slot Vitrina (1-3 o vacío)</label>
            <select
              value={producto.orden_vitrina ?? ''}
              onChange={e => onUpdate(producto.id, 'orden_vitrina', e.target.value === '' ? null : parseInt(e.target.value))}
              disabled={!esEditable}
              style={inputStyle}
            >
              <option value="">— Sin vitrina —</option>
              <option value="1">⭐ Destacado 1</option>
              <option value="2">⭐ Destacado 2</option>
              <option value="3">⭐ Destacado 3</option>
            </select>
          </div>

          {/* Código */}
          <div>
            <label style={labelStyle}>Código</label>
            <input
              type="text"
              value={producto.producto_codigo}
              onChange={e => onUpdate(producto.id, 'producto_codigo', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: ZAPT-37"
              style={inputStyle}
            />
          </div>

          {/* Título */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Título de la Referencia</label>
            <input
              type="text"
              value={producto.producto_titulo}
              onChange={e => onUpdate(producto.id, 'producto_titulo', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: Zapatillas Neo modelo X talla 37"
              style={inputStyle}
            />
          </div>

          {/* Categoría */}
          <div>
            <label style={labelStyle}>Categoría</label>
            <input
              type="text"
              value={producto.categoria}
              onChange={e => onUpdate(producto.id, 'categoria', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: Calzado"
              style={inputStyle}
            />
          </div>

          {/* Tallas */}
          <div>
            <label style={labelStyle}>Tallas / Variante</label>
            <input
              type="text"
              value={producto.tallas}
              onChange={e => onUpdate(producto.id, 'tallas', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: Talla 37"
              style={inputStyle}
            />
          </div>

          {/* Peso */}
          <div>
            <label style={labelStyle}>Peso</label>
            <input
              type="text"
              value={producto.peso}
              onChange={e => onUpdate(producto.id, 'peso', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: 300g"
              style={inputStyle}
            />
          </div>

          {/* Material */}
          <div>
            <label style={labelStyle}>Material</label>
            <input
              type="text"
              value={producto.material}
              onChange={e => onUpdate(producto.id, 'material', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: Cuero sintético"
              style={inputStyle}
            />
          </div>

          {/* Origen */}
          <div>
            <label style={labelStyle}>Origen</label>
            <input
              type="text"
              value={producto.origen}
              onChange={e => onUpdate(producto.id, 'origen', e.target.value)}
              disabled={!esEditable}
              placeholder="Ej: Valencia, España"
              style={inputStyle}
            />
          </div>

          {/* Precio original */}
          <div>
            <label style={labelStyle}>Precio Original (€)</label>
            <input
              type="number" min="0"
              value={producto.precio_original}
              onChange={e => onUpdate(producto.id, 'precio_original', parseFloat(e.target.value) || 0)}
              disabled={!esEditable}
              style={inputStyle}
            />
          </div>

          {/* Precio descuento */}
          <div>
            <label style={labelStyle}>Precio con Descuento (€)</label>
            <input
              type="number" min="0"
              value={producto.precio_descuento}
              onChange={e => onUpdate(producto.id, 'precio_descuento', parseFloat(e.target.value) || 0)}
              disabled={!esEditable}
              style={inputStyle}
            />
          </div>

          {/* Stock inicial */}
          <div>
            <label style={labelStyle}>Stock Inicial</label>
            <input
              type="number" min="0"
              value={producto.stock_inicial}
              onChange={e => onUpdate(producto.id, 'stock_inicial', Math.max(0, parseInt(e.target.value) || 0))}
              disabled={!esEditable}
              style={inputStyle}
            />
          </div>

          {/* Stock actual */}
          <div>
            <label style={labelStyle}>Stock Actual</label>
            <input
              type="number" min="0"
              max={producto.stock_inicial}
              value={producto.stock_actual}
              onChange={e => onUpdate(producto.id, 'stock_actual', Math.min(Math.max(0, parseInt(e.target.value) || 0), producto.stock_inicial))}
              disabled={!esEditable || sinStock}
              style={{
                ...inputStyle,
                borderColor: sinStock ? 'rgba(239,68,68,0.4)' : undefined,
                color: sinStock ? '#ef4444' : undefined,
              }}
            />
          </div>

          {/* Lunas — span completo */}
          <div style={{ gridColumn: '1 / -1' }}>
            <LunasSelector
              lunas={producto.lunas}
              onChange={(lunaKey) => onToggleLuna(campana, producto.id, lunaKey)}
              disabled={!esEditable}
            />
          </div>

          {/* Imagen R2 */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Imagen (Cloudflare R2)</label>
            {producto.image_url ? (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '105px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)' }}>
                  <img src={producto.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <label style={{ cursor: esEditable ? 'pointer' : 'default' }}>
                  <span style={{
                    fontSize: '13px', color: '#22d3ee',
                    textDecoration: 'underline', cursor: 'pointer',
                  }}>
                    🔁 Reemplazar imagen
                  </span>
                  <input
                    type="file" accept="image/*" className="hidden"
                    style={{ display: 'none' }}
                    disabled={!esEditable}
                    onChange={async e => {
                      const url = await onSubirImagen(e.target.files[0]);
                      if (url) onUpdate(producto.id, 'image_url', url);
                    }}
                  />
                </label>
              </div>
            ) : (
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
                background: 'rgba(34,211,238,0.05)',
                border: '1px dashed rgba(34,211,238,0.3)',
                borderRadius: '10px',
                cursor: esEditable ? 'pointer' : 'not-allowed',
                fontSize: '13px', color: '#22d3ee',
              }}>
                📷 Subir imagen a R2
                <input
                  type="file" accept="image/*"
                  style={{ display: 'none' }}
                  disabled={!esEditable}
                  onChange={async e => {
                    const url = await onSubirImagen(e.target.files[0]);
                    if (url) onUpdate(producto.id, 'image_url', url);
                  }}
                />
              </label>
            )}
          </div>

          {/* Descripción */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={producto.descripcion}
              onChange={e => onUpdate(producto.id, 'descripcion', e.target.value)}
              disabled={!esEditable}
              rows={2}
              placeholder="Descripción corta..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Estilos compartidos ──────────────────────────────────────────────
const labelStyle = {
  fontSize: '12px', color: '#9CA3AF',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  display: 'block', marginBottom: '6px', fontWeight: 700,
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(34,211,238,0.2)',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '14px',
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

// ── Panel de Vitrina — los 3 slots de escaparate ─────────────────────
function VitrinePanel({ referencias }) {
  const slots = [1, 2, 3].map(n => referencias.find(r => r.orden_vitrina === n) || null);
  return (
    <div style={{
      background: 'rgba(251,191,36,0.05)',
      border: '1px solid rgba(251,191,36,0.2)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <p style={{
        fontSize: '12px', color: '#fbbf24',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        fontWeight: 800, marginBottom: '14px',
      }}>
        ⭐ Vitrina Pública — 3 BroCards en el Cajón del Sector
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {slots.map((ref, i) => (
          <div key={i} style={{
            background: ref ? 'rgba(251,191,36,0.08)' : 'rgba(0,0,0,0.3)',
            border: `1px solid ${ref ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px',
            padding: '12px',
            minHeight: '100px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '6px',
          }}>
            {ref ? (
              <>
                {ref.image_url ? (
                  <img src={ref.image_url} alt={ref.producto_titulo}
                    style={{ width: '45px', height: '67px', objectFit: 'cover', borderRadius: '6px' }} />
                ) : (
                  <div style={{
                    width: '45px', height: '67px', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>📷</div>
                )}
                <span style={{
                  fontSize: '12px', color: ref.stock_actual === 0 ? '#ef4444' : '#fbbf24',
                  fontWeight: 700, textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}>
                  {ref.stock_actual === 0 ? '⛔ Sin stock' : ref.producto_titulo || '(sin título)'}
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  {ref.sector === 'SERVICIO' ? '🛠 Servicio' : '📦 Producto'}
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '24px', opacity: 0.3 }}>＋</span>
                <span style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center' }}>
                  Destacado {i + 1}
                  <br />vacío
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '10px', lineHeight: 1.4 }}>
        Asigna el slot (Destacado 1/2/3) desde cada referencia del listado. Stock = 0 → desaparece del cajón hasta la próxima fase.
      </p>
    </div>
  );
}

// ── Componente Principal ─────────────────────────────────────────────
export const MarketTab = ({ formData, setFormData }) => {
  const [session,    setSession]    = useState(null);
  const [perfilOso,  setPerfilOso]  = useState(null);
  const [campanaActual,    setCampanaActual]    = useState([]);
  const [campanaSiguiente, setCampanaSiguiente] = useState([]);
  const [isFaseActiva, setIsFaseActiva] = useState(false);
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [isPremium,  setIsPremium]  = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [guardando,  setGuardando]  = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [acordeonActualAbierto,    setAcordeonActualAbierto]    = useState(true);
  const [acordeonSiguienteAbierto, setAcordeonSiguienteAbierto] = useState(true);

  // ── Auth y Perfil ──
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setPerfilOso(profile);
        setIsAdmin(profile?.role === 'admin');
        setIsPremium(profile?.is_premium === true || profile?.rango !== undefined);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // ── Cargar destacados_ps ──
  useEffect(() => {
    const load = async () => {
      if (!perfilOso?.id) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('destacados_ps')
        .eq('id', perfilOso.id)
        .single();

      if (profile?.destacados_ps && Array.isArray(profile.destacados_ps)) {
        const items = profile.destacados_ps;
        // Migración: si items viejos no tienen sector, se les pone PRODUCTO por defecto
        const migrados = items.map(i => ({ ...nuevaReferencia(i.campana_semana), ...i }));
        setCampanaActual(   migrados.filter(i => i.campana_semana === 'actual'));
        setCampanaSiguiente(migrados.filter(i => i.campana_semana === 'siguiente'));
      } else {
        setCampanaSiguiente([nuevaReferencia('siguiente')]);
      }
    };
    load();
  }, [perfilOso?.id]);

  // ── Fase lunar ──
  useEffect(() => {
    const calcular = () => {
      const fase = getMoonSuffix();
      setIsFaseActiva(fase === '1' || campanaActual.length > 0);
    };
    calcular();
    const iv = setInterval(calcular, 60000);
    return () => clearInterval(iv);
  }, [campanaActual.length]);

  // ── Realtime stock ──
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel(`profiles:${session.user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles',
        filter: `id=eq.${session.user.id}`,
      }, ({ new: np }) => {
        if (np?.destacados_ps) {
          const items = np.destacados_ps.map(i => ({ ...nuevaReferencia(i.campana_semana), ...i }));
          setCampanaActual(   items.filter(i => i.campana_semana === 'actual'));
          setCampanaSiguiente(items.filter(i => i.campana_semana === 'siguiente'));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session?.user?.id]);

  // ── Subida R2 ──
  const subirImagenR2 = async (file) => {
    if (!file) return null;
    setUploadingId(true);
    try {
      const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: safeFileName, fileType: file.type }),
      });
      const { uploadUrl } = await res.json();
      if (!uploadUrl) throw new Error('Sin ticket de subida.');
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      return `https://media.bro7vision.com/${safeFileName}`;
    } catch (err) {
      console.error('Error subiendo a R2:', err);
      alert('❌ Error al subir imagen: ' + err.message);
      return null;
    } finally {
      setUploadingId(false);
    }
  };

  // ── Handlers ──
  const handleAdd = (campana) => {
    const lista = campana === 'actual' ? campanaActual : campanaSiguiente;
    if (lista.length >= MAX_REFERENCIAS) {
      alert(`⚠️ Máximo ${MAX_REFERENCIAS} referencias por campaña.`);
      return;
    }
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => [...prev, nuevaReferencia(campana)]);
  };

  const handleUpdate = (campana, id, field, value) => {
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => prev.map(item => {
      if (item.id !== id) return item;
      // Si asignamos orden_vitrina, limpiar el mismo slot en las demás
      if (field === 'orden_vitrina' && value !== null) {
        return { ...item, [field]: value, updated_at: new Date().toISOString() };
      }
      return { ...item, [field]: value, updated_at: new Date().toISOString() };
    }));
    // Limpiar conflicto de slot vitrina
    if (field === 'orden_vitrina' && value !== null) {
      const setter2 = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
      setter2(prev => prev.map(item =>
        item.id !== id && item.orden_vitrina === value
          ? { ...item, orden_vitrina: null }
          : item
      ));
    }
  };

  const handleToggleLuna = (campana, id, lunaKey) => {
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, lunas: { ...item.lunas, [lunaKey]: !item.lunas[lunaKey] }, updated_at: new Date().toISOString() };
    }));
  };

  const handleDelete = (campana, id) => {
    if (!window.confirm('¿Eliminar esta referencia?')) return;
    const setter = campana === 'actual' ? setCampanaActual : setCampanaSiguiente;
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const todos = [
        ...campanaActual.map(p => ({ ...p, campana_semana: 'actual' })),
        ...campanaSiguiente.map(p => ({ ...p, campana_semana: 'siguiente' })),
      ];
      const { error } = await supabase
        .from('profiles')
        .update({ destacados_ps: todos })
        .eq('id', perfilOso?.id);
      if (error) throw error;
      alert('✅ Campaña guardada correctamente.');
    } catch (err) {
      console.error('Error guardando campaña:', err);
      alert('❌ Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#6B7280', fontSize: '14px' }}>
      ⏳ Cargando MarketTab...
    </div>
  );

  const t = THEMES.cyan;
  const esEditableActual = !isFaseActiva || isAdmin || isPremium;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Banner Video Commerce */}
      <div style={{
        background: 'rgba(34,211,238,0.07)',
        border: '1px solid rgba(34,211,238,0.25)',
        borderRadius: '16px', padding: '16px 20px',
        boxShadow: `0 0 20px ${t.glow}`,
      }}>
        <p style={{ fontSize: '12px', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          ⚠️ NOTA DE VIDEO COMMERCE
        </p>
        <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6 }}>
          Tu video principal (16:9) se gestiona desde la pestaña 'Señal de archivos — Video Horizontal B'.
          Sube allí el clip con tus artículos para activar la experiencia de compra inmersiva en tu Teléfono Casa.
        </p>
      </div>

      {/* ── ACORDEÓN 1: Campaña Actual (sellada en fase activa) ── */}
      <div style={{
        background: 'rgba(34,211,238,0.04)',
        border: '1px solid rgba(34,211,238,0.15)',
        borderRadius: '24px', padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <button
          type="button"
          onClick={() => setAcordeonActualAbierto(!acordeonActualAbierto)}
          style={{
            width: '100%', display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: acordeonActualAbierto ? '20px' : '0',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              🌕 Campaña en Curso
            </h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              {campanaActual.length} / {MAX_REFERENCIAS} referencias
              {isFaseActiva && !esEditableActual && (
                <span style={{ color: '#f59e0b', marginLeft: '10px', fontWeight: 700 }}>
                  🔒 SELLADO — Fase lunar activa
                </span>
              )}
              {isFaseActiva && (isAdmin || isPremium) && (
                <span style={{ color: '#a855f7', marginLeft: '10px', fontWeight: 700 }}>
                  🔑 Acceso Admin/Premium
                </span>
              )}
            </p>
          </div>
          <span style={{ color: '#9CA3AF', fontSize: '16px', marginTop: '4px' }}>
            {acordeonActualAbierto ? '▼' : '▶'}
          </span>
        </button>

        {acordeonActualAbierto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Vitrina */}
            {campanaActual.length > 0 && <VitrinePanel referencias={campanaActual} />}

            {campanaActual.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '50px 20px',
                color: '#6B7280', fontSize: '14px',
              }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>📭</span>
                Sin referencias en la campaña actual.
                {!isFaseActiva && (
                  <p style={{ fontSize: '12px', color: '#4B5563', marginTop: '6px' }}>
                    Las referencias de "Próxima Campaña" se copiarán aquí cuando comience la fase lunar.
                  </p>
                )}
              </div>
            ) : (
              campanaActual.map((ref, idx) => (
                <ReferenciaCard
                  key={ref.id}
                  referencia={ref}
                  campana="actual"
                  idx={idx}
                  esEditable={esEditableActual}
                  onUpdate={(id, f, v) => handleUpdate('actual', id, f, v)}
                  onDelete={(id) => handleDelete('actual', id)}
                  onToggleLuna={handleToggleLuna}
                  onSubirImagen={subirImagenR2}
                />
              ))
            )}

            {/* Entrada tardía */}
            {isFaseActiva && !isAdmin && !isPremium && (
              <div style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 700, marginBottom: '4px' }}>
                    ⏱ ¿Llegaste tarde a esta fase?
                  </p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Puedes incorporarte pagando un plus de entrada tardía.
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'rgba(245,158,11,0.2)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    borderRadius: '8px', padding: '8px 16px',
                    fontSize: '11px', fontWeight: 700, color: '#f59e0b',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onClick={() => alert('Próximamente: acceso por plus de entrada tardía.')}
                >
                  Solicitar acceso
                </button>
              </div>
            )}

            {esEditableActual && campanaActual.length < MAX_REFERENCIAS && (
              <button
                type="button"
                onClick={() => handleAdd('actual')}
                style={{
                  width: '100%', marginTop: '6px',
                  background: 'rgba(34,211,238,0.08)',
                  border: '1px dashed rgba(34,211,238,0.3)',
                  borderRadius: '10px', padding: '12px',
                  fontSize: '13px', fontWeight: 700, color: '#22d3ee',
                  cursor: 'pointer',
                }}
              >
                + Añadir referencia a Campaña Actual
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── ACORDEÓN 2: Próxima Campaña (siempre editable) ── */}
      <div style={{
        background: 'rgba(168,85,247,0.04)',
        border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: '24px', padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <button
          type="button"
          onClick={() => setAcordeonSiguienteAbierto(!acordeonSiguienteAbierto)}
          style={{
            width: '100%', display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: acordeonSiguienteAbierto ? '20px' : '0',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              🌑 Próxima Campaña — Previo Abierto
            </h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              {campanaSiguiente.length} / {MAX_REFERENCIAS} referencias · Siempre editable
            </p>
          </div>
          <span style={{ color: '#9CA3AF', fontSize: '16px', marginTop: '4px' }}>
            {acordeonSiguienteAbierto ? '▼' : '▶'}
          </span>
        </button>

        {acordeonSiguienteAbierto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Vitrina preview */}
            {campanaSiguiente.length > 0 && <VitrinePanel referencias={campanaSiguiente} />}

            {campanaSiguiente.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '50px 20px',
                color: '#6B7280', fontSize: '14px',
              }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>🌑</span>
                Empieza a preparar tu próxima campaña lunar.
              </div>
            ) : (
              campanaSiguiente.map((ref, idx) => (
                <ReferenciaCard
                  key={ref.id}
                  referencia={ref}
                  campana="siguiente"
                  idx={idx}
                  esEditable={true}
                  onUpdate={(id, f, v) => handleUpdate('siguiente', id, f, v)}
                  onDelete={(id) => handleDelete('siguiente', id)}
                  onToggleLuna={handleToggleLuna}
                  onSubirImagen={subirImagenR2}
                />
              ))
            )}

            {campanaSiguiente.length < MAX_REFERENCIAS && (
              <button
                type="button"
                onClick={() => handleAdd('siguiente')}
                style={{
                  width: '100%', marginTop: '6px',
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px dashed rgba(168,85,247,0.3)',
                  borderRadius: '10px', padding: '12px',
                  fontSize: '13px', fontWeight: 700, color: '#a855f7',
                  cursor: 'pointer',
                }}
              >
                + Añadir referencia a Próxima Campaña
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botón Guardar */}
      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando || uploadingId}
        style={{
          width: '100%',
          background: guardando ? 'rgba(34,211,238,0.3)' : '#22d3ee',
          border: 'none', borderRadius: '14px',
          padding: '16px',
          fontSize: '14px', fontWeight: 800, color: '#000',
          cursor: guardando ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          boxShadow: '0 0 20px rgba(34,211,238,0.3)',
          transition: 'all 0.2s',
        }}
      >
        {guardando ? '💾 Guardando...' : uploadingId ? '📤 Subiendo imagen...' : '💾 GUARDAR CAMPAÑA'}
      </button>

    </div>
  );
};

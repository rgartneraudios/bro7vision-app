// src/data/CoordenadosBlock.jsx

export const CoordenadosBlock = ({
  country, setCountry, city, setCity, zipCode, setZipCode,
  address, setAddress, neighborhood, setNeighborhood,
  nearbyRef, setNearbyRef, bizCategory, setBizCategory,
  bizProfession, setBizProfession,
  description, setDescription,
  formData, InputStyle, LabelStyle,
}) => {

  const BIZ_CATEGORIES = [
    '🛒 Alimentación', '👗 Moda & Ropa', '💊 Salud & Farmacia',
    '🍕 Restauración', '🔧 Ferretería & Bricolaje', '💅 Belleza & Estética',
    '📚 Librería & Papelería', '🎮 Ocio & Entretenimiento', '🏋️ Deporte & Fitness',
    '🏠 Hogar & Decoración', '🚗 Automoción', '🐾 Mascotas',
    '⚖️ Servicios Legales', '🏥 Salud & Clínica', '💼 Consultoría',
    '🎨 Arte & Diseño', '📸 Fotografía', '💻 Tecnología & Informática',
    '🎓 Formación & Academia', '🏗️ Construcción & Reformas', 'Otro',
  ];

  return (
    <div className="mt-6 p-5 bg-black/20 rounded-2xl border border-white/5 space-y-5">
      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
        📍 COORDENADAS & PRESENTACIÓN
      </h3>

      {/* ── Fila 1: País + Ciudad ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LabelStyle}>País</label>
          <input type="text" value={country} onChange={e => setCountry(e.target.value)}
            className={InputStyle} placeholder="España" />
        </div>
        <div>
          <label className={LabelStyle}>Ciudad</label>
          <input type="text" value={city} onChange={e => setCity(e.target.value)}
            className={InputStyle} placeholder="Oviedo" />
        </div>
      </div>

      {/* ── Fila 2: CP + Barrio ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LabelStyle}>
            CP <span className="text-cyan-400">*</span>
          </label>
          <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)}
            className={InputStyle} placeholder="33010" maxLength={10} />
          <p className="text-[9px] text-gray-600 mt-1">Obligatorio · Indexa tu zona</p>
        </div>
        <div>
          <label className={LabelStyle}>
            Barrio <span className="text-cyan-400">*</span>
          </label>
          <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
            className={InputStyle} placeholder="La Corredoria" maxLength={60} />
          <p className="text-[9px] text-gray-600 mt-1">Obligatorio · Nodo de zona</p>
        </div>
      </div>

      {/* ── Cerca de... ── */}
      <div>
        <label className={LabelStyle}>
          Cerca de... <span className="text-cyan-400">*</span>
        </label>
        <input type="text" value={nearbyRef} onChange={e => setNearbyRef(e.target.value)}
          className={`${InputStyle} border-cyan-500/30`}
          placeholder="Al lado del Polideportivo · Zona de hoteles"
          maxLength={120} />
        <p className="text-[9px] text-gray-500 mt-1">
          Referencia humana de tu ubicación. Máx 2 referencias. Este campo alimenta el SEO interno y PORT AI.
        </p>
      </div>

      {/* ── Dirección completa (opcional) ── */}
      <div>
        <label className={LabelStyle}>Dirección completa <span className="text-gray-600 font-normal normal-case">(opcional)</span></label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)}
          className={InputStyle} placeholder="Calle Mayor 12, Local 3" maxLength={150} />
        <p className="text-[9px] text-gray-600 mt-1">Visible para el usuario. Un abogado puede omitirla.</p>
      </div>

      {/* ── Separador ── */}
      <div className="border-t border-white/5 pt-4">
        <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-4">
          🏷️ CATEGORÍA & PRESENTACIÓN
        </h4>

        {/* Selector de categoría */}
        <div className="mb-4">
          <label className={LabelStyle}>Categoría del negocio <span className="text-fuchsia-400">*</span></label>
          <select value={bizCategory} onChange={e => setBizCategory(e.target.value)}
            className={`${InputStyle} appearance-none cursor-pointer`}>
            <option value="" disabled>— Selecciona una categoría —</option>
            {BIZ_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Profesión / especialidad libre */}
        <div className="mb-4">
          <label className={LabelStyle}>Profesión / Especialidad</label>
          <input type="text" value={bizProfession} onChange={e => setBizProfession(e.target.value)}
            className={InputStyle} placeholder="Ej: Abogada laboral, Ferretería especializada..."
            maxLength={80} />
        </div>
        
        {/* Descripción */}
<div className="mb-4">
  <label className={LabelStyle}>Descripción</label>
  <textarea 
    value={description} 
    onChange={e => setDescription(e.target.value)}
    className={InputStyle} 
    placeholder="Describe tu negocio, productos o servicios principales..."
    rows={3}
    maxLength={300} 
  />
</div>

        </div>
    </div>
  );
};

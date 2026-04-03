// src/data/MarketTab.js

export const MarketTab = ({
  // Servicios (tabla 'assets' existente)
  serviceItems, newService, setNewService, handleAddService, handleDeleteItem,
  // Catálogo escalable (tabla 'catalog_items')
  catalogItems, catalogTotal, catalogPage, setCatalogPage,
  catalogSearch, setCatalogSearch, catalogLoading,
  handleDeleteCatalogItem, handleCSVUpload,
  CATALOG_PAGE_SIZE,
  // Mapache & Catálogo URL
  formData, setFormData, InputStyle, LabelStyle, CardStyle,
}) => {

  const totalPages = Math.ceil(catalogTotal / CATALOG_PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">

      {/* ══ SECCIÓN 1: CATÁLOGO ESCALABLE ══ */}
      <div className={`${CardStyle} border-yellow-500/20`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">
              📦 Catálogo BroShop
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {catalogTotal.toLocaleString()} artículos · Tabla <span className="text-yellow-600 font-mono">catalog_items</span>
            </p>
          </div>

          {/* Importar CSV */}
          <label className="cursor-pointer bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 text-[10px] font-bold uppercase px-4 py-2 rounded-xl hover:bg-yellow-500/20 transition-all">
            ⬆ IMPORTAR CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
        </div>

        {/* Formato CSV esperado */}
        <div className="bg-black/30 border border-white/5 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <span className="text-yellow-600 text-sm mt-0.5">ℹ</span>
          <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Formato CSV esperado</p>
            <p className="text-[9px] text-yellow-600 font-mono">title, description, price_fiat, url, category</p>
            <p className="text-[9px] text-gray-600 mt-1">Primera fila = cabecera (se ignora). Máx 5.000 artículos por importación.</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            value={catalogSearch}
            onChange={e => { setCatalogSearch(e.target.value); setCatalogPage(0); }}
            placeholder="Buscar en tu catálogo..."
            className={`${InputStyle} pl-10`}
          />
        </div>

        {/* Listado */}
        <div className="space-y-2 min-h-[200px]">
          {catalogLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-600 text-xs">
              ⏳ Cargando catálogo...
            </div>
          ) : catalogItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-700 text-xs italic">
              <span className="text-3xl mb-2">📭</span>
              {catalogSearch ? 'Sin resultados para esa búsqueda.' : 'Catálogo vacío. Importa un CSV para empezar.'}
            </div>
          ) : (
            catalogItems.map(item => (
              <div key={item.id}
                className="flex items-center justify-between bg-white/3 hover:bg-white/6 border border-white/5 hover:border-yellow-500/20 px-4 py-3 rounded-xl transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-yellow-100 group-hover:text-yellow-300 transition-colors truncate">
                    {item.title}
                  </p>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {item.category && (
                      <span className="text-[9px] bg-yellow-900/30 text-yellow-600 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">{item.price_fiat}€</span>
                    {item.description && (
                      <span className="text-[9px] text-gray-600 truncate max-w-[200px]">{item.description}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDeleteCatalogItem(item.id)}
                  className="ml-4 text-gray-700 hover:text-red-400 text-lg transition-all opacity-0 group-hover:opacity-100">
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => setCatalogPage(p => Math.max(0, p - 1))}
              disabled={catalogPage === 0}
              className="text-xs font-bold text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              ← Anterior
            </button>
            <span className="text-[10px] text-gray-500 font-bold">
              Página {catalogPage + 1} de {totalPages} · {catalogTotal} artículos
            </span>
            <button
              onClick={() => setCatalogPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={catalogPage >= totalPages - 1}
              className="text-xs font-bold text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* ══ SECCIÓN 2: SERVICIOS ══ */}
      <div className={`${CardStyle} border-cyan-500/20`}>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">🤝 Servicios</h3>
        <div className="space-y-3 mb-4">
          <input type="text" placeholder="TÍTULO (Ej: Consulta 1H)"
            value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })}
            className={InputStyle} />
          <div className="flex gap-3">
            <input type="number" placeholder="PRECIO €"
              value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })}
              className={InputStyle} />
            <input type="text" placeholder="LINK CALENDARIO / BOOKING"
              value={newService.url} onChange={e => setNewService({ ...newService, url: e.target.value })}
              className={InputStyle} />
          </div>
          <textarea placeholder="Descripción del servicio..."
            value={newService.desc} onChange={e => setNewService({ ...newService, desc: e.target.value })}
            className={`${InputStyle} h-20 resize-none`} />
        </div>
        <button onClick={handleAddService}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          + AÑADIR SERVICIO
        </button>

        {/* Lista de servicios activos */}
        {serviceItems.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
            {serviceItems.map(s => (
              <div key={s.id}
                className="flex justify-between items-center bg-white/3 hover:bg-white/6 p-3 rounded-xl border border-cyan-500/10 group transition-all">
                <div>
                  <p className="text-sm font-bold text-cyan-100">{s.title}</p>
                  <p className="text-[10px] text-gray-500">{s.price_fiat}€ · Reserva</p>
                </div>
                <button onClick={() => handleDeleteItem(s.id)}
                  className="text-gray-600 hover:text-red-400 font-bold transition-all opacity-0 group-hover:opacity-100 text-lg">
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ SECCIÓN 3: MAPACHE IA ══ */}
      <div className="p-5 border border-fuchsia-500/30 rounded-3xl bg-fuchsia-500/5 relative overflow-hidden group">
        <div className="absolute -right-5 -top-5 text-8xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12">🦝</div>
        <h3 className="text-xs text-fuchsia-300 font-bold uppercase tracking-widest mb-1">🧠 Instrucciones Mapache IA</h3>
        <p className="text-[10px] text-gray-500 mb-3">
          Describe tu negocio al Mapache. Cuanto más detalle, mejor responderá a tus clientes.
          Cuando PORT AI esté activo, este texto también alimentará su contexto.
        </p>
        <textarea
          value={formData.mapache_rules}
          onChange={e => setFormData({ ...formData, mapache_rules: e.target.value })}
          placeholder="Ej: Somos una ferretería familiar especializada en bricolaje. Nuestro horario es L-V 9-20h. Hacemos presupuestos gratuitos..."
          className={`${InputStyle} border-fuchsia-500/30 focus:border-fuchsia-400 h-28 bg-black/40`}
        />

        {/* Holo-Catálogo */}
        <div className="mt-4 pt-4 border-t border-fuchsia-500/10">
          <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-2">
            📸 Holo-Catálogo (Google Slides / URL)
          </label>
          <input type="text"
            value={formData.catalog_url}
            onChange={e => setFormData({ ...formData, catalog_url: e.target.value })}
            placeholder="https://docs.google.com/presentation/..."
            className={`${InputStyle} border-blue-500/30 focus:border-blue-400 bg-black/40`}
          />
        </div>
      </div>

    </div>
  );
};

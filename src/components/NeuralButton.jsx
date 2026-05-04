export default function NeuralButton({
  isAdmin = false,
  iaMode = 'off',
  tokensRestantes = 0,
  tokensTotales = 1,
  onToggleAdmin,
  onTogglePublic,
  setShowWalletModal,
}) {

  // --- Lógica de Interacción ---
  const handleTap = () => {
    if (import.meta.env.VITE_SHOW_STUDIO === 'true') {
      onToggleAdmin();
      return;
    }
    setShowWalletModal(true);
  };

  // --- Estilos ---
  const estaActivo = (isAdmin && iaMode === 'admin') || (!isAdmin && iaMode === 'public');
  
  // Color: Amarillo para Admin, Cyan para User
  const colorActivo = isAdmin ? '#facc15' : '#22d3ee';
  const colorInactivo = '#4b5563'; // Gris oscuro para apagado
  const colorActual = estaActivo ? colorActivo : colorInactivo;

  const borderStyle = { 
    borderColor: colorActual, 
    borderWidth: '1px',
    borderStyle: 'solid',
    // Resplandor si está activo
    boxShadow: estaActivo ? `0 0 10px 1px ${isAdmin ? 'rgba(250,204,21,0.3)' : 'rgba(34,211,238,0.3)'}` : 'none'
  };

  return (
    <div className="relative w-full my-3">
      <button
        className={`relative flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-300 select-none bg-black hover:bg-white/5`}
        style={borderStyle}
        onClick={handleTap}
      >
        {/* IZQUIERDA: Icono + Textos */}
        <div className="flex items-center gap-3">
          
          {/* ICONO */}
          <svg 
            className={`w-5 h-5 ${estaActivo ? 'animate-pulse' : ''}`}
            style={{ color: colorActual }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isAdmin ? (
              // ICONO ADMIN
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            ) : (
              // ICONO USUARIO
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 2a4.5 4.5 0 0 1 4.5 4.5v.5" />
                <circle cx="12" cy="12" r="1" style={{ fill: colorActual }} />
              </>
            )}
          </svg>

          {/* TEXTO */}
          <div className="flex flex-col items-start">
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              {isAdmin ? 'IA ADMIN' : 'NEURAL IA'}
            </span>
            <span className="text-[10px] font-mono mt-0.5" style={{ color: colorActual }}>
              {!isAdmin 
                ? (iaMode === 'public' ? `ONLINE · ${Math.floor(tokensRestantes / 1000)}k TKNS` : 'SYSTEM OFFLINE')
                : (iaMode === 'admin' ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE')
              }
            </span>
          </div>
        </div>

        {/* DERECHA: Indicador LED */}
        <div 
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: colorActual,
            boxShadow: estaActivo ? `0 0 8px 2px ${colorActual}` : 'none'
          }}
        />
      </button>

      {/* BARRA DE CONSUMO (Solo ciudadanos) - Ubicada discretamente abajo */}
      {!isAdmin && iaMode === 'public' && (
        <div className="absolute -bottom-1.5 left-0 w-full px-3">
          <div className="h-[2px] rounded-full bg-gray-800 overflow-hidden shadow-sm">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${(tokensRestantes / tokensTotales) * 100}%`, backgroundColor: colorActivo }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
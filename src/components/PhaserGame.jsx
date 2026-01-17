import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PhaserGame = ({ config, onWin }) => {
  const gameContainer = useRef(null);
  const gameInstance = useRef(null);

  // 1. EFECTO DE NACIMIENTO (Solo se ejecuta 1 vez al montar)
  useEffect(() => {
    if (!gameContainer.current) return;

    console.log("🎮 PHASER: INICIALIZANDO MOTOR...");

    const finalConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: gameContainer.current,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      ...config,
      // Forzamos que el padre sea este ref, ignorando config externa
      parent: gameContainer.current 
    };

    try {
        // Crear instancia
        const game = new Phaser.Game(finalConfig);
        gameInstance.current = game;
        
        // Inyectar onWin inicial
        game.registry.set('onWin', onWin);
        
        console.log("✅ PHASER: MOTOR ONLINE");
    } catch (error) {
        console.error("❌ PHASER: ERROR CRÍTICO", error);
    }

    // Limpieza (Solo al cerrar la página o cambiar de sección)
    return () => {
      if (gameInstance.current) {
        console.log("🛑 PHASER: APAGANDO MOTOR");
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []); // <--- IMPORTANTE: ARRAY VACÍO. ESTO EVITA EL BUCLE.

  // 2. EFECTO DE ACTUALIZACIÓN (Si cambian los datos externos)
  useEffect(() => {
      if (gameInstance.current && onWin) {
          // Actualizamos la función de ganar sin reiniciar el juego
          gameInstance.current.registry.set('onWin', onWin);
      }
  }, [onWin]);

  return (
    <div 
      ref={gameContainer} 
      style={{ width: '100%', height: '100%', display: 'block' }}
      className="rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
    />
  );
};

export default PhaserGame;
import React, { useState } from 'react';
import { SCENARIOS, EMOTIONAL_MATRIX } from '../data/CruceDeCaminosData';

const BUTTON_SETS = {
    HOT: [
        { v: 2, l: '👺', desc: 'EGO', c: 'border-red-600 text-red-500 bg-red-600/10' },
        { v: 1, l: '🦊', desc: 'CRÍTICA', c: 'border-yellow-400 text-yellow-400 bg-yellow-400/10' },
        { v: -1, l: '🙏', desc: 'PACIENCIA', c: 'border-cyan-400 text-cyan-400 bg-cyan-400/10' },
        { v: -2, l: '🐧', desc: 'ENFRIAR', c: 'border-blue-600 text-blue-500 bg-blue-600/10' }
    ],
    COLD: [
        { v: 2, l: '🐶', desc: 'CARIÑO', c: 'border-red-600 text-red-500 bg-red-600/10' },
        { v: 1, l: '🐨', desc: 'KOALA', c: 'border-yellow-400 text-yellow-400 bg-yellow-400/10' },
        { v: -1, l: '🐍', desc: 'MENTIRA', c: 'border-cyan-400 text-cyan-400 bg-cyan-400/10' },
        { v: -2, l: '🐈', desc: 'INDIFERENCIA', c: 'border-blue-600 text-blue-500 bg-blue-600/10' } // Cambiado a Gato
    ],
    NEUTRAL: [
        { v: 2, l: '🐎', desc: 'ACCIÓN', c: 'border-red-600 text-red-500 bg-red-600/10' },
        { v: 1, l: '☕', desc: 'CHARLA', c: 'border-yellow-400 text-yellow-400 bg-yellow-400/10' },
        { v: -1, l: '🦉', desc: 'ESCUCHA', c: 'border-cyan-400 text-cyan-400 bg-cyan-400/10' },
        { v: -2, l: '😶', desc: 'VACÍO', c: 'border-blue-600 text-blue-500 bg-blue-600/10' }
    ]
};

const CruceDeCaminos = ({ onWin, onClose }) => {
    const [gameState, setGameState] = useState('PREVIO'); 
    const [step, setStep] = useState(1); 
    const [balance, setBalance] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [finalImage, setFinalImage] = useState(null);
    const [pendingReward, setPendingReward] = useState(0);
    const [activeScenario, setActiveScenario] = useState(null);

    const currentButtons = balance > 0 ? BUTTON_SETS.HOT : (balance < 0 ? BUTTON_SETS.COLD : BUTTON_SETS.NEUTRAL);

    const selectScenario = (sc) => {
        if (sc.locked) return;
        setActiveScenario(sc);
        setCurrentText(sc.context);
        setGameState('CONTEXT');
    };

    const handleInitialChoice = (val) => {
        setIsProcessing(true);
        setBalance(val); 
        setTimeout(() => {
            const p2Inertia = activeScenario.p2Inercia[1];
            const finalBalance = val + p2Inertia;
            setBalance(finalBalance);
            let startTag = finalBalance === 0 ? "INTRO_ZEN" : (EMOTIONAL_MATRIX[val]?.[p2Inertia] || "EGO");
            setCurrentText(activeScenario.dialogues[startTag]);
            setGameState('PLAYING');
            setStep(2); 
            setIsProcessing(false);
        }, 1000);
    };

    const handleAction = (playerValue) => {
        if (isProcessing) return;
        setIsProcessing(true);
        const midBalance = balance + playerValue;
        setBalance(midBalance);

        if (midBalance >= 3 || midBalance <= -3) {
            setTimeout(() => triggerEnd('out'), 800);
            return;
        }

        setTimeout(() => {
            const nextP2Step = step + 1; 
            const p2Inertia = activeScenario.p2Inercia[nextP2Step];
            const finalBalance = midBalance + p2Inertia;
            setBalance(finalBalance);

            if (finalBalance >= 3 || finalBalance <= -3) {
                triggerEnd('out'); return;
            }

            const emotionalTag = EMOTIONAL_MATRIX[midBalance]?.[p2Inertia];

            if (nextP2Step === 7) {
                let finalTag = finalBalance === 0 ? 'FINAL_ZEN' : (finalBalance > 0 ? 'FINAL_HOT' : 'FINAL_COLD');
                setCurrentText(activeScenario.dialogues[finalTag]);
                setTimeout(() => triggerEnd(finalBalance === 0 ? 'super' : 'venta'), 3000);
            } else {
                setCurrentText(activeScenario.dialogues[emotionalTag] || "...");
                setStep(nextP2Step + 1);
                setIsProcessing(false);
            }
        }, 1000);
    };

    const triggerEnd = (result) => {
        if (result === 'out') {
            setFinalImage('/images/CruceDeCaminos/out.png');
            setPendingReward(-10);
        } else if (result === 'super') {
            setFinalImage('/images/CruceDeCaminos/super.png');
            setPendingReward(100);
        } else {
            setFinalImage('/images/CruceDeCaminos/venta.png');
            setPendingReward(50);
        }
        setGameState('END');
    };

    // --- RENDER 1: MENÚ + MANUAL ---
    if (gameState === 'PREVIO') return (
        <div className="w-full h-full bg-black/95 flex items-center justify-center p-12 animate-fadeIn overflow-hidden">
            <div className="flex w-full max-w-6xl gap-12 h-full">
                {/* COLUMNA IZQUIERDA: MANUAL DE OPERACIONES */}
                <div className="w-1/3 flex flex-col justify-center border-r border-white/10 pr-12 text-left h-full font-mono">
                    <p className="text-indigo-500 font-black text-xs tracking-widest mb-4">[ MANUAL_DE_OPERACIONES ]</p>
                    <div className="space-y-6">
                        <div>
                            <p className="text-white font-black text-sm mb-1 uppercase tracking-tighter">1. El Equilibrio</p>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Vigila el termómetro superior. No dejes que la tensión llegue a los extremos (OUT) o perderás el cruce.</p>
                        </div>
                        <div>
                            <p className="text-white font-black text-sm mb-1 uppercase tracking-tighter">2. Alquimia Emocional</p>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Tus herramientas (animales) cambian según el clima. Elige tu intención: el fuego puede quemar o dar cariño.</p>
                        </div>
                        <div>
                            <p className="text-white font-black text-sm mb-1 uppercase tracking-tighter">3. Objetivo Final</p>
                            <p className="text-gray-500 text-[10px] leading-relaxed">Logra el equilibrio perfecto (ZEN 0) para obtener el máximo de puntos Génesis en la Fase 0.</p>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: SELECCIÓN */}
                <div className="w-2/3 flex flex-col justify-center">
                    <h2 className="text-white font-mono font-black italic text-3xl mb-12 uppercase tracking-tighter">Elige tu Cruce</h2>
                    <div className="grid grid-cols-3 gap-6 w-full aspect-[16/9]">
                        {SCENARIOS.map((sc) => (
                            <div key={sc.id} onClick={() => selectScenario(sc)} className={`relative rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ${sc.locked ? 'border-white/5 opacity-20' : 'border-indigo-500/40 hover:border-indigo-400 hover:scale-[1.03] cursor-pointer shadow-2xl shadow-indigo-500/10'}`}>
                                {sc.cover && <img src={sc.cover} className="w-full h-full object-cover" alt="" />}
                                <div className="absolute bottom-0 w-full bg-black/80 p-4 text-center text-white font-mono font-black italic text-[10px] uppercase tracking-widest">{sc.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- RENDER 2: CONTEXTO ---
    if (gameState === 'CONTEXT') return (
        <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="h-full aspect-[9/16] relative bg-neutral-950 flex flex-col items-center justify-between py-12 px-8 border-x border-white/5 shadow-2xl">
                <div className="w-full text-center">
                    <p className="text-indigo-400 font-mono font-black text-[10px] tracking-[0.3em] mb-2">[ SYSTEM_LOG ]</p>
                    <p className="text-white font-mono font-bold text-xs leading-tight tracking-wider uppercase">{activeScenario.context}</p>
                </div>
                <img src="/images/CruceDeCaminos/inicio.png" className="w-full h-3/5 object-cover rounded-xl border border-white/10" alt="" />
                
                <div className="w-full flex flex-col items-center">
                    <div className="w-44 h-[1px] bg-white/10 rounded-full relative mb-10">
                        <div className="absolute h-3 w-3 bg-white rounded-full -top-[5.5px] shadow-[0_0_10px_white] transition-all duration-1000" style={{ left: `${50 - (balance * 33.3)}%`, transform: 'translateX(-50%)' }} />
                    </div>
                    <div className="flex gap-4 w-full px-4">
                        <button 
                            disabled={isProcessing} 
                            onClick={() => handleInitialChoice(1)} 
                            className="flex-1 py-4 bg-red-600 text-white font-mono font-black uppercase text-[10px] tracking-widest rounded-xl active:scale-95 transition-all shadow-lg shadow-red-600/20 flex flex-col items-center gap-1"
                        >
                            <span className="text-xl">🐎</span>
                            <span>ACCIÓN</span>
                        </button>
                        <button 
                            disabled={isProcessing} 
                            onClick={() => handleInitialChoice(-1)} 
                            className="flex-1 py-4 border-2 border-cyan-500 text-cyan-500 font-mono font-black uppercase text-[10px] tracking-widest rounded-xl active:scale-95 transition-all flex flex-col items-center gap-1 shadow-lg shadow-cyan-500/10"
                        >
                            <span className="text-xl">🙏</span>
                            <span>ESPERAR</span>
                        </button>                    </div>
                </div>
            </div>
        </div>
    );

    // --- RENDER 3: GAMEPLAY & END ---
    return (
        <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <div className="h-full aspect-[9/16] relative bg-neutral-950 shadow-2xl overflow-hidden border-x border-white/5">
                
                {gameState === 'END' ? (
                    <div className="w-full h-full relative animate-fadeIn flex flex-col items-center justify-between">
                        <img src={finalImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        
                        <div className="relative z-10 w-full p-8 bg-black/80 backdrop-blur-md border-b-2 border-indigo-500/50 shadow-2xl flex flex-col items-center animate-fadeInDown">
                             <h3 className={`text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-2 ${pendingReward > 0 ? 'text-green-400' : 'text-red-500'}`}>
                                {pendingReward === 100 ? '¡VENTA MAESTRA!' : (pendingReward > 0 ? 'TRATO CERRADO' : 'CLIENTE PERDIDO')}
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl animate-pulse">💠</span>
                                <span className={`font-mono font-black text-6xl ${pendingReward > 0 ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]' : 'text-gray-500'}`}>
                                    {pendingReward > 0 ? '+' : ''}{pendingReward}
                                </span>
                            </div>
                            <p className="text-[10px] text-indigo-300 font-mono tracking-[0.4em] uppercase mt-2 font-black">SISTEMA GÉNESIS ACTUALIZADO</p>
                        </div>

                        <div className="relative z-10 w-full p-12 flex justify-center">
                            <button 
                                onClick={() => { onWin(pendingReward); onClose(); }} 
                                className="bg-white text-black hover:bg-indigo-500 hover:text-white transition-all hover:scale-110 px-16 py-5 rounded-full font-mono font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl"
                            >
                                ACTUALIZAR GÉNESIS
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <video key={activeScenario.videoSrc} autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105">
                            <source src={activeScenario.videoSrc} type="video/mp4" />
                        </video>
                        
                        <div className="absolute top-12 w-full flex flex-col items-center z-50 px-4">
                            <div className="flex justify-between w-44 text-[9px] font-mono font-black text-white/30 mb-3 tracking-widest uppercase">
                                <span>HOT</span><span>ZEN</span><span>COLD</span>
                            </div>
                            <div className="w-44 h-[1px] bg-white/10 rounded-full relative">
                                <div className="absolute h-4 w-4 bg-white rounded-full -top-[7.5px] shadow-[0_0_20px_white] transition-all duration-1000 ease-out" style={{ left: `${50 - (balance * 33.3)}%`, transform: 'translateX(-50%)' }} />
                            </div>
                        </div>

                        <div key={currentText} className="absolute top-[22%] left-0 w-full px-6 z-50 animate-fadeInUp">
                            <div className="bg-black/80 backdrop-blur-xl p-6 rounded-tr-3xl rounded-bl-3xl border-l-4 border-indigo-500 shadow-2xl">
                                <p className="text-indigo-100 text-center font-mono font-bold text-sm leading-tight tracking-wider uppercase">{currentText}</p>
                            </div>
                        </div>

                        <div className="absolute bottom-16 w-full flex justify-center gap-4 z-50">
                            {currentButtons.map((btn, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1 group">
                                    <button 
                                        disabled={isProcessing} 
                                        onClick={() => handleAction(btn.v)} 
                                        className={`w-14 h-14 rounded-full border-2 font-mono font-black text-2xl transition-all duration-300 hover:scale-125 hover:-translate-y-2 active:scale-95 shadow-xl disabled:opacity-50 ${btn.c}`}
                                    >
                                        {btn.l}
                                    </button>
                                    <span className="text-[7px] font-mono font-black text-white/50 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                        {btn.desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fadeInDown { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
            `}} />
        </div>
    );
};

export default CruceDeCaminos;
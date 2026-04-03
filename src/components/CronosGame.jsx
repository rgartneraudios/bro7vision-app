import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { marcarActividad } from '../hooks/useActividad';
import { useAudioContext } from '../context/AudioContext';

const TILE_SIZE = 100;
const COLS = 11;
const ROWS = 7;
const WIDTH = COLS * TILE_SIZE;
const HEIGHT = ROWS * TILE_SIZE;

// --- CONFIGURACIÓN AJUSTADA ---
const SPRITE_SIZE = 90;   
const WALL_PAD = 5;       
const PLAYER_HITBOX = 50; 
const ENEMY_HITBOX = 35;  
const PLAYER_SPEED = 5;
const ENEMY_NORMAL_SPEED = 2.5;  
const ENEMY_MONSTER_SPEED = 3.5;  

// --- FUNCIÓN MATEMÁTICA FALTANTE ---
const rectIntersect = (r1, r2) => {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
};

const CronosGame = ({ onWin, onClose }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { gamesMuted } = useAudioContext();
  
  const assets = useRef({
    playerImg: new Image(), 
    enemyImgs: [],          
    gemas: Array.from({ length: 9 }, (_, i) => { const img = new Image(); img.src = `/images/gema${i+1}.png`; return img; }),
    positivos: Array.from({ length: 9 }, (_, i) => { const img = new Image(); img.src = `/images/Positivo${i+1}.png`; return img; }),
    negativos: Array.from({ length: 9 }, (_, i) => { const img = new Image(); img.src = `/images/Negativo${i+1}.png`; return img; }),
    audios: {}
  });

  // Carga de imágenes
  useEffect(() => {
    assets.current.playerImg.src = '/images/Player.png';
    for(let i=1; i<=4; i++) {
        const img = new Image();
        img.src = `/images/Enemigo${i}.png`;
        assets.current.enemyImgs.push(img);
    }
  }, []);

  // Limpieza de audios al desmontar
  useEffect(() => {
    return () => {
      Object.values(assets.current.audios).forEach(a => {
        if(a) { a.pause(); a.currentTime = 0; }
      });
    };
  }, []);

  const MAP_LAYOUT = [
    ['C', '.', '#', '.', 'C', 'V', 'C', '.', '#', '.', 'C'],
    ['.', '#', '#', '.', '.', '.', '.', '.', '#', '#', '.'],
    ['.', '.', '.', '.', '#', '.', '#', '.', '.', '.', '.'],
    ['V', '.', '#', '.', '.', 'C', '.', '.', '#', '.', 'V'],
    ['.', '.', '.', '.', '#', '.', '#', '.', '.', '.', '.'],
    ['.', '#', '#', '.', '.', '.', '.', '.', '#', '#', '.'],
    ['C', '.', '#', '.', 'C', 'V', 'C', '.', '#', '.', 'C'],
  ];

  const gameState = useRef({
    player: { x: 305, y: 205, skin: 'normal', faceIdx: null, damageCooldown: 0 }, 
    enemies: [
      { x: 25, y: 205, vx: ENEMY_NORMAL_SPEED, vy: 0, imgId: 0, skin: 'normal', faceIdx: null, portalCD: 0 },
      { x: 1015, y: 205, vx: -ENEMY_NORMAL_SPEED, vy: 0, imgId: 1, skin: 'normal', faceIdx: null, portalCD: 0 },
      { x: 25, y: 405, vx: 0, vy: -ENEMY_NORMAL_SPEED, imgId: 2, skin: 'normal', faceIdx: null, portalCD: 0 },
      { x: 1015, y: 405, vx: 0, vy: ENEMY_NORMAL_SPEED, imgId: 3, skin: 'normal', faceIdx: null, portalCD: 0 }
    ],
    cubes: [],
    walls: [],
    portals: [],
    keys: {},
    portalCooldown: 0 
  });

  useEffect(() => {
    const cubes = [];
    const walls = [];
    const portals = [];
    let cubeCount = 0;

    MAP_LAYOUT.forEach((row, r) => {
      row.forEach((cell, c) => {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        if (cell === '#') walls.push({ x, y, w: TILE_SIZE, h: TILE_SIZE });
        if (cell === 'V') portals.push({ x, y, side: r === 0 ? 'top' : r === 6 ? 'bottom' : c === 0 ? 'left' : 'right' });
        if (cell === 'C') {
          let door = 'bottom';
          if (r === 0) door = 'bottom'; else if (r === 6) door = 'top';
          else if (c === 0) door = 'right'; else if (c === 10) door = 'left';
          else if (r === 3 && c === 5) door = 'bottom'; 
          else if (r < 3) door = 'bottom'; else door = 'top';

          cubes.push({
            id: cubeCount++,
            x: x + 5, y: y + 5,
            status: 'closed',
            timer: 0,
            doorSide: door
          });
        }
      });
    });

    gameState.current.cubes = cubes;
    gameState.current.walls = walls;
    gameState.current.portals = portals;
  }, []);

  const initGame = () => {
    if (Object.keys(assets.current.audios).length === 0) {
        const audNames = ['loop', 'cronos', 'gong', 'portal', 'mistica', 'horror', 'ghost'];
        audNames.forEach(k => {
            const a = new Audio(`/audio/${k === 'loop' ? 'loops' : k}.mp3`);
            if (k === 'loop') a.loop = true;
            a.volume = 1.0;
            assets.current.audios[k] = a;
        });
    }
    // Solo play si no está muteado
    if (!gamesMuted) {
        assets.current.audios.loop.play().catch(e => console.log("Audio play failed:", e));
    }
    setGameStarted(true);
  };

  const isColliding = (x, y, isPlayer = true) => {
    const centerX = x + SPRITE_SIZE / 2;
    const centerY = y + SPRITE_SIZE / 2;
    const size = isPlayer ? PLAYER_HITBOX : ENEMY_HITBOX; 

    const charRect = {
        left: centerX - size / 2, right: centerX + size / 2,
        top: centerY - size / 2, bottom: centerY + size / 2
    };

    if (charRect.left < 5 || charRect.right > WIDTH - 5 || 
        charRect.top < 5 || charRect.bottom > HEIGHT - 5) {
      const onPortal = gameState.current.portals.some(p => 
        centerX > p.x && centerX < p.x + 100 && centerY > p.y && centerY < p.y + 100
      );
      if (!onPortal) return true;
    }

    for (const c of gameState.current.cubes) {
        const cz = 90; 
        const isDoorGone = c.status !== 'closed' && c.status !== 'opening';

        if (!isDoorGone) {
            const cubeRect = { left: c.x, right: c.x + cz, top: c.y, bottom: c.y + cz };
            if (rectIntersect(charRect, cubeRect)) return true;
        } else {
            const thick = 15; 
            const shorten = 20; 

            let walls = [];
            if (c.doorSide === 'bottom') {
                walls.push({ l: c.x, r: c.x + cz, t: c.y, b: c.y + thick });
                walls.push({ l: c.x, r: c.x + thick, t: c.y, b: c.y + cz - shorten });
                walls.push({ l: c.x + cz - thick, r: c.x + cz, t: c.y, b: c.y + cz - shorten });
            } 
            else if (c.doorSide === 'top') {
                walls.push({ l: c.x, r: c.x + cz, t: c.y + cz - thick, b: c.y + cz });
                walls.push({ l: c.x, r: c.x + thick, t: c.y + shorten, b: c.y + cz });
                walls.push({ l: c.x + cz - thick, r: c.x + cz, t: c.y + shorten, b: c.y + cz });
            }
            else if (c.doorSide === 'right') {
                walls.push({ l: c.x, r: c.x + thick, t: c.y, b: c.y + cz });
                walls.push({ l: c.x, r: c.x + cz - shorten, t: c.y, b: c.y + thick });
                walls.push({ l: c.x, r: c.x + cz - shorten, t: c.y + cz - thick, b: c.y + cz });
            }
            else if (c.doorSide === 'left') {
                walls.push({ l: c.x + cz - thick, r: c.x + cz, t: c.y, b: c.y + cz });
                walls.push({ l: c.x + shorten, r: c.x + cz, t: c.y, b: c.y + thick });
                walls.push({ l: c.x + shorten, r: c.x + cz, t: c.y + cz - thick, b: c.y + cz });
            }

            for (const w of walls) {
                if (rectIntersect(charRect, { left: w.l, right: w.r, top: w.t, bottom: w.b })) return true;
            }
        }
    }

    for (const w of gameState.current.walls) {
        const currentWallPad = isPlayer ? 10 : WALL_PAD;
        const wallRect = {
            left: w.x - currentWallPad, right: w.x + w.w + currentWallPad,
            top: w.y - currentWallPad, bottom: w.y + w.h + currentWallPad
        };
        if (rectIntersect(charRect, wallRect)) return true;
    }

    return false;
  };

  const update = () => {
    if (!gameStarted || gameOver) return;
    const { player, enemies, cubes, keys } = gameState.current;

    let dx = 0; let dy = 0;
    const speed = PLAYER_SPEED;
    if (keys['w'] || keys['arrowup']) dy = -speed;
    if (keys['s'] || keys['arrowdown']) dy = speed;
    if (keys['a'] || keys['arrowleft']) dx = -speed;
    if (keys['d'] || keys['arrowright']) dx = speed;

    if (dy !== 0) {
        if (!isColliding(player.x, player.y + dy)) player.y += dy;
        else if (!isColliding(player.x + 10, player.y + dy)) player.x += 4;
        else if (!isColliding(player.x - 10, player.y + dy)) player.x -= 4;
    }
    if (dx !== 0) {
        if (!isColliding(player.x + dx, player.y)) player.x += dx;
        else if (!isColliding(player.x + dx, player.y + 10)) player.y += 4;
        else if (!isColliding(player.x + dx, player.y - 10)) player.y -= 4;
    }

    if (gameState.current.portalCooldown > 0) gameState.current.portalCooldown--;
    if (player.damageCooldown > 0) player.damageCooldown--;  
    
    if (gameState.current.portalCooldown === 0) {
      gameState.current.portals.forEach(p => {
        const pCx = p.x + 50, pCy = p.y + 50;
        const plCx = player.x + SPRITE_SIZE/2, plCy = player.y + SPRITE_SIZE/2;
        if (Math.hypot(plCx - pCx, plCy - pCy) < 40) {
           teleport(true); gameState.current.portalCooldown = 60;
        }
      });
    }

    const plCx = player.x + SPRITE_SIZE/2;
    const plCy = player.y + SPRITE_SIZE/2;
    const hbR = PLAYER_HITBOX / 2;

    cubes.forEach(c => {
      if (c.status === 'closed') {
        let tx = c.x, ty = c.y, tw = 90, th = 90;
        if (c.doorSide === 'top') { tx = c.x; ty -= 10; tw = 90; th = 20; }
        if (c.doorSide === 'bottom') { tx = c.x; ty += 80; tw = 90; th = 20; }
        if (c.doorSide === 'left') { tx -= 10; ty = c.y; tw = 20; th = 90; }
        if (c.doorSide === 'right') { tx += 80; ty = c.y; tw = 20; th = 90; }

        if (plCx + hbR > tx && plCx - hbR < tx + tw && plCy + hbR > ty && plCy - hbR < ty + th) {
            c.status = 'opening'; c.timer = 200;
            // -- PROTECCIÓN AUDIO --
            if (!gamesMuted) assets.current.audios.cronos.play();
        }
      }
      if (c.status === 'opening' && --c.timer <= 0) {
        c.status = 'open'; 
        assets.current.audios.cronos.pause(); assets.current.audios.cronos.currentTime = 0;
        // -- PROTECCIÓN AUDIO --
        if (!gamesMuted) assets.current.audios.gong.play();
      }
      
      if (c.status === 'open' && Math.hypot(plCx - (c.x + 45), plCy - (c.y + 45)) < 30) {
        c.status = 'captured_pos'; player.skin = 'face'; player.faceIdx = c.id;
        setScore(s => s + 20); 
        // -- PROTECCIÓN AUDIO --
        if (!gamesMuted) assets.current.audios.mistica.play();
      }
      
      enemies.forEach(en => {
        if (c.status === 'open') {
          const enCx = en.x + SPRITE_SIZE/2;
          const enCy = en.y + SPRITE_SIZE/2;
          const cubeCx = c.x + 45;
          const cubeCy = c.y + 45;
          
          const dist = Math.hypot(enCx - cubeCx, enCy - cubeCy);
          
          if (dist < 35) {
            let enteringThroughDoor = false;
            
            if (c.doorSide === 'bottom') {
              enteringThroughDoor = enCy > cubeCy + 20;
            } else if (c.doorSide === 'top') {
              enteringThroughDoor = enCy < cubeCy - 20;
            } else if (c.doorSide === 'right') {
              enteringThroughDoor = enCx > cubeCx + 20;
            } else if (c.doorSide === 'left') {
              enteringThroughDoor = enCx < cubeCx - 20;
            }
            
            if (enteringThroughDoor) {
              c.status = 'captured_neg'; 
              en.skin = 'face'; 
              en.faceIdx = c.id;
              // -- PROTECCIÓN AUDIO --
              if (!gamesMuted) assets.current.audios.horror.play();
            }
          }
        }
      });
    });

   enemies.forEach(en => {
      if (en.portalCD > 0) en.portalCD--;
      
      const currentSpeed = en.skin === 'normal' ? ENEMY_NORMAL_SPEED : ENEMY_MONSTER_SPEED;

      let beingSucked = false;
      cubes.forEach(c => {
        if (c.status === 'open') {
          const cCx = c.x + 45, cCy = c.y + 45;
          const enCx = en.x + SPRITE_SIZE/2, enCy = en.y + SPRITE_SIZE/2;
          const dist = Math.hypot(cCx - enCx, cCy - enCy);
          
          if (dist < 150) {  
            let alignedWithDoor = false;
            
            if (c.doorSide === 'bottom' && Math.abs(enCx - cCx) < 40 && enCy > cCy) {
              alignedWithDoor = true;
            } else if (c.doorSide === 'top' && Math.abs(enCx - cCx) < 40 && enCy < cCy) {
              alignedWithDoor = true;
            } else if (c.doorSide === 'right' && Math.abs(enCy - cCy) < 40 && enCx > cCx) {
              alignedWithDoor = true;
            } else if (c.doorSide === 'left' && Math.abs(enCy - cCy) < 40 && enCx < cCx) {
              alignedWithDoor = true;
            }
            
            if (alignedWithDoor && dist < 120) {
              beingSucked = true;
              const angle = Math.atan2(cCy - enCy, cCx - enCx);
              const suckSpeed = 3.5;
              en.x += Math.cos(angle) * suckSpeed; 
              en.y += Math.sin(angle) * suckSpeed;
              
              en.vx = Math.cos(angle) * currentSpeed;
              en.vy = Math.sin(angle) * currentSpeed;
            }
          }
        }
      });

      if (!beingSucked) {
          gameState.current.portals.forEach(p => {
            if (Math.hypot((en.x + SPRITE_SIZE/2) - (p.x + 50), (en.y + SPRITE_SIZE/2) - (p.y + 50)) < 40) {
                if (!en.portalCD || en.portalCD <= 0) {
                    assets.current.audios.portal.currentTime = 0; 
                    // -- PROTECCIÓN AUDIO --
                    if (!gamesMuted) assets.current.audios.portal.play();

                    const spots = [{x: 505, y: 105}, {x: 505, y: 505}, {x: 105, y: 305}, {x: 905, y: 305}];
                    const target = spots[Math.floor(Math.random() * spots.length)];
                    en.x = target.x; en.y = target.y; 
                    en.portalCD = 150;
                    
                    const randomDirs = [{vx:1,vy:0},{vx:-1,vy:0},{vx:0,vy:1},{vx:0,vy:-1}];
                    const randomDir = randomDirs[Math.floor(Math.random() * randomDirs.length)];
                    en.vx = randomDir.vx * currentSpeed;
                    en.vy = randomDir.vy * currentSpeed;
                }
            }
          });

          const nextX = en.x + en.vx;
          const nextY = en.y + en.vy;
          
          if (!isColliding(nextX, nextY, false)) {
              en.x = nextX;
              en.y = nextY;
              
              if (Math.random() < 0.05) {
                  const validDirections = [];
                  const dirs = [
                      { vx: 1, vy: 0 }, { vx: -1, vy: 0 },
                      { vx: 0, vy: 1 }, { vx: 0, vy: -1 }
                  ];
                  
                  const curDirX = en.vx !== 0 ? Math.sign(en.vx) : 0;
                  const curDirY = en.vy !== 0 ? Math.sign(en.vy) : 0;
                  
                  dirs.forEach(d => {
                      if (d.vx === -curDirX && d.vy === -curDirY) return;
                      if (!isColliding(en.x + d.vx * 60, en.y + d.vy * 60, false)) validDirections.push(d);
                  });
                  
                  if (validDirections.length > 0) {
                      const pick = validDirections[Math.floor(Math.random() * validDirections.length)];
                      en.vx = pick.vx * currentSpeed;
                      en.vy = pick.vy * currentSpeed;
                  }
              }
          } else {
              const validDirections = [];
              const dirs = [
                  { vx: 1, vy: 0 }, { vx: -1, vy: 0 },
                  { vx: 0, vy: 1 }, { vx: 0, vy: -1 }
              ];

              const curDirX = en.vx !== 0 ? Math.sign(en.vx) : 0;
              const curDirY = en.vy !== 0 ? Math.sign(en.vy) : 0;

              dirs.forEach(d => {
                  if (d.vx === -curDirX && d.vy === -curDirY) return;
                  const testDist = 60;
                  if (!isColliding(en.x + d.vx * testDist, en.y + d.vy * testDist, false)) validDirections.push(d);
              });

              if (validDirections.length === 0) {
                  dirs.forEach(d => {
                      const testDist = 60;
                      if (!isColliding(en.x + d.vx * testDist, en.y + d.vy * testDist, false)) validDirections.push(d);
                  });
              }

              if (validDirections.length > 0) {
                  const pick = validDirections[Math.floor(Math.random() * validDirections.length)];
                  en.vx = pick.vx * currentSpeed;
                  en.vy = pick.vy * currentSpeed;
                  en.x += en.vx;
                  en.y += en.vy;
              } else {
                  en.vx = -curDirX * currentSpeed;
                  en.vy = -curDirY * currentSpeed;
                  if (en.vx === 0 && en.vy === 0) en.vx = currentSpeed;
                  en.x += en.vx;
                  en.y += en.vy;
              }
          }
      }
      
      const dist = Math.hypot(
          (en.x + SPRITE_SIZE/2) - (player.x + SPRITE_SIZE/2), 
          (en.y + SPRITE_SIZE/2) - (player.y + SPRITE_SIZE/2)
      );
      
      if (dist < 50) {
          if (en.skin === 'normal') {
              setGameOver(true);
          } else {
              if (player.damageCooldown <= 0) {
                  setScore(s => s - 10); 
                  player.damageCooldown = 90; 
                  
                  if (assets.current.audios.ghost) {
                      assets.current.audios.ghost.currentTime = 0;
                      // -- PROTECCIÓN AUDIO --
                      if (!gamesMuted) assets.current.audios.ghost.play();
                  }
              }
          }
      }
    });

    if (cubes.every(c => c.status.startsWith('captured'))) setGameOver(true);
  };

  const teleport = (isPlayer = false) => {
    if (isPlayer && assets.current.audios.portal) { 
        assets.current.audios.portal.currentTime = 0; 
        // -- PROTECCIÓN AUDIO --
        if (!gamesMuted) assets.current.audios.portal.play(); 
    }
    const spots = [{x: 505, y: 105}, {x: 505, y: 505}, {x: 105, y: 305}, {x: 905, y: 305}];
    const target = spots[Math.floor(Math.random() * spots.length)];
    gameState.current.player.x = target.x; 
    gameState.current.player.y = target.y;
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    const { player, enemies, cubes, walls, portals } = gameState.current;

    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = '#facc15';
    const border = 10;
    ctx.fillRect(0,0,WIDTH,border); ctx.fillRect(0,HEIGHT-border,WIDTH,border);
    ctx.fillRect(0,0,border,HEIGHT); ctx.fillRect(WIDTH-border,0,border,HEIGHT);
    
    portals.forEach(p => {
        if(p.y===0) ctx.clearRect(p.x, 0, 100, border);
        if(p.y===HEIGHT-100) ctx.clearRect(p.x, HEIGHT-border, 100, border);
        if(p.x===0) ctx.clearRect(0, p.y, border, 100);
        if(p.x===WIDTH-100) ctx.clearRect(WIDTH-border, p.y, border, 100);
    });

    walls.forEach(w => { 
        ctx.beginPath(); 
        ctx.roundRect(w.x - WALL_PAD + 2, w.y - WALL_PAD + 2, w.w + (WALL_PAD*2) - 4, w.h + (WALL_PAD*2) - 4, 8); 
        ctx.fill(); 
    });

    ctx.shadowBlur = 25; ctx.shadowColor = '#4ade80'; ctx.fillStyle = '#4ade80';
    portals.forEach(p => ctx.fillRect(p.x + 25, p.y + 25, 50, 50));
    ctx.shadowBlur = 0;

    cubes.forEach((c, i) => {
      ctx.strokeStyle = '#facc15'; 
      ctx.lineWidth = 4;
      ctx.beginPath();
      
      const isDoorPermanentlyOpen = c.status !== 'closed' && c.status !== 'opening';
      
      if (!isDoorPermanentlyOpen || c.doorSide !== 'top') { ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + 90, c.y); }
      if (!isDoorPermanentlyOpen || c.doorSide !== 'bottom') { ctx.moveTo(c.x, c.y + 90); ctx.lineTo(c.x + 90, c.y + 90); }
      if (!isDoorPermanentlyOpen || c.doorSide !== 'left') { ctx.moveTo(c.x, c.y); ctx.lineTo(c.x, c.y + 90); }
      if (!isDoorPermanentlyOpen || c.doorSide !== 'right') { ctx.moveTo(c.x + 90, c.y); ctx.lineTo(c.x + 90, c.y + 90); }
      ctx.stroke();

      if (c.status === 'closed' || c.status === 'opening') {
          let bx=c.x, by=c.y, bw=0, bh=0;
          if(c.doorSide==='top') { bx=c.x; by-=8; bw=90; bh=8; }
          if(c.doorSide==='bottom') { bx=c.x; by+=90; bw=90; bh=8; }
          if(c.doorSide==='left') { bx-=8; by=c.y; bw=8; bh=90; }
          if(c.doorSide==='right') { bx+=90; by=c.y; bw=8; bh=90; }
          
          const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
          ctx.shadowBlur = 30 * pulse; ctx.shadowColor = '#00ffff';
          ctx.fillStyle = '#00ffff'; ctx.fillRect(bx, by, bw, bh);
          ctx.shadowBlur = 0;
      }
      
      if (!c.status.startsWith('captured')) ctx.drawImage(assets.current.gemas[i], c.x+15, c.y+15, 60, 60);
      if (c.status === 'opening') { ctx.fillStyle = '#ff00ff'; ctx.fillRect(c.x, c.y-12, (c.timer/200)*90, 6); }
      if (c.status === 'captured_pos') ctx.drawImage(assets.current.positivos[i], c.x+15, c.y+15, 60, 60);
      if (c.status === 'captured_neg') ctx.drawImage(assets.current.negativos[i], c.x+15, c.y+15, 60, 60);
    });

    enemies.forEach(en => {
      if (en.skin === 'normal') {
         const img = assets.current.enemyImgs[en.imgId];
         if (img && img.complete) ctx.drawImage(img, en.x, en.y, SPRITE_SIZE, SPRITE_SIZE);
         else { ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(en.x+30, en.y+30, 28, 0, Math.PI*2); ctx.fill(); }
      } else ctx.drawImage(assets.current.negativos[en.faceIdx], en.x, en.y, SPRITE_SIZE, SPRITE_SIZE);
    });

    if (player.skin === 'normal') {
        if (player.damageCooldown > 0 && Math.floor(player.damageCooldown / 10) % 2 === 0) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0000';
        }
        
        if (assets.current.playerImg.complete) ctx.drawImage(assets.current.playerImg, player.x, player.y, SPRITE_SIZE, SPRITE_SIZE);
        else { ctx.fillStyle = 'yellow'; ctx.beginPath(); ctx.arc(player.x+30, player.y+30, 28, 0, Math.PI*2); ctx.fill(); }
        
        ctx.shadowBlur = 0;
    } else ctx.drawImage(assets.current.positivos[player.faceIdx], player.x, player.y, SPRITE_SIZE, SPRITE_SIZE);
  };

  useEffect(() => {
    const loop = setInterval(() => { update(); draw(); }, 16);
    const d = (e) => gameState.current.keys[e.key.toLowerCase()] = true;
    const u = (e) => gameState.current.keys[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', d); window.addEventListener('keyup', u);
    
    return () => { 
        clearInterval(loop); 
        window.removeEventListener('keydown', d); 
        window.removeEventListener('keyup', u);
    };
  }, [gameStarted, gameOver]);

  // Manejo de Audio Game Over
  useEffect(() => { if (gameOver && assets.current.audios.loop) assets.current.audios.loop.pause(); }, [gameOver]);

  // --- REGISTRO DE ACTIVIDAD FUE MOVIDO AFUERA DEL HANDLE CLOSE PARA NO DAR ERROR DE REACT ---
  useEffect(() => {
    if (gameOver) {
      const registrarActividad = async () => {
        try {
          await marcarActividad('games'); 
          console.log("Actividad de juego guardada con éxito");
        } catch (error) {
          console.error("Error al marcar actividad del juego:", error);
        }
      };
      registrarActividad();
    }
  }, [gameOver]);

  const handleClose = () => {
    const hasWonAll = gameState.current.cubes.every(c => c.status.startsWith('captured'));
    const finalAmount = hasWonAll ? score : 10; 
    
    console.log('Telecronos - Enviando puntos:', finalAmount);
    onWin(finalAmount); 
    
    if (assets.current.audios.loop) { 
      assets.current.audios.loop.pause();
      assets.current.audios.loop.currentTime = 0; 
    }
    
    if (onClose) onClose();
  };
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black flex items-center justify-center select-none" style={{ zIndex: 2147483647 }}>
      {!gameStarted && (
        <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center z-[10]">
          <button onClick={initGame} className="px-20 py-8 bg-yellow-500 text-black font-black text-3xl uppercase rounded-full shadow-[0_0_80px_orange]">SINTONIZAR CRONOS</button>
        </div>
      )}
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="max-w-full max-h-full object-contain" />
      <button onClick={handleClose} className="absolute top-10 right-10 text-white/40 hover:text-white font-black text-xl uppercase tracking-widest">❮ EXIT</button>
      <div className="absolute top-6 left-16 text-cyan-400 font-black text-5xl italic drop-shadow-2xl">GÉNESIS: {score}</div>
      
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[20] animate-fadeIn">
          {gameState.current.cubes.every(c => c.status.startsWith('captured')) ? (
             <>
               <h1 className="text-yellow-400 font-black text-8xl italic mb-6 shadow-yellow-500 drop-shadow-lg">Has obtenido......</h1>
               <div className="text-white text-2xl mb-8">PUNTUACIÓN TOTAL: {score}</div>
             </>
          ) : (
             <>
               <h1 className="text-red-600 font-black text-8xl italic mb-6">Gracias por participar !</h1>
               <div className="text-white text-2xl mb-8">
  		GÉNESIS OBTENIDOS: <span className="text-cyan-400">10</span>
		</div>
             </>
          )}
          <button onClick={handleClose} className="px-16 py-6 bg-white text-black font-black uppercase rounded-full text-2xl hover:bg-yellow-500">
            VOLVER AL NEXUS
          </button>
        </div>
      )}
      
      <style>{`
        .cronos-scroll::-webkit-scrollbar { width: 4px; }
        .cronos-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
        .cronos-scroll::-webkit-scrollbar-thumb { background: #facc15; border-radius: 10px; box-shadow: 0 0 8px #facc15; }
        .cronos-scroll::-webkit-scrollbar-thumb:hover { background: #fff; }
        .cronos-scroll { scrollbar-width: thin; scrollbar-color: #facc15 rgba(0,0,0,0.5); }
      `}</style>

      <div className="absolute left-2 md:left-12 top-[15%] md:top-[20%] w-48 md:w-56 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-yellow-500/30 shadow-[0_0_30px_rgba(0,0,0,0.9)] z-[20] flex flex-col"> 
        <h2 className="text-yellow-400 font-black text-lg md:text-2xl mb-3 uppercase tracking-widest drop-shadow-md border-b border-yellow-500/20 pb-2">
            TELECRONOS
        </h2> 
        <div className="text-gray-300 text-[10px] md:text-[12.5px] leading-relaxed max-h-[60vh] overflow-y-auto cronos-scroll pr-3 flex flex-col gap-3 font-mono">
            <p><span className="text-yellow-400 font-bold block mb-0.5">INFO:</span> Telecronos es un modelo beta. Si gusta, lanzaremos versión premium con más niveles.</p>
            <p><span className="text-cyan-400 font-bold block mb-0.5">OBJETIVO:</span> Activa los cubos para obtener 9 gemas <span className="text-fuchsia-400">(20 Génesis c/u)</span>. Entra rápido al portal antes que el enemigo.</p>
            <p><span className="text-red-500 font-bold block mb-0.5">PELIGRO:</span> Los enemigos rojos te matan al contacto.</p>
            <p><span className="text-purple-400 font-bold block mb-0.5">MECÁNICA:</span> Los portales absorben enemigos y los hacen fantasmas. Los fantasmas te quitan 10 Génesis al cruzarlos.</p>
            <p><span className="text-green-400 font-bold block mb-0.5">ESTRATEGIA:</span> Abre portales, transforma enemigos y sobrevive. Usa las flechas para moverte.</p>
        </div>
      </div>
    </div>, document.body
  );
};

export default CronosGame;
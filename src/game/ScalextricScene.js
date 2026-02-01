import Phaser from 'phaser';

// --- CONFIGURACIÓN ULTRAWIDE (ALARGADO) ---
const CANVAS_W = 960;   // <--- ANCHO PANORÁMICO
const CANVAS_H = 500;
const CENTER_X = 480;   // Mitad de 960
const CENTER_Y = 250;
const STRAIGHT_W = 520; // <--- RECTA LARGA (Elongación recuperada)
const INNER_RADIUS = 50;
const LANE_STEP = 28;
const TOTAL_QUESTIONS = 5;
const TOTAL_LAPS = 6;
const BASE_LAP_TIME = 5.0; 

export default class ScalextricScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScalextricScene' });
    }

    preload() {
        this.load.image('grass', '/assets/grass.png'); 
        this.load.image('asphalt', '/assets/asphalt.png');
        
        this.load.image('car_cpu1', '/assets/car_red.png');
        this.load.image('car_cpu2', '/assets/car_orange.png');
        this.load.image('car_cpu3', '/assets/car_green.png');
        this.load.image('car_cpu4', '/assets/car_violet.png');
        this.load.image('car_player', '/assets/car_cyan.png');
    }

    create() {
        this.isRacing = false; 

        // 1. FONDO
        if (this.textures.exists('grass')) {
            this.grass = this.add.tileSprite(CENTER_X, CENTER_Y, CANVAS_W, CANVAS_H, 'grass');
            this.grass.setTint(0x1a331a);
        } else {
            this.add.rectangle(CENTER_X, CENTER_Y, CANVAS_W, CANVAS_H, 0x1a331a);
        }

        // 2. GEOMETRÍA
        this.graphics = this.add.graphics();
        this.createPaths();
        
        // 3. COCHES
        this.createCars();

        // 4. DIBUJAR PISTA (Limpia)
        this.drawTrack(); 

        // 5. EVENTOS
        this.game.events.off('playerAnswered');
        this.game.events.on('playerAnswered', () => {
            const player = this.cars.find(c => c.racerId === 'player');
            if (player) {
                player.state = 'running';
                player.questionsAnswered++;
            }
        });

        this.game.events.off('startRace');
        this.game.events.on('startRace', () => {
            this.startCountdown();
        });

        this.game.events.off('resetRace');
        this.game.events.on('resetRace', () => {
            this.scene.restart();
        });
    }

    startCountdown() {
        const texts = ['3', '2', '1', 'GO!'];
        let index = 0;

        // Emitir sonido inicial (bip de cuenta atrás)
        this.game.events.emit('playSound', 'beep'); // Asegúrate de tener beep.mp3 o usa otro

        const countdownText = this.add.text(CENTER_X, CENTER_Y, '3', {
            fontSize: '120px', fontStyle: 'bold', color: '#ffff00', stroke: '#000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(200);

        countdownText.setVisible(true);

        const timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                index++;
                if (index < texts.length) {
                    countdownText.setText(texts[index]);
                    
                    // --- ANIMACIÓN ---
                    this.tweens.add({
                        targets: countdownText,
                        scale: { from: 0.8, to: 1.2 },
                        duration: 200,
                        yoyo: true
                    });

                    // --- LÓGICA DE AUDIO Y SALIDA ---
                    if (texts[index] === 'GO!') {
                        // AQUÍ ESTÁ EL CAMBIO: Emitimos el sonido de salida
                        this.game.events.emit('playSound', 'f1_start'); 
                        
                        this.isRacing = true; 
                        this.time.delayedCall(1000, () => {
                            countdownText.destroy();
                        });
                    } else {
                        // Sonido para 2 y 1
                         this.game.events.emit('playSound', 'beep');
                    }
                } else {
                    timer.remove();
                }
            },
            repeat: 3
        });
    }
    createPaths() {
        this.trackPaths = [];
        for (let i = 0; i < 5; i++) {
            const path = new Phaser.Curves.Path();
            const radius = INNER_RADIUS + (i * LANE_STEP);
            
            path.moveTo(CENTER_X + STRAIGHT_W/2, CENTER_Y + radius);
            path.lineTo(CENTER_X - STRAIGHT_W/2, CENTER_Y + radius);
            path.ellipseTo(radius, radius, 90, 270, false, 0);
            path.lineTo(CENTER_X + STRAIGHT_W/2, CENTER_Y - radius);
            path.ellipseTo(radius, radius, 270, 90, false, 0);

            this.trackPaths.push(path);
        }
    }

    drawTrack() {
        const g = this.graphics;
        g.clear();
        
        // Pista
        for (let i = 0; i < 5; i++) {
            const path = this.trackPaths[i];
            g.lineStyle(26, 0x333333); 
            path.draw(g);
            g.lineStyle(1, 0xffffff, 0.3);
            path.draw(g);
        }
        
        // Meta
        g.lineStyle(4, 0xffffff);
        g.lineBetween(CENTER_X, 300, CENTER_X, 450);
        
        this.add.text(CENTER_X, 430, "START / FINISH", { fontSize: '10px', color: '#fbbf24' }).setOrigin(0.5);
    }

    createCars() {
        this.cars = [];
        // TÚ EN EL MEDIO (Carril 2)
        const racers = [
            { id: 'cpu1', sprite: 'car_cpu1', lane: 0, skill: 0.1, startT: 0.96 }, 
            { id: 'cpu2', sprite: 'car_cpu2', lane: 1, skill: 0.0, startT: 0.94 }, 
            { id: 'player', sprite: 'car_player', lane: 2, skill: -0.3, startT: 0.92 }, 
            { id: 'cpu3', sprite: 'car_cpu3', lane: 3, skill: 0.2, startT: 0.90 }, 
            { id: 'cpu4', sprite: 'car_cpu4', lane: 4, skill: -0.1, startT: 0.88 } 
        ];

        racers.forEach(racer => {
            const path = this.trackPaths[racer.lane];
            let car;

            if (this.textures.exists(racer.sprite)) {
                car = this.add.follower(path, 0, 0, racer.sprite);
                car.setScale(0.4);
            } else {
                car = this.add.follower(path, 0, 0);
                car.add(this.add.rectangle(0, 0, 30, 15, 0xff00ff));
            }
            
            car.setDepth(10);
            car.racerId = racer.id;
            car.lane = racer.lane;
            car.pathLength = path.getLength();
            const lapTime = BASE_LAP_TIME + racer.skill + (Math.random() * 0.4);
            car.speedPxPerSec = car.pathLength / lapTime;

            car.t = racer.startT; 
            car.lap = 0;
            car.state = 'running';
            car.pitTimer = 0;
            car.questionsAnswered = 0;

            const pos = path.getPoint(car.t);
            const tangent = path.getTangent(car.t);
            car.setPosition(pos.x, pos.y);
            car.setRotation(tangent.angle());

            this.cars.push(car);
        });
    }

    update(time, delta) {
        if (!this.cars || !this.isRacing) return; 
        const dt = delta / 1000; 
        
        // LEER DIFICULTAD
        const difficulty = this.registry.get('difficulty') || 'hard';

        this.cars.forEach(car => {
            if (car.state === 'finished') return;

            if (car.state === 'pitting') {
                if (car.racerId !== 'player') {
                    car.pitTimer -= delta; 
                    if (car.pitTimer <= 0) {
                        car.state = 'running';
                        car.questionsAnswered++;
                    }
                }
                return; 
            }

            const movePx = car.speedPxPerSec * dt;
            car.t += movePx / car.pathLength;

            if (car.t >= 1) {
                car.t -= 1; 
                car.lap++;

                if (car.lap > 1) {
                    if (car.lap > TOTAL_LAPS) {
                        car.state = 'finished';
                        car.finishTime = Date.now();
                        this.checkFinish();
                    } else {
                        car.state = 'pitting';
                        if (car.racerId !== 'player') {
                            // --- IA DE BOXES AJUSTADA ---
                            if (difficulty === 'easy') {
                                // MODO FÁCIL: 2.0s a 4.5s (Antes 6s) - Más picante
                                car.pitTimer = Phaser.Math.Between(2000, 4500); 
                            } else {
                                // MODO PRO: 1.0s a 3.0s - Muy agresivo
                                car.pitTimer = Phaser.Math.Between(1000, 3000); 
                            }
                        } else {
                            const onPitStop = this.registry.get('onPitStop');
                            if (onPitStop) onPitStop();
                        }
                    }
                }
            }

            const path = this.trackPaths[car.lane];
            const pos = path.getPoint(car.t);
            const tangent = path.getTangent(car.t);
            if (pos && tangent) {
                car.setPosition(pos.x, pos.y);
                car.setRotation(tangent.angle());
            }
        });

        this.updateRankings();
    }

    updateRankings() {
        const sorted = [...this.cars].sort((a, b) => {
            const scoreA = (a.lap * 10) + a.t;
            const scoreB = (b.lap * 10) + b.t;
            return scoreB - scoreA;
        });

        const myRank = sorted.findIndex(c => c.racerId === 'player') + 1;
        const playerCar = this.cars.find(c => c.racerId === 'player');
        
        this.game.events.emit('updateHUD', { 
            rank: myRank, 
            lap: Math.min(playerCar.lap, TOTAL_LAPS) 
        });
    }

    checkFinish() {
        const finished = this.cars.filter(c => c.state === 'finished');
        if (finished.length === this.cars.length) {
            finished.sort((a, b) => a.finishTime - b.finishTime);
            const rank = finished.findIndex(c => c.racerId === 'player') + 1;
            this.game.events.emit('raceFinished', rank);
        }
    }
}
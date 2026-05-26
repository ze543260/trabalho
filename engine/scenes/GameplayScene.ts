namespace Engine.Scenes {
	// 1. Classe de Dados Estrita (O C++ ama isso)
	export class CustomerRecord {
		public sprite: Sprite;
		public targetX: number;
		public paciencia: number;
		public pacienciaMax: number;
		public rewardMultiplier: number;
		public desiredBean: Engine.Entities.BeanType;
		public desiredMethod: Engine.Entities.BrewMethod;
		public slotIndex: number;

		constructor(s: Sprite) {
			this.sprite = s;
			this.targetX = 0;
			this.paciencia = 0;
			this.pacienciaMax = 0;
			this.rewardMultiplier = 0;
			this.desiredBean = Engine.Entities.BeanType.None;
			this.desiredMethod = Engine.Entities.BrewMethod.Espresso;
			this.slotIndex = -1;
		}
	}

	export class GameplayScene implements Scene {
		private barista: Engine.Entities.Barista;
		private stations: Engine.Entities.Station[];
		private spawnTimerMs: number;
		private spawnIntervalMs: number;
		private dayElapsedMs: number;
		private dayDurationMs: number;
		private queueBaseX: number;
		private queueSpacing: number;
		private queueY: number;
		private dayEnded: boolean;
		private occupiedSlots: CustomerRecord[];

		private activeCustomers: CustomerRecord[];
		private customerWardrobe: Image[]; // <-- NOVO
		
		// --- ADVANCED VFX ---
		private floatingTexts: {text: string, x: number, y: number, vy: number, life: number, maxLife: number}[];
		private dustParticles: {x: number, y: number, vx: number, vy: number, baseVy: number}[];
		private catImg1: Image;
		private catImg2: Image;

		constructor() {
			this.stations = [];
			this.spawnTimerMs = 0;
			this.spawnIntervalMs = 4000;
			this.dayElapsedMs = 0;
			this.dayDurationMs = 60000;
			this.queueBaseX = 0;
			this.queueSpacing = 12;
			this.queueY = 0;
			this.dayEnded = false;
			this.occupiedSlots = [];
			this.activeCustomers = [];
			this.customerWardrobe = [];
			
			this.floatingTexts = [];
			this.dustParticles = [];
			for(let i = 0; i < 15; i++) {
				this.dustParticles.push({
					x: randint(0, 160),
					y: randint(0, 120),
					vx: 0,
					vy: (randint(1, 10) / 20),
					baseVy: (randint(1, 10) / 20)
				});
			}
			
			// Simple sleeping cat sprite (2 frames for breathing)
			this.catImg1 = img`
				. . . . . . . . . .
				. . . . e e e . . .
				. . e e e e e e . .
				. e e e e e e e e .
				. . e f e e f e . .
				. . e e e e e e . .
				. . . e e e e . . .
			`;
			this.catImg1.replace(0xE, 12); // Brown
			this.catImg1.replace(0xF, 15); // Black closed eyes
			
			this.catImg2 = this.catImg1.clone();
			// Achatado (respirando fora)
			this.catImg2 = img`
				. . . . . . . . . .
				. . . . . . . . . .
				. . . e e e . . . .
				. e e e e e e e . .
				. e e f e e f e e .
				. e e e e e e e e .
				. . . e e e e . . .
			`;
			this.catImg2.replace(0xE, 12);
			this.catImg2.replace(0xF, 15);
		}

		public enter(): void {
			Engine.Entities.EntityManager.init(30);
			Engine.FX.FXManager.init(30);

			const counterY = (screen.height >> 1) + 8;

			// --- NOVO: PINTANDO O CENÁRIO ESTÁTICO ---
			let bg = image.create(screen.width, screen.height);
			bg.fill(11); // Parede verde-oliva aconchegante (com a nova paleta)

			// 1. A Janela (Apenas o fundo do Céu azul acinzentado, o Sol e a moldura serão desenhados dinamicamente no onPaint)
			bg.fillRect(56, 4, 48, 28, 8); // Fundo da janela (Céu azul acinzentado)
			// Caixilharia da janela e parapeito
			bg.drawRect(55, 3, 50, 30, 2); 
			bg.drawLine(80, 3, 80, 33, 2);
			bg.drawLine(55, 18, 105, 18, 2);
			bg.fillRect(53, 33, 54, 3, 3); // Parapeito de madeira

			// Quadro de Menu na Parede (Esquerda)
			bg.fillRect(8, 6, 36, 26, 15); // Preto/Cinza Escuro (cor 15)
			bg.drawRect(8, 6, 36, 26, 1);  // Moldura branca (cor 1)
			bg.drawLine(12, 10, 24, 10, 4); // "MENU" em amarelo (cor 4)
			bg.drawLine(12, 15, 36, 15, 1); // Itens do menu em branco
			bg.drawLine(12, 19, 32, 19, 1);
			bg.drawLine(12, 23, 34, 23, 1);

			// Quadro de Café Decorativo na Parede (Direita)
			bg.fillRect(124, 6, 24, 24, 11); // Fundo verde (cor 11)
			bg.drawRect(124, 6, 24, 24, 12);     // Moldura marrom (cor 12)
			// Desenha uma xícara simples no quadro
			bg.fillRect(132, 18, 8, 6, 1);    // Xícara branca
			bg.fillRect(140, 19, 2, 3, 1);    // Asa da xícara
			bg.drawLine(134, 15, 134, 16, 4); // Fumacinha amarela
			bg.drawLine(137, 14, 137, 16, 4);

			// Círculo base do relógio na parede (reposicionado)
			bg.fillCircle(114, 16, 7, 1);      // Círculo branco
			bg.drawCircle(114, 16, 7, 12);     // Moldura marrom

			// 2. Chão de Madeira e Sombra
			for (let x = 0; x < screen.width; x += 16) {
				for (let y = counterY - 8; y < screen.height; y += 16) {
					bg.drawTransparentImage(Assets.floorTile, x, y);
				}
			}
			// Sombra projetada do balcão no chão (dá profundidade 3D)
			bg.fillRect(0, counterY - 8, screen.width, 4, 1); 

			// Desenha os bancos/lugares do balcão (de acordo com maxCounterSlots)
			const maxSlotsBg = Engine.Core.TycoonState.maxCounterSlots;
			for (let i = 0; i < maxSlotsBg; i++) {
				let slotX = (screen.width - 24) - (i * 14);
				// Pernas do banco
				bg.drawLine(slotX - 2, counterY - 5, slotX - 2, counterY, 1);
				bg.drawLine(slotX + 2, counterY - 5, slotX + 2, counterY, 1);
				// Assento
				bg.fillCircle(slotX, counterY - 6, 3, 15);
				bg.fillCircle(slotX, counterY - 7, 3, 14);
			} 

			// 3. Tapete da área de serviço (Mais detalhado e escuro)
			bg.fillRect(16, counterY + 16, 128, 16, 9); // Tapete escuro (cor 9)
			bg.drawRect(16, counterY + 16, 128, 16, 3); // Borda (cor 3)
			bg.drawLine(20, counterY + 20, 140, counterY + 20, 3); // Padrão
			bg.drawLine(20, counterY + 28, 140, counterY + 28, 3); // Padrão

			// Plantas decorativas nos cantos inferiores (vasos de flor)
			// Esquerda:
			bg.fillRect(2, counterY + 4, 8, 12, 12);   // Vaso marrom
			bg.fillCircle(6, counterY - 2, 5, 7);      // Folhas verdes
			bg.fillCircle(3, counterY - 5, 4, 6);
			bg.fillCircle(9, counterY - 5, 4, 6);
			// Direita:
			bg.fillRect(screen.width - 10, counterY + 4, 8, 12, 12);
			bg.fillCircle(screen.width - 6, counterY - 2, 5, 7);
			bg.fillCircle(screen.width - 9, counterY - 5, 4, 6);
			bg.fillCircle(screen.width - 3, counterY - 5, 4, 6);

			// Balcão de trabalho inferior (onde ficam as máquinas e sacas)
			bg.fillRect(16, screen.height - 24, 128, 24, 12); // Mesa de madeira marrom (cor 12)
			bg.drawRect(16, screen.height - 24, 128, 24, 1);  // Borda branca (cor 1)

			// Define essa imagem pintada como o fundo imutável da cena
			scene.setBackgroundImage(bg);

			// --- NOVO: SISTEMA DE ILUMINAÇÃO (Sunbeams / Raios de Sol) ---
			// Desenhamos raios de luz na parede e no chão (cor 4 amarela suave e 6 dourada)
			bg.drawLine(80, 20, 0, screen.height, 4);
			bg.drawLine(85, 20, 20, screen.height, 6);
			bg.drawLine(90, 20, 40, screen.height, 4);
			bg.drawLine(75, 20, 0, screen.height - 20, 6);
			// -----------------------------------------

			// --- NOVO: SOUNDTRACK COZY LOFI ---
			// Toca uma melodia relaxante em loop no fundo (BPM 100)
			music.playMelody("E B C5 A B G A F ", 100);
			// -----------------------------------

			// --- NOVO: PRÉ-FABRICANDO ROUPAS ---
			this.customerWardrobe = [];
			
			// 1. Roupa Branca (Padrão)
			this.customerWardrobe.push(Assets.customerBase);
			
			// 2. Roupa Vermelha (Troca a cor 4 pela cor 2)
			let redCustomer = Assets.customerBase.clone();
			redCustomer.replace(4, 2);
			this.customerWardrobe.push(redCustomer);
			
			// 3. Roupa Azul (Troca a cor 4 pela cor 8)
			let blueCustomer = Assets.customerBase.clone();
			blueCustomer.replace(4, 8);
			this.customerWardrobe.push(blueCustomer);
			// -----------------------------------

			// Cria os sprites do balcão para ordenação correta de Z
			for (let x = 8; x < screen.width; x += 16) {
				const counterSprite = sprites.create(Assets.counterTile, SpriteKind.Food);
				counterSprite.x = x;
				counterSprite.y = counterY - 16;
				counterSprite.z = 5; // Por cima dos clientes (z=1) e por baixo do barista (z=10)
			}

			const baristaSprite = sprites.create(Assets.baristaBase, SpriteKind.Player);
			baristaSprite.x = 80;
			baristaSprite.y = counterY + 12; // Começa no meio do corredor
			baristaSprite.z = 10; // Barista à frente do balcão superior
			this.barista = new Engine.Entities.Barista(baristaSprite, 50, counterY);
			Engine.Entities.EntityManager.add(this.barista);

			this.stations = [];
			const espressoSprite = sprites.create(Assets.espresso, SpriteKind.Food);
			espressoSprite.x = 32;
			espressoSprite.y = screen.height - 16; // Mesa inferior
			espressoSprite.z = 15; // Z maior que o barista para dar a ilusão de profundidade e ficar na frente
			const espressoStation = new Engine.Entities.Station(espressoSprite, Engine.Entities.BrewMethod.Espresso);
			this.stations.push(espressoStation);
			Engine.Entities.EntityManager.add(espressoStation);

			const v60Sprite = sprites.create(Assets.v60, SpriteKind.Food);
			v60Sprite.x = 64;
			v60Sprite.y = screen.height - 16; // Mesa inferior
			v60Sprite.z = 15;
			const v60Station = new Engine.Entities.Station(v60Sprite, Engine.Entities.BrewMethod.V60);
			this.stations.push(v60Station);
			Engine.Entities.EntityManager.add(v60Station);

			// Cria as sacas de café interativas (CoffeeBag) no balcão de baixo
			const bagMantiqueiraSprite = sprites.create(Assets.beanBagMantiqueira, SpriteKind.Food);
			bagMantiqueiraSprite.x = 96;
			bagMantiqueiraSprite.y = screen.height - 16;
			bagMantiqueiraSprite.z = 15;
			const bagMantiqueira = new Engine.Entities.CoffeeBag(bagMantiqueiraSprite, Engine.Entities.CarryType.BeansMantiqueira);
			Engine.Entities.EntityManager.add(bagMantiqueira);

			const bagColombiaSprite = sprites.create(Assets.beanBagColombian, SpriteKind.Food);
			bagColombiaSprite.x = 128;
			bagColombiaSprite.y = screen.height - 16;
			bagColombiaSprite.z = 15;
			const bagColombia = new Engine.Entities.CoffeeBag(bagColombiaSprite, Engine.Entities.CarryType.BeansColombia);
			Engine.Entities.EntityManager.add(bagColombia);

			this.queueBaseX = screen.width - 24;
			this.queueSpacing = 16; // Aumentado um pouco o espaçamento para não ficarem colados
			this.queueY = counterY - 22; // Posiciona mais acima para andarem atrás do balcão
			
			this.occupiedSlots = [];
			const maxSlots = Engine.Core.TycoonState.maxCounterSlots;
			for (let i = 0; i < maxSlots; i++) {
				this.occupiedSlots.push(null);
			}

			this.spawnTimerMs = 0;
			this.dayElapsedMs = 0;
			this.dayEnded = false;
			this.activeCustomers = []; // Reseta a lista a cada dia

			// 3. Tick de Economia (Iterando na nossa lista segura)
			game.onUpdateInterval(1000, () => {
				if (this.dayEnded) return;
				
				// Loop reverso para podermos apagar clientes com segurança
				for (let i = this.activeCustomers.length - 1; i >= 0; i--) {
					let c = this.activeCustomers[i];
					if (c.paciencia > 0) {
						c.paciencia -= 1;
						if (c.paciencia <= 0) {
							if (c.slotIndex >= 0 && c.slotIndex < this.occupiedSlots.length) {
								this.occupiedSlots[c.slotIndex] = null;
							}
							c.sprite.destroy(); // Destrói visualmente
							this.activeCustomers.removeElement(c);
						}
					}
				}
			});

			// 4. Desenho de UI e Efeitos Visuais Cozy
			game.onPaint(() => {
				let time = game.runtime(); // O relógio interno do jogo (em milissegundos)

				// === ADVANCED VFX: Dynamic Sunset ===
				let dayRatio = this.dayElapsedMs / this.dayDurationMs;
				let sunY = 16 + (dayRatio * 12);
				let sunColor = dayRatio > 0.8 ? 2 : (dayRatio > 0.5 ? 4 : 6);
				// Céu
				screen.fillRect(56, 4, 48, 28, 8); // Azul
				// Por do sol subindo de baixo
				screen.fillRect(56, 32 - (dayRatio * 12), 48, (dayRatio * 12), 14); 
				// O Sol
				screen.fillCircle(80, sunY, 6, sunColor); 
				// Nuvens passando (Parallax fake)
				let cloudX = 56 + ((time / 50) % 48);
				screen.fillRect(cloudX, 10, 8, 3, 1);
				screen.fillRect(cloudX + 2, 8, 5, 3, 1);
				// Redesenha a janela por cima do sol
				screen.drawRect(55, 3, 50, 30, 2); 
				screen.drawLine(80, 3, 80, 33, 2);
				screen.drawLine(55, 18, 105, 18, 2);

				// === ADVANCED VFX: Wind Physics Dust ===
				let baristaVx = (this.barista && this.barista.active) ? this.barista.sprite.vx : 0;
				for (let i = 0; i < this.dustParticles.length; i++) {
					let p = this.dustParticles[i];
					// Barista wind influence
					if (Math.abs(baristaVx) > 0 && p.y > counterY - 10 && p.y < counterY + 30) {
						p.vx += (baristaVx * 0.005);
					}
					p.vx *= 0.95; // friction
					p.x = (p.x + p.vx + screen.width) % screen.width;
					p.y = p.y - p.vy;
					if (p.y < 0) p.y = counterY + 20;
					
					screen.setPixel(p.x, p.y + Math.sin(time / 500 + i) * 3, 6); // Poeira dourada (cor 6)
				}

				// === MASCOTE: O Gato Dorminhoco ===
				let catX = 135;
				let catY = counterY - 15;
				let isBreathingIn = (time % 3000) < 1500;
				let currentCat = isBreathingIn ? this.catImg1 : this.catImg2;
				screen.drawTransparentImage(currentCat, catX, catY);
				// Zzz effect
				if (isBreathingIn && (time % 3000) > 1000) {
					screen.print("z", catX + 8, catY - 4 - ((time % 500) / 100), 1);
				}

				// PROFUNDIDADE: Sombra do Barista
				if (this.barista && this.barista.active) {
					let bx = this.barista.sprite.x;
					let by = this.barista.sprite.y + 10;
					screen.fillRect(bx - 5, by, 10, 4, 15); // Centro da sombra
					screen.fillRect(bx - 7, by + 1, 14, 2, 15); // Bordas da sombra
				}

				// Clientes, efeito de respiração, sombras, barras de paciência e balões de pedido
				for (let i = 0; i < this.activeCustomers.length; i++) {
					let c = this.activeCustomers[i];
					let p = c.paciencia;
					let maxP = c.pacienciaMax;

					// PROFUNDIDADE: Sombra do Cliente no chão
					let cx = c.sprite.x;
					let cy = this.queueY + 10;
					screen.fillRect(cx - 4, cy, 8, 4, 15);
					screen.fillRect(cx - 6, cy + 1, 12, 2, 15);

					// Se o cliente está parado esperando, faz o efeito de respiração ("Bobbing")
					if (c.sprite.vx === 0) {
						c.sprite.y = this.queueY + Math.floor(Math.sin(time / 200 + i) * 2);
					}

					// Barras de paciência arredondadas e fofas
					if (p > 0 && maxP > 0) {
						let ratio = p / maxP;
						if (ratio < 0) ratio = 0;
						let barW = Math.floor(10 * ratio);
						// Cor da paciência (Verde, muda para laranja, muda para vermelho)
						let barColor = ratio > 0.5 ? 13 : (ratio > 0.25 ? 14 : 2);
						
						screen.drawLine(c.sprite.x - 5, c.sprite.y - 12, c.sprite.x + 5, c.sprite.y - 12, 1); // Fundo
						screen.drawLine(c.sprite.x - 5, c.sprite.y - 12, c.sprite.x - 5 + barW, c.sprite.y - 12, barColor); // Barra
						
						// BALÃO DE PEDIDO COM ELASTICIDADE (Pop e Hover)
						if (c.sprite.vx === 0) {
							let bx = c.sprite.x + 4;
							let floatOffset = Math.sin(time / 150 + i) * 2; // Movimento suave contínuo
							let by = c.sprite.y - 28 + floatOffset;
							
							// Fundo e borda do balão
							screen.fillRect(bx, by, 18, 18, 1); // Branco
							screen.drawRect(bx, by, 18, 18, 15); // Borda escura
							// Rabinho do balão apontando para o cliente
							screen.drawLine(bx + 2, by + 18, bx + 2, by + 20, 1);
							screen.drawLine(bx + 1, by + 18, bx + 1, by + 20, 15);
							
							// Seleciona a imagem baseada no pedido
							let reqImg = Assets.espresso;
							if (c.desiredMethod === Engine.Entities.BrewMethod.V60) reqImg = Assets.v60;
							else if (c.desiredMethod === Engine.Entities.BrewMethod.Capsule) reqImg = Assets.v60; // Temporário até ter cápsula
							
							screen.drawTransparentImage(reqImg, bx + 1, by + 1);
						}
					}
				}

				// Barra de progresso, luzes de estado e vapor detalhado nas máquinas de café
				for (let i = 0; i < this.stations.length; i++) {
					let station = this.stations[i];
					let state = station.getState();
					let sprite = station.sprite;

					// Vapor mais gordinho e com fade-out gradual
					if (state === Engine.Entities.BrewState.Processing || state === Engine.Entities.BrewState.Ready) {
						for (let p = 0; p < 4; p++) {
							let offset = (time + p * 250) % 1000;
							let py = sprite.y - 8 - Math.floor(offset / 40); // Sobe suavemente
							let px = sprite.x + Math.floor(Math.sin((time + p * 400) / 150) * 4); // Ziguezague maior
							
							let vaporColor = py > sprite.y - 16 ? 7 : 5; 
							if (py > sprite.y - 28) {
								screen.setPixel(px, py, vaporColor);
								screen.setPixel(px + 1, py, vaporColor); // Vapor mais gordinho
							}
						}
					}

					// Barra de progresso para a máquina
					if (state === Engine.Entities.BrewState.Processing) {
						let elapsed = station.getProcessElapsed();
						let duration = station.getProcessDuration();
						let ratio = duration > 0 ? (elapsed / duration) : 0;
						if (ratio > 1) ratio = 1;
						if (ratio < 0) ratio = 0;
						let barW = Math.floor(12 * ratio);
						screen.fillRect(sprite.x - 6, sprite.y - 12, 12, 2, 1); // Fundo branco
						screen.fillRect(sprite.x - 6, sprite.y - 12, barW, 2, 5); // Progresso verde (cor 5)
					} else if (state === Engine.Entities.BrewState.Ready) {
						// Luz indicadora piscando amarelo
						let blink = (game.runtime() / 200) % 2 === 0;
						if (blink) {
							screen.fillCircle(sprite.x, sprite.y - 10, 2, 4); // 4 = amarelo
						}
					} else if (state === Engine.Entities.BrewState.Ruined) {
						// Luz indicadora piscando vermelho
						let blink = (game.runtime() / 150) % 2 === 0;
						if (blink) {
							screen.fillCircle(sprite.x, sprite.y - 10, 2, 2); // 2 = vermelho
						}
					}
				}

				// Ponteiros do Relógio Ticking na parede (movido para x=114, y=16)
				let sec = (time / 1000) % 60;
				let angle = (sec / 60) * 2 * Math.PI - Math.PI / 2;
				let handX = 114 + Math.floor(Math.cos(angle) * 4);
				let handY = 16 + Math.floor(Math.sin(angle) * 4);
				screen.drawLine(114, 16, handX, handY, 2); // Ponteiro de segundos vermelho (cor 2)
				screen.drawLine(114, 16, 114, 13, 15);     // Ponteiro de horas fixo/preto (cor 15)

				// Item carregado pelo Barista (Balão flutuando acima da cabeça)
				if (this.barista && this.barista.active) {
					const carry = this.barista.getCarryType();
					if (carry !== Engine.Entities.CarryType.None) {
						let img: Image = null;
						if (carry === Engine.Entities.CarryType.BeansMantiqueira) img = Assets.beanBagMantiqueira;
						else if (carry === Engine.Entities.CarryType.BeansColombia) img = Assets.beanBagColombian;
						else if (carry === Engine.Entities.CarryType.Espresso) img = Assets.espresso;
						else if (carry === Engine.Entities.CarryType.V60) img = Assets.v60;

						if (img) {
							// Desenha o item flutuando acima da cabeça (y - 18)
							screen.drawTransparentImage(img, this.barista.sprite.x - (img.width >> 1), this.barista.sprite.y - 18);
						}
					}
				}

				// === ADVANCED VFX: Floating Combat Text ===
				for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
					let ft = this.floatingTexts[i];
					ft.life -= 30; // Approx dt decay
					ft.y += (ft.vy * 0.03);
					ft.vy *= 0.9; // friction
					if (ft.life <= 0) {
						this.floatingTexts.splice(i, 1);
					} else {
						// Pisca antes de sumir
						if (ft.life > 300 || (time % 100 > 50)) {
							screen.print(ft.text, ft.x, ft.y, 7); // Verde claro (cor 7)
						}
					}
				}

				// HUD: Money Box (Top-Left)
				screen.fillRect(2, 2, 40, 9, 1);    // Moldura/fundo branco
				screen.fillRect(3, 3, 38, 7, 15);   // Fundo preto
				screen.print("$" + Engine.Core.TycoonState.money, 5, 4, 6); // Texto em cor creme (cor 6)
			});
		}

		public update(dt: number): void {
			// Entrega de café aos clientes
			if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
				let carry = this.barista.getCarryType();
				if (carry === Engine.Entities.CarryType.Espresso || carry === Engine.Entities.CarryType.V60 || carry === Engine.Entities.CarryType.Capsule) {
					let baristaSprite = this.barista.sprite;
					let closestCustomer: CustomerRecord = null;
					let minDistance = 24;

					for (let i = 0; i < this.activeCustomers.length; i++) {
						let c = this.activeCustomers[i];
						if (c.sprite.vx === 0) {
							let dist = Math.abs(baristaSprite.x - c.sprite.x);
							if (dist < minDistance && baristaSprite.y < this.queueY + 36) {
								minDistance = dist;
								closestCustomer = c;
							}
						}
					}

					if (closestCustomer) {
						let methodMatch = false;
						if (closestCustomer.desiredMethod === Engine.Entities.BrewMethod.Espresso && carry === Engine.Entities.CarryType.Espresso) methodMatch = true;
						else if (closestCustomer.desiredMethod === Engine.Entities.BrewMethod.V60 && carry === Engine.Entities.CarryType.V60) methodMatch = true;
						else if (closestCustomer.desiredMethod === Engine.Entities.BrewMethod.Capsule && carry === Engine.Entities.CarryType.Capsule) methodMatch = true;

						if (methodMatch) {
							let gain = 10 * closestCustomer.rewardMultiplier;
							Engine.Core.TycoonState.money += gain;
							
							// Spawn Floating Combat Text (Juice)
							this.floatingTexts.push({
								text: "+$" + gain,
								x: closestCustomer.sprite.x - 4,
								y: closestCustomer.sprite.y - 15,
								vy: -40,
								life: 1000,
								maxLife: 1000
							});
							
							// Som clássico de "ba-ding"
							music.playTone(523, 80);
							music.playTone(659, 120);
							
							// Liberta o slot
							if (closestCustomer.slotIndex >= 0 && closestCustomer.slotIndex < this.occupiedSlots.length) {
								this.occupiedSlots[closestCustomer.slotIndex] = null;
							}
							
							closestCustomer.sprite.destroy();
							this.activeCustomers.removeElement(closestCustomer);
							
							this.barista.setCarryType(Engine.Entities.CarryType.None);
						}
					}
				}
			}

			Engine.Entities.EntityManager.update(dt);
			Engine.FX.FXManager.update(dt);

			// 5. Atualização de Posição e Bobbing
			for (let i = 0; i < this.activeCustomers.length; i++) {
				let c = this.activeCustomers[i];
				if (c.sprite.vx < 0 && c.sprite.x <= c.targetX) {
					c.sprite.x = c.targetX;
					c.sprite.vx = 0;
				}

				// Bobbing suave ao caminhar
				if (c.sprite.vx !== 0) {
					c.sprite.y = this.queueY + Math.floor(Math.sin(game.runtime() / 80) * 2);
				} else {
					c.sprite.y = this.queueY;
				}
			}

			this.updateSpawn(dt);
			this.updateDayClock(dt);
		}

		public exit(): void {
			Engine.UI.UIManager.clear();
		}

		public pause(): void {
		}

		public resume(): void {
		}

		private updateSpawn(dt: number): void {
			if (this.dayEnded) return;

			this.spawnTimerMs += dt;
			if (this.spawnTimerMs < this.spawnIntervalMs) return;

			this.spawnTimerMs -= this.spawnIntervalMs;
			this.spawnCustomer();
		}

		private spawnCustomer(): void {
			// Acha o primeiro slot vago
			let freeSlotIndex = -1;
			for (let i = 0; i < this.occupiedSlots.length; i++) {
				if (this.occupiedSlots[i] === null) {
					freeSlotIndex = i;
					break;
				}
			}

			// Se todos os slots estiverem preenchidos, não spawna mais clientes
			if (freeSlotIndex === -1) {
				return;
			}

			const spawnX = screen.width + 16;
			const targetX = this.queueBaseX - (freeSlotIndex * this.queueSpacing);
			const targetY = this.queueY;

			let randomLook = this.customerWardrobe[randint(0, this.customerWardrobe.length - 1)];
			const sprite = sprites.create(randomLook, SpriteKind.Enemy);
			sprite.x = spawnX;
			sprite.y = targetY;
			sprite.vx = -30;
			sprite.z = 1; // Fica atrás do balcão (z=5)

			let cData = new CustomerRecord(sprite);
			cData.targetX = targetX;
			cData.slotIndex = freeSlotIndex;

			if (randint(0, 4) === 0) {
				cData.paciencia = 60; // Aumentado de 40 para 60 segundos
				cData.pacienciaMax = 60;
				cData.rewardMultiplier = 3;
				cData.desiredBean = Engine.Entities.BeanType.Mantiqueira;
				cData.desiredMethod = Engine.Entities.BrewMethod.V60;
			} else {
				cData.paciencia = 30; // Aumentado de 10 para 30 segundos
				cData.pacienciaMax = 30;
				cData.rewardMultiplier = 1;
				cData.desiredMethod = randint(0, 1) === 0 ? Engine.Entities.BrewMethod.Espresso : Engine.Entities.BrewMethod.Capsule;
				cData.desiredBean = randint(0, 1) === 0 ? Engine.Entities.BeanType.Mantiqueira : Engine.Entities.BeanType.Colombia;
			}

			this.occupiedSlots[freeSlotIndex] = cData;
			this.activeCustomers.push(cData);
		}

		private updateDayClock(dt: number): void {
			if (this.dayEnded) return;

			this.dayElapsedMs += dt;
			if (this.dayElapsedMs < this.dayDurationMs) return;

			this.dayElapsedMs = this.dayDurationMs;
			this.dayEnded = true;
			Engine.Scenes.SceneStack.push(new Engine.Scenes.ShopScene());
		}
	}
}

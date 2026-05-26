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

		constructor(s: Sprite) {
			this.sprite = s;
			this.targetX = 0;
			this.paciencia = 0;
			this.pacienciaMax = 0;
			this.rewardMultiplier = 0;
			this.desiredBean = Engine.Entities.BeanType.None;
			this.desiredMethod = Engine.Entities.BrewMethod.Espresso;
		}
	}

	export class GameplayScene implements Scene {
		private barista: Engine.Entities.Barista;
		private stations: Engine.Entities.Station[];
		private spawnTimerMs: number;
		private spawnIntervalMs: number;
		private dayElapsedMs: number;
		private dayDurationMs: number;
		private spawnSlotIndex: number;
		private spawnSlotCount: number;
		private queueBaseX: number;
		private queueSpacing: number;
		private queueY: number;
		private dayEnded: boolean;

		// A nossa lista segura de clientes ativos
		private activeCustomers: CustomerRecord[];
		private customerWardrobe: Image[]; // <-- NOVO

		constructor() {
			this.stations = [];
			this.spawnTimerMs = 0;
			this.spawnIntervalMs = 4000;
			this.dayElapsedMs = 0;
			this.dayDurationMs = 60000;
			this.spawnSlotIndex = 0;
			this.spawnSlotCount = 3;
			this.queueBaseX = 0;
			this.queueSpacing = 12;
			this.queueY = 0;
			this.dayEnded = false;
			this.activeCustomers = [];
			this.customerWardrobe = []; // <-- NOVO
		}

		public enter(): void {
			Engine.Entities.EntityManager.init(30);
			Engine.FX.FXManager.init(30);

			const counterY = (screen.height >> 1) + 8;

			// --- NOVO: PINTANDO O CENÁRIO ESTÁTICO ---
			let bg = image.create(screen.width, screen.height);
			bg.fill(13); // Fundo rosa/bege claro da parede (cor 13)

			// Carimba o chão da metade da tela para baixo
			for (let x = 0; x < screen.width; x += 16) {
				for (let y = counterY - 8; y < screen.height; y += 16) {
					bg.drawTransparentImage(Assets.floorTile, x, y);
				}
			}

			// Quadro de Menu na Parede (Esquerda)
			bg.fillRect(8, 6, 36, 26, 15); // Preto/Cinza Escuro (cor 15)
			bg.rect(8, 6, 36, 26, 1);      // Moldura branca (cor 1)
			bg.drawLine(12, 10, 24, 10, 4); // "MENU" em amarelo (cor 4)
			bg.drawLine(12, 15, 36, 15, 1); // Itens do menu em branco
			bg.drawLine(12, 19, 32, 19, 1);
			bg.drawLine(12, 23, 34, 23, 1);

			// Quadro de Café Decorativo na Parede (Direita)
			bg.fillRect(124, 6, 24, 24, 11); // Fundo verde (cor 11)
			bg.rect(124, 6, 24, 24, 12);     // Moldura marrom (cor 12)
			// Desenha uma xícara simples no quadro
			bg.fillRect(132, 18, 8, 6, 1);    // Xícara branca
			bg.fillRect(140, 19, 2, 3, 1);    // Asa da xícara
			bg.drawLine(134, 15, 134, 16, 4); // Fumacinha amarela
			bg.drawLine(137, 14, 137, 16, 4);

			// Círculo base do relógio na parede
			bg.fillCircle(80, 16, 7, 1);      // Círculo branco
			bg.drawCircle(80, 16, 7, 12);     // Moldura marrom

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

			// Tapete vermelho na área de serviço do barista
			bg.fillRect(16, counterY + 20, 128, 12, 2); // Tapete vermelho (cor 2)
			bg.rect(16, counterY + 20, 128, 12, 4);     // Detalhe laranja (cor 4)

			// Define essa imagem pintada como o fundo imutável da cena
			scene.setBackgroundImage(bg);
			// -----------------------------------------

			// --- NOVO: PRÉ-FABRICANDO ROUPAS ---
			this.customerWardrobe = [];
			
			// 1. Roupa Branca (Padrão)
			this.customerWardrobe.push(Assets.customerBase);
			
			// 2. Roupa Vermelha (Troca a cor 1 pela cor 2)
			let redCustomer = Assets.customerBase.clone();
			redCustomer.replace(1, 2);
			this.customerWardrobe.push(redCustomer);
			
			// 3. Roupa Azul (Troca a cor 1 pela cor 8)
			let blueCustomer = Assets.customerBase.clone();
			blueCustomer.replace(1, 8);
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
			baristaSprite.x = 24;
			baristaSprite.y = screen.height - 16;
			baristaSprite.z = 10; // Barista à frente do balcão
			this.barista = new Engine.Entities.Barista(baristaSprite, 50, counterY);
			Engine.Entities.EntityManager.add(this.barista);

			this.stations = [];
			const espressoSprite = sprites.create(Assets.espresso, SpriteKind.Food);
			espressoSprite.x = 64;
			espressoSprite.y = counterY - 12;
			espressoSprite.z = 8; // Máquina sobre o balcão
			const espressoStation = new Engine.Entities.Station(espressoSprite, Engine.Entities.BrewMethod.Espresso);
			this.stations.push(espressoStation);
			Engine.Entities.EntityManager.add(espressoStation);

			const v60Sprite = sprites.create(Assets.v60, SpriteKind.Food);
			v60Sprite.x = 88;
			v60Sprite.y = counterY - 12;
			v60Sprite.z = 8; // Filtro sobre o balcão
			const v60Station = new Engine.Entities.Station(v60Sprite, Engine.Entities.BrewMethod.V60);
			this.stations.push(v60Station);
			Engine.Entities.EntityManager.add(v60Station);

			// Cria as sacas de café interativas (CoffeeBag) no balcão
			const bagMantiqueiraSprite = sprites.create(Assets.beanBagMantiqueira, SpriteKind.Food);
			bagMantiqueiraSprite.x = 112;
			bagMantiqueiraSprite.y = counterY - 12;
			bagMantiqueiraSprite.z = 8;
			const bagMantiqueira = new Engine.Entities.CoffeeBag(bagMantiqueiraSprite, Engine.Entities.CarryType.BeansMantiqueira);
			Engine.Entities.EntityManager.add(bagMantiqueira);

			const bagColombiaSprite = sprites.create(Assets.beanBagColombian, SpriteKind.Food);
			bagColombiaSprite.x = 136;
			bagColombiaSprite.y = counterY - 12;
			bagColombiaSprite.z = 8;
			const bagColombia = new Engine.Entities.CoffeeBag(bagColombiaSprite, Engine.Entities.CarryType.BeansColombia);
			Engine.Entities.EntityManager.add(bagColombia);

			this.queueBaseX = screen.width - 24;
			this.queueSpacing = 14;
			this.queueY = counterY - 22; // Posiciona mais acima para andarem atrás do balcão
			this.spawnSlotIndex = 0;
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
							c.sprite.destroy(); // Destrói visualmente
							this.activeCustomers.removeElement(c);
						}
					}
				}
			});

			// 4. Desenho de UI seguro
			game.onPaint(() => {
				// Clientes e barras de paciência
				for (let i = 0; i < this.activeCustomers.length; i++) {
					let c = this.activeCustomers[i];
					let p = c.paciencia;
					let maxP = c.pacienciaMax;
					if (p > 0 && maxP > 0) {
						let ratio = p / maxP;
						if (ratio < 0) ratio = 0;
						let barW = Math.floor(10 * ratio);
						screen.fillRect(c.sprite.x - 5, c.sprite.y - 12, 10, 2, 1);
						screen.fillRect(c.sprite.x - 5, c.sprite.y - 12, barW, 2, 7);
					}
				}

				// Barra de progresso, luzes de estado e vapor nas máquinas de café
				for (let i = 0; i < this.stations.length; i++) {
					let station = this.stations[i];
					let state = station.getState();
					let sprite = station.sprite;

					// Partículas de fumaça/vapor subindo
					if (state === Engine.Entities.BrewState.Processing || state === Engine.Entities.BrewState.Ready) {
						let time = game.runtime();
						for (let p = 0; p < 3; p++) {
							let offset = (time + p * 300) % 900;
							let py = sprite.y - 8 - Math.floor(offset / 60);
							let px = sprite.x + Math.floor(Math.sin((time + p * 500) / 100) * 3);
							if (py > sprite.y - 24) {
								screen.setPixel(px, py, 1); // 1 = branco (cor do vapor)
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

				// Ponteiros do Relógio Ticking na parede
				let sec = (game.runtime() / 1000) % 60;
				let angle = (sec / 60) * 2 * Math.PI - Math.PI / 2;
				let handX = 80 + Math.floor(Math.cos(angle) * 4);
				let handY = 16 + Math.floor(Math.sin(angle) * 4);
				screen.drawLine(80, 16, handX, handY, 2); // Ponteiro de segundos vermelho (cor 2)
				screen.drawLine(80, 16, 80, 13, 15);     // Ponteiro de horas fixo/preto (cor 15)

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
			});
		}

		public update(dt: number): void {
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
			const spawnX = screen.width + 16;
			const targetX = this.queueBaseX - (this.spawnSlotIndex * this.queueSpacing);
			const targetY = this.queueY;
			this.spawnSlotIndex += 1;
			if (this.spawnSlotIndex >= this.spawnSlotCount) {
				this.spawnSlotIndex = 0;
			}

			let randomLook = this.customerWardrobe[randint(0, this.customerWardrobe.length - 1)];
			const sprite = sprites.create(randomLook, SpriteKind.Enemy);
			sprite.x = spawnX;
			sprite.y = targetY;
			sprite.vx = -30;
			sprite.z = 1; // Fica atrás do balcão (z=5)

			// 6. Criamos e adicionamos à nossa lista em vez do sprite.data
			let cData = new CustomerRecord(sprite);
			cData.targetX = targetX;

			if (randint(0, 4) === 0) {
				cData.paciencia = 40;
				cData.pacienciaMax = 40;
				cData.rewardMultiplier = 3;
				cData.desiredBean = Engine.Entities.BeanType.Mantiqueira;
				cData.desiredMethod = Engine.Entities.BrewMethod.V60;
			} else {
				cData.paciencia = 10;
				cData.pacienciaMax = 10;
				cData.rewardMultiplier = 1;
				cData.desiredMethod = randint(0, 1) === 0 ? Engine.Entities.BrewMethod.Espresso : Engine.Entities.BrewMethod.Capsule;
				cData.desiredBean = randint(0, 1) === 0 ? Engine.Entities.BeanType.Mantiqueira : Engine.Entities.BeanType.Colombia;
			}

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

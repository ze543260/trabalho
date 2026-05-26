namespace Engine.Scenes {
	// Estrutura estrita para o compilador C++ não travar
	export class CustomerData {
		public targetX: number = 0;
		public paciencia: number = 0;
		public pacienciaMax: number = 0;
		public rewardMultiplier: number = 0;
		public desiredBean: Engine.Entities.BeanType = Engine.Entities.BeanType.None;
		public desiredMethod: Engine.Entities.BrewMethod = Engine.Entities.BrewMethod.Espresso;
	}

	/**
	 * Main gameplay scene that orchestrates entities and day flow.
	 */
	export class GameplayScene implements Scene {
		private barista: Engine.Entities.Barista;
		private stations: Engine.Entities.Station[] = [];
		private spawnTimerMs: number = 0;
		private spawnIntervalMs: number = 4000;
		private dayElapsedMs: number = 0;
		private dayDurationMs: number = 60000;
		private spawnSlotIndex: number = 0;
		private spawnSlotCount: number = 3;
		private queueBaseX: number = 0;
		private queueSpacing: number = 12;
		private queueY: number = 0;
		private dayEnded: boolean = false;

		/** Initialize entities and systems for the day. */
		public enter(): void {
			Engine.Entities.EntityManager.init(30);
			Engine.FX.FXManager.init(30);

			const counterY = (screen.height >> 1) + 8;
			const baristaSprite = sprites.create(Assets.baristaBase, SpriteKind.Player);
			baristaSprite.x = 24;
			baristaSprite.y = screen.height - 16;
			this.barista = new Engine.Entities.Barista(baristaSprite, 50, counterY);
			Engine.Entities.EntityManager.add(this.barista);

			this.stations = [];
			const espressoSprite = sprites.create(Assets.espresso, SpriteKind.Food);
			espressoSprite.x = 64;
			espressoSprite.y = counterY - 12;
			const espressoStation = new Engine.Entities.Station(espressoSprite, Engine.Entities.BrewMethod.Espresso);
			this.stations.push(espressoStation);
			Engine.Entities.EntityManager.add(espressoStation);

			const v60Sprite = sprites.create(Assets.v60, SpriteKind.Food);
			v60Sprite.x = 88;
			v60Sprite.y = counterY - 12;
			const v60Station = new Engine.Entities.Station(v60Sprite, Engine.Entities.BrewMethod.V60);
			this.stations.push(v60Station);
			Engine.Entities.EntityManager.add(v60Station);

			this.queueBaseX = screen.width - 24;
			this.queueSpacing = 14;
			this.queueY = counterY - 8;
			this.spawnSlotIndex = 0;
			this.spawnTimerMs = 0;
			this.dayElapsedMs = 0;
			this.dayEnded = false;

			// Phase 2: GameTick for Economy
			game.onUpdateInterval(1000, () => {
				if (this.dayEnded) return;
                
				let enemies = sprites.allOfKind(SpriteKind.Enemy);
				for (let i = 0; i < enemies.length; i++) {
					let s = enemies[i];
					let cData = s.data as CustomerData; // Avisa o C++ o que é isso
					if (cData && cData.paciencia > 0) {
						cData.paciencia -= 1;
						if (cData.paciencia <= 0) {
							s.destroy(); // Vai embora com raiva
						}
					}
				}
			});

			// Phase 3: Optimize Progress Bars
			game.onPaint(() => {
				let enemies = sprites.allOfKind(SpriteKind.Enemy);
				for (let i = 0; i < enemies.length; i++) {
					let s = enemies[i];
					let cData = s.data as CustomerData;
					if (cData) {
						let p = cData.paciencia;
						let maxP = cData.pacienciaMax;
						if (p > 0 && maxP > 0) {
							let ratio = p / maxP;
							if (ratio < 0) ratio = 0;
							let barW = Math.floor(10 * ratio);
							screen.fillRect(s.x - 5, s.y - 12, 10, 2, 1); // Fundo
							screen.fillRect(s.x - 5, s.y - 12, barW, 2, 7); // Barra
						}
					}
				}
			});

			// Phase 1: Colisoes nativas (exemplo: bate na "parede" invisivel do balcao/fila)
			// (se tivessemos tilemap usariamos scene.onHitWall aqui, por hora assumimos que param)
		}

		/** Update systems, entities, and day clock. */
		public update(dt: number): void {
			Engine.Entities.EntityManager.update(dt);
			Engine.FX.FXManager.update(dt);

			// Para clientes no alvo (Loop C++ Friendly)
			let enemies = sprites.allOfKind(SpriteKind.Enemy);
			for (let i = 0; i < enemies.length; i++) {
				let s = enemies[i];
				let cData = s.data as CustomerData;
				if (cData) {
					let tx = cData.targetX;
					if (s.vx < 0 && s.x <= tx) {
						s.x = tx;
						s.vx = 0;
					}
				}
			}

			this.updateSpawn(dt);
			this.updateDayClock(dt);
		}

		/** Cleanup when leaving the scene. */
		public exit(): void {
			Engine.UI.UIManager.clear();
		}

		private updateSpawn(dt: number): void {
			if (this.dayEnded) {
				return;
			}

			this.spawnTimerMs += dt;
			if (this.spawnTimerMs < this.spawnIntervalMs) {
				return;
			}

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

			const sprite = sprites.create(Assets.customerBase, SpriteKind.Enemy);
			sprite.x = spawnX;
			sprite.y = targetY;

			// Phase 1: Velocidade nativa
			sprite.vx = -30;
            
			// Cria o pacote de dados ESTRITO
			let cData = new CustomerData();
			cData.targetX = targetX;

			// Configurando cliente
			if (randint(0, 4) === 0) {
				// CoffeeSnob
				cData.paciencia = 40;
				cData.pacienciaMax = 40;
				cData.rewardMultiplier = 3;
				cData.desiredBean = Engine.Entities.BeanType.Mantiqueira;
				cData.desiredMethod = Engine.Entities.BrewMethod.V60;
			} else {
				// RushedStudent
				cData.paciencia = 10;
				cData.pacienciaMax = 10;
				cData.rewardMultiplier = 1;
				cData.desiredMethod = randint(0, 1) === 0 ? Engine.Entities.BrewMethod.Espresso : Engine.Entities.BrewMethod.Capsule;
				cData.desiredBean = randint(0, 1) === 0 ? Engine.Entities.BeanType.Mantiqueira : Engine.Entities.BeanType.Colombia;
			}
            
			// Acopla ao nativo com segurança
			sprite.data = cData;
		}

		private updateDayClock(dt: number): void {
			if (this.dayEnded) {
				return;
			}

			this.dayElapsedMs += dt;
			if (this.dayElapsedMs < this.dayDurationMs) {
				return;
			}

			this.dayElapsedMs = this.dayDurationMs;
			this.dayEnded = true;
			Engine.Scenes.SceneStack.push(new Engine.Scenes.ShopScene());
		}
	}
}

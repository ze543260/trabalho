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
		}

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
			});
		}

		public update(dt: number): void {
			Engine.Entities.EntityManager.update(dt);
			Engine.FX.FXManager.update(dt);

			// 5. Atualização de Posição
			for (let i = 0; i < this.activeCustomers.length; i++) {
				let c = this.activeCustomers[i];
				if (c.sprite.vx < 0 && c.sprite.x <= c.targetX) {
					c.sprite.x = c.targetX;
					c.sprite.vx = 0;
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

			const sprite = sprites.create(Assets.customerBase, SpriteKind.Enemy);
			sprite.x = spawnX;
			sprite.y = targetY;
			sprite.vx = -30;

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

namespace Engine.Scenes {
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
		}

		/** Update systems, entities, and day clock. */
		public update(dt: number): void {
			Engine.Entities.EntityManager.update(dt);
			Engine.FX.FXManager.update(dt);

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

			let customer: Engine.Entities.Customer;
			if (randint(0, 4) === 0) {
				customer = new Engine.Entities.CoffeeSnob(sprite, targetX, targetY);
			} else {
				customer = new Engine.Entities.RushedStudent(sprite, targetX, targetY);
			}

			Engine.Entities.EntityManager.add(customer);
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

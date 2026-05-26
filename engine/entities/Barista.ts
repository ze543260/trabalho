namespace Engine.Entities {
	/** Possible items held by the barista. */
	export enum CarryType {
		None = 0,
		BeansMantiqueira = 1,
		BeansColombia = 2,
		Espresso = 3,
		V60 = 4,
		Capsule = 5
	}

	/**
	 * Player-controlled barista entity.
	 */
	export class Barista extends Entity {
		private carryState: CarryType;
		private moveSpeed: number;
		private counterY: number;
		private blocksAboveCounter: boolean;

		constructor(sprite: Sprite, moveSpeed: number, counterY: number) {
			super(sprite);
			this.moveSpeed = moveSpeed;
			this.counterY = counterY;
			this.blocksAboveCounter = true;
			this.carryState = CarryType.None;
		}

		/** Set the Y line of the counter limit. */
		public setCounterY(counterY: number): void {
			this.counterY = counterY;
		}

		/** Toggle whether movement above the counter is blocked. */
		public setBlocksAboveCounter(blocksAbove: boolean): void {
			this.blocksAboveCounter = blocksAbove;
		}

		/** Get current carry state. */
		public getCarryType(): CarryType {
			return this.carryState;
		}

		/** Update carry state. */
		public setCarryType(carryType: CarryType): void {
			this.carryState = carryType;
		}

		/**
		 * Reads input, updates velocity, and applies counter collision limit.
		 */
		public update(dt: number): void {
			if (!this.active) {
				this.sprite.vx = 0;
				this.sprite.vy = 0;
				return;
			}

			let vx = 0;
			let vy = 0;

			if (Engine.Core.isDown(Engine.Core.Action.Left)) {
				vx -= this.moveSpeed;
			}
			if (Engine.Core.isDown(Engine.Core.Action.Right)) {
				vx += this.moveSpeed;
			}
			if (Engine.Core.isDown(Engine.Core.Action.Up)) {
				vy -= this.moveSpeed;
			}
			if (Engine.Core.isDown(Engine.Core.Action.Down)) {
				vy += this.moveSpeed;
			}

			const dtSeconds = dt > 0 ? (dt / 1000) : 0;
			if (this.blocksAboveCounter && dtSeconds > 0) {
				const nextY = this.sprite.y + vy * dtSeconds;
				if (nextY < this.counterY) {
					this.sprite.y = this.counterY;
					if (vy < 0) {
						vy = 0;
					}
				}
			}

			this.sprite.vx = vx;
			this.sprite.vy = vy;

			if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
				// TODO: Call station interaction once collision checks exist.
			}

			if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
				// TODO: Call discard logic once inventory system exists.
			}
		}
	}
}

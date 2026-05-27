namespace Engine.Entities {
	/** Possible items held by the barista. */
	export enum CarryType {
		None = 0,
		Cup = 1
	}

	/**
	 * Player-controlled barista entity.
	 */
	export class Barista extends Entity {
		private carryState: CarryType;
		private moveSpeed: number;
		private counterY: number;
		private blocksAboveCounter: boolean;
		public cupData: DrinkRecipe;
		private rightImg: Image;
		private leftImg: Image;
		private lastBobOffset: number;

		constructor(sprite: Sprite, moveSpeed: number, counterY: number) {
			super(sprite);
			this.moveSpeed = moveSpeed;
			this.counterY = counterY;
			this.blocksAboveCounter = true;
			this.carryState = CarryType.None;
			this.cupData = null;
			this.lastBobOffset = 0;
			
			// Cache visual
			this.rightImg = sprite.image;
			this.leftImg = sprite.image.clone();
			this.leftImg.flipX(); // Vira a imagem apenas 1 vez na memória!
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
			// Remove o bob anterior para evitar drift acumulado nas coordenadas
			this.sprite.y += this.lastBobOffset;

			if (!this.active) {
				this.sprite.vx = 0;
				this.sprite.vy = 0;
				this.lastBobOffset = 0;
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
			if (dtSeconds > 0) {
				const nextY = this.sprite.y + vy * dtSeconds;
				if (this.blocksAboveCounter && nextY < this.counterY) {
					this.sprite.y = this.counterY;
					if (vy < 0) {
						vy = 0;
					}
				}
				// Evita que o Barista passe por cima do balcão de baixo (y = screen.height - 24)
				// Subtraindo 8 pixels para levar em conta o centro do sprite (16x16)
				const maxWalkY = screen.height - 32;
				if (nextY > maxWalkY) {
					this.sprite.y = maxWalkY;
					if (vy > 0) {
						vy = 0;
					}
				}
			}

			this.sprite.vx = vx;
			this.sprite.vy = vy;

			// Vira o sprite dependendo da velocidade X
			if (vx < 0) {
				this.sprite.setImage(this.leftImg);
			} else if (vx > 0) {
				this.sprite.setImage(this.rightImg);
			}

			// Animação de caminhada ("Bobbing" de 1 pixel sem alterar a imagem)
			if (vx !== 0 || vy !== 0) {
				let walkCycle = Math.floor(game.runtime() / 100) % 2;
				this.lastBobOffset = (walkCycle === 0) ? 1 : 0;
				this.sprite.y -= this.lastBobOffset;
			} else {
				this.lastBobOffset = 0;
			}

			if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
				this.carryState = CarryType.None;
				this.cupData = null;
			}
		}
	}
}

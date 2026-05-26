namespace Engine.Entities {
	/** Coffee beans available in the game. */
	export enum BeanType {
		None = 0,
		Mantiqueira = 1,
		Colombia = 2
	}

	/** Brewing methods available to customers. */
	export enum BrewMethod {
		Espresso = 0,
		Capsule = 1,
		V60 = 2
	}

	/** Customer behavior states. */
	export enum CustomerState {
		Entering = 0,
		Waiting = 1,
		Leaving = 2
	}

	/**
	 * Base customer entity with patience and a simple FSM.
	 */
	export class Customer extends Entity {
		protected state: CustomerState;
		protected patienceMaxMs: number;
		protected patienceElapsedMs: number;

		protected desiredBean: BeanType;
		protected desiredMethod: BrewMethod;

		protected rewardMultiplier: number;
		protected servedPerfectly: boolean;

		private progressBar: Engine.UI.ProgressBar;
		private barWidth: number;
		private barHeight: number;
		private barYOffset: number;

		private entryStartX: number;
		private entryStartY: number;
		private entryTargetX: number;
		private entryTargetY: number;
		private entryElapsedMs: number;
		private entryDurationMs: number;

		private leaveStartX: number;
		private leaveStartY: number;
		private leaveTargetX: number;
		private leaveTargetY: number;
		private leaveElapsedMs: number;
		private leaveDurationMs: number;

		constructor(
			sprite: Sprite,
			targetX: number,
			targetY: number,
			patienceMaxMs: number,
			desiredBean: BeanType,
			desiredMethod: BrewMethod
		) {
			super(sprite);
			this.state = CustomerState.Entering;
			this.patienceMaxMs = patienceMaxMs > 0 ? patienceMaxMs : 1;
			this.patienceElapsedMs = 0;
			this.desiredBean = desiredBean;
			this.desiredMethod = desiredMethod;
			this.rewardMultiplier = 1;
			this.servedPerfectly = false;

			this.entryStartX = sprite.x;
			this.entryStartY = sprite.y;
			this.entryTargetX = targetX;
			this.entryTargetY = targetY;
			this.entryElapsedMs = 0;
			this.entryDurationMs = 800;

			this.leaveStartX = targetX;
			this.leaveStartY = targetY;
			this.leaveTargetX = screen.width + 16;
			this.leaveTargetY = targetY;
			this.leaveElapsedMs = 0;
			this.leaveDurationMs = 700;

			this.barWidth = sprite.width;
			if (this.barWidth < 8) {
				this.barWidth = 8;
			}
			this.barHeight = 3;
			this.barYOffset = 2;

			const barX = sprite.x - (this.barWidth >> 1);
			const barY = sprite.y - (sprite.height >> 1) - this.barHeight - this.barYOffset;
			this.progressBar = new Engine.UI.ProgressBar(barX, barY, this.barWidth, this.barHeight);
			this.progressBar.setProgress(1);
			this.progressBar.setVisible(false);
		}

		/** Get the bean type the customer wants. */
		public getDesiredBean(): BeanType {
			return this.desiredBean;
		}

		/** Get the brew method the customer wants. */
		public getDesiredMethod(): BrewMethod {
			return this.desiredMethod;
		}

		/** Returns true if the customer was served correctly. */
		public wasServedPerfectly(): boolean {
			return this.servedPerfectly;
		}

		/** Reward multiplier for this customer type. */
		public getRewardMultiplier(): number {
			return this.rewardMultiplier;
		}

		/**
		 * Validate a served order and transition to Leaving.
		 */
		public serve(bean: BeanType, method: BrewMethod): boolean {
			if (this.state !== CustomerState.Waiting) {
				return false;
			}

			this.servedPerfectly = (bean === this.desiredBean && method === this.desiredMethod);
			this.startLeaving();
			return this.servedPerfectly;
		}

		/** Update FSM and patience bar. */
		public update(dt: number): void {
			if (!this.active) {
				return;
			}

			if (dt < 0) {
				dt = 0;
			}

			if (this.state === CustomerState.Entering) {
				this.entryElapsedMs += dt;
				let t = this.entryElapsedMs / this.entryDurationMs;
				if (t > 1) {
					t = 1;
				}

				this.sprite.x = this.lerp(this.entryStartX, this.entryTargetX, t);
				this.sprite.y = this.lerp(this.entryStartY, this.entryTargetY, t);

				if (t >= 1) {
					this.state = CustomerState.Waiting;
					this.patienceElapsedMs = 0;
					this.progressBar.setVisible(true);
				}
			} else if (this.state === CustomerState.Waiting) {
				this.patienceElapsedMs += dt;
				if (this.patienceElapsedMs >= this.patienceMaxMs) {
					this.patienceElapsedMs = this.patienceMaxMs;
					this.startLeaving();
				}

				const remaining = this.patienceMaxMs - this.patienceElapsedMs;
				const progress = this.patienceMaxMs > 0 ? (remaining / this.patienceMaxMs) : 0;
				this.progressBar.setProgress(progress);
			} else if (this.state === CustomerState.Leaving) {
				this.leaveElapsedMs += dt;
				let t = this.leaveElapsedMs / this.leaveDurationMs;
				if (t > 1) {
					t = 1;
				}

				this.sprite.x = this.lerp(this.leaveStartX, this.leaveTargetX, t);
				this.sprite.y = this.lerp(this.leaveStartY, this.leaveTargetY, t);

				if (t >= 1) {
					this.destroy();
					return;
				}
			}

			this.updateProgressBarPosition();
			if (this.state === CustomerState.Waiting) {
				this.progressBar.render(screen);
			}
		}

		/** Start the leaving state. */
		protected startLeaving(): void {
			if (this.state === CustomerState.Leaving) {
				return;
			}

			this.state = CustomerState.Leaving;
			this.progressBar.setVisible(false);
			this.leaveElapsedMs = 0;
			this.leaveStartX = this.sprite.x;
			this.leaveStartY = this.sprite.y;
			this.leaveTargetX = screen.width + 16;
			this.leaveTargetY = this.sprite.y;
		}

		/** Update patience bar position above the sprite. */
		protected updateProgressBarPosition(): void {
			const barX = this.sprite.x - (this.barWidth >> 1);
			const barY = this.sprite.y - (this.sprite.height >> 1) - this.barHeight - this.barYOffset;
			this.progressBar.setPosition(barX, barY);
		}

		/** Linear interpolation helper. */
		protected lerp(a: number, b: number, t: number): number {
			return a + (b - a) * t;
		}
	}

	/**
	 * Customer with very low patience and fast orders.
	 */
	export class RushedStudent extends Customer {
		constructor(sprite: Sprite, targetX: number, targetY: number) {
			const method = randint(0, 1) === 0 ? BrewMethod.Espresso : BrewMethod.Capsule;
			const bean = randint(0, 1) === 0 ? BeanType.Mantiqueira : BeanType.Colombia;
			super(sprite, targetX, targetY, 10000, bean, method);
		}
	}

	/**
	 * Customer with high patience and demanding orders.
	 */
	export class CoffeeSnob extends Customer {
		constructor(sprite: Sprite, targetX: number, targetY: number) {
			super(sprite, targetX, targetY, 40000, BeanType.Mantiqueira, BrewMethod.V60);
			this.rewardMultiplier = 3;
		}
	}
}

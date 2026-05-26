namespace Engine.Entities {
	/** Processing state of a station. */
	export enum BrewState {
		Idle = 0,
		Processing = 1,
		Ready = 2,
		Ruined = 3
	}

	/**
	 * Coffee station that processes beans into a drink.
	 */
	export class Station extends Entity {
		private method: BrewMethod;
		private state: BrewState;
		private processDurationMs: number;
		private processElapsedMs: number;
		private readyDurationMs: number;
		private readyElapsedMs: number;
		private lastBean: BeanType;
		private outputType: CarryType;

		constructor(sprite: Sprite, method: BrewMethod) {
			super(sprite);
			this.method = method;
			this.state = BrewState.Idle;
			this.processDurationMs = this.getProcessDuration(method);
			this.processElapsedMs = 0;
			this.readyDurationMs = this.getReadyDuration(method);
			this.readyElapsedMs = 0;
			this.lastBean = BeanType.None;
			this.outputType = this.getOutputType(method);
		}

		/** Current processing state. */
		public getState(): BrewState {
			return this.state;
		}

		/** Brewing method of this station. */
		public getMethod(): BrewMethod {
			return this.method;
		}

		/** Last bean used in this station. */
		public getLastBean(): BeanType {
			return this.lastBean;
		}

		/**
		 * Interact with the station using the barista's current carry.
		 */
		public interact(baristaCarryType: CarryType): CarryType {
			if (this.state === BrewState.Idle) {
				if (baristaCarryType === CarryType.BeansMantiqueira || baristaCarryType === CarryType.BeansColombia) {
					this.lastBean = (baristaCarryType === CarryType.BeansMantiqueira) ? BeanType.Mantiqueira : BeanType.Colombia;
					this.startProcessing();
					return CarryType.None;
				}

				return baristaCarryType;
			}

			if (this.state === BrewState.Processing) {
				return baristaCarryType;
			}

			if (this.state === BrewState.Ready) {
				if (baristaCarryType === CarryType.None) {
					this.state = BrewState.Idle;
					this.processElapsedMs = 0;
					this.readyElapsedMs = 0;
					return this.outputType;
				}

				return baristaCarryType;
			}

			if (this.state === BrewState.Ruined) {
				if (baristaCarryType === CarryType.None) {
					this.state = BrewState.Idle;
					this.processElapsedMs = 0;
					this.readyElapsedMs = 0;
					this.lastBean = BeanType.None;
					return CarryType.None;
				}
			}

			return baristaCarryType;
		}

		/** Update station timers. */
		public update(dt: number): void {
			if (!this.active) {
				return;
			}

			if (dt < 0) {
				dt = 0;
			}

			if (this.state === BrewState.Processing) {
				this.processElapsedMs += dt;
				if (this.processElapsedMs >= this.processDurationMs) {
					this.processElapsedMs = this.processDurationMs;
					this.state = BrewState.Ready;
					this.readyElapsedMs = 0;
				}
				return;
			}

			if (this.state === BrewState.Ready) {
				this.readyElapsedMs += dt;
				if (this.readyElapsedMs >= this.readyDurationMs) {
					this.readyElapsedMs = this.readyDurationMs;
					this.state = BrewState.Ruined;
				}
			}
		}

		private startProcessing(): void {
			this.state = BrewState.Processing;
			this.processElapsedMs = 0;
			this.readyElapsedMs = 0;
		}

		private getProcessDuration(method: BrewMethod): number {
			if (method === BrewMethod.V60) {
				return 6000;
			}
			if (method === BrewMethod.Capsule) {
				return 1800;
			}

			return 2500;
		}

		private getReadyDuration(method: BrewMethod): number {
			if (method === BrewMethod.V60) {
				return 3000;
			}
			if (method === BrewMethod.Capsule) {
				return 2000;
			}

			return 2200;
		}

		private getOutputType(method: BrewMethod): CarryType {
			if (method === BrewMethod.V60) {
				return CarryType.V60;
			}
			if (method === BrewMethod.Capsule) {
				return CarryType.Capsule;
			}

			return CarryType.Espresso;
		}
	}
}

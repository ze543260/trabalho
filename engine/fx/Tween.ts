namespace Engine.FX {
	/** Marker interface for tween targets. */
	export interface TweenTarget {
	}

	/** Accessor interface for tweened properties. */
	export interface TweenAccessor {
		get(target: TweenTarget): number;
		set(target: TweenTarget, value: number): void;
	}

	/**
	 * Linear tween that updates a numeric property over time.
	 */
	export class Tween {
		private target: TweenTarget;
		private accessor: TweenAccessor;
		private from: number;
		private to: number;
		private durationMs: number;
		private elapsedMs: number;
		private active: boolean;

		constructor(target: TweenTarget, accessor: TweenAccessor, from: number, to: number, durationMs: number) {
			this.target = target;
			this.accessor = accessor;
			this.from = from;
			this.to = to;
			this.durationMs = durationMs;
			this.elapsedMs = 0;
			this.active = true;

			this.accessor.set(this.target, this.from);
		}

		/** Whether the tween is still active. */
		public isActive(): boolean {
			return this.active;
		}

		/**
		 * Advance the tween by dt milliseconds. Returns true when complete.
		 */
		public update(dtMs: number): boolean {
			if (!this.active) {
				return true;
			}

			if (dtMs < 0) {
				dtMs = 0;
			}

			this.elapsedMs += dtMs;

			let t = 1;
			if (this.durationMs > 0) {
				t = this.elapsedMs / this.durationMs;
				if (t > 1) {
					t = 1;
				}
			}

			const value = this.from + (this.to - this.from) * t;
			this.accessor.set(this.target, value);

			if (t >= 1) {
				this.active = false;
				return true;
			}

			return false;
		}

		/** Restart the tween with new parameters. */
		public reset(from: number, to: number, durationMs: number): void {
			this.from = from;
			this.to = to;
			this.durationMs = durationMs;
			this.elapsedMs = 0;
			this.active = true;
			this.accessor.set(this.target, this.from);
		}
	}
}

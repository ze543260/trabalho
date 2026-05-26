namespace Engine.FX {
	/**
	 * Tween manager focused on non-blocking math animations.
	 */
	export class FXManager {
		private static pool: (Tween | null)[] = [];
		private static capacity: number = 0;

		/** Preallocate tween slots. Call before add/update. */
		public static init(capacity: number): void {
			this.capacity = capacity;
			this.pool = [];
			for (let i = 0; i < capacity; i++) {
				this.pool.push(null);
			}
		}

		/** Add a tween to the first free slot. Returns false if full. */
		public static add(tween: Tween): boolean {
			if (this.capacity <= 0) {
				return false;
			}

			for (let i = 0; i < this.pool.length; i++) {
				if (this.pool[i] === null) {
					this.pool[i] = tween;
					return true;
				}
			}

			return false;
		}

		/** Update all active tweens. */
		public static update(dtMs: number): void {
			for (let i = 0; i < this.pool.length; i++) {
				const tween = this.pool[i];
				if (tween) {
					const finished = tween.update(dtMs);
					if (finished) {
						this.pool[i] = null;
					}
				}
			}
		}

		/** Clear all tween slots. */
		public static clear(): void {
			for (let i = 0; i < this.pool.length; i++) {
				this.pool[i] = null;
			}
		}
	}
}

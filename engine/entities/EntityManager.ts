namespace Engine.Entities {
	/**
	 * Preallocated entity list with pooled updates.
	 */
	export class EntityManager {
		private static pool: (Entity | null)[] = [];
		private static capacity: number = 0;

		/** Preallocate entity slots. Call before add/update. */
		public static init(capacity: number): void {
			this.capacity = capacity;
			this.pool = [];
			for (let i = 0; i < capacity; i++) {
				this.pool.push(null);
			}
		}

		/** Get all active entities. */
		public static getActiveEntities(): Entity[] {
			const active: Entity[] = [];
			for (let i = 0; i < this.pool.length; i++) {
				const entity = this.pool[i];
				if (entity && entity.active) {
					active.push(entity);
				}
			}
			return active;
		}

		/** Add an entity to the first free slot. Returns false if full. */
		public static add(entity: Entity): boolean {
			if (this.capacity <= 0) {
				return false;
			}

			for (let i = 0; i < this.pool.length; i++) {
				const slot = this.pool[i];
				if (slot === null || !slot.active) {
					this.pool[i] = entity;
					entity.active = true;
					return true;
				}
			}

			return false;
		}

		/** Update only active entities. */
		public static update(dt: number): void {
			for (let i = 0; i < this.pool.length; i++) {
				const entity = this.pool[i];
				if (entity && entity.active) {
					entity.update(dt);
				}
			}
		}

		/** Clear all slots without destroying entities. */
		public static clear(): void {
			for (let i = 0; i < this.pool.length; i++) {
				this.pool[i] = null;
			}
		}
	}
}

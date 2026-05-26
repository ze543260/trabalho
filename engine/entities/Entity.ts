namespace Engine.Entities {
	/**
	 * Base game entity. 
	 * REMOVIDO O 'abstract' para evitar crashes no compilador C++ do MakeCode.
	 */
	export class Entity {
		public sprite: Sprite;
		public active: boolean;

		constructor(sprite: Sprite) {
			this.sprite = sprite;
			this.active = true;
		}

		// Método concreto, mas vazio. As classes filhas (Barista, Station) farão o override.
		public update(dt: number): void {
		}

		/**
		 * Deactivate entity and return its sprite to the pool.
		 */
		public destroy(): void {
			if (!this.active) {
				return;
			}

			this.active = false;
			Engine.Core.freeSprite(this.sprite);
		}
	}
}

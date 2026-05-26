namespace Engine.Entities {
	/**
	 * Base game entity with pooling-friendly destroy behavior.
	 *
	 * Concrete entities should own a private Engine.Graphics.Animator to handle
	 * visual states (Idle, Walking, etc.), instantiate it with this.sprite in
	 * the constructor, and call animator.update(dt) inside update().
	 */
	export abstract class Entity {
		public sprite: Sprite;
		public active: boolean;

		constructor(sprite: Sprite) {
			this.sprite = sprite;
			this.active = true;
		}

		public abstract update(dt: number): void;

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

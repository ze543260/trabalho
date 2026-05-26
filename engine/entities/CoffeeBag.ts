namespace Engine.Entities {
	/**
	 * Interactive coffee bag entity.
	 */
	export class CoffeeBag extends Entity {
		private beanType: CarryType;

		constructor(sprite: Sprite, beanType: CarryType) {
			super(sprite);
			this.beanType = beanType;
		}

		/** Get the type of beans this bag contains. */
		public getBeanType(): CarryType {
			return this.beanType;
		}

		public update(dt: number): void {
			// Coffee bags are static, no tick update needed.
		}

		/** Return the bean carry type to the barista. */
		public interact(baristaCarryType: CarryType): CarryType {
			if (baristaCarryType === CarryType.None) {
				return this.beanType;
			}
			return baristaCarryType;
		}
	}
}

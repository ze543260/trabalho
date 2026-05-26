namespace Engine.UI {
	/**
	 * UI manager responsible for updating and rendering UI elements.
	 */
	export class UIManager {
		private static elements: UIElement[] = [];

		/** Initialize the UI system. */
		public static init(): void {
			this.clear();
		}

		/** Add an element to be managed. */
		public static add(element: UIElement): void {
			this.elements.push(element);
		}

		/** Remove an element from the manager. */
		public static remove(element: UIElement): void {
			const index = this.elements.indexOf(element);
			if (index >= 0) {
				this.elements.splice(index, 1);
			}
		}

		/** Clear all managed elements. */
		public static clear(): void {
			if (this.elements.length > 0) {
				this.elements.length = 0;
			}
		}

		/** Update all elements. */
		public static update(dt: number): void {
			for (let i = 0; i < this.elements.length; i++) {
				this.elements[i].update(dt);
			}
		}

		/** Render all visible elements to the screen buffer. */
		public static render(screen: Image): void {
			for (let i = 0; i < this.elements.length; i++) {
				this.elements[i].render(screen);
			}
		}
	}
}

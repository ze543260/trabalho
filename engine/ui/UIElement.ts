namespace Engine.UI {
	/**
	 * Base class for UI elements that render to the screen.
	 */
	export abstract class UIElement {
		protected x: number;
		protected y: number;
		protected width: number;
		protected height: number;
		protected visible: boolean;
		protected enabled: boolean;
		protected focused: boolean;

		constructor(x: number, y: number, width: number, height: number) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.visible = true;
			this.enabled = true;
			this.focused = false;
		}

		/** Update element state. */
		public update(dt: number): void {
		}

		/** Render element to the screen buffer. */
		public abstract render(screen: Image): void;

		public setPosition(x: number, y: number): void {
			this.x = x;
			this.y = y;
		}

		public setSize(width: number, height: number): void {
			this.width = width;
			this.height = height;
		}

		public setVisible(visible: boolean): void {
			this.visible = visible;
		}

		public isVisible(): boolean {
			return this.visible;
		}

		public setEnabled(enabled: boolean): void {
			this.enabled = enabled;
		}

		public isEnabled(): boolean {
			return this.enabled;
		}

		public setFocused(focused: boolean): void {
			this.focused = focused;
		}

		public isFocused(): boolean {
			return this.focused;
		}
	}
}

namespace Engine.UI {
	/**
	 * Panel window used as a background for menus.
	 */
	export class Window extends UIElement {
		private bgColor: number;
		private borderColor: number;
		private title: string;
		private titleBarHeight: number;
		private titlePaddingX: number;
		private titleTextColor: number;

		constructor(x: number, y: number, width: number, height: number, title?: string) {
			super(x, y, width, height);
			this.bgColor = 1;
			this.borderColor = 15;
			this.title = title ? title : "";
			this.titleBarHeight = 10;
			this.titlePaddingX = 4;
			this.titleTextColor = 15;
		}

		/** Set window colors. */
		public setColors(bgColor: number, borderColor: number): void {
			this.bgColor = bgColor;
			this.borderColor = borderColor;
		}

		/** Set optional title text. */
		public setTitle(title: string): void {
			this.title = title;
		}

		/** Render window background, border, and optional title bar. */
		public render(screen: Image): void {
			if (!this.visible) {
				return;
			}

			screen.fillRect(this.x, this.y, this.width, this.height, this.bgColor);
			screen.drawRect(this.x, this.y, this.width, this.height, this.borderColor);

			if (this.title.length > 0 && this.height > 4) {
				let barHeight = this.titleBarHeight;
				if (barHeight > this.height - 2) {
					barHeight = this.height - 2;
				}

				if (barHeight > 0) {
					screen.fillRect(this.x + 1, this.y + 1, this.width - 2, barHeight, this.borderColor);
					screen.print(this.title, this.x + this.titlePaddingX, this.y + 2, this.titleTextColor);
				}
			}
		}
	}
}

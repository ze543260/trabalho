namespace Engine.UI {
	/**
	 * Progress bar used for patience or day timers.
	 */
	export class ProgressBar extends UIElement {
		private progress: number;
		private fillColor: number;
		private trackColor: number;

		constructor(x: number, y: number, width: number, height: number) {
			super(x, y, width, height);
			this.progress = 1;
			this.fillColor = 7;
			this.trackColor = 1;
		}

		/** Set progress in the range [0.0, 1.0]. */
		public setProgress(progress: number): void {
			if (progress < 0) {
				progress = 0;
			}
			if (progress > 1) {
				progress = 1;
			}

			this.progress = progress;
		}

		/** Set bar colors. */
		public setColors(fillColor: number, trackColor: number): void {
			this.fillColor = fillColor;
			this.trackColor = trackColor;
		}

		/** Render progress bar. */
		public render(screen: Image): void {
			if (!this.visible) {
				return;
			}

			screen.fillRect(this.x, this.y, this.width, this.height, this.trackColor);

			let fillWidth = Math.floor(this.width * this.progress);
			if (fillWidth < 0) {
				fillWidth = 0;
			}
			if (fillWidth > this.width) {
				fillWidth = this.width;
			}

			if (fillWidth > 0) {
				screen.fillRect(this.x, this.y, fillWidth, this.height, this.fillColor);
			}
		}
	}
}

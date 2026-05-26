namespace Engine.UI {
	/** Visual state of the button. */
	export enum ButtonState {
		Idle = 0,
		Focused = 1,
		Pressed = 2
	}

	/**
	 * Simple UI button with focus and press states.
	 */
	export class Button extends UIElement {
		private label: string;
		private onClickHandler: () => void;
		private state: ButtonState;
		private pressedTimeMs: number;
		private pressedTimerMs: number;

		private idleFill: number;
		private idleBorder: number;
		private focusedFill: number;
		private focusedBorder: number;
		private pressedFill: number;
		private pressedBorder: number;
		private textColor: number;

		constructor(x: number, y: number, width: number, height: number, label: string, onClick: () => void) {
			super(x, y, width, height);
			this.label = label;
			this.onClickHandler = onClick;
			this.state = ButtonState.Idle;
			this.pressedTimeMs = 120;
			this.pressedTimerMs = 0;

			this.idleFill = 1;
			this.idleBorder = 13;
			this.focusedFill = 2;
			this.focusedBorder = 12;
			this.pressedFill = 5;
			this.pressedBorder = 15;
			this.textColor = 15;
		}

		/** Update label text. */
		public setLabel(label: string): void {
			this.label = label;
		}

		/** Update click handler. */
		public setOnClick(onClick: () => void): void {
			this.onClickHandler = onClick;
		}

		/** Update visual palette. */
		public setColors(
			idleFill: number,
			idleBorder: number,
			focusedFill: number,
			focusedBorder: number,
			pressedFill: number,
			pressedBorder: number,
			textColor: number
		): void {
			this.idleFill = idleFill;
			this.idleBorder = idleBorder;
			this.focusedFill = focusedFill;
			this.focusedBorder = focusedBorder;
			this.pressedFill = pressedFill;
			this.pressedBorder = pressedBorder;
			this.textColor = textColor;
		}

		/**
		 * Button update checks for Interact while focused.
		 */
		public update(dt: number): void {
			if (!this.visible || !this.enabled) {
				this.state = ButtonState.Idle;
				this.pressedTimerMs = 0;
				return;
			}

			if (this.focused) {
				if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
					this.state = ButtonState.Pressed;
					this.pressedTimerMs = this.pressedTimeMs;
					this.onClickHandler();
				} else if (this.pressedTimerMs > 0) {
					this.pressedTimerMs -= dt;
					if (this.pressedTimerMs <= 0) {
						this.pressedTimerMs = 0;
						this.state = ButtonState.Focused;
					}
				} else {
					this.state = ButtonState.Focused;
				}
			} else {
				this.state = ButtonState.Idle;
				this.pressedTimerMs = 0;
			}
		}

		/** Render button based on its current state. */
		public render(screen: Image): void {
			if (!this.visible) {
				return;
			}

			let fill = this.idleFill;
			let border = this.idleBorder;
			if (this.state === ButtonState.Focused) {
				fill = this.focusedFill;
				border = this.focusedBorder;
			} else if (this.state === ButtonState.Pressed) {
				fill = this.pressedFill;
				border = this.pressedBorder;
			}

			screen.fillRect(this.x, this.y, this.width, this.height, fill);
			screen.drawRect(this.x, this.y, this.width, this.height, border);

			if (this.label.length > 0) {
				const textWidth = this.label.length * 6;
				const textX = this.x + ((this.width - textWidth) >> 1);
				const textY = this.y + ((this.height - 7) >> 1);
				screen.print(this.label, textX, textY, this.textColor);
			}
		}
	}
}

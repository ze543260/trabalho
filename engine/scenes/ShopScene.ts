namespace Engine.Scenes {
	/**
	 * Scene that shows the upgrade shop menu.
	 */
	export class ShopScene implements Scene {
		private window: Engine.UI.Window;
		private buttons: Engine.UI.Button[];
		private focusedIndex: number;
		private buttonCount: number;

		constructor() {
			this.window = new Engine.UI.Window(0, 0, 1, 1, "");
			this.buttons = [];
			this.focusedIndex = 0;
			this.buttonCount = 0;
		}

		/** Create the shop UI. */
		public enter(): void {
			Engine.UI.UIManager.clear();

			const margin = 8;
			const windowWidth = screen.width - (margin * 2);
			const windowHeight = screen.height - (margin * 2);
			const windowX = margin;
			const windowY = margin;

			this.window = new Engine.UI.Window(windowX, windowY, windowWidth, windowHeight, "Loja - $" + Engine.Core.TycoonState.money);
			Engine.UI.UIManager.add(this.window);

			const buttonWidth = windowWidth - 16;
			const buttonHeight = 14;
			const buttonX = windowX + 8;
			let buttonY = windowY + 20;

			const grinderButton = new Engine.UI.Button(buttonX, buttonY, buttonWidth, buttonHeight, "Upgrade Moedor", function (): void {
				console.log("TODO: Upgrade Moedor");
			});

			buttonY += buttonHeight + 6;
			const capsuleButton = new Engine.UI.Button(buttonX, buttonY, buttonWidth, buttonHeight, "Maquina de Capsulas", function (): void {
				console.log("TODO: Comprar Maquina de Capsulas");
			});

			buttonY += buttonHeight + 6;
			let counterPrice = Engine.Core.TycoonState.maxCounterSlots * 15;
			let counterText = "";
			if (Engine.Core.TycoonState.maxCounterSlots >= 5) {
				counterText = "Balcao no Maximo (5)";
			} else {
				counterText = "Expandir Balcao: $" + counterPrice;
			}
			const counterButton = new Engine.UI.Button(buttonX, buttonY, buttonWidth, buttonHeight, counterText, function (): void {
				if (Engine.Core.TycoonState.maxCounterSlots < 5) {
					if (Engine.Core.TycoonState.money >= counterPrice) {
						Engine.Core.TycoonState.money -= counterPrice;
						Engine.Core.TycoonState.maxCounterSlots += 1;
						Engine.Scenes.SceneStack.pop();
						Engine.Scenes.SceneStack.push(new Engine.Scenes.ShopScene());
					}
				}
			});

			this.buttons = [];
			this.buttons.push(grinderButton);
			this.buttons.push(capsuleButton);
			this.buttons.push(counterButton);
			this.buttonCount = this.buttons.length;
			this.focusedIndex = 0;
			this.applyFocus();

			Engine.UI.UIManager.add(grinderButton);
			Engine.UI.UIManager.add(capsuleButton);
			Engine.UI.UIManager.add(counterButton);
		}

		/** Handle input and update UI. */
		public update(dt: number): void {
			if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
				this.moveFocus(-1);
			}
			if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
				this.moveFocus(1);
			}

			if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
				Engine.Scenes.SceneStack.pop();
				return;
			}

			Engine.UI.UIManager.update(dt);
			Engine.UI.UIManager.render(screen);
		}

		/** Clear the shop UI. */
		public exit(): void {
			Engine.UI.UIManager.clear();
		}

		public pause(): void {
		}

		public resume(): void {
		}

		private moveFocus(direction: number): void {
			if (this.buttonCount <= 0) {
				return;
			}

			let nextIndex = this.focusedIndex + direction;
			if (nextIndex < 0) {
				nextIndex = this.buttonCount - 1;
			} else if (nextIndex >= this.buttonCount) {
				nextIndex = 0;
			}

			this.focusedIndex = nextIndex;
			this.applyFocus();
		}

		private applyFocus(): void {
			for (let i = 0; i < this.buttonCount; i++) {
				this.buttons[i].setFocused(i === this.focusedIndex);
			}
		}
	}
}

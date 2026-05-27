namespace Engine.Scenes {
    export class ShopScene implements Scene {
        private selectedCustomerId: number;
        private db: Engine.Persistence.CustomerDatabase;

        constructor() {
            this.selectedCustomerId = 0;
            this.db = Engine.Persistence.CustomerDatabase.getInstance();
        }

        public enter(): void {
            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;
                this.drawScene();
            });
        }

        private drawScene(): void {
            screen.fill(1);

            // Header
            screen.fillRect(0, 0, 160, 12, 4);
            screen.print("CADERNO DO BARISTA", 10, 2, 5, image.font5);
            screen.drawLine(0, 12, 160, 12, 0);

            // Customer list
            let customers = this.db.getAllCustomers();
            let listY = 20;

            for (let i = 0; i < customers.length; i++) {
                let c = customers[i];
                let isSelected = (i === this.selectedCustomerId);
                let bgColor = isSelected ? 14 : 1;
                let textColor = isSelected ? 1 : 5;

                // Draw selection box
                screen.fillRect(5, listY + i * 20, 150, 18, bgColor);
                screen.drawRect(4, listY + i * 20 - 1, 152, 20, 0);

                // Draw customer info
                screen.print(c.character.name, 10, listY + i * 20 + 2, textColor, image.font5);
                let affinityStr = "Afinidade: " + c.affinity;
                screen.print(affinityStr, 10, listY + i * 20 + 10, isSelected ? 0 : 8, image.font5);
            }

            // Display unlocked ingredients
            screen.print("INGREDIENTES DESBLOQUEADOS:", 5, 90, 5, image.font5);
            let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
            let unlockedList = unlocks.getUnlockedIngredients();
            for (let i = 0; i < unlockedList.length && i < 2; i++) {
                let ing = unlockedList[i];
                screen.print("+ " + ing.name, 10, 98 + i * 8, 14, image.font5);
            }

            // Footer
            screen.fillRect(0, 110, 160, 10, 1);
            screen.print("UP/DOWN=select  B=back", 5, 112, 8, image.font5);
        }

        public exit(): void {}

        public update(dt: number): void {
            let customers = this.db.getAllCustomers();

            if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                this.selectedCustomerId = (this.selectedCustomerId - 1 + customers.length) % customers.length;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                this.selectedCustomerId = (this.selectedCustomerId + 1) % customers.length;
            }

            if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
                Engine.Scenes.SceneStack.pop();
            }
        }

        public pause(): void {}
        public resume(): void {}
    }
}

namespace Engine.Scenes {
    export class BrewScene implements Scene {
        private barista: Engine.Entities.Barista;
        private recipe: Engine.Entities.DrinkRecipe;
        private cursorIndex: number;

        constructor(barista: Engine.Entities.Barista) {
            this.barista = barista;
            this.recipe = new Engine.Entities.DrinkRecipe();
            this.cursorIndex = 0;
        }

        public enter(): void {
            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;

                // Fundo da Bancada de Preparo (Madeira escura e parede)
                screen.fillRect(0, 0, screen.width, screen.height, 15);
                screen.fillRect(0, 80, screen.width, 40, 11); // Parede
                screen.fillRect(0, 110, screen.width, 10, 12); // Tampo da mesa

                // Título
                screen.print("BANCADA DE PREPARO", 10, 10, 1);

                // Desenha a Xícara Gigante no canto direito
                screen.drawTransparentImage(Assets.largeCup, 110, 40);
                this.drawCupContents(110, 40);

                // Grid de Ingredientes e Máquinas
                // 0: Mantiqueira, 1: Colombia
                // 2: Espresso, 3: V60
                // 4: Leite, 5: Mel
                // 6: [SERVIR]

                const items = [
                    { name: "Grão Man.", img: Assets.beanBagMantiqueira, x: 20, y: 30 },
                    { name: "Grão Col.", img: Assets.beanBagColombian, x: 60, y: 30 },
                    { name: "Espresso", img: Assets.largeEspresso, x: 20, y: 60 },
                    { name: "V60", img: Assets.largeV60, x: 60, y: 60 },
                    { name: "Leite", img: Assets.largeMilk, x: 20, y: 90 },
                    { name: "Mel", img: Assets.largeHoney, x: 60, y: 90 }
                ];

                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    screen.drawTransparentImage(item.img, item.x - (item.img.width/2), item.y - (item.img.height/2));
                    if (this.cursorIndex === i) {
                        screen.drawRect(item.x - 18, item.y - 18, 36, 36, 5); // Cursor amarelo
                        screen.print(item.name, 10, 110, 5);
                    }
                }

                // Botão "SERVIR"
                let btnX = 110;
                let btnY = 90;
                screen.fillRect(btnX - 20, btnY - 10, 40, 20, this.cursorIndex === 6 ? 5 : 1);
                screen.print("SERVIR", btnX - 16, btnY - 4, this.cursorIndex === 6 ? 15 : 15);
                if (this.cursorIndex === 6) {
                    screen.print("Pronto!", 10, 110, 5);
                }

                // Exibe estado atual
                if (this.recipe.bean !== Engine.Entities.BeanType.None) {
                    screen.print("G: " + (this.recipe.bean === Engine.Entities.BeanType.Mantiqueira ? "Man" : "Col"), 110, 70, 1);
                }
            });
        }

        private drawCupContents(cx: number, cy: number): void {
            // cy = 40. Topo do copo = cy + 2. Fundo = cy + 12
            if (this.recipe.method !== Engine.Entities.BrewMethod.None) {
                let color = 14; // Marrom padrão
                if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Milk) >= 0) {
                    color = 13; // Bege com leite
                }
                // Preenche o liquido dentro da xícara
                screen.fillRect(cx + 4, cy + 5, 16, 7, color);
            }
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Honey) >= 0) {
                // Desenha uma gota amarela na borda
                screen.setPixel(cx + 10, cy + 4, 5);
            }
        }

        public exit(): void {}

        public update(dt: number): void {
            if (Engine.Core.justPressed(Engine.Core.Action.Right)) {
                this.cursorIndex++;
                if (this.cursorIndex > 6) this.cursorIndex = 0;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Left)) {
                this.cursorIndex--;
                if (this.cursorIndex < 0) this.cursorIndex = 6;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                if (this.cursorIndex < 6) this.cursorIndex = Math.min(6, this.cursorIndex + 2);
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                if (this.cursorIndex > 1) this.cursorIndex -= 2;
            }

            if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                music.pewPew.play();
                if (this.cursorIndex === 0) this.recipe.bean = Engine.Entities.BeanType.Mantiqueira;
                else if (this.cursorIndex === 1) this.recipe.bean = Engine.Entities.BeanType.Colombia;
                else if (this.cursorIndex === 2 && this.recipe.bean !== Engine.Entities.BeanType.None) this.recipe.method = Engine.Entities.BrewMethod.Espresso;
                else if (this.cursorIndex === 3 && this.recipe.bean !== Engine.Entities.BeanType.None) this.recipe.method = Engine.Entities.BrewMethod.V60;
                else if (this.cursorIndex === 4 && this.recipe.method !== Engine.Entities.BrewMethod.None) this.recipe.addAddin(Engine.Entities.AddinType.Milk);
                else if (this.cursorIndex === 5 && this.recipe.method !== Engine.Entities.BrewMethod.None) this.recipe.addAddin(Engine.Entities.AddinType.Honey);
                else if (this.cursorIndex === 6) {
                    // SERVIR!
                    this.barista.setCarryType(Engine.Entities.CarryType.Cup);
                    this.barista.cupData = this.recipe;
                    SceneStack.pop();
                }
            }

            // Cancelar
            if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
                SceneStack.pop();
            }
        }

        public pause(): void {}
        public resume(): void {}
    }
}

namespace Engine.Scenes {
    export class BrewScene implements Scene {
        private onComplete: (recipe: Engine.Entities.DrinkRecipe) => void;
        private recipe: Engine.Entities.DrinkRecipe;
        private cursorIndex: number;
        // Layout: 
        //  Linha 0: [Grão Man.] [Grão Col.]
        //  Linha 1: [Espresso]  [V60]
        //  Linha 2: [Leite]     [Mel]      [SERVIR]
        // items[6] = SERVIR

        constructor(onComplete: (recipe: Engine.Entities.DrinkRecipe) => void) {
            this.onComplete = onComplete;
            this.recipe = new Engine.Entities.DrinkRecipe();
            this.cursorIndex = 0;
        }

        public enter(): void {
            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;
                this.drawScene();
            });
        }

        private drawScene(): void {
            // === FUNDO ===
            // Parede de fundo (azul escuro lofi)
            screen.fillRect(0, 0, screen.width, 72, 1);
            // Balcão de madeira (escuro)
            screen.fillRect(0, 72, screen.width, 48, 14);
            // Tampo do balcão (linha de madeira clara)
            screen.fillRect(0, 72, screen.width, 4, 4);

            // === TÍTULO ===
            screen.fillRect(0, 0, screen.width, 12, 15);
            screen.print("BANCADA DE PREPARO", 26, 3, 1, image.font5);

            // === STATUS DA RECEITA (lado direito, acima) ===
            let recipeY = 15;
            screen.print("RECEITA:", 102, recipeY, 12, image.font5);
            if (this.recipe.bean !== Engine.Entities.BeanType.None) {
                let bName = this.recipe.bean === Engine.Entities.BeanType.Mantiqueira ? "Mantiqueira" : "Colombia";
                screen.print(bName, 102, recipeY + 8, 5, image.font5);
            }
            if (this.recipe.method !== Engine.Entities.BrewMethod.None) {
                let mName = "";
                if (this.recipe.method === Engine.Entities.BrewMethod.Espresso) mName = "Espresso";
                else if (this.recipe.method === Engine.Entities.BrewMethod.V60) mName = "V60";
                else mName = "Capsula";
                screen.print(mName, 102, recipeY + 16, 6, image.font5);
            }
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Milk) >= 0) {
                screen.print("+ Leite", 102, recipeY + 24, 1, image.font5);
            }
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Honey) >= 0) {
                screen.print("+ Mel", 102, recipeY + 32, 5, image.font5);
            }

            // === GRID DE ITENS ===
            // Colunas: x=18 e x=60. Linhas: y=32, 56, 80
            const COL0 = 18;
            const COL1 = 60;
            const ROW0 = 38;
            const ROW1 = 62;
            const ROW2 = 86;
            const ICON = 16; // tamanho do ícone desenhado na tela (16x16)

            // --- Linha 0: Grãos ---
            this.drawIconItem(0, COL0, ROW0, 14); // Mantiqueira = marrom
            this.drawIconItem(1, COL1, ROW0, 2);  // Colombia    = vermelho

            // --- Linha 1: Máquinas ---
            this.drawMachineItem(2, COL0, ROW1, Assets.largeEspresso);
            this.drawMachineItem(3, COL1, ROW1, Assets.largeV60);

            // --- Linha 2: Extras + Servir ---
            this.drawMachineItem(4, COL0, ROW2, Assets.largeMilk);
            this.drawMachineItem(5, COL1, ROW2, Assets.largeHoney);

            // Botão SERVIR (índice 6) à direita
            let isServing = this.cursorIndex === 6;
            screen.fillRect(80, ROW2 - 10, 18, 20, isServing ? 5 : 11);
            screen.print("OK", 84, ROW2 - 3, isServing ? 15 : 12, image.font5);

            // === LEGENDA NO RODAPÉ ===
            screen.fillRect(0, 112, screen.width, 8, 15);
            let labels = ["Man.", "Col.", "Espresso", "V60", "Leite", "Mel", "SERVIR!"];
            if (this.cursorIndex >= 0 && this.cursorIndex <= 6) {
                screen.print(labels[this.cursorIndex], 2, 113, 14, image.font5);
                screen.print("< >", 120, 113, 1, image.font5);
            }
        }

        // Ícone simples (quadrado colorido) para grãos
        private drawIconItem(idx: number, cx: number, cy: number, color: number): void {
            let isSelected = this.cursorIndex === idx;
            screen.fillRect(cx - 8, cy - 8, 16, 16, color);
            // Grão label
            let label = idx === 0 ? "Man" : "Col";
            screen.print(label, cx - 7, cy - 4, 15, image.font5);
            if (isSelected) {
                screen.drawRect(cx - 10, cy - 10, 20, 20, 5);
            }
        }

        // Ícone de imagem grande desenhado como bloco de cor por tipo
        private drawMachineItem(idx: number, cx: number, cy: number, img: Image): void {
            let isSelected = this.cursorIndex === idx;
            let sx = cx - 8;
            let sy = cy - 8;
            // Sem resize() disponível, desenhamos a imagem full-size
            // mas num "viewport" de 16x16 via fillRect de fundo + ícone centralizado
            screen.fillRect(sx, sy, 16, 16, 11); // fundo azul escuro
            // Samplea a cor central da imagem para dar identidade visual
            let centerColor = img.getPixel(img.width / 2, img.height / 2);
            screen.fillRect(sx + 2, sy + 2, 12, 12, centerColor);
            screen.drawRect(sx + 2, sy + 2, 12, 12, 12);
            if (isSelected) {
                screen.drawRect(sx - 2, sy - 2, 20, 20, 5);
            }
        }

        private drawCupContents(): void {}

        public exit(): void {}
        public pause(): void {}
        public resume(): void {}

        public update(dt: number): void {
            // Navegação em grid 2 colunas (0-5) + botão 6
            if (Engine.Core.justPressed(Engine.Core.Action.Right)) {
                if (this.cursorIndex < 5) {
                    this.cursorIndex++;
                } else {
                    this.cursorIndex = 6;
                }
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Left)) {
                if (this.cursorIndex === 6) {
                    this.cursorIndex = 5;
                } else if (this.cursorIndex > 0) {
                    this.cursorIndex--;
                }
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                if (this.cursorIndex < 4) {
                    this.cursorIndex += 2;
                } else if (this.cursorIndex < 6) {
                    this.cursorIndex = 6;
                }
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                if (this.cursorIndex === 6) {
                    this.cursorIndex = 5;
                } else if (this.cursorIndex >= 2) {
                    this.cursorIndex -= 2;
                }
            }

            if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                music.pewPew.play();
                if (this.cursorIndex === 0) {
                    this.recipe.bean = Engine.Entities.BeanType.Mantiqueira;
                } else if (this.cursorIndex === 1) {
                    this.recipe.bean = Engine.Entities.BeanType.Colombia;
                } else if (this.cursorIndex === 2 && this.recipe.bean !== Engine.Entities.BeanType.None) {
                    this.recipe.method = Engine.Entities.BrewMethod.Espresso;
                } else if (this.cursorIndex === 3 && this.recipe.bean !== Engine.Entities.BeanType.None) {
                    this.recipe.method = Engine.Entities.BrewMethod.V60;
                } else if (this.cursorIndex === 4 && this.recipe.method !== Engine.Entities.BrewMethod.None) {
                    this.recipe.addAddin(Engine.Entities.AddinType.Milk);
                } else if (this.cursorIndex === 5 && this.recipe.method !== Engine.Entities.BrewMethod.None) {
                    this.recipe.addAddin(Engine.Entities.AddinType.Honey);
                } else if (this.cursorIndex === 6) {
                    SceneStack.pop();
                    this.onComplete(this.recipe);
                }
            }

            if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
                SceneStack.pop();
            }
        }
    }
}

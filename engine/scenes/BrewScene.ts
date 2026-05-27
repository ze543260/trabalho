namespace Engine.Scenes {
    export class BrewScene implements Scene {
        private onComplete: (recipe: Engine.Entities.DrinkRecipe) => void;
        private recipe: Engine.Entities.DrinkRecipe;
        private cursorIndex: number;

        // Grid 3x2 + botão SERVIR (índice 6)
        // [ 0:ManBag ] [ 1:ColBag  ] [ 2:Espresso ]
        // [ 3:V60    ] [ 4:Leite   ] [ 5:Mel      ]
        //                              [ 6:SERVIR  ]

        // Posições centrais dos slots no ecrã 160x120
        // Painel esq. para a grelha: x 10..90
        // Painel dir. para a receita: x 96..158
        private readonly SLOTS: {x: number, y: number, label: string, icon: Image}[] = [];

        constructor(onComplete: (recipe: Engine.Entities.DrinkRecipe) => void) {
            this.onComplete = onComplete;
            this.recipe = new Engine.Entities.DrinkRecipe();
            this.cursorIndex = 0;
        }

        private getSlots(): {x: number, y: number, label: string, icon: Image}[] {
            return [
                { x: 20, y: 44, label: "Mantiqueira",  icon: Assets.iconMantiqueira },
                { x: 52, y: 44, label: "Colombia",     icon: Assets.iconColombia    },
                { x: 84, y: 44, label: "Espresso",     icon: Assets.iconEspresso    },
                { x: 20, y: 82, label: "V60",          icon: Assets.iconV60         },
                { x: 52, y: 82, label: "Leite",        icon: Assets.iconMilk        },
                { x: 84, y: 82, label: "Mel",          icon: Assets.iconHoney       },
            ];
        }

        public enter(): void {
            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;
                this.drawScene();
            });
        }

        private drawScene(): void {
            // --- Fundo ---
            screen.fillRect(0, 0, screen.width, screen.height, 15);      // preto geral

            // Painel esquerdo (bancada, madeira)
            screen.fillRect(0, 0, 104, screen.height, 11);               // azul noite
            screen.fillRect(0, 0, 104, 16, 15);                          // header preto

            // Separador vertical
            screen.fillRect(104, 0, 2, screen.height, 12);

            // --- Cabeçalho ---
            screen.print("PREPARO", 24, 5, 6, image.font5);

            // --- Slots dos itens ---
            let slots = this.getSlots();
            for (let i = 0; i < slots.length; i++) {
                let s = slots[i];
                let sel = this.cursorIndex === i;
                let cx = s.x - 8;
                let cy = s.y - 8;

                // Fundo do card
                screen.fillRect(cx - 1, cy - 1, 18, 18, sel ? 6 : 13);
                // Ícone real 16x16
                screen.drawTransparentImage(s.icon, cx, cy);
                // Borda seleção
                if (sel) {
                    screen.drawRect(cx - 2, cy - 2, 20, 20, 5);
                }
                // Label curta abaixo
                let shortLabel = s.label.substr(0, 3);
                screen.print(shortLabel, cx + 2, cy + 18, sel ? 5 : 12, image.font5);
            }

            // --- Botão SERVIR ---
            let servSel = this.cursorIndex === 6;
            screen.fillRect(57, 103, 42, 14, servSel ? 5 : 13);
            screen.drawRect(57, 103, 42, 14, servSel ? 15 : 12);
            screen.print("SERVIR", 61, 107, servSel ? 15 : 12, image.font5);

            // --- Painel Direito: Receita em construção ---
            screen.print("RECEITA", 108, 5, 12, image.font5);
            screen.drawLine(106, 13, 158, 13, 13);

            let ry = 18;
            // Grão
            if (this.recipe.bean !== Engine.Entities.BeanType.None) {
                let bIcon = this.recipe.bean === Engine.Entities.BeanType.Mantiqueira
                    ? Assets.iconMantiqueira : Assets.iconColombia;
                screen.drawTransparentImage(bIcon, 108, ry);
                let bLabel = this.recipe.bean === Engine.Entities.BeanType.Mantiqueira ? "Man." : "Col.";
                screen.print(bLabel, 126, ry + 4, 5, image.font5);
                ry += 22;
            } else {
                screen.print("? grao", 108, ry, 13, image.font5);
                ry += 10;
            }

            // Método
            if (this.recipe.method !== Engine.Entities.BrewMethod.None) {
                let mIcon = this.recipe.method === Engine.Entities.BrewMethod.Espresso
                    ? Assets.iconEspresso : Assets.iconV60;
                screen.drawTransparentImage(mIcon, 108, ry);
                let mLabel = this.recipe.method === Engine.Entities.BrewMethod.Espresso ? "Esp." : "V60";
                screen.print(mLabel, 126, ry + 4, 6, image.font5);
                ry += 22;
            } else {
                screen.print("? metodo", 108, ry, 13, image.font5);
                ry += 10;
            }

            // Extras
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Milk) >= 0) {
                screen.drawTransparentImage(Assets.iconMilk, 108, ry);
                screen.print("+Leite", 126, ry + 4, 1, image.font5);
                ry += 20;
            }
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Honey) >= 0) {
                screen.drawTransparentImage(Assets.iconHoney, 108, ry);
                screen.print("+Mel", 126, ry + 4, 5, image.font5);
            }
        }

        public exit(): void {}
        public pause(): void {}
        public resume(): void {}

        public update(dt: number): void {
            // Navegação: grid 3 colunas (0..5) + SERVIR (6)
            if (Engine.Core.justPressed(Engine.Core.Action.Right)) {
                if (this.cursorIndex < 5) this.cursorIndex++;
                else this.cursorIndex = 6;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Left)) {
                if (this.cursorIndex === 6) this.cursorIndex = 5;
                else if (this.cursorIndex > 0) this.cursorIndex--;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                if (this.cursorIndex < 3) this.cursorIndex += 3;
                else this.cursorIndex = 6;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                if (this.cursorIndex === 6) this.cursorIndex = 5;
                else if (this.cursorIndex >= 3) this.cursorIndex -= 3;
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

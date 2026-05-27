namespace Engine.Scenes {
    enum BrewState {
        Selecting,
        QTEExtraction,
        QTEFoaming,
        Complete,
    }

    export class BrewScene implements Scene {
        private onComplete: (recipe: Engine.Entities.DrinkRecipe) => void;
        private recipe: Engine.Entities.DrinkRecipe;
        private cursorIndex: number;
        // índices: 0=Mantiqueira 1=Colombia 2=Espresso 3=V60 4=Leite 5=Mel 6=SERVIR
        private brewState: BrewState;
        private qteController: Engine.Minigames.QTEController;
        private extractionScore: number;
        private foamingScore: number;
        private brewResult: Engine.Entities.BrewResult | null;

        constructor(onComplete: (recipe: Engine.Entities.DrinkRecipe) => void) {
            this.onComplete = onComplete;
            this.recipe = new Engine.Entities.DrinkRecipe();
            this.cursorIndex = 0;
            this.brewState = BrewState.Selecting;
            this.qteController = new Engine.Minigames.QTEController();
            this.extractionScore = 0;
            this.foamingScore = 0;
            this.brewResult = null;

            // Initialize QTE events for extraction and foaming
            this.qteController.addEvent(new Engine.Minigames.QTEEvent(50, 2000, 10)); // 2s extraction
            this.qteController.addEvent(new Engine.Minigames.QTEEvent(70, 1500, 8));  // 1.5s foaming
        }

        public enter(): void {
            // Fade music when brewing starts
            music.stopAllSounds();

            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;
                this.drawScene();
            });
        }

        private drawScene(): void {
            // ─── FUNDO (balcão lofi noturno) ───────────────────────────────
            screen.fill(10);                             // preto-azulado fundo
            screen.fillRect(0, 0, 160, 11, 1);           // header preto
            screen.fillRect(0, 100, 160, 20, 10);        // rodapé selector
            screen.fillRect(0, 99, 160, 2, 1);           // separador selector
            screen.fillRect(0, 11, 96, 89, 9);           // painel esq (balcão)
            screen.fillRect(98, 11, 62, 89, 10);         // painel dir (receita)
            screen.fillRect(96, 11, 2, 89, 1);           // divisor vertical

            // Efeito de lamparina (glow circular no centro esq)
            screen.fillRect(16, 20, 64, 64, 9);          // área da máquina

            // ─── TÍTULO ────────────────────────────────────────────────────
            screen.print("BANCADA DE PREPARO", 10, 3, 5, image.font5);

            // ─── MÁQUINA CENTRAL (64x64) ───────────────────────────────────
            let machine = this.getCurrentMachineImg();
            if (machine !== null) {
                screen.drawTransparentImage(machine, 16, 20);
            }

            // Nome do item selecionado abaixo da máquina
            let labels = ["Grao Mantiqueira", "Grao Colombia", "Espresso", "V60", "Leite", "Mel", "SERVIR!"];
            screen.print(labels[this.cursorIndex], 10, 89, 14, image.font5);

            // ─── PAINEL DA RECEITA (lado direito) ──────────────────────────
            screen.print("PEDIDO:", 100, 14, 12, image.font5);
            screen.drawLine(98, 22, 160, 22, 8);

            let ry = 25;
            // Grão
            if (this.recipe.bean !== Engine.Entities.BeanType.None) {
                let bStr = this.recipe.bean === Engine.Entities.BeanType.Mantiqueira ? "Mantiqueira" : "Colombia";
                screen.print("Grao:", 100, ry, 5, image.font5);
                screen.print(bStr, 100, ry + 7, 14, image.font5);
                ry += 18;
            } else {
                screen.print("Grao: ?", 100, ry, 8, image.font5);
                ry += 12;
            }

            // Método
            if (this.recipe.method !== Engine.Entities.BrewMethod.None) {
                let mStr = "";
                if (this.recipe.method === Engine.Entities.BrewMethod.Espresso) mStr = "Espresso";
                else if (this.recipe.method === Engine.Entities.BrewMethod.V60) mStr = "V60";
                else mStr = "Capsula";
                screen.print("Metodo:", 100, ry, 5, image.font5);
                screen.print(mStr, 100, ry + 7, 6, image.font5);
                ry += 18;
            } else {
                screen.print("Metodo: ?", 100, ry, 8, image.font5);
                ry += 12;
            }

            // Extras
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Milk) >= 0) {
                screen.print("+ Leite", 100, ry, 7, image.font5);
                ry += 10;
            }
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Honey) >= 0) {
                screen.print("+ Mel", 100, ry, 14, image.font5);
                ry += 10;
            }

            // Dica de controles
            screen.print("A=add B=back", 100, 90, 8, image.font5);

            // ─── TRILHO DE SELEÇÃO (rodapé) ────────────────────────────────
            // 7 slots de 20px cada, centrados em 140px (0..139)
            let slotW = 20;
            let slotNames = ["MAN", "COL", "ESP", "V60", "LEI", "MEL", "OK"];
            let slotColors = [14, 3, 9, 13, 7, 14, 12];

            for (let i = 0; i < 7; i++) {
                let sx = 4 + i * slotW;
                let sy = 102;
                let isSel = this.cursorIndex === i;

                // Fundo do card
                screen.fillRect(sx, sy, 18, 15, isSel ? 8 : 10);
                screen.drawRect(sx, sy, 18, 15, isSel ? 5 : 8);

                // Cor do ícone/texto
                screen.print(slotNames[i], sx + 1, sy + 5, slotColors[i], image.font5);

                // Seta de seleção acima
                if (isSel) {
                    screen.setPixel(sx + 8, sy - 2, 5);
                    screen.setPixel(sx + 9, sy - 2, 5);
                    screen.setPixel(sx + 8, sy - 1, 5);
                    screen.setPixel(sx + 9, sy - 1, 5);
                }
            }

            // ─── QTE DISPLAY (if in QTE phase) ────────────────────────────
            if (this.brewState === BrewState.QTEExtraction || this.brewState === BrewState.QTEFoaming) {
                let qte = this.qteController.getCurrentEvent();
                if (qte) {
                    // Draw meter background
                    screen.fillRect(20, 45, 120, 15, 1);
                    screen.drawRect(20, 45, 120, 15, 0);

                    // Draw target zone (green)
                    let targetX = 20 + (qte.targetPosition * 120) / 100;
                    screen.fillRect(targetX - qte.successWindow, 45, qte.successWindow * 2, 15, 11);

                    // Draw needle
                    let needleX = 20 + (this.qteController.getNeedlePosition() * 120) / 100;
                    screen.fillRect(needleX - 2, 40, 4, 25, 14);

                    // Draw phase label
                    let phaseLabel = this.brewState === BrewState.QTEExtraction ? "EXTRACAO" : "ESPUMA";
                    screen.print(phaseLabel, 10, 30, 5, image.font5);

                    // Draw progress bar
                    let progress = Math.floor(qte.getProgress() * 100);
                    screen.print("Progress: " + progress + "%", 10, 62, 8, image.font5);
                }
            }

            // ─── RESULT DISPLAY (after QTE complete) ────────────────────────
            if (this.brewState === BrewState.Complete && this.brewResult) {
                screen.fillRect(30, 35, 100, 50, 1);
                screen.drawRect(30, 35, 100, 50, 0);

                let qualityStr = this.brewResult.getQualityString();
                let qualityColor = this.brewResult.getQualityColor();
                let scoreStr = "Score: " + this.brewResult.totalScore;

                screen.print(qualityStr, 50, 45, qualityColor, image.font5);
                screen.print(scoreStr, 45, 60, 5, image.font5);
                screen.print("A = continuar", 35, 75, 8, image.font5);
            }
        }

        // Retorna a imagem 64x64 do item focado
        private getCurrentMachineImg(): Image {
            if (this.cursorIndex === 0 || this.cursorIndex === 1) {
                // Para grãos, mostrar o V60 como contexto de torra
                return Assets.machineV60_64;
            } else if (this.cursorIndex === 2) {
                return Assets.machineEspresso64;
            } else if (this.cursorIndex === 3) {
                return Assets.machineV60_64;
            } else if (this.cursorIndex === 4) {
                return Assets.machineMilk64;
            } else if (this.cursorIndex === 5) {
                return Assets.machineHoney64;
            } else {
                return Assets.machineEspresso64;
            }
        }

        public exit(): void {
            // Music will resume when returning to CafeScene
        }
        public pause(): void {}
        public resume(): void {}

        public update(dt: number): void {
            if (this.brewState === BrewState.Selecting) {
                // Original selection logic
                if (Engine.Core.justPressed(Engine.Core.Action.Right)) {
                    this.cursorIndex = (this.cursorIndex + 1) % 7;
                }
                if (Engine.Core.justPressed(Engine.Core.Action.Left)) {
                    this.cursorIndex = (this.cursorIndex + 6) % 7;
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
                        // Start QTE extraction phase
                        this.brewState = BrewState.QTEExtraction;
                    }
                }

                if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
                    SceneStack.pop();
                }
            } else if (this.brewState === BrewState.QTEExtraction) {
                this.qteController.update(dt);
                if (this.qteController.isComplete()) {
                    this.extractionScore = this.qteController.getScore();
                    // Reset for foaming phase
                    this.qteController = new Engine.Minigames.QTEController();
                    this.qteController.addEvent(new Engine.Minigames.QTEEvent(70, 1500, 8));
                    this.brewState = BrewState.QTEFoaming;
                }
            } else if (this.brewState === BrewState.QTEFoaming) {
                this.qteController.update(dt);
                if (this.qteController.isComplete()) {
                    this.foamingScore = this.qteController.getScore();
                    this.brewState = BrewState.Complete;
                }
            } else if (this.brewState === BrewState.Complete) {
                if (!this.brewResult) {
                    this.brewResult = new Engine.Entities.BrewResult(this.recipe, this.extractionScore, this.foamingScore);
                }

                if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                    Engine.Scenes.SceneStack.pop();
                    if (this.onComplete) {
                        this.onComplete(this.recipe);
                    }
                }
            }
        }
    }
}

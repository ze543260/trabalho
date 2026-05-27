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
            // ─── FUNDO (Cafeteria) ─────────────────────────────────────────
            // Desenha um ambiente de cafeteria escurecido manualmente
            screen.fill(13); // Fundo base roxo/escuro
            screen.fillRect(0, 80, 160, 40, 4); // Balcão em tom terroso
            screen.fillRect(20, 20, 50, 40, 14); // Reflexo da janela em laranja/amarelo
            screen.drawRect(19, 19, 52, 42, 5); // Moldura da janela

            // Overlay escuro/dither para destacar a máquina e UI
            // Como MakeCode não tem alpha global fácil, desenhamos linhas horizontais espaçadas para um efeito Lofi scanline escurecido
            for (let i = 0; i < 120; i += 2) {
                screen.drawLine(0, i, 160, i, 10);
            }

            // Cabeçalho leve
            screen.fillRect(0, 0, 160, 12, 10); 
            screen.drawLine(0, 12, 160, 12, 9); 

            // ─── TÍTULO ────────────────────────────────────────────────────
            screen.print(" PREPARO ", 50, 3, 6, image.font5); // Cream text

            // ─── MÁQUINA CENTRAL (64x64) ───────────────────────────────────
            let machine = this.getCurrentMachineImg();
            if (machine !== null) {
                // Sombra da máquina
                screen.fillRect(14, 82, 68, 6, 9);
                screen.drawTransparentImage(machine, 16, 20);
            }

            // Nome do item selecionado abaixo da máquina
            let labels = ["Grao Mantiqueira", "Grao Colombia", "Espresso", "V60", "Leite", "Mel", "SERVIR!"];
            let lbl = labels[this.cursorIndex];
            screen.print(lbl, 50 - (lbl.length * 4) / 2, 90, 5, image.font5); 

            // ─── PAINEL DA RECEITA (lado direito flutuante) ────────────────
            screen.print("PEDIDO", 104, 18, 14, image.font5); // Gold
            screen.drawLine(104, 26, 144, 26, 8);

            let ry = 30;
            // Grão
            if (this.recipe.bean !== Engine.Entities.BeanType.None) {
                let bStr = this.recipe.bean === Engine.Entities.BeanType.Mantiqueira ? "Mantique." : "Colombia";
                screen.print("Grao:", 104, ry, 5, image.font5); // Peach
                screen.print(bStr, 104, ry + 8, 6, image.font5); // Cream
                ry += 18;
            } else {
                screen.print("Grao:", 104, ry, 5, image.font5);
                screen.print("?", 104, ry + 8, 8, image.font5); // Slate
                ry += 18;
            }

            // Método
            if (this.recipe.method !== Engine.Entities.BrewMethod.None) {
                let mStr = "";
                if (this.recipe.method === Engine.Entities.BrewMethod.Espresso) mStr = "Espresso";
                else if (this.recipe.method === Engine.Entities.BrewMethod.V60) mStr = "V60";
                else mStr = "Capsula";
                screen.print("Metodo:", 104, ry, 5, image.font5);
                screen.print(mStr, 104, ry + 8, 6, image.font5);
                ry += 18;
            } else {
                screen.print("Metodo:", 104, ry, 5, image.font5);
                screen.print("?", 104, ry + 8, 8, image.font5);
                ry += 18;
            }

            // Extras
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Milk) >= 0) {
                screen.print("+ Leite", 104, ry, 6, image.font5);
                ry += 8;
            }
            if (this.recipe.addins.indexOf(Engine.Entities.AddinType.Honey) >= 0) {
                screen.print("+ Mel", 104, ry, 14, image.font5);
                ry += 8;
            }

            // Dica de controles
            screen.print("A=add", 100, 88, 8, image.font5);

            // ─── TRILHO DE SELEÇÃO (rodapé minimalista) ───────────────────
            // Fundo suave para os ícones
            screen.fillRect(0, 100, 160, 20, 10);
            screen.drawLine(0, 100, 160, 100, 9);

            let slotW = 22;
            let slotNames = ["MAN", "COL", "ESP", "V60", "LEI", "MEL", "OK"];
            let slotColors = [14, 14, 9, 13, 6, 14, 12];
            
            for (let i = 0; i < 7; i++) {
                let sx = 4 + i * slotW;
                let sy = 104;
                let isSel = this.cursorIndex === i;

                if (isSel) {
                    // Destaque limpo sob o texto
                    screen.fillRect(sx, sy, 20, 12, 1);
                }

                // Cor do ícone/texto
                let txtColor = isSel ? 6 : slotColors[i];
                screen.print(slotNames[i], sx + 4, sy + 3, txtColor, image.font5);

                // Linha fina acima para mostrar foco
                if (isSel) {
                    screen.drawLine(sx, sy - 4, sx + 20, sy - 4, 5);
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

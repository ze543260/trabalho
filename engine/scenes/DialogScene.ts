namespace Engine.Scenes {
    export class DialogScene implements Scene {
        private portrait: Image;
        private lines: string[];
        private currentLineIndex: number;
        private displayedText: string;
        private targetText: string;
        private ticks: number;
        private onComplete: () => void;
        private bgOverlay: boolean;
        private renderable: scene.Renderable; // Reference to destroy later

        constructor(portrait: Image, lines: string[], onComplete: () => void) {
            this.portrait = portrait;
            this.lines = lines;
            this.onComplete = onComplete;
            this.currentLineIndex = 0;
            this.displayedText = "";
            this.targetText = lines.length > 0 ? lines[0] : "";
            this.ticks = 0;
            this.bgOverlay = true;
        }

        public enter(): void {
            // Cria um renderizável de alto nível (z=100) para cobrir todos os sprites
            this.renderable = scene.createRenderable(100, (target: Image, camera: scene.Camera) => {
                if (SceneStack.top() !== (this as any)) return;

                // Fundo semi-translúcido (pontilhado) opcional para escurecer o fundo
                // Como não podemos desenhar com alpha perfeitamente, desenharemos um padrão ou deixaremos normal
                
                // Caixa de diálogo (embaixo)
                screen.fillRect(4, 76, screen.width - 8, 40, 1);  // Borda branca
                screen.fillRect(5, 77, screen.width - 10, 38, 15); // Fundo preto

                // Renderiza o Portrait no canto superior esquerdo (ou direito)
                if (this.portrait) {
                    // O retrato tem 48x48
                    screen.drawTransparentImage(this.portrait, screen.width - 52, 26);
                }

                // Renderiza o texto com wrap manual
                let yOff = 82;
                let currentLineStr = "";
                let words = this.displayedText.split(" ");
                let lineLength = 0;
                
                for (let w of words) {
                    if (lineLength + w.length > 25) {
                        screen.print(currentLineStr, 8, yOff, 6); // Cor creme
                        yOff += 10;
                        currentLineStr = w + " ";
                        lineLength = w.length + 1;
                    } else {
                        currentLineStr += w + " ";
                        lineLength += w.length + 1;
                    }
                }
                screen.print(currentLineStr, 8, yOff, 6);

                // Triângulo piscando para indicar continuação
                if (this.displayedText.length === this.targetText.length) {
                    if (Math.floor(game.runtime() / 300) % 2 === 0) {
                        screen.print("V", screen.width - 14, 104, 7);
                    }
                }
            });
        }

        public exit(): void {
            if (this.renderable) {
                this.renderable.destroy();
            }
        }

        public update(dt: number): void {
            this.ticks++;
            
            // Efeito de máquina de escrever
            if (this.displayedText.length < this.targetText.length) {
                // A cada 2 ticks, adiciona uma letra
                this.displayedText = this.targetText.substr(0, this.displayedText.length + 1);
                
                // Som do bleep do diálogo
                if (this.displayedText.length % 3 === 0) {
                    let lastChar = this.displayedText.charAt(this.displayedText.length - 1);
                    if (lastChar !== ' ') {
                        music.playTone(330, 10);
                    }
                }
            }

            // Controle
            if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                if (this.displayedText.length < this.targetText.length) {
                    // Pula para o final do texto se apertar antes de terminar
                    this.displayedText = this.targetText;
                } else {
                    // Próxima linha
                    this.currentLineIndex++;
                    if (this.currentLineIndex < this.lines.length) {
                        this.targetText = this.lines[this.currentLineIndex];
                        this.displayedText = "";
                    } else {
                        // Fecha o diálogo
                        Engine.Scenes.SceneStack.pop();
                        if (this.onComplete) {
                            this.onComplete();
                        }
                    }
                }
            }
        }

        public pause(): void {
        }

        public resume(): void {
        }
    }
}

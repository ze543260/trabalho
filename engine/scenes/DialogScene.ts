namespace Engine.Scenes {
    export class DialogScene implements Scene {
        private portrait: Image;
        private lines: string[];
        private currentLineIndex: number;
        private displayedText: string;
        private targetText: string;
        private ticks: number;
        private onComplete: () => void;
        private bgCache: Image;
        private renderable: scene.Renderable;

        constructor(portrait: Image, lines: string[], onComplete: () => void) {
            this.portrait = portrait;
            this.lines = lines;
            this.onComplete = onComplete;
            this.currentLineIndex = 0;
            this.displayedText = "";
            this.targetText = lines.length > 0 ? lines[0] : "";
            this.ticks = 0;
            this.bgCache = null;
        }

        // Desenha a cena de fundo do café (lofi, noturno, atmosférico)
        private buildBackground(): Image {
            let bg = image.create(160, 120);

            // ── CÉU / PAREDE DO FUNDO ──────────────────────────────────────
            bg.fill(10); // azul-marinho muito escuro

            // Tijolo da parede (fileiras alternadas)
            for (let row = 0; row < 5; row++) {
                let offset = (row % 2 === 0) ? 0 : 10;
                for (let col = 0; col < 10; col++) {
                    bg.fillRect(col * 20 + offset - 10, 4 + row * 12, 18, 10, 1);
                    bg.drawRect(col * 20 + offset - 10, 4 + row * 12, 18, 10, 0);
                }
            }

            // ── JANELA (visão da rua com chuva) ────────────────────────────
            // Frame externo da janela
            bg.fillRect(6, 6, 60, 50, 9);
            bg.drawRect(6, 6, 60, 50, 14);
            bg.drawRect(7, 7, 58, 48, 14);
            // Vidro (interior noturno azul-escuro)
            bg.fillRect(8, 8, 56, 46, 10);
            // Reflexo de luz no vidro
            bg.fillRect(9, 9, 20, 8, 9);
            bg.fillRect(10, 10, 18, 6, 8);
            // Cruz da janela (caixilho)
            bg.fillRect(36, 8, 3, 46, 9);
            bg.fillRect(8, 30, 56, 3, 9);
            // Luz da rua lá fora (laranja amarelada distante)
            bg.fillRect(12, 12, 22, 16, 1);
            bg.fillRect(14, 14, 18, 12, 10);
            bg.setPixel(20, 16, 14); bg.setPixel(24, 18, 14);
            bg.setPixel(18, 20, 14); bg.setPixel(26, 16, 14);
            // Prédios ao fundo (silhueta)
            bg.fillRect(10, 34, 10, 12, 10);
            bg.fillRect(12, 32, 6, 14, 10);
            bg.fillRect(42, 36, 8, 10, 10);
            bg.fillRect(44, 34, 4, 12, 10);
            // Gotas de chuva no vidro
            bg.drawLine(15, 12, 13, 22, 8);
            bg.drawLine(22, 10, 20, 20, 8);
            bg.drawLine(28, 14, 26, 24, 8);
            bg.drawLine(50, 10, 48, 22, 8);
            bg.drawLine(56, 16, 54, 26, 8);
            bg.drawLine(16, 34, 14, 44, 8);
            bg.drawLine(44, 32, 42, 42, 8);
            bg.drawLine(58, 34, 56, 44, 8);

            // ── PRATELEIRA COM ITENS ────────────────────────────────────────
            // Prateleira 1 (parede direita)
            bg.fillRect(80, 8, 76, 6, 15);
            bg.drawRect(80, 8, 76, 6, 0);
            bg.fillRect(81, 9, 74, 3, 14);
            // Potes na prateleira
            bg.fillRect(82, 0, 8, 10, 3);   bg.drawRect(82, 0, 8, 10, 0); // pote verm
            bg.fillRect(92, 2, 6, 8, 12);   bg.drawRect(92, 2, 6, 8, 0);  // pote verde
            bg.fillRect(100, 1, 10, 9, 14); bg.drawRect(100, 1, 10, 9, 0); // garrafa
            bg.setPixel(104, 1, 5);
            bg.fillRect(112, 0, 7, 10, 9);  bg.drawRect(112, 0, 7, 10, 0); // caixa
            bg.fillRect(121, 3, 5, 7, 8);   bg.drawRect(121, 3, 5, 7, 0);
            bg.fillRect(128, 2, 8, 8, 2);   bg.drawRect(128, 2, 8, 8, 0); // jarro
            bg.fillRect(138, 1, 9, 9, 15);  bg.drawRect(138, 1, 9, 9, 0);
            bg.setPixel(142, 2, 14); bg.setPixel(143, 3, 14);
            // Prateleira 2
            bg.fillRect(100, 24, 56, 5, 15);
            bg.drawRect(100, 24, 56, 5, 0);
            bg.fillRect(101, 25, 54, 2, 14);
            // Livros na prateleira 2
            bg.fillRect(102, 14, 5, 12, 2); bg.fillRect(108, 16, 4, 10, 9);
            bg.fillRect(113, 15, 6, 11, 3); bg.fillRect(120, 14, 4, 12, 12);
            bg.fillRect(125, 16, 5, 10, 14); bg.fillRect(131, 15, 7, 11, 8);
            bg.fillRect(139, 16, 4, 10, 15); bg.fillRect(144, 14, 8, 12, 1);
            // Pequena lamparina na prateleira 2
            bg.fillRect(151, 18, 6, 8, 14); bg.fillRect(152, 14, 4, 6, 5);
            bg.fillRect(153, 12, 2, 4, 6);  bg.setPixel(154, 11, 5);

            // ── BALCÃO (primeiro plano) ────────────────────────────────────
            // Tampa do balcão (madeira escura polida)
            bg.fillRect(0, 76, 160, 8, 4);
            bg.drawRect(0, 76, 160, 8, 0);
            bg.fillRect(0, 77, 160, 3, 15);
            bg.fillRect(0, 78, 160, 1, 5);
            // Corpo do balcão
            bg.fillRect(0, 83, 160, 37, 3);
            bg.drawLine(0, 83, 160, 83, 0);
            // Painel frontal do balcão
            for (let i = 0; i < 8; i++) {
                bg.fillRect(2 + i * 20, 86, 16, 14, 2);
                bg.drawRect(2 + i * 20, 86, 16, 14, 0);
                bg.fillRect(3 + i * 20, 87, 14, 4, 3);
            }

            // ── LUZ DE LAMPARINA (warm glow no balcão) ─────────────────────
            // Simulação de luz quente sobre o balcão
            bg.fillRect(60, 72, 40, 6, 15);
            bg.fillRect(64, 70, 32, 4, 14);
            bg.fillRect(70, 68, 20, 4, 5);
            bg.fillRect(76, 66, 8, 4, 6);
            bg.setPixel(80, 65, 7);
            // Lamparina pequena no balcão
            bg.fillRect(75, 70, 10, 6, 14);
            bg.fillRect(77, 68, 6, 4, 5);
            bg.fillRect(79, 66, 2, 4, 6);
            bg.setPixel(80, 65, 7);

            return bg;
        }

        public enter(): void {
            // Pré-renderiza o fundo uma única vez
            if (!this.bgCache) {
                this.bgCache = this.buildBackground();
            }

            this.renderable = scene.createRenderable(100, (target: Image, camera: scene.Camera) => {
                if (SceneStack.top() !== (this as any)) return;

                // ── FUNDO DO CAFÉ ──────────────────────────────────────────
                screen.drawTransparentImage(this.bgCache, 0, 0);

                // ── RETRATO (canto superior direito, sobre o fundo) ─────────
                if (this.portrait) {
                    // Moldura escura atrás do retrato
                    screen.fillRect(105, 22, 52, 52, 1);
                    screen.drawRect(104, 21, 54, 54, 14);
                    screen.drawRect(103, 20, 56, 56, 0);
                    screen.drawTransparentImage(this.portrait, 106, 23);
                }

                // ── CAIXA DE DIÁLOGO ────────────────────────────────────────
                // Fundo da caixa (madeira escura, igual ao balcão)
                screen.fillRect(2, 78, 156, 40, 1);
                screen.drawRect(1, 77, 158, 42, 14);
                screen.drawRect(2, 78, 156, 40, 0);
                // Faixa de título (terracota)
                screen.fillRect(3, 79, 154, 8, 15);
                screen.drawLine(3, 86, 156, 86, 0);
                // Texto no fundo caixa
                screen.fillRect(3, 87, 154, 30, 3);

                // ── TEXTO COM TYPEWRITER ────────────────────────────────────
                let yOff = 91;
                let currentLineStr = "";
                let words = this.displayedText.split(" ");
                let lineLength = 0;

                for (let w of words) {
                    if (lineLength + w.length > 26) {
                        screen.print(currentLineStr, 7, yOff, 5, image.font5);
                        yOff += 9;
                        currentLineStr = w + " ";
                        lineLength = w.length + 1;
                    } else {
                        currentLineStr += w + " ";
                        lineLength += w.length + 1;
                    }
                }
                if (currentLineStr.length > 0) {
                    screen.print(currentLineStr, 7, yOff, 5, image.font5);
                }

                // ── CURSOR PISCANTE ─────────────────────────────────────────
                if (this.displayedText.length === this.targetText.length) {
                    if (Math.floor(game.runtime() / 400) % 2 === 0) {
                        screen.fillRect(146, 110, 8, 6, 14);
                        screen.print("v", 148, 110, 1, image.font5);
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
            if (this.displayedText.length < this.targetText.length) {
                this.displayedText = this.targetText.substr(0, this.displayedText.length + 1);
                if (this.displayedText.length % 3 === 0) {
                    let lastChar = this.displayedText.charAt(this.displayedText.length - 1);
                    if (lastChar !== " ") {
                        music.playTone(330, 10);
                    }
                }
            }

            if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                if (this.displayedText.length < this.targetText.length) {
                    this.displayedText = this.targetText;
                } else {
                    this.currentLineIndex++;
                    if (this.currentLineIndex < this.lines.length) {
                        this.targetText = this.lines[this.currentLineIndex];
                        this.displayedText = "";
                    } else {
                        Engine.Scenes.SceneStack.pop();
                        if (this.onComplete) {
                            this.onComplete();
                        }
                    }
                }
            }
        }

        public pause(): void {}
        public resume(): void {}
    }
}

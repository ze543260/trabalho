namespace Engine.Scenes {
    export class DialogScene implements Scene {
        private character: Engine.Entities.Character;
        private portrait: Image;
        private lines: string[];
        private currentLineIndex: number;
        private displayedText: string;
        private targetText: string;
        private ticks: number;
        private onComplete: () => void;
        private bgCache: Image;
        private renderable: scene.Renderable;
        // Expression can change based on dialog progress
        // -1 = no change, 0 = happy, 1 = sad, 2 = thoughtful
        private nextExpressionIndex: number = -1;

        constructor(character: Engine.Entities.Character, lines: string[], onComplete: () => void) {
            this.character = character;
            this.portrait = character.getPortraitImage();
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

            // ── BASE: parede de fundo (escuro profundo) ─────────────────────
            bg.fill(1); // marrom-escuro como base das frestas de tijolo

            // ── TIJOLOS com variação de tom e profundidade ──────────────────
            // Cor base dos tijolos: alterna entre 1 (marrom muito escuro) e 2 (vinho)
            // com bordas iluminadas no topo para simular relevo
            let brickColors = [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2];
            for (let row = 0; row < 7; row++) {
                let offset = (row % 2 === 0) ? 0 : 11;
                for (let col = -1; col < 9; col++) {
                    let bx = col * 22 + offset;
                    let by = row * 11;
                    let bColor = brickColors[(col + row * 2 + 12) % brickColors.length];
                    // Corpo do tijolo
                    bg.fillRect(bx, by, 20, 9, bColor);
                    // Topo iluminado (luz vinda de cima/frente)
                    bg.drawLine(bx, by, bx + 19, by, 3);
                    // Lado esquerdo levemente iluminado
                    bg.drawLine(bx, by, bx, by + 8, 3);
                    // Base em sombra
                    bg.drawLine(bx, by + 9, bx + 20, by + 9, 0);
                    // Fissuras ocasionais no tijolo
                    if ((col + row) % 5 === 0) {
                        bg.drawLine(bx + 5, by + 3, bx + 8, by + 7, 0);
                    }
                    if ((col * 3 + row) % 7 === 0) {
                        bg.drawLine(bx + 12, by + 1, bx + 15, by + 4, 0);
                    }
                }
            }

            // ── JANELA ──────────────────────────────────────────────────────
            // Caixilho externo (madeira velha)
            bg.fillRect(4, 4, 66, 56, 4);
            bg.drawRect(4, 4, 66, 56, 0);
            // Profundidade da moldura (chanfro interno)
            bg.fillRect(6, 6, 62, 52, 15);
            bg.drawRect(6, 6, 62, 52, 14);
            // Vidro (noite chuvosa, azul muito escuro)
            bg.fillRect(8, 8, 58, 48, 10);

            // Caixilho central da janela (T invertido)
            bg.fillRect(37, 8, 4, 48, 4); bg.drawRect(37, 8, 4, 48, 0);
            bg.fillRect(8, 30, 58, 4, 4); bg.drawRect(8, 30, 58, 4, 0);

            // Interior dos 4 vidros (névoa + chuva diferenciada por painel)
            // Painel superior-esquerdo: prédios distantes + halo de poste
            bg.fillRect(9, 9, 27, 20, 10);
            // Halo do poste de luz (laranja âmbar)
            bg.fillCircle(18, 16, 6, 1);
            bg.fillCircle(18, 16, 4, 10);
            bg.setPixel(18, 16, 14); bg.setPixel(19, 16, 14); bg.setPixel(18, 17, 14);
            // Silhueta de prédios
            bg.fillRect(9, 20, 5, 10, 1);
            bg.fillRect(15, 18, 4, 12, 1);
            bg.fillRect(20, 22, 6, 8, 1);
            bg.fillRect(27, 19, 8, 11, 1);
            // Janelas iluminadas nos prédios
            bg.setPixel(10, 22, 14); bg.setPixel(12, 22, 14);
            bg.setPixel(16, 20, 14); bg.setPixel(18, 22, 14);
            bg.setPixel(28, 21, 14); bg.setPixel(30, 23, 14);

            // Painel superior-direito: mais névoa, céu
            bg.fillRect(42, 9, 23, 20, 9);
            // Névoa (pixels claros espalhados)
            bg.setPixel(44, 11, 10); bg.setPixel(48, 12, 10); bg.setPixel(52, 10, 10);
            bg.setPixel(56, 13, 10); bg.setPixel(60, 11, 10); bg.setPixel(63, 14, 10);
            bg.setPixel(46, 15, 1); bg.setPixel(50, 17, 1); bg.setPixel(54, 15, 1);

            // Painel inferior-esquerdo: calçada + reflexo de água
            bg.fillRect(9, 35, 27, 20, 9);
            bg.fillRect(9, 43, 27, 12, 1);  // asfalto molhado
            bg.drawLine(10, 43, 35, 43, 10); // reflexo brilhante
            bg.setPixel(14, 45, 10); bg.setPixel(20, 46, 10); bg.setPixel(26, 44, 10);
            // Silhueta de calçada e pessoa distante
            bg.fillRect(9, 35, 6, 8, 1);
            bg.setPixel(12, 37, 8); bg.setPixel(12, 38, 8); bg.setPixel(12, 36, 8);

            // Painel inferior-direito: mais asfalto
            bg.fillRect(42, 35, 23, 20, 9);
            bg.fillRect(42, 45, 23, 10, 1);
            bg.drawLine(42, 45, 64, 45, 10);

            // Gotas de chuva nos 4 painéis (anguladas pelo vento)
            let rainDrops = [
                [12, 10, 10, 18], [16, 9, 14, 17], [22, 11, 20, 19], [26, 9, 24, 17],
                [44, 10, 42, 18], [49, 12, 47, 20], [55, 9, 53, 17], [62, 11, 60, 19],
                [11, 34, 9, 42], [18, 32, 16, 40], [24, 36, 22, 44], [31, 33, 29, 41],
                [43, 34, 41, 42], [48, 36, 46, 44], [57, 33, 55, 41], [63, 35, 61, 43]
            ];
            for (let d of rainDrops) {
                bg.drawLine(d[0], d[1], d[2], d[3], 8);
                // Pingos mais finos: pixels alternados
                bg.setPixel(d[0] + 1, d[1] + 2, 9);
                bg.setPixel(d[2] - 1, d[3] - 2, 9);
            }

            // Reflexo/condensação no vidro (interior quente vs exterior frio)
            bg.fillRect(9, 25, 27, 4, 9);  bg.fillRect(9, 27, 27, 2, 8);
            bg.fillRect(42, 25, 23, 4, 9); bg.fillRect(42, 27, 23, 2, 8);
            // Vapor no vidro (cantos opacos)
            bg.fillRect(9, 8, 6, 6, 9);
            bg.fillRect(30, 8, 5, 5, 9);
            bg.fillRect(9, 45, 5, 10, 9);
            bg.fillRect(59, 9, 5, 5, 9);

            // Peitoril da janela (madeira clara com profundidade)
            bg.fillRect(4, 58, 66, 6, 4);
            bg.fillRect(4, 59, 66, 3, 15);
            bg.fillRect(5, 60, 64, 1, 5);
            bg.drawRect(4, 58, 66, 6, 0);

            // ── PRATELEIRAS ─────────────────────────────────────────────────
            // Prateleira 1 — topo (profundidade: sombra acima, superfície clara)
            bg.fillRect(74, 8, 84, 5, 14);
            bg.fillRect(74, 8, 84, 2, 5);
            bg.fillRect(74, 10, 84, 1, 15);
            bg.drawRect(74, 8, 84, 5, 0);
            bg.drawLine(74, 13, 158, 13, 1); // sombra projetada

            // Objetos na prateleira 1 com sombras projetadas
            // Jarra de café (vermelho âmbar)
            bg.fillRect(76, 0, 9, 10, 2);  bg.fillRect(77, 1, 7, 5, 3);
            bg.drawRect(76, 0, 9, 10, 0); bg.setPixel(78, 1, 5);
            bg.drawLine(76, 10, 84, 10, 1); // sombra

            // Pote verde (matcha)
            bg.fillRect(87, 2, 7, 8, 11); bg.fillRect(88, 3, 5, 3, 12);
            bg.drawRect(87, 2, 7, 8, 0);  bg.setPixel(89, 3, 13);
            bg.drawLine(87, 10, 93, 10, 1);

            // Garrafa alta (âmbar)
            bg.fillRect(96, 0, 5, 10, 14); bg.fillRect(97, 1, 3, 5, 5);
            bg.fillRect(97, 0, 3, 2, 5);  bg.drawRect(96, 0, 5, 10, 0);
            bg.setPixel(97, 1, 6);        bg.drawLine(96, 10, 100, 10, 1);

            // Caixinha de chá
            bg.fillRect(103, 2, 8, 8, 9); bg.fillRect(104, 3, 6, 3, 8);
            bg.drawRect(103, 2, 8, 8, 0); bg.setPixel(106, 3, 7);
            // Xícara pequena
            bg.fillRect(113, 4, 6, 6, 5); bg.fillRect(114, 5, 4, 3, 6);
            bg.drawRect(113, 4, 6, 6, 0);
            bg.fillRect(119, 5, 2, 4, 5); bg.drawRect(119, 5, 2, 4, 0); // alça

            // Planta pequena
            bg.fillRect(123, 6, 6, 4, 2);  bg.drawRect(123, 6, 6, 4, 0);
            bg.fillRect(124, 2, 2, 6, 11); bg.setPixel(126, 2, 12);
            bg.setPixel(123, 4, 12); bg.setPixel(128, 5, 12);

            // Porta-retratos pequeno
            bg.fillRect(131, 1, 10, 9, 14); bg.drawRect(131, 1, 10, 9, 0);
            bg.fillRect(132, 2, 8, 7, 9);   bg.fillRect(133, 3, 6, 5, 10);
            bg.setPixel(135, 4, 8); bg.setPixel(136, 5, 8);

            // Relógio de parede
            bg.fillRect(143, 0, 12, 12, 5); bg.drawRect(143, 0, 12, 12, 0);
            bg.fillCircle(149, 6, 4, 6);    bg.drawCircle(149, 6, 4, 9);
            bg.drawLine(149, 6, 149, 3, 0); // ponteiro hora
            bg.drawLine(149, 6, 152, 6, 0); // ponteiro min
            bg.drawLine(143, 10, 155, 10, 1); // sombra

            // Prateleira 2 (mais baixa, com livros)
            bg.fillRect(96, 22, 62, 5, 14);
            bg.fillRect(96, 22, 62, 2, 5);
            bg.fillRect(96, 24, 62, 1, 15);
            bg.drawRect(96, 22, 62, 5, 0);
            bg.drawLine(96, 27, 158, 27, 1); // sombra projetada

            // Livros com espessuras e cores variadas
            let books = [
                [98, 14, 5, 12, 3],  [104, 15, 4, 10, 9], [109, 14, 6, 12, 2],
                [116, 15, 5, 10, 11],[122, 14, 7, 12, 14],[130, 16, 4, 10, 8],
                [135, 14, 5, 12, 15],[141, 15, 6, 10, 12],[148, 14, 4, 12, 1],
                [153, 15, 5, 10, 3]
            ];
            for (let b of books) {
                bg.fillRect(b[0], b[1], b[2], b[3], b[4]);
                bg.drawRect(b[0], b[1], b[2], b[3], 0);
                // Lombada mais clara
                bg.setPixel(b[0], b[1] + 1, b[4] === 1 ? 2 : b[4] - 1);
                // Páginas no topo
                bg.fillRect(b[0] + 1, b[1], b[2] - 2, 2, 5);
                // Sombra projetada
                bg.drawLine(b[0], b[1] + b[3], b[0] + b[2], b[1] + b[3], 1);
            }

            // ── LAMPARINA (vela no balcão) com GLOW em 4 camadas ──────────
            // A lamparina fica na parte de baixo, centro da cena
            // Posição: cx=80, cy=69
            // Camada 4: glow mais externo (mais fraco, âmbar muito diluído)
            for (let x = 50; x < 110; x++) {
                for (let y = 58; y < 77; y++) {
                    let dx = x - 80;
                    let dy = y - 68;
                    let dist = dx * dx + dy * dy;
                    if (dist < 900 && dist >= 400) { // anel 20-30px
                        if (bg.getPixel(x, y) !== 0) {
                            // Não sobrescreve outline
                        }
                        bg.setPixel(x, y, 1); // tom levemente mais quente que preto
                    }
                }
            }
            // Camada 3: glow médio (âmbar escuro)
            bg.fillRect(64, 62, 32, 12, 1);
            bg.fillCircle(80, 67, 14, 1);
            // Camada 2: glow interno (âmbar)
            bg.fillCircle(80, 67, 10, 2);
            bg.fillRect(70, 63, 20, 8, 2);
            // Camada 1: centro quente (terracota/dourado)
            bg.fillCircle(80, 67, 6, 15);
            bg.fillCircle(80, 67, 4, 14);
            // Corpo da lamparina
            bg.fillRect(75, 67, 10, 6, 4);  bg.drawRect(75, 67, 10, 6, 0);
            bg.fillRect(76, 68, 8, 3, 15);
            // Prato da lamparina
            bg.fillRect(72, 72, 16, 3, 4);  bg.drawRect(72, 72, 16, 3, 0);
            bg.fillRect(73, 72, 14, 2, 15);
            // Chama
            bg.fillRect(79, 62, 3, 6, 14);
            bg.setPixel(80, 61, 14); bg.setPixel(80, 60, 5); bg.setPixel(80, 59, 6);
            bg.setPixel(80, 62, 5);  bg.setPixel(79, 63, 5); bg.setPixel(81, 63, 14);

            // Reflexo do glow no balcão
            bg.fillRect(66, 76, 28, 2, 2);
            bg.fillRect(70, 77, 20, 1, 1);

            // ── BALCÃO DE MADEIRA COM VEIOS ─────────────────────────────────
            // Tampa do balcão (madeira polida)
            bg.fillRect(0, 76, 160, 7, 4);
            bg.drawRect(0, 76, 160, 7, 0);
            // Superfície superior com reflexo
            bg.fillRect(0, 77, 160, 2, 15);
            bg.fillRect(0, 79, 160, 1, 5);
            // Veios da madeira (linhas sutis horizontais)
            bg.drawLine(0, 80, 50, 80, 3);
            bg.drawLine(60, 80, 110, 80, 3);
            bg.drawLine(120, 80, 160, 80, 3);
            bg.drawLine(20, 81, 80, 81, 2);
            bg.drawLine(90, 81, 140, 81, 2);
            bg.drawLine(10, 82, 40, 82, 3);
            bg.drawLine(55, 82, 95, 82, 3);
            bg.drawLine(105, 82, 155, 82, 3);

            // Corpo do balcão
            bg.fillRect(0, 83, 160, 37, 3);
            bg.drawLine(0, 83, 160, 83, 0);

            // Painéis decorativos com chanfro e sombra
            for (let i = 0; i < 8; i++) {
                let px = 2 + i * 20;
                bg.fillRect(px, 86, 17, 14, 2);
                bg.drawRect(px, 86, 17, 14, 0);
                // Moldura interna do painel (chanfro)
                bg.drawRect(px + 2, 88, 13, 10, 1);
                bg.fillRect(px + 3, 89, 11, 8, 3);
                // Topo iluminado do painel
                bg.drawLine(px + 1, 87, px + 15, 87, 15);
                // Sombra lateral direita
                bg.drawLine(px + 16, 87, px + 16, 99, 1);
            }

            // ── VINHETA DE CANTO (profundidade atmosférica) ─────────────────
            // Escurece os cantos para dar profundidade ao espaço
            for (let x = 0; x < 10; x++) {
                bg.drawLine(x, 0, x, 120, 0);
            }
            for (let x = 150; x < 160; x++) {
                bg.drawLine(x, 0, x, 120, 0);
            }
            for (let y = 0; y < 5; y++) {
                bg.drawLine(0, y, 160, y, 0);
            }

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
                if (this.character) {
                    let currentPortrait = this.character.getPortraitImage();
                    // Moldura escura atrás do retrato
                    screen.fillRect(105, 22, 52, 52, 1);
                    screen.drawRect(104, 21, 54, 54, 14);
                    screen.drawRect(103, 20, 56, 56, 0);
                    screen.drawTransparentImage(currentPortrait, 106, 23);
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
                        // Use character-specific tone frequency
                        let freq = this.character.getToneFrequency();
                        music.playTone(freq, 10);
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

        public changeCharacterExpression(expressionIndex: number): void {
            this.nextExpressionIndex = expressionIndex;
            this.character.setExpression(expressionIndex);
        }

        public pause(): void {}
        public resume(): void {}
    }
}

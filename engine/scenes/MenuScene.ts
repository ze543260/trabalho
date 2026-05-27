namespace Engine.Scenes {
    export class MenuScene implements Scene {
        private bg: Image;
        private rainDrops: {x: number, y: number, length: number, speed: number}[];
        private logoY: number;

        constructor() {
            this.bg = image.create(screen.width, screen.height);
            this.rainDrops = [];
            for (let i = 0; i < 40; i++) {
                this.rainDrops.push({
                    x: randint(0, screen.width),
                    y: randint(0, screen.height),
                    length: randint(3, 8),
                    speed: randint(4, 8)
                });
            }
            this.logoY = -30;
        }

        public enter(): void {
            // Draw initial background (Dark Blue / Night)
            this.bg.fill(15); // Black base
            
            // Draw some city lights in the far background
            for (let i = 0; i < 20; i++) {
                this.bg.fillRect(randint(0, screen.width), randint(40, screen.height), randint(2, 6), randint(4, 15), 11);
            }
            // Ground line
            this.bg.fillRect(0, screen.height - 20, screen.width, 20, 15);

            // Register rendering
            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;
                let time = game.runtime();

                // Draw Background
                screen.drawTransparentImage(this.bg, 0, 0);

                // Rain Parallax
                for (let drop of this.rainDrops) {
                    drop.y += drop.speed;
                    drop.x -= drop.speed / 2; // Wind effect

                    if (drop.y > screen.height) {
                        drop.y = -10;
                        drop.x = randint(0, screen.width + 50);
                    }

                    // Draw raindrop (light blue/grey)
                    screen.drawLine(drop.x, drop.y, drop.x - (drop.length/2), drop.y + drop.length, 1);
                }

                // Animate Logo Drop
                if (this.logoY < 20) {
                    this.logoY += 1;
                }

                // Draw Logo "Mantiqueira Brew"
                let floatY = this.logoY + Math.sin(time / 400) * 3;
                screen.fillRect(screen.width / 2 - 45, floatY - 2, 90, 20, 15);
                screen.drawRect(screen.width / 2 - 45, floatY - 2, 90, 20, 1);
                screen.print("MANTIQUEIRA", screen.width / 2 - 38, floatY + 2, 6);
                screen.print("BREW", screen.width / 2 - 15, floatY + 10, 4);

                // Press A to Start (Blinking)
                if (time % 1000 < 500) {
                    screen.print("PRESS A TO START", screen.width / 2 - 48, screen.height - 30, 1);
                }
            });
        }

        public exit(): void {
            // Clear screen or cleanup if needed
        }

        public update(dt: number): void {
            if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                // Som de confirmação
                music.playTone(440, 100);
                music.playTone(554, 150);
                
                // Vai pro jogo
                Engine.Scenes.SceneStack.pop();
                Engine.Scenes.SceneStack.push(new Engine.Scenes.CafeScene());
            }
        }

        public pause(): void {}
        public resume(): void {}
    }
}

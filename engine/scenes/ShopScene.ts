namespace Engine.Scenes {
    interface ShopItem {
        name: string;
        price: number;
        checkOwned: () => boolean;
        buy: () => void;
    }

    export class ShopScene implements Scene {
        private items: ShopItem[];
        private cursorIndex: number;

        constructor() {
            this.cursorIndex = 0;
            this.items = [
                {
                    name: "Filtro V60",
                    price: 25,
                    checkOwned: () => Engine.Core.TycoonState.hasV60,
                    buy: () => { Engine.Core.TycoonState.hasV60 = true; }
                },
                {
                    name: "Licença P/ Leite",
                    price: 15,
                    checkOwned: () => Engine.Core.TycoonState.hasMilk,
                    buy: () => { Engine.Core.TycoonState.hasMilk = true; }
                },
                {
                    name: "Mel Orgânico",
                    price: 20,
                    checkOwned: () => Engine.Core.TycoonState.hasHoney,
                    buy: () => { Engine.Core.TycoonState.hasHoney = true; }
                },
                {
                    name: "Máquina de Cápsula",
                    price: 50,
                    checkOwned: () => Engine.Core.TycoonState.hasCapsule,
                    buy: () => { Engine.Core.TycoonState.hasCapsule = true; }
                }
            ];
        }

        public init(): void {
            this.cursorIndex = 0;
            music.magicWand.play();
        }

        public update(dt: number): void {
            if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                this.cursorIndex = (this.cursorIndex + 1) % this.items.length;
            } else if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                this.cursorIndex = (this.cursorIndex - 1 + this.items.length) % this.items.length;
            }

            if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                let item = this.items[this.cursorIndex];
                if (!item.checkOwned() && Engine.Core.TycoonState.money >= item.price) {
                    Engine.Core.TycoonState.money -= item.price;
                    item.buy();
                    music.baDing.play();
                } else {
                    music.buzzer.play();
                }
            }

            // Pressione B para Próximo Dia
            if (Engine.Core.justPressed(Engine.Core.Action.Discard)) {
                Engine.Core.TycoonState.dayNumber++;
                Engine.Scenes.SceneStack.pop();
                Engine.Scenes.SceneStack.push(new CafeScene());
            }
        }

        public enter(): void {}
        public exit(): void {}
        public pause(): void {}
        public resume(): void {}

        public render(screen: Image): void {
            screen.fill(13); // Fundo bege claro

            screen.print("== LOJA DE EQUIPAMENTOS ==", 10, 10, 15, image.font5);
            screen.print("Dinheiro: $" + Engine.Core.TycoonState.money, 10, 22, 5, image.font5);

            for (let i = 0; i < this.items.length; i++) {
                let item = this.items[i];
                let y = 40 + i * 15;
                
                let isSelected = i === this.cursorIndex;
                let color = isSelected ? 7 : 15; // Verde se selecionado, branco normal

                let text = item.name + " - $" + item.price;
                if (item.checkOwned()) {
                    text = item.name + " [COMPRADO]";
                    color = 8; // Cinza
                }

                if (isSelected) {
                    screen.print(">", 5, y, 7, image.font5);
                }
                screen.print(text, 15, y, color, image.font5);
            }

            screen.print("Pressione B para o Dia Seguinte", 10, 105, 12, image.font5);
        }

        public destroy(): void { }
    }
}

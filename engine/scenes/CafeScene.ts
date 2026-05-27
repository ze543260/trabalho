namespace Engine.Scenes {
    // Enum para o estado da Cena Principal (Ciclo da Loja)
    enum CafeState {
        Waiting,
        DialogOrder,
        Brewing,
        DialogResult,
        ShopTransition
    }

    export class CafeScene implements Scene {
        private state: CafeState;
        private dayTimerMs: number;
        private customersServedToday: number;
        private maxCustomersPerDay: number;
        
        // Background programático
        private bg: Image;
        private currentCustomer: Engine.Entities.DrinkRecipe;
        private resultDrink: Engine.Entities.DrinkRecipe;

        constructor() {
            this.state = CafeState.Waiting;
            this.dayTimerMs = 0;
            this.customersServedToday = 0;
            // A cada dia, 1 cliente a mais
            this.maxCustomersPerDay = 2 + Engine.Core.TycoonState.dayNumber;
            
            this.bg = image.create(160, 120);
            this.drawLofiBackground();
        }

        private drawLofiBackground() {
            // Parede
            this.bg.fill(15); // Escuro/Preto
            // Janela
            this.bg.fillRect(20, 20, 50, 40, 11); // Azul escuro
            // Moldura da janela
            this.bg.drawRect(19, 19, 52, 42, 12); // Azul claro
            // Balcão
            this.bg.fillRect(0, 80, 160, 40, 14); // Marrom escuro
            // Detalhes balcão
            this.bg.drawLine(0, 80, 160, 80, 4); // Borda
        }

        public init(): void {
            this.state = CafeState.Waiting;
            this.dayTimerMs = 2000; // Espera 2 segundos antes do primeiro cliente
            game.splash("Dia " + Engine.Core.TycoonState.dayNumber, "Atenda os clientes!");
        }

        public update(dt: number): void {
            if (this.state === CafeState.Waiting) {
                this.dayTimerMs -= dt;
                if (this.dayTimerMs <= 0) {
                    this.spawnCustomer();
                }
            } else if (this.state === CafeState.ShopTransition) {
                this.dayTimerMs -= dt;
                if (this.dayTimerMs <= 0) {
                    // Manda pra ShopScene
                    // Engine.Scenes.SceneStack.pop();
                    // Engine.Scenes.SceneStack.push(new ShopScene());
                }
            }
        }

        private spawnCustomer() {
            // Toca sino (Som de blip)
            music.baDing.play();
            
            // Cria o pedido do cliente dependendo dos unlocks
            this.currentCustomer = new Engine.Entities.DrinkRecipe();
            
            // Randomiza método
            let methods = [Engine.Entities.BrewMethod.Espresso];
            if (Engine.Core.TycoonState.hasV60) methods.push(Engine.Entities.BrewMethod.V60);
            if (Engine.Core.TycoonState.hasCapsule) methods.push(Engine.Entities.BrewMethod.Capsule);
            this.currentCustomer.method = methods[Math.floor(Math.random() * methods.length)];
            
            // Randomiza grão (Colômbia é base, Mantiqueira é aleatório)
            this.currentCustomer.bean = Math.random() > 0.5 ? Engine.Entities.BeanType.Colombia : Engine.Entities.BeanType.Mantiqueira;

            // Randomiza extras
            if (Engine.Core.TycoonState.hasMilk && Math.random() > 0.5) this.currentCustomer.addAddin(Engine.Entities.AddinType.Milk);
            if (Engine.Core.TycoonState.hasHoney && Math.random() > 0.6) this.currentCustomer.addAddin(Engine.Entities.AddinType.Honey);

            // Abre o Dialog
            this.state = CafeState.DialogOrder;
            
            let methodStr = "";
            if (this.currentCustomer.method === Engine.Entities.BrewMethod.Espresso) methodStr = "Espresso";
            else if (this.currentCustomer.method === Engine.Entities.BrewMethod.V60) methodStr = "V60";
            else if (this.currentCustomer.method === Engine.Entities.BrewMethod.Capsule) methodStr = "Cápsula";

            let beanStr = this.currentCustomer.bean === Engine.Entities.BeanType.Mantiqueira ? "Mantiqueira" : "Colômbia";
            
            let extras = [];
            if (this.currentCustomer.addins.indexOf(Engine.Entities.AddinType.Milk) >= 0) extras.push("leite");
            if (this.currentCustomer.addins.indexOf(Engine.Entities.AddinType.Honey) >= 0) extras.push("mel");
            let extraStr = extras.length > 0 ? " com " + extras.join(" e ") : "";

            let dialogLines = [
                "O tempo está péssimo lá fora.",
                `Eu queria um ${methodStr} de grão ${beanStr}${extraStr}, por favor.`
            ];

            Engine.Scenes.SceneStack.push(new Engine.Scenes.DialogScene(
                Assets.portraitCustomerA,
                dialogLines,
                () => {
                    // Quando o diálogo fechar, vai direto pra BrewScene
                    this.state = CafeState.Brewing;
                    Engine.Scenes.SceneStack.push(new Engine.Scenes.BrewScene((craftedCup: Engine.Entities.DrinkRecipe) => {
                        this.resultDrink = craftedCup;
                        this.evaluateDrink();
                    }));
                }
            ));
        }

        private evaluateDrink() {
            this.state = CafeState.DialogResult;
            let match = this.currentCustomer.matches(this.resultDrink);
            let dialogLines = [];

            if (match) {
                let tips = Math.floor(Math.random() * 5) + 5; // $5 a $9
                Engine.Core.TycoonState.money += tips;
                dialogLines = [
                    "Isso está absolutamente perfeito.",
                    "Aqui está o seu pagamento. Fique com o troco."
                ];
                music.powerUp.play();
            } else {
                Engine.Core.TycoonState.money += 2; // Dinheiro de pena
                dialogLines = [
                    "Hum... isso não é o que eu pedi.",
                    "Mas vou beber mesmo assim para não jogar fora."
                ];
                music.buzzer.play();
            }

            Engine.Scenes.SceneStack.push(new Engine.Scenes.DialogScene(
                Assets.portraitCustomerA,
                dialogLines,
                () => {
                    this.customersServedToday++;
                    if (this.customersServedToday >= this.maxCustomersPerDay) {
                        this.state = CafeState.ShopTransition;
                        this.dayTimerMs = 2000;
                        game.splash("Fim do Expediente!");
                        // Aqui deve trocar a cena para a loja, no update
                    } else {
                        this.state = CafeState.Waiting;
                        this.dayTimerMs = 3000; // Espera 3s para o próximo
                    }
                }
            ));
        }

        public enter(): void {}
        public exit(): void {}
        public pause(): void {}
        public resume(): void {}

        public render(screen: Image): void {
            // Fundo escuro Lofi
            screen.drawTransparentImage(this.bg, 0, 0);

            // Status no canto superior (Pequeno e minimalista)
            screen.print(`Dia ${Engine.Core.TycoonState.dayNumber}`, 2, 2, 1, image.font5);
            screen.print(`Dinheiro: $${Engine.Core.TycoonState.money}`, 2, 10, 5, image.font5);
            screen.print(`Atendidos: ${this.customersServedToday}/${this.maxCustomersPerDay}`, 2, 18, 9, image.font5);
        }

        public destroy(): void { }
    }
}

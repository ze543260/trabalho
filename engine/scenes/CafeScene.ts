namespace Engine.Scenes {
    // Enum para o estado da Cena Principal (Ciclo da Loja)
    enum CafeState {
        SelectCustomer,
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

        // Day/night cycle with dynamic lighting
        private timeOfDay: number; // 0-1, where 0=afternoon (5pm), 0.5=evening (8pm), 1=night (11pm)
        private ambientColor: number; // palette index for ambient lighting
        private weatherSystem: Engine.Graphics.WeatherSystem;
        private musicManager: Engine.Audio.MusicManager;

        // Customer selection
        private currentCustomerProfile: Engine.Entities.CustomerProfile | null;
        private selectedCustomerId: number;

        constructor() {
            this.state = CafeState.SelectCustomer;
            this.dayTimerMs = 0;
            this.customersServedToday = 0;
            // A cada dia, 1 cliente a mais
            this.maxCustomersPerDay = 2 + Engine.Core.TycoonState.dayNumber;

            // Customer selection initialization
            this.selectedCustomerId = 0;
            this.currentCustomerProfile = null;

            // Time starts at afternoon (0.0)
            this.timeOfDay = 0;
            this.ambientColor = 14; // warm orange

            // Random weather for atmosphere
            let weatherRoll = Math.random();
            let weather = weatherRoll < 0.6 ? Engine.Graphics.WeatherType.Clear :
                          weatherRoll < 0.85 ? Engine.Graphics.WeatherType.Rainy :
                          Engine.Graphics.WeatherType.Snowy;
            this.weatherSystem = new Engine.Graphics.WeatherSystem(weather);
            this.musicManager = new Engine.Audio.MusicManager();
            this.musicManager.startCafeLoop();

            this.bg = image.create(160, 120);
            this.drawLofiBackground();
        }

        private drawLofiBackground() {
            // Use time-of-day color for overall tint
            this.bg.fill(this.ambientColor);

            // Janela shows sky gradient based on time
            let skyColor = this.ambientColor;
            this.bg.fillRect(20, 20, 50, 40, skyColor);
            this.bg.drawRect(19, 19, 52, 42, this.ambientColor === 14 ? 5 : 1);

            // Balcão stays relatively constant
            this.bg.fillRect(0, 80, 160, 40, 4);
            this.bg.drawLine(0, 80, 160, 80, 0);
        }

        private advanceTime(dt: number): void {
            // Each customer takes ~3 seconds, advances time by 0.1
            this.timeOfDay += dt / 30000; // slow progression
            if (this.timeOfDay > 1.0) this.timeOfDay = 1.0;

            // Update ambient color based on time
            if (this.timeOfDay < 0.3) {
                this.ambientColor = 14; // orange (5-6pm)
            } else if (this.timeOfDay < 0.6) {
                this.ambientColor = 13; // warm purple (6-8pm)
            } else if (this.timeOfDay < 0.8) {
                this.ambientColor = 10; // dark blue (8-10pm)
            } else {
                this.ambientColor = 9; // deep blue night (10-11pm)
            }
        }

        public init(): void {
            this.state = CafeState.SelectCustomer;
            this.selectedCustomerId = 0;
            this.currentCustomerProfile = null;
            this.dayTimerMs = 2000; // Espera 2 segundos antes do primeiro cliente
            game.splash("Dia " + Engine.Core.TycoonState.dayNumber, "Escolha um cliente!");
        }

        public update(dt: number): void {
            this.advanceTime(dt);
            this.weatherSystem.update(dt);
            this.musicManager.update(dt);

            if (this.state === CafeState.SelectCustomer) {
                let db = Engine.Persistence.CustomerDatabase.getInstance();
                let customers = db.getAllCustomers();

                if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                    this.selectedCustomerId = (this.selectedCustomerId - 1 + customers.length) % customers.length;
                }
                if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                    this.selectedCustomerId = (this.selectedCustomerId + 1) % customers.length;
                }

                if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
                    this.currentCustomerProfile = db.getCustomer(this.selectedCustomerId);
                    this.state = CafeState.DialogOrder;
                    // Next phase: transition to DialogScene
                }
            } else if (this.state === CafeState.Waiting) {
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
            music.baDing.play();
            this.currentCustomer = new Engine.Entities.DrinkRecipe();

            // Seleciona personagem do dia
            let charIndex = this.customersServedToday % 3;

            let portrait: Image;
            let dialogLines: string[];

            if (charIndex === 0) {
                // LUA SANTOS — espresso Mantiqueira, sem extras
                portrait = Assets.portraitLua;
                this.currentCustomer.bean = Engine.Entities.BeanType.Mantiqueira;
                this.currentCustomer.method = Engine.Entities.BrewMethod.Espresso;
                if (Engine.Core.TycoonState.dayNumber === 1) {
                    dialogLines = ["So um espresso, por favor.", "Preciso terminar esse codigo hoje."];
                } else if (Engine.Core.TycoonState.dayNumber === 2) {
                    dialogLines = ["Mesma coisa de sempre.", "Sabe... as vezes o codigo e mais simples que as pessoas."];
                } else {
                    dialogLines = ["Esta chovendo muito hoje.", "Eu gosto da chuva. Te da uma desculpa pra nao ir a lugar nenhum."];
                }
            } else if (charIndex === 1) {
                // OMAR KHALIL — V60 Mantiqueira + mel
                portrait = Assets.portraitOmar;
                this.currentCustomer.bean = Engine.Entities.BeanType.Mantiqueira;
                this.currentCustomer.method = Engine.Entities.BrewMethod.V60;
                if (Engine.Core.TycoonState.hasHoney) this.currentCustomer.addAddin(Engine.Entities.AddinType.Honey);
                if (Engine.Core.TycoonState.dayNumber === 1) {
                    dialogLines = ["Boa noite. Um V60, por favor.", "Minha esposa me ensinou a apreciar o V60. Dizia que precisa de paciencia."];
                } else if (Engine.Core.TycoonState.dayNumber === 2) {
                    dialogLines = ["De novo eu. O cafe de ontem estava perfeito.", "Voce sabia que no Marrocos o cafe e servido com especiarias?"];
                } else {
                    dialogLines = ["Boa noite, amigo.", "Hoje e aniversario dela. O cafe e a unica coisa que ainda me faz lembrar sem doer."];
                }
            } else {
                // YUKI TANAKA — V60 Colombia + leite
                portrait = Assets.portraitYuki;
                this.currentCustomer.bean = Engine.Entities.BeanType.Colombia;
                this.currentCustomer.method = Engine.Entities.BrewMethod.V60;
                if (Engine.Core.TycoonState.hasMilk) this.currentCustomer.addAddin(Engine.Entities.AddinType.Milk);
                if (Engine.Core.TycoonState.dayNumber === 1) {
                    dialogLines = ["Desculpe incomodar... Um V60 com leite, por favor.", "Posso desenhar o cafe enquanto espero? O vapor e muito bonito..."];
                } else if (Engine.Core.TycoonState.dayNumber === 2) {
                    dialogLines = ["Ola! Posso sentar no mesmo lugar de ontem?", "Voce tem um rosto interessante. Ja desenhei voce no meu caderno."];
                } else {
                    dialogLines = ["Esse lugar me lembra Kyoto a noite.", "Posso te mostrar o desenho que fiz? Espero que nao se importe..."];
                }
            }

            this.state = CafeState.DialogOrder;

            Engine.Scenes.SceneStack.push(new Engine.Scenes.DialogScene(
                portrait,
                dialogLines,
                () => {
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
                        // Save game after day ends
                        Engine.Persistence.SaveManager.saveGame();
                        // Aqui deve trocar a cena para a loja, no update
                    } else {
                        this.state = CafeState.Waiting;
                        this.dayTimerMs = 3000; // Espera 3s para o próximo
                    }
                }
            ));
        }

        public enter(): void {
            this.musicManager.startCafeLoop();
        }
        public exit(): void {}
        public pause(): void {}
        public resume(): void {}

        public render(screen: Image): void {
            if (this.state === CafeState.SelectCustomer) {
                let db = Engine.Persistence.CustomerDatabase.getInstance();
                let customers = db.getAllCustomers();

                screen.fillRect(0, 0, 160, 120, 1);
                screen.print("Proximo cliente:", 10, 10, 5, image.font5);

                for (let i = 0; i < customers.length; i++) {
                    let c = customers[i];
                    let isSelected = (i === this.selectedCustomerId);
                    let bgColor = isSelected ? 14 : 1;
                    screen.fillRect(20, 30 + i * 15, 120, 13, bgColor);
                    screen.drawRect(20, 30 + i * 15, 120, 13, 0);
                    screen.print(c.character.name, 25, 33 + i * 15, 0, image.font5);
                }

                screen.print("A=select", 10, 105, 8, image.font5);
            } else {
                // Fundo escuro Lofi
                screen.drawTransparentImage(this.bg, 0, 0);

                // Weather effects
                this.weatherSystem.draw(screen);

                // Status no canto superior (Pequeno e minimalista)
                screen.print(`Dia ${Engine.Core.TycoonState.dayNumber}`, 2, 2, 1, image.font5);
                screen.print(`Dinheiro: $${Engine.Core.TycoonState.money}`, 2, 10, 5, image.font5);
                screen.print(`Atendidos: ${this.customersServedToday}/${this.maxCustomersPerDay}`, 2, 18, 9, image.font5);
            }
        }

        public destroy(): void { }
    }
}

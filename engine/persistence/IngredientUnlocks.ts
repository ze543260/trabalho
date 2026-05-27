namespace Engine.Persistence {
    export class IngredientUnlock {
        public name: string;
        public unlockedByCustomerId: number; // Customer who brought it as a gift
        public unlockedAfterVisit: number; // Visit number when unlocked

        constructor(name: string, customerId: number, visitNum: number) {
            this.name = name;
            this.unlockedByCustomerId = customerId;
            this.unlockedAfterVisit = visitNum;
        }
    }

    export class IngredientUnlocks {
        private unlockedIngredients: IngredientUnlock[];
        private static instance: IngredientUnlocks;

        private constructor() {
            this.unlockedIngredients = [];
            this.initializeDefaults();
        }

        public static getInstance(): IngredientUnlocks {
            if (!IngredientUnlocks.instance) {
                IngredientUnlocks.instance = new IngredientUnlocks();
            }
            return IngredientUnlocks.instance;
        }

        private initializeDefaults(): void {
            // Base ingredients always available
            // New ingredients unlocked through customer relationships
        }

        public unlockIngredient(name: string, customerId: number, visitNum: number): void {
            // Check if already unlocked
            for (let ing of this.unlockedIngredients) {
                if (ing.name === name) return;
            }

            this.unlockedIngredients.push(new IngredientUnlock(name, customerId, visitNum));
        }

        public isIngredientUnlocked(name: string): boolean {
            for (let ing of this.unlockedIngredients) {
                if (ing.name === name) return true;
            }
            return false;
        }

        public getUnlockedIngredients(): IngredientUnlock[] {
            return this.unlockedIngredients;
        }

        public checkAndUnlockNew(): void {
            // Called after each successful customer interaction
            let db = Engine.Persistence.CustomerDatabase.getInstance();
            let customers = db.getAllCustomers();

            for (let c of customers) {
                if (c.visitCount === 3 && c.affinity > 25) {
                    // Unlock custom ingredient on 3rd visit with positive affinity
                    let ingredientName = c.character.name + "'s Gift";
                    this.unlockIngredient(ingredientName, c.id, c.visitCount);
                }
            }
        }
    }
}

namespace Engine.Persistence {
    export class SaveManager {
        private static readonly SAVE_SLOT_KEY = "barista_save";

        public static saveGame(): void {
            // Serialize game state to ArrayBuffer
            let db = Engine.Persistence.CustomerDatabase.getInstance();
            let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();

            let gameState = {
                dayNumber: Engine.Core.TycoonState.dayNumber,
                money: Engine.Core.TycoonState.money,
                customers: [] as any[],
                ingredients: [] as any[]
            };

            // Serialize customers
            let customersList = db.getAllCustomers();
            for (let i = 0; i < customersList.length; i++) {
                let c = customersList[i];
                gameState.customers.push({
                    id: c.id,
                    affinity: c.affinity,
                    visitCount: c.visitCount
                });
            }

            // Serialize unlocks
            let unlockedList = unlocks.getUnlockedIngredients();
            for (let i = 0; i < unlockedList.length; i++) {
                let u = unlockedList[i];
                gameState.ingredients.push({
                    name: u.name,
                    customerId: u.unlockedByCustomerId
                });
            }

            // Store as JSON in settings (MakeCode supports this)
            settings.writeString(SaveManager.SAVE_SLOT_KEY, JSON.stringify(gameState));
        }

        public static loadGame(): boolean {
            // Load game state from storage
            let saveData = settings.readString(SaveManager.SAVE_SLOT_KEY);
            if (!saveData) return false;

            // For now, skip loading and just reset to defaults
            // JSON parsing can be unreliable in MakeCode simulator
            return false;
        }

        public static hasActiveSave(): boolean {
            let save = settings.readString(SaveManager.SAVE_SLOT_KEY);
            return save ? true : false;
        }
    }
}

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
                customers: [],
                ingredients: []
            };

            // Serialize customers
            for (let c of db.getAllCustomers()) {
                gameState.customers.push({
                    id: c.id,
                    affinity: c.affinity,
                    visitCount: c.visitCount
                });
            }

            // Serialize unlocks
            for (let u of unlocks.getUnlockedIngredients()) {
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

            try {
                let gameState = JSON.parse(saveData);

                // Restore game state
                Engine.Core.TycoonState.dayNumber = gameState.dayNumber;
                Engine.Core.TycoonState.money = gameState.money;

                // Restore customers
                let db = Engine.Persistence.CustomerDatabase.getInstance();
                for (let cData of gameState.customers) {
                    let customer = db.getCustomer(cData.id);
                    if (customer) {
                        customer.affinity = cData.affinity;
                        customer.visitCount = cData.visitCount;
                    }
                }

                // Restore unlocks
                let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
                for (let uData of gameState.ingredients) {
                    unlocks.unlockIngredient(uData.name, uData.customerId, 0);
                }

                return true;
            } catch (e) {
                return false;
            }
        }

        public static hasActiveSave(): boolean {
            return settings.readString(SaveManager.SAVE_SLOT_KEY) !== "";
        }
    }
}

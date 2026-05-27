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

            try {
                let gameState = JSON.parse(saveData);

                // Restore game state
                Engine.Core.TycoonState.dayNumber = gameState.dayNumber;
                Engine.Core.TycoonState.money = gameState.money;

                // Restore customers
                let db = Engine.Persistence.CustomerDatabase.getInstance();
                let customerDataList = gameState.customers;
                for (let i = 0; i < customerDataList.length; i++) {
                    let cData = customerDataList[i];
                    let customer = db.getCustomer(cData.id);
                    if (customer) {
                        customer.affinity = cData.affinity;
                        customer.visitCount = cData.visitCount;
                    }
                }

                // Restore unlocks
                let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
                let ingredientDataList = gameState.ingredients;
                for (let i = 0; i < ingredientDataList.length; i++) {
                    let uData = ingredientDataList[i];
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

namespace Engine.Entities {
    export class CustomerProfile {
        public id: number;
        public character: Engine.Entities.Character;
        public affinity: number; // -100 to +100
        public favoriteRecipe: Engine.Entities.DrinkRecipe | null;
        public visitCount: number;
        public lastOrderedDrink: Engine.Entities.DrinkRecipe | null;

        constructor(id: number, character: Engine.Entities.Character) {
            this.id = id;
            this.character = character;
            this.affinity = 0;
            this.favoriteRecipe = null;
            this.visitCount = 0;
            this.lastOrderedDrink = null;
        }

        public modifyAffinity(delta: number): void {
            this.affinity = Math.max(-100, Math.min(100, this.affinity + delta));
        }

        public recordOrder(recipe: Engine.Entities.DrinkRecipe): void {
            this.visitCount++;
            this.lastOrderedDrink = recipe;
        }

        public setFavoriteRecipe(recipe: Engine.Entities.DrinkRecipe): void {
            this.favoriteRecipe = recipe;
        }

        public getAffinityLevel(): string {
            if (this.affinity < -50) return "hostile";
            if (this.affinity < -25) return "cold";
            if (this.affinity < 0) return "neutral";
            if (this.affinity < 25) return "friendly";
            if (this.affinity < 50) return "close";
            return "intimate";
        }
    }
}

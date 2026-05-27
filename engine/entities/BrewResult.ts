namespace Engine.Entities {
    export enum BrewQuality {
        Failed,      // QTE score < 5
        Poor,        // 5-10
        Good,        // 10-15
        Perfect,     // 15+
    }

    export class BrewResult {
        public recipe: Engine.Entities.DrinkRecipe;
        public extractionScore: number;
        public foamingScore: number;
        public totalScore: number;
        public quality: BrewQuality;

        constructor(recipe: Engine.Entities.DrinkRecipe, extraction: number, foaming: number) {
            this.recipe = recipe;
            this.extractionScore = extraction;
            this.foamingScore = foaming;
            this.totalScore = extraction + foaming;

            if (this.totalScore < 5) this.quality = BrewQuality.Failed;
            else if (this.totalScore < 10) this.quality = BrewQuality.Poor;
            else if (this.totalScore < 15) this.quality = BrewQuality.Good;
            else this.quality = BrewQuality.Perfect;
        }

        public getQualityString(): string {
            switch (this.quality) {
                case BrewQuality.Failed: return "QUEIMADO!";
                case BrewQuality.Poor: return "Fraco";
                case BrewQuality.Good: return "Bom";
                case BrewQuality.Perfect: return "PERFEITO!";
                default: return "?";
            }
        }

        public getQualityColor(): number {
            switch (this.quality) {
                case BrewQuality.Failed: return 2; // red
                case BrewQuality.Poor: return 10; // blue
                case BrewQuality.Good: return 14; // orange
                case BrewQuality.Perfect: return 12; // pink
                default: return 5;
            }
        }
    }
}

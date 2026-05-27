namespace Engine.Entities {
    export enum CharacterTone {
        Mysterious = 1,  // 220Hz (grave)
        Cheerful = 2,    // 440Hz (high)
        Calm = 3,        // 330Hz (neutral)
        Rushed = 4,      // 550Hz (urgent)
    }

    export class Character {
        public name: string;
        public tone: CharacterTone;
        public basePortraitIndex: number; // 0=happy, 1=sad, 2=thoughtful
        public currentExpression: number; // 0=happy, 1=sad, 2=thoughtful

        constructor(name: string, tone: CharacterTone, basePortrait: number) {
            this.name = name;
            this.tone = tone;
            this.basePortraitIndex = basePortrait;
            this.currentExpression = 0; // Start happy
        }

        public getToneFrequency(): number {
            switch (this.tone) {
                case CharacterTone.Mysterious: return 220;
                case CharacterTone.Cheerful: return 440;
                case CharacterTone.Calm: return 330;
                case CharacterTone.Rushed: return 550;
                default: return 330;
            }
        }

        public setExpression(expression: number): void {
            if (expression >= 0 && expression <= 2) {
                this.currentExpression = expression;
            }
        }

        public getPortraitImage(): Image {
            if (this.basePortraitIndex === 0) {
                return Assets.getPortraitLua();
            } else if (this.basePortraitIndex === 1) {
                return Assets.getPortraitOmar();
            } else if (this.basePortraitIndex === 2) {
                return Assets.getPortraitYuki();
            }
            return image.create(32, 32);
        }
    }
}

namespace Engine.Entities {
    export class DialogChoice {
        public text: string;
        public affinityDelta: number; // How much this choice affects affinity (-1, 0, +1)
        public nextLineIndex: number; // Which dialog line to jump to after choice

        constructor(text: string, affinityDelta: number, nextLineIndex: number) {
            this.text = text;
            this.affinityDelta = affinityDelta;
            this.nextLineIndex = nextLineIndex;
        }
    }

    export class DialogNode {
        public text: string;
        public expression: number; // 0=happy, 1=sad, 2=thoughtful
        public choices: DialogChoice[]; // If empty, just shows text

        constructor(text: string, expression: number = 0, choices: DialogChoice[] = []) {
            this.text = text;
            this.expression = expression;
            this.choices = choices;
        }
    }
}

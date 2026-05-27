namespace Engine.Minigames {
    export class QTEEvent {
        public targetPosition: number; // 0-100 (needle position)
        public duration: number; // milliseconds
        public successWindow: number; // pixels from center (e.g., 10 = ±10px window)
        public currentTime: number;

        constructor(target: number, duration: number, window: number) {
            this.targetPosition = target;
            this.duration = duration;
            this.successWindow = window;
            this.currentTime = 0;
        }

        public isSuccess(currentNeedle: number): boolean {
            let diff = Math.abs(currentNeedle - this.targetPosition);
            return diff <= this.successWindow;
        }

        public isComplete(): boolean {
            return this.currentTime >= this.duration;
        }

        public getProgress(): number {
            return this.currentTime / this.duration;
        }

        public update(dt: number): void {
            this.currentTime += dt;
        }
    }

    export class QTEController {
        private events: QTEEvent[];
        private currentEventIndex: number;
        private needlePosition: number; // 0-100
        private needleVelocity: number; // pixels per ms
        private totalScore: number;

        constructor() {
            this.events = [];
            this.currentEventIndex = 0;
            this.needlePosition = 50;
            this.needleVelocity = 0.1;
            this.totalScore = 0;
        }

        public addEvent(qte: QTEEvent): void {
            this.events.push(qte);
        }

        public getCurrentEvent(): QTEEvent | null {
            if (this.currentEventIndex < this.events.length) {
                return this.events[this.currentEventIndex];
            }
            return null;
        }

        public isComplete(): boolean {
            return this.currentEventIndex >= this.events.length;
        }

        public getScore(): number {
            return this.totalScore;
        }

        public update(dt: number): void {
            let current = this.getCurrentEvent();
            if (!current) return;

            current.update(dt);

            // Move needle back and forth (simple oscillation)
            this.needlePosition += this.needleVelocity;
            if (this.needlePosition <= 0 || this.needlePosition >= 100) {
                this.needleVelocity *= -1;
            }

            if (current.isComplete()) {
                // Check if success
                if (current.isSuccess(this.needlePosition)) {
                    this.totalScore += 10;
                } else {
                    this.totalScore = Math.max(0, this.totalScore - 5);
                }
                this.currentEventIndex++;
            }
        }

        public getNeedlePosition(): number {
            return this.needlePosition;
        }
    }
}

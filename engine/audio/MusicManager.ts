namespace Engine.Audio {
    export enum MusicLayer {
        BassPiano,    // layer 0
        MidMelody,    // layer 1
        AmbientPad,   // layer 2
    }

    export class MusicManager {
        private activeLoop: number;
        private targetTempo: number;
        private currentTempo: number;
        private fadeInProgress: number; // 0-1
        private isFadingIn: boolean;

        constructor() {
            this.activeLoop = 0;
            this.targetTempo = 120;
            this.currentTempo = 120;
            this.fadeInProgress = 0;
            this.isFadingIn = false;
        }

        public startCafeLoop(): void {
            // Play lofi jazz melody
            // Using MakeCode's music.playMelody or custom synth
            music.setTempo(120);
            // In a real implementation, this would play a background loop
            // For now, just set it as "playing"
            this.activeLoop = 1;
        }

        public startBrewLoop(): void {
            // Switch to machine/mechanical sounds focus
            music.setTempo(100); // slightly slower
            this.activeLoop = 2;
        }

        public fadeToLoop(targetLoop: number): void {
            this.isFadingIn = true;
            this.fadeInProgress = 0;
            this.activeLoop = targetLoop;
        }

        public update(dt: number): void {
            if (this.isFadingIn) {
                this.fadeInProgress += dt / 1000; // fade over 1 second
                if (this.fadeInProgress >= 1.0) {
                    this.isFadingIn = false;
                    this.fadeInProgress = 1.0;
                }
            }
        }

        public stop(): void {
            music.stopAllSounds();
        }

        public getFadeLevel(): number {
            return this.fadeInProgress;
        }
    }
}

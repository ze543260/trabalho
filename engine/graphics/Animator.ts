namespace Engine.Graphics {
	/**
	 * Sprite animator that swaps frames over time.
	 */
	export class Animator {
		private sprite: Sprite;
		private frames: Image[];
		private intervalMs: number;
		private loop: boolean;
		private accumulatorMs: number;
		private index: number;
		private playing: boolean;

		constructor(sprite: Sprite) {
			this.sprite = sprite;
			this.frames = [];
			this.intervalMs = 100;
			this.loop = true;
			this.accumulatorMs = 0;
			this.index = 0;
			this.playing = false;
		}

		/**
		 * Start playing a frame sequence.
		 */
		public play(frames: Image[], intervalMs: number, loop: boolean): void {
			this.frames = frames;
			this.intervalMs = intervalMs > 0 ? intervalMs : 1;
			this.loop = loop;
			this.accumulatorMs = 0;
			this.index = 0;
			this.playing = this.frames.length > 0;

			if (this.playing) {
				this.sprite.setImage(this.frames[0].clone());
			}
		}

		/**
		 * Advance animation based on elapsed time.
		 */
		public update(dt: number): void {
			if (!this.playing || this.frames.length <= 0) {
				return;
			}

			if (dt < 0) {
				dt = 0;
			}

			this.accumulatorMs += dt;
			if (this.accumulatorMs < this.intervalMs) {
				return;
			}

			while (this.accumulatorMs >= this.intervalMs && this.playing) {
				this.accumulatorMs -= this.intervalMs;
				this.index += 1;

				if (this.index >= this.frames.length) {
					if (this.loop) {
						this.index = 0;
					} else {
						this.index = this.frames.length - 1;
						this.playing = false;
					}
				}

				this.sprite.setImage(this.frames[this.index].clone());
			}
		}
	}
}

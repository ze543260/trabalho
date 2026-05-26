namespace Engine.Scenes {
	/**
	 * Static stack to manage active scenes.
	 */
	export class SceneStack {
		private static stack: Scene[] = [];

		/** Push a new scene, pausing the previous one. */
		public static push(scene: Scene): void {
			const current = this.top();
			if (current && current.pause) {
				current.pause();
			}

			this.stack.push(scene);
			scene.enter();
		}

		/** Pop the current scene and resume the previous one. */
		public static pop(): Scene | null {
			const current = this.stack.pop();
			if (current) {
				current.exit();
			}

			const next = this.top();
			if (next && next.resume) {
				next.resume();
			}

			return current ? current : null;
		}

		/** Get the scene on the top of the stack. */
		public static top(): Scene | null {
			if (this.stack.length <= 0) {
				return null;
			}

			return this.stack[this.stack.length - 1];
		}

		/** Update only the top scene. */
		public static update(dt: number): void {
			const current = this.top();
			if (current) {
				current.update(dt);
			}
		}

		/** Remove all scenes from the stack. */
		public static clear(): void {
			while (this.stack.length > 0) {
				const scene = this.stack.pop();
				if (scene) {
					scene.exit();
				}
			}
		}
	}
}

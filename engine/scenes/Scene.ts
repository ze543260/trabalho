namespace Engine.Scenes {
	/**
	 * Scene lifecycle contract.
	 */
	export interface Scene {
		enter(): void;
		update(dt: number): void;
		exit(): void;
		pause?(): void;
		resume?(): void;
	}
}

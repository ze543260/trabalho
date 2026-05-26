namespace Engine.Entities {
	/** Coffee beans available in the game. */
	export enum BeanType {
		None = 0,
		Mantiqueira = 1,
		Colombia = 2
	}

	/** Brewing methods available to customers. */
	export enum BrewMethod {
		Espresso = 0,
		Capsule = 1,
		V60 = 2
	}

	/** Customer behavior states. */
	export enum CustomerState {
		Entering = 0,
		Waiting = 1,
		Leaving = 2
	}
}

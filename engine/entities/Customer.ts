namespace Engine.Entities {
	/** Coffee beans available in the game. */
	export enum BeanType {
		None = 0,
		Mantiqueira = 1,
		Colombia = 2
	}

	/** Brewing methods available to customers. */
	export enum BrewMethod {
		None = -1,
		Espresso = 0,
		Capsule = 1,
		V60 = 2
	}

	/** Addins for mixology. */
	export enum AddinType {
		Milk = 0,
		Honey = 1
	}

	/** Holds the current state of a cup or a customer's order. */
	export class DrinkRecipe {
		public method: BrewMethod;
		public bean: BeanType;
		public addins: AddinType[];

		constructor() {
			this.method = BrewMethod.None;
			this.bean = BeanType.None;
			this.addins = [];
		}

		public addAddin(a: AddinType): void {
			if (this.addins.indexOf(a) === -1 && this.addins.length < 3) {
				this.addins.push(a);
			}
		}

		public matches(other: DrinkRecipe): boolean {
			if (this.method !== other.method) return false;
			if (this.bean !== other.bean) return false;
			if (this.addins.length !== other.addins.length) return false;
			for (let a of this.addins) {
				if (other.addins.indexOf(a) === -1) return false;
			}
			return true;
		}
	}

	/** Customer behavior states. */
	export enum CustomerState {
		Entering = 0,
		Waiting = 1,
		Leaving = 2
	}
}

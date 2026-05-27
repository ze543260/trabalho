namespace Engine.Persistence {
    export class CustomerDatabase {
        private customers: Engine.Entities.CustomerProfile[];
        private static instance: CustomerDatabase;

        private constructor() {
            this.customers = [];
            this.initializeLazyLoad();
        }

        public static getInstance(): CustomerDatabase {
            if (!CustomerDatabase.instance) {
                CustomerDatabase.instance = new CustomerDatabase();
            }
            return CustomerDatabase.instance;
        }

        private initializeLazyLoad(): void {
            // Create 4 base customers if not loaded from storage
            if (this.customers.length === 0) {
                this.customers.push(new Engine.Entities.CustomerProfile(
                    0,
                    new Engine.Entities.Character(
                        "Estudante Misterioso",
                        Engine.Entities.CharacterTone.Mysterious,
                        0
                    )
                ));
                this.customers.push(new Engine.Entities.CustomerProfile(
                    1,
                    new Engine.Entities.Character(
                        "Regular Feliz",
                        Engine.Entities.CharacterTone.Cheerful,
                        1
                    )
                ));
                this.customers.push(new Engine.Entities.CustomerProfile(
                    2,
                    new Engine.Entities.Character(
                        "Anciao Tranquilo",
                        Engine.Entities.CharacterTone.Calm,
                        2
                    )
                ));
                this.customers.push(new Engine.Entities.CustomerProfile(
                    3,
                    new Engine.Entities.Character(
                        "Profissional Ocupado",
                        Engine.Entities.CharacterTone.Rushed,
                        3
                    )
                ));
            }
        }

        public getCustomer(id: number): Engine.Entities.CustomerProfile | null {
            for (let c of this.customers) {
                if (c.id === id) return c;
            }
            return null;
        }

        public getAllCustomers(): Engine.Entities.CustomerProfile[] {
            return this.customers;
        }

        public saveCustomerOrder(customerId: number, recipe: Engine.Entities.DrinkRecipe): void {
            let customer = this.getCustomer(customerId);
            if (customer) {
                customer.recordOrder(recipe);
                // Check if this becomes favorite (after 3 identical orders)
                if (customer.visitCount >= 3 && customer.lastOrderedDrink === recipe) {
                    customer.setFavoriteRecipe(recipe);
                }
            }
        }

        public getCustomerList(): string {
            let list = "";
            for (let c of this.customers) {
                list += c.character.name + " (" + c.getAffinityLevel() + ")\n";
            }
            return list;
        }
    }
}

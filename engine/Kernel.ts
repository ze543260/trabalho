namespace Engine.Core {
    export let deltaTime: number = 0;
    let lastTime: number = 0;

    export enum Action { Up, Down, Left, Right, Interact, Discard }
    
    let currentInput: boolean[] = [];
    let previousInput: boolean[] = [];

    export function init() {
        lastTime = control.millis();
        for (let i = 0; i < 6; i++) {
            currentInput[i] = false;
            previousInput[i] = false;
        }
    }

    export function updateInput() {
        for (let i = 0; i < 6; i++) {
            previousInput[i] = currentInput[i];
        }
        currentInput[Action.Up] = controller.up.isPressed();
        currentInput[Action.Down] = controller.down.isPressed();
        currentInput[Action.Left] = controller.left.isPressed();
        currentInput[Action.Right] = controller.right.isPressed();
        currentInput[Action.Interact] = controller.A.isPressed();
        currentInput[Action.Discard] = controller.B.isPressed();
    }

    export function isDown(action: Action): boolean {
        return currentInput[action];
    }

    export function justPressed(action: Action): boolean {
        return currentInput[action] && !previousInput[action];
    }

    // Deixe a Engine.Core apenas repassar para o nativo
    export function allocSprite(img: Image, kind: number): Sprite {
        return sprites.create(img, kind);
    }

    export function freeSprite(s: Sprite) {
        if (s) s.destroy();
    }

    // Global Tycoon state variables
    export namespace TycoonState {
        export let money: number = 0; // Starts with $0
        export let dayNumber: number = 1;
        export let hasV60: boolean = false;
        export let hasCapsule: boolean = false;
        export let hasMilk: boolean = false;
        export let hasHoney: boolean = false;
    }
}
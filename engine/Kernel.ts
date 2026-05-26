namespace Engine.Core {
    export let deltaTime: number = 0;
    let lastTime: number = 0;
    let updateCallbacks: ((dt: number) => void)[] = [];

    export enum Action { Up, Down, Left, Right, Interact, Discard }
    
    let currentInput: boolean[] = [];
    let previousInput: boolean[] = [];
    let spritePool: Sprite[][] = [];

    export function init() {
        lastTime = control.millis();
        for (let i = 0; i < 6; i++) {
            currentInput[i] = false;
            previousInput[i] = false;
        }

        game.onUpdate(function () {
            let now = control.millis();
            deltaTime = now - lastTime;
            lastTime = now;
            updateInput();
            for (let cb of updateCallbacks) {
                cb(deltaTime);
            }
        });
    }

    export function registerUpdate(cb: (dt: number) => void) {
        updateCallbacks.push(cb);
    }

    function updateInput() {
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

    export function allocSprite(img: Image, kind: number): Sprite {
        if (!spritePool[kind]) {
            spritePool[kind] = [];
        }
        if (spritePool[kind].length > 0) {
            const s = spritePool[kind].pop();
            if (s) {
                s.setImage(img);
                s.setFlag(SpriteFlag.Invisible, false);
                s.setFlag(SpriteFlag.Ghost, false);
                s.vx = 0;
                s.vy = 0;
                return s;
            }
        }

        return sprites.create(img, kind);
    }

    export function freeSprite(s: Sprite) {
        if (!s) return;
        s.setFlag(SpriteFlag.Invisible, true);
        s.setFlag(SpriteFlag.Ghost, true);
        s.x = -999;
        s.y = -999;
        s.vx = 0;
        s.vy = 0;
        let kind = s.kind();
        if (!spritePool[kind]) spritePool[kind] = [];
        spritePool[kind].push(s);
    }
}
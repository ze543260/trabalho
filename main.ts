// Define uma paleta de cores "Lofi Cafe" (Tons quentes de madeira, café e fim de tarde)
// O buffer contém 16 cores em formato RGB (3 bytes por cor)
image.setPalette(
    hex`0000003b202768383c965b4cc78b68e8c19afbf1d5ffffff4c68853a4c682a324b4a54466b7a5a91a376d9a066a85c45`
);

Engine.Core.init();

// Load saved game if it exists
let hasSave = Engine.Persistence.SaveManager.hasActiveSave();
if (hasSave) {
    Engine.Persistence.SaveManager.loadGame();
}

// Single update loop: input + deltaTime + scenes
let lastTime = control.millis();
game.onUpdate(function() {
    let now = control.millis();
    Engine.Core.deltaTime = now - lastTime;
    lastTime = now;

    // Update input
    Engine.Core.updateInput();

    // Update active scene
    Engine.Scenes.SceneStack.update(Engine.Core.deltaTime);
});

// Dá o arranque ao jogo
Engine.Scenes.SceneStack.push(new Engine.Scenes.MenuScene());
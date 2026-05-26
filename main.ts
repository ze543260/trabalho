// Define uma paleta de cores "Lofi Cafe" (Tons quentes de madeira, café e fim de tarde)
// O buffer contém 16 cores em formato RGB (3 bytes por cor)
image.setPalette(
    hex`0000003b202768383c965b4cc78b68e8c19afbf1d5ffffff4c68853a4c682a324b4a54466b7a5a91a376d9a066a85c45`
);

Engine.Core.init();

// Chamamos o update da SceneStack diretamente no loop nativo, sem arrays de callbacks!
game.onUpdate(function() {
    Engine.Scenes.SceneStack.update(Engine.Core.deltaTime);
});

// Dá o arranque ao jogo
Engine.Scenes.SceneStack.push(new Engine.Scenes.GameplayScene());
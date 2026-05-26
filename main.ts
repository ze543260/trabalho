Engine.Core.init();

// Chamamos o update da SceneStack diretamente no loop nativo, sem arrays de callbacks!
game.onUpdate(function() {
    Engine.Scenes.SceneStack.update(Engine.Core.deltaTime);
});

// Dá o arranque ao jogo
Engine.Scenes.SceneStack.push(new Engine.Scenes.GameplayScene());
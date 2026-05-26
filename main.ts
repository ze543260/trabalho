Engine.Core.init();

// A peça que faltava: Conectar o loop do Kernel à Pilha de Cenas!
Engine.Core.registerUpdate(function(dt: number) {
    Engine.Scenes.SceneStack.update(dt);
});

// Dá o arranque ao jogo
Engine.Scenes.SceneStack.push(new Engine.Scenes.GameplayScene());
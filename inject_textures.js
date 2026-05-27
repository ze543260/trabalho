const fs = require('fs');

const file = fs.readFileSync('c:\\\\jogo\\\\trabalho\\\\assets\\\\assets.ts', 'utf8');

const mantiqueiraTextured = `
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . f f f f f f f f . . . . . . . . . . . .
        . . . . . . . . . . f f e 4 e 4 e 4 e 4 f f . . . . . . . . . .
        . . . . . . . . f f 4 e 4 e e 4 e e 4 e 4 f f . . . . . . . . .
        . . . . . . . . f e 4 e 4 e 4 e 4 e 4 e 4 e f . . . . . . . . .
        . . . . . . . . f f a a a a a a a a a a a f f . . . . . . . . .
        . . . . . . . f 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 f . . . . . . . .
        . . . . . . f 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 f . . . . . . .
        . . . . . . f e 4 e b b b b b b b b b b b 4 e 4 f . . . . . . .
        . . . . . f 4 e 4 b b b b b b b b b b b b b 4 e 4 f . . . . . .
        . . . . . f e 4 e b b c c c c c c c c c c b 4 e 4 f . . . . . .
        . . . . . f 4 e 4 b b c c 7 7 7 7 7 7 c c b 4 e 4 f . . . . . .
        . . . . . f e 4 e b b c c 7 f f f f 7 c c b e 4 e f . . . . . .
        . . . . . f 4 e 4 b b c c c c c c c c c c b 4 e 4 f . . . . . .
        . . . . . f e 4 e b b b b b b b b b b b b b e 4 e f . . . . . .
        . . . . . f 4 e 4 b b b b b b b b b b b b b 4 e 4 f . . . . . .
        . . . . . f e 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 e f . . . . . .
        . . . . . f 4 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 e 4 4 f . . . . . .
        . . . . . . f f 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 f f . . . . . . .
        . . . . . . . . f f f f f f f f f f f f f f f . . . . . . . . .
    `;

const colombiaTextured = `
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . f f f f f f f f . . . . . . . . . . . .
        . . . . . . . . . . f f 4 3 4 3 4 3 4 3 f f . . . . . . . . . .
        . . . . . . . . f f 3 4 3 4 4 3 4 4 3 4 3 f f . . . . . . . . .
        . . . . . . . . f 4 3 4 3 4 3 4 3 4 3 4 3 4 f . . . . . . . . .
        . . . . . . . . f f a a a a a a a a a a a f f . . . . . . . . .
        . . . . . . . f 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 f . . . . . . . .
        . . . . . . f 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 f . . . . . . .
        . . . . . . f 4 3 4 2 2 2 2 2 2 2 2 2 2 2 3 4 3 f . . . . . . .
        . . . . . f 3 4 3 2 2 2 2 2 2 2 2 2 2 2 2 2 4 3 4 f . . . . . .
        . . . . . f 4 3 4 2 2 3 3 3 3 3 3 3 3 3 3 2 3 4 3 f . . . . . .
        . . . . . f 3 4 3 2 2 3 3 7 7 7 7 7 7 3 3 2 4 3 4 f . . . . . .
        . . . . . f 4 3 4 2 2 3 3 7 f f f f 7 3 3 2 3 4 3 f . . . . . .
        . . . . . f 3 4 3 2 2 3 3 3 3 3 3 3 3 3 3 2 4 3 4 f . . . . . .
        . . . . . f 4 3 4 2 2 2 2 2 2 2 2 2 2 2 2 2 3 4 3 f . . . . . .
        . . . . . f 3 4 3 2 2 2 2 2 2 2 2 2 2 2 2 2 4 3 4 f . . . . . .
        . . . . . f 4 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 4 f . . . . . .
        . . . . . f 3 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 4 3 3 f . . . . . .
        . . . . . . f f 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 f f . . . . . . .
        . . . . . . . . f f f f f f f f f f f f f f f . . . . . . . . .
    `;

const iconMan = `
        . . . f f f f f f f f f . . . .
        . . f e 4 e 4 e 4 e 4 e f . . .
        . f 4 e 4 4 4 4 4 4 4 e 4 f . .
        . f e 4 4 b b b b b 4 4 e f . .
        . f 4 e 4 b b c c c b b 4 f . .
        . f e 4 4 b c 7 7 c b 4 e f . .
        . f 4 e 4 b c 7 7 c b 4 e f . .
        . f e 4 4 b b c c c b b 4 f . .
        . f 4 e 4 4 b b b b b 4 e f . .
        . f e 4 e 4 4 4 4 4 4 4 4 f . .
        . f 4 e 4 e 4 e 4 e 4 e 4 f . .
        . . f 4 4 e 4 e 4 e 4 4 f . . .
        . . . f f 4 4 4 4 4 f f . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `;

const iconCol = `
        . . . f f f f f f f f f . . . .
        . . f 4 3 4 3 4 3 4 3 4 f . . .
        . f 3 4 3 3 3 3 3 3 3 4 3 f . .
        . f 4 3 3 2 2 2 2 2 3 3 4 f . .
        . f 3 4 3 2 2 3 3 3 2 2 3 f . .
        . f 4 3 3 2 3 7 7 3 2 3 4 f . .
        . f 3 4 3 2 3 7 7 3 2 3 4 f . .
        . f 4 3 3 2 2 3 3 3 2 2 3 f . .
        . f 3 4 3 3 2 2 2 2 2 3 4 f . .
        . f 4 3 4 3 3 3 3 3 3 3 3 f . .
        . f 3 4 3 4 3 4 3 4 3 4 3 f . .
        . . f 3 3 4 3 4 3 4 3 3 f . . .
        . . . f f 3 3 3 3 3 f f . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `;

let newCode = file.replace(/export const largeMantiqueira = img\`[\s\S]*?\`;/, "export const largeMantiqueira = img`\\n" + mantiqueiraTextured.trim() + "\\n    `;")
                  .replace(/export const largeColombia = img\`[\s\S]*?\`;/, "export const largeColombia = img`\\n" + colombiaTextured.trim() + "\\n    `;")
                  .replace(/export const iconMantiqueira = img\`[\s\S]*?\`;/, "export const iconMantiqueira = img`\\n" + iconMan.trim() + "\\n    `;")
                  .replace(/export const iconColombia = img\`[\s\S]*?\`;/, "export const iconColombia = img`\\n" + iconCol.trim() + "\\n    `;");

fs.writeFileSync('c:\\\\jogo\\\\trabalho\\\\assets\\\\assets.ts', newCode);

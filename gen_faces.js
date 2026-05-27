const fs = require('fs');

function imgBlock(data) {
    const lines = data.trim().split('\n');
    let out = "img`\n";
    for (let line of lines) {
        out += "    " + line.split('').join(' ') + "\n";
    }
    out += "`";
    return out;
}

function drawFace(skin, hair, shirt, eye, bg, isAlex, isLeo, isOmar) {
    let m = [];
    for (let y = 0; y < 48; y++) {
        let row = [];
        for (let x = 0; x < 48; x++) {
            row.push(bg);
        }
        m.push(row);
    }

    function circle(cx, cy, r, color) {
        for (let y = 0; y < 48; y++) {
            for (let x = 0; x < 48; x++) {
                if ((x-cx)*(x-cx) + (y-cy)*(y-cy) <= r*r) {
                    m[y][x] = color;
                }
            }
        }
    }

    function rect(x, y, w, h, color) {
        for (let i = y; i < y+h; i++) {
            for (let j = x; j < x+w; j++) {
                if (i >= 0 && i < 48 && j >= 0 && j < 48) {
                    m[i][j] = color;
                }
            }
        }
    }

    // Shoulders
    circle(24, 48, 16, shirt);
    rect(8, 40, 32, 8, shirt);

    // Neck
    rect(20, 26, 8, 6, skin);
    // Neck shadow
    rect(20, 30, 8, 2, 'd');

    // Head
    circle(24, 20, 10, skin);
    rect(14, 16, 20, 8, skin);

    if (isOmar) {
        // Beard
        circle(24, 26, 9, '8');
        rect(15, 23, 18, 5, '8');
        rect(20, 26, 8, 4, skin);
    }

    // Hair base
    circle(24, 14, 11, hair);

    // Hair details
    if (isAlex) {
        // Beanie
        circle(24, 10, 11, 'e'); // yellow
        rect(13, 12, 22, 3, '7'); // white
        rect(13, 15, 22, 2, 'a'); // purple
    } else if (isLeo) {
        // Short hair
        rect(14, 10, 20, 4, hair);
        rect(12, 14, 4, 6, hair);
        rect(32, 14, 4, 6, hair);
    } else {
        // Long hair
        rect(12, 14, 4, 20, hair);
        rect(32, 14, 4, 20, hair);
    }

    // Eyes
    rect(18, 19, 3, 2, 'f');
    rect(27, 19, 3, 2, 'f');
    rect(19, 19, 2, 2, eye);
    rect(28, 19, 2, 2, eye);

    // Mouth
    if (isOmar) {
        rect(23, 27, 3, 1, '1');
    } else if (isLeo) {
        rect(22, 26, 5, 1, '1');
        rect(23, 27, 3, 1, '1');
    } else {
        rect(23, 26, 3, 1, '3');
    }

    let out = "";
    for (let y = 0; y < 48; y++) {
        out += m[y].join('') + "\n";
    }
    return out;
}

function generateAssets() {
    let code = "namespace Assets {\n";

    // ... I will only overwrite the portraits in this script, reading the file and replacing the portrait block.
    const file = fs.readFileSync('c:\\\\jogo\\\\trabalho\\\\assets\\\\assets.ts', 'utf8');
    
    let pLua = drawFace('5', '1', '9', 'a', 'a', false, false, false);
    let pOmar = drawFace('4', 'a', 'b', '3', '0', false, false, true);
    let pYuki = drawFace('6', 'a', '2', 'a', '9', false, false, false);
    let pAlex = drawFace('5', 'd', 'f', 'a', '8', true, false, false);
    let pLeo = drawFace('5', 'c', 'd', '3', '6', false, true, false);

    let newCode = file.replace(/export const portraitLuaImg = img`[\s\S]*?`;/, `export const portraitLuaImg = ${imgBlock(pLua)};`)
                      .replace(/export const portraitOmarImg = img`[\s\S]*?`;/, `export const portraitOmarImg = ${imgBlock(pOmar)};`)
                      .replace(/export const portraitYukiImg = img`[\s\S]*?`;/, `export const portraitYukiImg = ${imgBlock(pYuki)};`)
                      .replace(/export const portraitAlexImg = img`[\s\S]*?`;/, `export const portraitAlexImg = ${imgBlock(pAlex)};`)
                      .replace(/export const portraitLeoImg = img`[\s\S]*?`;/, `export const portraitLeoImg = ${imgBlock(pLeo)};`);

    fs.writeFileSync('c:\\\\jogo\\\\trabalho\\\\assets\\\\assets.ts', newCode);
}

generateAssets();

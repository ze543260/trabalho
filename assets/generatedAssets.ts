namespace Assets {

    // =====================================================
    // MÁQUINAS 64x64 — desenhadas com primitivas de imagem
    // =====================================================

    function makeEspressoMachine(): Image {
        let m = image.create(64, 64);
        m.fill(0);

        // BASE DA MÁQUINA
        m.fillRect(8, 58, 48, 6, 10);
        m.fillRect(9, 59, 46, 3, 9);
        m.drawRect(8, 58, 48, 6, 0);
        m.fillRect(10, 62, 10, 2, 10);
        m.fillRect(44, 62, 10, 2, 10);

        // BANDEJA COLETORA
        m.fillRect(6, 50, 52, 8, 10);
        m.drawRect(6, 50, 52, 8, 0);
        m.fillRect(7, 50, 50, 2, 9);
        for (let i = 0; i < 13; i++) {
            m.drawLine(8 + i * 4, 52, 8 + i * 4, 57, 9);
        }
        m.drawLine(7, 52, 56, 52, 9);
        m.drawLine(7, 55, 56, 55, 9);

        // CORPO PRINCIPAL
        m.fillRect(4, 12, 56, 40, 9);
        m.fillRect(5, 13, 54, 38, 8);
        m.drawRect(4, 12, 56, 40, 0);
        m.fillRect(5, 13, 54, 2, 7);
        m.fillRect(5, 15, 54, 1, 5);
        m.fillRect(4, 12, 5, 40, 10);
        m.drawLine(9, 12, 9, 51, 0);
        m.fillRect(55, 12, 5, 40, 10);
        m.drawLine(55, 12, 55, 51, 0);

        // CALDEIRA SUPERIOR
        m.fillRect(10, 2, 44, 12, 9);
        m.fillRect(11, 3, 42, 5, 8);
        m.fillRect(11, 3, 42, 2, 7);
        m.drawRect(10, 2, 44, 12, 0);
        m.fillRect(26, 0, 12, 4, 7);
        m.fillRect(28, 0, 8, 2, 6);
        m.drawRect(26, 0, 12, 4, 0);
        m.setPixel(12, 4, 7); m.setPixel(12, 5, 7);
        m.setPixel(51, 4, 7); m.setPixel(51, 5, 7);
        m.setPixel(12, 9, 7); m.setPixel(12, 10, 7);
        m.setPixel(51, 9, 7); m.setPixel(51, 10, 7);
        m.fillRect(20, 4, 24, 4, 5);
        m.drawRect(20, 4, 24, 4, 0);
        m.fillRect(21, 5, 22, 2, 6);
        for (let i = 0; i < 6; i++) { m.setPixel(23 + i * 4, 5, 9); }

        // MANÔMETRO DE PRESSÃO
        m.fillCircle(22, 30, 8, 5);
        m.drawCircle(22, 30, 9, 14);
        m.drawCircle(22, 30, 8, 0);
        m.fillCircle(22, 30, 2, 9);
        m.setPixel(22, 22, 0);
        m.setPixel(30, 30, 0);
        m.setPixel(22, 37, 0);
        m.setPixel(14, 30, 0);
        m.drawLine(22, 30, 28, 24, 3);
        m.setPixel(22, 30, 0);
        m.setPixel(29, 25, 12);
        m.setPixel(30, 27, 12);
        m.setPixel(30, 29, 12);

        // PLACA COM LOGO
        m.fillRect(30, 24, 22, 10, 5);
        m.drawRect(30, 24, 22, 10, 9);
        m.fillRect(31, 25, 20, 2, 6);
        m.setPixel(33, 27, 9); m.setPixel(33, 28, 9); m.setPixel(33, 29, 9); m.setPixel(33, 30, 9); m.setPixel(33, 31, 9);
        m.setPixel(34, 27, 9); m.setPixel(35, 28, 9); m.setPixel(34, 29, 9); m.setPixel(35, 30, 9);
        m.setPixel(36, 27, 9); m.setPixel(36, 28, 9); m.setPixel(36, 29, 9); m.setPixel(36, 30, 9); m.setPixel(36, 31, 9);
        m.setPixel(39, 27, 9); m.setPixel(39, 28, 9); m.setPixel(39, 29, 9); m.setPixel(39, 30, 9); m.setPixel(39, 31, 9);
        m.setPixel(40, 27, 9); m.setPixel(41, 27, 9); m.setPixel(42, 28, 9);
        m.setPixel(40, 29, 9); m.setPixel(41, 29, 9); m.setPixel(42, 30, 9);
        m.setPixel(40, 31, 9); m.setPixel(41, 31, 9);

        // PAINEL DE CONTROLE
        m.fillRect(44, 16, 12, 28, 9);
        m.drawRect(44, 16, 12, 28, 0);
        m.fillRect(45, 17, 10, 2, 8);
        m.fillRect(46, 20, 8, 8, 8);
        m.drawRect(46, 20, 8, 8, 0);
        m.fillRect(47, 21, 6, 3, 9);
        m.setPixel(49, 21, 7); m.setPixel(50, 21, 6);
        m.drawLine(50, 22, 50, 27, 0);
        m.fillRect(48, 32, 6, 6, 8);
        m.drawRect(48, 32, 6, 6, 0);
        m.setPixel(51, 33, 7);
        m.setPixel(46, 18, 12);
        m.setPixel(49, 18, 14);
        m.setPixel(52, 18, 3);
        m.fillRect(45, 40, 10, 4, 0);
        m.setPixel(46, 41, 14); m.setPixel(48, 41, 14); m.setPixel(50, 41, 14);

        // GRUPOS (cabeçotes)
        m.fillRect(8, 34, 16, 10, 9);
        m.drawRect(8, 34, 16, 10, 0);
        m.fillRect(9, 35, 14, 3, 8);
        m.fillRect(9, 35, 14, 1, 7);
        m.fillRect(11, 38, 10, 4, 10);
        m.drawRect(11, 38, 10, 4, 0);
        m.fillRect(13, 39, 6, 2, 9);
        m.fillRect(10, 42, 12, 6, 10);
        m.drawRect(10, 42, 12, 6, 0);
        m.fillRect(11, 43, 10, 2, 9);
        m.fillRect(12, 48, 3, 4, 9); m.fillRect(17, 48, 3, 4, 9);
        m.drawRect(12, 48, 3, 4, 0); m.drawRect(17, 48, 3, 4, 0);

        m.fillRect(40, 34, 16, 10, 9);
        m.drawRect(40, 34, 16, 10, 0);
        m.fillRect(41, 35, 14, 3, 8);
        m.fillRect(41, 35, 14, 1, 7);
        m.fillRect(43, 38, 10, 4, 10);
        m.drawRect(43, 38, 10, 4, 0);
        m.fillRect(45, 39, 6, 2, 9);
        m.fillRect(42, 42, 12, 6, 10);
        m.drawRect(42, 42, 12, 6, 0);
        m.fillRect(43, 43, 10, 2, 9);
        m.fillRect(44, 48, 3, 4, 9); m.fillRect(49, 48, 3, 4, 9);
        m.drawRect(44, 48, 3, 4, 0); m.drawRect(49, 48, 3, 4, 0);

        // PORTA-FILTROS (cabos)
        m.fillRect(4, 42, 8, 14, 15);
        m.drawRect(4, 42, 8, 14, 0);
        m.fillRect(5, 43, 6, 4, 14);
        m.fillRect(5, 43, 3, 12, 3);
        m.setPixel(8, 54, 1);
        m.fillRect(52, 42, 8, 14, 15);
        m.drawRect(52, 42, 8, 14, 0);
        m.fillRect(53, 43, 6, 4, 14);
        m.fillRect(55, 43, 3, 12, 3);
        m.setPixel(52, 54, 1);

        // VAPORIZADOR
        m.fillRect(57, 14, 5, 30, 7);
        m.drawRect(57, 14, 5, 30, 0);
        m.fillRect(58, 15, 3, 28, 6);
        m.fillRect(55, 14, 9, 6, 8);
        m.drawRect(55, 14, 9, 6, 0);
        m.setPixel(59, 15, 7);
        m.fillRect(59, 44, 4, 6, 7);
        m.drawRect(59, 44, 4, 6, 0);
        m.fillRect(57, 50, 8, 2, 7);
        m.drawRect(57, 50, 8, 2, 0);
        m.setPixel(62, 46, 6); m.setPixel(63, 44, 5);
        m.setPixel(62, 42, 6); m.setPixel(63, 40, 5);
        m.setPixel(62, 38, 6);

        // PINGOS DE CAFÉ
        m.setPixel(13, 52, 14); m.setPixel(18, 52, 14);
        m.setPixel(45, 52, 14); m.setPixel(50, 52, 14);
        m.setPixel(13, 53, 3); m.setPixel(18, 53, 3);
        m.setPixel(45, 53, 3); m.setPixel(50, 53, 3);

        return m;
    }

    function makeV60Machine(): Image {
        let m = image.create(64, 64);
        m.fill(0);

        // SUPORTE DE MADEIRA
        m.fillRect(12, 30, 6, 28, 15);
        m.drawRect(12, 30, 6, 28, 0);
        m.fillRect(13, 31, 4, 26, 14);
        m.setPixel(13, 34, 3); m.setPixel(13, 38, 3); m.setPixel(13, 42, 3);
        m.fillRect(46, 30, 6, 28, 15);
        m.drawRect(46, 30, 6, 28, 0);
        m.fillRect(47, 31, 4, 26, 14);
        m.setPixel(49, 34, 3); m.setPixel(49, 38, 3); m.setPixel(49, 42, 3);
        m.fillRect(12, 42, 40, 5, 15);
        m.drawRect(12, 42, 40, 5, 0);
        m.fillRect(13, 43, 38, 3, 14);
        m.fillRect(8, 56, 14, 5, 15);
        m.drawRect(8, 56, 14, 5, 0);
        m.fillRect(42, 56, 14, 5, 15);
        m.drawRect(42, 56, 14, 5, 0);

        // SERVER (jarra de vidro)
        m.fillRect(16, 32, 32, 12, 6);
        m.drawRect(16, 32, 32, 12, 0);
        m.fillRect(17, 38, 30, 5, 14);
        m.fillRect(17, 38, 30, 1, 3);
        m.fillRect(17, 33, 6, 10, 7);
        m.setPixel(17, 33, 6); m.setPixel(18, 34, 6);
        m.fillRect(10, 32, 8, 5, 6);
        m.drawRect(10, 32, 8, 5, 0);
        m.fillRect(11, 33, 6, 3, 7);
        m.fillRect(48, 34, 4, 8, 5);
        m.fillRect(46, 32, 6, 4, 5);
        m.fillRect(46, 40, 6, 4, 5);
        m.drawRect(48, 34, 4, 8, 0);
        m.drawRect(46, 32, 6, 4, 0);
        m.drawRect(46, 40, 6, 4, 0);

        // ARO DO V60
        m.fillRect(10, 26, 44, 6, 15);
        m.drawRect(10, 26, 44, 6, 0);
        m.fillRect(11, 27, 42, 3, 14);
        m.fillRect(11, 27, 42, 1, 5);

        // CONE DO V60 (forma trapezoidal)
        for (let row = 0; row <= 24; row++) {
            let width = 44 + Math.idiv((6 - 44) * row, 24);
            let left = 32 - Math.idiv(width, 2);
            m.fillRect(left, 2 + row, width, 1, 15);
        }
        // Contorno do cone
        for (let row = 0; row <= 24; row++) {
            let width = 44 + Math.idiv((6 - 44) * row, 24);
            let left = 32 - Math.idiv(width, 2);
            m.setPixel(left, 2 + row, 0);
            m.setPixel(left + width - 1, 2 + row, 0);
        }
        // Caneluras do V60 (característica marcante)
        for (let row = 1; row <= 22; row += 3) {
            let width = 44 + Math.idiv((6 - 44) * row, 24);
            let left = 32 - Math.idiv(width, 2);
            for (let x = left + 1; x < left + width - 1; x++) {
                m.setPixel(x, 2 + row, 14);
            }
        }
        // Borda superior (porcelana branca)
        m.fillRect(8, 0, 48, 4, 7);
        m.drawRect(8, 0, 48, 4, 0);
        m.fillRect(9, 1, 46, 2, 6);
        // Papel filtro (visível de cima)
        m.fillRect(14, 2, 36, 5, 6);
        m.fillRect(15, 3, 34, 3, 7);
        // Interior escuro (profundidade)
        m.fillRect(27, 14, 10, 8, 1);
        // Pingo caindo
        m.setPixel(32, 27, 14); m.setPixel(32, 28, 3);
        m.setPixel(31, 29, 14); m.setPixel(32, 29, 3);
        m.setPixel(33, 30, 14); m.setPixel(32, 31, 2);

        return m;
    }

    function makeMilkJug(): Image {
        let m = image.create(64, 64);
        m.fill(0);

        // CORPO (aço inox)
        m.fillRect(14, 16, 28, 40, 8);
        m.drawRect(14, 16, 28, 40, 0);
        m.fillRect(15, 17, 4, 38, 7);
        m.fillRect(16, 17, 2, 38, 6);
        m.fillRect(20, 17, 20, 38, 9);
        m.fillRect(38, 17, 3, 38, 10);
        // Reflexo vertical
        m.drawLine(16, 16, 16, 56, 5);

        // BICO
        m.fillRect(18, 8, 20, 10, 8);
        m.drawRect(18, 8, 20, 10, 0);
        m.fillRect(19, 9, 18, 4, 7);
        m.fillRect(22, 4, 12, 6, 8);
        m.drawRect(22, 4, 12, 6, 0);
        m.fillRect(23, 5, 10, 3, 7);
        m.fillRect(24, 5, 8, 1, 6);
        m.fillRect(20, 6, 4, 4, 8);
        m.drawRect(20, 6, 4, 4, 0);

        // ALÇA
        m.fillRect(42, 22, 6, 24, 8);
        m.fillRect(40, 20, 8, 6, 8);
        m.fillRect(40, 42, 8, 6, 8);
        m.drawRect(42, 22, 6, 24, 0);
        m.drawRect(40, 20, 8, 6, 0);
        m.drawRect(40, 42, 8, 6, 0);
        m.fillRect(43, 24, 4, 20, 0);
        m.setPixel(42, 24, 7); m.setPixel(42, 25, 7); m.setPixel(42, 26, 6);

        // BASE
        m.fillRect(12, 54, 32, 8, 9);
        m.drawRect(12, 54, 32, 8, 0);
        m.fillRect(13, 55, 30, 3, 8);
        m.fillRect(13, 55, 30, 1, 7);

        // LEITE E ESPUMA
        m.fillRect(19, 14, 18, 4, 7);
        m.fillRect(20, 14, 16, 2, 6);
        m.setPixel(22, 13, 6); m.setPixel(25, 12, 7);
        m.setPixel(28, 13, 6); m.setPixel(31, 12, 7);
        m.setPixel(34, 13, 6);

        // RÓTULO
        m.fillRect(20, 30, 16, 20, 8);
        m.drawRect(20, 30, 16, 20, 9);
        m.fillRect(21, 31, 14, 4, 7);
        m.setPixel(23, 37, 7); m.setPixel(23, 38, 7); m.setPixel(23, 39, 7); m.setPixel(23, 40, 7); m.setPixel(23, 41, 7);
        m.setPixel(24, 38, 7); m.setPixel(25, 39, 7); m.setPixel(26, 38, 7);
        m.setPixel(27, 37, 7); m.setPixel(27, 38, 7); m.setPixel(27, 39, 7); m.setPixel(27, 40, 7); m.setPixel(27, 41, 7);

        return m;
    }

    function makeHoneyJar(): Image {
        let m = image.create(64, 64);
        m.fill(0);

        // CORPO DO POTE (hexagonal, âmbar)
        m.fillRect(10, 14, 44, 40, 14);
        m.drawRect(10, 14, 44, 40, 0);
        m.fillRect(6, 20, 6, 28, 14);
        m.drawRect(6, 20, 6, 28, 0);
        m.fillRect(52, 20, 6, 28, 14);
        m.drawRect(52, 20, 6, 28, 0);

        // Tampa hexagonal
        m.fillRect(10, 14, 6, 6, 14);
        m.fillRect(48, 14, 6, 6, 14);
        m.setPixel(10, 14, 0); m.setPixel(11, 14, 0); m.setPixel(10, 15, 0);
        m.setPixel(53, 14, 0); m.setPixel(54, 14, 0); m.setPixel(53, 15, 0);
        m.fillRect(10, 48, 6, 6, 14);
        m.fillRect(48, 48, 6, 6, 14);
        m.setPixel(10, 53, 0); m.setPixel(11, 53, 0); m.setPixel(10, 52, 0);
        m.setPixel(53, 53, 0); m.setPixel(54, 53, 0); m.setPixel(53, 52, 0);

        // Mel por dentro (gradiente: âmbar topo, escuro fundo)
        m.fillRect(11, 14, 42, 28, 14);
        m.fillRect(7, 22, 4, 26, 14);
        m.fillRect(53, 22, 4, 26, 14);
        m.fillRect(11, 40, 42, 13, 3);
        m.fillRect(7, 42, 50, 11, 2);

        // Brilho do vidro (esquerda)
        m.fillRect(12, 16, 6, 36, 5);
        m.fillRect(13, 17, 4, 34, 6);
        m.setPixel(12, 18, 7); m.setPixel(13, 18, 7); m.setPixel(13, 20, 6);

        // Superfície do mel
        m.fillRect(11, 26, 42, 4, 5);
        m.fillRect(11, 27, 42, 2, 6);
        m.setPixel(32, 30, 5); m.setPixel(32, 32, 5); m.setPixel(33, 34, 5);

        // TAMPA
        m.fillRect(18, 6, 28, 10, 12);
        m.drawRect(18, 6, 28, 10, 0);
        m.fillRect(19, 7, 26, 5, 13);
        m.fillRect(20, 7, 24, 2, 13);
        for (let i = 0; i < 7; i++) { m.drawLine(20 + i * 4, 7, 20 + i * 4, 15, 11); }

        // GARGALO
        m.fillRect(22, 14, 20, 8, 14);
        m.drawRect(22, 14, 20, 8, 0);
        m.fillRect(23, 15, 18, 4, 5);
        m.fillRect(24, 15, 14, 2, 6);

        // COLHER DE MEL (encostada)
        m.fillRect(46, 0, 3, 56, 15);
        m.drawRect(46, 0, 3, 56, 0);
        m.setPixel(47, 2, 14); m.setPixel(47, 5, 14); m.setPixel(47, 8, 14);
        m.fillRect(42, 52, 11, 10, 15);
        m.drawRect(42, 52, 11, 10, 0);
        m.fillRect(43, 53, 9, 6, 14);
        m.drawLine(42, 54, 53, 54, 3);
        m.drawLine(42, 57, 53, 57, 3);
        m.setPixel(47, 62, 14); m.setPixel(47, 63, 5);

        // BASE
        m.fillRect(8, 54, 46, 6, 15);
        m.drawRect(8, 54, 46, 6, 0);
        m.fillRect(9, 55, 44, 2, 14);

        return m;
    }

    export const machineEspresso64 = makeEspressoMachine();
    export const machineV60_64 = makeV60Machine();
    export const machineMilk64 = makeMilkJug();
    export const machineHoney64 = makeHoneyJar();
}

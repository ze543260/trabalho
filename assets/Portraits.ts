namespace Assets {
    /**
     * Portrait generation for game characters
     * Each portrait is 32×32 pixels, procedurally drawn
     */

    export function portraitLua(): Image {
        // LUA SANTOS - Mysterious programmer
        // Dark theme: code-focused, introverted
        let img = image.create(32, 32);

        // Background - dark gradient
        img.fill(1); // dark brown

        // Head - oval shape
        img.fillCircle(16, 12, 7, 5); // tan skin

        // Hair - dark, messy (code-focused aesthetic)
        img.fillRect(10, 6, 12, 4, 2); // dark hair top
        img.setPixel(9, 10, 2);
        img.setPixel(23, 10, 2);

        // Eyes - focused, serious
        img.setPixel(13, 11, 0); // left eye
        img.setPixel(19, 11, 0); // right eye
        img.setPixel(14, 11, 15); // left pupil
        img.setPixel(20, 11, 15); // right pupil

        // Expression - straight mouth (serious)
        img.drawLine(13, 15, 19, 15, 0);

        // Neck
        img.fillRect(15, 18, 2, 3, 5);

        // Body - hoodie vibe
        img.fillRect(10, 21, 12, 10, 2); // dark hoodie
        img.drawRect(10, 21, 12, 10, 0);

        // Small detail: glasses reflection
        img.setPixel(13, 10, 14);
        img.setPixel(19, 10, 14);

        return img;
    }

    export function portraitOmar(): Image {
        // OMAR KHALIL - Wise, patient coffee enthusiast
        // Warm, welcoming aesthetic
        let img = image.create(32, 32);

        // Background - warm
        img.fill(14); // warm amber

        // Head - round
        img.fillCircle(16, 12, 8, 6); // olive skin tone

        // Hair - dark, full
        img.fillCircle(16, 7, 8, 2); // dark hair
        img.fillRect(9, 9, 14, 3, 2);

        // Eyes - warm, kind
        img.fillCircle(13, 11, 1, 0);
        img.fillCircle(19, 11, 1, 0);
        img.setPixel(13, 11, 15); // sparkle
        img.setPixel(19, 11, 15);

        // Expression - gentle smile
        img.drawLine(12, 15, 20, 15, 0);
        img.setPixel(13, 16, 0);
        img.setPixel(19, 16, 0);

        // Neck
        img.fillRect(15, 19, 2, 2, 6);

        // Body - formal/neat
        img.fillRect(10, 21, 12, 10, 3); // brown jacket
        img.drawRect(10, 21, 12, 10, 0);

        // Collar detail
        img.drawLine(13, 21, 13, 23, 5);
        img.drawLine(19, 21, 19, 23, 5);

        return img;
    }

    export function portraitYuki(): Image {
        // YUKI TANAKA - Artist, observant, creative
        // Gentle, artistic aesthetic
        let img = image.create(32, 32);

        // Background - soft blue
        img.fill(13); // soft purple-blue

        // Head - delicate oval
        img.fillCircle(16, 13, 7, 4); // pale skin

        // Hair - long, artistic
        img.fillRect(10, 7, 12, 4, 1); // dark hair top
        img.fillRect(9, 10, 14, 8, 1); // long hair sides

        // Eyes - large, expressive, dreamy
        img.fillCircle(12, 12, 2, 0);
        img.fillCircle(20, 12, 2, 0);
        img.fillCircle(12, 12, 1, 15); // large pupils
        img.fillCircle(20, 12, 1, 15);

        // Expression - soft, contemplative smile
        img.drawLine(12, 16, 20, 16, 0);
        img.setPixel(13, 17, 0);
        img.setPixel(19, 17, 0);

        // Neck - delicate
        img.fillRect(15, 19, 2, 2, 4);

        // Body - artistic, loose clothing
        img.fillRect(10, 21, 12, 10, 12); // pink/mauve shirt
        img.drawRect(10, 21, 12, 10, 0);

        // Collar accent
        img.setPixel(13, 21, 14);
        img.setPixel(19, 21, 14);

        // Small artistic detail - flower or pin
        img.setPixel(22, 24, 11);
        img.setPixel(23, 24, 11);

        return img;
    }

    // Cache generated portraits to avoid regenerating each frame
    let cachedLua: Image | null = null;
    let cachedOmar: Image | null = null;
    let cachedYuki: Image | null = null;

    export function getPortraitLua(): Image {
        if (!cachedLua) cachedLua = portraitLua();
        return cachedLua;
    }

    export function getPortraitOmar(): Image {
        if (!cachedOmar) cachedOmar = portraitOmar();
        return cachedOmar;
    }

    export function getPortraitYuki(): Image {
        if (!cachedYuki) cachedYuki = portraitYuki();
        return cachedYuki;
    }
}

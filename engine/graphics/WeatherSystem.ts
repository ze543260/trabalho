namespace Engine.Graphics {
    export enum WeatherType {
        Clear,
        Rainy,
        Snowy,
    }

    export class WeatherSystem {
        private weatherType: WeatherType;
        private particleCount: number;
        private particles: { x: number, y: number, vx: number, vy: number }[];
        private timer: number;

        constructor(weatherType: WeatherType = WeatherType.Clear) {
            this.weatherType = weatherType;
            this.particles = [];
            this.timer = 0;
            this.setWeather(weatherType);
        }

        public setWeather(type: WeatherType): void {
            this.weatherType = type;
            this.particles = [];

            if (type === WeatherType.Rainy) {
                this.particleCount = 15;
                for (let i = 0; i < this.particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * 160,
                        y: Math.random() * 120,
                        vx: -0.2,
                        vy: 0.5
                    });
                }
            } else if (type === WeatherType.Snowy) {
                this.particleCount = 8;
                for (let i = 0; i < this.particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * 160,
                        y: Math.random() * 120,
                        vx: -0.05,
                        vy: 0.1
                    });
                }
            }
        }

        public update(dt: number): void {
            for (let p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = 160;
                if (p.y > 120) p.y = -5;
            }
            this.timer++;
        }

        public draw(screen: Image): void {
            if (this.weatherType === WeatherType.Clear) return;

            let color = this.weatherType === WeatherType.Rainy ? 8 : 15;

            for (let p of this.particles) {
                let ix = Math.floor(p.x);
                let iy = Math.floor(p.y);

                if (ix >= 0 && ix < 160 && iy >= 0 && iy < 120) {
                    if (this.weatherType === WeatherType.Rainy) {
                        screen.drawLine(ix, iy, ix - 1, iy + 2, color);
                    } else if (this.weatherType === WeatherType.Snowy) {
                        screen.fillCircle(ix, iy, 1, color);
                    }
                }
            }
        }

        public getWeatherType(): WeatherType {
            return this.weatherType;
        }
    }
}

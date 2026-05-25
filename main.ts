/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         MANTIQUEIRA BREW: ARCADE BARISTA (V6 Tycoon)     ║
 * ║         Modo Campanha, Loja, Capsulas e Lo-Fi            ║
 * ╚══════════════════════════════════════════════════════════╝
 */

namespace SpriteKind {
    export const Cust = SpriteKind.create()
    export const Decor = SpriteKind.create()
    export const Station = SpriteKind.create()
}

enum BeanType { None, Mantiqueira, Colombian }
enum BrewMethod { None, Grinder, Espresso, V60, Capsule }
enum BrewState { Idle, Processing, Ready, Ruined }
enum CarryType { Nothing, RawMan, RawCol, GroundMan, GroundCol, Cup }

// ════════════════════════════════════════════════════════════
// CONSTANTES & CONFIGURAÇÕES BASE
// ════════════════════════════════════════════════════════════
const PATIENCE_MS = 60000
const WALL_Y = 44
const COUNTER_Y = 22
const ZONE_R = 18

const POS_BEAN_MANT = { x: 20, y: 100 }
const POS_BEAN_COLO = { x: 45, y: 100 }
const POS_GRINDER = { x: 80, y: 95 }
const POS_ESPRESSO = { x: 115, y: 95 }
const POS_V60 = { x: 145, y: 95 }
const POS_CAPSULE = { x: 145, y: 65 } // Nova estação no canto superior direito

// ════════════════════════════════════════════════════════════
// ESTADO GLOBAL DO TYCOON
// ════════════════════════════════════════════════════════════
let barista: Sprite
let carrying: CarryType = CarryType.Nothing
let cupMethod: BrewMethod = BrewMethod.None
let cupBean: BeanType = BeanType.None

let stations: Station[] = []
let customers: Customer[] = []

let lastSpawn = 0
let comboCount = 0
let isRushHour = false

// Estado da Campanha
let currentDay = 1
const MAX_DAYS = 7
const DEBT_GOAL = 5000
let dayLengthMs = 180000 // 3 minutos por dia
let dayStartTime = 0
let isDayActive = false

// Upgrades Desbloqueados
let hasCapsuleMachine = false
let grinderLevel = 1
let espressoLevel = 1

// ════════════════════════════════════════════════════════════
// CLASSES DE DOMÍNIO
// ════════════════════════════════════════════════════════════

class Customer {
    sprite: Sprite
    patienceBar: Sprite
    orderBean: BeanType
    orderMethod: BrewMethod
    spawnTime: number
    slotX: number
    active: boolean

    constructor(slotX: number) {
        this.slotX = slotX
        this.orderBean = Math.percentChance(50) ? BeanType.Mantiqueira : BeanType.Colombian
        this.orderMethod = Math.percentChance(50) ? BrewMethod.Espresso : BrewMethod.V60
        this.spawnTime = control.millis()
        this.active = true

        this.sprite = sprites.create(Assets.customerBase.clone(), SpriteKind.Cust)
        this.sprite.setPosition(slotX, COUNTER_Y)
        this.sprite.z = 1

        let shirtColor = Math.percentChance(50) ? 6 : 8
        let hairColor = Math.percentChance(50) ? 4 : 14
        this.sprite.image.fillRect(0, 7, 12, 5, shirtColor)
        this.sprite.image.fillRect(2, 1, 6, 2, hairColor)

        let beanColor = this.orderBean === BeanType.Mantiqueira ? 7 : 4
        let methodColor = this.orderMethod === BrewMethod.Espresso ? 14 : 8
        this.sprite.image.fillRect(11, 0, 5, 8, 1)
        this.sprite.image.fillRect(12, 1, 3, 3, beanColor)
        this.sprite.image.fillRect(12, 4, 3, 3, methodColor)
        this.sprite.image.setPixel(10, 6, 1)

        this.patienceBar = sprites.create(image.create(14, 2), SpriteKind.Decor)
        this.patienceBar.setPosition(slotX, COUNTER_Y + 10)

        this.sprite.y -= 10
        this.sprite.vy = 50
    }

    update() {
        if (!this.active) return
        if (this.sprite.y >= COUNTER_Y) { this.sprite.y = COUNTER_Y; this.sprite.vy = 0 }

        const patienceDivider = isRushHour ? PATIENCE_MS * 0.75 : PATIENCE_MS
        const rem = Math.max(0, 1 - (control.millis() - this.spawnTime) / patienceDivider)

        if (rem <= 0) { this.leave(false, 0); return }

        const w = Math.max(1, Math.round(14 * rem))
        const col = rem > 0.5 ? 7 : (rem > 0.25 ? 5 : 2)
        this.patienceBar.image.fill(0)
        this.patienceBar.image.fillRect(0, 0, w, 2, col)
    }

    serve(bean: BeanType, method: BrewMethod): boolean {
        if (bean === this.orderBean) {
            if (method === this.orderMethod) {
                this.sprite.startEffect(effects.hearts, 500)
                this.leave(true, 1) // Entrega perfeita
                return true
            } else if (method === BrewMethod.Capsule) {
                this.sprite.startEffect(effects.smiles, 500)
                this.leave(true, 0.5) // Entrega via cápsula (metade do lucro)
                return true
            }
        }
        return false
    }

    leave(satisfied: boolean, multiplier: number) {
        this.active = false
        if (satisfied) {
            comboCount++
            let basePts = isRushHour ? 30 : 15 + (comboCount * 2)
            let finalPts = Math.round(basePts * multiplier)
            info.changeScoreBy(finalPts)
            music.baDing.play()
            this.sprite.say(`+$${finalPts}`, 600)
        } else {
            comboCount = 0
            info.changeLifeBy(-1)
            info.changeScoreBy(-10)
            music.buzzer.play()
            this.sprite.startEffect(effects.ashes, 500)
            this.sprite.say("Demorou!", 600)
            scene.cameraShake(2, 200)
        }
        this.patienceBar.destroy()
        this.sprite.vy = -50
        this.sprite.setFlag(SpriteFlag.Ghost, true)
        this.sprite.lifespan = 500
    }
}

class Station {
    sprite: Sprite
    method: BrewMethod
    state: BrewState = BrewState.Idle
    loadedBean: BeanType = BeanType.None
    timerStart: number = 0
    baseImage: Image

    constructor(x: number, y: number, method: BrewMethod, imgBase: Image) {
        this.method = method
        this.baseImage = imgBase
        this.sprite = sprites.create(imgBase.clone(), SpriteKind.Station)
        this.sprite.setPosition(x, y)
        this.applyMethodColor()
    }

    applyMethodColor() {
        if (this.method === BrewMethod.Espresso) {
            this.sprite.image.fillRect(0, 14, 16, 2, 14)
        } else if (this.method === BrewMethod.V60) {
            this.sprite.image.fillRect(4, 10, 8, 2, 8)
        } else if (this.method === BrewMethod.Capsule) {
            this.sprite.image.fillRect(0, 14, 16, 2, 3) // Base rosa
        }
    }

    getBrewTime(): number {
        let lvl = this.method === BrewMethod.Grinder ? grinderLevel : espressoLevel
        let baseTime = this.method === BrewMethod.Grinder ? 3000 : (this.method === BrewMethod.Espresso ? 5000 : 8000)
        return Math.max(500, baseTime - ((lvl - 1) * 1200))
    }

    update() {
        if (this.state === BrewState.Idle || this.method === BrewMethod.Capsule) return

        const now = control.millis()
        const dur = this.getBrewTime()

        if (this.state === BrewState.Processing && now - this.timerStart >= dur) {
            this.state = BrewState.Ready
            this.timerStart = now
            music.playTone(1175, 100)
            this.sprite.startEffect(effects.warmRadial, 1000)
        }
        else if (this.state === BrewState.Ready && this.method !== BrewMethod.Grinder) {
            let lvl = this.method === BrewMethod.Espresso ? espressoLevel : 1
            const spoil = this.method === BrewMethod.Espresso ? (2000 + (lvl * 1000)) : 10000
            if (now - this.timerStart >= spoil) {
                this.state = BrewState.Ruined
                music.playTone(196, 200)
                this.sprite.startEffect(effects.fire, 2000)
                scene.cameraShake(4, 400)
            }
        }

        this.sprite.setImage(this.baseImage.clone())
        this.applyMethodColor()

        if (this.method !== BrewMethod.V60) {
            let lightCol = 5
            if (this.state === BrewState.Ready) lightCol = 7
            if (this.state === BrewState.Ruined) lightCol = 2
            this.sprite.image.fillRect(1, 1, 3, 3, lightCol)
        }
    }

    interact(carry: CarryType): CarryType {
        // Máquina de Cápsulas (A salvação instantânea)
        if (this.method === BrewMethod.Capsule) {
            if (carry === CarryType.RawMan || carry === CarryType.RawCol) {
                cupMethod = BrewMethod.Capsule
                cupBean = carry === CarryType.RawMan ? BeanType.Mantiqueira : BeanType.Colombian
                music.magicWand.play() // Som mágico para café instantâneo
                this.sprite.startEffect(effects.confetti, 500)
                return CarryType.Cup
            }
            return carry
        }

        if (this.method === BrewMethod.Grinder) {
            if (this.state === BrewState.Idle && (carry === CarryType.RawMan || carry === CarryType.RawCol)) {
                this.loadedBean = carry === CarryType.RawMan ? BeanType.Mantiqueira : BeanType.Colombian
                this.state = BrewState.Processing
                this.timerStart = control.millis()
                music.knock.play()
                return CarryType.Nothing
            }
            if (this.state === BrewState.Ready && carry === CarryType.Nothing) {
                const out = this.loadedBean === BeanType.Mantiqueira ? CarryType.GroundMan : CarryType.GroundCol
                this.state = BrewState.Idle
                this.loadedBean = BeanType.None
                return out
            }
        }
        else {
            if (this.state === BrewState.Idle && (carry === CarryType.GroundMan || carry === CarryType.GroundCol)) {
                this.loadedBean = carry === CarryType.GroundMan ? BeanType.Mantiqueira : BeanType.Colombian
                this.state = BrewState.Processing
                this.timerStart = control.millis()
                music.jumpDown.play()
                return CarryType.Nothing
            }
            if (this.state === BrewState.Ready && carry === CarryType.Nothing) {
                this.state = BrewState.Idle
                return CarryType.Cup
            }
            if (this.state === BrewState.Ruined) {
                this.state = BrewState.Idle
                this.loadedBean = BeanType.None
                music.thump.play()
                return carry
            }
        }
        return carry
    }
}

// ════════════════════════════════════════════════════════════
// SISTEMA DE TURNOS E LOJA (TYCOON)
// ════════════════════════════════════════════════════════════

function showStoryIntro() {
    // Telas de Instruções
    game.splash("AÇÕES", "Botão A (Z): Interagir / Servir")
    game.splash("AÇÕES", "Botão B (X): Descartar item")
    game.splash("COMO JOGAR", "Movimento: WASD / Setas")       
    game.splash("OBJETIVO", "Combine o Grão e Metodo com o balão")

    // Narrativa
    game.showLongText("Finalmente abri minha cafeteria aqui em Itajubá!", DialogLayout.Bottom)
    game.showLongText("Peguei um empréstimo alto para comprar as máquinas.", DialogLayout.Bottom)
    game.showLongText("Preciso juntar R$ 5.000 em 7 dias, ou o banco toma tudo.", DialogLayout.Bottom)
    game.showLongText("Hora de focar. O expediente vai começar!", DialogLayout.Bottom)
}

function startDay() {
    game.splash(`Dia ${currentDay} de ${MAX_DAYS}`)
    isDayActive = true
    dayStartTime = control.millis()
    info.setLife(5)
}

function endOfDay() {
    isDayActive = false
    // Limpa os clientes estressados
    for (let c of customers) { if (c.active) { c.leave(false, 0) } }
    customers = []

    game.showLongText(`Fim do Expediente (Dia ${currentDay}). Caixa atual: R$ ${info.score()}`, DialogLayout.Center)

    if (currentDay >= MAX_DAYS) {
        if (info.score() >= DEBT_GOAL) {
            game.splash("PARABENS!", "Voce pagou a divida!")
            game.over(true)
        } else {
            game.splash("FALENCIA!", "A divida te devorou.")
            game.over(false)
        }
    } else {
        openShop()
        currentDay++
        startDay()
    }
}

function openShop() {
    game.showLongText("--- BEM VINDO A LOJA ---", DialogLayout.Bottom)

    if (grinderLevel < 3) {
        if (game.ask(`Melhorar Moedor? (R$ 200)`, `Lvl atual: ${grinderLevel}`)) {
            if (info.score() >= 200) {
                info.changeScoreBy(-200)
                grinderLevel++
                music.powerUp.play()
            } else { game.showLongText("Sem dinheiro!", DialogLayout.Bottom) }
        }
    }

    if (espressoLevel < 3) {
        if (game.ask(`Melhorar Espresso? (R$ 300)`, `Evita queimar rapido`)) {
            if (info.score() >= 300) {
                info.changeScoreBy(-300)
                espressoLevel++
                music.powerUp.play()
            } else { game.showLongText("Sem dinheiro!", DialogLayout.Bottom) }
        }
    }

    if (!hasCapsuleMachine) {
        if (game.ask(`Maq. Capsulas (R$ 1000)`, `Preparo instantaneo`)) {
            if (info.score() >= 1000) {
                info.changeScoreBy(-1000)
                hasCapsuleMachine = true
                stations.push(new Station(POS_CAPSULE.x, POS_CAPSULE.y, BrewMethod.Capsule, Assets.espresso)) // Reusa asset com cor base rosa
                music.powerUp.play()
            } else { game.showLongText("Sem dinheiro!", DialogLayout.Bottom) }
        }
    }
}

// ════════════════════════════════════════════════════════════
// INIT & CONTROLES
// ════════════════════════════════════════════════════════════

function init() {
    info.setScore(0)

    // Música Lo-Fi em plano de fundo contínuo
    forever(function () {
        music.playMelody("E G B A G E D E ", 90)
    })

    showStoryIntro()

    const floorPattern = sprites.create(image.create(160, 120), SpriteKind.Decor)
    for (let x = 0; x < 160; x += 16) {
        for (let y = 0; y < 120; y += 16) {
            floorPattern.image.drawTransparentImage(Assets.floorTile, x, y)
        }
    }
    floorPattern.z = -10

    const counter = sprites.create(image.create(160, 32), SpriteKind.Decor)
    for (let x = 0; x < 160; x += 16) {
        counter.image.drawTransparentImage(Assets.counterTile, x, 0)
        counter.image.drawTransparentImage(Assets.counterTile, x, 16)
    }
    counter.setPosition(80, 15)
    counter.z = -5

    let bM = sprites.create(Assets.beanBagMantiqueira.clone(), SpriteKind.Decor)
    bM.setPosition(POS_BEAN_MANT.x, POS_BEAN_MANT.y)

    let bC = sprites.create(Assets.beanBagColombian.clone(), SpriteKind.Decor)
    bC.setPosition(POS_BEAN_COLO.x, POS_BEAN_COLO.y)

    stations.push(new Station(POS_GRINDER.x, POS_GRINDER.y, BrewMethod.Grinder, Assets.grinder))
    stations.push(new Station(POS_ESPRESSO.x, POS_ESPRESSO.y, BrewMethod.Espresso, Assets.espresso))
    stations.push(new Station(POS_V60.x, POS_V60.y, BrewMethod.V60, Assets.v60))

    barista = sprites.create(Assets.baristaBase.clone(), SpriteKind.Player)
    barista.setPosition(80, 76)
    controller.moveSprite(barista, 100, 100)

    startDay()
}

function updateBaristaBadge() {
    barista.setImage(Assets.baristaBase.clone())
    if (carrying !== CarryType.Nothing) {
        let col = 1
        if (carrying === CarryType.RawMan || carrying === CarryType.GroundMan) col = 7
        if (carrying === CarryType.RawCol || carrying === CarryType.GroundCol) col = 4

        barista.image.fillRect(10, 0, 6, 6, 1)
        barista.image.setPixel(9, 4, 1)

        if (carrying === CarryType.Cup) {
            barista.image.fillRect(11, 1, 4, 4, 15)
            // Se for cápsula, copo tem borda rosa
            let cupColor = cupMethod === BrewMethod.Capsule ? 3 : 1
            barista.image.fillRect(12, 1, 2, 3, cupColor)
        } else {
            barista.image.fillRect(11, 1, 4, 4, col)
        }
    }
}

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!isDayActive) return
    const bx = barista.x
    const by = barista.y

    if (carrying === CarryType.Nothing) {
        if (Math.abs(bx - POS_BEAN_MANT.x) < ZONE_R && Math.abs(by - POS_BEAN_MANT.y) < ZONE_R) {
            carrying = CarryType.RawMan; updateBaristaBadge(); return
        }
        if (Math.abs(bx - POS_BEAN_COLO.x) < ZONE_R && Math.abs(by - POS_BEAN_COLO.y) < ZONE_R) {
            carrying = CarryType.RawCol; updateBaristaBadge(); return
        }
    }

    for (let st of stations) {
        if (Math.abs(bx - st.sprite.x) < ZONE_R && Math.abs(by - st.sprite.y) < ZONE_R) {
            let res = st.interact(carrying)
            if (res !== carrying) {
                if (res === CarryType.Cup) { cupBean = st.loadedBean; cupMethod = st.method }
                carrying = res
                updateBaristaBadge()
            }
            return
        }
    }

    if (by <= WALL_Y + 12 && carrying === CarryType.Cup) {
        let closest: Customer = null
        let minDist = 999
        for (let c of customers) {
            if (c.active && Math.abs(bx - c.slotX) < minDist) { minDist = Math.abs(bx - c.slotX); closest = c }
        }
        if (closest && minDist < 24) {
            if (closest.serve(cupBean, cupMethod)) {
                carrying = CarryType.Nothing
                updateBaristaBadge()
            } else {
                music.buzzer.play()
                barista.say("Errado!", 500)
            }
        }
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!isDayActive) return
    if (carrying !== CarryType.Nothing) {
        carrying = CarryType.Nothing
        updateBaristaBadge()
        barista.startEffect(effects.ashes, 200)
    }
})

// ════════════════════════════════════════════════════════════
// GAME LOOP PRINCIPAL
// ════════════════════════════════════════════════════════════

game.onUpdate(function () {
    if (!barista || !isDayActive) return

    // Checagem de Fim de Expediente
    if (control.millis() - dayStartTime >= dayLengthMs) {
        endOfDay()
        return
    }

    if (barista.y < WALL_Y) { barista.y = WALL_Y; if (barista.vy < 0) barista.vy = 0 }

    let moving = Math.abs(barista.vx) > 0 || Math.abs(barista.vy) > 0
    if (moving) barista.y += Math.sin(control.millis() / 50) * 0.5

    for (let st of stations) st.update()

    customers = customers.filter(c => c.active)
    for (let c of customers) c.update()

    let elapsed = control.millis() - dayStartTime
    // Rush Hour acontece no meio do dia
    if (elapsed % 60000 < 10000 && elapsed > 10000) {
        if (!isRushHour) {
            isRushHour = true
            game.splash("RUSH HOUR!", "Sobreviva ao pico!")
        }
    } else if (isRushHour) {
        isRushHour = false
    }

    // Dificuldade cresce com os dias
    let spawnRate = Math.max(2000, 8000 - (currentDay * 800))
    if (isRushHour) spawnRate = 1500

    if (customers.length < 4 && control.millis() - lastSpawn > spawnRate) {
        const slots = [20, 60, 100, 140]
        const used = customers.map(c => c.slotX)
        const free = slots.filter(s => used.indexOf(s) === -1)

        if (free.length > 0) {
            customers.push(new Customer(free[Math.randomRange(0, free.length - 1)]))
            lastSpawn = control.millis()
        }
    }
})

init()
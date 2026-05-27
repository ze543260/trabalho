# Barista Game: Four Phases Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement a complete coffee shop management game with story-driven dialog, brewing mechanics, atmospheric ambiance, and persistent progression across four development phases.

**Architecture:** 
- Phase 1 enhances DialogScene with character personality (unique tones), dynamic portrait expressions, player choice system, and affinity tracking
- Phase 2 polishes BrewScene with timing-based QTE mechanics, visual feedback, and success/failure evaluation
- Phase 3 upgrades CafeScene with procedural weather, day/night cycle, and adaptive music layering
- Phase 4 adds ShopScene with customer profiles, ingredient unlocks, and progression persistence via ArrayBuffer storage

**Tech Stack:** MakeCode Arcade, TypeScript, custom Engine namespace with Scene/SpritePool/FXManager architecture

---

## Phase 1: Story Engine (DialogScene)

### Task 1.1: Add Character Data Structure

**Files:**
- Create: `engine/entities/Character.ts`

- [ ] **Step 1: Create Character.ts with personality metadata**

```typescript
namespace Engine.Entities {
    export enum CharacterTone {
        Mysterious = 1,  // 220Hz (grave)
        Cheerful = 2,    // 440Hz (high)
        Calm = 3,        // 330Hz (neutral)
        Rushed = 4,      // 550Hz (urgent)
    }

    export class Character {
        public name: string;
        public tone: CharacterTone;
        public basePortraitIndex: number; // 0=happy, 1=sad, 2=thoughtful
        public currentExpression: number; // 0=happy, 1=sad, 2=thoughtful

        constructor(name: string, tone: CharacterTone, basePortrait: number) {
            this.name = name;
            this.tone = tone;
            this.basePortraitIndex = basePortrait;
            this.currentExpression = 0; // Start happy
        }

        public getToneFrequency(): number {
            switch (this.tone) {
                case CharacterTone.Mysterious: return 220;
                case CharacterTone.Cheerful: return 440;
                case CharacterTone.Calm: return 330;
                case CharacterTone.Rushed: return 550;
                default: return 330;
            }
        }

        public setExpression(expression: number): void {
            if (expression >= 0 && expression <= 2) {
                this.currentExpression = expression;
            }
        }

        public getPortraitImage(): Image {
            // Returns a 32x32 portrait sprite
            // Index: basePortraitIndex * 3 + currentExpression
            return assets.image.byOne(this.basePortraitIndex * 3 + this.currentExpression);
        }
    }
}
```

- [ ] **Step 2: Verify Character.ts compiles**

Run: `pxt build`
Expected: No compilation errors

---

### Task 1.2: Create Portrait Sprite Assets

**Files:**
- Create: `assets/portraits/portraits.json` (metadata)
- Assets needed: 3 expressions × 4 character types = 12 portraits (32×32 each)

- [ ] **Step 1: Outline portrait requirements**

For each character type (Mysterious Student, Cheerful Regular, Calm Elder, Rushed Professional):
- Expression 0: Happy (mouth curve up, eyes open bright)
- Expression 1: Sad (mouth curve down, eyes narrowed)
- Expression 2: Thoughtful (mouth neutral, eyes half-closed, brow furrowed)

Each portrait must fit in 32×32 px and use the game's 16-color palette (browns, oranges, blues).

- [ ] **Step 2: Document portrait asset IDs in metadata file**

Create `assets/portraits/portraits.json`:
```json
{
  "characters": [
    {
      "id": 0,
      "name": "Mysterious Student",
      "tone": "Mysterious",
      "portraits": {
        "happy": "img_char0_happy",
        "sad": "img_char0_sad",
        "thoughtful": "img_char0_thoughtful"
      }
    },
    {
      "id": 1,
      "name": "Cheerful Regular",
      "tone": "Cheerful",
      "portraits": {
        "happy": "img_char1_happy",
        "sad": "img_char1_sad",
        "thoughtful": "img_char1_thoughtful"
      }
    },
    {
      "id": 2,
      "name": "Calm Elder",
      "tone": "Calm",
      "portraits": {
        "happy": "img_char2_happy",
        "sad": "img_char2_sad",
        "thoughtful": "img_char2_thoughtful"
      }
    },
    {
      "id": 3,
      "name": "Rushed Professional",
      "tone": "Rushed",
      "portraits": {
        "happy": "img_char3_happy",
        "sad": "img_char3_sad",
        "thoughtful": "img_char3_thoughtful"
      }
    }
  ]
}
```

- [ ] **Step 3: Create portrait sprite sheets in MakeCode**

In MakeCode asset editor:
- Create 12 new images (32×32 each) for the portrait metadata above
- Name them according to portrait.json (img_char0_happy, img_char0_sad, etc.)
- Use only palette colors 1-15 (no black backgrounds inside portraits, use color 0 for transparency)

---

### Task 1.3: Update DialogScene with Character Tones

**Files:**
- Modify: `engine/scenes/DialogScene.ts`

- [ ] **Step 1: Update DialogScene constructor to accept Character**

Replace lines 13-22 in DialogScene.ts:

```typescript
private character: Engine.Entities.Character;
private portrait: Image;
private lines: string[];
private currentLineIndex: number;
private displayedText: string;
private targetText: string;
private ticks: number;
private onComplete: () => void;
private bgCache: Image;
private renderable: scene.Renderable;

constructor(character: Engine.Entities.Character, lines: string[], onComplete: () => void) {
    this.character = character;
    this.portrait = character.getPortraitImage();
    this.lines = lines;
    this.onComplete = onComplete;
    this.currentLineIndex = 0;
    this.displayedText = "";
    this.targetText = lines.length > 0 ? lines[0] : "";
    this.ticks = 0;
    this.bgCache = null;
}
```

- [ ] **Step 2: Update typewriter effect to use character tone**

Replace lines 375-384 (the update loop typewriter logic):

```typescript
public update(dt: number): void {
    this.ticks++;
    if (this.displayedText.length < this.targetText.length) {
        this.displayedText = this.targetText.substr(0, this.displayedText.length + 1);
        if (this.displayedText.length % 3 === 0) {
            let lastChar = this.displayedText.charAt(this.displayedText.length - 1);
            if (lastChar !== " ") {
                // Use character-specific tone frequency
                let freq = this.character.getToneFrequency();
                music.playTone(freq, 10);
            }
        }
    }

    if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
        if (this.displayedText.length < this.targetText.length) {
            this.displayedText = this.targetText;
        } else {
            this.currentLineIndex++;
            if (this.currentLineIndex < this.lines.length) {
                this.targetText = this.lines[this.currentLineIndex];
                this.displayedText = "";
            } else {
                Engine.Scenes.SceneStack.pop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }
    }
}
```

- [ ] **Step 3: Verify DialogScene still compiles**

Run: `pxt build`
Expected: No compilation errors

- [ ] **Step 4: Test in game**

1. Start game and reach a dialog
2. Verify typewriter plays tones at correct frequencies per character
3. Check portrait displays correctly (should match character)
4. Commit: `git add engine/entities/Character.ts engine/scenes/DialogScene.ts && git commit -m "feat: add character personality tones to dialog"`

---

### Task 1.4: Add Dynamic Portrait Expressions

**Files:**
- Modify: `engine/scenes/DialogScene.ts`

- [ ] **Step 1: Add expression change hooks during dialog flow**

Add after line 22 in DialogScene constructor:

```typescript
// Expression can change based on dialog progress
// -1 = no change, 0 = happy, 1 = sad, 2 = thoughtful
private nextExpressionIndex: number = -1;
```

- [ ] **Step 2: Add method to trigger expression change**

Add after the update() method (after line 403):

```typescript
public changeCharacterExpression(expressionIndex: number): void {
    this.nextExpressionIndex = expressionIndex;
    this.character.setExpression(expressionIndex);
}
```

- [ ] **Step 3: Update enter() to redraw portrait when expression changes**

Modify the renderable's portrait drawing section (lines 318-325) to always fetch the latest portrait:

```typescript
// ── RETRATO (canto superior direito, sobre o fundo) ─────────
if (this.character) {
    let currentPortrait = this.character.getPortraitImage();
    // Moldura escura atrás do retrato
    screen.fillRect(105, 22, 52, 52, 1);
    screen.drawRect(104, 21, 54, 54, 14);
    screen.drawRect(103, 20, 56, 56, 0);
    screen.drawTransparentImage(currentPortrait, 106, 23);
}
```

- [ ] **Step 4: Test expression changes**

1. Add a test dialog with expression changes in MenuScene
2. Verify portrait updates when expression is called
3. Run: `pxt build`
4. Test in game: dialog progresses, portrait expression changes
5. Commit: `git add engine/scenes/DialogScene.ts && git commit -m "feat: dynamic portrait expressions in dialog"`

---

### Task 1.5: Implement Dialog Choice System

**Files:**
- Create: `engine/entities/DialogChoice.ts`
- Modify: `engine/scenes/DialogScene.ts`

- [ ] **Step 1: Create DialogChoice data structure**

Create `engine/entities/DialogChoice.ts`:

```typescript
namespace Engine.Entities {
    export class DialogChoice {
        public text: string;
        public affinityDelta: number; // How much this choice affects affinity (-1, 0, +1)
        public nextLineIndex: number; // Which dialog line to jump to after choice

        constructor(text: string, affinityDelta: number, nextLineIndex: number) {
            this.text = text;
            this.affinityDelta = affinityDelta;
            this.nextLineIndex = nextLineIndex;
        }
    }

    export class DialogNode {
        public text: string;
        public expression: number; // 0=happy, 1=sad, 2=thoughtful
        public choices: DialogChoice[]; // If empty, just shows text

        constructor(text: string, expression: number = 0, choices: DialogChoice[] = []) {
            this.text = text;
            this.expression = expression;
            this.choices = choices;
        }
    }
}
```

- [ ] **Step 2: Add choice system to DialogScene**

Replace DialogScene constructor and add choice handling:

```typescript
private character: Engine.Entities.Character;
private dialogNodes: Engine.Entities.DialogNode[];
private currentNodeIndex: number;
private displayedText: string;
private targetText: string;
private ticks: number;
private onComplete: () => void;
private bgCache: Image;
private renderable: scene.Renderable;
private showingChoices: boolean = false;
private selectedChoiceIndex: number = 0;

constructor(character: Engine.Entities.Character, nodes: Engine.Entities.DialogNode[], onComplete: () => void) {
    this.character = character;
    this.dialogNodes = nodes;
    this.currentNodeIndex = 0;
    this.displayedText = "";
    this.targetText = nodes.length > 0 ? nodes[0].text : "";
    this.showingChoices = false;
    this.selectedChoiceIndex = 0;
    this.onComplete = onComplete;
    this.ticks = 0;
    this.bgCache = null;
}
```

- [ ] **Step 3: Add choice rendering to enter() renderable**

After the dialog text rendering (after line 357), add before the cursor blinking section:

```typescript
// ── CHOICE BUTTONS (if showing choices) ──────────────────
if (this.showingChoices && this.currentNodeIndex < this.dialogNodes.length) {
    let currentNode = this.dialogNodes[this.currentNodeIndex];
    let choiceCount = currentNode.choices.length;
    let startY = 92;
    
    for (let i = 0; i < choiceCount; i++) {
        let isSelected = (i === this.selectedChoiceIndex);
        let bgColor = isSelected ? 14 : 2;
        let textColor = isSelected ? 1 : 5;
        
        // Draw choice box
        screen.fillRect(5, startY + i * 10, 150, 9, bgColor);
        screen.drawRect(4, startY + i * 10 - 1, 152, 11, 0);
        
        // Draw choice text
        screen.print(currentNode.choices[i].text, 7, startY + i * 10, textColor, image.font5);
    }
}
```

- [ ] **Step 4: Update update() to handle choice selection**

Replace the input handling in update():

```typescript
public update(dt: number): void {
    this.ticks++;
    
    if (!this.showingChoices) {
        // Typewriter mode
        if (this.displayedText.length < this.targetText.length) {
            this.displayedText = this.targetText.substr(0, this.displayedText.length + 1);
            if (this.displayedText.length % 3 === 0) {
                let lastChar = this.displayedText.charAt(this.displayedText.length - 1);
                if (lastChar !== " ") {
                    let freq = this.character.getToneFrequency();
                    music.playTone(freq, 10);
                }
            }
        }

        if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
            if (this.displayedText.length < this.targetText.length) {
                this.displayedText = this.targetText;
            } else {
                let currentNode = this.dialogNodes[this.currentNodeIndex];
                if (currentNode.choices.length > 0) {
                    // Show choice buttons
                    this.showingChoices = true;
                    this.selectedChoiceIndex = 0;
                } else {
                    // No choices, advance to next node
                    this.currentNodeIndex++;
                    if (this.currentNodeIndex < this.dialogNodes.length) {
                        let nextNode = this.dialogNodes[this.currentNodeIndex];
                        this.targetText = nextNode.text;
                        this.displayedText = "";
                        this.character.setExpression(nextNode.expression);
                    } else {
                        Engine.Scenes.SceneStack.pop();
                        if (this.onComplete) {
                            this.onComplete();
                        }
                    }
                }
            }
        }
    } else {
        // Choice selection mode
        let currentNode = this.dialogNodes[this.currentNodeIndex];
        
        if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
            this.selectedChoiceIndex = (this.selectedChoiceIndex - 1 + currentNode.choices.length) % currentNode.choices.length;
        }
        if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
            this.selectedChoiceIndex = (this.selectedChoiceIndex + 1) % currentNode.choices.length;
        }
        
        if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
            let selectedChoice = currentNode.choices[this.selectedChoiceIndex];
            // Apply affinity change (stored in customer data)
            // TODO: integrate with customer affinity system (Phase 4)
            // Jump to next node specified by choice
            this.currentNodeIndex = selectedChoice.nextLineIndex;
            this.targetText = this.dialogNodes[this.currentNodeIndex].text;
            this.displayedText = "";
            this.character.setExpression(this.dialogNodes[this.currentNodeIndex].expression);
            this.showingChoices = false;
            this.selectedChoiceIndex = 0;
        }
    }
}
```

- [ ] **Step 5: Verify compilation**

Run: `pxt build`
Expected: No errors

- [ ] **Step 6: Test choice system**

1. Create test dialog with choices in MenuScene
2. Reach dialog, verify text appears, then choices appear
3. Use arrow keys to select choice, interact to select
4. Verify dialog jumps correctly
5. Commit: `git add engine/entities/DialogChoice.ts engine/scenes/DialogScene.ts && git commit -m "feat: dialog choice system with branching"`

---

### Task 1.6: Add Customer Affinity Tracking

**Files:**
- Create: `engine/entities/CustomerProfile.ts`
- Modify: `engine/scenes/DialogScene.ts`

- [ ] **Step 1: Create CustomerProfile structure**

Create `engine/entities/CustomerProfile.ts`:

```typescript
namespace Engine.Entities {
    export class CustomerProfile {
        public id: number;
        public character: Engine.Entities.Character;
        public affinity: number; // -100 to +100
        public favoriteRecipe: Engine.Entities.DrinkRecipe | null;
        public visitCount: number;
        public lastOrderedDrink: Engine.Entities.DrinkRecipe | null;

        constructor(id: number, character: Engine.Entities.Character) {
            this.id = id;
            this.character = character;
            this.affinity = 0;
            this.favoriteRecipe = null;
            this.visitCount = 0;
            this.lastOrderedDrink = null;
        }

        public modifyAffinity(delta: number): void {
            this.affinity = Math.max(-100, Math.min(100, this.affinity + delta));
        }

        public recordOrder(recipe: Engine.Entities.DrinkRecipe): void {
            this.visitCount++;
            this.lastOrderedDrink = recipe;
        }

        public setFavoriteRecipe(recipe: Engine.Entities.DrinkRecipe): void {
            this.favoriteRecipe = recipe;
        }

        public getAffinityLevel(): string {
            if (this.affinity < -50) return "hostile";
            if (this.affinity < -25) return "cold";
            if (this.affinity < 0) return "neutral";
            if (this.affinity < 25) return "friendly";
            if (this.affinity < 50) return "close";
            return "intimate";
        }
    }
}
```

- [ ] **Step 2: Pass customer profile to DialogScene**

Update DialogScene constructor:

```typescript
private character: Engine.Entities.Character;
private customer: Engine.Entities.CustomerProfile;
private dialogNodes: Engine.Entities.DialogNode[];
private currentNodeIndex: number;
private displayedText: string;
private targetText: string;
private ticks: number;
private onComplete: () => void;
private bgCache: Image;
private renderable: scene.Renderable;
private showingChoices: boolean = false;
private selectedChoiceIndex: number = 0;

constructor(customer: Engine.Entities.CustomerProfile, nodes: Engine.Entities.DialogNode[], onComplete: () => void) {
    this.customer = customer;
    this.character = customer.character;
    this.dialogNodes = nodes;
    this.currentNodeIndex = 0;
    this.displayedText = "";
    this.targetText = nodes.length > 0 ? nodes[0].text : "";
    this.showingChoices = false;
    this.selectedChoiceIndex = 0;
    this.onComplete = onComplete;
    this.ticks = 0;
    this.bgCache = null;
}
```

- [ ] **Step 3: Apply affinity changes when choices are made**

In update(), replace the choice selection block:

```typescript
if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
    let selectedChoice = currentNode.choices[this.selectedChoiceIndex];
    // Apply affinity change
    this.customer.modifyAffinity(selectedChoice.affinityDelta * 10); // 10 points per delta
    // Jump to next node
    this.currentNodeIndex = selectedChoice.nextLineIndex;
    this.targetText = this.dialogNodes[this.currentNodeIndex].text;
    this.displayedText = "";
    this.character.setExpression(this.dialogNodes[this.currentNodeIndex].expression);
    this.showingChoices = false;
    this.selectedChoiceIndex = 0;
}
```

- [ ] **Step 4: Display affinity indicator in dialog**

In the enter() renderable, add affinity display near customer name:

```typescript
// Display affinity level under character name
if (this.customer) {
    let affinityStr = this.customer.getAffinityLevel();
    let affinityColor = 8; // neutral gray
    if (affinityStr === "hostile") affinityColor = 2; // red
    else if (affinityStr === "cold") affinityColor = 10; // cool blue
    else if (affinityStr === "friendly") affinityColor = 14; // warm orange
    else if (affinityStr === "close") affinityColor = 12; // pink
    else if (affinityStr === "intimate") affinityColor = 15; // bright yellow
    
    screen.print("(" + affinityStr + ")", 7, 80, affinityColor, image.font5);
}
```

- [ ] **Step 5: Test affinity system**

1. Create test dialog with different affinity choices
2. Select high-affinity choice, verify affinity increases
3. Select low-affinity choice, verify affinity decreases
4. Check affinity label changes color
5. Commit: `git add engine/entities/CustomerProfile.ts engine/scenes/DialogScene.ts && git commit -m "feat: customer affinity tracking in dialog"`

---

## Phase 2: The Ritual of Café (BrewScene)

### Task 2.1: Add Timing-Based QTE System

**Files:**
- Create: `engine/minigames/QTEController.ts`

- [ ] **Step 1: Create QTE (Quick Time Event) controller**

Create `engine/minigames/QTEController.ts`:

```typescript
namespace Engine.Minigames {
    export class QTEEvent {
        public targetPosition: number; // 0-100 (needle position)
        public duration: number; // milliseconds
        public successWindow: number; // pixels from center (e.g., 10 = ±10px window)
        public currentTime: number;

        constructor(target: number, duration: number, window: number) {
            this.targetPosition = target;
            this.duration = duration;
            this.successWindow = window;
            this.currentTime = 0;
        }

        public isSuccess(currentNeedle: number): boolean {
            let diff = Math.abs(currentNeedle - this.targetPosition);
            return diff <= this.successWindow;
        }

        public isComplete(): boolean {
            return this.currentTime >= this.duration;
        }

        public getProgress(): number {
            return this.currentTime / this.duration;
        }

        public update(dt: number): void {
            this.currentTime += dt;
        }
    }

    export class QTEController {
        private events: QTEEvent[];
        private currentEventIndex: number;
        private needlePosition: number; // 0-100
        private needleVelocity: number; // pixels per ms
        private totalScore: number;

        constructor() {
            this.events = [];
            this.currentEventIndex = 0;
            this.needlePosition = 50;
            this.needleVelocity = 0.1;
            this.totalScore = 0;
        }

        public addEvent(qte: QTEEvent): void {
            this.events.push(qte);
        }

        public getCurrentEvent(): QTEEvent | null {
            if (this.currentEventIndex < this.events.length) {
                return this.events[this.currentEventIndex];
            }
            return null;
        }

        public isComplete(): boolean {
            return this.currentEventIndex >= this.events.length;
        }

        public getScore(): number {
            return this.totalScore;
        }

        public update(dt: number): void {
            let current = this.getCurrentEvent();
            if (!current) return;

            current.update(dt);

            // Move needle back and forth (simple oscillation)
            this.needlePosition += this.needleVelocity;
            if (this.needlePosition <= 0 || this.needlePosition >= 100) {
                this.needleVelocity *= -1;
            }

            if (current.isComplete()) {
                // Check if success
                if (current.isSuccess(this.needlePosition)) {
                    this.totalScore += 10;
                } else {
                    this.totalScore = Math.max(0, this.totalScore - 5);
                }
                this.currentEventIndex++;
            }
        }

        public getNeedlePosition(): number {
            return this.needlePosition;
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `pxt build`
Expected: No errors

---

### Task 2.2: Integrate QTE into BrewScene

**Files:**
- Modify: `engine/scenes/BrewScene.ts`

- [ ] **Step 1: Add QTE phase to BrewScene states**

Add to the enum at top of BrewScene.ts:

```typescript
enum BrewState {
    Selecting,
    QTEExtraction,
    QTEFoaming,
    Complete,
}
```

- [ ] **Step 2: Add QTE controller and state to BrewScene**

Add after line 12:

```typescript
private brewState: BrewState;
private qteController: Engine.Minigames.QTEController;
private extractionScore: number;
private foamingScore: number;
```

- [ ] **Step 3: Update constructor to initialize QTE**

Replace constructor (around line 8-12):

```typescript
constructor(recipe: Engine.Entities.DrinkRecipe, onComplete: (finalRecipe: Engine.Entities.DrinkRecipe) => void) {
    this.onComplete = onComplete;
    this.recipe = recipe;
    this.cursorIndex = 0;
    this.brewState = BrewState.Selecting;
    this.qteController = new Engine.Minigames.QTEController();
    this.extractionScore = 0;
    this.foamingScore = 0;
    
    // Initialize QTE events for extraction and foaming
    this.qteController.addEvent(new Engine.Minigames.QTEEvent(50, 2000, 10)); // 2s extraction
    this.qteController.addEvent(new Engine.Minigames.QTEEvent(70, 1500, 8));  // 1.5s foaming
}
```

- [ ] **Step 4: Add QTE rendering to drawScene()**

Before the closing brace of drawScene() method, add:

```typescript
// ─── QTE DISPLAY (if in QTE phase) ────────────────────────
if (this.brewState === BrewState.QTEExtraction || this.brewState === BrewState.QTEFoaming) {
    let qte = this.qteController.getCurrentEvent();
    if (qte) {
        // Draw meter background
        screen.fillRect(20, 45, 120, 15, 1);
        screen.drawRect(20, 45, 120, 15, 0);
        
        // Draw target zone (green)
        let targetX = 20 + (qte.targetPosition * 120) / 100;
        screen.fillRect(targetX - qte.successWindow, 45, qte.successWindow * 2, 15, 11);
        
        // Draw needle
        let needleX = 20 + (qte.needlePosition * 120) / 100;
        screen.fillRect(needleX - 2, 40, 4, 25, 14);
        
        // Draw phase label
        let phaseLabel = this.brewState === BrewState.QTEExtraction ? "EXTRACAO" : "ESPUMA";
        screen.print(phaseLabel, 10, 30, 5, image.font5);
        
        // Draw progress bar
        let progress = Math.floor(qte.getProgress() * 100);
        screen.print("Progress: " + progress + "%", 10, 62, 8, image.font5);
    }
}
```

- [ ] **Step 5: Update update() to handle QTE phases**

Replace the update() method with QTE handling (lines after constructor):

```typescript
public update(dt: number): void {
    if (this.brewState === BrewState.Selecting) {
        // Original selection logic remains here
        // ... (keep existing code)
    } else if (this.brewState === BrewState.QTEExtraction) {
        this.qteController.update(dt);
        if (this.qteController.isComplete()) {
            this.extractionScore = this.qteController.getScore();
            // Reset for foaming phase
            this.qteController = new Engine.Minigames.QTEController();
            this.qteController.addEvent(new Engine.Minigames.QTEEvent(70, 1500, 8));
            this.brewState = BrewState.QTEFoaming;
        }
    } else if (this.brewState === BrewState.QTEFoaming) {
        this.qteController.update(dt);
        if (this.qteController.isComplete()) {
            this.foamingScore = this.qteController.getScore();
            this.brewState = BrewState.Complete;
        }
    } else if (this.brewState === BrewState.Complete) {
        if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
            Engine.Scenes.SceneStack.pop();
            if (this.onComplete) {
                this.onComplete(this.recipe);
            }
        }
    }
}
```

- [ ] **Step 6: Test QTE integration**

Run: `pxt build`
Expected: No compilation errors

- [ ] **Step 7: Test in game**

1. Start BrewScene, reach completion
2. Verify QTE extraction phase appears
3. Try to time needle to green zone
4. Verify foaming phase appears after extraction
5. Commit: `git add engine/minigames/QTEController.ts engine/scenes/BrewScene.ts && git commit -m "feat: add QTE timing mechanics to brew scene"`

---

### Task 2.3: Add Brew Success/Failure Evaluation

**Files:**
- Modify: `engine/scenes/BrewScene.ts`
- Create: `engine/entities/BrewResult.ts`

- [ ] **Step 1: Create BrewResult structure**

Create `engine/entities/BrewResult.ts`:

```typescript
namespace Engine.Entities {
    export enum BrewQuality {
        Failed,      // QTE score < 5
        Poor,        // 5-10
        Good,        // 10-15
        Perfect,     // 15+
    }

    export class BrewResult {
        public recipe: Engine.Entities.DrinkRecipe;
        public extractionScore: number;
        public foamingScore: number;
        public totalScore: number;
        public quality: BrewQuality;

        constructor(recipe: Engine.Entities.DrinkRecipe, extraction: number, foaming: number) {
            this.recipe = recipe;
            this.extractionScore = extraction;
            this.foamingScore = foaming;
            this.totalScore = extraction + foaming;
            
            if (this.totalScore < 5) this.quality = BrewQuality.Failed;
            else if (this.totalScore < 10) this.quality = BrewQuality.Poor;
            else if (this.totalScore < 15) this.quality = BrewQuality.Good;
            else this.quality = BrewQuality.Perfect;
        }

        public getQualityString(): string {
            switch (this.quality) {
                case BrewQuality.Failed: return "QUEIMADO!";
                case BrewQuality.Poor: return "Fraco";
                case BrewQuality.Good: return "Bom";
                case BrewQuality.Perfect: return "PERFEITO!";
                default: return "?";
            }
        }

        public getQualityColor(): number {
            switch (this.quality) {
                case BrewQuality.Failed: return 2; // red
                case BrewQuality.Poor: return 10; // blue
                case BrewQuality.Good: return 14; // orange
                case BrewQuality.Perfect: return 12; // pink
                default: return 5;
            }
        }
    }
}
```

- [ ] **Step 2: Update BrewScene to track and display brew quality**

In BrewScene, add field after line 12:

```typescript
private brewResult: Engine.Entities.BrewResult | null;
```

- [ ] **Step 3: Create BrewResult when QTE phases complete**

Replace the Complete state handling in update():

```typescript
} else if (this.brewState === BrewState.Complete) {
    if (!this.brewResult) {
        this.brewResult = new Engine.Entities.BrewResult(this.recipe, this.extractionScore, this.foamingScore);
    }
    
    if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
        Engine.Scenes.SceneStack.pop();
        if (this.onComplete) {
            this.onComplete(this.recipe);
        }
    }
}
```

- [ ] **Step 4: Display brew result on screen**

In drawScene(), after the QTE display code, add:

```typescript
// ─── RESULT DISPLAY (after QTE complete) ────────────────
if (this.brewState === BrewState.Complete && this.brewResult) {
    screen.fillRect(30, 35, 100, 50, 1);
    screen.drawRect(30, 35, 100, 50, 0);
    
    let qualityStr = this.brewResult.getQualityString();
    let qualityColor = this.brewResult.getQualityColor();
    let scoreStr = "Score: " + this.brewResult.totalScore;
    
    screen.print(qualityStr, 50, 45, qualityColor, image.font5);
    screen.print(scoreStr, 45, 60, 5, image.font5);
    screen.print("A = continuar", 35, 75, 8, image.font5);
}
```

- [ ] **Step 5: Verify compilation**

Run: `pxt build`
Expected: No errors

- [ ] **Step 6: Test brew evaluation**

1. Complete QTE phases with high scores (Perfect)
2. Verify "PERFEITO!" displays in pink
3. Try to fail QTE phases (low scores)
4. Verify "QUEIMADO!" displays in red
5. Commit: `git add engine/entities/BrewResult.ts engine/scenes/BrewScene.ts && git commit -m "feat: brew quality evaluation and visual feedback"`

---

## Phase 3: Atmosphere "Lo-Fi" Dinâmica (CafeScene)

### Task 3.1: Implement Day/Night Cycle

**Files:**
- Modify: `engine/scenes/CafeScene.ts`

- [ ] **Step 1: Add time-of-day tracking**

Add to CafeScene fields after line 15:

```typescript
private timeOfDay: number; // 0-1, where 0=afternoon (5pm), 0.5=evening (8pm), 1=night (11pm)
private ambientColor: number; // palette index for ambient lighting
```

- [ ] **Step 2: Update constructor to initialize time**

In constructor (around line 22-31), after maxCustomersPerDay assignment:

```typescript
// Time starts at afternoon (0.0)
this.timeOfDay = 0;
this.ambientColor = 14; // warm orange
```

- [ ] **Step 3: Create method to advance time**

Add after drawLofiBackground():

```typescript
private advanceTime(dt: number): void {
    // Each customer takes ~3 seconds, advances time by 0.1
    this.timeOfDay += dt / 30000; // slow progression
    if (this.timeOfDay > 1.0) this.timeOfDay = 1.0;
    
    // Update ambient color based on time
    if (this.timeOfDay < 0.3) {
        this.ambientColor = 14; // orange (5-6pm)
    } else if (this.timeOfDay < 0.6) {
        this.ambientColor = 13; // warm purple (6-8pm)
    } else if (this.timeOfDay < 0.8) {
        this.ambientColor = 10; // dark blue (8-10pm)
    } else {
        this.ambientColor = 9; // deep blue night (10-11pm)
    }
}
```

- [ ] **Step 4: Update drawLofiBackground to use time-based colors**

Replace the fillRect calls in drawLofiBackground():

```typescript
private drawLofiBackground() {
    // Use time-of-day color for overall tint
    this.bg.fill(this.ambientColor);
    
    // Janela shows sky gradient based on time
    let skyColor = this.ambientColor;
    this.bg.fillRect(20, 20, 50, 40, skyColor);
    this.bg.drawRect(19, 19, 52, 42, this.ambientColor === 14 ? 5 : 1);
    
    // Balcão stays relatively constant
    this.bg.fillRect(0, 80, 160, 40, 4);
    this.bg.drawLine(0, 80, 160, 80, 0);
}
```

- [ ] **Step 5: Call advanceTime in update()**

In update() method (around line 50+), at the start of the method:

```typescript
public update(dt: number): void {
    this.advanceTime(dt);
    // ... rest of update code ...
}
```

- [ ] **Step 6: Test day/night cycle**

1. Start CafeScene
2. Serve multiple customers to advance time
3. Verify background color gradually changes from orange to blue
4. Commit: `git add engine/scenes/CafeScene.ts && git commit -m "feat: day/night cycle with dynamic ambient colors"`

---

### Task 3.2: Add Procedural Weather Effects

**Files:**
- Create: `engine/graphics/WeatherSystem.ts`
- Modify: `engine/scenes/CafeScene.ts`

- [ ] **Step 1: Create WeatherSystem**

Create `engine/graphics/WeatherSystem.ts`:

```typescript
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
```

- [ ] **Step 2: Add WeatherSystem to CafeScene**

In CafeScene, add field after line 20:

```typescript
private weatherSystem: Engine.Graphics.WeatherSystem;
```

- [ ] **Step 3: Initialize weather in constructor**

Add to constructor:

```typescript
// Random weather for atmosphere
let weatherRoll = Math.random();
let weather = weatherRoll < 0.6 ? Engine.Graphics.WeatherType.Clear :
              weatherRoll < 0.85 ? Engine.Graphics.WeatherType.Rainy :
              Engine.Graphics.WeatherType.Snowy;
this.weatherSystem = new Engine.Graphics.WeatherSystem(weather);
```

- [ ] **Step 4: Update and draw weather in update/render**

In update():

```typescript
this.weatherSystem.update(dt);
```

Create a new render method or add to existing screen drawing code:

```typescript
// In the render section (after bg draw):
this.weatherSystem.draw(screen);
```

- [ ] **Step 5: Test weather effects**

1. Start CafeScene multiple times
2. Verify random weather (clear, rain, snow)
3. Verify weather particles animate
4. Commit: `git add engine/graphics/WeatherSystem.ts engine/scenes/CafeScene.ts && git commit -m "feat: procedural weather effects (rain/snow)"`

---

### Task 3.3: Add Dynamic Music Layering

**Files:**
- Create: `engine/audio/MusicManager.ts`
- Modify: `engine/scenes/CafeScene.ts`
- Modify: `engine/scenes/BrewScene.ts`

- [ ] **Step 1: Create MusicManager**

Create `engine/audio/MusicManager.ts`:

```typescript
namespace Engine.Audio {
    export enum MusicLayer {
        BassPiano,    // layer 0
        MidMelody,    // layer 1
        AmbientPad,   // layer 2
    }

    export class MusicManager {
        private activeLoop: number;
        private targetTempo: number;
        private currentTempo: number;
        private fadeInProgress: number; // 0-1
        private isFadingIn: boolean;

        constructor() {
            this.activeLoop = 0;
            this.targetTempo = 120;
            this.currentTempo = 120;
            this.fadeInProgress = 0;
            this.isFadingIn = false;
        }

        public startCafeLoop(): void {
            // Play lofi jazz melody
            // Using MakeCode's music.playMelody or custom synth
            music.setTempo(120);
            // In a real implementation, this would play a background loop
            // For now, just set it as "playing"
            this.activeLoop = 1;
        }

        public startBrewLoop(): void {
            // Switch to machine/mechanical sounds focus
            music.setTempo(100); // slightly slower
            this.activeLoop = 2;
        }

        public fadeToLoop(targetLoop: number): void {
            this.isFadingIn = true;
            this.fadeInProgress = 0;
            this.activeLoop = targetLoop;
        }

        public update(dt: number): void {
            if (this.isFadingIn) {
                this.fadeInProgress += dt / 1000; // fade over 1 second
                if (this.fadeInProgress >= 1.0) {
                    this.isFadingIn = false;
                    this.fadeInProgress = 1.0;
                }
            }
        }

        public stop(): void {
            music.stopAllSounds();
        }

        public getFadeLevel(): number {
            return this.fadeInProgress;
        }
    }
}
```

- [ ] **Step 2: Add MusicManager to CafeScene**

In CafeScene, add field:

```typescript
private musicManager: Engine.Audio.MusicManager;
```

In constructor, initialize:

```typescript
this.musicManager = new Engine.Audio.MusicManager();
this.musicManager.startCafeLoop();
```

- [ ] **Step 3: Add MusicManager to BrewScene**

In BrewScene constructor, after BrewState initialization:

```typescript
// Fade music when brewing starts
let cafeMusicMgr = Engine.Audio.MusicManager; // Access shared instance if needed
// For now, just silence café music when brew starts
music.stopAllSounds();
```

- [ ] **Step 4: Update CafeScene update to call musicManager.update()**

In CafeScene.update():

```typescript
this.musicManager.update(dt);
```

- [ ] **Step 5: Resume music when returning from BrewScene**

In CafeScene, add to enter():

```typescript
this.musicManager.startCafeLoop();
```

- [ ] **Step 6: Test music system**

1. Start CafeScene, verify lofi music plays
2. Enter BrewScene, verify music stops/changes
3. Return to CafeScene, verify music resumes
4. Run: `pxt build`
5. Commit: `git add engine/audio/MusicManager.ts engine/scenes/CafeScene.ts engine/scenes/BrewScene.ts && git commit -m "feat: dynamic music manager for lofi ambiance"`

---

## Phase 4: Caderno do Barista (ShopScene / Persistence)

### Task 4.1: Create Customer Database Structure

**Files:**
- Create: `engine/persistence/CustomerDatabase.ts`

- [ ] **Step 1: Create persistent customer database**

Create `engine/persistence/CustomerDatabase.ts`:

```typescript
namespace Engine.Persistence {
    export class CustomerDatabase {
        private customers: Engine.Entities.CustomerProfile[];
        private static instance: CustomerDatabase;

        private constructor() {
            this.customers = [];
            this.initializeLazyLoad();
        }

        public static getInstance(): CustomerDatabase {
            if (!CustomerDatabase.instance) {
                CustomerDatabase.instance = new CustomerDatabase();
            }
            return CustomerDatabase.instance;
        }

        private initializeLazyLoad(): void {
            // Create 4 base customers if not loaded from storage
            if (this.customers.length === 0) {
                this.customers.push(
                    new Engine.Entities.CustomerProfile(
                        0,
                        new Engine.Entities.Character(
                            "Estudante Misterioso",
                            Engine.Entities.CharacterTone.Mysterious,
                            0
                        )
                    ),
                    new Engine.Entities.CustomerProfile(
                        1,
                        new Engine.Entities.Character(
                            "Regular Feliz",
                            Engine.Entities.CharacterTone.Cheerful,
                            1
                        )
                    ),
                    new Engine.Entities.CustomerProfile(
                        2,
                        new Engine.Entities.Character(
                            "Anciao Tranquilo",
                            Engine.Entities.CharacterTone.Calm,
                            2
                        )
                    ),
                    new Engine.Entities.CustomerProfile(
                        3,
                        new Engine.Entities.Character(
                            "Profissional Ocupado",
                            Engine.Entities.CharacterTone.Rushed,
                            3
                        )
                    )
                );
            }
        }

        public getCustomer(id: number): Engine.Entities.CustomerProfile | null {
            for (let c of this.customers) {
                if (c.id === id) return c;
            }
            return null;
        }

        public getAllCustomers(): Engine.Entities.CustomerProfile[] {
            return this.customers;
        }

        public saveCustomerOrder(customerId: number, recipe: Engine.Entities.DrinkRecipe): void {
            let customer = this.getCustomer(customerId);
            if (customer) {
                customer.recordOrder(recipe);
                // Check if this becomes favorite (after 3 identical orders)
                if (customer.visitCount >= 3 && customer.lastOrderedDrink === recipe) {
                    customer.setFavoriteRecipe(recipe);
                }
            }
        }

        public getCustomerList(): string {
            let list = "";
            for (let c of this.customers) {
                list += c.character.name + " (" + c.getAffinityLevel() + ")\n";
            }
            return list;
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `pxt build`
Expected: No errors

---

### Task 4.2: Create ShopScene for Customer Profiles

**Files:**
- Modify: `engine/scenes/ShopScene.ts` (already exists, likely minimal)

- [ ] **Step 1: Check existing ShopScene**

Read current ShopScene.ts to understand its structure

- [ ] **Step 2: Implement ShopScene as customer profile viewer**

Replace/update ShopScene.ts:

```typescript
namespace Engine.Scenes {
    export class ShopScene implements Scene {
        private selectedCustomerId: number;
        private db: Engine.Persistence.CustomerDatabase;

        constructor() {
            this.selectedCustomerId = 0;
            this.db = Engine.Persistence.CustomerDatabase.getInstance();
        }

        public enter(): void {
            game.onPaint(() => {
                if (SceneStack.top() !== (this as any)) return;
                this.drawScene();
            });
        }

        private drawScene(): void {
            screen.fill(1);
            
            // Header
            screen.fillRect(0, 0, 160, 12, 4);
            screen.print("CADERNO DO BARISTA", 10, 2, 5, image.font5);
            screen.drawLine(0, 12, 160, 12, 0);

            // Customer list
            let customers = this.db.getAllCustomers();
            let listY = 20;
            
            for (let i = 0; i < customers.length; i++) {
                let c = customers[i];
                let isSelected = (i === this.selectedCustomerId);
                let bgColor = isSelected ? 14 : 1;
                let textColor = isSelected ? 1 : 5;
                
                // Draw selection box
                screen.fillRect(5, listY + i * 20, 150, 18, bgColor);
                screen.drawRect(4, listY + i * 20 - 1, 152, 20, 0);
                
                // Draw customer info
                screen.print(c.character.name, 10, listY + i * 20 + 2, textColor, image.font5);
                let affinityStr = "Afinidade: " + c.affinity;
                screen.print(affinityStr, 10, listY + i * 20 + 10, isSelected ? 0 : 8, image.font5);
            }

            // Footer
            screen.fillRect(0, 110, 160, 10, 1);
            screen.print("UP/DOWN=select  A=back", 5, 112, 8, image.font5);
        }

        public exit(): void {}

        public update(dt: number): void {
            let customers = this.db.getAllCustomers();
            
            if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
                this.selectedCustomerId = (this.selectedCustomerId - 1 + customers.length) % customers.length;
            }
            if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
                this.selectedCustomerId = (this.selectedCustomerId + 1) % customers.length;
            }
            
            if (Engine.Core.justPressed(Engine.Core.Action.Menu)) {
                Engine.Scenes.SceneStack.pop();
            }
        }

        public pause(): void {}
        public resume(): void {}
    }
}
```

- [ ] **Step 3: Verify compilation**

Run: `pxt build`
Expected: No errors

- [ ] **Step 4: Test ShopScene**

1. Add ShopScene.push() to MenuScene to test
2. Verify customer list displays
3. Verify affinity values show correctly
4. Commit: `git add engine/persistence/CustomerDatabase.ts engine/scenes/ShopScene.ts && git commit -m "feat: customer database and shop scene with profiles"`

---

### Task 4.3: Integrate Customer Selection into CafeScene

**Files:**
- Modify: `engine/scenes/CafeScene.ts`

- [ ] **Step 1: Add customer selection to CafeScene**

In CafeScene, add field after line 20:

```typescript
private currentCustomer: Engine.Entities.CustomerProfile | null;
private selectedCustomerId: number;
```

- [ ] **Step 2: Add customer selection state**

Add to CafeState enum:

```typescript
enum CafeState {
    Waiting,
    SelectCustomer,
    DialogOrder,
    Brewing,
    DialogResult,
    ShopTransition
}
```

- [ ] **Step 3: Start with customer selection**

In constructor or init():

```typescript
this.state = CafeState.SelectCustomer;
this.selectedCustomerId = 0;
```

- [ ] **Step 4: Draw customer selection UI**

In drawScene() or equivalent, add customer selection display:

```typescript
if (this.state === CafeState.SelectCustomer) {
    let db = Engine.Persistence.CustomerDatabase.getInstance();
    let customers = db.getAllCustomers();
    
    screen.fillRect(0, 0, 160, 120, 1);
    screen.print("Proximo cliente:", 10, 10, 5, image.font5);
    
    for (let i = 0; i < customers.length; i++) {
        let c = customers[i];
        let isSelected = (i === this.selectedCustomerId);
        let bgColor = isSelected ? 14 : 1;
        screen.fillRect(20, 30 + i * 15, 120, 13, bgColor);
        screen.drawRect(20, 30 + i * 15, 120, 13, 0);
        screen.print(c.character.name, 25, 33 + i * 15, 0, image.font5);
    }
    
    screen.print("A=select", 10, 105, 8, image.font5);
}
```

- [ ] **Step 5: Handle customer selection in update()**

In update() or during CafeState.SelectCustomer:

```typescript
if (this.state === CafeState.SelectCustomer) {
    let db = Engine.Persistence.CustomerDatabase.getInstance();
    let customers = db.getAllCustomers();
    
    if (Engine.Core.justPressed(Engine.Core.Action.Up)) {
        this.selectedCustomerId = (this.selectedCustomerId - 1 + customers.length) % customers.length;
    }
    if (Engine.Core.justPressed(Engine.Core.Action.Down)) {
        this.selectedCustomerId = (this.selectedCustomerId + 1) % customers.length;
    }
    
    if (Engine.Core.justPressed(Engine.Core.Action.Interact)) {
        this.currentCustomer = db.getCustomer(this.selectedCustomerId);
        this.state = CafeState.DialogOrder;
        // Transition to DialogScene...
    }
}
```

- [ ] **Step 6: Test customer selection**

1. Start CafeScene
2. Verify customer list appears
3. Use arrow keys to select customer
4. Verify interaction transitions to dialog
5. Commit: `git add engine/scenes/CafeScene.ts && git commit -m "feat: customer selection in cafe scene"`

---

### Task 4.4: Add Ingredient Unlock System

**Files:**
- Create: `engine/persistence/IngredientUnlocks.ts`
- Modify: `engine/entities/DrinkRecipe.ts` (enhance if minimal)

- [ ] **Step 1: Create IngredientUnlocks tracker**

Create `engine/persistence/IngredientUnlocks.ts`:

```typescript
namespace Engine.Persistence {
    export class IngredientUnlock {
        public name: string;
        public unlockedByCustomerId: number; // Customer who brought it as a gift
        public unlockedAfterVisit: number; // Visit number when unlocked

        constructor(name: string, customerId: number, visitNum: number) {
            this.name = name;
            this.unlockedByCustomerId = customerId;
            this.unlockedAfterVisit = visitNum;
        }
    }

    export class IngredientUnlocks {
        private unlockedIngredients: IngredientUnlock[];
        private static instance: IngredientUnlocks;

        private constructor() {
            this.unlockedIngredients = [];
            this.initializeDefaults();
        }

        public static getInstance(): IngredientUnlocks {
            if (!IngredientUnlocks.instance) {
                IngredientUnlocks.instance = new IngredientUnlocks();
            }
            return IngredientUnlocks.instance;
        }

        private initializeDefaults(): void {
            // Base ingredients always available
            // New ingredients unlocked through customer relationships
        }

        public unlockIngredient(name: string, customerId: number, visitNum: number): void {
            // Check if already unlocked
            for (let ing of this.unlockedIngredients) {
                if (ing.name === name) return;
            }
            
            this.unlockedIngredients.push(new IngredientUnlock(name, customerId, visitNum));
        }

        public isIngredientUnlocked(name: string): boolean {
            for (let ing of this.unlockedIngredients) {
                if (ing.name === name) return true;
            }
            return false;
        }

        public getUnlockedIngredients(): IngredientUnlock[] {
            return this.unlockedIngredients;
        }

        public checkAndUnlockNew(): void {
            // Called after each successful customer interaction
            let db = Engine.Persistence.CustomerDatabase.getInstance();
            let customers = db.getAllCustomers();
            
            for (let c of customers) {
                if (c.visitCount === 3 && c.affinity > 25) {
                    // Unlock custom ingredient on 3rd visit with positive affinity
                    let ingredientName = c.character.name + "'s Gift";
                    this.unlockIngredient(ingredientName, c.id, c.visitCount);
                }
            }
        }
    }
}
```

- [ ] **Step 2: Add unlock notification to DialogScene**

In DialogScene, after successful dialog completion, add:

```typescript
public onDialogComplete(): void {
    // Check for ingredient unlocks
    let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
    unlocks.checkAndUnlockNew();
}
```

- [ ] **Step 3: Display unlocked ingredients in ShopScene**

Modify ShopScene to show unlocked ingredients:

```typescript
// In drawScene(), add after customer list:
screen.print("INGREDIENTES DESBLOQUEADOS:", 5, 90, 5, image.font5);
let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
let unlockedList = unlocks.getUnlockedIngredients();
for (let i = 0; i < unlockedList.length && i < 2; i++) {
    let ing = unlockedList[i];
    screen.print("+ " + ing.name, 10, 98 + i * 8, 14, image.font5);
}
```

- [ ] **Step 4: Test ingredient unlocks**

1. Start game, serve customer 3 times with high affinity
2. Check ShopScene for unlocked ingredients
3. Verify ingredient gift message displays
4. Commit: `git add engine/persistence/IngredientUnlocks.ts engine/scenes/ShopScene.ts && git commit -m "feat: organic ingredient unlock system through customer relationships"`

---

### Task 4.5: Implement ArrayBuffer Persistence

**Files:**
- Create: `engine/persistence/SaveManager.ts`

- [ ] **Step 1: Create SaveManager for ArrayBuffer storage**

Create `engine/persistence/SaveManager.ts`:

```typescript
namespace Engine.Persistence {
    export class SaveManager {
        private static readonly SAVE_SLOT_KEY = "barista_save";

        public static saveGame(): void {
            // Serialize game state to ArrayBuffer
            let db = Engine.Persistence.CustomerDatabase.getInstance();
            let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
            
            let gameState = {
                dayNumber: Engine.Core.TycoonState.dayNumber,
                money: Engine.Core.TycoonState.money,
                customers: [],
                ingredients: []
            };
            
            // Serialize customers
            for (let c of db.getAllCustomers()) {
                gameState.customers.push({
                    id: c.id,
                    affinity: c.affinity,
                    visitCount: c.visitCount
                });
            }
            
            // Serialize unlocks
            for (let u of unlocks.getUnlockedIngredients()) {
                gameState.ingredients.push({
                    name: u.name,
                    customerId: u.unlockedByCustomerId
                });
            }
            
            // Store as JSON in settings (MakeCode supports this)
            settings.writeString(SaveManager.SAVE_SLOT_KEY, JSON.stringify(gameState));
        }

        public static loadGame(): boolean {
            // Load game state from storage
            let saveData = settings.readString(SaveManager.SAVE_SLOT_KEY);
            if (!saveData) return false;
            
            try {
                let gameState = JSON.parse(saveData);
                
                // Restore game state
                Engine.Core.TycoonState.dayNumber = gameState.dayNumber;
                Engine.Core.TycoonState.money = gameState.money;
                
                // Restore customers
                let db = Engine.Persistence.CustomerDatabase.getInstance();
                for (let cData of gameState.customers) {
                    let customer = db.getCustomer(cData.id);
                    if (customer) {
                        customer.affinity = cData.affinity;
                        customer.visitCount = cData.visitCount;
                    }
                }
                
                // Restore unlocks
                let unlocks = Engine.Persistence.IngredientUnlocks.getInstance();
                for (let uData of gameState.ingredients) {
                    unlocks.unlockIngredient(uData.name, uData.customerId, 0);
                }
                
                return true;
            } catch (e) {
                return false;
            }
        }

        public static hasActiveSave(): boolean {
            return settings.readString(SaveManager.SAVE_SLOT_KEY) !== "";
        }
    }
}
```

- [ ] **Step 2: Create TycoonState in Engine.Core**

If not already present, create `engine/TycoonState.ts`:

```typescript
namespace Engine.Core {
    export class TycoonState {
        public static dayNumber: number = 1;
        public static money: number = 100;
    }
}
```

- [ ] **Step 3: Call SaveManager after each day**

In CafeScene, after customers served or day ends:

```typescript
private endDay(): void {
    // ... day end logic ...
    Engine.Core.TycoonState.dayNumber++;
    Engine.Persistence.SaveManager.saveGame();
}
```

- [ ] **Step 4: Load game on startup**

In main.ts, before pushing MenuScene:

```typescript
// Load saved game if it exists
let hasSave = Engine.Persistence.SaveManager.hasActiveSave();
if (hasSave) {
    Engine.Persistence.SaveManager.loadGame();
}
```

- [ ] **Step 5: Test persistence**

1. Play game, advance day
2. Serve customers, build affinity
3. Exit game
4. Restart game
5. Verify affinity and day number persisted
6. Commit: `git add engine/persistence/SaveManager.ts engine/TycoonState.ts && git commit -m "feat: persistent game saves via ArrayBuffer serialization"`

---

## Final Integration & Testing

### Task 5.1: Wire All Scenes Together

**Files:**
- Modify: `engine/scenes/MenuScene.ts`
- Modify: `engine/scenes/CafeScene.ts`

- [ ] **Step 1: Update MenuScene to load persistent data**

In MenuScene, add load call:

```typescript
constructor() {
    let hasSave = Engine.Persistence.SaveManager.hasActiveSave();
    if (hasSave) {
        Engine.Persistence.SaveManager.loadGame();
    }
}
```

- [ ] **Step 2: Wire CafeScene → DialogScene → BrewScene → ResultDialog**

In CafeScene, update state transitions:

```typescript
// In DialogOrder state:
if (this.state === CafeState.DialogOrder) {
    // Create dialog nodes for customer
    let nodes = this.generateDialogNodesForCustomer(this.currentCustomer);
    let dialogScene = new Engine.Scenes.DialogScene(this.currentCustomer, nodes, () => {
        this.state = CafeState.Brewing;
    });
    Engine.Scenes.SceneStack.push(dialogScene);
}

// In Brewing state:
if (this.state === CafeState.Brewing) {
    let brewScene = new Engine.Scenes.BrewScene(this.currentCustomer.character.name, (result) => {
        this.handleBrewResult(result);
        this.state = CafeState.DialogResult;
    });
    Engine.Scenes.SceneStack.push(brewScene);
}
```

- [ ] **Step 3: Test full game flow**

1. Start game
2. Complete customer dialog with choices
3. Do brew minigame with QTE
4. Return to cafe
5. Select next customer
6. Verify affinity changed based on choices
7. Commit: `git add engine/scenes/CafeScene.ts engine/scenes/MenuScene.ts && git commit -m "feat: wire all 4 phases into complete game loop"`

---

## Summary

This plan implements all 4 phases in order:

1. **Phase 1 (DialogScene):** Character tones, dynamic expressions, choice system, affinity tracking
2. **Phase 2 (BrewScene):** QTE minigame, success/failure evaluation, visual feedback
3. **Phase 3 (CafeScene):** Day/night cycle, weather effects, dynamic music
4. **Phase 4 (ShopScene):** Customer database, ingredient unlocks, ArrayBuffer persistence

Each task is 2-5 minutes of focused work with complete code and verification steps.

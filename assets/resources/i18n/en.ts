const win = window as any;

export const languages = {
    menu: {
        mode: { single: "Single Player", multi: "Two Player" },
        start: "Start",
        help: `<color=#00ff00><size=14>Game Instructions</size></color>
<size=7><color=#0fffff  >Mobile:</color>
<color=#ffffff>Use the bottom-left joystick to control the direction and the bottom-right button to fire.</color>
<color=#0fffff  >PC:</color>
<color=#ffffff>Player 1: W (up), A (left), S (down), D (right) to control movement, and Space to fire.
Player 2: ↑ (up), ↓ (down), ← (left), → (right) to control movement, and Page Up to fire.</color></size>`,
    },
    over: {
        replay: "Replay",
    },
    fight: {
        lv: "LV",
        score: "Score",
    },
    win: {
        replay: 'Replay',
        title: 'Mission Complete',
        info: 'Congratulations, you have defeated all the enemy forces.'
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;

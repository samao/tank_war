const win = window as any;

export const languages = {
    menu: {
        mode: { single: "单人模式", multi: "双人模式" },
        start: "开始",
        help: `<color=#00ff00><size=15>游戏玩法</size></color>

<color=#0fffff  >移动端:</color>
<color=#ffffff>左下角控制器控制方向。右下角按钮发射</color>

<color=#0fffff  >PC端:</color>
<color=#ffffff>玩家一：W(上)A(左)S(下)D(右) 控制方向，空格发射。
玩家二：↑(上)↓(下)←(左)→(右)箭头控制方向，按键PAGE UP发射</color>`,
    },
    over: {
        replay: "重玩",
    },
    fight: {
        lv: "关",
        score: "积分",
    },
    win: {
        replay: '重玩',
        title: '任务完成',
        info: '恭喜你，已经打败所有敌军。'
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.zh = languages;

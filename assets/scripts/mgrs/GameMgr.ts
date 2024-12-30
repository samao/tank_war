import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameMgr')
export class GameMgr extends Component {
    #mode: number = 0;

    setMode(type: number) {
        // console.log('当前游戏模式', type);
        this.#mode = type;
    }

    getMode() {
        return this.#mode;
    }
}



import { _decorator, Component, Node, find, director, ToggleContainer } from 'cc';
import { GameMgr } from '../mgrs/GameMgr';
import { Base } from '../common/Base';
import { AudioMgr } from '../mgrs/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Base {
    protected start(): void {
        this.rootMgr.getComponent(AudioMgr).count++;
    }
    gotoGame() {
        const mode = this.getComponentInChildren(ToggleContainer).toggleItems.findIndex(item => item.isChecked);
        this.rootMgr.getComponent(GameMgr).setMode(mode);
        director.loadScene('fight')
    }
}



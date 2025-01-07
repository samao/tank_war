import { _decorator, Component, director, find, Node } from 'cc';
import { AudioMgr } from '../mgrs/AudioMgr';
import { Base } from '../common/Base';
const { ccclass, property } = _decorator;

@ccclass('Over')
export class Over extends Base {
    start() {
        this.audio.stopAll();
        console.log('over: ref', this.audio.count++);
        this.audio.effectPlay('game_over')
    }

    gotoMenu() {
        director.loadScene('menu')
    }
}



import { _decorator, Component, director, find, Node } from 'cc';
import { Base } from '../common/Base';
const { ccclass, property } = _decorator;

@ccclass('Win')
export class Win extends Base {
    protected start(): void {
        this.audio.stopAll();
    }
    gotoMenu() {
        director.loadScene('menu')
    }
}



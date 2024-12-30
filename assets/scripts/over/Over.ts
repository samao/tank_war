import { _decorator, Component, director, find, Node } from 'cc';
import { AudioMgr } from '../mgrs/AudioMgr';
import { Base } from '../common/Base';
const { ccclass, property } = _decorator;

@ccclass('Over')
export class Over extends Base {
    start() {
        console.log('over: ref', this.rootMgr.getComponent(AudioMgr).count++);
    }

    gotoMenu() {
        director.loadScene('menu')
    }
}



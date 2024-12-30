import { _decorator, Component, director, find, Node } from 'cc';
import { AudioMgr } from '../mgrs/AudioMgr';
import { Base } from '../common/Base';
import { GameMgr } from '../mgrs/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('Fight')
export class Fight extends Base {
    start() {
        console.log('fight: ref', this.rootMgr.getComponent(AudioMgr).count++);
        // this.rootMgr.getComponent(AudioMgr).play('game_start');
        console.log('开启模式:', this.rootMgr.getComponent(GameMgr).getMode());

        this.scheduleOnce(() => {
            director.loadScene('over');
        }, 5)
    }

    update(deltaTime: number) {
        
    }
}



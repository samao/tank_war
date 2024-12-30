import { _decorator, Camera, CameraComponent, Component, director, find, Node, Rect, Vec3 } from 'cc';
import { AudioMgr } from '../mgrs/AudioMgr';
import { Base } from '../common/Base';
import { GameMgr, GameMode } from '../mgrs/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('Fight')
export class Fight extends Base {

    #mainCamare: Camera;
    #deputyCamare: Camera;

    protected onLoad(): void {
        super.onLoad();
        [this.#mainCamare, this.#deputyCamare] = this.getComponentsInChildren(Camera);
    }

    onEnable() {
        this.audio.effectPlay('game_start');
        console.log('开启模式:', this.game.getMode());

        this.setupCamare();

        this.scheduleOnce(() => {
            director.loadScene('over');
        }, 8)
        // 1280 x 720  720 x 640
    }

    setupCamare() {
        switch (this.game.getMode()) {
            case GameMode.DOUBLE:
                this.#mainCamare.orthoHeight = this.#deputyCamare.orthoHeight = 640;
                this.#mainCamare.rect = new Rect(0, 0, 0.5, 1);
                this.#deputyCamare.node.active = true;
                this.#deputyCamare.rect = new Rect(0.5, 0, 0.5, 1);
                this.#mainCamare.node.setRotationFromEuler(new Vec3(0, 0, 90));
                this.#deputyCamare.node.setRotationFromEuler(new Vec3(0, 0, -90));
                break;
            default:
                this.#deputyCamare.node.active = false;
                this.#mainCamare.rect = new Rect(0, 0, 1, 1);
                this.#mainCamare.node.setScale(1, 1);
                break;
        }
    }

    update(deltaTime: number) {
        
    }
}



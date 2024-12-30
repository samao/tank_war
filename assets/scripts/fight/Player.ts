import { _decorator, Animation, Component, Node } from "cc";
import { Base } from "../common/Base";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Base {
    start() {
        const clip = this.animation.createAnimation(this.game.getTankUi("tank_white_2"));
        // console.log('播放动画', clip);
        const animationCmp = this.getComponentInChildren(Animation);
        // console.log('播放组件', animationCmp);
        animationCmp.addClip(clip);
        animationCmp.defaultClip = clip;
        animationCmp.play();
    }
}

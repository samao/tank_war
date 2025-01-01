import { _decorator, Animation, AnimationClip, Asset, Component, Node, Sprite, SpriteFrame,  } from 'cc';
import { Base } from './Base';
const { ccclass, property } = _decorator;

@ccclass('MovieClip')
export class MovieClip extends Base {

    @property({displayName: '动画文件夹'})
    private dirPath = '';

    protected onLoad(): void {
        super.onLoad();
        this.game.loadSpriteFrameDir(this.dirPath, sfs => {
            const animation = this.addComponent(Animation);
            this.getComponent(Sprite).spriteFrame = sfs[0];
            animation.playOnLoad = true;
            const clip = this.animation.createAnimation({sfs, name: this.dirPath, gap: 0.1, mode: AnimationClip.WrapMode.Loop});
            // animation.clips.push(clip);
            animation.defaultClip = clip;
        })
    }
}



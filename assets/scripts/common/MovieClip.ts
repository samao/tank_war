import { _decorator, Animation, AnimationClip, Asset, Component, Node, Sprite, SpriteFrame } from "cc";
import { Base } from "./Base";
const { ccclass, property } = _decorator;

@ccclass("MovieClip")
export class MovieClip extends Base {
    @property({ displayName: "动画文件夹" })
    private dirPath = "";
    @property({displayName: '每帧时间'})
    private durationPerFrame = 0.1;

    protected start(): void {
        if (this.dirPath != "") {
            this.bindDir(this.dirPath, this.durationPerFrame);
        }
    }

    bindDir(path: string, gap = 0.1) {
        if (!this.node.parent) {
            console.warn('未添加到显示列表动画无法播放', path)
            return;
        }
        this.dirPath = path;
        this.game.loadSpriteFrameDir(this.dirPath, (sfs) => {
            let animation = this.getComponent(Animation);
            if (!animation) {
                animation = this.addComponent(Animation);
            }
            this.getComponent(Sprite).spriteFrame = sfs[0];
            animation.playOnLoad = true;
            const clip = this.animation.createAnimation({ sfs, name: this.dirPath, gap, mode: AnimationClip.WrapMode.Loop });
            // animation.clips.push(clip);
            animation.defaultClip = clip;
        });
    }
}

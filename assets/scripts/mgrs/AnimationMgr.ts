import { _decorator, animation, Animation, AnimationClip, Component, Node, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AnimationMgr")
export class AnimationMgr extends Component {
    createAnimation(_frames: SpriteFrame[]) {
        const frames = _frames.concat(_frames[0])
        console.log('制作动画帧', frames.length)
        const animationClip = new AnimationClip();
        const GAP = 0.1;
        animationClip.duration = GAP * (frames.length);

        const track = new animation.ObjectTrack<SpriteFrame>();
        track.path.toComponent(Sprite).toProperty("spriteFrame");

        const [{ curve }] = track.channels();

        curve.assignSorted(
            frames.map((sf, id) => {
                return [id * GAP, sf];
            })
        );

        animationClip.addTrack(track);
        animationClip.wrapMode = AnimationClip.WrapMode.Loop;

        return animationClip;
    }
}

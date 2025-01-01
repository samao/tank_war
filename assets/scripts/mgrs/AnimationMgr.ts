import { _decorator, animation, Animation, AnimationClip, Component, sys, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AnimationMgr")
export class AnimationMgr extends Component {
    #map: Map<string, AnimationClip> = new Map();

    createAnimation({
        sfs: _frames,
        name,
        gap: GAP = 0.1,
        mode = AnimationClip.WrapMode.Loop,
    }: {
        sfs: SpriteFrame[];
        name: string;
        gap?: number;
        mode?: AnimationClip.WrapMode;
    }) {
        if (this.#map.has(name)) {
            console.log("直接返回动画", name);
            return this.#map.get(name);
        }
        //sys.isBrowser ? [] :
        const frames = _frames.concat(_frames[0].clone());
        console.log("制作动画帧", name, frames.length);
        const animationClip = new AnimationClip();
        // const GAP = 0.1;
        animationClip.duration = GAP * frames.length;

        const track = new animation.ObjectTrack<SpriteFrame>();
        // console.log(track.path)
        track.path.toComponent(Sprite).toProperty("spriteFrame");
        // console.log('===',track.path)
        const [{ curve }] = track.channels();

        curve.assignSorted(
            frames.map((sf, id) => {
                return [id * GAP, sf];
            })
        );

        animationClip.addTrack(track);
        animationClip.wrapMode = mode;
        animationClip.name = name;
        this.#map.set(name, animationClip);

        return animationClip;
    }
}

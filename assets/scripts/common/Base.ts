import { _decorator, AudioSource, Component, find, Node } from 'cc';
import { GameMgr } from '../mgrs/GameMgr';
import { AudioMgr } from '../mgrs/AudioMgr';
import { AnimationMgr } from '../mgrs/AnimationMgr';
const { ccclass, property } = _decorator;

@ccclass('Base')
export class Base extends Component {
    protected rootMgr: Node;

    protected audio: AudioMgr;

    protected game: GameMgr;

    protected animation: AnimationMgr;

    protected onLoad(): void {
        this.rootMgr = find('ref');
        this.audio = this.rootMgr.getComponent(AudioMgr);
        this.game = this.rootMgr.getComponent(GameMgr);
        this.animation = this.rootMgr.getComponent(AnimationMgr);
    }
}



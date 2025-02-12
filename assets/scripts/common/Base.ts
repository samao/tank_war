import { _decorator, AudioSource, Color, Component, find, Label, Node } from 'cc';
import { GameMgr } from '../mgrs/GameMgr';
import { AudioMgr } from '../mgrs/AudioMgr';
import { AnimationMgr } from '../mgrs/AnimationMgr';
import { EnemiesMgr } from '../mgrs/EnemiesMgr';
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

    effectPlayFromUI(toggle, name: string) {
        this.effectPlay(name)
    }

    protected effectPlay(name: string) {
        this.audio.effectPlay(name);
    }
}



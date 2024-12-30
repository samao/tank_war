import { _decorator, AudioClip, AudioSource, Component, Node, resources } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioMgr")
export class AudioMgr extends Component {
    public count = 0;

    #audioSource: AudioSource;

    #effect: AudioSource;

    #map: Map<string, AudioClip> = new Map();

    protected onLoad(): void {
        this.#audioSource = this.node.addComponent(AudioSource);
        this.#effect = this.node.addComponent(AudioSource);

        resources.loadDir("audio", AudioClip, (err, data: AudioClip[]) => {
            if (err) {
                return;
            }
            data.forEach((clip) => {
                this.#map.set(clip.name, clip);
            });
        });
    }

    play(name: string) {
        this.#audioSource.clip = this.#map.get(name);
        this.#audioSource.loop = true;
        this.#audioSource.volume = 0.5;
        this.#audioSource.play();
    }

    effectPlay(name: string, volume = 0.5) {
        const clip = this.#map.get(name);
        this.#effect.playOneShot(clip, volume);
    }
}

import { _decorator, AudioClip, AudioSource, Component, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioMgr')
export class AudioMgr extends Component {
    public count = 0;

    #audioSource: AudioSource;

    #map: Map<string, AudioClip> = new Map();

    protected onLoad(): void {
        this.#audioSource = this.node.addComponent(AudioSource);

        resources.loadDir('audio', AudioClip, (err, data: AudioClip[]) => {
            if (err) {
                return;
            }
            data.forEach(clip => {
                this.#map.set(clip.name, clip);
            })
        })
    }

    play(name: string) {
        this.#audioSource.clip = this.#map.get(name);
        this.#audioSource.play()
    }

    effectPlay(name: string) {
       
    }
}



import { _decorator, Component, director, find, Node } from 'cc';
import { AudioMgr } from './mgrs/AudioMgr';
import { GameMgr } from './mgrs/GameMgr';
import { AnimationMgr } from './mgrs/AnimationMgr';
const { ccclass, property } = _decorator;

@ccclass('app')
export class app extends Component {
    protected onLoad(): void {
        if (!find('ref')) {
            const node = new Node('ref');
            director.addPersistRootNode(node);
            node.addComponent(AudioMgr);
            node.addComponent(GameMgr);
            node.addComponent(AnimationMgr);
            console.log('APP Mount')
        }
    }

    protected onEnable(): void {
        console.log('START NODE MOUNT')
        director.loadScene('menu')
    }
}



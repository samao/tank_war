import { _decorator, Component, director, Node } from 'cc';
import { AudioMgr } from './mgrs/AudioMgr';
import { GameMgr } from './mgrs/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('app')
export class app extends Component {
    protected onLoad(): void {
        const node = new Node('ref');

        director.addPersistRootNode(node);

        node.addComponent(AudioMgr);
        node.addComponent(GameMgr);
    }
}



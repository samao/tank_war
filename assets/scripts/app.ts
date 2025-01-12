import { _decorator, Component, director, find, Node, sys } from 'cc';
import { AudioMgr } from './mgrs/AudioMgr';
import { GameMgr } from './mgrs/GameMgr';
import { AnimationMgr } from './mgrs/AnimationMgr';
import { setup } from './mgrs/toast';
import { init } from '../../extensions/i18n/assets/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('app')
export class app extends Component {

    @property({displayName: '初始游戏入口'})
    private entryPoint = 'menu';

    protected onLoad(): void {
        if (!find('ref')) {
            const node = new Node('ref');
            director.addPersistRootNode(node);
            node.addComponent(AudioMgr);
            node.addComponent(GameMgr);
            node.addComponent(AnimationMgr);
            setup(node);

            console.log('APP Mount')

            init(sys.language);
        }
    }

    protected onEnable(): void {
        console.log('START NODE MOUNT')
        const game = find('ref').getComponent(GameMgr);
        if (game.ready) {
            director.loadScene(this.entryPoint)
        } else {
            game.node.once('ready', () => {
                director.loadScene(this.entryPoint)
            })
        }
    }
}



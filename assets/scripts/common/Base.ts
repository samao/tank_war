import { _decorator, Component, find, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Base')
export class Base extends Component {
    protected rootMgr: Node

    protected onLoad(): void {
        this.rootMgr = find('ref')
    }
}



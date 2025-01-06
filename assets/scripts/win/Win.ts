import { _decorator, Component, director, find, Node } from 'cc';
// import { AudioMgr } from '../mgrs/AudioMgr';
// import { Base } from '../common/Base';
const { ccclass, property } = _decorator;

@ccclass('Win')
export class Win extends Component {
    gotoMenu() {
        director.loadScene('menu')
    }
}



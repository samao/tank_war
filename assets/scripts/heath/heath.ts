import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('heath')
export class heath extends Component {
    start() {
        this.scheduleOnce(() => {
            director.loadScene('menu')
        }, 1.5)
    }
}



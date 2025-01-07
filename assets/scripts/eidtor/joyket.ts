import { _decorator, Component, EventTouch, Input, input, math, misc, Node, Vec2 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("joyket")
export class joyket extends Component {
    private isTouching = false;

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd);
    }

    onTouchStart = (e: EventTouch) => {
        this.isTouching = true;
        // console.log("START: ", e.getStartLocation());
    };

    onTouchMove = (e: EventTouch) => {
        if (this.isTouching) {
            // console.log("MOVE: ", e.getStartLocation(), "CUR:", e.touch.getLocation());
            const dir = e.touch.getLocation().subtract(e.getStartLocation()).normalize();
            // const dir.normalize().angle(Vec2.UNIT_X)
            const degress = (dir.y > 0 ? 1 : -1) * misc.radiansToDegrees(dir.angle(Vec2.UNIT_X));
            console.log(degress);
            if(degress > -135 && degress <= -45) {
                console.log('下')
            } else if (degress > -45 && degress <= 45) {
                console.log('右')
            } else if(degress > 45 && degress <= 135) {
                console.log('上')
            } else {
                console.log('左')
            }
        }
    };

    onTouchEnd = (e: EventTouch) => {
        this.isTouching = false;
    };
}

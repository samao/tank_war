import {
    _decorator,
    Camera,
    Component,
    Enum,
    EventKeyboard,
    EventTouch,
    find,
    Input,
    input,
    instantiate,
    KeyCode,
    misc,
    Node,
    NodeEventType,
    Prefab,
    Rect,
    sys,
    UITransform,
    Vec2,
    Vec3,
} from "cc";
import { Base } from "../common/Base";
import { GameMgr, GameMode, PlayerType } from "../mgrs/GameMgr";
const { ccclass, property } = _decorator;

@ccclass("CTR_KEY")
class CTR_KEY {
    @property({ type: Enum(KeyCode), displayName: "上" })
    up: KeyCode = KeyCode.KEY_W;

    @property({ type: Enum(KeyCode), displayName: "下" })
    down: KeyCode = KeyCode.KEY_S;

    @property({ type: Enum(KeyCode), displayName: "左" })
    left: KeyCode = KeyCode.KEY_A;

    @property({ type: Enum(KeyCode), displayName: "右" })
    right: KeyCode = KeyCode.KEY_D;

    @property({ type: Enum(KeyCode), displayName: "发射" })
    fire: KeyCode = KeyCode.SPACE;

    isCTRKey(key: KeyCode) {
        return [this.up, this.down, this.left, this.right, this.fire].indexOf(key) !== -1;
    }
}

export enum TOWARDS {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    CANCEL,
}

@ccclass("Stick")
export class Stick extends Component {
    static EventType = {
        /** 0↑, 1↓, 2←, 3→, 4cancel*/
        TOUCHING: "touching",
        SHOOTING: "shooting",
    };

    #areas: Node[] = [];

    @property({ type: CTR_KEY, displayName: "控制配置" })
    private ctrKeyConfig: CTR_KEY = new CTR_KEY();

    @property(Node)
    private fireBtn: Node;

    @property({ type: Prefab, displayName: "控制器红点" })
    private ctlCenter: Prefab;

    private ctlDot: Node;

    #degressOffset = 0;

    #targetUser: PlayerType = PlayerType.PLAYER_1;

    private isTouching = false;

    private touchID: any;

    protected onLoad(): void {
        this.#areas.push(
            ...["up", "down", "left", "right"].map((cpn) => {
                return this.node.getChildByName(cpn);
            })
        );

        this.ctlDot = instantiate(this.ctlCenter);
    }

    hidenVirUI(degressOffset = 0) {
        console.log("设备类型：", sys.isMobile);
        this.#areas.forEach((n) => (n.active = false));
        this.fireBtn.active = sys.isMobile;
        this.#degressOffset = degressOffset;
        return this;
    }

    setUserType(type: PlayerType) {
        this.#targetUser = type;
    }

    protected onEnable(): void {
        if (sys.isMobile) {
            this.node.on(NodeEventType.TOUCH_START, this.onTouchStart);
            this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove);
            this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd);
            this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchEnd);
            this.fireBtn.on(NodeEventType.TOUCH_START, this.#fireHandle);
        } else {
            input.on(Input.EventType.KEY_DOWN, this.#onKeyDown);
            input.on(Input.EventType.KEY_UP, this.#onKeyDown);
        }
    }

    protected onDisable(): void {
        this.node.off(NodeEventType.TOUCH_START, this.onTouchStart);
        this.node.off(NodeEventType.TOUCH_MOVE, this.onTouchMove);
        this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd);
        this.node.off(NodeEventType.TOUCH_CANCEL, this.onTouchEnd);
        this.fireBtn.off(NodeEventType.TOUCH_START, this.#fireHandle);

        input.off(Input.EventType.KEY_DOWN, this.#onKeyDown);
        input.off(Input.EventType.KEY_UP, this.#onKeyDown);
    }

    onTouchStart = (e: EventTouch) => {
        console.log('onTouchStart', e.touch.getID(), this.touchID);
        if(typeof this.touchID === 'undefined') {
            this.isTouching = true;
            this.ctlDot.parent = this.node;
            this.ctlDot.setWorldPosition(this.getScreenPoint(e.touch.getLocation().toVec3()));
            this.ctlDot.layer = this.#targetUser === PlayerType.PLAYER_1 ? 1 << 0 : 1 << 1;
            this.touchID = e.touch.getID();
        }
    };

    private getScreenPoint(pos: Vec3) {
        let cam: Camera;
        if (this.getGameMode() === GameMode.DOUBLE) {
            cam = find(`Canvas/CameraPlayer${this.#targetUser === PlayerType.PLAYER_1 ? "1" : "2"}`).getComponent(Camera);
        } else {
            cam = find(`Canvas/Camera`).getComponent(Camera);
        }
        // console.log('cam is', cam);
        return cam.screenToWorld(pos);
    }

    private getGameMode() {
        return find("ref").getComponent(GameMgr).getMode();
    }

    onTouchMove = (e: EventTouch) => {
        if (this.isTouching && e.touch.getID() === this.touchID) {
            const dir = e.touch.getLocation().subtract(e.getStartLocation()).normalize();
            const degress = (dir.y > 0 ? 1 : -1) * misc.radiansToDegrees(dir.angle(Vec2.UNIT_X)) - this.#degressOffset;
            this.ctlDot.setRotationFromEuler(new Vec3(0, 0, degress));
            if (degress > -135 && degress <= -45) {
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.DOWN);
            } else if (degress > -45 && degress <= 45) {
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.RIGHT);
            } else if (degress > 45 && degress <= 135) {
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.UP);
            } else {
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.LEFT);
            }
        }
    };

    onTouchEnd = (e: EventTouch) => {
        console.log('onTouchEnd', e.touch.getID())
        if (this.touchID === e.touch.getID()) {
            console.log('取消')
            this.isTouching = false;
            this.touchID = undefined;
            this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
            this.ctlDot.parent = null;
        }
    };

    protected onEnable_bk(): void {
        this.#areas.forEach((node) => {
            node.on(Input.EventType.TOUCH_START, this.#onTouchStart);
            node.on(Input.EventType.TOUCH_END, this.#onTouchEnd);
            node.on(Input.EventType.TOUCH_CANCEL, this.#onTouchCancel);
        });
        this.fireBtn.on(NodeEventType.TOUCH_START, this.#fireHandle);
    }

    protected onDisable_BK(): void {
        this.#areas.forEach((node) => {
            node.off(Input.EventType.TOUCH_START, this.#onTouchStart);
            node.off(Input.EventType.TOUCH_END, this.#onTouchEnd);
            node.off(Input.EventType.TOUCH_CANCEL, this.#onTouchCancel);
        });
        this.fireBtn.off(NodeEventType.TOUCH_START, this.#fireHandle);

        input.off(Input.EventType.KEY_DOWN, this.#onKeyDown);
        input.off(Input.EventType.KEY_UP, this.#onKeyDown);
    }

    protected start(): void {
        console.log("onEnabled", this.node.active);
    }

    #fireHandle = (e: EventTouch) => {
        e.propagationStopped = true;
        this.node.emit(Stick.EventType.SHOOTING);
    };

    #onKeyDown = (e: EventKeyboard) => {
        if (e.type === Input.EventType.KEY_UP && this.ctrKeyConfig.isCTRKey(e.keyCode)) {
            if (e.keyCode !== this.ctrKeyConfig.fire) {
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
                return;
            }
            this.node.emit(Stick.EventType.SHOOTING);
        }

        switch (e.keyCode) {
            case this.ctrKeyConfig.up:
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.UP);
                break;
            case this.ctrKeyConfig.down:
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.DOWN);
                break;
            case this.ctrKeyConfig.left:
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.LEFT);
                break;
            case this.ctrKeyConfig.right:
                this.node.emit(Stick.EventType.TOUCHING, TOWARDS.RIGHT);
                break;
        }
    };

    #onTouchStart = (e: EventTouch) => {
        const map = {
            up: TOWARDS.UP,
            down: TOWARDS.DOWN,
            left: TOWARDS.LEFT,
            right: TOWARDS.RIGHT,
        };
        this.node.emit(Stick.EventType.TOUCHING, map[e.currentTarget.name]);
    };

    #onTouchEnd = (e: EventTouch) => {
        this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
    };

    #onTouchCancel = (e: EventTouch) => {
        this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
    };
}

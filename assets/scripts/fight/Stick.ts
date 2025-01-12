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
import { FACE_TO } from "./Player";
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

    #targetUser: PlayerType;

    private hocker_idel: Node;
    private hocker_right: Node;

    protected onLoad(): void {
        this.#areas.push(
            this.node.getChildByPath("hocker/hocker-tap-right"),
            this.node.getChildByPath("hocker/hocker-tap-top"),
            this.node.getChildByPath("hocker/hocker-tap-left"),
            this.node.getChildByPath("hocker/hocker-tap-down")
        );
        this.hocker_idel = this.node.getChildByPath("hocker/hocker-idel");
        this.hocker_right = this.node.getChildByPath("hocker/hocker-right");
    }

    bindEvent(bind = true) {
        this.#areas.forEach((node) => {
            if (bind) {
                node.on(NodeEventType.TOUCH_START, this.#onTouchStart);
                node.on(NodeEventType.TOUCH_END, this.#onTouchEnd);
                node.on(NodeEventType.TOUCH_CANCEL, this.#onTouchEnd);
            } else {
                node.off(NodeEventType.TOUCH_START, this.#onTouchStart);
                node.off(NodeEventType.TOUCH_END, this.#onTouchEnd);
                node.off(NodeEventType.TOUCH_CANCEL, this.#onTouchEnd);
            }
        });
    }

    hidenVirUI(degressOffset = 0) {
        const show = sys.isMobile || (sys.platform === sys.Platform.WECHAT_MINI_PROGRAM)
        this.fireBtn.active = show;
        this.node.getChildByName('hocker').active = show;
        sys.dump();
        console.log("设备类型：", show, this.#areas.length);
        return this;
    }

    setUserType(type: PlayerType) {
        // console.log('stick player', type, this);
        this.#targetUser = type;
    }

    protected onEnable(): void {
        if (sys.isMobile) {
            this.fireBtn.on(NodeEventType.TOUCH_START, this.#fireHandle);
            this.bindEvent(true);
        } else {
            input.on(Input.EventType.KEY_DOWN, this.#onKeyDown);
            input.on(Input.EventType.KEY_UP, this.#onKeyDown);
        }
    }

    protected onDisable(): void {
        this.fireBtn.off(NodeEventType.TOUCH_START, this.#fireHandle);

        input.off(Input.EventType.KEY_DOWN, this.#onKeyDown);
        input.off(Input.EventType.KEY_UP, this.#onKeyDown);

        this.bindEvent(false);
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
        const map: Record<string, { to: TOWARDS; angle: number }> = {
            top: { to: TOWARDS.UP, angle: 90 },
            down: { to: TOWARDS.DOWN, angle: -90 },
            left: { to: TOWARDS.LEFT, angle: 180 },
            right: { to: TOWARDS.RIGHT, angle: 0 },
        };
        const dirname = e.currentTarget.name.replace(/.+-/, "");
        const { to: dir, angle } = map[dirname];
        this.hocker_right.setRotationFromEuler(new Vec3(0, 0, angle));
        this.node.emit(Stick.EventType.TOUCHING, dir);
        this.hocker_idel.active = false;
        this.hocker_right.active = true;
        console.log('stick turn', this.#targetUser, dir);
    };

    #onTouchEnd = (e: EventTouch) => {
        this.hocker_idel.active = true;
        this.hocker_right.active = false;
        this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
    };
}

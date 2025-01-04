import { _decorator, Component, Enum, EventKeyboard, EventTouch, find, Input, input, KeyCode, Node, NodeEventType, Rect, sys, UITransform, Vec3 } from "cc";
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
    #touching = false;

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

    protected onLoad(): void {
        this.#areas.push(
            ...["up", "down", "left", "right"].map((cpn) => {
                return this.node.getChildByName(cpn);
            })
        );
    }

    hidenVirUI() {
        console.log('设备类型：', sys.isMobile);
        this.#areas.forEach(n => n.active = sys.isMobile);
        this.fireBtn.active = sys.isMobile;
    }

    protected onEnable(): void {
        this.#areas.forEach((node) => {
            node.on(Input.EventType.TOUCH_START, this.#onTouchStart);
            node.on(Input.EventType.TOUCH_END, this.#onTouchEnd);
            node.on(Input.EventType.TOUCH_CANCEL, this.#onTouchCancel);
        });
        this.fireBtn.on(NodeEventType.TOUCH_START, this.#fireHandle)

        input.on(Input.EventType.KEY_DOWN, this.#onKeyDown)
        input.on(Input.EventType.KEY_UP, this.#onKeyDown)
    }

    protected onDisable(): void {
        this.#areas.forEach((node) => {
            node.off(Input.EventType.TOUCH_START, this.#onTouchStart);
            node.off(Input.EventType.TOUCH_END, this.#onTouchEnd);
            node.off(Input.EventType.TOUCH_CANCEL, this.#onTouchCancel);
        });
        this.fireBtn.off(NodeEventType.TOUCH_START, this.#fireHandle)

        input.off(Input.EventType.KEY_DOWN, this.#onKeyDown)
        input.off(Input.EventType.KEY_UP, this.#onKeyDown)
    }

    protected start(): void {
        console.log('onEnabled', this.node.active);
    }

    #fireHandle = () => {
        this.node.emit(Stick.EventType.SHOOTING);
    }

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
        }
        this.node.emit(
            Stick.EventType.TOUCHING,
            map[e.currentTarget.name]
        );
    };

    #onTouchEnd = (e: EventTouch) => {
        this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
    };

    #onTouchCancel = (e: EventTouch) => {
        this.node.emit(Stick.EventType.TOUCHING, TOWARDS.CANCEL);
    };
}

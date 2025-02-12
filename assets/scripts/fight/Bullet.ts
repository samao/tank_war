import { _decorator, BoxCollider2D, Collider, Component, Contact2DType, IPhysics2DContact, Node, Rect, Vec2, Vec3 } from "cc";
import { ContactGroup, PlayerType } from "../mgrs/GameMgr";
import { Base } from "../common/Base";
import { Enemy } from "./Enemy";
const { ccclass, property } = _decorator;

const STAGE_RECT = new Rect(-104, -104, 208, 208);

@ccclass("Bullet")
export class Bullet extends Base {
    @property
    private speed = 20;

    #body: Node;

    #cld: BoxCollider2D;
    #frozen = false;
    #brokenStone = false;

    #owner: PlayerType;

    protected onEnable(): void {
        this.#body = this.node.getChildByName("body");
        this.#cld = this.getComponentInChildren(BoxCollider2D);
        // console.log('create bullet and enable', this.#cld);
        this.#cld.once(Contact2DType.BEGIN_CONTACT, this.#onCollider);
    }

    belongTo(player: PlayerType, brokenStone = false) {
        this.#owner = player;
        this.#brokenStone = brokenStone;
    }

    get brokenStone() {
        return this.#brokenStone;
    }

    owner() {
        return this.#owner;
    }

    protected onDisable(): void {
        // console.log('取消子弹检测')
        this.#cld.off(Contact2DType.BEGIN_CONTACT, this.#onCollider);
    }

    #onCollider = (self: BoxCollider2D, oth: BoxCollider2D, ct: IPhysics2DContact) => {
        this.#frozen = true;
        this.scheduleOnce(() => {
            this.node.destroy();
        });
    };

    update(deltaTime: number) {
        if (this.#frozen) return;
        const pos = this.#body.position;
        this.#body.setPosition(new Vec3(pos.x - this.speed * deltaTime, pos.y, pos.z));
        if (!STAGE_RECT.contains(this.#transTo())) {
            this.node.destroy();
        }
    }

    #transTo() {
        return this.node.parent.inverseTransformPoint(new Vec3(), this.#body.worldPosition).toVec2();
    }
}

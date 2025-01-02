import { _decorator, BoxCollider2D, Collider, Component, Contact2DType, IPhysics2DContact, Node, Rect, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const STAGE_RECT = new Rect(-104, -104, 208, 208);

@ccclass('Bullet')
export class Bullet extends Component {
    @property
    private speed = 20;

    #body: Node;

    #cld: BoxCollider2D;

    // protected onLoad(): void {
    //     this.#body = this.node.getChildByName('body');
    //     this.#cld = this.getComponentInChildren(BoxCollider2D);
    // }

    protected onEnable(): void {
        this.#body = this.node.getChildByName('body');
        this.#cld = this.getComponentInChildren(BoxCollider2D);
        // console.log('create bullet and enable', this.#cld);
        this.#cld.on(Contact2DType.BEGIN_CONTACT, this.#onCollider)
    }

    protected onDisable(): void {
        // console.log('取消子弹检测')
        this.#cld.off(Contact2DType.BEGIN_CONTACT, this.#onCollider)
    }

    #onCollider = (self: BoxCollider2D, oth: BoxCollider2D, ct: IPhysics2DContact) => {
        // console.log(oth.group, oth.name)
        this.scheduleOnce(() => {
            this.node.destroy();
        })
    }

    update(deltaTime: number) {
        const pos = this.#body.position;
        this.#body.setPosition(new Vec3(pos.x - this.speed * deltaTime, pos.y, pos.z))
        if (!STAGE_RECT.contains(this.#transTo())) {
            this.node.destroy();
        }
    }

    #transTo() {
        return this.node.parent.inverseTransformPoint(new Vec3(), this.#body.worldPosition).toVec2();
    }
}



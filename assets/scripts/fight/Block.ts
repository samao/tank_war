import {
    _decorator,
    BoxCollider2D,
    Component,
    Contact2DType,
    director,
    IPhysics2DContact,
    Node,
    NodeEventType,
    RigidBody2D,
    Sprite,
} from "cc";
import { BLOCK, ContactGroup } from "../mgrs/GameMgr";
import { Base } from "../common/Base";
import { Bullet } from "./Bullet";
const { ccclass, property } = _decorator;

@ccclass("Block")
export class Block extends Base {
    #cld: BoxCollider2D;

    #type: BLOCK;

    protected onEnable(): void {
        this.#cld = this.getComponent(BoxCollider2D);
        this.#cld.on(Contact2DType.BEGIN_CONTACT, this.#onCollider);
    }

    protected onDisable(): void {
        this.#cld.off(Contact2DType.BEGIN_CONTACT, this.#onCollider);
        this.unschedule(this._stonezile)
    }

    #onCollider = (self: BoxCollider2D, oth: BoxCollider2D, ct: IPhysics2DContact) => {
        // console.log('被大众：', oth.group, ContactGroup.BULLET, this.#type, this.#type === BLOCK.Wall)
        if (
            ((oth.group === ContactGroup.BULLET || oth.group === ContactGroup.ENEMY_BULLET) &&
                [BLOCK.Wall, BLOCK.Ice, BLOCK.Camp].indexOf(this.#type) !== -1) ||
            (this.#type === BLOCK.Stone && oth.group === ContactGroup.BULLET && oth.node?.parent?.getComponent(Bullet)?.brokenStone)
        ) {
            this.#cld.off(Contact2DType.BEGIN_CONTACT, this.#onCollider);
            if (this.#type === BLOCK.Camp) {
                this.#changeBrokenTexture();

                this.scheduleOnce(() => {
                    this.audio.stop();
                    if (this.#type === BLOCK.Camp) {
                        this.node.destroy();
                        this.game.gameOver();
                    }
                }, 1);
            } else {
                this.scheduleOnce(() => this.node.destroy());
            }
        }
    };

    stonezile() {
        this.#type = BLOCK.Stone;
        this.getComponent(Sprite).spriteFrame = this.game.getBlockTexture(BLOCK.Stone);
        this.unschedule(this._stonezile)
        this.scheduleOnce(this._stonezile, 8);
    }

    _stonezile = () => {
        this.#type = BLOCK.Wall;
        this.getComponent(Sprite).spriteFrame = this.game.getBlockTexture(BLOCK.Wall);
    };

    #changeBrokenTexture() {
        this.audio.effectPlay("use_bomb");
        this.getComponent(Sprite).spriteFrame = this.game.getBlockTexture(BLOCK.Camp_BROKEN);
    }

    setBlockType(type: BLOCK) {
        this.#type = type;

        if (type === BLOCK.Forest) {
            this.#cld.group = ContactGroup.FOREST;
        } else if (type === BLOCK.River) {
            this.#cld.group = ContactGroup.RIVER;
        }
    }

    protected onDestroy(): void {
        // console.log("墙销毁了");
    }
}

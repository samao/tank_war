import {
    _decorator,
    Animation,
    Collider2D,
    Component,
    Contact2DType,
    EventKeyboard,
    EventTouch,
    find,
    Input,
    input,
    instantiate,
    IPhysics2DContact,
    KeyCode,
    Node,
    NodeEventType,
    Prefab,
    rect,
    RigidBody,
    RigidBody2D,
    Sprite,
    SpriteFrame,
    Vec2,
    Vec3,
} from "cc";
import { Base } from "../common/Base";
import { Stick, TOWARDS } from "./Stick";
import { ContactGroup } from "../mgrs/GameMgr";
import { EnemiesMgr } from "../mgrs/EnemiesMgr";
import { Fight } from "./Fight";
const { ccclass, property } = _decorator;

export enum FACE_TO {
    UP = -90,
    DOWN = 90,
    RIGHT = 180,
    LEFT = 0,
}

@ccclass("Player")
export class Player extends Base {
    #animation: Animation;

    @property
    private speed = 10;

    #direction = new Vec2();

    #rgd: RigidBody2D;

    #body: Node;

    @property(Prefab)
    private bulletPrefab: Prefab;

    #stick: Node;
    #playerID: number;
    #bullets: Node;

    #shootTime = 0.5;
    #currentTime = Date.now();

    #frozen = false;

    protected onEnable(): void {
        this.#rgd = this.getComponent(RigidBody2D);
        // console.log("PLAYER LOADED", this.#stick);
        const sfs = this.game.getTankUi("tank_yellow_1");
        const clip = this.animation.createAnimation(sfs);

        this.#body = this.node.getChildByName("body");

        this.#animation = this.#body.getComponent(Animation);
        // this.#animation.playOnLoad = false;
        this.#animation.defaultClip = clip;
        //必须给个默认的皮肤
        this.#body.getComponent(Sprite).spriteFrame = sfs.sfs[0];

        this.#bullets = find("Canvas/game/Mask/bullets");

        this.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onColliderHandle, this);
    }

    onColliderHandle(self: Collider2D, oth: Collider2D, pos: IPhysics2DContact) {
        if (oth.group === ContactGroup.ENEMY || oth.group === ContactGroup.ENEMY_BULLET) {
            pos.disabled = true;
            this.#frozen = true;
            this.audio.effectPlay('player_bomb')
            find("Canvas").getComponent(Fight)?.destroyAtPos(this.node.worldPosition, this.#playerID);
            this.unBindStick();
            this.scheduleOnce(() => {
                this.node.destroy();
            });
        }
    }

    protected onDisable(): void {
        console.log("停止动画");
        this.#animation.pause();
    }

    bindStick(stickNode: Node, id: number) {
        this.#playerID = id;
        this.#stick = stickNode;
        // input.on(Input.EventType.KEY_DOWN, this.#onKeyHandle);
        // input.on(Input.EventType.KEY_UP, this.#onKeyHandle);
        this.#stick.on(Stick.EventType.TOUCHING, this.#stickHandle);
        this.#stick.on(Stick.EventType.SHOOTING, this.#shoot);
    }

    unBindStick(): void {
        if (!this.#stick) {
            return;
        }
        this.#stick.off(Stick.EventType.TOUCHING, this.#stickHandle);
        this.#stick.off(Stick.EventType.SHOOTING, this.#shoot);
    }

    #stickHandle = (dir: TOWARDS) => {
        // console.log('stick fire', dir)
        switch (dir) {
            case TOWARDS.UP:
                this.#direction.set(0, 1);
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.UP));
                break;
            case TOWARDS.DOWN:
                this.#direction.set(0, -1);
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.DOWN));
                break;
            case TOWARDS.LEFT:
                this.#direction.set(-1, 0);
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.LEFT));
                break;
            case TOWARDS.RIGHT:
                this.#direction.set(1, 0);
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.RIGHT));
                break;
            case TOWARDS.CANCEL:
                // 停
                this.#direction.set(0, 0);
                break;
        }

        this.#playWhenWalk();
    };

    #playWhenWalk() {
        if (this.#direction.length() !== 0) {
            this.#animation.play();
            this.audio.play("player_move");
        } else {
            this.audio.stop();
            this.#animation.stop();
        }
    }

    #shoot = () => {
        if (Date.now() - this.#currentTime > this.#shootTime * 1000) {
            this.#currentTime = Date.now();
            this.audio.effectPlay("shoot");
            const bullet = instantiate(this.bulletPrefab);
            // console.log(this.node.position, this.node.worldPosition);
            bullet.setPosition(this.node.position.clone());
            bullet.setRotationFromEuler(this.#body.eulerAngles);
            bullet.setParent(this.#bullets);
        }
    };

    invincible(time: number) {
        // console.log('无敌了');
        const invincible = this.node.getChildByName("invincible");
        invincible.active = true;
        this.scheduleOnce(() => {
            invincible.active = false;
        }, time);
    }

    protected update(dt: number): void {
        if (this.#frozen) {
            return;
        }
        this.#rgd.linearVelocity = new Vec2(this.#direction.x * this.speed * dt, this.#direction.y * this.speed * dt);
    }

    protected onDestroy(): void {
        // console.log('玩家被销毁', this.#stick)
    }
}

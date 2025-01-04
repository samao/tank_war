import {
    _decorator,
    Component,
    Node,
    RigidBody2D,
    Sprite,
    Animation,
    Vec3,
    Contact2DType,
    Collider2D,
    find,
    IPhysics2DContact,
    Vec2,
    math,
    Prefab,
    instantiate,
} from "cc";
import { Base } from "../common/Base";
import { TOWARDS } from "./Stick";
import { FACE_TO } from "./Player";
import { EnemiesMgr } from "../mgrs/EnemiesMgr";
import { ContactGroup } from "../mgrs/GameMgr";
const { ccclass, property } = _decorator;

const baseConfig = {
    name: "tank_green_1",
    speed: 50,
    life: 1,
    attack: true,
    shootGap: 2.5
};
export const TankConfig: (typeof baseConfig)[] = [
    baseConfig,
    { ...baseConfig, name: "tank_red_1" },
    { ...baseConfig, name: "tank_red_2", speed: 90, shootGap: 1 },
    { ...baseConfig, name: "tank_red_3" },
    { ...baseConfig, name: "tank_red_4", life: 3 },
    { ...baseConfig, name: "tank_white_1" },
    { ...baseConfig, name: "tank_white_2", speed: 90, shootGap: 1 },
    { ...baseConfig, name: "tank_white_3", life: 3 },
    { ...baseConfig, name: "tank_yellow_1", life: 1 },
    { ...baseConfig, name: "tank_yellow_2", life: 2 },
    { ...baseConfig, name: "tank_yellow_3", life: 3 },
    { ...baseConfig, name: "tank_yellow_4", life: 4 },
    { ...baseConfig, name: "tank_yellow_5", life: 5 },
];

@ccclass("Enemy")
export class Enemy extends Base {
    #body: Node;

    #walkAnimate: Animation;
    #frozen = false;
    #mgr: EnemiesMgr;
    #swapID: number;
    #cld: Collider2D;
    #rgd: RigidBody2D;

    @property(Prefab)
    private bulletPrefab: Prefab;

    #bullets: Node;
    #direct: TOWARDS;

    private currentTime = 0;

    #tankConfig: typeof baseConfig;

    #lostHealth: number = 0;

    #idelTime = 0;

    protected onLoad(): void {
        super.onLoad();
        this.#mgr = find("Canvas").getComponent(EnemiesMgr);
        this.#body = this.node.getChildByName("body");

        this.#tankConfig = this.randomTankMode();

        const sfs = this.game.getTankUi(this.#tankConfig.name);
        const clip = this.animation.createAnimation(sfs);

        this.#walkAnimate = this.#body.getComponent(Animation);
        this.#walkAnimate.defaultClip = clip;
        //必须给个默认的皮肤
        this.#body.getComponent(Sprite).spriteFrame = sfs.sfs[0].clone();
        this.#walkAnimate.playOnLoad = true;

        this.#cld = this.getComponent(Collider2D);
        this.#cld.on(Contact2DType.BEGIN_CONTACT, this.onColliderHandle);

        this.#rgd = this.getComponent(RigidBody2D);
        this.#bullets = find("Canvas/game/Mask/bullets");
    }

    randomTankMode() {
        return TankConfig[math.randomRangeInt(0, 8)];
    }

    #shoot = () => {
        this.audio.effectPlay("shoot");
        const bullet = instantiate(this.bulletPrefab);
        bullet.getComponentInChildren(Collider2D).group = ContactGroup.ENEMY_BULLET;
        bullet.getComponentInChildren(RigidBody2D).group = ContactGroup.ENEMY_BULLET;
        bullet.setPosition(this.node.position.clone());
        bullet.setRotationFromEuler(this.#body.eulerAngles);
        bullet.setParent(this.#bullets);
    };

    protected onDisable(): void {
        this.#frozen = true;
        this.#walkAnimate.pause();
        this.#cld.off(Contact2DType.BEGIN_CONTACT, this.onColliderHandle);
    }

    onColliderHandle = (self: Collider2D, oth: Collider2D, ct: IPhysics2DContact) => {
        if (oth.group === ContactGroup.BULLET || oth.group === ContactGroup.PLAYER) {
            if (++this.#lostHealth >= this.#tankConfig.life) {
                this.#frozen = true;
                this.audio.effectPlay("tank_bomb");
                this.#mgr.destroyAtPos(this.node.worldPosition.clone(), this.#swapID);

                this.scheduleOnce(() => {
                    this.node.destroy();
                });
            } else {
                this.audio.effectPlay('enemy');
            }
        } else {
            this.turnDifferWay()
        }
    };

    turnDifferWay() {
        this.#frozen = true;
        this.scheduleOnce(() => {
            const canTurn = [TOWARDS.UP, TOWARDS.DOWN, TOWARDS.DOWN, TOWARDS.DOWN, TOWARDS.RIGHT, TOWARDS.LEFT].filter(
                (d) => d !== this.#direct
            );
            this.toward(canTurn[math.randomRangeInt(0, canTurn.length)]);
            this.#frozen = false;
        }, 0.1);
    }

    setSwapID(id: number) {
        this.#swapID = id;
        this.toward(id === 0 ? TOWARDS.LEFT : TOWARDS.RIGHT);
    }

    toward(direction: TOWARDS) {
        this.#direct = direction;

        switch (direction) {
            case TOWARDS.UP:
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.UP));
                break;
            case TOWARDS.DOWN:
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.DOWN));
                break;
            case TOWARDS.LEFT:
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.LEFT));
                break;
            case TOWARDS.RIGHT:
                this.#body.setRotationFromEuler(Vec3.UNIT_Z.clone().multiplyScalar(FACE_TO.RIGHT));
                break;
        }
        // console.log(TOWARDS[this.#direct]);
        return this;
    }
    
    #areaInPreSecond: Vec3[] = [];

    protected update(dt: number): void {
        if (!this.#frozen) {
            this.#rgd.linearVelocity = towardsToVelocity(this.#direct)
                .multiplyScalar(this.#tankConfig.speed * dt)
                .toVec2();
            this.currentTime += dt;

            if (this.#tankConfig.attack && this.currentTime >= this.#tankConfig.shootGap) {
                this.currentTime = 0;
                this.#shoot();
            }
        }

        if (this.#areaInPreSecond.length === 0) {
            this.node.getPosition(this.#areaInPreSecond[0])
            this.node.getPosition(this.#areaInPreSecond[1])
        } else {
            this.#idelTime += dt;
            if (this.#idelTime > 1) {
                this.#idelTime = 0;
                const area = Vec3.subtract(new Vec3(), this.#areaInPreSecond[1], this.#areaInPreSecond[0]);
                if (area.x * area.y > 10) {
                    this.#areaInPreSecond.length = 0;
                } else {
                    console.log('待的太久了')
                    this.turnDifferWay();
                }
            } else {
                Vec3.min(this.#areaInPreSecond[0], this.#areaInPreSecond[0], this.node.position);
                Vec3.max(this.#areaInPreSecond[1], this.#areaInPreSecond[1], this.node.position);
            }
        }
    }
}

const towardsToVelocity = (to: TOWARDS): Vec3 => {
    return {
        [TOWARDS.UP]: Vec3.UP.clone(),
        [TOWARDS.RIGHT]: Vec3.RIGHT.clone(),
        [TOWARDS.LEFT]: Vec3.RIGHT.clone().multiplyScalar(-1),
        [TOWARDS.DOWN]: Vec3.UP.clone().multiplyScalar(-1),
    }[to];
};

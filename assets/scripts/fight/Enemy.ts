import { _decorator, Component, Node, RigidBody2D, Sprite, Animation, Vec3, Contact2DType, Collider2D } from "cc";
import { Base } from "../common/Base";
import { TOWARDS } from "./Stick";
import { FACE_TO } from "./Player";
const { ccclass, property } = _decorator;

@ccclass("Enemy")
export class Enemy extends Base {
    #body: Node;
    #callback: (pos: Vec3) => void;

    protected onLoad(): void {
        super.onLoad();
        this.#body = this.node.getChildByName("body");
    }

    onDie(callBack: (pos: Vec3) => void) {
        this.#callback = callBack;
        this.getComponent(Collider2D).once(Contact2DType.BEGIN_CONTACT, this.#bomb);
        // console.log(this.audio);
    }

    #bomb = () => {
        this.audio.effectPlay("tank_bomb");
        this.scheduleOnce(() => {
            this.#callback(this.node.worldPosition.clone());
            this.node.destroy();
        });
    };

    toward(direction: TOWARDS) {
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

        return this;
    }
}

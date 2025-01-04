import { _decorator, Component, Node, Prefab, Vec2, find, RigidBody2D, Animation, instantiate, Sprite, Vec3, math } from "cc";
import { AnimationMgr } from "./AnimationMgr";
import { GameMgr } from "./GameMgr";
import { Enemy } from "../fight/Enemy";
import { TOWARDS } from "../fight/Stick";
import { MovieClip } from "../common/MovieClip";
const { ccclass, property } = _decorator;

const MAX_ENEMIES_LIVE = 3;

const loop = [0, 1, 2];

@ccclass("EnemiesMgr")
export class EnemiesMgr extends Component {
    @property(Node)
    private enemiesLayer: Node;
    @property(Prefab)
    private enemyPrefab: Prefab;

    @property(Prefab)
    private movieClip: Prefab;

    @property(Node)
    private bomblayer: Node;

    // #animate: AnimationMgr;
    // #animation: Animation;
    // #game: GameMgr;
    // #body: Node;

    #swaps: Node[];
    #positions: Vec3[];

    // protected onLoad(): void {
    //     this.#animate = find("ref").getComponent(AnimationMgr);
    //     this.#game = find("ref").getComponent(GameMgr);
    // }

    setupSwap(swaps: Node[], positions: Vec3[]) {
        console.log(swaps);
        this.#swaps = swaps;
        this.#positions = positions;
        this.unscheduleAllCallbacks();
        this.destroyAll();
        this.#fillEnemy();
    }

    protected onDisable(): void {
        this.unschedule(this._interCreate);
        this.destroyAll();
    }

    #generateOneAtSwap = (swap: Node, position: Vec3, id: number) => {
        swap.active = true;
        this.scheduleOnce(this._interCreate.bind(this, swap, position, id), 1);
    };

    _interCreate = (swap: Node, position: Vec3, id: number) => {
        // console.log('create one enemy')
        swap.active = false;
        const enemy = instantiate(this.enemyPrefab);
        enemy.setPosition(position);
        enemy.setParent(this.enemiesLayer);

        enemy
            .getComponent(Enemy)
            // .toward(TOWARDS.DOWN)
            .setSwapID(id);
    };

    destroyAtPos = (pos: Vec3, id: number) => {
        const bomb = instantiate(this.movieClip);
        bomb.setParent(this.bomblayer);
        bomb.getComponent(MovieClip).bindDir("bumb");
        bomb.setWorldPosition(pos);

        this.scheduleOnce(() => {
            bomb.destroy();
        }, 0.5);

        this.scheduleOnce(() => {
            this.#generateOneAtSwap(this.#swaps[id], this.#positions[id], id);
        }, 2);
    };

    #fillEnemy() {
        const liveEnemyCount = this.enemiesLayer.children.length;
        for (let i = MAX_ENEMIES_LIVE; i > liveEnemyCount; i--) {
            const id = loop.shift();
            // console.log("需要补, 位置", id);
            this.#generateOneAtSwap(this.#swaps[id], this.#positions[id], id);
            loop.push(id);
        }
    }

    destroyAll() {
        // console.log('吹灰')
        this.bomblayer.removeAllChildren();
        this.enemiesLayer.removeAllChildren();
    }
}

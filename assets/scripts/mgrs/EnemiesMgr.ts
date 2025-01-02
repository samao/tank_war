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

    #animate: AnimationMgr;
    #animation: Animation;
    #game: GameMgr;
    #body: Node;
    #swaps: Node[];
    #positions: Vec3[];

    protected onLoad(): void {
        this.#animate = find("ref").getComponent(AnimationMgr);
        this.#game = find("ref").getComponent(GameMgr);
    }

    setupSwap(swaps: Node[], positions: Vec3[]) {
        this.#swaps = swaps;
        this.#positions = positions;
        this.bomblayer.removeAllChildren();
        this.enemiesLayer.removeAllChildren();

        this.#fillEnemy();
    }

    #generateOneAtSwap(swap: Node, position: Vec3) {
        swap.active = true;
        this.scheduleOnce(() => {
            // console.log('create one enemy')
            swap.active = false;
            const sfs = this.#game.getTankUi("tank_white_2");
            const clip = this.#animate.createAnimation(sfs);
            const enemy = instantiate(this.enemyPrefab);
            enemy.setPosition(position);
            enemy.setParent(this.enemiesLayer);

            this.#body = enemy.getChildByName("body");
            this.#animation = this.#body.getComponent(Animation);
            this.#animation.defaultClip = clip;
            //必须给个默认的皮肤
            this.#body.getComponent(Sprite).spriteFrame = sfs.sfs[0];
            this.#animation.playOnLoad = true;

            enemy
                .getComponent(Enemy)
                .toward(TOWARDS.DOWN)
                .onDie((pos: Vec3) => {
                    this.playBombAt(pos);

                    //本来的位置再生成个
                    this.scheduleOnce(() => {
                        this.#generateOneAtSwap(swap, position);
                    }, 2);
                });
        }, 1);
    }

    playBombAt(pos: Vec3) {
        const bomb = instantiate(this.movieClip);
        bomb.setParent(this.bomblayer);
        bomb.getComponent(MovieClip).bindDir("bumb");
        bomb.setWorldPosition(pos);

        this.scheduleOnce(() => {
            bomb.destroy();
        }, 0.4);
    }

    #fillEnemy() {
        const liveEnemyCount = this.enemiesLayer.children.length;
        for (let i = MAX_ENEMIES_LIVE; i > liveEnemyCount; i--) {
            const id = loop.shift();
            // console.log("需要补, 位置", id);
            this.#generateOneAtSwap(this.#swaps[id], this.#positions[id]);
            loop.push(id);
        }
    }
}

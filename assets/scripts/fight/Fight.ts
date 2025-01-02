import {
    _decorator,
    Camera,
    Contact2DType,
    find,
    instantiate,
    math,
    Node,
    Prefab,
    Size,
    Sprite,
    SpriteFrame,
    UITransform,
    Vec2,
    Vec3,
} from "cc";
import { Base } from "../common/Base";
import { GameMode, BLOCK, BlockTexture } from "../mgrs/GameMgr";
import { Block } from "./Block";
import { Player } from "./Player";
import { MovieClip } from "../common/MovieClip";
import { EnemiesMgr } from "../mgrs/EnemiesMgr";
const { ccclass, property } = _decorator;

const SCREEN = new Size(208, 208);
const COLUMN_SIZE = 26;
const BLOCK_SIZE = new Size(8, 8);
const START_POS = new Vec2(SCREEN.width, SCREEN.height).multiplyScalar(0.5);

export const SWAPN_POINTS = [
    new Vec3().add3f(-SCREEN.x / 2 + BLOCK_SIZE.width, SCREEN.height / 2 - BLOCK_SIZE.height, 0),
    new Vec3().add3f(0, SCREEN.height / 2 - BLOCK_SIZE.height, 0),
    new Vec3().add3f(SCREEN.x / 2 - BLOCK_SIZE.width, SCREEN.height / 2 - BLOCK_SIZE.height, 0),
];

@ccclass("Fight")
export class Fight extends Base {
    #mainCamera: Camera;
    #deputyCamera: Camera;
    #player2Camera: Camera;

    #level = 1;

    @property({ type: Node, displayName: "下层" })
    private behind: Node;

    @property({ type: Node, displayName: "上层" })
    private front: Node;

    @property(Prefab)
    private blockPrefab: Prefab;

    @property({ type: Node, displayName: "玩家容器" })
    private players: Node;

    @property(Prefab)
    private playerPrefab: Prefab;

    @property({displayName: '出生无敌时间'})
    private invincibleTime = 2;

    #playerSticks: Map<Player, Node> = new Map();

    @property(Prefab)
    private movieClip: Prefab;

    protected onLoad(): void {
        super.onLoad();
        [this.#mainCamera, this.#deputyCamera, this.#player2Camera] = this.getComponentsInChildren(Camera);
        this.#mainCamera.orthoHeight = 104;
    }

    onEnable() {
        this.audio.effectPlay("game_start");
        console.log("开启模式:", this.game.getMode());

        this.setupCamare();

        this.game.loadAllBlockTexture(() => {
            this.createGameMap();
        });
    }

    protected onDestroy(): void {
        console.log("FIGHT DES");
        // this.#disConnectStick();
    }

    protected onDisable(): void {
        console.log("FIGHT DISABLE");
        this.#disConnectStick();
    }

    setupCamare() {
        switch (this.game.getMode()) {
            case GameMode.DOUBLE:
                this.#deputyCamera.enabled = true;
                this.#player2Camera.enabled = true;
                this.#mainCamera.enabled = false;
                break;
            default:
                this.#mainCamera.enabled = true;
                this.#deputyCamera.enabled = this.#player2Camera.enabled = false;
                break;
        }
    }

    nextLevel() {
        this.#level++;
        this.front.removeAllChildren();
        this.behind.removeAllChildren();
        this.players.removeAllChildren();

        this.createGameMap();
    }

    prevLevel() {
        this.#level--;
        this.front.removeAllChildren();
        this.behind.removeAllChildren();
        this.players.removeAllChildren();

        this.createGameMap();
    }

    private createGameMap() {
        const mapTags = this.game.getMapDataByLevel(this.#level);

        for (let i = 0; i < mapTags.length; i++) {
            if (mapTags[i] !== BLOCK.None) {
                const col = Math.floor(i / COLUMN_SIZE);
                const row = i % COLUMN_SIZE;
                const pos = new Vec2((row + 0.5) * BLOCK_SIZE.width, (col + 0.5) * BLOCK_SIZE.height)
                    .subtract(START_POS)
                    .multiplyScalar(-1);
                this.createBlockAt(mapTags[i] as BLOCK, pos, BLOCK_SIZE, i);
            } else if (i === 13) {
                this.createBlockAt(
                    BLOCK.Camp,
                    new Vec2(0, BLOCK_SIZE.height - SCREEN.height * 0.5),
                    new Size(BLOCK_SIZE.width * 2, BLOCK_SIZE.height * 2),
                    i
                );
            }
        }

        this.createPlayerTank();
        this.#createEnemySwapPoint();
    }

    #createEnemySwapPoint() {
        const swapPoint = find("Canvas/game/Mask/swap_point");
        swapPoint.removeAllChildren();
        const swaps = SWAPN_POINTS.map((point) => {
            const movie = instantiate(this.movieClip).getComponent(MovieClip);
            movie.node.setPosition(point);
            movie.node.setParent(swapPoint);
            movie.bindDir("star");

            movie.node.active = false;

            return movie.node;
        });

        this.getComponent(EnemiesMgr).setupSwap(swaps, SWAPN_POINTS);
    }

    private createBlockAt(type: BLOCK, pos: Vec2, { width, height }: Size, id: number) {
        const block = instantiate(this.blockPrefab);
        const sf = this.game.getBlockTexture(type);
        // console.log(type, BlockTexture[type].pic);
        block.name = BlockTexture[type].pic + "_" + id;
        block.getComponent(Sprite).spriteFrame = sf;
        block.getComponent(UITransform).setContentSize(width, height);
        block.setPosition(pos.toVec3());
        if (type === BLOCK.Forest) {
            block.setParent(this.front);
        } else {
            block.setParent(this.behind);
        }

        block.getComponent(Block).setBlockType(type);

        return block;
    }

    private blockIndexToPos(index: number) {
        const col = Math.floor(index / COLUMN_SIZE);
        const row = index % COLUMN_SIZE;
        return new Vec2((row + 0.5) * BLOCK_SIZE.width, (col + 0.5) * BLOCK_SIZE.height).subtract(START_POS).multiplyScalar(-1);
    }

    #disConnectStick() {
        console.log("销毁STICK 关联");
        this.#playerSticks.forEach((stick, player) => {
            player.unBindStick();
        });
        this.#playerSticks.clear();
    }

    private createPlayerTank() {
        this.#disConnectStick();

        const pos = this.blockIndexToPos(SWAP_POINT.x);
        const player = instantiate(this.playerPrefab);
        player.setPosition(pos.toVec3().subtract(new Vec3(0, 4, 0)));
        player.setParent(this.players);
        const p1stick = find("Canvas/ui/sticks/player1");
        const playerCMP = player.getComponent(Player);
        playerCMP.bindStick(p1stick);
        playerCMP.invincible(this.invincibleTime);

        this.#playerSticks.set(playerCMP, p1stick);

        if (this.game.getMode() === GameMode.DOUBLE) {
            const pos = this.blockIndexToPos(SWAP_POINT.y);
            const player2 = instantiate(this.playerPrefab);
            player2.setPosition(pos.toVec3().subtract(new Vec3(0, 4, 0)));
            player2.setParent(this.players);
            const p2stick = find("Canvas/ui/sticks/player2");
            p2stick.active = true;
            const playerCMP = player2.getComponent(Player);
            playerCMP.bindStick(p2stick);
            playerCMP.invincible(this.invincibleTime);

            this.#playerSticks.set(playerCMP, p2stick);
        }
    }
}

const SWAP_POINT = new Vec2(666, 633);

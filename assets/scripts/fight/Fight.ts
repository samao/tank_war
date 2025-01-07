import { _decorator, Camera, director, find, instantiate, Label, Node, Prefab, Size, Sprite, sys, UITransform, Vec2, Vec3 } from "cc";
import { Base } from "../common/Base";
import { GameMode, BLOCK, BlockTexture, GameMgr, PlayerType } from "../mgrs/GameMgr";
import { Block } from "./Block";
import { Player } from "./Player";
import { MovieClip } from "../common/MovieClip";
import { EnemiesMgr } from "../mgrs/EnemiesMgr";
import { Stick } from "./Stick";
import { TOTAL_LEVELS } from "../game.conf";
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

    @property({ displayName: "出生无敌时间" })
    private invincibleTime = 5;

    #playerSticks: Map<Player, Node> = new Map();

    @property(Prefab)
    private movieClip: Prefab;

    @property(Node)
    private bomblayer: Node;

    @property(Label)
    private stageLabel: Label;

    @property(Node)
    private levelUI: Node;

    @property(Node)
    private enemies: Node;

    protected onLoad(): void {
        super.onLoad();
        [this.#mainCamera, this.#deputyCamera, this.#player2Camera] = this.getComponentsInChildren(Camera);
        this.#mainCamera.orthoHeight = 104;
    }

    onEnable() {
        console.log("开启模式:", this.game.getMode());

        this.setupCamare();

        this.game.loadAllBlockTexture(() => {
            this.createGameMap();
        });

        this.game.node.on(GameMgr.EventType.NEXT_STAGE, this.nextLevel);
    }

    protected onDestroy(): void {
        console.log("FIGHT DES");
        // this.#disConnectStick();
    }

    protected onDisable(): void {
        console.log("FIGHT DISABLE");
        this.game.node.off(GameMgr.EventType.NEXT_STAGE, this.nextLevel);
        this.#disConnectStick();
        this.unscheduleAllCallbacks();
    }

    setupCamare() {
        if (sys.isMobile) {
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
        } else {
            this.#mainCamera.enabled = true;
            this.#deputyCamera.enabled = this.#player2Camera.enabled = false;
        }
    }

    nextLevel = () => {
        this.audio.stopAll();
        if (this.#level >= TOTAL_LEVELS) {
            director.loadScene("win");
            return;
        }
        this.#level++;
        this.#removeAll();
        this.createGameMap();
    };

    prevLevel() {
        this.#level--;
        this.#removeAll();
        this.createGameMap();
    }

    #removeAll() {
        this.front.removeAllChildren();
        this.behind.removeAllChildren();
        this.players.removeAllChildren();
        this.enemies.removeAllChildren();
    }

    private async createGameMap() {
        this.audio.effectPlay("game_start");
        this.levelUI.active = true;
        this.stageLabel.string = this.#level + "";

        this.game.setGameLevel(this.#level);

        find("Canvas/ui").active = false;

        await new Promise((res) => {
            this.scheduleOnce(res, 3);
        });

        this.levelUI.active = false;
        find("Canvas/ui").active = true;

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
            movie.node.setScale(0.8, 0.8);
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

    destroyAtPos = (pos: Vec3, id = 0) => {
        const bomb = instantiate(this.movieClip);
        bomb.setParent(this.bomblayer);
        bomb.getComponent(MovieClip).bindDir("blast");
        bomb.setWorldPosition(pos);

        this.scheduleOnce(() => {
            bomb.destroy();
        }, 0.5);

        this.createPlayerById(id);
    };

    createPlayerById = (id: number) => {
        this.scheduleOnce(() => {
            const pos = this.blockIndexToPos(id !== 0 && this.game.getMode() === GameMode.DOUBLE ? SWAP_POINT.y : SWAP_POINT.x);
            const player = instantiate(this.playerPrefab);
            player.setPosition(pos.toVec3().subtract(new Vec3(0, 4, 0)));
            player.setParent(this.players);
            const p1stick = find(`Canvas/ui/sticks/player${id !== 0 && this.game.getMode() === GameMode.DOUBLE ? "2" : "1"}`);
            const playerCMP = player.getComponent(Player);
            p1stick.getComponent(Stick).hidenVirUI().setUserType(id);
            playerCMP.bindStick(p1stick, id);
            playerCMP.invincible(this.invincibleTime);
            playerCMP.playerType = id !== 0 && this.game.getMode() === GameMode.DOUBLE ? PlayerType.PLAYER_2 : PlayerType.PLAYER_1;
            this.#playerSticks.set(playerCMP, p1stick);
        }, 1);
    };

    private createPlayerTank() {
        this.#disConnectStick();

        const pos = this.blockIndexToPos(SWAP_POINT.x);
        const player = instantiate(this.playerPrefab);
        player.setPosition(pos.toVec3().subtract(new Vec3(0, 4, 0)));
        player.setParent(this.players);
        const p1stick = find("Canvas/ui/sticks/player1");
        p1stick
            .getComponent(Stick)
            .hidenVirUI(this.game.getMode() === GameMode.DOUBLE ? -90 : 0)
            .setUserType(PlayerType.PLAYER_1);
        const playerCMP = player.getComponent(Player);
        playerCMP.bindStick(p1stick, 0);
        playerCMP.invincible(this.invincibleTime);
        playerCMP.playerType = PlayerType.PLAYER_1;
        this.#playerSticks.set(playerCMP, p1stick);

        if (this.game.getMode() === GameMode.DOUBLE) {
            const pos = this.blockIndexToPos(SWAP_POINT.y);
            const player2 = instantiate(this.playerPrefab);
            player2.setPosition(pos.toVec3().subtract(new Vec3(0, 4, 0)));
            player2.setParent(this.players);
            const p2stick = find("Canvas/ui/sticks/player2");
            p2stick.active = true;
            p2stick.getComponent(Stick).hidenVirUI(90).setUserType(PlayerType.PLAYER_2);
            const playerCMP = player2.getComponent(Player);
            playerCMP.bindStick(p2stick, 1);
            playerCMP.invincible(this.invincibleTime);
            playerCMP.playerType = PlayerType.PLAYER_2;
            this.#playerSticks.set(playerCMP, p2stick);
        }
    }
}

const SWAP_POINT = new Vec2(666, 633);

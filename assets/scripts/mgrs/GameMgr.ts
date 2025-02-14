import {
    _decorator,
    Component,
    director,
    EventKeyboard,
    find,
    game,
    Input,
    input,
    KeyCode,
    math,
    resources,
    SpriteFrame,
    sys,
    TextAsset,
} from "cc";
import { ENEMY_TOTAL_PER_LEVEL, LIFE_AWARD_GAP, PLAYER_LEVEL, PLAYER_LIFE_TOTAL } from "../game.conf";
import { AudioMgr } from "./AudioMgr";
import { toast } from "./toast";
const { ccclass, property } = _decorator;

export enum GameMode {
    SINGLE,
    DOUBLE,
}

export enum BLOCK {
    None = "0",
    Forest = "1",
    Ice = "2",
    Wall = "3",
    River = "4",
    Stone = "5",
    Camp = "99",
    Camp_BROKEN = "100",
}

export enum BONUS {
    BASE_IRON,
    BOMB_ALL,
    FROZEN_ALL,
    POWERFUL,
    INVINCIBLE,
    LIFE,
}

export const BonusTexture = {
    [BONUS.BASE_IRON]: "base-iron",
    [BONUS.BOMB_ALL]: "bomb-all",
    [BONUS.FROZEN_ALL]: "frozen-all",
    [BONUS.POWERFUL]: "strong-power",
    [BONUS.LIFE]: "tank-life",
    [BONUS.INVINCIBLE]: 'invincible'
};

export enum ContactGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    BULLET = 1 << 2,
    BLOCK = 1 << 3,
    FOREST = 1 << 4,
    RIVER = 1 << 5,
    ENEMY = 1 << 6,
    ENEMY_BULLET = 1 << 7,
    BONUS = 1 << 8,
}

export const BlockTexture: Record<Exclude<BLOCK, BLOCK.None>, { pic: string }> = {
    [BLOCK.Forest]: { pic: "forest" },
    [BLOCK.Ice]: { pic: "ice" },
    [BLOCK.Wall]: { pic: "wall" },
    [BLOCK.River]: { pic: "river-0" },
    [BLOCK.Stone]: { pic: "stone" },
    [BLOCK.Camp]: { pic: "camp0" },
    [BLOCK.Camp_BROKEN]: { pic: "camp1" },
};

export enum PlayerType {
    PLAYER_1,
    PLAYER_2,
}

@ccclass("GameMgr")
export class GameMgr extends Component {
    static EventType = {
        RESET_ALL: "resetAll",
        PLAYER_SCORE_ADD: "playerScoreAdd",
        PLAYER_LIFE_LOST: "playerLifeLost",
        PLAYER_LIFE_ADD: "playerLifeAdd",
        ENEMY_DISCOUNT: "enemyDisCount",
        GAME_LEVEL_CHANGE: "gameLevelChange",
        NEXT_STAGE: "nextStage",
        BOMB_ALL_ENEMY: "bombAllEnemy",
        IRON_BASE_WALL: "ironBaseWall",
        FROZEN_ALL_ENEMY: "frozenAllEnemy",
        PLAYER_POWERFUL: "playerPowerful",
        PLAYER_INVINCIBLE: 'playerInvincible',
        DESTROY_PLAYER_AT_POINT: 'destroyPlayerAtPoint',
        DESTROY_ENEMY_AT_POINT: 'destroyEnemyAtPoint'
    };

    #mode: GameMode = GameMode.SINGLE;
    #map: Map<string, string> = new Map();

    #tankMap: Map<string, SpriteFrame[]> = new Map();
    // 地图皮肤
    #blockMap: Map<string, SpriteFrame> = new Map();
    #_ready = false;
    #sfsMap: Map<string, SpriteFrame[]> = new Map();
    // 奖励道具
    #itemMap: Map<string, SpriteFrame> = new Map();

    #playerinfo: { id: PlayerType; level: PLAYER_LEVEL; life: number; score: number; awardGap: number };
    #player2info: { id: PlayerType; level: PLAYER_LEVEL; life: number; score: number; awardGap: number };
    #enemy_wait_create_cnt: number;
    #enemy_die_count: number = 0;

    #game_level: number = 1;

    getGlobalPlayerLevel(player: PlayerType) {
        if (player === PlayerType.PLAYER_1) {
            return this.#playerinfo.level
        } else {
            return this.#player2info.level
        }
    }

    getGameLevel() {
        return this.#game_level;
    }

    asyncPlayerLevel(player: PlayerType, lv: PLAYER_LEVEL) {
        if (player === PlayerType.PLAYER_1) {
            this.#playerinfo.level = lv;
        } else {
            this.#player2info.level = lv;
        }
    }

    protected onEnable(): void {
        this.resetGameinfo();
        if (sys.isMobile) {
            input.on(Input.EventType.KEY_UP, this.#quit);
        }
    }

    protected onDisable(): void {
        if (sys.isMobile) {
            input.off(Input.EventType.KEY_UP, this.#quit);
        }
    }

    dump() {
        console.log("当前还未生成数量:", this.#enemy_wait_create_cnt, "已经死掉的：", this.#enemy_die_count);
    }

    reduceWaitCount(val = 1) {
        this.#enemy_wait_create_cnt = math.clamp(this.#enemy_wait_create_cnt - val, 0, ENEMY_TOTAL_PER_LEVEL);
    }

    enemyWaitCount() {
        return this.#enemy_wait_create_cnt;
    }

    addWaitCount() {
        this.#enemy_wait_create_cnt += 1;
    }

    setGameLevel = (lv: number) => {
        this.#game_level = lv;
        this.node.emit(GameMgr.EventType.GAME_LEVEL_CHANGE, lv);
    };

    resetGameinfo() {
        this.#playerinfo = { id: PlayerType.PLAYER_1, level: PLAYER_LEVEL.ONE, life: PLAYER_LIFE_TOTAL, score: 0, awardGap: LIFE_AWARD_GAP };
        this.#player2info = { id: PlayerType.PLAYER_2, level: PLAYER_LEVEL.ONE, life: PLAYER_LIFE_TOTAL, score: 0, awardGap: LIFE_AWARD_GAP };
        this.#enemy_wait_create_cnt = ENEMY_TOTAL_PER_LEVEL;
        this.#enemy_die_count = 0;
        this.node.emit(GameMgr.EventType.RESET_ALL);
    }

    discountLife = (target: PlayerType) => {
        if (target === PlayerType.PLAYER_1) {
            this.#playerinfo.life = this.#playerinfo.life - 1;
            this.node.emit(GameMgr.EventType.PLAYER_LIFE_LOST, target);
        } else {
            this.#player2info.life = this.#player2info.life - 1;
            this.node.emit(GameMgr.EventType.PLAYER_LIFE_LOST, target);
        }

        if (
            (this.#mode === GameMode.SINGLE && this.#playerinfo.life === 0) ||
            (this.#playerinfo.life === 0 && this.#player2info.life === 0)
        ) {
            this.gameOver();
        }
    };

    addPlayerScore = (target: PlayerType, bounds: number) => {
        if (target === PlayerType.PLAYER_1) {
            this.#playerinfo.score += bounds;
            this.checkAddLife(this.#playerinfo, bounds);
            this.node.emit(GameMgr.EventType.PLAYER_SCORE_ADD, { id: PlayerType.PLAYER_1, score: bounds });
        } else {
            this.#player2info.score += bounds;
            this.checkAddLife(this.#player2info, bounds);
            this.node.emit(GameMgr.EventType.PLAYER_SCORE_ADD, { id: PlayerType.PLAYER_2, score: bounds });
        }
    };

    private checkAddLife(info: { id: PlayerType; life: number; awardGap: number }, bounds: number) {
        // console.log(info, bounds);
        if (info.awardGap - bounds < 0) {
            info.life++;
            info.awardGap = LIFE_AWARD_GAP - (bounds - info.awardGap);
            find("ref").getComponent(AudioMgr).effectPlay("get_double_laser");
            this.node.emit(GameMgr.EventType.PLAYER_LIFE_ADD, info.id);
        } else {
            info.awardGap -= bounds;
        }
    }

    directlyAddLife(player: PlayerType, count = 1) {
        if (player === PlayerType.PLAYER_1) {
            this.#playerinfo.life += count;
        } else {
            this.#player2info.life += count;
        }
        find("ref").getComponent(AudioMgr).effectPlay("get_double_laser");
        this.node.emit(GameMgr.EventType.PLAYER_LIFE_ADD, player);
    }

    enemyDie = () => {
        // console.log('死了一个')
        this.#enemy_die_count++;
        this.node.emit(GameMgr.EventType.ENEMY_DISCOUNT);

        if (this.#enemy_die_count >= ENEMY_TOTAL_PER_LEVEL) {
            console.log("你赢了");
            this.scheduleOnce(() => {
                console.log("下一关");
                this.#enemy_die_count = 0;
                this.#enemy_wait_create_cnt = ENEMY_TOTAL_PER_LEVEL;
                this.node.emit(GameMgr.EventType.NEXT_STAGE);
            }, 1);
        }
    };

    #quit = (e: EventKeyboard) => {
        if (e.keyCode === KeyCode.BACKSPACE || e.keyCode === KeyCode.MOBILE_BACK) {
            game.end();
        }
    };

    protected onLoad(): void {
        // console.log('onload GMR');
        resources.loadDir("mapsdata/", TextAsset, (err, data: TextAsset[]) => {
            if (err) {
                toast(err.message);
                return;
            }
            data.forEach((ta) => {
                this.#map.set(ta.name, ta.text);
            });

            console.log("地图数据加载完了");

            this.node.emit("mapDataReady");

            resources.loadDir("tank/", SpriteFrame, (err, data: SpriteFrame[]) => {
                if (err) {
                    toast(err.message);
                    return;
                }

                data.forEach((sf) => {
                    sf.addRef();
                    const tankName = sf.name.replace(/_\d$/gi, "");
                    const subMap = this.#tankMap.get(tankName) ?? [];
                    subMap.push(sf);
                    this.#tankMap.set(tankName, subMap);
                });
                this.#_ready = true;
                console.log("坦克皮肤加载完了");

                this.node.emit("tankUiReady");

                resources.loadDir("/items", SpriteFrame, (err, sfs: SpriteFrame[]) => {
                    if (err) {
                        toast(err.message);
                        return;
                    }

                    sfs.forEach((sf) => {
                        sf.addRef();
                        this.#itemMap.set(sf.name, sf);
                    });
                    console.log("道具皮肤加载完了");
                    this.node.emit("itemReady");

                    this.node.emit("ready");
                });
            });
        });
    }

    getBonusTexture(type: BONUS) {
        return this.#itemMap.get(BonusTexture[type]);
    }

    loadSpriteFrameDir(dir: string, callback: (sfs: SpriteFrame[]) => void) {
        if (this.#sfsMap.has(dir)) {
            // this.node.emit(GameMgr.Event_Type.Asset_Dir_Complete, dir, this.#sfsMap.get(dir));
            callback(this.#sfsMap.get(dir));
            return;
        }

        let cancled = false;
        resources.loadDir(dir, SpriteFrame, (err, sfs: SpriteFrame[]) => {
            if (err) {
                return;
            }
            sfs.forEach((sf) => {
                sf.addRef();
            });
            this.#sfsMap.set(dir, sfs);

            if (!cancled) {
                callback(sfs);
            }
        });

        /** 调用取消回调执行 */
        return () => {
            cancled = true;
        };
    }

    getMapDataByLevel(level: number) {
        return this.#map.get(level.toString());
    }

    loadAllBlockTexture(onReady: () => void) {
        if (this.#blockMap.size !== 0) {
            onReady();
            return;
        }
        resources.loadDir("map/", SpriteFrame, (err, sfs: SpriteFrame[]) => {
            if (err) {
                return;
            }

            sfs.forEach((sf) => {
                sf.addRef();
                this.#blockMap.set(sf.name, sf);
            });
            // console.log(this.#blockMap);
            onReady();
        });
    }

    getBlockTexture(type: BLOCK) {
        return this.#blockMap.get(BlockTexture[type].pic);
    }

    getTankUi(name: string) {
        return { name, sfs: this.#tankMap.get(name)! };
    }

    setMode(type: GameMode) {
        // console.log('当前游戏模式', type);
        this.#mode = type;
    }

    getMode() {
        return this.#mode;
    }

    gameOver() {
        this.node.emit(GameMgr.EventType.RESET_ALL);
        director.loadScene("over");
    }

    get ready() {
        return this.#_ready;
    }
}

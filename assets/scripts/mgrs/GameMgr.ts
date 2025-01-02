import { _decorator, Component, Node, resources, SpriteFrame, TextAsset } from "cc";
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
    Camp_BROKEN = '100'
}

export enum ContactGroup {
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    BULLET = 1 << 2,
    BLOCK = 1 << 3,
    FOREST = 1 << 4,
    RIVER = 1 << 5,
}

export const BlockTexture: Record<Exclude<BLOCK, BLOCK.None>, { pic: string }> = {
    [BLOCK.Forest]: { pic: "forest" },
    [BLOCK.Ice]: { pic: "ice" },
    [BLOCK.Wall]: { pic: "wall" },
    [BLOCK.River]: { pic: "river-0" },
    [BLOCK.Stone]: { pic: "stone" },
    [BLOCK.Camp]: { pic: "camp0" },
    [BLOCK.Camp_BROKEN]: { pic: "camp1" }
};

@ccclass("GameMgr")
export class GameMgr extends Component {
    #mode: GameMode = GameMode.SINGLE;
    #map: Map<string, string> = new Map();

    #tankMap: Map<string, SpriteFrame[]> = new Map();
    #blockMap: Map<string, SpriteFrame> = new Map();
    #_ready = false;
    #sfsMap: Map<string,SpriteFrame[]> = new Map();

    protected onLoad(): void {
        // console.log('onload GMR');
        resources.loadDir("mapsdata/", TextAsset, (err, data: TextAsset[]) => {
            if (err) {
                return;
            }
            data.forEach((ta) => {
                this.#map.set(ta.name, ta.text);
            });

            console.log("地图数据加载完了");

            this.node.emit("mapDataReady");

            resources.loadDir("tank/", SpriteFrame, (err, data: SpriteFrame[]) => {
                if (err) {
                    return;
                }

                data.forEach((sf) => {
                    const tankName = sf.name.replace(/_\d$/gi, "");
                    const subMap = this.#tankMap.get(tankName) ?? [];
                    subMap.push(sf);
                    this.#tankMap.set(tankName, subMap);
                });
                this.#_ready = true;
                console.log("坦克皮肤加载完了");

                this.node.emit("tankUiReady");

                this.node.emit("ready");
            });
        });
    }

    loadSpriteFrameDir(dir: string, callback: (sfs: SpriteFrame[]) => void) {
        if (this.#sfsMap.has(dir)) {
            callback(this.#sfsMap.get(dir));
            return;
        }
        resources.loadDir(dir, SpriteFrame, (err, sfs: SpriteFrame[]) => {
            if (err) {
                return;
            }
            this.#sfsMap.set(dir, sfs);
            callback(sfs);
        })
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
        return {name, sfs: this.#tankMap.get(name)!};
    }

    setMode(type: GameMode) {
        // console.log('当前游戏模式', type);
        this.#mode = type;
    }

    getMode() {
        return this.#mode;
    }

    get ready() {
        return this.#_ready;
    }
}

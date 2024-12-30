import { _decorator, Component, Node, resources, SpriteFrame, TextAsset } from "cc";
const { ccclass, property } = _decorator;

export enum GameMode {
    SINGLE,
    DOUBLE,
}

@ccclass("GameMgr")
export class GameMgr extends Component {
    #mode: GameMode = GameMode.SINGLE;
    #map: Map<string, string> = new Map();

    #tankMap: Map<string, SpriteFrame[]> = new Map();

    #_ready = false;

    protected onLoad(): void {
        resources.loadDir("mapsdata/", TextAsset, (err, data: TextAsset[]) => {
            if (err) {
                return;
            }
            data.forEach((ta) => {
                this.#map.set(ta.name, ta.text);
            });

            console.log('地图数据加载完了')

            this.node.emit('mapDataReady')

            resources.loadDir('tank/', SpriteFrame, (err, data: SpriteFrame[]) => {
                if (err) {
                    return;
                }
    
                data.forEach(sf => {
                    const tankName = sf.name.replace(/_\d$/ig, '');
                    const subMap = this.#tankMap.get(tankName) ?? [];
                    subMap.push(sf);
                    this.#tankMap.set(tankName, subMap);
                })
                this.#_ready = true;
                console.log('坦克皮肤加载完了');
    
                this.node.emit('tankUiReady')

                this.node.emit("ready")
            })
        });
    }

    getTankUi(name: string) {
        return this.#tankMap.get(name)!;
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

import {
    _decorator,
    Color,
    Component,
    EventMouse,
    find,
    Graphics,
    Input,
    input,
    instantiate,
    Node,
    NodeEventType,
    Prefab,
    Size,
    Sprite,
    UITransform,
    Vec2,
    Vec3,
} from "cc";
import { Base } from "../common/Base";
import { Block } from "../fight/Block";
import { BLOCK, BlockTexture } from "../mgrs/GameMgr";
const { ccclass, property } = _decorator;

import { Astar } from "../common/Util";

@ccclass("eidtor")
export class eidtor extends Base {
    @property(Prefab)
    private blockPrefab: Prefab;

    #nodes: Map<string, Sprite> = new Map();

    protected onEnable(): void {
        const mapData = this.game.getMapDataByLevel(1);
        // const matrix: string[][] = [];
        console.log("初始化数据");
        /** node 对应的小块行列 */
        const min_block_map: Map<Node, [number, number]> = new Map();
        const pfGrid = new Astar.Grid(26, 26);

        this.game.loadAllBlockTexture(() => {
            for (let col = 0; col < 26; col++) {
                for (let row = 0; row < 26; row++) {
                    const index = col * 26 + row;
                    const node = this.createBlockAt(mapData[index] as BLOCK, new Vec2(row * 8, col * 8), new Size(8, 8), index);
                    this.#nodes.set(`col=${col},row=${row}`, node.getComponent(Sprite));

                    min_block_map.set(node, [col, row]);

                    pfGrid.setWalkableAt(col, row, [BLOCK.None, BLOCK.Forest].indexOf(mapData[index] as BLOCK) !== -1 ? true : false);
                }
            }

            const bigGrid = new Astar.Grid(13, 13);

            for (let col = 0; col < 13; col++) {
                for (let row = 0; row < 13; row++) {
                    const startPosX = 2 * row;
                    const startPosY = 2 * col;

                    const tr = [startPosX, startPosY];
                    const tl = [startPosX + 1, startPosY];
                    const dr = [startPosX, startPosY + 1];
                    const dl = [startPosX + 1, startPosY + 1];
                    // console.log(tr, tl, dr, dl);
                    const walkable = [tr, tl, dr, dl].every(([mcol, mrow]) => {
                        const index = mcol * 26 + mrow;
                        return [BLOCK.None, BLOCK.Forest].indexOf(mapData[index] as BLOCK) !== -1;
                    });
                    bigGrid.setWalkableAt(col, row, walkable);
                }
            }

            // console.log(bigGrid);

            let startNode, endNode;

            this.node.on(
                Node.EventType.MOUSE_DOWN,
                (e: EventMouse) => {
                    const { target } = e;

                    if (target) {
                        const nd: Node = target;
                        const bt = nd.getComponent(Block);
                        if (bt) {
                            if (!startNode) {
                                this.clearPath();
                                startNode = this.#align(min_block_map.get(nd));
                                nd.getComponent(Sprite).grayscale = true;
                            } else if (!endNode) {
                                endNode = this.#align(min_block_map.get(nd));
                                nd.getComponent(Sprite).grayscale = true;
                                console.log(startNode, endNode);
                                var finder = new Astar.AStarFinder();
                                var path = finder.findPath(startNode[1], startNode[0], endNode[1], endNode[0], bigGrid.clone());

                                startNode = endNode = null;
                                if (!path || path.length === 0) {
                                    console.log("找不到路");
                                    this.clearPath();
                                    return;
                                }
                                this.#drawPath(path);
                            }
                        }
                    }
                },
                false
            );
        });
    }

    #align([minCol, minRow]: [number, number]) {
        console.log('small', minCol, minRow);
        return [Math.floor(minCol / 2), Math.floor(minRow / 2)];
    }

    private createBlockAt(type: BLOCK, pos: Vec2, { width, height }: Size, id: number) {
        const block = instantiate(this.blockPrefab);
        const sf = this.game.getBlockTexture(type === BLOCK.None ? BLOCK.River : type);
        block.name = BlockTexture[type === BLOCK.None ? BLOCK.River : type].pic + "_" + id;
        block.getComponent(Sprite).spriteFrame = sf;
        block.getComponent(UITransform).setContentSize(width, height);
        block.setPosition(pos.subtract2f(104, 104).add2f(4, 4).toVec3());
        block.setParent(find("Canvas/blocks"));
        block.on(NodeEventType.MOUSE_DOWN, () => {
            console.log('BLOCK:',id);
        })

        return block;
    }

    #drawPath(path: [number, number][]) {
        console.log('结果',path);
        path?.forEach(([col, row]) => {
            const startPosX = 2 * row;
            const startPosY = 2 * col;

            const tr = [startPosX, startPosY];
            const tl = [startPosX + 1, startPosY];
            const dr = [startPosX, startPosY + 1];
            const dl = [startPosX + 1, startPosY + 1];

            [tr, tl, dr, dl].forEach(([col, row]) => {
                this.#nodes.get(`col=${col},row=${row}`).grayscale = true;
            })
        })
    }

    clearPath() {
        this.#nodes.forEach((sp) => (sp.grayscale = false));
    }
}

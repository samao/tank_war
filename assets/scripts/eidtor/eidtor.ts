import { _decorator, Color, Component, instantiate, Node, Prefab, Size, Sprite, UITransform, Vec2, Vec3 } from "cc";
import { Base } from "../common/Base";
import { Block } from "../fight/Block";
import { BLOCK, BlockTexture } from "../mgrs/GameMgr";
const { ccclass, property } = _decorator;

@ccclass("eidtor")
export class eidtor extends Base {
    @property(Prefab)
    private blockPrefab: Prefab;

    protected onEnable(): void {
        const mapData = this.game.getMapDataByLevel(10);
        const matrix: string[][] = [];
        console.log("初始化数据");

        // for (let row = 0; row < mapData.length; row+= 2) {
        //     const min_row = row;
        //     const max_row = row+1;
        //     const min_col = Math.floor(row / 26)
        //     const max_col = min_col + 1;
        //     const block = matrix[min_row] ?? [min_row, min_col, max_row, max_col];
        //     matrix[min_row] = block;
        // }

        // let col = 0;

        for (let col = 0; col < 26; col += 2) {
            for (let row = 0; row < 26; row += 2) {
                // console.log(row, col, '=', mapData[row], mapData[row+1], mapData[col], mapData[col+1])
                const min_row = row + col * 26;
                const min_col = col;
                matrix.push([mapData[min_row], mapData[min_row + 1], mapData[min_col], mapData[min_col + 1]]);
            }
        }

        this.game.loadAllBlockTexture(() => {
            const size = 10;
            for (let i = 0; i < matrix.length; i++) {
                const node = new Node();
                node.name = "NODE_" + i;
                matrix[i].forEach((type, i) => {
                    if (type !== BLOCK.None) {
                        const sf = this.game.getBlockTexture(type as BLOCK);
                        const block = new Node();
                        block.addComponent(Sprite).spriteFrame = sf;
                        block.setPosition(size * (i % 2), size * Math.floor(i / 2));
                        block.setParent(node);
                        block.getComponent(UITransform).setContentSize(8, 8);
                    }
                });
                // console.log(new Vec3((i % 13) * 16, 16 * Math.floor(i / 13)))
                node.setPosition(new Vec3((i % 13) * 16, 16 * Math.floor(i / 13)));
                node.setParent(this.node);
            }
        });
    }

    private createBlockAt(type: BLOCK, pos: Vec2, { width, height }: Size, id: number) {
        const block = instantiate(this.blockPrefab);
        const sf = this.game.getBlockTexture(type);
        // console.log(type, BlockTexture[type].pic);
        block.name = BlockTexture[type].pic + "_" + id;
        block.getComponent(Sprite).spriteFrame = sf;
        block.getComponent(UITransform).setContentSize(width, height);
        block.setPosition(pos.toVec3());
        // if (type === BLOCK.Forest) {
        // block.setParent(this.node);
        // } else {
        block.setParent(this.node);
        // }

        block.getComponent(Block).setBlockType(type);

        return block;
    }
}

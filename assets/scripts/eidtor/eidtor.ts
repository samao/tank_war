import { _decorator, Color, Component, find, Graphics, instantiate, Node, Prefab, Size, Sprite, UITransform, Vec2, Vec3 } from "cc";
import { Base } from "../common/Base";
import { Block } from "../fight/Block";
import { BLOCK, BlockTexture } from "../mgrs/GameMgr";
const { ccclass, property } = _decorator;

@ccclass("eidtor")
export class eidtor extends Base {
    @property(Prefab)
    private blockPrefab: Prefab;

    protected onEnable(): void {
        const mapData = this.game.getMapDataByLevel(2);
        const matrix: string[][] = [];
        console.log("初始化数据");

        for (let col = 0; col < 26; col += 2) {
            for (let row = 0; row < 26; row += 2) {
                // console.log(row, col, '=', mapData[row], mapData[row+1], mapData[col], mapData[col+1])
                const min_row = row + col * 26;
                const min_col = col;
                matrix.push([mapData[min_row], mapData[min_row + 1], mapData[min_col], mapData[min_col + 1]]);
            }
        }

        this.game.loadAllBlockTexture(() => {
            for (let i = 0; i< mapData.length; i++) {
                const row = i % 26;
                const col = Math.floor(i / 26)
                this.createBlockAt(mapData[i] as BLOCK, new Vec2(row * 8, col * 8), new Size(8, 8), i)
            }
        });

        // 绘制寻路线
        const gnode = this.node.getChildByName('line');
        const g = gnode.getComponent(Graphics) ?? gnode.addComponent(Graphics);
        g.lineWidth = 10;
        g.fillColor.fromHEX('#ff0000');
        g.moveTo(-40, 0);
        g.lineTo(0, -80);
        g.lineTo(40, 0);
        g.lineTo(0, 80);
        g.close();
        g.stroke();
        // g.fill();
    }

    private createBlockAt(type: BLOCK, pos: Vec2, { width, height }: Size, id: number) {
        // if (type === BLOCK.None) {}
        const block = instantiate(this.blockPrefab);
        const sf = this.game.getBlockTexture(type === BLOCK.None ? BLOCK.River : type);
        // console.log(type, BlockTexture[type].pic);
        block.name = BlockTexture[type === BLOCK.None ? BLOCK.River : type].pic + "_" + id;
        block.getComponent(Sprite).spriteFrame = sf;
        block.getComponent(UITransform).setContentSize(width, height);
        block.setPosition(pos.subtract2f(104, 104).add2f(4, 4).toVec3());
        // if (type === BLOCK.Forest) {
        // block.setParent(this.node);
        // } else {
        block.setParent(find('Canvas/blocks'));
        // }
        if (type !== BLOCK.None) {
            // block.getComponent(Block).setBlockType(type);
        }
        return block;
    }
}

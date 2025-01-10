import { _decorator, Collider2D, Contact2DType, instantiate, math, Node, Prefab, Rect, Sprite, sys } from "cc";
import { BONUS, GameMgr, PlayerType } from "../mgrs/GameMgr";
import { Base } from "../common/Base";
import { Player } from "./Player";
import { Data } from "../common/Data";
const { ccclass, property } = _decorator;

const rect = new Rect(30, 30, 140, 140);

@ccclass("Bonus")
export class Bonus extends Base {
    @property({ min: 0, max: 10 })
    private rate: number = 8;
    @property(Prefab)
    private bonusPrefab: Prefab;

    private boundsMap: Map<Node, number> = new Map();

    start() {
        console.log("Bonus 启动", this.node.name);
    }

    protected onDestroy(): void {
        console.log("Bonus 销毁");
    }

    createBonus() {
        if (math.randomRange(0, 10) >= 10 - this.rate) {
            //20% 生成奖励
            console.log("生成一个奖励道具");
            const x = math.randomRange(rect.xMin, rect.xMax);
            const y = math.randomRange(rect.yMin, rect.yMax);
            const type = math.randomRangeInt(BONUS.BASE_IRON, BONUS.LIFE + 1);

            const bonusNode = instantiate(this.bonusPrefab);
            bonusNode.getComponent(Sprite).spriteFrame = this.game.getBonusTexture(type);
            bonusNode.getComponent(Data).data = type;
            bonusNode.setPosition(x, y)
            this.bindCollider(bonusNode.getComponent(Collider2D));
            this.scheduleOnce(this.appendChild.bind(this, bonusNode))
            this.boundsMap.set(bonusNode, sys.now());
        }
    }

    private appendChild = (node: Node) => {
        node.setParent(this.node);
    }

    private removeChild = (node: Node) => {
        this.boundsMap.delete(node);
        node.removeFromParent();
    }

    private bindCollider(cld: Collider2D) {
        const removeBonus = (self: Collider2D, oth: Collider2D) => {
            const player = oth.node.getComponent(Player).playerType
            // console.log('被', player, '吃掉了', self.node.getComponent(Data<BONUS>).data);
            const bonusType = self.node.getComponent(Data<BONUS>).data
            this.handleBonusEvent(player, bonusType)
            cld.off(Contact2DType.BEGIN_CONTACT, removeBonus);
            this.scheduleOnce(this.removeChild.bind(this, self.node))
        }
        cld.on(Contact2DType.BEGIN_CONTACT, removeBonus)
    }

    handleBonusEvent(player: PlayerType, bonusType: BONUS) {
        // bonusType = BONUS.POWERFUL;
        console.log('处理事件', player, bonusType);
        switch(bonusType) {
            case BONUS.LIFE:
                this.game.directlyAddLife(player, 1);
                break;
            case BONUS.BOMB_ALL:
                this.game.node.emit(GameMgr.EventType.BOMB_ALL_ENEMY);
                break;
            case BONUS.FROZEN_ALL:
                this.game.node.emit(GameMgr.EventType.FROZEN_ALL_ENEMY);
                break;
            case BONUS.BASE_IRON:
                // console.log('基地变铁')
                this.game.node.emit(GameMgr.EventType.IRON_BASE_WALL)
                break;
            case BONUS.POWERFUL:
                this.game.node.emit(GameMgr.EventType.PLAYER_POWERFUL, player);
                break;
        }
    }

    protected update(dt: number): void {
        for (let [node, createTime] of this.boundsMap) {
            if (sys.now() - createTime > 8 * 1000) {
                this.boundsMap.delete(node)
                node.removeFromParent();
            }
        }
    }

    removeAll() {
        this.node.removeAllChildren();
        this.boundsMap.clear();
    }
}

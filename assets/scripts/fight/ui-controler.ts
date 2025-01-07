import { _decorator, Component, find, Label, Node, Sprite, SpriteFrame, UITransform } from "cc";
import { Base } from "../common/Base";
import { GameMgr, GameMode, PlayerType } from "../mgrs/GameMgr";
import { ENEMY_TOTAL_PER_LEVEL, PLAYER_LIFE_TOTAL } from "../game.conf";
const { ccclass, property } = _decorator;

@ccclass("tank_tag")
class TankTag {
    @property({ type: SpriteFrame, displayName: "敌机" })
    public enemy: SpriteFrame = null;

    @property({ type: SpriteFrame, displayName: "玩家" })
    public player: SpriteFrame = null;
}

@ccclass("p_info")
class PlayerInfo {
    @property({ type: Label, displayName: "玩家分数" })
    public score: Label;

    @property({ type: Node, displayName: "生命数" })
    public lifeTag: Node;
}

@ccclass("ui_controler")
export class ui_controler extends Base {
    @property({ type: Label, displayName: "当前管卡" })
    private stageLabel: Label;

    @property({ type: Node, displayName: "剩余敌机" })
    private enumTags: Node;

    @property(TankTag)
    private tankSpriteFrame: TankTag = new TankTag();

    @property({ type: PlayerInfo, displayName: "玩家一" })
    private playerinfo_1: PlayerInfo = null;

    @property({ type: PlayerInfo, displayName: "玩家二" })
    private playerinfo_2: PlayerInfo = null;

    private playerScore = 0;
    private player2Score = 0;
    private enemyCount = 30;
    private playerlife = 8;
    private player2life = 8;

    protected onEnable(): void {
        this.resetAll();
        this.game.node.on(GameMgr.EventType.GAME_LEVEL_CHANGE, this.changeLevel);
        this.game.node.on(GameMgr.EventType.ENEMY_DISCOUNT, this.dicountEnemy);
        this.game.node.on(GameMgr.EventType.PLAYER_SCORE_ADD, this.addScore);
        this.game.node.on(GameMgr.EventType.PLAYER_LIFE_LOST, this.discountPlayerLife);
        this.game.node.on(GameMgr.EventType.RESET_ALL, this.resetAll)
        this.game.node.on(GameMgr.EventType.PLAYER_LIFE_ADD, this.createPlayerlife)
    }

    protected onDisable(): void {
        this.game.node.off(GameMgr.EventType.GAME_LEVEL_CHANGE, this.changeLevel);
        this.game.node.off(GameMgr.EventType.ENEMY_DISCOUNT, this.dicountEnemy);
        this.game.node.off(GameMgr.EventType.PLAYER_SCORE_ADD, this.addScore);
        this.game.node.off(GameMgr.EventType.PLAYER_LIFE_LOST, this.discountPlayerLife);
        this.game.node.off(GameMgr.EventType.RESET_ALL, this.resetAll)
        this.game.node.off(GameMgr.EventType.PLAYER_LIFE_ADD, this.createPlayerlife)
    }

    private resetAll = () => {
        this.playerScore = this.player2Score = 0;
        this.enemyCount = ENEMY_TOTAL_PER_LEVEL;
        this.player2life = this.playerlife = PLAYER_LIFE_TOTAL;
        this.playerinfo_1.lifeTag.removeAllChildren();
        this.playerinfo_2.lifeTag.removeAllChildren();
        this.enumTags.removeAllChildren();
        this.onUpdateGameInfo();
    }

    private discountPlayerLife = (id = 0) => {
        if (id === 0) {
            this.playerlife--;
            this.playerinfo_1.lifeTag.children.pop()
            // last.destroy();
        } else {
            this.player2life--;
            this.playerinfo_2.lifeTag.children.pop();
            // last.destroy();
        }
    }

    private addScore = ({ id, score: pt }: { id: number, score: number }) => {
        if (id === 0) {
            this.playerScore += pt;
            this.playerinfo_1.score.string = "积分:" + this.playerScore;
        } else {
            this.player2Score += pt;
            this.playerinfo_2.score.string = "积分:" + this.player2Score;
        }
    };

    private changeLevel = (lv: number) => {
        this.stageLabel.string = "关:" + lv;
        this.enemyCount = ENEMY_TOTAL_PER_LEVEL;
        this.createEnemyTags();
    };

    private dicountEnemy = () => {
        this.enemyCount--;
        this.enumTags.children.pop();
    };

    private createPlayerlife = (id: PlayerType) => {
        const node = new Node();
        node.addComponent(Sprite).spriteFrame = this.tankSpriteFrame.player;
        node.getComponent(UITransform).setContentSize(7, 7);
        node.setParent(id === PlayerType.PLAYER_1 ? this.playerinfo_1.lifeTag : this.playerinfo_2.lifeTag);
    }

    private createEnemyTags() {
        this.enumTags.removeAllChildren();
        for (let i = 0; i < this.enemyCount; i++) {
            const node = new Node("en_id_" + i);
            node.addComponent(Sprite).spriteFrame = this.tankSpriteFrame.enemy;
            node.getComponent(UITransform).setContentSize(7, 7);
            node.setParent(this.enumTags);
        }
    }

    private onUpdateGameInfo = () => {
       this.createEnemyTags();

        this.playerinfo_1.score.string = "积分:" + this.playerScore;

        for (let i = 0; i < this.playerlife; i++) {
            const node = new Node("player1_" + i);
            node.addComponent(Sprite).spriteFrame = this.tankSpriteFrame.player;
            node.getComponent(UITransform).setContentSize(7, 7);
            node.setParent(this.playerinfo_1.lifeTag);
        }

        find('Canvas/ui/player-info/p2info').active = this.game.getMode() === GameMode.DOUBLE;

        this.playerinfo_2.score.string = "积分:" + this.player2Score;

        for (let i = 0; i < this.player2life; i++) {
            const node = new Node("player2_" + i);
            node.addComponent(Sprite).spriteFrame = this.tankSpriteFrame.player;
            node.getComponent(UITransform).setContentSize(7, 7);
            node.setParent(this.playerinfo_2.lifeTag);
        }
    };
}

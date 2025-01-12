import { _decorator, Component, Node, find, director, ToggleContainer, Toggle, RichText } from "cc";
import { Base } from "../common/Base";
import { t } from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Base {
    @property(Node)
    private tips: Node;

    protected start(): void {
        this.tips.getComponentInChildren(RichText).string = t('menu.help')
    }

    gotoGame() {
        const mode = this.getComponentInChildren(ToggleContainer).toggleItems.findIndex((item) => item.isChecked);
        this.game.setMode(mode);
        director.loadScene("fight");
    }

    showTips() {
        this.tips.active = true;
    }

    hideTips() {
        this.tips.active = false;
    }
}

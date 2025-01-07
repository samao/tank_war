import { _decorator, Component, Node, find, director, ToggleContainer, Toggle } from "cc";
import { Base } from "../common/Base";
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Base {
    @property(Node)
    private tips: Node;

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

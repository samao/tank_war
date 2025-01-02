import { _decorator, Component, Node, find, director, ToggleContainer, Toggle } from "cc";
import { Base } from "../common/Base";
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Base {
    gotoGame() {
        const mode = this.getComponentInChildren(ToggleContainer).toggleItems.findIndex((item) => item.isChecked);
        this.game.setMode(mode);
        director.loadScene("fight");
    }
}

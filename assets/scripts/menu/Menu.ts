import { _decorator, Component, Node, find, director, ToggleContainer } from "cc";
import { Base } from "../common/Base";
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Base {
    #ready = false;

    protected start(): void {
        this.#ready = this.game.ready;
        if (!this.#ready) {
            this.game.node.once("ready", () => {
                this.#ready = this.game.ready;
            });
        }
    }

    gotoGame() {
        if (this.#ready) {
            const mode = this.getComponentInChildren(ToggleContainer).toggleItems.findIndex((item) => item.isChecked);
            this.game.setMode(mode);
            director.loadScene("fight");
        }
    }
}

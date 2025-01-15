import { _decorator, Component, Node, find, director, ToggleContainer, Toggle, RichText, tween, Vec3 } from "cc";
import { Base } from "../common/Base";
import { t } from 'db://i18n/LanguageData';
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Base {
    @property(Node)
    private tips: Node;

    protected start(): void {
        this.tips.getComponentInChildren(RichText).string = t('menu.help');
    }

    gotoGame() {
        const mode = this.getComponentInChildren(ToggleContainer).toggleItems.findIndex((item) => item.isChecked);
        this.game.setMode(mode);
        director.loadScene("fight");
    }

    showTips() {
        this.tips.active = true;
        tween(this.tips).to(0.2, {
            scale: new Vec3(1, 1, 1),
            eulerAngles: new Vec3(0, 0, 0),
        }).start();
    }

    hideTips() {
        tween(this.tips).to(0.2, {
            scale: new Vec3(0.5, 0.5, 0.5),
            eulerAngles: new Vec3(0, 0, 180)
        }).call(() => {
            this.tips.active = false;
        }).start();
    }
}

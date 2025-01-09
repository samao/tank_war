import { Node } from "cc";

export class Toast {

    private static instance: Toast;

    private node: Node;

    constructor() {
        if (Toast.instance) {
            throw new Error('单例不允许多次初始化');
            return;
        }
    }

    static getInstance() {
        if (!Toast.instance) {
            Toast.instance = new Toast();
        }
        return Toast.instance
    }

    setupOnNode = (node: Node) => {
        this.node = node;
    }

    toast(...arg: any[]) {
        console.log.apply(null, arg);
    }
}

export const setup = Toast.getInstance().setupOnNode;

export const toast = Toast.getInstance().toast


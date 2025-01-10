import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Data')
export class Data<T = any> extends Component {
    private _data: T

    set data(value: T) {
        this._data = value;
    }

    get data() {
        return this._data;
    }
}



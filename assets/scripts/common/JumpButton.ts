import { _decorator, Component, Node, Button, Label } from 'cc';
import { SceneManager } from './SceneManager';
const { ccclass, property } = _decorator;

@ccclass('JumpButton')
export class JumpButton extends Component {
    @property
    targetScene: string = '';

    @property
    buttonLabel: string = '';

    @property
    isBackButton: boolean = false;


    start() {
        if (this.buttonLabel) {
            const label = this.node.getComponentInChildren(Label);
            if (label) label.string = this.buttonLabel;
        }
        this.node.on(Button.EventType.CLICK, this.onClick, this);

    }

    onClick() {
        if (this.isBackButton) {
            SceneManager.goBack();
        } else {
            SceneManager.goTo(this.targetScene);
        }
    }
}



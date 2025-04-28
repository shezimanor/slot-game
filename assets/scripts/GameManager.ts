import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Button)
  public spinButton: Button = null;

  onClickSpin() {
    this.spinButton.interactable = false;
    this.scheduleOnce(() => {
      this.spinButton.interactable = true;
    }, 1);
  }
}

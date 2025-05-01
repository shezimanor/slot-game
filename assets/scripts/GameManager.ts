import { _decorator, Button, Component, Node } from 'cc';
import { ResourceManager } from './ResourceManager';
import { EventManager } from './EventManager';
import { ResultManager } from './ResultManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Button)
  public spinButton: Button = null;

  protected onLoad(): void {
    ResourceManager.init();
    EventManager.eventTarget.on('resource-loaded', this.onSourcesLoaded, this);
    EventManager.eventTarget.on('activate-spin', this.activateSpinButton, this);
  }

  protected onDestroy(): void {
    EventManager.eventTarget.off('resource-loaded', this.onSourcesLoaded, this);
    EventManager.eventTarget.off(
      'activate-spin',
      this.activateSpinButton,
      this
    );
  }

  onSourcesLoaded() {
    this.spinButton.interactable = true;
    EventManager.eventTarget.emit('reels-init');
  }

  onClickSpin() {
    this.spinButton.interactable = false;
    // 先取得結果
    const spinResult = ResultManager.getRandomResult();
    EventManager.eventTarget.emit('start-spin', spinResult.matrix);
    console.log('抽獎', spinResult);
  }

  activateSpinButton() {
    this.spinButton.interactable = true;
  }
}

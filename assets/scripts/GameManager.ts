import { _decorator, Button, Component, Node } from 'cc';
import { ResourceManager } from './ResourceManager';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Button)
  public spinButton: Button = null;

  protected onLoad(): void {
    ResourceManager.init();
    EventManager.eventTarget.on('resource-loaded', this.onSourcesLoaded, this);
  }

  protected onDestroy(): void {
    EventManager.eventTarget.off('resource-loaded', this.onSourcesLoaded, this);
  }

  onSourcesLoaded() {
    this.spinButton.interactable = true;
    EventManager.eventTarget.emit('reels-init');
  }

  onClickSpin() {
    this.spinButton.interactable = false;
    this.scheduleOnce(() => {
      this.spinButton.interactable = true;
    }, 1);
  }
}

import { _decorator, Component, Node, Prefab } from 'cc';
import { SlotPool } from './SlotPool';
import { EventManager } from './EventManager';
import { ResourceManager } from './ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('ReelManager')
export class ReelManager extends Component {
  private static _instance: ReelManager = null;
  public static get instance(): ReelManager {
    return ReelManager._instance;
  }

  public reelNodes: Node[] = [];

  protected onLoad(): void {
    if (!ReelManager._instance) {
      ReelManager._instance = this;
    } else {
      this.destroy();
    }
    EventManager.eventTarget.on('reels-init', this.initReels, this);
  }

  protected start(): void {
    this.reelNodes = this.node.children;
    console.log('start');
  }

  protected onDestroy(): void {
    if (ReelManager._instance === this) {
      ReelManager._instance = null;
    }
    EventManager.eventTarget.off('reels-init', this.initReels, this);
  }

  initReels() {
    console.log('init reels');
    SlotPool.instance.init(
      ResourceManager.getAsset<Prefab>('prefabs', 'SlotPrefab')
    );
  }
}

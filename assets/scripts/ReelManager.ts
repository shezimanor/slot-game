import { _decorator, CCFloat, Component, Node, Prefab } from 'cc';
import { SlotPool } from './SlotPool';
import { EventManager } from './EventManager';
import { ResourceManager } from './ResourceManager';
import { Reel } from './Reel';
const { ccclass, property } = _decorator;

@ccclass('ReelManager')
export class ReelManager extends Component {
  private static _instance: ReelManager = null;
  public static get instance(): ReelManager {
    return ReelManager._instance;
  }

  // 每條reel間的遞延時間（秒）
  @property(CCFloat)
  public reelStartDelay: number = 0.2;

  @property([Reel])
  public reelInstances: Reel[] = [];

  protected onLoad(): void {
    if (!ReelManager._instance) {
      ReelManager._instance = this;
    } else {
      this.destroy();
    }
    EventManager.eventTarget.on('reels-init', this.initReels, this);
    EventManager.eventTarget.on('start-spin', this.startSpin, this);
  }

  protected onDestroy(): void {
    if (ReelManager._instance === this) {
      ReelManager._instance = null;
    }
    EventManager.eventTarget.off('reels-init', this.initReels, this);
    EventManager.eventTarget.off('start-spin', this.startSpin, this);
  }

  initReels() {
    console.log('init reels');
    // 初始化 SlotPool
    SlotPool.instance.init(
      ResourceManager.getAsset<Prefab>('prefabs', 'SlotPrefab')
    );
    // 初始化每個 Reel
    for (const reelInstance of this.reelInstances) {
      if (reelInstance) reelInstance.init();
    }
  }

  startSpin() {
    for (let i = 0; i < this.reelInstances.length; i++) {
      // 用延遲的方式讓每個Reel啟動
      this.scheduleOnce(() => {
        this.reelInstances[i].startSpin();
      }, i * this.reelStartDelay);
    }
  }
}

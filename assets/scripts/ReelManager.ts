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
  public reelStartDelay: number = 0.1;

  @property([Reel])
  public reelInstances: Reel[] = [];

  // 整個 ReelManager 的輪轉狀態標記
  private _isSpinning: boolean = false;
  // 用來紀錄已經停止的Reel數量
  private _stoppedReels: number = 0;

  protected onLoad(): void {
    if (!ReelManager._instance) {
      ReelManager._instance = this;
    } else {
      this.destroy();
    }
    EventManager.eventTarget.on('reels-init', this.initReels, this);
    EventManager.eventTarget.on('start-spin', this.startSpin, this);
    EventManager.eventTarget.on('reel-stopped', this.onReelStopped, this);
  }

  protected onDestroy(): void {
    if (ReelManager._instance === this) {
      ReelManager._instance = null;
    }
    EventManager.eventTarget.off('reels-init', this.initReels, this);
    EventManager.eventTarget.off('start-spin', this.startSpin, this);
    EventManager.eventTarget.off('reel-stopped', this.onReelStopped, this);
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
    if (this._isSpinning) return;
    this._isSpinning = true;
    this._stoppedReels = 0;
    for (let i = 0; i < this.reelInstances.length; i++) {
      // 用延遲的方式讓每個Reel啟動
      this.scheduleOnce(() => {
        this.reelInstances[i].startSpin();
      }, i * this.reelStartDelay);
    }
  }

  onReelStopped() {
    this._stoppedReels++;
    if (this._stoppedReels >= this.reelInstances.length) {
      this._stoppedReels = 0;
      this.stopSpin();
    }
  }

  stopSpin() {
    this._isSpinning = false;
    // 觸發事件，表示所有的 Reel 都已經停止了，可以重新啟動 Spin 按鈕
    EventManager.eventTarget.emit('activate-spin');
  }
}

import { _decorator, AudioClip, Component, Prefab } from 'cc';
import { SlotPool } from './SlotPool';
import { EventManager } from './EventManager';
import { ResourceManager } from './ResourceManager';
import { Reel } from './Reel';
import { SpinResult } from './types/index.d';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ReelManager')
export class ReelManager extends Component {
  private static _instance: ReelManager = null;
  public static get instance(): ReelManager {
    return ReelManager._instance;
  }

  @property([Reel])
  public reelInstances: Reel[] = [];

  // 每條reel間的遞延時間（秒）
  public reelStartDelay: number = 0.35;
  // 整個 ReelManager 的輪轉狀態標記
  public isSpinning: boolean = false;
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
    for (let i = 0; i < this.reelInstances.length; i++) {
      this.reelInstances[i].init(i);
    }
  }

  startSpin(spinResult: SpinResult) {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this._stoppedReels = 0;
    // 播放 spin 音效
    AudioManager.instance.stopMusic();
    AudioManager.instance.playMusic(
      ResourceManager.getAsset<AudioClip>('audios', 'reel-spin'),
      true
    );
    for (let i = 0; i < this.reelInstances.length; i++) {
      // 用延遲的方式讓每個Reel啟動
      this.scheduleOnce(() => {
        // 將矩陣內的陣列傳給每個 Reel，使其渲染正確的結果
        this.reelInstances[i].startSpin(spinResult.matrix[i]);
      }, i * this.reelStartDelay);
    }
  }

  onReelStopped() {
    // 播放停止音效
    AudioManager.instance.playSound(
      ResourceManager.getAsset<AudioClip>('audios', 'reel-stop')
    );
    this._stoppedReels++;
    // 所有的 Reel 都停止了
    if (this._stoppedReels >= this.reelInstances.length) {
      this._stoppedReels = 0;
      this.stopSpin();
    }
  }

  stopSpin() {
    this.isSpinning = false;
    // 停止轉動音效
    AudioManager.instance.stopMusic();
    // 觸發事件，表示所有的 Reel 都已經停止了
    // 重新啟動面板上的按鈕
    EventManager.eventTarget.emit('activate-buttons');
    // 顯示獎金
    EventManager.eventTarget.emit('show-total-win');
  }
}

import { _decorator, CCInteger, Component, Prefab } from 'cc';
import { SlotPool } from './SlotPool';
const { ccclass, property } = _decorator;

@ccclass('Reel')
export class Reel extends Component {
  // 一條Reel上總共有多少格符號 (可見3格 + 上下緩衝格)
  @property(CCInteger)
  public slotCount: number = 8;
  @property(CCInteger)
  public slotHeight: number = 135;

  // 初始滾動速度(px/sec)
  private spinSpeed: number = 1500;
  // 減速後滾動速度(px/sec)
  private stopSpeed: number = 600;
  // 輪轉的狀態標記(正常速度的動畫)
  private isSpinning: boolean = false;
  // 準備要停止的狀態標記(減速中的動畫)
  private isStopping: boolean = false;

  protected onLoad(): void {
    this.init();
  }

  update(deltaTime: number) {
    if (!this.isSpinning) return;
    const speed = this.isStopping ? this.stopSpeed : this.spinSpeed;
  }

  init() {}
}

import { _decorator, CCInteger, Component, Prefab } from 'cc';
import { SlotPool } from './SlotPool';
import { SlotType } from './types';
import { getRandomSlotType } from './utils/uitls';
import { Slot } from './Slot';
const { ccclass, property } = _decorator;

@ccclass('Reel')
export class Reel extends Component {
  // 一條Reel上總共有多少格符號 (可見3格 + 上下緩衝格)
  @property(CCInteger)
  public slotCount: number = 8;
  // 初始中心格的索引(從0開始)
  @property(CCInteger)
  public positionCenterIndex: number = 6;
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

  update(deltaTime: number) {
    if (!this.isSpinning) return;
    const speed = this.isStopping ? this.stopSpeed : this.spinSpeed;
  }

  init() {
    for (let i = 0; i < this.slotCount; i++) {
      const slot = SlotPool.instance.getSlot();
      const slotInstance = slot.getComponent(Slot);
      slotInstance.slotType = getRandomSlotType();
      slot.setPosition(0, (i - this.positionCenterIndex) * this.slotHeight, 0);
      slot.setParent(this.node);
    }
  }
}

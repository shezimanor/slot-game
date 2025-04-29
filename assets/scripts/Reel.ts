import {
  _decorator,
  CCInteger,
  Component,
  Prefab,
  Node,
  Vec3,
  tween,
  CCFloat
} from 'cc';
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
  @property(CCFloat)
  public tweenDuration: number = 0.15;

  public slots: Node[] = [];
  // 初始滾動速度(px/sec)
  private _spinSpeed: number = 1200;
  // 減速後滾動速度(px/sec)
  private _stopSpeed: number = 600;
  // 輪轉的狀態標記(正常速度的動畫)
  private _isSpinning: boolean = false;
  // 準備要停止的狀態標記(減速中的動畫)
  private _isStopping: boolean = false;
  private _startPosition: Vec3 = new Vec3(0, 0, 0);
  private _tweenPosition: Vec3 = new Vec3(0, 0, 0);

  protected start(): void {
    this._startPosition.set(this.node.position);
    this._tweenPosition.set(
      this.node.position.x,
      this.node.position.y + 50,
      this.node.position.z
    );
  }

  update(deltaTime: number) {
    if (!this._isSpinning) return;
    const speed = this._isStopping ? this._stopSpeed : this._spinSpeed;

    for (let i = this.slotCount - 1; i >= 0; i--) {
      const slot = this.slots[i];
      const newPositionY = slot.position.y - speed * deltaTime;
      slot.setPosition(slot.position.x, newPositionY, 0);
      //
      if (newPositionY <= -this.slotHeight * 2) {
        const nextIndex = (i + 1) % this.slotCount;
        slot.setPosition(
          0,
          this.slots[nextIndex].position.y + this.slotHeight,
          0
        );
      }
    }
  }

  init() {
    for (let i = 0; i < this.slotCount; i++) {
      const slot = SlotPool.instance.getSlot();
      const slotInstance = slot.getComponent(Slot);
      slotInstance.slotType = getRandomSlotType();
      slot.setPosition(0, (i - this.positionCenterIndex) * -this.slotHeight, 0);
      slot.setParent(this.node);
      this.slots.push(slot);
    }
  }

  startSpin() {
    // this._isSpinning = true;
    tween(this.node)
      .to(this.tweenDuration, { position: this._tweenPosition }) // 往上跳
      .to(this.tweenDuration, { position: this._startPosition }) // 回到原點
      .call(() => {
        // 完成之後，計時準備停下的狀態
        this.scheduleOnce(() => {
          this._isStopping = true;
        }, 2);
      })
      .start();
    // 在前面的動畫結束前一點點就開始轉動動畫，才不會有卡頓感
    this.scheduleOnce(() => {
      this._isSpinning = true;
    }, this.tweenDuration * 1.95);
  }
}

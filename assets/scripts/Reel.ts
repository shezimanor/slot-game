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
import { getRandomResult, getRandomSlotType } from './utils/uitls';
import { Slot } from './Slot';
import { SlotType } from './types/index.d';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('Reel')
export class Reel extends Component {
  @property(CCInteger)
  public slotHeight: number = 135;
  @property(CCFloat)
  public tweenSpinDuration: number = 0.15;
  @property(CCFloat)
  public tweenAlignDuration: number = 0.3;

  public slots: Node[] = [];
  public slotInstances: Slot[] = [];
  public startPositions: Vec3[] = [];
  public targetResult: SlotType[] = [];
  // 一條Reel上總共有多少格符號 (可見3格 + 上下緩衝格)
  public slotCount: number = 7;
  // 初始中心格的索引
  public _positionCenterIndex: number = 4;
  // 初始滾動速度(px/sec)
  private _spinSpeed: number = 1350;
  // 減速後滾動速度(px/sec)
  private _stopSpeed: number = 607.5;
  // 輪轉的狀態標記(正常速度的動畫)
  private _isSpinning: boolean = false;
  // 準備要停止的狀態標記(減速中的動畫)
  private _isStopping: boolean = false;
  private _startPosition: Vec3 = new Vec3(0, 0, 0);
  private _tweenPosition: Vec3 = new Vec3(0, 0, 0);

  protected start(): void {
    // -3 是因為中心格下方有兩格且因為是索引要再減一
    this._positionCenterIndex = this.slotCount - 3; // 現在是 4
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
      // 如果超過了下方兩個 slot 高度的位置，則要把它移到下一個索引的上方距離一個 slot 高度的位置
      if (newPositionY <= -this.slotHeight * 3) {
        const nextIndex = (i + 1) % this.slotCount;
        slot.setPosition(
          0,
          this.slots[nextIndex].position.y + this.slotHeight,
          0
        );
        // 將它丟上去，表示他當前不會被看見，適合變更圖片
        // 判斷當下是否已經到了填入目標結果的時機
        if (this._isStopping) {
          // 填入結果：將結果回填給索引為 3, 4(this._positionCenterIndex), 5 的 Slot 上
          // 因為這個邏輯為固定的，所以可用較為制式的寫法
          if (this.targetResult.length > 0) {
            // index 3, 4, 5 才處理
            if (Math.abs(i - this._positionCenterIndex) <= 1) {
              // 取出 this.targetResult 的第一個元素
              const targetType = this.targetResult.shift();
              if (targetType !== undefined)
                this.slotInstances[i].slotType = targetType;
            }
          }
          // 結果陣列沒有項目了，表示塞完了，可以準備對齊動畫並停下來
          // Reel 從上到下應該現在是這樣： 3 4 5 | 6 0 1 | 2, 對照初始狀態：0 1 2 | 3 4 5 | 6
          // 0 被丟到最上面時候，表示剛好要停下來，但為了避免有拉回的狀況，所有在 1 被丟上去的時候就要開始跑對齊動畫
          else {
            // 此時狀態：1 2 3 | 4 5 6 | 0
            if (i === 1) this.startAlign();
          }
        }
      }
    }
  }

  init() {
    //Reel 初始狀態從上到下應該現在是這樣： 0 1 2 | 3 4 5 | 6
    for (let i = 0; i < this.slotCount; i++) {
      const slot = SlotPool.instance.getSlot();
      const slotInstance = slot.getComponent(Slot);
      const startPosition = new Vec3(
        0,
        (i - this._positionCenterIndex) * -this.slotHeight,
        0
      );
      slotInstance.slotType = getRandomSlotType();
      slotInstance.testLabel.string = `${i}`;
      slot.setPosition(startPosition);
      slot.setParent(this.node);
      this.slots.push(slot);
      this.slotInstances.push(slotInstance);
      this.startPositions.push(startPosition);
    }
  }

  startSpin() {
    // 設定本次目標結果
    this.targetResult = getRandomResult();
    // this._isSpinning = true;
    tween(this.node)
      .to(this.tweenSpinDuration, { position: this._tweenPosition }) // 往上跳
      .to(this.tweenSpinDuration, { position: this._startPosition }) // 回到原點
      .call(() => {
        // 完成之後，計時準備停下的狀態
        this.scheduleOnce(() => {
          this._isStopping = true;
        }, 1.5);
      })
      .start();
    // 在前面的動畫結束前一點點就開始轉動動畫，才不會有卡頓感
    this.scheduleOnce(() => {
      this._isSpinning = true;
    }, this.tweenSpinDuration * 1.95);
  }

  startAlignTest() {
    this._isStopping = false;
    this._isSpinning = false;
    console.log('reel', this.node.name);
    console.log(
      "it's slots",
      this.slotInstances.map((s) => s.slotType)
    );
  }

  // 當轉動結束後，開始對齊
  // 這邊的對齊是指，讓結果格子對齊到正確的格子上
  startAlign() {
    this._isStopping = false;
    this._isSpinning = false;
    // index = 0 的 Slot 不要使用 tween
    for (let i = this.slotCount - 1; i > 0; i--) {
      const slot = this.slots[i];
      // 對齊動畫
      tween(slot)
        .to(this.tweenAlignDuration, { position: this.startPositions[i] })
        .call(() => {
          if (i === 1) {
            // 對齊完後，將 index = 0 的 Slot 直接歸位
            this.slots[0].setPosition(this.startPositions[0]);
            // 執行 stopSpin
            this.stopSpin();
          }
        })
        .start();
    }
  }

  stopSpin() {
    console.log('reel', this.node.name);
    console.log(
      "it's slots",
      this.slotInstances.map((s) => s.slotType)
    );
    // 觸發事件，表示這條 Reel 已經從 spin 停止了
    EventManager.eventTarget.emit('reel-stopped');
  }
}

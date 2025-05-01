import {
  _decorator,
  CCInteger,
  Component,
  Prefab,
  Node,
  Vec3,
  tween,
  CCFloat,
  CCBoolean
} from 'cc';
import { SlotPool } from './SlotPool';
import {
  getRandomResult,
  getRandomSlotType,
  getRandomSlotTypes
} from './utils/uitls';
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
  @property(CCFloat)
  public spinDuration: number = 1.4;
  @property(CCFloat)
  public randomCount: number = 7;
  @property(CCBoolean)
  public isDebug: boolean = false;

  public slots: Node[] = [];
  public slotInstances: Slot[] = [];
  public startPositions: Vec3[] = [];
  // 每次輪轉的結果
  public targetResult: SlotType[] = [
    SlotType.Cherry,
    SlotType.Cherry,
    SlotType.Cherry
  ];
  // 每次輪轉的隨機樣式
  public firstRandom: SlotType[] = [];
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
  private _tempTargetSet: Set<SlotType> = new Set();
  private _tempFirstRandomSet: Set<SlotType> = new Set();

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
          if (this._tempTargetSet.size < this.targetResult.length) {
            // index 3, 4, 5 才處理
            // 使用 set 來辨識是否已經更新過了，較為高效
            if (
              Math.abs(i - this._positionCenterIndex) <= 1 &&
              !this._tempTargetSet.has(i)
            ) {
              const targetType =
                this.targetResult[i - this._positionCenterIndex + 1];
              if (targetType !== undefined) {
                this.slotInstances[i].slotType = targetType;
                // console.log(this.node.name, i, targetType);
                this._tempTargetSet.add(i);
              }
            }
          }
          // set已經有 3 個項目，表示結果都塞完了，可以準備對齊動畫並停下來
          // Reel 從上到下應該現在是這樣： 3 4 5 | 6 0 1 | 2, 對照初始狀態：0 1 2 | 3 4 5 | 6
          // 0 被丟到最上面時候，表示剛好要停下來，但為了避免有拉回的狀況，所有在 1 被丟上去的時候就要開始跑對齊動畫
          else {
            // 此時狀態：1 2 3 | 4 5 6 | 0
            if (i === 1) this.startAlign();
          }
        } else {
          // 填入隨機樣式(每次輪轉只會個別 slot 只會更新一次，而且是第一次被丟上去就會更新)
          if (this._tempFirstRandomSet.size < this.firstRandom.length) {
            // index < this.firstRandom.length- 1 才處理
            // 使用 set 來辨識是否已經更新過了，較為高效
            if (
              i <= this.firstRandom.length - 1 &&
              !this._tempFirstRandomSet.has(i)
            ) {
              const randomType = this.firstRandom[i];
              if (randomType !== undefined) {
                this.slotInstances[i].slotType = randomType;
                this._tempFirstRandomSet.add(i);
              }
            }
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
      if (this.isDebug) {
        slotInstance.testLabel.string = `${i}`;
        slotInstance.testLabel.node.active = true;
      }
      slot.setPosition(startPosition);
      slot.setParent(this.node);
      this.slots.push(slot);
      this.slotInstances.push(slotInstance);
      this.startPositions.push(startPosition);
    }
  }

  startSpin(targetResult: SlotType[]) {
    // 設定本次目標結果
    this.targetResult = targetResult;
    // 設定本次隨機樣式(可以自由調整數量)
    this.firstRandom = getRandomSlotTypes(this.randomCount);
    this._tempTargetSet.clear();
    this._tempFirstRandomSet.clear();
    // this._isSpinning = true;
    tween(this.node)
      .to(this.tweenSpinDuration, { position: this._tweenPosition }) // 往上跳
      .to(this.tweenSpinDuration, { position: this._startPosition }) // 回到原點
      .call(() => {
        // 完成之後，計時準備停下的狀態
        this.scheduleOnce(() => {
          this._isStopping = true;
        }, this.spinDuration);
      })
      .start();
    // 在前面的動畫結束前一點點就開始轉動動畫，才不會有卡頓感
    this.scheduleOnce(() => {
      this._isSpinning = true;
    }, this.tweenSpinDuration * 1.95);
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
    // console.log('reel', this.node.name);
    console.log(
      "it's slots",
      this.slotInstances.filter((_, i) => i > 2 && i < 6).map((s) => s.slotType)
    );
    // 觸發事件，表示這條 Reel 已經從 spin 停止了
    EventManager.eventTarget.emit('reel-stopped');
  }
}

import { _decorator, Component, Label, Node, Sprite, SpriteAtlas } from 'cc';
import { SlotSpriteFrameType, SlotType } from './types/index.d';
import { ResourceManager } from './ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('Slot')
export class Slot extends Component {
  @property(Sprite)
  public slotBody: Sprite = null;
  @property(Node)
  public slotNeonFrame: Node = null;
  @property(Label)
  public testLabel: Label = null;

  private _slotType: SlotType = SlotType.Cherry;
  private _slotSpriteAtlas: SpriteAtlas = null;

  // getter：當讀取 age 時觸發
  get slotType(): SlotType {
    return this._slotType;
  }

  // setter：當設定 age 時觸發
  set slotType(newType: SlotType) {
    this._slotType = newType;
    // 同時要更新其他的屬性
    this.updateSpriteFrame();
  }

  setSlotSpriteAtlas() {
    this._slotSpriteAtlas = ResourceManager.getAsset<SpriteAtlas>(
      'textures/items',
      'items'
    );
  }

  updateSpriteFrame() {
    if (!this._slotSpriteAtlas) {
      this.setSlotSpriteAtlas();
    }
    switch (this._slotType) {
      case SlotType.Cherry:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Cherry
        );
        break;
      case SlotType.Lemon:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Lemon
        );
        break;
      case SlotType.Orange:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Orange
        );
        break;
      case SlotType.Banana:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Banana
        );
        break;
      case SlotType.Grape:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Grape
        );
        break;
      case SlotType.Watermelon:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Watermelon
        );
        break;
      case SlotType.Wild:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Wild
        );
        break;
      case SlotType.Scatter:
        this.slotBody.spriteFrame = this._slotSpriteAtlas.getSpriteFrame(
          SlotSpriteFrameType.Scatter
        );
        break;
    }
  }
}

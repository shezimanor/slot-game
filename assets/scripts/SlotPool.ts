import { Node, Prefab, instantiate } from 'cc';

export class SlotPool {
  private static _instance: SlotPool = null;
  public static get instance(): SlotPool {
    if (!SlotPool._instance) {
      SlotPool._instance = new SlotPool();
    }
    return SlotPool._instance;
  }

  // 這個 pool 只收已經停用的 Slot Node
  public inactivePool: Set<Node> = new Set();
  private _prefab: Prefab;
  public startSlotCount: number = 30;

  // 單例模式：外部無法直接實例化
  private constructor() {}

  // 初始化
  init(prefab: Prefab) {
    console.log('object pool init prefab');
    this._prefab = prefab;
  }

  // 取得一個 Slot
  getSlot(): Node {
    // 如果有停用的 Slot，就從停用的 pool 中取出
    if (this.inactivePool.size > 0) {
      for (const Slot of this.inactivePool) {
        // 標記成 active
        this.markAsActive(Slot);
        // 回傳
        return Slot;
      }
    } else {
      // 如果沒有，就從 pool 中取出一個新的 Slot
      const Slot = instantiate(this._prefab);
      // 回傳
      return Slot;
    }
  }

  // 回收一個 Slot
  recycleSlot(Slot: Node) {
    // 停用這個 Slot
    this.markAsInactive(Slot);
  }

  // 啟用一個 Slot
  markAsActive(Slot: Node) {
    Slot.active = true;
    this.inactivePool.delete(Slot);
  }

  // 停用一個 Slot
  markAsInactive(Slot: Node) {
    Slot.active = false;
    this.inactivePool.add(Slot);
  }
}

export enum SlotType {
  Cherry, // 0
  Lemon, // 1
  Orange, // 2
  Banana, // 3
  Grape, // 4
  Watermelon, // 5
  Wild, // 6
  Scatter // 7
}

export enum SlotSpriteFrameType {
  Cherry = 'item-cherry', // 0
  Lemon = 'item-lemon', // 1
  Orange = 'item-orange', // 2
  Banana = 'item-banana', // 3
  Grape = 'item-grape', // 4
  Watermelon = 'item-watermelon', // 5
  Wild = 'item-wild', // 6
  Scatter = 'item-scatter' // 7
}

export type PayoutTable = {
  [key in SlotType]: {
    3: number;
    4: number;
    5: number;
  };
};

export interface PayLineResult {
  lineIndex: number; // 第幾條賠付線（0~9）
  matched: SlotType; // 是哪個符號中獎（例：SlotType.Cherry）
  count: number; // 連線個數（3,4,5）
  win: number; // 該線贏得的金額
}

export interface SpinResult {
  matrix: SlotType[][];
  payLineResult: PayLineResult[];
  totalWin: number;
  scatterCount: number;
  scatterTriggered: boolean;
}

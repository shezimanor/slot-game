import { PayLineResult, PayoutTable, SlotType } from './types/index.d';

export class ResultManager {
  private constructor() {}

  public static rows: number = 5; // 每一橫列有幾個格子
  public static cols: number = 3; // 每一直列有幾個格子

  // 機率權重表
  public static slotWeights: Record<SlotType, number> = {
    [SlotType.Cherry]: 26,
    [SlotType.Lemon]: 22,
    [SlotType.Orange]: 15,
    [SlotType.Banana]: 12,
    [SlotType.Grape]: 10,
    [SlotType.Watermelon]: 8,
    [SlotType.Wild]: 5,
    [SlotType.Scatter]: 2
  };

  // 總權重(因為依賴 slotWeights 的值，所以要寫在他的下面)
  public static totalWeight: number = Object.values(this.slotWeights).reduce(
    (acc, weight) => acc + weight,
    0
  );

  // 賠付表
  public static payoutTable: PayoutTable = {
    [SlotType.Cherry]: { 3: 2, 4: 5, 5: 20 },
    [SlotType.Lemon]: { 3: 2, 4: 6, 5: 25 },
    [SlotType.Orange]: { 3: 3, 4: 8, 5: 30 },
    [SlotType.Banana]: { 3: 4, 4: 10, 5: 40 },
    [SlotType.Grape]: { 3: 5, 4: 15, 5: 60 },
    [SlotType.Watermelon]: { 3: 10, 4: 30, 5: 100 }
  };

  // Free Spin 的賠付表
  public static scatterPayout = { 3: 3, 4: 4, 5: 5 };

  // 賠付線 格子(上):0, 格子(中):1, 格子(下):2
  public static payLines: number[][] = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [1, 0, 1, 2, 1],
    [1, 2, 1, 0, 1]
    // [0, 1, 1, 1, 0],
    // [2, 1, 1, 1, 2],
    // [0, 0, 1, 2, 2]
  ];

  /**
   * 根據預定義的權重選擇隨機的水果類型。
   *
   * 此方法使用加權隨機選擇演算法來決定水果類型。
   * 每個水果類型都有一個關聯的權重，選擇某個水果類型的機率與其權重成正比。
   *
   * @returns {SlotType} 隨機選擇的水果類型。
   * @throws {Error} 如果未找到水果類型（在正常情況下不應發生）。
   */
  static getWeightedRandomSlotType(): SlotType {
    const random = Math.random() * this.totalWeight;
    let cumulativeWeight = 0;

    for (const [slotType, weight] of Object.entries(this.slotWeights)) {
      cumulativeWeight += weight;
      if (random < cumulativeWeight) {
        return Number(slotType);
      }
    }
    // 通常不會走到這步
    throw new Error('No slot type found');
  }

  /**
   * 建立每次 Spin 的結果矩陣。
   * 該矩陣是一個二維陣列，每一列由加權隨機選擇的水果類型填充。
   *
   * @returns {SlotType[][]} 一個二維陣列，表示結果矩陣，
   * 其中每個內部陣列對應於一直列水果類型。
   */
  static generateResultMatrix() {
    const matrix: SlotType[][] = [];
    for (let r = 0; r < this.rows; r++) {
      const row: SlotType[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(this.getWeightedRandomSlotType());
      }
      matrix.push(row);
    }
    return matrix;
  }

  /**
   * 根據指定的賠付線從矩陣中提取對應的水果類型。
   *
   * @param matrix - 表示老虎機矩陣的二維陣列，其中每個子陣列對應於一列的水果類型。
   * @param payLine - 一個數字陣列，表示要從矩陣中提取的每列的行位置。
   * @returns 一個 `SlotType` 陣列，對應於指定的賠付線。
   */
  static getPayLineSlotType(
    matrix: SlotType[][],
    payLine: number[]
  ): SlotType[] {
    return matrix.map((row, colIndex) => row[payLine[colIndex]]);
  }

  /**
   * 計算連線的贏分結果。
   *
   * @param slots - 一個包含所有槽位的陣列，表示當前的連線結果。
   * @returns 一個物件，包含以下屬性：
   * - `count`: 連線數，若無中獎則為 0。
   * - `win`: 獲得的贏分，若無中獎則為 0。
   * - `matched`: 中獎的水果類型，若無中獎則為 `null`。
   *
   * 此函式會依據以下規則計算：
   * 1. 若第一個槽位為 Wild 或 Scatter，則直接返回未中獎。
   * 2. 從第二個槽位開始，檢查是否為相同的水果類型或 Wild，若是則繼續計算連線數量。
   * 3. 若連線數量大於等於 3，且該類型存在於支付表中，則返回對應的贏分。
   * 4. 若不符合中獎條件，則返回未中獎結果。
   */
  static calculateLineWin(slots: SlotType[]): {
    count: number;
    win: number;
    matched: SlotType | null;
  } {
    let base: SlotType = null;
    let count = 0;
    for (let slot of slots) {
      // base 為 null 時，表示現在是第一個檢查的
      if (base === null) {
        // 如果是 Wild 或 Scatter，則表示沒中獎，因為中獎條件一定要從第一個開始連線
        if (slot === SlotType.Wild || slot === SlotType.Scatter)
          return { count: 0, win: 0, matched: null };
        base = slot;
        count++;
        // continue: 直接進入下一個循環項目，下面的檢查跳過
        continue;
      }

      // 如果是相同的水果類型 或 Wild，則繼續紀錄
      if (slot === base || slot === SlotType.Wild) {
        count++;
      }
      // 否則就離開 for 迴圈
      else {
        break;
      }
    }

    // 列出結果
    if (base != null && count >= 3 && this.payoutTable[base]) {
      return { count, win: this.payoutTable[base][count], matched: base };
    }
    return { count: 0, win: 0, matched: null };
  }

  /**
   * 計算 Scatter 的結果。
   *
   * @param matrix - 表示老虎機矩陣的二維陣列，其中每個子陣列對應於一列的水果類型。
   * @returns 一個物件，包含以下屬性：
   * - `scatterCount`: 給予 Free Spin 的次數。
   * - `scatterTriggered`: 是否觸發了 Free Spin。
   *
   * 此函式會檢查矩陣中出現的 Scatter 數量，若大於 3 則觸發 Free Spin。
   */
  static calculateScatter(matrix: SlotType[][]): {
    scatterCount: number;
    scatterTriggered: boolean;
  } {
    let count = 0;
    for (const col of matrix) {
      for (const slot of col) {
        if (slot === SlotType.Scatter) count++;
      }
    }
    return count > 3
      ? { scatterCount: this.scatterPayout[count], scatterTriggered: true }
      : { scatterCount: 0, scatterTriggered: false };
  }

  /**
   * 獲取隨機的結果矩陣和賠付線結果。
   *
   * @returns 一個物件，包含以下屬性：
   * - `matrix`: 隨機生成的結果矩陣。
   * - `payLineResult`: 每條賠付線的結果。
   * - `totalWin`: 總贏分。
   * - `scatterCount`: Free Spin 次數。
   * - `scatterTriggered`: 是否觸發了 Free Spin。
   */
  static getRandomResult() {
    // 計算每條賠付線的結果
    let totalWin = 0;
    const payLineResult: PayLineResult[] = [];
    const matrix: SlotType[][] = this.generateResultMatrix();

    // 計算每條賠付線的結果
    for (let i = 0; i < this.payLines.length; i++) {
      const line = this.payLines[i];
      // 取得該條賠付線上目前的水果類型
      const slots = this.getPayLineSlotType(matrix, line);
      // 計算該條賠付線的結果
      const { count, win, matched } = this.calculateLineWin(slots);
      // 如果有中獎，則加入結果
      if (count > 0) {
        payLineResult.push({
          lineIndex: i,
          matched,
          count,
          win
        });
        // 計算總贏分
        totalWin += win;
      }
    }

    // 計算 Free Spin 的結果
    const { scatterCount, scatterTriggered } = this.calculateScatter(matrix);

    // 回傳結果
    return {
      matrix,
      payLineResult,
      totalWin,
      scatterCount,
      scatterTriggered
    };
  }
}

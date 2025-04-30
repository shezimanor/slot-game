import { SlotType } from '../types/index.d';

const SlotTypePool: SlotType[] = Object.values(SlotType).filter(
  (value) => typeof value === 'number'
) as SlotType[];

const SlotTypeFruitPool: SlotType[] = SlotTypePool.filter(
  (value) => ![SlotType.Wild, SlotType.Scatter].includes(value)
);

export function getRandomSlotType(): SlotType {
  return SlotTypePool[Math.floor(Math.random() * SlotTypePool.length)];
}

export function getRandomSlotTypeFruit(): SlotType {
  return SlotTypeFruitPool[Math.floor(Math.random() * SlotTypePool.length)];
}

// 測試用
export function getRandomResult(): [SlotType, SlotType, SlotType] {
  const result: [SlotType, SlotType, SlotType][] = [
    [SlotType.Banana, SlotType.Banana, SlotType.Banana],
    [SlotType.Grape, SlotType.Grape, SlotType.Grape],
    [SlotType.Wild, SlotType.Wild, SlotType.Wild],
    [SlotType.Watermelon, SlotType.Watermelon, SlotType.Watermelon],
    [SlotType.Scatter, SlotType.Scatter, SlotType.Scatter],
    [SlotType.Orange, SlotType.Orange, SlotType.Orange]
  ];
  const target = Math.floor(Math.random() * result.length);
  return result[target];
}

export function getRandomSlotTypes(count: number = 3): SlotType[] {
  return Array.from({ length: count }, () => getRandomSlotType());
}

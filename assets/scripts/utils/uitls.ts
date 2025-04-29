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

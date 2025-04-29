import { EventTarget } from 'cc';

export class EventManager {
  private constructor() {}
  public static eventTarget: EventTarget = new EventTarget();
}

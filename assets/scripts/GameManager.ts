import {
  _decorator,
  Animation,
  AudioClip,
  Button,
  Component,
  Label,
  Node
} from 'cc';
import { ResourceManager } from './ResourceManager';
import { EventManager } from './EventManager';
import { ReelManager } from './ReelManager';
import { ResultManager } from './ResultManager';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Button)
  public spinButton: Button = null;
  @property(Button)
  public maxBetButton: Button = null;
  @property(Button)
  public autoSpinButton: Button = null;
  @property(Button)
  public minusBetButton: Button = null;
  @property(Button)
  public plusBetButton: Button = null;
  @property(Label)
  public betLabel: Label = null;
  @property(Label)
  public totalWinLabel: Label = null;
  @property(Animation)
  public totalWinLabelAnimation: Animation = null;

  // 每局的下注金額
  public bet: number = 10;
  // 每局的獎金
  public totalWin: number = 0;
  // 累積花費
  public totalCost: number = 0;
  // 累積獎金
  public totalReward: number = 0;
  // 自動 Spin 標記
  public isAutoSpin: boolean = false;

  protected onLoad(): void {
    ResourceManager.init();
    EventManager.eventTarget.on('resource-loaded', this.onSourcesLoaded, this);
    EventManager.eventTarget.on('activate-buttons', this.activateButtons, this);
    EventManager.eventTarget.on('show-total-win', this.showTotalWin, this);
  }

  protected start(): void {
    // 初始化下注金額標籤
    this.updateBetLabel();
    // 隱藏獎金標籤
    this.hideTotalWin();
  }

  protected onDestroy(): void {
    EventManager.eventTarget.off('resource-loaded', this.onSourcesLoaded, this);
    EventManager.eventTarget.off(
      'activate-buttons',
      this.activateButtons,
      this
    );
    EventManager.eventTarget.off('show-total-win', this.showTotalWin, this);
  }

  updateBetLabel() {
    this.betLabel.string = `${this.bet}`;
  }

  onSourcesLoaded() {
    this.spinButton.interactable = true;
    EventManager.eventTarget.emit('reels-init');
  }

  onClickSpin() {
    if (ReelManager.instance.isSpinning) return;
    // 禁用按鈕
    this.inactivateButtons();
    // 隱藏獎金標籤
    this.hideTotalWin();
    // 清空前次的結果(水果醒目效果)
    EventManager.eventTarget.emit('clear-active-slots');
    // 先取得結果
    const spinResult = ResultManager.getRandomResult();
    EventManager.eventTarget.emit('start-spin', spinResult);
    console.log('抽獎', spinResult);
    // 將本次結果的 totalWin 寫入(因為這個 demo 設計的 spinResult.totalWin 是倍數，所以要乘上下注金額)
    this.totalWin = spinResult.totalWin * this.bet;
  }

  onClickPlus() {
    if (this.bet >= 100) return;
    this.bet += 10;
    this.updateBetLabel();
  }

  onClickMinus() {
    if (this.bet <= 10) return;
    this.bet -= 10;
    this.updateBetLabel();
  }

  onClickMaxBet() {
    this.bet = 100;
    this.updateBetLabel();
  }

  onClickAutoSpin() {
    this.isAutoSpin = !this.isAutoSpin;
    if (this.isAutoSpin) this.onClickSpin();
    else this.activateButtons();
  }

  inactivateButtons() {
    this.spinButton.interactable = false;
    this.maxBetButton.interactable = false;
    this.minusBetButton.interactable = false;
    this.plusBetButton.interactable = false;
  }

  activateButtons() {
    if (ReelManager.instance.isSpinning || this.isAutoSpin) return;
    this.spinButton.interactable = true;
    this.maxBetButton.interactable = true;
    this.minusBetButton.interactable = true;
    this.plusBetButton.interactable = true;
  }

  hideTotalWin() {
    this.totalWinLabel.node.active = false;
    this.totalWinLabel.string = '';
    this.totalWinLabelAnimation.stop();
  }

  showTotalWin() {
    if (this.totalWin > 0) {
      // 播放中獎音效
      AudioManager.instance.playMusic(
        ResourceManager.getAsset<AudioClip>('audios', 'win'),
        false
      );
    } else {
      // 播放沒中音效
      AudioManager.instance.playMusic(
        ResourceManager.getAsset<AudioClip>('audios', 'no-win'),
        false
      );
    }
    this.totalWinLabel.string = `Total Win: ${this.totalWin}`;
    this.totalWinLabel.node.active = true;
    this.totalWinLabelAnimation.play();
    // 確認是否為自動 Spin
    if (this.isAutoSpin) {
      // 如果是自動 Spin，則在 1 秒後自動 Spin
      this.scheduleOnce(() => {
        if (this.isAutoSpin) this.onClickSpin();
      }, 1);
    }
  }
}

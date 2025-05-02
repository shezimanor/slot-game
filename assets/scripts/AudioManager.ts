import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  director,
  Node
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
  private static _instance: AudioManager = null;
  public static get instance(): AudioManager {
    return AudioManager._instance;
  }
  // 音樂播放器
  @property(AudioSource)
  public musicSource: AudioSource = null;
  // 音效播放器
  @property(AudioSource)
  public soundSource: AudioSource = null;

  protected onLoad(): void {
    // 單例模式
    if (!AudioManager._instance) {
      AudioManager._instance = this;
    } else {
      this.destroy();
    }
  }

  protected onDestroy(): void {
    if (AudioManager._instance === this) {
      AudioManager._instance = null;
    }
  }

  stopMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource.loop = false;
    } else {
      console.error('AudioManager: Music source or clip not found');
    }
  }

  stopSound() {
    if (this.soundSource) {
      this.soundSource.stop();
    } else {
      console.error('AudioManager: Sound source not found');
    }
  }

  playMusic(music: AudioClip, loop: boolean = false) {
    if (music) {
      this.musicSource.clip = music;
      this.musicSource.loop = loop;
      this.musicSource.play();
    } else {
      console.error('AudioManager: Music source or clip not found');
    }
  }

  playSound(sound: AudioClip) {
    // 可由外部的腳本傳入音效
    if (sound) {
      this.soundSource.playOneShot(sound);
    } else {
      console.error('AudioManager: Sound source or clip not found');
    }
  }
}

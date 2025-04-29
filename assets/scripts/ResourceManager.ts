import { Asset, Prefab, resources, SpriteAtlas } from 'cc';
import { EventManager } from './EventManager';

type AssetType = Prefab | SpriteAtlas;

export class ResourceManager {
  private constructor() {}
  public static resources: Array<{
    path: string;
    type: typeof Asset;
  }> = [
    { path: 'prefabs', type: Prefab },
    { path: 'textures/items', type: SpriteAtlas }
  ];
  public static assetStores: Record<string, Record<string, AssetType>> = {};
  public static completeCount: number = 0;

  public static init() {
    for (const resource of this.resources) {
      this.loadAssets(resource.path, resource.type, (result: boolean) => {
        if (result) {
          this.completeLoad();
        } else {
          console.error(`${resource.path} 載入失敗`);
        }
      });
    }
  }

  public static loadAssets(
    path: string,
    assetType: typeof Asset,
    callback: (result: boolean) => void
  ): void {
    resources.loadDir(path, assetType, (err, assets: AssetType[]) => {
      if (err) {
        console.error(`Failed to load ${path}:`, err);
        callback(false);
        return;
      }
      if (!this.assetStores[path]) {
        this.assetStores[path] = {};
      }
      assets.forEach((asset) => {
        const name = asset.name;
        console.log('name', name);
        this.assetStores[path][name] = asset;
      });
      console.log(`${path} 載入成功`);
      callback(true);
    });
  }

  public static getAsset<T>(path: string, name: string) {
    if (this.assetStores[path] && this.assetStores[path][name]) {
      return <T>this.assetStores[path][name];
    } else {
      console.error(`${path} not found in store: ${name}`);
      return null;
    }
  }

  private static completeLoad(): void {
    this.completeCount++;
    if (this.completeCount >= this.resources.length) {
      console.log('所有資源載入完成');
      EventManager.eventTarget.emit('resource-loaded');
    }
  }
}

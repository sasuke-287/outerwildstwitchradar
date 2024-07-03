// src/actions/twitch-game-streamers.ts
import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  streamDeck,
} from "@elgato/streamdeck";
import axios from "axios";
import * as fs from "fs";
import { fileURLToPath } from "url";
import * as path from "path";

const logger = streamDeck.logger.createScope("Custom Scope");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Config {
  clientId: string;
  clientSecret: string;
  gameId: string;
}

@action({ UUID: "com.sasuke287.outerwildstwitchradar.twitch-viewer" })
export class TwitchGameStreamersAction extends SingletonAction {
  private config!: Config;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly INTERVAL = 22 * 60 * 1000; // 22分をミリ秒に変換

  constructor() {
    super();
    this.loadConfig();
  }

  /**
   * アクションが表示された時
   * @param ev
   */
  async onWillAppear(ev: WillAppearEvent<any>) {
    console.log("Action is appearing on the Stream Deck");
    this.startInterval(ev);
  }

  /**
   * アクションが非表示された時
   * @param ev
   */
  async onWillDisappear(ev: WillDisappearEvent<any>) {
    console.log("Action is disappearing from the Stream Deck");
    this.stopInterval();
  }

  /**
   * ボタン押下時
   */
  async onKeyDown(ev: KeyDownEvent<any>) {}

  /**
   * タイマー作動
   * タイトル編集のためevを引き継ぐ
   */
  private startInterval(ev: WillAppearEvent<any>) {
    if (this.intervalId === null) {
      this.executeFunction(ev);
      this.intervalId = setInterval(
        () => this.executeFunction(ev),
        this.INTERVAL
      );
    }
  }

  /**
   * タイマー停止
   */
  private stopInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * API実行と表示
   */
  private async executeFunction(ev: WillAppearEvent<any>) {
    try {
      await ev.action.setTitle("探索中");
      logger.info(`探索中`);
      const streamersData = await this.fetchStreamersCount();
      const streamersCount = Object.keys(streamersData).length;

      await ev.action.setTitle(`配信者数: ${streamersCount}`);
      logger.debug(`APIデータ: ${JSON.stringify(streamersData)}`);
      logger.info(`配信者数: ${streamersCount}`);
    } catch (error) {
      console.error("Error fetching streamers count:", error);
      await ev.action.setTitle("エラー");
    }
  }

  private loadConfig() {
    const configPath = path.join(__dirname, "..", "..", "config.json");
    const configFile = fs.readFileSync(configPath, "utf-8");
    this.config = JSON.parse(configFile);
  }

  private async getAccessToken() {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${this.config.clientId}&client_secret=${this.config.clientSecret}&grant_type=client_credentials`
    );

    return response.data.access_token;
  }

  private async getStreamersCount(accessToken: string) {
    const response = await axios.get(
      `https://api.twitch.tv/helix/streams?game_id=${this.config.gameId}&language=ja`,
      {
        headers: {
          "Client-ID": this.config.clientId,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  }

  private async fetchStreamersCount(): Promise<number> {
    const accessToken = await this.getAccessToken();
    return await this.getStreamersCount(accessToken);
  }
}

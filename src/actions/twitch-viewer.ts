// src/actions/twitch-game-streamers.ts
import { action, KeyDownEvent, SingletonAction} from "@elgato/streamdeck";
import streamDeck, { LogLevel } from "@elgato/streamdeck";
import axios from "axios";
import * as fs from "fs";
import { fileURLToPath } from "url";
import * as path from "path";
import { count } from "console";
import { stringify } from "querystring";

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

  constructor() {
    super();
    this.loadConfig();
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

    return response.data;
  }

  async onKeyDown(ev: KeyDownEvent<any>) {
    try {
      await ev.action.setTitle("探索中");
      logger.info("ボタンが押されたよ");

      const accessToken = await this.getAccessToken();
      logger.info(`トークン確保 ${accessToken}`);

      const streamersCount = await this.getStreamersCount(accessToken);
      const aaa = Object.keys(streamersCount.data).length;

      logger.info(JSON.stringify(streamersCount));
      logger.info(String(aaa));

      await ev.action.setTitle(`配信者数: ${aaa}`);
      logger.info(`配信者数: ${aaa}`);
    } catch (error) {
      console.error("Error fetching streamers count:", error);
      await ev.action.setTitle("エラー");
    }
  }
}

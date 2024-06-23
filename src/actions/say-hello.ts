// src/actions/say-hello.ts
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

// UUIDは適宜読み替えてください
@action({ UUID: "com.sasuke287.outerwildstwitchradar.say-hello" })
export class SayHelloAction extends SingletonAction {
    // KeyDownイベントが発火された際のコールバック
    // 本来はPayloadの該当する部分にGenericsを設定できる
    async onKeyDown(ev: KeyDownEvent<any>) {
        // ボタンが押された際にタイトルを変更する
        await ev.action.setTitle("Hello world");
    }
}
import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { SayHelloAction } from "./actions/say-hello";
import { TwitchGameStreamersAction } from "./actions/twitch-viewer";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.DEBUG);

// Register the action, and connect to Stream Deck.
// streamDeck.actions.registerAction(new SayHelloAction());
streamDeck.actions.registerAction(new TwitchGameStreamersAction());
streamDeck.connect();
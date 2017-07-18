import xs, { Stream } from "xstream";
import { ReactElement } from "react";
import { View, Text, ToastAndroid } from "react-native";
import { ScreenSource, h } from "@cycle/native-screen";
import { StateSource, Reducer } from "cycle-onionify";

export type Sources = {
  Screen: ScreenSource;
  onion: StateSource<any>;
};

export type Sinks = {
  Screen: Stream<ReactElement<any>>;
  onion: Stream<Reducer<any>>;
};

export function main(sources: Sources): Sinks {
  const vdom$ = xs.of(h(View, [h(Text, "Hello world")]));
  const reducer$ = xs.empty();

  return {
    Screen: vdom$,
    onion: reducer$
  };
}

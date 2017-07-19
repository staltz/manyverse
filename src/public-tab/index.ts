import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {ScreenSource} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import view from './view';

export type Sources = {
  screen: ScreenSource;
  onion: StateSource<any>;
  ssb: Stream<any>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  onion: Stream<Reducer<any>>;
};

export function publicTab(sources: Sources): Sinks {
  const vdom$ = view(sources.ssb);
  const reducer$ = xs.empty();

  return {
    screen: vdom$,
    onion: reducer$
  };
}

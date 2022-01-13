import {Platform} from 'react-native';
import {ReactElement} from 'react';
import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {StateSource, Reducer} from '@cycle/state';
import {KeyboardSource} from 'cycle-native-keyboard';
import model, {State} from './model';
import {SSBSource} from '../../drivers/ssb';
import {GlobalEvent} from '../../drivers/eventbus';
import view from './view';
import intent from './intent';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  state: StateSource<State>;
  globalEventBus: Stream<GlobalEvent>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  globalEventBus: Stream<GlobalEvent>;
}

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: Platform.OS === 'web',
    },
  },
};

export function memeSearch(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const vdom$ = view(state$);
  const actions = intent(sources.screen, sources.navigation, state$);

  const memePicked$ = sources.globalEventBus
    .filter((ev) => ev.type === 'memePicked')
    .compose(sample(state$));

  const navCommand$ = xs
    .merge(actions.backDuringIdle$, memePicked$)
    .map(() => ({type: 'pop'} as Command));

  //const globalEvent$ = actions.submitRecording$
  //  .compose(sample(state$))
  //  .filter((state) => !!state.blobId)
  //  .map(
  //    (state) =>
  //      ({
  //        type: 'memePicked',
  //        blobId: state.blobId!,
  //        //alt
  //      } as GlobalEvent),
  //  );

  const reducer$ = model(actions, sources.ssb, state$);

  return {
    screen: vdom$,
    navigation: navCommand$,
    state: reducer$,
    keyboard: xs.of('dismiss'),
    globalEventBus: xs.never(), //globalEvent$,
  };
}

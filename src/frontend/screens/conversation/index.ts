// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {TypedCommand as StorageCommand} from '~frontend/drivers/asyncstorage';
import {SSBSource, Req} from '~frontend/drivers/ssb';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
import intent from './intent';
import {Props as P} from './props';
import {asyncStorage} from './asyncstorage';
export {navOptions} from './layout';

export type Props = P;

export interface Sources {
  props: Stream<Props>;
  asyncstorage: AsyncStorageSource;
  screen: ReactSource;
  ssb: SSBSource;
  navigation: NavSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
  asyncstorage: Stream<StorageCommand>;
  keyboard: Stream<'dismiss'>;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  bubbleText: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
  },
});

export function conversation(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const storageKey$ = state$
    .filter(({rootMsgId}) => !!rootMsgId)
    .map(({rootMsgId}) => `privateDraft:${rootMsgId}` as const)
    .remember();

  const loadedDraft$ = storageKey$
    .map((key) => sources.asyncstorage.getItem(key))
    .flatten()
    .map((value) => value ?? '')
    .remember();

  const vdom$ = view(state$, loadedDraft$);
  const actions = intent(sources.screen, sources.navigation);
  const cmd$ = navigation(actions, sources.props, state$);
  const reducer$ = model(sources.props, sources.ssb, actions);
  const newContent$ = ssb(actions, state$);
  const draftStorage$ = asyncStorage(
    actions.composeTextChanged$,
    actions.publishMsg$,
    storageKey$,
  );
  const dismiss$ = xs
    .merge(actions.goBack$, actions.goToProfile$, actions.goToRecipients$)
    .mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    asyncstorage: draftStorage$,
    navigation: cmd$,
    keyboard: dismiss$,
    ssb: newContent$,
    state: reducer$,
  };
}

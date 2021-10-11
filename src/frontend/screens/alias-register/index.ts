// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {view} from './view';
import {Command, NavSource} from 'cycle-native-navigation';
import {DialogSource} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
import {t} from '../../drivers/localization';
import {model, State} from './model';
export {navOptions} from './layout';
import {Props} from './props';

export interface Sources {
  props: Stream<Props>;
  navigation: NavSource;
  screen: ReactSource;
  ssb: SSBSource;
  state: StateSource<State>;
  dialog: DialogSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
}

export function registerAlias(sources: Sources): Sinks {
  const vdom$ = view(sources.state.stream);

  const back$ = xs.merge(
    sources.navigation.backPress(),
    sources.screen.select('topbar').events('pressBack'),
    sources.screen.select('back-from-success').events('press'),
  );

  const tryAgain$ = sources.screen.select('try-again').events('press');

  const registerAlias$ = sources.screen
    .select('list')
    .events('pressServer')
    .map((event: {roomId: string; host: string}) =>
      sources.dialog
        .prompt(
          void 0,
          t('register_alias.dialogs.input_alias.description', {
            host: event.host,
          }),
          {
            contentColor: Palette.colors.comet6,
            positiveColor: Palette.colors.comet8,
            positiveText: t('call_to_action.done'),
            negativeColor: Palette.colors.comet8,
            negativeText: t('call_to_action.cancel'),
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .map((res) => ({
          roomId: event.roomId,
          alias: (res as any).text as string,
        })),
    )
    .flatten();

  const actions = {
    back$,
    tryAgain$,
    registerAlias$,
  };

  const goBack$ = back$.map(() => ({type: 'pop'} as Command));
  const reducer$ = model(sources.props, actions, sources.ssb);

  return {
    screen: vdom$,
    state: reducer$,
    navigation: goBack$,
  };
}

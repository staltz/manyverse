// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {Alias, PeerKV} from '../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast} from '../../drivers/toast';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import manage from '../../components/manage-aliases';
import TopBar from '../../components/TopBar';
import {Props} from './props';

interface State {
  aliases: Array<Alias>;
  aliasServers?: Array<PeerKV>;
}

export interface Sources {
  props: Stream<Props>;
  ssb: SSBSource;
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  dialog: DialogSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  toast: Stream<Toast>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },
});

export function manageAliases(sources: Sources): Sinks {
  const manageSinks = manage(sources);

  const initReducer$ = xs.of(function initReducer(prev: State): State {
    if (prev) return prev;
    else return {aliases: []};
  });

  const reducer$ = xs.merge(initReducer$, manageSinks.state);

  const back$ = xs.merge(
    sources.navigation.backPress(),
    sources.screen.select('topbar').events('pressBack'),
  );

  const goBack$ = back$.map(() => ({type: 'pop'} as Command));

  const vdom$ = manageSinks.screen.map((innerVDOM) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('manage_aliases.title')}),
      h(ScrollView, {style: styles.container}, [innerVDOM]),
    ]),
  );

  return {
    screen: vdom$,
    toast: manageSinks.toast,
    state: reducer$,
    navigation: xs.merge(goBack$, manageSinks.navigation),
  };
}

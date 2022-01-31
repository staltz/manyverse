// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {StyleSheet, View} from 'react-native';
import {t} from '../../../drivers/localization';
import TopBar from '../../../components/TopBar';
import EmptySection from '../../../components/EmptySection';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {globalStyles} from '../../../global-styles/styles';
import {State} from '../model';
import ServerList from './ServerList';
import Submitting from './Submitting';
import Success from './Success';
import Failure from './Failure';

const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: {
    ...globalStyles.container,
    backgroundColor: Palette.backgroundText,
  },

  empty: {
    marginTop: Dimensions.verticalSpaceLarger,
  },
});

export function view(state$: Stream<State>) {
  return state$.map((state) => {
    const {uiState} = state;

    let moreChildren: Array<ReactElement>;
    if (uiState === 'initial') {
      if (state.servers.length === 0) {
        moreChildren = [
          h(EmptySection, {
            title: t('register_alias.empty.no_servers.title'),
            description: t('register_alias.empty.no_servers.description'),
            style: styles.empty,
          }),
        ];
      } else {
        moreChildren = [h(ServerList, {sel: 'list', servers: state.servers})];
      }
    } else if (uiState === 'submitting') {
      moreChildren = [h(Submitting)];
    } else if (uiState === 'error') {
      moreChildren = [h(Failure, {error: state.error!})];
    } else if (uiState === 'success') {
      moreChildren = [h(Success, {aliasURL: state.registeredAliasURL!})];
    } else {
      throw new Error('unreachable');
    }

    return h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('register_alias.title')}),
      h(View, {style: styles.container}, [...moreChildren]),
    ]);
  });
}

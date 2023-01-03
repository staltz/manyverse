// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import {ReactSource, h} from '@cycle/react';
import {Command, NavSource} from 'cycle-native-navigation';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {globalStyles} from '~frontend/global-styles/styles';
import TopBar from '~frontend/components/TopBar';
import Markdown from '~frontend/components/Markdown';
import StatusBarBlank from '~frontend/components/StatusBarBlank';
import topBackers from './backers';

/**
 * This is a function and not a constant because localization loading is async.
 */
function getContent() {
  return t('thanks.description', {
    sponsor1: '[NGI0 PET](https://nlnet.nl/project/Manyverse)',
    sponsor2: '[Handshake / ACCESS](https://opencollective.com/access)',
    topBackers: topBackers.join(', '),
    donateLink: 'https://manyver.se/donate',
  });
}

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
}

export const styles = StyleSheet.create({
  screen: globalStyles.screen,
  container: globalStyles.containerWithDesktopSideBar,

  markdown: {
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
});

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

export function thanks(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(View, {style: styles.screen}, [
      h(StatusBarBlank),
      h(TopBar, {sel: 'topbar', title: t('thanks.title')}),
      h(ScrollView, {style: styles.container}, [
        h(View, {style: styles.markdown}, [h(Markdown, {text: getContent()})]),
      ]),
    ]),
  );

  const command$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('topbar').events('pressBack'),
    )
    .mapTo({type: 'pop'} as Command);

  return {
    screen: vdom$,
    navigation: command$,
  };
}

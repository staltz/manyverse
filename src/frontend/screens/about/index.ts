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
import version from '~frontend/versionName';

const firstCopyrightYear = 2018;
const lastCopyrightYear =
  2000 + parseInt(version.split('.')[1].substring(0, 2), 10);
const repoLink = 'https://gitlab.com/staltz/manyverse';
const authorsLink = 'https://gitlab.com/staltz/manyverse/-/raw/master/AUTHORS';

/**
 * This is a function and not a constant because localization loading is async.
 */
function getContent() {
  return (
    '[manyver.se](https://manyver.se)\n' +
    t('about.version', {version}) +
    '\n\n' +
    t('about.copyright') +
    ` ${firstCopyrightYear}-${lastCopyrightYear} ` +
    `[${t('about.authors')}](${authorsLink})\n` +
    '\n' +
    `[${t('about.repository')}](${repoLink})\n` +
    t('about.licensed', {license: 'MPL 2.0'})
  );
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

export function about(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(View, {style: styles.screen}, [
      h(StatusBarBlank),
      h(TopBar, {sel: 'topbar', title: t('about.title')}),
      h(
        ScrollView,
        {style: styles.container, contentContainerStyle: styles.markdown},
        [h(Markdown, {text: getContent()})],
      ),
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

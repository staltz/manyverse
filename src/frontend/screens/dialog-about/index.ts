// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {StyleSheet, NativeModules} from 'react-native';
import {Options} from 'react-native-navigation';
import {t} from '../../drivers/localization';
import MarkdownDialog from '../../components/dialogs/MarkdownDialog';

const version = NativeModules.BuildConfig.VERSION_NAME;

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
};

export const navOptions: Options = MarkdownDialog.navOptions;

export const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
});

export function dialogAbout(sources: Sources): Sinks {
  const repoLink = 'https://gitlab.com/staltz/manyverse';
  const authorsLink =
    'https://gitlab.com/staltz/manyverse/-/raw/master/AUTHORS';

  const vdom$ = xs.of(
    h(MarkdownDialog, {
      sel: 'dialog',
      title: t('dialog_about.title'),
      content:
        '[manyver.se](https://manyver.se)\n' +
        t('dialog_about.version', {version}) +
        '\n\n' +
        t('dialog_about.copyright') +
        ' 2018-2021 ' +
        `[${t('dialog_about.authors')}](${authorsLink})\n` +
        '\n' +
        `[${t('dialog_about.repository')}](${repoLink})\n` +
        t('dialog_about.licensed', {license: 'MPL 2.0'}),
    }),
  );

  const command$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('dialog').events('close'),
    )
    .mapTo({type: 'dismissModal'} as Command);

  return {
    screen: vdom$,
    navigation: command$,
  };
}

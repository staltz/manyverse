/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {StyleSheet, NativeModules} from 'react-native';
import {Options} from 'react-native-navigation';
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
  const authorsLink =
    'https://gitlab.com/staltz/manyverse/-/raw/master/AUTHORS';

  const vdom$ = xs.of(
    h(MarkdownDialog, {
      sel: 'dialog',
      title: 'About Manyverse',
      content:
        '[manyver.se](https://manyver.se)\n' +
        `Version ${version}\n` +
        '\n' +
        `Copyright (C) 2018-2020 [The Manyverse Authors](${authorsLink})\n` +
        '\n' +
        '[Open source on GitLab](https://gitlab.com/staltz/manyverse)\n' +
        'Licensed MPL 2.0 and AGPL 3.0',
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

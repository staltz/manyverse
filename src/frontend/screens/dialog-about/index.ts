/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {Text, StyleSheet, NativeModules, Platform} from 'react-native';
import {Options} from 'react-native-navigation';
import TextDialog from '../../components/dialogs/TextDialog';

const version =
  Platform.OS === 'android' ? NativeModules.BuildConfig.VERSION_NAME : '?';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  linking: Stream<string>;
};

export const navOptions: Options = TextDialog.navOptions;

export const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
});

export function dialogAbout(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(TextDialog, {sel: 'dialog', title: 'About Manyverse'}, [
      h(Text, {sel: 'manyverse-website', style: styles.link}, 'manyver.se'),
      '\nVersion ' + version + '\n\nCopyright (C) 2018-2019 ',
      h(
        Text,
        {sel: 'manyverse-authors', style: styles.link},
        'The Manyverse Authors',
      ),
      '\n\n',
      h(
        Text,
        {sel: 'manyverse-source', style: styles.link},
        'Open source on GitLab',
      ),
      '\nLicensed MPL 2.0',
    ]),
  );

  const command$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('dialog').events('close'),
    )
    .mapTo({type: 'dismissModal'} as Command);

  const visitLinks$ = xs.merge(
    sources.screen
      .select('manyverse-website')
      .events('press')
      .mapTo('https://manyver.se'),
    sources.screen
      .select('manyverse-authors')
      .events('press')
      .mapTo('https://gitlab.com/staltz/manyverse/blob/master/AUTHORS'),
    sources.screen
      .select('manyverse-source')
      .events('press')
      .mapTo('https://gitlab.com/staltz/manyverse'),
  );

  return {
    screen: vdom$,
    navigation: command$,
    linking: visitLinks$,
  };
}

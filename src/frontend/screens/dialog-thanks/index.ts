/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {Text, StyleSheet} from 'react-native';
import {Options} from 'react-native-navigation';
import TextDialog from '../../components/dialogs/TextDialog';

const top5backers = [
  'DC Posch',
  'Audrey Tang',
  'Connor Turland',
  'Jean-Baptiste Giraudeau',
  'C Moid',
];

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

  bold: {
    fontWeight: 'bold',
  },
});

export function dialogThanks(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(TextDialog, {sel: 'dialog', title: 'Thank you!'}, [
      'Development of this app was supported by grants from ',
      h(Text, {sel: 'link-ngizero', style: styles.link}, 'NGI0 PET'),
      ' and ',
      h(Text, {sel: 'link-access', style: styles.link}, 'Handshake / ACCESS'),
      ', and donations from:\n\n',
      h(Text, {style: styles.bold}, top5backers.join(', ')),
      ', and ',
      h(
        Text,
        {sel: 'link-backers', style: styles.link},
        'dozens of other backers',
      ),
      '. Thanks!',
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
      .select('link-ngizero')
      .events('press')
      .mapTo('https://nlnet.nl/project/Manyverse/'),
    sources.screen
      .select('link-access')
      .events('press')
      .mapTo('https://opencollective.com/access'),
    sources.screen
      .select('link-backers')
      .events('press')
      .mapTo('https://manyver.se/donate'),
  );

  return {
    screen: vdom$,
    navigation: command$,
    linking: visitLinks$,
  };
}

/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {Options} from 'react-native-navigation';
import MarkdownDialog from '../../components/dialogs/MarkdownDialog';

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
};

export const navOptions: Options = MarkdownDialog.navOptions;

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
    h(MarkdownDialog, {
      sel: 'dialog',
      title: 'Thank you!',
      content:
        'Development of this app was supported by grants from ' +
        '[NGI0 PET](https://nlnet.nl/project/Manyverse) and ' +
        '[Handshake / ACCESS](https://opencollective.com/access), ' +
        'and donations from:\n' +
        '\n' +
        `**${top5backers.join(', ')}**, and ` +
        '[dozens of other backers](https://manyver.se/donate). ' +
        'Thanks!',
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

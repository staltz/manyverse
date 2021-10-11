// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {Options} from 'react-native-navigation';
import {t} from '../../drivers/localization';
import MarkdownDialog from '../../components/dialogs/MarkdownDialog';
import topBackers from './backers';

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
      title: t('dialog_thanks.title'),
      content: t('dialog_thanks.description', {
        sponsor1: '[NGI0 PET](https://nlnet.nl/project/Manyverse)',
        sponsor2: '[Handshake / ACCESS](https://opencollective.com/access)',
        topBackers: topBackers.join(', '),
        donateLink: 'https://manyver.se/donate',
      }),
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

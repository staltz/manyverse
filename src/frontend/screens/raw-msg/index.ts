/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import {SSBSource} from '../../drivers/ssb';
import {t} from '../../drivers/localization';
import {MsgAndExtras} from '../../ssb/types';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import TopBar from '../../components/TopBar';

export type Props = {
  msg: MsgAndExtras;
};

export type Sources = {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  container: {
    flex: 1,
    backgroundColor: Palette.backgroundHackerVoid,
    padding: 5,
  },

  content: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyMonospace,
    color: Palette.textHacker,
  },
});

export function rawMessage(sources: Sources): Sinks {
  const vdom$ = sources.props.map((props) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('raw_msg.title')}),
      h(ScrollView, {style: styles.container}, [
        h(
          Text,
          {style: styles.content, selectable: true},
          JSON.stringify(
            props.msg,
            (key, value) =>
              key === '_$manyverse$metadata' ? undefined : value,
            2,
          ),
        ),
      ]),
    ]),
  );

  const command$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('topbar').events('pressBack'),
    )
    .mapTo({
      type: 'pop',
    } as Command);

  return {
    screen: vdom$,
    navigation: command$,
  };
}

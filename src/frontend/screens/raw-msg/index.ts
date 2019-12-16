/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import isolate from '@cycle/isolate';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import {SSBSource, MsgAndExtras} from '../../drivers/ssb';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {topBar, Sinks as TBSinks} from './top-bar';

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
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },

  container: {
    flex: 1,
    backgroundColor: Palette.backgroundHackerVoid,
    padding: 5,
  },

  content: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.textHacker,
    fontFamily: Typography.fontFamilyMonospace,
  },
});

export function rawMessage(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const vdom$ = xs
    .combine(topBarSinks.screen, sources.props)
    .map(([topBarVDOM, props]) =>
      h(View, {style: styles.screen}, [
        topBarVDOM,
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
    .merge(sources.navigation.backPress(), topBarSinks.back)
    .mapTo({
      type: 'pop',
    } as Command);

  return {
    screen: vdom$,
    navigation: command$,
  };
}

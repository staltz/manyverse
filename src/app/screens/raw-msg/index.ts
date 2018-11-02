/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command, PopCommand, NavSource} from 'cycle-native-navigation';
import {ScrollView, Text, StyleSheet} from 'react-native';
import {Msg} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';

export type Props = {
  msg: Msg;
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
    visible: true,
    drawBehind: false,
    height: Dimensions.toolbarAndroidHeight,
    title: {
      text: 'Raw message',
    },
    backButton: {
      icon: require('../../../../images/icon-arrow-left.png'),
      visible: true,
    },
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.brand.darkVoidBackground,
    padding: 5,
  },

  content: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.brand.darkText,
    fontFamily: Typography.fontFamilyMonospace,
  },
});

export function rawMessage(sources: Sources): Sinks {
  const vdom$ = sources.props.map(props =>
    h(ScrollView, {style: styles.container}, [
      h(
        Text,
        {style: styles.content, selectable: true},
        JSON.stringify(props.msg, null, 2),
      ),
    ]),
  );
  const command$ = sources.navigation.backPress().mapTo(
    {
      type: 'pop',
    } as PopCommand,
  );

  return {
    screen: vdom$,
    navigation: command$,
  };
}

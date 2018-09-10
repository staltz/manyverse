/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

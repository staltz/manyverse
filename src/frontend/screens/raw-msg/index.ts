// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {ScrollView, View, Text, StyleSheet, Platform} from 'react-native';
import {SSBSource} from '../../drivers/ssb';
import {t} from '../../drivers/localization';
import {MsgAndExtras} from '../../ssb/types';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {Dimensions} from '../../global-styles/dimens';
import TopBar from '../../components/TopBar';

export interface Props {
  msg: MsgAndExtras;
}

export interface Sources {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
}

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: Platform.OS === 'web',
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
  },

  content: {
    backgroundColor: Palette.backgroundHackerVoid,
    paddingHorizontal: Dimensions.horizontalSpaceTiny,
    paddingVertical: Dimensions.verticalSpaceTiny,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyMonospace,
    color: Palette.textHacker,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
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

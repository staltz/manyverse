// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {ScrollView, View, StyleSheet, Platform} from 'react-native';
import {SSBSource} from '~frontend/drivers/ssb';
import {t} from '~frontend/drivers/localization';
import {MsgAndExtras} from '~frontend/ssb/types';
import {Dimensions} from '~frontend/global-styles/dimens';
import {globalStyles} from '~frontend/global-styles/styles';
import TopBar from '~frontend/components/TopBar';
import Metadata from '~frontend/components/messages/Metadata';

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
  screen: globalStyles.screen,

  container: globalStyles.containerWithDesktopSideBar,

  content: {
    paddingHorizontal: Dimensions.horizontalSpaceTiny,
    paddingVertical: Dimensions.verticalSpaceTiny,
    borderRadius: 0,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
});

export function rawMessage(sources: Sources): Sinks {
  const vdom$ = sources.props.map((props) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('raw_msg.title')}),
      h(ScrollView, {style: styles.container}, [
        h(Metadata, {style: styles.content, msg: props.msg}),
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

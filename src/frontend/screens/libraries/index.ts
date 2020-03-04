/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement, PureComponent} from 'react';
import {ReactSource, h} from '@cycle/react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import isolate from '@cycle/isolate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../global-styles/palette';
import {topBar, Sinks as TBSinks} from './top-bar';
import librariesData from '../../libraries';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  linking: Stream<string>;
  navigation: Stream<Command>;
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },

  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  header: {
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeNormal,
    color: Palette.textWeak,
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    minHeight: 60,
  },

  itemTitleSubtitleColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },

  itemName: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
    fontWeight: 'bold',
  },

  itemVersion: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
  },

  itemLicense: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.textWeak,
  },
});

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

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

class Dep extends PureComponent<{
  name: string;
  type: 'image' | 'library';
  author?: string;
  version?: string;
  license: string;
  homepage?: string;
  onPress: () => void;
}> {
  public render() {
    const {name, author, version, type, license, onPress} = this.props;

    const touchableProps: any = {onPress, pointerEvents: 'box-only'};
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.SelectableBackground();
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.itemContainer}, [
        h(
          View,
          {style: styles.itemTitleSubtitleColumn},
          type === 'image'
            ? [
                h(Text, [
                  h(Text, {style: styles.itemName}, 'Image ' + name),
                  h(
                    Text,
                    {style: styles.itemVersion},
                    ' is created by ' + author! + ', licensed ' + license,
                  ),
                ]),
              ]
            : [
                h(Text, [
                  h(Text, {style: styles.itemName}, name),
                  h(Text, {style: styles.itemVersion}, ' (' + version! + ')'),
                ]),
                h(Text, {style: styles.itemLicense}, license),
              ],
        ),
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textVeryWeak,
          name: 'open-in-new',
        }),
      ]),
    ]);
  }
}

type DepMetadata =
  | {
      type: 'library';
      name: string;
      version: string;
      license: string;
      homepage: string;
    }
  | {
      type: 'image';
      name: string;
      author: string;
      license: string;
      homepage: string;
    }
  | {
      type: string;
      name: string;
      version?: string;
      author?: string;
      license: string;
      homepage: string;
    };

export default class DepList extends PureComponent<{
  libraries: Array<DepMetadata>;
  onPressLibrary?: (link: string) => void;
}> {
  public render() {
    const {onPressLibrary} = this.props;
    return h(FlatList, {
      ListHeaderComponent: h(
        Text,
        {style: styles.header},
        'Manyverse makes use of the following open source libraries and ' +
          'components. We want to thank the authors of these libraries and ' +
          'link to their websites for appropriate attribution.',
      ),
      data: this.props.libraries,
      keyExtractor: (item: DepMetadata) => item.name,
      renderItem: ({item}: any) =>
        h(Dep, {
          key: item.name,
          name: item.name,
          type: item.type,
          version: item.version,
          author: item.author,
          license: item.license,
          onPress: () => {
            if (item.homepage) onPressLibrary?.(item.homepage);
          },
        }),
    });
  }
}

function intent(
  navSource: NavSource,
  reactSource: ReactSource,
  back$: Stream<any>,
) {
  return {
    goBack$: xs.merge(navSource.backPress(), back$),

    openLink$: reactSource.select('libraries').events('pressLibrary'),
  };
}

export function libraries(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const actions = intent(sources.navigation, sources.screen, topBarSinks.back);

  const vdom$ = topBarSinks.screen.map(topBarVDOM =>
    h(View, {style: styles.screen}, [
      topBarVDOM,
      h(ScrollView, {style: styles.container}, [
        h(DepList, {sel: 'libraries', libraries: librariesData}),
      ]),
    ]),
  );

  const command$ = actions.goBack$.mapTo({
    type: 'pop',
  } as Command);

  return {
    screen: vdom$,
    navigation: command$,
    linking: actions.openLink$,
  };
}

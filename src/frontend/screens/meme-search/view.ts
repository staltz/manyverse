// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import TopBar from '../../components/TopBar';
import {Meme, State} from './model';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import PullFlatList, {PullFlatListProps} from 'pull-flat-list';
import AnimatedLoading from '../../components/AnimatedLoading';
import {t} from '../../drivers/localization';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Palette.voidMain,
  },

  flatList: {
    alignSelf: 'stretch',
    flex: 1,
  },

  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  footer: {
    paddingBottom: 80,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },
});

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

type MemeProps = Meme & {
  onPress: () => void;
};

class MemeItem extends PureComponent<MemeProps> {
  public render() {
    const {name, onPress} = this.props;

    const touchableProps: any = {
      onPress,
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
      },
      `woo image ${name}`,
    );

    return h(
      View,
      {
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'accounts.call_to_action.open_account.accessibility_label',
        ),
      },
      [
        h(Touchable, touchableProps, [
          h(View, {style: styles.row, pointerEvents: 'box-only'}, [
            h(View, {}, [authorNameText]),
          ]),
        ]),
      ],
    );
  }
}

//export interface Props {
//  meme$: GetReadable<Meme>;
//  onPressAccount?: (ev: {name: string}) => void;
//}

export default function view(state$: Stream<State>) {
  const onPressAccount = ({name}: Meme) => console.log('clicked name', name);
  const loading = false;

  return state$.map(({meme$}) => {
    return h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: 'hellooo memes'}),

      h<PullFlatListProps<Meme>>(PullFlatList, {
        getScrollStream: () => meme$,
        keyExtractor: (meme: Meme, idx: number) => meme.name,
        style: styles.flatList,
        initialNumToRender: 14,
        pullAmount: 1,
        numColumns: 1,
        refreshable: true,
        onEndReachedThreshold: 5,
        refreshColors: [Palette.brandWeak],
        //onPullingComplete: this._onPullingComplete,
        ListFooterComponent: loading
          ? h(AnimatedLoading, {text: t('central.loading')})
          : null,
        renderItem: ({item}) => {
          const {name} = item;
          return h<MemeProps>(MemeItem, {
            key: item.name,
            name,
            onPress: () => onPressAccount?.({name}),
          });
        },
      }),
      //h(View, {style: styles.footer}, 'hello!'),
    ]);
  });
}

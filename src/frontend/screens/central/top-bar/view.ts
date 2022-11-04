// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {Fragment, PureComponent, createElement as $} from 'react';
import {
  StyleSheet,
  Platform,
  Animated,
  View,
  ViewStyle,
  Image,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {IconNames} from '~frontend/global-styles/icons';
import HeaderButton from '~frontend/components/HeaderButton';
import Pill from '~frontend/components/Pill';
import {FeedFilter, State} from './model';
import {getImg} from '~frontend/global-styles/utils';

const Touchable = Platform.select<any>({
  ios: TouchableOpacity,
  default: TouchableHighlight,
});

const Z_INDEX = 30;
const APP_LOGO_SIZE = Dimensions.iconSizeBig;
const MENU_BUTTON_SIZE = Dimensions.iconSizeLarge;

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: Z_INDEX,
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.textLine,
    ...Platform.select({
      web: {
        '-webkit-app-region': 'drag',
      },
      android: {
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },

  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
        maxWidth: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  publicRightSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  title: {
    color: Palette.text,
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    ...Platform.select({
      web: {
        marginLeft: 0,
      },
      default: {
        marginLeft: Dimensions.horizontalSpaceLarge,
      },
    }),
  },

  appLogoTouchable: {
    width: MENU_BUTTON_SIZE,
    height: MENU_BUTTON_SIZE,
    borderRadius: MENU_BUTTON_SIZE * 0.5,
    marginLeft: -(MENU_BUTTON_SIZE - APP_LOGO_SIZE) * 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  appLogo: {
    width: APP_LOGO_SIZE,
    height: APP_LOGO_SIZE,
  },

  updateDot: {
    position: 'absolute',
    top: 1,
    right: -1,
    backgroundColor: Palette.backgroundCTA,
    width: Dimensions.dotSize,
    height: Dimensions.dotSize,
    borderRadius: Dimensions.dotSize * 0.5,
  },

  filtersRowContainer: {
    zIndex: Z_INDEX,
    position: 'absolute',
    top: Dimensions.toolbarHeight,
    height: Dimensions.filtersRowHeight,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        alignSelf: 'stretch',
        left: Dimensions.desktopMiddleWidth.px,
        transformOrigin: 'left',
        transform: 'scaleX(-1)',
        justifyContent: 'flex-start',
      } as React.CSSProperties & ViewStyle,
      default: {
        right: 0,
        justifyContent: 'flex-end',
      },
    }),
  },

  filtersRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        // alignSelf: 'flex-end',
        backgroundColor: 'transparent',
        transform: 'scaleX(-1)',
      } as React.CSSProperties & ViewStyle,
    }),
  },

  filtersRowSpacer: {
    height: 1,
    width: Dimensions.horizontalSpaceSmall,
  },
});

function tabTitle(tab: State['currentTab']) {
  if (tab === 'public') {
    return t('central.tab_headers.public');
  }
  if (tab === 'private') {
    return t('central.tab_headers.private');
  }
  if (tab === 'activity') {
    return t('central.tab_headers.activity');
  }
  if (tab === 'connections') {
    return t('central.tab_headers.connections');
  }
  return '';
}

function calcTranslateY(scrollY: Animated.Value, isPublicTab: Animated.Value) {
  if (Platform.OS === 'web') return new Animated.Value(0);
  if (Platform.OS === 'ios') return new Animated.Value(0);
  const minScroll = -getStatusBarHeight(true);
  const clampedScrollY = scrollY.interpolate({
    inputRange: [minScroll, minScroll + 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
  });
  const translateY = Animated.diffClamp(
    clampedScrollY,
    0,
    Dimensions.toolbarHeight - getStatusBarHeight(true),
  );
  return Animated.multiply(isPublicTab, Animated.multiply(translateY, -1));
}

function calcOpacity(scrollY: Animated.AnimatedMultiplication) {
  if (Platform.OS !== 'ios') return new Animated.Value(1);

  return scrollY.interpolate({
    inputRange: [-getStatusBarHeight(true), 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
}

class AppLogoButton extends PureComponent<{onPress?: () => void}> {
  private _onPress = () => {
    this.props.onPress?.();
  };

  public render() {
    return $(
      Touchable,
      {
        style: styles.appLogoTouchable,
        onPress: this._onPress,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: Palette.transparencyDarkWeak,
        activeOpacity: 0.4,
      },

      $(Image, {
        style: styles.appLogo,
        source: getImg(require('~images/app-logo-30.png')),
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t('call_to_action.open_menu.accessibility_label'),
      }),
    );
  }
}

class FiltersRow extends PureComponent<{
  followingOnly: boolean;
  onFilterPress?: (feedFilter: FeedFilter) => void;
}> {
  private _onPressAll = () => {
    this.props.onFilterPress?.('all');
  };

  private _onPressFollowing = () => {
    this.props.onFilterPress?.('following');
  };

  public render() {
    const {followingOnly} = this.props;
    return $(
      View,
      {style: styles.filtersRow},
      $(Pill, {
        onPress: this._onPressAll,
        selected: !followingOnly,
        content: t('central.filters_row.all.label'),
        accessibilityLabel: t('central.filters_row.all.accessibility_label'),
        accessibilityRole: 'button',
      }),
      $(View, {style: styles.filtersRowSpacer}),
      $(Pill, {
        onPress: this._onPressFollowing,
        selected: followingOnly,
        content: t('central.filters_row.following.label'),
        accessibilityLabel: t(
          'central.filters_row.following.accessibility_label',
        ),
        accessibilityRole: 'button',
      }),
    );
  }
}

export default function view(state$: Stream<State>) {
  let hideYWhenScrolling: Animated.AnimatedMultiplication | null = null;
  let hideOpacityWhenScrolling: Animated.AnimatedMultiplication | null = null;
  let isPublicTab = new Animated.Value(1);

  return state$
    .compose(
      dropRepeatsByKeys([
        'scrollHeaderBy',
        'currentTab',
        'hasNewVersion',
        'publicTabFollowingOnly',
      ]),
    )
    .map((state) => {
      isPublicTab.setValue(state.currentTab === 'public' ? 1 : 0);
      // Avoid re-instantiating a new animated value on every stream emission
      if (!hideYWhenScrolling) {
        hideYWhenScrolling = calcTranslateY(state.scrollHeaderBy, isPublicTab);
      }
      if (!hideOpacityWhenScrolling) {
        hideOpacityWhenScrolling = calcOpacity(hideYWhenScrolling);
      }

      const translateY = hideYWhenScrolling;
      const opacity = hideOpacityWhenScrolling;

      const menuButton = h(Animated.View, {key: 'mb', style: {opacity}}, [
        h(AppLogoButton, {key: 'alb', sel: 'menuButton'}),
        state.hasNewVersion
          ? h(View, {key: 'ud', style: styles.updateDot})
          : null,
      ]);

      const title = h(
        Animated.Text,
        {key: 't', style: [styles.title, {opacity}]},
        tabTitle(state.currentTab),
      );

      const rightSide = h(
        Animated.View,
        {
          key: 'rs',
          style: [styles.publicRightSide, {opacity}],
        },
        [
          h(HeaderButton, {
            sel: 'search',
            icon: IconNames.search,
            side: 'right',
            accessibilityLabel: t('public.search.accessibility_label'),
          }),
        ],
      );

      const filtersRow = h(
        View,
        {key: 'fr', style: styles.filtersRowContainer},
        [
          h(FiltersRow, {
            sel: 'filtersRow',
            followingOnly: !!state.publicTabFollowingOnly,
          }),
        ],
      );

      if (state.currentTab === 'public') {
        if (Platform.OS === 'web') {
          return h(Fragment, [
            h(
              Animated.View,
              {
                key: 'tb',
                style: [styles.container, {transform: [{translateY}]}],
              },
              [
                h(View, {key: 'ic', style: styles.innerContainer}, [
                  title,
                  rightSide,
                ]),
              ],
            ),
            filtersRow,
          ]);
        } else {
          return h(
            Animated.View,
            {
              key: 'tb',
              style: [styles.container, {transform: [{translateY}]}],
            },
            [
              h(View, {key: 'ic', style: styles.innerContainer}, [
                menuButton,
                title,
                rightSide,
              ]),
              filtersRow,
            ],
          );
        }
      } else {
        return h(
          Animated.View,
          {
            key: 'tb',
            style: [styles.container, {transform: [{translateY}]}],
          },
          [
            h(View, {key: 'ic', style: styles.innerContainer}, [
              Platform.OS === 'web' ? null : menuButton,
              title,
            ]),
          ],
        );
      }
    });
}

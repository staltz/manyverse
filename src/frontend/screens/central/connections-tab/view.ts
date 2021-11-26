// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableHighlight,
  TextStyle,
  Animated,
  Easing,
} from 'react-native';
import {PureComponent} from 'react';
import {Recommendation, State} from './model';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../../drivers/localization';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';
import {PeerKV} from '../../../ssb/types';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableHighlight,
});

const touchableProps: any = {};
if (Platform.OS === 'android') {
  touchableProps.background = TouchableNativeFeedback.SelectableBackground();
} else {
  touchableProps.underlayColor = Palette.backgroundText;
  touchableProps.activeOpacity = 0.4;
}

const scenarioTitle: TextStyle = {
  marginLeft: Dimensions.horizontalSpaceSmall,
  fontSize: Typography.fontSizeBig,
  lineHeight: Typography.lineHeightBig,
  fontFamily: Typography.fontFamilyReadableText,
  fontWeight: 'bold',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    paddingTop: Dimensions.toolbarHeight,
  },

  innerContainer: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  summaryContainerTouchable: {
    ...Platform.select({
      web: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  summaryContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    ...Platform.select({
      web: {
        flex: 1,
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  summaryAvatars: {
    flex: 1,
    minHeight: Dimensions.avatarSizeNormal,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
  },

  summaryEmpty: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.text,
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  scenarioContainer: {
    marginHorizontal: Dimensions.horizontalSpaceBig,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    marginTop: Dimensions.verticalSpaceLarger,
    marginBottom: Dimensions.verticalSpaceLarge,
  },

  scenarioRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  scenarioTitleOffline: {
    ...scenarioTitle,
    color: Palette.textWeak,
  },

  scenarioTitleBad: {
    ...scenarioTitle,
    color: Palette.textNegative,
  },

  scenarioTitleFair: {
    ...scenarioTitle,
    color: Palette.textWarning,
  },

  scenarioTitleGood: {
    ...scenarioTitle,
    color: Palette.textPositive,
  },

  scenarioDescription: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'normal',
  },

  recommendations: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  recommendationButton: {
    marginTop: Dimensions.verticalSpaceNormal,
  },
});

function Summary({connectedPeers}: {connectedPeers: Array<PeerKV>}) {
  return h(
    Touchable,
    {
      ...touchableProps,
      style: styles.summaryContainerTouchable,
      sel: 'connections-panel',
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: t('connections.open_connections_panel'),
    },
    [
      h(View, {style: styles.summaryContainer, pointerEvents: 'box-only'}, [
        h(
          View,
          {style: styles.summaryAvatars},
          connectedPeers.length > 0
            ? connectedPeers.map((peer) => {
                const url = peer[1]['imageUrl' as any];
                const key = peer[1].key ?? peer[0];
                return h(Avatar, {
                  style: styles.avatar,
                  size: Dimensions.avatarSizeNormal,
                  url,
                  dot: 'connected',
                  key,
                });
              })
            : [
                h(Text, {style: styles.summaryEmpty}, [
                  t('connections.open_connections_panel'),
                ]),
              ],
        ),
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textWeak,
          name: 'dots-horizontal',
        }),
      ]),
    ],
  );
}

class Scenario extends PureComponent<Pick<State, 'status' | 'scenario'>> {
  private appearAnim = new Animated.Value(1);
  private sequenceAnim?: Animated.CompositeAnimation;

  private triggerAppearAnim() {
    this.appearAnim.stopAnimation();
    this.sequenceAnim?.stop();
    this.sequenceAnim = Animated.sequence([
      Animated.timing(this.appearAnim, {
        toValue: 0,
        duration: 10,
        easing: Easing.step0,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(this.appearAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
    this.sequenceAnim.start();
  }

  componentDidUpdate() {
    this.triggerAppearAnim();
  }

  public render() {
    const {status, scenario} = this.props;

    return h(
      Animated.View,
      {style: [styles.scenarioContainer, {opacity: this.appearAnim}]},
      [
        h(View, {style: styles.scenarioRow}, [
          h(Icon, {
            size: Dimensions.iconSizeBig,
            color:
              status === 'bad'
                ? Palette.textNegative
                : status === 'fair'
                ? Palette.textWarning
                : status === 'good'
                ? Palette.textPositive
                : Palette.textWeak,
            name:
              status === 'bad' || status === 'fair'
                ? 'alert-circle-outline'
                : status === 'good'
                ? 'check-bold'
                : 'weather-sunset',
          }),

          h(
            Text,
            {
              style:
                status === 'bad'
                  ? styles.scenarioTitleBad
                  : status === 'fair'
                  ? styles.scenarioTitleFair
                  : status === 'good'
                  ? styles.scenarioTitleGood
                  : styles.scenarioTitleOffline,
            },
            [
              scenario === 'offline-with-content' ||
              scenario === 'offline-without-content'
                ? t('connections.scenarios.offline')
                : scenario === 'nearby-strangers-available' ||
                  scenario === 'knows-no-one' ||
                  scenario === 'empty-rooms'
                ? t('connections.scenarios.not_connected')
                : scenario === 'connected-poorly'
                ? t('connections.scenarios.few_connections')
                : t('connections.scenarios.many_connections'),
            ],
          ),
        ]),
        h(Text, {style: styles.scenarioDescription}, [
          scenario === 'offline-with-content'
            ? t('connections.scenario_descriptions.offline_with_content')
            : scenario === 'offline-without-content'
            ? t('connections.scenario_descriptions.offline_without_content')
            : scenario === 'knows-no-one'
            ? t('connections.scenario_descriptions.knows_no_one')
            : scenario === 'nearby-strangers-available'
            ? t('connections.scenario_descriptions.nearby_strangers_available')
            : scenario === 'empty-rooms'
            ? t('connections.scenario_descriptions.empty_rooms')
            : scenario === 'connected-poorly'
            ? t('connections.scenario_descriptions.connected_poorly')
            : scenario === 'connected-well'
            ? t('connections.scenario_descriptions.connected_well')
            : '',
        ]),
      ],
    );
  }
}

class Recommendations extends PureComponent<
  Pick<State, 'bestRecommendation' | 'otherRecommendations'> & {
    onPressBest?: (rec: Recommendation) => void;
    onPressOthers?: () => void;
  }
> {
  private appearAnim = new Animated.Value(1);
  private sequenceAnim?: Animated.CompositeAnimation;

  private triggerAppearAnim() {
    this.appearAnim.stopAnimation();
    this.sequenceAnim?.stop();
    this.sequenceAnim = Animated.sequence([
      Animated.timing(this.appearAnim, {
        toValue: 0,
        duration: 10,
        easing: Easing.step0,
        useNativeDriver: true,
      }),
      Animated.delay(750),
      Animated.timing(this.appearAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
    this.sequenceAnim.start(() => {
      this.sequenceAnim = void 0;
    });
  }

  componentDidUpdate() {
    this.triggerAppearAnim();
  }

  private onPressBest = () => {
    if (!this.sequenceAnim && this.props.bestRecommendation) {
      this.props.onPressBest?.(this.props.bestRecommendation);
    }
  };

  private onPressOthers = () => {
    if (!this.sequenceAnim) {
      this.props.onPressOthers?.();
    }
  };

  public render() {
    const {bestRecommendation, otherRecommendations} = this.props;

    const bestText =
      bestRecommendation === 'consume-invite'
        ? t('connections.recommendations.consume_invite')
        : bestRecommendation === 'follow-staged-manually'
        ? t('connections.recommendations.follow_staged_manually')
        : bestRecommendation === 'host-ssb-room'
        ? t('connections.recommendations.host_ssb_room')
        : '?';

    return h(
      Animated.View,
      {style: [styles.recommendations, {opacity: this.appearAnim}]},
      [
        bestRecommendation
          ? h(Button, {
              style: styles.recommendationButton,
              strong: true,
              text: bestText,
              accessible: true,
              accessibilityLabel: bestText,
              key: 'best-button',
              onPress: this.onPressBest,
            })
          : null,

        otherRecommendations.length > 0
          ? h(Button, {
              style: styles.recommendationButton,
              text: t('connections.recommendations.others'),
              accessible: true,
              accessibilityLabel: t('connections.recommendations.others'),
              key: 'others-button',
              onPress: this.onPressOthers,
            })
          : null,
      ],
    );
  }
}

export default function view(state$: Stream<State>) {
  return state$
    .compose(
      dropRepeatsByKeys([
        'status',
        'scenario',
        'bestRecommendation',
        'otherRecommendations',
      ]),
    )
    .map((state) => {
      const {status, scenario, bestRecommendation, otherRecommendations} =
        state;
      const connectedPeers = state.peers.filter(
        (p) => p[1].state === 'connected',
      );

      return h(View, {style: styles.container}, [
        h(View, {style: styles.innerContainer}, [
          h(Summary, {connectedPeers}),
          h(Scenario, {status, scenario}),
          h(Recommendations, {
            sel: 'recommendations',
            bestRecommendation,
            otherRecommendations,
          }),
        ]),
      ]);
    });
}

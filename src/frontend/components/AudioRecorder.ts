// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {t} from '~frontend/drivers/localization';
import {getAudioTimeString} from './utils/audio';

const DIAMETER = 80;
const RADIUS = DIAMETER * 0.5;

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    fontSize: Typography.fontSizeLarge,
    color: Palette.text,
    textAlign: 'center',
    marginBottom: Dimensions.verticalSpaceNormal,
    zIndex: 999,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  idleButtonTease: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: RADIUS,
    backgroundColor: Palette.backgroundTextWeak,
    transform: [
      {
        scale: 1.3,
      },
    ],
  },

  idleButtonBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: RADIUS,
    backgroundColor: Palette.backgroundRecord,
  },

  activeButtonTease: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: RADIUS,
    opacity: 0.2,
    backgroundColor: Palette.backgroundRecord,
  },

  activeButtonBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: RADIUS,
    borderColor: Palette.backgroundRecord,
    borderWidth: 5,
    backgroundColor: Palette.backgroundText,
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DIAMETER,
    height: DIAMETER,
    marginBottom: 40,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DIAMETER,
    height: DIAMETER,
    marginBottom: 40,
  },

  icon: {
    ...Platform.select({
      web: {
        zIndex: 100,
      },
    }),
  },
});

const ANIM_DURATION = Platform.OS === 'web' ? 40 : 140;

export interface Props {
  status: 'idle' | 'active' | 'loading';
  recording: number;
  loudness: number;
  onPressStart?: () => void;
  onPressStop?: () => void;
}

export default class AudioPlayer extends PureComponent<Props> {
  private teaseAnim = new Animated.Value(0);

  public componentDidUpdate(prevProps: Props) {
    const prevLoudness = prevProps.loudness;
    const nextLoudness = this.props.loudness;
    const diff = Math.abs(nextLoudness - prevLoudness);
    if (typeof nextLoudness === 'number' && diff >= 0.01) {
      this.teaseAnim.stopAnimation();
      Animated.timing(this.teaseAnim, {
        toValue: 1 + nextLoudness,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }

  private renderIdle() {
    return h(View, {key: 'a'}, [
      h(Text, {key: 'aa', style: styles.text}, ' '),
      h(
        TouchableOpacity,
        {
          key: 'ab',
          style: styles.button,
          activeOpacity: 0.7,
          accessible: true,
          onPress: this.props.onPressStart ?? (() => {}),
          accessibilityRole: 'button',
          accessibilityLabel: t(
            'compose_audio.call_to_action.start_recording.accessibility_label',
          ),
        },
        [
          h(View, {key: 'abax', style: styles.idleButtonTease}),
          h(View, {key: 'abb', style: styles.idleButtonBackground}),
          h(Icon, {
            key: 'abc',
            size: Dimensions.iconSizeLarge,
            color: Palette.textForBackgroundBrand,
            style: styles.icon,
            name: 'microphone',
          }),
        ],
      ),
    ]);
  }

  private renderActive() {
    return h(View, {key: 'a'}, [
      h(
        Text,
        {key: 'aa', style: styles.text},
        getAudioTimeString(this.props.recording),
      ),
      h(
        TouchableOpacity,
        {
          key: 'ab',
          style: styles.button,
          activeOpacity: 0.7,
          accessible: true,
          onPress: this.props.onPressStop ?? (() => {}),
          accessibilityRole: 'button',
          accessibilityLabel: t(
            'compose_audio.call_to_action.stop_recording.accessibility_label',
          ),
        },
        [
          h(Animated.View, {
            key: 'abay',
            style: [
              styles.activeButtonTease,
              {transform: [{scale: this.teaseAnim}]},
            ],
          }),
          h(View, {key: 'abb', style: styles.activeButtonBackground}),
          h(Icon, {
            key: 'abc',
            size: Dimensions.iconSizeLarge,
            color: Palette.backgroundRecord,
            style: styles.icon,
            name: 'stop',
          }),
        ],
      ),
    ]);
  }

  private renderLoading() {
    return h(View, {key: 'a', style: styles.loadingContainer}, [
      h(
        Text,
        {key: 'aa', style: styles.text},
        getAudioTimeString(this.props.recording),
      ),
      h(ActivityIndicator, {
        animating: true,
        size: DIAMETER,
        color: Palette.backgroundRecord,
      }),
    ]);
  }

  public render() {
    if (this.props.status === 'active') {
      return this.renderActive();
    } else if (this.props.status === 'idle') {
      return this.renderIdle();
    } else if (this.props.status === 'loading') {
      return this.renderLoading();
    }
  }
}

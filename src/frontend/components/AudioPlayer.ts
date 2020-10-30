/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  Animated,
  View,
  TouchableOpacity,
  Platform,
  Text,
  TouchableOpacityProps,
  TextProps,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Player,
  MediaStates,
  PlayerError,
} from '@react-native-community/audio-toolkit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../drivers/localization';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {getBreathingComposition} from '../global-styles/animations';

enum PlayState {
  PAUSED = MediaStates.PAUSED,
  PLAYING = MediaStates.PLAYING,
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: Palette.backgroundTextWeak,
    minHeight: 100,
    overflow: 'visible',
    position: 'relative',
  },

  initialLoading: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.backgroundBrandStrong,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  sliderContainer: {
    marginVertical: Dimensions.verticalSpaceBig,
    marginHorizontal: Dimensions.horizontalSpaceBig,
    flexDirection: 'row',
  },

  timeText: {
    alignSelf: 'center',
  },

  slider: {
    flex: 1,
    alignSelf: 'center',
    marginHorizontal: Platform.select({ios: 5}),
  },

  touchable: {
    borderRadius: 3,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceBig,
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Dimensions.verticalSpaceBig,
  },

  controlButtons: {
    marginHorizontal: Dimensions.horizontalSpaceLarge,
  },
});

function convertMillisecondsToSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / 1000);
}

export type Props = {
  src: string;
};

export type State = {
  playState: PlayState;
  elapsed: number;
  elapsedSlider: number;
  duration: number;
  editingSlider: boolean;
  fetchingFile: boolean;
  timer?: number;
};

export default class AudioPlayer extends PureComponent<Props, State> {
  private player: Player | null = null;
  private loadingAnim = new Animated.Value(0);

  state: State = {
    playState: PlayState.PAUSED,
    elapsed: 0,
    elapsedSlider: 0,
    duration: 0,
    editingSlider: false,
    fetchingFile: true,
  };

  public componentDidMount() {
    const breathingAnimation = getBreathingComposition(this.loadingAnim);

    breathingAnimation.start();

    this.player = new Player(this.props.src, {
      autoDestroy: false,
    }).prepare((err: PlayerError | null): void => {
      if (err) console.error(err);
      if (err || !this.player) return;

      const duration = convertMillisecondsToSeconds(
        Math.round(this.player.duration),
      );
      this.setState({duration, fetchingFile: false}, () =>
        breathingAnimation.stop(),
      );
    });
  }

  public componentWillUnmount() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
  }

  private onSliderEditStart = () => {
    this.setState({editingSlider: true});
  };

  private onSliderEditEnd = (value: number) => {
    this.setState({elapsedSlider: value});
    this.player?.seek(value * 1000, () => {
      this.setState({editingSlider: false, elapsed: value});
    });
  };

  private onSliderValueChange = (value: number) => {
    this.setState({editingSlider: true, elapsed: value});
  };

  private play = () => {
    requestAnimationFrame(() => {
      if (!this.player) return;

      const timer = setInterval(() => {
        if (!this.player) return;
        if (
          this.state.playState !== PlayState.PLAYING ||
          this.state.editingSlider
        ) {
          return;
        }

        const currentTime = Math.round(this.player.currentTime);
        const elapsed = convertMillisecondsToSeconds(Math.max(0, currentTime));
        this.setState({elapsed, elapsedSlider: elapsed});
      }, 333);

      this.player.play(() => {
        this.setState({playState: PlayState.PLAYING, timer});
      });
    });
  };

  private pause = () => {
    this.player?.pause(() => this.setState({playState: PlayState.PAUSED}));
  };

  private getAudioTimeString(seconds: number) {
    const secondsPreview = Math.floor(seconds % 60);
    const minutes = Math.floor((seconds / 60) % 60);
    const hours = Math.floor((seconds / 3600) % 24);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${
        secondsPreview < 10 ? '0' + secondsPreview : secondsPreview
      }`;
    }

    return `${minutes}:${
      secondsPreview < 10 ? '0' + secondsPreview : secondsPreview
    }`;
  }

  private renderTimeText(time: number, accessibilityLabel: string) {
    const timeTextProps: TextProps = {
      accessible: true,
      accessibilityRole: 'text',
      style: styles.timeText,
    };

    return h(
      Text,
      {...timeTextProps, accessibilityLabel},
      this.getAudioTimeString(time),
    );
  }

  private renderControlButtons() {
    const touchableProps: TouchableOpacityProps = {
      style: styles.touchable,
      activeOpacity: 0.2,
      accessible: true,
      accessibilityRole: 'button',
    };

    return h(View, {style: styles.controlButtons}, [
      this.state.playState === PlayState.PLAYING
        ? h(
            TouchableOpacity,
            {
              ...touchableProps,
              accessibilityLabel: t('message.audio.pause.accessibility_label'),
              onPress: this.pause,
            },
            [
              h(Icon, {
                size: Dimensions.iconSizeBig,
                color: Palette.backgroundBrandStrong,
                name: 'pause',
              }),
            ],
          )
        : h(
            TouchableOpacity,
            {
              ...touchableProps,
              accessibilityLabel: t('message.audio.play.accessibility_label'),
              onPress: this.play,
            },
            [
              h(Icon, {
                size: Dimensions.iconSizeBig,
                color: Palette.backgroundBrandStrong,
                name: 'play',
              }),
            ],
          ),
    ]);
  }

  public render() {
    return h(View, {style: styles.container}, [
      h(View, {style: styles.sliderContainer}, [
        this.renderTimeText(
          this.state.elapsed,
          t('message.audio.elapsed.accessibility_label'),
        ),

        h(Slider, {
          onSlidingStart: this.onSliderEditStart,
          onSlidingComplete: this.onSliderEditEnd,
          onValueChange: this.onSliderValueChange,
          disabled: this.state.fetchingFile,
          value: this.state.elapsedSlider,
          step: 1,
          minimumValue: 0,
          maximumValue: this.state.duration,
          maximumTrackTintColor: Palette.colors.gray6,
          minimumTrackTintColor: Palette.backgroundBrandWeaker,
          thumbTintColor: Palette.backgroundBrandStrong,
          accessible: true,
          accessibilityRole: 'adjustable',
          accessibilityLabel: t('message.audio.slider.accessibility_label'),
          style: styles.slider,
        }),

        this.renderTimeText(
          this.state.duration,
          t('message.audio.duration.accessibility_label'),
        ),
      ]),

      h(View, {style: styles.controlsContainer}, [
        this.state.fetchingFile
          ? h(
              Animated.Text,
              {
                accessible: true,
                accessibilityRole: 'text',
                accessibilityLabel: t(
                  'message.audio.loading.accessibility_label',
                ),
                style: [styles.initialLoading, {opacity: this.loadingAnim}],
              },
              [t('message.audio.loading.text')],
            )
          : this.renderControlButtons(),
      ]),
    ]);
  }
}

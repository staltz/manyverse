// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  View,
  TouchableOpacity,
  Platform,
  Text,
  TouchableOpacityProps,
  TextProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Player,
  MediaStates,
  PlayerError,
} from '@staltz/react-native-audio-toolkit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../drivers/localization';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {getAudioTimeString} from './utils/audio';

enum PlayState {
  PAUSED = MediaStates.PAUSED,
  PLAYING = MediaStates.PLAYING,
}

const DIAMETER = 40;
const RADIUS = DIAMETER * 0.5;

const styles = StyleSheet.create({
  container: {
    marginTop: Dimensions.verticalSpaceNormal,
    backgroundColor: Palette.backgroundTextWeak,
    minHeight: 60,
    overflow: 'visible',
    position: 'relative',
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeText: {
    alignSelf: 'center',
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
    textAlign: 'center',
    ...Platform.select({
      android: {
        marginBottom: 2,
      },
    }),
  },

  slider: {
    flex: 1,
    alignSelf: 'center',
    marginHorizontal: Platform.select({ios: 5}),
  },

  controlsTouchable: {
    width: DIAMETER,
    height: DIAMETER,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.brandMain,
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  controlButtons: {
    marginRight: Dimensions.horizontalSpaceNormal,
  },
});

function convertMillisecondsToSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / 1000);
}

export interface Props {
  src: string;
  style?: StyleProp<ViewStyle>;
}

export interface State {
  playState: PlayState;
  elapsed: number;
  elapsedSlider: number;
  duration: number;
  editingSlider: boolean;
  fetchingFile: boolean;
  timer?: number;
}

export default class AudioPlayer extends PureComponent<Props, State> {
  private player: Player | null = null;

  state: State = {
    playState: PlayState.PAUSED,
    elapsed: 0,
    elapsedSlider: 0,
    duration: 0,
    editingSlider: false,
    fetchingFile: true,
  };

  public componentDidMount() {
    if (Platform.OS === 'web') return;
    this.player = new Player(this.props.src, {
      autoDestroy: false,
    }).prepare((err: PlayerError | null): void => {
      if (err) console.error(err);
      if (err || !this.player) return;

      const duration = convertMillisecondsToSeconds(
        Math.round(this.player.duration),
      );
      this.setState({duration, fetchingFile: false});

      (this.player as any).on?.('ended', () => {
        this.setState({
          playState: PlayState.PAUSED,
          elapsed: 0,
          elapsedSlider: 0,
          editingSlider: false,
        });
      });
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
    if (!this.player) return;

    if (this.state.timer) clearInterval(this.state.timer);

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
  };

  private pause = () => {
    this.player?.pause(() => this.setState({playState: PlayState.PAUSED}));
  };

  private renderTimeText(time: number, accessibilityLabel: string) {
    const timeTextProps: TextProps = {
      accessible: true,
      accessibilityRole: 'text',
      style: styles.timeText,
    };

    return h(
      Text,
      {...timeTextProps, accessibilityLabel},
      getAudioTimeString(time),
    );
  }

  private renderControlButtons() {
    const touchableProps: TouchableOpacityProps = {
      style: styles.controlsTouchable,
      activeOpacity: 0.7,
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
                color: Palette.textForBackgroundBrand,
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
                color: Palette.textForBackgroundBrand,
                name: 'play',
              }),
            ],
          ),
    ]);
  }

  public render() {
    const extraStyle = this.props.style as ViewStyle;
    return h(View, {style: [styles.container, extraStyle]}, [
      this.state.fetchingFile
        ? h(ActivityIndicator, {
            style: styles.controlButtons,
            animating: true,
            size: DIAMETER,
            color: Palette.brandMain,
          })
        : this.renderControlButtons(),

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
        maximumTrackTintColor: Palette.colors.comet6,
        minimumTrackTintColor: Palette.brandMain,
        thumbTintColor: Palette.brandMain,
        accessible: true,
        accessibilityRole: 'adjustable',
        accessibilityLabel: t('message.audio.slider.accessibility_label'),
        style: styles.slider,
      }),

      this.renderTimeText(
        this.state.duration,
        t('message.audio.duration.accessibility_label'),
      ),
    ]);
  }
}

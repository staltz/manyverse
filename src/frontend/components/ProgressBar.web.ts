// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  bar: {
    transition: 'width 0.25s',
    position: 'absolute',
    top: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as React.CSSProperties & ViewStyle,

  barBrand: {
    backgroundColor: Palette.brandMain,
  },

  barBlank: {
    backgroundColor: Palette.textForBackgroundBrand,
  },

  flare: {
    marginRight: '0%',
    height: '100%',
    width: '9px',
    animationDuration: '1400ms',
    animationDirection: 'normal',
    animationTimingFunction: 'ease-in-out',
    animationKeyframes: [
      {
        '0%': {marginRight: '100%'},
        '100%': {marginRight: '0%'},
      },
    ],
    animationIterationCount: 'infinite',
  } as React.CSSProperties & ViewStyle,

  flareBrand: {
    backgroundColor: Palette.brandWeaker,
  },

  flareBlank: {
    backgroundColor: Palette.brandWeakest,
  },

  flareUndone: {
    opacity: 1,
  },

  flareDone: {
    opacity: 0,
  },

  barUndone: {
    left: 0,
  },

  barDone: {
    right: 0,
  },
});

export interface Props {
  progress: number;
  theme: 'brand' | 'blank';
  width: number | string;
  height: number;
  disappearAt100: boolean;
  appearAnimation?: boolean;
  style?: ViewStyle;
}

const SIDE_CLAMP = '2px';

export default class ProgressBar extends PureComponent<Props> {
  public render() {
    const {progress, theme, disappearAt100} = this.props;
    const totalWidth = this.props.width;
    const progress100 = `${(progress * 100).toFixed(3)}%`;
    let width = '0%';
    if (progress >= 1) {
      if (disappearAt100) width = '0%';
      else width = '100%';
    } else if (progress > 0) {
      width = `clamp(${SIDE_CLAMP}, ${progress100}, ${totalWidth} - ${SIDE_CLAMP})`;
    }
    const height = `${this.props.height}px`;
    const barDoneStyle =
      progress >= 1 && disappearAt100 ? styles.barDone : styles.barUndone;
    const flareDoneStyle =
      progress >= 1 ? styles.flareDone : styles.flareUndone;
    const barTheme = theme === 'brand' ? styles.barBrand : styles.barBlank;
    const flareTheme =
      theme === 'brand' ? styles.flareBrand : styles.flareBlank;

    return $(
      View,
      {
        key: 'p1',
        style: [
          styles.container,
          {width: totalWidth, height},
          this.props.style,
        ],
      },
      $(
        View,
        {
          key: 'p2',
          style: [styles.bar, barTheme, barDoneStyle, {width, height}],
        },
        [
          $(View, {
            key: 'p3',
            style: [styles.flare, flareTheme, flareDoneStyle],
          }),
        ],
      ),
    );
  }
}

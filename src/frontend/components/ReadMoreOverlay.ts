// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Rect, Defs, LinearGradient, Stop} from 'react-native-svg';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

interface Props {
  fadeStartY?: number; // in pixels
  fading?: boolean;
  maxHeight: number; // in pixels
  onPress: () => void;
  width: number; // in pixels
}

export default class ReadMoreOverlay extends PureComponent<Props> {
  private renderReadMore() {
    const {fadeStartY, fading, maxHeight, width} = this.props;

    const randomID = Math.floor(Math.random() * 1000000);

    const svgDefs = h(Defs, [
      h(
        LinearGradient,
        {id: `grad${randomID}`, x1: '0', y1: '0', x2: '0', y2: '1'},
        [
          h(Stop, {
            offset: '0',
            stopColor: Palette.backgroundText,
            stopOpacity: '0',
          }),
          h(Stop, {
            offset: '1',
            stopColor: Palette.backgroundText,
            stopOpacity: '1',
          }),
        ],
      ),
    ]);

    const upperPartition = h(Rect, {
      x: '0',
      y: '0',
      width,
      height: fadeStartY === undefined ? maxHeight * 0.5 : fadeStartY,
      fill: 'rgba(0,0,0,0)',
      strokeWidth: '0',
    });

    const lowerPartition = h(Rect, {
      x: '0',
      width,
      y: fadeStartY === undefined ? maxHeight * 0.5 : fadeStartY,
      height:
        fadeStartY === undefined ? maxHeight * 0.5 : maxHeight - fadeStartY,
      fill: fading ? `url(#grad${randomID})` : 'rgba(0,0,0,0)',
      strokeWidth: '0',
    });

    return h(View, {style: styles.readMoreContainer}, [
      h(Svg, {width, height: '100%'}, [
        fading ? svgDefs : null,
        upperPartition,
        lowerPartition,
      ]),
    ]);
  }

  public render() {
    const {children, maxHeight, onPress} = this.props;

    return h(
      Touchable,
      {
        onPress,
        pointerEvent: 'box-only',
        background:
          Platform.OS === 'android'
            ? TouchableNativeFeedback.SelectableBackground()
            : undefined,
      },
      [
        h(View, {style: [styles.container, {maxHeight}]}, [
          children,
          this.renderReadMore(),
        ]),
      ],
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: Dimensions.verticalSpaceNormal,
    overflow: 'hidden',
    flex: 1,
  },
  readMoreContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

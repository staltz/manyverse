/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Component} from 'react';
import {h} from '@cycle/react';
import {Animated, Easing, View, StyleProp, ViewStyle} from 'react-native';

const INDETERMINATE_WIDTH_FACTOR = 0.3;
const BAR_WIDTH_ZERO_POSITION =
  INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR);

export type Props = {
  color: string;
  width?: number;
  height: number;
  style?: StyleProp<ViewStyle>;
};

export type State = {
  width: number;
  progress: any;
  animationValue: any;
};

export default class IndeterminateBar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: 20,
      progress: new Animated.Value(INDETERMINATE_WIDTH_FACTOR),
      animationValue: new Animated.Value(BAR_WIDTH_ZERO_POSITION),
    };
  }

  public componentDidMount() {
    this.animate();
  }

  private animate() {
    this.state.animationValue.setValue(0);
    Animated.timing(this.state.animationValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver: true,
    }).start(endState => {
      if (endState.finished) {
        this.animate();
      }
    });
  }

  private handleLayout = (event: any) => {
    if (
      !this.props.width &&
      event &&
      event.nativeEvent &&
      event.nativeEvent.layout &&
      event.nativeEvent.layout.width
    ) {
      this.setState({width: event.nativeEvent.layout.width});
    }
  };

  public render() {
    const {color, width, height, style} = this.props;
    const dartWidth = Math.max(0, width || this.state.width);
    const containerStyle = {width, overflow: 'hidden'};
    const dartStyle = {
      backgroundColor: color,
      height,
      transform: [
        {
          translateX: this.state.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [dartWidth * -INDETERMINATE_WIDTH_FACTOR, dartWidth],
          }),
        },
        {
          translateX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [dartWidth / -2, 0],
          }),
        },
        {
          scaleX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.0001, 1],
          }),
        },
      ],
    };

    return h(
      View,
      {
        style: [containerStyle, style] as Array<ViewStyle>,
        onLayout: this.handleLayout,
      },
      [h(Animated.View, {style: dartStyle})],
    );
  }
}

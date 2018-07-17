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

import {PureComponent} from 'react';
import {
  View,
  Animated,
  StyleProp,
  Easing,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {h} from '@cycle/react';

export const styles = StyleSheet.create({
  container: {
    width: 14,
    height: 14,
  },

  core: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 7,
  },
});

export default class Beacon extends PureComponent<{
  color: string;
  style: StyleProp<ViewStyle>;
}> {
  public state = {
    anim: new Animated.Value(0),
  };

  public componentDidMount() {
    (Animated as any)
      .loop(
        Animated.timing(this.state.anim, {
          toValue: 1,
          duration: 2000 + 600 * Math.random(),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      )
      .start();
  }

  public render() {
    return h(View, {style: [styles.container, this.props.style]}, [
      h(View, {style: [styles.core, {backgroundColor: this.props.color}]}),
      h(Animated.View, {
        style: [
          styles.core,
          {
            opacity: this.state.anim.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 0, 0],
            }),
            transform: [
              {
                scale: this.state.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.7],
                }),
              },
            ],
            backgroundColor: this.props.color,
          },
        ],
      }),
    ]);
  }
}

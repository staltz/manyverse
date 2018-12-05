/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {
  View,
  Text,
  RegisteredStyle,
  TouchableNativeFeedback,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {Palette} from '../global-styles/palette';
import {h} from '@cycle/react';
import {baseContainerStyle, baseTextStyle} from './Button';

export const styles = StyleSheet.create({
  container: {
    ...baseContainerStyle,
    backgroundColor: 'transparent',
    borderColor: Palette.backgroundBrand,
    borderWidth: 1,
  },

  containerMaybe: {
    ...baseContainerStyle,
    backgroundColor: Palette.backgroundVoidStronger,
  },

  containerToggled: {
    ...baseContainerStyle,
    backgroundColor: Palette.backgroundBrand,
  },

  text: {
    ...baseTextStyle,
    color: Palette.textBrand,
  },

  textToggled: {
    ...baseTextStyle,
    color: Palette.foregroundBrand,
  },
});

export type Props = {
  toggled: boolean;
  text: string;
  onPress?: (toggle: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export type State = {
  toggled: 'no' | 'maybe' | 'yes';
};

export default class ToggleButton extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    if (props.toggled) {
      this.state = {toggled: 'yes'};
    } else {
      this.state = {toggled: 'no'};
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.toggled) {
      this.setState(() => ({toggled: 'yes'}));
    } else {
      this.setState(() => ({toggled: 'no'}));
    }
  }

  private _onPress() {
    const toggled = this.state.toggled;
    this.setState(() => ({toggled: 'maybe'}));
    const onPress = this.props.onPress;
    if (toggled !== 'maybe' && onPress) {
      setTimeout(() => {
        onPress(toggled === 'no' ? true : false);
      });
    }
  }

  public render() {
    const {text, style} = this.props;
    const {toggled} = this.state;

    let containerStyle: RegisteredStyle<any> = styles.container;
    if (toggled === 'maybe') {
      containerStyle = styles.containerMaybe;
    } else if (toggled === 'yes') {
      containerStyle = styles.containerToggled;
    }

    let textStyle = styles.text;
    if (toggled === 'maybe' || toggled === 'yes') {
      textStyle = styles.textToggled;
    }

    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: () => this._onPress(),
    };

    return h(TouchableNativeFeedback, touchableProps, [
      h(View, {style: [containerStyle, style]}, [
        h(Text, {style: textStyle}, text),
      ]),
    ]);
  }
}

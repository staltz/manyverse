/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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
    borderColor: Palette.brand.background,
    borderWidth: 1,
  },

  containerMaybe: {
    ...baseContainerStyle,
    backgroundColor: Palette.gray6,
  },

  containerToggled: {
    ...baseContainerStyle,
    backgroundColor: Palette.brand.background,
  },

  text: {
    ...baseTextStyle,
    color: Palette.brand.background,
  },

  textToggled: {
    ...baseTextStyle,
    color: Palette.white,
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

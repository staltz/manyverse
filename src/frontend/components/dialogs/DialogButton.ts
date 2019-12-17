/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    minHeight: 48,
    ...Platform.select({
      ios: {
        justifyContent: 'center',
        borderTopColor: Palette.backgroundTextWeak,
        borderTopWidth: 1,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
      },
      android: {
        justifyContent: 'flex-end',
      },
    }),
  },

  text: {
    color: Palette.textBrand,
    textAlignVertical: 'center',
    fontWeight: Platform.select({ios: 'normal', default: 'bold'}),
    fontSize: Typography.fontSizeBig,
    textAlign: Platform.select({ios: 'center', android: 'right'}),
  },
});

export type Props = {
  text: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
};

export default class Button extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const props = this.props;
    return nextProps.text !== props.text;
  }

  public render() {
    const {text, accessible, accessibilityLabel} = this.props;

    const touchableProps: any = {
      onPress: () => {
        if (this.props.onPress) {
          this.props.onPress();
        }
      },
      accessible,
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        Palette.transparencyDarkStrong,
      );
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.container}, [h(Text, {style: styles.text}, text)]),
    ]);
  }
}

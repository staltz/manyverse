// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TextStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {Dimensions} from '~frontend/global-styles/dimens';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const baseContainerStyle = {
  borderTopLeftRadius: 3,
  borderTopRightRadius: 3,
  borderBottomLeftRadius: 3,
  borderBottomRightRadius: 3,
  paddingHorizontal: Dimensions.horizontalSpaceNormal,
  paddingVertical: Dimensions.verticalSpaceSmall,
};

export const baseTextStyle: TextStyle = {
  fontSize: Typography.fontSizeNormal,
  lineHeight: Typography.lineHeightNormal,
  textAlign: 'center',
  fontWeight: 'bold',
};

export const styles = StyleSheet.create({
  container: {
    ...baseContainerStyle,
    backgroundColor: 'transparent',
    borderColor: Palette.brandMain,
    borderWidth: 1,
  },

  containerMaybe: {
    ...baseContainerStyle,
    backgroundColor: Palette.voidStronger,
  },

  containerToggled: {
    ...baseContainerStyle,
    backgroundColor: Palette.brandMain,
  },

  text: {
    ...baseTextStyle,
    color: Palette.textBrand,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  textToggled: {
    ...baseTextStyle,
    color: Palette.textForBackgroundBrand,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },
});

export interface Props {
  toggled: boolean;
  text: string;
  onPress?: (toggle: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export interface State {
  toggled: 'no' | 'maybe' | 'yes';
}

export default class ToggleButton extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    if (props.toggled) {
      this.state = {toggled: 'yes'};
    } else {
      this.state = {toggled: 'no'};
    }
  }

  static getDerivedStateFromProps(nextProps: Props) {
    if (nextProps.toggled) {
      return {toggled: 'yes'};
    }

    return null;
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

  componentDidUpdate(prevProps: Props) {
    if (prevProps.toggled !== this.props.toggled) {
      this.setState({toggled: this.props.toggled ? 'yes' : 'no'});
    }
  }

  public render() {
    const {text, style} = this.props;
    const {toggled} = this.state;

    let containerStyle: ViewStyle = styles.container;
    if (toggled === 'maybe') {
      containerStyle = styles.containerMaybe;
    } else if (toggled === 'yes') {
      containerStyle = styles.containerToggled;
    }

    let textStyle = styles.text;
    if (toggled === 'maybe' || toggled === 'yes') {
      textStyle = styles.textToggled;
    }

    const touchableProps: any = {
      onPress: () => this._onPress(),
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }
    const viewProps = {
      style: [containerStyle, style],
      pointerEvents: 'box-only' as const,
    };

    return h(Touchable, touchableProps, [
      h(View, viewProps, [h(Text, {style: textStyle}, text)]),
    ]);
  }
}

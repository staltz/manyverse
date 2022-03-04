// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $, RefObject, createRef} from 'react';
import {View, StyleSheet, ViewStyle, Platform, UIManager} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';

const card: ViewStyle = {
  flex: 1,
  paddingHorizontal: Dimensions.horizontalSpaceBig,
  paddingVertical: Dimensions.verticalSpaceBig,
  marginBottom: 1,
  flexDirection: 'column',
  alignItems: 'stretch',
  ...Platform.select({
    web: {
      width: Dimensions.desktopMiddleWidth.px,
      outlineStyle: 'none',
    },
  }),
};

export const styles = StyleSheet.create({
  readCard: {
    ...card,
    backgroundColor: Palette.backgroundText,
  },

  unreadCard: {
    ...card,
    backgroundColor: Palette.backgroundTextBrand,
  },
});

interface Props {
  style?: any;
  unread?: boolean;

  /**
   * This hack is for issue #1784. We need to *focus* a child component in the
   * FullThread's FlatList in order to allow it to receive `keydown` events in
   * VirtualizedList (see our react-native-web patch file). We chose to focus
   * this MessageContainer because we don't want any scroll to happen onFocus,
   * and the first message's MessageContainer is positioned exactly at the
   * default scroll position.
   *
   * I know, this is a very dirty hack, but it's the only way to do it. I would
   * gladly accept a PR to make this cleaner.
   */
  webFocusHack?: boolean;
}

interface State {
  focused: boolean;
}

export default class MessageContainer extends PureComponent<Props, State> {
  private ref: RefObject<View> = createRef();

  constructor(props: Props) {
    super(props);
    this.state = {focused: false};
  }

  private onLayout = () => {
    if (Platform.OS === 'web' && !this.state.focused) {
      setTimeout(() => {
        if (this.ref?.current) {
          (UIManager as any).focus(this.ref.current);
          this.setState({focused: true});
        }
      }, 50);
    }
  };

  public render() {
    const {style, children, unread, webFocusHack} = this.props;
    return $(
      View,
      {
        ref: this.ref,
        style: [unread ? styles.unreadCard : styles.readCard, style],
        onLayout: webFocusHack ? this.onLayout : undefined,
      },
      children,
    );
  }
}

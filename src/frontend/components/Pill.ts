// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {
  AccessibilityRole,
  Platform,
  Text,
  View,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {Dimensions} from '~frontend/global-styles/dimens';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceTiny,
    borderRadius: 50,
    backgroundColor: Palette.backgroundText,
    borderColor: Palette.textVeryWeak,
    borderWidth: 1,
  },

  containerSelected: {
    backgroundColor: Palette.backgroundText,
    borderColor: Palette.textBrand,
    borderWidth: 1,
  },

  containerHovered: {
    backgroundColor: Palette.backgroundTextWeak,
  },

  textContainer: {
    flexDirection: 'row',
    flex: Platform.OS === 'web' ? 1 : 0,
    justifyContent: 'center',
    // Needed for mobile for now, probably a smarter way of preventing overflow
    maxWidth: 200,
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },

  text: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.textWeak,
  },

  textSelected: {
    color: Palette.textBrand,
    fontWeight: 'bold',
  },
});

interface Props {
  content: string;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

export default class Pill extends PureComponent<Props> {
  public render() {
    const {content, onPress, selected, accessibilityLabel, accessibilityRole} =
      this.props;

    return h(
      Pressable,
      {
        style: ({pressed, hovered}: {pressed: boolean; hovered?: boolean}) => [
          styles.container,
          selected && styles.containerSelected,
          (hovered || pressed) && styles.containerHovered,
        ],
        accessibilityLabel,
        accessibilityRole,
        onPress,
      },
      [
        h(View, {style: styles.textContainer}, [
          h(
            Text,
            {
              numberOfLines: 2,
              style: [styles.text, selected && styles.textSelected],
            },
            content,
          ),
        ]),
      ],
    );
  }
}

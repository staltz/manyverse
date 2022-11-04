// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {IconNames} from '~frontend/global-styles/icons';
import Avatar from '~frontend/components/Avatar';
import {State} from './model';
import {styles} from './styles';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

interface MenuItemProps {
  icon: string;
  text: string;
  callToAction?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
}

class MenuItem extends PureComponent<MenuItemProps> {
  public render() {
    const {icon, text, callToAction, accessibilityLabel} = this.props;
    const touchableProps: any = {
      onPress: () => {
        this.props.onPress?.();
      },
      accessible: true,
      accessibilityRole: 'menuitem',
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        Palette.voidMain,
        false,
      );
    }

    const containerStyle = [
      styles.menuItemContainer,
      callToAction ? styles.menuItemContainerCTA : null,
    ];

    const textStyle = [
      styles.menuItemText,
      callToAction ? styles.menuItemTextCTA : null,
    ];

    const iconColor = callToAction
      ? Palette.textForBackgroundBrand
      : Palette.textWeak;

    return h(Touchable, touchableProps, [
      h(View, {style: containerStyle, pointerEvents: 'box-only'}, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: iconColor,
          name: icon,
        }),
        h(Text, {style: textStyle}, text),
      ]),
    ]);
  }
}

export default function view(state$: Stream<State>): Stream<ReactElement<any>> {
  return state$
    .compose(
      dropRepeatsByKeys([
        'selfFeedId',
        'selfAvatarUrl',
        'name',
        'canPublishSSB',
        'hasNewVersion',
      ]),
    )
    .map((state) =>
      h(View, {style: styles.container}, [
        h(
          TouchableHighlight,
          {
            sel: 'header',
            underlayColor: Palette.backgroundTextWeakStrong,
            activeOpacity: 0.5,
          },
          [
            h(View, {style: styles.header}, [
              h(Avatar, {
                style: styles.authorImage,
                size: Dimensions.avatarSizeNormal,
                url: state.selfAvatarUrl,
              }),

              h(
                Text,
                {
                  style: styles.authorName,
                  numberOfLines: 1,
                  ellipsizeMode: 'middle',
                },
                state.name ?? '',
              ),

              h(
                Text,
                {
                  style: styles.authorId,
                  numberOfLines: 1,
                  ellipsizeMode: 'middle',
                },
                state.selfFeedId,
              ),
            ]),
          ],
        ),

        h(ScrollView, {style: null}, [
          state.canPublishSSB
            ? h(MenuItem, {
                sel: 'self-profile',
                icon: IconNames.myProfile,
                text: t('drawer.menu.my_profile.label'),
                accessibilityLabel: t(
                  'drawer.menu.my_profile.accessibility_label',
                ),
              })
            : null,
          h(MenuItem, {
            sel: 'raw-db',
            icon: IconNames.rawDatabase,
            text: t('drawer.menu.raw_database.label'),
            accessibilityLabel: t(
              'drawer.menu.raw_database.accessibility_label',
            ),
          }),
          h(MenuItem, {
            sel: 'bug-report',
            icon: IconNames.emailBugReport,
            text: t('drawer.menu.email_bug_report.label'),
            accessibilityLabel: t(
              'drawer.menu.email_bug_report.accessibility_label',
            ),
          }),
          h(MenuItem, {
            sel: 'translate',
            icon: IconNames.contributeTranslations,
            text: t('drawer.menu.translate.label'),
            accessibilityLabel: t('drawer.menu.translate.accessibility_label'),
          }),
          state.hasNewVersion
            ? h(MenuItem, {
                sel: 'new-version',
                icon: IconNames.versionUpdate,
                callToAction: true,
                text: t('drawer.menu.update.label'),
                accessibilityLabel: t('drawer.menu.update.accessibility_label'),
              })
            : null,
          h(MenuItem, {
            sel: 'settings',
            icon: IconNames.settings,
            text: t('drawer.menu.settings.label'),
            accessibilityLabel: t('drawer.menu.settings.accessibility_label'),
          }),
        ]),
      ]),
    );
}

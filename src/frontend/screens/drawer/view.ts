// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
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
import {Bar as ProgressBar} from 'react-native-progress';
import {h} from '@cycle/react';
import {t} from '~frontend/drivers/localization';
import LocalizedHumanTime from '~frontend/components/LocalizedHumanTime';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
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

class Syncing extends PureComponent<{
  label: string;
  progress: number;
  timeRemaining: number;
}> {
  public render() {
    const {label, progress, timeRemaining} = this.props;
    const progressPretty = `${(progress * 100).toFixed(1)}%`;

    return h(View, {style: styles.syncingContainer}, [
      h(Text, {style: styles.syncingText}, `${label} (${progressPretty})`),
      h(ProgressBar as any, {
        animated: false,
        progress: Math.max(0.01, progress), // at least 1%
        color: Palette.brandMain,
        unfilledColor: Palette.transparencyDark,
        borderWidth: 0,
        width: 250,
        height: 6,
      }),
      timeRemaining > 60e3
        ? h(Text, {style: styles.syncingEstimateText}, [
            t('drawer.menu.ready_estimate.label'),
            ' ',
            h(LocalizedHumanTime, {time: Date.now() + timeRemaining}),
          ])
        : null,
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
        'combinedProgress',
        'estimateProgressDone',
      ]),
    )
    .map((state) =>
      h(View, {style: styles.container}, [
        h(
          TouchableHighlight,
          {sel: 'header', underlayColor: Palette.brandMain, activeOpacity: 0.5},
          [
            h(View, {style: styles.header}, [
              h(Avatar, {
                style: styles.authorImage,
                size: Dimensions.avatarSizeNormal,
                backgroundColor: Palette.brandStrong,
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
                icon: 'account-circle',
                text: t('drawer.menu.my_profile.label'),
                accessibilityLabel: t(
                  'drawer.menu.my_profile.accessibility_label',
                ),
              })
            : null,
          h(MenuItem, {
            sel: 'raw-db',
            icon: 'database',
            text: t('drawer.menu.raw_database.label'),
            accessibilityLabel: t(
              'drawer.menu.raw_database.accessibility_label',
            ),
          }),
          h(MenuItem, {
            sel: 'bug-report',
            icon: 'email-alert',
            text: t('drawer.menu.email_bug_report.label'),
            accessibilityLabel: t(
              'drawer.menu.email_bug_report.accessibility_label',
            ),
          }),
          h(MenuItem, {
            sel: 'translate',
            icon: 'translate',
            text: t('drawer.menu.translate.label'),
            accessibilityLabel: t('drawer.menu.translate.accessibility_label'),
          }),
          state.hasNewVersion
            ? h(MenuItem, {
                sel: 'new-version',
                icon: 'update',
                callToAction: true,
                text: t('drawer.menu.update.label'),
                accessibilityLabel: t('drawer.menu.update.accessibility_label'),
              })
            : null,
          h(MenuItem, {
            sel: 'settings',
            icon: 'cog',
            text: t('drawer.menu.settings.label'),
            accessibilityLabel: t('drawer.menu.settings.accessibility_label'),
          }),
          state.combinedProgress > 0 && state.combinedProgress < 1
            ? h(Syncing, {
                label: t('drawer.menu.preparing_database.label'),
                progress: state.combinedProgress,
                timeRemaining: state.estimateProgressDone,
              })
            : null,
        ]),
      ]),
    );
}

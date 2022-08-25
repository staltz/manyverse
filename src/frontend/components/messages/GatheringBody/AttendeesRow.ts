// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '~frontend/components/Avatar';
import ToggleButton from '~frontend/components/ToggleButton';
import {withTitle} from '~frontend/components/withTitle';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {IconNames} from '~frontend/global-styles/icons';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {GatheringAttendees} from '~frontend/ssb/types';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

interface Props {
  attendees: GatheringAttendees;
  /** Is the current user attending to the gathering */
  isAttending: boolean;
  onPressRow?: (attendees: GatheringAttendees) => void;
  onPressAttend?: (isAttending: boolean) => void;
}

// The amount of horizontal space taken up by the avatar and
// its margins + paddings
const TRUE_AVATAR_WIDTH =
  Dimensions.avatarSizeSmall + Dimensions.horizontalSpaceTiny;

export default class AttendeesRow extends PureComponent<
  Props,
  {avatarsContainerWidth?: number}
> {
  constructor(props: Props) {
    super(props);
    this.state = {avatarsContainerWidth: undefined};
  }

  private onLayout = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    this.setState({avatarsContainerWidth: layout.width});
  };

  public render() {
    const {attendees, onPressRow, onPressAttend, isAttending} = this.props;
    const {avatarsContainerWidth} = this.state;

    const maxNumberToRender = avatarsContainerWidth
      ? Math.floor(avatarsContainerWidth / TRUE_AVATAR_WIDTH) - 1
      : undefined;

    const attendeesToRender =
      maxNumberToRender !== undefined
        ? (maxNumberToRender > 0
            ? attendees.slice(0, maxNumberToRender)
            : attendees
          ).map(({feedId, name, avatarUrl}) =>
            h(withTitle(View), {title: name ?? '', key: feedId}, [
              h(Avatar, {
                url: avatarUrl,
                style: styles.avatar,
                size: Dimensions.avatarSizeSmall,
              }),
            ]),
          )
        : null;

    const isOverflowing =
      maxNumberToRender !== undefined && attendees.length > maxNumberToRender;

    return h(View, {style: styles.attendeesContainer}, [
      onPressAttend
        ? h(ToggleButton, {
            style: styles.attendingButton,
            toggled: isAttending,
            text: t(
              isAttending
                ? 'message.gatherings.call_to_action.attending'
                : 'message.gatherings.call_to_action.attend',
            ),
            onPress: onPressAttend,
          })
        : undefined,
      h(
        withTitle(Touchable),
        {
          onLayout: this.onLayout,
          background:
            Platform.OS === 'android'
              ? TouchableNativeFeedback.SelectableBackground()
              : undefined,
          style: styles.attendeesTouchable,
          onPress: () => onPressRow?.(attendees),
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: t(
            'message.gatherings.call_to_action.showAllAttendees.accessibility_label',
          ),
        },
        [
          h(View, {style: styles.attendeesTouchableInnerContainer}, [
            attendeesToRender,
            isOverflowing &&
              h(Icon, {
                size: Dimensions.iconSizeNormal,
                color: Palette.textWeak,
                name: IconNames.etc,
              }),
          ]),
        ],
      ),
    ]);
  }
}

const styles = StyleSheet.create({
  attendeesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: Dimensions.verticalSpaceLarge,
  },
  attendeesTouchable: {
    flexDirection: 'row',
    flex: 1,
  },
  attendeesTouchableInnerContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  attendingButton: {
    marginRight: Dimensions.verticalSpaceNormal,
  },
  avatar: {
    marginRight: Dimensions.horizontalSpaceTiny,
  },
  attendingOverflowEllipsis: {
    fontSize: Typography.fontSizeLarger,
    color: Palette.textWeak,
  },
});

// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  Dimensions,
  ImageBackground,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback as Touchable,
  View,
} from 'react-native';
import ImageView from '@staltz/react-native-image-viewing';
import Markdown from '~frontend/components/Markdown';
import {t} from '~frontend/drivers/localization';
import {Dimensions as Dimens} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import i18n = require('i18n-js');
import {GatheringAttendees, GatheringInfo} from '~frontend/ssb/types';
import {Images} from '~frontend/global-styles/images';
import {blobIdToUrl} from '~frontend/ssb/utils/from-ssb';
import AttendeesRow from './AttendeesRow';
import {withTitle} from '../../withTitle';

const pictureIcon = Palette.isDarkTheme
  ? Images.calendar256Dark
  : Images.calendar256;

const ASPECT_RATIO = 768 / 1024;

// On initial startup, the streams that provide the gathering info and attendees
// can potentially return `null`. Since this component is used in the public
// tab, it unforunately needs to account for this.
interface Props {
  attendees: GatheringAttendees | null;
  gatheringInfo: GatheringInfo | null;
  onBannerLayout?: (event: LayoutChangeEvent) => void;
  onPressAttend?: (isAttending: boolean) => void;
  onPressAttendeeList?: (attendeeList: GatheringAttendees) => void;
  selfFeedId: string;
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'relative',
    marginTop: Dimens.verticalSpaceNormal,
  },

  bold: {
    fontWeight: 'bold',
  },

  titlePill: {
    marginLeft: Dimens.horizontalSpaceBig,
    marginTop: Dimens.verticalSpaceBig,
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimens.borderRadiusBig,
    ...Platform.select({
      web: {
        paddingHorizontal: Dimens.horizontalSpaceNormal,
        paddingVertical: Dimens.verticalSpaceNormal,
      },
      default: {
        paddingHorizontal: Dimens.horizontalSpaceSmall,
        paddingVertical: Dimens.verticalSpaceSmall,
      },
    }),
  },

  titleText: {
    fontSize: Typography.fontSizeLarger,
    lineHeight: Typography.lineHeightLarger,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
  },

  dateInfoContainer: {
    marginBottom: Dimens.verticalSpaceBig,
    marginLeft: Dimens.horizontalSpaceBig,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  bannerImage: {
    backgroundColor: Palette.voidWeak,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  bannerTouchable: {
    flex: 1,
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },

  datePillBasic: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimens.borderRadiusBig,
    ...Platform.select({
      web: {
        width: 80,
        height: 80,
        paddingHorizontal: Dimens.horizontalSpaceNormal,
        paddingVertical: Dimens.verticalSpaceNormal,
      },
      default: {
        width: 72,
        height: 72,
        paddingHorizontal: Dimens.horizontalSpaceSmall,
        paddingVertical: Dimens.verticalSpaceSmall,
      },
    }),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  datePillBasicPlaceholder: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimens.borderRadiusBig,
    ...Platform.select({
      web: {
        width: 80,
        height: 80,
        paddingHorizontal: Dimens.horizontalSpaceNormal,
        paddingVertical: Dimens.verticalSpaceNormal,
      },
      default: {
        width: 72,
        height: 72,
        paddingHorizontal: Dimens.horizontalSpaceSmall,
        paddingVertical: Dimens.verticalSpaceSmall,
      },
    }),
  },

  datePillFull: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimens.borderRadiusBig,
    ...Platform.select({
      web: {
        paddingHorizontal: Dimens.horizontalSpaceNormal,
        paddingVertical: Dimens.verticalSpaceNormal,
      },
      default: {
        paddingHorizontal: Dimens.horizontalSpaceSmall,
        paddingVertical: Dimens.verticalSpaceSmall,
      },
    }),
  },

  dateText: {
    color: Palette.text,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightBig, // not "large", intentionally
    textAlign: 'center',
  },

  dateOrTimeText: {
    color: Palette.text,
  },

  dateOrTimeTextWeak: {
    color: Palette.textWeak,
  },

  timePill: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimens.borderRadiusBig,
    ...Platform.select({
      web: {
        marginLeft: Dimens.horizontalSpaceLarge,
        paddingHorizontal: Dimens.horizontalSpaceNormal,
        paddingVertical: Dimens.verticalSpaceNormal,
      },
      default: {
        marginLeft: Dimens.horizontalSpaceNormal,
        paddingHorizontal: Dimens.horizontalSpaceSmall,
        paddingVertical: Dimens.verticalSpaceSmall,
      },
    }),
  },

  bodyTextContainer: {
    marginBottom: Dimens.verticalSpaceBig,
    borderTopColor: Palette.textLine,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Dimens.verticalSpaceNormal,
  },
});

export default class GatheringBody extends PureComponent<Props> {
  public render() {
    const {
      attendees,
      gatheringInfo,
      onBannerLayout,
      onPressAttend,
      onPressAttendeeList,
      selfFeedId,
    } = this.props;

    if (gatheringInfo) {
      return h(View, {key: 'gb'}, [
        h(Banner, {key: 'ba', gatheringInfo, onBannerLayout}),
        renderAttendeesRow({
          attendees: attendees ?? [],
          onPressAttend,
          selfFeedId,
          onPressAttendeeList,
        }),
        renderDescription(gatheringInfo.description),
      ]);
    } else {
      return h(View, {key: 'pgb'}, [
        renderPlaceholderBanner(onBannerLayout),
        renderAttendeesRow({attendees: [], selfFeedId}),
        renderDescription(''),
      ]);
    }
  }
}

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

function emptyStringOfSize(n: number): string {
  return Array(n + 1).join(' ');
}

function renderPlaceholderBanner(
  onBannerLayout?: (event: LayoutChangeEvent) => void,
) {
  return h(
    View,
    {
      key: 'placeholderB',
      onLayout: onBannerLayout,
      style: styles.bannerContainer,
    },
    [
      h(
        ImageBackground,
        {
          key: 'placeholderIMGBG',
          source: pictureIcon,
          resizeMode: 'center',
          style: [styles.bannerImage, {...getBannerImageDimensions()}],
        },
        [
          h(View, {style: styles.titlePill}, [
            h(
              Text,
              {key: 'title', style: styles.titleText},
              emptyStringOfSize(Platform.OS === 'web' ? 50 : 30),
            ),
          ]),
          h(View, {style: styles.bannerTouchable}),
          h(View, {style: styles.dateInfoContainer}, [
            h(View, {style: styles.datePillBasicPlaceholder}),
            h(View, {style: styles.timePill}, [
              h(
                Text,
                {style: styles.dateOrTimeText},
                emptyStringOfSize(Platform.OS === 'web' ? 20 : 15),
              ),
            ]),
          ]),
        ],
      ),
    ],
  );
}

function renderBasicDatePill(startDate: Date) {
  const fullDate = startDate.toLocaleDateString(i18n.locale, {
    weekday: 'long',
    day: 'numeric',
    year: 'numeric',
    month: 'long',
  });
  return h(
    withTitle(View),
    {key: 'datePill', style: styles.datePillBasic, title: fullDate},
    [
      h(Text, {style: styles.dateText}, [
        bold(
          startDate.toLocaleDateString(i18n.locale, {
            weekday: undefined,
            day: 'numeric',
            year: undefined,
            month: undefined,
          }),
        ),
        '\n',
        startDate.toLocaleDateString(i18n.locale, {
          weekday: undefined,
          day: undefined,
          year: undefined,
          month: 'short',
        }),
      ]),
    ],
  );
}

function renderFullDatePill(startDate: Date, weak: boolean = false) {
  const fullDate = startDate.toLocaleDateString(i18n.locale, {
    weekday: 'long',
    day: 'numeric',
    year: 'numeric',
    month: 'long',
  });
  return h(
    withTitle(View),
    {key: 'datePill', style: styles.datePillFull, title: fullDate},
    [
      h(
        Text,
        {style: weak ? styles.dateOrTimeTextWeak : styles.dateOrTimeText},
        startDate.toLocaleDateString(undefined, {
          weekday: undefined,
          day: 'numeric',
          year: 'numeric',
          month: 'short',
        }),
      ),
    ],
  );
}

function isDateWithinNext12Months(date: Date): boolean {
  const now = new Date();
  const dateDiff = date.getTime() - now.getTime();
  if (dateDiff < 0) return false;
  const monthDiff = Math.floor(dateDiff / (1000 * 3600 * 24 * 30));
  return monthDiff <= 12;
}

function isDateInThePast(date: Date): boolean {
  const now = new Date();
  return date.getTime() < now.getTime();
}

class Banner extends PureComponent<
  {
    gatheringInfo: NonNullable<Props['gatheringInfo']>;
    onBannerLayout?: (event: LayoutChangeEvent) => void;
  },
  {fullscreen: boolean}
> {
  public state = {
    loaded: false,
    fullscreen: false,
  };

  private mounted = false;
  private onOpen = () => {
    if (!this.mounted) return;
    this.setState({fullscreen: true});
  };

  private onClose = () => {
    if (!this.mounted) return;
    this.setState({fullscreen: false});
  };

  public componentDidMount() {
    this.mounted = true;
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public render() {
    const {gatheringInfo, onBannerLayout} = this.props;
    const startDate = !!gatheringInfo.startDateTime?.epoch
      ? new Date(gatheringInfo.startDateTime.epoch)
      : null;

    const dateInfo = startDate
      ? h(View, {key: 'dateInfo', style: styles.dateInfoContainer}, [
          isDateWithinNext12Months(startDate)
            ? renderBasicDatePill(startDate)
            : isDateInThePast(startDate)
            ? renderFullDatePill(startDate, true)
            : renderFullDatePill(startDate, false),

          h(View, {key: 'timePill', style: styles.timePill}, [
            h(
              Text,
              {
                style: isDateInThePast(startDate)
                  ? styles.dateOrTimeTextWeak
                  : styles.dateOrTimeText,
              },
              startDate.toLocaleTimeString(i18n.locale, {
                hour: 'numeric',
                minute: 'numeric',
                second: undefined,
              }),
            ),
          ]),
        ])
      : null;

    const title = gatheringInfo.title
      ? h(View, {key: 'title', style: styles.titlePill}, [
          h(Text, {style: styles.titleText}, gatheringInfo.title),
        ])
      : null;

    const touchable = h(Touchable, {onPress: this.onOpen, key: 't'}, [
      h(View, {style: styles.bannerTouchable}),
    ]);

    const imageUri =
      gatheringInfo.image && gatheringInfo.image.link
        ? blobIdToUrl(gatheringInfo.image.link)
        : undefined;

    const image = h(
      ImageBackground,
      {
        key: 'preview',
        source: imageUri ? {uri: imageUri} : pictureIcon,
        accessible: true,
        accessibilityRole: 'image',
        accessibilityLabel: t(
          'message.image.without_caption.accessibility_label',
        ),
        resizeMode: imageUri ? 'cover' : 'center',
        style: [styles.bannerImage, {...getBannerImageDimensions()}],
      },
      [title, touchable, dateInfo],
    );

    return h(View, {key: gatheringInfo.about}, [
      h(ImageView, {
        key: 'full',
        images: imageUri ? [{uri: imageUri}] : [],
        imageIndex: 0,
        visible: this.state.fullscreen,
        swipeToCloseEnabled: false,
        onRequestClose: this.onClose,
      }),
      h(
        View,
        {
          key: 'banner',
          onLayout: onBannerLayout,
          style: styles.bannerContainer,
        },
        [image],
      ),
    ]);
  }
}

function renderAttendeesRow({
  attendees,
  onPressAttend,
  onPressAttendeeList,
  selfFeedId,
}: Pick<Props, 'onPressAttend' | 'onPressAttendeeList' | 'selfFeedId'> & {
  attendees: NonNullable<Props['attendees']>;
}) {
  const selfUserAttendee = attendees.find(
    (attendee) => attendee.feedId === selfFeedId,
  );

  const orderedAttendees = selfUserAttendee
    ? // Ensure that self is always first in the list
      [
        selfUserAttendee,
        ...attendees.filter((attendee) => attendee.feedId !== selfFeedId),
      ]
    : attendees;

  return h(AttendeesRow, {
    attendees: orderedAttendees,
    isAttending: !!selfUserAttendee,
    onPressAttend,
    onPressRow: onPressAttendeeList,
  });
}

function renderDescription(
  description: NonNullable<Props['gatheringInfo']>['description'],
) {
  return h(View, {key: 'description', style: styles.bodyTextContainer}, [
    h(View, {key: 'p'}, [
      h(Markdown, {
        key: 'md',
        text: typeof description === 'string' ? description : '',
      }),
    ]),
  ]);
}

// Copied from ZoomableImage component
function getBannerImageDimensions() {
  const d = Dimensions.get('window');

  const width = Platform.select<any>({
    web: `calc(${Dimens.desktopMiddleWidth.px} - ${
      2 * Dimens.horizontalSpaceBig
    }px)`,
    default: d.width - Dimens.horizontalSpaceBig * 2,
  });

  const height = Platform.select<any>({
    web: `calc(${ASPECT_RATIO} * (${Dimens.desktopMiddleWidth.px} - ${
      2 * Dimens.horizontalSpaceBig
    }px))`,
    default: ASPECT_RATIO * width,
  });

  return {height, width};
}

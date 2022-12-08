// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import dropRepeats from 'xstream/extra/dropRepeats';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent, ReactElement, createElement as $} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LocalizationSource, t} from '~frontend/drivers/localization';
import {WindowSize} from '~frontend/drivers/window-size';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {IconNames} from '~frontend/global-styles/icons';
import {Images} from '~frontend/global-styles/images';
import PublicTabIcon from '~frontend/components/tab-buttons/PublicTabIcon';
import PrivateTabIcon from '~frontend/components/tab-buttons/PrivateTabIcon';
import ActivityTabIcon from '~frontend/components/tab-buttons/ActivityTabIcon';
import ConnectionsTabIcon from '~frontend/components/tab-buttons/ConnectionsTabIcon';
import TabIcon from '~frontend/components/tab-buttons/TabIcon';
import Avatar from '~frontend/components/Avatar';
import ProgressBar from '~frontend/components/ProgressBar';
import {State} from './model';
import {
  styles,
  PILL_LEFT_CLAMP_MIN,
  PILL_LEFT_CLAMP_MAX,
  PROGRESS_BAR_HEIGHT,
  PROGRESS_PILL_HEIGHT,
} from './styles';

class ProgressPill extends PureComponent<{
  progress: number;
  onPress?: () => {};
}> {
  private started: number | null = null;

  private onPress = () => {
    if (this.props.progress < 1 && this.props.onPress) this.props.onPress();
  };

  /**
   * Temporary position for the pill when it could overlap with the traffic
   * light buttons on macOS.
   */
  static TOP_MACOS_FIX =
    Dimensions.toolbarHeight -
    PROGRESS_BAR_HEIGHT -
    Dimensions.verticalSpaceTiny -
    PROGRESS_PILL_HEIGHT;

  static TOP = PROGRESS_BAR_HEIGHT + Dimensions.verticalSpaceTiny;

  public render() {
    const progress = this.props.progress * 100;
    if (progress < 100 && !this.started) this.started = Date.now();
    if (progress >= 100 && this.started) this.started = null;
    const opacity = progress < 100 && Date.now() - this.started! > 3000 ? 1 : 0;
    const progressStr = `${Math.min(progress, 99.9).toFixed(1)}%`;
    const progressPillWidth =
      progress >= 10 ? styles.progressPillLarge : styles.progressPillSmall;
    const left =
      `clamp(${PILL_LEFT_CLAMP_MIN},` +
      `${progress.toFixed(1)}vw,` +
      `${PILL_LEFT_CLAMP_MAX})`;
    const top =
      progress < 7.5 && process.env.OS === 'darwin'
        ? ProgressPill.TOP_MACOS_FIX
        : ProgressPill.TOP;

    return h(Pressable, {
      onPress: this.onPress,
      children: () => [
        $(Text, {key: 'ppt', style: styles.progressPillText}, progressStr),
      ],
      style: ({hovered}: any) => {
        if (hovered) this.started = 1;
        return [
          styles.progressPill,
          progressPillWidth,
          {top, left, opacity},
          hovered ? styles.progressPillHovered : null,
        ];
      },
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: t('central.progress_indicator.accessibility_label'),
    });
  }
}

class ExtraButton extends PureComponent<{
  accessibilityLabel?: string;
  iconName: string;
  label: string;
  onPress?: () => {};
}> {
  public render() {
    const {onPress, iconName, label, accessibilityLabel} = this.props;

    return h(Pressable, {
      onPress,
      children: () => [
        h(View, {key: 'r', style: styles.extraButton}, [
          h(Icon, {
            key: 'x',
            name: iconName,
            size: Dimensions.iconSizeNormal,
            color: Palette.textForBackgroundBrand,
            style: styles.extraButtonIcon,
          }),
          h(
            Text,
            {
              key: 'b',
              style: styles.extraButtonText,
              numberOfLines: 1,
              selectable: false,
            },
            label,
          ),
        ]),
      ],
      style: ({hovered}: any) => [
        hovered ? styles.extraButtonHovered : styles.extraButtonIdle,
      ],
      accessible: true,
      accessibilityRole: 'menuitem',
      accessibilityLabel,
    });
  }
}

type ViewState = Pick<State, 'currentTab'> &
  Pick<State, 'numOfPublicUpdates'> &
  Pick<State, 'numOfPrivateUpdates'> &
  Pick<State, 'numOfActivityUpdates'> &
  Pick<State, 'connections'> &
  Pick<State, 'name'> &
  Pick<State, 'selfAvatarUrl'> &
  Pick<State, 'hasNewVersion'> &
  Pick<State, 'showButtons'> &
  Pick<State, 'combinedProgress'> &
  Pick<State, 'estimateProgressDone'>;

export default function view(
  state$: Stream<State>,
  children$: Stream<Array<ReactElement>>,
  localizationSource: LocalizationSource,
  windowSize$: Stream<WindowSize>,
) {
  const initialViewState: ViewState = {
    currentTab: 'public',
    numOfPublicUpdates: 0,
    numOfPrivateUpdates: 0,
    numOfActivityUpdates: 0,
    selfAvatarUrl: '',
    hasNewVersion: false,
    showButtons: false,
    combinedProgress: 0,
    estimateProgressDone: 0,
  };

  const viewState$ = (state$ as Stream<ViewState>)
    .compose(debounce(16)) // avoid quick re-renders
    .compose(
      dropRepeatsByKeys([
        'currentTab',
        'numOfPublicUpdates',
        'numOfPrivateUpdates',
        'numOfActivityUpdates',
        (s: ViewState) => s.connections?.status,
        (s: ViewState) => s.connections?.initializedSSB,
        'name',
        'selfAvatarUrl',
        'hasNewVersion',
        'showButtons',
        'combinedProgress',
      ]),
    )
    .startWith(initialViewState);

  /**
   * Window width on macOS such that it's too small and the traffic light
   * would overlap with the app logo.
   */
  const TOO_NARROW = 1060;
  const windowWidth$ = windowSize$
    .map((ws) => ws.width)
    .startWith(TOO_NARROW + 1)
    .compose(
      dropRepeats((w1, w2) => {
        if (w1 < TOO_NARROW && w2 < TOO_NARROW) return true;
        if (w1 >= TOO_NARROW && w2 >= TOO_NARROW) return true;
        return false;
      }),
    );

  return xs
    .combine(viewState$, children$, localizationSource.loaded$, windowWidth$)
    .map(([state, children, localizationLoaded, windowWidth]) => {
      if (!localizationLoaded) {
        return h(View, {key: 'df', style: styles.screen}, [
          h(View, {key: 'left', style: styles.left}, [
            h(View, {key: 'tbls', style: styles.topBarLeftSection}),
          ]),
        ]);
      }

      const status = state.connections?.status ?? 'bad';
      const initializedSSB = state.connections?.initializedSSB ?? false;
      const {combinedProgress, currentTab} = state;

      return h(View, {key: 'df', style: styles.screen}, [
        h(ProgressBar, {
          style: styles.progressBarContainer,
          progress: combinedProgress,
          theme: 'brand',
          disappearAt100: true,
          width: '100vw',
          height: PROGRESS_BAR_HEIGHT,
        }),
        combinedProgress > 0 && combinedProgress < 1
          ? h(ProgressPill, {sel: 'progressPill', progress: combinedProgress})
          : null,

        h(View, {key: 'left', style: styles.left}, [
          h(View, {key: 'tbls', style: styles.topBarLeftSection}, [
            process.env.OS === 'darwin' && windowWidth < TOO_NARROW
              ? null
              : h(View, {key: 'alc', style: styles.appLogoContainer}, [
                  h(Image, {
                    style: styles.appLogo,
                    source: Images.appLogo24,
                  }),
                ]),
          ]),

          state.showButtons
            ? h(View, {key: 'leftMenu', style: styles.leftMenu}, [
                h(PublicTabIcon, {
                  style: styles.leftMenuTabButton,
                  isSelected: currentTab === 'public',
                  numOfUpdates: state.numOfPublicUpdates,
                }),
                h(PrivateTabIcon, {
                  style: styles.leftMenuTabButton,
                  isSelected: currentTab === 'private',
                  numOfUpdates: state.numOfPrivateUpdates,
                }),
                h(ActivityTabIcon, {
                  style: styles.leftMenuTabButton,
                  isSelected: currentTab === 'activity',
                  numOfUpdates: state.numOfActivityUpdates,
                }),
                h(ConnectionsTabIcon, {
                  style: styles.leftMenuTabButton,
                  isSelected: currentTab === 'connections',
                  status,
                  allowWarningColors: initializedSSB,
                }),

                h(View, {key: 'spacer', style: styles.spacer}),

                state.hasNewVersion
                  ? h(ExtraButton, {
                      sel: 'new-version',
                      label: t('drawer.menu.update.label'),
                      accessibilityLabel: t(
                        'drawer.menu.update.accessibility_label',
                      ),
                      iconName: IconNames.versionUpdate,
                    })
                  : null,

                h(TabIcon, {
                  style: styles.leftMenuTabButton,
                  sel: 'more',
                  iconName: IconNames.etc,
                  label: t('drawer.menu.more.label'),
                  accessibilityLabel: t('drawer.menu.more.accessibility_label'),
                }),
                h(TabIcon, {
                  style: styles.leftMenuTabButton,
                  sel: 'settings',
                  iconName: IconNames.settings,
                  label: t('drawer.menu.settings.label'),
                  accessibilityLabel: t(
                    'drawer.menu.settings.accessibility_label',
                  ),
                }),
                h(TabIcon, {
                  style: styles.myProfileButton,
                  sel: 'self-profile',
                  iconName: IconNames.myProfile,
                  label: state.name ?? t('drawer.menu.my_profile.label'),
                  accessibilityLabel: t(
                    'drawer.menu.my_profile.accessibility_label',
                  ),
                  renderIconExtras: () =>
                    state.selfAvatarUrl
                      ? h(Avatar, {
                          style: styles.avatar,
                          size: Dimensions.iconSizeNormal,
                          backgroundColor: Palette.textWeak,
                          url: state.selfAvatarUrl,
                        })
                      : null,
                }),
              ])
            : null,
        ]),
        h(View, {key: 'centerRight', style: styles.centerRight}, [...children]),
      ]);
    });
}

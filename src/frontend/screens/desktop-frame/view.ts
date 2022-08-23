// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent, ReactElement, createElement as $} from 'react';
import {View, Text, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
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
} from './styles';

class TopBarLeftSection extends PureComponent {
  public render() {
    return $(View, {style: styles.topBarLeftSection}, this.props.children);
  }
}

class ProgressPill extends PureComponent<{
  progress: number;
  onPress?: () => {};
}> {
  private started: number | null = null;

  private onPress = () => {
    if (this.props.progress < 1 && this.props.onPress) this.props.onPress();
  };

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
          {left, opacity},
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
  localizationLoaded$: Stream<boolean>,
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

  return xs
    .combine(viewState$, children$, localizationLoaded$)
    .map(([state, children, localizationLoaded]) => {
      if (!localizationLoaded) {
        return h(View, {style: styles.screen}, [
          h(View, {style: styles.left}, [h(TopBarLeftSection)]),
        ]);
      }

      const status = state.connections?.status ?? 'bad';
      const initializedSSB = state.connections?.initializedSSB ?? false;
      const {combinedProgress, currentTab} = state;

      return h(View, {style: styles.screen}, [
        h(ProgressBar, {
          style: styles.progressBarContainer,
          progress: combinedProgress,
          theme: 'blank',
          disappearAt100: true,
          width: '100vw',
          height: PROGRESS_BAR_HEIGHT,
        }),
        combinedProgress > 0 && combinedProgress < 1
          ? h(ProgressPill, {sel: 'progressPill', progress: combinedProgress})
          : null,

        h(View, {style: styles.left}, [
          h(TopBarLeftSection),

          state.showButtons
            ? h(View, {style: styles.leftMenu}, [
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

                h(View, {style: styles.spacer}),

                state.hasNewVersion
                  ? h(ExtraButton, {
                      sel: 'new-version',
                      label: t('drawer.menu.update.label'),
                      accessibilityLabel: t(
                        'drawer.menu.update.accessibility_label',
                      ),
                      iconName: 'update',
                    })
                  : null,

                h(TabIcon, {
                  style: styles.leftMenuTabButton,
                  sel: 'more',
                  iconName: 'dots-horizontal',
                  label: t('drawer.menu.more.label'),
                  accessibilityLabel: t('drawer.menu.more.accessibility_label'),
                }),
                h(TabIcon, {
                  style: styles.leftMenuTabButton,
                  sel: 'settings',
                  iconName: 'cog',
                  label: t('drawer.menu.settings.label'),
                  accessibilityLabel: t(
                    'drawer.menu.settings.accessibility_label',
                  ),
                }),
                h(TabIcon, {
                  style: styles.myProfileButton,
                  sel: 'self-profile',
                  iconName: 'account-circle',
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
        h(View, {style: styles.centerAndRight}, [...children]),
      ]);
    });
}

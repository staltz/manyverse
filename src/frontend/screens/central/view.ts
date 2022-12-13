// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {
  ReactElement,
  Fragment,
  PureComponent,
  Component,
  createElement as $,
} from 'react';
import {
  Animated,
  Dimensions,
  Dimensions as DimensAPI,
  Platform,
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import {h} from '@cycle/react';
import {FloatingAction} from 'react-native-floating-action';
import {t} from '~frontend/drivers/localization';
import PublicTabIcon from '~frontend/components/tab-buttons/PublicTabIcon';
import PrivateTabIcon from '~frontend/components/tab-buttons/PrivateTabIcon';
import ActivityTabIcon from '~frontend/components/tab-buttons/ActivityTabIcon';
import ConnectionsTabIcon from '~frontend/components/tab-buttons/ConnectionsTabIcon';
import {withTitle} from '~frontend/components/withTitle';
import ProgressBar from '~frontend/components/ProgressBar';
import {
  styles,
  PILL_WIDTH_SMALL,
  PILL_WIDTH_LARGE,
  PILL_MARGIN,
  PROGRESS_BAR_HEIGHT,
} from './styles';
import {State} from './model';
import {FabProps} from './fab';

class CurrentTabPage extends PureComponent<{
  currentTab: State['currentTab'];
  fab: FabProps;
  publicTab: ReactElement<any>;
  privateTab: ReactElement<any>;
  activityTab: ReactElement<any>;
  connectionsTab: ReactElement<any>;
}> {
  public render() {
    const {
      currentTab,
      fab,
      publicTab,
      privateTab,
      activityTab,
      connectionsTab,
    } = this.props;
    const shown = styles.pageShown;
    const hidden = styles.pageHidden;
    const isPublic = currentTab === 'public';
    const isPrivate = currentTab === 'private';
    const isActivity = currentTab === 'activity';
    const isConnections = currentTab === 'connections';

    const fabSection =
      Platform.OS === 'web'
        ? h(
            withTitle(View),
            {
              style: styles.desktopFabContainer,
              title: fab.title,
            },
            [h(FloatingAction, fab)],
          )
        : h(FloatingAction, fab);

    return h(Fragment, [
      h(View, {style: [isPublic ? shown : hidden]}, [
        publicTab,
        isPublic ? fabSection : null,
      ]),
      h(View, {style: [isPrivate ? shown : hidden]}, [
        privateTab,
        isPrivate ? fabSection : null,
      ]),
      h(View, {style: [isActivity ? shown : hidden]}, [activityTab]),
      h(View, {style: [isConnections ? shown : hidden]}, [
        connectionsTab,
        isConnections ? fabSection : null,
      ]),
    ]);
  }
}

class MobileProgressPill extends Component<{progress: number}> {
  private setupDone: boolean = false;
  private started: number = 0;
  private shown: boolean = false;
  private readonly SCREEN_WIDTH: number;
  private readonly LCLAMP: number;
  private readonly RCLAMP: number;
  private translateXAnim: Animated.Value | null = null;
  private opacityAnim: Animated.Value | null = null;
  private readonly touchableProps: TouchableOpacityProps & {sel: string} = {
    sel: 'progressPill',
    style: styles.progressPillTouchable,
    activeOpacity: 0.4,
    accessible: true,
    accessibilityLabel: t('central.progress_indicator.accessibility_label'),
  };
  private renderedProgress = 0;

  constructor(props: MobileProgressPill['props']) {
    super(props);

    const SW = (this.SCREEN_WIDTH = Dimensions.get('window').width);
    this.LCLAMP = PILL_WIDTH_SMALL * 0.5 + PILL_MARGIN;
    this.RCLAMP = SW - PILL_WIDTH_LARGE * 0.5 - PILL_MARGIN;
    this.setup();
  }

  private setup() {
    this.translateXAnim = new Animated.Value(0);
    this.opacityAnim = new Animated.Value(0);
    this.started = 0;
    this.shown = false;

    this.setupDone = true;
  }

  componentDidMount() {
    if (!this.setupDone) this.setup();
  }

  componentWillUnmount() {
    this.setupDone = false;
    this.translateXAnim!.stopAnimation();
    this.translateXAnim = null;
    this.opacityAnim!.stopAnimation();
    this.opacityAnim = null;
    this.started = 0;
    this.shown = false;
  }

  public shouldComponentUpdate(nextProps: MobileProgressPill['props']) {
    const prevProgress = this.props.progress;
    const nextProgress = nextProps.progress;

    if (nextProgress < 1 && !this.started) this.started = Date.now();
    if (nextProgress >= 1 && this.started) this.started = 0;

    if (
      nextProgress > 0 &&
      nextProgress < 1 &&
      Date.now() - this.started! > 3000 &&
      !this.shown
    ) {
      this.shown = true;
      this.opacityAnim!.stopAnimation();
      this.opacityAnim!.setValue(0);
      Animated.timing(this.opacityAnim!, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }
    if (nextProgress >= 1) {
      this.shown = false;
      Animated.timing(this.opacityAnim!, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }

    let shouldUpdate = false;
    if (prevProgress <= 0 && nextProgress > 0) {
      shouldUpdate = true;
    } else if (prevProgress > 0 && nextProgress <= 0) {
      shouldUpdate = true;
    } else if (prevProgress < 1 && nextProgress >= 1) {
      shouldUpdate = true;
    } else if (prevProgress >= 1 && nextProgress < 1) {
      shouldUpdate = true;
    } else if (Math.abs(nextProgress - this.renderedProgress) > 0.001) {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      this.translateXAnim!.stopAnimation();
      if (prevProgress <= 0) this.translateXAnim!.setValue(0);
      Animated.timing(this.translateXAnim!, {
        toValue: nextProgress * this.SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }

    return shouldUpdate;
  }

  public render() {
    const progress = this.props.progress * 100;
    const progressStr = `${Math.min(progress, 99.9).toFixed(1)}%`;
    const progressPillStyle =
      progress >= 10 ? styles.progressPillLarge : styles.progressPillSmall;
    const width = progress >= 10 ? PILL_WIDTH_LARGE : PILL_WIDTH_SMALL;
    const transform = [
      {translateX: -width * 0.5},
      {
        translateX: this.translateXAnim!.interpolate({
          inputRange: [0, this.LCLAMP, this.RCLAMP, this.SCREEN_WIDTH],
          outputRange: [this.LCLAMP, this.LCLAMP, this.RCLAMP, this.RCLAMP],
        }),
      },
    ];
    this.renderedProgress = this.props.progress;

    const inner = $(
      View,
      {style: styles.progressPill},
      $(Text, {style: styles.progressPillText}, progressStr),
    );

    return $(
      Animated.View,
      {
        key: 'pill1',
        style: [
          styles.progressPillContainer,
          progressPillStyle,
          {transform, opacity: this.opacityAnim!},
        ],
      },
      this.shown ? h(TouchableOpacity, this.touchableProps, [inner]) : inner,
    );
  }
}

class MobileTabsBar extends PureComponent<State> {
  public render() {
    const {
      currentTab,
      connectionsTab,
      numOfPublicUpdates,
      numOfPrivateUpdates,
      numOfActivityUpdates,
      initializedSSB,
      combinedProgress,
    } = this.props;

    const status = connectionsTab?.status ?? 'bad';

    return h(View, {style: styles.tabBar}, [
      h(PublicTabIcon, {
        isSelected: currentTab === 'public',
        numOfUpdates: numOfPublicUpdates,
      }),
      h(PrivateTabIcon, {
        isSelected: currentTab === 'private',
        numOfUpdates: numOfPrivateUpdates,
      }),
      h(ActivityTabIcon, {
        isSelected: currentTab === 'activity',
        numOfUpdates: numOfActivityUpdates,
      }),
      h(ConnectionsTabIcon, {
        isSelected: currentTab === 'connections',
        status,
        allowWarningColors: initializedSSB,
      }),
      h(ProgressBar, {
        style: styles.progressBar,
        progress: combinedProgress,
        theme: 'brand',
        disappearAt100: true,
        width: DimensAPI.get('window').width,
        height: PROGRESS_BAR_HEIGHT,
      }),
      h(MobileProgressPill, {progress: combinedProgress}),
    ]);
  }
}

export default function view(
  state$: Stream<State>,
  fabProps$: Stream<FabProps>,
  topBar$: Stream<ReactElement<any>>,
  publicTab$: Stream<ReactElement<any>>,
  privateTab$: Stream<ReactElement<any>>,
  activityTab$: Stream<ReactElement<any>>,
  connectionsTab$: Stream<ReactElement<any>>,
) {
  const viewState$ = state$.compose(
    dropRepeatsByKeys([
      'currentTab',
      'numOfPublicUpdates',
      'numOfPrivateUpdates',
      'numOfActivityUpdates',
      (state) => state.connectionsTab?.status ?? 'bad',
      'initializedSSB',
      'combinedProgress',
    ]),
  );

  return xs
    .combine(
      viewState$,
      fabProps$,
      topBar$,
      publicTab$.startWith($(View)),
      privateTab$.startWith($(View)),
      activityTab$.startWith($(View)),
      connectionsTab$.startWith($(View)),
    )
    .map(
      ([
        state,
        fabProps,
        topBar,
        publicTab,
        privateTab,
        activityTab,
        connectionsTab,
      ]) =>
        h(View, {key: 'c', style: styles.screen}, [
          // h(RNBridgeDebug),
          topBar,
          h(CurrentTabPage, {
            currentTab: state.currentTab,
            fab: fabProps,
            publicTab,
            privateTab,
            activityTab,
            connectionsTab,
          }),
          Platform.OS === 'web' ? null : h(MobileTabsBar, state),
        ]),
    )
    .startWith($(View, {key: 'tbs', style: styles.topBarStub}));
}

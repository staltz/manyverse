// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
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
  Easing,
  Platform,
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import {h} from '@cycle/react';
import {FloatingAction} from 'react-native-floating-action';
import PublicTabIcon from '~frontend/components/tab-buttons/PublicTabIcon';
import PrivateTabIcon from '~frontend/components/tab-buttons/PrivateTabIcon';
import ActivityTabIcon from '~frontend/components/tab-buttons/ActivityTabIcon';
import ConnectionsTabIcon from '~frontend/components/tab-buttons/ConnectionsTabIcon';
import {withTitle} from '~frontend/components/withTitle';
import {t} from '~frontend/drivers/localization';
import {
  styles,
  PILL_WIDTH_SMALL,
  PILL_WIDTH_LARGE,
  PILL_MARGIN,
} from './styles';
import {State} from './model';
import {FabProps} from './fab';

class TopBarStub extends PureComponent {
  public render() {
    return $(View, {style: styles.topBarStub}, this.props.children);
  }
}

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
      h(View, {style: [currentTab === 'public' ? shown : hidden]}, [
        publicTab,
        fabSection,
      ]),
      h(View, {style: [currentTab === 'private' ? shown : hidden]}, [
        privateTab,
        fabSection,
      ]),
      h(View, {style: [currentTab === 'activity' ? shown : hidden]}, [
        activityTab,
      ]),
      h(View, {style: [currentTab === 'connections' ? shown : hidden]}, [
        connectionsTab,
        fabSection,
      ]),
    ]);
  }
}

class MobileProgressBar extends Component<{progress: number}> {
  private progressAnim = new Animated.Value(0);
  private flareAnim = new Animated.Value(0);
  private flareAnimating = false;
  private readonly width: number;
  private transformToRight: Array<any>;
  private transformFromRight: Array<any>;

  constructor(props: MobileProgressBar['props']) {
    super(props);

    const W = (this.width = Dimensions.get('window').width);
    const W2 = W * 0.5;
    this.transformToRight = [
      {translateX: -W2},
      {scaleX: this.progressAnim},
      {translateX: W2},
    ];
    this.transformFromRight = [
      {translateX: W2},
      {scaleX: this.progressAnim},
      {translateX: -W2},
    ];
  }

  componentWillUnmount() {
    this.progressAnim.stopAnimation();
    this.flareAnim.stopAnimation();
    this.progressAnim = null as any;
    this.flareAnim = null as any;
    this.transformToRight = null as any;
    this.transformFromRight = null as any;
  }

  private startFlare() {
    this.flareAnimating = true;
    this.flareAnim.setValue(0);
    Animated.loop(
      Animated.timing(this.flareAnim, {
        toValue: this.width,
        duration: 1400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
        isInteraction: false,
      }),
    ).start();
  }

  private stopFlare() {
    this.flareAnimating = false;
    this.flareAnim.setValue(0);
  }

  public shouldComponentUpdate(nextProps: MobileProgressBar['props']) {
    const prevProgress = this.props.progress;
    const nextProgress = nextProps.progress;

    // starting up:
    if (prevProgress <= 0 && nextProgress > 0) {
      this.progressAnim.setValue(0);
      Animated.timing(this.progressAnim, {
        toValue: nextProgress,
        duration: 250,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
      if (!this.flareAnimating) this.startFlare();
    }
    // finishing:
    else if (prevProgress < 1 && nextProgress >= 1) {
      this.progressAnim.setValue(1);
      Animated.timing(this.progressAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
      if (this.flareAnimating) this.stopFlare();
    }
    // in between:
    else if (nextProgress < 1 && prevProgress !== nextProgress) {
      this.progressAnim.stopAnimation();
      Animated.timing(this.progressAnim, {
        toValue: nextProgress,
        duration: 250,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
      if (!this.flareAnimating) this.startFlare();
    }

    if (prevProgress < 1 && nextProgress >= 1) {
      return true;
    } else if (prevProgress >= 1 && nextProgress < 1) {
      return true;
    }
    return false;
  }

  public render() {
    const transform =
      this.props.progress >= 1
        ? this.transformFromRight
        : this.transformToRight;

    const translateX = Animated.multiply(this.flareAnim, this.progressAnim);

    return h(Fragment, [
      h(Animated.View, {style: [styles.progressBar, {transform}]}),
      h(Animated.View, {
        style: [styles.progressFlare, {transform: [{translateX}]}],
      }),
    ]);
  }
}

class MobileProgressPill extends Component<{progress: number}> {
  private started: number = 0;
  private shown: boolean = false;
  private readonly SCREEN_WIDTH: number;
  private readonly LCLAMP: number;
  private readonly RCLAMP: number;
  private translateXAnim = new Animated.Value(0);
  private opacityAnim = new Animated.Value(0);
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
  }

  componentWillUnmount() {
    this.translateXAnim.stopAnimation();
    this.translateXAnim = null as any;
    this.opacityAnim.stopAnimation();
    this.opacityAnim = null as any;
    this.started = 0;
    this.shown = false;
  }

  public shouldComponentUpdate(nextProps: MobileProgressPill['props']) {
    const prevProgress = this.props.progress;
    const nextProgress = nextProps.progress;

    if (nextProgress < 1 && !this.started) this.started = Date.now();
    if (nextProgress >= 1 && this.started) this.started = 0;

    if (nextProgress < 1 && Date.now() - this.started! > 3000 && !this.shown) {
      this.shown = true;
      this.opacityAnim.stopAnimation();
      this.opacityAnim.setValue(0);
      Animated.timing(this.opacityAnim, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }
    if (nextProgress >= 1) {
      this.shown = false;
      Animated.timing(this.opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }

    let shouldUpdate = false;
    if (prevProgress < 1 && nextProgress >= 1) {
      shouldUpdate = true;
    } else if (prevProgress >= 1 && nextProgress < 1) {
      shouldUpdate = true;
    } else if (Math.abs(nextProgress - this.renderedProgress) > 0.001) {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      this.translateXAnim.stopAnimation();
      if (prevProgress <= 0) this.translateXAnim.setValue(0);
      Animated.timing(this.translateXAnim, {
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
        translateX: this.translateXAnim.interpolate({
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
          {transform, opacity: this.opacityAnim},
        ],
      },
      this.shown ? h(TouchableOpacity, this.touchableProps, [inner]) : inner,
    );
  }
}

class MobileTabsBar extends Component<State> {
  public shouldComponentUpdate(nextProps: MobileTabsBar['props']) {
    const prevProps = this.props;
    if (nextProps.currentTab !== prevProps.currentTab) return true;
    if (nextProps.numOfPublicUpdates !== prevProps.numOfPublicUpdates) {
      return true;
    }
    if (nextProps.numOfPrivateUpdates !== prevProps.numOfPrivateUpdates) {
      return true;
    }
    if (nextProps.numOfActivityUpdates !== prevProps.numOfActivityUpdates) {
      return true;
    }
    if (nextProps.connectionsTab !== prevProps.connectionsTab) {
      return true;
    }
    if (nextProps.initializedSSB !== prevProps.initializedSSB) {
      return true;
    }
    if (nextProps.indexingProgress !== prevProps.indexingProgress) {
      return true;
    }
    if (nextProps.migrationProgress !== prevProps.migrationProgress) {
      return true;
    }
    return false;
  }

  public render() {
    const {
      currentTab,
      connectionsTab,
      initializedSSB,
      indexingProgress,
      migrationProgress,
    } = this.props;

    const progress =
      indexingProgress > 0 && migrationProgress > 0
        ? (indexingProgress + migrationProgress) * 0.5
        : indexingProgress > 0
        ? indexingProgress
        : migrationProgress > 0
        ? migrationProgress
        : 1;

    const status = connectionsTab?.status ?? 'bad';

    return h(View, {style: styles.tabBar}, [
      h(PublicTabIcon, {
        isSelected: currentTab === 'public',
        numOfUpdates: this.props.numOfPublicUpdates,
      }),
      h(PrivateTabIcon, {
        isSelected: currentTab === 'private',
        numOfUpdates: this.props.numOfPrivateUpdates,
      }),
      h(ActivityTabIcon, {
        isSelected: currentTab === 'activity',
        numOfUpdates: this.props.numOfActivityUpdates,
      }),
      h(ConnectionsTabIcon, {
        isSelected: currentTab === 'connections',
        status,
        allowWarningColors: initializedSSB,
      }),
      h(MobileProgressBar, {progress}),
      h(MobileProgressPill, {progress}),
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
  return xs
    .combine(
      state$,
      fabProps$,
      topBar$,
      publicTab$.startWith(h(View)),
      privateTab$.startWith(h(View)),
      activityTab$.startWith(h(View)),
      connectionsTab$.startWith(h(View)),
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
        h(View, {style: styles.screen}, [
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
    .startWith($(TopBarStub));
}

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
import {Animated, Dimensions, Easing, Platform, View} from 'react-native';
import {h} from '@cycle/react';
import {FloatingAction} from 'react-native-floating-action';
import PublicTabIcon from '~frontend/components/tab-buttons/PublicTabIcon';
import PrivateTabIcon from '~frontend/components/tab-buttons/PrivateTabIcon';
import ActivityTabIcon from '~frontend/components/tab-buttons/ActivityTabIcon';
import ConnectionsTabIcon from '~frontend/components/tab-buttons/ConnectionsTabIcon';
import {withTitle} from '~frontend/components/withTitle';
import {styles} from './styles';
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

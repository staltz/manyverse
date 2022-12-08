// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Animated} from 'react-native';
import {Component, ReactElement, Fragment} from 'react';
import {h} from '@cycle/react';
import EmptySection from '~frontend/components/EmptySection';
import {t} from '~frontend/drivers/localization';
import {Images} from '~frontend/global-styles/images';
import {State} from '../../model';
import {styles} from '../styles';
import ListOfPeers from './ListOfPeers';

export default class Body extends Component<
  Pick<
    State,
    | 'lanEnabled'
    | 'internetEnabled'
    | 'timestampPeersAndRooms'
    | 'timestampStagedPeers'
    | 'peers'
    | 'rooms'
    | 'stagedPeers'
  >
> {
  private emptySectionOpacity: Animated.Value;
  private latestEmptySection: ReactElement<any> | null = null;
  private timestampLatestRender: number = 0;

  constructor(props: Body['props']) {
    super(props);
    this.emptySectionOpacity = new Animated.Value(
      this.shouldShowEmptySection(props) ? 1 : 0,
    );
  }

  public shouldComponentUpdate(nextProps: Body['props']) {
    const prevProps = this.props;
    if (nextProps.lanEnabled !== prevProps.lanEnabled) return true;
    if (nextProps.internetEnabled !== prevProps.internetEnabled) return true;
    if (nextProps.timestampPeersAndRooms > this.timestampLatestRender) {
      return true;
    }
    if (nextProps.timestampStagedPeers > this.timestampLatestRender) {
      return true;
    }
    return false;
  }

  public componentDidUpdate(prevProps: Body['props']) {
    this.maybeTriggerEmptySectionAnimation(prevProps, this.props);
  }

  private maybeTriggerEmptySectionAnimation(
    prevProps: Body['props'],
    nextProps: Body['props'],
  ) {
    const nextShouldShow = this.shouldShowEmptySection(nextProps);
    const prevShouldShow = this.shouldShowEmptySection(prevProps);
    if (!prevShouldShow && nextShouldShow) {
      Animated.timing(this.emptySectionOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    if (prevShouldShow && !nextShouldShow) {
      Animated.timing(this.emptySectionOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }

  private shouldShowEmptySection(props: Body['props'] = this.props) {
    return !this.anyModeEnabled(props) && !this.hasPeers(props);
  }

  private anyModeEnabled(props: Body['props'] = this.props) {
    const {lanEnabled, internetEnabled} = props;
    return lanEnabled || internetEnabled;
  }

  private hasPeers(props: Body['props'] = this.props) {
    const {peers, rooms, stagedPeers} = props;
    return (
      peers.length ||
      rooms.length ||
      stagedPeers.some(
        ([addr, data]) => data.type === 'lan' || data.type === 'bt',
      )
    );
  }

  private renderEmptySection() {
    if (!this.anyModeEnabled()) {
      this.latestEmptySection = h(EmptySection, {
        key: 'es',
        style: styles.emptySection,
        image: Images.nounLantern,
        title: t('connections.empty.offline.title'),
        description: t('connections.empty.offline.description'),
      });
    } else if (!this.hasPeers()) {
      this.latestEmptySection = h(EmptySection, {
        key: 'es',
        style: styles.emptySection,
        image: Images.nounCrops,
        title: t('connections.empty.no_peers.title'),
        description: t('connections.empty.no_peers.description'),
      });
    }

    return this.latestEmptySection;
  }

  public render() {
    this.timestampLatestRender = Date.now();
    const {peers, rooms, stagedPeers} = this.props;
    const showEmptySection = this.shouldShowEmptySection();

    return h(Fragment, [
      h(ListOfPeers, {
        key: 'b',
        sel: 'list-of-peers',
        peers: showEmptySection ? [] : peers,
        rooms: showEmptySection ? [] : rooms,
        stagedPeers: showEmptySection ? [] : stagedPeers,
      }),

      h(
        Animated.View,
        {
          style: [
            styles.emptySectionContainer,
            {opacity: this.emptySectionOpacity},
          ],
        },
        [this.renderEmptySection()],
      ),
    ]);
  }
}

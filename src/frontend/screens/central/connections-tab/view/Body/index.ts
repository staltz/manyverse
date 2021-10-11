// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Animated} from 'react-native';
import {Component, ReactElement, Fragment} from 'react';
import {h} from '@cycle/react';
import EmptySection from '../../../../../components/EmptySection';
import {t} from '../../../../../drivers/localization';
import {State} from '../../model';
import {styles} from '../styles';
import ListOfPeers from './ListOfPeers';

function recentlyScanned(timestamp: number) {
  return timestamp > 0 && Date.now() - timestamp < 15e3;
}

export default class Body extends Component<
  Pick<
    State,
    | 'bluetoothEnabled'
    | 'bluetoothLastScanned'
    | 'lanEnabled'
    | 'internetEnabled'
    | 'timestampPeersAndRooms'
    | 'timestampStagedPeers'
    | 'peers'
    | 'rooms'
    | 'stagedPeers'
  >
> {
  private emptySectionOpacity = new Animated.Value(1);
  private latestEmptySection: ReactElement<any> | null = null;
  private timestampLatestRender: number = 0;

  public shouldComponentUpdate(nextProps: Body['props']) {
    const prevProps = this.props;
    if (nextProps.bluetoothEnabled !== prevProps.bluetoothEnabled) return true;
    if (nextProps.bluetoothLastScanned !== prevProps.bluetoothLastScanned) {
      return true;
    }
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

  private shouldShowEmptySection(props: Body['props']) {
    const anyEnabled =
      props.bluetoothEnabled || props.lanEnabled || props.internetEnabled;
    const hasPeers =
      props.peers.length || props.rooms.length || props.stagedPeers.length;
    return !anyEnabled || !hasPeers;
  }

  private renderEmptySection() {
    const {
      bluetoothEnabled,
      bluetoothLastScanned,
      lanEnabled,
      internetEnabled,
      peers,
      rooms,
      stagedPeers,
    } = this.props;

    if (!bluetoothEnabled && !lanEnabled && !internetEnabled) {
      this.latestEmptySection = h(EmptySection, {
        key: 'es',
        style: styles.emptySection,
        image: require('../../../../../../../images/noun-lantern.png'),
        title: t('connections.empty.offline.title'),
        description: t('connections.empty.offline.description'),
      });
    }

    if (!peers.length && !rooms.length && !stagedPeers.length) {
      if (recentlyScanned(bluetoothLastScanned)) {
        this.latestEmptySection = h(EmptySection, {
          key: 'es',
          style: styles.emptySection,
          image: require('../../../../../../../images/noun-crops.png'),
          title: t('connections.empty.connecting.title'),
          description: t('connections.empty.connecting.description'),
        });
      } else {
        this.latestEmptySection = h(EmptySection, {
          key: 'es',
          style: styles.emptySection,
          image: require('../../../../../../../images/noun-crops.png'),
          title: t('connections.empty.no_peers.title'),
          description: t('connections.empty.no_peers.description'),
        });
      }
    }

    return this.latestEmptySection;
  }

  public render() {
    this.timestampLatestRender = Date.now();
    const {peers, rooms, stagedPeers} = this.props;
    const showEmptySection = this.shouldShowEmptySection(this.props);

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

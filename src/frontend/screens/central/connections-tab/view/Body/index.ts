/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Animated} from 'react-native';
import {Component, ReactElement, Fragment} from 'react';
import {h} from '@cycle/react';
import ListOfPeers from './ListOfPeers';
import EmptySection from '../../../../../components/EmptySection';
import {State} from '../../model';
import {styles} from '../styles';

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
    const nextAnyEnabled =
      nextProps.bluetoothEnabled ||
      nextProps.lanEnabled ||
      nextProps.internetEnabled;
    const prevAnyEnabled =
      prevProps.bluetoothEnabled ||
      prevProps.lanEnabled ||
      prevProps.internetEnabled;
    const nextHasPeers =
      nextProps.peers.length ||
      nextProps.rooms.length ||
      nextProps.stagedPeers.length;
    const prevHasPeers =
      prevProps.peers.length ||
      prevProps.rooms.length ||
      prevProps.stagedPeers.length;
    const nextShouldShow = !nextAnyEnabled || !nextHasPeers;
    const prevShouldShow = !prevAnyEnabled || !prevHasPeers;
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
        title: 'Offline',
        description:
          'Turn on some connection mode\nor enjoy reading some existing content',
      });
    }

    if (!peers.length && !rooms.length && !stagedPeers.length) {
      if (recentlyScanned(bluetoothLastScanned)) {
        this.latestEmptySection = h(EmptySection, {
          key: 'es',
          style: styles.emptySection,
          image: require('../../../../../../../images/noun-crops.png'),
          title: 'Connecting',
          description:
            'Wait while the app is\nattempting to connect to your peers',
        });
      } else {
        this.latestEmptySection = h(EmptySection, {
          key: 'es',
          style: styles.emptySection,
          image: require('../../../../../../../images/noun-crops.png'),
          title: 'No connections',
          description:
            'Try syncing with people nearby\nor use a server invite code',
        });
      }
    }

    return this.latestEmptySection;
  }

  public render() {
    this.timestampLatestRender = Date.now();
    const {peers, rooms, stagedPeers} = this.props;

    return h(Fragment, [
      h(ListOfPeers, {
        key: 'b',
        sel: 'list-of-peers',
        peers,
        rooms,
        stagedPeers,
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

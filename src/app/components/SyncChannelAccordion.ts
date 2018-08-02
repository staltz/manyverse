/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import Button from './Button';
import {PeerMetadata} from 'ssb-typescript';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: 1,
  },

  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
  },

  head: {
    backgroundColor: Palette.brand.textBackground,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
  },

  headMiddle: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: Dimensions.horizontalSpaceNormal,
  },

  headTitle: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.brand.textWeak,
  },

  headPeers: {
    alignSelf: 'stretch',
    flexDirection: 'row',
  },

  beacon: {
    position: 'absolute',
    top: 40,
    left: 37,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.acid3,
  },

  body: {
    backgroundColor: Palette.gray0,
    paddingVertical: Dimensions.verticalSpaceSmall,
  },

  infoText: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.brand.textWeak,
    marginLeft: Dimensions.horizontalSpaceNormal,
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  noConnections: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    marginVertical: Dimensions.verticalSpaceBig,
    fontSize: Typography.fontSizeLarge,
    color: Palette.brand.textWeak,
  },

  activate: {
    marginVertical: Dimensions.verticalSpaceNormal,
    alignSelf: 'center',
  },

  peer: {
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceNormal,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  peerTitle: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    marginRight: Dimensions.horizontalSpaceNormal,
    flex: 1,
    fontSize: Typography.fontSizeLarge,
    color: Palette.brand.text,
  },
});

export type Props = {
  icon: string;
  name: string;
  active: boolean;
  peers: Array<PeerMetadata>;
  info?: string;
  onPressInfo?: () => void;
  onPressActivate?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
};

export type State = {
  collapsed: boolean;
};

export default class SyncChannelAccordion extends PureComponent<Props, State> {
  public state = {
    collapsed: true,
  };

  private onPress = () => {
    this.setState((prev: State) => ({collapsed: !prev.collapsed}));
  };

  private renderHead() {
    const {name, icon, active, peers} = this.props;
    const {collapsed} = this.state;
    return h(
      TouchableNativeFeedback,
      {
        onPress: this.onPress,
        background: TouchableNativeFeedback.SelectableBackground(),
      },
      [
        h(
          View,
          {style: styles.head, elevation: collapsed ? undefined : 2},
          [
            h(Icon, {
              size: Dimensions.iconSizeBig,
              color: Palette.brand.textWeak,
              name: icon,
            }),

            active ? h(View, {style: styles.beacon}) : null,

            h(View, {style: styles.headMiddle}, [
              h(Text, {style: styles.headTitle}, name),
              h(
                View,
                {style: styles.headPeers},
                peers.map(peer =>
                  h(Icon, {
                    size: Dimensions.iconSizeSmall,
                    color: Palette.brand.textWeak,
                    name: 'account-circle',
                  }),
                ),
              ),
            ]),

            h(Icon, {
              size: Dimensions.iconSizeNormal,
              color: Palette.brand.textWeak,
              name: collapsed ? 'chevron-down' : 'chevron-up',
            }),
          ] as Array<ReactElement<any>>,
        ),
      ],
    );
  }

  private renderInfo() {
    const {info, onPressInfo, name} = this.props;
    return h(
      View,
      {style: styles.row},
      [
        h(Text, {style: styles.infoText}, info),
        onPressInfo
          ? h(
              TouchableOpacity,
              {
                accessible: true,
                accessibilityLabel: 'Show Info on ' + name,
                onPress: onPressInfo,
              },
              [
                h(Icon, {
                  size: Dimensions.iconSizeSmall,
                  color: Palette.brand.textVeryWeak,
                  name: 'information-outline',
                }),
              ],
            )
          : null,
      ] as Array<ReactElement<any>>,
    );
  }

  private renderActivate() {
    const {onPressActivate, name} = this.props;
    return h(Button, {
      style: styles.activate,
      text: 'Turn on',
      strong: true,
      onPress: onPressActivate,
      accessible: true,
      accessibilityLabel: 'Turn ' + name + ' on',
    });
  }

  private renderItem(peer: PeerMetadata) {
    return h(View, {style: styles.peer}, [
      h(Icon, {
        size: Dimensions.iconSizeBig,
        color: Palette.brand.textWeak,
        name: 'account-box',
      }),

      h(
        Text,
        {style: styles.peerTitle, numberOfLines: 1, ellipsizeMode: 'middle'},
        `${peer.name || peer.key}`,
      ),
    ]);
  }

  private renderBody() {
    const {active, peers, info, onPressActivate} = this.props;
    return h(
      View,
      {style: styles.body},
      [
        info ? this.renderInfo() : null,
        onPressActivate ? this.renderActivate() : null,
        active && peers.length === 0
          ? h(Text, {style: styles.noConnections}, 'No connections yet')
          : null,
      ].concat(peers.map(peer => this.renderItem(peer))) as Array<
        ReactElement<any>
      >,
    );
  }

  // public renderExpanded(peer: PeerMetadata): Array<ReactElement<any>> {
  //   if (this.state.collapsed) {
  //     return [
  //       h(View, {style: styles.summaryColumn}, [
  //         h(
  //           Text,
  //           {style: styles.title, numberOfLines: 1, ellipsizeMode: 'middle'},
  //           peer.name || peer.key,
  //         ),
  //         h(Text, {style: styles.subtitle}, `${peer.host}:${peer.port}`),
  //       ]),

  //       h(Icon, {
  //         size: Dimensions.iconSizeNormal,
  //         color: Palette.brand.darkTextWeak,
  //         name: 'chevron-down',
  //       }),
  //     ];
  //   } else {
  //     return [
  //       h(View, {style: styles.metadataBox}, [
  //         h(Text, {style: styles.metadataText}, JSON.stringify(peer, null, 2)),
  //       ]),

  //       h(Icon, {
  //         size: Dimensions.iconSizeNormal,
  //         color: Palette.brand.darkTextWeak,
  //         name: 'chevron-up',
  //       }),
  //     ];
  //   }
  // }

  public render() {
    const {collapsed} = this.state;
    return h(
      View,
      {style: styles.container},
      [this.renderHead(), collapsed ? null : this.renderBody()] as Array<
        ReactElement<any>
      >,
    );
  }
}

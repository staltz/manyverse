/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component, createElement as $} from 'react';
import {View, Text, StyleSheet} from 'react-native';
const Snoopy = require('rn-snoopy').default;
const buffer = require('rn-snoopy/stream/buffer').default;
const EventEmitter = require('react-native/Libraries/vendor/emitter/EventEmitter');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 70,
    right: 70,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  chart: {
    backgroundColor: '#ffaaaa66',
    textAlign: 'center',
    color: '#bb0000',
    letterSpacing: -1,
  },
});

const MAX_STRESS = 400;

/**
 * Use this component in the top-level render of any screen to display a
 * performance tracker that shows how busy the React Native Bridge is. Uses
 * the library `rn-snoopy`.
 */
export default class RNBridgeDebug extends Component<
  null,
  {stress: Array<number>}
> {
  public state = {stress: Array(15).fill(0)};

  public render() {
    return $(
      View,
      {style: styles.container},
      $(
        Text,
        {style: styles.chart},
        this.state.stress
          .map((x) => {
            if (x === 0) return ' ';
            const y = Math.min(x, MAX_STRESS) / MAX_STRESS;
            if (y < 0.14) return '▁';
            if (y < 0.28) return '▂';
            if (y < 0.42) return '▃';
            if (y < 0.57) return '▅';
            if (y < 0.71) return '▆';
            if (y < 0.85) return '▇';
            if (y <= 1.0) return '█';
          })
          .join(''),
      ),
    );
  }

  public componentDidMount() {
    const emitter = new EventEmitter();
    const events = Snoopy.stream(emitter);
    buffer(1000)(events).subscribe((x: any) => {
      this.setState((prev) => {
        prev.stress.shift();
        prev.stress.push(x.length);
        return {stress: prev.stress};
      });
    });
  }
}

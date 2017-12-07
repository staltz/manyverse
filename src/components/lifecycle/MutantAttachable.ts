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

import {Component} from 'react';
import {MsgAndExtras} from '../../drivers/ssb';
import {MutantWatch} from '../../typings/mutant';
const {watch}: {watch: MutantWatch} = require('mutant');

type StreamNames = keyof MsgAndExtras['value']['_streams'];

/**
 * Use this interface to make sure your React component can observe mutant
 * streams correctly in order to update the component state.
 *
 * Your React component should `implement MutantAttachable<KEYSGOHERE>` where
 * `KEYSGOHERE` should be a list of mutant streams that will be observed. E.g.
 * `implement MutantAttachable<'name' | 'imageUrl'>`
 * Notice that this list of strings is separated by `|`.
 */
export interface MutantAttachable<K extends StreamNames, S = any> {
  watcherRemovers: {[Key in K]: (() => void) | null};
}

type ComponentWithMsgAndExtras<
  K extends StreamNames,
  S = {[Key in K]: any}
> = Component<{msg: MsgAndExtras}, S> & MutantAttachable<K, S>;

/**
 * Attach a mutant stream to a React component.
 *
 * Call this function in `componentDidMount` in order to attach the mutant
 * stream that exists in the props. The values from the stream will be written
 * to the React component state.
 *
 * @param that React component instance (`this` keyword, when inside
 * `componentDidMount`)
 * @param key string that identifies the mutant stream to be attached.
 * @param update optional function that takes a value (from the mutant stream)
 * and can call `this.setState` to update the React component state.
 */
export function attachMutant<K extends StreamNames, S>(
  that: ComponentWithMsgAndExtras<K, S>,
  key: K,
  update?: (val: any) => void,
) {
  const _update =
    update ||
    (val => {
      that.setState((prev: S) => ({...prev as any, [key]: val}));
    });

  if (that.props.msg.value._streams && !that.watcherRemovers[key]) {
    that.watcherRemovers[key] = watch(
      that.props.msg.value._streams[key],
      _update,
    );
  }
}

/**
 * Detach a mutant stream from a React component.
 *
 * Call this function in `componentWillUnmount` in order to detach the mutant
 * stream from the React component.
 *
 * @param that React component instance (`this` keyword, when inside
 * `componentWillUnmount`)
 * @param key string that identifies the mutant stream to be attached.
 */
export function detachMutant<K extends StreamNames, S>(
  that: ComponentWithMsgAndExtras<K, S>,
  key: K,
) {
  if (that.props.msg.value._streams && that.watcherRemovers[key]) {
    (that.watcherRemovers[key] as () => void)();
    that.watcherRemovers[key] = null;
  }
}

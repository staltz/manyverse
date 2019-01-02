/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import MessageContainer from './MessageContainer';
import Metadata from './Metadata';

export default class KeylessMessage extends PureComponent<{msg: any}> {
  public render() {
    const {msg} = this.props;
    return h(MessageContainer, [h(Metadata, {msg})]);
  }
}

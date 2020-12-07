/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $, createRef, RefObject} from 'react';
import {TextInput, TextInputProps} from 'react-native';
import {Stream, Subscription} from 'xstream';

export interface Payload {
  text?: string;
  selection?: any;
  focus?: boolean;
}

export interface Props extends TextInputProps {
  nativePropsAndFocus$?: Stream<Payload>;
}

export default class SettableTextInput extends PureComponent<Props> {
  private subscription?: Subscription;
  private ref: RefObject<TextInput> = createRef();

  public componentDidMount() {
    if (this.props.nativePropsAndFocus$) {
      this.subscription = this.props.nativePropsAndFocus$.subscribe({
        next: (payload) => {
          if (payload.focus) this.ref.current?.focus();
          delete payload.focus;
          this.ref.current?.setNativeProps(payload);
        },
      });
    }
  }

  public componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  public render() {
    return $(TextInput, {...this.props, ref: this.ref});
  }
}

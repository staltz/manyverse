// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $, createRef, RefObject} from 'react';
import {Platform, TextInput, TextInputProps} from 'react-native';
import {Stream, Subscription} from 'xstream';

export interface Payload {
  text?: string;
  selection?: {start: number; end: number};
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
          if (Platform.OS === 'web' && payload.selection) {
            // Use DOM properties because for some reason `setNativeProps` fails
            (this.ref.current! as any).selectionStart = payload.selection.start;
            (this.ref.current! as any).selectionEnd = payload.selection.end;
          }
        },
      });
    }
  }

  public componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  public render() {
    return $(TextInput, {
      ...this.props,
      ref: this.ref,
    });
  }
}

// SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors
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
  onPaste?: (event: ClipboardEvent) => void;
  onDrop?: (event: DragEvent) => void;
}

export default class SettableTextInput extends PureComponent<Props> {
  private subscription?: Subscription;
  private ref: RefObject<TextInput> = createRef();
  private pasteListener?: (event: ClipboardEvent) => void;
  private dropListener?: (event: DragEvent) => void;

  public componentDidMount() {
    if (this.props.nativePropsAndFocus$) {
      this.subscription = this.props.nativePropsAndFocus$.subscribe({
        next: (payload) => {
          if (payload.focus) this.ref.current?.focus();
          delete payload.focus;
          this.ref.current?.setNativeProps(payload);
          if (Platform.OS === 'ios') {
            // iOS needs this hack. Maybe React Native has a race condition?
            setTimeout(() => {
              this.ref.current?.setNativeProps(payload);
            }, 16);
          } else if (Platform.OS === 'web' && payload.selection) {
            const elem = this.getWebElement();
            // Use DOM properties because for some reason `setNativeProps` fails
            elem.selectionStart = payload.selection.start;
            elem.selectionEnd = payload.selection.end;
          }
        },
      });
    }

    if (Platform.OS === 'web') {
      const elem = this.getWebElement();
      if (this.props.onPaste) {
        this.pasteListener = (event: ClipboardEvent) => {
          this.props?.onPaste?.(event);
        };
        elem.addEventListener('paste', this.pasteListener);
      }

      if (this.props.onDrop) {
        this.dropListener = (event: DragEvent) => {
          event.preventDefault();
          if (!event.dataTransfer) return;
          event.dataTransfer.dropEffect = 'copy';
          this.props?.onDrop?.(event);
        };
        elem.addEventListener('drop', this.dropListener);
      }
    }
  }

  public componentWillUnmount() {
    this.subscription?.unsubscribe();

    if (Platform.OS === 'web') {
      const elem = this.getWebElement();
      if (this.pasteListener) {
        elem.removeEventListener('paste', this.pasteListener);
        this.pasteListener = undefined;
      }
      if (this.dropListener) {
        elem.removeEventListener('drop', this.dropListener);
        this.dropListener = undefined;
      }
    }
  }

  private getWebElement() {
    return this.ref.current! as any as HTMLTextAreaElement;
  }

  public render() {
    return $(TextInput, {...this.props, ref: this.ref});
  }
}

// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $, createRef, RefObject} from 'react';
import {Stream, Subscription} from 'xstream';
import {Platform, TextInput, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 16,
    ...Platform.select({
      web: {
        paddingTop: 6,
        paddingLeft: 4,
      },
    }),
    marginTop: Platform.select({
      ios: 6,
      android: 0,
      web: 6,
    }),
    marginBottom: Platform.select({
      ios: 5,
      android: 3,
      web: 4,
    }),
  },
});

export interface Props {
  composerHeight: number;
  placeholder: string;
  placeholderTextColor: string;
  textInputProps: any;
  onTextChanged: CallableFunction;
  onInputSizeChanged: CallableFunction;
  multiline: boolean;
  disableComposer: boolean;
  textInputStyle: any;
  textInputAutoFocus: boolean;
  keyboardAppearance: string;
  nativeText$: Stream<string>;
}

export default class SettableComposer extends PureComponent<Props> {
  private subscription?: Subscription;
  private ref: RefObject<TextInput> = createRef();
  contentSize: {width: number; height: number} | undefined;
  onContentSizeChange: (e: any) => void;
  onChangeText: (text: any) => void;

  constructor(props: Props) {
    super(props);
    this.contentSize = undefined;
    this.onContentSizeChange = (e) => {
      const {contentSize} = e.nativeEvent;
      // Support earlier versions of React Native on Android.
      if (!contentSize) {
        return;
      }
      if (
        !this.contentSize ||
        (this.contentSize &&
          (this.contentSize.width !== contentSize.width ||
            this.contentSize.height !== contentSize.height))
      ) {
        this.contentSize = contentSize;
        this.props.onInputSizeChanged(this.contentSize);
      }
    };

    this.onChangeText = (text) => {
      this.props.onTextChanged(text);
    };
  }

  public componentDidMount() {
    if (this.props.nativeText$) {
      this.subscription = this.props.nativeText$.subscribe({
        next: (text) => {
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            this.ref.current?.setNativeProps({text});
          } else {
            this.ref.current?.setNativeProps({value: text});
          }

          if (text) {
            // Warn the parent that the value has changed (as setting the value
            // prop will not trigger a native event)
            this.props.onTextChanged?.(text);
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
      ref: this.ref,
      accessible: true,
      accessibilityLabel: this.props.placeholder,
      placeholder: this.props.placeholder,
      placeholderTextColor: this.props.placeholderTextColor,
      multiline: this.props.multiline,
      editable: !this.props.disableComposer,
      onChange: this.onContentSizeChange,
      onContentSizeChange: this.onContentSizeChange,
      onChangeText: this.onChangeText,
      style: [
        styles.textInput,
        this.props.textInputStyle,
        {
          height: this.props.composerHeight,
          ...Platform.select({
            web: {
              outlineWidth: 0,
              outlineColor: 'transparent',
              outlineOffset: 0,
            },
          }),
        },
      ],
      autoFocus: this.props.textInputAutoFocus,
      enablesReturnKeyAutomatically: true,
      underlineColorAndroid: 'transparent',
      keyboardAppearance: this.props.keyboardAppearance,
      ...this.props.textInputProps,
    });
  }
}

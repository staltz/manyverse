// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import React = require('react');
import {Stream} from 'xstream';
import {h} from '@cycle/react';
import delay from 'xstream/extra/delay';
import {
  Composer as ComposerWithWrongTypes,
  ComposerProps,
} from 'react-native-gifted-chat';
import {TextInput} from 'react-native';

const Composer =
  ComposerWithWrongTypes as any as React.ComponentClass<ComposerProps>;

export const SettableComposer: React.FC<
  ComposerProps & {nativeProps$: Stream<any>}
> = ({nativeProps$, ...props}) => {
  const inputRef = React.useRef<TextInput>();

  React.useEffect(() => {
    const element = inputRef.current;
    if (!element) {
      return;
    }
    const nativePropsSubscription = nativeProps$
      // Add a delay to be sure the element is there and can be updated
      .compose(delay(16))
      .subscribe({
        next: (nativeProps) => {
          element.setNativeProps(nativeProps);
          if (nativeProps.value) {
            // Warn the parent that the value has changed (as setting the value prop will not trigger a native event)
            props.onTextChanged?.(nativeProps.value);
          }
        },
      });

    return () => {
      nativePropsSubscription.unsubscribe();
    };
  }, []);

  return h(Composer, {
    ...props,
    textInputProps: {...props.textInputProps, ref: inputRef} as any,
  });
};

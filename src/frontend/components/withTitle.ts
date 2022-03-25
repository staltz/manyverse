// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {
  createRef,
  useEffect,
  FC,
  FunctionComponent,
  ComponentClass,
} from 'react';
import {Platform, View} from 'react-native';

type WithTitleProps =
  | {title: string; accessibilityLabel?: string}
  | {title?: string; accessibilityLabel: string};

/**
 * A higher order React component that will add a title attribute to the given component when rendered on a desktop
 */
export function withTitle<T>(
  Component: FunctionComponent<T> | ComponentClass<T>,
): FC<T & WithTitleProps> {
  return ({children, ...props}) => {
    const elementRef = createRef<View>();
    const title = props.title || props.accessibilityLabel;

    useEffect(() => {
      if (Platform.OS === 'web' && elementRef.current && title) {
        elementRef.current.setNativeProps({title});
      }
    }, []);

    return h(Component, {...props, ref: elementRef} as any, [children]);
  };
}

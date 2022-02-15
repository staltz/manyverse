// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createElement as $, forwardRef, useEffect} from 'react';
import {Platform, FlatList, FlatListProps} from 'react-native';

export default forwardRef<FlatList, FlatListProps<any>>((props, ref) => {
  useEffect(() => {
    if (Platform.OS !== 'web' || !props.inverted) return () => {};

    function invertedWheelEvent(e: WheelEvent) {
      if (!ref) return;
      if (typeof ref !== 'function') {
        ref.current!.getScrollableNode().scrollTop -= e.deltaY;
        e.preventDefault();
      }
    }

    (function setup() {
      if (!ref) {
        setTimeout(setup, 50);
        return;
      }
      if (typeof ref !== 'function') {
        ref.current
          ?.getScrollableNode()
          .addEventListener('wheel', invertedWheelEvent);
      }
    })();

    return function teardown() {
      if (!ref) return;
      if (typeof ref !== 'function') {
        ref.current
          ?.getScrollableNode()
          .removeEventListener('wheel', invertedWheelEvent);
      }
    };
  });

  return $(FlatList, {...props, ref});
});

/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {View, Animated, StyleProp, ViewStyle} from 'react-native';

type PopItemProps = {
  removed: boolean;
  onExit: () => void;
  animationDuration: number;
  itemHeight: number;
};

type PopItemState = {
  height: number;
};

class PopItem extends PureComponent<PopItemProps, PopItemState> {
  private _val: Animated.Value;
  private _enterAnim: Animated.CompositeAnimation | null;
  private _exitAnim: Animated.CompositeAnimation | null;
  private _shouldEnter: boolean;
  private _shouldExit: boolean;
  private _viewRef: any;

  constructor(props: PopItemProps) {
    super(props);
    this._shouldEnter = false;
    this._shouldExit = false;
    this.state = {height: 0};
  }

  private _enter() {
    if (this._exitAnim) {
      this._shouldEnter = true;
      return;
    }

    this._val.setValue(0);
    this._enterAnim = Animated.timing(this._val, {
      toValue: 1,
      duration: this.props.animationDuration,
      useNativeDriver: true,
    });
    this._enterAnim.start(() => {
      this._enterAnim = null;
      if (this._shouldExit) {
        this._shouldExit = false;
        this._exit();
      }
    });
  }

  private _exit() {
    if (this._enterAnim) {
      this._shouldExit = true;
      return;
    }

    this._exitAnim = Animated.timing(this._val, {
      toValue: 0,
      duration: this.props.animationDuration,
      useNativeDriver: true,
    });
    this._exitAnim.start(() => {
      this._exitAnim = null;
      if (this._shouldEnter) {
        this._shouldEnter = false;
        this._enter();
      } else {
        this.props.onExit();
      }
    });
  }

  public componentWillMount() {
    this._val = new Animated.Value(0);
  }

  public componentDidMount() {
    this._enter();
    this._val.addListener(x => {
      this._viewRef.setNativeProps({height: x.value * this.props.itemHeight});
    });
  }

  public componentDidUpdate(prevProps: PopItemProps) {
    if (this.props.removed && !prevProps.removed) {
      this._exit();
      return;
    }

    if (!this.props.removed && prevProps.removed) {
      this._enter();
      return;
    }
  }

  public componentWillUnmount() {
    this._val.removeAllListeners();
  }

  public render() {
    return $(
      Animated.View,
      {
        ref: ref => (this._viewRef = ref),
        style: {
          height: 0,
          opacity: this._val.interpolate({
            inputRange: [0, 0.75, 1],
            outputRange: [0, 0, 1],
          }),
        },
      },
      this.props.children,
    );
  }
}

export type Props<T> = {
  style?: StyleProp<ViewStyle>;
  data: Array<T>;
  renderItem: (t: T, key?: string | number) => React.ReactElement<any>;
  keyExtractor: (t: T) => string | number;
  itemHeight: number;
  animationDuration?: number;
};

type State<T> = {
  data: Array<[/* key */ string | number, T, /* timestamp */ number]>;
};

function sortByKey<T>(array: State<T>['data']) {
  return array.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });
}

const DEFAULT_DURATION = 250 /* ms */;

export default class PopList<T> extends PureComponent<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {data: []};
    this.state = this.computeNextState();
  }

  private noDifference(prevProps: Props<T>, nextProps: Props<T>): boolean {
    // TODO make this faster
    const prevData = prevProps.data.map(x => [0, x, 0]) as State<T>['data'];
    const nextData = nextProps.data.map(x => [0, x, 0]) as State<T>['data'];
    const prevCode = sortByKey<T>(prevData)
      .map(([_key, item]) => JSON.stringify(item))
      .join();
    const nextCode = sortByKey(nextData)
      .map(([_key, item]) => JSON.stringify(item))
      .join();
    return nextCode === prevCode;
  }

  private computeNextState() {
    const nextData = this.props.data;
    const nextKeys = new Map(
      nextData.map(
        (item, index) =>
          [this.props.keyExtractor(item), index] as [string | number, number],
      ),
    );

    // nextData minus prevData
    const fluidData = this.state.data.slice(0);
    for (const [key, j] of nextKeys) {
      const i = fluidData.findIndex(([k]) => k === key);
      if (i === -1) {
        // start appear animation
        fluidData.push([key, nextData[j], 0]);
      } else {
        // update appear animation
        fluidData[i][2] = 0;
      }
    }

    // prevData minus nextData
    const now = Date.now();
    for (const [i, [key]] of fluidData.entries()) {
      if (!nextKeys.has(key)) {
        // start disappear animation
        fluidData[i][2] = now;
      } else {
        // update item's data
        fluidData[i][1] = nextData[nextKeys.get(key)!];
      }
    }
    return {data: sortByKey(fluidData)};
  }

  public componentDidUpdate(prevProps: Props<T>) {
    if (this.noDifference(prevProps, this.props)) {
      this.purgeOldItems();
      return;
    }

    this.setState(this.computeNextState());
  }

  public purgeOldItems() {
    const maxDuration = (this.props.animationDuration || DEFAULT_DURATION) * 3;
    const now = Date.now();
    let purged: boolean = false;
    const newData = this.state.data.filter(([, , ts]) => {
      if (ts > 0 && now - ts > maxDuration) {
        purged = true;
        return false;
      } else {
        return true;
      }
    });
    if (purged) {
      this.setState({data: sortByKey(newData)});
    }
  }

  public onItemExit = (key: string | number) => {
    const newData = this.state.data.filter(([k]) => k !== key);
    this.setState({data: sortByKey(newData)});
  };

  public render() {
    return $(
      View,
      {style: this.props.style},
      this.state.data.map(([key, item, ts]) =>
        $(
          PopItem,
          {
            key,
            animationDuration: this.props.animationDuration || DEFAULT_DURATION,
            itemHeight: this.props.itemHeight,
            removed: ts > 0,
            onExit: () => this.onItemExit(key),
          },
          this.props.renderItem(item, key),
        ),
      ),
    );
  }
}

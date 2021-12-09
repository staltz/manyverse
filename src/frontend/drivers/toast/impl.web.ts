// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {createElement as $, Component, createRef} from 'react';
const ReactDOM = require('react-dom');
import {Snackbar} from '@material-ui/core';
import {GravityToast, Toast} from './types';

interface State {
  open: boolean;
  flavor: 'success' | 'failure' | null;
  message: string;
  duration: number;
}

class Toasts extends Component<unknown, any> {
  state: State = {
    open: false,
    flavor: null,
    message: '',
    duration: 0,
  };

  public show(flavor: State['flavor'], message: string, duration: number) {
    this.setState({
      open: true,
      flavor,
      message,
      duration,
    });
  }

  public hide = () => {
    this.setState({open: false});
  };

  public render() {
    const {open, message, duration, flavor} = this.state;
    const flavorPrefix =
      flavor === 'success' ? '\u2713 ' : flavor === 'failure' ? '\u2717 ' : '';

    return $(Snackbar, {
      open,
      message: flavorPrefix + message,
      autoHideDuration: duration ?? toastDriver.Duration.LONG,
      onClose: this.hide,
      anchorOrigin: {horizontal: 'center', vertical: 'top'},
    });
  }
}

const toastsRef = createRef<Toasts>();

function Root() {
  return $(Toasts, {ref: toastsRef});
}

const domContainer = document.getElementById('toasts');
ReactDOM.render($(Root), domContainer);

function toastDriver(sink: Stream<Toast | GravityToast>): void {
  sink.addListener({
    next: (t) => {
      toastsRef.current!.show(t.flavor ?? null, t.message, t.duration);
    },
  });
}

toastDriver.Duration = {
  SHORT: 3000,
  LONG: 6000,
};

toastDriver.Gravity = {
  TOP: 'top',
  CENTER: 'center',
  BOTTOM: 'bottom',
};

toastDriver.show = (t: Toast) => {
  toastsRef.current!.show(t.flavor ?? null, t.message, t.duration);
};

export default toastDriver;

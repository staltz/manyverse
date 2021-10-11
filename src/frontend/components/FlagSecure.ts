// SPDX-FileCopyrightText: 2019 Andre 'Staltz' Medeiros
//
// SPDX-License-Identifier: ISC

import {Component} from 'react';
import {NativeModules, Platform} from 'react-native';

export default class FlagSecure extends Component {
  public static isActive = false;

  public static activate() {
    if (!FlagSecure.isActive) {
      if (Platform.OS === 'android') NativeModules.FlagSecure.activate();
      FlagSecure.isActive = true;
    }
  }

  public static deactivate() {
    if (FlagSecure.isActive) {
      if (Platform.OS === 'android') NativeModules.FlagSecure.deactivate();
      FlagSecure.isActive = false;
    }
  }

  public componentDidMount() {
    FlagSecure.activate();
  }

  public componentWillUnmount() {
    FlagSecure.deactivate();
  }

  public render() {
    return this.props.children ?? null;
  }
}

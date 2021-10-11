// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Implementation} from './dialogs-types';
import DialogAndroid from 'react-native-dialogs';

const impl: Implementation = {
  alert(title, content, options) {
    return DialogAndroid.alert(title, content, options);
  },

  showPicker(title, content, options) {
    return DialogAndroid.showPicker(title, content, options);
  },

  prompt(title, content, options) {
    return DialogAndroid.prompt(title, content, options);
  },

  dismiss() {
    DialogAndroid.dismiss();
  },
};

export default impl;

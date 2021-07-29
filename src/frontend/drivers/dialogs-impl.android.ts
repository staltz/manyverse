/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform} from 'react-native';

export function getImg(required: any) {
  if (Platform.OS === 'web') {
    return 'renderer-dist/' + required.default;
  } else {
    return required;
  }
}

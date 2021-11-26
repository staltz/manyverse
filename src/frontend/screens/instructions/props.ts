// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ImageSourcePropType, ImageStyle} from 'react-native';

export interface Props {
  title: string;
  content1: string;
  content2?: string;
  image2?: ImageSourcePropType;
  image2Style?: ImageStyle;
}

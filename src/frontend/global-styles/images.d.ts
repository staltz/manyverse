// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Images as ImagesNative} from './images.native';
import {Images as ImagesWeb} from './images.web';
declare var _test: typeof ImagesNative;
declare var _test: typeof ImagesWeb;
export const Images = ImagesNative;

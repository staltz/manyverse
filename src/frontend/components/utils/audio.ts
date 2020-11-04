/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function getAudioTimeString(seconds: number) {
  const secondsPreview = Math.floor(seconds % 60);
  const minutes = Math.floor((seconds / 60) % 60);
  const hours = Math.floor((seconds / 3600) % 24);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${
      secondsPreview < 10 ? '0' + secondsPreview : secondsPreview
    }`;
  }

  return `${minutes}:${
    secondsPreview < 10 ? '0' + secondsPreview : secondsPreview
  }`;
}

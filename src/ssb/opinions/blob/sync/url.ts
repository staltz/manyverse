/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const nest = require('depnest');

const blobSyncUrlOpinion = {
  gives: nest('blob.sync.url'),
  create: function create(api: any) {
    return nest(
      'blob.sync.url',
      (id: any) => `http://localhost:26835/${encodeURIComponent(id)}`,
    );
  },
};

export default blobSyncUrlOpinion;

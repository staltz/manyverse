import {Callback} from 'pull-stream';
import QuickLRU = require('quick-lru');
import {FeedId} from 'ssb-typescript';

interface Output {
  name?: string;
  image?: string;
}

const cachedAboutSelf = {
  name: 'cachedAboutSelf' as const,

  version: '1.0.0',

  manifest: {
    invalidate: 'sync',
    getNameAndImage: 'async',
  },

  permissions: {
    master: {
      allow: ['invalidate', 'getNameAndImage'],
    },
  },

  init: (ssb: any) => {
    const DUNBAR = 150;
    const cache = new QuickLRU<FeedId, Output>({maxSize: DUNBAR});

    function isValid(out: Output | undefined) {
      if (!out) return false;
      if (!out.name && !out.image) return false;
      return true;
    }

    return {
      invalidate(id: FeedId) {
        cache.delete(id);
      },

      getNameAndImage(id: FeedId, cb: Callback<Output>) {
        if (cache.has(id)) {
          cb(null, cache.get(id));
        } else {
          const coldOpts = {id, name: true, image: true};
          ssb.aboutSelf.get(coldOpts, (err: any, out: Output) => {
            if (!err && isValid(out)) cache.set(id, out);
            cb(err, out);
          });
        }
      },
    };
  },
};

export default () => cachedAboutSelf;

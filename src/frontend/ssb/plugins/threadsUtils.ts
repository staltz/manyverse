// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import xsFromCallback from 'xstream-from-callback';
import xsFromPullStream from 'xstream-from-pull-stream';
const pull = require('pull-stream');
const Ref = require('ssb-ref');
import {Thread as ThreadData} from 'ssb-threads/lib/types';
import {
  Msg,
  Content,
  FeedId,
  PostContent,
  GatheringContent,
} from 'ssb-typescript';
import {isMsg, isContactMsg, isGatheringMsg} from 'ssb-typescript/utils';
import run = require('promisify-tuple');
import {Callback} from 'pull-stream';
import {ClientAPI, AnyFunction} from 'react-native-ssb-client';
import {
  AnyThread,
  GatheringInfo,
  MsgAndExtras,
  ThreadAndExtras,
  ThreadSummary,
  ThreadSummaryWithExtras,
  PrivateThreadAndExtras,
  Reactions,
  GatheringAttendees,
  GatheringAttendee,
} from '../types';
import {imageToImageUrl, voteExpressionToReaction} from '../utils/from-ssb';
import manifest from '../manifest';

type SSB = ClientAPI<
  typeof manifest & {
    cachedAboutSelf: {
      get: AnyFunction;
      invalidate: AnyFunction;
    };
    deweird: {
      source: AnyFunction;
    };
  }
>;

function getRecipient(recp: string | Record<string, any>): string | undefined {
  if (typeof recp === 'object' && Ref.isFeed(recp.link)) {
    return recp.link;
  }
  if (typeof recp === 'string' && Ref.isFeed(recp)) {
    return recp;
  }
}

function mutateMsgWithLiveExtras(
  ssb: SSB,
  options: {
    includeReactions?: boolean;
    includeGatheringInfo?: boolean;
  } = {
    includeReactions: true,
    includeGatheringInfo: true,
  },
) {
  return async (msg: Msg, cb: Callback<MsgAndExtras>) => {
    if (!(isMsg(msg) || isGatheringMsg(msg)) || !msg.value) {
      return cb(null, msg as any);
    }

    // Fetch name and image
    const id = msg.value.author;
    const [, output] = await run<any>(ssb.cachedAboutSelf.get)(id);
    const name = output.name;
    const imageUrl = imageToImageUrl(output.image);

    // Get reactions stream
    const reactions: Stream<Reactions> = options.includeReactions
      ? createReaction$(ssb, msg)
      : xs.never();

    const gatheringAttendees = isGatheringMsg(msg)
      ? createGatheringAttendees$(ssb, msg)
      : undefined;

    // Get gathering info stream
    const gatheringInfo: Stream<GatheringInfo> | undefined =
      options.includeGatheringInfo && isGatheringMsg(msg)
        ? createGatheringInfo$(ssb, msg)
        : undefined;

    // Create msg object
    const m = msg as MsgAndExtras;
    m.value._$manyverse$metadata = m.value._$manyverse$metadata || {
      reactions,
      gatheringInfo,
      gatheringAttendees,
      about: {name, imageUrl},
    };

    // Add name of the target contact, if any
    const content = msg.value.content;
    if (!content || content.type !== 'contact' || !content.contact) {
      return cb(null, m);
    }
    const dest: FeedId = content.contact;
    const [, destOutput] = await run<any>(ssb.cachedAboutSelf.get)(dest);
    m.value._$manyverse$metadata.contact = {name: destOutput.name};
    cb(null, m);
  };
}

function mutateThreadWithLiveExtras(ssb: SSB) {
  return async (thread: ThreadData, cb: Callback<ThreadAndExtras>) => {
    for (const msg of thread.messages) {
      await run(mutateMsgWithLiveExtras(ssb))(msg);
    }
    cb(null, thread as ThreadAndExtras);
  };
}

function mutateThreadSummaryWithLiveExtras(ssb: SSB) {
  return async (
    summary: ThreadSummary,
    cb: Callback<ThreadSummaryWithExtras>,
  ) => {
    await run(mutateMsgWithLiveExtras(ssb))(summary.root);
    cb(null, summary as ThreadSummaryWithExtras);
  };
}

function mutatePrivateThreadWithLiveExtras(ssb: SSB) {
  return async (
    thread: ThreadData,
    cb: Callback<PrivateThreadAndExtras<PostContent>>,
  ) => {
    for (const msg of thread.messages) {
      await run(
        mutateMsgWithLiveExtras(ssb, {
          includeReactions: false,
          includeGatheringInfo: false,
        }),
      )(msg);
    }
    const root: Msg<Content> | undefined = thread.messages[0];
    const pvthread: PrivateThreadAndExtras<PostContent> = thread as any;
    if (root && root?.value?.content?.recps) {
      pvthread.recps = [];
      for (const recp of root?.value?.content?.recps) {
        const id = getRecipient(recp);
        if (!id) continue;

        // Fetch name and image
        const [, output] = await run<any>(ssb.cachedAboutSelf.get)(id);
        const name = output.name;
        const imageUrl = imageToImageUrl(output.image);

        // Push
        pvthread.recps.push({id, name, imageUrl});
      }
    }
    cb(null, pvthread as PrivateThreadAndExtras<PostContent>);
  };
}

function createGatheringAttendees$(
  ssb: SSB,
  msg: Msg<GatheringContent>,
): Stream<GatheringAttendees> {
  return xsFromPullStream(ssb.gatheringsUtils.gatheringAttendees(msg.key))
    .map((gatheringAttendees: Array<FeedId>) => {
      const attendeesInfo$ = gatheringAttendees.map((feedId) =>
        xsFromCallback(ssb.cachedAboutSelf.get)(feedId)
          .replaceError((err) => (err === true ? xs.empty() : xs.throw(err)))
          .map(
            (response: any): GatheringAttendee => ({
              feedId,
              name: response.name,
              avatarUrl: imageToImageUrl(response.image),
            }),
          ),
      );

      return xs.combine(...attendeesInfo$);
    })
    .flatten()
    .remember();
}

function createGatheringInfo$(
  ssb: SSB,
  msg: Msg<GatheringContent>,
): Stream<GatheringInfo> {
  return xsFromCallback<GatheringInfo>(ssb.gatheringsUtils.gatheringInfo)(
    msg.key,
  )
    .replaceError((err) => (err === true ? xs.empty() : xs.throw(err)))
    .remember();
}

function createReaction$(ssb: SSB, msg: Msg): Stream<NonNullable<Reactions>> {
  return xsFromPullStream(ssb.votes.voterStream(msg.key))
    .startWith([])
    .map((arr: Array<unknown>) =>
      arr
        .reverse() // recent ones first
        .map(([feedId, expression]) => {
          const reaction = voteExpressionToReaction(expression);
          return [feedId, reaction];
        }),
    );
}

const ALLOW_ALL = ['post', 'gathering', 'contact'];
const ALLOW_ALL_EXCEPT_CONTACT = ['post', 'gathering'];
const ALLOW_POSTS_ONLY = ['post'];

const threadsUtils = {
  name: 'threadsUtils' as const,

  init: function init(ssb: SSB) {
    if (!ssb.settingsUtils?.read) {
      throw new Error(
        '"threadsUtils" is missing required plugin "settingsUtils"',
      );
    }
    if (!ssb.dbUtils?.rawLogReversed) {
      throw new Error('"threadsUtils" is missing required plugin "dbUtils"');
    }

    const privateAllowlist = ALLOW_POSTS_ONLY;
    let publicAllowlist = ALLOW_ALL;

    // TODO: this could be in a "global component" in cycle-native-navigation
    ssb.settingsUtils.read((err: any, settings?: {showFollows?: boolean}) => {
      if (err) console.error(err);
      else if (settings?.showFollows === false) {
        publicAllowlist = ALLOW_ALL_EXCEPT_CONTACT;
      }
    });

    return {
      updateShowFollows(showFollows: boolean) {
        publicAllowlist = showFollows ? ALLOW_ALL : ALLOW_ALL_EXCEPT_CONTACT;
      },

      publicRawFeed() {
        return pull(
          ssb.deweird.source(['dbUtils', 'rawLogReversed']),
          pull.asyncMap(
            mutateMsgWithLiveExtras(ssb, {
              includeReactions: false,
              includeGatheringInfo: false,
            }),
          ),
        );
      },

      publicFeed(opts: any) {
        return pull(
          ssb.deweird.source(['threads', 'publicSummary'], {
            allowlist: publicAllowlist,
            ...opts,
          }),
          pull.filter((summary: ThreadSummary) => {
            if (isContactMsg(summary.root)) {
              // Only accept blocking or unblocking messages
              const content = summary.root?.value?.content;
              return (
                typeof content?.blocking === 'boolean' &&
                typeof content?.following !== 'boolean'
              );
            } else {
              return true;
            }
          }),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      publicUpdates(followingOnly: boolean) {
        return ssb.threads.publicUpdates({
          allowlist: publicAllowlist,
          following: followingOnly,
        });
      },

      hashtagFeed(hashtag: string) {
        return pull(
          ssb.deweird.source(['threads', 'hashtagSummary'], {
            allowlist: ALLOW_ALL_EXCEPT_CONTACT,
            hashtag,
          }),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      privateFeed(opts: any) {
        return pull(
          ssb.deweird.source(['threads', 'private'], {
            threadMaxSize: 1,
            allowlist: privateAllowlist,
            ...opts,
          }),
          pull.asyncMap(mutatePrivateThreadWithLiveExtras(ssb)),
        );
      },

      privateUpdates() {
        return ssb.threads.privateUpdates({
          allowlist: privateAllowlist,
          includeSelf: true,
        });
      },

      mentionsFeed() {
        return pull(
          ssb.deweird.source(['dbUtils', 'mentionsMe'], {
            old: true,
            live: false,
          }),
          pull.asyncMap(
            mutateMsgWithLiveExtras(ssb, {
              includeReactions: false,
              includeGatheringInfo: false,
            }),
          ),
        );
      },

      searchPublicPosts(text: string) {
        return pull(
          ssb.deweird.source(['searchUtils', 'query'], text),
          pull.asyncMap(
            mutateMsgWithLiveExtras(ssb, {
              includeReactions: false,
              includeGatheringInfo: false,
            }),
          ),
        );
      },

      selfPublicRoots(opts: any) {
        return pull(
          ssb.dbUtils.selfPublicRoots(opts),
          pull.map((root: Msg) => ({root, replyCount: 0} as ThreadSummary)),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      selfReplies(opts: any) {
        return pull(
          ssb.dbUtils.selfPublicReplies(opts),
          pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
        );
      },

      profileFeed(id: FeedId, opts: any) {
        return pull(
          ssb.deweird.source(['threads', 'profileSummary'], {
            id,
            reverse: true,
            live: false,
            threadMaxSize: 3,
            allowlist: publicAllowlist,
            ...opts,
          }),
          pull.asyncMap(mutateThreadSummaryWithLiveExtras(ssb)),
        );
      },

      threadUpdates(opts: {root: FeedId; private: boolean}) {
        return pull(
          ssb.threads.threadUpdates(opts),
          pull.asyncMap(mutateMsgWithLiveExtras(ssb)),
        );
      },

      rehydrateLiveExtras(msg: MsgAndExtras, cb: Callback<MsgAndExtras>) {
        if (!isMsg(msg) || !msg.value) {
          return cb(new Error('not a msg'));
        }
        if (!msg.value._$manyverse$metadata) {
          return cb(new Error('missing live extras metadata'));
        }

        msg.value._$manyverse$metadata.reactions = createReaction$(ssb, msg);

        msg.value._$manyverse$metadata.gatheringAttendees = isGatheringMsg(msg)
          ? createGatheringAttendees$(ssb, msg)
          : undefined;

        msg.value._$manyverse$metadata.gatheringInfo = isGatheringMsg(msg)
          ? createGatheringInfo$(ssb, msg)
          : undefined;
        cb(null, msg);
      },

      thread(opts: {root: FeedId; private: boolean}, cb: Callback<AnyThread>) {
        /**
         * Necessary because the pull-stream "end" happens after "data",
         * in the drain(), and we don't want to override data with "Not Found".
         */
        let answered = false;

        pull(
          ssb.threads.thread(opts),
          pull.asyncMap((t: ThreadData, cb2: Callback<AnyThread>) => {
            if (opts.private) {
              mutatePrivateThreadWithLiveExtras(ssb)(t, cb2);
            } else {
              mutateThreadWithLiveExtras(ssb)(t, cb2);
            }
          }),
          pull.take(1),
          pull.drain(
            (thread: AnyThread) => {
              if (answered) return;
              answered = true;
              cb(null, thread);
            },
            (err: any) => {
              if (answered) return;
              answered = true;
              if (err) cb(err);
              else cb(new Error('Not Found'));
            },
          ),
        );
      },
    };
  },
};

export default () => threadsUtils;

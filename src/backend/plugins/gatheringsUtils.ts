// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Callback} from 'pull-stream';
import {
  FeedId,
  GatheringUpdateContent,
  AttendeeContent,
  Msg,
} from 'ssb-typescript';
import {isAttendeeMsg} from 'ssb-typescript/utils';
const Ref = require('ssb-ref');
const pull = require('pull-stream');
const {
  where,
  live,
  and,
  about,
  isPublic,
  toPullStream,
  toCallback,
} = require('ssb-db2/operators');

type GatheringInfo = Omit<GatheringUpdateContent, 'type'>;

export = {
  name: 'gatheringsUtils',
  version: '1.0.0',
  manifest: {
    gatheringAttendees: 'source',
    gatheringInfo: 'async',
  },
  permissions: {
    master: {
      allow: ['gatheringInfo', 'gatheringAttendees'],
    },
  },
  init: function init(ssb: any) {
    return {
      /**
       * Will fetch all the attending user list
       *
       * @param msgId Gathering event we want the attendees info of
       */
      gatheringAttendees(msgId: string) {
        let gatheringAttendees: Array<FeedId> = [];

        return pull(
          ssb.db.query(
            where(and(about(msgId), isPublic())),
            live({old: true}),
            toPullStream(),
          ),
          pull.filter(
            (about: Msg<AttendeeContent>) =>
              isAttendeeMsg(about) &&
              Ref.isFeedId(about.value.content.attendee.link),
          ),
          pull.map((about: Msg<AttendeeContent>): Array<FeedId> => {
            const {attendee} = about.value.content;

            gatheringAttendees = attendee
              ? attendee.remove
                ? gatheringAttendees.filter(
                    (feedId) => feedId !== attendee.link,
                  )
                : [...gatheringAttendees, attendee.link]
              : gatheringAttendees;

            return gatheringAttendees;
          }),
        );
      },

      /**
       * Will fetch all the About that are linked to a particular gathering
       * event and merge them together to get the current info of the gathering
       *
       * @param msgId Gathering event the abouts should refer too
       */
      gatheringInfo(msgId: string, cb: Callback<GatheringInfo>) {
        return pull(
          ssb.db.query(
            where(and(about(msgId), isPublic())),
            toCallback(
              (
                err: unknown,
                abouts: Array<Msg<GatheringUpdateContent | AttendeeContent>>,
              ) => {
                if (err) {
                  cb(err);
                  return;
                }
                const reducedGatheringInfo = abouts
                  .filter((about) => !isAttendeeMsg(about))
                  .reduce<GatheringInfo>(
                    (gatheringInfo, about) => {
                      return {
                        ...gatheringInfo,
                        ...about.value.content,
                      };
                    },
                    {about: msgId},
                  );
                cb(null, reducedGatheringInfo);
              },
            ),
          ),
        );
      },
    };
  },
};

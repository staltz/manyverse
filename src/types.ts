/**
 * Starts with @
 */
export type FeedKey = string;

/**
 * Starts with %
 */
export type MsgId = string;

/**
 * Starts with &
 */
export type BlobId = string;

export type Msg = {
  key: MsgId;
  value: {
    previous: MsgId;
    author: FeedKey;
    sequence: number;
    timestamp: number;
    hash: 'sha256';
    content: Content;
    signature: string;
  };
  timestamp: number;
};

export type Content = PostContent | ContactContent;

export type PostContent = {
  type: 'post';
  text: string;
  channel: string;

  /**
   * Links
   */
  mentions: Array<any>;
  // root: MsgLink;
  // branch: MsgLink | MsgLinks;
  // recps: FeedLinks;
  // mentions: Links;
};

export type ContactContent = {
  type: 'contact';

  /**
   * FeedLink
   */
  contact: string;
  following: boolean;
  blocking?: boolean;
};

// export type AboutContent = {
//   type: 'about';
//   about: Link;
//   name: String;
//   image: BlobLink;
// };
// { type: 'post-edit', text: String, root: MsgLink, revisionRoot: MsgLink, revisionBranch: MsgLink, mentions: Links }
// { type: 'vote', vote: { link: Ref, value: -1|0|1, reason: String } }
// { type: 'pub', pub: { link: FeedRef, host: String, port: Number  }

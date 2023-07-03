// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

// List of sources from the backend that use a port that we want to access from the client
export const KNOWN_PORT_PURPOSES = ['ssb-serve-blobs'] as const;

export type KnownPortPurpose = typeof KNOWN_PORT_PURPOSES[number];

export function isKnownPortPurpose(name: unknown): name is KnownPortPurpose {
  return (
    typeof name === 'string' &&
    KNOWN_PORT_PURPOSES.includes(name as KnownPortPurpose)
  );
}

function initializeMappings() {
  const ports = new Map<KnownPortPurpose, number>();

  return {
    set(purpose: KnownPortPurpose, port: number) {
      ports.set(purpose, port);
    },
    get(purpose: KnownPortPurpose) {
      const port = ports.get(purpose);
      if (!port) throw new Error(`No port found for ${purpose}`);
      return port;
    },
  };
}

export const portMappings = initializeMappings();

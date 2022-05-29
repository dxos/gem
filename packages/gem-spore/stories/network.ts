//
// Copyright 2020 DXOS.org
//

// God's eye view.

// TODO(burdon): DXN for ID.
type Key = string
type Timeframe = string

/**
 * KUBE node.
 */
export type Kube = {
  id: Key
  services: Service[]
}

/**
 * KUBE service.
 */
export interface Service {
  id: Key
}

/**
 * Bot service.
 */
export interface BotService extends Service {
  bots: Bot[]
}

/**
 * Bot instance (peer of party).
 */
export type Bot = {
  id: Key
  identity: Key
  peerId: Key
  partyKey: Key
  timeframe: Timeframe
}

/**
 * Connected set of peers.
 */
export type Swarm = {
  discoveryKey: Key
  peers: Key[]
}

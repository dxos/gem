//
// Copyright 2020 DXOS.org
//

// TODO(burdon): Fix in D3 Datum?
export interface Datum {
  id: string
}

export interface NodeType {
  id: string;
  type?: string;
  title: string;
}

export interface LinkType {
  id: string;
  type?: string;
  source: string;
  target: string;
}

export interface GraphType {
  nodes: NodeType[];
  links: LinkType[];
}

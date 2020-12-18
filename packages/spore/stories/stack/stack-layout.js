//
// Copyright 2020 DXOS.org
//

import { Layout } from '../../src';

export class StackLayout extends Layout {
  _onUpdate (grid, data) {
    const { nodes = [], links = [] } = data;
    if (nodes.length === 0) {
      return null;
    }

    // TODO(burdon): Get from data model.
    const radius = grid.scaleX(2);

    const center = { x: 0, y: 0 };

    const layout = {
      nodes: [
        Object.assign({}, nodes[0], { ...center, radius }),
        ...nodes.slice(1).map((node) => {
          const { pos: { x, i, n } } = node;
          const a = (Math.PI * 2) / n;
          const cr = grid.scaleX(x * 10);

          return Object.assign({}, node, {
            x: center.x + cr * Math.sin(i * a),
            y: center.y - cr * Math.cos(i * a),
            radius
          };)
        })
      ],

      links
    };

    this._setData(layout);
  }
}

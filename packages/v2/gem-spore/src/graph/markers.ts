//
// Copyright 2022 DXOS.org
//

import * as d3 from 'd3';
import { css } from '@emotion/css';

import { D3Callable } from '@dxos/gem-core';

export const defaultMarkerStyles = css`
  marker {
    path.arrow {
      stroke: #111;
      stroke-width: 0.5px;
      fill: none;
    }
    circle.dot {
      stroke: #111;
      stroke-width: 1px;
      fill: none;
    }
  }
`;

export type MarkerOptions = {
  arrowSize?: number
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
 * https://www.dashingd3js.com/svg-paths-and-d3js
 * http://bl.ocks.org/dustinlarimer/5888271
 *
 * @param arrowSize
 * @param classes
 * @return {function(*): null|undefined}
 */
// TODO(burdon): Generalize for other markers?
export const createMarkers = ({ arrowSize = 10 }: MarkerOptions = {}): D3Callable => group => {
  const length = arrowSize;
  const width = length * 0.6;
  const offset = 0.5; // Offset from end of line.

  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
  return group
    .selectAll('marker')
      .data([
        {
          name: 'arrow-start',
          type: 'path',
          size: arrowSize * 2,
          path: 'M' + [[length, width], [0, 0], [length, -width]].map(p => p.join(',')).join(' L'),
          viewbox: `-${length},-${length},${length * 2},${length * 2}`,
          className: 'arrow',
          offset: -offset
        },
        {
          name: 'arrow-end',
          type: 'path',
          size: arrowSize * 2,
          path: 'M' + [[-length, -width], [0, 0], [-length, width]].map(p => p.join(',')).join(' L'),
          viewbox: `-${length},-${length},${length * 2},${length * 2}`,
          className: 'arrow',
          offset: offset
        },
        {
          name: 'dot',
          type: 'circle',
          size: arrowSize * 2,
          radius: length / 2,
          viewbox: `-${length},-${length},${length * 2},${length * 2}`,
          className: 'dot'
        }
      ])
      .join('marker')
      .attr('id', d => 'marker-' + d.name)
      .attr('markerUnits', 'strokeWidth')
      .attr('markerHeight', d => d.size)
      .attr('markerWidth', d => d.size)
      .attr('viewBox', d => d.viewbox)
      .each((d, i, nodes) => {
        // TODO(burdon): Simplify by providing callables for each shap type.
        const el = d3.select(nodes[i]);
        const { type } = d;
        switch (type) {
          case 'path': {
            el
              .attr('orient', 'auto')
              .attr('refX', d => d.offset ?? 0)
              .attr('refY', 0)
              .append('path')
                .attr('d', d => d.path)
                .attr('class', d => d.className);
            break;
          }

          case 'circle': {
            el
              .append('circle')
                .attr('r', d => d.radius)
                .attr('class', d => d.className);
            break;
          }
        }
      });
};

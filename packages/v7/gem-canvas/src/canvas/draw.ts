//
// Copyright 2021 DXOS.org
//

import * as d3 from 'd3';

import { Bounds, Point, Scale } from '@dxos/gem-x';

import { Circle, Cursor, Element, Line, Path, PathType, Rect } from '../model';
import { D3Callable, D3DragEvent, D3Selection } from '../types';

//
// Element.
//

const getCurve = (type: PathType, closed: boolean) => {
  const curves = {
    open: {
      linear: d3.curveLinear,
      basis: d3.curveBasis,
      cardinal: d3.curveCardinal,
      step: d3.curveStep
    },
    closed: {
      linear: d3.curveLinearClosed,
      basis: d3.curveBasisClosed,
      cardinal: d3.curveCardinalClosed,
      step: d3.curveStep
    }
  };

  return curves[closed ? 'closed' : 'open'][type];
};

/**
 *
 * @param root
 * @param element
 * @param scale
 */
export const createSvgElement = (root: D3Selection, element: Element, scale: Scale) => {
  const { type, data } = element;
  switch (type) {
    case 'circle': {
      const { cx, cy, r } = (data as Circle);

      root.selectAll('circle').data([0]).join('circle')
        .call(d3.drag())
        .attr('cx', scale.mapToScreen(cx))
        .attr('cy', scale.mapToScreen(cy))
        .attr('r', scale.mapToScreen(r));
      break;
    }

    case 'rect': {
      const { x, y, width, height } = (data as Rect);
      root.selectAll('rect').data([0]).join('rect')
        .call(d3.drag())
        .attr('x', scale.mapToScreen(x))
        .attr('y', scale.mapToScreen(y))
        .attr('width', scale.mapToScreen(width))
        .attr('height', scale.mapToScreen(height));
      break;
    }

    case 'line': {
      const { x1, y1, x2, y2 } = (data as Line);
      root.selectAll('line').data([0]).join('line')
        .attr('x1', scale.mapToScreen(x1))
        .attr('y1', scale.mapToScreen(y1))
        .attr('x2', scale.mapToScreen(x2))
        .attr('y2', scale.mapToScreen(y2));
      break;
    }

    case 'path': {
      const { type, closed, points } = (data as Path);
      const curve = getCurve(type, closed);
      const line = curve ? d3.line().curve(curve) : d3.line();
      root.selectAll('path').data([0]).join('path')
        .attr('d', line(points.map(([x, y]) => [scale.mapToScreen(x), scale.mapToScreen(y)])));
      break;
    }
  }
};

//
// Cursor.
//

type Handle = { id: string, p: Point }

const handles: Handle[] = [
  { id: 'n', p: [0, 1] },
  { id: 'ne', p: [1, 1] },
  { id: 'e', p: [1, 0] },
  { id: 'se', p: [1, -1] },
  { id: 's', p: [0, -1] },
  { id: 'sw', p: [-1, -1] },
  { id: 'w', p: [-1, 0] },
  { id: 'nw', p: [-1, 1] }
];

const computeBounds = (bounds: Bounds, handle: Handle, delta: Point): Bounds => {
  let { x, y, width, height } = bounds;

  // Clip direction.
  const { p } = handle;
  const [dx, dy] = [Math.abs(p[0]) * delta[0], Math.abs(p[1]) * delta[1]];

  if (p[0] < 0) {
    width -= dx;
    x += dx;
  } else {
    width += dx;
  }

  if (p[1] < 0) {
    height -= dy;
    y += dy;
  } else {
    height += dy;
  }

  return { x, y, width, height };
};

const handleDrag = (onUpdate: (handle: Handle, delta: Point, end?: boolean) => void): D3Callable => {
  let start: Point;
  let subject: Handle;

  return d3.drag()
    .on('start', (event: D3DragEvent) => {
      subject = event.subject;
      start = [event.x, event.y];
    })
    .on('drag', (event: D3DragEvent) => {
      const current = [event.x, event.y];
      onUpdate(subject, [current[0] - start[0], current[1] - start[1]]);
    })
    .on('end', (event: D3DragEvent) => {
      const current = [event.x, event.y];
      onUpdate(subject, [current[0] - start[0], current[1] - start[1]], true);
    });
};

const outlineDrag = (onUpdate: (delta: Point, end?: boolean) => void): D3Callable => {
  let start: Point;

  return d3.drag()
    .on('start', (event: D3DragEvent) => {
      start = [event.x, event.y];
    })
    .on('drag', (event: D3DragEvent) => {
      const current = [event.x, event.y];
      onUpdate([current[0] - start[0], current[1] - start[1]]);
    })
    .on('end', (event: D3DragEvent) => {
      const current = [event.x, event.y];
      onUpdate([current[0] - start[0], current[1] - start[1]], true);
    });
};

/**
 *
 * @param root
 * @param cursor
 * @param scale
 * @param onUpdate
 */
// TODO(burdon): Show ghost element inside.
export const createSvgCursor = (
  root: D3Selection,
  cursor: Cursor,
  scale: Scale,
  onUpdate: (cursor: Cursor, bounds: Bounds, commit: boolean) => void
) => {
  const bounds = cursor.bounds;

  const x = scale.mapToScreen(bounds.x);
  const y = scale.mapToScreen(bounds.y);
  const width = scale.mapToScreen(bounds.width);
  const height = scale.mapToScreen(bounds.height);

  const cx = x + width / 2;
  const cy = y + height / 2;

  // eslint-disable indent
  root
    .selectAll('rect')
    .data([0])
    .join('rect')
    .call(outlineDrag(([dx, dy], end) => {
      const bounds = {
        x: x + dx,
        y: y + dy,
        width,
        height
      };

      onUpdate(cursor, bounds, end);
    }))
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height);

  root
    .selectAll('circle')
    .data(handles, (d: Handle) => d.id)
    .join('circle')
    .call(handleDrag((handle, delta, end) => {
      const bounds = computeBounds({ x, y, width, height }, handle, delta);
      onUpdate(cursor, bounds, end);
    }))
    .attr('cx', ({ p }) => cx + p[0] * width / 2)
    .attr('cy', ({ p }) => cy + p[1] * height / 2)
    .attr('r', 5); // TODO(burdon): Grow as zoomed.
  // eslint-enable indent
};

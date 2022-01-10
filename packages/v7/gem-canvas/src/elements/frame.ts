//
// Copyright 2022 DXOS.org
//

import * as d3 from 'd3';

import { ViewBounds, Point } from '@dxos/gem-x';

import { D3Callable, D3DragEvent, D3Selection } from '../types';
import { BaseElement } from './base';
import { EventMod, getEventMod } from './drag';

type Handle = { id: string, p: Point, cursor: string }

// https://developer.mozilla.org/en-US/docs/Web/CSS/cursor

const handles: Handle[] = [
  { id: 'n-resize', p: [0, 1], cursor: 'ns-resize' },
  { id: 'ne-resize', p: [1, 1], cursor: 'nesw-resize' },
  { id: 'e-resize', p: [1, 0], cursor: 'ew-resize' },
  { id: 'se-resize', p: [1, -1], cursor: 'nwse-resize' },
  { id: 's-resize', p: [0, -1], cursor: 'ns-resize' },
  { id: 'sw-resize', p: [-1, -1], cursor: 'nesw-resize' },
  { id: 'w-resize', p: [-1, 0], cursor: 'ew-resize' },
  { id: 'nw-resize', p: [-1, 1], cursor: 'nwse-resize' }
];

/**
 * Compute updated bounds by dragging handles.
 * @param bounds
 * @param handle
 * @param delta
 */
const computeBounds = (bounds: ViewBounds, handle: Handle, delta: Point): ViewBounds => {
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
    height += dy;
  } else {
    height -= dy;
    y += dy;
  }

  return { x, y, width, height };
};

/**
 * Handle drag handles.
 * @param onUpdate
 */
const handleDrag = (
  onUpdate: (handle: Handle, delta: Point, mod: EventMod, commit?: boolean) => void
): D3Callable => {
  let start: Point;
  let subject: Handle;

  return d3.drag()
    .on('start', (event: D3DragEvent) => {
      subject = event.subject;
      start = [event.x, event.y];
    })
    .on('drag', (event: D3DragEvent) => {
      const mod = getEventMod(event.sourceEvent);
      const current = [event.x, event.y];
      onUpdate(subject, [current[0] - start[0], current[1] - start[1]], mod);
    })
    .on('end', (event: D3DragEvent) => {
      const mod = getEventMod(event.sourceEvent);
      const current = [event.x, event.y];
      onUpdate(subject, [current[0] - start[0], current[1] - start[1]], mod, true);
    });
};

/**
 * Draw the resizable frame.
 */
export const createFrame = (): D3Callable => {
  return (group: D3Selection, base: BaseElement<any>, active?: boolean, resizable?: boolean) => {
    const { x, y, width, height } = base.createBounds();

    const cx = x + width / 2;
    const cy = y + height / 2;

    // eslint-disable indent
    group.selectAll('rect')
      .data(active ? ['_frame_'] : [])
      .join('rect')
      .classed('frame', true)
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height);

    group
      .selectAll('circle')
      .data(resizable ? handles : [], (handle: Handle) => handle.id)
      .join('circle')
      .call(handleDrag((handle, delta, mod, commit) => {
        const bounds = computeBounds({ x, y, width, height }, handle, delta);
        const data = base.createData(bounds, mod, commit);
        base.onUpdate(data);
      }))
      .classed('frame-handle', true)
      .attr('cursor', h => h.cursor)
      .attr('cx', ({ p }) => cx + p[0] * width / 2)
      .attr('cy', ({ p }) => cy - p[1] * height / 2)
      .attr('r', 5); // TODO(burdon): Grow as zoomed.
    // eslint-enable indent
  };
};
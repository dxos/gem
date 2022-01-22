//
// Copyright 2022 DXOS.org
//

import * as d3 from 'd3';
import type { DragBehavior } from 'd3';

import { Modifiers, Point } from '@dxos/gem-core';

import { D3DragEvent } from '../types';
import { ControlContext } from './control';
import { Connection, getConnection } from './frame';

// TODO(burdon): Factor out events util.
// https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event

// Drag docs:
// https://github.com/d3/d3-drag/blob/main/README.md#drag-events

export const getEventMod = (event: KeyboardEvent): Modifiers => ({
  center: event.metaKey,
  constrain: event.shiftKey
});

/**
 * Drag handler to compute bounds for creating and resizing elements.
 * NOTE: Event (x, y) coordinates are relative the the drag container.
 * https://github.com/d3/d3-drag/blob/main/README.md#drag_container
 * @param context
 * @param onUpdate
 * @param onStart
 */
export const dragBounds = (
  context: ControlContext,
  onUpdate: (
    p1: Point,
    p2: Point,
    mod: Modifiers,
    commit?: boolean,
    source?: Connection,
    target?: Connection
  ) => void,
  onStart?: () => void
): DragBehavior<any, any, any> => {
  let start: Point;
  let source;

  return d3.drag()
    .container(function () {
      return this.closest('svg'); // Container for d3.pointer.
    })
    .on('start', (event: D3DragEvent) => {
      const scale = context.scale();
      source = getConnection(event.sourceEvent);
      start = scale.screen.snapPoint(scale.translate([event.x, event.y]));
      onStart?.();
    })
    .on('drag', (event: D3DragEvent) => {
      const scale = context.scale();
      const mod = getEventMod(event.sourceEvent);
      const current: Point = scale.translate([event.x, event.y]);
      onUpdate(start, current, mod, false, source);
    })
    .on('end', (event: D3DragEvent) => {
      const scale = context.scale();
      const target = getConnection(event.sourceEvent);
      const mod = getEventMod(event.sourceEvent);
      const current = scale.screen.snapPoint(scale.translate([event.x, event.y]));
      onUpdate(start, current, mod, true, source, target);
    });
};

/**
 * Drag handler to compute delta for moving elements.
 * NOTE: Event (x, y) coordinates are relative the the drag container.
 * https://github.com/d3/d3-drag/blob/main/README.md#drag_container
 * @param onMove
 */
export const dragMove = (
  onMove: (delta: Point, mod: Modifiers, commit?: boolean) => void
): DragBehavior<any, any, any> => {
  let start: Point;

  return d3.drag()
    .container(function () {
      return this.closest('svg'); // Container for d3.pointer.
    })
    .on('start', (event: D3DragEvent) => {
      start = [event.x, event.y];
    })
    .on('drag', (event: D3DragEvent) => {
      const mod = getEventMod(event.sourceEvent);
      const current: Point = [event.x, event.y];
      const delta: Point = [current[0] - start[0], current[1] - start[1]];
      if (delta[0] || delta[1]) {
        onMove(delta, mod);
      }
    })
    .on('end', (event: D3DragEvent) => {
      const mod = getEventMod(event.sourceEvent);
      const current: Point = [event.x, event.y];
      const delta: Point = [current[0] - start[0], current[1] - start[1]];
      if (delta[0] || delta[1]) {
        onMove(delta, mod, true);
      }
    });
};

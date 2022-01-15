//
// Copyright 2022 DXOS.org
//

import { Modifiers, FractionUtil, ScreenBounds, Point, Scale, Screen, Vertex, Vector } from '@dxos/gem-x';

import { ElementType, Rect } from '../../model';
import { D3Callable, D3Selection } from '../../types';
import { Control } from '../control';
import { dragMove } from '../drag';
import { createConectionPoints, createFrame } from '../frame';
import { crateText } from './text';

/**
 * Renderer.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
 * @param scale
 */
const createRect = (scale: Scale): D3Callable => {
  return (group: D3Selection, base: Control<Rect>) => {
    const data = base.data;
    const { x, y, width, height } = scale.model.toBounds(data.bounds);
    const { text } = data;

    // eslint-disable indent
    group
      .selectAll('rect')
      .data(['_main_'])
      .join('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)
      .call(selection => {
        // Select.
        // TODO(burdon): Generic.
        if (base.onSelect) {
          selection
            .on('click', () => {
              base.onSelect(true);
            })
            .on('dblclick', () => {
              base.onEdit(true);
            })
        }

        // Move.
        if (base.onUpdate) {
          selection
            .attr('cursor', 'move')
            .call(dragMove((delta: Point, mod: Modifiers, commit?: boolean) => {
              const { x: dx, y: dy } = scale.screen.toVertex(delta);
              const { bounds: { x, y, width, height }, ...rest } = data;
              const moved = {
                x: FractionUtil.add(x, dx),
                y: FractionUtil.add(y, dy),
                width,
                height
              };

              base.onSelect(true);
              base.onUpdate({
                bounds: commit ? scale.model.snapBounds(moved) : moved,
                ...rest
              });
            }));
        }
      });

    const [cx, cy] = Screen.center({ x, y, width, height });
    group
      .call(crateText({ cx, cy, text, editable: base.editing }));
    // eslint-enable indent
  };
};

/**
 * Check not too small.
 * @param data
 * @param commit
 */
const valid = (data: Rect, commit: boolean) => {
  if (commit) {
    const { bounds: { width, height } } = data;
    if (FractionUtil.isZero(width) || FractionUtil.isZero(height)) {
      return;
    }
  }

  return data;
};

/**
 * Rect control.
 */
export class RectControl extends Control<Rect> {
  _frame = createFrame(this.scale);
  _connectors = createConectionPoints(this.scale);
  _main = createRect(this.scale);

  type = 'rect' as ElementType;

  override drawable (): D3Callable {
    return group => {
      group.call(this._main, group.datum());
      group.call(this._connectors, group.datum(), !this.selected && this.hover);
      group.call(this._frame, group.datum(), this.selected, this.selected && this.resizable);
    };
  }

  override getBounds (): ScreenBounds {
    const { bounds } = this.data;
    return this.scale.model.toBounds(bounds);
  }

  override createFromBounds (bounds: ScreenBounds, mod?: Modifiers, commit?: boolean): Rect {
    if (commit) {
      bounds = this.scale.screen.snapBounds(bounds);
    }

    return valid({
      ...this.data,
      bounds: this.scale.screen.toBounds(bounds)
    }, commit);
  }

  getConnectionPoint (): Vertex {
    return Vector.center(this.data.bounds);
  }
}

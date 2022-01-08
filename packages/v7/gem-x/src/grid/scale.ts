//
// Copyright 2020 DXOS.org
//

import type { ZoomTransform } from 'd3';
import { useMemo } from 'react';

import { Bounds, Frac, Num, Point } from '../util';

/**
 * Zoomable scale for grid.
 */
export class Scale {
  private _bounds: Bounds;
  private _transform: ZoomTransform;

  constructor (
    private readonly _gridSize: number
  ) {}

  get bounds () {
    return this._bounds;
  }

  get transform () {
    return this._transform;
  }

  get gridSize () {
    return this._gridSize;
  }

  setBounds (bounds: Bounds): Bounds {
    this._bounds = bounds;
    return this._bounds;
  }

  setTransform (transform: ZoomTransform) {
    this._transform = transform;
  }

  /**
   * Translate point relative to origin.
   * @param x
   * @param y
   */
  translatePoint ([x, y]: Point): Point {
    const { x: tx, y: ty, k } = this._transform || { x: 0, y: 0, k: 1 };
    const { width, height } = this._bounds;
    const [cx, cy] = [width / 2, height / 2];
    return [
      (x - cx - tx) / k,
      (y - cy - ty) / k
    ];
  }

  /**
   * Snap point to grid.
   * @param p
   */
  // TODO(burdon): More efficient?
  snap (p: Point): Point {
    const m = this.mapToModel(p, true);
    return this.mapToScreen(m) as Point;
  }

  /**
   * Map model value to screen value.
   * @param array
   */
  // TODO(burdon): Constrain to fraction only.
  mapToScreen (array: (Num)[]): number[] {
    return array.map(n => Frac.floor(Frac.multiply(n, this._gridSize)));
  }

  /**
   * Map screen values to model values.
   * @param array
   * @param snap
   * @param d
   */
  mapToModel (array: number[], snap = false, d = 1): Num[] {
    if (snap) {
      return array.map(n => Frac.round(n / this._gridSize, d));
    } else {
      return array.map(n => n / this._gridSize);
    }
  }
}

// TODO(burdon): Factor out (hooks).
export const useScale = ({ gridSize = 32 }): Scale => {
  return useMemo<Scale>(() => new Scale(gridSize), []);
};

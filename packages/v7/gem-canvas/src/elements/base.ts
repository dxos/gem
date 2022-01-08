//
// Copyright 2022 DXOS.org
//

import { Bounds, Scale } from '@dxos/gem-x';

import { Element, ElementDataType, ElementType } from '../model';
import { D3Callable } from '../types';
import { EventMod } from './drag';

/**
 * Graphical element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Element#graphics_elements
 */
export abstract class BaseElement<T extends ElementDataType> {
  private _selected = false;

  // TODO(burdon): Manipulate clone until commit.
  private _data;

  constructor (
    private readonly _scale: Scale,
    private readonly _element?: Element<T>,
    private readonly _onSelect?: (element: Element<T>) => void,
    private readonly _onUpdate?: (element: Element<T>) => void,
    private readonly _onCreate?: (type: ElementType, data: T) => void
  ) {
    this._data = this._element?.data;
  }

  get scale () {
    return this._scale;
  }

  get element () {
    return this._element;
  }

  get data () {
    return this._data;
  }

  get selected () {
    return this._selected;
  }

  toString () {
    return `Element(${this._element.id})`;
  }

  setSelected (selected: boolean) {
    this._selected = selected;
  }

  onSelect () {
    this._onSelect?.(this.element);
  }

  onCreate (data: T) {
    this._data = data;
    this._onCreate?.(this.type, this._data);
  }

  onUpdate (data: T) {
    this._data = data;

    // TODO(burdon): Don't update until commit.
    if (this._element) {
      this._element.data = data;
    }

    this._onUpdate?.(this.element);
  }

  abstract readonly type: ElementType;

  /**
   * Create element data from bounds.
   * @param bounds
   * @param mod
   * @param snap
   */
  abstract createData (bounds: Bounds, mod?: EventMod, snap?: boolean): T;

  /**
   * Create bounding box from data.
   */
  abstract createBounds (): Bounds;

  /**
   * Callable renderer.
   */
  abstract draw (): D3Callable;
}

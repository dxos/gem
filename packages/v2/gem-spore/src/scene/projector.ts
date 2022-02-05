//
// Copyright 2021 DXOS.org
//

import { EventEmitter, SvgContext } from '@dxos/gem-core';

/**
 * Generates a layout to be rendered.
 */
export abstract class Projector<DATA, LAYOUT, OPTIONS> {
  public readonly updated = new EventEmitter<{ layout: LAYOUT }>();

  constructor (
    private readonly _context: SvgContext,
    private readonly _options?: OPTIONS
  ) {}

  get context (): SvgContext {
    return this._context;
  }

  get options (): OPTIONS {
    return this._options || {} as OPTIONS;
  }

  update (data: DATA) {
    this.onUpdate(data);
  }

  async start () {
    await this.onStart();
  }

  async stop () {
    await this.onStop();
  }

  protected abstract onUpdate (data: DATA);

  protected async onStart () {}

  protected async onStop () {}
}

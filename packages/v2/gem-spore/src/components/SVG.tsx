//
// Copyright 2022 DXOS.org
//

import React, { ReactNode } from 'react';

import { useSvgContext } from '@dxos/gem-core';

export interface SVGProps {
  children?: ReactNode | ReactNode[];
}

/**
 * SVG wrapper.
 * @param children
 * @constructor
 */
export const SVG = ({
  children,
}: SVGProps) => {
  const context = useSvgContext();
  return (
    <svg ref={context.ref}>
      {children}
    </svg>
  );
};

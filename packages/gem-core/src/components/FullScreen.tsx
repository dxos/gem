//
// Copyright 2018 DXOS.org.org
//

import React, { ReactNode } from 'react';

/**
 * Fullscreen container.
 */
export const FullScreen = ({ children }: { children: ReactNode }) => {
  return (
    <div style={{
      display: 'flex',
      position: 'fixed',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }}>
      {children}
    </div>
  );
};

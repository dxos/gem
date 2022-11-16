//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { FullScreen } from '@dxos/gem-core';

import { Waves } from '../src';

export default {
  title: 'experimental/waves'
};

export const Primary = () => {
  return (
    <FullScreen>
      <Waves />
    </FullScreen>
  );
};

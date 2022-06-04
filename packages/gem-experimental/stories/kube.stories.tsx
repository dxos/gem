//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { FullScreen } from '@dxos/gem-core';

import { Kube } from '../src';

export default {
  title: 'experimental/kube'
};

export const Primary = () => {
  return (
    <FullScreen>
      <Kube
        config={{
          particleCount: 200,
          maxParticleCount: 300
        }}
      />
    </FullScreen>
  );
};

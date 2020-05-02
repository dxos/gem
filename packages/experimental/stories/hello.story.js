//
// Copyright 2020 DxOS, Inc.
//

import React from 'react';
import { withKnobs } from "@storybook/addon-knobs";

import { FullScreen } from '@dxos/react-ux';

import { Hello, Legacy } from '../src';

export default {
  title: 'Experimental',
  decorators: [withKnobs]
};

export const withHello = () => {

  return (
    <FullScreen>
      <Hello />
    </FullScreen>
  );
};

export const withLegacy = () => {

  return (
    <FullScreen>
      <Legacy />
    </FullScreen>
  );
};

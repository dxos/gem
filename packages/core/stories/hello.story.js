//
// Copyright 2020 DxOS, Inc.
//

import React from 'react';
import { withKnobs } from "@storybook/addon-knobs";

import { FullScreen } from '@dxos/react-ux';

export default {
  title: 'Experimental',
  decorators: [withKnobs]
};

export const withHello = () => {

  return (
    <FullScreen>
      <div>Hello</div>
    </FullScreen>
  );
};

//
// Copyright 2020 DXOS.org
//

import { makeStyles } from '@material-ui/core/styles';
import * as colors from '@material-ui/core/colors';
import React, { useRef, useState } from 'react';

import { useLayout, LinkProjector, NodeProjector } from '../../../src';

import { StackLayout } from '../stack-layout';

const useStyles = makeStyles({
  validators: {
    '& path': {
      stroke: colors.blue[500]
    },
    '& .validator circle, & .root circle': {
      fill: colors.blue[400],
      stroke: colors.blue[500]
    },
    '& .full circle': {
      fill: colors.purple[400],
      stroke: colors.purple[500]
    },
    '& .ipfs circle': {
      fill: colors.red[400],
      stroke: colors.red[500]
    },
    '& .signal circle': {
      fill: colors.green[400],
      stroke: colors.green[500]
    },
  }
});

const Stack = ({ data, grid }) => {
  const classes = useStyles();

  const nodes = useRef();
  const links = useRef();

  const [layout] = useState(new StackLayout());

  // TODO(burdon): Extend NodeProjector to handle positional transitions.
  const [nodeProjector] = useState(new NodeProjector({
    node: {
      propertyAdapter: ({ type }) => ({
        class: type
      })
    }
  }));
  const [linkProjector] = useState(new LinkProjector());

  useLayout(layout, grid, data, () => {
    nodeProjector.update(grid, layout.data, { group: nodes.current });
    linkProjector.update(grid, layout.data, { group: links.current });
  });

  return (
    <g className={classes.validators}>
      <g ref={links} />
      <g ref={nodes} />
    </g>
  );
};

export default Stack;

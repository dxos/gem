//
// Copyright 2020 DXOS.org
//

import faker from 'faker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@emotion/css';

import { FullScreen, SvgContainer, useScale } from '@dxos/gem-x';

import {
  Canvas,
  Editor,
  Element,
  Tool,
  Toolbar,
} from '../src';

// TODO(burdon): Remove concept of cursor.
//   - Editor tracks state of selected/editing element.
//   - Each element type has Create/Resize/Normal render modes.
//   - Each mode has element-specific drag handlers and events.
//   - Events handled within each element (separate file).

// TODO(burdon): Grid major/minor colors.
// TODO(burdon): Grid snap while dragging.
// TODO(burdon): Screen vs. model space (fractions); see cursors "wobble" when editing while zoomed (width/height).
// TODO(burdon): Think about undo.
// TODO(burdon): Factor out special cases for path (in handlers).
// TODO(burdon): Toolbar panel (color, line weight, path type, etc.)
// TODO(burdon): Style objects.

export default {
  title: 'gem-canvas/Canvas'
};

const styles = css`
  circle {
    stroke: seagreen;
    stroke-width: 2;
    fill: #EEE;
    opacity: 0.4;
  }

  rect {
    stroke: orange;
    stroke-width: 2;
    fill: #EEE;
    opacity: 0.4;
  }

  line {
    stroke: darkred;
    stroke-width: 2;
    fill: none;
  }

  path {
    stroke: darkblue;
    stroke-width: 2;
    fill: none;
  }
`;

// TODO(burdon): Hook.
const testElements: Element[] = [
  {
    id: faker.datatype.uuid(), type: 'rect', data: { x: -2, y: -1, width: 4, height: 2 }
  },
  {
    id: faker.datatype.uuid(), type: 'circle', data: { cx: 5, cy: 0, r: [1, 1] }
  },
  /*
  {
    id: faker.datatype.uuid(), type: 'rect', data: { x: [4, 1], y: [-2, 1], width: [8, 2], height: [12, 3] }
  },
  {
    id: faker.datatype.uuid(), type: 'line', data: { x1: 0, y1: 0, x2: 6, y2: 0 }
  },
  {
    id: faker.datatype.uuid(), type: 'circle', data: { cx: 0, cy: 0, r: [1, 4] }
  },
  {
    id: faker.datatype.uuid(), type: 'circle', data: { cx: 6, cy: 0, r: [1, 4] }
  },
  {
    id: faker.datatype.uuid(), type: 'path', data: {
      type: 'basis',
      closed: true,
      points: [
        [3, 5],
        [4, 9],
        [-2, 7],
        [-1, 4]
      ]
    }
  }
  */
];

export const Primary = () => {
  const svg = useRef<SVGSVGElement>();
  const scale = useScale({ gridSize: 32 });
  const [tool, setTool] = useState<Tool>(undefined);
  const editor = useMemo(() => {
    const editor = new Editor();
    editor.setElements(testElements);
    return editor;
  }, [scale]);
  useEffect(() => {
    editor.setTool(tool);
  }, [tool]);

  return (
    <FullScreen style={{ backgroundColor: '#F9F9F9' }}>
      <SvgContainer
        ref={svg}
        scale={scale}
        zoom={[1/8, 8]}
        grid
      >
        <Canvas
          className={styles}
          svgRef={svg}
          scale={scale}
          editor={editor}
        />
      </SvgContainer>

      <Toolbar
        active={tool}
        onSelect={(tool) => setTool(tool)}
      />
    </FullScreen>
  );
};

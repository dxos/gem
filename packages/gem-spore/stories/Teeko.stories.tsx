//
// Copyright 2022 DXOS.org
//

import { css } from '@emotion/css';
import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import {
  D3DragEvent,
  FractionUtil,
  FullScreen,
  SVG,
  SVGContextProvider,
  useSvgContext
} from '@dxos/gem-core';

export default {
  title: 'gem-spore/Teeko'
};

const styles = css`
  .board {
    path {
      stroke: #F0F0F0;
      stroke-width: 4px;
    }

    circle {
      fill: #FFF;
      stroke: #F0F0F0;
      stroke-width: 4px;
    }
  }
  
  .stones {
    circle {
      fill: #999;
    }
    circle.black {
      fill: darkblue;
    }
    circle.white {
      fill: darkred;
    }
  }
`;

enum Player {
  Black = 'black',
  White = 'white'
}

type Stone = { id: string, player: Player, x: number, y: number }

type State = { move: number, stones: Stone[], winner?: Player }

const createStones = () => {
  return Array.from({ length: 4 }).reduce<Stone[]>((stones, current, i) => {
    stones.push({
      id: `${Player.White}-${i}`,
      player: Player.White,
      x: i - 1,
      y: 3
    });

    stones.push({
      id: `${Player.Black}-${i}`,
      player: Player.Black,
      x: i - 2,
      y: -3
    });

    return stones;
  }, []);
};

const turn = move => [Player.Black, Player.White][move % 2];

const isValidStone = ({ move, stones, winner }: State, { player, x, y }: Stone) => {
  // Not over.
  if (winner) {
    return false;
  }

  // Correct player.
  if (turn(move) !== player) {
    return false;
  }

  // Move off board first.
  if (Math.abs(x) > 2 || Math.abs(y) > 2) {
    return true;
  }

  return !stones.some(stone => stone.player === player && (Math.abs(stone.x) > 2 || Math.abs(stone.y) > 2));
};

const isValidMove = (state: State, previous: Stone, { x, y }) => {
  // Off board.
  if (Math.abs(x) > 2 || Math.abs(y) > 2) {
    return false;
  }

  // Covered.
  if (state.stones.some(stone => stone.x === x && stone.y === y)) {
    return false;
  }

  // From off board.
  if (Math.abs(previous.x) > 2 || Math.abs(previous.y) > 2) {
    return true;
  }

  // Adjascent.
  const dx = Math.abs(x - previous.x);
  const dy = Math.abs(y - previous.y);
  return (dx <= 1 && dy <= 1);
};

const validPosition = stone => Math.abs(stone.x) <= 2 && Math.abs(stone.y) <= 2;

const isGameOver = (state: State): Player => {
  const player = turn(state.move - 1);
  const pieces = state.stones.filter(stone => stone.player === player && validPosition(stone));
  if (pieces.length < 4) {
    return undefined;
  }

  pieces.sort((p1, p2) => {
    return (p1.x < p2.x) ? -1 : (p1.x > p2.x) ? 1 : (p1.y < p2.y) ? -1 : (p1.y > p2.y) ? 1 : 0;
  });

  // Check if sqaure.
  const [p1, p2, p3, p4] = pieces;
  if (
    ((p1.x === p2.x) && (p3.x === p4.x) && (p1.x === p3.x - 1)) &&
    ((p1.y === p3.y) && (p2.y === p4.y) && (p1.y === p2.y - 1))
  ) {
    return player;
  }

  // Check if in straight line.
  let dx1;
  let dy1;
  for (let i = 1; i < 4; i++) {
    const dx2 = pieces[i].x - pieces[i - 1].x;
    const dy2 = pieces[i].y - pieces[i - 1].y;
    if ((dx1 !== undefined && dx1 !== dx2) || (dy1 !== undefined && dy1 !== dy2)) {
      return undefined;
    }

    dx1 = dx2;
    dy1 = dy2;
  }

  return player;
};

/**
 * Draw board background.
 */
const drawBoard = (el, context) => {
  const points = [];
  for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
      points.push({ x, y });
    }
  }

  const orthogonal = Array.from({ length: 5 }).reduce<any[]>((values, current, i) => {
    values.push([
      [context.scale.model.toValue([-2, 1]), context.scale.model.toValue([i - 2, 1])],
      [context.scale.model.toValue([2, 1]), context.scale.model.toValue([i - 2, 1])]
    ]);

    values.push([
      [context.scale.model.toValue([i - 2, 1]), context.scale.model.toValue([-2, 1])],
      [context.scale.model.toValue([i - 2, 1]), context.scale.model.toValue([2, 1])]
    ]);

    return values;
  }, []);

  const lines = Array.from({ length: 3 }).reduce<any[]>((values, current, i) => {
    values.push([
      [context.scale.model.toValue([1 - i, 1]), context.scale.model.toValue([-2, 1])],
      [context.scale.model.toValue([2, 1]), context.scale.model.toValue([i - 1, 1])]
    ]);
    values.push([
      [context.scale.model.toValue([1 - i, 1]), context.scale.model.toValue([2, 1])],
      [context.scale.model.toValue([-2, 1]), context.scale.model.toValue([i - 1, 1])]
    ]);

    values.push([
      [context.scale.model.toValue([1 - i, 1]), context.scale.model.toValue([-2, 1])],
      [context.scale.model.toValue([-2, 1]), context.scale.model.toValue([1 - i, 1])]
    ]);
    values.push([
      [context.scale.model.toValue([1 - i, 1]), context.scale.model.toValue([2, 1])],
      [context.scale.model.toValue([2, 1]), context.scale.model.toValue([1 - i, 1])]
    ]);

    return values;
  }, orthogonal);

  lines.push([
    [context.scale.model.toValue([-2, 1]), context.scale.model.toValue([-2, 1])],
    [context.scale.model.toValue([2, 1]), context.scale.model.toValue([2, 1])]
  ]);
  lines.push([
    [context.scale.model.toValue([-2, 1]), context.scale.model.toValue([2, 1])],
    [context.scale.model.toValue([2, 1]), context.scale.model.toValue([-2, 1])]
  ]);

  const r = context.scale.model.toValue([1, 3]);

  el
    .selectAll('path')
    .data(lines)
    .join('path')
    .attr('d', d => d3.line()(d as any));

  el
    .selectAll('circle')
    .data(points)
    .join('circle')
    .attr('class', 'point')
    .attr('cx', d => context.scale.model.toValue([d.x, 1]))
    .attr('cy', d => context.scale.model.toValue([d.y, 1]))
    .attr('r', r);
};

/**
 * Draw stones.
 */
const drawStones = (el, context, state: State, onMove) => {
  const r = context.scale.model.toValue([2, 7]);

  // TODO(burdon): Factor out drag.
  let dragging = false;
  const drag = d3.drag()
    .container(function () {
      return this.closest('svg'); // Container for d3.pointer.
    })
    .on('start', function (event: D3DragEvent) {
      dragging = isValidStone(state, event.subject);
    })
    .on('drag', function (event: D3DragEvent) {
      // TODO(burdon): Drag relative to center.
      if (dragging) {
        const [x, y] = d3.pointer(event, d3.select(context.svg).node());
        d3.select(this)
          .raise()
          .attr('cx', x)
          .attr('cy', y);
      }
    })
    .on('end', function (event: D3DragEvent) {
      if (dragging) {
        const [x, y] = d3.pointer(event, d3.select(context.svg).node());
        const snap = context.scale.screen.snapPoint([x, y]);
        const [px, py] = context.scale.screen.toValues(snap);
        onMove(event.subject.id, { x: FractionUtil.toNumber(px), y: FractionUtil.toNumber(py) });
      }
    });

  el
    .selectAll('circle')
    .data(state.stones, d => d.id)
    .join('circle')
    .call(drag)
    .attr('class', d => (state.winner === undefined || state.winner === d.player) && d.player)
    .attr('cx', d => context.scale.model.toValue([d.x, 1]))
    .attr('cy', d => context.scale.model.toValue([d.y, 1]))
    .attr('r', r);
};

/**
 * Board container.
 */
const Board = () => {
  const context = useSvgContext();
  const boardRef = useRef();
  const [state, setState] = useState<State>({ move: 0, stones: createStones() });

  // TODO(burdon): Strange zoom set-up.
  const level = 4;
  useEffect(() => {
    const zoom = d3.zoom().scaleExtent([level, level]);
    zoom.on('zoom', ({ transform }) => {
      context.setTransform(transform); // Fires the resize event (e.g., to update grid).
      d3.select(context.svg).attr('transform', transform as any);
    });

    d3.select(context.svg)
      .call(zoom);

    d3.select(context.svg)
      .transition()
      .call(zoom.transform, d3.zoomIdentity.scale(level));
  }, []);

  useEffect(() => {
    d3.select(boardRef.current)
      .select('.board')
      .call(drawBoard, context);
  }, []);

  useEffect(() => {
    d3.select(boardRef.current)
      .select('.stones')
      .call(drawStones, context, state, (id, { x, y }) => {
        setState(state => {
          const stone = state.stones.find(stone => stone.id === id);
          if (isValidMove(state, stone, { x, y })) {
            const newState = {
              move: state.move + 1,
              stones: state.stones.map(stone => stone.id === id ? Object.assign(stone, { x, y }) : stone)
            };

            const winner = isGameOver(newState);
            return {
              ...newState,
              winner
            };
          } else {
            return {
              move: state.move,
              stones: [...state.stones]
            };
          }
        });
      });
  }, [state]);

  return (
    <g
      ref={boardRef}
      className={styles}
    >
      <g className='board' />
      <g className='stones' />
    </g>
  );
};

export const Primary = () => {
  return (
    <FullScreen>
      <SVGContextProvider>
        <SVG>
          <Board />
        </SVG>
      </SVGContextProvider>
    </FullScreen>
  );
};

import React, { PureComponent } from 'react';
import { Field, Cell } from './Field';
import { genRandomField, CELL_STATE } from '../helpers/field'
import './DashBoard.less';
// images for cells
import hitImg from '../assets/hit.png';
import missImg from '../assets/miss.png';
// images for ships
import battleshipImg from '../assets/battleship-shape.png';
import cruiserImg from '../assets/cruiser-shape.png';
import carrierImg from '../assets/carrier-shape.png';

import { ShipBoard } from './ShipBoard';


const cellAttrs = {
  [CELL_STATE.MISS]: { tag: 'image', xlinkHref: missImg },
  [CELL_STATE.HIT]: { tag: 'image', xlinkHref: hitImg }
};

const shipsLayout = [
  {name:'Itype', size: 4, image: battleshipImg },
  {name:'Ltype', size: 3, image: cruiserImg },
  {name:'DotType', size: 1, image: carrierImg }
];

const GAME_STATE = {
  PLAYER_TURN: 'true',
  OVER: 'over'
};

const FIELD_SIZE = 10;

export class DashBoard extends PureComponent {

  state = {
    size: FIELD_SIZE,
    gameState: GAME_STATE.PLAYER_TURN,
    ...this.reset()
  }

  /**
   * Update cell on a given field
   * @param {Array<Array<Object>>} field - field to update
   * @param {number} x - x coordinate of cell to update
   * @param {number} y - y coordinate of cell to update
   * @param {any} data - data to update
   * @returns {Array<Array<Object>>}
   */
  updateCell(field, x, y, data = {}) {
    if (!field || !field[x] || !field[x][y]) {
      return field;
    }
    const newField = field.slice();
    newField[x] = newField[x].map((c, i) => i === y ? { ...c, ...data }: c);
    return newField;
  }
  /**
   * Update ship and return fresh ships array
   * @param {Array<Object>} ships - ships to update
   * @param {number} index - ship to update
   * @param {any} data - data to change
   * @returns {Array<Object>}
   */
  updateShip(ships, index, data = {}) {
    if (!ships || !ships[index]) {
      return ships;
    }
    const newShips = ships.slice();
    newShips[index] = {
      ...newShips[index],
      ...data
    }
    return newShips;
  }

  /**
   * Perform player stroke and return a new player state
   * @param {Object} state - previous player state
   * @param {Object} cell - cell to update
   * @returns {Object} new  state or nothing if nothing to update
   */
  play({ field, ships }, cell) {
    if (cell.state === CELL_STATE.EMPTY || cell.state === CELL_STATE.SHIP) {
      const newField = this.updateCell(field, cell.x, cell.y, { state: cell.state === CELL_STATE.SHIP ? CELL_STATE.HIT : CELL_STATE.MISS });
      const newShips = cell.ship !== -1 ? this.updateShip(ships, cell.ship, { life: ships[cell.ship].life - 1 }) : ships;
      return {
        gameState: newShips.every(ship => ship.life === 0) ? GAME_STATE.OVER : GAME_STATE.PLAYER_TURN,
        player: {
          field: newField,
          ships: newShips
        }
      }
    }
  }
  /**
   * Reset game state
   * @returns {Object} fresh game state
   */
  reset() {
    return {
      gameState: GAME_STATE.PLAYER_TURN,
      [GAME_STATE.PLAYER_TURN]: genRandomField(FIELD_SIZE, shipsLayout)
    }
  }
  /**
   * Handle game actions
   * @param {any} data - action data
   */
  handleAction = (data) => {
    this.setState(state => {
      switch (state.gameState) {
        case GAME_STATE.OVER:
          return this.reset();
        case GAME_STATE.PLAYER_TURN:
          const {x, y} = data;
          const playerState = state[state.gameState]
          const cell = playerState.field[x][y];
          const result = this.play(playerState, cell);
          return result && {
            gameState: result.gameState,
            [state.gameState]: result.player
          };
        default:console.log('something went wrong');
          return;
      }
    })
  }
  getCells(field) {
    return [].concat(...field).filter(cell => cell.state === CELL_STATE.MISS || cell.state === CELL_STATE.HIT)
  }

  renderCell = (cell) => {
    const { x, y } = cell;
    return <Cell key={`cell-${x}-${y}`} x={x} y={y} {...(cellAttrs[cell.state] || {})} />
  }
  render() {
    const { gameState } = this.state;
    const isGameOver =  gameState === GAME_STATE.OVER;
    const playerName = isGameOver ? GAME_STATE.PLAYER_TURN : gameState;
    const cells = this.getCells(this.state[playerName].field);

    return (

      <div className="dashboard" {...this.props}>
        <div className="main-board">
          <p>There are 3 ships in the game, try to kill them all!</p>
          <ShipBoard className="main-shipboard" ships={this.state[playerName].ships} />
        </div>
        <div className="play-field player-1">
          <Field onCellClick={this.handleAction} renderCell={this.renderCell} cells={cells} />
          {isGameOver ? (
            <div className="game-over">
              Game over <br/>
              <button type="button" className="reset-button" onClick={this.handleAction}>Restart</button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

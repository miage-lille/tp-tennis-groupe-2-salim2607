import { Player, stringToPlayer } from './types/player';
import {
  Point,
  PointsData,
  Score,
  points,
  deuce,
  advantage,
  game,
  forty,
  fifteen,
  thirty,
} from './types/score';
import type { FortyData } from './types/score';
import { pipe, Option } from 'effect'

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return stringToPlayer('PLAYER_TWO');
    case 'PLAYER_TWO':
      return stringToPlayer('PLAYER_ONE');
  }
};
// Exercice 1 :
export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE':
      return 'Love';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
  }
};

export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS': {
      const { PLAYER_ONE: p1, PLAYER_TWO: p2 } = score.pointsData;
      return `${pointToString(p1)} - ${pointToString(p2)}`;
    }
    case 'FORTY': {
      const { player, otherPoint } = score.fortyData;
      return player === 'PLAYER_ONE'
        ? `40 - ${pointToString(otherPoint)}`
        : `${pointToString(otherPoint)} - 40`;
    }
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      return `Advantage ${playerToString(score.player)}`;
    case 'GAME':
      return `Game ${playerToString(score.player)}`;
  }
};

const isSamePlayer = (a: Player, b: Player) => a === b;

export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);

export const scoreWhenAdvantage = (
  advantagedPlayer: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayer, winner)) return game(winner);
  return deuce();
};

export const incrementPoint = (point: Point): Option.Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return Option.some(fifteen());
    case 'FIFTEEN':
      return Option.some(thirty());
    case 'THIRTY':
      return Option.none();
  }
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);

  return pipe(
    incrementPoint(currentForty.otherPoint),
    Option.match({
      onNone: () => deuce(),
      onSome: (p) => forty(currentForty.player, p),
    })
  );
};

// Exercice 2
// Tip: You can use pipe function from Effect to improve readability.
// See scoreWhenForty function above.
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  const winnerPoint = winner === 'PLAYER_ONE' ? current.PLAYER_ONE : current.PLAYER_TWO;
  const otherPoint = winner === 'PLAYER_ONE' ? current.PLAYER_TWO : current.PLAYER_ONE;

  return pipe(
    incrementPoint(winnerPoint),
    Option.match({
      onNone: () => forty(winner, otherPoint),
      onSome: (p) =>
        winner === 'PLAYER_ONE' ? points(p, otherPoint) : points(otherPoint, p),
    })
  );
};

// Exercice 3
export const scoreWhenGame = (winner: Player): Score => game(winner);

export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'GAME':
      return currentScore;
  }
};

import { describe, expect, test } from '@jest/globals';
import {
  otherPlayer,
  playerToString,
  pointToString,
  scoreToString,
  scoreWhenDeuce,
  scoreWhenAdvantage,
  scoreWhenForty,
  scoreWhenPoint,
} from '..';
import { stringToPlayer } from '../types/player';
import {
  deuce,
  advantage,
  game,
  forty,
  points,
  love,
  fifteen,
  thirty,
} from '../types/score';

describe('Tests for tooling functions', () => {
  test('Given playerOne when playerToString', () => {
    expect(playerToString('PLAYER_ONE')).toStrictEqual('Player 1');
  });

  test('Given playerOne when otherPlayer', () => {
    expect(otherPlayer('PLAYER_ONE')).toStrictEqual('PLAYER_TWO');
  });

  test('pointToString maps points to expected strings', () => {
    expect(pointToString(love())).toStrictEqual('Love');
    expect(pointToString(fifteen())).toStrictEqual('15');
    expect(pointToString(thirty())).toStrictEqual('30');
  });

  test('scoreToString formats scores correctly', () => {
    expect(scoreToString(points(fifteen(), love()))).toStrictEqual('15 - Love');
    expect(scoreToString(deuce())).toStrictEqual('Deuce');
    expect(scoreToString(advantage(stringToPlayer('PLAYER_ONE')))).toStrictEqual(
      'Advantage Player 1'
    );
    expect(scoreToString(game(stringToPlayer('PLAYER_TWO')))).toStrictEqual(
      'Game Player 2'
    );
  });
});

describe('Tests for transition functions', () => {
  test('Given deuce, score is advantage to winner', () => {
    ['PLAYER_ONE', 'PLAYER_TWO'].forEach((w) => {
      const p = stringToPlayer(w);
      expect(scoreWhenDeuce(p)).toStrictEqual(advantage(p));
    });
  });

  test('Given advantage when advantagedPlayer wins, score is Game avantagedPlayer', () => {
    ['PLAYER_ONE', 'PLAYER_TWO'].forEach((adv) => {
      const advantagedPlayer = stringToPlayer(adv);
      const score = scoreWhenAdvantage(advantagedPlayer, advantagedPlayer);
      expect(score).toStrictEqual(game(advantagedPlayer));
    });
  });

  test('Given advantage when otherPlayer wins, score is Deuce', () => {
    ['PLAYER_ONE', 'PLAYER_TWO'].forEach((adv) => {
      const advantagedPlayer = stringToPlayer(adv);
      const winner = otherPlayer(advantagedPlayer);
      const score = scoreWhenAdvantage(advantagedPlayer, winner);
      expect(score).toStrictEqual(deuce());
    });
  });

  test('Given a player at 40 when the same player wins, score is Game for this player', () => {
    ['PLAYER_ONE', 'PLAYER_TWO'].forEach((winner) => {
      const fortyData = {
        player: stringToPlayer(winner),
        otherPoint: thirty(),
      };
      const score = scoreWhenForty(fortyData, stringToPlayer(winner));
      expect(score).toStrictEqual(game(stringToPlayer(winner)));
    });
  });

  test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
    ['PLAYER_ONE', 'PLAYER_TWO'].forEach((winner) => {
      const fortyData = {
        player: otherPlayer(stringToPlayer(winner)),
        otherPoint: thirty(),
      };
      const score = scoreWhenForty(fortyData, stringToPlayer(winner));
      expect(score).toStrictEqual(deuce());
    });
  });

  test('Given player at 40 and other at 15 when other wins, score is 40 - 30', () => {
    ['PLAYER_ONE', 'PLAYER_TWO'].forEach((winner) => {
      const fortyData = {
        player: otherPlayer(stringToPlayer(winner)),
        otherPoint: fifteen(),
      };
      const score = scoreWhenForty(fortyData, stringToPlayer(winner));
      expect(score).toStrictEqual(forty(fortyData.player, thirty()));
    });
  });

  // -------------------------TESTS POINTS-------------------------- //
  test('Given players at 0 or 15 points score kind is still POINTS', () => {
    const cases = [
      { current: points(love(), love()), winner: 'PLAYER_ONE', expected: points(fifteen(), love()) },
      { current: points(fifteen(), love()), winner: 'PLAYER_ONE', expected: points(thirty(), love()) },
    ];
    cases.forEach(({ current, winner, expected }) => {
      const newScore = scoreWhenPoint(current.pointsData, stringToPlayer(winner));
      expect(newScore).toStrictEqual(expected);
    });
  });

  test('Given one player at 30 and win, score kind is forty', () => {
    const cases = [
      { current: points(thirty(), love()), winner: 'PLAYER_ONE', expected: forty(stringToPlayer('PLAYER_ONE'), love()) },
      { current: points(love(), thirty()), winner: 'PLAYER_TWO', expected: forty(stringToPlayer('PLAYER_TWO'), love()) },
    ];
    cases.forEach(({ current, winner, expected }) => {
      const newScore = scoreWhenPoint(current.pointsData, stringToPlayer(winner));
      expect(newScore).toStrictEqual(expected);
    });
  });
});

import { forEach } from 'lodash';
import uuid from 'react-native-uuid';

import { UpgradeDeckResult } from '@lib/authApi';
import { Deck, DeckProblemType, DeckMeta, Slots } from '@actions/types';

export function newLocalDeck(
  id: number,
  name: string,
  investigator_code: string,
  slots: Slots,
  tabooSetId?: number,
  meta?: DeckMeta,
  problem?: DeckProblemType,
  description_md?: string
): Deck {
  const timestamp = (new Date()).toISOString();
  return {
    id,
    description_md,
    date_creation: timestamp,
    date_update: timestamp,
    name,
    investigator_code,
    slots,
    meta,
    taboo_id: tabooSetId,
    ignoreDeckLimitSlots: {},
    local: true,
    uuid: uuid.v4(),
    problem,
    version: '0.1',
  };
}

export function updateLocalDeck(
  deck: Deck,
  name: string,
  slots: Slots,
  ignoreDeckLimitSlots: Slots,
  problem: DeckProblemType,
  spentXp?: number,
  xp_adjustment?: number,
  tabooSetId?: number,
  meta?: DeckMeta,
  description_md?: string
): Deck {
  const versionParts = (deck.version || '0.1').split('.');
  // @ts-ignore
  versionParts[1]++;
  const timestamp = (new Date()).toISOString();
  return {
    ...deck,
    name,
    date_update: timestamp,
    slots,
    ignoreDeckLimitSlots,
    problem,
    spentXp,
    xp_adjustment: xp_adjustment || 0,
    version: versionParts.join('.'),
    taboo_id: tabooSetId,
    meta,
    description_md,
  };
}

export function upgradeLocalDeck(
  id: number,
  deck: Deck,
  xp: number,
  exiles: string[]
): UpgradeDeckResult {
  const versionParts = (deck.version || '0.1').split('.');
  // @ts-ignore
  versionParts[0]++;
  // @ts-ignore
  versionParts[1] = 0;
  const slots = Object.assign({}, deck.slots);
  forEach(exiles, code => {
    slots[code]--;
    if (slots[code] <= 0) {
      delete slots[code];
    }
  });
  const timestamp = (new Date()).toISOString();
  return {
    deck: {
      ...deck,
      next_deck: id,
    },
    upgradedDeck: {
      ...deck,
      id,
      uuid: uuid.v4(),
      slots,
      date_creation: timestamp,
      date_update: timestamp,
      problem: exiles.length ? 'too_few_cards' : deck.problem,
      xp: xp + (deck.xp || 0) + (deck.xp_adjustment || 0) - (deck.spentXp || 0),
      xp_adjustment: 0,
      spentXp: 0,
      version: versionParts.join('.'),
      previous_deck: deck.id,
      exile_string: exiles && exiles.length ? exiles.join(',') : '',
    },
  };
}

export default {
  newLocalDeck,
  updateLocalDeck,
  upgradeLocalDeck,
};

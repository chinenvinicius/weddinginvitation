/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Parent {
  name: string;
}

export interface Sponsor {
  number: number;
  name: string;
}

export interface WeddingPartyList {
  bridesmaids: string[];
  groomsmen: string[];
  flowerMaidens: string[];
}

export interface EntourageKidsAndBearers {
  flowerGirls: string[];
  escorts: string[];
  littleBride: string;
  littleGroom: string;
  ringBearer: string;
  bibleBearer: string;
  bannerBearers: string[];
  candleLighters: string;
}

export interface ProgramRoles {
  officiatingMinister: string;
  emcee: string;
  singers: string[];
  programCoordinator: string;
  usherettes: string[];
}

export interface GuestWish {
  id: string;
  name: string;
  relationship: 'Friend' | 'Family' | 'Entourage' | 'Sponsor';
  message: string;
  attendance: 'attending' | 'not_attending' | 'undecided';
  createdAt: string;
}

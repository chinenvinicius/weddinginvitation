/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Parent, Sponsor, WeddingPartyList, EntourageKidsAndBearers, ProgramRoles } from './types';

export const groomParents: Parent[] = [
  { name: "Decio Yochimasa Chinen" },
  { name: "Terezina Chinen" }
];

export const brideParents: Parent[] = [
  { name: "Hermie C. Goyo" },
  { name: "Bernardita S. Goyo" }
];

export const principalSponsors: Sponsor[] = [
  { number: 1, name: "Mr. and Mrs. Peter Salvan" },
  { number: 2, name: "Mr. and Mrs. Jerry Cuyos" },
  { number: 3, name: "Mr. and Mrs. Jonel Seraspe" },
  { number: 4, name: "Mr. and Mrs. Bhots Montero" },
  { number: 5, name: "Mr. and Mrs. Eleazar Illustrisimo" },
  { number: 6, name: "Mr. and Mrs. Winnie Berago" },
  { number: 7, name: "Mr. and Mrs. Daniel Barilla" },
  { number: 8, name: "Mr. and Mrs. Al Laude" },
  { number: 9, name: "Mr. and Mrs. Jose Abelita" },
  { number: 10, name: "Mr. Juseven Austero" },
  { number: 11, name: "Mr. and Mrs. Hiromitsu Nakamura" },
  { number: 12, name: "Mr. and Mrs. Rhoen Shane P. Catolico" },
  { number: 13, name: "Mr. and Mrs. Emeliano Jr. Gultiano" },
  { number: 14, name: "Mr. and Mrs. Concordio Apa-ap" },
  { number: 15, name: "Mr. and Mrs. Robert Goyo" },
  { number: 16, name: "Mr. and Mrs. Gerardo Soejima" },
  { number: 17, name: "Mr. and Mrs. Melzar Dagangon" },
  { number: 18, name: "Mr. and Mrs. Roxie Pido" },
  { number: 19, name: "Mr. and Mrs. Samuel Frigillano" },
  { number: 20, name: "Mr. and Mrs. Johnny Tagsa" },
  { number: 21, name: "Mr. and Mrs. Raul Tayabas" },
  { number: 22, name: "Mr. and Mrs. Yajiro Soejima SR." },
  { number: 23, name: "Mr. and Mrs. Genithon Conales" },
  { number: 24, name: "Mr. and Mrs. Famelito Umapas" },
  { number: 25, name: "Mr. and Mrs. Lito Orozco" },
  { number: 26, name: "Mr. and Mrs. Marlon Dobluis" },
  { number: 27, name: "Mr. and Mrs. Samuel Sanchez" },
  { number: 28, name: "Mrs. Joey Amoguis" },
  { number: 29, name: "Mr. and Mrs. Bernard Gultiano" },
  { number: 30, name: "Mr. and Mrs. Joel Damasco" }
];

export const secondarySponsors = {
  matronOfHonor: "Geraldine S. Librea",
  bestMan: "Wendell B. Librea"
};

export const weddingParty: WeddingPartyList = {
  bridesmaids: [
    "Beatriz Okada",
    "Caroline Natsumy Chinen",
    "Maricel Soejima",
    "April Mae Perez",
    "Kenneth Joy Soejima",
    "Sheena Angelika Soejima",
    "Sheena Angela Soejima",
    "Sheena Claire Soejima"
  ],
  groomsmen: [
    "Cleverson Okada",
    "Vitor Felipe Chinen",
    "Yajiro Soejima Jr.",
    "Darryl Gem Cuyos",
    "Donuel Soejima",
    "Ernest John Seraspe",
    "Zoe Jigs Montero",
    "Ojie Hananiel Cuyos"
  ],
  flowerMaidens: [
    "Krisha Mae Vasquez",
    "Princess Jheuel Soejima",
    "Sheena Alyajnna Soejima",
    "Vina Aisha Yuri Madamba",
    "Joana Yukari Okada",
    "Rebeca Yurika Okada"
  ]
};

export const childEntourageAndBearers: EntourageKidsAndBearers = {
  flowerGirls: [
    "Aiko Arendain",
    "Freyja Myrrh Sagarino",
    "Haruka Canada",
    "Akeisha Vasquez",
    "Sofia Chinen"
  ],
  escorts: [
    "Yujiro Sagarino",
    "Pedro Minato Okada",
    "Zajirou Bitgue",
    "Yuie Ichiro Soejima",
    "Kaizen Zion Soejima"
  ],
  littleBride: "Sheena Cassandra Soejima",
  littleGroom: "Erick Chinen",
  ringBearer: "Sica Ephraim Lajera",
  bibleBearer: "Akio Arendain",
  bannerBearers: [
    "Felipe Mitsuki Okada",
    "Zaina Rei Bitgue",
    "Aika Arendain"
  ],
  candleLighters: "Mr. and Mrs. Emannuel Soejima"
};

export const programRoles: ProgramRoles = {
  officiatingMinister: "Ptr. Guenjie Imayuki",
  emcee: "Melchie U. Salvan",
  singers: [
    "Shaira Delos Reyes",
    "John Mark Monsing",
    "Neovy love Soejima"
  ],
  programCoordinator: "Mary Jane O. Nakano",
  usherettes: [
    "Shaina Sweet Delos Reyes",
    "Ivy Ababa",
    "Lyndi Lee Cuyos"
  ]
};

export const dressCodeColorsGown = [
  { name: "Light Sage", hex: "#B7C6A9" },
  { name: "Soft Sage", hex: "#9CAF88" },
  { name: "Medium Sage", hex: "#7C9268" },
  { name: "Dark Sage", hex: "#556B45" },
  { name: "Forest Green", hex: "#34492E" }
];

export const dressCodeColorsSuit = [
  { name: "Dusty Rose", hex: "#B98D97" },
  { name: "Muted Burgundy", hex: "#A26B77" },
  { name: "Rich Burgundy", hex: "#8A4A58" },
  { name: "Deep Maroon", hex: "#5C2231" },
  { name: "Dark Raisin", hex: "#3E1620" }
];

import { Text, TextInput } from 'react-native';
import React from 'react';

// Warm reading-room palette
export const C = {
  paper: '#F1E9DA',
  paperDeep: '#E6DBC6',
  page: '#FBF6EA',
  pageShade: '#EFE5CF',
  ink: '#2A211D',
  inkSoft: '#6B5D53',
  inkFaint: '#A39485',
  burgundy: '#7B2433',
  burgundyDeep: '#5A1824',
  green: '#3E5C48',
  greenSoft: '#8FA58A',
  greenPale: '#DCE5D6',
  gold: '#B8923F',
  wood: '#A88763',
  woodDark: '#6F523A',
  woodDeep: '#4A3627',
  woodLight: '#C9AE8A',
  line: 'rgba(42,33,29,0.14)',
};

export const FONT = 'Raleway';

export const SPINE_COLORS = [
  '#7B2433', '#3E5C48', '#3B4A5A', '#D9C9A6', '#B5823A', '#A4593F',
  '#8FA58A', '#5B3A4E', '#56706C', '#C28B86', '#3A3330',
];

export function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

// Every piece of text in the app goes through these so the supplied
// Raleway ExtraLight face is used everywhere.
export const T = React.forwardRef(({ style, ...p }, ref) => (
  <Text ref={ref} {...p} style={[{ fontFamily: FONT, color: C.ink, fontSize: 14 }, style]} />
));
export const TI = React.forwardRef(({ style, ...p }, ref) => (
  <TextInput
    ref={ref}
    placeholderTextColor={C.inkFaint}
    selectionColor={C.burgundy}
    {...p}
    style={[{ fontFamily: FONT, color: C.ink, fontSize: 14 }, style]}
  />
));

export const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

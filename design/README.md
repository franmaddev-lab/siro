# SiRo Sign font

Capitals traced from the MANGIA & BEVI and CAFÉ BISTROT lettering on SiRo's wall sign
(photo in the first chat upload). Letters not on the sign (D H J K L P Q U W X Y Z and
punctuation) are built from the traced strokes or drawn to match. Lowercase maps to the capitals.

- `SiRoSign.otf`: desktop font. The site uses `public/fonts/siro-sign.woff2`.
- `extract.py`, `build_glyphs.py`, `build_font.py`: how it was made (need the traced logo mask,
  potrace and fontTools). Digits are not included; they fall back to the body font.

# Shelfwise — a virtual home library (React Native + Expo)

A calm, reading-room style app for cataloguing a home library: shelves you can
sort, a rotating 3D bookcase that fills as you add books, open-book previews with
notes / quotes / characters, a loans ledger and a pages-based reading schedule.
All data is simulated on first launch (and saved on-device with AsyncStorage).

## Run it with Expo Go

1. Install Node 18+ and the **Expo Go** app on your phone (iOS App Store / Google Play).
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code (Camera app on iOS, Expo Go on Android). Phone and computer must be on the same Wi-Fi
   (or use `npx expo start --tunnel`).

The checked-in dependencies target Expo SDK 57 and React Native 0.86. Use an Expo client compatible with the declared SDK. The original README's SDK 54 claim was stale. Dependency compatibility and app startup have not yet been verified.

## What's inside

| Area | Where |
| --- | --- |
| **Shelves** – filter by All / Reading / Read / Favorites / Lent out / Borrowed; sort A–Z, Genre, Author (books slide to new spots). Lent books leave an empty slot, borrowed books carry a hanging tag. | `src/screens/ShelvesScreen.js` |
| **Library (3D)** – four-sided bookcase (Collection, Now reading, Favorites, Loans). Drag to rotate or tap a chip. Books drop onto the shelves one by one; the "case filled" gauge grows as you add. Loans face + ledger. | `src/components/Bookcase3D.js`, `src/screens/LibraryScreen.js` |
| **Open-book preview** – tap any spine: it slides forward, a cover grows out of it and opens into a spread with progress + draggable bookmark, status, favorite, loan controls, and turn-the-page tabs for Notes / Quotes / Cast. Quotes also peek out as paper slips at the top edge of the pages. | `src/components/BookPreview.js` |
| **Schedule** – daily page goal, today's ring, 7-day chart, streak, per-book finish plan (pages/day), quick page logging. | `src/screens/ScheduleScreen.js` |
| **Add books** – “+” button: manual entry or a simulated scan import. | `src/components/AddBook.js` |
| Simulated data | `src/data/seed.js` |

## Typography

Every piece of text uses the supplied **Raleway ExtraLight** (`assets/fonts/Raleway-ExtraLight.ttf`),
registered as `Raleway` in `App.js` and applied through the `T` / `TI` components in `src/theme.js`.
Only one weight was supplied, so hierarchy comes from size, letter-spacing, case and colour.
Placeholder copy is Lorem Ipsum.

## Reset the demo data

Clear the app's storage (or reinstall Expo Go's project) to return to the seeded library.

## Validation and scope

This is a prototype with seeded library data and local AsyncStorage persistence. The bookcase uses SVG and view transforms for a 3D-style effect. Scan import is simulated. Dependency installation, native device rendering and web export remain unverified.

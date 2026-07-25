# 🌙 Sweet Dreams

A cosy bedtime ritual PWA for families. Parents log small achievements throughout the day; at bedtime, parent and child walk through a guided review together — collecting trophies, watching a rewards path light up, picking a memory photo, and setting a goal for tomorrow.

Built with React, Firebase (auth, Firestore, Storage), and PWA tech so it installs to a home screen on iPhone or iPad.

---

## What's in here

```
sweet-dreams/
├── src/
│   ├── firebase/config.js          ← your Firebase project keys
│   ├── contexts/                   ← auth & household state
│   ├── components/                 ← shared bits (starfield, moon, photo upload)
│   ├── screens/
│   │   ├── setup/                  ← sign in, sign up, household, child, rewards
│   │   ├── parent/                 ← home, log achievement, prep, settings, rewards manager
│   │   ├── review/                 ← bedtime flow + 9 step screens
│   │   └── archive/                ← memory book, trophy shelf
│   ├── utils/                      ← constants, image upload helpers
│   ├── App.jsx                     ← routing
│   └── main.jsx
├── public/icons/                   ← PWA icons (svg + 192/512 png)
├── firestore.rules                 ← deploy these to Firebase
├── storage.rules                   ← deploy these to Firebase
├── vite.config.js                  ← PWA manifest config
├── netlify.toml                    ← SPA redirect for Netlify
└── package.json
```

---

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

To test the production build:
```bash
npm run build
npm run preview
```

---

## Deploy

### 1. Push to GitHub

```bash
cd sweet-dreams
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sweet-dreams.git
git push -u origin main
```

### 2. Connect Netlify

1. Go to https://app.netlify.com → **Add new site → Import from Git**
2. Pick your `sweet-dreams` repo
3. Build settings should auto-detect from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Hit **Deploy site**
5. Once it's live, **Domain settings → Change site name** to something memorable (e.g. `your-family-sweet-dreams.netlify.app`)

### 3. Add the Netlify domain to Firebase

In the Firebase Console → **Authentication → Settings → Authorized domains**, add your Netlify URL (e.g. `your-family-sweet-dreams.netlify.app`). Otherwise sign-in will fail.

### 4. Deploy the security rules

In the Firebase Console:
- **Firestore Database → Rules tab** → paste the contents of `firestore.rules` → **Publish**
- **Storage → Rules tab** → paste the contents of `storage.rules` → **Publish**

---

## Install to home screen

Open the deployed site on iPhone/iPad in Safari → **Share → Add to Home Screen**. It runs full-screen like a native app, with the moon icon and dark splash screen.

(Same flow on Android via Chrome's "Install app" option.)

---

## How to use it

### First time setup
1. Sign up with your email
2. Create the family (you'll be the admin)
3. Add your child's name and pick their animal avatar
4. Confirm or customise the 3 default rewards

### Daily flow
- **Throughout the day:** open the app → Log an achievement when something good happens
- **Before bedtime:** open Tonight's prep → pick who they were with today, add 1–3 photo options, set a goal for tomorrow
- **At bedtime (on the iPad):** open Bedtime review → hand the iPad over → walk through it together

### Adding another grown-up
1. Family settings → copy the invite code
2. The other adult signs up with their own email
3. After signing up, they pick "Join an existing family" and paste the code

The code is your household ID; it's a long random string.

---

## Tweaks you might want later

- **Reward thresholds** — Rewards path → admin can drag/edit/delete rewards anytime. If 5 coins feels too easy, bump it to 10.
- **Coin values** — When logging an achievement, you can award 1, 2, 3, or 5 coins. Default is 1.
- **Proud-moment presets** — currently 8 hardcoded in `src/utils/constants.js` (look for `PROUD_PRESETS`). Easy to edit.
- **Achievement categories** — hardcoded in the same file as `CATEGORIES`. Edit/add as you like.

---

## Firebase project

This is wired to project `sweetdreams-bcddc` (London region). If you ever want to fork this for another family, swap the `firebaseConfig` block in `src/firebase/config.js` for that project's config.

---

## Data model

Six Firestore collections:

| Collection | What's in it |
|---|---|
| `households` | family name, current coins, rewards path, cycle counter |
| `adults` | one doc per adult, role (admin/standard), photo, household link |
| `children` | name + avatar (single child per household for now) |
| `achievements` | every logged moment — category, coin value, who logged it, optional photo + note, collected flag |
| `dailyReviews` | one per completed bedtime review — feeling, proud moment, grateful for, memory photo, tomorrow's goal |
| `tonightsPrep` | scratch doc per day — grateful options, photo options, tomorrow's goal. Deleted after the review completes. |

Sweet dreams. 🌙

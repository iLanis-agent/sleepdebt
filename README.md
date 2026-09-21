# SleepDebt

Sleep researchers talk about sleep debt like a loan: undersleep your target and the
deficit accrues, and the "I'll catch up on the weekend" strategy repays far less than
people think. SleepDebt makes the ledger visible - log each night's hours, see the
running debt or banked surplus, and get a concrete recovery plan: how many nights at a
longer bedtime clear what you owe, with the exact clear-by date.

- Debt gauge with five verdict tiers (banked, even, owing, deep, crisis)
- 7-day average, on-target streak, 14-night bar chart (short nights in red)
- Recovery planner: pick your recovery bedtime, get nights needed + clear-by date
- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- `engine.js` holds the sleep accounting as pure functions, shared between the app and
  node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers debt arithmetic (short/long/mixed nights, surplus cap), the
rolling weekly average window, recovery plans (ceil behavior, no-debt short-circuit,
nightly-must-exceed-target), verdict tiers, and streak counting (including the
today-not-logged-yet case).

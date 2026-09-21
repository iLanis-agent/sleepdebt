/* SleepDebt engine - sleep accounting, pure functions.
   Sleep works like a bank account: undersleep your target and the debt accrues,
   oversleep and you pay it down. Research says weekend "catch-up sleep" only
   partially helps, so the plan spreads recovery over nights. */
(function (global) {
  'use strict';

  function round1(x) { return Math.round(x * 10) / 10; }

  // nights: [{date:'YYYY-MM-DD', hours}] any order. Debt in hours vs target.
  // Positive = in debt. Negative = banked surplus (capped for realism).
  function debt(nights, target) {
    if (!(target > 0 && target <= 24)) throw new Error('bad target');
    var d = nights.reduce(function (s, n) { return s + (target - n.hours); }, 0);
    return round1(Math.max(d, -14)); // surplus capped at 14h banked
  }

  // Rolling last-7-day average
  function weeklyAvg(nights, today) {
    var cutoff = new Date(today + 'T00:00:00Z');
    cutoff.setUTCDate(cutoff.getUTCDate() - 6);
    var recent = nights.filter(function (n) { return n.date >= isoDay(cutoff) && n.date <= today; });
    if (!recent.length) return null;
    return round1(recent.reduce(function (s, n) { return s + n.hours; }, 0) / recent.length);
  }
  function isoDay(d) { return d.toISOString().slice(0, 10); }

  // Recovery plan: clear `debtHours` by sleeping `nightly` hours (nightly > target).
  // Returns nights needed, the clear-by date, and the per-night surplus applied.
  function recoveryPlan(debtHours, target, nightly, today) {
    if (debtHours <= 0) return { needed: false, nights: 0, clearBy: today, surplusPerNight: 0 };
    if (!(nightly > target)) throw new Error('nightly must exceed target to recover');
    var surplus = round1(nightly - target);
    var n = Math.ceil(debtHours / surplus);
    var d = new Date(today + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return { needed: true, nights: n, clearBy: isoDay(d), surplusPerNight: surplus };
  }

  // Verdict tiers for display
  function verdict(debtHours) {
    if (debtHours <= -4) return 'banked';
    if (debtHours < 2) return 'even';
    if (debtHours < 7) return 'owing';
    if (debtHours < 14) return 'deep';
    return 'crisis';
  }

  // Consistency: streak of consecutive nights meeting target, ending today (or yesterday)
  function streak(nights, target, today) {
    var byDate = {};
    nights.forEach(function (n) { byDate[n.date] = n.hours; });
    var d = new Date(today + 'T00:00:00Z');
    var count = 0;
    // allow streak to count from yesterday if today not logged yet
    if (!(today in byDate)) d.setUTCDate(d.getUTCDate() - 1);
    while (true) {
      var key = isoDay(d);
      if (byDate[key] !== undefined && byDate[key] >= target) { count++; d.setUTCDate(d.getUTCDate() - 1); }
      else break;
    }
    return count;
  }

  var api = { debt: debt, weeklyAvg: weeklyAvg, recoveryPlan: recoveryPlan, verdict: verdict, streak: streak };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.SleepDebt = api;
})(typeof window !== 'undefined' ? window : globalThis);

// ── DiscoverWizard – Scoring Engine ──────────────────
// Pure functions only. No DOM access. No side effects.
// Single source of truth for: signal generation, modifier application,
// pattern scoring, bundle construction.
//
// Public API: score(answers, knowledgeModel)
//
// `answers` is the flat object readAnswers() produces in index.html, and may
// carry LLM-parsed tags under `aiSignals`:
//   aiSignals: { root_cause_type, problem_pattern, urgency_signal }
// These are used as multipliers on pattern confidence — the LLM never picks
// a pattern, it nudges between close calls.

// ── 1. Signal generation ────────────────────────────
// All signals come from the knowledge model's `structured_to_signals` map.
// No more dead pain_point_mappings, no more client-side supplementary builder.
function generateSignals(answers, km) {
  var sigs = {};
  var map = km.structured_to_signals || {};

  // breakdownArea → seed signals for that area
  var areaMap = (map.breakdownArea || {})[answers.breakdownArea];
  if (areaMap) {
    for (var sig in areaMap) {
      sigs[sig] = Math.max(sigs[sig] || 0, areaMap[sig]);
    }
  }

  // impact (multi-select) → light boosts per selected value
  var impactMap = map.impact || {};
  (answers.impact || []).forEach(function (impactValue) {
    var boosts = impactMap[impactValue];
    if (!boosts) return;
    for (var sig in boosts) {
      sigs[sig] = Math.max(sigs[sig] || 0, boosts[sig]);
    }
  });

  return sigs;
}

// ── 2. Modifier application ─────────────────────────
function applyModifiers(signals, answers, km) {
  var modified = {};
  var flag = null;

  for (var k in signals) modified[k] = signals[k];

  function applyMod(mod) {
    if (!mod) return;
    if (mod.multiplier && mod.multiplier !== 1.0) {
      for (var k in modified) modified[k] = modified[k] * mod.multiplier;
    }
    var boosts = mod.boosted_signals || {};
    for (var sig in boosts) {
      if (modified[sig] !== undefined) {
        modified[sig] = modified[sig] * boosts[sig];
      } else {
        modified[sig] = 0.3 * boosts[sig];
      }
    }
    if (mod.flag && !flag) flag = mod.flag;
  }

  applyMod(km.role_modifiers && km.role_modifiers[answers.role]);

  var sizeMod = km.size_modifiers && km.size_modifiers[answers.users];
  applyMod(sizeMod);
  // size-handoff wins over bring-to-leadership
  if (sizeMod && sizeMod.flag === 'sales_handoff') flag = 'sales_handoff';

  applyMod(km.b2b_modifiers && km.b2b_modifiers[answers.b2b]);

  // Clamp to [0, 2.0]
  for (var k2 in modified) {
    if (modified[k2] > 2.0) modified[k2] = 2.0;
    if (modified[k2] < 0) modified[k2] = 0;
  }

  return { signals: modified, flag: flag };
}

// ── 3. Pattern scoring ──────────────────────────────
// Confidence is built up from: required + supporting signals (normalized),
// ideal-profile bonus, cohesion bonus, and LLM-tag boosts. Gated by
// required_signals (must clear 0.5) and vetoed by anti_signals (>= 0.7).
function scorePatterns(signals, answers, km, llmTags) {
  var scored = [];
  var tagBoosts = km.llm_tag_boosts || {};

  km.solution_patterns.forEach(function (pattern) {
    // 3a. required_signals gate
    var eligible = true;
    pattern.required_signals.forEach(function (req) {
      if (!signals[req] || signals[req] < 0.5) eligible = false;
    });
    if (!eligible) return;

    // 3b. anti_signals veto
    var excluded = false;
    (pattern.anti_signals || []).forEach(function (anti) {
      if (signals[anti] && signals[anti] >= 0.7) excluded = true;
    });
    if (excluded) return;

    // 3c. Base confidence from required + supporting signals (normalized)
    var confidence = 0;
    pattern.required_signals.forEach(function (s) { confidence += (signals[s] || 0); });
    pattern.supporting_signals.forEach(function (s) { confidence += (signals[s] || 0); });
    var total = pattern.required_signals.length + pattern.supporting_signals.length;
    if (total > 0) confidence = confidence / total;

    // 3d. Ideal profile bonus (up to +0.15)
    var profile = pattern.ideal_profile;
    if (profile.size.indexOf(answers.users) !== -1) confidence += 0.05;
    if (profile.role.indexOf(answers.role) !== -1) confidence += 0.05;
    if (profile.b2b.indexOf(answers.b2b) !== -1) confidence += 0.05;

    // 3e. Cohesion bonus — pairs in primary_bundle that integrate with each other
    var cohesion = 0;
    pattern.primary_bundle.forEach(function (id) {
      var prod = lookupProduct(id, km);
      if (!prod) return;
      pattern.primary_bundle.forEach(function (otherId) {
        if (otherId === id) return;
        if (prod.integrates_with.indexOf(otherId) !== -1) cohesion += 0.05;
      });
    });
    confidence += cohesion / 2;

    // 3f. LLM tag boosts — the AI doesn't pick a pattern, but it nudges ranking
    var tagBoostExplain = [];
    if (llmTags) {
      ['problem_pattern', 'root_cause_type', 'urgency_signal'].forEach(function (tag) {
        var value = llmTags[tag];
        if (!value) return;
        var boostsForTag = tagBoosts[tag] && tagBoosts[tag][value];
        if (!boostsForTag) return;
        var boost = 0;
        if (boostsForTag._all !== undefined) boost = boostsForTag._all;
        else if (boostsForTag[pattern.id] !== undefined) boost = boostsForTag[pattern.id];
        if (boost) {
          confidence += boost;
          tagBoostExplain.push(tag + '=' + value + ' (' + (boost >= 0 ? '+' : '') + boost.toFixed(2) + ')');
        }
      });
    }

    // Clamp to [0, 1.2]. Ceiling is above 1.0 so the debug view can
    // distinguish crushed-it matches (score ~1.15) from barely-cleared
    // matches (score ~0.55). Display layer is responsible for formatting.
    if (confidence > 1.2) confidence = 1.2;
    if (confidence < 0) confidence = 0;

    scored.push({
      pattern: pattern,
      confidence: Math.round(confidence * 1000) / 1000,
      tagBoostExplain: tagBoostExplain
    });
  });

  scored.sort(function (a, b) { return b.confidence - a.confidence; });
  return scored;
}

// ── 4. Bundle construction ──────────────────────────
function lookupProduct(id, km) {
  for (var i = 0; i < km.products.length; i++) {
    if (km.products[i].id === id) return km.products[i];
  }
  return null;
}

function lookupSignalExplanation(signalId, km) {
  for (var i = 0; i < km.signals.length; i++) {
    if (km.signals[i].id === signalId) return km.signals[i].explanation;
  }
  return null;
}

function buildBundle(pattern, signals, exclusions, answers, km, tagBoostExplain) {
  function buildEntry(prodId) {
    if (exclusions.indexOf(prodId) !== -1) return null;
    var product = lookupProduct(prodId, km);
    if (!product) return null;
    return {
      product_id: product.id,
      product_name: product.name,
      one_line: product.one_line,
      rollout_priority: product.rollout_priority,
      why: generateWhy(product, signals, km)
    };
  }

  function generateWhy(product, signals, km) {
    var bestSignal = null;
    var bestWeight = 0;
    var candidates = (product.signals_required || []).concat(product.signals_boosted || []);
    candidates.forEach(function (sig) {
      if (signals[sig] && signals[sig] > bestWeight) {
        bestWeight = signals[sig];
        bestSignal = sig;
      }
    });
    var explanation = bestSignal ? lookupSignalExplanation(bestSignal, km) : null;
    if (explanation) return product.name + ' ' + explanation + '.';
    return product.name + ' supports this solution pattern.';
  }

  var primary = pattern.primary_bundle.map(buildEntry).filter(Boolean);
  primary.sort(function (a, b) { return a.rollout_priority - b.rollout_priority; });

  var supporting = pattern.supporting_bundle.map(buildEntry).filter(Boolean);
  supporting.sort(function (a, b) { return a.rollout_priority - b.rollout_priority; });

  // Role-aware template substitution. Keys match the spec's role strings
  // exactly (previously mismatched against old slugs like "owner-operator").
  var roleLabels = {
    'Owner / Founder': 'founder',
    'Executive or Director': 'executive',
    'Manager or Team Lead': 'team manager',
    'Individual Contributor': 'team member',
    'Evaluating on behalf of someone else': 'evaluator'
  };
  var explanation = pattern.explanation_template
    .replace(/\{role\}/g, roleLabels[answers.role] || answers.role || 'team')
    .replace(/\{industry\}/g, answers.industry || 'your industry')
    .replace(/\{size\}/g, answers.users || 'your team');

  return {
    pattern_id: pattern.id,
    pattern_name: pattern.name,
    confidence: 0, // filled by caller
    explanation: explanation,
    primary_bundle: primary,
    supporting_bundle: supporting,
    business_outcome: pattern.business_outcome,
    tag_boost_explain: tagBoostExplain || []
  };
}

// ── 5. Public API ───────────────────────────────────
function score(answers, km) {
  var baseSignals = generateSignals(answers, km);
  var modified = applyModifiers(baseSignals, answers, km);
  var signals = modified.signals;
  var flag = modified.flag;

  var llmTags = answers.aiSignals || null;
  var scored = scorePatterns(signals, answers, km, llmTags);

  var exclusions = [];
  var sizeMod = km.size_modifiers && km.size_modifiers[answers.users];
  if (sizeMod && sizeMod.exclusions) exclusions = sizeMod.exclusions;

  var topPatterns = [];
  var count = Math.min(scored.length, 3);
  for (var i = 0; i < count; i++) {
    var entry = scored[i];
    var built = buildBundle(entry.pattern, signals, exclusions, answers, km, entry.tagBoostExplain);
    built.confidence = entry.confidence;
    topPatterns.push(built);
  }

  if (topPatterns.length === 0) {
    return {
      session_id: answers.session_id || null,
      top_patterns: [],
      signals_generated: signals,
      flag: flag,
      zoho_one_recommended: false
    };
  }

  var primaryCount = topPatterns[0].primary_bundle.length;
  return {
    session_id: answers.session_id || null,
    top_patterns: topPatterns,
    signals_generated: signals,
    flag: flag,
    zoho_one_recommended: primaryCount >= 3
  };
}

// Exposed on window for use from index.html (loaded as <script>, not ES module).
if (typeof window !== 'undefined') {
  window.ScoringEngine = { score: score };
}
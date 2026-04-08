// ── DiscoverWizard – Scoring Engine ──────────────────
// Pure functions only. No DOM access. No side effects.
// Loads knowledge-model.json data passed in as argument.
// Exports: score(answers, knowledgeModel)

// ── 1. Signal Generator ─────────────────────────────

function generateSignals(answers, knowledgeModel) {
  const signals = {};
  const painPoints = answers.painPoints || [];
  const mappings = knowledgeModel.pain_point_mappings;

  painPoints.forEach(function (pp) {
    const mapped = mappings[pp];
    if (!mapped) return;
    mapped.forEach(function (entry) {
      // Take the max weight if the same signal is triggered by multiple pain points
      if (!signals[entry.signal] || entry.weight > signals[entry.signal]) {
        signals[entry.signal] = entry.weight;
      }
    });
  });

  return signals;
}

// ── 2. Modifier Applier ─────────────────────────────

function applyModifiers(signals, answers, knowledgeModel) {
  var modified = {};
  var flag = null;

  // Copy signals
  for (var key in signals) {
    modified[key] = signals[key];
  }

  // Role modifier
  var roleMod = knowledgeModel.role_modifiers[answers.role];
  if (roleMod) {
    // Apply global multiplier
    if (roleMod.multiplier !== 1.0) {
      for (var key in modified) {
        modified[key] = modified[key] * roleMod.multiplier;
      }
    }
    // Apply boosted signals
    for (var sig in roleMod.boosted_signals) {
      if (modified[sig] !== undefined) {
        modified[sig] = modified[sig] * roleMod.boosted_signals[sig];
      } else {
        // Boost creates a baseline signal if none exists
        modified[sig] = 0.3 * roleMod.boosted_signals[sig];
      }
    }
    if (roleMod.flag) {
      flag = roleMod.flag;
    }
  }

  // Size modifier
  var sizeMod = knowledgeModel.size_modifiers[answers.users];
  if (sizeMod) {
    for (var sig in sizeMod.boosted_signals) {
      if (modified[sig] !== undefined) {
        modified[sig] = modified[sig] * sizeMod.boosted_signals[sig];
      } else {
        modified[sig] = 0.3 * sizeMod.boosted_signals[sig];
      }
    }
    if (sizeMod.flag && !flag) {
      flag = sizeMod.flag;
    }
    // sales_handoff takes priority over bring_to_leadership
    if (sizeMod.flag === "sales_handoff") {
      flag = "sales_handoff";
    }
  }

  // B2B modifier
  var b2bMod = knowledgeModel.b2b_modifiers[answers.b2b];
  if (b2bMod) {
    for (var sig in b2bMod.boosted_signals) {
      if (modified[sig] !== undefined) {
        modified[sig] = modified[sig] * b2bMod.boosted_signals[sig];
      } else {
        modified[sig] = 0.3 * b2bMod.boosted_signals[sig];
      }
    }
  }

  // Clamp all signals to [0, 2.0] to prevent runaway values
  for (var key in modified) {
    if (modified[key] > 2.0) modified[key] = 2.0;
    if (modified[key] < 0) modified[key] = 0;
  }

  return { signals: modified, flag: flag };
}

// ── 3. Pattern Scorer ───────────────────────────────

function scorePatterns(signals, answers, knowledgeModel) {
  var exclusions = [];
  var sizeMod = knowledgeModel.size_modifiers[answers.users];
  if (sizeMod && sizeMod.exclusions) {
    exclusions = sizeMod.exclusions;
  }

  var scored = [];

  knowledgeModel.solution_patterns.forEach(function (pattern) {
    // 5a. Check required_signals — all must be >= 0.5
    var eligible = true;
    pattern.required_signals.forEach(function (reqSig) {
      if (!signals[reqSig] || signals[reqSig] < 0.5) {
        eligible = false;
      }
    });
    if (!eligible) return;

    // 5b. Check anti_signals — if any >= 0.7, exclude
    var excluded = false;
    pattern.anti_signals.forEach(function (antiSig) {
      if (signals[antiSig] && signals[antiSig] >= 0.7) {
        excluded = true;
      }
    });
    if (excluded) return;

    // 5c. Sum supporting_signal scores for confidence
    var confidence = 0;
    pattern.supporting_signals.forEach(function (supSig) {
      confidence += (signals[supSig] || 0);
    });

    // Add required signal scores to base confidence
    pattern.required_signals.forEach(function (reqSig) {
      confidence += (signals[reqSig] || 0);
    });

    // Normalize confidence to roughly 0-1 range
    var totalSignals = pattern.required_signals.length + pattern.supporting_signals.length;
    if (totalSignals > 0) {
      confidence = confidence / totalSignals;
    }

    // 5d. Apply ideal_profile bonus (+0.15) if user matches
    var profileBonus = 0;
    var profile = pattern.ideal_profile;
    if (profile.size.indexOf(answers.users) !== -1) profileBonus += 0.05;
    if (profile.role.indexOf(answers.role) !== -1) profileBonus += 0.05;
    if (profile.b2b.indexOf(answers.b2b) !== -1) profileBonus += 0.05;
    confidence += profileBonus;

    // 5e. Apply cohesion bonus — count integrates_with matches in primary_bundle
    var products = knowledgeModel.products;
    var bundleProducts = pattern.primary_bundle;
    var cohesionBonus = 0;

    bundleProducts.forEach(function (prodId) {
      var product = null;
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === prodId) {
          product = products[i];
          break;
        }
      }
      if (!product) return;

      bundleProducts.forEach(function (otherProdId) {
        if (otherProdId === prodId) return;
        if (product.integrates_with.indexOf(otherProdId) !== -1) {
          cohesionBonus += 0.05;
        }
      });
    });
    // Avoid double-counting: each pair counted once from each side
    cohesionBonus = cohesionBonus / 2;
    confidence += cohesionBonus;

    // Clamp to 0-1
    if (confidence > 1.0) confidence = 1.0;
    if (confidence < 0) confidence = 0;

    scored.push({
      pattern: pattern,
      confidence: Math.round(confidence * 1000) / 1000,
      exclusions: exclusions
    });
  });

  // 6. Sort by confidence descending
  scored.sort(function (a, b) { return b.confidence - a.confidence; });

  return scored;
}

// ── 4. Bundle Builder ───────────────────────────────

function buildBundle(pattern, signals, exclusions, answers, knowledgeModel) {
  var products = knowledgeModel.products;

  function lookupProduct(prodId) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === prodId) return products[i];
    }
    return null;
  }

  function buildProductEntry(prodId) {
    // Skip excluded products (from size modifier)
    if (exclusions.indexOf(prodId) !== -1) return null;

    var product = lookupProduct(prodId);
    if (!product) return null;

    // Generate a "why" sentence connecting product to signals
    var why = generateWhy(product, signals);

    return {
      product_id: product.id,
      product_name: product.name,
      one_line: product.one_line,
      rollout_priority: product.rollout_priority,
      why: why
    };
  }

  function generateWhy(product, signals) {
    // Find the strongest matching signal for this product
    var bestSignal = null;
    var bestWeight = 0;

    product.signals_required.concat(product.signals_boosted).forEach(function (sig) {
      if (signals[sig] && signals[sig] > bestWeight) {
        bestWeight = signals[sig];
        bestSignal = sig;
      }
    });

    // Map signal names to readable explanations
    var signalExplanations = {
      crm_needed: "centralizes your customer relationships and pipeline",
      workflow_automation: "automates your repetitive workflows",
      data_entry_automation: "eliminates manual data entry",
      reporting_needed: "gives you visibility into key metrics",
      dashboard_needed: "provides real-time operational dashboards",
      helpdesk_needed: "organizes customer support into a trackable system",
      customer_engagement_needed: "engages customers proactively",
      project_management_needed: "structures your project delivery",
      collaboration_needed: "keeps your team communicating in one place",
      document_management_needed: "centralizes your documents with version control",
      integration_needed: "connects your disparate tools into one flow",
      api_orchestration_needed: "orchestrates data across your tech stack",
      unified_platform_needed: "replaces your fragmented tool stack",
      spreadsheet_replacement: "replaces error-prone spreadsheets with structured data",
      database_needed: "gives you a proper database instead of spreadsheets",
      billing_needed: "automates your invoicing and payment collection",
      accounting_needed: "handles your accounting and financial reporting",
      expense_management_needed: "streamlines expense tracking and approvals",
      inventory_needed: "tracks your inventory across locations",
      hr_needed: "manages your employee records and HR processes",
      payroll_needed: "processes payroll and tax compliance",
      recruiting_needed: "streamlines your hiring pipeline",
      marketing_automation_needed: "automates your lead nurture campaigns",
      email_campaigns_needed: "powers your email marketing",
      social_media_needed: "manages your social media presence",
      ecommerce_needed: "runs your online storefront",
      esignature_needed: "handles digital document signing",
      contract_management_needed: "manages your contract lifecycle",
      security_needed: "secures your accounts and credentials",
      it_management_needed: "centralizes identity and access management",
      analytics_needed: "blends your data into cross-functional analytics",
      learning_management_needed: "delivers training and onboarding content",
      video_conferencing_needed: "hosts your team meetings and webinars",
      survey_needed: "collects customer and employee feedback",
      custom_apps_needed: "lets you build custom apps without heavy coding",
      solo_productivity: "gives you lightweight tools for personal productivity",
      process_definition_needed: "enforces standard operating procedures",
      approval_flows_needed: "structures your approval chains",
      field_service_needed: "manages field jobs and technician dispatch",
      employee_engagement_needed: "motivates your team with gamification",
      event_management_needed: "manages events and attendees",
      website_needed: "builds your web presence",
      remote_support_needed: "provides remote support to customers or staff",
      appointment_scheduling_needed: "lets customers book time with you online"
    };

    if (bestSignal && signalExplanations[bestSignal]) {
      return product.name + " " + signalExplanations[bestSignal] + ".";
    }

    return product.name + " supports this solution pattern.";
  }

  // Build primary bundle
  var primaryBundle = [];
  pattern.primary_bundle.forEach(function (prodId) {
    var entry = buildProductEntry(prodId);
    if (entry) primaryBundle.push(entry);
  });

  // Sort primary bundle by rollout_priority
  primaryBundle.sort(function (a, b) { return a.rollout_priority - b.rollout_priority; });

  // Build supporting bundle
  var supportingBundle = [];
  pattern.supporting_bundle.forEach(function (prodId) {
    var entry = buildProductEntry(prodId);
    if (entry) supportingBundle.push(entry);
  });

  supportingBundle.sort(function (a, b) { return a.rollout_priority - b.rollout_priority; });

  // Fill explanation template
  var roleLabels = {
    "owner-operator": "business owner",
    "team-manager": "team manager",
    "system-admin": "system administrator",
    "user": "team member"
  };
  var explanation = pattern.explanation_template
    .replace(/\{role\}/g, roleLabels[answers.role] || answers.role)
    .replace(/\{industry\}/g, answers.industry || "your industry")
    .replace(/\{size\}/g, answers.users || "your");

  return {
    pattern_id: pattern.id,
    pattern_name: pattern.name,
    confidence: 0, // filled by caller
    explanation: explanation,
    primary_bundle: primaryBundle,
    supporting_bundle: supportingBundle,
    business_outcome: pattern.business_outcome
  };
}

// ── 5. Public API ───────────────────────────────────

function score(answers, knowledgeModel, supplementarySignals) {
  // 1. Generate base signals from pain points
  var baseSignals = generateSignals(answers, knowledgeModel);

  // 1b. Merge supplementary signals (from breakdown/approach/rootCause/impact questions)
  if (supplementarySignals) {
    for (var sig in supplementarySignals) {
      if (!baseSignals[sig] || supplementarySignals[sig] > baseSignals[sig]) {
        baseSignals[sig] = supplementarySignals[sig];
      }
    }
  }

  // 2-4. Apply role, size, b2b modifiers
  var result = applyModifiers(baseSignals, answers, knowledgeModel);
  var signals = result.signals;
  var flag = result.flag;

  // 5. Score and filter patterns
  var scored = scorePatterns(signals, answers, knowledgeModel);

  // Get size exclusions
  var exclusions = [];
  var sizeMod = knowledgeModel.size_modifiers[answers.users];
  if (sizeMod && sizeMod.exclusions) {
    exclusions = sizeMod.exclusions;
  }

  // 7. Take top 3 and build full bundle detail
  var topPatterns = [];
  var count = Math.min(scored.length, 3);
  for (var i = 0; i < count; i++) {
    var entry = scored[i];
    var built = buildBundle(entry.pattern, signals, exclusions, answers, knowledgeModel);
    built.confidence = entry.confidence;
    topPatterns.push(built);
  }

  // If no patterns matched, return a minimal result
  if (topPatterns.length === 0) {
    // REVIEW: fallback when no patterns match — should we always match at least one?
    return {
      session_id: answers.session_id || null,
      top_patterns: [],
      signals_generated: signals,
      flag: flag,
      zoho_one_recommended: false
    };
  }

  // Check if 3+ primary bundle products across top pattern
  var primaryCount = topPatterns[0].primary_bundle.length;
  var zohoOneRecommended = primaryCount >= 3;

  return {
    session_id: answers.session_id || null,
    top_patterns: topPatterns,
    signals_generated: signals,
    flag: flag,
    zoho_one_recommended: zohoOneRecommended
  };
}

// Export for use in main.js (loaded via <script> tag, not ES modules)
// score() is the only public function
if (typeof window !== "undefined") {
  window.ScoringEngine = { score: score };
}

// ── DiscoverWizard – Reasoning / Debug Card Renderer ─
// Pure DOM rendering. No global lookups. Takes all inputs as arguments
// so it can be used from the production wizard and from the test harness.
// Requires the matching markup in the host page (see index.html — the test
// harness — and wizard.html — the production flow — for the expected IDs).

(function () {

    var REASONING_INPUT_LABELS = {
        journeyStage: 'Journey stage',
        industry: 'Industry',
        subIndustry: 'Sub-industry',
        users: 'Team size',
        role: 'Role',
        b2b: 'Customer type',
        breakdownArea: 'Where it\u2019s breaking down',
        currentApproach: 'How they\u2019re handling it today',
        rootCause: 'What they think is driving it',
        impact: 'How it\u2019s showing up',
        urgency: 'Urgency'
    };

    var FREE_TEXT_FIELDS = [
        { key: 'biggestWorry', label: 'Biggest worry (PP4)' },
        { key: 'requirements', label: 'Requirements' },
        { key: 'currentSoftware', label: 'Current software' },
        { key: 'replaceKeep', label: 'Replace vs keep' },
        { key: 'products', label: 'Products & services' }
    ];

    function clearChildren(el) {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    function lookupPatternDef(patternId, knowledgeModel) {
        if (!knowledgeModel || !knowledgeModel.solution_patterns) return null;
        for (var i = 0; i < knowledgeModel.solution_patterns.length; i++) {
            if (knowledgeModel.solution_patterns[i].id === patternId) {
                return knowledgeModel.solution_patterns[i];
            }
        }
        return null;
    }

    // Compare LLM-extracted signals against expected values.
    // Returns { matches, total, results: [{tag, actual, expected, match}] } or null if no expected provided.
    function compareToExpected(actualSignals, expected) {
        if (!expected || typeof expected !== 'object') return null;
        var tags = ['root_cause_type', 'problem_pattern', 'urgency_signal'];
        var results = tags
            .filter(function (t) { return expected[t]; })
            .map(function (t) {
                var actual = (actualSignals && actualSignals[t]) || null;
                return { tag: t, actual: actual, expected: expected[t], match: actual === expected[t] };
            });
        var matches = results.filter(function (r) { return r.match; }).length;
        return { matches: matches, total: results.length, results: results };
    }

    function render(answers, scoringResult, debug, knowledgeModel, expected) {
        var card = document.getElementById('reasoningDetails');
        if (!card) return;

        // Auto-expand on ?reasoning=1
        try {
            if (/[?&]reasoning=1\b/.test(window.location.search)) {
                card.open = true;
            }
        } catch (_) { /* noop */ }

        // 1. Interpretation
        var interp = document.getElementById('reasoningInterpretation');
        if (interp) interp.textContent = answers.interpretation || '\u2014';

        // 2. What you told us
        var inputs = document.getElementById('reasoningInputs');
        clearChildren(inputs);
        if (inputs) {
            Object.keys(REASONING_INPUT_LABELS).forEach(function (key) {
                var val = answers[key];
                if (val === undefined || val === null || val === '') return;
                if (Array.isArray(val)) val = val.join(', ');
                var dt = document.createElement('dt');
                dt.textContent = REASONING_INPUT_LABELS[key];
                var dd = document.createElement('dd');
                dd.textContent = String(val);
                inputs.appendChild(dt);
                inputs.appendChild(dd);
            });
        }

        // 3. Your own words
        var quotes = document.getElementById('reasoningQuotes');
        clearChildren(quotes);
        if (quotes) {
            FREE_TEXT_FIELDS.forEach(function (entry) {
                var txt = answers[entry.key];
                if (!txt) return;
                var bq = document.createElement('blockquote');
                bq.className = 'reasoning-quote';
                var label = document.createElement('span');
                label.className = 'reasoning-quote-label';
                label.textContent = entry.label;
                var body = document.createElement('p');
                body.textContent = String(txt);
                bq.appendChild(label);
                bq.appendChild(body);
                quotes.appendChild(bq);
            });
            if (!quotes.children.length) {
                var empty = document.createElement('p');
                empty.className = 'text-muted';
                empty.textContent = 'No free-text provided.';
                quotes.appendChild(empty);
            }
        }

        // 4. Signals + evidence (+ optional expected-value indicator)
        var signals = document.getElementById('reasoningSignals');
        clearChildren(signals);
        if (signals) {
            var sigs = answers.aiSignals || {};
            var evidence = answers.signalEvidence || {};
            var hasExpected = expected && typeof expected === 'object';
            ['root_cause_type', 'problem_pattern', 'urgency_signal'].forEach(function (tag) {
                var actual = sigs[tag] || null;
                var exp = hasExpected ? expected[tag] : null;
                var isMatch = exp ? (actual === exp) : null;

                var wrapper = document.createElement('div');
                wrapper.className = 'signal-block' + (isMatch === true ? ' signal-block--match' : isMatch === false ? ' signal-block--miss' : '');

                var chip = document.createElement('span');
                chip.className = 'signal-chip';
                chip.textContent = tag + ': ' + (actual || '\u2014');

                if (exp) {
                    var indicator = document.createElement('span');
                    indicator.className = 'signal-indicator ' + (isMatch ? 'signal-indicator--match' : 'signal-indicator--miss');
                    indicator.textContent = isMatch
                        ? '\u2713 matches'
                        : ('\u2717 expected: ' + exp);
                    chip.appendChild(document.createTextNode(' '));
                    chip.appendChild(indicator);
                }

                var ev = document.createElement('p');
                ev.className = 'signal-evidence';
                ev.textContent = evidence[tag] ? ('\u201C' + evidence[tag] + '\u201D') : '\u2014 no evidence returned';
                wrapper.appendChild(chip);
                wrapper.appendChild(ev);
                signals.appendChild(wrapper);
            });
        }

        // 5. Pattern matches
        var patterns = document.getElementById('reasoningPatterns');
        clearChildren(patterns);
        if (patterns) {
            var top = (scoringResult && scoringResult.top_patterns) || [];
            var activeSignals = (scoringResult && scoringResult.signals_generated) || {};
            if (!top.length) {
                var none = document.createElement('p');
                none.className = 'text-muted';
                none.textContent = 'No pattern matched above threshold \u2014 check signal weights.';
                patterns.appendChild(none);
            } else {
                top.slice(0, 3).forEach(function (p, idx) {
                    var row = document.createElement('div');
                    row.className = 'pattern-row';
                    var title = document.createElement('div');
                    title.className = 'pattern-title';
                    title.textContent = (idx + 1) + '. ' + (p.pattern_name || p.pattern_id) + ' \u2014 conf ' + p.confidence;
                    row.appendChild(title);

                    var def = lookupPatternDef(p.pattern_id, knowledgeModel);
                    if (def) {
                        var contribs = (def.required_signals || []).concat(def.supporting_signals || [])
                            .filter(function (s) { return activeSignals[s]; });
                        if (contribs.length) {
                            var contrib = document.createElement('div');
                            contrib.className = 'pattern-contrib text-muted';
                            contrib.textContent = 'Triggered by: ' + contribs.map(function (s) {
                                return s + ' (' + (Math.round(activeSignals[s] * 100) / 100) + ')';
                            }).join(', ');
                            row.appendChild(contrib);
                        }
                    }
                    patterns.appendChild(row);
                });
            }
        }

        // 6. Developer details
        var dev = document.getElementById('reasoningDevDetails');
        clearChildren(dev);
        if (dev) {
            var d = debug || {};
            var meta = document.createElement('dl');
            meta.className = 'reasoning-dev-meta';
            [
                ['Model', d.model || '\u2014'],
                ['Latency', (d.latencyMs != null ? d.latencyMs + 'ms' : '\u2014')],
                ['Attempts', (d.attempts != null ? String(d.attempts) : '\u2014')]
            ].forEach(function (pair) {
                var dt = document.createElement('dt'); dt.textContent = pair[0];
                var dd = document.createElement('dd'); dd.textContent = pair[1];
                meta.appendChild(dt); meta.appendChild(dd);
            });
            dev.appendChild(meta);

            var promptDetails = document.createElement('details');
            var promptSummary = document.createElement('summary');
            promptSummary.textContent = 'Prompt';
            var promptPre = document.createElement('pre');
            promptPre.className = 'reasoning-pre';
            promptPre.textContent = d.prompt || '\u2014';
            promptDetails.appendChild(promptSummary);
            promptDetails.appendChild(promptPre);
            dev.appendChild(promptDetails);

            var rawDetails = document.createElement('details');
            var rawSummary = document.createElement('summary');
            rawSummary.textContent = 'Raw response';
            var rawPre = document.createElement('pre');
            rawPre.className = 'reasoning-pre';
            rawPre.textContent = d.rawResponse || '\u2014';
            rawDetails.appendChild(rawSummary);
            rawDetails.appendChild(rawPre);
            dev.appendChild(rawDetails);
        }
    }

    if (typeof window !== 'undefined') {
        window.ReasoningCard = { render: render, compareToExpected: compareToExpected };
    }

})();

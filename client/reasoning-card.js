// ── DiscoverWizard – Debug Output Renderer ───────────
// Flat renderer for the debug screen. Pure DOM, no globals.
// Populates elements by ID — see index.html for the contract.

(function () {

    var STRUCTURED_LABELS = {
        industry: 'Industry',
        subIndustry: 'Sub-industry',
        users: 'Team size',
        role: 'Role',
        b2b: 'Customer type',
        breakdownArea: 'Breakdown area',
        currentApproach: 'Current approach',
        rootCause: 'Root cause',
        impact: 'Impact',
        urgency: 'Urgency'
    };

    var FREE_TEXT_FIELDS = [
        { key: 'biggestWorry',    label: 'Biggest worry (PP4)' },
        { key: 'requirements',    label: 'Requirements' },
        { key: 'currentSoftware', label: 'Current software' },
        { key: 'products',        label: 'Products & services' }
    ];

    var LLM_TAGS = ['root_cause_type', 'problem_pattern', 'urgency_signal'];

    function byId(id) { return document.getElementById(id); }

    function clearChildren(el) {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    function setText(id, text) {
        var el = byId(id);
        if (el) el.textContent = text;
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

    // ── Renderers for each output block ──────────────
    function renderRunMeta(debug) {
        var parts = [];
        if (debug) {
            if (debug.model) parts.push(debug.model);
            if (debug.latencyMs != null) parts.push(debug.latencyMs + ' ms');
            if (debug.attempts != null) parts.push('attempt ' + debug.attempts);
        }
        setText('outRunMeta', parts.length ? parts.join(' · ') : '—');
    }

    function renderSignals(aiSignals, evidence, gradeCallback) {
        var host = byId('outSignals');
        clearChildren(host);
        if (!host) return;
        var sigs = aiSignals || {};
        var evMap = evidence || {};

        LLM_TAGS.forEach(function (tag) {
            var actual = sigs[tag] || null;

            var row = document.createElement('div');
            row.className = 'signal-row';

            var head = document.createElement('div');
            head.className = 'signal-row__head';

            var tagEl = document.createElement('code');
            tagEl.className = 'signal-tag';
            tagEl.textContent = tag;
            head.appendChild(tagEl);

            var valEl = document.createElement('span');
            valEl.className = 'signal-value';
            valEl.textContent = actual || '—';
            head.appendChild(valEl);

            if (actual && typeof gradeCallback === 'function') {
                var gradeWrap = document.createElement('div');
                gradeWrap.className = 'signal-grade';

                var correctBtn = document.createElement('button');
                correctBtn.type = 'button';
                correctBtn.className = 'grade-btn grade-btn--correct';
                correctBtn.textContent = '✓ Correct';

                var wrongBtn = document.createElement('button');
                wrongBtn.type = 'button';
                wrongBtn.className = 'grade-btn grade-btn--wrong';
                wrongBtn.textContent = '✗ Wrong';

                correctBtn.addEventListener('click', function () {
                    correctBtn.classList.add('is-active');
                    wrongBtn.classList.remove('is-active');
                    gradeCallback(tag, 'correct');
                });
                wrongBtn.addEventListener('click', function () {
                    wrongBtn.classList.add('is-active');
                    correctBtn.classList.remove('is-active');
                    gradeCallback(tag, 'wrong');
                });

                gradeWrap.appendChild(correctBtn);
                gradeWrap.appendChild(wrongBtn);
                head.appendChild(gradeWrap);
            }

            row.appendChild(head);

            var ev = document.createElement('p');
            ev.className = 'signal-evidence';
            ev.textContent = evMap[tag] ? '“' + evMap[tag] + '”' : 'no evidence returned';
            row.appendChild(ev);

            host.appendChild(row);
        });
    }

    function renderQuotes(answers) {
        var host = byId('outQuotes');
        clearChildren(host);
        if (!host) return;
        var any = false;
        FREE_TEXT_FIELDS.forEach(function (f) {
            var txt = answers[f.key];
            if (!txt) return;
            any = true;
            var bq = document.createElement('blockquote');
            bq.className = 'quote';
            var label = document.createElement('span');
            label.className = 'quote-label';
            label.textContent = f.label;
            var body = document.createElement('p');
            body.textContent = String(txt);
            bq.appendChild(label);
            bq.appendChild(body);
            host.appendChild(bq);
        });
        if (!any) {
            var empty = document.createElement('p');
            empty.className = 'empty-hint';
            empty.textContent = 'No free-text provided.';
            host.appendChild(empty);
        }
    }

    function renderInputs(answers) {
        var host = byId('outInputs');
        clearChildren(host);
        if (!host) return;
        Object.keys(STRUCTURED_LABELS).forEach(function (key) {
            var val = answers[key];
            if (val === undefined || val === null || val === '') return;
            if (Array.isArray(val)) val = val.length ? val.join(', ') : null;
            if (!val) return;
            var dt = document.createElement('dt');
            dt.textContent = STRUCTURED_LABELS[key];
            var dd = document.createElement('dd');
            dd.textContent = String(val);
            host.appendChild(dt);
            host.appendChild(dd);
        });
    }

    function renderPatterns(scoringResult, knowledgeModel) {
        var host = byId('outPatterns');
        clearChildren(host);
        if (!host) return;
        var top = (scoringResult && scoringResult.top_patterns) || [];
        var active = (scoringResult && scoringResult.signals_generated) || {};

        if (!top.length) {
            var none = document.createElement('p');
            none.className = 'empty-hint';
            none.textContent = 'No pattern matched above threshold — check signal weights.';
            host.appendChild(none);
            return;
        }

        top.slice(0, 4).forEach(function (p, idx) {
            var row = document.createElement('div');
            row.className = 'pattern-row';

            var title = document.createElement('div');
            title.className = 'pattern-title';
            var rank = document.createElement('span');
            rank.className = 'pattern-rank';
            rank.textContent = '#' + (idx + 1);
            var name = document.createElement('span');
            name.className = 'pattern-name';
            name.textContent = p.pattern_name || p.pattern_id;
            var conf = document.createElement('span');
            conf.className = 'pattern-conf';
            conf.textContent = 'conf ' + p.confidence;
            title.appendChild(rank);
            title.appendChild(name);
            title.appendChild(conf);
            row.appendChild(title);

            var def = lookupPatternDef(p.pattern_id, knowledgeModel);
            if (def) {
                var contribs = (def.required_signals || [])
                    .concat(def.supporting_signals || [])
                    .filter(function (s) { return active[s]; });
                if (contribs.length) {
                    var contrib = document.createElement('div');
                    contrib.className = 'pattern-contrib';
                    contrib.textContent = 'Triggered by ' + contribs.map(function (s) {
                        return s + ' (' + (Math.round(active[s] * 100) / 100) + ')';
                    }).join(', ');
                    row.appendChild(contrib);
                }
            }

            // LLM-tag influence on confidence. This is the load-bearing
            // debugging signal: if a pattern won by a small margin because
            // of a tag boost, that dependency should be visible.
            if (p.tag_boost_explain && p.tag_boost_explain.length) {
                var boostLine = document.createElement('div');
                boostLine.className = 'pattern-contrib';
                boostLine.textContent = 'AI tag boost: ' + p.tag_boost_explain.join(', ');
                row.appendChild(boostLine);
            }
            host.appendChild(row);
        });
    }

    function renderMeta(debug) {
        var host = byId('outMeta');
        clearChildren(host);
        if (!host) return;
        var d = debug || {};
        [
            ['Model',    d.model || '—'],
            ['Latency',  d.latencyMs != null ? d.latencyMs + ' ms' : '—'],
            ['Attempts', d.attempts != null ? String(d.attempts) : '—']
        ].forEach(function (pair) {
            var dt = document.createElement('dt'); dt.textContent = pair[0];
            var dd = document.createElement('dd'); dd.textContent = pair[1];
            host.appendChild(dt); host.appendChild(dd);
        });
    }

    // ── Entry point ────────────────────────────────
    function render(answers, scoringResult, debug, knowledgeModel, gradeCallback) {
        setText('outInterpretation', answers.interpretation || '—');
        setText('outRaw', (debug && debug.rawResponse) ? debug.rawResponse : '—');
        setText('outPrompt', (debug && debug.prompt) ? debug.prompt : '—');

        renderRunMeta(debug);
        renderSignals(answers.aiSignals, answers.signalEvidence, gradeCallback);
        renderQuotes(answers);
        renderInputs(answers);
        renderPatterns(scoringResult, knowledgeModel);
        renderMeta(debug);
    }

    if (typeof window !== 'undefined') {
        window.ReasoningCard = { render: render };
    }

})();
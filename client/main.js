// ── DiscoverWizard – Main ─────────────────────────

let state = {
    answers: {},
};

let pageHistory = [];
let forwardHistory = [];

// ── Knowledge Model (loaded async on startup) ─────
let knowledgeModel = null;
let knowledgeModelError = null;

// ── State Persistence ───────────────────────────────

function saveState(currentPageId) {
    localStorage.setItem('discoverWizardState', JSON.stringify({
        answers: state.answers,
        history: pageHistory,
        currentPage: currentPageId
    }));
}

function loadState() {
    const saved = localStorage.getItem('discoverWizardState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.currentPage && parsed.currentPage !== 'pageLanding' && parsed.currentPage !== 'pageSummary') {
                state.answers = parsed.answers || {};
                pageHistory = parsed.history || [];
                return parsed.currentPage;
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }
    return null;
}

// ── Page Navigation ───────────────────────────────

function updateProgress(targetId) {
    var pages = [
        'pageLanding', 'pageJourneyStage', 'pageIndustry', 'pageUsers',
        'pageRole', 'pageB2B', 'pageProducts', 'pageCurrentSoftware',
        'pageReplaceKeep', 'pageBreakdown', 'pageHandlingIt', 'pageRootCause',
        'pageImpact', 'pageUrgency', 'pageRequirements', 'pageBiggestWorry',
        'pageSummary'
    ];
    var idx = pages.indexOf(targetId);
    if (idx < 0) idx = 0;

    var progressContainer = document.getElementById('progressContainer');
    var progressBar = document.getElementById('progressBar');
    var wizardNav = document.getElementById('wizardNav');
    var btnBack = document.getElementById('btnBack');
    var btnForward = document.getElementById('btnForward');

    if (idx === 0 || targetId === 'pageSummary' || targetId === 'pageAnalyzing') {
        progressContainer.style.display = 'none';
        wizardNav.style.display = 'none';
    } else {
        progressContainer.style.display = 'flex';
        wizardNav.style.display = 'flex';
        var totalQuestionPages = pages.length - 2; // exclude landing + summary
        var pct = (idx / totalQuestionPages) * 100;
        progressBar.style.width = Math.min(pct, 100) + '%';
        var label = document.getElementById('progressLabel');
        var percentEl = document.getElementById('progressPercent');
        if (label) label.textContent = 'Step ' + idx + ' of ' + totalQuestionPages;
        if (percentEl) percentEl.textContent = Math.round(Math.min(pct, 100)) + '%';
    }

    btnBack.disabled = pageHistory.length === 0;
    btnForward.disabled = forwardHistory.length === 0;
}

function showPage(targetId, isBack, isForward) {
    isBack = isBack || false;
    isForward = isForward || false;

    var current = document.querySelector('.page.active');
    var next = document.getElementById(targetId);
    if (!current || !next || current === next) return;

    if (isBack) {
        forwardHistory.push(current.id);
    } else if (isForward) {
        pageHistory.push(current.id);
    } else {
        pageHistory.push(current.id);
        forwardHistory = [];
    }

    saveState(targetId);
    updateProgress(targetId);

    current.classList.add('fade-out');

    current.addEventListener('animationend', function () {
        current.classList.remove('active', 'fade-out');
        next.classList.add('active');

        // Re-trigger fade-in animations
        next.querySelectorAll('.fade-in').forEach(function (el) {
            el.style.animation = 'none';
            el.offsetHeight; // force reflow
            el.style.animation = '';
        });

        // Reset sub-industry field on industry page
        var subField = next.querySelector('#subIndustryField');
        if (subField && !state.answers.subIndustry && next.id === 'pageIndustry') {
           // Keep it hidden initially if navigating back and no answer
        }
    }, { once: true });
}

// ── Back Navigation ───────────────────────────────

document.getElementById('btnBack').addEventListener('click', function () {
    if (pageHistory.length > 0) {
        var prevPage = pageHistory.pop();
        showPage(prevPage, true);
    }
});

document.getElementById('btnForward').addEventListener('click', function () {
    if (forwardHistory.length > 0) {
        var nextPage = forwardHistory.pop();
        showPage(nextPage, false, true);
    }
});

// ── Helper: auto-advance on radio select ──────────

function radioAdvance(groupId, key, nextPageId) {
    document.getElementById(groupId).addEventListener('change', function (e) {
        state.answers[key] = e.target.value;
        setTimeout(function () { showPage(nextPageId); }, 350);
    });
}

// ── Helper: advance on button click w/ validation ──

function buttonAdvance(btnId, inputId, key, nextPageId) {
    var btn = document.getElementById(btnId);
    var input = document.getElementById(inputId);

    var validate = function () {
        btn.disabled = input.value.trim().length === 0;
    };
    validate();
    input.addEventListener('input', validate);

    btn.addEventListener('click', function () {
        if (!btn.disabled) {
            state.answers[key] = input.value;
            showPage(nextPageId);
        }
    });
}

// ── Searchable Select Component ───────────────────

function initSearchSelect(containerEl, items, onSelect) {
    var trigger = containerEl.querySelector('.search-select__trigger');
    var valueEl = containerEl.querySelector('.search-select__value');
    var searchInput = containerEl.querySelector('.search-select__search');
    var optionsList = containerEl.querySelector('.search-select__options');
    var backdrop = containerEl.querySelector('.search-select__backdrop');
    var dropdown = containerEl.querySelector('.search-select__dropdown');
    var placeholder = valueEl.dataset.placeholder;

    var selected = null;
    var portaled = false;

    function isMobile() {
        return window.matchMedia('(max-width: 599px)').matches;
    }

    function portalOpen() {
        if (!portaled && isMobile()) {
            document.body.appendChild(backdrop);
            document.body.appendChild(dropdown);
            portaled = true;
        }
    }

    function portalClose() {
        if (portaled) {
            containerEl.appendChild(backdrop);
            containerEl.appendChild(dropdown);
            portaled = false;
        }
    }

    function render(filter) {
        filter = filter || '';
        var lower = filter.toLowerCase();
        var filtered = items.filter(function (item) { return item.toLowerCase().includes(lower); });
        optionsList.innerHTML = '';

        if (filtered.length === 0) {
            var empty = document.createElement('li');
            empty.className = 'search-select__empty';
            empty.textContent = 'No results found';
            optionsList.appendChild(empty);
            return;
        }

        filtered.forEach(function (item) {
            var li = document.createElement('li');
            li.className = 'search-select__option';
            if (item === selected) li.classList.add('selected');
            li.textContent = item;
            li.addEventListener('click', function () {
                selected = item;
                valueEl.textContent = item;
                valueEl.classList.add('has-value');
                close();
                onSelect(item);
            });
            optionsList.appendChild(li);
        });
    }

    function open() {
        portalOpen();
        containerEl.classList.add('open');
        dropdown.classList.add('is-open');
        backdrop.classList.add('is-open');
        searchInput.value = '';
        render();
        setTimeout(function () { searchInput.focus(); }, 50);
    }

    function close() {
        containerEl.classList.remove('open');
        dropdown.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        setTimeout(portalClose, 350);
    }

    trigger.addEventListener('click', function () {
        containerEl.classList.contains('open') ? close() : open();
    });

    searchInput.addEventListener('input', function () { render(searchInput.value); });

    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('click', function (e) {
        if (!containerEl.contains(e.target) && !dropdown.contains(e.target) && !backdrop.contains(e.target)) close();
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });

    return {
        update: function (newItems) {
            items = newItems;
            this.reset();
        },
        reset: function () {
            selected = null;
            valueEl.textContent = placeholder;
            valueEl.classList.remove('has-value');
            close();
        }
    };
}

// ═══════════════════════════════════════════════════
// BRANCHED QUESTION DATA
// ═══════════════════════════════════════════════════

var HANDLING_IT_OPTIONS = {
    sales: [
        "Spreadsheets and email — that's basically it",
        "A CRM we're not really using well",
        "Mostly in people's heads",
        "Multiple tools that don't connect"
    ],
    service: [
        "Shared email inbox",
        "A helpdesk tool we've outgrown",
        "Phone calls and manual notes",
        "No real system — it's reactive"
    ],
    ops: [
        "Mostly email and chat messages",
        "Spreadsheets multiple people try to maintain",
        "Meetings that could have been a process",
        "Everyone has their own system"
    ],
    marketing: [
        "Scattered across social, email, and ads with no unified view",
        "Running campaigns but can't tell what's actually working",
        "We know we need to do more but don't know where to start",
        "A marketing tool we've outgrown or barely use"
    ]
};

var ROOT_CAUSE_OPTIONS = {
    sales: [
        "No visibility into where things stand",
        "Leads go cold because follow-up is inconsistent",
        "Proposals take too long or get lost",
        "We don't know what's working and what isn't"
    ],
    service: [
        "No single place to see all customer issues",
        "Too much depends on individual people",
        "No process for escalation or follow-through",
        "We can't tell what's resolved and what isn't"
    ],
    ops: [
        "Lack of ownership — nobody's accountable",
        "Too many tools that don't connect",
        "Processes exist but aren't enforced",
        "The way we work hasn't changed even though the team has"
    ],
    marketing: [
        "No way to track what's generating leads vs. wasting budget",
        "Campaigns go out but there's no follow-through to sales",
        "Content and messaging are inconsistent across channels",
        "We're guessing instead of using data"
    ]
};

// ── Populate branched radio groups ────────────────

function populateBranchedRadios(groupId, options, name) {
    var group = document.getElementById(groupId);
    group.innerHTML = '';
    options.forEach(function (text, i) {
        var label = document.createElement('label');
        label.className = 'radio-option fade-in';
        label.style.setProperty('--delay', (0.5 + i * 0.15) + 's');

        var input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = text;

        var control = document.createElement('span');
        control.className = 'radio-control';

        var labelText = document.createElement('span');
        labelText.className = 'radio-label';
        labelText.textContent = text;

        label.appendChild(input);
        label.appendChild(control);
        label.appendChild(labelText);
        group.appendChild(label);
    });
}

// ═══════════════════════════════════════════════════
// SUPPLEMENTARY SIGNAL MAPPINGS (new questions)
// ═══════════════════════════════════════════════════

var BREAKDOWN_SIGNAL_MAP = {
    sales:     { crm_needed: 0.8, followup_automation_needed: 0.7 },
    service:   { helpdesk_needed: 0.9, customer_context_needed: 0.7 },
    ops:       { workflow_automation: 0.8, process_definition_needed: 0.7 },
    marketing: { marketing_automation_needed: 0.8, reporting_needed: 0.6 }
};

var APPROACH_SIGNAL_MAP = {
    // Sales
    "Spreadsheets and email — that's basically it":
        { spreadsheet_replacement: 0.6, data_entry_automation: 0.5 },
    "A CRM we're not really using well":
        { crm_adoption_needed: 0.7 },
    "Mostly in people's heads":
        { crm_needed: 0.7, process_definition_needed: 0.6 },
    "Multiple tools that don't connect":
        { integration_needed: 0.6, unified_platform_needed: 0.5 },
    // Service
    "Shared email inbox":
        { helpdesk_needed: 0.7, workflow_automation: 0.5 },
    "A helpdesk tool we've outgrown":
        { helpdesk_needed: 0.6, integration_needed: 0.5 },
    "Phone calls and manual notes":
        { data_entry_automation: 0.6, helpdesk_needed: 0.5 },
    "No real system — it's reactive":
        { process_definition_needed: 0.6, helpdesk_needed: 0.5 },
    // Ops
    "Mostly email and chat messages":
        { collaboration_needed: 0.6, process_definition_needed: 0.5 },
    "Spreadsheets multiple people try to maintain":
        { spreadsheet_replacement: 0.6, data_entry_automation: 0.5 },
    "Meetings that could have been a process":
        { workflow_automation: 0.6, process_definition_needed: 0.6 },
    "Everyone has their own system":
        { unified_platform_needed: 0.6, integration_needed: 0.5 },
    // Marketing
    "Scattered across social, email, and ads with no unified view":
        { marketing_automation_needed: 0.6, integration_needed: 0.5 },
    "Running campaigns but can't tell what's actually working":
        { reporting_needed: 0.6, analytics_needed: 0.5 },
    "We know we need to do more but don't know where to start":
        { marketing_automation_needed: 0.5, email_campaigns_needed: 0.5 },
    "A marketing tool we've outgrown or barely use":
        { marketing_automation_needed: 0.6, integration_needed: 0.5 }
};

var ROOT_CAUSE_SIGNAL_MAP = {
    // Sales
    "No visibility into where things stand":
        { reporting_needed: 0.7, dashboard_needed: 0.6 },
    "Leads go cold because follow-up is inconsistent":
        { followup_automation_needed: 0.8 },
    "Proposals take too long or get lost":
        { workflow_automation: 0.6, data_entry_automation: 0.5 },
    "We don't know what's working and what isn't":
        { reporting_needed: 0.7, analytics_needed: 0.6 },
    // Service
    "No single place to see all customer issues":
        { helpdesk_needed: 0.7, dashboard_needed: 0.6 },
    "Too much depends on individual people":
        { process_definition_needed: 0.7, workflow_automation: 0.5 },
    "No process for escalation or follow-through":
        { workflow_automation: 0.7, approval_flows_needed: 0.6 },
    "We can't tell what's resolved and what isn't":
        { reporting_needed: 0.7, dashboard_needed: 0.6 },
    // Ops
    "Lack of ownership — nobody's accountable":
        { process_definition_needed: 0.7, approval_flows_needed: 0.6 },
    "Too many tools that don't connect":
        { integration_needed: 0.7 },
    "Processes exist but aren't enforced":
        { workflow_automation: 0.7, process_definition_needed: 0.6 },
    "The way we work hasn't changed even though the team has":
        { process_definition_needed: 0.6, collaboration_needed: 0.5 },
    // Marketing
    "No way to track what's generating leads vs. wasting budget":
        { reporting_needed: 0.8, analytics_needed: 0.6 },
    "Campaigns go out but there's no follow-through to sales":
        { crm_needed: 0.6, followup_automation_needed: 0.6 },
    "Content and messaging are inconsistent across channels":
        { marketing_automation_needed: 0.6, social_media_needed: 0.5 },
    "We're guessing instead of using data":
        { reporting_needed: 0.8, dashboard_needed: 0.7 }
};

var IMPACT_SIGNAL_MAP = {
    revenue_loss:         { crm_needed: 0.6, followup_automation_needed: 0.6 },
    customer_churn:       { helpdesk_needed: 0.7, customer_context_needed: 0.6 },
    time_waste:           { workflow_automation: 0.6, data_entry_automation: 0.5 },
    team_friction:        { collaboration_needed: 0.6, process_definition_needed: 0.5 },
    general_inefficiency: { workflow_automation: 0.5, reporting_needed: 0.4 }
};

var URGENCY_MULTIPLIER = {
    critical: 1.2,
    high: 1.1,
    medium: 1.0,
    low: 0.9
};

// Inject supplementary signals into answers.painPoints format
// so the existing scoring engine can pick them up, PLUS
// return extra signals to merge after scoring.
function buildSupplementarySignals(answers) {
    var signals = {};

    function merge(map) {
        if (!map) return;
        for (var sig in map) {
            if (!signals[sig] || map[sig] > signals[sig]) {
                signals[sig] = map[sig];
            }
        }
    }

    // breakdownArea
    if (answers.breakdownArea && BREAKDOWN_SIGNAL_MAP[answers.breakdownArea]) {
        merge(BREAKDOWN_SIGNAL_MAP[answers.breakdownArea]);
    }

    // currentApproach
    if (answers.currentApproach && APPROACH_SIGNAL_MAP[answers.currentApproach]) {
        merge(APPROACH_SIGNAL_MAP[answers.currentApproach]);
    }

    // rootCause
    if (answers.rootCause && ROOT_CAUSE_SIGNAL_MAP[answers.rootCause]) {
        merge(ROOT_CAUSE_SIGNAL_MAP[answers.rootCause]);
    }

    // impact (array)
    if (answers.impact && Array.isArray(answers.impact)) {
        answers.impact.forEach(function (val) {
            if (IMPACT_SIGNAL_MAP[val]) {
                merge(IMPACT_SIGNAL_MAP[val]);
            }
        });
    }

    return signals;
}

// ═══════════════════════════════════════════════════
// FLOW WIRING
// ═══════════════════════════════════════════════════

// Landing → Journey Stage
document.getElementById('getStartedBtn').addEventListener('click', function () {
    if (forwardHistory.length > 0) {
        var nextPage = forwardHistory.pop();
        showPage(nextPage, false, true);
    } else {
        showPage('pageJourneyStage');
    }
});

// Journey Stage → Industry
radioAdvance('journeyStageGroup', 'journeyStage', 'pageIndustry');

// Q1: Industry → Users
var subField = document.getElementById('subIndustryField');

var subSelectDropdown = initSearchSelect(
    document.getElementById('subIndustrySelect'),
    [],
    function (subName) {
        state.answers.subIndustry = subName;
        setTimeout(function () { showPage('pageUsers'); }, 350);
    }
);

initSearchSelect(
    document.getElementById('industrySelect'),
    INDUSTRIES.map(function (i) { return i.name; }),
    function (industryName) {
        state.answers.industry = industryName;
        var match = INDUSTRIES.find(function (i) { return i.name === industryName; });

        if (match && match.subs.length > 0) {
            subField.style.display = '';
            subField.style.animation = 'none';
            subField.offsetHeight;
            subField.style.animation = '';

            delete state.answers.subIndustry;
            subSelectDropdown.update(match.subs);
        } else {
            subField.style.display = 'none';
            delete state.answers.subIndustry;
            setTimeout(function () { showPage('pageUsers'); }, 350);
        }
    }
);

// Q2: Users → Role
radioAdvance('usersGroup', 'users', 'pageRole');

// Q3: Role → B2B
radioAdvance('roleGroup', 'role', 'pageB2B');

// Q4: B2B → next (depends on journeyStage)
document.getElementById('b2bGroup').addEventListener('change', function (e) {
    state.answers.b2b = e.target.value;
    setTimeout(function () {
        if (state.answers.journeyStage === 'advanced') {
            // Skip pageProducts and pageCurrentSoftware
            showPage('pageReplaceKeep');
        } else {
            showPage('pageProducts');
        }
    }, 350);
});

// Q5: Products → Current Software
buttonAdvance('productsNext', 'productsInput', 'products', 'pageCurrentSoftware');

// Q6: Current Software → Replace/Keep
// Modify title if customer journey stage
document.getElementById('currentSoftwareNext').addEventListener('click', function () {
    var input = document.getElementById('currentSoftwareInput');
    if (input.value.trim().length > 0) {
        state.answers.currentSoftware = input.value;
        showPage('pageReplaceKeep');
    }
});
// Validation for currentSoftwareNext
(function () {
    var btn = document.getElementById('currentSoftwareNext');
    var input = document.getElementById('currentSoftwareInput');
    var validate = function () { btn.disabled = input.value.trim().length === 0; };
    validate();
    input.addEventListener('input', validate);
})();

// Q7: Replace/Keep → Breakdown
buttonAdvance('replaceKeepNext', 'replaceKeepInput', 'replaceKeep', 'pageBreakdown');

// Breakdown → HandlingIt (branched)
document.getElementById('breakdownGroup').addEventListener('change', function (e) {
    state.answers.breakdownArea = e.target.value;

    // Populate branched options for HandlingIt
    var options = HANDLING_IT_OPTIONS[e.target.value] || [];
    populateBranchedRadios('handlingItGroup', options, 'currentApproach');

    setTimeout(function () { showPage('pageHandlingIt'); }, 350);
});

// HandlingIt → RootCause (branched)
document.getElementById('handlingItGroup').addEventListener('change', function (e) {
    state.answers.currentApproach = e.target.value;

    // Populate branched options for RootCause
    var options = ROOT_CAUSE_OPTIONS[state.answers.breakdownArea] || [];
    populateBranchedRadios('rootCauseGroup', options, 'rootCause');

    setTimeout(function () { showPage('pageRootCause'); }, 350);
});

// RootCause → Impact
document.getElementById('rootCauseGroup').addEventListener('change', function (e) {
    state.answers.rootCause = e.target.value;
    setTimeout(function () { showPage('pageImpact'); }, 350);
});

// Impact → Urgency
document.getElementById('impactNext').addEventListener('click', function () {
    var checked = document.querySelectorAll('#impactGroup input:checked');
    state.answers.impact = Array.from(checked).map(function (cb) { return cb.value; });
    showPage('pageUrgency');
});

// Urgency → Requirements
radioAdvance('urgencyGroup', 'urgency', 'pageRequirements');

// Q9: Requirements → Q10 (Biggest Worry)
buttonAdvance('requirementsNext', 'requirementsInput', 'requirements', 'pageBiggestWorry');

// Q10: Biggest Worry → Summary
var bwBtn = document.getElementById('biggestWorryNext');
var bwInput = document.getElementById('biggestWorryInput');
var validateBw = function () { bwBtn.disabled = bwInput.value.trim().length === 0; };
validateBw();
bwInput.addEventListener('input', validateBw);

bwBtn.addEventListener('click', function () {
    if (bwBtn.disabled) return;
    state.answers.biggestWorry = bwInput.value;
    var errEl = document.getElementById('biggestWorryError');
    errEl.style.display = 'none';
    bwBtn.disabled = true;
    bwBtn.textContent = 'Analyzing...';
    showAnalyzingPage();
    generateDiagnostic(state.answers)
        .then(function (data) {
            state.answers.aiSignals = data.parsedSignals;
            state.answers.diagnostic = data.diagnostic;
            stopAnalyzing();
            generateSummary();
        })
        .catch(function (err) {
            stopAnalyzing();
            showPage('pageBiggestWorry');
            errEl.textContent = 'We couldn\'t analyze your response: ' + (err && err.message || 'unknown error') + '. Please try again.';
            errEl.style.display = 'block';
            bwBtn.disabled = false;
            bwBtn.textContent = 'Finish';
        });
});

// ── AI diagnostic generation (Qwen via Catalyst QuickML) ──
// LLM is required per CLAUDE.md. Accepts the full answers map, returns both
// parsedSignals (feeds the rule-based ScoringEngine for Phase II bundles) and
// diagnostic (Phase I platform-agnostic output). Rejects on failure; caller
// must surface it rather than rendering a partial summary.
function generateDiagnostic(answers) {
    if (!answers || Object.keys(answers).length === 0) {
        return Promise.reject(new Error('No answers provided to diagnostic'));
    }
    return attemptDiagnostic(answers, 1);
}

function attemptDiagnostic(answers, attemptsLeft) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);

    return fetch('/server/discowizard_function/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answers }),
        signal: controller.signal
    })
        .then(function (resp) {
            clearTimeout(timer);
            return resp.json().then(function (body) { return { ok: resp.ok, body: body }; });
        })
        .then(function (r) {
            if (!r.ok || !r.body || r.body.status !== 'success' || !r.body.data) {
                throw new Error((r.body && r.body.message) || 'Diagnostic returned no data');
            }
            if (!r.body.data.parsedSignals || !r.body.data.diagnostic) {
                throw new Error('Diagnostic response missing parsedSignals or diagnostic');
            }
            return r.body.data;
        })
        .catch(function (err) {
            clearTimeout(timer);
            if (attemptsLeft > 0) {
                console.warn('Diagnostic failed, retrying:', err && err.message);
                return attemptDiagnostic(answers, attemptsLeft - 1);
            }
            throw err;
        });
}

// ── Summary Constants ─────────────────────────────

var B2B_LABELS = {
    'b2b': 'B2B (Other Businesses)',
    'b2c': 'B2C (Consumers)',
    'both': 'B2B & B2C'
};

var ROLE_LABELS = {
    'user': 'End User',
    'system-admin': 'System Administrator',
    'team-manager': 'Team Manager',
    'owner-operator': 'Owner / Operator'
};

var ROLLOUT_LABELS = {
    1: 'Day 1',
    2: 'Week 1',
    3: 'Month 1'
};

var JOURNEY_FRAMING = {
    prospect: {
        subtitle: "Here's where to start — no Zoho experience needed.",
        prefix: "For a business like yours,"
    },
    evaluating: {
        subtitle: "Here's how Zoho addresses your specific situation.",
        prefix: "Based on what you're dealing with,"
    },
    customer: {
        subtitle: "Here's how to get more out of your current setup.",
        prefix: "Given what you're already running,"
    },
    advanced: {
        subtitle: "Here's where to go deeper.",
        prefix: "To take your setup further,"
    }
};

// ── Logo Color Map ────────────────────────────────

var PRODUCT_COLORS = {
    zoho_crm: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    zoho_bigin: 'linear-gradient(135deg, #fb923c, #ea580c)',
    zoho_desk: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    zoho_analytics: 'linear-gradient(135deg, #10b981, #059669)',
    zoho_projects: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    zoho_books: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    zoho_invoice: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    zoho_campaigns: 'linear-gradient(135deg, #f59e0b, #d97706)',
    zoho_social: 'linear-gradient(135deg, #ec4899, #db2777)',
    zoho_creator: 'linear-gradient(135deg, #f59e0b, #d97706)',
    zoho_flow: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    zoho_sign: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    zoho_people: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    zoho_recruit: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    zoho_expense: 'linear-gradient(135deg, #34d399, #10b981)',
    zoho_inventory: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    zoho_marketing_automation: 'linear-gradient(135deg, #f97316, #ea580c)',
    zoho_salesiq: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    zoho_cliq: 'linear-gradient(135deg, #f472b6, #ec4899)',
    zoho_workdrive: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    zoho_meeting: 'linear-gradient(135deg, #818cf8, #6366f1)',
    zoho_commerce: 'linear-gradient(135deg, #fb7185, #f43f5e)',
    zoho_survey: 'linear-gradient(135deg, #4ade80, #22c55e)',
    zoho_learn: 'linear-gradient(135deg, #c084fc, #a855f7)',
    zoho_directory: 'linear-gradient(135deg, #94a3b8, #64748b)',
    zoho_sprints: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    zoho_payroll: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
    zoho_checkout: 'linear-gradient(135deg, #facc15, #eab308)',
    zoho_backstage: 'linear-gradient(135deg, #e879f9, #d946ef)',
    zoho_bookings: 'linear-gradient(135deg, #67e8f9, #22d3ee)',
    zoho_assist: 'linear-gradient(135deg, #fb923c, #f97316)',
    zoho_forms: 'linear-gradient(135deg, #86efac, #4ade80)',
    zoho_sites: 'linear-gradient(135deg, #fda4af, #fb7185)',
    zoho_lens: 'linear-gradient(135deg, #7dd3fc, #38bdf8)',
    zoho_thrive: 'linear-gradient(135deg, #fcd34d, #fbbf24)'
};

function getProductColor(productId) {
    return PRODUCT_COLORS[productId] || 'linear-gradient(135deg, #1a73e8, #4285f4)';
}

function getProductInitials(productName) {
    return productName.replace('Zoho ', '');
}

// ── Summary Generation ─────────────────────────────

function generateSummary() {
    if (!knowledgeModel) {
        if (knowledgeModelError) {
            console.error('Knowledge model failed to load, using fallback summary.');
            generateSummaryFallback();
            return;
        }
        showLoadingState();
        var checkInterval = setInterval(function () {
            if (knowledgeModel) {
                clearInterval(checkInterval);
                generateSummary();
            } else if (knowledgeModelError) {
                clearInterval(checkInterval);
                console.error('Knowledge model failed to load, using fallback summary.');
                generateSummaryFallback();
            }
        }, 100);
        return;
    }

    try {
        // Phase I: render LLM-authored diagnostic above the bundles.
        if (state.answers.diagnostic) {
            renderDiagnostic(state.answers.diagnostic);
        }

        // Phase II: rule-based scoring (unchanged).
        // Build supplementary signals from new questions
        var supplementary = buildSupplementarySignals(state.answers);

        // Run the scoring engine with supplementary signals merged in
        var result = window.ScoringEngine.score(state.answers, knowledgeModel, supplementary);

        // Apply urgency multiplier to confidence scores
        var urgencyMult = URGENCY_MULTIPLIER[state.answers.urgency] || 1.0;
        if (urgencyMult !== 1.0 && result.top_patterns) {
            result.top_patterns.forEach(function (p) {
                p.confidence = Math.min(p.confidence * urgencyMult, 1.0);
                p.confidence = Math.round(p.confidence * 1000) / 1000;
            });
        }

        renderScoredSummary(result);
    } catch (e) {
        console.error('Scoring engine error:', e);
        generateSummaryFallback();
    }
}

// ── Analyzing page: rotating progress messages while LLM works ──
var ANALYZING_MESSAGES = [
    'Reading your context...',
    'Listening for what\'s really breaking...',
    'Finding the root cause...',
    'Assessing urgency and impact...',
    'Building your roadmap...'
];
var analyzingInterval = null;

function showAnalyzingPage() {
    var msgEl = document.getElementById('analyzingMessage');
    var i = 0;
    if (msgEl) msgEl.textContent = ANALYZING_MESSAGES[0];
    showPage('pageAnalyzing');

    stopAnalyzing();
    analyzingInterval = setInterval(function () {
        if (!msgEl) return;
        msgEl.classList.add('fading');
        setTimeout(function () {
            i = (i + 1) % ANALYZING_MESSAGES.length;
            msgEl.textContent = ANALYZING_MESSAGES[i];
            msgEl.classList.remove('fading');
        }, 350);
    }, 2500);
}

function stopAnalyzing() {
    if (analyzingInterval) {
        clearInterval(analyzingInterval);
        analyzingInterval = null;
    }
}

function renderDiagnostic(d) {
    var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text || '--'; };
    set('diagProblem', d.problemStatement);
    set('diagRootCause', d.rootCause);
    set('diagSeverity', d.severity);
    var list = document.getElementById('diagRoadmap');
    if (list) {
        while (list.firstChild) list.removeChild(list.firstChild);
        (d.solutionRoadmap || []).forEach(function (step) {
            var li = document.createElement('li');
            li.className = 'roadmap-item';
            var p = document.createElement('p');
            p.className = 'text-body';
            p.textContent = step.process || '';
            var cat = document.createElement('p');
            cat.className = 'text-body text-muted';
            cat.style.marginTop = '0.25rem';
            cat.textContent = step.toolCategory || '';
            li.appendChild(p);
            li.appendChild(cat);
            list.appendChild(li);
        });
    }
}

function showLoadingState() {
    populateBusinessProfile();
    document.getElementById('primaryPatternName').textContent = 'Analyzing...';
    document.getElementById('primaryExplanation').textContent = '';
    document.getElementById('primaryOutcome').textContent = '';
    document.getElementById('primaryBundleList').innerHTML =
        '<div class="tool-card"><div class="tool-logo" style="background: var(--border); color: var(--text-muted); width: auto; padding: 0 1rem;">Building your recommendation...</div></div>';
    showPage('pageSummary');
}

function generateSummaryFallback() {
    populateBusinessProfile();

    // Set a generic subtitle
    var framing = JOURNEY_FRAMING[state.answers.journeyStage] || JOURNEY_FRAMING.prospect;
    document.getElementById('summarySubtitle').textContent = framing.subtitle;

    document.getElementById('primaryPatternName').textContent = 'General Recommendation';
    document.getElementById('primaryExplanation').textContent =
        'We couldn\'t load the full recommendation engine. Here\'s a general overview based on your profile.';
    document.getElementById('primaryOutcome').textContent = '';
    document.getElementById('primaryBundleList').innerHTML = '';

    // Hide optional sections
    document.getElementById('sectionSupportingBundle').style.display = 'none';
    document.getElementById('sectionAlternatePaths').style.display = 'none';
    document.getElementById('zohoOneBadge').style.display = 'none';
    document.getElementById('summaryFlagBanner').style.display = 'none';

    showPage('pageSummary');
}

function populateBusinessProfile() {
    var industryText = state.answers.subIndustry
        ? state.answers.industry + ' (' + state.answers.subIndustry + ')'
        : (state.answers.industry || 'Not specified');

    document.getElementById('sumIndustry').textContent = industryText;
    document.getElementById('sumUsers').textContent = state.answers.users || 'Not specified';
    document.getElementById('sumRole').textContent = ROLE_LABELS[state.answers.role] || 'Not specified';
    document.getElementById('sumB2B').textContent = B2B_LABELS[state.answers.b2b] || 'Not specified';
    document.getElementById('sumProducts').textContent = state.answers.products || 'No products/services described.';
}

function renderScoredSummary(result) {
    populateBusinessProfile();

    // ── Journey-stage framing ──
    var framing = JOURNEY_FRAMING[state.answers.journeyStage] || JOURNEY_FRAMING.prospect;
    document.getElementById('summarySubtitle').textContent = framing.subtitle;

    // ── Flag banner ──
    var bannerEl = document.getElementById('summaryFlagBanner');
    bannerEl.style.display = 'none';
    bannerEl.innerHTML = '';

    if (result.flag === 'bring_to_leadership') {
        bannerEl.style.display = 'block';
        bannerEl.textContent = 'This recommendation is designed to bring to your leadership team.';
    } else if (result.flag === 'sales_handoff') {
        bannerEl.style.display = 'block';
        bannerEl.style.background = '#e8f5e9';
        bannerEl.style.borderColor = '#81c784';
        var text = document.createElement('span');
        text.textContent = 'Based on your team size, a Zoho specialist can help you get set up faster. ';
        var link = document.createElement('a');
        link.href = 'https://www.zoho.com/contact-sales.html';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Talk to a Specialist';
        link.style.cssText = 'font-weight: 600; color: #2e7d32; text-decoration: underline;';
        bannerEl.appendChild(text);
        bannerEl.appendChild(link);
    }

    // ── Zoho One badge ──
    var zohoOneBadge = document.getElementById('zohoOneBadge');
    zohoOneBadge.style.display = result.zoho_one_recommended ? 'inline-flex' : 'none';

    // ── No patterns? Fallback ──
    if (!result.top_patterns || result.top_patterns.length === 0) {
        generateSummaryFallback();
        return;
    }

    var primary = result.top_patterns[0];

    // ── Primary Recommendation section ──
    document.getElementById('primaryPatternName').textContent = primary.pattern_name;

    // Prefix explanation with journey-stage framing
    var explanation = framing.prefix + ' ' + primary.explanation;
    document.getElementById('primaryExplanation').textContent = explanation;
    document.getElementById('primaryOutcome').textContent = primary.business_outcome;

    // ── Primary Bundle ──
    var bundleList = document.getElementById('primaryBundleList');
    bundleList.innerHTML = '';

    primary.primary_bundle.forEach(function (product) {
        var card = document.createElement('div');
        card.className = 'tool-card';

        var logo = document.createElement('div');
        logo.className = 'tool-logo';
        logo.style.background = getProductColor(product.product_id);
        logo.textContent = getProductInitials(product.product_name);

        var body = document.createElement('div');
        body.className = 'tool-card__body';

        var nameEl = document.createElement('strong');
        nameEl.className = 'tool-card__name';
        nameEl.textContent = product.product_name;

        var lineEl = document.createElement('p');
        lineEl.className = 'tool-card__line';
        lineEl.textContent = product.one_line;

        var whyEl = document.createElement('p');
        whyEl.className = 'tool-card__why';
        whyEl.textContent = product.why;

        body.appendChild(nameEl);
        body.appendChild(lineEl);
        body.appendChild(whyEl);

        var badgeEl = document.createElement('span');
        badgeEl.className = 'tool-card__badge badge--' + product.rollout_priority;
        badgeEl.textContent = ROLLOUT_LABELS[product.rollout_priority] || 'Month 1';

        card.appendChild(logo);
        card.appendChild(body);
        card.appendChild(badgeEl);
        bundleList.appendChild(card);
    });

    // ── Supporting Bundle ──
    var supportSection = document.getElementById('sectionSupportingBundle');
    var supportList = document.getElementById('supportingBundleList');
    supportList.innerHTML = '';

    if (primary.supporting_bundle && primary.supporting_bundle.length > 0) {
        supportSection.style.display = '';
        primary.supporting_bundle.forEach(function (product) {
            var card = document.createElement('div');
            card.className = 'tool-card';

            var logo = document.createElement('div');
            logo.className = 'tool-logo';
            logo.style.background = getProductColor(product.product_id);
            logo.textContent = getProductInitials(product.product_name);

            var body = document.createElement('div');
            body.className = 'tool-card__body';

            var nameEl = document.createElement('strong');
            nameEl.className = 'tool-card__name';
            nameEl.textContent = product.product_name;

            var lineEl = document.createElement('p');
            lineEl.className = 'tool-card__line';
            lineEl.textContent = product.one_line;

            body.appendChild(nameEl);
            body.appendChild(lineEl);

            var badgeEl = document.createElement('span');
            badgeEl.className = 'tool-card__badge badge--' + product.rollout_priority;
            badgeEl.textContent = ROLLOUT_LABELS[product.rollout_priority] || 'Month 1';

            card.appendChild(logo);
            card.appendChild(body);
            card.appendChild(badgeEl);
            supportList.appendChild(card);
        });
    } else {
        supportSection.style.display = 'none';
    }

    // ── Alternate Paths ──
    var altSection = document.getElementById('sectionAlternatePaths');
    var altList = document.getElementById('alternatePathsList');
    altList.innerHTML = '';

    if (result.top_patterns.length > 1) {
        altSection.style.display = '';
        var alternates = result.top_patterns.slice(1);

        alternates.forEach(function (alt) {
            var pathDiv = document.createElement('div');
            pathDiv.className = 'alternate-path';

            var toggle = document.createElement('button');
            toggle.className = 'alternate-path__toggle';

            var nameSpan = document.createElement('span');
            nameSpan.textContent = alt.pattern_name;

            var outcomeSpan = document.createElement('span');
            outcomeSpan.className = 'alternate-path__outcome';
            outcomeSpan.textContent = alt.business_outcome;

            var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chevron.setAttribute('width', '16');
            chevron.setAttribute('height', '16');
            chevron.setAttribute('viewBox', '0 0 24 24');
            chevron.setAttribute('fill', 'none');
            chevron.setAttribute('stroke', 'currentColor');
            chevron.setAttribute('stroke-width', '2');
            chevron.setAttribute('stroke-linecap', 'round');
            chevron.setAttribute('stroke-linejoin', 'round');
            chevron.style.transition = 'transform 0.2s ease';
            chevron.style.flexShrink = '0';
            var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', '6 9 12 15 18 9');
            chevron.appendChild(polyline);

            toggle.appendChild(nameSpan);
            toggle.appendChild(outcomeSpan);
            toggle.appendChild(chevron);

            var detail = document.createElement('div');
            detail.className = 'alternate-path__detail';
            detail.style.display = 'none';

            alt.primary_bundle.forEach(function (p, idx) {
                var chip = document.createElement('span');
                chip.className = 'badge';
                chip.textContent = p.product_name;
                detail.appendChild(chip);
                if (idx < alt.primary_bundle.length - 1) {
                    detail.appendChild(document.createTextNode(' '));
                }
            });

            toggle.addEventListener('click', function () {
                var isOpen = detail.style.display !== 'none';
                detail.style.display = isOpen ? 'none' : 'block';
                chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });

            pathDiv.appendChild(toggle);
            pathDiv.appendChild(detail);
            altList.appendChild(pathDiv);
        });
    } else {
        altSection.style.display = 'none';
    }

    // ── Priority button ──
    document.getElementById('btnPriority').onclick = function () {
        alert("Roadmap priority calculations coming soon!");
    };

    showPage('pageSummary');
}

// ── Load Knowledge Model ──────────────────────────

function loadKnowledgeModel() {
    return fetch('knowledge-model.json')
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function (data) {
            knowledgeModel = data;
        });
}

// ── Modify currentSoftware title for customer journey ──

function updateCurrentSoftwareTitle() {
    var titleEl = document.getElementById('currentSoftwareTitle');
    var inputEl = document.getElementById('currentSoftwareInput');
    if (state.answers.journeyStage === 'customer') {
        titleEl.textContent = 'Which Zoho apps are you currently using?';
        inputEl.placeholder = 'e.g., Zoho CRM, Zoho Books, Zoho Desk...';
    } else {
        titleEl.textContent = 'What software are you currently using?';
        inputEl.placeholder = 'e.g., QuickBooks for accounting, Excel for tracking...';
    }
}

// ── Initialization ─────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Load knowledge model (scoring engine loaded via script tag now)
    loadKnowledgeModel()
        .then(function () {
            console.log('Knowledge model loaded successfully.');
        })
        .catch(function (err) {
            console.error('Failed to load knowledge model:', err);
            knowledgeModelError = err;
        });

    document.getElementById('btnStartOver').addEventListener('click', function () {
        localStorage.removeItem('discoverWizardState');
        window.location.reload();
    });

    // Watch for journey stage changes to update currentSoftware title
    document.getElementById('journeyStageGroup').addEventListener('change', function () {
        setTimeout(updateCurrentSoftwareTitle, 50);
    });

    var savedPage = loadState();
    if (savedPage) {
        // Restore branched radio groups if needed
        if (state.answers.breakdownArea) {
            var handlingOpts = HANDLING_IT_OPTIONS[state.answers.breakdownArea] || [];
            populateBranchedRadios('handlingItGroup', handlingOpts, 'currentApproach');

            var rootOpts = ROOT_CAUSE_OPTIONS[state.answers.breakdownArea] || [];
            populateBranchedRadios('rootCauseGroup', rootOpts, 'rootCause');
        }
        updateCurrentSoftwareTitle();
        showPage(savedPage);
    }
});

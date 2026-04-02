// ── DiscoverWizard – Main ─────────────────────────

const state = {
    answers: {},
};

// ── Branched Options Data ─────────────────────────

const PP2_OPTIONS = {
    sales: [
        { value: 'spreadsheets', label: "Spreadsheets and email — that's basically it" },
        { value: 'underused-crm', label: "A CRM we're not really using well" },
        { value: 'in-heads', label: "Mostly in people's heads" },
        { value: 'fragmented-tools', label: "Multiple tools that don't connect to each other" },
    ],
    service: [
        { value: 'shared-inbox', label: 'Shared email inbox' },
        { value: 'outgrown-helpdesk', label: "A helpdesk tool we've outgrown" },
        { value: 'phone-manual', label: 'Phone calls and manual notes' },
        { value: 'no-system', label: "No real system — it's reactive" },
    ],
    ops: [
        { value: 'email-chat', label: 'Mostly email and chat messages' },
        { value: 'shared-spreadsheets', label: 'Spreadsheets multiple people try to maintain' },
        { value: 'meeting-heavy', label: 'Meetings that could have been a process' },
        { value: 'everyone-own-system', label: 'Everyone has their own system' },
    ],
    marketing: [
        { value: 'scattered', label: 'Scattered across social, email, and ads with no unified view' },
        { value: 'no-attribution', label: "Running campaigns but can't tell what's actually working" },
        { value: 'dont-know-start', label: "We know we need to do more but don't know where to start" },
        { value: 'outgrown-tool', label: "A marketing tool we've outgrown or barely use" },
    ],
};

const PP3_OPTIONS = {
    sales: [
        { value: 'no-visibility', label: 'No visibility into where things stand' },
        { value: 'inconsistent-followup', label: 'Leads go cold because follow-up is inconsistent' },
        { value: 'slow-proposals', label: 'Proposals take too long or get lost' },
        { value: 'no-insight', label: "We don't know what's working and what isn't" },
    ],
    service: [
        { value: 'no-single-view', label: 'No single place to see all customer issues' },
        { value: 'people-dependent', label: 'Too much depends on individual people' },
        { value: 'no-escalation', label: 'No process for escalation or follow-through' },
        { value: 'cant-tell-status', label: "We can't tell what's resolved and what isn't" },
    ],
    ops: [
        { value: 'no-ownership', label: "Lack of ownership — nobody's accountable" },
        { value: 'tools-disconnected', label: "Too many tools that don't connect" },
        { value: 'not-enforced', label: "Processes exist but aren't enforced" },
        { value: 'outgrown-ways', label: "The way we work hasn't changed even though the team has" },
    ],
    marketing: [
        { value: 'no-tracking', label: "No way to track what's generating leads vs. wasting budget" },
        { value: 'no-followthrough', label: "Campaigns go out but there's no follow-through to sales" },
        { value: 'inconsistent-messaging', label: 'Content and messaging are inconsistent across channels' },
        { value: 'guessing', label: "We're guessing instead of using data" },
    ],
};

const PP4_PLACEHOLDERS = {
    sales: "Tell us what's happening — e.g., we lose track of leads after the first call and nobody owns follow-up...",
    service: "Tell us what's happening — e.g., customers have to repeat themselves every time they contact us...",
    ops: "Tell us what's happening — e.g., approvals get stuck and nobody knows where things stand...",
    marketing: "Tell us what's happening — e.g., we spend money on ads but have no idea which ones actually turn into customers...",
};

// ── Page Navigation ───────────────────────────────

function showPage(targetId) {
    const current = document.querySelector('.page.active');
    const next = document.getElementById(targetId);
    if (!current || !next || current === next) return;

    current.classList.add('fade-out');

    current.addEventListener('animationend', () => {
        current.classList.remove('active', 'fade-out');
        next.classList.add('active');

        // Re-trigger fade-in animations
        next.querySelectorAll('.fade-in').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // force reflow
            el.style.animation = '';
        });

        // Reset sub-industry field on industry page
        const subField = next.querySelector('#subIndustryField');
        if (subField) subField.style.display = 'none';
    }, { once: true });
}

// ── Helper: build radio options into a group ──────

function buildRadioGroup(groupEl, name, options, onSelect) {
    groupEl.innerHTML = '';
    options.forEach((opt, i) => {
        const label = document.createElement('label');
        label.className = 'radio-option fade-in';
        label.style.setProperty('--delay', `${0.5 + i * 0.15}s`);
        label.innerHTML = `
            <input type="radio" name="${name}" value="${opt.value}">
            <span class="radio-control"></span>
            <span class="radio-label">${opt.label}</span>
        `;
        groupEl.appendChild(label);
    });

    groupEl.addEventListener('change', (e) => {
        onSelect(e.target.value);
    }, { once: true });
}

// ── Page 1: Landing ──────────────────────────────

document.getElementById('getStartedBtn').addEventListener('click', () => {
    showPage('pageCompanySize');
});

// ── Page 2: Company Size → Industry ──────────────

document.getElementById('companySizeGroup').addEventListener('change', (e) => {
    state.answers.companySize = e.target.value;
    setTimeout(() => showPage('pageIndustry'), 350);
});

// ── Page 3: Industry → Role ──────────────────────

// Searchable Select Component
function initSearchSelect(containerEl, items, onSelect) {
    const trigger = containerEl.querySelector('.search-select__trigger');
    const valueEl = containerEl.querySelector('.search-select__value');
    const searchInput = containerEl.querySelector('.search-select__search');
    const optionsList = containerEl.querySelector('.search-select__options');
    const placeholder = valueEl.dataset.placeholder;

    let selected = null;

    function render(filter = '') {
        const lower = filter.toLowerCase();
        const filtered = items.filter(item => item.toLowerCase().includes(lower));
        optionsList.innerHTML = '';

        if (filtered.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'search-select__empty';
            empty.textContent = 'No results found';
            optionsList.appendChild(empty);
            return;
        }

        filtered.forEach(item => {
            const li = document.createElement('li');
            li.className = 'search-select__option';
            if (item === selected) li.classList.add('selected');
            li.textContent = item;
            li.addEventListener('click', () => {
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
        containerEl.classList.add('open');
        searchInput.value = '';
        render();
        setTimeout(() => searchInput.focus(), 50);
    }

    function close() {
        containerEl.classList.remove('open');
    }

    const backdrop = containerEl.querySelector('.search-select__backdrop');

    trigger.addEventListener('click', () => {
        containerEl.classList.contains('open') ? close() : open();
    });

    searchInput.addEventListener('input', () => render(searchInput.value));

    // Close on backdrop tap (mobile bottom sheet)
    if (backdrop) {
        backdrop.addEventListener('click', close);
    }

    // Close on outside click (desktop floating dropdown)
    document.addEventListener('click', (e) => {
        if (!containerEl.contains(e.target)) close();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    return { reset() {
        selected = null;
        valueEl.textContent = placeholder;
        valueEl.classList.remove('has-value');
    }};
}

const industryNames = INDUSTRIES.map(i => i.name);
const subField = document.getElementById('subIndustryField');

initSearchSelect(
    document.getElementById('industrySelect'),
    industryNames,
    (industryName) => {
        state.answers.industry = industryName;
        const match = INDUSTRIES.find(i => i.name === industryName);

        if (match && match.subs.length > 0) {
            subField.style.display = '';
            subField.style.animation = 'none';
            subField.offsetHeight;
            subField.style.animation = '';

            const subContainer = document.getElementById('subIndustrySelect');
            subContainer.classList.remove('open');
            const subValueEl = subContainer.querySelector('.search-select__value');
            subValueEl.textContent = subValueEl.dataset.placeholder;
            subValueEl.classList.remove('has-value');
            delete state.answers.subIndustry;

            initSearchSelect(subContainer, match.subs, (subName) => {
                state.answers.subIndustry = subName;
                setTimeout(() => showPage('pageRole'), 350);
            });
        }
    }
);

// ── Page 4: Role → Breakdown or Evaluator ────────

document.getElementById('roleGroup').addEventListener('change', (e) => {
    state.answers.role = e.target.value;
    if (e.target.value === 'evaluator') {
        setTimeout(() => showPage('pageEvaluatorRole'), 350);
    } else {
        setTimeout(() => showPage('pageBreakdown'), 350);
    }
});

// ── Page 4b: Evaluator Role → Breakdown ──────────

document.getElementById('evaluatorRoleGroup').addEventListener('change', (e) => {
    state.answers.evaluatorRole = e.target.value;
    setTimeout(() => showPage('pageBreakdown'), 350);
});

// ── Page 5: Breakdown → Handling (branched) ──────

document.getElementById('breakdownGroup').addEventListener('change', (e) => {
    state.answers.breakdown = e.target.value;
    const branch = e.target.value;

    // Build PP2 options based on branch
    buildRadioGroup(
        document.getElementById('handlingGroup'),
        'handling',
        PP2_OPTIONS[branch],
        (value) => {
            state.answers.handling = value;
            setTimeout(() => showPage('pageRootCause'), 350);
        }
    );

    // Pre-build PP3 options based on same branch
    buildRadioGroup(
        document.getElementById('rootCauseGroup'),
        'rootCause',
        PP3_OPTIONS[branch],
        (value) => {
            state.answers.rootCause = value;
            document.getElementById('freeTextInput').placeholder = PP4_PLACEHOLDERS[branch];
            setTimeout(() => showPage('pageFreeText'), 350);
        }
    );

    setTimeout(() => showPage('pageHandling'), 350);
});

// ── Page 8: Free Text → Impact ───────────────────

document.getElementById('freeTextNext').addEventListener('click', () => {
    state.answers.freeText = document.getElementById('freeTextInput').value;
    showPage('pageImpact');
});

// ── Page 9: Impact → Urgency ─────────────────────

document.getElementById('impactGroup').addEventListener('change', (e) => {
    state.answers.impact = e.target.value;
    setTimeout(() => showPage('pageUrgency'), 350);
});

// ── Page 10: Urgency → Summary (future) ──────────

document.getElementById('urgencyGroup').addEventListener('change', (e) => {
    state.answers.urgency = e.target.value;
    // Summary page will be wired here
    console.log('Phase I complete:', state.answers);
});

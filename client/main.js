// ── DiscoverWizard – Main ─────────────────────────

// ── DiscoverWizard – Main ─────────────────────────

let state = {
    answers: {},
};

let pageHistory = [];
let forwardHistory = [];

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
    const pages = [
        'pageLanding', 'pageIndustry', 'pageUsers', 'pageRole', 'pageB2B',
        'pageProducts', 'pageCurrentSoftware', 'pageReplaceKeep',
        'pagePainPoints', 'pageRequirements', 'pageBiggestWorry', 'pageSummary'
    ];
    let idx = pages.indexOf(targetId);
    if (idx < 0) idx = 0;

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const wizardNav = document.getElementById('wizardNav');
    const btnBack = document.getElementById('btnBack');
    const btnForward = document.getElementById('btnForward');

    if (idx === 0 || targetId === 'pageSummary') {
        progressContainer.style.display = 'none';
        wizardNav.style.display = 'none';
    } else {
        progressContainer.style.display = 'block';
        wizardNav.style.display = 'flex';
        const pct = (idx / (pages.length - 2)) * 100;
        progressBar.style.width = Math.min(pct, 100) + '%';
    }

    btnBack.disabled = pageHistory.length === 0;
    btnForward.disabled = forwardHistory.length === 0;
}

function showPage(targetId, isBack = false, isForward = false) {
    const current = document.querySelector('.page.active');
    const next = document.getElementById(targetId);
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
        if (subField && !state.answers.subIndustry && next.id === 'pageIndustry') {
           // Keep it hidden initially if navigating back and no answer
        }
    }, { once: true });
}

// ── Back Navigation ───────────────────────────────

document.getElementById('btnBack').addEventListener('click', () => {
    if (pageHistory.length > 0) {
        const prevPage = pageHistory.pop();
        showPage(prevPage, true);
    }
});

document.getElementById('btnForward').addEventListener('click', () => {
    if (forwardHistory.length > 0) {
        const nextPage = forwardHistory.pop();
        showPage(nextPage, false, true);
    }
});

// ── Helper: auto-advance on radio select ──────────

function radioAdvance(groupId, key, nextPageId) {
    document.getElementById(groupId).addEventListener('change', (e) => {
        state.answers[key] = e.target.value;
        setTimeout(() => showPage(nextPageId), 350);
    });
}

// ── Helper: advance on button click w/ validation ──

function buttonAdvance(btnId, inputId, key, nextPageId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    
    // Initial validation check
    const validate = () => {
        btn.disabled = input.value.trim().length === 0;
    };
    validate();
    input.addEventListener('input', validate);

    btn.addEventListener('click', () => {
        if (!btn.disabled) {
            state.answers[key] = input.value;
            showPage(nextPageId);
        }
    });
}

// ── Searchable Select Component ───────────────────

function initSearchSelect(containerEl, items, onSelect) {
    const trigger = containerEl.querySelector('.search-select__trigger');
    const valueEl = containerEl.querySelector('.search-select__value');
    const searchInput = containerEl.querySelector('.search-select__search');
    const optionsList = containerEl.querySelector('.search-select__options');
    const backdrop = containerEl.querySelector('.search-select__backdrop');
    const dropdown = containerEl.querySelector('.search-select__dropdown');
    const placeholder = valueEl.dataset.placeholder;

    let selected = null;
    // Track whether we've portaled the dropdown/backdrop to <body>
    let portaled = false;

    function isMobile() {
        return window.matchMedia('(max-width: 599px)').matches;
    }

    function portalOpen() {
        // Move backdrop + dropdown to <body> so they escape any stacking context
        if (!portaled && isMobile()) {
            document.body.appendChild(backdrop);
            document.body.appendChild(dropdown);
            portaled = true;
        }
    }

    function portalClose() {
        // Return them home so the component stays self-contained when closed
        if (portaled) {
            containerEl.appendChild(backdrop);
            containerEl.appendChild(dropdown);
            portaled = false;
        }
    }

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
        portalOpen();
        containerEl.classList.add('open');
        // When portaled to <body>, the CSS descendant selector
        // `.search-select.open .search-select__dropdown` no longer reaches
        // the element. Drive open state with a direct class instead.
        dropdown.classList.add('is-open');
        backdrop.classList.add('is-open');
        searchInput.value = '';
        render();
        setTimeout(() => searchInput.focus(), 50);
    }

    function close() {
        containerEl.classList.remove('open');
        dropdown.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        // Defer portal restore until after the close animation completes
        setTimeout(portalClose, 350);
    }

    trigger.addEventListener('click', () => {
        containerEl.classList.contains('open') ? close() : open();
    });

    searchInput.addEventListener('input', () => render(searchInput.value));

    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('click', (e) => {
        if (!containerEl.contains(e.target) && !dropdown.contains(e.target) && !backdrop.contains(e.target)) close();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    return {
        update(newItems) {
            items = newItems;
            this.reset();
        },
        reset() {
            selected = null;
            valueEl.textContent = placeholder;
            valueEl.classList.remove('has-value');
            close();
        }
    };
}

// ═══════════════════════════════════════════════════
// FLOW WIRING
// ═══════════════════════════════════════════════════

// Landing → Industry
document.getElementById('getStartedBtn').addEventListener('click', () => {
    if (forwardHistory.length > 0) {
        const nextPage = forwardHistory.pop();
        showPage(nextPage, false, true);
    } else {
        showPage('pageIndustry');
    }
});

// Q1: Industry → Users
const subField = document.getElementById('subIndustryField');

const subSelectDropdown = initSearchSelect(
    document.getElementById('subIndustrySelect'),
    [],
    (subName) => {
        state.answers.subIndustry = subName;
        setTimeout(() => showPage('pageUsers'), 350);
    }
);

initSearchSelect(
    document.getElementById('industrySelect'),
    INDUSTRIES.map(i => i.name),
    (industryName) => {
        state.answers.industry = industryName;
        const match = INDUSTRIES.find(i => i.name === industryName);

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
            // No sub-industries exist for this category, instantly advance
            setTimeout(() => showPage('pageUsers'), 350);
        }
    }
);

// Q2: Users → Role
radioAdvance('usersGroup', 'users', 'pageRole');

// Q3: Role → B2B
radioAdvance('roleGroup', 'role', 'pageB2B');

// Q4: B2B → Products
radioAdvance('b2bGroup', 'b2b', 'pageProducts');

// Q5: Products → Q6 (Current Software)
buttonAdvance('productsNext', 'productsInput', 'products', 'pageCurrentSoftware');

// Q6: Current Software → Q7 (Replace/Keep)
buttonAdvance('currentSoftwareNext', 'currentSoftwareInput', 'currentSoftware', 'pageReplaceKeep');

// Q7: Replace/Keep → Q8 (Pain Points)
buttonAdvance('replaceKeepNext', 'replaceKeepInput', 'replaceKeep', 'pagePainPoints');

// Q8: Pain Points → Q9 (Requirements)
document.getElementById('painPointsNext').addEventListener('click', () => {
    const checked = document.querySelectorAll('#painPointsGroup input:checked');
    state.answers.painPoints = Array.from(checked).map(cb => cb.value);
    showPage('pageRequirements');
});

// Q9: Requirements → Q10 (Biggest Worry)
buttonAdvance('requirementsNext', 'requirementsInput', 'requirements', 'pageBiggestWorry');

// Q10: Biggest Worry → Summary
const bwBtn = document.getElementById('biggestWorryNext');
const bwInput = document.getElementById('biggestWorryInput');
const validateBw = () => { bwBtn.disabled = bwInput.value.trim().length === 0; };
validateBw();
bwInput.addEventListener('input', validateBw);

bwBtn.addEventListener('click', () => {
    if (!bwBtn.disabled) {
        state.answers.biggestWorry = bwInput.value;
        generateSummary();
    }
});

// ── Summary Generation ─────────────────────────────

const PAIN_POINT_LABELS = {
    'manual-data-entry': 'Manual data entry',
    'lack-visibility': 'Lack of visibility',
    'lack-structure': 'Lack of structure',
    'lack-process': 'Lack of process',
    'too-many-spreadsheets': 'Spreadsheet overload',
    'integration-issues': 'Siloed tools',
    'no-automation': 'No automation'
};

const B2B_LABELS = {
    'b2b': 'B2B (Other Businesses)',
    'b2c': 'B2C (Consumers)',
    'both': 'B2B & B2C'
};

const ROLE_LABELS = {
    'user': 'End User',
    'system-admin': 'System Administrator',
    'team-manager': 'Team Manager',
    'owner-operator': 'Owner / Operator'
};

function generateSummary() {
    // 1. Business Profile
    const industryText = state.answers.subIndustry 
        ? `${state.answers.industry} (${state.answers.subIndustry})`
        : (state.answers.industry || 'Not specified');
    
    document.getElementById('sumIndustry').textContent = industryText;
    document.getElementById('sumUsers').textContent = state.answers.users || 'Not specified';
    document.getElementById('sumRole').textContent = ROLE_LABELS[state.answers.role] || 'Not specified';
    document.getElementById('sumB2B').textContent = B2B_LABELS[state.answers.b2b] || 'Not specified';
    
    document.getElementById('sumProducts').textContent = state.answers.products || 'No products/services described.';

    // 2. The Why (Pain Points & Worry)
    const painPointsContainer = document.getElementById('sumPainPoints');
    painPointsContainer.innerHTML = '';
    
    if (state.answers.painPoints && state.answers.painPoints.length > 0) {
        state.answers.painPoints.forEach(pt => {
            const span = document.createElement('span');
            span.className = 'badge';
            span.textContent = PAIN_POINT_LABELS[pt] || pt;
            painPointsContainer.appendChild(span);
        });
    } else {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = 'None specified';
        painPointsContainer.appendChild(span);
    }

    document.getElementById('sumWorry').textContent = state.answers.biggestWorry || 'No big worries detailed.';

    // 3. Dynamic Needs Mapped & Tools Recommendation
    let tools = [
        { class: 'crm-logo', name: 'CRM', desc: 'Centralize customer relationships and automate sales follow-ups.' },
        { class: 'desk-logo', name: 'Desk', desc: 'Manage client tickets and service inquiries in one unified inbox.' },
        { class: 'analytics-logo', name: 'Data', desc: 'Cross-functional reporting and unified health dashboards.' }
    ];
    
    let salesNeed = "Automate pipeline, track leads.";
    let marketingNeed = "Campaign ROI, unified data.";
    let serviceNeed = "Helpdesk ticketing.";
    let adminNeed = "Connect all platforms, manage users, govern data securely.";
    let toolsDesc = "These platforms form a cohesive ecosystem. Your marketing feeds leads into CRM, your sales team closes them, and your service desk manages client relationships—all while feeding unified data into central analytics.";

    const pp = state.answers.painPoints || [];
    const role = state.answers.role || '';

    if (pp.includes('integration-issues')) {
        tools[2] = { class: 'analytics-logo', style: 'background: linear-gradient(135deg, #a855f7, #7e22ce);', name: 'Flow', desc: 'Orchestrate APIs and integrate siloed applications.' };
        adminNeed = "Connect all platforms via API orchestration (Zoho Flow), manage users, govern data securely.";
        toolsDesc = "These core platforms are stitched together natively, but we will utilize Flow to connect your external siloed tools into the ecosystem.";
    } 
    
    if (pp.includes('manual-data-entry') || pp.includes('too-many-spreadsheets')) {
        tools[1] = { class: 'desk-logo', style: 'background: linear-gradient(135deg, #f59e0b, #d97706);', name: 'Creator', desc: 'Custom apps to replace scattered spreadsheets.' };
        serviceNeed = "Digitize analog workflows and spreadsheets into custom apps.";
        toolsDesc = "We recommend replacing your spreadsheets with Zoho Creator to build custom relational databases that tie directly into your CRM.";
    }

    if (role === 'system-admin') {
        adminNeed = "Advanced RBAC, audit logs, unified directory management, and data governance.";
    }

    document.getElementById('sumNeedsSales').textContent = salesNeed;
    document.getElementById('sumNeedsMarketing').textContent = marketingNeed;
    document.getElementById('sumNeedsService').textContent = serviceNeed;
    document.getElementById('sumNeedsAdmin').textContent = adminNeed;
    
    const toolsListEl = document.getElementById('sumToolsList');
    toolsListEl.innerHTML = '';
    tools.forEach(t => {
        const style = t.style ? `style="${t.style}"` : '';
        toolsListEl.innerHTML += `
            <div class="tool-card" title="${t.desc}">
                <div class="tool-logo ${t.class}" ${style}>${t.name}</div>
            </div>
        `;
    });
    
    document.getElementById('sumToolsDescription').textContent = toolsDesc;

    // 4. Setup Priority button action
    document.getElementById('btnPriority').onclick = () => {
        alert("Roadmap priority calculations coming soon!");
    };

    // Show final page
    showPage('pageSummary');
}

// ── Initialization ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnStartOver').addEventListener('click', () => {
        localStorage.removeItem('discoverWizardState');
        window.location.reload();
    });

    const savedPage = loadState();
    if (savedPage) {
        showPage(savedPage);
    }
});

// ── Wizard State ──────────────────────────────────
const wizardState = {
    currentStage: 1,
    currentStep: 0,
    answers: {},
    totalStages: 3,
};

// Question keys per stage — evaluator-role is conditionally inserted
const stageQuestions = {
    1: ['industry', 'company-size', 'role'],
    2: ['breakdown-area', 'current-handling', 'root-cause', 'free-text'],
    3: ['impact', 'urgency', 'diagnosis'],
};

// ── Branched Answer Options ──────────────────────
const pp2Options = {
    sales: [
        { value: 'spreadsheets', label: 'Spreadsheets and email — that\'s basically it' },
        { value: 'underused-crm', label: 'A CRM we\'re not really using well' },
        { value: 'in-heads', label: 'Mostly in people\'s heads' },
        { value: 'fragmented-tools', label: 'Multiple tools that don\'t connect to each other' },
    ],
    service: [
        { value: 'shared-inbox', label: 'Shared email inbox' },
        { value: 'outgrown-helpdesk', label: 'A helpdesk tool we\'ve outgrown' },
        { value: 'phone-manual', label: 'Phone calls and manual notes' },
        { value: 'no-system', label: 'No real system — it\'s reactive' },
    ],
    ops: [
        { value: 'email-chat', label: 'Mostly email and chat messages' },
        { value: 'shared-spreadsheets', label: 'Spreadsheets multiple people try to maintain' },
        { value: 'meeting-heavy', label: 'Meetings that could have been a process' },
        { value: 'everyone-own-system', label: 'Everyone has their own system' },
    ],
    marketing: [
        { value: 'scattered', label: 'Scattered across social, email, and ads with no unified view' },
        { value: 'no-attribution', label: 'Running campaigns but can\'t tell what\'s actually working' },
        { value: 'dont-know-where-to-start', label: 'We know we need to do more but don\'t know where to start' },
        { value: 'outgrown-tool', label: 'A marketing tool we\'ve outgrown or barely use' },
    ],
};

const pp3Options = {
    sales: [
        { value: 'no-visibility', label: 'No visibility into where things stand' },
        { value: 'inconsistent-followup', label: 'Leads go cold because follow-up is inconsistent' },
        { value: 'slow-proposals', label: 'Proposals take too long or get lost' },
        { value: 'no-insight', label: 'We don\'t know what\'s working and what isn\'t' },
    ],
    service: [
        { value: 'no-single-view', label: 'No single place to see all customer issues' },
        { value: 'people-dependent', label: 'Too much depends on individual people' },
        { value: 'no-escalation', label: 'No process for escalation or follow-through' },
        { value: 'no-resolution-tracking', label: 'We can\'t tell what\'s resolved and what isn\'t' },
    ],
    ops: [
        { value: 'no-ownership', label: 'Lack of ownership — nobody\'s accountable' },
        { value: 'disconnected-tools', label: 'Too many tools that don\'t connect' },
        { value: 'unenforced-process', label: 'Processes exist but aren\'t enforced' },
        { value: 'outgrown-ways', label: 'The way we work hasn\'t changed even though the team has' },
    ],
    marketing: [
        { value: 'no-attribution', label: 'No way to track what\'s generating leads vs. wasting budget' },
        { value: 'no-followthrough', label: 'Campaigns go out but there\'s no follow-through to sales' },
        { value: 'inconsistent-messaging', label: 'Content and messaging are inconsistent across channels' },
        { value: 'guessing', label: 'We\'re guessing instead of using data' },
    ],
};

const pp4Placeholders = {
    sales: 'Tell us what\'s happening — e.g., we lose track of leads after the first call and nobody owns follow-up...',
    service: 'Tell us what\'s happening — e.g., customers have to repeat themselves every time they contact us...',
    ops: 'Tell us what\'s happening — e.g., approvals get stuck and nobody knows where things stand...',
    marketing: 'Tell us what\'s happening — e.g., we spend money on ads but have no idea which ones actually turn into customers...',
};

// ── Industry Data ─────────────────────────────────
const industryData = {
    'advocacy-membership': {
        label: 'Advocacy & Membership Groups',
        subs: ['Business, Professional, Labor, & Political Organizations', 'Civic & Social Organizations', 'Social Advocacy Organizations'],
    },
    'agriculture': {
        label: 'Agriculture',
        subs: ['Animal Farming & Wildlife Harvesting', 'Crop Production', 'Forestry & Logging'],
    },
    'consulting': {
        label: 'Business Consulting & Development',
        subs: ['Business Administration & Management Consultants', 'Human Resources Consultants', 'Marketing Consultants', 'Misc. Consulting Services', 'Process & Logistics Consultants'],
    },
    'construction': {
        label: 'Construction',
        subs: ['Commercial/Government Building Construction', 'Heavy & Civil Engineering Construction', 'Residential Building Construction', 'Specialty Trade Contractors'],
    },
    'eating-drinking': {
        label: 'Eating & Drinking Establishments',
        subs: ['Bars & Pubs', 'Caterers & Food Trucks', 'Restaurants & Cafeterias'],
    },
    'education': {
        label: 'Education & Training',
        subs: ['Arts, Recreation, & Skills Instruction', 'Business Courses & Professional Training', 'Colleges, Universities, & Professional Schools', 'Elementary & Secondary Schools', 'Junior Colleges', 'Technical & Trade Schools', 'Testing, Guidance Counseling, & Other Educational Support'],
    },
    'engineering': {
        label: 'Engineering & Technical Services',
        subs: ['Architectural & Engineering Services', 'Interior, Industrial, & Graphic Design Services', 'Misc. Technical Services', 'R&D Services', 'Technical Consulting Services'],
    },
    'entertainment': {
        label: 'Entertainment & Recreation',
        subs: ['Amusement Parks & Arcades', 'Cultural, Historical, & Nature Sites', 'Event Promoters', 'Gambling Industries', 'Independent Artists', 'Leisure/Recreational Facilities & Services', 'Performing Arts Companies', 'Spectator Sports', 'Talent Agents & Managers'],
    },
    'facility-services': {
        label: 'Facility & Operational Support Services',
        subs: ['Building & Residential Maintenance Services', 'Full-Service Facility Management', 'Investigation, Security, & Alarm Services', 'Misc. Facility & Operational Support Services'],
    },
    'finance': {
        label: 'Finance',
        subs: ['Banking & Lending', 'Funds, Trusts, & Employee Benefits', 'Monetary Authorities—Central Bank', 'Securities, Commodities, & Investing'],
    },
    'government': {
        label: 'Government',
        subs: ['Administration of Economic Programs', 'Administration of Environmental Quality Programs', 'Administration of Housing Programs, Urban Planning, & Community Development', 'Administration of Human Resource Programs', 'Executive, Legislative, & Other General Government Support', 'Justice, Public Order, & Safety Activities', 'National Security & International Affairs', 'Space Research & Technology'],
    },
    'healthcare': {
        label: 'Healthcare',
        subs: ['Home Health Care Services', 'Hospitals', 'Medical & Diagnostic Laboratories', 'Misc. Outpatient Services', 'Non-Physician Outpatient Clinics', 'Nursing & Residential Care Facilities', 'Outpatient Care Centers', 'Outpatient Dentist Offices', 'Outpatient Physician Offices'],
    },
    'holding-companies': {
        label: 'Holding Companies & Corporate Management',
        subs: ['Holding Companies & Corporate Management'],
    },
    'hospitality': {
        label: 'Hospitality & Lodging',
        subs: ['Boarding Houses, Dorms, & Workers\' Accommodations', 'Hotels & Motels (incl Casino Hotels)', 'RV Parks & Recreational Camps'],
    },
    'insurance': {
        label: 'Insurance',
        subs: ['Insurance Agencies & Brokerages', 'Insurance Carriers', 'Supplementary Insurance Services'],
    },
    'manufacturing': {
        label: 'Manufacturing',
        subs: ['Aerospace Manufacturing', 'Apparel & Textile Manufacturing', 'Beverage Manufacturing', 'Cement & Concrete Manufacturing', 'Chemical Manufacturing', 'Clay & Ceramic Manufacturing', 'Computer & Electronics Manufacturing', 'Electrical & Lighting Equipment Manufacturing', 'Food Manufacturing', 'Furniture & Furnishings Manufacturing', 'Glass Manufacturing', 'Household Appliance Manufacturing', 'Leather Product Manufacturing', 'Machinery Manufacturing', 'Medical Equipment & Supplies Manufacturing', 'Metal Production & Fabrication', 'Misc. Nonmetallic Mineral Product Manufacturing', 'Misc. Specialty Product Manufacturing', 'Motor Vehicle Manufacturing', 'Paper Manufacturing', 'Petroleum & Coal Product Manufacturing', 'Pharmaceutical & Medicine Manufacturing', 'Plastic & Rubber Product Manufacturing', 'Printing', 'Tobacco Product Manufacturing', 'Train, Ship, & Misc. Transportation Manufacturing', 'Wood & Lumber Product Manufacturing'],
    },
    'media': {
        label: 'Media',
        subs: ['Digital Media & Content Providers', 'Libraries & Archives', 'Motion Picture & Video Industry', 'Music & Audio Recording Industry', 'Print Media Publishing Industry', 'Radio & TV Stations'],
    },
    'personal-services': {
        label: 'Personal Services',
        subs: ['Beauty, Grooming, & Wellness Services', 'Death Care Services', 'Drycleaning & Laundry Services', 'Misc. Personal Services', 'Private Households'],
    },
    'professional-admin': {
        label: 'Professional & Administrative Services',
        subs: ['Accounting & Payroll Services', 'Advertising & PR', 'Business Support Services', 'Legal Services', 'Misc. Professional Services', 'Office Operations & Administration', 'Staffing & HR Services', 'Translation & Interpretation Services', 'Travel Arrangement & Reservation Services'],
    },
    'real-estate': {
        label: 'Real Estate',
        subs: ['Property Mgmt, Appraisal, & Misc. Real Estate Services', 'Real Estate Agents & Brokerages', 'Real Estate Lessors & Operators'],
    },
    'religious': {
        label: 'Religious Organizations',
        subs: ['Religious Organizations'],
    },
    'repair-maintenance': {
        label: 'Repair, Maintenance, & Service Organizations',
        subs: ['Automotive Repair & Maintenance', 'Commercial Equipment Repair & Maintenance', 'Electronic & Precision Equipment Repair', 'Personal & Household Goods Repair'],
    },
    'retail': {
        label: 'Retail',
        subs: ['Auto Dealers & Parts', 'Building Materials & Garden Supply', 'Clothing & Accessories Stores', 'Electronics & Appliance Stores', 'Food & Beverage Retail', 'Furniture & Home Furnishings Stores', 'Gas Stations', 'General Merchandise Stores', 'Health & Personal Care Stores', 'Misc. Retail', 'Online & Mail-Order Retail', 'Sporting Goods, Hobby, Book, & Music Stores'],
    },
    'social-services': {
        label: 'Social Services & International Organizations',
        subs: ['Child & Youth Services', 'Community Food, Housing, & Emergency Relief', 'Individual & Family Services', 'Services for the Elderly & Persons with Disabilities', 'Vocational Rehabilitation Services'],
    },
    'software-tech': {
        label: 'Software & Technology',
        subs: ['Custom Software Development', 'Data Processing & Hosting Services', 'IT Consulting & Systems Integration', 'SaaS & Cloud Services', 'Software Publishers'],
    },
    'telecom': {
        label: 'Telecommunications',
        subs: ['Cable & Satellite Distribution', 'Telephone & Internet Service Providers', 'Wireless Telecommunications Carriers'],
    },
    'transportation': {
        label: 'Transportation & Warehousing',
        subs: ['Air Transportation', 'Ground Passenger Transportation', 'Pipeline Transportation', 'Postal & Courier Services', 'Rail Transportation', 'Trucking & Freight Transportation', 'Warehousing & Storage', 'Water Transportation'],
    },
    'utilities': {
        label: 'Utilities',
        subs: ['Electric Power Generation & Distribution', 'Natural Gas Distribution', 'Water, Sewage, & Other Systems'],
    },
    'wholesale': {
        label: 'Wholesale Trade',
        subs: ['Durable Goods Wholesale', 'Electronic Markets & Agents/Brokers', 'Nondurable Goods Wholesale'],
    },
};

// ── DOM References ────────────────────────────────
const progressFill = document.getElementById('progressFill');
const wizardContent = document.getElementById('wizardContent');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const wizardNav = document.getElementById('wizardNav');

// ── Helpers ───────────────────────────────────────
function currentQuestions() {
    return stageQuestions[wizardState.currentStage];
}

function currentQuestionKey() {
    return currentQuestions()[wizardState.currentStep];
}

// ── Initialize ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    bindOptionCards();
    bindFreeTextInput();
    bindIndustrySelects();
    bindDiagnosisActions();
        updateVisualPanel('industry');
});

// ── Option Card Selection (single-select, delegated) ──
function bindOptionCards() {
    wizardContent.addEventListener('click', (e) => {
        const card = e.target.closest('.option-card');
        if (!card) return;

        const questionCard = card.closest('.question-card');
        const questionKey = questionCard.dataset.question;
        const grid = card.closest('.options-grid');

        grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        wizardState.answers[questionKey] = card.dataset.value;
        nextBtn.disabled = false;

        // If the user selects a breakdown area, update branched questions
        if (questionKey === 'breakdown-area') {
            populateBranchedQuestions(card.dataset.value);
        }

        // If role is 'evaluator', we need to insert the follow-up question
        if (questionKey === 'role') {
            handleRoleSelection(card.dataset.value);
        }
    });
}

// ── Free Text Input ──────────────────────────────
function bindFreeTextInput() {
    const input = document.getElementById('freeTextInput');
    if (!input) return;

    input.addEventListener('input', () => {
        const val = input.value.trim();
        wizardState.answers['free-text'] = val;
        // Required — must have content to proceed
        if (currentQuestionKey() === 'free-text') {
            nextBtn.disabled = !val;
        }
    });
}

// ── Custom Select Component ─────────────────────
function initCustomSelect(el, initialOptions, onChange) {
    const trigger = el.querySelector('.custom-select__trigger');
    const valueEl = el.querySelector('.custom-select__value');
    const searchInput = el.querySelector('.custom-select__search');
    const optionsList = el.querySelector('.custom-select__options');
    const placeholder = valueEl.dataset.placeholder;
    let items = [];
    let highlightIdx = -1;
    let selectedValue = null;

    function setOptions(newOptions) {
        items = newOptions;
        renderOptions('');
    }

    function renderOptions(filter) {
        const lowerFilter = filter.toLowerCase();
        const filtered = items.filter(item => item.label.toLowerCase().includes(lowerFilter));
        highlightIdx = -1;

        if (filtered.length === 0) {
            optionsList.innerHTML = '<li class="custom-select__no-results">No results found</li>';
            return;
        }

        optionsList.innerHTML = filtered.map((item, i) =>
            `<li class="custom-select__option${item.value === selectedValue ? ' selected' : ''}" data-value="${escapeHtml(item.value)}" data-index="${i}" role="option">${escapeHtml(item.label)}</li>`
        ).join('');
    }

    function open() {
        el.classList.add('open');
        el.setAttribute('aria-expanded', 'true');
        searchInput.value = '';
        renderOptions('');
        requestAnimationFrame(() => searchInput.focus());
    }

    function close() {
        el.classList.remove('open');
        el.setAttribute('aria-expanded', 'false');
        highlightIdx = -1;
    }

    function selectItem(value) {
        const item = items.find(i => i.value === value);
        if (!item) return;
        selectedValue = value;
        valueEl.textContent = item.label;
        valueEl.classList.remove('is-placeholder');
        close();
        if (onChange) onChange(value, item.label);
    }

    function reset() {
        selectedValue = null;
        valueEl.textContent = placeholder;
        valueEl.classList.add('is-placeholder');
    }

    function updateHighlight(optEls) {
        optEls.forEach((o, i) => o.classList.toggle('highlighted', i === highlightIdx));
        if (highlightIdx >= 0 && optEls[highlightIdx]) {
            optEls[highlightIdx].scrollIntoView({ block: 'nearest' });
        }
    }

    // Toggle on trigger click
    trigger.addEventListener('click', () => {
        el.classList.contains('open') ? close() : open();
    });

    // Option click
    optionsList.addEventListener('click', (e) => {
        const opt = e.target.closest('.custom-select__option');
        if (opt?.dataset.value !== undefined) {
            selectItem(opt.dataset.value);
        }
    });

    // Search filtering
    searchInput.addEventListener('input', () => {
        renderOptions(searchInput.value);
    });

    // Keyboard navigation
    el.addEventListener('keydown', (e) => {
        if (!el.classList.contains('open')) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                open();
            }
            return;
        }

        const optEls = optionsList.querySelectorAll('.custom-select__option:not(.custom-select__no-results)');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightIdx = Math.min(highlightIdx + 1, optEls.length - 1);
            updateHighlight(optEls);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightIdx = Math.max(highlightIdx - 1, 0);
            updateHighlight(optEls);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIdx >= 0 && optEls[highlightIdx]) {
                selectItem(optEls[highlightIdx].dataset.value);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
            el.focus();
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!el.contains(e.target)) close();
    });

    // Initial state
    valueEl.classList.add('is-placeholder');
    if (initialOptions.length) setOptions(initialOptions);

    return { setOptions, selectItem, reset, close };
}

// ── Industry Select Binding ──────────────────────
function bindIndustrySelects() {
    const industryEl = document.getElementById('industrySelect');
    const subIndustryEl = document.getElementById('subIndustrySelect');
    const subIndustryField = document.getElementById('subIndustryField');
    if (!industryEl || !subIndustryEl) return;

    const subSelect = initCustomSelect(subIndustryEl, [], (value) => {
        if (wizardState.answers.industry) {
            wizardState.answers.industry.subIndustry = value;
        }
        nextBtn.disabled = false;
    });

    const industryOptions = Object.entries(industryData).map(([key, data]) => ({
        value: key,
        label: data.label,
    }));

    initCustomSelect(industryEl, industryOptions, (key) => {
        const data = industryData[key];
        if (!data) return;

        const subOptions = data.subs.map(sub => ({ value: sub, label: sub }));
        subSelect.setOptions(subOptions);
        subSelect.reset();
        subIndustryField.style.display = 'flex';

        wizardState.answers.industry = {
            category: key,
            categoryLabel: data.label,
            subIndustry: null,
        };

        if (data.subs.length === 1) {
            subSelect.selectItem(data.subs[0]);
            wizardState.answers.industry.subIndustry = data.subs[0];
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    });
}

// ── Diagnosis Actions ────────────────────────────
function bindDiagnosisActions() {
    const printBtn = document.getElementById('printDiagnosisBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => globalThis.print());
    }

    const shareBtn = document.getElementById('shareDiagnosisBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Business Diagnostic Report',
                    text: 'Check out my business diagnostic report',
                    url: globalThis.location.href,
                });
            } else {
                navigator.clipboard.writeText(globalThis.location.href);
            }
        });
    }
}

// ── Handle Role Selection ────────────────────────
function handleRoleSelection(value) {
    const stage1 = stageQuestions[1];
    const hasEvaluatorStep = stage1.includes('evaluator-role');

    if (value === 'evaluator' && !hasEvaluatorStep) {
        // Insert evaluator-role after role
        const roleIdx = stage1.indexOf('role');
        stage1.splice(roleIdx + 1, 0, 'evaluator-role');
    } else if (value !== 'evaluator' && hasEvaluatorStep) {
        // Remove evaluator-role
        const evalIdx = stage1.indexOf('evaluator-role');
        stage1.splice(evalIdx, 1);
        delete wizardState.answers['evaluator-role'];
    }
}

// ── Populate Branched Questions (PP2, PP3, PP4) ──
function populateBranchedQuestions(branch) {
    // PP2
    const pp2Grid = document.getElementById('pp2Options');
    if (pp2Grid) {
        pp2Grid.innerHTML = pp2Options[branch].map(opt => `
            <button class="option-card" data-value="${opt.value}">
                <div class="option-text">
                    <h3>${escapeHtml(opt.label)}</h3>
                </div>
            </button>
        `).join('');
    }

    // PP3
    const pp3Grid = document.getElementById('pp3Options');
    if (pp3Grid) {
        pp3Grid.innerHTML = pp3Options[branch].map(opt => `
            <button class="option-card" data-value="${opt.value}">
                <div class="option-text">
                    <h3>${escapeHtml(opt.label)}</h3>
                </div>
            </button>
        `).join('');
    }

    // PP4 placeholder + clear previous answers
    const freeTextInput = document.getElementById('freeTextInput');
    if (freeTextInput) {
        if (pp4Placeholders[branch]) freeTextInput.placeholder = pp4Placeholders[branch];
        freeTextInput.value = '';
    }

    delete wizardState.answers['current-handling'];
    delete wizardState.answers['root-cause'];
    delete wizardState.answers['free-text'];
}

// ── Show a specific question card ─────────────────
function showQuestion(questionKey) {
    const cards = wizardContent.querySelectorAll('.question-card');
    cards.forEach(c => c.classList.remove('active'));

    const target = wizardContent.querySelector(`[data-question="${questionKey}"]`);
    if (target) {
        target.classList.add('active');
    }

    // Update visual panel
    updateVisualPanel(questionKey);

    // Special handling
    const wizardContainer = document.querySelector('.wizard-container');
    if (questionKey === 'diagnosis') {
        renderDiagnosis();
        wizardNav.style.display = 'none';
        if (wizardContainer) wizardContainer.classList.add('summary-active');
    } else {
        wizardNav.style.display = 'flex';
        if (wizardContainer) wizardContainer.classList.remove('summary-active');
        nextBtn.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    }

    // Determine button state
    const answer = wizardState.answers[questionKey];
    if (questionKey === 'free-text') {
        nextBtn.disabled = !answer;
    } else if (questionKey === 'industry') {
        nextBtn.disabled = !answer?.subIndustry;
    } else if (questionKey === 'diagnosis') {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = !answer;
    }

    // Back button visibility
    const isVeryFirst = wizardState.currentStage === 1 && wizardState.currentStep === 0;
    backBtn.style.visibility = isVeryFirst ? 'hidden' : 'visible';
}

// ── Progress Bar ──────────────────────────────────
function updateProgress() {
    const totalQuestions = Object.values(stageQuestions).reduce((sum, q) => sum + q.length, 0);
    const questionsBefore = Object.entries(stageQuestions)
        .filter(([s]) => Number.parseInt(s, 10) < wizardState.currentStage)
        .reduce((sum, [, q]) => sum + q.length, 0);
    const pct = ((questionsBefore + wizardState.currentStep) / totalQuestions) * 100;
    progressFill.style.width = pct + '%';
    const roundedPct = Math.round(pct);
    checkMilestone(roundedPct);

    document.querySelectorAll('.progress-label').forEach(label => {
        const stage = Number.parseInt(label.dataset.stage, 10);
        label.classList.remove('active', 'completed');
        if (stage === wizardState.currentStage) {
            label.classList.add('active');
        } else if (stage < wizardState.currentStage) {
            label.classList.add('completed');
        }
    });
}

// ── Navigation ────────────────────────────────────
function goToStage(stageNum) {
    wizardState.currentStage = stageNum;
    wizardState.currentStep = 0;
    showQuestion(currentQuestionKey());
    updateProgress();
}

nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;

    if (wizardState.currentStep < currentQuestions().length - 1) {
        wizardState.currentStep++;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else if (wizardState.currentStage < wizardState.totalStages) {
        goToStage(wizardState.currentStage + 1);
    }
});

backBtn.addEventListener('click', () => {
    if (wizardState.currentStep > 0) {
        wizardState.currentStep--;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else if (wizardState.currentStage > 1) {
        wizardState.currentStage--;
        wizardState.currentStep = currentQuestions().length - 1;
        // Skip diagnosis on back — go to last interactive question
        if (currentQuestionKey() === 'diagnosis') {
            wizardState.currentStep--;
        }
        showQuestion(currentQuestionKey());
        updateProgress();
    }
});

// ── Escape HTML ──────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Diagnosis Rendering ──────────────────────────
function renderDiagnosis() {
    const report = document.getElementById('diagnosisReport');
    const dateEl = document.getElementById('diagnosisDate');
    const a = wizardState.answers;

    // Set date
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = 'Prepared ' + now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Gather all signals
    const industry = a.industry;
    const companySize = a['company-size'];
    const role = a.role === 'evaluator' ? (a['evaluator-role'] || 'ic') : (a.role || 'ic');
    const isDecisionMaker = ['owner', 'executive', 'manager'].includes(role);
    const breakdownArea = a['breakdown-area'] || 'sales';
    const currentHandling = a['current-handling'];
    const rootCause = a['root-cause'];
    const freeText = a['free-text'];
    const impact = a.impact;
    const urgency = a.urgency;

    // Build diagnosis
    const problemStatement = buildProblemStatement(breakdownArea, rootCause);
    const rootCauseStatement = buildRootCauseStatement(breakdownArea, currentHandling);
    const severityStatement = buildSeverityStatement(impact, urgency, breakdownArea);
    const solutionRoadmap = buildSolutionRoadmap(breakdownArea);
    const contextBar = buildContextBar(industry, companySize, role);

    // Frame for audience
    const frameLabel = isDecisionMaker
        ? 'This report is written for you to act on.'
        : 'This report is written to bring to leadership.';

    report.innerHTML = `
        ${contextBar}

        <div class="diagnosis-section">
            <div class="diagnosis-section-label">Problem Statement</div>
            <p class="diagnosis-section-text">${problemStatement}</p>
        </div>

        <div class="diagnosis-section">
            <div class="diagnosis-section-label">Root Cause</div>
            <p class="diagnosis-section-text">${rootCauseStatement}</p>
        </div>

        <div class="diagnosis-section diagnosis-section--severity">
            <div class="diagnosis-section-label">Severity</div>
            <p class="diagnosis-section-text">${severityStatement}</p>
        </div>

        <div class="diagnosis-section diagnosis-section--quote">
            <div class="diagnosis-section-label">In Your Words</div>
            <blockquote class="diagnosis-quote">"${escapeHtml(freeText)}"</blockquote>
        </div>

        <div class="diagnosis-section diagnosis-section--roadmap">
            <div class="diagnosis-section-label">Solution Roadmap</div>
            ${solutionRoadmap}
        </div>
    `;
}

// ── Diagnosis Builders ───────────────────────────

function buildContextBar(industry, companySize, role) {
    const parts = [];
    if (industry?.categoryLabel) parts.push(industry.categoryLabel);
    if (industry?.subIndustry && industry.subIndustry !== industry.categoryLabel) parts.push(industry.subIndustry);

    const sizeLabels = { '1': 'Solo', '2-10': '2–10 people', '11-50': '11–50 people', '51-200': '51–200 people', '201-500': '201–500 people', '500+': '500+ people' };
    if (companySize) parts.push(sizeLabels[companySize] || companySize);

    const roleLabels = { 'owner': 'Owner/Founder', 'executive': 'Executive/Director', 'manager': 'Manager/Team Lead', 'ic': 'Individual Contributor' };
    if (role) parts.push(roleLabels[role] || role);

    if (parts.length === 0) return '';

    return `
        <div class="diagnosis-context-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>${parts.map(p => escapeHtml(p)).join(' · ')}</span>
        </div>
    `;
}

const problemTemplates = {
    sales: {
        'no-visibility': 'Your sales process lacks visibility — deals move through the pipeline but nobody has a clear picture of what\'s active, what\'s stalled, and what needs attention.',
        'inconsistent-followup': 'Your leads are going cold because follow-up is inconsistent. Without a system enforcing next steps, deals fall through the cracks between conversations.',
        'slow-proposals': 'Your proposal process is a bottleneck. Quotes and proposals take too long to generate, get lost in email threads, or go out with errors — slowing your time to close.',
        'no-insight': 'Your sales team is operating blind. There\'s no reliable way to see which activities, channels, or reps are actually driving results.',
    },
    service: {
        'no-single-view': 'Your customer issues are scattered across inboxes, chat logs, and individual memory. There\'s no single place to see what\'s open, who\'s handling it, or how long it\'s been waiting.',
        'people-dependent': 'Your support operation depends too heavily on specific individuals. When they\'re out, things fall apart — and institutional knowledge walks out the door with them.',
        'no-escalation': 'Your team has no clear process for escalation or follow-through. Issues get acknowledged but don\'t reliably get resolved, and nobody owns the gap.',
        'no-resolution-tracking': 'You can\'t tell what\'s resolved and what isn\'t. Customers slip through the cracks because there\'s no system tracking issue status from open to closed.',
    },
    ops: {
        'no-ownership': 'Your internal processes lack clear ownership. Tasks get assigned but nobody is accountable for follow-through, so things stall between handoffs.',
        'disconnected-tools': 'Your team is spread across too many disconnected tools. Information lives in silos, forcing manual copy-paste work and creating gaps where things get lost.',
        'unenforced-process': 'You have processes on paper, but they\'re not enforced in practice. People work around the system because it\'s easier than working through it.',
        'outgrown-ways': 'Your team has grown but your ways of working haven\'t kept pace. What worked at a smaller scale is now creating friction, confusion, and duplicated effort.',
    },
    marketing: {
        'no-attribution': 'You\'re spending on marketing but can\'t trace which efforts are generating leads versus burning budget. Without attribution, every dollar is a guess.',
        'no-followthrough': 'Your campaigns generate interest but there\'s no bridge to sales. Leads come in and go cold because nobody picks them up on the other side.',
        'inconsistent-messaging': 'Your brand shows up differently across every channel. Without centralized content and messaging, you\'re diluting your market presence.',
        'guessing': 'Your marketing decisions are based on instinct, not data. Without measurement infrastructure, you can\'t optimize what you can\'t see.',
    },
};

function buildProblemStatement(area, rootCause) {
    const template = problemTemplates[area]?.[rootCause];
    if (template) return template;
    // Fallback
    const areaLabels = { sales: 'sales process', service: 'customer service operation', ops: 'internal operations', marketing: 'marketing and lead generation' };
    return `Your ${areaLabels[area] || 'operation'} is breaking down in a way that's creating real friction for your team and your business.`;
}

const rootCauseTemplates = {
    sales: {
        'spreadsheets': 'The root cause is tooling — or rather, the absence of it. Spreadsheets and email weren\'t designed to manage a sales pipeline. They can\'t enforce follow-up cadences, alert you to stalled deals, or show you where things stand at a glance.',
        'underused-crm': 'The root cause isn\'t that you lack a tool — it\'s that your current CRM never got properly adopted. This usually means it was set up without matching your actual workflow, so the team routes around it instead of through it.',
        'in-heads': 'The root cause is that your sales knowledge is trapped in people\'s heads. There\'s no shared system of record, so when someone is busy, out, or leaves, their pipeline goes dark.',
        'fragmented-tools': 'The root cause is fragmentation. You have multiple tools that each do part of the job, but they don\'t share data. This forces manual work at every junction and creates gaps where information gets lost.',
    },
    service: {
        'shared-inbox': 'The root cause is that a shared inbox was never designed for support at scale. It can\'t assign ownership, track resolution time, or prevent two people from responding to the same issue.',
        'outgrown-helpdesk': 'The root cause is that your team has outgrown your current helpdesk. What worked early on now creates friction — missing features force workarounds that slow everyone down.',
        'phone-manual': 'The root cause is that your support process relies on manual effort at every step. Phone calls and handwritten notes don\'t create trackable records, making it impossible to measure or improve.',
        'no-system': 'The root cause is structural: you\'re reacting to problems as they surface rather than managing them through a system. Without a defined intake and resolution process, everything feels urgent and nothing gets properly tracked.',
    },
    ops: {
        'email-chat': 'The root cause is that email and chat are communication tools, not process tools. They\'re great for conversations but terrible for tracking tasks, enforcing deadlines, or maintaining accountability.',
        'shared-spreadsheets': 'The root cause is that spreadsheets break when multiple people need to maintain them simultaneously. Version conflicts, missing updates, and unclear ownership make them unreliable as systems of record.',
        'meeting-heavy': 'The root cause is that your team uses meetings to compensate for missing process. When there\'s no system to track status and enforce handoffs, people schedule syncs to fill the gap — and productivity suffers.',
        'everyone-own-system': 'The root cause is that everyone has developed their own way of working. Without a shared system, coordination requires constant clarification, and institutional knowledge is fragmented across personal setups.',
    },
    marketing: {
        'scattered': 'The root cause is channel fragmentation. Your marketing lives in separate silos — social, email, ads — with no unified view. This makes it impossible to see the full customer journey or coordinate messaging.',
        'no-attribution': 'The root cause is a measurement gap. You\'re executing campaigns without the infrastructure to track what happens after the click. Without end-to-end attribution, optimization is impossible.',
        'dont-know-where-to-start': 'The root cause is a strategy gap. The intent to grow through marketing is there, but without a structured approach and the right tools, effort gets scattered across too many tactics with too little follow-through.',
        'outgrown-tool': 'The root cause is that your marketing tool no longer matches your needs. Feature gaps force workarounds, and the team has lost confidence in the platform — so usage drops and manual processes fill the void.',
    },
};

function buildRootCauseStatement(area, currentHandling) {
    const template = rootCauseTemplates[area]?.[currentHandling];
    if (template) return template;
    // Fallback
    return 'The underlying issue is a gap between how your team needs to work and the systems currently supporting them. This creates friction that compounds over time.';
}

const impactLabels = {
    'lost-revenue': 'lost revenue and missed deals',
    'wasted-time': 'wasted time and labor costs',
    'churn': 'customer churn and complaints',
    'team-frustration': 'team frustration and turnover risk',
    'inefficiency': 'general inefficiency that drags on everything',
};

const urgencyLabels = {
    'critical': 'This is critical — it\'s actively costing you right now.',
    'high': 'The pressure is high — this needs resolution within weeks, not months.',
    'medium': 'It\'s important but manageable — the window to fix it proactively is still open.',
    'low': 'You\'re planning ahead, which is smart — addressing this now prevents it from becoming urgent later.',
};

function buildSeverityStatement(impact, urgency, area) {
    const impactText = impactLabels[impact] || 'measurable business impact';
    const urgencyText = urgencyLabels[urgency] || '';

    const areaConsequences = {
        sales: 'Every week this continues, leads go cold and potential revenue walks away.',
        service: 'Every week this continues, customers who could be retained are deciding to leave.',
        ops: 'Every week this continues, your team burns time on coordination that should be automatic.',
        marketing: 'Every week this continues, marketing spend generates less return than it should.',
    };

    const consequence = areaConsequences[area] || 'The longer this persists, the harder it becomes to fix.';

    return `This problem is manifesting as <strong>${impactText}</strong>. ${consequence} ${urgencyText}`;
}

function buildSolutionRoadmap(area) {
    const steps = getSolutionSteps(area);

    return steps.map((step, i) => `
        <div class="diagnosis-roadmap-step">
            <div class="diagnosis-roadmap-num">${i + 1}</div>
            <div class="diagnosis-roadmap-content">
                <h4>${escapeHtml(step.title)}</h4>
                <p>${step.description}</p>
                ${step.toolCategory ? `<span class="diagnosis-tool-category">${escapeHtml(step.toolCategory)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function getSolutionSteps(area) {
    const solutions = {
        sales: [
            { title: 'Centralize your pipeline', description: 'Create a single view of every deal, its stage, and who owns it. Define your stages to match how you actually sell.', toolCategory: 'CRM or pipeline management tool' },
            { title: 'Automate follow-up cadences', description: 'Set up rules that trigger reminders and next-step actions so leads don\'t go cold between conversations.', toolCategory: 'Sales automation platform' },
            { title: 'Connect your lead sources', description: 'Route inbound leads from your website, email, and other channels directly into your pipeline without manual entry.', toolCategory: 'Lead capture and form tools' },
            { title: 'Build visibility into what\'s working', description: 'Create dashboards that show conversion rates by source, rep activity, and deal velocity — so you know where to double down.', toolCategory: 'Sales analytics and reporting' },
        ],
        service: [
            { title: 'Create a single intake point', description: 'Route all customer issues — email, phone, chat — into one system with automatic ticket creation and assignment.', toolCategory: 'Help desk or ticketing system' },
            { title: 'Define escalation and SLA rules', description: 'Set up automatic escalation paths and response-time targets so nothing sits unattended beyond a defined threshold.', toolCategory: 'Workflow automation tool' },
            { title: 'Build a customer knowledge base', description: 'Document common issues and resolutions so customers can self-serve and agents can resolve faster.', toolCategory: 'Knowledge base platform' },
            { title: 'Track resolution metrics', description: 'Measure first-response time, resolution time, and customer satisfaction to identify where your process breaks down.', toolCategory: 'Customer service analytics' },
        ],
        ops: [
            { title: 'Map and digitize your core processes', description: 'Document the 3–5 workflows that matter most — approvals, handoffs, recurring tasks — and move them out of email and into a structured system.', toolCategory: 'Workflow management platform' },
            { title: 'Assign ownership and deadlines', description: 'Every task needs a single owner and a due date. Build this into your system so accountability is structural, not personal.', toolCategory: 'Project or task management tool' },
            { title: 'Connect your tools', description: 'Integrate the systems your team already uses so data flows automatically instead of being copied between platforms.', toolCategory: 'Integration and automation layer' },
            { title: 'Create operational dashboards', description: 'Build a real-time view of process health — what\'s on track, what\'s overdue, and where bottlenecks are forming.', toolCategory: 'Operational analytics and dashboards' },
        ],
        marketing: [
            { title: 'Unify your marketing channels', description: 'Bring social, email, and ad management into a single platform so you can see the full picture instead of checking five different dashboards.', toolCategory: 'Marketing platform or hub' },
            { title: 'Build a lead-to-sale handoff', description: 'Create a defined process where marketing-qualified leads get routed to sales with context — not just a name and email.', toolCategory: 'CRM with marketing integration' },
            { title: 'Implement attribution tracking', description: 'Set up tracking that connects marketing touchpoints to actual revenue, so you know which campaigns drive results and which don\'t.', toolCategory: 'Marketing analytics and attribution tools' },
            { title: 'Automate nurture sequences', description: 'Build automated email and content sequences that keep prospects engaged until they\'re ready to buy, without manual effort.', toolCategory: 'Marketing automation platform' },
        ],
    };

    return solutions[area] || solutions.sales;
}

// ── Phase Visual System ───────────────────────────

// Maps question keys to phase illustration names
const questionToPhase = {
        'industry':         'demographics',
        'company-size':     'demographics',
        'role':             'demographics',
        'evaluator-role':   'demographics',
        'breakdown-area':   'pain',
        'current-handling': 'branch',
        'root-cause':       'branch',
        'free-text':        'branch',
        'impact':           'impact',
        'urgency':          'impact',
        'diagnosis':        'results',
};

// Maps tone name to brand-panel CSS class
const toneClasses = {
        calm:     'brand-panel--tone-calm',
        tension:  'brand-panel--tone-tension',
        urgent:   'brand-panel--tone-urgent',
        resolved: 'brand-panel--tone-resolved',
};

// ── Inline SVG Illustrations ──────────────────────
// Phase: demographics — calm, blue. Profile cards being filled in.
const svgDemographics = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="120" cy="90" rx="96" ry="54" fill="#eff6ff" opacity="0.7"/>
    <rect x="75" y="32" width="90" height="100" rx="14" fill="white" stroke="#bfdbfe" stroke-width="1.5"/>
    <circle cx="120" cy="62" r="20" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5"/>
    <circle cx="120" cy="56" r="7" fill="#3b82f6"/>
    <path d="M106 76 Q106 68 120 68 Q134 68 134 76" fill="#3b82f6"/>
    <rect x="90" y="88" width="60" height="6" rx="3" fill="#bfdbfe"/>
    <rect x="96" y="100" width="48" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="91" y="111" width="58" height="16" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
    <rect x="97" y="117" width="46" height="4" rx="2" fill="#93c5fd"/>
    <rect x="15" y="56" width="52" height="46" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="24" y="68" width="34" height="5" rx="2.5" fill="#bfdbfe"/>
    <rect x="24" y="78" width="26" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="24" y="87" width="30" height="4" rx="2" fill="#f1f5f9"/>
    <circle cx="56" cy="62" r="8" fill="#dbeafe" stroke="#93c5fd" stroke-width="1"/>
    <polyline points="52,62 55,65 60,58" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="173" y="56" width="52" height="46" rx="10" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="182" y="68" width="34" height="5" rx="2.5" fill="#bfdbfe"/>
    <rect x="182" y="78" width="26" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="182" y="87" width="30" height="4" rx="2" fill="#f1f5f9"/>
    <circle cx="184" cy="62" r="8" fill="#dbeafe" stroke="#93c5fd" stroke-width="1"/>
    <polyline points="180,62 183,65 188,58" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="67" y1="79" x2="75" y2="79" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="3,2"/>
    <line x1="165" y1="79" x2="173" y2="79" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="3,2"/>
    <circle cx="92" cy="148" r="4" fill="#dbeafe"/>
    <circle cx="108" cy="151" r="3" fill="#bfdbfe"/>
    <circle cx="122" cy="148" r="4" fill="#dbeafe"/>
    <circle cx="136" cy="151" r="3" fill="#bfdbfe"/>
    <circle cx="150" cy="148" r="4" fill="#dbeafe"/>
</svg>`;

// Phase: pain — tension, amber/purple. Two disconnected systems.
const svgPain = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="46" width="80" height="68" rx="12" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.5"/>
    <rect x="27" y="62" width="58" height="6" rx="3" fill="#fdba74"/>
    <rect x="27" y="74" width="44" height="4" rx="2" fill="#fed7aa"/>
    <rect x="27" y="84" width="50" height="4" rx="2" fill="#fed7aa"/>
    <rect x="27" y="94" width="36" height="4" rx="2" fill="#fde68a"/>
    <circle cx="84" cy="52" r="9" fill="#f97316"/>
    <line x1="84" y1="47" x2="84" y2="53" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="84" cy="57" r="1.5" fill="white"/>
    <rect x="144" y="46" width="80" height="68" rx="12" fill="#faf5ff" stroke="#e9d5ff" stroke-width="1.5"/>
    <rect x="155" y="62" width="58" height="6" rx="3" fill="#c4b5fd"/>
    <rect x="155" y="74" width="44" height="4" rx="2" fill="#e9d5ff"/>
    <rect x="155" y="84" width="50" height="4" rx="2" fill="#e9d5ff"/>
    <rect x="155" y="94" width="36" height="4" rx="2" fill="#ede9fe"/>
    <circle cx="156" cy="52" r="9" fill="#a78bfa"/>
    <line x1="156" y1="47" x2="156" y2="53" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="156" cy="57" r="1.5" fill="white"/>
    <line x1="96" y1="80" x2="112" y2="80" stroke="#fb923c" stroke-width="2" stroke-linecap="round"/>
    <line x1="128" y1="80" x2="144" y2="80" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/>
    <circle cx="120" cy="80" r="11" fill="white" stroke="#fca5a5" stroke-width="1.5"/>
    <line x1="115" y1="75" x2="125" y2="85" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    <line x1="125" y1="75" x2="115" y2="85" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    <circle cx="44" cy="140" r="4" fill="#fed7aa"/>
    <circle cx="62" cy="144" r="3" fill="#fde68a"/>
    <circle cx="180" cy="140" r="4" fill="#e9d5ff"/>
    <circle cx="198" cy="144" r="3" fill="#ede9fe"/>
    <circle cx="120" cy="148" r="3" fill="#fca5a5"/>
</svg>`;

// Phase: impact — urgent, red/orange. Declining bars with alert.
const svgImpact = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="32" width="148" height="106" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
    <line x1="42" y1="52" x2="160" y2="52" stroke="#f1f5f9" stroke-width="1"/>
    <line x1="42" y1="69" x2="160" y2="69" stroke="#f1f5f9" stroke-width="1"/>
    <line x1="42" y1="86" x2="160" y2="86" stroke="#f1f5f9" stroke-width="1"/>
    <line x1="42" y1="103" x2="160" y2="103" stroke="#f1f5f9" stroke-width="1"/>
    <line x1="42" y1="118" x2="160" y2="118" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="50" y="60" width="18" height="58" rx="4" fill="#86efac"/>
    <rect x="80" y="75" width="18" height="43" rx="4" fill="#fbbf24"/>
    <rect x="110" y="90" width="18" height="28" rx="4" fill="#fb923c"/>
    <rect x="140" y="107" width="18" height="11" rx="4" fill="#ef4444"/>
    <path d="M53 68 Q95 84 145 110" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3" fill="none"/>
    <polygon points="138,106 146,112 149,103" fill="#ef4444"/>
    <circle cx="196" cy="62" r="22" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5"/>
    <path d="M196 44 L210 68 L182 68 Z" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="196" y1="52" x2="196" y2="60" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    <circle cx="196" cy="65" r="1.5" fill="#ef4444"/>
    <circle cx="196" cy="120" r="16" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
    <line x1="196" y1="112" x2="196" y2="120" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="196" y1="120" x2="202" y2="125" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="22" cy="82" r="4" fill="#fff7ed"/>
    <circle cx="18" cy="96" r="3" fill="#fef3c7"/>
    <circle cx="25" cy="110" r="3" fill="#fff7ed"/>
</svg>`;

// Phase: results — resolved, green. Checklist + forward arrow.
const svgResults = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="62" y="30" width="130" height="115" rx="12" fill="#d1fae5" opacity="0.35"/>
    <rect x="58" y="26" width="130" height="115" rx="12" fill="white" stroke="#d1fae5" stroke-width="2"/>
    <rect x="58" y="26" width="130" height="30" rx="12" fill="#d1fae5"/>
    <rect x="58" y="44" width="130" height="12" fill="#d1fae5"/>
    <circle cx="82" cy="41" r="11" fill="#22c55e"/>
    <polyline points="77,41 81,45 88,36" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="100" y="36" width="66" height="5" rx="2.5" fill="#86efac"/>
    <rect x="100" y="45" width="50" height="4" rx="2" fill="#a7f3d0"/>
    <circle cx="80" cy="72" r="8" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
    <polyline points="76,72 79,75 85,68" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="95" y="68" width="80" height="5" rx="2.5" fill="#e2e8f0"/>
    <rect x="95" y="77" width="60" height="4" rx="2" fill="#f1f5f9"/>
    <circle cx="80" cy="97" r="8" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
    <polyline points="76,97 79,100 85,93" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="95" y="93" width="80" height="5" rx="2.5" fill="#e2e8f0"/>
    <rect x="95" y="102" width="65" height="4" rx="2" fill="#f1f5f9"/>
    <circle cx="80" cy="122" r="8" fill="#fef9c3" stroke="#fde68a" stroke-width="1.5"/>
    <line x1="80" y1="118" x2="80" y2="126" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="95" y="118" width="80" height="5" rx="2.5" fill="#e2e8f0"/>
    <rect x="95" y="127" width="55" height="4" rx="2" fill="#f1f5f9"/>
    <circle cx="208" cy="84" r="20" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
    <line x1="200" y1="84" x2="214" y2="84" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
    <polyline points="207,77 215,84 207,91" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="28" cy="68" r="5" fill="#dcfce7"/>
    <circle cx="36" cy="82" r="3" fill="#a7f3d0"/>
    <circle cx="26" cy="96" r="4" fill="#dcfce7"/>
</svg>`;

// Branch: sales — funnel with lead dots
const svgSales = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55 38 L185 38 L150 90 L150 136 L90 136 L90 90 Z" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"/>
    <line x1="68" y1="60" x2="172" y2="60" stroke="#bfdbfe" stroke-width="1.5"/>
    <line x1="82" y1="82" x2="158" y2="82" stroke="#bfdbfe" stroke-width="1.5"/>
    <line x1="90" y1="104" x2="150" y2="104" stroke="#bfdbfe" stroke-width="1.5"/>
    <circle cx="76" cy="24" r="8" fill="#93c5fd" stroke="white" stroke-width="1.5"/>
    <circle cx="100" cy="18" r="8" fill="#60a5fa" stroke="white" stroke-width="1.5"/>
    <circle cx="120" cy="16" r="8" fill="#3b82f6" stroke="white" stroke-width="1.5"/>
    <circle cx="140" cy="18" r="8" fill="#60a5fa" stroke="white" stroke-width="1.5"/>
    <circle cx="164" cy="24" r="8" fill="#93c5fd" stroke="white" stroke-width="1.5"/>
    <line x1="76" y1="32" x2="80" y2="38" stroke="#bfdbfe" stroke-width="1.5"/>
    <line x1="100" y1="26" x2="98" y2="38" stroke="#bfdbfe" stroke-width="1.5"/>
    <line x1="120" y1="24" x2="120" y2="38" stroke="#bfdbfe" stroke-width="1.5"/>
    <line x1="140" y1="26" x2="142" y2="38" stroke="#bfdbfe" stroke-width="1.5"/>
    <line x1="164" y1="32" x2="160" y2="38" stroke="#bfdbfe" stroke-width="1.5"/>
    <circle cx="120" cy="152" r="13" fill="#3b82f6"/>
    <path d="M120 143 L122 148 L128 148 L123 152 L125 158 L120 154 L115 158 L117 152 L112 148 L118 148 Z" fill="white"/>
    <line x1="120" y1="136" x2="120" y2="143" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="2,2"/>
</svg>`;

// Branch: service — tickets + chat bubbles + resolve check
const svgService = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="76" y="50" width="110" height="74" rx="10" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1.5"/>
    <rect x="68" y="42" width="110" height="74" rx="10" fill="#faf5ff" stroke="#e9d5ff" stroke-width="1.5"/>
    <rect x="58" y="32" width="112" height="74" rx="10" fill="white" stroke="#c4b5fd" stroke-width="2"/>
    <rect x="58" y="32" width="112" height="10" rx="10" fill="#8b5cf6"/>
    <rect x="58" y="38" width="112" height="4" fill="#8b5cf6"/>
    <rect x="70" y="56" width="88" height="6" rx="3" fill="#e9d5ff"/>
    <rect x="70" y="68" width="68" height="4" rx="2" fill="#ede9fe"/>
    <rect x="70" y="78" width="78" height="4" rx="2" fill="#ede9fe"/>
    <rect x="70" y="88" width="58" height="4" rx="2" fill="#f3f0ff"/>
    <circle cx="152" cy="90" r="20" fill="#8b5cf6"/>
    <polyline points="143,90 150,97 162,81" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="26" y="12" width="50" height="26" rx="9" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1"/>
    <path d="M42 38 L37 47 L55 38" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1"/>
    <rect x="30" y="21" width="32" height="4" rx="2" fill="#c4b5fd"/>
    <rect x="164" y="12" width="50" height="26" rx="9" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1"/>
    <path d="M198 38 L203 47 L187 38" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1"/>
    <rect x="168" y="21" width="38" height="4" rx="2" fill="#ddd6fe"/>
    <circle cx="76" cy="148" r="5" fill="#ede9fe"/>
    <circle cx="100" cy="152" r="3" fill="#e9d5ff"/>
    <circle cx="140" cy="152" r="3" fill="#e9d5ff"/>
    <circle cx="164" cy="148" r="5" fill="#ede9fe"/>
</svg>`;

// Branch: ops — workflow nodes connected with arrows
const svgOps = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="68" y1="80" x2="98" y2="80" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="142" y1="80" x2="174" y2="80" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="120" y1="107" x2="120" y2="130" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="14" y="58" width="54" height="44" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="28" cy="73" r="7" fill="#dbeafe"/>
    <rect x="40" y="70" width="22" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="40" y="79" width="16" height="3" rx="1.5" fill="#f1f5f9"/>
    <rect x="40" y="87" width="19" height="3" rx="1.5" fill="#f1f5f9"/>
    <rect x="172" y="58" width="54" height="44" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="186" cy="73" r="7" fill="#dbeafe"/>
    <rect x="198" y="70" width="22" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="198" y="79" width="16" height="3" rx="1.5" fill="#f1f5f9"/>
    <rect x="198" y="87" width="19" height="3" rx="1.5" fill="#f1f5f9"/>
    <rect x="90" y="52" width="60" height="56" rx="14" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <circle cx="120" cy="80" r="15" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
    <circle cx="120" cy="80" r="6" fill="white"/>
    <line x1="120" y1="62" x2="120" y2="68" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="120" y1="92" x2="120" y2="98" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="102" y1="80" x2="108" y2="80" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="132" y1="80" x2="138" y2="80" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <polyline points="95,76 100,80 95,84" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="145,76 140,80 145,84" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="90" y="130" width="60" height="26" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="99" y="138" width="42" height="5" rx="2.5" fill="#dcfce7"/>
    <rect x="104" y="147" width="32" height="3" rx="1.5" fill="#f0fdf4"/>
    <polyline points="117,108 120,113 123,108" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="38" cy="22" r="5" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
    <circle cx="202" cy="22" r="5" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
</svg>`;

// Branch: marketing — megaphone + network + trend bars
const svgMarketing = `<svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 62 L82 46 L82 114 L38 98 Z" fill="#fff7ed" stroke="#fdba74" stroke-width="2" stroke-linejoin="round"/>
    <rect x="18" y="68" width="20" height="22" rx="6" fill="#fed7aa" stroke="#fb923c" stroke-width="1.5"/>
    <path d="M90 58 Q103 80 90 102" stroke="#fb923c" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M98 50 Q115 80 98 110" stroke="#fdba74" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M106 44 Q127 80 106 116" stroke="#fde68a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <circle cx="162" cy="42" r="14" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
    <circle cx="200" cy="66" r="12" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
    <circle cx="188" cy="102" r="14" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
    <circle cx="156" cy="124" r="11" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
    <line x1="162" y1="56" x2="200" y2="66" stroke="#fed7aa" stroke-width="1.5"/>
    <line x1="200" y1="78" x2="188" y2="102" stroke="#fed7aa" stroke-width="1.5"/>
    <line x1="188" y1="116" x2="156" y2="124" stroke="#fed7aa" stroke-width="1.5"/>
    <circle cx="162" cy="42" r="5" fill="#f97316"/>
    <circle cx="200" cy="66" r="5" fill="#fb923c"/>
    <circle cx="188" cy="102" r="5" fill="#f97316"/>
    <rect x="26" y="124" width="96" height="28" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="36" y="140" width="8" height="7" rx="2" fill="#fed7aa"/>
    <rect x="50" y="136" width="8" height="11" rx="2" fill="#fdba74"/>
    <rect x="64" y="131" width="8" height="16" rx="2" fill="#f97316"/>
    <rect x="78" y="126" width="8" height="21" rx="2" fill="#ea580c"/>
    <line x1="92" y1="143" x2="104" y2="131" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
    <polyline points="97,131 104,131 104,137" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Illustration lookup tables
const phaseIllustrations = {
    demographics: { tone: 'calm',     svg: svgDemographics, alt: 'Profile cards being filled in for business context' },
    pain:         { tone: 'tension',  svg: svgPain, alt: 'Disconnected systems with a broken link' },
    impact:       { tone: 'urgent',   svg: svgImpact, alt: 'Declining chart with urgency alerts' },
    results:      { tone: 'resolved', svg: svgResults, alt: 'Checklist and forward action path' },
};

const branchIllustrations = {
    sales:     { tone: 'tension', svg: svgSales, alt: 'Sales funnel from leads to closed win' },
    service:   { tone: 'tension', svg: svgService, alt: 'Support tickets and resolution checkmark' },
    ops:       { tone: 'tension', svg: svgOps, alt: 'Connected workflow nodes and process handoffs' },
    marketing: { tone: 'tension', svg: svgMarketing, alt: 'Marketing megaphone, lead network, and trend bars' },
};

// ── Visual Panel Functions ────────────────────────

/**
 * Updates the brand panel illustration and tone for the given question key.
 * Uses a crossfade: scene fades out, SVG swaps, scene fades back in.
 */
function updateVisualPanel(questionKey) {
    const brandPanel = document.querySelector('.brand-panel');
    const scene = document.getElementById('phaseVisualScene');
    const visual = document.getElementById('phaseVisual');
    if (!brandPanel || !scene || !visual) return;

    const phaseKey = questionToPhase[questionKey];
    let illustration;

    if (phaseKey === 'branch') {
        const branch = wizardState.answers['breakdown-area'] || 'sales';
        illustration = branchIllustrations[branch];
    } else if (phaseKey) {
        illustration = phaseIllustrations[phaseKey];
    }

    if (!illustration) return;

    if (illustration.alt) {
        visual.setAttribute('aria-label', illustration.alt);
    }

    // Crossfade swap
    scene.classList.add('is-leaving');
    const delay = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 270;
    setTimeout(() => {
        scene.innerHTML = illustration.svg;
        scene.classList.remove('is-leaving');
    }, delay);

        // Apply tone class to brand panel
        Object.values(toneClasses).forEach(cls => brandPanel.classList.remove(cls));
        const newToneClass = toneClasses[illustration.tone];
        if (newToneClass) brandPanel.classList.add(newToneClass);
}

// ── Milestone Badge ───────────────────────────────

const milestoneMarkers = [
        { pct: 33,  label: '1/3 done — building clarity' },
        { pct: 66,  label: 'Almost there — the pattern is forming' },
        { pct: 99,  label: 'Complete — your diagnosis is ready' },
];
let lastMilestoneShown = -1;

function checkMilestone(pct) {
        const badge = document.getElementById('phaseMilestone');
        if (!badge) return;
        for (const m of milestoneMarkers) {
                if (pct >= m.pct && lastMilestoneShown < m.pct) {
                        lastMilestoneShown = m.pct;
                        badge.textContent = m.label;
                        badge.classList.add('is-visible');
                        setTimeout(() => badge.classList.remove('is-visible'), 3200);
                        break;
                }
        }
}

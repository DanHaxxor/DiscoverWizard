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
        wizardState.answers['free-text'] = input.value.trim();
        // Free text is always skippable — button stays enabled
    });
}

// ── Industry Select Binding ──────────────────────
function bindIndustrySelects() {
    const industrySelect = document.getElementById('industrySelect');
    const subIndustrySelect = document.getElementById('subIndustrySelect');
    const subIndustryField = document.getElementById('subIndustryField');
    if (!industrySelect || !subIndustrySelect) return;

    Object.entries(industryData).forEach(([key, data]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = data.label;
        industrySelect.appendChild(opt);
    });

    industrySelect.addEventListener('change', () => {
        const key = industrySelect.value;
        const data = industryData[key];
        if (!data) return;

        subIndustrySelect.innerHTML = '<option value="" disabled selected>Select a sub-industry…</option>';
        data.subs.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            subIndustrySelect.appendChild(opt);
        });

        subIndustryField.style.display = 'flex';

        wizardState.answers.industry = {
            category: key,
            categoryLabel: data.label,
            subIndustry: null,
        };

        if (data.subs.length === 1) {
            subIndustrySelect.value = data.subs[0];
            wizardState.answers.industry.subIndustry = data.subs[0];
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    });

    subIndustrySelect.addEventListener('change', () => {
        if (wizardState.answers.industry) {
            wizardState.answers.industry.subIndustry = subIndustrySelect.value;
        }
        nextBtn.disabled = false;
    });
}

// ── Diagnosis Actions ────────────────────────────
function bindDiagnosisActions() {
    const printBtn = document.getElementById('printDiagnosisBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }

    const shareBtn = document.getElementById('shareDiagnosisBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Business Diagnostic Report',
                    text: 'Check out my business diagnostic report',
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
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

    // PP4 placeholder
    const freeTextInput = document.getElementById('freeTextInput');
    if (freeTextInput && pp4Placeholders[branch]) {
        freeTextInput.placeholder = pp4Placeholders[branch];
    }

    // Clear previous answers for branched questions
    delete wizardState.answers['current-handling'];
    delete wizardState.answers['root-cause'];
    delete wizardState.answers['free-text'];
    const ftInput = document.getElementById('freeTextInput');
    if (ftInput) ftInput.value = '';
}

// ── Show a specific question card ─────────────────
function showQuestion(questionKey) {
    const cards = wizardContent.querySelectorAll('.question-card');
    cards.forEach(c => c.classList.remove('active'));

    const target = wizardContent.querySelector(`[data-question="${questionKey}"]`);
    if (target) target.classList.add('active');

    // Special handling
    if (questionKey === 'diagnosis') {
        renderDiagnosis();
        wizardNav.style.display = 'none';
    } else {
        wizardNav.style.display = 'flex';
        nextBtn.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    }

    // Determine button state
    const answer = wizardState.answers[questionKey];
    if (questionKey === 'free-text') {
        // Free text is always skippable
        nextBtn.disabled = false;
        nextBtn.innerHTML = (answer ? 'Continue' : 'Skip') + ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
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

        <div class="diagnosis-frame-note">${frameLabel}</div>

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

        ${freeText ? `
        <div class="diagnosis-section diagnosis-section--quote">
            <div class="diagnosis-section-label">In Your Words</div>
            <blockquote class="diagnosis-quote">"${escapeHtml(freeText)}"</blockquote>
        </div>
        ` : ''}

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
    return `Your ${areaLabels[area] || 'operation'} is breaking down in a way that\'s creating real friction for your team and your business.`;
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

// ── Wizard State ──────────────────────────────────
const wizardState = {
    currentStage: 1,
    currentStep: 0,
    answers: {},
    totalStages: 2,
};

// Question keys per stage
const stageQuestions = {
    1: ['intent', 'industry', 'areas', 'confirm'],
    2: ['relationship', 'crm-fit', 'roadmap'],
};

// Human-readable labels for chip values
const areaLabels = {
    'lead-management': 'Follow up with leads',
    'quoting': 'Create quotes & proposals',
    'deal-closing': 'Close more deals',
    'invoicing': 'Send invoices',
    'payments': 'Collect online payments',
    'accounting': 'Accounting & bookkeeping',
    'support': 'Customer support',
    'esignature': 'Document signing',
    'client-projects': 'Client project delivery',
    'internal-projects': 'Internal project management',
    'email-marketing': 'Email marketing',
    'social-marketing': 'Social media marketing',
    'reporting': 'Reports & dashboards',
    'collaboration': 'Team collaboration',
};

const priorityLabels = {
    'cost': 'Low cost',
    'speed': 'Fast to set up',
    'integration': 'Integrates with what I have',
    'simplicity': 'Simple to use',
    'scalability': 'Scales as we grow',
    'automation': 'Automates manual work',
    'reporting': 'Better visibility & reporting',
};

// ── Industry Data ─────────────────────────────────
const industryData = {
    'advocacy-membership': {
        label: 'Advocacy & Membership Groups',
        subs: [
            'Business, Professional, Labor, & Political Organizations',
            'Civic & Social Organizations',
            'Social Advocacy Organizations',
        ],
    },
    'agriculture': {
        label: 'Agriculture',
        subs: [
            'Animal Farming & Wildlife Harvesting',
            'Crop Production',
            'Forestry & Logging',
        ],
    },
    'consulting': {
        label: 'Business Consulting & Development',
        subs: [
            'Business Administration & Management Consultants',
            'Human Resources Consultants',
            'Marketing Consultants',
            'Misc. Consulting Services',
            'Process & Logistics Consultants',
        ],
    },
    'construction': {
        label: 'Construction',
        subs: [
            'Commercial/Government Building Construction',
            'Heavy & Civil Engineering Construction',
            'Residential Building Construction',
            'Specialty Trade Contractors',
        ],
    },
    'eating-drinking': {
        label: 'Eating & Drinking Establishments',
        subs: [
            'Bars & Pubs',
            'Caterers & Food Trucks',
            'Restaurants & Cafeterias',
        ],
    },
    'education': {
        label: 'Education & Training',
        subs: [
            'Arts, Recreation, & Skills Instruction',
            'Business Courses & Professional Training',
            'Colleges, Universities, & Professional Schools',
            'Elementary & Secondary Schools',
            'Junior Colleges',
            'Technical & Trade Schools',
            'Testing, Guidance Counseling, & Other Educational Support',
        ],
    },
    'engineering': {
        label: 'Engineering & Technical Services',
        subs: [
            'Architectural & Engineering Services',
            'Interior, Industrial, & Graphic Design Services',
            'Misc. Technical Services',
            'R&D Services',
            'Technical Consulting Services',
        ],
    },
    'entertainment': {
        label: 'Entertainment & Recreation',
        subs: [
            'Amusement Parks & Arcades',
            'Cultural, Historical, & Nature Sites',
            'Event Promoters',
            'Gambling Industries',
            'Independent Artists',
            'Leisure/Recreational Facilities & Services',
            'Performing Arts Companies',
            'Spectator Sports',
            'Talent Agents & Managers',
        ],
    },
    'facility-services': {
        label: 'Facility & Operational Support Services',
        subs: [
            'Building & Residential Maintenance Services',
            'Full-Service Facility Management',
            'Investigation, Security, & Alarm Services',
            'Misc. Facility & Operational Support Services',
        ],
    },
    'finance': {
        label: 'Finance',
        subs: [
            'Banking & Lending',
            'Funds, Trusts, & Employee Benefits',
            'Monetary Authorities—Central Bank',
            'Securities, Commodities, & Investing',
        ],
    },
    'government': {
        label: 'Government',
        subs: [
            'Administration of Economic Programs',
            'Administration of Environmental Quality Programs',
            'Administration of Housing Programs, Urban Planning, & Community Development',
            'Administration of Human Resource Programs',
            'Executive, Legislative, & Other General Government Support',
            'Justice, Public Order, & Safety Activities',
            'National Security & International Affairs',
            'Space Research & Technology',
        ],
    },
    'healthcare': {
        label: 'Healthcare',
        subs: [
            'Home Health Care Services',
            'Hospitals',
            'Medical & Diagnostic Laboratories',
            'Misc. Outpatient Services',
            'Non-Physician Outpatient Clinics',
            'Nursing & Residential Care Facilities',
            'Outpatient Care Centers',
            'Outpatient Dentist Offices',
            'Outpatient Physician Offices',
        ],
    },
    'holding-companies': {
        label: 'Holding Companies & Corporate Management',
        subs: [
            'Holding Companies & Corporate Management',
        ],
    },
    'hospitality': {
        label: 'Hospitality & Lodging',
        subs: [
            'Boarding Houses, Dorms, & Workers\' Accommodations',
            'Hotels & Motels (incl Casino Hotels)',
            'RV Parks & Recreational Camps',
        ],
    },
    'insurance': {
        label: 'Insurance',
        subs: [
            'Insurance Agencies & Brokerages',
            'Insurance Carriers',
            'Supplementary Insurance Services',
        ],
    },
    'manufacturing': {
        label: 'Manufacturing',
        subs: [
            'Aerospace Manufacturing',
            'Apparel & Textile Manufacturing',
            'Beverage Manufacturing',
            'Cement & Concrete Manufacturing',
            'Chemical Manufacturing',
            'Clay & Ceramic Manufacturing',
            'Computer & Electronics Manufacturing',
            'Electrical & Lighting Equipment Manufacturing',
            'Food Manufacturing',
            'Furniture & Furnishings Manufacturing',
            'Glass Manufacturing',
            'Household Appliance Manufacturing',
            'Leather Product Manufacturing',
            'Machinery Manufacturing',
            'Medical Equipment & Supplies Manufacturing',
            'Metal Production & Fabrication',
            'Misc. Nonmetallic Mineral Product Manufacturing',
            'Misc. Specialty Product Manufacturing',
            'Motor Vehicle Manufacturing',
            'Paper Manufacturing',
            'Petroleum & Coal Product Manufacturing',
            'Pharmaceutical & Medicine Manufacturing',
            'Plastic & Rubber Product Manufacturing',
            'Printing',
            'Tobacco Product Manufacturing',
            'Train, Ship, & Misc. Transportation Manufacturing',
            'Wood & Lumber Product Manufacturing',
        ],
    },
    'media': {
        label: 'Media',
        subs: [
            'Digital Media & Content Providers',
            'Libraries & Archives',
            'Motion Picture & Video Industry',
            'Music & Audio Recording Industry',
            'Print Media Publishing Industry',
            'Radio & TV Stations',
        ],
    },
    'personal-services': {
        label: 'Personal Services',
        subs: [
            'Beauty, Grooming, & Wellness Services',
            'Death Care Services',
            'Drycleaning & Laundry Services',
            'Misc. Personal Services',
            'Private Households',
        ],
    },
    'professional-admin': {
        label: 'Professional & Administrative Services',
        subs: [
            'Accounting & Payroll Services',
            'Advertising & PR',
            'Business Support Services',
            'Legal Services',
            'Misc. Professional Services',
            'Office Operations & Administration',
            'Staffing & HR Services',
            'Translation & Interpretation Services',
            'Travel Arrangement & Reservation Services',
        ],
    },
    'real-estate': {
        label: 'Real Estate',
        subs: [
            'Property Mgmt, Appraisal, & Misc. Real Estate Services',
            'Real Estate Agents & Brokerages',
            'Real Estate Lessors & Operators',
        ],
    },
    'religious': {
        label: 'Religious Organizations',
        subs: [
            'Religious Organizations',
        ],
    },
    'repair-maintenance': {
        label: 'Repair, Maintenance, & Service Organizations',
        subs: [
            'Automotive Repair & Maintenance',
            'Commercial Equipment Repair & Maintenance',
            'Electronic & Precision Equipment Repair',
            'Personal & Household Goods Repair',
        ],
    },
    'retail': {
        label: 'Retail',
        subs: [
            'Auto Dealers & Parts',
            'Building Materials & Garden Supply',
            'Clothing & Accessories Stores',
            'Electronics & Appliance Stores',
            'Food & Beverage Retail',
            'Furniture & Home Furnishings Stores',
            'Gas Stations',
            'General Merchandise Stores',
            'Health & Personal Care Stores',
            'Misc. Retail',
            'Online & Mail-Order Retail',
            'Sporting Goods, Hobby, Book, & Music Stores',
        ],
    },
    'social-services': {
        label: 'Social Services & International Organizations',
        subs: [
            'Child & Youth Services',
            'Community Food, Housing, & Emergency Relief',
            'Individual & Family Services',
            'Services for the Elderly & Persons with Disabilities',
            'Vocational Rehabilitation Services',
        ],
    },
    'software-tech': {
        label: 'Software & Technology',
        subs: [
            'Custom Software Development',
            'Data Processing & Hosting Services',
            'IT Consulting & Systems Integration',
            'SaaS & Cloud Services',
            'Software Publishers',
        ],
    },
    'telecom': {
        label: 'Telecommunications',
        subs: [
            'Cable & Satellite Distribution',
            'Telephone & Internet Service Providers',
            'Wireless Telecommunications Carriers',
        ],
    },
    'transportation': {
        label: 'Transportation & Warehousing',
        subs: [
            'Air Transportation',
            'Ground Passenger Transportation',
            'Pipeline Transportation',
            'Postal & Courier Services',
            'Rail Transportation',
            'Trucking & Freight Transportation',
            'Warehousing & Storage',
            'Water Transportation',
        ],
    },
    'utilities': {
        label: 'Utilities',
        subs: [
            'Electric Power Generation & Distribution',
            'Natural Gas Distribution',
            'Water, Sewage, & Other Systems',
        ],
    },
    'wholesale': {
        label: 'Wholesale Trade',
        subs: [
            'Durable Goods Wholesale',
            'Electronic Markets & Agents/Brokers',
            'Nondurable Goods Wholesale',
        ],
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
    bindChips();
    bindFormInputs();
    bindWorryForm();
    bindIndustrySelects();
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
    });
}

// ── Chip Selection (multi-select) ─────────────────
function bindChips() {
    wizardContent.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        const grid = chip.closest('.chip-grid');
        const questionCard = chip.closest('.question-card');
        const questionKey = questionCard.dataset.question;
        const maxSelections = Number.parseInt(grid.dataset.max, 10) || Infinity;
        const isPriority = chip.classList.contains('chip--priority');

        if (!wizardState.answers[questionKey]) {
            wizardState.answers[questionKey] = [];
        }

        const arr = wizardState.answers[questionKey];
        const val = chip.dataset.value;

        if (chip.classList.contains('selected')) {
            // Deselect
            chip.classList.remove('selected');
            const idx = arr.indexOf(val);
            if (idx > -1) arr.splice(idx, 1);
        } else if (arr.length < maxSelections) {
            // Select
            chip.classList.add('selected');
            arr.push(val);
        }

        // Update priority rank numbers
        if (isPriority) {
            updatePriorityRanks(grid, arr);
        }

        nextBtn.disabled = arr.length === 0;
    });
}

function updatePriorityRanks(grid, orderedValues) {
    grid.querySelectorAll('.chip--priority').forEach(chip => {
        const rank = chip.querySelector('.chip-rank');
        const idx = orderedValues.indexOf(chip.dataset.value);
        if (idx > -1) {
            rank.textContent = idx + 1;
        } else {
            rank.textContent = '';
        }
    });
}

// ── Form Inputs (process question) ────────────────
function bindFormInputs() {
    const form = document.getElementById('processForm');
    if (!form) return;

    form.addEventListener('input', () => {
        const inputs = form.querySelectorAll('.form-input');
        const data = {};
        let filled = 0;
        inputs.forEach(input => {
            const val = input.value.trim();
            data[input.dataset.field] = val;
            if (val) filled++;
        });
        wizardState.answers.process = data;
        // Require at least 2 fields filled
        nextBtn.disabled = filled < 2;
    });
}

// ── Worry Form (worry analysis) ──────────────────
function bindWorryForm() {
    const form = document.getElementById('worryForm');
    if (!form) return;

    form.addEventListener('input', () => {
        const inputs = form.querySelectorAll('.form-input');
        const data = {};
        let filled = 0;
        inputs.forEach(input => {
            const val = input.value.trim();
            data[input.dataset.field] = val;
            if (val) filled++;
        });
        wizardState.answers.worries = data;
        // Enable next as soon as any worry is captured
        nextBtn.disabled = filled < 1;
    });
}

// ── Industry Select Binding ──────────────────────
function bindIndustrySelects() {
    const industrySelect = document.getElementById('industrySelect');
    const subIndustrySelect = document.getElementById('subIndustrySelect');
    const subIndustryField = document.getElementById('subIndustryField');
    if (!industrySelect || !subIndustrySelect) return;

    // Populate industry dropdown
    Object.entries(industryData).forEach(([key, data]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = data.label;
        industrySelect.appendChild(opt);
    });

    // When industry changes, populate sub-industries
    industrySelect.addEventListener('change', () => {
        const key = industrySelect.value;
        const data = industryData[key];
        if (!data) return;

        // Reset sub-industry
        subIndustrySelect.innerHTML = '<option value="" disabled selected>Select a sub-industry…</option>';
        data.subs.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            subIndustrySelect.appendChild(opt);
        });

        // Show sub-industry field with animation
        subIndustryField.style.display = 'flex';

        // Store industry answer
        wizardState.answers.industry = {
            category: key,
            categoryLabel: data.label,
            subIndustry: null,
        };

        // If only one sub-industry, auto-select it
        if (data.subs.length === 1) {
            subIndustrySelect.value = data.subs[0];
            wizardState.answers.industry.subIndustry = data.subs[0];
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    });

    // When sub-industry changes
    subIndustrySelect.addEventListener('change', () => {
        if (wizardState.answers.industry) {
            wizardState.answers.industry.subIndustry = subIndustrySelect.value;
        }
        nextBtn.disabled = false;
    });
}

// ── Show a specific question card ─────────────────
function showQuestion(questionKey) {
    const cards = wizardContent.querySelectorAll('.question-card');
    cards.forEach(c => c.classList.remove('active'));

    const target = wizardContent.querySelector(`[data-question="${questionKey}"]`);
    if (target) target.classList.add('active');

    // Special step handling
    if (questionKey === 'confirm') {
        renderMindMap();
        wizardNav.style.display = 'none';
    } else if (questionKey === 'roadmap') {
        wizardNav.style.display = 'none';
        renderRoadmap();
        nextBtn.disabled = false;
        nextBtn.textContent = 'Finish';
    } else {
        wizardNav.style.display = 'flex';
        nextBtn.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    }

    // Determine if this question already has an answer
    const answer = wizardState.answers[questionKey];
    if (questionKey === 'process') {
        const filled = answer ? Object.values(answer).filter(Boolean).length : 0;
        nextBtn.disabled = filled < 2;
    } else if (questionKey === 'worries') {
        const filled = answer ? Object.values(answer).filter(Boolean).length : 0;
        nextBtn.disabled = filled < 1;
    } else if (questionKey === 'industry') {
        nextBtn.disabled = !answer?.subIndustry;
    } else if (Array.isArray(answer)) {
        nextBtn.disabled = answer.length === 0;
    } else if (questionKey === 'confirm' || questionKey === 'roadmap') {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = !answer;
    }

    // Back button always visible after first question of stage 1
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

// ── Area icons & descriptions for Business Solution page ──
const areaIcons = {
    'lead-management': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'quoting': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    'deal-closing': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8"/><path d="M8 8l8 8"/></svg>',
    'invoicing': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'payments': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'accounting': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>',
    'support': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'esignature': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
    'client-projects': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    'internal-projects': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    'email-marketing': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'social-marketing': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    'reporting': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'collaboration': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
};

const areaDescriptions = {
    'lead-management': 'Capture incoming leads automatically and ensure timely follow-up so nothing falls through the cracks.',
    'quoting': 'Generate professional quotes and proposals quickly, with pricing pulled from your product catalog.',
    'deal-closing': 'Track deals through your pipeline with visibility into what\'s stalling and what\'s ready to close.',
    'invoicing': 'Send invoices directly from closed deals and track payment status in one place.',
    'payments': 'Accept payments online with branded checkout pages and automatic reconciliation.',
    'accounting': 'Keep your books accurate with automated transaction categorization and reconciliation.',
    'support': 'Give your support team full customer context so they can resolve issues faster.',
    'esignature': 'Send contracts and agreements for digital signature directly from your CRM or deal records.',
    'client-projects': 'Turn won deals into active projects with tasks, timelines, and client visibility.',
    'internal-projects': 'Plan sprints, assign tasks, and track progress across your internal teams.',
    'email-marketing': 'Send targeted email campaigns based on CRM segments and track engagement.',
    'social-marketing': 'Schedule posts, monitor engagement, and capture leads from social channels.',
    'reporting': 'Build dashboards that pull data across sales, marketing, and support for a unified view.',
    'collaboration': 'Keep your team aligned with shared files, messaging, and real-time updates.',
};

// ── Tool category mapping (platform-agnostic) ────
const areaToolCategories = {
    'lead-management': { category: 'CRM & Lead Management', desc: 'A system to capture, track, and follow up with every lead automatically.' },
    'quoting': { category: 'Quoting & Proposals', desc: 'Tools that generate professional quotes with pricing pulled from your catalog.' },
    'deal-closing': { category: 'Pipeline & Deal Tracking', desc: 'Visual pipeline tools that show what\'s stalling and what\'s ready to close.' },
    'invoicing': { category: 'Invoicing', desc: 'Automated invoice generation tied to your deals and accounting.' },
    'payments': { category: 'Online Payments', desc: 'Branded checkout and payment collection with automatic reconciliation.' },
    'accounting': { category: 'Accounting & Bookkeeping', desc: 'Automated transaction categorization, reconciliation, and financial reporting.' },
    'support': { category: 'Help Desk & Support', desc: 'Ticketing systems that give agents full customer context for faster resolution.' },
    'esignature': { category: 'E-Signature & Contracts', desc: 'Digital signing workflows embedded in your deal and document processes.' },
    'client-projects': { category: 'Client Project Management', desc: 'Tools that turn won deals into trackable projects with client visibility.' },
    'internal-projects': { category: 'Internal Project & Sprint Management', desc: 'Task boards, sprint planning, and progress tracking for internal teams.' },
    'email-marketing': { category: 'Email Marketing & Automation', desc: 'Segmented campaigns and automated sequences driven by CRM data.' },
    'social-marketing': { category: 'Social Media Management', desc: 'Scheduling, monitoring, and lead capture across social channels.' },
    'reporting': { category: 'Analytics & Dashboards', desc: 'Cross-functional dashboards pulling data from sales, marketing, and support.' },
    'collaboration': { category: 'Team Collaboration', desc: 'Messaging, shared files, and real-time updates to keep everyone aligned.' },
};

// ── Mind Map (Whiteboard) Rendering ──────────────
function renderMindMap() {
    const map = document.getElementById('mindMap');
    const a = wizardState.answers;
    const proc = a.process || {};
    const worries = a.worries || {};
    const ind = a.industry;
    const selectedAreas = a.areas || [];
    const priorities = (a.priorities || []).map(v => priorityLabels[v] || v);

    // ── Identity bar ──
    const identityHtml = buildBoardIdentity(ind, proc);

    // ── Need cards ──
    const needsHtml = selectedAreas.map(v => `
        <div class="need-card">
            <div class="need-card-icon">${areaIcons[v] || ''}</div>
            <div class="need-card-text">
                <span class="need-card-name">${areaLabels[v] || v}</span>
                <span class="need-card-desc">${areaDescriptions[v] || ''}</span>
            </div>
        </div>
    `).join('');

    // ── Problem stickies ──
    const problemStickies = buildProblemStickies(proc, worries);

    // ── Current tools sticky ──
    const toolsStickyHtml = proc.how
        ? `<div class="sticky sticky--gray"><div class="sticky-label">Current tools</div><div class="sticky-text">${escapeHtml(proc.how)}</div></div>`
        : '';

    // ── Tool category chips ──
    const toolChips = buildToolChips(selectedAreas);

    // ── Start here banner ──
    const startHtml = buildStartBanner(selectedAreas, proc, priorities);

    // ── Assemble the board ──
    map.innerHTML = `
    <div class="board">
        ${identityHtml}

        <div class="board-columns">
            <!-- LEFT COLUMN: Where you are today -->
            <div class="board-col">
                <div class="cluster">
                    <div class="cluster-label"><span class="cluster-label-dot" style="background:#ef4444"></span> Where you are today</div>
                    ${toolsStickyHtml}
                    ${problemStickies}
                </div>
            </div>

            <!-- RIGHT COLUMN: What you need -->
            <div class="board-col">
                <div class="cluster">
                    <div class="cluster-label"><span class="cluster-label-dot" style="background:#3b82f6"></span> What you need to do</div>
                    <div class="need-cards">${needsHtml || '<div class="sticky sticky--gray"><div class="sticky-text">No areas selected yet.</div></div>'}</div>
                </div>
            </div>
        </div>

        ${toolChips ? `
        <div class="board-divider">
            <span class="board-divider-line"></span>
            <span class="board-divider-label">Types of tools that could help</span>
            <span class="board-divider-line"></span>
        </div>
        <div class="tool-chips">${toolChips}</div>` : ''}

        ${startHtml}
    </div>
    `;
}

function buildBoardIdentity(ind, proc) {
    const parts = [];
    if (ind?.categoryLabel) parts.push(ind.categoryLabel);
    if (ind?.subIndustry && ind.subIndustry !== ind.categoryLabel) parts.push(ind.subIndustry);
    if (proc.who) parts.push(proc.who);
    if (parts.length === 0) return '';
    return `
        <div class="board-identity">
            <div class="board-identity-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div class="board-identity-text">
                <span class="board-identity-label">${escapeHtml(parts[0])}</span>
                ${parts.length > 1 ? `<span class="board-identity-sub">${parts.slice(1).map(p => escapeHtml(p)).join(' · ')}</span>` : ''}
            </div>
        </div>
    `;
}

function buildProblemStickies(proc, worries) {
    const stickies = [];
    if (proc.why) {
        stickies.push(`<div class="sticky sticky--red"><div class="sticky-label">The core problem</div><div class="sticky-text">${escapeHtml(proc.why)}</div></div>`);
    }
    if (proc.what) {
        stickies.push(`<div class="sticky sticky--yellow"><div class="sticky-label">Current process</div><div class="sticky-text">${escapeHtml(proc.what)}</div></div>`);
    }
    if (worries['status-quo']) {
        stickies.push(`<div class="sticky sticky--red"><div class="sticky-label">If nothing changes</div><div class="sticky-text">${escapeHtml(worries['status-quo'])}</div></div>`);
    }
    if (worries.adoption) {
        stickies.push(`<div class="sticky sticky--purple"><div class="sticky-label">Hesitation</div><div class="sticky-text">${escapeHtml(worries.adoption)}</div></div>`);
    }
    if (worries['post-sale']) {
        stickies.push(`<div class="sticky sticky--purple"><div class="sticky-label">After committing</div><div class="sticky-text">${escapeHtml(worries['post-sale'])}</div></div>`);
    }
    return stickies.join('');
}

function buildToolChips(selectedAreas) {
    const seen = new Set();
    const chips = selectedAreas
        .map(v => areaToolCategories[v])
        .filter(Boolean)
        .filter(t => !seen.has(t.category) && seen.add(t.category))
        .map(t => `<span class="tool-chip"><span class="tool-chip-dot"></span>${escapeHtml(t.category)}</span>`)
        .join('');
    return chips;
}

function buildStartBanner(selectedAreas, proc, priorities) {
    const startArea = selectedAreas[0];
    if (!startArea) return '';
    const label = areaLabels[startArea] || '';
    let rationale = `Based on what you told us, <strong>${label.toLowerCase()}</strong> is the highest-impact place to begin.`;
    if (proc.why) {
        rationale += ` You said: "${escapeHtml(proc.why)}" — fixing this first unlocks everything downstream.`;
    }
    if (priorities.length > 0) {
        rationale += ` Your priorities (<strong>${joinList(priorities)}</strong>) point here too.`;
    }
    return `
        <div class="start-banner">
            <div class="start-banner-icon">${areaIcons[startArea] || ''}</div>
            <div class="start-banner-content">
                <span class="start-banner-label">${escapeHtml(label)}</span>
                <p class="start-banner-rationale">${rationale}</p>
            </div>
        </div>
    `;
}

function joinList(arr) {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Navigation ────────────────────────────────────
nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;

    if (wizardState.currentStep < currentQuestions().length - 1) {
        wizardState.currentStep++;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else if (wizardState.currentStage < wizardState.totalStages) {
        goToStage(wizardState.currentStage + 1);
    } else {
        console.log('Wizard complete:', wizardState.answers);
        nextBtn.disabled = true;
        nextBtn.textContent = 'Complete';
    }
});

// ── Product Mapping Data ─────────────────────────
const productMap = {
    'lead-management': { primary: ['Zoho CRM'], supporting: ['Zoho SalesIQ'], integration: 'CRM + Campaigns for automated nurture sequences' },
    'quoting': { primary: ['Zoho CRM (Quotes)'], supporting: ['Zoho Invoice'], integration: 'CRM + Books for quote-to-invoice flow' },
    'deal-closing': { primary: ['Zoho CRM'], supporting: ['Zoho Analytics'], integration: 'CRM + SalesIQ for live visitor tracking' },
    'invoicing': { primary: ['Zoho Invoice', 'Zoho Books'], supporting: [], integration: 'Books + CRM for auto-invoicing from closed deals' },
    'payments': { primary: ['Zoho Books', 'Zoho Checkout'], supporting: ['Zoho Invoice'], integration: 'Books + Checkout for payment links in invoices' },
    'accounting': { primary: ['Zoho Books'], supporting: ['Zoho Expense'], integration: 'Books + Expense for automated receipt-to-ledger flow' },
    'support': { primary: ['Zoho Desk'], supporting: [], integration: 'Desk + CRM for full customer context on tickets' },
    'esignature': { primary: ['Zoho Sign'], supporting: [], integration: 'Sign + CRM for sending contracts from deal records' },
    'client-projects': { primary: ['Zoho Projects'], supporting: ['Zoho CRM'], integration: 'Projects + CRM for project creation from won deals' },
    'internal-projects': { primary: ['Zoho Projects', 'Zoho Sprints'], supporting: ['Zoho Cliq'], integration: 'Projects + Cliq for team updates and notifications' },
    'email-marketing': { primary: ['Zoho Campaigns'], supporting: ['Zoho Marketing Automation'], integration: 'Campaigns + CRM for segmented, behavior-based emails' },
    'social-marketing': { primary: ['Zoho Social'], supporting: [], integration: 'Social + CRM for lead capture from social engagement' },
    'reporting': { primary: ['Zoho Analytics'], supporting: [], integration: 'Analytics + CRM/Books/Desk for cross-functional reporting' },
    'collaboration': { primary: ['Zoho Cliq', 'Zoho WorkDrive'], supporting: ['Zoho Meeting'], integration: 'Cliq + Projects for task-linked conversations' },
};

const crmProducts = {
    'simple': 'Zoho Bigin',
    'standard': 'Zoho CRM',
    'advanced': 'Zoho CRM (Enterprise)',
};

const emailProducts = {
    'none': null,
    'newsletters': 'Zoho Campaigns',
    'automation': 'Zoho Marketing Automation',
    'both': 'Zoho Campaigns + Marketing Automation',
};

const billingProducts = {
    'none': null,
    'quotes-only': 'Zoho CRM (Quotes module)',
    'invoicing': 'Zoho Invoice + Zoho Books',
    'full-billing': 'Zoho Books + Invoice + Checkout',
};

// ── Roadmap Rendering ────────────────────────────
function renderRoadmap() {
    const output = document.getElementById('roadmapOutput');
    const a = wizardState.answers;

    // Set prepared date dynamically
    const dateEl = document.getElementById('roadmapDate');
    if (dateEl) {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        dateEl.textContent = 'Prepared ' + formatted;
    }

    // Collect all recommended apps from selected areas
    const selectedAreas = a.areas || [];
    const allPrimary = new Set();
    const allSupporting = new Set();
    const integrations = [];

    selectedAreas.forEach(area => {
        const mapping = productMap[area];
        if (!mapping) return;
        mapping.primary.forEach(p => allPrimary.add(p));
        mapping.supporting.forEach(s => allSupporting.add(s));
        if (mapping.integration) integrations.push(mapping.integration);
    });

    // Override CRM based on crm-fit answer
    const crmFit = a['crm-fit'];
    if (crmFit && crmProducts[crmFit]) {
        // Replace generic CRM references
        allPrimary.delete('Zoho CRM');
        allPrimary.delete('Zoho CRM (Quotes)');
        allPrimary.add(crmProducts[crmFit]);
    }

    // Add email product based on email-fit
    const emailFit = a['email-fit'];
    if (emailFit && emailProducts[emailFit]) {
        allPrimary.add(emailProducts[emailFit]);
        allPrimary.delete('Zoho Campaigns');
        allPrimary.delete('Zoho Marketing Automation');
    }

    // Add billing product based on billing-fit
    const billingFit = a['billing-fit'];
    if (billingFit && billingProducts[billingFit]) {
        allPrimary.add(billingProducts[billingFit]);
        allPrimary.delete('Zoho Invoice');
        allPrimary.delete('Zoho Books');
        allPrimary.delete('Zoho Invoice, Zoho Books');
    }

    // Add form tools based on forms answer
    const formChannels = a.forms || [];
    if (formChannels.includes('website-forms') || formChannels.includes('landing-pages')) {
        allPrimary.add('Zoho Forms');
    }
    if (formChannels.includes('live-chat')) {
        allPrimary.add('Zoho SalesIQ');
    }
    if (formChannels.includes('ads')) {
        allSupporting.add('Zoho PageSense');
    }

    // Remove duplicates from supporting that are already primary
    allPrimary.forEach(p => allSupporting.delete(p));

    // Split into phases
    const primaryArr = [...allPrimary];
    const supportingArr = [...allSupporting];

    // Phase 1: Core apps (first 3 primary)
    const phase1 = primaryArr.slice(0, 3);
    // Phase 2: Remaining primary + key supporting
    const phase2 = [...primaryArr.slice(3), ...supportingArr.slice(0, 2)];
    // Phase 3: Rest of supporting + advanced
    const phase3 = supportingArr.slice(2);

    // Build where to start
    const startWith = phase1[0] || 'Zoho CRM';
    const priorities = (a.priorities || []).map(v => priorityLabels[v] || v);

    // Build rationale text from user answers
    const proc = a.process || {};
    const phase1Rationale = buildPhaseRationale(1, phase1, proc);
    const phase2Rationale = buildPhaseRationale(2, phase2, proc);
    const phase3Rationale = buildPhaseRationale(3, phase3, proc);

    // Build and inject the summary into the question header
    renderRoadmapSummary(selectedAreas, proc, integrations);

    // Render
    let html = '';

    // Phase 1
    html += buildPhaseHtml(1, 'Start Here', 'Get your core workflow running first', phase1, phase1Rationale);

    if (phase2.length > 0) {
        html += '<div class="roadmap-connector"></div>';
        html += buildPhaseHtml(2, 'Expand', 'Add supporting tools once core is stable', phase2, phase2Rationale);
    }

    if (phase3.length > 0) {
        html += '<div class="roadmap-connector"></div>';
        html += buildPhaseHtml(3, 'Optimize', 'Layer in advanced capabilities', phase3, phase3Rationale);
    }

    // Where to start section
    html += `
        <div class="roadmap-section">
            <span class="roadmap-section-label">Where to Start</span>
            <div class="roadmap-section-content">
                Begin with <strong>${escapeHtml(startWith)}</strong>. Get your team onboarded and your core data flowing before adding integrations.
                ${priorities.length > 0 ? `<br>Based on your priorities (${priorities.join(', ')}), focus on getting value fast before expanding.` : ''}
            </div>
        </div>
    `;

    // Key integrations
    if (integrations.length > 0) {
        html += `
            <div class="roadmap-section">
                <span class="roadmap-section-label">Key Integrations</span>
                <div class="roadmap-section-content">
                    ${integrations.map(i => `<div>&bull; ${escapeHtml(i)}</div>`).join('')}
                </div>
            </div>
        `;
    }

    // Honest Assessment — tool-to-task tradeoffs
    const worryEntries = [];

    // Auto-generate based on what was recommended vs. where competitors are stronger
    if (selectedAreas.includes('email-marketing') || emailFit === 'newsletters') {
        worryEntries.push({
            label: 'Email marketing',
            response: 'Using Zoho Campaigns for cold outreach is more complex than just using Mailchimp or SendGrid. Campaigns is built for warm lists and CRM-connected sends. If you\'re doing high-volume cold email, a dedicated tool like Instantly or Apollo will get better deliverability with less setup.',
        });
    }

    if (selectedAreas.includes('lead-management') || selectedAreas.includes('deal-closing')) {
        worryEntries.push({
            label: 'CRM adoption',
            response: 'Using Zoho CRM for a team that\'s never stuck with a CRM before is more complex than just using HubSpot\'s free tier. HubSpot has a gentler learning curve and your team could be productive in a day. Zoho is more powerful long-term but needs a champion internally to drive adoption — if you don\'t have that person, start simpler.',
        });
    }

    if (emailFit === 'automation' || emailFit === 'both') {
        worryEntries.push({
            label: 'Marketing automation',
            response: 'Using Zoho Marketing Automation for ad-driven lead nurturing is more complex than just using ActiveCampaign or HubSpot Marketing Hub. Zoho\'s automation builder works well within the Zoho ecosystem but its ad tracking and attribution are basic compared to tools purpose-built for paid acquisition funnels.',
        });
    }

    if (formChannels.includes('ads')) {
        worryEntries.push({
            label: 'Paid ad tracking',
            response: 'Using Zoho PageSense for conversion tracking on paid campaigns is more complex than just using Google Analytics plus your ad platform\'s native pixel. PageSense is useful for A/B testing but doesn\'t replace proper ad attribution — you\'ll likely need both.',
        });
    }

    if (crmFit === 'advanced' || selectedAreas.length > 6) {
        worryEntries.push({
            label: 'Scaling past mid-market',
            response: 'Using Zoho CRM for enterprise-scale sales operations (50+ reps, territory management, CPQ) is more complex than just using Salesforce. Salesforce owns this space for a reason. If you\'re confident you\'ll be at that scale within 18 months, starting on Salesforce now avoids a painful migration later.',
        });
    }

    if (crmFit === 'simple' && selectedAreas.length > 5) {
        worryEntries.push({
            label: 'Bigin scope',
            response: 'Using Zoho Bigin for ' + selectedAreas.length + ' areas of focus is more complex than it needs to be. Bigin is great for simple pipelines, but this level of complexity usually needs full Zoho CRM or even HubSpot\'s free CRM. Consider whether you\'re outgrowing Bigin before you start.',
        });
    }

    if (selectedAreas.includes('support') && selectedAreas.includes('client-projects')) {
        worryEntries.push({
            label: 'Support + project delivery',
            response: 'Using Zoho Desk alongside Zoho Projects for client work is more complex than just using Monday.com or ClickUp, which handle both in one place. Desk and Projects don\'t share a unified client view out of the box — you\'ll need Zoho Flow or custom integrations to connect them.',
        });
    }

    if (selectedAreas.includes('accounting') && billingFit === 'full-billing') {
        worryEntries.push({
            label: 'Full accounting',
            response: 'Using Zoho Books for complex accounting (multi-entity, advanced inventory, payroll) is more complex than just using QuickBooks or Xero, which have deeper accounting ecosystems and more accountant integrations. Zoho Books is strong for straightforward bookkeeping tied to your CRM, but check with your accountant before committing.',
        });
    }

    if (worryEntries.length > 0) {
        html += `
            <div class="roadmap-section roadmap-section--worries">
                <span class="roadmap-section-label">Honest Assessment</span>
                <div class="roadmap-worry-list">
                    ${worryEntries.map(entry => `
                        <div class="roadmap-worry-item">
                            <div class="roadmap-worry-concern">
                                <span class="roadmap-worry-tag">${entry.label}</span>
                            </div>
                            <div class="roadmap-worry-response">
                                <span class="roadmap-worry-arrow">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </span>
                                <p>${entry.response}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Resources
    html += `
        <div class="roadmap-section">
            <span class="roadmap-section-label">Related Resources</span>
            <div class="roadmap-resources">
                <span class="roadmap-resource-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    Getting Started Guide
                </span>
                <span class="roadmap-resource-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    Setup Walkthrough Video
                </span>
                <span class="roadmap-resource-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Talk to a Zoho Expert
                </span>
            </div>
        </div>
    `;

    output.innerHTML = html;
}

function buildPhaseHtml(num, title, subtitle, apps, rationale) {
    const appsHtml = apps.map(app =>
        `<span class="roadmap-app roadmap-app--primary">${escapeHtml(app)}</span>`
    ).join('');

    const rationaleHtml = rationale
        ? `<p class="roadmap-phase-rationale">${rationale}</p>`
        : '';

    return `
        <div class="roadmap-phase roadmap-phase--${num}">
            <div class="roadmap-phase-header">
                <span class="roadmap-phase-num">${num}</span>
                <span class="roadmap-phase-title">${title}</span>
            </div>
            <p class="roadmap-phase-subtitle">${subtitle}</p>
            ${rationaleHtml}
            <div class="roadmap-apps">${appsHtml || '<span class="roadmap-app roadmap-app--supporting">No apps in this phase</span>'}</div>
        </div>
    `;
}

// App-level rationale snippets — explains *why* each app matters
const appRationale = {
    'Zoho CRM': 'captures and tracks every lead so nothing slips through the cracks',
    'Zoho Bigin': 'gives you a simple pipeline view without the complexity of a full CRM',
    'Zoho CRM (Enterprise)': 'handles complex sales workflows, territories, and custom modules your team needs',
    'Zoho Forms': 'pulls leads from your website automatically into your pipeline',
    'Zoho SalesIQ': 'shows you who is browsing your site right now so your team can reach out at the right moment',
    'Zoho Campaigns': 'lets you send targeted emails to nurture leads that aren\'t ready to buy yet',
    'Zoho Marketing Automation': 'replaces manual campaign work with behavior-triggered sequences',
    'Zoho Campaigns + Marketing Automation': 'covers both bulk sends and automated drip sequences for full-funnel email',
    'Zoho Analytics': 'gives you dashboards across sales, marketing, and support so you see the full picture',
    'Zoho Books': 'handles your accounting and keeps finances connected to your sales data',
    'Zoho Invoice': 'sends professional invoices and tracks payments without leaving your workflow',
    'Zoho Invoice + Zoho Books': 'connects invoicing to your books so nothing falls between the cracks',
    'Zoho Books + Invoice + Checkout': 'handles the full quote-to-cash flow from proposal to payment to ledger',
    'Zoho CRM (Quotes module)': 'lets you generate and send quotes directly from deal records',
    'Zoho CRM (Quotes)': 'lets you generate and send quotes directly from deal records',
    'Zoho Desk': 'gives your support team full customer context on every ticket',
    'Zoho Sign': 'gets contracts signed digitally without chasing paper',
    'Zoho Projects': 'keeps project delivery organized with tasks, milestones, and team visibility',
    'Zoho Sprints': 'manages agile sprints for internal dev or product teams',
    'Zoho Social': 'schedules posts and captures leads from social engagement',
    'Zoho Cliq': 'keeps your team communicating in one place with channels linked to projects',
    'Zoho WorkDrive': 'gives your team shared file storage that integrates with everything else',
    'Zoho Meeting': 'handles video calls and webinars without a separate subscription',
    'Zoho Expense': 'automates expense tracking from receipt to ledger entry',
    'Zoho Checkout': 'creates payment links and checkout pages for collecting money online',
    'Zoho PageSense': 'tells you which parts of your website actually convert so you stop guessing',
};

function buildPhaseRationale(phaseNum, apps, proc) {
    if (apps.length === 0) return '';

    const reasons = apps
        .map(app => appRationale[app])
        .filter(Boolean);

    if (reasons.length === 0) return '';

    // Contextualize with what the user told us
    let opener = '';
    if (phaseNum === 1 && proc.why) {
        opener = 'You mentioned that ' + escapeHtml(proc.why).toLowerCase() + '. ';
    } else if (phaseNum === 1) {
        opener = 'Based on what you told us, these are the essentials. ';
    } else if (phaseNum === 2) {
        opener = 'Once your core workflow is running, these tools add visibility and reach. ';
    } else if (phaseNum === 3) {
        opener = 'At this stage your team is comfortable and your data is clean. ';
    }

    // Build a sentence that strings the reasons together
    const appSentences = apps.map((app) => {
        const reason = appRationale[app];
        if (!reason) return null;
        const name = app.replace('Zoho ', '');
        return `<strong>${escapeHtml(name)}</strong> ${reason}`;
    }).filter(Boolean);

    if (appSentences.length === 1) {
        return opener + appSentences[0] + '.';
    }

    return opener + appSentences.slice(0, -1).join(', ') + ', and ' + appSentences[appSentences.length - 1] + '.';
}

// Platform-agnostic category labels for solution summary
const solutionCategories = {
    'Zoho CRM': 'CRM',
    'Zoho Bigin': 'CRM',
    'Zoho CRM (Enterprise)': 'CRM',
    'Zoho Forms': 'form and lead capture layer',
    'Zoho SalesIQ': 'live chat and visitor tracking',
    'Zoho Campaigns': 'email marketing tool',
    'Zoho Marketing Automation': 'marketing automation platform',
    'Zoho Campaigns + Marketing Automation': 'full email marketing stack',
    'Zoho Analytics': 'analytics and reporting layer',
    'Zoho Books': 'accounting system',
    'Zoho Invoice': 'invoicing tool',
    'Zoho Invoice + Zoho Books': 'invoicing and accounting system',
    'Zoho Books + Invoice + Checkout': 'end-to-end billing stack',
    'Zoho CRM (Quotes module)': 'quoting tool',
    'Zoho CRM (Quotes)': 'quoting tool',
    'Zoho Desk': 'help desk',
    'Zoho Sign': 'e-signature tool',
    'Zoho Projects': 'project management platform',
    'Zoho Sprints': 'agile sprint tracker',
    'Zoho Social': 'social media management',
    'Zoho Cliq': 'team messaging',
    'Zoho WorkDrive': 'shared file storage',
    'Zoho Meeting': 'video conferencing',
    'Zoho Expense': 'expense management',
    'Zoho Checkout': 'payment collection',
    'Zoho PageSense': 'website conversion tracking',
};

function renderRoadmapSummary(selectedAreas, proc, integrations) {
    const questionHeader = document.querySelector('[data-question="roadmap"] .question-header');
    if (!questionHeader) return;

    // Gather pain points from areas
    const painPoints = selectedAreas.map(v => areaLabels[v] || v);

    // Get the unique solution categories from all primary apps
    const a = wizardState.answers;
    const allApps = new Set();
    selectedAreas.forEach(area => {
        const mapping = productMap[area];
        if (!mapping) return;
        mapping.primary.forEach(p => allApps.add(p));
    });
    // Apply overrides
    const crmFit = a['crm-fit'];
    if (crmFit && crmProducts[crmFit]) {
        allApps.delete('Zoho CRM');
        allApps.add(crmProducts[crmFit]);
    }
    const emailFit = a['email-fit'];
    if (emailFit && emailProducts[emailFit]) {
        allApps.delete('Zoho Campaigns');
        allApps.delete('Zoho Marketing Automation');
        allApps.add(emailProducts[emailFit]);
    }

    const categories = [...new Set([...allApps].map(app => solutionCategories[app]).filter(Boolean))];

    // Paragraph 1: Pain points
    let p1 = '';
    if (proc.why) {
        p1 = `Right now, your team is feeling the pain: <strong>${escapeHtml(proc.why)}</strong>.`;
    } else if (painPoints.length > 0) {
        p1 = `Right now, your biggest pain points are <strong>${joinList(painPoints.map(p => p.toLowerCase()))}</strong>.`;
    }

    // Paragraph 2: Connected problem → connected solution (platform-agnostic)
    let p2 = '';
    if (categories.length >= 2) {
        p2 = `These problems are connected — and the fix isn't ${categories.length} separate tools. It's a connected stack where each layer feeds the next.`;
        if (integrations.length > 0) {
            const topIntegrations = integrations.slice(0, 2).map(i => escapeHtml(i).toLowerCase());
            p2 += ` Specifically: ${topIntegrations.join(', and ')}.`;
        }
    }

    // Paragraph 3: What the stack looks like (agnostic)
    let p3 = '';
    if (categories.length > 0) {
        const catBold = categories.map(c => '<strong>' + c + '</strong>');
        p3 = 'Your recommended stack: a ' + joinList(catBold);
        if (proc.how) {
            p3 += ` — replacing ${escapeHtml(proc.how).toLowerCase()} with tools that talk to each other`;
        }
        p3 += '. Wired together, this closes the gap between where you are today and where you need to be.';
    }

    const paragraphs = [p1, p2, p3].filter(Boolean);

    questionHeader.innerHTML = `
        <h1>Zoho One Concierge</h1>
        ${paragraphs.map(p => `<p class="roadmap-summary-text">${p}</p>`).join('')}
    `;
}

// ── Stage Navigation Helper ──────────────────────
function goToStage(stageNumber, step = 0) {
    wizardState.currentStage = stageNumber;
    wizardState.currentStep = step;
    showQuestion(currentQuestionKey());
    updateProgress();
}

// ── Discovery CTA Buttons ────────────────────────
document.getElementById('getSolutionBtn').addEventListener('click', () => {
    const btn = document.getElementById('getSolutionBtn');
    const mindMap = document.getElementById('mindMap');
    btn.style.display = 'none';
    mindMap.classList.add('mind-map--expanded');
});

document.getElementById('mapToZohoBtn').addEventListener('click', () => {
    goToStage(2);
});

backBtn.addEventListener('click', () => {
    if (wizardState.currentStep > 0) {
        wizardState.currentStep--;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else if (wizardState.currentStage > 1) {
        wizardState.currentStage--;
        const prevQuestions = currentQuestions();
        wizardState.currentStep = prevQuestions.length - 1;
        showQuestion(currentQuestionKey());
        updateProgress();
    }
});

// ── Print Results (via hidden iframe — no popup blocker) ──
function buildPrintHtml() {
    const emailInput = document.getElementById('roadmapEmail');
    const email = emailInput ? emailInput.value.trim() : '';
    const header = document.querySelector('[data-question="roadmap"] .question-header');
    const roadmap = document.getElementById('roadmapOutput');
    if (!header || !roadmap) return null;

    let salutation = '';
    if (email) {
        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        salutation = '<p class="salutation">Prepared for ' + escapeHtml(name) + '</p>';
    }

    const dateEl = document.querySelector('.roadmap-doc-date');
    const dateText = dateEl ? dateEl.textContent : '';

    // Summary paragraphs
    let summaryHtml = '';
    header.querySelectorAll('.roadmap-summary-text').forEach(p => {
        summaryHtml += '<p>' + p.innerHTML + '</p>';
    });

    // Walk roadmap children and build clean HTML
    let bodyHtml = '';
    const roadmapClone = roadmap.cloneNode(true);
    const cta = roadmapClone.querySelector('.roadmap-email-cta');
    if (cta) cta.remove();

    roadmapClone.querySelectorAll('.roadmap-phase').forEach(node => {
        const num = node.querySelector('.roadmap-phase-num');
        const title = node.querySelector('.roadmap-phase-title');
        const sub = node.querySelector('.roadmap-phase-subtitle');
        const why = node.querySelector('.roadmap-phase-rationale');
        const apps = node.querySelectorAll('.roadmap-app');
        const n = num ? num.textContent.trim() : '1';

        let appsHtml = '';
        if (apps.length) {
            appsHtml = '<div class="apps">' + Array.from(apps).map(a => '<span class="app">' + a.textContent + '</span>').join('') + '</div>';
        }

        bodyHtml += '<div class="phase">'
            + '<div class="phase-head"><span class="phase-num phase-num--' + n + '">' + n + '</span><span class="phase-title">' + (title ? title.textContent : '') + '</span></div>'
            + (sub ? '<div class="phase-sub">' + sub.textContent + '</div>' : '')
            + (why ? '<div class="phase-why">' + why.innerHTML + '</div>' : '')
            + appsHtml
            + '</div>';
    });

    roadmapClone.querySelectorAll('.roadmap-section').forEach(node => {
        const isWorries = node.classList.contains('roadmap-section--worries');
        const label = node.querySelector('.roadmap-section-label');
        let inner = '';

        if (isWorries) {
            node.querySelectorAll('.roadmap-worry-item').forEach(item => {
                const tag = item.querySelector('.roadmap-worry-tag');
                const resp = item.querySelector('.roadmap-worry-response p');
                inner += '<div class="worry">'
                    + (tag ? '<div class="worry-tag">' + tag.textContent + '</div>' : '')
                    + (resp ? '<p>' + resp.innerHTML + '</p>' : '')
                    + '</div>';
            });
        } else if (node.querySelector('.roadmap-resources')) {
            inner = '<div class="resources">';
            node.querySelectorAll('.roadmap-resource-link').forEach(link => {
                inner += '<span class="resource">' + link.textContent.trim() + '</span>';
            });
            inner += '</div>';
        } else {
            const content = node.querySelector('.roadmap-section-content');
            if (content) inner = '<div class="section-body">' + content.innerHTML + '</div>';
        }

        bodyHtml += '<div class="section' + (isWorries ? ' worries' : '') + '">'
            + (label ? '<div class="section-label">' + label.textContent + '</div>' : '')
            + inner + '</div>';
    });

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Zoho One Concierge</title>
<style>
@page { size: letter; margin: 0.65in 0.75in; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 10pt; line-height: 1.5; padding: 0; }

.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2pt solid #1a1a1a; padding-bottom: 8pt; margin-bottom: 14pt; }
.header img { height: 22pt; }
.header span { font-size: 7.5pt; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.08em; }

.salutation { font-size: 10.5pt; font-weight: 600; color: #333; margin: 0 0 4pt; }

h1 { font-size: 20pt; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 8pt; }
.summary { margin-bottom: 18pt; }
.summary p { font-size: 9.5pt; line-height: 1.6; color: #444; margin-bottom: 5pt; }
.summary p strong { color: #1a1a1a; }

.phase { border: 1px solid #d0d0d0; border-radius: 4pt; padding: 10pt 14pt; margin-bottom: 8pt; break-inside: avoid; page-break-inside: avoid; }
.phase-head { display: flex; align-items: center; gap: 6pt; margin-bottom: 4pt; }
.phase-num { width: 20pt; height: 20pt; border-radius: 50%; font-size: 8.5pt; font-weight: 700; color: white; text-align: center; line-height: 20pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.phase-num--1 { background: #d42a2a; }
.phase-num--2 { background: #0b6ee8; }
.phase-num--3 { background: #2ea64b; }
.phase-title { font-size: 11.5pt; font-weight: 700; }
.phase-sub { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #777; margin-bottom: 4pt; }
.phase-why { font-size: 9pt; line-height: 1.55; color: #444; margin-bottom: 6pt; }
.apps { display: flex; flex-wrap: wrap; gap: 4pt; }
.app { font-size: 8pt; font-weight: 600; padding: 3pt 8pt; border: 1px solid #bbb; border-radius: 3pt; background: #f5f5f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

.section { border: 1px solid #d0d0d0; border-radius: 4pt; padding: 10pt 14pt; margin-bottom: 8pt; break-inside: avoid; page-break-inside: avoid; }
.section-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 4pt; margin-bottom: 8pt; }
.section-body { font-size: 9pt; line-height: 1.55; color: #333; }
.section-body div { margin-bottom: 3pt; }

.worries { background: #fef9f2; border-color: #d9c9a8; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.worries .section-label { color: #7a6030; border-bottom-color: #e0d0b4; }
.worry { padding: 6pt 0; }
.worry:first-child { padding-top: 0; }
.worry:last-child { padding-bottom: 0; }
.worry + .worry { border-top: 1px solid #e0d0b4; }
.worry-tag { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #8b6524; margin-bottom: 3pt; }
.worry p { font-size: 8.5pt; line-height: 1.5; color: #333; }

.resources { display: flex; gap: 5pt; flex-wrap: wrap; }
.resource { font-size: 8pt; font-weight: 600; padding: 4pt 10pt; border: 1px solid #bbb; border-radius: 3pt; color: #333; }

.footer { margin-top: 18pt; padding-top: 8pt; border-top: 1px solid #ddd; font-size: 7pt; color: #999; text-align: center; }
</style></head><body>
<div class="header"><img src="logo.png" alt="Zoho"><span>${escapeHtml(dateText)}</span></div>
${salutation}
<h1>Zoho One Concierge</h1>
<div class="summary">${summaryHtml}</div>
${bodyHtml}
<div class="footer">Generated by Zoho One Concierge</div>
</body></html>`;
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#roadmapEmailBtn')) return;

    const html = buildPrintHtml();
    if (!html) return;

    // Remove any previous print iframe
    const old = document.getElementById('printFrame');
    if (old) old.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'printFrame';
    iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };
});

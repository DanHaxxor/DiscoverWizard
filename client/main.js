// ── Wizard State ──────────────────────────────────
const wizardState = {
    currentStage: 1,
    currentStep: 0,
    answers: {},
    totalStages: 3,
};

// Question keys per stage
const stageQuestions = {
    1: ['intent', 'relationship', 'access'],
    2: ['areas', 'process', 'priorities', 'worries', 'confirm'],
    3: ['crm-fit', 'forms', 'email-fit', 'billing-fit', 'roadmap'],
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

// ── DOM References ────────────────────────────────
const progressFill = document.getElementById('progressFill');
const wizardContent = document.getElementById('wizardContent');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');

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

// ── Show a specific question card ─────────────────
function showQuestion(questionKey) {
    const cards = wizardContent.querySelectorAll('.question-card');
    cards.forEach(c => c.classList.remove('active'));

    const target = wizardContent.querySelector(`[data-question="${questionKey}"]`);
    if (target) target.classList.add('active');

    // Special step handling
    if (questionKey === 'confirm') {
        renderMindMap();
        nextBtn.disabled = false;
        nextBtn.textContent = 'Build My Roadmap';
    } else if (questionKey === 'roadmap') {
        renderRoadmap();
        nextBtn.disabled = false;
        nextBtn.textContent = 'Finish';
    } else {
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
    const questions = currentQuestions();
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

// ── Mind Map Rendering ────────────────────────────
function renderMindMap() {
    const map = document.getElementById('mindMap');
    const a = wizardState.answers;

    // Build areas chips
    const areasHtml = (a.areas || [])
        .map(v => `<span class="mind-map-chip">${areaLabels[v] || v}</span>`)
        .join('');

    // Build priorities chips
    const prioritiesHtml = (a.priorities || [])
        .map((v, i) => `<span class="mind-map-priority-chip"><span class="mind-map-priority-num">${i + 1}</span>${priorityLabels[v] || v}</span>`)
        .join('');

    // Process fields
    const proc = a.process || {};
    const processFields = [
        { key: 'who', label: 'Who' },
        { key: 'what', label: 'What' },
        { key: 'when', label: 'When' },
        { key: 'where', label: 'Where' },
        { key: 'why', label: 'Why' },
        { key: 'how', label: 'How' },
    ];
    const processHtml = processFields
        .filter(f => proc[f.key])
        .map(f => `
            <div class="mind-map-branch">
                <span class="mind-map-branch-label">${f.label}</span>
                <span class="mind-map-branch-value">${escapeHtml(proc[f.key])}</span>
            </div>
        `).join('');

    // Build text summary
    const areasList = (a.areas || []).map(v => areaLabels[v] || v);
    const prioritiesList = (a.priorities || []).map(v => priorityLabels[v] || v);

    let summaryParts = [];

    if (areasList.length > 0) {
        summaryParts.push(`You're looking for help with <strong>${joinList(areasList)}</strong>.`);
    }

    if (proc.who) {
        summaryParts.push(`This involves <strong>${escapeHtml(proc.who)}</strong>.`);
    }

    if (proc.what) {
        summaryParts.push(`Right now, ${escapeHtml(proc.what)}.`);
    }

    if (proc.why) {
        summaryParts.push(`The main driver: ${escapeHtml(proc.why)}.`);
    }

    if (proc.how) {
        summaryParts.push(`Currently you're handling this with ${escapeHtml(proc.how)}.`);
    }

    if (prioritiesList.length > 0) {
        summaryParts.push(`What matters most to you: <strong>${joinList(prioritiesList)}</strong>.`);
    }

    // Worry analysis summary
    const worries = a.worries || {};
    if (worries['status-quo']) {
        summaryParts.push(`If nothing changes: ${escapeHtml(worries['status-quo'])}.`);
    }
    if (worries.adoption) {
        summaryParts.push(`Hesitation about switching: ${escapeHtml(worries.adoption)}.`);
    }
    if (worries['post-sale']) {
        summaryParts.push(`After committing: ${escapeHtml(worries['post-sale'])}.`);
    }

    const summaryHtml = summaryParts.length > 0
        ? summaryParts.join(' ')
        : 'No details provided yet.';

    // Build worry cards for the mind map
    const worryCards = [];
    if (worries['status-quo']) {
        worryCards.push(`
            <div class="mind-map-branch mind-map-worry mind-map-worry--status-quo">
                <span class="mind-map-branch-label">If nothing changes</span>
                <span class="mind-map-branch-value">${escapeHtml(worries['status-quo'])}</span>
            </div>
        `);
    }
    if (worries.adoption) {
        worryCards.push(`
            <div class="mind-map-branch mind-map-worry mind-map-worry--adoption">
                <span class="mind-map-branch-label">Hesitations</span>
                <span class="mind-map-branch-value">${escapeHtml(worries.adoption)}</span>
            </div>
        `);
    }
    if (worries['post-sale']) {
        worryCards.push(`
            <div class="mind-map-branch mind-map-worry mind-map-worry--post-sale">
                <span class="mind-map-branch-label">After committing</span>
                <span class="mind-map-branch-value">${escapeHtml(worries['post-sale'])}</span>
            </div>
        `);
    }
    const worriesHtml = worryCards.length > 0
        ? `<div class="mind-map-branch mind-map-branch--worries">
               <span class="mind-map-branch-label">Concerns</span>
               <div class="mind-map-worry-cards">${worryCards.join('')}</div>
           </div>`
        : '';

    map.innerHTML = `
        <div class="mind-map-center">Your Requirements</div>
        <div class="mind-map-branches">
            <div class="mind-map-branch mind-map-branch--areas">
                <span class="mind-map-branch-label">Areas of Focus</span>
                <div class="mind-map-chips">${areasHtml || '<span class="mind-map-branch-value">None selected</span>'}</div>
            </div>
            ${processHtml}
            <div class="mind-map-branch mind-map-branch--priorities">
                <span class="mind-map-branch-label">Priorities</span>
                <div class="mind-map-chips">${prioritiesHtml || '<span class="mind-map-branch-value">None selected</span>'}</div>
            </div>
        </div>
        ${worriesHtml}
        <div class="mind-map-summary">
            <span class="mind-map-summary-label">Here's what we heard</span>
            <p class="mind-map-summary-text">${summaryHtml}</p>
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
        // Next question within current stage
        wizardState.currentStep++;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else if (wizardState.currentStage < wizardState.totalStages) {
        // Advance to next stage
        wizardState.currentStage++;
        wizardState.currentStep = 0;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else {
        // All stages complete — wizard finished
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

    // Render
    let html = '';

    // Phase 1
    html += buildPhaseHtml(1, 'Start Here', 'Get your core workflow running first', phase1);

    if (phase2.length > 0) {
        html += '<div class="roadmap-connector"></div>';
        html += buildPhaseHtml(2, 'Expand', 'Add supporting tools once core is stable', phase2);
    }

    if (phase3.length > 0) {
        html += '<div class="roadmap-connector"></div>';
        html += buildPhaseHtml(3, 'Optimize', 'Layer in advanced capabilities', phase3);
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

    // Worry Analysis — address concerns
    const w = a.worries || {};
    const worryEntries = [];
    if (w['status-quo']) {
        worryEntries.push({
            label: 'If nothing changes',
            concern: w['status-quo'],
            response: 'Starting with ' + escapeHtml(startWith) + ' addresses this directly. A phased rollout means your team sees value in the first week, not the first quarter.',
        });
    }
    if (w.adoption) {
        worryEntries.push({
            label: 'Hesitation about switching',
            concern: w.adoption,
            response: 'Zoho offers guided onboarding, data import wizards, and a 15-day free trial on most products. You can validate the fit before committing.',
        });
    }
    if (w['post-sale']) {
        worryEntries.push({
            label: 'After committing',
            concern: w['post-sale'],
            response: 'Zoho One scales from 5 to 5,000+ users. 24/5 support is included, and you can add or drop apps as your needs change — no long-term lock-in.',
        });
    }

    if (worryEntries.length > 0) {
        html += `
            <div class="roadmap-section roadmap-section--worries">
                <span class="roadmap-section-label">Addressing Your Concerns</span>
                <div class="roadmap-worry-list">
                    ${worryEntries.map(entry => `
                        <div class="roadmap-worry-item">
                            <div class="roadmap-worry-concern">
                                <span class="roadmap-worry-tag">${entry.label}</span>
                                <p>${escapeHtml(entry.concern)}</p>
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

function buildPhaseHtml(num, title, subtitle, apps) {
    const appsHtml = apps.map(app =>
        `<span class="roadmap-app roadmap-app--primary">${escapeHtml(app)}</span>`
    ).join('');

    return `
        <div class="roadmap-phase roadmap-phase--${num}">
            <div class="roadmap-phase-header">
                <span class="roadmap-phase-num">${num}</span>
                <span class="roadmap-phase-title">${title}</span>
            </div>
            <p class="roadmap-phase-subtitle">${subtitle}</p>
            <div class="roadmap-apps">${appsHtml || '<span class="roadmap-app roadmap-app--supporting">No apps in this phase</span>'}</div>
        </div>
    `;
}

backBtn.addEventListener('click', () => {
    if (wizardState.currentStep > 0) {
        wizardState.currentStep--;
        showQuestion(currentQuestionKey());
        updateProgress();
    } else if (wizardState.currentStage > 1) {
        // Go back to last question of previous stage
        wizardState.currentStage--;
        const prevQuestions = currentQuestions();
        wizardState.currentStep = prevQuestions.length - 1;
        showQuestion(currentQuestionKey());
        updateProgress();
    }
});

// ── Wizard State ──────────────────────────────────
const wizardState = {
    currentStage: 1,
    currentStep: 0,
    answers: {},
    totalStages: 2,
};

// Question keys per stage
const stageQuestions = {
    1: ['intent', 'areas', 'confirm'],
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

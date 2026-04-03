// ── DiscoverWizard – Main ─────────────────────────

const state = {
    answers: {},
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

// ── Helper: auto-advance on radio select ──────────

function radioAdvance(groupId, key, nextPageId) {
    document.getElementById(groupId).addEventListener('change', (e) => {
        state.answers[key] = e.target.value;
        setTimeout(() => showPage(nextPageId), 350);
    });
}

// ── Helper: advance on button click ───────────────

function buttonAdvance(btnId, inputId, key, nextPageId) {
    document.getElementById(btnId).addEventListener('click', () => {
        state.answers[key] = document.getElementById(inputId).value;
        showPage(nextPageId);
    });
}

// ── Searchable Select Component ───────────────────

function initSearchSelect(containerEl, items, onSelect) {
    const trigger = containerEl.querySelector('.search-select__trigger');
    const valueEl = containerEl.querySelector('.search-select__value');
    const searchInput = containerEl.querySelector('.search-select__search');
    const optionsList = containerEl.querySelector('.search-select__options');
    const backdrop = containerEl.querySelector('.search-select__backdrop');
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

    trigger.addEventListener('click', () => {
        containerEl.classList.contains('open') ? close() : open();
    });

    searchInput.addEventListener('input', () => render(searchInput.value));

    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('click', (e) => {
        if (!containerEl.contains(e.target)) close();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    return {
        reset() {
            selected = null;
            valueEl.textContent = placeholder;
            valueEl.classList.remove('has-value');
        }
    };
}

// ═══════════════════════════════════════════════════
// FLOW WIRING
// ═══════════════════════════════════════════════════

// Landing → Industry
document.getElementById('getStartedBtn').addEventListener('click', () => {
    showPage('pageIndustry');
});

// Q1: Industry → Users
const subField = document.getElementById('subIndustryField');

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

            const subContainer = document.getElementById('subIndustrySelect');
            subContainer.classList.remove('open');
            const subValueEl = subContainer.querySelector('.search-select__value');
            subValueEl.textContent = subValueEl.dataset.placeholder;
            subValueEl.classList.remove('has-value');
            delete state.answers.subIndustry;

            initSearchSelect(subContainer, match.subs, (subName) => {
                state.answers.subIndustry = subName;
                setTimeout(() => showPage('pageUsers'), 350);
            });
        }
    }
);

// Q2: Users → Role
radioAdvance('usersGroup', 'users', 'pageRole');

// Q3: Role → B2B
radioAdvance('roleGroup', 'role', 'pageB2B');

// Q4: B2B → Products
radioAdvance('b2bGroup', 'b2b', 'pageProducts');

// Q5: Products → Current Software
buttonAdvance('productsNext', 'productsInput', 'products', 'pageCurrentSoftware');

// Q6: Current Software → Replace/Keep
buttonAdvance('currentSoftwareNext', 'currentSoftwareInput', 'currentSoftware', 'pageReplaceKeep');

// Q7: Replace/Keep → Pain Points
buttonAdvance('replaceKeepNext', 'replaceKeepInput', 'replaceKeep', 'pagePainPoints');

// Q8: Pain Points → Requirements
document.getElementById('painPointsNext').addEventListener('click', () => {
    const checked = document.querySelectorAll('#painPointsGroup input:checked');
    state.answers.painPoints = Array.from(checked).map(cb => cb.value);
    showPage('pageRequirements');
});

// Q9: Requirements → Worry
buttonAdvance('requirementsNext', 'requirementsInput', 'requirements', 'pageWorry');

// Q10: Worry → Summary (future)
document.getElementById('worryNext').addEventListener('click', () => {
    state.answers.worry = document.getElementById('worryInput').value;
    console.log('Phase I complete:', state.answers);
    // Summary page will be wired here
});

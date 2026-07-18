/**
 * ============================================================
 * EV OVERSEAS — Student & Counselor Dashboard (Clerk Auth + Google Sheets)
 * ============================================================
 */

// ── CONFIGURATION ──────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI6mgA3ELgi4YW-nbbpXEUhxJsBUc6gyj7IZn6rodIClK7AybjkVfTQMyDxfF1B8c-/exec';

// Official Counselor Email Addresses
const COUNSELOR_EMAILS = [
    'gopi.chand@evoverseas.com',
    'lakshmi.bala@evoverseas.com',
    'alisha.mulani@evoverseas.com',
    'mohibmulani@gmail.com'
];

// ── Journey Steps Definition ──────────────────────────────
const JOURNEY_STEPS = [
    { number: 1, name: 'Initial Consultation', icon: '💬' },
    { number: 2, name: 'Profile & University Shortlist', icon: '🎯' },
    { number: 3, name: 'Application & Documentation', icon: '📋' },
    { number: 4, name: 'Offer & Scholarship', icon: '🎓' },
    { number: 5, name: 'Visa & Pre-departure', icon: '🛂' },
    { number: 6, name: 'Arrival & Onboarding', icon: '✈️' }
];

// ── GLOBAL STATE ───────────────────────────────────────────
let clerk = null;
let currentUser = null;
let userRole = 'student'; // 'student' or 'counselor'
let studentData = null;
let allStudentsData = [];
let selectedStudentObj = null;
let selectedAppIndex = 0;
let currentApplicationIndex = 0;
let progressChart = null;

// ── INITIALIZATION ─────────────────────────────────────────
window.addEventListener('load', async function () {
    showLoadingScreen();

    // Wait up to 10 seconds for window.Clerk to load from CDN
    let attempts = 0;
    while (!window.Clerk && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
    }

    if (window.Clerk) {
        try {
            clerk = window.Clerk;

            // Call load() on the Clerk global instance if not already ready
            if (typeof clerk.load === 'function' && !clerk.isReady) {
                await clerk.load();
            }

            if (clerk.user) {
                const email = clerk.user.emailAddresses[0]?.emailAddress || '';
                const role = clerk.user.publicMetadata?.role || 'student';

                currentUser = {
                    id: clerk.user.id,
                    email: email,
                    name: clerk.user.fullName || clerk.user.firstName || email.split('@')[0],
                    picture: clerk.user.imageUrl,
                    role: role
                };

                // Detect Counselor: check role or official counselor emails list
                const isCounselor = role === 'counselor' ||
                    COUNSELOR_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase()) ||
                    email.toLowerCase().includes('counselor') ||
                    email.toLowerCase().includes('admin');

                if (isCounselor) {
                    userRole = 'counselor';
                    await loadCounselorDashboard();
                } else {
                    userRole = 'student';
                    await loadStudentDashboard();
                }
            } else {
                showLoginScreen();
                mountClerkAuth();
            }
        } catch (err) {
            console.error('Error initializing Clerk:', err);
            showError('Unable to load authentication. Please refresh and try again.');
        }
    } else {
        showError('Clerk authentication SDK failed to load. Please check your internet connection.');
    }
});

// ── MOUNT CLERK AUTH UI ────────────────────────────────────
function mountClerkAuth() {
    const container = document.getElementById('clerkAuthContainer');
    if (!container || !clerk) return;

    container.innerHTML = '';
    clerk.mountSignIn(container, {
        appearance: {
            variables: {
                colorPrimary: '#00B4D8',
                colorText: '#0A2342',
                borderRadius: '12px'
            }
        }
    });
}

// ── SIGN OUT HANDLER ───────────────────────────────────────
function signOut() {
    if (clerk) {
        clerk.signOut().then(() => {
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}

// ── SCREEN SWITCHERS ───────────────────────────────────────
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('counselorScreen').style.display = 'none';
}

function showLoadingScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('counselorScreen').style.display = 'none';
}

function showError(msg) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('counselorScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';

    if (msg) {
        document.getElementById('errorMessage').textContent = msg;
    }
}

function showNotRegistered(message) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('counselorScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'flex';
    document.getElementById('errorIcon').textContent = '🔒';
    document.getElementById('errorTitle').textContent = 'Account Not Registered';
    document.getElementById('errorMessage').textContent = message ||
        'Your email is not registered with EV Overseas. Please contact us to get started on your study abroad journey.';
    document.getElementById('retryBtn').textContent = 'Contact EV Overseas';
    document.getElementById('retryBtn').onclick = function () {
        window.location.href = 'index.html#contact';
    };
}

// ═══════════════════════════════════════════════════════════
// COUNSELOR DASHBOARD LOGIC
// ═══════════════════════════════════════════════════════════

async function loadCounselorDashboard() {
    showLoadingScreen();

    try {
        const url = `${APPS_SCRIPT_URL}?action=getAllStudents`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.students) {
            allStudentsData = data.students;
            renderCounselorDashboard();
        } else {
            showError(data.message || 'Failed to fetch student roster for counselor.');
        }
    } catch (err) {
        console.error('Error loading counselor data:', err);
        showError('Unable to load counselor dashboard data.');
    }
}

function renderCounselorDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('counselorScreen').style.display = 'block';

    // Set Counselor Avatar
    const avatar = document.getElementById('counselorAvatar');
    if (currentUser.picture) {
        avatar.src = currentUser.picture;
        avatar.style.display = 'block';
    }

    // Populate Student Select Dropdown
    const select = document.getElementById('counselorStudentSelect');
    select.innerHTML = '<option value="">-- Choose a Student to Edit --</option>' +
        allStudentsData.map((s, idx) => `
            <option value="${idx}">
                ${s.name} (${s.email}) — ${s.applications ? s.applications.length : 0} Application(s)
            </option>
        `).join('');

    select.onchange = function (e) {
        const val = e.target.value;
        if (val !== '') {
            selectStudentForCounselor(parseInt(val));
        } else {
            document.getElementById('counselorEditPanel').style.display = 'none';
        }
    };

    // Render Student Table
    renderCounselorTable();
}

function renderCounselorTable() {
    const tbody = document.getElementById('counselorStudentTableBody');
    if (!tbody) return;

    if (allStudentsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 16px; text-align: center;">No students found in Google Sheet database.</td></tr>';
        return;
    }

    tbody.innerHTML = allStudentsData.map((student, idx) => {
        const primaryApp = (student.applications && student.applications.length > 0) ? student.applications[0] : {};
        const stepNum = primaryApp.currentStep || 1;
        const status = primaryApp.overallStatus || 'Active';

        return `
            <tr style="border-bottom: 1px solid var(--dash-border-light);">
                <td style="padding: 12px; font-weight: 600;">${student.name || 'Student'}</td>
                <td style="padding: 12px; color: var(--dash-text-muted);">${student.email}</td>
                <td style="padding: 12px;">${primaryApp.university || 'N/A'} <br><span style="font-size: 0.8rem; color: var(--dash-text-muted);">${primaryApp.course || ''}</span></td>
                <td style="padding: 12px;"><span class="badge badge-submitted">Step ${stepNum} of 6</span></td>
                <td style="padding: 12px;"><span class="badge badge-${getStatusBadgeClass(status)}">${status}</span></td>
                <td style="padding: 12px;">
                    <button class="btn btn--black btn--sm" onclick="selectStudentForCounselor(${idx})" style="padding: 6px 12px; border-radius: 6px; font-size: 0.85rem;">
                        ✏️ Manage
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function selectStudentForCounselor(studentIdx) {
    selectedStudentObj = allStudentsData[studentIdx];
    if (!selectedStudentObj || !selectedStudentObj.applications || selectedStudentObj.applications.length === 0) {
        alert('This student has no applications registered in the Google Sheet.');
        return;
    }

    // Set dropdown selection
    document.getElementById('counselorStudentSelect').value = studentIdx;

    const editPanel = document.getElementById('counselorEditPanel');
    editPanel.style.display = 'block';

    const app = selectedStudentObj.applications[0];
    const currentStep = app.currentStep || 1;

    // Highlight Step Buttons
    const stepBtns = document.querySelectorAll('.step-select-btn');
    stepBtns.forEach(btn => {
        const step = parseInt(btn.getAttribute('data-step'));
        if (step === currentStep) {
            btn.style.background = '#00B4D8';
            btn.style.color = '#FFF';
            btn.style.borderColor = '#00B4D8';
        } else if (step < currentStep) {
            btn.style.background = '#10B981';
            btn.style.color = '#FFF';
            btn.style.borderColor = '#10B981';
        } else {
            btn.style.background = '#F1F5F9';
            btn.style.color = '#475569';
            btn.style.borderColor = '#E2E8F0';
        }

        btn.onclick = function () {
            app.currentStep = step;
            selectStudentForCounselor(studentIdx);
        };
    });

    // Populate overall status dropdown
    document.getElementById('counselorOverallStatus').value = app.overallStatus || 'Active';

    // Populate notes
    document.getElementById('counselorNotesInput').value = app.notes || selectedStudentObj.notes || '';

    // Populate document checklist
    renderCounselorDocChecklist(app);

    // Save button event
    const saveBtn = document.getElementById('saveCounselorChangesBtn');
    saveBtn.onclick = function () {
        saveCounselorChanges(app);
    };

    // Scroll smoothly to edit panel
    editPanel.scrollIntoView({ behavior: 'smooth' });
}

function renderCounselorDocChecklist(app) {
    const container = document.getElementById('counselorDocChecklist');
    if (!container) return;

    const defaultDocs = [
        'Passport Copy',
        'Statement of Purpose (SOP)',
        'Letters of Recommendation (LOR)',
        'Academic Transcripts',
        'IELTS / English Test Score',
        'Bank Statement / Financial Docs',
        'Offer Letter',
        'Visa Application Docs'
    ];

    const existingDocs = app.documents || [];

    const docItems = defaultDocs.map(docName => {
        const found = existingDocs.find(d => d.name.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(d.name.toLowerCase()));
        const status = found ? found.status : 'Pending';

        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--dash-border-light);">
                <span style="font-weight: 500;">${getDocIcon(docName)} ${docName}</span>
                <select class="doc-status-select" data-docname="${docName}" style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--dash-border);">
                    <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending ⏳</option>
                    <option value="Uploaded" ${status === 'Uploaded' ? 'selected' : ''}>Uploaded 📤</option>
                    <option value="Verified" ${status === 'Verified' ? 'selected' : ''}>Verified ✅</option>
                </select>
            </div>
        `;
    });

    container.innerHTML = docItems.join('');
}

async function saveCounselorChanges(app) {
    const msgDiv = document.getElementById('counselorSaveMessage');
    const saveBtn = document.getElementById('saveCounselorChangesBtn');

    saveBtn.disabled = true;
    msgDiv.textContent = '⏳ Saving updates to Google Sheets...';
    msgDiv.style.color = '#00B4D8';

    // Gather doc statuses
    const docSelects = document.querySelectorAll('.doc-status-select');
    const updatedDocs = Array.from(docSelects).map(sel => ({
        name: sel.getAttribute('data-docname'),
        status: sel.value
    }));

    const payload = {
        applicationId: app.applicationId,
        currentStep: parseInt(app.currentStep),
        overallStatus: document.getElementById('counselorOverallStatus').value,
        notes: document.getElementById('counselorNotesInput').value,
        documents: updatedDocs
    };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (resData.success) {
            msgDiv.textContent = '✅ Updated successfully! Student dashboard will reflect these changes.';
            msgDiv.style.color = '#10B981';
            setTimeout(() => {
                loadCounselorDashboard();
            }, 1500);
        } else {
            msgDiv.textContent = '⚠️ ' + (resData.message || 'Failed to save updates.');
            msgDiv.style.color = '#EF4444';
        }
    } catch (err) {
        console.error('Error saving updates:', err);
        msgDiv.textContent = '❌ Connection error while saving updates.';
        msgDiv.style.color = '#EF4444';
    } finally {
        saveBtn.disabled = false;
    }
}

// ═══════════════════════════════════════════════════════════
// STUDENT DASHBOARD LOGIC (Read-Only)
// ═══════════════════════════════════════════════════════════

async function loadStudentDashboard() {
    showLoadingScreen();

    try {
        const url = `${APPS_SCRIPT_URL}?email=${encodeURIComponent(currentUser.email)}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Network response error');

        const data = await response.json();

        if (data.error) {
            showNotRegistered(data.message || data.error);
            return;
        }

        if (!data.success) {
            showNotRegistered(data.message || 'Unable to load dashboard data.');
            return;
        }

        studentData = data;
        currentApplicationIndex = 0;
        renderStudentDashboard();
    } catch (err) {
        console.error('Error loading student dashboard:', err);
        showError('Unable to connect to EV Overseas server. Please try again.');
    }
}

function renderStudentDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('errorScreen').style.display = 'none';
    document.getElementById('counselorScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';

    const student = studentData.student;
    const applications = studentData.applications;

    document.getElementById('welcomeName').textContent = `Welcome back, ${student.name || currentUser.name}!`;

    const avatar = document.getElementById('userAvatar');
    if (currentUser.picture) {
        avatar.src = currentUser.picture;
        avatar.style.display = 'block';
    }

    renderApplicationSelector(applications);
    displayApplication(currentApplicationIndex);
    renderCounselor(student);
}

function renderApplicationSelector(applications) {
    const header = document.querySelector('.dashboard-header');
    let selectorDiv = document.getElementById('applicationSelector');

    if (!selectorDiv) {
        selectorDiv = document.createElement('div');
        selectorDiv.id = 'applicationSelector';
        selectorDiv.className = 'application-selector';
        header.insertBefore(selectorDiv, header.firstChild);
    }

    if (applications.length === 1) {
        selectorDiv.innerHTML = `
            <div class="single-app-badge">
                <span class="app-badge-icon">🎓</span>
                <div class="app-badge-info">
                    <div class="app-badge-university">${applications[0].university}</div>
                    <div class="app-badge-meta">${applications[0].country} • ${applications[0].intake}</div>
                </div>
            </div>
        `;
    } else {
        selectorDiv.innerHTML = `
            <label for="appSelector" class="app-selector-label">
                <span>📚</span> Select Application:
            </label>
            <select id="appSelector" class="app-selector-dropdown">
                ${applications.map((app, index) => `
                    <option value="${index}" ${index === currentApplicationIndex ? 'selected' : ''}>
                        ${app.university} - ${app.country} (${app.overallStatus})
                    </option>
                `).join('')}
            </select>
            <div class="app-selector-count">${applications.length} Applications</div>
        `;

        const selector = document.getElementById('appSelector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                currentApplicationIndex = parseInt(e.target.value);
                displayApplication(currentApplicationIndex);
            });
        }
    }
}

function displayApplication(index) {
    const app = studentData.applications[index];

    const metaHtml = [];
    if (app.university) metaHtml.push(`<span class="meta-badge">🎓 ${app.university}</span>`);
    if (app.country) metaHtml.push(`<span class="meta-badge">🌍 ${app.country}</span>`);
    if (app.intake) metaHtml.push(`<span class="meta-badge">📅 ${app.intake}</span>`);
    document.getElementById('welcomeMeta').innerHTML = metaHtml.join('');

    const currentStep = parseInt(app.currentStep) || 1;
    const totalSteps = 6;
    const progress = Math.round((currentStep / totalSteps) * 100);

    renderStatusCards(app, currentStep, progress);
    renderProgressTracker(currentStep, app.milestones, progress);
    renderProgressChart(currentStep, totalSteps);
    renderDocuments(app.documents);
    renderTimeline(app.milestones, currentStep);
}

function renderStatusCards(app, currentStep, progress) {
    const completedDocs = app.documents ? app.documents.filter(d =>
        d.status && (d.status.toLowerCase() === 'approved' || d.status.toLowerCase() === 'verified' || d.status.toLowerCase() === 'submitted')
    ).length : 0;

    const totalDocs = app.documents ? app.documents.length : 0;

    const container = document.getElementById('statusCards');
    container.innerHTML = `
        <div class="status-card fade-in stagger-1" style="--card-accent: var(--dash-accent);">
            <div class="status-card-icon">📊</div>
            <div class="status-card-label">Overall Progress</div>
            <div class="status-card-value">${progress}%</div>
        </div>
        <div class="status-card fade-in stagger-2" style="--card-accent: var(--dash-success);">
            <div class="status-card-icon">🎯</div>
            <div class="status-card-label">Current Step</div>
            <div class="status-card-value">Step ${currentStep} of 6</div>
        </div>
        <div class="status-card fade-in stagger-3" style="--card-accent: var(--dash-warning);">
            <div class="status-card-icon">📄</div>
            <div class="status-card-label">Documents Verified</div>
            <div class="status-card-value">${completedDocs} / ${totalDocs}</div>
        </div>
        <div class="status-card fade-in stagger-4" style="--card-accent: ${getStatusColor(app.overallStatus)};">
            <div class="status-card-icon">${getStatusIcon(app.overallStatus)}</div>
            <div class="status-card-label">Status</div>
            <div class="status-card-value">
                <span class="badge badge-${getStatusBadgeClass(app.overallStatus)}">${app.overallStatus || 'Active'}</span>
            </div>
        </div>
    `;
}

function renderProgressTracker(currentStep, milestones, progress) {
    const fill = document.getElementById('progressFill');
    const percent = document.getElementById('progressPercent');
    setTimeout(() => {
        fill.style.width = `${progress}%`;
    }, 300);
    percent.textContent = `${progress}% Complete`;

    const stepsContainer = document.getElementById('stepsGrid');
    stepsContainer.innerHTML = JOURNEY_STEPS.map(step => {
        let status = 'pending';
        if (step.number < currentStep) status = 'completed';
        else if (step.number === currentStep) status = 'active';

        const milestone = milestones ? milestones.find(m => parseInt(m.stepNumber) === step.number) : null;
        const dateStr = milestone && milestone.date ? formatDate(milestone.date) : '';

        return `
            <div class="step-item ${status}">
                <div class="step-circle">
                    ${status === 'completed' ? '✓' : step.number}
                </div>
                <div class="step-name">${step.name}</div>
                ${dateStr ? `<div class="step-date">${dateStr}</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderProgressChart(currentStep, totalSteps) {
    const ctx = document.getElementById('progressChartCanvas');
    if (!ctx) return;

    if (progressChart) {
        progressChart.destroy();
    }

    const completed = currentStep - 1;
    const inProgress = 1;
    const remaining = totalSteps - currentStep;

    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Remaining'],
            datasets: [{
                data: [completed, inProgress, remaining],
                backgroundColor: ['#22C55E', '#00B4D8', '#1E293B'],
                borderWidth: 2,
                cutout: '72%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });
}

function renderDocuments(documents) {
    const container = document.getElementById('documentsList');

    if (!documents || documents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <p>No documents submitted yet. Your counselor will update this as your application progresses.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = documents.map(doc => {
        const statusClass = getDocStatusClass(doc.status);
        const icon = getDocIcon(doc.name);

        return `
            <div class="doc-item">
                <div class="doc-info">
                    <span class="doc-icon">${icon}</span>
                    <div>
                        <div class="doc-name">${doc.name}</div>
                        ${doc.submittedDate ? `<div class="doc-date">${formatDate(doc.submittedDate)}</div>` : ''}
                    </div>
                </div>
                <span class="badge badge-${statusClass}">${doc.status}</span>
            </div>
        `;
    }).join('');
}

function renderTimeline(milestones, currentStep) {
    const container = document.getElementById('timelineContainer');

    const items = (milestones && milestones.length > 0) ? milestones : JOURNEY_STEPS.map(s => ({
        stepNumber: s.number,
        stepName: s.name,
        status: s.number < currentStep ? 'Completed' : (s.number === currentStep ? 'In Progress' : 'Pending'),
        date: '',
        notes: ''
    }));

    container.innerHTML = items.map(item => {
        const stepNum = parseInt(item.stepNumber) || 0;
        let status = 'pending';
        if (item.status && item.status.toLowerCase() === 'completed') status = 'completed';
        else if (item.status && item.status.toLowerCase() === 'in progress') status = 'active';
        else if (stepNum < currentStep) status = 'completed';
        else if (stepNum === currentStep) status = 'active';

        return `
            <div class="timeline-item ${status}">
                <div class="timeline-dot"></div>
                <div class="timeline-title">${item.stepName}</div>
                ${item.date ? `<div class="timeline-meta">📅 ${formatDate(item.date)}</div>` : ''}
                <span class="badge badge-${status === 'completed' ? 'approved' : (status === 'active' ? 'submitted' : 'pending')}" style="margin-top: 4px;">${item.status || (status === 'completed' ? 'Completed' : (status === 'active' ? 'In Progress' : 'Pending'))}</span>
                ${item.notes ? `<div class="timeline-notes">"${item.notes}"</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderCounselor(student) {
    const container = document.getElementById('counselorContainer');

    const name = student.counselorName || 'EV Overseas Team';
    const email = student.counselorEmail || 'info@evoverseas.com';
    const phone = (student.counselorPhone || '+919666963756').toString();
    const initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

    const phoneDisplay = phone.replace(/[\s-]/g, '');
    const whatsappPhone = phoneDisplay.replace(/^\+/, '');

    container.innerHTML = `
        <div class="counselor-card">
            <div class="counselor-avatar">${initials}</div>
            <div class="counselor-info">
                <h3>${name}</h3>
                <p>Your Dedicated Counselor</p>
                <p style="font-size: 0.78rem; color: var(--dash-accent);">${phoneDisplay}</p>
            </div>
        </div>
        <div class="quick-actions">
            <a href="https://wa.me/${whatsappPhone}?text=Hi, I'm ${encodeURIComponent(student.name || 'a student')} and I have a query about my application." 
               class="action-btn action-btn-whatsapp" target="_blank" rel="noopener">
                💬 WhatsApp
            </a>
            <a href="mailto:${email}?subject=Application Query - ${student.name || 'Student'}" 
               class="action-btn action-btn-email">
                ✉️ Email
            </a>
            <a href="tel:${phoneDisplay}" class="action-btn action-btn-call">
                📞 Call
            </a>
            <a href="index.html" class="action-btn action-btn-website">
                🌐 Website
            </a>
        </div>
    `;
}

// ── UTILITY HELPERS ────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        let date;
        if (typeof dateStr === 'string' && /^\d{2}-\d{4}$/.test(dateStr)) {
            return dateStr;
        } else if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            date = new Date(`${year}-${month}-${day}`);
        } else {
            date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) return dateStr;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

function getStatusColor(status) {
    if (!status) return 'var(--dash-success)';
    switch (status.toLowerCase()) {
        case 'active': return 'var(--dash-success)';
        case 'completed': return 'var(--dash-info)';
        case 'on hold': return 'var(--dash-warning)';
        case 'cancelled': return '#EF4444';
        default: return 'var(--dash-success)';
    }
}

function getStatusIcon(status) {
    if (!status) return '✅';
    switch (status.toLowerCase()) {
        case 'active': return '✅';
        case 'completed': return '🎉';
        case 'on hold': return '⏸️';
        case 'cancelled': return '❌';
        default: return '✅';
    }
}

function getStatusBadgeClass(status) {
    if (!status) return 'active';
    switch (status.toLowerCase()) {
        case 'active': return 'active';
        case 'completed': return 'completed';
        case 'on hold': return 'on-hold';
        case 'cancelled': return 'cancelled';
        default: return 'active';
    }
}

function getDocStatusClass(status) {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
        case 'submitted': return 'submitted';
        case 'approved': return 'approved';
        case 'verified': return 'approved';
        case 'pending': return 'pending';
        case 'under review': return 'review';
        default: return 'pending';
    }
}

function getDocIcon(docName) {
    if (!docName) return '📄';
    const name = docName.toLowerCase();
    if (name.includes('passport')) return '🛂';
    if (name.includes('sop') || name.includes('statement')) return '📝';
    if (name.includes('lor') || name.includes('recommendation')) return '📧';
    if (name.includes('transcript') || name.includes('marksheet')) return '📜';
    if (name.includes('resume') || name.includes('cv')) return '📋';
    if (name.includes('ielts') || name.includes('toefl') || name.includes('gre') || name.includes('gmat')) return '📊';
    if (name.includes('photo') || name.includes('image')) return '🖼️';
    if (name.includes('financial') || name.includes('bank') || name.includes('loan')) return '💰';
    if (name.includes('visa')) return '🛂';
    if (name.includes('offer') || name.includes('admission')) return '🎓';
    return '📄';
}

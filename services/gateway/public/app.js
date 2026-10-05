/**
 * Maker Space Booker - Modern SaaS Client Logic
 * Course: Agile Project Development with Scrum (DevOps Demo)
 * Vanilla JS - Zero dependencies, zero build step, zero backend required.
 */

// Machine Catalog
const MACHINES = [
  {
    id: "m1",
    name: "3D Printer",
    model: "Prusa MK4 FDM",
    category: "Additive Manufacturing",
    needsCert: true,
    certName: "FDM Rapid Prototyping Safety",
    description: "High-precision fused deposition modeling printer with HEPA enclosure. Requires nozzle thermal calibration and material safety certification.",
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/><path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><circle cx="6" cy="14" r="1"/></svg>`
  },
  {
    id: "m2",
    name: "Laser Cutter",
    model: "Boss Laser LS-1416 60W",
    category: "Cutting & Engraving",
    needsCert: true,
    certName: "Class 4 Optical Laser Safety",
    description: "CO2 high-energy optical cutter with dual fume extraction. Mandatory operator training on flammable substrates and emergency shutoff.",
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`
  },
  {
    id: "m3",
    name: "Workbench",
    model: "Station 04 - Electronics & Assembly",
    category: "Manual Assembly",
    needsCert: false,
    certName: "Open Access (No Cert Needed)",
    description: "ESD-protected electronic soldering bench equipped with digital multimeter, oscilloscope, and precision hand tools. Open to all students.",
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
  }
];

// User Directory
const USERS = {
  ashley: {
    id: "ashley",
    name: "Ashley",
    email: "ashley@university.edu",
    role: "Certified Lab Specialist",
    certifications: ["m1", "m2"],
    avatarInitials: "AS"
  },
  justin: {
    id: "justin",
    name: "Justin",
    email: "justin@university.edu",
    role: "Undergraduate Student (Novice)",
    certifications: [],
    avatarInitials: "JU"
  },
  // Backward compatibility aliases
  alice: {
    id: "ashley",
    name: "Ashley",
    email: "ashley@university.edu",
    role: "Certified Lab Specialist",
    certifications: ["m1", "m2"],
    avatarInitials: "AS"
  },
  bob: {
    id: "justin",
    name: "Justin",
    email: "justin@university.edu",
    role: "Undergraduate Student (Novice)",
    certifications: [],
    avatarInitials: "JU"
  }
};

// Time Slots
const TIME_SLOTS = [
  "09:00 - 10:30 AM",
  "10:30 - 12:00 PM",
  "01:00 - 02:30 PM",
  "02:30 - 04:00 PM",
  "04:00 - 05:30 PM"
];

// Helper Date Functions
function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

// In-Memory Seed Reservations
let reservations = [
  {
    id: "RES-1042",
    machineId: "m1",
    machineName: "3D Printer",
    userId: "ashley",
    userName: "Ashley",
    date: getTomorrowDateString(),
    timeSlot: "09:00 - 10:30 AM",
    createdAt: "Initial Seed"
  }
];

// Active State
let currentUser = "ashley";
const selectedSlotsByMachine = {
  m1: "09:00 - 10:30 AM",
  m2: "10:30 - 12:00 PM",
  m3: "01:00 - 02:30 PM"
};

// Initial DOM Setup
document.addEventListener("DOMContentLoaded", () => {
  initScrollProgressBar();
  initMobileMenu();
  initScrollAnimations();
  initMetricCounterAnimations();

  // If on index.html
  if (document.getElementById("machines-grid")) {
    updatePersonaDisplay();
    renderMachineCards();
    renderReservationsList();
  }

  // If on pipeline.html
  if (document.querySelector(".dark-editor-card")) {
    initPipelineScrollSpy();
  }
});

/* ==========================================================================
   GLOBAL UTILITIES
   ========================================================================== */

// Top Scroll Progress Bar
function initScrollProgressBar() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / (docHeight || 1)) * 100;
    bar.style.width = `${progress}%`;
  });
}

// Mobile Hamburger Menu
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", () => {
    navMenu.classList.toggle("mobile-open");
  });
}

// Scroll Reveal Animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// Metric Count-Up Animation
function initMetricCounterAnimations() {
  const counters = document.querySelectorAll(".counter-value");
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute("data-target"));
        const prefix = el.getAttribute("data-prefix") || "";
        const suffix = el.getAttribute("data-suffix") || "";
        let count = 0;
        const step = target / 40;

        const updateTimer = setInterval(() => {
          count += step;
          if (count >= target) {
            el.textContent = `${prefix}${target}${suffix}`;
            clearInterval(updateTimer);
          } else {
            el.textContent = `${prefix}${Math.round(count * 10) / 10}${suffix}`;
          }
        }, 30);

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */

function showToast(type, title, message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  const iconSvg = type === "success" 
    ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div style="flex-grow:1;">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Dismiss">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove after 4.5s
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

/* ==========================================================================
   PAGE 1: BOOKING & PERSONA LOGIC
   ========================================================================== */

// Switch Segmented Persona (Alice / Bob)
window.selectUserPersona = function(userId) {
  currentUser = userId;

  // Update button classes
  document.querySelectorAll(".segmented-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.user === userId);
  });

  updatePersonaDisplay();
  renderMachineCards();
};

function updatePersonaDisplay() {
  const user = USERS[currentUser];
  if (!user) return;

  const nameEl = document.getElementById("persona-name");
  const roleEl = document.getElementById("persona-role");
  const chipsEl = document.getElementById("persona-chips");

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;

  if (chipsEl) {
    if (user.certifications.length === 0) {
      chipsEl.innerHTML = `<span class="badge badge-accent">
        <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        No Safety Certifications (Novice)
      </span>`;
    } else {
      const badges = user.certifications.map(cid => {
        const m = MACHINES.find(item => item.id === cid);
        return `<span class="badge badge-success">
          <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Certified: ${m ? m.name : cid}
        </span>`;
      }).join(" ");
      chipsEl.innerHTML = badges;
    }
  }
}

// Render Machine Cards with Pill Slot Buttons
function renderMachineCards() {
  const grid = document.getElementById("machines-grid");
  if (!grid) return;

  const user = USERS[currentUser];
  const tomorrowStr = getTomorrowDateString();

  grid.innerHTML = MACHINES.map(m => {
    const isCertified = !m.needsCert || user.certifications.includes(m.id);

    // Badges
    const certBadge = m.needsCert
      ? `<span class="badge badge-accent"><svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Certification Required</span>`
      : `<span class="badge badge-success"><svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/></svg> Open Access</span>`;

    // Eligibility banner
    let eligibilityBanner = "";
    if (!m.needsCert) {
      eligibilityBanner = `<div class="eligibility-banner eligibility-open">
        <svg style="width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        General Access: ${user.name} is eligible to book without safety training.
      </div>`;
    } else if (isCertified) {
      eligibilityBanner = `<div class="eligibility-banner eligibility-pass">
        <svg style="width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Certified Clearance: ${user.name} holds verified ${m.name} safety credential.
      </div>`;
    } else {
      eligibilityBanner = `<div class="eligibility-banner eligibility-fail">
        <svg style="width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Clearance Missing: ${user.name} is not certified for this equipment.
      </div>`;
    }

    // Selected Slot for this machine
    const activeSlot = selectedSlotsByMachine[m.id] || TIME_SLOTS[0];

    // Build Slot Pills
    const slotPills = TIME_SLOTS.map(slot => {
      // Check collision
      const isBooked = reservations.some(r => r.machineId === m.id && r.date === tomorrowStr && r.timeSlot === slot);
      const isSelected = activeSlot === slot;

      return `
        <button 
          type="button" 
          class="slot-pill-btn ${isSelected ? 'selected' : ''}" 
          ${isBooked ? 'disabled title="Slot already reserved"' : ''}
          onclick="selectSlot('${m.id}', '${slot}')"
        >
          ${slot} ${isBooked ? '(Booked)' : ''}
        </button>
      `;
    }).join("");

    return `
      <article class="machine-card" id="machine-${m.id}">
        <div>
          <div class="machine-header">
            <div class="tinted-icon-box" aria-hidden="true">
              ${m.iconSvg}
            </div>
            ${certBadge}
          </div>

          <div>
            <h3 class="machine-title">${m.name}</h3>
            <div class="machine-model">${m.model} &bull; ${m.category}</div>
          </div>

          <p class="machine-desc">${m.description}</p>
          ${eligibilityBanner}
        </div>

        <div class="booking-controls">
          <label class="control-label" for="date-${m.id}">Reservation Date</label>
          <input 
            type="date" 
            id="date-${m.id}" 
            class="date-custom-input" 
            value="${tomorrowStr}" 
            min="${getTodayDateString()}" 
            onchange="handleDateChange('${m.id}')"
          />

          <label class="control-label">Available Time Slots</label>
          <div class="slots-pill-group" id="slots-group-${m.id}">
            ${slotPills}
          </div>

          <button 
            type="button" 
            class="btn btn-primary" 
            style="width: 100%; border-radius: var(--radius-md);" 
            onclick="submitBooking('${m.id}')"
          >
            <svg style="width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Reserve ${m.name}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// Select Slot Pill
window.selectSlot = function(machineId, slot) {
  selectedSlotsByMachine[machineId] = slot;
  const group = document.getElementById(`slots-group-${machineId}`);
  if (!group) return;

  group.querySelectorAll(".slot-pill-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.textContent.trim().startsWith(slot));
  });
};

// Date Change Trigger (re-evaluates booked slots)
window.handleDateChange = function(machineId) {
  const dateInput = document.getElementById(`date-${machineId}`);
  if (!dateInput) return;
  const chosenDate = dateInput.value;
  const group = document.getElementById(`slots-group-${machineId}`);
  if (!group) return;

  const activeSlot = selectedSlotsByMachine[machineId] || TIME_SLOTS[0];

  group.innerHTML = TIME_SLOTS.map(slot => {
    const isBooked = reservations.some(r => r.machineId === machineId && r.date === chosenDate && r.timeSlot === slot);
    const isSelected = activeSlot === slot;
    return `
      <button 
        type="button" 
        class="slot-pill-btn ${isSelected ? 'selected' : ''}" 
        ${isBooked ? 'disabled title="Slot already reserved"' : ''}
        onclick="selectSlot('${machineId}', '${slot}')"
      >
        ${slot} ${isBooked ? '(Booked)' : ''}
      </button>
    `;
  }).join("");
};

// Submit Reservation
window.submitBooking = function(machineId) {
  const machine = MACHINES.find(m => m.id === machineId);
  const user = USERS[currentUser];
  if (!machine || !user) return;

  const dateInput = document.getElementById(`date-${machineId}`);
  const chosenDate = dateInput ? dateInput.value : getTomorrowDateString();
  const chosenSlot = selectedSlotsByMachine[machineId] || TIME_SLOTS[0];

  // RULE 1: Safety Certification Enforcement
  if (machine.needsCert && !user.certifications.includes(machineId)) {
    showToast(
      "danger",
      "Safety Certification Required",
      `Access Denied: ${user.name} is not certified for ${machine.name}. You must complete "${machine.certName}" first.`
    );
    return;
  }

  // RULE 2: Conflict & Collision Check
  const conflict = reservations.find(r => 
    r.machineId === machineId && 
    r.date === chosenDate && 
    r.timeSlot === chosenSlot
  );

  if (conflict) {
    showToast(
      "danger",
      "Time Slot Already Booked",
      `Collision Detected: The ${machine.name} is already booked on ${chosenDate} during ${chosenSlot} by ${conflict.userName}.`
    );
    return;
  }

  // SUCCESS: Add to Ledger
  const newRes = {
    id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
    machineId: machine.id,
    machineName: machine.name,
    userId: user.id,
    userName: user.name,
    date: chosenDate,
    timeSlot: chosenSlot,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  reservations.unshift(newRes);

  showToast(
    "success",
    "Reservation Confirmed!",
    `Success: ${user.name} reserved the ${machine.name} for ${chosenDate} at ${chosenSlot} (${newRes.id}).`
  );

  // Update UI
  renderMachineCards();
  renderReservationsList();
};

// Render In-Memory Reservations List
function renderReservationsList() {
  const listEl = document.getElementById("reservations-list");
  const countBadge = document.getElementById("res-count-badge");
  if (!listEl) return;

  if (countBadge) {
    countBadge.textContent = `${reservations.length} Active`;
  }

  if (reservations.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
        <svg style="width:48px; height:48px; color:var(--border-color); margin-bottom:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p style="font-size:1.05rem; font-weight:600; color:var(--text-primary); margin-bottom:0.25rem;">No Active Bookings</p>
        <p style="font-size:0.9rem;">Choose a machine above to book your first slot.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = reservations.map(res => {
    const isCurrentUser = res.userId === currentUser;
    const m = MACHINES.find(item => item.id === res.machineId);

    return `
      <div class="res-item" id="item-${res.id}">
        <div class="res-left">
          <div class="res-icon">
            ${m ? m.iconSvg : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>'}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <h4 class="res-title">${res.machineName}</h4>
              <span class="badge badge-primary">${res.id}</span>
              ${isCurrentUser ? '<span class="badge badge-success" style="font-size:0.75rem;">Your Booking</span>' : ''}
            </div>
            <div class="res-meta">
              <span><strong>Reserved by:</strong> ${res.userName}</span>
              <span>&bull;</span>
              <span><strong>Date:</strong> ${res.date}</span>
              <span>&bull;</span>
              <span class="badge badge-accent">${res.timeSlot}</span>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          class="btn btn-danger-soft btn-sm" 
          onclick="removeReservation('${res.id}')"
          title="Release this time slot"
        >
          <svg style="width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Cancel Booking
        </button>
      </div>
    `;
  }).join("");
}

// Remove Reservation with Animation
window.removeReservation = function(id) {
  const itemEl = document.getElementById(`item-${id}`);
  if (itemEl) {
    itemEl.classList.add("removing");
  }

  setTimeout(() => {
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      const removed = reservations[index];
      reservations.splice(index, 1);
      showToast("success", "Reservation Cancelled", `Slot for ${removed.machineName} (${removed.date}) has been released.`);
      renderMachineCards();
      renderReservationsList();
    }
  }, 220);
};

/* ==========================================================================
   PAGE 2: PIPELINE PAGE TABS & CODE EDITOR
   ========================================================================== */

const WORKFLOW_SNIPPETS = {
  ci: `name: Continuous Integration
on:
  pull_request:
    branches: [develop, main]

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [monolith, gateway, machine-service, certification-service, reservation-service]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
        working-directory: \${{ matrix.service }}
      - name: Code Quality (ESLint)
        run: npm run lint
        working-directory: \${{ matrix.service }}
      - name: Automated Tests (Jest)
        run: npm test
        working-directory: \${{ matrix.service }}
      - name: Build Container Image
        run: docker build -t maker-\${{ matrix.service }}:test .
        working-directory: \${{ matrix.service }}`,

  cd: `name: Continuous Deployment
on:
  push:
    branches: [main]

jobs:
  deploy-and-smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - name: Build & Publish Container Images
        run: docker compose -f docker-compose.yml build
      - name: Launch Runtime Stack
        run: docker compose up -d
      - name: Synthetic Smoke Tests
        run: |
          sleep 5
          curl -f http://localhost:3000/health || exit 1
          curl -f http://localhost:3001/health || exit 1
          curl -f http://localhost:3002/health || exit 1
          curl -f http://localhost:3003/health || exit 1`
};

window.switchEditorTab = function(fileKey) {
  document.querySelectorAll(".editor-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === fileKey);
  });

  const codeEl = document.getElementById("editor-code-body");
  if (!codeEl) return;

  const raw = WORKFLOW_SNIPPETS[fileKey] || "";
  codeEl.textContent = raw;
};

window.copyEditorCode = function() {
  const codeEl = document.getElementById("editor-code-body");
  const copyBtn = document.getElementById("copy-code-btn");
  if (!codeEl || !copyBtn) return;

  navigator.clipboard.writeText(codeEl.textContent).then(() => {
    copyBtn.innerHTML = `<svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => {
      copyBtn.innerHTML = `<svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy YAML`;
    }, 2000);
  });
};

// Scrollspy for Sticky Pipeline Tabs
function initPipelineScrollSpy() {
  const tabs = document.querySelectorAll(".pipeline-tab-link");
  const sections = Array.from(tabs).map(tab => document.querySelector(tab.getAttribute("href"))).filter(Boolean);

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        tabs.forEach(t => t.classList.toggle("active", t.getAttribute("href") === `#${sec.id}`));
      }
    });
  });
}

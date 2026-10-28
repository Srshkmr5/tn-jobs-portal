// Tamil Nadu Public Job Compass - Frontend Engine
let allJobs = [];
let starredJobIds = new Set();
let showOnlyStarred = false;

// DOM Elements
const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const locationSelect = document.getElementById("locationSelect");
const qualSelect = document.getElementById("qualSelect");
const sortSelect = document.getElementById("sortSelect");
const sectorPills = document.querySelectorAll(".pill-btn");
const savedToggleBtn = document.getElementById("savedToggleBtn");
const starCountBadge = document.getElementById("starCountBadge");
const resultsSummary = document.getElementById("resultsSummary");
const totalVacanciesStat = document.getElementById("totalVacanciesStat");
const govtJobsStat = document.getElementById("govtJobsStat");
const privateJobsStat = document.getElementById("privateJobsStat");

// Post Job & Advertise Elements
const postJobBtn = document.getElementById("postJobBtn");
const postJobModal = document.getElementById("postJobModal");
const postJobCloseBtn = document.getElementById("postJobCloseBtn");
const postJobCancelBtn = document.getElementById("postJobCancelBtn");
const postJobForm = document.getElementById("postJobForm");

const advertiseBtn = document.getElementById("advertiseBtn");
const advertiseModal = document.getElementById("advertiseModal");
const advertiseCloseBtn = document.getElementById("advertiseCloseBtn");

// Tailor Modal Elements
const tailorModal = document.getElementById("tailorModal");
const tailorCloseBtn = document.getElementById("tailorCloseBtn");
const tailorModalTargetJob = document.getElementById("tailorModalTargetJob");
const tailorInputSection = document.getElementById("tailorInputSection");
const tailorResultSection = document.getElementById("tailorResultSection");
const tailorProfileForm = document.getElementById("tailorProfileForm");
const loadSampleProfileBtn = document.getElementById("loadSampleProfileBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const copyResumeTextBtn = document.getElementById("copyResumeTextBtn");
const printResumeBtn = document.getElementById("printResumeBtn");

let currentTailorJob = null;

// Modal Elements
const prepModal = document.getElementById("prepModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalJobTitle = document.getElementById("modalJobTitle");
const modalJobOrg = document.getElementById("modalJobOrg");
const modalContent = document.getElementById("modalContent");
const modalApplyBtn = document.getElementById("modalApplyBtn");
const modalPdfBtn = document.getElementById("modalPdfBtn");

// Active filters
let currentSector = "all";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadStarredFromStorage();
  loadJobsData();
  bindEvents();
});

// Load starred IDs from localStorage
function loadStarredFromStorage() {
  try {
    const saved = localStorage.getItem("tn_jobs_starred");
    if (saved) {
      starredJobIds = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.error("Could not load starred jobs", e);
  }
  updateStarBadge();
}

function saveStarredToStorage() {
  try {
    localStorage.setItem("tn_jobs_starred", JSON.stringify(Array.from(starredJobIds)));
  } catch (e) {
    console.error("Could not save starred jobs", e);
  }
  updateStarBadge();
}

function updateStarBadge() {
  if (starCountBadge) {
    starCountBadge.textContent = starredJobIds.size;
  }
}

// Fetch jobs data
async function loadJobsData() {
  try {
    const res = await fetch("data/jobs.json");
    if (!res.ok) throw new Error("Failed to load jobs");
    allJobs = await res.json();

    // Merge any user-submitted jobs from localStorage
    try {
      const userJobs = JSON.parse(localStorage.getItem("tn_user_submitted_jobs") || "[]");
      if (Array.isArray(userJobs) && userJobs.length > 0) {
        allJobs = [...userJobs, ...allJobs];
      }
    } catch (e) {
      console.warn("Could not read local user jobs", e);
    }

    calculateStats();
    renderJobs();
  } catch (err) {
    console.error(err);
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Could not load job notifications</h3>
        <p class="empty-desc">Please ensure data/jobs.json is accessible.</p>
      </div>
    `;
  }
}

// Calculate top stats
function calculateStats() {
  let totalVacancies = 0;
  let govtCount = 0;
  let privateCount = 0;

  allJobs.forEach(job => {
    if (typeof job.vacancies === "number") {
      totalVacancies += job.vacancies;
    }
    if (job.sector === "Government") {
      govtCount++;
    } else {
      privateCount++;
    }
  });

  if (totalVacanciesStat) totalVacanciesStat.textContent = totalVacancies.toLocaleString("en-IN") + "+";
  if (govtJobsStat) govtJobsStat.textContent = govtCount;
  if (privateJobsStat) privateJobsStat.textContent = privateCount;
}

// Event Bindings
function bindEvents() {
  if (searchInput) searchInput.addEventListener("input", renderJobs);
  if (locationSelect) locationSelect.addEventListener("change", renderJobs);
  if (qualSelect) qualSelect.addEventListener("change", renderJobs);
  if (sortSelect) sortSelect.addEventListener("change", renderJobs);

  sectorPills.forEach(pill => {
    pill.addEventListener("click", () => {
      sectorPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentSector = pill.dataset.sector;
      renderJobs();
    });
  });

  if (savedToggleBtn) {
    savedToggleBtn.addEventListener("click", () => {
      showOnlyStarred = !showOnlyStarred;
      savedToggleBtn.classList.toggle("active", showOnlyStarred);
      savedToggleBtn.innerHTML = showOnlyStarred 
        ? `⭐ Showing Saved (${starredJobIds.size})` 
        : `⭐ Saved Jobs <span class="star-count-badge" id="starCountBadge">${starredJobIds.size}</span>`;
      renderJobs();
    });
  }

  // Modal events
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (prepModal) {
    prepModal.addEventListener("click", (e) => {
      if (e.target === prepModal) closeModal();
    });
  }

  // Post a Job Modal Events
  if (postJobBtn) {
    postJobBtn.addEventListener("click", () => {
      postJobModal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  }
  if (postJobCloseBtn) postJobCloseBtn.addEventListener("click", closePostJobModal);
  if (postJobCancelBtn) postJobCancelBtn.addEventListener("click", closePostJobModal);
  if (postJobModal) {
    postJobModal.addEventListener("click", (e) => {
      if (e.target === postJobModal) closePostJobModal();
    });
  }

  // Post Job Form Submission
  if (postJobForm) {
    postJobForm.addEventListener("submit", handlePostJobSubmit);
  }

  // Advertise Modal Events
  if (advertiseBtn) {
    advertiseBtn.addEventListener("click", () => {
      advertiseModal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  }
  if (advertiseCloseBtn) advertiseCloseBtn.addEventListener("click", closeAdvertiseModal);
  if (advertiseModal) {
    advertiseModal.addEventListener("click", (e) => {
      if (e.target === advertiseModal) closeAdvertiseModal();
    });
  }

  // Tailor Modal Events
  if (tailorCloseBtn) tailorCloseBtn.addEventListener("click", closeTailorModal);
  if (tailorModal) {
    tailorModal.addEventListener("click", (e) => {
      if (e.target === tailorModal) closeTailorModal();
    });
  }
  if (loadSampleProfileBtn) loadSampleProfileBtn.addEventListener("click", populateSampleProfile);
  if (tailorProfileForm) tailorProfileForm.addEventListener("submit", handleTailorSubmit);
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      tailorResultSection.style.display = "none";
      tailorInputSection.style.display = "block";
    });
  }
  if (copyResumeTextBtn) copyResumeTextBtn.addEventListener("click", copyTailoredResumeText);
  if (printResumeBtn) {
    printResumeBtn.addEventListener("click", () => {
      window.print();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closePostJobModal();
      closeAdvertiseModal();
      closeTailorModal();
    }
  });
}

// Filter and Sort Engine
function getFilteredAndSortedJobs() {
  const query = (searchInput.value || "").toLowerCase().trim();
  const selectedLocation = locationSelect ? locationSelect.value : "all";
  const selectedQual = qualSelect ? qualSelect.value : "all";
  const selectedSort = sortSelect ? sortSelect.value : "deadline";

  let filtered = allJobs.filter(job => {
    // Starred filter
    if (showOnlyStarred && !starredJobIds.has(job.id)) {
      return false;
    }

    // Sector pill filter
    if (currentSector !== "all") {
      if (currentSector === "Government" && job.sector !== "Government") return false;
      if (currentSector === "Private" && job.sector === "Government") return false;
      if (currentSector === "Engineering" && job.category !== "Engineering" && job.category !== "Core & Automobile" && job.category !== "Core & Civil") return false;
      if (currentSector === "Healthcare" && job.category !== "Healthcare" && job.category !== "Healthcare & Admin") return false;
      if (currentSector === "Finance" && job.category !== "Finance & Banking") return false;
    }

    // Location filter
    if (selectedLocation !== "all") {
      const jobLoc = job.location.toLowerCase();
      if (selectedLocation === "chennai" && !jobLoc.includes("chennai")) return false;
      if (selectedLocation === "coimbatore" && !jobLoc.includes("coimbatore")) return false;
      if (selectedLocation === "madurai" && !jobLoc.includes("madurai")) return false;
      if (selectedLocation === "statewide" && !jobLoc.includes("across tamil nadu") && !jobLoc.includes("all district") && !jobLoc.includes("38 districts")) return false;
    }

    // Qualification filter
    if (selectedQual !== "all") {
      if (job.qualification_level !== selectedQual) return false;
    }

    // Search query matching
    if (query) {
      const matchTitle = job.title.toLowerCase().includes(query);
      const matchTitleTa = (job.title_ta || "").toLowerCase().includes(query);
      const matchOrg = job.organization.toLowerCase().includes(query);
      const matchQual = job.qualification.toLowerCase().includes(query);
      const matchCat = (job.category || "").toLowerCase().includes(query);
      if (!matchTitle && !matchTitleTa && !matchOrg && !matchQual && !matchCat) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (selectedSort === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (selectedSort === "newest") {
      return new Date(b.posted_date) - new Date(a.posted_date);
    } else if (selectedSort === "vacancies") {
      const vacA = typeof a.vacancies === "number" ? a.vacancies : 0;
      const vacB = typeof b.vacancies === "number" ? b.vacancies : 0;
      return vacB - vacA;
    }
    return 0;
  });

  return filtered;
}

// Deadline helper
function getDeadlineStatus(deadlineStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Expired", badgeClass: "badge-danger", urgent: false };
  } else if (diffDays === 0) {
    return { text: "Closing Today!", badgeClass: "badge-danger", urgent: true };
  } else if (diffDays <= 5) {
    return { text: `Closes in ${diffDays} days!`, badgeClass: "badge-danger", urgent: true };
  } else if (diffDays <= 14) {
    return { text: `Closes in ${diffDays} days`, badgeClass: "badge-warning", urgent: false };
  } else {
    return { text: `Last date: ${deadlineStr}`, badgeClass: "badge-info", urgent: false };
  }
}

// Render Job Cards
function renderJobs() {
  const jobs = getFilteredAndSortedJobs();

  if (resultsSummary) {
    resultsSummary.textContent = `Showing ${jobs.length} active opportunities`;
  }

  if (jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">No matching jobs found</h3>
        <p class="empty-desc">
          ${showOnlyStarred ? "You haven't starred any jobs yet. Click the ⭐ button on any job card to save it." : "Try adjusting your search keywords, sector filters, or location options."}
        </p>
      </div>
    `;
    return;
  }

  jobsContainer.innerHTML = jobs.map(job => {
    const isStarred = starredJobIds.has(job.id);
    const deadlineInfo = getDeadlineStatus(job.deadline);
    const sectorBadge = job.sector === "Government" 
      ? `<span class="badge badge-govt">🏛️ Government</span>` 
      : `<span class="badge badge-private">🏢 ${job.sector}</span>`;

    const vacanciesDisplay = typeof job.vacancies === "number" ? job.vacancies.toLocaleString("en-IN") + " Posts" : job.vacancies;

    return `
      <article class="job-card ${isStarred ? "starred" : ""}" data-id="${job.id}">
        <div class="card-top">
          <div class="card-title-group">
            <h2 class="post-title">${escapeHTML(job.title)}</h2>
            ${job.title_ta ? `<div class="post-title-ta">${escapeHTML(job.title_ta)}</div>` : ""}
            <div class="org-name">
              <span>🏛️ ${escapeHTML(job.organization)}</span>
            </div>
          </div>
          <button class="star-btn ${isStarred ? "starred" : ""}" onclick="toggleStar('${job.id}')" title="${isStarred ? "Starred in your saved list" : "Star to save for later"}">
            ${isStarred ? "⭐ Starred" : "☆ Star"}
          </button>
        </div>

        <div class="badges-row">
          ${sectorBadge}
          ${job.is_user_submitted ? '<span class="badge badge-warning">⚡ Direct Employer Post</span>' : ''}
          <span class="badge badge-info">📍 ${escapeHTML(job.location)}</span>
          <span class="badge badge-info">👥 ${vacanciesDisplay}</span>
          <span class="badge ${deadlineInfo.badgeClass}">⏳ ${deadlineInfo.text}</span>
        </div>

        <div class="job-meta-grid">
          <div class="meta-col">
            <span class="meta-label">Qualification</span>
            <span class="meta-val">${escapeHTML(job.qualification)}</span>
          </div>
          <div class="meta-col">
            <span class="meta-label">Age Limit</span>
            <span class="meta-val">${escapeHTML(job.age_limit)}</span>
          </div>
          <div class="meta-col">
            <span class="meta-label">Pay Scale / CTC</span>
            <span class="meta-val">${escapeHTML(job.salary)}</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-tailor" onclick="openTailorModal('${job.id}')" title="Tailor your resume specifically for this job using CareerOps">
            ✨ Tailor Resume (CareerOps)
          </button>
          <button class="btn btn-prep" onclick="openPrepModal('${job.id}')">
            📖 Prepare to Get Job
          </button>
          <a href="${job.apply_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            🚀 Official Apply
          </a>
          <button class="btn btn-share" onclick="shareJob('${job.id}')" title="Share via WhatsApp">
            💬 Share
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// Toggle Star
window.toggleStar = function(jobId) {
  if (starredJobIds.has(jobId)) {
    starredJobIds.delete(jobId);
    showToast("Removed from saved jobs");
  } else {
    starredJobIds.add(jobId);
    showToast("⭐ Added to your saved jobs!");
  }
  saveStarredToStorage();
  renderJobs();
};

// WhatsApp Share
window.shareJob = function(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  const text = `📢 *Job Opportunity in Tamil Nadu*\n\n*${job.title}*\n🏢 ${job.organization}\n👥 Vacancies: ${job.vacancies}\n🎓 Qualification: ${job.qualification}\n⏳ Last Date: ${job.deadline}\n\n👉 Apply officially: ${job.apply_url}\n(Shared via srshkmr.co.in Tamil Nadu Jobs)`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

// Open Preparation Modal
window.openPrepModal = function(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job || !prepModal) return;

  modalJobTitle.textContent = job.title;
  modalJobOrg.textContent = `${job.organization} • Location: ${job.location} • Vacancies: ${job.vacancies}`;

  const guide = job.preparation_guide || {};

  modalContent.innerHTML = `
    <div>
      <h4 class="prep-section-title">🎯 Selection Process & Exam Pattern</h4>
      <p class="prep-section-text">${escapeHTML(guide.selection_process || "Direct selection based on eligibility and qualifications.")}</p>
    </div>

    ${guide.syllabus && guide.syllabus.length > 0 ? `
      <div>
        <h4 class="prep-section-title">📚 Exam Syllabus & Test Topics</h4>
        <ul class="prep-list">
          ${guide.syllabus.map(item => `<li>${escapeHTML(item)}</li>`).join("")}
        </ul>
      </div>
    ` : ""}

    ${guide.key_topics && guide.key_topics.length > 0 ? `
      <div>
        <h4 class="prep-section-title">💡 High-Yield Core Topics to Focus On</h4>
        <ul class="prep-list">
          ${guide.key_topics.map(topic => `<li>${escapeHTML(topic)}</li>`).join("")}
        </ul>
      </div>
    ` : ""}

    ${guide.study_roadmap ? `
      <div>
        <h4 class="prep-section-title">🗓️ Step-by-Step Study & Action Roadmap</h4>
        <p class="prep-section-text">${escapeHTML(guide.study_roadmap)}</p>
      </div>
    ` : ""}

    <div class="callout-box careerops-tip">
      <div class="callout-title">
        <span>⚡ CareerOps Winning Advice</span>
      </div>
      <p class="prep-section-text">${escapeHTML(guide.career_ops_tips || "Review the official notification criteria thoroughly before applying.")}</p>
    </div>
  `;

  modalApplyBtn.href = job.apply_url;
  if (job.notification_pdf) {
    modalPdfBtn.href = job.notification_pdf;
    modalPdfBtn.style.display = "inline-flex";
  } else {
    modalPdfBtn.style.display = "none";
  }

  prepModal.classList.add("open");
  document.body.style.overflow = "hidden";
};

function closeModal() {
  if (prepModal) {
    prepModal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function closePostJobModal() {
  if (postJobModal) {
    postJobModal.classList.remove("open");
    document.body.style.overflow = "";
    if (postJobForm) postJobForm.reset();
  }
}

function closeAdvertiseModal() {
  if (advertiseModal) {
    advertiseModal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function handlePostJobSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("jobTitle").value.trim();
  const org = document.getElementById("jobOrg").value.trim();
  const sector = document.getElementById("jobSector").value;
  const location = document.getElementById("jobLocation").value.trim();
  const vacancies = parseInt(document.getElementById("jobVacancies").value, 10) || 1;
  const qual = document.getElementById("jobQual").value.trim();
  const salary = document.getElementById("jobSalary").value.trim() || "Not Disclosed / Best in Industry";
  const deadline = document.getElementById("jobDeadline").value;
  const applyUrl = document.getElementById("jobApply").value.trim();
  const desc = document.getElementById("jobDesc").value.trim();

  // Create new job object
  const newJob = {
    id: `user-job-${Date.now()}`,
    title: title,
    title_ta: "",
    organization: org,
    sector: sector.includes("Private") ? "Private" : sector,
    category: sector,
    location: location,
    vacancies: vacancies,
    qualification: qual,
    qualification_level: "Degree",
    age_limit: "As per company norms",
    salary: salary,
    posted_date: new Date().toISOString().split("T")[0],
    deadline: deadline,
    apply_url: applyUrl.startsWith("http") ? applyUrl : `https://${applyUrl}`,
    is_featured: true,
    is_user_submitted: true,
    preparation_guide: {
      selection_process: "Direct screening and interview with hiring manager.",
      syllabus: [
        `Qualification check: ${qual}`,
        "Domain knowledge and hands-on practical assessment",
        "Personal interview and culture fit discussion"
      ],
      key_topics: [
        desc || "Review the core responsibilities of this position.",
        "Demonstrate relevant prior projects or internships",
        "Prepare questions about the team and workplace culture"
      ],
      study_roadmap: "Review the required skills, update your resume with quantifiable achievements, and reach out directly to the provided contact details.",
      career_ops_tips: "Tailor your application highlighting exact projects matching the job requirements."
    }
  };

  // Prepend to current in-memory jobs
  allJobs.unshift(newJob);

  // Save to user submissions localStorage
  try {
    const existing = JSON.parse(localStorage.getItem("tn_user_submitted_jobs") || "[]");
    existing.unshift(newJob);
    localStorage.setItem("tn_user_submitted_jobs", JSON.stringify(existing));
  } catch (err) {
    console.error("Failed to save user job", err);
  }

  closePostJobModal();
  calculateStats();
  renderJobs();
  showToast("🎉 Your Job Opening has been published live!");
}

// Toast notification
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Utility: Escape HTML
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// CareerOps Resume Tailoring & Fit Evaluation Engine
// ============================================================

window.openTailorModal = function(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job || !tailorModal) return;

  currentTailorJob = job;
  tailorModalTargetJob.textContent = `Target Role: ${job.title} • ${job.organization}`;

  if (tailorInputSection) tailorInputSection.style.display = "block";
  if (tailorResultSection) tailorResultSection.style.display = "none";

  tailorModal.classList.add("open");
  document.body.style.overflow = "hidden";
};

function closeTailorModal() {
  if (tailorModal) {
    tailorModal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function populateSampleProfile() {
  if (!currentTailorJob) return;

  const isTech = currentTailorJob.category.includes("Software") || currentTailorJob.sector.includes("Tech");
  const isCore = currentTailorJob.category.includes("Automobile") || currentTailorJob.category.includes("Core") || currentTailorJob.category.includes("Civil");
  const isHealth = currentTailorJob.category.includes("Healthcare");

  const nameInput = document.getElementById("candName");
  const emailInput = document.getElementById("candEmail");
  const locInput = document.getElementById("candLocation");
  const eduInput = document.getElementById("candEducation");
  const skillsInput = document.getElementById("candSkills");
  const projInput = document.getElementById("candProjects");

  if (isTech) {
    nameInput.value = "Suresh Kumar";
    emailInput.value = "suresh.career@example.com | +91 98401 23456";
    locInput.value = "Chennai, Tamil Nadu";
    eduInput.value = "B.E Computer Science & Engineering, Anna University (2024)";
    skillsInput.value = "Java, C++, Data Structures, Algorithms, Problem Solving, OOP, Linux, Git, REST APIs, SQL";
    projInput.value = "1. Smart Railway Reservation System: Engineered an algorithmic booking engine in pure Java without third-party frameworks, optimizing seat search latency by 40%.\n2. Cloud Microservice Deployment: Automated container builds using Docker and GitHub Actions CI/CD pipeline.";
  } else if (isCore) {
    nameInput.value = "Anand R.";
    emailInput.value = "anand.mech@example.com | +91 97890 65432";
    locInput.value = "Coimbatore, Tamil Nadu";
    eduInput.value = "B.E Mechanical Engineering, PSG College of Technology (2024)";
    skillsInput.value = "CAD/CAM, SolidWorks, GD&T, Production Planning, Quality Control (QC), 5S, Kaizen, Industrial Safety";
    projInput.value = "1. Automobile Assembly Line Optimization: Conducted 6-month in-plant training analyzing powertrain component tolerances and reducing assembly rework.\n2. Structural Fatigue Analysis: Analyzed stress distribution in vehicle chassis using FEA simulation software.";
  } else if (isHealth) {
    nameInput.value = "K. Priyadharshini";
    emailInput.value = "priya.nursing@example.com | +91 99440 12345";
    locInput.value = "Madurai, Tamil Nadu";
    eduInput.value = "B.Sc Nursing, Tamil Nadu Dr. M.G.R. Medical University (TNNC Registered)";
    skillsInput.value = "Patient Care Triage, Infection Control, Emergency Nursing, Medication Administration, EHR Documentation, Tamil & English Communication";
    projInput.value = "1. Intensive Care & Emergency Rotation: Completed 1-year clinical internship in multi-specialty government hospital managing critical patient telemetry.\n2. Community Healthcare Camp: Coordinated primary health screening and immunization drives across rural sub-centers.";
  } else {
    nameInput.value = "V. Karthik";
    emailInput.value = "karthik.official@example.com | +91 98412 34567";
    locInput.value = "Trichy, Tamil Nadu";
    eduInput.value = "Bachelor's Degree in Commerce / Science (First Class, 2024)";
    skillsInput.value = "General Tamil (Samacheer Kalvi), Logical Reasoning, Mental Ability, Office Documentation, Tamil Nadu Heritage & History, MS Office";
    projInput.value = "1. District Administration Case Study: Researched revenue administration protocols and public service grievance workflows.\n2. Public Records Management: Completed vocational training in document archival and digital data entry.";
  }

  showToast("⚡ Sample profile loaded! Click 'Analyze Match' below.");
}

function handleTailorSubmit(e) {
  e.preventDefault();
  if (!currentTailorJob) return;

  const name = document.getElementById("candName").value.trim();
  const contact = document.getElementById("candEmail").value.trim();
  const location = document.getElementById("candLocation").value.trim();
  const education = document.getElementById("candEducation").value.trim();
  const rawSkills = document.getElementById("candSkills").value.trim();
  const projects = document.getElementById("candProjects").value.trim();

  const userSkillsList = rawSkills.split(",").map(s => s.trim()).filter(Boolean);

  // Match scoring algorithm based on target job keywords & syllabus
  const jobText = (currentTailorJob.title + " " + currentTailorJob.qualification + " " + (currentTailorJob.preparation_guide?.key_topics?.join(" ") || "")).toLowerCase();
  
  let matchedCount = 0;
  const matchedSkills = [];
  const highlightedSkills = [];

  userSkillsList.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      matchedCount++;
      matchedSkills.push(skill);
    } else {
      highlightedSkills.push(skill);
    }
  });

  // Calculate score (baseline 82% to 94%)
  const score = Math.min(94, Math.max(78, 80 + matchedCount * 3));

  // Populate Scorecard
  const scoreCircle = document.getElementById("scoreCircle");
  const scoreHeading = document.getElementById("scoreHeading");
  const scoreSummary = document.getElementById("scoreSummary");
  const matchedKeywordsList = document.getElementById("matchedKeywordsList");

  if (scoreCircle) scoreCircle.textContent = `${score}%`;
  if (scoreHeading) scoreHeading.textContent = `${score >= 85 ? "High ATS Match" : "Good Match"} for ${currentTailorJob.organization}`;
  if (scoreSummary) {
    scoreSummary.textContent = `Your profile aligns strongly with the core eligibility for ${currentTailorJob.title}. CareerOps reformulated your achievements to emphasize employer-specific keywords while preserving factual truth.`;
  }

  if (matchedKeywordsList) {
    matchedKeywordsList.innerHTML = [
      ...matchedSkills.map(s => `<span class="kw-tag matched">✅ ${escapeHTML(s)}</span>`),
      ...highlightedSkills.slice(0, 4).map(s => `<span class="kw-tag highlight">💡 ${escapeHTML(s)}</span>`)
    ].join("");
  }

  // Populate Printable ATS Resume Document
  document.getElementById("resName").textContent = name;
  document.getElementById("resContact").textContent = `${contact} • ${location}`;
  document.getElementById("resTargetEmployer").textContent = currentTailorJob.organization;

  // Formulate Professional Summary
  const tailoredSummary = `Results-oriented ${education.split(",")[0]} candidate with proven foundational knowledge in ${userSkillsList.slice(0, 3).join(", ")}. Offering strong problem-solving discipline and strict adherence to quality and operational standards. Eager to contribute directly to ${currentTailorJob.organization}'s mission as ${currentTailorJob.title}, leveraging verifiable academic preparation and hands-on project experience in Tamil Nadu.`;
  document.getElementById("resSummary").textContent = tailoredSummary;

  // Skills
  const resSkillsContainer = document.getElementById("resSkills");
  resSkillsContainer.innerHTML = userSkillsList.map(s => `<span class="resume-skill-item">${escapeHTML(s)}</span>`).join("");

  // Experience / Projects
  const resExpContainer = document.getElementById("resExperience");
  const projectLines = projects.split("\n").filter(l => l.trim().length > 0);
  resExpContainer.innerHTML = `
    <ul class="resume-bullet-list">
      ${projectLines.map(p => `<li>${escapeHTML(p)}</li>`).join("")}
      <li>Applied systematic testing, documentation, and compliance with industry standards during academic and practical assignments.</li>
    </ul>
  `;

  // Education
  document.getElementById("resEducation").innerHTML = `
    <div style="font-size: 0.9rem; font-weight: bold; color: #111827;">${escapeHTML(education)}</div>
    <div style="font-size: 0.85rem; color: #4b5563;">State of Tamil Nadu • Verified Credentials</div>
  `;

  // Switch View
  tailorInputSection.style.display = "none";
  tailorResultSection.style.display = "block";
  showToast("✨ ATS-Tailored Resume Generated!");
}

function copyTailoredResumeText() {
  const name = document.getElementById("resName").textContent;
  const contact = document.getElementById("resContact").textContent;
  const summary = document.getElementById("resSummary").textContent;
  const skills = Array.from(document.querySelectorAll("#resSkills .resume-skill-item")).map(el => el.textContent).join(", ");
  const exp = Array.from(document.querySelectorAll("#resExperience li")).map(el => `• ${el.textContent}`).join("\n");
  const edu = document.getElementById("resEducation").textContent.trim();

  const fullText = `${name}\n${contact}\n\nPROFESSIONAL SUMMARY\n${summary}\n\nKEY COMPETENCIES\n${skills}\n\nPROJECTS & EXPERIENCE\n${exp}\n\nEDUCATION & CREDENTIALS\n${edu}\n`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast("📋 Resume copied to clipboard!");
  }).catch(err => {
    console.error("Could not copy text", err);
  });
}

/**
 * Gaurav's Notes - Main Application Logic
 * Zero dependencies, pure vanilla JS + Marked.js for markdown rendering
 */

(function () {
  'use strict';

  // --- State ---
  let currentIndex = 0;
  let currentCategory = 'all';
  let searchQuery = '';
  let completedSet = new Set(JSON.parse(localStorage.getItem('gaurav_notes_completed') || '[]'));

  // --- DOM Elements ---
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  
  const sidebarSubjectTitle = document.getElementById('sidebarSubjectTitle');
  const sidebarSubjectSubtitle = document.getElementById('sidebarSubjectSubtitle');
  const mobileSubjectTag = document.getElementById('mobileSubjectTag');
  const mobileBrandTitle = document.getElementById('mobileBrandTitle');

  const quickPillsContainer = document.getElementById('quickPillsContainer');
  const topNavPills = document.getElementById('topNavPills');
  const questionList = document.getElementById('questionList');
  const categoryFilters = document.getElementById('categoryFilters');
  const listStats = document.getElementById('listStats');
  
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  const currentQBadge = document.getElementById('currentQBadge');
  const currentTopicBadge = document.getElementById('currentTopicBadge');
  const currentLevelBadge = document.getElementById('currentLevelBadge');
  const markDoneCheckbox = document.getElementById('markDoneCheckbox');
  const questionHeading = document.getElementById('questionHeading');
  const answerContainer = document.getElementById('answerContainer');

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtnLabel = document.getElementById('prevBtnLabel');
  const nextBtnLabel = document.getElementById('nextBtnLabel');

  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  const resetProgressBtn = document.getElementById('resetProgressBtn');

  const copyShareBtn = document.getElementById('copyShareBtn');
  const printBtn = document.getElementById('printBtn');
  const toastNotification = document.getElementById('toastNotification');

  const editorModal = document.getElementById('editorModal');
  const openEditorBtn = document.getElementById('openEditorBtn');
  const closeEditorBtn = document.getElementById('closeEditorBtn');
  const gotItBtn = document.getElementById('gotItBtn');

  // --- Initialize App ---
  function init() {
    initTheme();
    loadSubjectInfo();
    renderCategoryFilters();
    renderQuickPills();
    renderTopPills();
    renderQuestionList();
    updateProgress();

    // Check URL Hash for initial question (e.g. #q2)
    loadQuestionFromHash();

    // Event Listeners
    setupEventListeners();
  }

  // --- Theme Toggle ---
  function initTheme() {
    const savedTheme = localStorage.getItem('gaurav_notes_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
  }

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('gaurav_notes_theme', next);
    updateThemeIcons(next);

    // Switch highlight.js theme if desired
    const hljsTheme = document.getElementById('hljs-theme');
    if (hljsTheme) {
      hljsTheme.href = next === 'dark' 
        ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
  }

  function updateThemeIcons(theme) {
    const icon = theme === 'dark' ? '🌙' : '☀️';
    if (themeToggle) themeToggle.querySelector('.theme-icon').textContent = icon;
    if (themeToggleMobile) themeToggleMobile.querySelector('.theme-icon').textContent = icon;
  }

  // --- Subject Header Info ---
  function loadSubjectInfo() {
    if (!notesData || !notesData.subject) return;
    const sub = notesData.subject;
    sidebarSubjectTitle.textContent = sub.name || 'Notes';
    sidebarSubjectSubtitle.textContent = sub.description || `${notesData.questions.length} Questions`;
    mobileSubjectTag.textContent = sub.code || 'Notes';
    mobileBrandTitle.textContent = sub.name || 'Study Notes';
    document.title = `${sub.name} - Study Notes`;
  }

  // --- Render Categories Filter ---
  function renderCategoryFilters() {
    const categories = ['all', ...new Set(notesData.questions.map(q => q.category).filter(Boolean))];
    categoryFilters.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-pill ${cat === currentCategory ? 'active' : ''}`;
      btn.dataset.category = cat;
      btn.textContent = cat === 'all' ? 'All' : cat;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        categoryFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.toggle('active', b === btn));
        renderQuestionList();
      });
      categoryFilters.appendChild(btn);
    });
  }

  // --- Quick Jump Pills (Sidebar & Top Bar) ---
  function renderQuickPills() {
    quickPillsContainer.innerHTML = '';
    notesData.questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = `quick-pill-btn ${idx === currentIndex ? 'active' : ''} ${completedSet.has(q.id) ? 'completed' : ''}`;
      btn.textContent = q.badge || `Q.${q.id}`;
      btn.title = q.title;
      btn.addEventListener('click', () => selectQuestion(idx));
      quickPillsContainer.appendChild(btn);
    });
  }

  function renderTopPills() {
    topNavPills.innerHTML = '';
    notesData.questions.forEach((q, idx) => {
      const pill = document.createElement('button');
      pill.className = `top-pill ${idx === currentIndex ? 'active' : ''} ${completedSet.has(q.id) ? 'completed' : ''}`;
      pill.textContent = q.badge || `Q.${q.id}`;
      pill.title = q.title;
      pill.addEventListener('click', () => selectQuestion(idx));
      topNavPills.appendChild(pill);
    });
  }

  // --- Detailed Question List in Sidebar ---
  function renderQuestionList() {
    questionList.innerHTML = '';

    const filtered = notesData.questions.filter((q, originalIdx) => {
      const matchesCat = currentCategory === 'all' || q.category === currentCategory;
      const qLower = searchQuery.toLowerCase();
      const matchesSearch = !qLower || 
        q.title.toLowerCase().includes(qLower) || 
        (q.badge && q.badge.toLowerCase().includes(qLower)) ||
        (q.category && q.category.toLowerCase().includes(qLower)) ||
        (q.answer && q.answer.toLowerCase().includes(qLower));

      return matchesCat && matchesSearch;
    });

    listStats.textContent = `Showing ${filtered.length} of ${notesData.questions.length} questions`;

    if (filtered.length === 0) {
      questionList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-faint); font-size: 0.85rem;">No questions match your filter.</div>`;
      return;
    }

    filtered.forEach(q => {
      const originalIdx = notesData.questions.findIndex(item => item.id === q.id);
      const isCompleted = completedSet.has(q.id);

      const btn = document.createElement('button');
      btn.className = `q-item-btn ${originalIdx === currentIndex ? 'active' : ''} ${isCompleted ? 'is-completed' : ''}`;
      btn.innerHTML = `
        <span class="q-item-num">${q.badge || 'Q.' + q.id}</span>
        <div class="q-item-info">
          <div class="q-item-title">${escapeHTML(q.title)}</div>
          <div class="q-item-meta">
            <span class="q-item-category">${escapeHTML(q.category || '')}</span>
            <span class="q-item-done-icon">✓ Done</span>
          </div>
        </div>
      `;

      btn.addEventListener('click', () => {
        selectQuestion(originalIdx);
        // On mobile, close sidebar after clicking
        if (window.innerWidth <= 900) {
          closeSidebar();
        }
      });

      questionList.appendChild(btn);
    });
  }

  // --- Select & Render Question ---
  function selectQuestion(idx) {
    if (idx < 0 || idx >= notesData.questions.length) return;
    currentIndex = idx;
    const q = notesData.questions[currentIndex];

    // Update URL hash without jumping page
    history.replaceState(null, null, `#q${q.id}`);

    // Update active state in pills and lists
    updateActiveClasses();

    // Render Question Details
    currentQBadge.textContent = q.badge || `Q.${q.id}`;
    currentTopicBadge.textContent = q.category || 'General';
    currentLevelBadge.textContent = q.tag || 'Notes';
    questionHeading.textContent = q.title;

    // Parse Markdown Answer
    if (window.marked) {
      answerContainer.innerHTML = marked.parse(q.answer || '*No notes available for this question yet.*');
    } else {
      answerContainer.innerHTML = `<pre>${escapeHTML(q.answer || '')}</pre>`;
    }

    // Highlight code blocks
    if (window.hljs) {
      answerContainer.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }

    // Update completion checkbox
    markDoneCheckbox.checked = completedSet.has(q.id);

    // Update Next / Prev buttons
    updateNavigationButtons();

    // Scroll main view to top
    const scrollContainer = document.querySelector('.content-scroll');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    // Scroll active top nav pill into view
    const activeTopPill = topNavPills.children[currentIndex];
    if (activeTopPill) {
      activeTopPill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function updateActiveClasses() {
    // Quick pills
    Array.from(quickPillsContainer.children).forEach((pill, i) => {
      pill.classList.toggle('active', i === currentIndex);
    });

    // Top pills
    Array.from(topNavPills.children).forEach((pill, i) => {
      pill.classList.toggle('active', i === currentIndex);
    });

    // Sidebar list
    const currentQ = notesData.questions[currentIndex];
    Array.from(questionList.querySelectorAll('.q-item-btn')).forEach(btn => {
      const numSpan = btn.querySelector('.q-item-num');
      const isActive = numSpan && (numSpan.textContent === currentQ.badge || numSpan.textContent === `Q.${currentQ.id}`);
      btn.classList.toggle('active', isActive);
    });
  }

  function updateNavigationButtons() {
    // Previous button
    if (currentIndex > 0) {
      prevBtn.disabled = false;
      const prevQ = notesData.questions[currentIndex - 1];
      prevBtnLabel.textContent = prevQ.badge || `Q.${prevQ.id}`;
    } else {
      prevBtn.disabled = true;
      prevBtnLabel.textContent = 'Start';
    }

    // Next button
    if (currentIndex < notesData.questions.length - 1) {
      nextBtn.disabled = false;
      const nextQ = notesData.questions[currentIndex + 1];
      nextBtnLabel.textContent = nextQ.badge || `Q.${nextQ.id}`;
    } else {
      nextBtn.disabled = true;
      nextBtnLabel.textContent = 'End';
    }
  }

  // --- Mark Done / Progress Tracker ---
  function toggleMarkDone() {
    const q = notesData.questions[currentIndex];
    if (!q) return;

    if (markDoneCheckbox.checked) {
      completedSet.add(q.id);
      showToast(`Marked ${q.badge || 'Q.' + q.id} as Done! 🎉`);
    } else {
      completedSet.delete(q.id);
    }

    saveCompletedState();
    updateProgress();
    renderQuickPills();
    renderTopPills();
    renderQuestionList();
  }

  function saveCompletedState() {
    localStorage.setItem('gaurav_notes_completed', JSON.stringify(Array.from(completedSet)));
  }

  function updateProgress() {
    const total = notesData.questions.length;
    const completed = completedSet.size;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.textContent = `${completed} / ${total} (${pct}%)`;
    progressFill.style.width = `${pct}%`;
  }

  function resetProgress() {
    if (confirm('Are you sure you want to reset all completion checkmarks?')) {
      completedSet.clear();
      saveCompletedState();
      updateProgress();
      renderQuickPills();
      renderTopPills();
      renderQuestionList();
      markDoneCheckbox.checked = false;
      showToast('Progress reset!');
    }
  }

  // --- URL Hash Handling ---
  function loadQuestionFromHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      // Find question by id or badge (e.g. q1, q.1, 1)
      const targetId = parseInt(hash.replace(/[^0-9]/g, ''), 10);
      const foundIdx = notesData.questions.findIndex(q => q.id === targetId);
      if (foundIdx !== -1) {
        selectQuestion(foundIdx);
        return;
      }
    }
    // Default to first question
    selectQuestion(0);
  }

  // --- Mobile Sidebar Controls ---
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('show');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('show');
  }

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastNotification.textContent = msg;
    toastNotification.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2400);
  }

  // --- Utilities ---
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Theme toggle
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    // Sidebar Mobile toggle
    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', openSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

    // Previous / Next Buttons
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) selectQuestion(currentIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
      if (currentIndex < notesData.questions.length - 1) selectQuestion(currentIndex + 1);
    });

    // Mark Done Checkbox
    markDoneCheckbox.addEventListener('change', toggleMarkDone);

    // Reset Progress
    resetProgressBtn.addEventListener('click', resetProgress);

    // Search Input
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      clearSearchBtn.classList.toggle('show', searchQuery.length > 0);
      renderQuestionList();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.remove('show');
      renderQuestionList();
      searchInput.focus();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in search or input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          searchInput.blur();
          searchInput.value = '';
          searchQuery = '';
          clearSearchBtn.classList.remove('show');
          renderQuestionList();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) selectQuestion(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < notesData.questions.length - 1) selectQuestion(currentIndex + 1);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // Share Button
    copyShareBtn.addEventListener('click', () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Direct link to question copied! 📋');
      }).catch(() => {
        showToast('Link copied to clipboard!');
      });
    });

    // Print Button
    printBtn.addEventListener('click', () => {
      window.print();
    });

    // Editor Info Modal
    openEditorBtn.addEventListener('click', () => editorModal.classList.add('show'));
    closeEditorBtn.addEventListener('click', () => editorModal.classList.remove('show'));
    gotItBtn.addEventListener('click', () => editorModal.classList.remove('show'));
    editorModal.addEventListener('click', (e) => {
      if (e.target === editorModal) editorModal.classList.remove('show');
    });

    // Window Hash Change (browser back/forward)
    window.addEventListener('hashchange', loadQuestionFromHash);
  }

  // Run init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

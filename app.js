/**
 * Temp Notes - Application Logic
 * Subject: Principles of Management (PM)
 */

(function () {
  'use strict';

  // --- State ---
  let questions = [];
  let currentIndex = 0;
  let currentCategory = 'all';
  let searchQuery = '';
  let completedSet = new Set(JSON.parse(localStorage.getItem('temp_notes_completed') || '[]'));

  // --- DOM Elements ---
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');

  const profileAvatar = document.getElementById('profileAvatar');
  const profileNameDisplay = document.getElementById('profileNameDisplay');
  const editProfileBtn = document.getElementById('editProfileBtn');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const categoryFilters = document.getElementById('categoryFilters');
  const questionList = document.getElementById('questionList');
  const listStats = document.getElementById('listStats');

  const noteCard = document.getElementById('noteCard');
  const emptyStateCard = document.getElementById('emptyStateCard');
  const emptyAddBtn = document.getElementById('emptyAddBtn');
  const contentScroll = document.getElementById('contentScroll');

  const currentQBadge = document.getElementById('currentQBadge');
  const currentTopicBadge = document.getElementById('currentTopicBadge');
  const questionHeading = document.getElementById('questionHeading');
  const answerContainer = document.getElementById('answerContainer');
  const markDoneCheckbox = document.getElementById('markDoneCheckbox');

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtnLabel = document.getElementById('prevBtnLabel');
  const nextBtnLabel = document.getElementById('nextBtnLabel');

  const editCurrentQBtn = document.getElementById('editCurrentQBtn');
  const copyShareBtn = document.getElementById('copyShareBtn');
  const printBtn = document.getElementById('printBtn');

  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  const exportCodeBtn = document.getElementById('exportCodeBtn');

  // Modals
  const questionEditModal = document.getElementById('questionEditModal');
  const modalHeading = document.getElementById('modalHeading');
  const questionForm = document.getElementById('questionForm');
  const editQuestionIndex = document.getElementById('editQuestionIndex');
  const inputQuestionBadge = document.getElementById('inputQuestionBadge');
  const inputQuestionCategory = document.getElementById('inputQuestionCategory');
  const inputQuestionTitle = document.getElementById('inputQuestionTitle');
  const inputQuestionAnswer = document.getElementById('inputQuestionAnswer');
  const deleteQuestionBtn = document.getElementById('deleteQuestionBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  const profileModal = document.getElementById('profileModal');
  const profileForm = document.getElementById('profileForm');
  const inputProfileName = document.getElementById('inputProfileName');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');

  const exportModal = document.getElementById('exportModal');
  const exportCodeTextarea = document.getElementById('exportCodeTextarea');
  const closeExportModalBtn = document.getElementById('closeExportModalBtn');
  const copyExportCodeBtn = document.getElementById('copyExportCodeBtn');

  const toastNotification = document.getElementById('toastNotification');

  // --- Initialization ---
  function init() {
    initTheme();
    loadProfile();
    loadQuestions();
    renderCategoryFilters();
    renderQuestionList();
    updateProgress();

    // Select initial question or load from URL hash
    loadQuestionFromHash();

    setupEventListeners();
  }

  // --- Theme Toggle ---
  function initTheme() {
    const savedTheme = localStorage.getItem('temp_notes_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('temp_notes_theme', next);

    const hljsTheme = document.getElementById('hljs-theme');
    if (hljsTheme) {
      hljsTheme.href = next === 'dark' 
        ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
  }

  // --- Profile Management ---
  function loadProfile() {
    const name = localStorage.getItem('temp_notes_profile_name') || 'Friend';
    profileNameDisplay.textContent = name;
    profileAvatar.textContent = name.trim().charAt(0).toUpperCase() || 'U';
  }

  function saveProfile(name) {
    const cleanName = name.trim() || 'Friend';
    localStorage.setItem('temp_notes_profile_name', cleanName);
    loadProfile();
    showToast('Name updated');
  }

  // --- Load & Store Questions ---
  function loadQuestions() {
    const saved = localStorage.getItem('temp_notes_questions');
    if (saved) {
      try {
        questions = JSON.parse(saved);
      } catch (e) {
        questions = (notesData && notesData.questions) || [];
      }
    } else {
      questions = (notesData && notesData.questions) || [];
    }
  }

  function saveQuestions() {
    localStorage.setItem('temp_notes_questions', JSON.stringify(questions));
  }

  // --- Category Filters ---
  function renderCategoryFilters() {
    const categories = ['all', ...new Set(questions.map(q => q.category).filter(Boolean))];
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

  // --- Sidebar Questions List ---
  function renderQuestionList() {
    questionList.innerHTML = '';

    const filtered = questions.filter((q) => {
      const matchesCat = currentCategory === 'all' || q.category === currentCategory;
      const qLower = searchQuery.toLowerCase();
      const matchesSearch = !qLower || 
        q.title.toLowerCase().includes(qLower) || 
        (q.badge && q.badge.toLowerCase().includes(qLower)) ||
        (q.category && q.category.toLowerCase().includes(qLower)) ||
        (q.answer && q.answer.toLowerCase().includes(qLower));

      return matchesCat && matchesSearch;
    });

    listStats.textContent = `${filtered.length} Question${filtered.length === 1 ? '' : 's'}`;

    if (questions.length === 0) {
      questionList.innerHTML = `<div style="padding: 16px 8px; text-align: center; color: var(--text-faint); font-size: 0.8rem;">No questions added yet.</div>`;
      showEmptyState();
      return;
    }

    if (filtered.length === 0) {
      questionList.innerHTML = `<div style="padding: 16px 8px; text-align: center; color: var(--text-faint); font-size: 0.8rem;">No matching questions found.</div>`;
      return;
    }

    filtered.forEach(q => {
      const originalIdx = questions.findIndex(item => item.id === q.id);
      const isCompleted = completedSet.has(q.id);

      const btn = document.createElement('button');
      btn.className = `q-item-btn ${originalIdx === currentIndex ? 'active' : ''} ${isCompleted ? 'is-completed' : ''}`;
      btn.innerHTML = `
        <span class="q-item-num">${escapeHTML(q.badge || 'Q.' + (originalIdx + 1))}</span>
        <div class="q-item-info">
          <div class="q-item-title">${escapeHTML(q.title)}</div>
          <div class="q-item-meta">
            <span class="q-item-category">${escapeHTML(q.category || 'General')}</span>
            <span class="q-item-done-icon">Reviewed</span>
          </div>
        </div>
      `;

      btn.addEventListener('click', () => {
        selectQuestion(originalIdx);
        if (window.innerWidth <= 900) closeSidebar();
      });

      questionList.appendChild(btn);
    });

    hideEmptyState();
  }

  // --- Select & Render Question ---
  function selectQuestion(idx) {
    if (questions.length === 0) {
      showEmptyState();
      return;
    }

    if (idx < 0) idx = 0;
    if (idx >= questions.length) idx = questions.length - 1;

    currentIndex = idx;
    const q = questions[currentIndex];

    hideEmptyState();

    // Trigger smooth fade/slide animation
    noteCard.style.animation = 'none';
    noteCard.offsetHeight; // trigger reflow
    noteCard.style.animation = null;

    // Update URL hash
    if (q.badge) {
      const slug = q.badge.toLowerCase().replace(/[^a-z0-9]/g, '');
      history.replaceState(null, null, `#${slug || 'q' + (currentIndex + 1)}`);
    } else {
      history.replaceState(null, null, `#q${currentIndex + 1}`);
    }

    // Update active highlight in sidebar list
    Array.from(questionList.querySelectorAll('.q-item-btn')).forEach((btn, i) => {
      const numSpan = btn.querySelector('.q-item-num');
      const isActive = numSpan && (numSpan.textContent === q.badge || numSpan.textContent === `Q.${currentIndex + 1}`);
      btn.classList.toggle('active', isActive);
    });

    // Render Question Details
    currentQBadge.textContent = q.badge || `Q.${currentIndex + 1}`;
    currentTopicBadge.textContent = q.category || 'Principles of Management';
    questionHeading.textContent = q.title;

    // Render markdown answer
    if (window.marked) {
      answerContainer.innerHTML = marked.parse(q.answer || '*No notes written for this question yet.*');
    } else {
      answerContainer.innerHTML = `<pre>${escapeHTML(q.answer || '')}</pre>`;
    }

    // Code syntax highlighting
    if (window.hljs) {
      answerContainer.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }

    // Mark Done checkbox
    markDoneCheckbox.checked = completedSet.has(q.id);

    // Update Next & Prev buttons
    updateNavigationButtons();

    // Scroll smoothly to top
    if (contentScroll) contentScroll.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNavigationButtons() {
    if (currentIndex > 0) {
      prevBtn.disabled = false;
      const prevQ = questions[currentIndex - 1];
      prevBtnLabel.textContent = prevQ.badge || `Q.${currentIndex}`;
    } else {
      prevBtn.disabled = true;
      prevBtnLabel.textContent = 'Start';
    }

    if (currentIndex < questions.length - 1) {
      nextBtn.disabled = false;
      const nextQ = questions[currentIndex + 1];
      nextBtnLabel.textContent = nextQ.badge || `Q.${currentIndex + 2}`;
    } else {
      nextBtn.disabled = true;
      nextBtnLabel.textContent = 'End';
    }
  }

  function showEmptyState() {
    noteCard.style.display = 'none';
    emptyStateCard.style.display = 'block';
    editCurrentQBtn.style.display = 'none';
    currentQBadge.textContent = 'Q.0';
    currentTopicBadge.textContent = 'None';
  }

  function hideEmptyState() {
    noteCard.style.display = 'block';
    emptyStateCard.style.display = 'none';
    editCurrentQBtn.style.display = 'inline-flex';
  }

  // --- Mark Done / Progress ---
  function toggleMarkDone() {
    if (questions.length === 0) return;
    const q = questions[currentIndex];
    if (!q) return;

    if (markDoneCheckbox.checked) {
      completedSet.add(q.id);
      showToast(`Marked as reviewed`);
    } else {
      completedSet.delete(q.id);
    }

    localStorage.setItem('temp_notes_completed', JSON.stringify(Array.from(completedSet)));
    updateProgress();
    renderQuestionList();
  }

  function updateProgress() {
    const total = questions.length;
    const completed = Array.from(completedSet).filter(id => questions.some(q => q.id === id)).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.textContent = `${completed} / ${total}`;
    progressFill.style.width = `${pct}%`;
  }

  function resetProgress() {
    if (confirm('Reset review progress?')) {
      completedSet.clear();
      localStorage.setItem('temp_notes_completed', JSON.stringify([]));
      updateProgress();
      renderQuestionList();
      markDoneCheckbox.checked = false;
      showToast('Progress reset');
    }
  }

  // --- Add / Edit Question Modal (Pencil) ---
  function openAddModal() {
    editQuestionIndex.value = '-1';
    modalHeading.textContent = 'Add Question';
    inputQuestionBadge.value = `Q.${questions.length + 1}`;
    inputQuestionCategory.value = currentCategory === 'all' ? 'Unit 1' : currentCategory;
    inputQuestionTitle.value = '';
    inputQuestionAnswer.value = '';
    deleteQuestionBtn.style.display = 'none';
    questionEditModal.classList.add('show');
    inputQuestionTitle.focus();
  }

  function openEditModal() {
    if (questions.length === 0 || currentIndex < 0 || currentIndex >= questions.length) {
      openAddModal();
      return;
    }

    const q = questions[currentIndex];
    editQuestionIndex.value = currentIndex;
    modalHeading.textContent = `Edit ${q.badge || 'Question'}`;
    inputQuestionBadge.value = q.badge || `Q.${currentIndex + 1}`;
    inputQuestionCategory.value = q.category || '';
    inputQuestionTitle.value = q.title || '';
    inputQuestionAnswer.value = q.answer || '';
    deleteQuestionBtn.style.display = 'inline-flex';
    questionEditModal.classList.add('show');
    inputQuestionTitle.focus();
  }

  function closeQuestionModal() {
    questionEditModal.classList.remove('show');
  }

  function handleSaveQuestion(e) {
    e.preventDefault();
    const idx = parseInt(editQuestionIndex.value, 10);
    const badge = inputQuestionBadge.value.trim() || `Q.${questions.length + 1}`;
    const category = inputQuestionCategory.value.trim() || 'Principles of Management';
    const title = inputQuestionTitle.value.trim();
    const answer = inputQuestionAnswer.value.trim();

    if (!title) return;

    if (idx >= 0 && idx < questions.length) {
      // Update existing
      questions[idx] = {
        ...questions[idx],
        badge,
        category,
        title,
        answer
      };
      saveQuestions();
      renderCategoryFilters();
      renderQuestionList();
      selectQuestion(idx);
      showToast('Question updated');
    } else {
      // Add new
      const newQ = {
        id: Date.now(),
        badge,
        category,
        title,
        answer
      };
      questions.push(newQ);
      saveQuestions();
      renderCategoryFilters();
      renderQuestionList();
      selectQuestion(questions.length - 1);
      showToast('Question added');
    }

    updateProgress();
    closeQuestionModal();
  }

  function handleDeleteQuestion() {
    const idx = parseInt(editQuestionIndex.value, 10);
    if (idx >= 0 && idx < questions.length) {
      if (confirm(`Delete ${questions[idx].badge || 'this question'}?`)) {
        completedSet.delete(questions[idx].id);
        questions.splice(idx, 1);
        saveQuestions();
        renderCategoryFilters();
        renderQuestionList();
        updateProgress();
        closeQuestionModal();

        if (questions.length > 0) {
          selectQuestion(Math.max(0, idx - 1));
        } else {
          showEmptyState();
        }
        showToast('Question deleted');
      }
    }
  }

  // --- Export Code Modal ---
  function openExportModal() {
    const code = `/**
 * Temp Notes - Exported Questions
 * Subject: Principles of Management (PM)
 */

const notesData = {
  subject: {
    name: "Principles of Management",
    code: "PM",
    description: "Subject Notes & Reference"
  },
  questions: ${JSON.stringify(questions, null, 2)}
};
`;
    exportCodeTextarea.value = code;
    exportModal.classList.add('show');
  }

  // --- Hash Routing ---
  function loadQuestionFromHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && questions.length > 0) {
      const foundIdx = questions.findIndex((q, i) => {
        const slug = (q.badge || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return slug === hash || `q${i + 1}` === hash || `q${q.id}` === hash;
      });
      if (foundIdx !== -1) {
        selectQuestion(foundIdx);
        return;
      }
    }
    if (questions.length > 0) {
      selectQuestion(0);
    } else {
      showEmptyState();
    }
  }

  // --- Mobile Drawer ---
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('show');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('show');
  }

  // --- Toast ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastNotification.textContent = msg;
    toastNotification.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2200);
  }

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

    // Profile Edit
    editProfileBtn.addEventListener('click', () => {
      inputProfileName.value = localStorage.getItem('temp_notes_profile_name') || 'Friend';
      profileModal.classList.add('show');
      inputProfileName.focus();
    });

    closeProfileModalBtn.addEventListener('click', () => profileModal.classList.remove('show'));
    cancelProfileBtn.addEventListener('click', () => profileModal.classList.remove('show'));
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) profileModal.classList.remove('show');
    });

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile(inputProfileName.value);
      profileModal.classList.remove('show');
    });

    // Add / Edit Questions
    addQuestionBtn.addEventListener('click', openAddModal);
    emptyAddBtn.addEventListener('click', openAddModal);
    editCurrentQBtn.addEventListener('click', openEditModal);
    closeModalBtn.addEventListener('click', closeQuestionModal);
    cancelModalBtn.addEventListener('click', closeQuestionModal);
    deleteQuestionBtn.addEventListener('click', handleDeleteQuestion);
    questionForm.addEventListener('submit', handleSaveQuestion);
    questionEditModal.addEventListener('click', (e) => {
      if (e.target === questionEditModal) closeQuestionModal();
    });

    // Navigation Buttons
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) selectQuestion(currentIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
      if (currentIndex < questions.length - 1) selectQuestion(currentIndex + 1);
    });

    // Mark Done
    markDoneCheckbox.addEventListener('change', toggleMarkDone);
    resetProgressBtn.addEventListener('click', resetProgress);

    // Export Modal
    exportCodeBtn.addEventListener('click', openExportModal);
    closeExportModalBtn.addEventListener('click', () => exportModal.classList.remove('show'));
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) exportModal.classList.remove('show');
    });
    copyExportCodeBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(exportCodeTextarea.value).then(() => {
        showToast('Code copied to clipboard');
      });
    });

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
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          if (questionEditModal.classList.contains('show')) closeQuestionModal();
          if (profileModal.classList.contains('show')) profileModal.classList.remove('show');
          if (exportModal.classList.contains('show')) exportModal.classList.remove('show');
          searchInput.blur();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) selectQuestion(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) selectQuestion(currentIndex + 1);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // Share & Print
    copyShareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard');
      }).catch(() => {
        showToast('Link copied');
      });
    });

    printBtn.addEventListener('click', () => {
      window.print();
    });

    // Hash change
    window.addEventListener('hashchange', loadQuestionFromHash);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

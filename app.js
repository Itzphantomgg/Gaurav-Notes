/**
 * Temp Notes - OLED Black Edition
 * Subject: Principles of Management (PM)
 */

(function () {
  'use strict';

  // --- State ---
  let questions = [];
  let currentIndex = 0;
  let currentCategory = 'all';
  let searchQuery = '';
  let completedSet = new Set();

  try {
    const savedCompleted = localStorage.getItem('temp_notes_completed');
    if (savedCompleted) {
      completedSet = new Set(JSON.parse(savedCompleted));
    }
  } catch (e) {
    completedSet = new Set();
  }

  // --- Safe DOM Helper ---
  const $ = (id) => document.getElementById(id);

  // --- Global Functions (Accessible via inline onclick as fallback) ---
  window.openAddQuestionModal = function () {
    const editQuestionIndex = $('editQuestionIndex');
    const modalHeading = $('modalHeading');
    const inputQuestionBadge = $('inputQuestionBadge');
    const inputQuestionCategory = $('inputQuestionCategory');
    const inputQuestionTitle = $('inputQuestionTitle');
    const inputQuestionAnswer = $('inputQuestionAnswer');
    const deleteQuestionBtn = $('deleteQuestionBtn');
    const questionEditModal = $('questionEditModal');

    if (editQuestionIndex) editQuestionIndex.value = '-1';
    if (modalHeading) modalHeading.textContent = 'Add Question';
    if (inputQuestionBadge) inputQuestionBadge.value = `Q.${questions.length + 1}`;
    if (inputQuestionCategory) inputQuestionCategory.value = currentCategory === 'all' ? 'Unit 1' : currentCategory;
    if (inputQuestionTitle) inputQuestionTitle.value = '';
    if (inputQuestionAnswer) inputQuestionAnswer.value = '';
    if (deleteQuestionBtn) deleteQuestionBtn.style.display = 'none';

    if (questionEditModal) {
      questionEditModal.classList.add('show');
      setTimeout(() => {
        if (inputQuestionTitle) inputQuestionTitle.focus();
      }, 50);
    }
  };

  window.openEditQuestionModal = function () {
    if (questions.length === 0 || currentIndex < 0 || currentIndex >= questions.length) {
      window.openAddQuestionModal();
      return;
    }

    const q = questions[currentIndex];
    const editQuestionIndex = $('editQuestionIndex');
    const modalHeading = $('modalHeading');
    const inputQuestionBadge = $('inputQuestionBadge');
    const inputQuestionCategory = $('inputQuestionCategory');
    const inputQuestionTitle = $('inputQuestionTitle');
    const inputQuestionAnswer = $('inputQuestionAnswer');
    const deleteQuestionBtn = $('deleteQuestionBtn');
    const questionEditModal = $('questionEditModal');

    if (editQuestionIndex) editQuestionIndex.value = String(currentIndex);
    if (modalHeading) modalHeading.textContent = `Edit ${q.badge || 'Question'}`;
    if (inputQuestionBadge) inputQuestionBadge.value = q.badge || `Q.${currentIndex + 1}`;
    if (inputQuestionCategory) inputQuestionCategory.value = q.category || '';
    if (inputQuestionTitle) inputQuestionTitle.value = q.title || '';
    if (inputQuestionAnswer) inputQuestionAnswer.value = q.answer || '';
    if (deleteQuestionBtn) deleteQuestionBtn.style.display = 'inline-flex';

    if (questionEditModal) {
      questionEditModal.classList.add('show');
      setTimeout(() => {
        if (inputQuestionTitle) inputQuestionTitle.focus();
      }, 50);
    }
  };

  function closeQuestionModal() {
    const modal = $('questionEditModal');
    if (modal) modal.classList.remove('show');
  }

  // --- Load & Save Data ---
  function loadQuestions() {
    try {
      const saved = localStorage.getItem('temp_notes_questions');
      if (saved) {
        questions = JSON.parse(saved);
      } else if (typeof notesData !== 'undefined' && Array.isArray(notesData.questions)) {
        questions = [...notesData.questions];
      } else {
        questions = [];
      }
    } catch (e) {
      console.warn('Could not load saved questions:', e);
      questions = [];
    }
  }

  function saveQuestions() {
    try {
      localStorage.setItem('temp_notes_questions', JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- Profile Management ---
  function loadProfile() {
    const name = localStorage.getItem('temp_notes_profile_name') || 'Friend';
    const profileNameDisplay = $('profileNameDisplay');
    const profileAvatar = $('profileAvatar');
    if (profileNameDisplay) profileNameDisplay.textContent = name;
    if (profileAvatar) profileAvatar.textContent = name.trim().charAt(0).toUpperCase() || 'U';
  }

  function saveProfile(name) {
    const cleanName = (name && name.trim()) || 'Friend';
    localStorage.setItem('temp_notes_profile_name', cleanName);
    loadProfile();
    showToast('Name saved');
  }

  // --- Render Categories ---
  function renderCategoryFilters() {
    const categoryFilters = $('categoryFilters');
    if (!categoryFilters) return;

    const categories = ['all', ...new Set(questions.map(q => q.category).filter(Boolean))];
    categoryFilters.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-pill ${cat === currentCategory ? 'active' : ''}`;
      btn.textContent = cat === 'all' ? 'All' : cat;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        categoryFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.toggle('active', b === btn));
        renderQuestionList();
      });
      categoryFilters.appendChild(btn);
    });
  }

  // --- Render Questions List (Sidebar) ---
  function renderQuestionList() {
    const questionList = $('questionList');
    const listStats = $('listStats');
    if (!questionList) return;

    questionList.innerHTML = '';

    const filtered = questions.filter((q) => {
      const matchesCat = currentCategory === 'all' || q.category === currentCategory;
      const qLower = searchQuery.toLowerCase();
      const matchesSearch = !qLower || 
        (q.title && q.title.toLowerCase().includes(qLower)) || 
        (q.badge && q.badge.toLowerCase().includes(qLower)) ||
        (q.category && q.category.toLowerCase().includes(qLower)) ||
        (q.answer && q.answer.toLowerCase().includes(qLower));

      return matchesCat && matchesSearch;
    });

    if (listStats) {
      listStats.textContent = `${filtered.length} Question${filtered.length === 1 ? '' : 's'}`;
    }

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
          <div class="q-item-title">${escapeHTML(q.title || 'Untitled')}</div>
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

    const noteCard = $('noteCard');
    if (noteCard) {
      noteCard.style.animation = 'none';
      void noteCard.offsetHeight; // trigger reflow
      noteCard.style.animation = null;
    }

    // URL Hash update
    if (q.badge) {
      const slug = q.badge.toLowerCase().replace(/[^a-z0-9]/g, '');
      history.replaceState(null, null, `#${slug || 'q' + (currentIndex + 1)}`);
    } else {
      history.replaceState(null, null, `#q${currentIndex + 1}`);
    }

    // Sidebar active classes
    const questionList = $('questionList');
    if (questionList) {
      Array.from(questionList.querySelectorAll('.q-item-btn')).forEach((btn, i) => {
        const numSpan = btn.querySelector('.q-item-num');
        const isActive = numSpan && (numSpan.textContent === q.badge || numSpan.textContent === `Q.${currentIndex + 1}`);
        btn.classList.toggle('active', isActive);
      });
    }

    // Question Meta
    const currentQBadge = $('currentQBadge');
    const currentTopicBadge = $('currentTopicBadge');
    const questionHeading = $('questionHeading');
    const answerContainer = $('answerContainer');
    const markDoneCheckbox = $('markDoneCheckbox');

    if (currentQBadge) currentQBadge.textContent = q.badge || `Q.${currentIndex + 1}`;
    if (currentTopicBadge) currentTopicBadge.textContent = q.category || 'Principles of Management';
    if (questionHeading) questionHeading.textContent = q.title || 'Untitled';

    // Render Answer Markdown
    if (answerContainer) {
      if (window.marked && typeof marked.parse === 'function') {
        answerContainer.innerHTML = marked.parse(q.answer || '*No notes written for this question yet.*');
      } else {
        answerContainer.innerHTML = `<pre>${escapeHTML(q.answer || '')}</pre>`;
      }

      // Syntax highlight
      if (window.hljs) {
        answerContainer.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }
    }

    // Checkbox
    if (markDoneCheckbox) {
      markDoneCheckbox.checked = completedSet.has(q.id);
    }

    // Nav buttons
    updateNavigationButtons();

    // Scroll to top
    const contentScroll = $('contentScroll');
    if (contentScroll) contentScroll.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNavigationButtons() {
    const prevBtn = $('prevBtn');
    const nextBtn = $('nextBtn');
    const prevBtnLabel = $('prevBtnLabel');
    const nextBtnLabel = $('nextBtnLabel');

    if (prevBtn) {
      if (currentIndex > 0) {
        prevBtn.disabled = false;
        const prevQ = questions[currentIndex - 1];
        if (prevBtnLabel) prevBtnLabel.textContent = prevQ.badge || `Q.${currentIndex}`;
      } else {
        prevBtn.disabled = true;
        if (prevBtnLabel) prevBtnLabel.textContent = 'Start';
      }
    }

    if (nextBtn) {
      if (currentIndex < questions.length - 1) {
        nextBtn.disabled = false;
        const nextQ = questions[currentIndex + 1];
        if (nextBtnLabel) nextBtnLabel.textContent = nextQ.badge || `Q.${currentIndex + 2}`;
      } else {
        nextBtn.disabled = true;
        if (nextBtnLabel) nextBtnLabel.textContent = 'End';
      }
    }
  }

  function showEmptyState() {
    const noteCard = $('noteCard');
    const emptyStateCard = $('emptyStateCard');
    const editCurrentQBtn = $('editCurrentQBtn');

    if (noteCard) noteCard.style.display = 'none';
    if (emptyStateCard) emptyStateCard.style.display = 'block';
    if (editCurrentQBtn) editCurrentQBtn.style.display = 'none';
  }

  function hideEmptyState() {
    const noteCard = $('noteCard');
    const emptyStateCard = $('emptyStateCard');
    const editCurrentQBtn = $('editCurrentQBtn');

    if (noteCard) noteCard.style.display = 'block';
    if (emptyStateCard) emptyStateCard.style.display = 'none';
    if (editCurrentQBtn) editCurrentQBtn.style.display = 'inline-flex';
  }

  // --- Mark Done / Progress ---
  function toggleMarkDone() {
    if (questions.length === 0) return;
    const q = questions[currentIndex];
    if (!q) return;

    const markDoneCheckbox = $('markDoneCheckbox');
    if (markDoneCheckbox && markDoneCheckbox.checked) {
      completedSet.add(q.id);
      showToast('Marked as reviewed');
    } else {
      completedSet.delete(q.id);
    }

    try {
      localStorage.setItem('temp_notes_completed', JSON.stringify(Array.from(completedSet)));
    } catch (e) {}

    updateProgress();
    renderQuestionList();
  }

  function updateProgress() {
    const progressText = $('progressText');
    const progressFill = $('progressFill');
    const total = questions.length;
    const completed = Array.from(completedSet).filter(id => questions.some(q => q.id === id)).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressText) progressText.textContent = `${completed} / ${total}`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  function resetProgress() {
    if (confirm('Reset reviewed progress?')) {
      completedSet.clear();
      try {
        localStorage.setItem('temp_notes_completed', JSON.stringify([]));
      } catch (e) {}
      updateProgress();
      renderQuestionList();
      const markDoneCheckbox = $('markDoneCheckbox');
      if (markDoneCheckbox) markDoneCheckbox.checked = false;
      showToast('Progress reset');
    }
  }

  // --- Save / Delete Form Handler ---
  function handleSaveQuestion(e) {
    if (e && e.preventDefault) e.preventDefault();

    const editQuestionIndex = $('editQuestionIndex');
    const inputQuestionBadge = $('inputQuestionBadge');
    const inputQuestionCategory = $('inputQuestionCategory');
    const inputQuestionTitle = $('inputQuestionTitle');
    const inputQuestionAnswer = $('inputQuestionAnswer');

    const idx = editQuestionIndex ? parseInt(editQuestionIndex.value, 10) : -1;
    const badge = (inputQuestionBadge && inputQuestionBadge.value.trim()) || `Q.${questions.length + 1}`;
    const category = (inputQuestionCategory && inputQuestionCategory.value.trim()) || 'Principles of Management';
    const title = (inputQuestionTitle && inputQuestionTitle.value.trim()) || '';
    const answer = (inputQuestionAnswer && inputQuestionAnswer.value.trim()) || '';

    if (!title) {
      alert('Please enter a question title.');
      if (inputQuestionTitle) inputQuestionTitle.focus();
      return;
    }

    if (idx >= 0 && idx < questions.length) {
      // Edit existing
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
      // Add new question
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
    const editQuestionIndex = $('editQuestionIndex');
    const idx = editQuestionIndex ? parseInt(editQuestionIndex.value, 10) : -1;

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
    const exportCodeTextarea = $('exportCodeTextarea');
    const exportModal = $('exportModal');

    const code = `/**
 * Temp Notes - Questions Database
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
    if (exportCodeTextarea) exportCodeTextarea.value = code;
    if (exportModal) exportModal.classList.add('show');
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
    const sidebar = $('sidebar');
    const sidebarBackdrop = $('sidebarBackdrop');
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('show');
  }

  function closeSidebar() {
    const sidebar = $('sidebar');
    const sidebarBackdrop = $('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
  }

  // --- Toast ---
  let toastTimer = null;
  function showToast(msg) {
    const toast = $('toastNotification');
    if (!toast) return;
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    const sidebarToggleBtn = $('sidebarToggleBtn');
    const sidebarBackdrop = $('sidebarBackdrop');
    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', openSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

    // Profile Modal
    const editProfileBtn = $('editProfileBtn');
    const profileModal = $('profileModal');
    const closeProfileModalBtn = $('closeProfileModalBtn');
    const cancelProfileBtn = $('cancelProfileBtn');
    const profileForm = $('profileForm');
    const inputProfileName = $('inputProfileName');

    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        if (inputProfileName) inputProfileName.value = localStorage.getItem('temp_notes_profile_name') || 'Friend';
        if (profileModal) profileModal.classList.add('show');
        if (inputProfileName) inputProfileName.focus();
      });
    }

    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', () => profileModal.classList.remove('show'));
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => profileModal.classList.remove('show'));
    if (profileModal) {
      profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) profileModal.classList.remove('show');
      });
    }

    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (inputProfileName) saveProfile(inputProfileName.value);
        if (profileModal) profileModal.classList.remove('show');
      });
    }

    // Add / Edit Buttons
    const addQuestionBtn = $('addQuestionBtn');
    const emptyAddBtn = $('emptyAddBtn');
    const editCurrentQBtn = $('editCurrentQBtn');
    const closeModalBtn = $('closeModalBtn');
    const cancelModalBtn = $('cancelModalBtn');
    const deleteQuestionBtn = $('deleteQuestionBtn');
    const questionForm = $('questionForm');
    const questionEditModal = $('questionEditModal');

    if (addQuestionBtn) addQuestionBtn.addEventListener('click', window.openAddQuestionModal);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', window.openAddQuestionModal);
    if (editCurrentQBtn) editCurrentQBtn.addEventListener('click', window.openEditQuestionModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeQuestionModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeQuestionModal);
    if (deleteQuestionBtn) deleteQuestionBtn.addEventListener('click', handleDeleteQuestion);
    if (questionForm) questionForm.addEventListener('submit', handleSaveQuestion);

    if (questionEditModal) {
      questionEditModal.addEventListener('click', (e) => {
        if (e.target === questionEditModal) closeQuestionModal();
      });
    }

    // Nav Buttons
    const prevBtn = $('prevBtn');
    const nextBtn = $('nextBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) selectQuestion(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIndex < questions.length - 1) selectQuestion(currentIndex + 1);
      });
    }

    // Progress
    const markDoneCheckbox = $('markDoneCheckbox');
    const resetProgressBtn = $('resetProgressBtn');
    if (markDoneCheckbox) markDoneCheckbox.addEventListener('change', toggleMarkDone);
    if (resetProgressBtn) resetProgressBtn.addEventListener('click', resetProgress);

    // Export Modal
    const exportCodeBtn = $('exportCodeBtn');
    const exportModal = $('exportModal');
    const closeExportModalBtn = $('closeExportModalBtn');
    const copyExportCodeBtn = $('copyExportCodeBtn');
    const exportCodeTextarea = $('exportCodeTextarea');

    if (exportCodeBtn) exportCodeBtn.addEventListener('click', openExportModal);
    if (closeExportModalBtn && exportModal) closeExportModalBtn.addEventListener('click', () => exportModal.classList.remove('show'));
    if (exportModal) {
      exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) exportModal.classList.remove('show');
      });
    }
    if (copyExportCodeBtn && exportCodeTextarea) {
      copyExportCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(exportCodeTextarea.value).then(() => {
          showToast('Code copied to clipboard');
        });
      });
    }

    // Search
    const searchInput = $('searchInput');
    const clearSearchBtn = $('clearSearchBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (clearSearchBtn) clearSearchBtn.classList.toggle('show', searchQuery.length > 0);
        renderQuestionList();
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.remove('show');
        renderQuestionList();
        searchInput.focus();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          if (questionEditModal && questionEditModal.classList.contains('show')) closeQuestionModal();
          if (profileModal && profileModal.classList.contains('show')) profileModal.classList.remove('show');
          if (exportModal && exportModal.classList.contains('show')) exportModal.classList.remove('show');
          if (searchInput) searchInput.blur();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) selectQuestion(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) selectQuestion(currentIndex + 1);
      } else if (e.key === '/') {
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    });

    // Share & Print
    const copyShareBtn = $('copyShareBtn');
    const printBtn = $('printBtn');

    if (copyShareBtn) {
      copyShareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Link copied to clipboard');
        }).catch(() => {
          showToast('Link copied');
        });
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    window.addEventListener('hashchange', loadQuestionFromHash);
  }

  // --- Init ---
  function init() {
    loadProfile();
    loadQuestions();
    renderCategoryFilters();
    renderQuestionList();
    updateProgress();
    loadQuestionFromHash();
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

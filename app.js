// DELIMa 3.0 PWA Logic & Search Engine
// Dikemaskini untuk SK Ranggu (XBA3037)

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabKp = document.getElementById('tabKp');
  const tabName = document.getElementById('tabName');
  const sectionKp = document.getElementById('sectionKp');
  const sectionName = document.getElementById('sectionName');
  
  const inputKp = document.getElementById('inputKp');
  const clearKp = document.getElementById('clearKp');
  
  const selectKelas = document.getElementById('selectKelas');
  const inputNama = document.getElementById('inputNama');
  const clearNama = document.getElementById('clearNama');
  const chipsContainer = document.getElementById('chipsContainer');
  
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsCount = document.getElementById('resultsCount');
  const welcomeState = document.getElementById('welcomeState');
  const emptyState = document.getElementById('emptyState');
  
  const themeToggle = document.getElementById('themeToggle');
  const btnHelp = document.getElementById('btnHelp');
  const helpModal = document.getElementById('helpModal');
  const closeHelp = document.getElementById('closeHelp');
  
  const installBanner = document.getElementById('installBanner');
  const btnInstall = document.getElementById('btnInstall');
  const btnHeaderInstall = document.getElementById('btnHeaderInstall');
  const offlineIndicator = document.getElementById('offlineIndicator');
  const iosModal = document.getElementById('iosModal');
  const closeIosModal = document.getElementById('closeIosModal');

  let currentTab = 'kp'; // 'kp' or 'name'
  let activeYearFilter = null; // null or 1-6
  let deferredPrompt = null;
  let visibleLimit = 30; // limit cards rendered initially for max speed
  let currentMatchedStudents = [];

  // 1. Initial Data Prep
  const students = (typeof STUDENTS_DATA !== 'undefined' ? STUDENTS_DATA : []).map(s => {
    return {
      ...s,
      clean_kp: (s.no_kp || '').replace(/[^0-9A-Za-z]/g, '').toLowerCase(),
      clean_id_murid: (s.id_murid || '').replace(/[^0-9A-Za-z]/g, '').toLowerCase(),
      lower_name: (s.nama || '').toLowerCase(),
      lower_id_delima: (s.id_delima || '').toLowerCase()
    };
  });

  // Populate Classes Dropdown
  const distinctClasses = Array.from(new Set(students.map(s => s.kelas).filter(Boolean))).sort();
  distinctClasses.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    selectKelas.appendChild(opt);
  });

  // 2. Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        })
        .catch(err => {
          console.warn('[PWA] Service Worker failed:', err);
        });
    });
  }

  // Offline / Online Detection
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineIndicator.style.display = 'none';
    } else {
      offlineIndicator.style.display = 'block';
      showToast('Mod Luar Talian (Offline) Aktif. Data tersimpan masih boleh disemak.');
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // 3. PWA Installation Handler
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBanner) installBanner.style.display = 'flex';
    if (btnHeaderInstall) btnHeaderInstall.style.display = 'flex';
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', triggerInstall);
  }
  if (btnHeaderInstall) {
    btnHeaderInstall.addEventListener('click', () => {
      if (isIos() && !isInStandaloneMode()) {
        iosModal.classList.add('active');
      } else {
        triggerInstall();
      }
    });
  }

  function triggerInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted install');
          if (installBanner) installBanner.style.display = 'none';
        }
        deferredPrompt = null;
      });
    } else if (isIos() && !isInStandaloneMode()) {
      iosModal.classList.add('active');
    } else {
      showToast('Untuk pasang di skrin telefon, tekan menu pelayar (tiga titik ⋮) dan pilih "Pasang / Tambah ke Skrin Utama".');
    }
  }

  // 4. Tab Switching
  tabKp.addEventListener('click', () => {
    currentTab = 'kp';
    tabKp.classList.add('active');
    tabName.classList.remove('active');
    sectionKp.style.display = 'block';
    sectionName.style.display = 'none';
    inputKp.focus();
    handleSearch();
  });

  tabName.addEventListener('click', () => {
    currentTab = 'name';
    tabName.classList.add('active');
    tabKp.classList.remove('active');
    sectionKp.style.display = 'none';
    sectionName.style.display = 'block';
    inputNama.focus();
    handleSearch();
  });

  // 5. Input Clear Buttons
  inputKp.addEventListener('input', () => {
    clearKp.style.display = inputKp.value ? 'block' : 'none';
    handleSearch();
  });
  clearKp.addEventListener('click', () => {
    inputKp.value = '';
    clearKp.style.display = 'none';
    inputKp.focus();
    handleSearch();
  });

  inputNama.addEventListener('input', () => {
    clearNama.style.display = inputNama.value ? 'block' : 'none';
    handleSearch();
  });
  clearNama.addEventListener('click', () => {
    inputNama.value = '';
    clearNama.style.display = 'none';
    inputNama.focus();
    handleSearch();
  });

  selectKelas.addEventListener('change', () => {
    handleSearch();
  });

  // Year filter chips
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (!chip) return;
      const year = chip.dataset.year;
      
      chipsContainer.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
      if (activeYearFilter === year) {
        activeYearFilter = null;
        chip.classList.remove('active');
        chipsContainer.querySelector('[data-year="all"]').classList.add('active');
      } else {
        activeYearFilter = year === 'all' ? null : parseInt(year);
        chip.classList.add('active');
      }
      handleSearch();
    });
  }

  // 6. Search Algorithm
  function handleSearch() {
    visibleLimit = 30; // reset pagination limit
    let matched = [];

    if (currentTab === 'kp') {
      const rawKp = inputKp.value.trim();
      const query = rawKp.replace(/[^0-9A-Za-z]/g, '').toLowerCase();

      if (!query) {
        // Show welcome state
        renderState('welcome');
        return;
      }

      matched = students.filter(s => {
        // Check IC or Student ID
        return s.clean_kp.includes(query) || s.clean_id_murid.includes(query);
      });
    } else {
      // Tab Name & Class
      const nameQuery = inputNama.value.trim().toLowerCase();
      const selectedCls = selectKelas.value;

      if (!nameQuery && !selectedCls && !activeYearFilter) {
        renderState('welcome');
        return;
      }

      const nameWords = nameQuery ? nameQuery.split(/\s+/).filter(Boolean) : [];

      matched = students.filter(s => {
        // Class filter
        if (selectedCls && s.kelas !== selectedCls) {
          return false;
        }

        // Year filter
        if (activeYearFilter && s.tahun !== activeYearFilter) {
          return false;
        }

        // Name filter (all query words must be present)
        if (nameWords.length > 0) {
          const fullName = s.lower_name;
          const matchAll = nameWords.every(word => fullName.includes(word));
          if (!matchAll) return false;
        }

        return true;
      });
    }

    currentMatchedStudents = matched;

    if (matched.length === 0) {
      renderState('empty');
    } else {
      renderResults(matched);
    }
  }

  function renderState(type) {
    resultsContainer.innerHTML = '';
    if (type === 'welcome') {
      welcomeState.style.display = 'block';
      emptyState.style.display = 'none';
      resultsCount.textContent = 'Sedia untuk semakan';
    } else if (type === 'empty') {
      welcomeState.style.display = 'none';
      emptyState.style.display = 'block';
      resultsCount.textContent = '0 murid dijumpai';
    }
  }

  // Format IC nicely with hyphen: 190903120901 -> 190903-12-0901
  function formatIC(ic) {
    if (!ic) return '<span style="color:var(--text-light);font-style:italic">Tiada rekod</span>';
    const digitsOnly = ic.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 12) {
      return `${digitsOnly.substring(0, 6)}-${digitsOnly.substring(6, 8)}-${digitsOnly.substring(8)}`;
    }
    return ic;
  }

  // Render Student Cards
  function renderResults(list) {
    welcomeState.style.display = 'none';
    emptyState.style.display = 'none';
    resultsCount.textContent = `${list.length} murid ditemui`;

    const displayList = list.slice(0, visibleLimit);
    resultsContainer.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'students-grid';

    displayList.forEach(student => {
      const card = createStudentCard(student);
      grid.appendChild(card);
    });

    resultsContainer.appendChild(grid);

    // If more results exist, append Load More button
    if (list.length > visibleLimit) {
      const loadMoreBox = document.createElement('div');
      loadMoreBox.style.textAlign = 'center';
      loadMoreBox.style.margin = '1.5rem 0';

      const btnMore = document.createElement('button');
      btnMore.className = 'btn-mini';
      btnMore.style.padding = '0.75rem 1.5rem';
      btnMore.style.fontSize = '0.9rem';
      btnMore.textContent = `Papar Lebih Banyak (${list.length - visibleLimit} lagi)`;
      btnMore.addEventListener('click', () => {
        visibleLimit += 30;
        renderResults(list);
      });

      loadMoreBox.appendChild(btnMore);
      resultsContainer.appendChild(loadMoreBox);
    }
  }

  function createStudentCard(s) {
    const card = document.createElement('div');
    card.className = 'student-card';

    const yearClass = `badge-y${s.tahun || 1}`;
    const formattedKp = formatIC(s.no_kp);
    const pwd = s.password || `${s.nama.split(' ')[0]}@XBA3037`;
    const pwdDisplay = s.password ? s.password : `<span style="color:var(--accent)">${pwd} (Cadangan)</span>`;

    // WhatsApp Message Builder
    const waText = encodeURIComponent(
      `*MAKLUMAT AKAUN DELIMa 3.0*\n` +
      `Sekolah: SK Ranggu (XBA3037)\n` +
      `Nama Murid: ${s.nama}\n` +
      `Kelas: ${s.kelas}\n` +
      `No. Kad Pengenalan: ${s.no_kp || '-'}\n` +
      `--------------------------------\n` +
      `ID DELIMa: ${s.id_delima}\n` +
      `Kata Laluan: ${s.password || pwd}\n` +
      `--------------------------------\n` +
      `Pautan Portal: https://d3.delima.edu.my/applications\n\n` +
      `*Panduan:* Pilih "Sign In with Google" menggunakan ID & Kata Laluan di atas.`
    );

    card.innerHTML = `
      <div class="card-top">
        <span class="class-badge ${yearClass}">
          🎓 ${s.kelas}
        </span>
        ${s.catatan ? `<span class="stat-pill" style="background:var(--accent-light);color:var(--accent);font-weight:700">⚠️ ${s.catatan}</span>` : ''}
      </div>

      <h2 class="student-name">${s.nama}</h2>

      <div class="student-meta-row">
        <div class="meta-item">
          <span>Kad Pengenalan:</span>
          <span class="meta-value">${formattedKp}</span>
        </div>
        ${s.id_murid ? `
        <div class="meta-item">
          <span>ID Murid:</span>
          <span class="meta-value">${s.id_murid}</span>
        </div>` : ''}
      </div>

      <div class="credentials-box">
        <!-- ID DELIMa -->
        <div class="cred-item">
          <div class="cred-label">
            <span>ID DELIMa (Emel Google)</span>
          </div>
          <div class="cred-display">
            <span class="cred-val" title="${s.id_delima}">${s.id_delima}</span>
            <div class="cred-actions">
              <button class="btn-mini btn-copy-id" data-copy="${s.id_delima}" title="Salin ID">
                📋 Salin
              </button>
            </div>
          </div>
        </div>

        <!-- Kata Laluan -->
        <div class="cred-item">
          <div class="cred-label">
            <span>Kata Laluan Asal</span>
          </div>
          <div class="cred-display">
            <span class="cred-val pwd-masked" data-actual="${s.password || pwd}">••••••••••••</span>
            <div class="cred-actions">
              <button class="btn-mini btn-toggle-pwd" title="Papar/Sembunyi Kata Laluan">
                👁️ Papar
              </button>
              <button class="btn-mini btn-copy-pwd" data-copy="${s.password || pwd}" title="Salin Kata Laluan">
                📋 Salin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <a href="https://d3.delima.edu.my/applications" target="_blank" rel="noopener noreferrer" class="btn-primary">
          🚀 Buka DELIMa 3.0
        </a>
        <a href="https://wa.me/?text=${waText}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" title="Kongsi maklumat ini melalui WhatsApp">
          📱 WhatsApp
        </a>
      </div>
    `;

    // Attach Event Listeners for this card
    const btnCopyId = card.querySelector('.btn-copy-id');
    btnCopyId.addEventListener('click', () => {
      copyToClipboard(s.id_delima, btnCopyId, 'ID DELIMa berjaya disalin!');
    });

    const btnCopyPwd = card.querySelector('.btn-copy-pwd');
    btnCopyPwd.addEventListener('click', () => {
      copyToClipboard(s.password || pwd, btnCopyPwd, 'Kata Laluan berjaya disalin!');
    });

    const btnTogglePwd = card.querySelector('.btn-toggle-pwd');
    const pwdText = card.querySelector('.pwd-masked');
    let isRevealed = false;

    btnTogglePwd.addEventListener('click', () => {
      isRevealed = !isRevealed;
      if (isRevealed) {
        pwdText.textContent = s.password || pwd;
        btnTogglePwd.innerHTML = '🙈 Tutup';
      } else {
        pwdText.textContent = '••••••••••••';
        btnTogglePwd.innerHTML = '👁️ Papar';
      }
    });

    return card;
  }

  // 7. Copy to Clipboard Functionality
  function copyToClipboard(text, buttonElement, message) {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        handleCopySuccess(buttonElement, message);
      }).catch(() => {
        fallbackCopyText(text, buttonElement, message);
      });
    } else {
      fallbackCopyText(text, buttonElement, message);
    }
  }

  function fallbackCopyText(text, buttonElement, message) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      handleCopySuccess(buttonElement, message);
    } catch (err) {
      showToast('Gagal menyalin, sila salin secara manual.');
    }
    document.body.removeChild(textArea);
  }

  function handleCopySuccess(buttonElement, message) {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '✔ Disalin!';
    buttonElement.classList.add('copied');
    showToast(message);
    setTimeout(() => {
      buttonElement.innerHTML = originalText;
      buttonElement.classList.remove('copied');
    }, 2000);
  }

  // 8. Toast Alert
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 9. Theme Toggle (Dark/Light)
  const savedTheme = localStorage.getItem('delima_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('delima_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // 10. Help Modal
  btnHelp.addEventListener('click', () => helpModal.classList.add('active'));
  closeHelp.addEventListener('click', () => helpModal.classList.remove('active'));
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.remove('active');
  });

  // iOS Install Modal
  if (closeIosModal) {
    closeIosModal.addEventListener('click', () => iosModal.classList.remove('active'));
  }
  if (iosModal) {
    iosModal.addEventListener('click', (e) => {
      if (e.target === iosModal) iosModal.classList.remove('active');
    });
  }

  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      helpModal.classList.remove('active');
      if (iosModal) iosModal.classList.remove('active');
    }
  });

  // Initial render
  handleSearch();
});

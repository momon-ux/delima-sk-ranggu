// DELIMa 3.0 PWA Deluxe Engine & Logic
// Pembangun Sistem: Mohammad Fikrey bin Abdul Gapar (momon-ux)
// Unit Pengurusan Data & ICT SK Ranggu, Tawau (XBA3037)

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Search & Filter
  const tabKp = document.getElementById('tabKp');
  const tabName = document.getElementById('tabName');
  const sectionKp = document.getElementById('sectionKp');
  const sectionName = document.getElementById('sectionName');
  
  const inputKp = document.getElementById('inputKp');
  const clearKp = document.getElementById('clearKp');
  
  const selectKelas = document.getElementById('selectKelas');
  const inputNama = document.getElementById('inputNama');
  const clearNama = document.getElementById('clearNama');
  const btnVoiceSearch = document.getElementById('btnVoiceSearch');
  const chipsContainer = document.getElementById('chipsContainer');
  
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsCount = document.getElementById('resultsCount');
  const welcomeState = document.getElementById('welcomeState');
  const emptyState = document.getElementById('emptyState');
  
  // Header & Modals
  const greetingText = document.getElementById('greetingText');
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

  // Realtime Clock & Calendar Elements
  const liveClock = document.getElementById('liveClock');
  const liveDate = document.getElementById('liveDate');
  const liveHijri = document.getElementById('liveHijri');
  const btnOpenCalendar = document.getElementById('btnOpenCalendar');
  const calendarModal = document.getElementById('calendarModal');
  const closeCalModal = document.getElementById('closeCalModal');
  const calMonthYearTitle = document.getElementById('calMonthYearTitle');
  const calDaysGrid = document.getElementById('calDaysGrid');
  const btnPrevMonth = document.getElementById('btnPrevMonth');
  const btnNextMonth = document.getElementById('btnNextMonth');

  // Printable Digital Student Card Elements
  const printableSlipModal = document.getElementById('printableSlipModal');
  const closeSlipModal = document.getElementById('closeSlipModal');
  const slipNama = document.getElementById('slipNama');
  const slipKelas = document.getElementById('slipKelas');
  const slipKp = document.getElementById('slipKp');
  const slipIdDelima = document.getElementById('slipIdDelima');
  const slipPassword = document.getElementById('slipPassword');
  const slipQrCode = document.getElementById('slipQrCode');
  const btnPrintSlip = document.getElementById('btnPrintSlip');
  const btnShareSlipWa = document.getElementById('btnShareSlipWa');

  let currentTab = 'kp';
  let activeYearFilter = null;
  let deferredPrompt = null;
  let visibleLimit = 30;
  let currentMatchedStudents = [];
  let currentCardStudent = null;
  let calCurrentDate = new Date();

  // 1. Data Prep
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

  // 2. Real-Time Clock & Dynamic Greeting
  const namaBulan = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const namaHari = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

  function updateLiveClock() {
    const now = new Date();
    
    // Time formatted with AM/PM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    if (liveClock) {
      liveClock.textContent = `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    }

    // Dynamic Greeting
    if (greetingText) {
      let ucapan = 'Selamat Datang';
      if (hours >= 5 && hours < 12) ucapan = 'Selamat Pagi';
      else if (hours >= 12 && hours < 14) ucapan = 'Selamat Tengah Hari';
      else if (hours >= 14 && hours < 19) ucapan = 'Selamat Petang';
      else ucapan = 'Selamat Malam';
      greetingText.innerHTML = `<span>👋</span><span>${ucapan}, Warga SK Ranggu</span>`;
    }

    // Date
    const dayName = namaHari[now.getDay()];
    const dayDate = now.getDate();
    const monthName = namaBulan[now.getMonth()];
    const year = now.getFullYear();
    if (liveDate) {
      liveDate.textContent = `${dayName}, ${dayDate} ${monthName} ${year}`;
    }

    // Hijri Date Calculation (Approximate Intl)
    if (liveHijri) {
      try {
        const hijriFormatter = new Intl.DateTimeFormat('ms-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        liveHijri.textContent = `${hijriFormatter.format(now)} Hijrah`;
      } catch (e) {
        liveHijri.textContent = 'Sesi Persekolahan 2026';
      }
    }
  }

  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // 3. Interactive Calendar
  function renderCalendar(dateObj) {
    if (!calDaysGrid) return;
    calDaysGrid.innerHTML = '';
    
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    
    if (calMonthYearTitle) {
      calMonthYearTitle.textContent = `${namaBulan[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Empty cells for offset
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      calDaysGrid.appendChild(emptyCell);
    }

    // Days of month
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = day;

      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        cell.classList.add('today');
        cell.title = 'Hari Ini';
      }

      calDaysGrid.appendChild(cell);
    }
  }

  if (btnOpenCalendar) {
    btnOpenCalendar.addEventListener('click', () => {
      renderCalendar(calCurrentDate);
      calendarModal.classList.add('active');
    });
  }

  if (closeCalModal) {
    closeCalModal.addEventListener('click', () => calendarModal.classList.remove('active'));
  }
  if (calendarModal) {
    calendarModal.addEventListener('click', (e) => {
      if (e.target === calendarModal) calendarModal.classList.remove('active');
    });
  }

  if (btnPrevMonth) {
    btnPrevMonth.addEventListener('click', () => {
      calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
      renderCalendar(calCurrentDate);
    });
  }
  if (btnNextMonth) {
    btnNextMonth.addEventListener('click', () => {
      calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
      renderCalendar(calCurrentDate);
    });
  }

  // 4. Voice Search (Web Speech API)
  if (btnVoiceSearch) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ms-MY';
      recognition.interimResults = false;

      recognition.onstart = () => {
        btnVoiceSearch.textContent = '🔴';
        showToast('Sila sebut nama anak anda sekarang...');
      };

      recognition.onresult = (e) => {
        const spokenText = e.results[0][0].transcript;
        inputNama.value = spokenText;
        clearNama.style.display = 'block';
        showToast(`Mencari: "${spokenText}"`);
        handleSearch();
      };

      recognition.onerror = () => {
        btnVoiceSearch.textContent = '🎙️';
        showToast('Suara tidak dikesan, sila cuba lagi.');
      };

      recognition.onend = () => {
        btnVoiceSearch.textContent = '🎙️';
      };

      btnVoiceSearch.addEventListener('click', () => {
        try {
          recognition.start();
        } catch (err) {
          recognition.stop();
        }
      });
    } else {
      btnVoiceSearch.style.display = 'none'; // Not supported on current browser
    }
  }

  // 5. Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[PWA] Service Worker aktif:', reg.scope))
        .catch(err => console.warn('[PWA] SW ralat:', err));
    });
  }

  // Online / Offline Status
  function updateOnlineStatus() {
    if (navigator.onLine) {
      if (offlineIndicator) offlineIndicator.style.display = 'none';
    } else {
      if (offlineIndicator) offlineIndicator.style.display = 'block';
      showToast('Mod Luar Talian (Offline) Aktif. Rekod masih boleh disemak.');
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // 6. PWA Installation
  const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBanner) installBanner.style.display = 'block';
    if (btnHeaderInstall) btnHeaderInstall.style.display = 'inline-flex';
  });

  if (btnInstall) btnInstall.addEventListener('click', triggerInstall);
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
          if (installBanner) installBanner.style.display = 'none';
          if (btnHeaderInstall) btnHeaderInstall.style.display = 'none';
        }
        deferredPrompt = null;
      });
    } else if (isIos() && !isInStandaloneMode()) {
      iosModal.classList.add('active');
    } else {
      showToast('Tekan ikon menu ⋮ pada pelayar dan pilih "Install app / Tambah ke Skrin Utama".');
    }
  }

  // 7. Tabs & Filter Handlers
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

  selectKelas.addEventListener('change', handleSearch);

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

  // 8. Search Engine
  function handleSearch() {
    visibleLimit = 30;
    let matched = [];

    if (currentTab === 'kp') {
      const rawKp = inputKp.value.trim();
      const query = rawKp.replace(/[^0-9A-Za-z]/g, '').toLowerCase();

      if (!query) {
        renderState('welcome');
        return;
      }

      matched = students.filter(s => {
        return s.clean_kp.includes(query) || s.clean_id_murid.includes(query);
      });
    } else {
      const nameQuery = inputNama.value.trim().toLowerCase();
      const selectedCls = selectKelas.value;

      if (!nameQuery && !selectedCls && !activeYearFilter) {
        renderState('welcome');
        return;
      }

      const nameWords = nameQuery ? nameQuery.split(/\s+/).filter(Boolean) : [];

      matched = students.filter(s => {
        if (selectedCls && s.kelas !== selectedCls) return false;
        if (activeYearFilter && s.tahun !== activeYearFilter) return false;
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
      resultsCount.innerHTML = `<span>📋</span><span>Sedia untuk semakan</span>`;
    } else if (type === 'empty') {
      welcomeState.style.display = 'none';
      emptyState.style.display = 'block';
      resultsCount.innerHTML = `<span>❌</span><span>0 murid dijumpai</span>`;
    }
  }

  function formatIC(ic) {
    if (!ic) return '<span style="color:var(--text-light);font-style:italic">Tiada rekod</span>';
    const digitsOnly = ic.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 12) {
      return `${digitsOnly.substring(0, 6)}-${digitsOnly.substring(6, 8)}-${digitsOnly.substring(8)}`;
    }
    return ic;
  }

  // 9. Card Generator
  function renderResults(list) {
    welcomeState.style.display = 'none';
    emptyState.style.display = 'none';
    resultsCount.innerHTML = `<span>✅</span><span>${list.length} murid ditemui</span>`;

    const displayList = list.slice(0, visibleLimit);
    resultsContainer.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'students-grid';

    displayList.forEach(student => {
      const card = createStudentCard(student);
      grid.appendChild(card);
    });

    resultsContainer.appendChild(grid);

    if (list.length > visibleLimit) {
      const loadMoreBox = document.createElement('div');
      loadMoreBox.style.textAlign = 'center';
      loadMoreBox.style.margin = '2rem 0';

      const btnMore = document.createElement('button');
      btnMore.className = 'btn-mini';
      btnMore.style.padding = '0.85rem 1.75rem';
      btnMore.style.fontSize = '0.95rem';
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

    // WhatsApp Message
    const waText = encodeURIComponent(
      `*MAKLUMAT AKAUN DELIMa 3.0*\n` +
      `Sekolah: SK Ranggu Tawau (XBA3037)\n` +
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
        ${s.catatan ? `<span class="dev-badge" style="background:var(--accent-light);color:var(--accent);font-weight:800">⚠️ ${s.catatan}</span>` : ''}
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
            <span>ID DELIMa (Google Account)</span>
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
            <span>Kata Laluan</span>
          </div>
          <div class="cred-display">
            <span class="cred-val pwd-masked">••••••••••••</span>
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
          🚀 Buka Portal DELIMa 3.0
        </a>
        <button class="btn-card-secondary btn-open-slip" title="Jana Kad Pelajar Digital Beserta Kod QR">
          🪪 Kad Digital
        </button>
        <a href="https://wa.me/?text=${waText}" target="_blank" rel="noopener noreferrer" class="btn-card-secondary btn-whatsapp" title="Kongsi maklumat ini melalui WhatsApp">
          📱 WhatsApp
        </a>
      </div>
    `;

    // Event Handlers for Buttons
    const btnCopyId = card.querySelector('.btn-copy-id');
    btnCopyId.addEventListener('click', () => {
      copyToClipboard(s.id_delima, btnCopyId, 'ID DELIMa disalin!');
    });

    const btnCopyPwd = card.querySelector('.btn-copy-pwd');
    btnCopyPwd.addEventListener('click', () => {
      copyToClipboard(s.password || pwd, btnCopyPwd, 'Kata Laluan disalin!');
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

    // Open Digital Student Card Slip
    const btnOpenSlip = card.querySelector('.btn-open-slip');
    btnOpenSlip.addEventListener('click', () => {
      openDigitalCardModal(s, pwd);
    });

    return card;
  }

  // 10. Digital ID Card Modal with QR Code
  function openDigitalCardModal(s, pwd) {
    currentCardStudent = s;
    slipNama.textContent = s.nama;
    slipKelas.textContent = `🎓 ${s.kelas}`;
    slipKp.textContent = formatIC(s.no_kp);
    slipIdDelima.textContent = s.id_delima;
    slipPassword.textContent = s.password || pwd;

    // Generate QR Code
    if (typeof QRCode !== 'undefined' && slipQrCode) {
      slipQrCode.innerHTML = '';
      new QRCode(slipQrCode, {
        text: 'https://d3.delima.edu.my/applications',
        width: 90,
        height: 90,
        colorDark: '#1e3a8a',
        colorLight: '#ffffff'
      });
    }

    // WhatsApp handler for card
    btnShareSlipWa.onclick = () => {
      const text = encodeURIComponent(
        `*KAD PELAJAR DIGITAL DELIMa 3.0*\n` +
        `Sekolah: SK Ranggu Tawau (XBA3037)\n` +
        `Nama: ${s.nama}\n` +
        `Kelas: ${s.kelas}\n` +
        `No. KP: ${s.no_kp || '-'}\n` +
        `ID DELIMa: ${s.id_delima}\n` +
        `Kata Laluan: ${s.password || pwd}\n` +
        `Pautan: https://d3.delima.edu.my/applications`
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    printableSlipModal.classList.add('active');
  }

  if (closeSlipModal) {
    closeSlipModal.addEventListener('click', () => printableSlipModal.classList.remove('active'));
  }
  if (printableSlipModal) {
    printableSlipModal.addEventListener('click', (e) => {
      if (e.target === printableSlipModal) printableSlipModal.classList.remove('active');
    });
  }

  if (btnPrintSlip) {
    btnPrintSlip.addEventListener('click', () => {
      window.print();
    });
  }

  // 11. Clipboard Utility
  function copyToClipboard(text, buttonElement, message) {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        handleCopySuccess(buttonElement, message);
      }).catch(() => fallbackCopyText(text, buttonElement, message));
    } else {
      fallbackCopyText(text, buttonElement, message);
    }
  }

  function fallbackCopyText(text, buttonElement, message) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      handleCopySuccess(buttonElement, message);
    } catch (err) {
      showToast('Gagal menyalin.');
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

  // 12. Toast Feedback
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 13. Theme Toggle
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

  // 14. Modals
  btnHelp.addEventListener('click', () => helpModal.classList.add('active'));
  closeHelp.addEventListener('click', () => helpModal.classList.remove('active'));
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.remove('active');
  });

  if (closeIosModal) closeIosModal.addEventListener('click', () => iosModal.classList.remove('active'));
  if (iosModal) {
    iosModal.addEventListener('click', (e) => {
      if (e.target === iosModal) iosModal.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      helpModal.classList.remove('active');
      if (iosModal) iosModal.classList.remove('active');
      if (calendarModal) calendarModal.classList.remove('active');
      if (printableSlipModal) printableSlipModal.classList.remove('active');
    }
  });

  // Initial Search State
  handleSearch();
});

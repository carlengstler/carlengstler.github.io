/* ========================================
   Carl Engstler Portfolio — main.js
   ======================================== */

(function () {
  'use strict';

  // --- Stick Grid Background ---
  var stickCanvas = document.getElementById('stickGrid');
  if (stickCanvas) {
    var ctx = stickCanvas.getContext('2d');
    var stickSpacing = 32;
    var stickWidth = 3.75;
    var stickHeight = 18;
    var stickColor = '#013030';
    var stickOpacity = 0.6;
    var cols = 0;
    var rows = 0;
    var stickAngles = [];
    var animationPhase = 'wave-forward'; // wave-forward, hold-forward, wave-back, hold-back, done
    var waveCol = 0;
    var holdTimer = 0;
    var colDelayMs = 60;
    var singleRotMs = 800;
    var holdForwardMs = 2000;
    var holdBackMs = 3000;
    var lastTime = 0;
    var colTimers = [];
    var needsRedraw = true; // FIX 2: only redraw when angles change

    function initStickGrid() {
      stickCanvas.width = window.innerWidth;
      stickCanvas.height = window.innerHeight;
      cols = Math.ceil(stickCanvas.width / stickSpacing) + 1;
      rows = Math.ceil(stickCanvas.height / stickSpacing) + 1;
      stickAngles = [];
      colTimers = [];
      for (var c = 0; c < cols; c++) {
        stickAngles[c] = [];
        colTimers[c] = 0;
        for (var r = 0; r < rows; r++) {
          stickAngles[c][r] = 0;
        }
      }
      animationPhase = 'wave-forward';
      waveCol = 0;
      holdTimer = 0;
      needsRedraw = true;
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function updateSticks(dt) {
      needsRedraw = false; // FIX 2: assume no redraw needed unless angles change

      if (animationPhase === 'wave-forward') {
        holdTimer += dt;
        while (waveCol < cols && holdTimer >= waveCol * colDelayMs) {
          colTimers[waveCol] = holdTimer - waveCol * colDelayMs;
          waveCol++;
        }
        for (var c = 0; c < waveCol; c++) {
          colTimers[c] += dt;
          var progress = Math.min(colTimers[c] / singleRotMs, 1);
          var angle = easeInOut(progress) * 90;
          for (var r = 0; r < rows; r++) {
            stickAngles[c][r] = angle;
          }
        }
        needsRedraw = true; // FIX 2: angles changed
        if (waveCol >= cols) {
          var allDone = true;
          for (var c2 = 0; c2 < cols; c2++) {
            if (colTimers[c2] < singleRotMs) { allDone = false; break; }
          }
          if (allDone) {
            animationPhase = 'hold-forward';
            holdTimer = 0;
          }
        }
      } else if (animationPhase === 'hold-forward') {
        holdTimer += dt;
        if (holdTimer >= holdForwardMs) {
          animationPhase = 'wave-back';
          waveCol = 0;
          holdTimer = 0;
          for (var c3 = 0; c3 < cols; c3++) {
            colTimers[c3] = 0;
          }
        }
      } else if (animationPhase === 'wave-back') {
        holdTimer += dt;
        while (waveCol < cols && holdTimer >= waveCol * colDelayMs) {
          colTimers[waveCol] = holdTimer - waveCol * colDelayMs;
          waveCol++;
        }
        for (var c4 = 0; c4 < waveCol; c4++) {
          colTimers[c4] += dt;
          var progress2 = Math.min(colTimers[c4] / singleRotMs, 1);
          var angle2 = 90 - easeInOut(progress2) * 90;
          for (var r2 = 0; r2 < rows; r2++) {
            stickAngles[c4][r2] = angle2;
          }
        }
        needsRedraw = true; // FIX 2: angles changed
        if (waveCol >= cols) {
          var allDone2 = true;
          for (var c5 = 0; c5 < cols; c5++) {
            if (colTimers[c5] < singleRotMs) { allDone2 = false; break; }
          }
          if (allDone2) {
            animationPhase = 'hold-back';
            holdTimer = 0;
          }
        }
      } else if (animationPhase === 'hold-back') {
        holdTimer += dt;
        if (holdTimer >= holdBackMs) {
          animationPhase = 'done'; // FIX 3: stop after one full cycle
        }
      }
    }

    // FIX 1: batched draw — one beginPath + one stroke instead of ~2100
    function drawSticks() {
      ctx.clearRect(0, 0, stickCanvas.width, stickCanvas.height);
      ctx.globalAlpha = stickOpacity;
      ctx.strokeStyle = stickColor;
      ctx.lineWidth = stickWidth;
      ctx.lineCap = 'round';

      ctx.beginPath(); // FIX 1: single beginPath before the loop
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          var cx = c * stickSpacing + (r % 2 === 1 ? stickSpacing / 2 : 0);
          var cy = r * stickSpacing;
          var angle = (stickAngles[c] && stickAngles[c][r]) || 0;
          var rad = angle * Math.PI / 180;
          var dx = Math.sin(rad) * stickHeight / 2;
          var dy = Math.cos(rad) * stickHeight / 2;

          ctx.moveTo(cx - dx, cy - dy);
          ctx.lineTo(cx + dx, cy + dy);
        }
      }
      ctx.stroke(); // FIX 1: single stroke after the loop
      ctx.globalAlpha = 1;
    }

    function animateSticks(timestamp) {
      if (!lastTime) lastTime = timestamp;
      var dt = timestamp - lastTime;
      lastTime = timestamp;

      updateSticks(dt);
      if (needsRedraw) drawSticks(); // FIX 2: only draw when something changed
      // FIX 3: stop the loop when animation is done
      if (animationPhase !== 'done') {
        requestAnimationFrame(animateSticks);
      }
    }

    initStickGrid();
    requestAnimationFrame(animateSticks);

    window.addEventListener('resize', function () {
      initStickGrid();
      // Restart animation loop if it had stopped
      if (animationPhase === 'wave-forward') {
        lastTime = 0;
        requestAnimationFrame(animateSticks);
      }
    });
  }

  // --- Header scroll effect ---
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Homepage: Load project preview bubbles ---
  var bubbleB = document.querySelector('.bubble-b');
  var bubbleC = document.querySelector('.bubble-c');
  var bubbleD = document.querySelector('.bubble-d');

  if (bubbleB && bubbleC && bubbleD) {
    fetch('projects/projects.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var sorted = data.sort(function (a, b) { return a.order - b.order; });
        var bubbles = [
          { el: bubbleB, index: 0 },
          { el: bubbleC, index: 1 },
          { el: bubbleD, index: 2 }
        ];
        bubbles.forEach(function (b) {
          if (sorted[b.index]) {
            var project = sorted[b.index];
            var img = b.el.querySelector('.bubble-thumb');
            img.src = 'projects/' + encodeURIComponent(project.folder) + '/' + project.cover;
            img.alt = project.title + ' preview';
          }
        });
      });
  }

  // --- Contact form mailto ---
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = contactForm.querySelector('[name="email"]').value;
      var subject = contactForm.querySelector('[name="subject"]').value;
      var message = contactForm.querySelector('[name="message"]').value;
      var mailSubject = encodeURIComponent('WEBSITE — ' + subject + ' — by ' + email);
      var mailBody = encodeURIComponent(message);
      window.location.href = 'mailto:carl.engstler@gmail.com?subject=' + mailSubject + '&body=' + mailBody;
    });
  }

  // --- Projects page logic ---
  var projectsContainer = document.querySelector('.projects-container');
  if (!projectsContainer) return;

  var allProjects = [];
  var selectedProjectId = null;
  var currentView = 'wheel'; // 'wheel' or 'grid'
  var mouseOnLeft = true;
  var isTransitioning = false; // BUG 1 fix: prevent rapid switching

  var scrollWheels = document.getElementById('scrollWheels');
  var scrollColLeft = document.getElementById('scrollColLeft');
  var scrollColRight = document.getElementById('scrollColRight');
  var projectsGrid = document.getElementById('projectsGrid');
  var projectDetail = document.getElementById('projectDetail');
  var projectsRight = document.getElementById('projectsRight');
  var viewToggleBtn = document.getElementById('viewToggleBtn');
  var isMobile = window.innerWidth <= 768;

  window.addEventListener('resize', function () {
    isMobile = window.innerWidth <= 768;
  });

  // Track mouse position for scroll zone detection
  document.addEventListener('mousemove', function (e) {
    var threshold = window.innerWidth * 0.4444;
    mouseOnLeft = e.clientX < threshold;
  });

  // Scroll handling — BUG 2 fix: when no project selected, full viewport scrolls wheels
  projectsContainer.addEventListener('wheel', function (e) {
    if (isMobile) return;

    if (currentView === 'wheel') {
      if (selectedProjectId === null) {
        // No project selected — full viewport scrolls the wheels
        e.preventDefault();
        scrollColLeft.scrollTop -= e.deltaY;
        scrollColRight.scrollTop += e.deltaY;
        scheduleOpacityUpdate(); // FIX 6: debounced
      } else if (mouseOnLeft) {
        // Project selected, cursor on left — scroll wheels
        e.preventDefault();
        scrollColLeft.scrollTop -= e.deltaY;
        scrollColRight.scrollTop += e.deltaY;
        scheduleOpacityUpdate(); // FIX 6: debounced
      } else {
        // Project selected, cursor on right — scroll detail
        e.preventDefault();
        projectsRight.scrollTop += e.deltaY;
      }
    } else if (currentView === 'grid') {
      if (mouseOnLeft) {
        e.preventDefault();
        projectsGrid.scrollTop += e.deltaY;
      } else if (selectedProjectId !== null) {
        e.preventDefault();
        projectsRight.scrollTop += e.deltaY;
      }
    }
  }, { passive: false });

  // Load project data
  fetch('projects/projects.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      allProjects = data.sort(function (a, b) { return a.order - b.order; });
      renderWheelView();
      renderGridView();

      requestAnimationFrame(function () {
        centerScrollColumns();
        updateCardOpacities();
      });

      // Check for ?project=N query parameter
      var urlParams = new URLSearchParams(window.location.search);
      var projectParam = urlParams.get('project');
      if (projectParam) {
        var projectId = parseInt(projectParam);
        if (!isNaN(projectId)) {
          setTimeout(function () {
            handleProjectClick(projectId);
          }, 300);
        }
      }
    });

  // Render scroll wheel view
  function renderWheelView() {
    scrollColLeft.innerHTML = '';
    scrollColRight.innerHTML = '';

    var half = Math.ceil(allProjects.length / 2);
    var leftProjects = allProjects.slice(0, half);
    var rightProjects = allProjects.slice(half);

    leftProjects.forEach(function (p) {
      scrollColLeft.appendChild(createProjectCard(p));
    });

    rightProjects.forEach(function (p) {
      scrollColRight.appendChild(createProjectCard(p));
    });
  }

  // Create a project card element
  function createProjectCard(project) {
    var card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.order;

    var img = document.createElement('img');
    img.className = 'project-card-image';
    img.src = 'projects/' + encodeURIComponent(project.folder) + '/' + project.cover;
    img.alt = project.title;
    img.loading = 'lazy';

    var title = document.createElement('h3');
    title.textContent = project.title;

    var desc = document.createElement('p');
    desc.className = 'project-card-desc';
    desc.textContent = project.description;

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(desc);

    card.addEventListener('click', function () {
      handleProjectClick(project.order);
    });

    return card;
  }

  // Render grid view
  function renderGridView() {
    projectsGrid.innerHTML = '';

    allProjects.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'grid-card';
      card.dataset.projectId = p.order;

      var img = document.createElement('img');
      img.className = 'grid-card-image';
      img.src = 'projects/' + encodeURIComponent(p.folder) + '/' + p.cover;
      img.alt = p.title;
      img.loading = 'lazy';

      var title = document.createElement('h3');
      title.textContent = p.title;

      card.appendChild(img);
      card.appendChild(title);

      card.addEventListener('click', function () {
        handleProjectClick(p.order);
      });

      projectsGrid.appendChild(card);
    });
  }

  // Handle project selection — BUG 1 fix: guard against rapid clicks
  function handleProjectClick(projectId) {
    if (isTransitioning) return;

    if (selectedProjectId === projectId) {
      deselectProject();
      return;
    }

    // If another project was selected, immediately replace (no close animation)
    if (selectedProjectId !== null) {
      projectDetail.classList.remove('active', 'closing');
    }

    selectedProjectId = projectId;
    var project = allProjects.find(function (p) { return p.order === projectId; });
    if (!project) return;

    if (isMobile) {
      showMobilePopup(project);
    } else {
      showProjectDetail(project);
    }
    updateDimming();
  }

  // Show project detail in right panel
  function showProjectDetail(project) {
    var folderPath = 'projects/' + encodeURIComponent(project.folder) + '/';

    var html = '';
    html += '<img class="detail-hero" src="' + folderPath + project.hero + '" alt="' + escapeHtml(project.title) + ' hero image">';
    html += '<h2>' + escapeHtml(project.title) + '</h2>';
    html += '<p class="detail-description">' + escapeHtml(project.description) + '</p>';
    html += '<div class="detail-images">';
    project.images.forEach(function (imgFile) {
      html += '<img src="' + folderPath + imgFile + '" alt="' + escapeHtml(project.title) + '" loading="lazy">';
    });
    html += '</div>';

    projectDetail.innerHTML = html;
    projectDetail.className = 'project-detail active';
    projectsRight.scrollTop = 0;
  }

  // Deselect project — BUG 1 fix: use transition guard
  function deselectProject() {
    if (isTransitioning) return;
    isTransitioning = true;

    projectDetail.classList.remove('active');
    projectDetail.classList.add('closing');

    setTimeout(function () {
      projectDetail.classList.remove('closing');
      projectDetail.innerHTML = '';
      projectDetail.style.display = '';
      selectedProjectId = null;
      isTransitioning = false;
      updateDimming();
    }, 350);
  }

  // Update dimming on all cards
  function updateDimming() {
    var allCards = document.querySelectorAll('.project-card, .grid-card');
    allCards.forEach(function (card) {
      var id = parseInt(card.dataset.projectId);
      card.classList.remove('dimmed', 'selected');

      if (selectedProjectId !== null) {
        // Clear inline opacity set by scroll proximity so CSS classes take effect
        card.style.opacity = '';
        if (id === selectedProjectId) {
          card.classList.add('selected');
        } else {
          card.classList.add('dimmed');
        }
      }
    });
  }

  // Update center-based opacity for scroll wheel cards
  function updateCardOpacities() {
    if (currentView !== 'wheel') return;

    [scrollColLeft, scrollColRight].forEach(function (col) {
      var colRect = col.getBoundingClientRect();
      var colCenter = colRect.top + colRect.height / 2;

      var cards = col.querySelectorAll('.project-card');
      cards.forEach(function (card) {
        if (selectedProjectId !== null) return;
        var cardRect = card.getBoundingClientRect();
        var cardCenter = cardRect.top + cardRect.height / 2;
        var distance = Math.abs(colCenter - cardCenter);
        var maxDist = colRect.height / 2;
        var opacity = 1 - (distance / maxDist) * 0.5;
        opacity = Math.max(0.5, Math.min(1, opacity));

        card.style.opacity = opacity;
        card.classList.toggle('center', distance < cardRect.height * 0.5);
      });
    });
  }

  // FIX 6: debounce opacity updates to once per frame
  var opacityRafPending = false;
  function scheduleOpacityUpdate() {
    if (opacityRafPending) return;
    opacityRafPending = true;
    requestAnimationFrame(function () {
      opacityRafPending = false;
      updateCardOpacities();
    });
  }

  // Center scroll columns initially
  function centerScrollColumns() {
    [scrollColLeft, scrollColRight].forEach(function (col) {
      var scrollHeight = col.scrollHeight;
      var clientHeight = col.clientHeight;
      col.scrollTop = (scrollHeight - clientHeight) / 2;
    });
  }

  // Listen for scroll on columns to update opacities
  scrollColLeft.addEventListener('scroll', scheduleOpacityUpdate); // FIX 6: debounced
  scrollColRight.addEventListener('scroll', scheduleOpacityUpdate); // FIX 6: debounced

  // View toggle with cross-fade
  viewToggleBtn.addEventListener('click', function () {
    if (currentView === 'wheel') {
      scrollWheels.classList.add('fade-out');
      setTimeout(function () {
        currentView = 'grid';
        scrollWheels.style.display = 'none';
        scrollWheels.classList.remove('fade-out');
        // Show grid: set display first, then fade in opacity on next frame
        projectsGrid.classList.remove('active');
        projectsGrid.style.display = 'grid';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            projectsGrid.classList.add('active');
          });
        });
        viewToggleBtn.textContent = 'VIEW WHEEL';
      }, 400);
    } else {
      projectsGrid.classList.remove('active');
      setTimeout(function () {
        currentView = 'wheel';
        projectsGrid.style.display = 'none';
        projectsGrid.style.opacity = '';
        scrollWheels.style.display = 'flex';
        viewToggleBtn.textContent = 'VIEW GRID';
        requestAnimationFrame(function () {
          updateCardOpacities();
        });
      }, 400);
    }
  });

  // --- Mobile project popup ---
  function showMobilePopup(project) {
    var existing = document.querySelector('.mobile-popup-overlay');
    if (existing) existing.remove();

    var folderPath = 'projects/' + encodeURIComponent(project.folder) + '/';

    var overlay = document.createElement('div');
    overlay.className = 'mobile-popup-overlay';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-popup-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');

    var content = document.createElement('div');
    content.className = 'mobile-popup-content';

    var html = '';
    html += '<img class="detail-hero" src="' + folderPath + project.hero + '" alt="' + escapeHtml(project.title) + ' hero image">';
    html += '<h2>' + escapeHtml(project.title) + '</h2>';
    html += '<p class="detail-description">' + escapeHtml(project.description) + '</p>';
    html += '<div class="detail-images">';
    project.images.forEach(function (imgFile) {
      html += '<img src="' + folderPath + imgFile + '" alt="' + escapeHtml(project.title) + '" loading="lazy">';
    });
    html += '</div>';

    content.innerHTML = html;
    overlay.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.classList.add('popup-open');

    requestAnimationFrame(function () {
      overlay.classList.add('open');
    });

    closeBtn.addEventListener('click', function () {
      closeMobilePopup(overlay);
    });
  }

  function closeMobilePopup(overlay) {
    overlay.classList.remove('open');
    overlay.classList.add('closing');
    document.body.classList.remove('popup-open');
    selectedProjectId = null;
    updateDimming();

    setTimeout(function () {
      overlay.remove();
    }, 400);
  }

  // Helper: escape HTML to prevent XSS
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();

/* ========================================
   Carl Engstler Portfolio — main.js
   ======================================== */

(function () {
  'use strict';

  // --- Header scroll effect ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Contact form mailto ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = contactForm.querySelector('[name="email"]').value;
      const subject = contactForm.querySelector('[name="subject"]').value;
      const message = contactForm.querySelector('[name="message"]').value;
      const mailSubject = encodeURIComponent('WEBSITE — ' + subject + ' — by ' + email);
      const mailBody = encodeURIComponent(message);
      window.location.href = 'mailto:carl.engstler@gmail.com?subject=' + mailSubject + '&body=' + mailBody;
    });
  }

  // --- Projects page logic ---
  const projectsContainer = document.querySelector('.projects-container');
  if (!projectsContainer) return;

  let allProjects = [];
  let selectedProjectId = null;
  let currentView = 'wheel'; // 'wheel' or 'grid'
  let mouseOnLeft = true;

  const scrollWheels = document.getElementById('scrollWheels');
  const scrollColLeft = document.getElementById('scrollColLeft');
  const scrollColRight = document.getElementById('scrollColRight');
  const projectsGrid = document.getElementById('projectsGrid');
  const projectDetail = document.getElementById('projectDetail');
  const projectsRight = document.getElementById('projectsRight');
  const viewToggleBtn = document.getElementById('viewToggleBtn');

  // Track mouse position for scroll zone detection
  document.addEventListener('mousemove', function (e) {
    const threshold = window.innerWidth * 0.4444;
    mouseOnLeft = e.clientX < threshold;
  });

  // Scroll handling: only scroll the active side
  projectsContainer.addEventListener('wheel', function (e) {
    if (window.innerWidth <= 768) return; // Let mobile scroll naturally

    if (mouseOnLeft && currentView === 'wheel') {
      e.preventDefault();
      // Left column scrolls inverted, right column scrolls normally
      scrollColLeft.scrollTop -= e.deltaY;
      scrollColRight.scrollTop += e.deltaY;
      updateCardOpacities();
    } else if (mouseOnLeft && currentView === 'grid') {
      e.preventDefault();
      projectsGrid.scrollTop += e.deltaY;
    } else if (!mouseOnLeft && selectedProjectId !== null) {
      e.preventDefault();
      projectsRight.scrollTop += e.deltaY;
    }
  }, { passive: false });

  // Load project data
  fetch('projects/projects.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      allProjects = data.sort(function (a, b) { return a.order - b.order; });
      renderWheelView();
      renderGridView();

      // Initial center after a short delay for layout
      requestAnimationFrame(function () {
        centerScrollColumns();
        updateCardOpacities();
      });
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

  // Handle project selection
  function handleProjectClick(projectId) {
    if (selectedProjectId === projectId) {
      // Deselect
      deselectProject();
      return;
    }

    selectedProjectId = projectId;
    var project = allProjects.find(function (p) { return p.order === projectId; });
    if (!project) return;

    showProjectDetail(project);
    updateDimming();
  }

  // Show project detail in right panel
  function showProjectDetail(project) {
    var folderPath = 'projects/' + encodeURIComponent(project.folder) + '/';

    var html = '';
    html += '<img class="detail-hero" src="' + folderPath + project.hero + '" alt="' + project.title + ' hero image">';
    html += '<h2>' + project.title + '</h2>';
    html += '<p class="detail-description">' + project.description + '</p>';
    html += '<div class="detail-images">';
    project.images.forEach(function (imgFile) {
      html += '<img src="' + folderPath + imgFile + '" alt="' + project.title + '" loading="lazy">';
    });
    html += '</div>';

    projectDetail.innerHTML = html;
    projectDetail.className = 'project-detail active';
    projectsRight.scrollTop = 0;
  }

  // Deselect project
  function deselectProject() {
    projectDetail.classList.remove('active');
    projectDetail.classList.add('closing');

    setTimeout(function () {
      projectDetail.classList.remove('closing');
      projectDetail.innerHTML = '';
      projectDetail.style.display = 'none';
      selectedProjectId = null;
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
        if (selectedProjectId !== null) return; // Dimming takes priority
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

  // Center scroll columns initially
  function centerScrollColumns() {
    [scrollColLeft, scrollColRight].forEach(function (col) {
      var scrollHeight = col.scrollHeight;
      var clientHeight = col.clientHeight;
      col.scrollTop = (scrollHeight - clientHeight) / 2;
    });
  }

  // Listen for scroll on columns to update opacities
  scrollColLeft.addEventListener('scroll', updateCardOpacities);
  scrollColRight.addEventListener('scroll', updateCardOpacities);

  // View toggle with cross-fade
  viewToggleBtn.addEventListener('click', function () {
    if (currentView === 'wheel') {
      // Fade out wheels
      scrollWheels.classList.add('fade-out');
      setTimeout(function () {
        currentView = 'grid';
        scrollWheels.style.display = 'none';
        scrollWheels.classList.remove('fade-out');
        // Show grid with fade-in
        projectsGrid.classList.add('active');
        viewToggleBtn.textContent = 'VIEW WHEEL';
      }, 400);
    } else {
      // Fade out grid
      projectsGrid.style.opacity = '0';
      setTimeout(function () {
        currentView = 'wheel';
        projectsGrid.classList.remove('active');
        projectsGrid.style.opacity = '';
        // Show wheels with fade-in
        scrollWheels.style.display = 'flex';
        viewToggleBtn.textContent = 'VIEW ALL';
        requestAnimationFrame(function () {
          updateCardOpacities();
        });
      }, 400);
    }
  });

})();

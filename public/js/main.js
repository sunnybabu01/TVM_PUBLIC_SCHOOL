/**
 * TVM ERP Portal - Core Client Operations
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[TVM ERP] Client Scripts initialized.');

  // 0. Theme Toggle System (Dark / Light Mode)
  const themeToggles = document.querySelectorAll('.theme-toggle');
  
  // Set initial icon based on active theme
  themeToggles.forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon) {
      const isLight = document.documentElement.classList.contains('light-mode');
      icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  });

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('tvm-theme', isLight ? 'light' : 'dark');
      
      // Update all toggles globally
      themeToggles.forEach(otherBtn => {
        const icon = otherBtn.querySelector('i');
        if (icon) {
          icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
      });
    });
  });

  // 1. Sidebar Responsive Toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar-tvm');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('show');
    });

    // Close sidebar clicking outside
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('show') && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('show');
      }
    });
  }

  // 2. Dismiss Flash Alerts automatically after 5 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.6s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 600);
    }, 5000);
  });

  // 3. Simple Client Side print triggers
  const printButtons = document.querySelectorAll('.btn-print-trigger');
  printButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      window.print();
    });
  });

  // 4. Input validator feedback styling
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;
        
        // Re-enable after timeout in case of failure or slow response
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }, 8000);
      }
    });
  });
});

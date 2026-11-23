/**
 * Gakkou No Shiken Admin — DropX Theme Switcher (Dark / Light), Ctrl+K Search,
 * Instant File Auto-Save & Sticky Save Helpers
 */
function initAdminEnhancements() {
    // ============================================================
    // 0. DropX Dark / Light Mode Toggle + Fullscreen + Ctrl+K Search
    // ============================================================
    function applyAdminTheme(mode) {
        const cleanMode = mode === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', cleanMode);
        document.documentElement.setAttribute('data-dropx-theme', cleanMode);
        const sidebar = document.getElementById('jazzy-sidebar');
        if (sidebar) {
            sidebar.setAttribute('data-bs-theme', cleanMode);
        }
        try {
            localStorage.setItem('jazzmin-theme-mode', cleanMode);
        } catch (e) {}

        const toggleBtn = document.getElementById('gakkou-theme-toggle-btn');
        if (toggleBtn) {
            if (cleanMode === 'dark') {
                toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
                toggleBtn.title = 'Switch to Light Mode';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
                toggleBtn.title = 'Switch to Dark Mode';
            }
        }
    }

    // Initialize current theme immediately
    const initialMode = (function () {
        try {
            const s = localStorage.getItem('jazzmin-theme-mode');
            return s === 'light' || s === 'dark' ? s : 'dark';
        } catch (e) {
            return 'dark';
        }
    })();
    applyAdminTheme(initialMode);

    // Inject Theme Toggle & Fullscreen buttons into top-right navbar
    const rightNav = document.querySelector('#jazzy-navbar .navbar-nav.ms-auto');
    if (rightNav && !document.getElementById('gakkou-theme-toggle-item')) {
        // Fullscreen button
        const fsLi = document.createElement('li');
        fsLi.className = 'nav-item d-none d-sm-flex align-items-center';
        fsLi.innerHTML = `
            <button type="button" id="gakkou-fullscreen-btn" class="dropx-nav-icon-btn" title="Toggle Fullscreen">
                <i class="fas fa-expand-alt"></i>
            </button>
        `;
        rightNav.insertBefore(fsLi, rightNav.firstChild);

        // Theme toggle button (Sun / Moon)
        const themeLi = document.createElement('li');
        themeLi.id = 'gakkou-theme-toggle-item';
        themeLi.className = 'nav-item d-flex align-items-center';
        themeLi.innerHTML = `
            <button type="button" id="gakkou-theme-toggle-btn" class="dropx-nav-icon-btn active-theme-btn" title="Toggle Dark / Light Mode">
                <i class="fas ${initialMode === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
            </button>
        `;
        rightNav.insertBefore(themeLi, rightNav.firstChild.nextSibling);

        const themeBtn = document.getElementById('gakkou-theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const current = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                applyAdminTheme(next);
                showToastFeedback(next === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
            });
        }

        const fsBtn = document.getElementById('gakkou-fullscreen-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                } else {
                    document.exitFullscreen?.();
                }
            });
        }
    }

    // Add "Ctrl K" badge inside navbar search box
    const searchGroup = document.querySelector('#jazzy-navbar .input-group');
    const searchInput = document.querySelector('#jazzy-navbar .form-control-navbar');
    if (searchGroup && searchInput && !searchGroup.querySelector('.dropx-kbd-hint')) {
        searchInput.placeholder = 'Search tests, candidates, modules...';
        const kbd = document.createElement('span');
        kbd.className = 'dropx-kbd-hint d-none d-md-inline-block';
        kbd.textContent = 'Ctrl K';
        searchGroup.appendChild(kbd);
    }

    // 1. Keyboard Shortcuts: Ctrl+S to Save, Ctrl+K to Focus Search
    if (!window.__gakkouKeybindsBound) {
        window.__gakkouKeybindsBound = true;
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                const sInput = document.querySelector('#jazzy-navbar .form-control-navbar');
                if (sInput) {
                    e.preventDefault();
                    sInput.focus();
                    sInput.select();
                }
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                const saveBtn =
                    document.querySelector('input[name="_continue"]') ||
                    document.querySelector('input[name="_save"]') ||
                    document.querySelector('.submit-row input[type="submit"]');
                if (saveBtn) {
                    e.preventDefault();
                    showToastFeedback('💾 Saving changes...');
                    saveBtn.click();
                }
            }
        });
    }

    // 2. Create Floating Quick Action FAB if on a change form
    const isChangeForm =
        document.querySelector('form#question_form') ||
        document.querySelector('form#questiongroup_form') ||
        document.querySelector('form#test_form') ||
        document.querySelector('.change-form');

    if (isChangeForm && !document.querySelector('#gakkou-floating-save')) {
        const fabContainer = document.createElement('div');
        fabContainer.id = 'gakkou-floating-save';
        fabContainer.className = 'gakkou-floating-save-container';
        fabContainer.innerHTML = `
            <button type="button" id="gakkou-fab-continue" class="gakkou-fab-btn gakkou-fab-continue" title="Save & Continue Editing (Ctrl+S)">
                <i class="fas fa-save"></i> <span>Save Changes</span>
            </button>
        `;
        document.body.appendChild(fabContainer);

        const continueBtn = document.getElementById('gakkou-fab-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', function () {
                const targetBtn =
                    document.querySelector('input[name="_continue"]') ||
                    document.querySelector('input[name="_save"]') ||
                    document.querySelector('button[type="submit"]');
                if (targetBtn) {
                    showToastFeedback('💾 Saving changes...');
                    targetBtn.click();
                }
            });
        }
    }

    // 3. 🚀 Instant Background Auto-Upload for Audio & Image Files
    if (!window.__gakkouAutoUploadBound) {
        window.__gakkouAutoUploadBound = true;
        document.addEventListener('change', function (e) {
            if (e.target && e.target.matches('input[type="file"]')) {
                const input = e.target;
                if (!input.files || input.files.length === 0) return;
                if (input.id === 'csv_file') return; // Skip CSV bulk import file input

                const file = input.files[0];
                const inputName = input.name || '';

                let fieldType = 'audio';
                if (inputName.includes('image') || file.type.startsWith('image/')) {
                    fieldType = 'image';
                }

                let objectId = null;
                let modelName = 'question';

                const match = inputName.match(/([a-z_]+)-(\d+)-([a-z_]+)/i);
                if (match) {
                    const prefix = match[1];
                    const index = match[2];
                    const field = match[3];
                    fieldType = field.includes('image') ? 'image' : 'audio';

                    if (prefix === 'question_groups') {
                        modelName = 'questiongroup';
                    } else if (prefix === 'answer_options' || prefix.includes('option')) {
                        modelName = 'answeroption';
                    } else {
                        modelName = 'question';
                    }

                    const idInput = document.querySelector(`input[name="${prefix}-${index}-id"]`);
                    if (idInput && idInput.value) {
                        objectId = idInput.value;
                    }
                } else {
                    const standaloneId = window.location.pathname.match(/\/(\d+)\/change/);
                    if (standaloneId) {
                        objectId = standaloneId[1];
                        if (window.location.pathname.includes('/questiongroup/')) modelName = 'questiongroup';
                        else if (window.location.pathname.includes('/question/')) modelName = 'question';
                        else if (window.location.pathname.includes('/answeroption/')) modelName = 'answeroption';
                    }
                }

                if (!objectId) {
                    showToastFeedback('💡 New item: Click Save Changes once to register it for instant auto-upload.');
                    return;
                }

                let statusBadge = input.parentNode.querySelector('.gakkou-autoupload-status');
                if (!statusBadge) {
                    statusBadge = document.createElement('div');
                    statusBadge.className = 'gakkou-autoupload-status mt-1 font-weight-bold';
                    input.parentNode.appendChild(statusBadge);
                }
                statusBadge.innerHTML = `<span class="text-info"><i class="fas fa-spinner fa-spin"></i> Auto-uploading ${file.name}...</span>`;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('model', modelName);
                formData.append('object_id', objectId);
                formData.append('field', fieldType);

                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

                fetch('/api/admin/auto-upload/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                    body: formData,
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.status === 'success' && data.url) {
                            statusBadge.innerHTML = `<span class="badge bg-success px-2 py-1" style="font-size:0.8rem;"><i class="fas fa-check-circle"></i> Auto-saved &amp; Live!</span>`;
                            showToastFeedback(`✅ ${fieldType.toUpperCase()} auto-saved for #${objectId}!`);

                            const previewContainer = input.closest('.form-row') || input.parentNode;
                            let existingPreview =
                                previewContainer.querySelector('.admin-preview-container') ||
                                previewContainer.querySelector('.preview-box');

                            if (!existingPreview) {
                                existingPreview = document.createElement('div');
                                existingPreview.className = 'admin-preview-container mt-2';
                                input.parentNode.appendChild(existingPreview);
                            }

                            if (fieldType === 'audio') {
                                existingPreview.innerHTML = `<audio controls src="${data.url}" style="height:36px; max-width:320px; border-radius:8px;" autoplay="false"></audio>`;
                            } else {
                                existingPreview.innerHTML = `<img src="${data.url}" style="max-height:80px; max-width:140px; border-radius:6px; border:1px solid #ddd; object-fit:contain;" />`;
                            }
                        } else {
                            statusBadge.innerHTML = `<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> Upload error: ${data.error || 'Failed'}</span>`;
                        }
                    })
                    .catch(() => {
                        statusBadge.innerHTML = `<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> Upload error</span>`;
                    });
            }
        });
    }

    function showToastFeedback(msg) {
        let toast = document.getElementById('gakkou-save-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'gakkou-save-toast';
            toast.className = 'gakkou-save-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 4. Show / Hide Password Eye Toggle for Django Admin
    function initAdminPasswordToggles() {
        var pwdInputs = document.querySelectorAll('input[type="password"]');
        pwdInputs.forEach(function (input) {
            if (input.dataset.hasEyeToggle === 'true') return;

            var parent = input.parentElement;
            if (parent && parent.querySelector('.pwd-toggle-btn, #toggle_admin_login_password, .admin-pwd-eye-btn')) {
                input.dataset.hasEyeToggle = 'true';
                return;
            }
            input.dataset.hasEyeToggle = 'true';
            if (!parent) return;

            input.style.paddingRight = '42px';
            if (window.getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'admin-pwd-eye-btn';
            btn.title = 'Show / Hide Password';
            btn.innerHTML = '<i class="fas fa-eye"></i>';
            btn.setAttribute('aria-label', 'Toggle password visibility');
            btn.setAttribute('tabindex', '-1');

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    btn.title = 'Hide password';
                } else {
                    input.type = 'password';
                    btn.innerHTML = '<i class="fas fa-eye"></i>';
                    btn.title = 'Show password';
                }
            });

            input.insertAdjacentElement('afterend', btn);
        });
    }

    initAdminPasswordToggles();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminEnhancements);
} else {
    initAdminEnhancements();
}
window.addEventListener('load', initAdminEnhancements);

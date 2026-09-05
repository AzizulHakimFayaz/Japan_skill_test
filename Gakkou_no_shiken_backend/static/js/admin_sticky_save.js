/**
 * Gakkou No Shiken Admin — Instant File Auto-Save & Sticky Save Helpers
 */
document.addEventListener('DOMContentLoaded', function () {
    // 1. Keyboard Shortcut: Ctrl+S / Cmd+S to Quick Save
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            const saveBtn = document.querySelector('input[name="_continue"]') || 
                            document.querySelector('input[name="_save"]') || 
                            document.querySelector('button[type="submit"]') ||
                            document.querySelector('.submit-row input[type="submit"]');
            if (saveBtn) {
                showToastFeedback('💾 Saving changes...');
                saveBtn.click();
            }
        }
    });

    // 2. Create Floating Quick Action FAB if on a change form
    const isChangeForm = document.querySelector('form#question_form') || 
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
                const targetBtn = document.querySelector('input[name="_continue"]') || 
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
    document.addEventListener('change', function (e) {
        if (e.target && e.target.matches('input[type="file"]')) {
            const input = e.target;
            if (!input.files || input.files.length === 0) return;

            const file = input.files[0];
            const inputName = input.name || ''; // e.g. "questions-3-audio", "questions-0-image", "audio", "image"

            // Determine field type (audio or image)
            let fieldType = 'audio';
            if (inputName.includes('image') || file.type.startsWith('image/')) {
                fieldType = 'image';
            }

            // Find object ID and model
            let objectId = null;
            let modelName = 'question';

            // Check if inside an inline formset row (e.g. questions-3-audio)
            const match = inputName.match(/([a-z_]+)-(\d+)-([a-z_]+)/i);
            if (match) {
                const prefix = match[1]; // e.g. "questions", "question_groups", "answer_options"
                const index = match[2];  // e.g. "3"
                const field = match[3];  // e.g. "audio"
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
                // Standalone change form (e.g. editing Question directly)
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

            // Create status feedback indicator right next to the file input
            let statusBadge = input.parentNode.querySelector('.gakkou-autoupload-status');
            if (!statusBadge) {
                statusBadge = document.createElement('div');
                statusBadge.className = 'gakkou-autoupload-status mt-1 font-weight-bold';
                input.parentNode.appendChild(statusBadge);
            }
            statusBadge.innerHTML = `<span class="text-info"><i class="fas fa-spinner fa-spin"></i> Auto-uploading ${file.name}...</span>`;

            // Prepare AJAX payload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('model', modelName);
            formData.append('object_id', objectId);
            formData.append('field', fieldType);

            // Get CSRF Token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

            fetch('/api/admin/auto-upload/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.url) {
                    statusBadge.innerHTML = `<span class="badge badge-success px-2 py-1" style="font-size:0.85rem;"><i class="fas fa-check-circle"></i> Auto-saved &amp; Live!</span>`;
                    showToastFeedback(`✅ ${fieldType.toUpperCase()} auto-saved for #${objectId}!`);

                    // Update or insert media preview player right under the field
                    const previewContainer = input.closest('.form-row') || input.parentNode;
                    let existingPreview = previewContainer.querySelector('.admin-preview-container') || previewContainer.querySelector('.preview-box');
                    
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
            .catch(err => {
                statusBadge.innerHTML = `<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> Upload error</span>`;
            });
        }
    });

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
        }, 3500);
    }

    // ============================================================
    // Show / Hide Password Eye Toggle for Django Admin
    // ============================================================
    function initAdminPasswordToggles() {
        var pwdInputs = document.querySelectorAll('input[type="password"], input[data-has-eye-toggle="true"]');
        pwdInputs.forEach(function(input) {
            if (input.dataset.hasEyeToggle === 'true') return;
            input.dataset.hasEyeToggle = 'true';

            var parent = input.parentElement;
            if (!parent) return;

            // Create relative wrapper if needed
            var wrapper = document.createElement('div');
            wrapper.className = 'admin-pwd-toggle-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = '100%';

            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            input.style.paddingRight = '42px';

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'admin-pwd-eye-btn';
            btn.title = 'Show / Hide Password';
            btn.innerHTML = '👁️';
            btn.setAttribute('aria-label', 'Toggle password visibility');
            btn.style.position = 'absolute';
            btn.style.right = '12px';
            btn.style.top = '50%';
            btn.style.transform = 'translateY(-50%)';
            btn.style.background = 'none';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '16px';
            btn.style.padding = '4px 6px';
            btn.style.lineHeight = '1';
            btn.style.opacity = '0.75';
            btn.style.zIndex = '15';

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.innerHTML = '🙈';
                    btn.title = 'Hide password';
                } else {
                    input.type = 'password';
                    btn.innerHTML = '👁️';
                    btn.title = 'Show password';
                }
            });

            wrapper.appendChild(btn);
        });
    }

    initAdminPasswordToggles();
    setTimeout(initAdminPasswordToggles, 400);
    setTimeout(initAdminPasswordToggles, 1200);
});

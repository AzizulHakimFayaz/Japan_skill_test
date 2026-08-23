/**
 * Gakkou No Shiken Admin — Sticky Quick Save & Keyboard Shortcut (Ctrl+S / Cmd+S)
 */
document.addEventListener('DOMContentLoaded', function () {
    // 1. Keyboard Shortcut: Ctrl+S / Cmd+S to Quick Save
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            
            // Find the primary submit button
            const saveBtn = document.querySelector('input[name="_continue"]') || 
                            document.querySelector('input[name="_save"]') || 
                            document.querySelector('button[type="submit"]') ||
                            document.querySelector('.submit-row input[type="submit"]');

            if (saveBtn) {
                // Visual feedback
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
    }
});

/**
 * Lightweight in-app confirm dialog (replaces browser confirm() on mobile).
 * Returns a Promise<boolean>.
 */
export function confirmDialog({ title, message, confirmText = 'OK', cancelText = 'Cancel', danger = false }) {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'dialog-backdrop';
        backdrop.innerHTML = `
            <div class="dialog" role="alertdialog" aria-modal="true">
                <h2 class="dialog-title">${title}</h2>
                <p class="dialog-message">${message}</p>
                <div class="dialog-actions">
                    <button type="button" class="dialog-btn dialog-cancel">${cancelText}</button>
                    <button type="button" class="dialog-btn dialog-confirm ${danger ? 'dialog-danger' : ''}">${confirmText}</button>
                </div>
            </div>`;

        const close = (result) => {
            backdrop.remove();
            resolve(result);
        };

        backdrop.querySelector('.dialog-cancel').addEventListener('click', () => close(false));
        backdrop.querySelector('.dialog-confirm').addEventListener('click', () => close(true));
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close(false);
        });

        document.body.appendChild(backdrop);
        backdrop.querySelector('.dialog-confirm').focus();
    });
}

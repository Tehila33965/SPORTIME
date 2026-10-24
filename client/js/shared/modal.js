// מציג חלון אישור עם כותרת, טקסט וכפתורי אישור/ביטול ומחזיר Promise של true/false.
export const confirmDialog = ({ title, text, confirmLabel = 'אישור', cancelLabel = 'ביטול' }) => {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog');
        dialog.className = 'modal';

        const content = document.createElement('div');
        content.className = 'modal__content';

        const heading = document.createElement('h2');
        heading.className = 'modal__title';
        heading.textContent = title || 'אישור';

        const paragraph = document.createElement('p');
        paragraph.className = 'modal__text';
        paragraph.textContent = text || '';

        const actions = document.createElement('div');
        actions.className = 'modal__actions';

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = cancelLabel;

        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'btn btn-primary';
        confirmButton.textContent = confirmLabel;

        const close = (value) => {
            dialog.close();
            dialog.remove();
            resolve(value);
        };

        cancelButton.addEventListener('click', () => close(false));
        confirmButton.addEventListener('click', () => close(true));

        dialog.addEventListener('cancel', () => close(false));
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                close(false);
            }
        });

        actions.append(cancelButton, confirmButton);
        content.append(heading, paragraph, actions);
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        cancelButton.focus();
        dialog.showModal();
    });
};

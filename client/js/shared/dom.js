// יוצר אלמנט DOM חדש, מוסיף class, textContent, attributes וילדים.
export const createEl = (tag, options = {}, ...children) => {
    const element = document.createElement(tag);
    const { className, text, attrs = {} } = options;

    if (className) {
        element.className = className;
    }

    if (text !== undefined && text !== null) {
        element.textContent = String(text);
    }

    Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== false) {
            element.setAttribute(key, String(value));
        }
    });

    children.forEach((child) => {
        if (child === null || child === undefined || child === false) {
            return;
        }

        if (typeof child === 'string' || typeof child === 'number') {
            element.appendChild(document.createTextNode(String(child)));
            return;
        }

        element.appendChild(child);
    });

    return element;
};

// מרוקן את המשקל ומציג הודעת טעינה עם state loading.
export const showLoading = (container, text = 'טוען...') => {
    if (!container) return;

    container.replaceChildren();
    const paragraph = createEl('p', { className: 'state state-loading', attrs: { role: 'status' } });
    paragraph.textContent = text;
    container.appendChild(paragraph);
};

// מרוקן את המכולה ומציג הודעת שגיאה מהשרת או הודעה כללית.
export const showError = (container, error) => {
    if (!container) return;

    container.replaceChildren();
    const paragraph = createEl('p', { className: 'state state-error', attrs: { role: 'alert' } });
    paragraph.textContent = error?.message || 'משהו השתבש';
    container.appendChild(paragraph);
};

// מרוקן את המכולה ומציג הודעת ריקון למקרה שאין תוצאות.
export const showEmpty = (container, text) => {
    if (!container) return;

    container.replaceChildren();
    const paragraph = createEl('p', { className: 'state state-empty' });
    paragraph.textContent = text;
    container.appendChild(paragraph);
};

// מציג הודעה כללית בראש טופס, ומעדכן את האלמנט אם הוא כבר קיים.
export const showFormError = (form, message) => {
    if (!form) return;

    let errorEl = form.querySelector('.form-error');

    if (!errorEl) {
        errorEl = createEl('div', { className: 'form-error', attrs: { role: 'alert' } });
        form.insertBefore(errorEl, form.firstChild);
    }

    errorEl.textContent = message || '';
    errorEl.hidden = !message;
};

// מציג הודעת שגיאה מתחת לשדה ומציין שהשדה לא תקין.
export const setFieldError = (input, message) => {
    if (!input) return;

    input.setAttribute('aria-invalid', 'true');

    let errorEl = input.parentElement?.querySelector('.field-error');

    if (!errorEl) {
        errorEl = createEl('small', { className: 'field-error' });
        input.insertAdjacentElement('afterend', errorEl);
    }

    errorEl.textContent = message || '';
    errorEl.hidden = !message;
};

// מסיר הודעות שגיאה כלליות, הודעות שדות ו aria-invalid מכל השדות בטופס.
export const clearFormErrors = (form) => {
    if (!form) return;

    const generalError = form.querySelector('.form-error');
    if (generalError) {
        generalError.remove();
    }

    form.querySelectorAll('.field-error').forEach((errorEl) => errorEl.remove());
    form.querySelectorAll('input, select, textarea').forEach((field) => {
        field.removeAttribute('aria-invalid');
    });
};

import { ADMIN_HOME, CLIENT_HOME } from '../../config.js';
import { clearFormErrors, showFormError } from '../../shared/dom.js';
import { mountHeader } from '../../shared/header.js';
import { redirectIfLoggedIn } from '../../shared/guard.js';
import { signIn } from './auth.service.js';

if (!redirectIfLoggedIn()) {
    mountHeader();

    const form = document.querySelector('#login-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const passwordInput = form.querySelector('#password');

    const attachPasswordToggle = (input) => {
        if (!input || input.dataset.toggleAttached === 'true') {
            return;
        }

        const field = input.closest('.auth-field');
        if (!field) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'password-field';
        field.appendChild(wrapper);
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.setAttribute('aria-label', 'הצגת סיסמה');
        toggleButton.setAttribute('title', 'הצגת סיסמה');
        toggleButton.textContent = '👁';
        toggleButton.addEventListener('click', (event) => {
            event.preventDefault();
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            toggleButton.textContent = isText ? '👁' : '🙈';
            toggleButton.setAttribute('aria-label', isText ? 'הצגת סיסמה' : 'הסתרת סיסמה');
            toggleButton.setAttribute('title', isText ? 'הצגת סיסמה' : 'הסתרת סיסמה');
            input.focus();
        });

        wrapper.appendChild(toggleButton);
        input.dataset.toggleAttached = 'true';
    };

    attachPasswordToggle(passwordInput);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormErrors(form);

        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password'),
        };

        submitButton.disabled = true;

        try {
            const user = await signIn(credentials);
            const next = new URLSearchParams(window.location.search).get('next');

            if (next?.startsWith('/') && !next.startsWith('//')) {
                window.location.replace(next);
                return;
            }

            window.location.replace(user.role === 'admin' ? ADMIN_HOME : CLIENT_HOME);
        } catch (error) {
            showFormError(form, error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
}

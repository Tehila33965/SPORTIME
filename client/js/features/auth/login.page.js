import { ADMIN_HOME, CLIENT_HOME } from '../../config.js';
import { clearFormErrors, showFormError } from '../../shared/dom.js';
import { mountHeader } from '../../shared/header.js';
import { redirectIfLoggedIn } from '../../shared/guard.js';
import { signIn } from './auth.service.js';

if (!redirectIfLoggedIn()) {
    mountHeader();

    const form = document.querySelector('#login-form');
    const submitButton = form.querySelector('button[type="submit"]');

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

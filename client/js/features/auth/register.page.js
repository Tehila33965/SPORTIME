import { CLIENT_HOME } from '../../config.js';
import { clearFormErrors, setFieldError, showFormError } from '../../shared/dom.js';
import { mountHeader } from '../../shared/header.js';
import { redirectIfLoggedIn } from '../../shared/guard.js';
import { signIn, signUp } from './auth.service.js';

if (!redirectIfLoggedIn()) {
    mountHeader();

    const form = document.querySelector('#register-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm-password');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormErrors(form);

        if (passwordInput.value !== confirmPasswordInput.value) {
            setFieldError(confirmPasswordInput, 'הסיסמה ואימות הסיסמה אינם תואמים');
            return;
        }

        const formData = new FormData(form);
        const credentials = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
        };

        submitButton.disabled = true;

        try {
            await signUp(credentials);
            await signIn({ email: credentials.email, password: credentials.password });
            window.location.replace(CLIENT_HOME);
        } catch (error) {
            showFormError(form, error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
}

import { ADMIN_HOME, CLASS_PRICE, CLIENT_HOME } from '../../config.js';
import { getClassSessions } from '../classes/classSession.service.js';
import { getUser } from '../../shared/session.js';
import { requireLogin } from '../../shared/guard.js';
import { mountHeader } from '../../shared/header.js';
import {
    clearFormErrors,
    createEl,
    setFieldError,
    showError,
    showFormError,
    showLoading,
} from '../../shared/dom.js';
import { formatDateLong, formatTime, isPast } from '../../shared/format.js';
import { registerToSession } from './registration.service.js';

if (requireLogin()) {
    if (getUser()?.role === 'admin') {
        window.location.replace(ADMIN_HOME);
    } else {
        mountHeader();

        const content = document.querySelector('#checkout-content');
        const backLink = () => createEl('a', {
            className: 'btn btn-secondary checkout-back-action',
            text: 'חזרה למערכת השעות',
            attrs: { href: CLIENT_HOME },
        });

        const showCheckoutError = (message) => {
            showError(content, { message });
            content.append(backLink());
        };

        const renderSuccess = (session) => {
            const template = session.classTemplate ?? {};
            const instructor = session.instructor ?? {};
            const success = createEl('section', {
                className: 'checkout-success',
                attrs: { 'aria-labelledby': 'checkout-success-title', role: 'status' },
            },
                createEl('span', {
                    className: 'checkout-success__mark',
                    text: '✓',
                    attrs: { 'aria-hidden': 'true' },
                }),
                createEl('h1', {
                    id: 'checkout-success-title',
                    text: 'נרשמת בהצלחה!',
                }),
                createEl('p', {
                    className: 'checkout-success__intro',
                    text: 'פרטי ההרשמה לשיעור:',
                }),
                createEl('dl', { className: 'checkout-success__details' },
                    createEl('div', {},
                        createEl('dt', { text: 'שיעור' }),
                        createEl('dd', { text: template.title ?? 'שיעור' }),
                    ),
                    createEl('div', {},
                        createEl('dt', { text: 'מאמן' }),
                        createEl('dd', { text: instructor.name ?? 'לא צוין' }),
                    ),
                    createEl('div', {},
                        createEl('dt', { text: 'תאריך' }),
                        createEl('dd', { text: formatDateLong(session.date.slice(0, 10)) }),
                    ),
                    createEl('div', {},
                        createEl('dt', { text: 'שעה' }),
                        createEl('dd', { text: formatTime(session.time) }),
                    ),
                ),
                createEl('div', { className: 'checkout-success__links' },
                    createEl('a', {
                        className: 'btn btn-primary',
                        text: 'ההרשמות שלי',
                        attrs: { href: '/pages/registrations/my-registrations.html' },
                    }),
                    createEl('a', {
                        className: 'btn btn-secondary',
                        text: 'מערכת שעות',
                        attrs: { href: CLIENT_HOME },
                    }),
                ),
            );

            content.replaceChildren(success);
        };

        const renderCheckout = (session) => {
            const template = session.classTemplate ?? {};
            const instructor = session.instructor ?? {};
            const summary = createEl('section', {
                className: 'checkout-summary',
                attrs: { 'aria-labelledby': 'checkout-title' },
            },
                createEl('p', { className: 'checkout-eyebrow', text: 'הצעד הבא לאימון שלך' }),
                createEl('h1', { id: 'checkout-title', text: 'הרשמה ותשלום' }),
                createEl('h2', { className: 'checkout-summary__title', text: template.title ?? 'שיעור' }),
                createEl('dl', { className: 'checkout-summary__details' },
                    createEl('div', {},
                        createEl('dt', { text: 'מאמן' }),
                        createEl('dd', { text: instructor.name ?? 'לא צוין' }),
                    ),
                    createEl('div', {},
                        createEl('dt', { text: 'תאריך' }),
                        createEl('dd', { text: formatDateLong(session.date.slice(0, 10)) }),
                    ),
                    createEl('div', {},
                        createEl('dt', { text: 'שעה' }),
                        createEl('dd', { text: formatTime(session.time) }),
                    ),
                ),
                createEl('p', { className: 'checkout-summary__price' },
                    createEl('span', { text: 'לתשלום' }),
                    createEl('strong', { text: `₪${CLASS_PRICE}` }),
                ),
            );
            const form = createEl('form', {
                className: 'checkout-form',
                attrs: { novalidate: true, autocomplete: 'off' },
            });
            const notice = createEl('p', {
                className: 'checkout-demo-notice',
                text: 'זהו תשלום לדוגמה. פרטי הכרטיס לא נשלחים ולא נשמרים',
                attrs: { role: 'note' },
            });
            const fields = [
                {
                    id: 'cardholder',
                    name: 'cardholder',
                    label: 'שם בעל הכרטיס',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'card-number',
                    name: 'cardNumber',
                    label: 'מספר כרטיס',
                    type: 'text',
                    inputmode: 'numeric',
                    maxlength: '19',
                    required: true,
                },
                {
                    id: 'card-expiry',
                    name: 'expiry',
                    label: 'תוקף הכרטיס (חודש/שנה)',
                    type: 'text',
                    inputmode: 'numeric',
                    placeholder: 'חודש/שנה',
                    maxlength: '5',
                    required: true,
                },
                {
                    id: 'card-cvv',
                    name: 'cvv',
                    label: 'קוד אבטחה',
                    type: 'password',
                    inputmode: 'numeric',
                    maxlength: '3',
                    required: true,
                },
            ];
            const inputs = {};

            fields.forEach((field) => {
                const input = createEl('input', {
                    attrs: {
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        ...(field.inputmode ? { inputmode: field.inputmode } : {}),
                        ...(field.autocomplete ? { autocomplete: field.autocomplete } : {}),
                        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
                        ...(field.maxlength ? { maxlength: field.maxlength } : {}),
                        required: field.required,
                    },
                });
                inputs[field.name] = input;
                form.append(createEl('div', { className: 'checkout-field' },
                    createEl('label', { text: field.label, attrs: { for: field.id } }),
                    input,
                ));
            });

            const submitButton = createEl('button', {
                className: 'btn btn-primary checkout-submit',
                text: `לתשלום והרשמה · ₪${CLASS_PRICE}`,
                attrs: { type: 'submit' },
            });
            form.prepend(notice);
            form.append(submitButton);
            content.replaceChildren(createEl('div', { className: 'checkout-layout' }, summary, form));

            inputs.cardNumber.addEventListener('input', () => {
                const digits = inputs.cardNumber.value.replace(/\D/g, '').slice(0, 16);
                inputs.cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
            });

            inputs.expiry.addEventListener('input', () => {
                const digits = inputs.expiry.value.replace(/\D/g, '').slice(0, 4);
                inputs.expiry.value = digits.length > 2
                    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                    : digits;
            });

            const clearCardFields = () => {
                Object.values(inputs).forEach((input) => {
                    input.value = '';
                });
            };

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                clearFormErrors(form);

                const cardholder = inputs.cardholder.value.trim();
                const cardNumber = inputs.cardNumber.value.replace(/\D/g, '');
                const expiry = inputs.expiry.value.trim();
                const cvv = inputs.cvv.value.trim();
                let isValid = true;

                if (!cardholder) {
                    setFieldError(inputs.cardholder, 'יש להזין את שם בעל הכרטיס');
                    isValid = false;
                }

                if (!/^\d{16}$/.test(cardNumber)) {
                    setFieldError(inputs.cardNumber, 'יש להזין מספר כרטיס בן 16 ספרות');
                    isValid = false;
                }

                const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
                if (!expiryMatch) {
                    setFieldError(inputs.expiry, 'יש להזין תוקף בתבנית חודש/שנה');
                    isValid = false;
                } else {
                    const now = new Date();
                    const expiryMonth = Number(expiryMatch[1]);
                    const expiryYear = 2000 + Number(expiryMatch[2]);
                    const isInFuture = expiryYear > now.getFullYear()
                        || (expiryYear === now.getFullYear() && expiryMonth >= now.getMonth() + 1);

                    if (!isInFuture) {
                        setFieldError(inputs.expiry, 'תוקף הכרטיס חייב להיות בעתיד');
                        isValid = false;
                    }
                }

                if (!/^\d{3}$/.test(cvv)) {
                    setFieldError(inputs.cvv, 'יש להזין קוד אבטחה בן 3 ספרות');
                    isValid = false;
                }

                clearCardFields();
                if (!isValid) {
                    return;
                }

                submitButton.disabled = true;
                submitButton.textContent = 'מעבד תשלום...';

                try {
                    await new Promise((resolve) => window.setTimeout(resolve, 1000));
                    await registerToSession(session.id);
                    renderSuccess(session);
                } catch (error) {
                    showFormError(form, error.message);
                } finally {
                    clearCardFields();
                    if (submitButton.isConnected) {
                        submitButton.disabled = false;
                        submitButton.textContent = `לתשלום והרשמה · ₪${CLASS_PRICE}`;
                    }
                }
            });
        };

        const init = async () => {
            const sessionId = new URLSearchParams(window.location.search).get('session');
            if (!sessionId) {
                showCheckoutError('לא צוין מזהה שיעור');
                return;
            }

            showLoading(content, 'טוען את פרטי השיעור...');

            try {
                const sessions = await getClassSessions({ limit: 100 });
                const session = (sessions ?? []).find((item) => String(item.id) === sessionId);

                if (!session) {
                    showCheckoutError('השיעור לא נמצא או שהוסר');
                    return;
                }

                if (Number(session.registeredCount) >= Number(session.maxParticipants)) {
                    showCheckoutError('השיעור מלא ולא ניתן להירשם אליו');
                    return;
                }

                if (isPast(session)) {
                    showCheckoutError('השיעור כבר הסתיים ולא ניתן להירשם אליו');
                    return;
                }

                renderCheckout(session);
            } catch (error) {
                showError(content, error);
                content.append(backLink());
            }
        };

        init();
    }
}

import { LOGIN_PAGE } from '../../config.js';
import { getClassSessions } from './classSession.service.js';
import { getMyRegistrations } from '../registrations/registration.service.js';
import { createEl, showError, showLoading } from '../../shared/dom.js';
import { formatDateLong, formatTime, isPast } from '../../shared/format.js';
import { getUser, isLoggedIn } from '../../shared/session.js';
import { mountHeader } from '../../shared/header.js';

mountHeader();

const content = document.querySelector('#session-details');
const fallbackImage = (className, label) => createEl('div', {
    className: `${className} session-image-fallback`,
    text: label,
    attrs: { role: 'img', 'aria-label': label },
});

const createImage = ({ src, alt, className, fallbackLabel }) => {
    if (!src) {
        return fallbackImage(className, fallbackLabel);
    }

    const image = createEl('img', {
        className,
        attrs: { src, alt, loading: 'lazy' },
    });
    image.addEventListener('error', () => {
        image.replaceWith(fallbackImage(className, fallbackLabel));
    }, { once: true });
    return image;
};

const renderSession = (session, isRegistered, user) => {
    const template = session.classTemplate ?? {};
    const instructor = session.instructor ?? {};
    const count = Number(session.registeredCount) || 0;
    const capacity = Number(session.maxParticipants) || 0;
    const hero = createEl('div', { className: 'session-detail__hero' },
        createImage({
            src: template.image,
            alt: template.title ? `תמונה של ${template.title}` : 'תמונת השיעור',
            className: 'session-detail__image',
            fallbackLabel: 'תמונת השיעור לא זמינה',
        }),
    );
    const details = createEl('div', { className: 'session-detail__body' });
    const heading = createEl('div', { className: 'session-detail__heading' },
        createEl('p', {
            className: 'session-detail__category',
            text: template.category ?? '',
        }),
        createEl('h1', {
            className: 'session-detail__title',
            text: template.title ?? 'פרטי שיעור',
        }),
    );
    const description = createEl('p', {
        className: 'session-detail__description',
        text: template.description ?? '',
    });
    const instructorBlock = createEl('section', {
        className: 'session-instructor',
        attrs: { 'aria-label': 'פרטי המאמן' },
    },
        createImage({
            src: instructor.image,
            alt: instructor.name ? `תמונה של ${instructor.name}` : 'תמונת המאמן',
            className: 'session-instructor__image',
            fallbackLabel: 'תמונת המאמן לא זמינה',
        }),
        createEl('div', { className: 'session-instructor__details' },
            createEl('h2', { className: 'session-instructor__name', text: instructor.name ?? 'מאמן' }),
            createEl('p', { className: 'session-instructor__specialization', text: instructor.specialization ?? '' }),
        ),
    );
    const schedule = createEl('div', { className: 'session-detail__schedule' },
        createEl('div', { className: 'session-detail__schedule-item' },
            createEl('span', { className: 'session-detail__label', text: 'תאריך' }),
            createEl('span', { text: formatDateLong(session.date.slice(0, 10)) }),
        ),
        createEl('div', { className: 'session-detail__schedule-item' },
            createEl('span', { className: 'session-detail__label', text: 'שעה' }),
            createEl('time', { text: formatTime(session.time) }),
        ),
    );
    const attendance = createEl('section', {
        className: 'session-attendance',
        attrs: { 'aria-label': 'מספר נרשמים' },
    },
        createEl('div', { className: 'session-attendance__summary' },
            createEl('h2', { text: 'נרשמו' }),
            createEl('span', { text: `${count} מתוך ${capacity}` }),
        ),
        createEl('progress', {
            className: 'session-attendance__progress',
            attrs: {
                max: capacity || 1,
                value: Math.min(count, capacity || 1),
                'aria-label': `נרשמו ${count} מתוך ${capacity}`,
            },
        }),
    );

    details.append(heading, description, instructorBlock, schedule, attendance);

    if (count < 5) {
        details.append(createEl('p', {
            className: 'session-detail__notice',
            text: `השיעור יתקיים רק אם יירשמו לפחות 5. עוד ${5 - count} נרשמים`,
        }));
    }

    details.append(createRegistrationAction(session, isRegistered, user));
    content.replaceChildren(createEl('article', { className: 'session-detail' }, hero, details));
};

const createRegistrationAction = (session, isRegistered, user) => {
    if (user?.role === 'admin') {
        return createEl('p', {
            className: 'session-detail__admin-note',
            text: 'צפייה כמנהל',
        });
    }

    if (isPast(session)) {
        return createEl('button', {
            className: 'btn btn-secondary session-detail__action',
            text: 'השיעור הסתיים',
            attrs: { type: 'button', disabled: true },
        });
    }

    if (isRegistered) {
        return createEl('button', {
            className: 'btn btn-secondary session-detail__action',
            text: 'כבר נרשמת לשיעור הזה',
            attrs: { type: 'button', disabled: true },
        });
    }

    if (Number(session.registeredCount) >= Number(session.maxParticipants)) {
        return createEl('button', {
            className: 'btn btn-secondary session-detail__action',
            text: 'השיעור מלא',
            attrs: { type: 'button', disabled: true },
        });
    }

    if (!isLoggedIn()) {
        const next = `${window.location.pathname}${window.location.search}`;
        return createEl('a', {
            className: 'btn btn-primary session-detail__action',
            text: 'התחברות להרשמה',
            attrs: { href: `${LOGIN_PAGE}?next=${encodeURIComponent(next)}` },
        });
    }

    return createEl('a', {
        className: 'btn btn-primary session-detail__action',
        text: 'להרשמה',
        attrs: { href: `/pages/registrations/checkout.html?session=${encodeURIComponent(session.id)}` },
    });
};

const showSessionError = (message) => {
    showError(content, { message });
};

const init = async () => {
    const sessionId = new URLSearchParams(window.location.search).get('id');
    if (!sessionId) {
        showSessionError('לא צוין מזהה שיעור');
        return;
    }

    showLoading(content, 'טוען את פרטי השיעור...');

    try {
        // אחרי תיקון בשרת אפשר להחליף ל-getClassSession, שמחזיר כרגע רק מזהי תבנית ומאמן.
        const sessions = await getClassSessions({ limit: 100 });
        const session = (sessions ?? []).find((item) => String(item.id) === sessionId);

        if (!session) {
            showSessionError('השיעור לא נמצא או שהוסר');
            return;
        }

        const user = getUser();
        const registrations = isLoggedIn()
            ? await getMyRegistrations({ limit: 100 })
            : [];
        const isRegistered = (registrations ?? []).some((registration) =>
            String(registration.session?.id ?? registration.session) === String(session.id));

        renderSession(session, isRegistered, user);
    } catch (error) {
        showError(content, error);
    }
};

init();

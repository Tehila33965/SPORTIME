import { formatTime } from '../../../shared/format.js';
import { createEl } from '../../../shared/dom.js';

export const createSessionCard = (session, { isRegistered }) => {
    const instructorName = session.instructor?.name ?? '';
    const instructorImage = session.instructor?.image;
    const card = createEl('a', {
        className: 'session-card',
        attrs: {
            href: `/pages/classes/session.html?id=${encodeURIComponent(session.id)}`,
            'aria-label': `${session.classTemplate?.title ?? 'שיעור'}, ${formatTime(session.time)}`,
        },
    });
    const time = createEl('time', {
        className: 'session-card__time',
        text: formatTime(session.time),
    });
    const details = createEl('div', { className: 'session-card__details' });
    const title = createEl('h3', {
        className: 'session-card__title',
        text: session.classTemplate?.title ?? 'שיעור',
    });
    const instructor = createEl('div', { className: 'session-card__instructor' });

    if (instructorImage) {
        instructor.append(createEl('img', {
            className: 'session-card__avatar',
            attrs: {
                src: instructorImage,
                alt: `תמונה של ${instructorName}`,
                loading: 'lazy',
            },
        }));
    } else {
        instructor.append(createEl('span', {
            className: 'session-card__avatar session-card__avatar--fallback',
            text: Array.from(instructorName)[0] ?? '?',
            attrs: { 'aria-hidden': 'true' },
        }));
    }

    instructor.append(createEl('span', { text: instructorName || 'מאמן' }));
    details.append(title, instructor);

    const footer = createEl('div', { className: 'session-card__footer' });
    const count = Number(session.registeredCount) || 0;
    const capacity = Number(session.maxParticipants) || 0;
    footer.append(createEl('span', {
        className: 'session-card__count',
        text: `נרשמו ${count} מתוך ${capacity}`,
    }));

    if (isRegistered) {
        footer.append(createEl('span', {
            className: 'session-card__badge session-card__badge--registered',
            text: 'נרשמת',
        }));
    } else if (count >= capacity) {
        footer.append(createEl('span', {
            className: 'session-card__badge session-card__badge--full',
            text: 'מלא',
        }));
    } else if (count < 5) {
        footer.append(createEl('span', {
            className: 'session-card__badge session-card__badge--needed',
            text: `עוד ${5 - count} נרשמים כדי שהשיעור יתקיים`,
        }));
    }

    card.append(time, details, footer);
    return card;
};

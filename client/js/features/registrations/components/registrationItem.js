import { createEl } from '../../../shared/dom.js';
import { formatDateLong, formatTime } from '../../../shared/format.js';

export const createRegistrationItem = (registration, session, { onCancel } = {}) => {
    const template = session.classTemplate ?? {};
    const instructor = session.instructor ?? {};
    const item = createEl('li', { className: 'registration-item' });
    const details = createEl('div', { className: 'registration-item__details' },
        createEl('h3', {
            className: 'registration-item__title',
            text: template.title ?? 'שיעור',
        }),
        createEl('p', {
            className: 'registration-item__instructor',
            text: instructor.name ?? 'מאמן',
        }),
        createEl('div', { className: 'registration-item__schedule' },
            createEl('time', {
                text: formatDateLong(session.date.slice(0, 10)),
            }),
            createEl('time', {
                text: formatTime(session.time),
                attrs: { dir: 'ltr' },
            }),
        ),
    );
    item.append(details);

    if (onCancel) {
        const cancelButton = createEl('button', {
            className: 'btn btn-secondary registration-item__cancel',
            text: 'ביטול הרשמה',
            attrs: { type: 'button' },
        });
        cancelButton.addEventListener('click', () => onCancel(registration, session));
        item.append(cancelButton);
    }

    return item;
};

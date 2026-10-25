import { formatTime } from '../../../shared/format.js';

// בונה שורת שיעור לניהול, כולל כפתורי עריכה ומחיקה.
export const createAdminSessionRow = (session, { onDelete } = {}) => {
    const row = document.createElement('div');
    row.className = 'admin-session-row';

    const time = document.createElement('div');
    time.className = 'admin-session-time';
    time.textContent = formatTime(session.time || '00:00');

    const details = document.createElement('div');
    details.className = 'admin-session-details';

    const title = document.createElement('div');
    title.className = 'admin-session-title';
    title.textContent = session.classTemplate?.title || '—';

    const meta = document.createElement('div');
    meta.className = 'admin-session-meta';

    const category = document.createElement('span');
    category.textContent = session.classTemplate?.category || '—';

    const instructor = document.createElement('span');
    instructor.textContent = session.instructor?.name || '—';

    meta.append(category, instructor);

    const attendance = document.createElement('div');
    attendance.className = 'admin-session-attendance';
    attendance.textContent = `${session.registeredCount ?? 0}/${session.maxParticipants ?? 0} נרשמו`;

    const status = document.createElement('div');
    status.className = 'admin-session-status';

    const started = session?.date ? new Date(`${session.date.slice(0, 10)}T${session.time || '00:00'}:00`) : null;
    const isPast = started && started < new Date();

    if ((session.registeredCount ?? 0) < 5 && !isPast) {
        status.textContent = 'פחות מ-5 נרשמים, השיעור לא יתקיים';
        status.classList.add('is-warning');
    }

    const actions = document.createElement('div');
    actions.className = 'admin-session-actions';

    const editLink = document.createElement('a');
    editLink.className = 'btn btn-secondary';
    editLink.href = `./session-form.html?id=${session.id}`;
    editLink.textContent = 'עריכה';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.textContent = 'מחיקה';

    deleteButton.addEventListener('click', async () => {
        if (typeof onDelete === 'function') {
            await onDelete(session);
        }
    });

    actions.append(editLink, deleteButton);
    details.append(title, meta, attendance, status);
    row.append(time, details, actions);

    return row;
};

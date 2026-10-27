import { showEmpty, showError, showLoading } from '../../../shared/dom.js';
import { formatTime } from '../../../shared/format.js';
import { getSessionRegistrations, getUserById } from '../../registrations/registration.service.js';

// בונה שורת שיעור לניהול, כולל כפתורי עריכה, מחיקה ופתיחת רשימת נרשמים.
export const createAdminSessionRow = (session, { onDelete } = {}) => {
    let isOpen = false;

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

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'btn btn-secondary admin-session-toggle';
    toggleButton.setAttribute('aria-expanded', 'false');

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

    const detailPanel = document.createElement('div');
    detailPanel.className = 'admin-session-detail-panel';
    detailPanel.hidden = true;

    const detailList = document.createElement('div');
    detailList.className = 'admin-session-attendee-list';

    detailPanel.appendChild(detailList);

    let registrantsData = null;
    let userMap = null;
    let loadFailed = false;

    const renderRegistrations = async (registrations) => {
        detailList.replaceChildren();

        if (!registrations || !registrations.length) {
            showEmpty(detailList, 'אין עדיין נרשמים לשיעור הזה');
            return;
        }

        if (userMap === null) {
            const userIds = [...new Set(registrations.map((registration) => registration.user).filter(Boolean))];
            const nextUserMap = {};

            await Promise.all(userIds.map(async (userId) => {
                try {
                    const user = await getUserById(userId);
                    if (user) {
                        const key = String(user.id || user._id || userId);
                        nextUserMap[key] = user;
                    }
                } catch {
                    nextUserMap[String(userId)] = null;
                }
            }));

            userMap = nextUserMap;
        }

        detailList.replaceChildren();
        registrations.forEach((registration) => {
            const item = document.createElement('div');
            item.className = 'admin-session-attendee';

            const name = document.createElement('div');
            name.className = 'admin-session-attendee-name';
            const userId = String(registration.user || '');
            const relatedUser = userMap[userId] || userMap[String(registration.user?._id || registration.user)] || null;
            name.textContent = relatedUser?.name || 'משתמש לא זמין';

            const email = document.createElement('div');
            email.className = 'admin-session-attendee-email';
            email.textContent = relatedUser?.email || '—';

            const statusEl = document.createElement('div');
            statusEl.className = 'admin-session-attendee-status';
            statusEl.textContent = (registration.status || 'ממתין') === 'confirmed' ? 'מאושרת' : (registration.status || 'ממתין');

            item.append(name, email, statusEl);
            detailList.appendChild(item);
        });
    };

    const loadRegistrations = async () => {
        if (registrantsData !== null && !loadFailed) {
            await renderRegistrations(registrantsData);
            return;
        }

        showLoading(detailList, 'טוען רשימת נרשמים...');

        try {
            const registrations = await getSessionRegistrations(session.id, { limit: 100 });
            registrantsData = Array.isArray(registrations) ? registrations : [];
            loadFailed = false;
            await renderRegistrations(registrantsData);
        } catch (error) {
            loadFailed = true;
            showError(detailList, error);
        }
    };

    const render = () => {
        detailPanel.hidden = !isOpen;
        toggleButton.classList.toggle('is-open', isOpen);
        toggleButton.setAttribute('aria-expanded', String(isOpen));
        toggleButton.textContent = isOpen
            ? `הסתרת נרשמים (${session.registeredCount ?? 0})`
            : `נרשמים (${session.registeredCount ?? 0})`;
    };

    toggleButton.addEventListener('click', async () => {
        isOpen = !isOpen;
        render();

        if (isOpen) {
            await loadRegistrations();
        }
    });

    actions.append(toggleButton, editLink, deleteButton);
    details.append(title, meta, attendance, status);
    row.append(time, details, actions, detailPanel);

    render();

    return row;
};

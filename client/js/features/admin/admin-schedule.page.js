import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { showLoading, showError, showEmpty } from '../../shared/dom.js';
import { confirmDialog } from '../../shared/modal.js';
import { groupByDate, formatDateLong, formatTime, isPast } from '../../shared/format.js';
import { getClassSessions, deleteClassSession } from '../classes/classSession.service.js';
import { createAdminSessionRow } from './components/adminSessionRow.js';

if (requireAdmin()) {
    mountHeader();

    const list = document.querySelector('#schedule-list');
    const summary = document.querySelector('#schedule-summary');
    const checkbox = document.querySelector('#show-past-sessions');

    const buildSummary = (sessions) => {
        const upcoming = sessions.filter((session) => !isPast(session));
        const nearThreshold = upcoming.filter((session) => (session.registeredCount ?? 0) < 5).length;

        summary.innerHTML = '';
        const content = document.createElement('div');
        content.className = 'schedule-summary-inner';

        const count = document.createElement('strong');
        count.textContent = `${upcoming.length} שיעורים קרובים`;

        const alertCount = document.createElement('span');
        alertCount.textContent = `${nearThreshold} מתחת ל-5 נרשמים`;

        content.append(count, alertCount);
        summary.appendChild(content);
    };

    const renderDayGroup = (group) => {
        const section = document.createElement('section');
        section.className = 'schedule-day';

        const heading = document.createElement('h2');
        heading.className = 'schedule-day-title';
        heading.textContent = formatDateLong(group.date);

        const rows = document.createElement('div');
        rows.className = 'schedule-day-rows';

        group.sessions.forEach((session) => {
            const row = createAdminSessionRow(session, {
                onDelete: async (targetSession) => {
                    const sessionName = targetSession.classTemplate?.title || 'שיעור';
                    const dateText = typeof targetSession.date === 'string' ? targetSession.date.slice(0, 10) : '';
                    const warningText = (targetSession.registeredCount ?? 0) > 0
                        ? 'שימו לב: יש נרשמים קיימים לשיעור זה, והמחיקה תשפיע עליהם.'
                        : 'אין נרשמים כרגע לשיעור זה.';

                    const confirmed = await confirmDialog({
                        title: 'מחיקת שיעור',
                        text: `${sessionName} — ${dateText} ${formatTime(targetSession.time || '00:00')}. ${warningText}`,
                        confirmLabel: 'מחיקה',
                        cancelLabel: 'ביטול',
                    });

                    if (!confirmed) {
                        return;
                    }

                    try {
                        await deleteClassSession(targetSession.id);

                        const dayCard = row.closest('.schedule-day');
                        const innerRow = row.closest('.admin-session-row');
                        innerRow?.remove();

                        if (dayCard && !dayCard.querySelector('.admin-session-row')) {
                            dayCard.remove();
                        }

                        const latestSessions = Array.from(list.querySelectorAll('.admin-session-row')).map((element) => element.dataset.sessionId);
                        if (!latestSessions.length) {
                            renderEmptyState();
                        }

                        loadSchedule();
                    } catch (error) {
                        showError(list, error);
                    }
                },
            });

            row.dataset.sessionId = session.id;
            rows.appendChild(row);
        });

        section.append(heading, rows);
        return section;
    };

    const renderEmptyState = () => {
        showEmpty(list, 'אין שיעורים להצגה.');
    };

    const renderSchedule = (sessions) => {
        const filtered = checkbox.checked
            ? sessions
            : sessions.filter((session) => !isPast(session));

        buildSummary(filtered);

        if (!filtered.length) {
            renderEmptyState();
            return;
        }

        const groups = groupByDate(filtered);
        list.replaceChildren();
        groups.forEach((group) => list.appendChild(renderDayGroup(group)));
    };

    const loadSchedule = async () => {
        showLoading(list, 'טוען מערכת שעות...');

        try {
            const sessions = await getClassSessions({ limit: 100 });
            const ordered = [...sessions].sort((a, b) => {
                const left = new Date(`${a.date.slice(0, 10)}T${a.time || '00:00'}:00`);
                const right = new Date(`${b.date.slice(0, 10)}T${b.time || '00:00'}:00`);
                return left - right;
            });

            renderSchedule(ordered);
        } catch (error) {
            showError(list, error);
        }
    };

    checkbox.addEventListener('change', () => {
        loadSchedule();
    });

    loadSchedule();
}

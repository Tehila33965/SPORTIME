import { getClassSessions } from './classSession.service.js';
import { createDayTabs } from './components/dayTabs.js';
import { createFilterBar } from './components/filterBar.js';
import { createSessionCard } from './components/sessionCard.js';
import { filterSessions, readFilters, writeFilters } from './filters.js';
import { getMyRegistrations } from '../registrations/registration.service.js';
import { isLoggedIn } from '../../shared/session.js';
import { mountHeader } from '../../shared/header.js';
import { createEl, showEmpty, showError, showLoading } from '../../shared/dom.js';
import { formatDateLong, groupByDate, isPast, sortSessions } from '../../shared/format.js';

mountHeader();

const tabsContainer = document.querySelector('#day-tabs');
const listContainer = document.querySelector('#session-list');
const filterContainer = createEl('div', { className: 'schedule-filter-area' });
listContainer.before(filterContainer);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const getSelectedDate = () => {
    const date = new URLSearchParams(window.location.search).get('date');
    return date === 'all' || datePattern.test(date ?? '') ? date : 'all';
};

let selectedDate = getSelectedDate();
let filters = readFilters();
let upcomingSessions = [];
let registeredSessionIds = new Set();

const updateAddress = (date) => {
    const url = new URL(window.location.href);
    url.searchParams.set('date', date);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

const renderSessions = () => {
    tabsContainer.replaceChildren(createDayTabs({
        selected: selectedDate,
        onSelect: (date) => {
            selectedDate = date;
            updateAddress(date);
            renderSessions();
        },
    }));
    listContainer.replaceChildren();

    const daySessions = selectedDate === 'all'
        ? upcomingSessions
        : upcomingSessions.filter((session) => session.date.slice(0, 10) === selectedDate);
    const visibleSessions = filterSessions(daySessions, filters);

    if (visibleSessions.length === 0) {
        showEmpty(listContainer, 'אין שיעורים שמתאימים לסינון');
        return;
    }

    groupByDate(visibleSessions).forEach(({ date, sessions }) => {
        const section = createEl('section', {
            className: 'schedule-day',
            attrs: { 'aria-label': formatDateLong(date) },
        });
        section.append(
            createEl('h2', { className: 'schedule-day__title', text: formatDateLong(date) }),
            createEl('div', { className: 'schedule-day__sessions' },
                ...sessions.map((session) => createSessionCard(session, {
                    isRegistered: registeredSessionIds.has(String(session.id)),
                })),
            ),
        );
        listContainer.append(section);
    });
};

const init = async () => {
    showLoading(listContainer, 'טוען את מערכת השעות...');

    try {
        const [sessions, registrations] = await Promise.all([
            getClassSessions({ limit: 100 }),
            isLoggedIn() ? getMyRegistrations({ limit: 100 }) : Promise.resolve([]),
        ]);

        upcomingSessions = sortSessions((sessions ?? []).filter((session) => !isPast(session)));
        registeredSessionIds = new Set(
            (registrations ?? []).map((registration) => String(registration.session?.id ?? registration.session)),
        );

        filterContainer.replaceChildren(createFilterBar({
            sessions: upcomingSessions,
            filters,
            onChange: (nextFilters) => {
                filters = nextFilters;
                writeFilters(filters);
                renderSessions();
            },
        }));
        renderSessions();
    } catch (error) {
        showError(listContainer, error);
    }
};

init();

import { getMyRegistrations, cancelRegistration } from './registration.service.js';
import { getClassSessions } from '../classes/classSession.service.js';
import { createRegistrationItem } from './components/registrationItem.js';
import { requireLogin } from '../../shared/guard.js';
import { mountHeader } from '../../shared/header.js';
import { confirmDialog } from '../../shared/modal.js';
import {
    createEl,
    showEmpty,
    showError,
    showLoading,
} from '../../shared/dom.js';
import { formatDateLong, isPast, sessionStart } from '../../shared/format.js';

if (requireLogin()) {
    mountHeader();

    const tabsContainer = document.querySelector('#registration-tabs');
    const listContainer = document.querySelector('#registration-list');
    const messageContainer = document.querySelector('#registration-message');
    let registrations = [];
    let sessionsById = new Map();
    let activeTab = 'upcoming';

    const getRegistrationSession = (registration) => {
        const sessionId = registration.session?.id ?? registration.session;
        return sessionsById.get(String(sessionId));
    };

    const getTabRegistrations = () => {
        const upcoming = [];
        const previous = [];
        const removed = [];

        registrations.forEach((registration) => {
            const session = getRegistrationSession(registration);
            if (!session) {
                removed.push({ registration, session: null });
            } else if (isPast(session)) {
                previous.push({ registration, session });
            } else {
                upcoming.push({ registration, session });
            }
        });

        upcoming.sort((a, b) => sessionStart(a.session) - sessionStart(b.session));
        previous.sort((a, b) => sessionStart(b.session) - sessionStart(a.session));

        return { upcoming, previous: [...previous, ...removed] };
    };

    const showMessage = (text, className = 'registration-message--success') => {
        messageContainer.replaceChildren();
        messageContainer.className = `registration-message ${className}`;
        messageContainer.textContent = text;
        messageContainer.hidden = !text;
    };

    const renderRemovedItem = (registration) => {
        const item = createEl('li', { className: 'registration-item registration-item--removed' },
            createEl('p', {
                className: 'registration-item__removed-text',
                text: 'השיעור הוסר מהמערכת',
            }),
        );
        const removeButton = createEl('button', {
            className: 'btn btn-secondary registration-item__cancel',
            text: 'הסרה מהרשימה',
            attrs: { type: 'button' },
        });
        removeButton.addEventListener('click', () => handleCancel(registration, null, true));
        item.append(removeButton);
        return item;
    };

    const render = () => {
        const { upcoming, previous } = getTabRegistrations();
        const tabs = createEl('div', {
            className: 'registration-tabs',
            attrs: { role: 'tablist', 'aria-label': 'סינון הרשמות' },
        });
        const tabDefinitions = [
            { id: 'upcoming', label: 'קרובות', count: upcoming.length },
            { id: 'previous', label: 'קודמות', count: previous.length },
        ];

        tabDefinitions.forEach(({ id, label, count }) => {
            const selected = activeTab === id;
            const tab = createEl('button', {
                className: `registration-tab${selected ? ' is-active' : ''}`,
                text: `${label} (${count})`,
                attrs: {
                    id: `registration-tab-${id}`,
                    type: 'button',
                    role: 'tab',
                    'aria-selected': String(selected),
                    'aria-controls': 'registration-tabpanel',
                    tabindex: selected ? '0' : '-1',
                },
            });
            tab.addEventListener('click', () => {
                activeTab = id;
                showMessage('');
                render();
            });
            tabs.append(tab);
        });

        tabsContainer.replaceChildren(tabs);
        const panel = createEl('div', {
            id: 'registration-tabpanel',
            className: 'registration-tabpanel',
            attrs: {
                role: 'tabpanel',
                'aria-labelledby': `registration-tab-${activeTab}`,
                tabindex: '0',
            },
        });
        const selectedItems = activeTab === 'upcoming' ? upcoming : previous;

        if (registrations.length === 0) {
            showEmpty(panel, 'אין עדיין הרשמות. אפשר להתחיל במערכת השעות');
            panel.append(createEl('a', {
                className: 'btn btn-primary registration-empty-link',
                text: 'למערכת השעות',
                attrs: { href: '/pages/classes/schedule.html' },
            }));
        } else if (selectedItems.length === 0) {
            showEmpty(panel, activeTab === 'upcoming' ? 'אין הרשמות קרובות' : 'אין הרשמות קודמות');
        } else {
            const list = createEl('ul', { className: 'registration-list' });
            selectedItems.forEach(({ registration, session }) => {
                if (!session) {
                    list.append(renderRemovedItem(registration));
                    return;
                }

                list.append(createRegistrationItem(registration, session, {
                    onCancel: activeTab === 'upcoming'
                        ? (item, itemSession) => handleCancel(item, itemSession, false)
                        : undefined,
                }));
            });
            panel.append(list);
        }

        listContainer.replaceChildren(panel);
    };

    const handleCancel = async (registration, session, isRemoved) => {
        const className = session?.classTemplate?.title ?? 'השיעור';
        const dateText = session ? formatDateLong(session.date.slice(0, 10)) : '';
        const confirmed = await confirmDialog({
            title: isRemoved ? 'הסרת הרשמה' : 'ביטול הרשמה',
            text: isRemoved
                ? 'להסיר את ההרשמה לשיעור שהוסר מהמערכת?'
                : `לבטל את ההרשמה ל${className} בתאריך ${dateText}?`,
            confirmLabel: isRemoved ? 'הסרה מהרשימה' : 'ביטול הרשמה',
            cancelLabel: 'חזרה',
        });

        if (!confirmed) {
            return;
        }

        try {
            await cancelRegistration(registration.id);
            registrations = registrations.filter((item) => String(item.id) !== String(registration.id));
            showMessage('ההרשמה בוטלה');
            render();
        } catch (error) {
            showMessage(error.message, 'registration-message--error');
        }
    };

    const init = async () => {
        showLoading(listContainer, 'טוען את ההרשמות...');

        try {
            const [myRegistrations, sessions] = await Promise.all([
                getMyRegistrations({ limit: 100 }),
                getClassSessions({ limit: 100 }),
            ]);
            registrations = myRegistrations ?? [];
            sessionsById = new Map((sessions ?? []).map((session) => [String(session.id), session]));
            render();
        } catch (error) {
            showError(listContainer, error);
        }
    };

    init();
}

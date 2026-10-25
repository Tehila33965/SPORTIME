import { addDays, formatDayOfMonth, formatWeekdayShort, todayKey } from '../../../shared/format.js';
import { createEl } from '../../../shared/dom.js';

export const createDayTabs = ({ selected, onSelect }) => {
    const nav = createEl('nav', {
        className: 'day-tabs',
        attrs: { 'aria-label': 'בחירת יום במערכת השעות' },
    });
    const days = [
        { key: 'all', label: 'הכול' },
        ...Array.from({ length: 7 }, (_, index) => {
            const key = addDays(todayKey(), index);
            return {
                key,
                label: formatWeekdayShort(key),
                day: formatDayOfMonth(key),
            };
        }),
    ];

    days.forEach(({ key, label, day }) => {
        const button = createEl('button', {
            className: `day-tab${selected === key ? ' is-active' : ''}`,
            attrs: {
                type: 'button',
                ...(selected === key ? { 'aria-current': 'date' } : {}),
            },
        });

        button.append(
            createEl('span', { className: 'day-tab__label', text: label }),
            ...(day ? [createEl('span', { className: 'day-tab__number', text: day })] : []),
        );
        button.addEventListener('click', () => onSelect(key));
        nav.append(button);
    });

    return nav;
};

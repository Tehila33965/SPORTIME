import { createEl } from '../../../shared/dom.js';

const createOptions = (label, values, selected) => {
    const select = createEl('select', {
        name: label.name,
        attrs: { id: label.id },
    });
    select.append(createEl('option', { text: 'הכול', attrs: { value: '' } }));

    values.forEach(({ value, text }) => {
        select.append(createEl('option', {
            text,
            attrs: { value, selected: value === selected },
        }));
    });

    if (!values.some(({ value }) => value === selected)) {
        select.value = '';
    }

    return select;
};

const uniqueSortedValues = (values) => [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'he'));

export const createFilterBar = ({ sessions, filters, onChange }) => {
    const form = createEl('form', {
        className: 'schedule-filters',
        attrs: { 'aria-label': 'סינון שיעורים' },
    });
    const categories = uniqueSortedValues(
        sessions.map((session) => session.classTemplate?.category),
    ).map((value) => ({ value, text: value }));
    const types = uniqueSortedValues(
        sessions.map((session) => session.classTemplate?.title),
    ).map((value) => ({ value, text: value }));
    const instructorsById = new Map();

    sessions.forEach((session) => {
        const instructor = session.instructor;
        if (instructor?.id && instructor.name) {
            instructorsById.set(String(instructor.id), instructor.name);
        }
    });

    const instructors = [...instructorsById]
        .map(([value, text]) => ({ value, text }))
        .sort((a, b) => a.text.localeCompare(b.text, 'he'));
    const fields = [
        { key: 'category', id: 'filter-category', label: 'קטגוריה', options: categories },
        { key: 'type', id: 'filter-type', label: 'סוג אימון', options: types },
        { key: 'instructor', id: 'filter-instructor', label: 'מאמן', options: instructors },
    ];
    const controls = {};

    fields.forEach(({ key, id, label, options }) => {
        const select = createOptions({ id, name: key }, options, filters[key]);
        const field = createEl('div', { className: 'schedule-filter' },
            createEl('label', { text: label, attrs: { for: id } }),
            select,
        );
        controls[key] = select;
        form.append(field);
    });

    const search = createEl('input', {
        attrs: {
            id: 'filter-search',
            name: 'q',
            type: 'search',
            value: filters.q,
            placeholder: 'חיפוש לפי שיעור או מאמן',
        },
    });
    controls.q = search;
    form.append(createEl('div', { className: 'schedule-filter schedule-filter--search' },
        createEl('label', { text: 'חיפוש', attrs: { for: 'filter-search' } }),
        search,
    ));

    const available = createEl('input', {
        attrs: {
            id: 'filter-available',
            name: 'available',
            type: 'checkbox',
            checked: filters.available === '1',
        },
    });
    controls.available = available;
    form.append(createEl('div', { className: 'schedule-filter schedule-filter--checkbox' },
        available,
        createEl('label', {
            text: 'רק שיעורים עם מקום פנוי',
            attrs: { for: 'filter-available' },
        }),
    ));

    let searchTimeout;
    const emitChange = () => {
        window.clearTimeout(searchTimeout);
        onChange({
            category: controls.category.value,
            type: controls.type.value,
            instructor: controls.instructor.value,
            available: controls.available.checked ? '1' : '',
            q: controls.q.value.trim(),
        });
    };

    fields.forEach(({ key }) => controls[key].addEventListener('change', emitChange));
    controls.available.addEventListener('change', emitChange);
    controls.q.addEventListener('input', () => {
        window.clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(emitChange, 300);
    });

    const clearButton = createEl('button', {
        className: 'btn btn-secondary schedule-filter__clear',
        text: 'ניקוי',
        attrs: { type: 'button' },
    });
    clearButton.addEventListener('click', () => {
        Object.values(controls).forEach((control) => {
            if (control.type === 'checkbox') {
                control.checked = false;
            } else {
                control.value = '';
            }
        });
        window.clearTimeout(searchTimeout);
        emitChange();
    });
    form.append(clearButton);

    form.addEventListener('submit', (event) => event.preventDefault());
    return form;
};

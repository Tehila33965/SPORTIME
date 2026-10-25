// ממלא select עם אפשרויות מתוך רשימה, עם אפשרות ריקה ראשונה.
export const fillSelect = (select, items, getValue, getLabel, selectedValue) => {
    if (!select) {
        return;
    }

    select.replaceChildren();

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'בחירה...';
    select.appendChild(emptyOption);

    items.forEach((item) => {
        const option = document.createElement('option');
        option.value = String(getValue(item));
        option.textContent = String(getLabel(item));

        if (selectedValue !== undefined && selectedValue !== null && String(selectedValue) === String(option.value)) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
        emptyOption.selected = true;
    }
};

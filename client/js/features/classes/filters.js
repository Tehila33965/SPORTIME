const FILTER_KEYS = ['category', 'type', 'instructor', 'available', 'q'];

export const readFilters = () => {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? '']));
};

export const writeFilters = (filters) => {
    const url = new URL(window.location.href);

    FILTER_KEYS.forEach((key) => {
        const value = String(filters[key] ?? '').trim();
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

export const filterSessions = (sessions, filters) => {
    const query = filters.q.trim().toLocaleLowerCase();

    return sessions.filter((session) => {
        if (filters.category && session.classTemplate?.category !== filters.category) {
            return false;
        }

        if (filters.type && session.classTemplate?.title !== filters.type) {
            return false;
        }

        if (filters.instructor && String(session.instructor?.id ?? '') !== filters.instructor) {
            return false;
        }

        if (filters.available === '1'
            && Number(session.registeredCount) >= Number(session.maxParticipants)) {
            return false;
        }

        if (query) {
            const searchableText = [
                session.classTemplate?.title,
                session.classTemplate?.category,
                session.instructor?.name,
            ].filter(Boolean).join(' ').toLocaleLowerCase();

            if (!searchableText.includes(query)) {
                return false;
            }
        }

        return true;
    });
};

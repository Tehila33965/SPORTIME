import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { showFormError } from '../../shared/dom.js';
import { getClassTemplates } from './classTemplate.service.js';
import { getInstructors } from './instructor.service.js';
import { getClassSession, addClassSession, updateClassSession } from '../classes/classSession.service.js';
import { fillSelect } from './components/selectOptions.js';

if (requireAdmin()) {
    mountHeader();

    const form = document.querySelector('#session-form');
    const title = document.querySelector('#session-form-title');
    const classTemplateSelect = document.querySelector('#classTemplate');
    const instructorSelect = document.querySelector('#instructor');
    const dateInput = document.querySelector('#date');
    const timeInput = document.querySelector('#time');
    const maxParticipantsInput = document.querySelector('#maxParticipants');
    const registeredCountText = document.querySelector('#registered-count');
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('id');
    const today = new Date();
    const todayKey = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    const renderEmptyState = (message, linkText, href) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'empty-state';

        const text = document.createElement('p');
        text.textContent = message;

        const link = document.createElement('a');
        link.href = href;
        link.className = 'btn btn-secondary';
        link.textContent = linkText;

        wrapper.append(text, link);
        form.replaceChildren(wrapper);
    };

    const populateSelects = (templates, instructors) => {
        fillSelect(classTemplateSelect, templates, (item) => item.id, (item) => item.title, '');
        fillSelect(instructorSelect, instructors, (item) => item.id, (item) => item.name, '');
    };

    const renderPageTitle = () => {
        title.textContent = sessionId ? 'עריכת שיעור' : 'הוספת שיעור';
    };

    const loadOptions = async () => {
        try {
            const [templates, instructors] = await Promise.all([
                getClassTemplates({ limit: 100 }),
                getInstructors({ limit: 100 })
            ]);

            if (!templates.length) {
                renderEmptyState('אין עדיין תבניות. אפשר להוסיף כאן', 'יצירת תבנית', '/pages/admin/template-form.html');
                return false;
            }

            if (!instructors.length) {
                renderEmptyState('אין עדיין מאמנים. אפשר להוסיף כאן', 'הוספת מאמן', '/pages/admin/instructor-form.html');
                return false;
            }

            populateSelects(templates, instructors);
            return true;
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לטעון את הרשימות');
            return false;
        }
    };

    const populateForm = (session) => {
        classTemplateSelect.value = session.classTemplate || '';
        instructorSelect.value = session.instructor || '';
        dateInput.value = String(session.date).slice(0, 10);
        timeInput.value = session.time || '';
        maxParticipantsInput.value = session.maxParticipants ?? 15;

        if (session.registeredCount !== undefined && session.registeredCount !== null) {
            registeredCountText.textContent = `נרשמו עד עכשיו: ${session.registeredCount}`;
        }
    };

    const loadSession = async () => {
        if (!sessionId) {
            dateInput.min = todayKey;
            return;
        }

        try {
            const session = await getClassSession(sessionId);
            populateForm(session);
            registeredCountText.textContent = `נרשמו עד עכשיו: ${session.registeredCount ?? 0}`;
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לטעון את פרטי השיעור');
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const classTemplate = classTemplateSelect.value;
        const instructor = instructorSelect.value;
        const date = dateInput.value;
        const time = timeInput.value;
        const maxParticipants = Number(maxParticipantsInput.value);

        if (!classTemplate || !instructor || !date || !time) {
            showFormError(form, 'יש לבחור תבנית, מאמן, תאריך ושעה');
            return;
        }

        if (sessionId) {
            const currentSession = await getClassSession(sessionId).catch(() => null);
            const currentRegistered = Number(currentSession?.registeredCount ?? 0);

            if (maxParticipants < currentRegistered) {
                showFormError(form, 'מספר המשתתפים המקסימלי לא יכול להיות קטן ממספר הנרשמים הנוכחי');
                return;
            }
        }

        const payload = {
            classTemplate,
            instructor,
            date,
            time,
            maxParticipants,
        };

        try {
            if (sessionId) {
                await updateClassSession(sessionId, payload);
            } else {
                await addClassSession(payload);
            }

            window.location.href = '/pages/admin/schedule.html';
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לשמור את השיעור');
        }
    });

    renderPageTitle();

    loadOptions().then((ready) => {
        if (ready) {
            loadSession();
        }
    });
}

const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('pt-BR', options);
};

const getTasksFromLocalStorage = () => {
    const localTasks = JSON.parse(window.localStorage.getItem('tasks'));
    return localTasks ? localTasks : [];
};

const setTasksInLocalStorage = (tasks) => {
    window.localStorage.setItem('tasks', JSON.stringify(tasks));
};

const removeTask = (taskId) => {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(({ id }) => parseInt(id) !== parseInt(taskId));
    setTasksInLocalStorage(updatedTasks);
    document.getElementById("todo-list").removeChild(document.getElementById(taskId));
};

const removeDoneTasks = () => {
    const tasks = getTasksFromLocalStorage();
    const tasksToRemove = tasks.filter(({ checked }) => checked).map(({ id }) => id);
    const updatedTasks = tasks.filter(({ checked }) => !checked);

    setTasksInLocalStorage(updatedTasks);

    tasksToRemove.forEach((taskId) => {
        const el = document.getElementById(taskId);
        if (el) document.getElementById("todo-list").removeChild(el);
    });
};

const createTaskListItem = (task, isCompleted = false) => {
    const list = document.getElementById('todo-list');
    const toDo = document.createElement('li');
    toDo.id = task.id;

    const taskContentWrapper = document.createElement('div');
    taskContentWrapper.className = 'task-content-wrapper';

    const descriptionDiv = document.createElement('div');
    descriptionDiv.textContent = task.description;
    descriptionDiv.className = 'task-description';

    const labelDateContainer = document.createElement('div');
    labelDateContainer.className = 'label-date-container';

    const labelDiv = document.createElement('div');
    labelDiv.textContent = task.label || '';
    labelDiv.className = 'task-label';

    const dateDiv = document.createElement('div');
    dateDiv.textContent = task.createdAt ? `Criado em: ${task.createdAt}` : '';
    dateDiv.className = 'task-date';

    labelDateContainer.appendChild(labelDiv);
    labelDateContainer.appendChild(dateDiv);

    const checkmarkElement = document.createElement('span');
    checkmarkElement.className = 'checkmark-icon';
    checkmarkElement.innerHTML = '&#10003;';
    checkmarkElement.style.display = task.checked ? 'flex' : 'none';

    const completeButton = document.createElement('button');
    completeButton.textContent = 'Concluir';
    completeButton.ariaLabel = 'Marcar como Concluído';
    completeButton.className = 'complete-btn';
    completeButton.style.display = task.checked ? 'none' : 'block';

    if (task.checked) {
        descriptionDiv.classList.add('completed');
    }

    completeButton.onclick = () => {
        completeButton.style.display = 'none';
        checkmarkElement.style.display = 'flex';
        descriptionDiv.classList.add('completed');

        const tasks = getTasksFromLocalStorage();
        const updatedTasks = tasks.map((t) =>
            parseInt(t.id) === parseInt(task.id) ? { ...t, checked: true } : t
        );
        setTasksInLocalStorage(updatedTasks);

        list.removeChild(toDo);
        list.appendChild(toDo);

        updateCompletedCount();
    };

    checkmarkElement.onclick = () => {
        completeButton.style.display = 'block';
        checkmarkElement.style.display = 'none';
        descriptionDiv.classList.remove('completed');

        const tasks = getTasksFromLocalStorage();
        const updatedTasks = tasks.map((t) =>
            parseInt(t.id) === parseInt(task.id) ? { ...t, checked: false } : t
        );
        setTasksInLocalStorage(updatedTasks);

        list.removeChild(toDo);
        list.insertBefore(toDo, list.firstChild);

        updateCompletedCount();
    };


    taskContentWrapper.appendChild(descriptionDiv);
    taskContentWrapper.appendChild(labelDateContainer);

    toDo.appendChild(taskContentWrapper);
    toDo.appendChild(completeButton);
    toDo.appendChild(checkmarkElement);

    isCompleted ? list.appendChild(toDo) : list.insertBefore(toDo, list.firstChild);
    return toDo;
};

const getNewTaskId = () => Date.now();

const getNewTaskData = (event) => {
    const description = event.target.elements.description.value.trim();
    const label = event.target.elements.label.value.trim();

    if (!description) {
        alert("Task description cannot be empty!");
        return null;
    }
    const id = getNewTaskId();
    const createdAt = formatDate(new Date());

    return { id, description, label, createdAt };
};

const getCreatedTaskInfo = (event) => Promise.resolve(getNewTaskData(event));

const createTask = async (event) => {
    event.preventDefault();
    const saveButton = document.getElementById('save-task');
    saveButton.setAttribute('disabled', true);

    const newTaskData = await getCreatedTaskInfo(event);
    if (!newTaskData) {
        saveButton.removeAttribute('disabled');
        return;
    }

    createTaskListItem(newTaskData, false);

    const tasks = getTasksFromLocalStorage();
    const updatedTasks = [
        ...tasks,
        {
            id: newTaskData.id,
            description: newTaskData.description,
            label: newTaskData.label,
            createdAt: newTaskData.createdAt,
            checked: false
        }
    ];
    setTasksInLocalStorage(updatedTasks);

    updateCompletedCount();

    document.getElementById('description').value = '';
    document.getElementById('label').value = '';
    saveButton.removeAttribute('disabled');
};

window.onload = function () {
    const form = document.getElementById('create-todo-form');
    form.addEventListener('submit', createTask);

    const tasks = getTasksFromLocalStorage();
    const sortedTasks = tasks.sort((a, b) => a.checked - b.checked);

    sortedTasks.forEach((task) => {
        createTaskListItem(task, task.checked);
    });

    updateCompletedCount();
};

const updateCompletedCount = () => {
    const tasks = getTasksFromLocalStorage();
    const completedTasksCount = tasks.filter(task => task.checked).length;

    const completedCountDiv = document.getElementById('completed-count');
    if (completedTasksCount === 0) {
        completedCountDiv.textContent = '';
    } else if (completedTasksCount === 1) {
        completedCountDiv.textContent = '1 Tarefa Concluída';
    } else {
        completedCountDiv.textContent = `${completedTasksCount} tarefas concluídas`;
    }
};

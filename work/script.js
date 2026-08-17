(() => {
  'use strict';

  const STORAGE_KEY = 'task-manager.tasks';

  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const stats = document.getElementById('task-stats');
  const emptyState = document.getElementById('empty-state');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const template = document.getElementById('task-item-template');

  let tasks = loadTasks();
  let currentFilter = 'all';

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function createId() {
    return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addTask(text) {
    tasks.push({ id: createId(), text, completed: false });
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function clearCompleted() {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    render();
  }

  function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter((t) => !t.completed);
    if (currentFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    stats.textContent =
      total === 0
        ? 'No tasks yet'
        : `${completed} of ${total} task${total === 1 ? '' : 's'} completed`;
  }

  function render() {
    const filtered = getFilteredTasks();
    list.innerHTML = '';

    filtered.forEach((task) => {
      const fragment = template.content.cloneNode(true);
      const item = fragment.querySelector('.task-item');
      const checkbox = fragment.querySelector('.task-item__checkbox');
      const text = fragment.querySelector('.task-item__text');
      const deleteBtn = fragment.querySelector('.task-item__delete');

      item.classList.toggle('is-completed', task.completed);
      checkbox.checked = task.completed;
      checkbox.setAttribute(
        'aria-label',
        `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`
      );
      text.textContent = task.text;
      deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);

      checkbox.addEventListener('change', () => toggleTask(task.id));
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      list.appendChild(fragment);
    });

    emptyState.hidden = filtered.length !== 0;
    updateStats();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = '';
    input.focus();
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
})();

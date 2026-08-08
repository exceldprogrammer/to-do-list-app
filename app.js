const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todo-list");
const input = document.getElementById("todo-input");
const countedEl = document.getElementById("count");
const filterBtns = document.querySelectorAll(".filter-btn");

let currentFilter = "all";
let todos = [];

input.focus();

// --- 1. RENDERING & UI (Tailwind Updates) ---

function renderTodo() {
  list.innerHTML = "";
  const filteredTodo = getFilteredTodo();

  filteredTodo.forEach(function (t) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 group transition-all";
    if (t.done) li.classList.add("opacity-60");

    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center gap-3 w-full overflow-hidden mr-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.done;
    checkbox.className = "w-4 h-4 rounded cursor-pointer shrink-0";
    
    checkbox.addEventListener("change", function () {
      toggleDone(t.id);
    });
    
    leftDiv.appendChild(checkbox);

    if (t.editing) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = t.text;
      editInput.className = "flex-1 bg-slate-950 text-slate-200 border border-indigo-500 rounded px-2 py-1 text-sm focus:outline-none w-full";

      editInput.addEventListener("blur", function () {
        finishEditing(t.id, editInput.value);
      });
      
      editInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          editInput.blur();
        }
      });

      leftDiv.appendChild(editInput);
      
      setTimeout(function () {
        editInput.focus();
      }, 0);
    } else {
      const span = document.createElement("span");
      span.textContent = t.text;
      span.className = "text-sm text-slate-200 truncate select-none cursor-pointer w-full";

      if (t.done) {
        span.classList.add("line-through", "text-slate-500");
      }

      span.addEventListener("dblclick", function () {
        startEdit(t.id);
      });

      leftDiv.appendChild(span);
    }

    li.appendChild(leftDiv);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "&#10005;";
    deleteBtn.className = "text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sm shrink-0";

    deleteBtn.addEventListener("click", function () {
      deleteTodo(t.id);
    });

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  const active = todos.filter(function (t) {
    return !t.done;
  }).length;

  countedEl.textContent =
    todos.length === 0
      ? "No tasks"
      : active + " task" + (active === 1 ? "" : "s") + " left";

  updateFilterButtons(); 
}

function updateFilterButtons() {
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.className = "filter-btn flex-1 pb-2 border-b-2 border-indigo-500 text-indigo-400 font-semibold";
        } else {
            btn.className = "filter-btn flex-1 pb-2 border-b-2 border-transparent hover:text-slate-200 text-slate-400";
        }
    });
}

// --- 2. YOUR ORIGINAL CORE LOGIC ---

function getFilteredTodo() {
  if (currentFilter === "active") {
    return todos.filter(function (t) {
      return !t.done;
    });
  }

  if (currentFilter === "completed") {
    return todos.filter(function (t) {
      return t.done;
    });
  }

  return todos;
}

function startEdit(id) {
  const todo = todos.find(function (t) {
    return t.id === id;
  });

  if (!todo) return;

  todo.editing = true;
  renderTodo();
}

function finishEditing(id, newText) {
  const todo = todos.find(function (t) {
    return t.id === id;
  });

  if (!todo) return;

  const trimmed = newText.trim();

  if (trimmed !== "") {
    todo.text = trimmed;
  }

  todo.editing = false;

  renderTodo();
  save();
}

function toggleDone(id) {
  const todo = todos.find(function (t) {
    return t.id === id;
  });

  if (!todo) return;

  todo.done = !todo.done;

  renderTodo();
  save();
}

function deleteTodo(id) {
  todos = todos.filter(function (t) {
    return t.id !== id;
  });

  renderTodo();
  save();
}

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function load() {
  const stored = localStorage.getItem("todos");

  if (stored) {
    todos = JSON.parse(stored);

    todos.forEach(function (t) {
      t.editing = false;
    });
  }
}

// --- 3. EVENT LISTENERS ---

// Filter buttons
filterBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.dataset.filter;
    renderTodo();
  });
});

// Add todo
addBtn.addEventListener("click", function () {
  const text = input.value.trim();

  if (text === "") return;

  const newTodo = {
    id: Date.now(),
    text: text,
    done: false,
    editing: false,
  };

  todos.push(newTodo);
  input.value = "";

  renderTodo();
  save();
});

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

// --- 4. INITIALIZATION ---
load();
renderTodo();
window.onload = function () {
  renderTodoList();
};
document.addEventListener("edit", (e) => {
  handleEdit(e);
});

function renderTodoList() {
  const [search, add, esc] = getMainButtons();
  const todos = getTodos();
  const todosSelector = document.getElementById("todos");
  todos.forEach((todo, ind) => {
    todosSelector.appendChild(createTodo(todo, ind));
  });
  addOnClick(search, handleSearch);
  addOnClick(add, handleAdd);
  addOnClick(esc, handleEsc);
}
function reRenderTodoList() {
  const todosSelector = document.getElementById("todos");
  todosSelector.innerHTML = "";
  renderTodoList();
}
function addOnClick(node, callback) {
  node.addEventListener("click", callback);
}

function validateCode(textbox) {
  if (textbox.value === "") {
    textbox.setCustomValidity("Code field required");
  } else if (!/^[A-Z][0-9]{2}/gm.test(textbox.value)) {
    textbox.setCustomValidity(
      "Required format: uppercase letter + 2 digits ( ex. L99)"
    );
  } else {
    textbox.setCustomValidity("");
    return true;
  }
  return false;
}
function validateTask(textbox) {
  if (textbox.value.length < 3 || textbox.value.length > 255) {
    textbox.setCustomValidity(
      "Task should be longer than 2 and less than 256 characters"
    );
  } else {
    textbox.setCustomValidity("");
    return true;
  }
  return false;
}
function validateDate(textbox) {
  if (new Date(textbox.value) < new Date()) {
    textbox.setCustomValidity("Date cannot be in the past");
  } else {
    textbox.setCustomValidity("");
    return true;
  }
  return false;
}
function handleDelete(e) {
  removeTodo(e.target.value);
  reRenderTodoList();
}
function handleEdit(e) {
  let todo;
  if (e.type == "edit") {
    todo = getTodo(e.detail);
  } else {
    todo = getTodo(e.target.value.match(/[A-Z][0-9]{2}/gm)[0]);
  }
  const [taskI, codeI, dateI] = getInputs();
  taskI.value = todo.task;
  codeI.value = todo.code;
  dateI.value = todo.date;
}
function handleEsc(e) {
  const inputs = getInputs();
  inputs.forEach((input) => {
    input.value = "";
  });
  showAll(getTodos());
}
function handleAdd(e) {
  const [taskI, codeI, dateI] = getInputs();
  if (codeI.checkValidity() && taskI.checkValidity() && dateI.checkValidity()) {
    addTodo(taskI.value, dateI.value, codeI.value);
    reRenderTodoList();
  }
}

function handleSearch(e) {
  const [taskI, codeI, dateI] = getInputs();
  const todos = getTodos();

  const todosToHide = todos.filter(({ task, date, code }) => {
    if (!taskI.value && !codeI.value && !dateI.value) return false;
    let match = false;

    if (taskI.value && !task.includes(taskI.value)) {
      match = true;
    }
    if (dateI.value && dateI.value !== date) {
      match = true;
    }
    if (codeI.value && !code.includes(codeI.value)) {
      match = true;
    }
    return match;
  });

  showAll(todos);
  todosToHide.forEach((todo) => {
    hide(todo.code);
  });
}

function hide(id) {
  const element = document.getElementById(id);
  element.style.display = "none";
}
function show(id) {
  const element = document.getElementById(id);
  element.style.display = "flex";
}
function showAll(todos) {
  todos.forEach((todo) => {
    show(todo.code);
  });
}
function removeTodo(codeInd) {
  const todos = getTodos();
  const updatedTodos = todos.filter((todo, ind) => {
    return `${todo.code}${ind}` !== `${codeInd}`;
  });
  setTodos(updatedTodos);
}
function addTodo(task, date, code) {
  const todos = getTodos();
  let changed = false;
  updatedTodos = todos.map((todo, ind) => {
    if (todo.code == code) {
      changed = true;
      return { task, date, code };
    }
    return todo;
  });
  if (changed) {
    setTodos([...updatedTodos]);
  } else {
    setTodos([...updatedTodos, { task, date, code }]);
  }
}

function setTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getTodos() {
  const todos = localStorage.getItem("todos");
  return (
    JSON.parse(todos) ?? [
      {
        task: "dummy",
        date: new Date().toISOString().split("T")[0],
        code: "K90",
      },
    ]
  );
}

function getTodo(code) {
  return getTodos().filter((todo) => todo.code == code)[0];
}

function getInputs() {
  const task = document.getElementById("task-input");
  const code = document.getElementById("code-input");
  const date = document.getElementById("date-input");
  return [task, code, date];
}

function getMainButtons() {
  const search = document.getElementById("search");
  const add = document.getElementById("add");
  const esc = document.getElementById("esc");
  return [search, add, esc];
}

function createTodo(todo, ind) {
  const createBox = (text, className = "") => {
    const textNode = document.createTextNode(text);
    const p = document.createElement("p");
    p.appendChild(textNode);
    const box = document.createElement("div");
    box.append(p);
    box.classList.add("todo-box");
    box.classList.add(className);
    return box;
  };
  const createButton = (text) => {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-primary");
    button.textContent = text;
    return button;
  };
  const actions = document.createElement("div");
  actions.classList.add("todo-actions");
  const buttonEdit = createButton("EDIT");
  buttonEdit.value = todo.code + ind;
  addOnClick(buttonEdit, handleEdit);
  const buttonDelete = createButton("DELETE");
  buttonDelete.value = todo.code + ind;
  addOnClick(buttonDelete, handleDelete);
  actions.append(buttonEdit);
  actions.append(buttonDelete);

  const li = document.createElement("li");
  li.id = todo.code;
  li.classList.add("todo");
  addOnClick(li, function (e) {
    e.path.forEach((item) => {
      if (item.tagName == "LI") {
        document.dispatchEvent(new CustomEvent("edit", { detail: item.id }));
      }
    });
  });
  li.append(createBox(todo.code, "todo-code"));
  li.append(createBox(todo.task, "todo-task"));
  li.append(createBox(todo.date, "todo-date"));
  li.append(actions);

  return li;
}

//todo : date, task, ok, esc

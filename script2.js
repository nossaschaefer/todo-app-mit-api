const apiUrl = "http://localhost:3000/todos/";
const formWrapper = document.querySelectorAll("form"); // alle <form>-Elemente
const filters = document.querySelector("#filters-wrapper"); // <form id="filters-wrapper">
const todosOutput = document.querySelector("#todos-list"); // <ul>

// Verhindert auf allen <form>-Elementen, dass bei Buttonklick (triggert ein "submit"-Event) die Seite neu lädt
formWrapper.forEach((wrapper) => {
  wrapper.addEventListener("submit", function (event) {
    event.preventDefault();
  });
});

// STATE als "let"!
// Daten unserer App, die in der App ausgegeben werden und durch User-Interaktion verändert werden können
let state = {
  todos: [],
  filter: "all",
};

function init() {
  const btnAdd = document.querySelector("#btn-add-todo");
  const btnRm = document.querySelector("#btn-rm-done");

  getTodos();
  btnAdd.addEventListener("click", addTodo);
  btnRm.addEventListener("click", rmDoneTodos);
  filters.addEventListener("change", setFilter);
  todosOutput.addEventListener("change", updateTodo);
}

async function getTodos() {
  try {
    const response = await fetch(apiUrl);
    state.todos = await response.json();
    localStorage.setItem("state", JSON.stringify(state));
  } catch (errorMsg) {
    console.log(errorMsg);
    state.todos = JSON.parse(localStorage.getItem("state"));
  }
  filterTodos();
}

// State initial ausgeben
function renderTodos(todos = state.todos) {
  // Bevor der neue State ausgegeben wird, die vorhandene Liste leeren
  todosOutput.innerText = "";

  // Auf jedes Todo nacheinander zugreifen
  todos.forEach(createTodoElement);
}

function createTodoElement(todo) {
  // <li>
  const listEl = document.createElement("li");

  // <input type='checkbox' />
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "todo-" + todo.id;
  checkbox.checked = todo.done;
  checkbox.todoElement = todo;

  // <label>
  const description = document.createElement("label");
  description.htmlFor = checkbox.id;
  description.innerText = todo.description;

  listEl.append(checkbox, description);
  todosOutput.append(listEl);
}

async function addTodo() {
  const newTodoDescription = document.querySelector("#new-todo"); // <input type='text' />
  const description = newTodoDescription.value;

  const todoExists = state.todos.some(
    (todo) => todo.description.toLowerCase() === description.toLowerCase()
  );
  if (description.length === 0 || todoExists) return;

  const newTodo = {
    description: description,
    done: false,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  const data = await response.json();

  console.log(data); // data = Objekt, das ich vom Server zur Bestätigung zurück bekommen

  // Neues Todo zu State hinzufügen (und zwar data und nicht "newTodo", weil da dann id (vom Server gegeben) drauf ist)
  state.todos.push(data);

  // Veränderten State neu ausgeben
  state.filter = "all";

  // Inputfeld wieder leeren & Fokus wieder auf das Inputfeld setzen
  newTodoDescription.value = "";
  newTodoDescription.focus();

  // Veränderten State in Local Storage speichern
  localStorage.setItem("state", JSON.stringify(state));
  filterTodos();
}

async function rmDoneTodos() {
  // Get all completed todos
  const doneTodos = state.todos.filter((todo) => todo.done);

  // Send a DELETE request for each completed todo
  const deletePromises = doneTodos.map(async (todo) => {
    try {
      const response = await fetch(`${apiUrl}${todo.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete todo with id: ${todo.id}`);
      }

      console.log(`Deleted todo with id: ${todo.id}`);
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Wait for all DELETE requests to complete
  await Promise.all(deletePromises);

  // Remove the done todos from the state
  state.todos = state.todos.filter((todo) => !todo.done);

  // Save the updated state in localStorage
  localStorage.setItem("state", JSON.stringify(state));

  // Re-filter and render the todos
  filterTodos();
}

function updateTodo(event) {
  const todo = event.target.todoElement;

  todo.done = !todo.done;

  // Veränderten State in Local Storage speichern
  localStorage.setItem("state", JSON.stringify(state));
}

function setFilter(event) {
  state.filter = event.target.id;
  localStorage.setItem("state", JSON.stringify(state));

  filterTodos();
}

function filterTodos() {
  const checkedRadio = filters.querySelector(`#${state.filter}`);
  checkedRadio.checked = true;

  let filteredTodos;
  if (state.filter === "done") {
    filteredTodos = state.todos.filter((todo) => todo.done);
  } else if (state.filter === "open") {
    filteredTodos = state.todos.filter((todo) => todo.done === false);
  } else if (state.filter === "all") {
    filteredTodos = state.todos;
  }

  renderTodos(filteredTodos);
}

init();

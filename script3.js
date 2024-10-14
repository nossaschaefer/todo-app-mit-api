let ul = document.querySelector("ul");
let addBtn = document.querySelector("#addBtn");
let rmButton = document.querySelector("#rmButton");
let newTodo = document.querySelector("#add");
let allFilter = document.querySelector("#all");
let openFilter = document.querySelector("#open");
let doneFilter = document.querySelector("#done");

// Load todos from localStorage
// let todos = JSON.parse(localStorage.getItem("todos")) || [];
let todos = [];

// Load todos from localStorage or fetch from server if not available
function loadTodos() {
  // Check if todos exist in localStorage
  const localTodos = JSON.parse(localStorage.getItem("todos"));

  if (localTodos && localTodos.length > 0) {
    // If we have todos in localStorage, use them
    todos = localTodos;
    renderTodos();
  } else {
    // Otherwise, fetch todos from the server
    fetch("http://localhost:3000/todos")
      .then((res) => res.json())
      .then((todosFromApi) => {
        todos = todosFromApi;
        localStorage.setItem("todos", JSON.stringify(todos)); // Save fetched todo localStorage
        renderTodos();
      })
      .catch((error) => console.error("Error fetching todos:", error));
  }
}

// Function to filter and render todos
function renderTodos() {
  ul.innerHTML = ""; // Clear the current list (Tisch abräumen)

  // Determine which filter is applied
  let filteredTodos = todos;
  if (openFilter.checked) {
    filteredTodos = todos.filter((todo) => !todo.done); // Show only open todos
  } else if (doneFilter.checked) {
    filteredTodos = todos.filter((todo) => todo.done); // Show only done todos
  }

  // Render the filtered todos (Tisch decken)

  filteredTodos.forEach((todo, index) => {
    let li = document.createElement("li");
    li.textContent = todo.description;

    li.classList.add("todo-item"); // General class for all todos
    // Create checkbox and set its checked status
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;

    // Event listener to update the done status when checkbox is clicked
    checkbox.addEventListener("change", function () {
      const updatedTodo = { ...todo, done: checkbox.checked }; // Update the todo object with new done status

      fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodo),
      })
        .then((res) => res.json())
        .then((updatedTodoFromApi) => {
          // Update the local todo array with the server response
          todos[index] = updatedTodoFromApi;
          localStorage.setItem("todos", JSON.stringify(todos)); // Update localStorage
          renderTodos(); // Re-render the list after successful update
        })
        .catch((error) => {
          console.error("Error updating todo:", error);
        });
    });

    // checkbox.addEventListener("change", function () {
    //     todos[index].done = checkbox.checked; // Update the done status in the todos array
    //     localStorage.setItem("todos", JSON.stringify(todos)); // Save updated array to localStorage
    //     renderTodos(); // Re-render the list
    //   });

    // Append elements to the DOM
    ul.appendChild(li);
    li.appendChild(checkbox);
  });
}

// Function to add a new todo
function addTodo() {
  let newTodoText = newTodo.value.trim(); // Get the text from the input field and remove extra spaces

  // Validate the input
  if (newTodoText === "") {
    alert("Todo cannot be empty!");
    return;
  }

  // Create the new todo object (renamed the variable to avoid conflict)
  const newTodoItem = {
    description: newTodoText,
    done: false, // Initially, the todo is not done
  };

  // Send a POST request to the server to add the new todo
  fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodoItem),
  })
    .then((res) => res.json()) // Get the response and convert it to JSON
    .then((newTodoFromApi) => {
      todos.push(newTodoFromApi); // Add the new todo to the `todos` array
      localStorage.setItem("todos", JSON.stringify(todos)); // Save to local storage
      renderTodos(); // Re-render the todos to display the new one
      newTodo.value = ""; // Clear the input field
    })
    .catch((error) => {
      console.error("Error adding todo:", error);
    });
}

// Function to remove all done todos
function removeDoneTodos() {
  const doneTodos = todos.filter((todo) => todo.done); // Get all done todos

  // Loop through each done todo and send a DELETE request to the server
  doneTodos.forEach((todo) => {
    fetch(`http://localhost:3000/todos/${todo.id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete todo");
        }
        return res.json();
      })
      .then(() => {
        // After successful delete, filter it out from the local `todos` array
        todos = todos.filter((t) => t.id !== todo.id);
        localStorage.setItem("todos", JSON.stringify(todos)); // Update local storage
        renderTodos(); // Re-render the updated list
      })
      .catch((error) => {
        console.error("Error removing todo:", error);
      });
  });
}

// Event listeners for filter radio buttons
allFilter.addEventListener("change", renderTodos);
openFilter.addEventListener("change", renderTodos);
doneFilter.addEventListener("change", renderTodos);

// Add todo button listener
addBtn.addEventListener("click", addTodo);

// Add remove done todos button listener
rmButton.addEventListener("click", removeDoneTodos);

// Load todos on page load
loadTodos();

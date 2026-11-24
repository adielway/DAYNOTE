
/* =====================================
   DAYNOTE v1.1
   Navigation + Task + Notes
===================================== */

// STORAGE
function loadData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

let tasks = loadData("daynote_tasks");
let notes = loadData("daynote_notes");

let currentFilter = "all";
let currentView = "all";


// ELEMENTS
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyTasks = document.getElementById("emptyTasks");

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const notesList = document.getElementById("notesList");


// =====================================
// DATE
// =====================================

function updateDate() {
    const dateElement = document.getElementById("todayDate");

    dateElement.textContent = new Date().toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    ).toUpperCase();
}


// =====================================
// SAVE DATA
// =====================================

function saveTasks() {
    localStorage.setItem(
        "daynote_tasks",
        JSON.stringify(tasks)
    );
}

function saveNotes() {
    localStorage.setItem(
        "daynote_notes",
        JSON.stringify(notes)
    );
}


// =====================================
// TASK NAVIGATION
// =====================================

function switchView(view) {

    currentView = view;

    // Update sidebar buttons
    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === view
        );
    });

    // Update page label
    const pageNames = {
        all: "OVERVIEW",
        notes: "MY NOTES",
        tasks: "TO-DO LIST",
        completed: "COMPLETED"
    };

    document.getElementById("currentPage").textContent =
        pageNames[view];

    // Show and hide panels
    const taskPanel = document.querySelector(".task-panel");
    const notesPanel = document.querySelector(".notes-panel");
    const workspace = document.querySelector(".workspace");

    taskPanel.style.display =
        view === "notes" ? "none" : "block";

    notesPanel.style.display =
        view === "tasks" || view === "completed"
            ? "none" : "block";

    workspace.style.display =
        view === "notes" ? "block" : "grid";

    // Reset task filter when changing pages
    currentFilter = "all";

    document.querySelectorAll(".filter").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );
    });

    renderTasks();
    renderNotes();
}


// Sidebar click events
document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {
        switchView(button.dataset.view);
    });

});


// =====================================
// ADD TASK
// =====================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";
    taskInput.focus();

    renderTasks();
    updateStats();

});


// =====================================
// RENDER TASKS
// =====================================

function renderTasks() {

    taskList.innerHTML = "";

    let visibleTasks = [...tasks];

    // Filter by current page
    if (currentView === "completed") {
        visibleTasks = visibleTasks.filter(
            task => task.completed
        );
    }

    // Filter by task status
    if (currentView !== "completed") {

        if (currentFilter === "pending") {
            visibleTasks = visibleTasks.filter(
                task => !task.completed
            );
        }

        if (currentFilter === "completed") {
            visibleTasks = visibleTasks.filter(
                task => task.completed
            );
        }
    }

    // Update heading
    document.getElementById("taskHeading").textContent =
        currentView === "completed"
            ? "Finished tasks."
            : "Your tasks.";

    // Show or hide task controls
    taskForm.style.display =
        currentView === "completed" ? "none" : "flex";

    document.querySelector(".task-filters").style.display =
        currentView === "completed" ? "none" : "flex";


    // Create task elements
    visibleTasks.forEach(task => {

        const item = document.createElement("div");

        item.className =
            "task-item" + (task.completed ? " done" : "");

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", () => {

            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
            updateStats();

        });


        // Task text
        const text = document.createElement("span");

        text.className = "task-text";
        text.textContent = task.text;


        // Action buttons
        const actions = document.createElement("div");

        actions.className = "task-actions";


        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "✎";
        editButton.title = "Edit task";

        editButton.addEventListener("click", () => {

            const updated = prompt(
                "Edit your task:",
                task.text
            );

            if (updated === null || updated.trim() === "") {
                return;
            }

            task.text = updated.trim();

            saveTasks();
            renderTasks();

        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";

        deleteButton.addEventListener("click", () => {

            if (!confirm("Delete this task?")) return;

            tasks = tasks.filter(
                currentTask => currentTask.id !== task.id
            );

            saveTasks();
            renderTasks();
            updateStats();

        });


        actions.append(editButton, deleteButton);

        item.append(checkbox, text, actions);

        taskList.appendChild(item);

    });


    // Empty state
    emptyTasks.style.display =
        visibleTasks.length === 0 ? "block" : "none";

    if (visibleTasks.length === 0) {

        let message = "Nothing here just yet.";

        if (currentView === "completed") {
            message = "No completed tasks yet.";
        } else if (currentFilter === "pending") {
            message = "No pending tasks. Nice!";
        } else if (currentFilter === "completed") {
            message = "Nothing completed just yet.";
        }

        emptyTasks.querySelector("p").textContent = message;

    }

}


// =====================================
// TASK FILTERS
// =====================================

document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.toggle(
                "active",
                filter === button
            );
        });

        renderTasks();

    });

});


// =====================================
// ADD NOTE
// =====================================

noteForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        alert("Please add a title and some content.");
        return;
    }

    const newNote = {
        id: crypto.randomUUID(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString()
    };

    notes.unshift(newNote);

    saveNotes();

    noteForm.reset();

    renderNotes();

});


// =====================================
// RENDER NOTES
// =====================================

function renderNotes() {

    notesList.innerHTML = "";

    notes.forEach(note => {

        const item = document.createElement("div");
        item.className = "note-item";

        const heading = document.createElement("h4");
        heading.textContent = note.title;

        const content = document.createElement("p");
        content.textContent = note.content;

        const meta = document.createElement("div");
        meta.className = "note-meta";

        const date = document.createElement("span");
        date.textContent = note.date;

        const actions = document.createElement("div");

        // Edit note
        const editButton = document.createElement("button");

        editButton.textContent = "EDIT";

        editButton.addEventListener("click", () => {

            const newTitle = prompt("Edit title:", note.title);

            if (newTitle === null || !newTitle.trim()) return;

            const newContent = prompt(
                "Edit content:",
                note.content
            );

            if (newContent === null || !newContent.trim()) return;

            note.title = newTitle.trim();
            note.content = newContent.trim();

            saveNotes();
            renderNotes();

        });


        // Delete note
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "DELETE";

        deleteButton.addEventListener("click", () => {

            if (!confirm("Delete this note?")) return;

            notes = notes.filter(
                currentNote => currentNote.id !== note.id
            );

            saveNotes();
            renderNotes();

        });


        actions.append(editButton, deleteButton);
        meta.append(date, actions);

        item.append(heading, content, meta);

        notesList.appendChild(item);

    });


    document.getElementById("noteCount").textContent =
        String(notes.length).padStart(2, "0") + " SAVED";

}


// =====================================
// UPDATE STATISTICS
// =====================================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    document.getElementById("totalCount").textContent =
        String(total).padStart(2, "0");

    document.getElementById("completedCount").textContent =
        String(completed).padStart(2, "0");

    document.getElementById("progressPercent").textContent =
        percentage + "%";

    document.getElementById("progressFill").style.width =
        percentage + "%";

}


// =====================================
// INITIALIZE
// =====================================

function initializeApp() {

    updateDate();

    renderTasks();

    renderNotes();

    updateStats();

    switchView("all");

}

initializeApp();

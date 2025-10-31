const modal = document.getElementById("Modal");
const eventForm = document.getElementById("eventForm");
let weekStart = new Date(2025, 10, 29);
weekStart.setHours(0, 0, 0, 0);
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function renderWeekHeader() {
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDates.push(date);
  }

  weekDates.forEach((date, index) => {
    const header = document.getElementById(`day${index}`);
    const isToday =
      date.toDateString() === new Date(2025, 10, 29).toDateString();
    header.innerHTML = `
           <div class="text-[10px] sm:text-xs font-medium ${
             isToday ? "text-blue-500" : "text-gray-500"
           }">${dayNames[index]}</div>
           <div class="text-lg sm:text-2xl font-semibold ${
             isToday
               ? "text-white bg-blue-500 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mt-1"
               : "text-gray-800 mt-1"
           }">${date.getDate()}</div>
           `;
  });

  const endDate = new Date(weekDates[5]);
  const startDate = new Date(weekDates[1]);
  document.getElementById("weekRange").textContent = ` ${
    monthNames[weekDates[0].getMonth()]
  } ${weekDates[0].getDate()} - ${
    monthNames[endDate.getMonth()]
  } ${endDate.getDate()} ${weekDates[0].getFullYear()}`;
}

function renderHours() {
  const calendarBody = document.getElementById("calendarBody");
  calendarBody.innerHTML = "";

  for (let h = 0; h < 24; h++) {
    const row = document.createElement("tr");
    const hours = document.createElement("td");
    hours.className =
      "border border-gray-200 p-1 sm:p-2 text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-50";

    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";
    hours.textContent = `${displayHour} ${ampm}`;
    row.appendChild(hours);

    for (let d = 0; d < 7; d++) {
      const cell = document.createElement("td");
      const weekend = d === 0 || d === 6;
      cell.className =
        "border border-gray-200 h-12 sm:h-16 hover:bg-gray-50 transition duration-150 relative";
      cell.setAttribute("data-day", d);
      cell.setAttribute("data-hour", h);
      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }
}

document.getElementById("nextWeek").addEventListener("click", () => {
  weekStart.setDate(weekStart.getDate() + 7);
  renderWeekHeader();
  displayEvents();
});

document.getElementById("prevWeek").addEventListener("click", () => {
  weekStart.setDate(weekStart.getDate() - 7);
  renderWeekHeader();
  displayEvents();
});

document.getElementById("addEventBtn").addEventListener("click", () => {
  modal.classList.remove("hidden");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
  document.getElementById("eventForm").reset();
});

modal.addEventListener("click", (e) => {
  if (e.target.id === "Modal") {
    modal.classList.add("hidden");
    document.getElementById("eventForm").reset();
  }
});

function addEvent(event) {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events.push(event);
  localStorage.setItem("events", JSON.stringify(events));
  console.log("data saved successfully");
}

eventForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const eventDateValue = document.getElementById("eventDate").value;
  const workDays = new Date(eventDateValue).getDay();

  if (workDays === 0 || workDays === 6) {
    alert("You cannot create events on Sunday or Saturday.");
    return;
  }
  const event = {
    id: Date.now(),
    client: document.getElementById("clientName").value,
    eventDate: eventDateValue,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    members: document.getElementById("members").value,
    type: document.getElementById("type").value,
    dayIndex: workDays,
  };

  addEvent(event);
  displayEvents();
  modal.classList.add("hidden");
  eventForm.reset();
});

function getTypeColor(type) {
  const colors = {
    vip: "bg-red-500",
    "sur-place": "bg-green-500",
    anniversaire: "bg-orange-500",
    "work-meeting": "bg-blue-500",
  };
  return colors[type] || "bg-blue-500";
}

function displayEvents() {
  document.querySelectorAll(".event-item").forEach((el) => el.remove());

  const events = JSON.parse(localStorage.getItem("events")) || [];

  events.forEach((event) => {
    const eventDate = new Date(event.eventDate);
    const startHour = parseInt(event.startDate.split(":")[0]);

    const dayOfWeek = eventDate.getDay();

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStartCopy = new Date(weekStart);
    weekStartCopy.setHours(0, 0, 0, 0);

    if (eventDate >= weekStartCopy && eventDate <= weekEnd) {
      const cell = document.querySelector(
        `[data-day="${dayOfWeek}"][data-hour="${startHour}"]`
      );

      if (cell) {
        const eventDiv = document.createElement("div");
        eventDiv.className = `event-item absolute inset-1 ${getTypeColor(
          event.type
        )} text-white text-[10px] sm:text-xs p-1 rounded shadow overflow-hidden cursor-pointer hover:opacity-90`;
        eventDiv.textContent = `${event.client}`;
        eventDiv.addEventListener("click", () => {
          showDetails(event);
        });

        event.draggable('true'); 
        eventDiv.setAttribute('data-event-ud', event.id); 

        eventDiv.textContent = `${event.client}`; 

        eventDiv.addEventListener('dragstart', handleDragstart);

        cell.appendChild(eventDiv);
      }
    }
  });
}

function showDetails(event) {
  const popup = document.createElement("div");
  popup.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
  popup.id = "eventpopup";

  popup.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Edit Event</h2>
        <button id="closeEditPopup" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      
      <form id="editEventForm" class="space-y-3 sm:space-y-4">
        <input type="hidden" id="editId" value="${event.id}">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
          <input type="text" id="editClient" value="${event.client}" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="editEventDate" value="${event.eventDate}" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" id="editStartDate" value="${event.startDate}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" id="editEndDate" value="${event.endDate}" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
          <input type="number" id="editMembers" value="${event.members}" min="1"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
          <select id="editType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
            <option value="vip" ${
              event.type === "vip" ? "selected" : ""
            }>🔴 VIP</option>
            <option value="sur-place" ${
              event.type === "sur-place" ? "selected" : ""
            }>🟢 Sur Place</option>
            <option value="anniversaire" ${
              event.type === "anniversaire" ? "selected" : ""
            }>🟠 Anniversaire</option>
            <option value="work-meeting" ${
              event.type === "work-meeting" ? "selected" : ""
            }>🔵 Work Meeting</option>
          </select>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <button type="button" id="deleteEventBtn" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200 text-sm sm:text-base">
            Delete
          </button>
          <button type="button" id="cancelEditBtn" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition duration-200 text-sm sm:text-base">
            Cancel
          </button>
          <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200 text-sm sm:text-base">
            Update
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(popup);
  document.getElementById("closeEditPopup").addEventListener("click", () => {
    popup.remove();
  });
  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    popup.remove();
  });

  popup.addEventListener("click", (e) => {
    if (e.target.id === "eventpopup") {
      popup.remove();
    }
  });

  document.getElementById("deleteEventBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(event.id);
      popup.remove();
      displayEvents();
    }
  });

  document.getElementById("editEventForm").onsubmit = (e) => {
    e.preventDefault();
    const updatedEvent = {
      id: parseInt(document.getElementById("editId").value),
      client: document.getElementById("editClient").value,
      eventDate: document.getElementById("editEventDate").value,
      startDate: document.getElementById("editStartDate").value,
      endDate: document.getElementById("editEndDate").value,
      members: document.getElementById("editMembers").value,
      type: document.getElementById("editType").value,
      dayIndex: new Date(
        document.getElementById("editEventDate").value
      ).getDay(),
    };

    updateEvent(updatedEvent);
    popup.remove();
    displayEvents();
  };
}

function updateEvent(updatedEvent) {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  const index = events.findIndex((e) => e.id === updatedEvent.id);

  if (index !== -1) {
    events[index] = updatedEvent;
    localStorage.setItem("events", JSON.stringify(events));
    console.log("Event updated successfully!");
  } else {
    console.log("Event not found!");
  }
}

function deleteEvent(eventId) {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events = events.filter((e) => e.id !== eventId);
  localStorage.setItem("events", JSON.stringify(events));
  console.log("Event deleted successfully!");
}


renderHours();
renderWeekHeader();
displayEvents();

// -------------------------------
// DOM ELEMENTS
// -------------------------------

const textInput = document.getElementById("textComplaint");
const fileInput = document.getElementById("fileComplaint");
const outputBox = document.getElementById("output");
const submitBtn = document.getElementById("submitBtn");


// -------------------------------
// SEND COMPLAINT TO BACKEND
// -------------------------------

async function sendComplaint() {
    outputBox.innerHTML = "<p><b>Processing your complaint...</b> ⏳</p>";

    const formData = new FormData();

    // Attach text complaint
    if (textInput.value.trim() !== "") {
        formData.append("text", textInput.value.trim());
    }

    // Attach file complaint (image / audio)
    if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
    }

    try {
        // 🚀 Send to backend FastAPI endpoint
        const response = await fetch("http://localhost:8000/api/complaint", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // Display structured output
        displayTicket(data);

    } catch (err) {
        outputBox.innerHTML = `<p style="color:red;">
            ❌ Error connecting to the backend: ${err}
        </p>`;
    }
}


// -------------------------------
// DISPLAY STRUCTURED TICKET
// -------------------------------

function displayTicket(ticket) {
    outputBox.innerHTML = `
        <div class="card">
            <h2>📄 Structured Ticket</h2>
            <p><b>Category:</b> ${ticket.category}</p>
            <p><b>Department:</b> ${ticket.department}</p>
            <p><b>Urgency:</b> ${ticket.urgency}</p>
            <p><b>Location:</b> ${ticket.location}</p>
            <p><b>Description:</b> ${ticket.description}</p>
            <p><b>Status:</b> ${ticket.status}</p>
            <p><b>Ticket ID:</b> ${ticket.ticket_id}</p>
        </div>
    `;
}


// -------------------------------
// BUTTON EVENT LISTENER
// -------------------------------

submitBtn.addEventListener("click", sendComplaint);

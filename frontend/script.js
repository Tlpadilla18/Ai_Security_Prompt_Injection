
/* ==========================================
   1. GET HTML ELEMENTS
========================================== */

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const submitBtn = document.getElementById("submitBtn");

const verifyForm = document.getElementById("verifyForm");
const secretInput = document.getElementById("secretInput");
const verifyBtn = document.getElementById("verifyBtn");
const verifyResult = document.getElementById("verifyResult");


/* ==========================================
   2. DISPLAY CHAT MESSAGES
========================================== */

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.classList.add("message", sender);
    message.textContent = text;

    chatBox.appendChild(message);

    // Automatically scroll to newest message
    chatBox.scrollTop = chatBox.scrollHeight;
}


/* ==========================================
   3. SEND QUESTION TO CHATBOT
========================================== */

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = userInput.value.trim();

    if (!question) {
        return;
    }

    // Display user's question
    addMessage(question, "user");

    // Clear input
    userInput.value = "";

    // Disable button while waiting
    submitBtn.disabled = true;
    submitBtn.textContent = "Thinking...";

    try {
        // Send question to Express backend
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.reply || "Chat request failed."
            );
        }

        // Display AI response
        addMessage(
            data.reply || "No response received.",
            "bot"
        );

    } catch (error) {
        console.error("Chat error:", error);

        addMessage(
            "Sorry, something went wrong. Please try again.",
            "bot"
        );

    } finally {
        // Enable button again
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
        userInput.focus();
    }
});


/* ==========================================
   4. VERIFY SECRET
========================================== */

verifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const guess = secretInput.value;

    if (!guess.trim()) {
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = "Checking...";

    // Reset previous result
    verifyResult.textContent = "";
    verifyResult.className = "";

    try {
        const response = await fetch("/api/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                guess: guess
            })
        });

        if (!response.ok) {
            throw new Error("Verification request failed.");
        }

        const data = await response.json();

        // Display verification result
        verifyResult.textContent = data.verify;

        if (data.verify === "Correct") {
            verifyResult.className = "success";

        } else if (data.verify === "Incorrect") {
            verifyResult.className = "error";

        } else if (data.verify === "Hello") {
            verifyResult.className = "success";
        }

    } catch (error) {
        console.error("Verification error:", error);

        verifyResult.textContent =
            "Unable to verify. Please try again.";

        verifyResult.className = "error";

    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify Secret";
    }
});

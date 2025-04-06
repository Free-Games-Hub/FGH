// Ensure Firebase is loaded
console.log("Firebase Loaded:", firebase);

// Reference the database
const database = firebase.database();

// Create a unique user ID for this session
if (!sessionStorage.getItem("userId")) {
    sessionStorage.setItem("userId", "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5));
}
const userId = sessionStorage.getItem("userId");

// Add user to Firebase when they join
database.ref(`/activeUsers/${userId}`).set({
    timestamp: Date.now()
});

// Function to remove inactive users (every 7 seconds)
function cleanInactiveUsers() {
    const threshold = Date.now() - 7000; // 7 seconds inactivity
    database.ref("/activeUsers").once("value", (snapshot) => {
        snapshot.forEach((user) => {
            if (user.val().timestamp < threshold) {
                database.ref(`/activeUsers/${user.key}`).remove();
            }
        });
    });
}

// Function to update the displayed user count
function updateUserCount() {
    database.ref("/activeUsers").on("value", (snapshot) => {
        document.getElementById("user-count").textContent = snapshot.numChildren();
    });
}

// Update user's last activity every 5 seconds
setInterval(() => {
    database.ref(`/activeUsers/${userId}`).set({
        timestamp: Date.now()
    });
}, 5000);

// Remove user from Firebase when they leave
window.addEventListener("beforeunload", () => {
    database.ref(`/activeUsers/${userId}`).remove();
});

// Start updating user count
updateUserCount();

// Clean up inactive users every 10 seconds
setInterval(cleanInactiveUsers, 10000);


// Logo movement on scroll
window.addEventListener("scroll", () => {
    const logo = document.getElementById("logo");
    if (window.scrollY > 50) {
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
});
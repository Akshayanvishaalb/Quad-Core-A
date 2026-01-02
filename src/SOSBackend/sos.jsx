// function triggerSOS() {
//   if (!navigator.geolocation) {
//     alert("Geolocation not supported");
//     return;
//   }
//
//   navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const data = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         };
//
//         document.getElementById("output").innerText =
//             "Location captured...\nSending SOS...";
//
//         const res = await fetch("http://localhost:4000/sos", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(data)
//         });
//
//         const result = await res.json();
//         document.getElementById("output").innerText =
//             JSON.stringify(result, null, 2);
//       },
//       () => alert("Location access denied")
//   );
// }


function triggerSOS() {
    const modal = document.getElementById("sosModal");
    const output = document.getElementById("modalOutput");

    // Show modal
    modal.style.display = "block";
    output.innerText = "Fetching location...";

    if (!navigator.geolocation) {
        output.innerText = "Geolocation not supported";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const data = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            output.innerText = "Location captured...\nSending SOS...";

            try {
                const res = await fetch("http://localhost:4000/sos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();
                output.innerText = JSON.stringify(result, null, 2);
            } catch (err) {
                output.innerText = "Error sending SOS: " + err.message;
            }
        },
        () => output.innerText = "Location access denied"
    );
}

// Close modal when clicking X
document.getElementById("closeModal").onclick = () => {
    document.getElementById("sosModal").style.display = "none";
};

// Optional: Close modal when clicking outside the content
window.onclick = (event) => {
    const modal = document.getElementById("sosModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

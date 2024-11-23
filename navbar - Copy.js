document.addEventListener("DOMContentLoaded", function () {
    // Get the current path
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1; // Folder depth
    const relativePath = "../".repeat(depth); // Adjust relative path based on depth

    // Load the navbar HTML
    fetch(`${relativePath}navbar.html`)
        .then((response) => {
            if (!response.ok) throw new Error("Navbar file not found");
            return response.text();
        })
        .then((navbarHtml) => {
            // Create a container for the navbar
            const navbarContainer = document.createElement("div");
            navbarContainer.innerHTML = navbarHtml;

            // Adjust all <a> tags to use the relative path
            const links = navbarContainer.querySelectorAll("a");
            links.forEach((link) => {
                const href = link.getAttribute("href");
                if (!href.startsWith("http") && !href.startsWith("#")) {
                    link.setAttribute("href", relativePath + href);
                }
            });

            // Insert the navbar into the page
            document.body.insertAdjacentElement("afterbegin", navbarContainer);
        })
        .catch((error) => {
            console.error("Error loading navbar:", error);
        });
});

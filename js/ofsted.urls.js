// document.addEventListener("DOMContentLoaded", function () {
//     // Get all anchor tags with a .html extension and remove it
//     var anchors = document.querySelectorAll("a[href$='.html']");
//     anchors.forEach(function (anchor) {
//         anchor.setAttribute(
//             "href",
//             anchor.getAttribute("href").replace(".html", "")
//         );
//     });

//     // Remove .html from the current page's URL
//     var currentPageUrl = window.location.href;
//     if (currentPageUrl.endsWith(".html")) {
//         var updatedUrl = currentPageUrl.replace(".html", "");
//         window.history.replaceState({}, document.title, updatedUrl);
//     }
// });
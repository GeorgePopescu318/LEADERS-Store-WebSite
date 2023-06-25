let tema = localStorage.getItem("tema");
if (tema === "dark") {
    document.body.classList.add("dark");
} else if (tema === "autohton") {
    document.body.classList.add("autohton");
}

window.addEventListener("DOMContentLoaded", function() {
    const radioButtons = document.getElementsByName("nume");

    if (document.body.classList.contains("dark")) {
        radioButtons[1].checked = true;
    } else if (tema === "autohton") {
        radioButtons[2].checked = true;
    } else {
        radioButtons[0].checked = true;
    }

    radioButtons[0].onclick = function() {
        document.body.classList.remove("dark", "autohton");
        localStorage.setItem("tema", "light");
    }

    radioButtons[1].onclick = function() {
        document.body.classList.remove("autohton");
        document.body.classList.add("dark");
        localStorage.setItem("tema", "dark");
    }

    radioButtons[2].onclick = function() {
        document.body.classList.remove("dark");
        document.body.classList.add("autohton");
        localStorage.setItem("tema", "autohton");
    }
});
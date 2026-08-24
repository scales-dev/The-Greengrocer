// i prefer to avoid javascript as much as possible as some people do have it disabled
// but afaik there is no other way to do this.
const navButton = document.getElementById("mobile-nav");
const navBarOptions = document.getElementsByClassName("nav-bar");

navButton.addEventListener("click", () => {
    // typescript and java have better looking for loops, Im sure js has too, but autocomplete didnt tell me so
    for (let i = 0; i < navBarOptions.length; i++) {
        navBarOptions[i].classList.toggle("clicked-nav-bar");
    }
});

// when resizing the window we close the nav bar, in case they full screened while the nav bar was open.
window.addEventListener("resize", () => {
    for (let i = 0; i < navBarOptions.length; i++) {
        navBarOptions[i].classList.remove("clicked-nav-bar");
    }
});
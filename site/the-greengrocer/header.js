// i prefer to avoid javascript as much as possible as some people do have it disabled
// but afaik there is no other way to do this.
const navButton = document.getElementById("mobile-nav");
const navBarOptions = document.getElementsByClassName("nav-bar");

navButton.addEventListener("click", () => {
    for (let i = 0; i < navBarOptions.length; i++) {
        navBarOptions[i].classList.toggle("clicked-nav-bar");
    }
});
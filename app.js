function copyemail() {
  navigator.clipboard.writeText("akramumad@gmail.com");
  const c = document.querySelector(".copied");
  c.style.opacity = "1";
  setTimeout(() => (c.style.opacity = "0"), 1000);
}

document.querySelectorAll(".game-card").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.add("launching");

    setTimeout(() => {
      card.classList.remove("launching");
    }, 250);
  });
});

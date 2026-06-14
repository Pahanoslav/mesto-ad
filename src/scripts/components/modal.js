const handleEscClose = (evt) => {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");

    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

export const openModalWindow = (popup) => {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", handleEscClose);
};

export const closeModalWindow = (popup) => {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", handleEscClose);
};

export const setModalCloseHandlers = (popup) => {
  const closeButton = popup.querySelector(".popup__close");

  closeButton.addEventListener("click", () => closeModalWindow(popup));

  popup.addEventListener("mousedown", (evt) => {
    if (evt.target === popup) {
      closeModalWindow(popup);
    }
  });
};

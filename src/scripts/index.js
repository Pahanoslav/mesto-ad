import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  openModalWindow,
  closeModalWindow,
  setModalCloseHandlers,
} from "./components/modal.js";
import { createCard, updateLikeButton, updateLikeCount, removeCard } from "./components/card.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Профиль
const profileImage = document.querySelector(".profile__image");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");

// Список карточек
const placesList = document.querySelector(".places__list");

// Попап редактирования профиля
const editProfilePopup = document.querySelector(".popup_type_edit");
const editProfileForm = editProfilePopup.querySelector(".popup__form");

// Попап добавления карточки
const newPlacePopup = document.querySelector(".popup_type_new-card");
const newPlaceForm = newPlacePopup.querySelector(".popup__form");

// Попап обновления аватара
const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const newAvatarForm = avatarPopup.querySelector(".popup__form");

// Попап подтверждения удаления карточки
const removeCardPopup = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardPopup.querySelector(".popup__form");

// Попап с изображением
const imagePopup = document.querySelector(".popup_type_image");
const imagePopupImage = imagePopup.querySelector(".popup__image");
const imagePopupCaption = imagePopup.querySelector(".popup__caption");

// Попап информации о карточке
const cardInfoPopup = document.querySelector(".popup_type_info");
const cardInfoList = cardInfoPopup.querySelector(".popup__info");
const cardInfoUsersList = cardInfoPopup.querySelector(".popup__list");

// Шаблоны для попапа информации о карточке
const infoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;
const infoUserPreviewTemplate = document.querySelector(
  "#popup-info-user-preview-template"
).content;

let userId = null;
let cardToDelete = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, value) => {
  const infoItem = infoDefinitionTemplate
    .querySelector(".popup__info-item")
    .cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = value;

  return infoItem;
};

const createUserPreview = (user) => {
  const userItem = infoUserPreviewTemplate
    .querySelector(".popup__list-item")
    .cloneNode(true);

  userItem.textContent = user.name;

  return userItem;
};

const handleImageClick = (name, link) => {
  imagePopupImage.src = link;
  imagePopupImage.alt = name;
  imagePopupCaption.textContent = name;
  openModalWindow(imagePopup);
};

const handleLikeClick = (cardElement, cardData, isLiked) => {
  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCard) => {
      updateLikeButton(cardElement, !isLiked);
      updateLikeCount(cardElement, updatedCard.likes.length);
    })
    .catch((err) => console.log(err));
};

const handleDeleteClick = (cardElement, cardId) => {
  cardToDelete = { cardElement, cardId };
  openModalWindow(removeCardPopup);
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return;
      }

      cardInfoList.replaceChildren();
      cardInfoUsersList.replaceChildren();

      cardInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        ),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardData.likes.forEach((user) => {
        cardInfoUsersList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoPopup);
    })
    .catch((err) => console.log(err));
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCard(cardData, userId, {
    handleLikeClick,
    handleDeleteClick,
    handleImageClick,
    handleInfoClick,
  });

  placesList[method](cardElement);
};

// Редактирование профиля
profileEditButton.addEventListener("click", () => {
  editProfileForm.elements.name.value = profileTitle.textContent;
  editProfileForm.elements.description.value = profileDescription.textContent;
  clearValidation(editProfileForm, validationConfig);
  openModalWindow(editProfilePopup);
});

editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  setUserInfo({
    name: editProfileForm.elements.name.value,
    about: editProfileForm.elements.description.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(editProfilePopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      submitButton.textContent = initialText;
    });
});

// Обновление аватара
profileImage.addEventListener("click", () => {
  newAvatarForm.reset();
  clearValidation(newAvatarForm, validationConfig);
  openModalWindow(avatarPopup);
});

newAvatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  setUserAvatar({
    avatar: newAvatarForm.elements.avatar.value,
  })
    .then((userData) => {
      profileImage.style.backgroundImage = `url('${userData.avatar}')`;
      closeModalWindow(avatarPopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      submitButton.textContent = initialText;
    });
});

// Добавление новой карточки
profileAddButton.addEventListener("click", () => {
  newPlaceForm.reset();
  clearValidation(newPlaceForm, validationConfig);
  openModalWindow(newPlacePopup);
});

newPlaceForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  submitButton.textContent = "Создание...";

  addCard({
    name: newPlaceForm.elements["place-name"].value,
    link: newPlaceForm.elements.link.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(newPlacePopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      submitButton.textContent = initialText;
    });
});

// Подтверждение удаления карточки
removeCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  if (!cardToDelete) {
    return;
  }

  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  submitButton.textContent = "Удаление...";

  deleteCard(cardToDelete.cardId)
    .then(() => {
      removeCard(cardToDelete.cardElement);
      cardToDelete = null;
      closeModalWindow(removeCardPopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      submitButton.textContent = initialText;
    });
});

// Закрытие попапов по кнопке-крестику и оверлею
document.querySelectorAll(".popup").forEach((popup) => {
  setModalCloseHandlers(popup);
});

enableValidation(validationConfig);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    userId = userData._id;

    profileImage.style.backgroundImage = `url('${userData.avatar}')`;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;

    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => console.log(err));

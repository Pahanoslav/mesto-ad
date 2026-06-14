const cardTemplate = document.querySelector("#card-template").content;

export const createCard = (
  cardData,
  userId,
  { handleLikeClick, handleDeleteClick, handleImageClick, handleInfoClick }
) => {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  updateLikeCount(cardElement, cardData.likes.length);

  if (cardData.likes.some((user) => user._id === userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () =>
      handleDeleteClick(cardElement, cardData._id)
    );
  }

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains(
      "card__like-button_is-active"
    );
    handleLikeClick(cardElement, cardData, isLiked);
  });

  cardImage.addEventListener("click", () =>
    handleImageClick(cardData.name, cardData.link)
  );

  infoButton.addEventListener("click", () => handleInfoClick(cardData._id));

  return cardElement;
};

export const updateLikeButton = (cardElement, isLiked) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  likeButton.classList.toggle("card__like-button_is-active", isLiked);
};

export const updateLikeCount = (cardElement, likesCount) => {
  const likeCount = cardElement.querySelector(".card__like-count");
  likeCount.textContent = likesCount;
};

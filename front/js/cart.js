/*********************************************************
 *   CART.JS
 *
 *         Récupération  du localStorage  des articles choisis par l'utilisateur,
 *         affichage des quantités,  prix,  couleurs des modèles,
 *         du nombre d'articles, et du  total à régler,
 *         Vérification des saisies pour la commande puis si succès
 *         obtention d'un numéro de commande unique
 *         et enfin lancement de la page de confirmation de la commande
 *
 ********************************************************** */

// fonction "recupererProduits()"  depuis l'API

async function recupererProduits() {
  const promesseFetch = await fetch("http://localhost:3000/api/products");
  try {
    if (promesseFetch.ok) {
      return (promesseJson = await promesseFetch.json());
    } else {
      console.log("Erreur http: ", reponse.status);
    }
  } catch (erreur) {
    console.error(
      "Erreur fetch. Impossible de récupérer les produits: " + erreur
    );
  }
}

// fonction "itemFromApi()" : récupération d'UN article  depuis l'API
async function itemFromApi(id) {
  let urlOneItem = "http://localhost:3000/api/products/" + id;
  const promesseFetch = await fetch(urlOneItem);
  try {
    if (promesseFetch.ok) {
      return (promesseJson = await promesseFetch.json());
    } else {
      console.log("Erreur http: ", reponse.status);
    }
  } catch (erreur) {
    console.error(
      "Erreur fetch. Impossible de récupérer le produit: " + erreur
    );
  }
}

// fonction "giveMeThePriceOfThisItem()" : récupération du prix d'un article
async function giveMeThePriceOfThisItem(id) {
  let thisItem = await itemFromApi(id);
  try {
    // console.log(thisItem.name + " - price :  " + thisItem.price);
    return thisItem.price;
  } catch (er) {
    console.error(
      "ID: " + id + " Impossible de récupérer le prix de ce produit. " + er
    );
  }
}

// fonction "giveMeTheNameOfThisItem()" : récupération du nom d'un article
async function giveMeTheNameOfThisItem(id) {
  let thisItem = await itemFromApi(id);
  try {
    // console.log("name: " + thisItem.name);
    return thisItem.name;
  } catch (er) {
    console.error(
      "ID: " + id + " Impossible de récupérer le nom de ce produit. " + er
    );
  }
}

// Extraction d'un produit à l'aide  de son id
async function hereIsTheProduct(id) {
  let allProducts = [];
  allProducts = await recupererProduits();

  let trouve = false;
  let i = 0;
  while (id && !trouve && i < allProducts.length) {
    if (allProducts[i]._id == id) {
      trouve = true;
      // console.log("\n Produit trouvé dans le localStorage: " + allProducts[i].name+ " ("+ allProducts[i].colors +")");
      return allProducts[i];
    }
    i++;
  }
  if (!trouve) {
    console.log(
      "Produit introuvable dans le localStorage ou paramètre incorrect"
    );
    return false;
  }
}

//Récupération du panier
function recuperationPanier() {
  let cart = [];
  let allItems = [];
  allItems = window.localStorage.getItem("panier");
  if (allItems === null) {
    console.log("Panier vide");
    return false;
  } else {
    cart = JSON.parse(allItems);
    return cart;
  }
}

// tri du panier selon :  (1) le modèle puis  (2) la couleur
// pour le tri des modèles, le critère utilisé ici est leur id
//ils ne sont donc pas rangés par ordre alphabétique des noms mais
// par ordre croissant des id
//en revanche les couleurs sont triées par ordre  alphabétique au sein du modèle
function trierPanier() {
  let cart = [];
  cart = recuperationPanier();
  if (cart != false) {
    let sortedCart = Array.from(cart);
    sortedCart.sort(function (a, b) {
      let resultat = a.idProduct.localeCompare(b.idProduct);
      if (resultat != 0) {
        return resultat;
      } else {
        return a.colorProduct.localeCompare(b.colorProduct);
      }
    });
    return sortedCart;
  } else {
    console.log("Tri du panier impossible");
    return false;
  }
}

// Fonction  getInfoToDisplay: récupération  des infos à afficher dans la page
let cartToDisplay = [];
async function getInfoToDisplay() {
  let sortedCart = [];
  sortedCart = trierPanier();
  let oneItem;
  let currentProduct;
  if (sortedCart != false) {
    for (let i = 0; i < sortedCart.length; i++) {
      currentProduct = await hereIsTheProduct(sortedCart[i].idProduct);
      oneItem = {
        color: sortedCart[i].colorProduct,
        id: sortedCart[i].idProduct,
        quantity: sortedCart[i].quantityProduct,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.imageUrl,
        altTxt: currentProduct.altTxt,
      };
      cartToDisplay.push(oneItem);
    } //fin du for
    return cartToDisplay;
  } else {
    console.log("\n Informations à afficher indiponibles");
    return false;
  }
}
//fin de la fonction  getInfoToDisplay

//fonction de formatage à la française d'un prix en euro
function formatPriceFr(prix) {
  prixFormate = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(prix);
  // console.log("\nPrix Brut : "+ prix  + " - Prix formaté : " + prixFormate);
  return prixFormate;
} //fin fonctionformatPriceFr

//fonction de formatage à la française d'un nombre quelconque
// (séparation entre le bloc des centaines et celui des milliers)
function formatNumberFr(nombre) {
  let formattedNumber = new Intl.NumberFormat("fr-FR").format(nombre);
  // console.log("Nombre brut : " +nombre+ " - Nombre formaté : " + formattedNumber);
  return formattedNumber;
} //fin fonction

/* ********************************************************
 *
 *   Fonction fillItems()
 *
 *   à l'aide du précédent tableau renseigné et trié (cartToDisplay),
 *   les articles   du panier vont pouvoir être affichés sur la page
 *    avec les détails suivants:
 *
 *     - image de l'article (URL)
 *     - nom de l'article
 *     - couleur de l'article
 *     - prix (unitaire) de l'article [prix  provenant de l'API non du localStorage]
 *     - quantité de l'article (nombre d'unités)
 *
 *           + nombre total d'articles dans le panier (addition des quantités)
 *           + prix total à payer
 * ******************************************************************/

//variables globales
let totalUnitesArticles = 0;
let montantTotal = 0;

// fonction   fillItems() : elle remplit la page du panier avec les infos requises
async function fillItems() {
  //ré-initialisations des variables
  totalUnitesArticles = 0;
  montantTotal = 0;
  // le tableau trié  selon l'id et la couleur
  cartToDisplay = await getInfoToDisplay();
  //ciblage de l'élément parent contenant l'article
  let parentElement = document.getElementById("cart__items");
  //copie du dernier article
  if (
    parentElement != null &&
    cartToDisplay != false &&
    cartToDisplay.length > 0
  ) {
    for (let i = 0; i < cartToDisplay.length; i++) {
      let lastArticleHtmlContent = parentElement.lastElementChild.innerHTML;
      let newArticle = document.createElement("article");
      newArticle.innerHTML = lastArticleHtmlContent;
      newArticle.setAttribute(
        "class",
        parentElement.lastElementChild.getAttribute("class")
      );
      newArticle.setAttribute("data-id", cartToDisplay[i].id);
      newArticle.setAttribute("data-color", cartToDisplay[i].color);
      let imgElement = newArticle.querySelector("div.cart__item__img > img");
      imgElement.src = cartToDisplay[i].image;
      let hDeuxElement = newArticle.querySelector(
        "div.cart__item__content__description > h2"
      );
      hDeuxElement.textContent = cartToDisplay[i].name;
      let pColorElement = newArticle.querySelector(
        "div.cart__item__content__description > p:nth-of-type(1)"
      );
      pColorElement.textContent = cartToDisplay[i].color;
      let pPriceElement = newArticle.querySelector(
        "div.cart__item__content__description > p:nth-of-type(2)"
      );
      //formattage du prix pour un affichage sous la forme 00 000,00 €
      pPriceElement.textContent = formatPriceFr(cartToDisplay[i].price);
      let inputQuantityElement = newArticle.querySelector(
        "div.cart__item__content__settings__quantity > input.itemQuantity"
      );
      inputQuantityElement.setAttribute("value", cartToDisplay[i].quantity);
      //"bouton" supprimer et sa fonction de rappel  (onClick)
      newArticle
        .querySelector("p.deleteItem")
        .addEventListener("click", onClick);
      // Changement de quantité et sa fonction de rappel (onChangeQuantity)
      newArticle
        .querySelector("input.itemQuantity")
        .addEventListener("change", onChangeQuantity);
      // intégration de "article" dans son parent
      parentElement.appendChild(newArticle);
      montantTotal += cartToDisplay[i].quantity * cartToDisplay[i].price;
      totalUnitesArticles += cartToDisplay[i].quantity;
      //à la sortie de  la boucle for  on supprime du DOM le premier article
      //celui-ci n'avait pas été renseigné, car il avait servi de modèle
      if (i == cartToDisplay.length - 1) {
        parentElement.querySelector("article:nth-of-type(1)").remove();
      }
    } //fin boucle for
    // on renseigne le reste  avec les données calculées
    let spanTotalQuantity = document.getElementById("totalQuantity");
    spanTotalQuantity.textContent = formatNumberFr(totalUnitesArticles);
    let spanTotalPrice = document.getElementById("totalPrice");
    spanTotalPrice.textContent = formatNumberFr(montantTotal);
  } else {
    console.log("Affichage des articles impossible");
  }
} //fin fonction

fillItems();

/*****************************************************************
 *
 *  écoute des évènements :
 *        - sur les boutons "supprimer" (onClick)
 *        - sur les changements des quantités (onChangeQuantity)
 *
 * ((cette partie ne concerne pas le SUBMIT qui sera trité plus bas))
 **************************************************************************/

//fonction appelée par l'événement click sur les boutons "supprimer"
async function onClick(event) {
  //on pointe l'élément cliqué
  let clickedElement = event.target;
  //on trouve l'article parent (que l'on veut supprimer )
  let parentOfClickedElement = clickedElement.closest(
    "section > section > article"
  );
  //on récupère le  contenu du localStorage (panier)
  let cart = window.localStorage.getItem("panier");
  cart = JSON.parse(cart);
  // on récupère l'id et  la couleur de l'article que l'on veut supprimer
  let currentId = parentOfClickedElement.getAttribute("data-id");
  let currentColor = parentOfClickedElement.getAttribute("data-color");
  let trouve = false;
  let k = 0;
  //on cherche dans le panier  l'article à supprimer
  while (!trouve && k < cart.length) {
    if (
      cart[k].idProduct == currentId &&
      cart[k].colorProduct == currentColor
    ) {
      trouve = true;
      // on va chercher le prix dans l'API, sachant  que le prix
      //dépend uniquement de l'id (quelle que soit la couleur)
      let currentPrice = await giveMeThePriceOfThisItem(currentId);
      let currentQuantity = cart[k].quantityProduct;
      //on soustrait du total
      totalUnitesArticles -= currentQuantity;
      montantTotal -= currentQuantity * currentPrice;
      //on supprime cet article du panier
      cart.splice(k, 1);
      // on actualise le localStorage avec les nouvelles données du panier
      window.localStorage.setItem("panier", JSON.stringify(cart));
      // on supprime du DOM l'article enlevé du panier
      parentOfClickedElement.remove();
      // on affiche  les  quantités et  montants actualisés
      document.getElementById("totalQuantity").textContent =
        formatNumberFr(totalUnitesArticles);
      // le signe euro (€) est déjà dans l'HTML...
      document.getElementById("totalPrice").textContent =
        formatNumberFr(montantTotal);
    }
    k++;
  }
} //fin fonction onClick

//fonction appelée par l'événement "change" sur les inputs itemQuantity
// appelée lors de la modification de la quantité de l'article

async function onChangeQuantity(event) {
  // indexTrouve = indice de l'article dont la quantité change
  //utilité: cet indice permet de localiser l'article dans le panier
  let indexTrouve;
  // l'ancienne quantité ayant disparu de l'affichage on va la chercher dans le panier et la mémoriser dans cette variable
  let oldQuantity;
  //on cible l'élément qui a changé
  let changedValue = event.target;
  //on définit une variable pour  accueillir  la nouvelle valeur de quantité
  let newQuantity = parseInt(changedValue.value);
  // on recherche l'article parent ...
  let parentOfChangedValue = changedValue.closest(
    "section > section > article"
  );
  // ...  et on récupère son id et sa couleur
  let idOfItem = parentOfChangedValue.getAttribute("data-id");
  let colorOfItem = parentOfChangedValue.getAttribute("data-color");
  // connaissant l'id de l'article on peut  récupérer le prix depuis l'API
  let currentPrice = await giveMeThePriceOfThisItem(idOfItem);
  let trouve = false;
  let j = 0;
  //on  récupère  le  contenu du panier
  let cart = window.localStorage.getItem("panier");
  cart = JSON.parse(cart);
  // on cherche dans le panier  l'ancienne quantité de l'article en question
  while (!trouve && j < cart.length) {
    if (cart[j].idProduct == idOfItem && cart[j].colorProduct == colorOfItem) {
      trouve = true;
      indexTrouve = j;
      //enregistrement de l'ancienne quantité
      oldQuantity = cart[j].quantityProduct;
    }
    j++;
  }
  //on teste la saisie de la nouvelle valeur de quantité
  let newQuantityIsInvalid =
    newQuantity < 1 ||
    newQuantity > 100 ||
    Number.isNaN(newQuantity) ||
    newQuantity === undefined ||
    newQuantity === null;
  // si la nouvelle valeur de quantité est VALIDE, alors...
  if (!newQuantityIsInvalid) {
    // on met à jour les totaux
    totalUnitesArticles += newQuantity - oldQuantity;
    montantTotal += currentPrice * (newQuantity - oldQuantity);
    //on renseigne le panier avec la nouvelle valeur de quantité
    cart[indexTrouve].quantityProduct = newQuantity;
    //on actualise le localStorage
    window.localStorage.setItem("panier", JSON.stringify(cart));
    //on actualise le DOM avec les nouveaux totaux
    document.getElementById("totalQuantity").textContent =
      formatNumberFr(totalUnitesArticles);
    document.getElementById("totalPrice").textContent =
      formatNumberFr(montantTotal);
    //affichage console  SI REUSSITE:
    let nameOfTheItem = await giveMeTheNameOfThisItem(
      cart[indexTrouve].idProduct
    );
    console.log(
      "\n===== SUCCESSED in changing quantity ===========\n " +
        nameOfTheItem +
        "  (" +
        cart[indexTrouve].colorProduct +
        ") "
    );
    console.log("Ancienne quantité : " + oldQuantity);
    console.log(" Nouvelle quantité saisie (VALIDE): " + newQuantity);
    console.log("total articles : " + totalUnitesArticles);
    console.log("montant total :  " + montantTotal);
  } else {
    // on ne modifie pas le panier, ni les calculs
    //on réaffiche la précédente quantité valide (présente dans le panier)
    changedValue.value = oldQuantity;
    //affichage console   SI ECHEC
    let nameOfItem = await giveMeTheNameOfThisItem(idOfItem);
    console.log(
      "\n xxxxxxxx FAILED to change quantity xxxxxxxxxxxx\n" +
        nameOfItem +
        "  (" +
        colorOfItem +
        ") "
    );
    console.log(
      "Ancienne valeur de quantité : (" +
        cart[indexTrouve].quantityProduct +
        ")"
    );
    console.log("Nouvelle quantité saisie (INVALIDE): " + newQuantity);
    console.log(
      "total articles (non modifié dans le panier) : " + totalUnitesArticles
    );
    console.log("montant total (non modifié dans le panier) : " + montantTotal);
    console.log(
      "La valeur de quantité est réaffichée sans changement tant que la saisie est incorrecte."
    );
  } //fin else
} //fin fonction onChangeQuantity

/****************************************************
 *
 *  Traitement du formulaire
 *
 * ********************************************** */

//champs de saisie et évènements associés
let firstNameInput = document.getElementById("firstName");
firstNameInput.addEventListener("change", onChangeForm);
firstNameInput.addEventListener("focus", onFocusForm);
firstNameInput.addEventListener("input", onInputForm);

let lastNameInput = document.getElementById("lastName");
lastNameInput.addEventListener("change", onChangeForm);
lastNameInput.addEventListener("focus", onFocusForm);
lastNameInput.addEventListener("input", onInputForm);

let AddressInput = document.getElementById("address");
AddressInput.addEventListener("change", onChangeForm);
AddressInput.addEventListener("focus", onFocusForm);
AddressInput.addEventListener("input", onInputForm);

let cityInput = document.getElementById("city");
cityInput.addEventListener("change", onChangeForm);
cityInput.addEventListener("focus", onFocusForm);
cityInput.addEventListener("input", onInputForm);

let emailInput = document.getElementById("email");
emailInput.addEventListener("change", onChangeForm);
emailInput.addEventListener("focus", onFocusForm);

//"bouton" commander
let submit = document.getElementById("order");
submit.addEventListener("click", onSubmit);

/************************************************
 *  évènements liés au formulaire
 * ********************************************/

//au retour de focus sur un input  on supprime l'ancien message
// pour éviter qu'une nouvelle saisie ne cotoie un message ne correspondant pas  à ladite saisie
async function onFocusForm(event) {
  event.target.nextSibling.nextSibling.textContent = "";
}
// fin fonction onFocusForm

//renvoie le nombre maximal de caractères permis dans le champ de saisie
//  ou false si pas de maximum prévu
function getMax(id) {
  if (id == "firstName" || id == "lastName" || id == "city") {
    return 25;
  } else if (id == "address") return 100;
  else return false;
}

//affiche le nombre restant de caractères à taper
async function onInputForm(event) {
  let id = event.target.getAttribute("id");
  let max = getMax(id);
  let restant = max - event.target.value.length;
  if (max !== false && max !== NaN && restant >= 0) {
    event.target.nextSibling.nextSibling.textContent =
      "Nombre de caractères restant à taper :  " + restant;
  } else {
    event.target.nextSibling.nextSibling.textContent = "!";
  }
}

/********************************************************
 * 
 *  onChangeForm ()
 * 
//  fonction de vérification des saisies du formulaire
//  retourne un booléen "true" si la saisie est conforme au modèle regex, 
//  sinon "false" + le message d'erreur
//  on veut un prénom ou un nom ou une ville  contenant de "minCar" à "maxCar" caractères, 
//  qui commencent obligatoirement avec une majuscule (non accentuée) 
//  pouvant contenir des caractères français accentués  (âéèêëîïôüç)
//  sans apostrophe ni espace mais pouvant contenir un tiret non suivi d'une majuscule
//  l'adresse doit commencer par un caractère alphanumérique 
//  (i.e.  pas d'espace, de tiret, de soulignement etc.) 
//  mais peut contenir ensuite des tirets ou des espaces ou des apostrophes, 
//  en plus des caractères accentués, mais pas d'underscores 
**********************************************************************************/

async function onChangeForm(event) {
  //initialisations dépendamment des inputs traités

  let regexEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  let regexNames = /^[A-Z][a-zàâäéèêëîïôöüûùç-]{2,24}$/;
  let regexAddress = /^[^\W\s'\-_ ][0-9A-Za-zàâäéèêëîïôöüûùç' -]{9,99}$/;
  let minCar = 3;
  let maxCar = 25;
  let msgError;
  let currentRegex = regexNames;
  msgError =
    "Nb de caractères :  entre " +
    minCar +
    " et " +
    maxCar +
    ". Ni espace ni chiffre ni apostrophe. Majuscule au début obligatoire, ailleurs non acceptée.";
  let namesMsg;
  let currentId = event.target.getAttribute("id");
  if (currentId == "firstName") {
    namesMsg = document.getElementById("firstNameErrorMsg");
  }
  if (currentId == "lastName") {
    namesMsg = document.getElementById("lastNameErrorMsg");
  }
  if (currentId == "address") {
    namesMsg = document.getElementById("addressErrorMsg");
    currentRegex = regexAddress;
    minCar = 10;
    maxCar = 100;
    msgError = "Nb de caractères :  entre " + minCar + " et " + maxCar + ".";
  }
  if (currentId == "city") {
    namesMsg = document.getElementById("cityErrorMsg");
  }
  if (currentId == "email") {
    namesMsg = document.getElementById("emailErrorMsg");
    currentRegex = regexEmail;
    msgError =
      'Format d\'adresse email incorrect. Exemple: "jean-1999.paris@exemple.com". (sans blanc)';
  }
  //on récupère  la valeur  saisie
  let thisValue = event.target.value;
  //on vérifie la validité de la saisie
  // on laisse un message dans l'emplacement prévu
  // on renvoie une valeur de retour (un booléen)
  let isMatching = currentRegex.test(thisValue);
  if (isMatching) {
    namesMsg.textContent = "OK";
    console.log(
      "(" +
        currentId +
        ') - "' +
        thisValue.match(currentRegex)[0] +
        '" \t  OK  It matches !'
    );
    return true;
  } else {
    namesMsg.textContent = msgError;
    console.log(
      "(" +
        currentId +
        ') - "' +
        thisValue.match(currentRegex) +
        "\" \t KO  It doesn't match !"
    );
    return false;
  }
} // fin fonction onChangeForm

// fonction d'initialisation du tableau des productId
// en parcourant le panier (il y a donc des DOUBLONS)
function initialisationTableauProductId() {
  let panierTrie = trierPanier();
  let tabIdProduct = [];
  if (panierTrie) {
    for (let i = 0; i < panierTrie.length; i++) {
      tabIdProduct[i] = panierTrie[i].idProduct;
    }
    return tabIdProduct;
  } else {
    console.log("\n Tableau des id de produits : initialisation impossible");
    return null;
  }
} // fin fonction "initialisationTableauProductId"

// fonction de vérification d'un champ en fonction de sa valeur
//et d'un pattern passés en paramètre
function verifChampInput(pattern, value) {
  return pattern.test(value);
}

// fonction qui renvoie true si TOUS les champs du formulaire sont conformes à leurs patterns respectifs
function inputsAreOk() {
  let regexNames = /^[A-Z][a-zàâäéèêëîïôöüûùç-]{2,24}$/;
  let regexAddress = /^[^\W\s'\-_ ][0-9A-Za-zàâäéèêëîïôöüûùç' -]{9,99}$/;
  let regexEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let firstNameOk = verifChampInput(
    regexNames,
    document.getElementById("firstName").value
  );
  let lastNameOk = verifChampInput(
    regexNames,
    document.getElementById("lastName").value
  );
  let addressOk = verifChampInput(
    regexAddress,
    document.getElementById("address").value
  );
  let cityOk = verifChampInput(
    regexNames,
    document.getElementById("city").value
  );
  let emailOk = verifChampInput(
    regexEmail,
    document.getElementById("email").value
  );
  return firstNameOk && lastNameOk && addressOk && cityOk && emailOk;
} // fin fonction inputsAreOk()

// fonction qui vérifie la conformité des saisies,
// récolte les infos du formulaire puis crée l'objet "contact"
function initialisationContact() {
  if (inputsAreOk()) {
    let firstNameValue = document.getElementById("firstName").value;
    let lastNameValue = document.getElementById("lastName").value;
    let addressValue = document.getElementById("address").value;
    let cityValue = document.getElementById("city").value;
    let emailValue = document.getElementById("email").value;
    let contact = {
      firstName: firstNameValue,
      lastName: lastNameValue,
      address: addressValue,
      city: cityValue,
      email: emailValue,
    };
    return contact;
  } else {
    console.log("Informations du formulaire non conformes. Rectifiez-les");
    return null;
  }
} // fin fonction initialisationContact()

/*********************************************************
 *
 *    *** onSubmit() *****
 *
 *  // fonction qui est appelée au click sur le "bouton" SUBMIT
 *   // et qui en cas de succès redirige l'utilisateur vers la page validant sa commande
 *
 *********************************************************/

async function onSubmit(event) {
  try {
    event.preventDefault();
    let urlConfirmation = "http://localhost:3000/api/products/order";
    let tableauDesId = [];
    let contact;
    tableauDesId = initialisationTableauProductId();
    contact = initialisationContact();
    if (contact !== null && tableauDesId !== null) {
      let commande = {
        contact: contact,
        products: tableauDesId,
      };
      let chargeUtile = JSON.stringify(commande);
      // requête POST pour envoyer la commande et récupérer le numéro de commande
      fetch(urlConfirmation, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        body: chargeUtile,
      })
        .then(function (resultat) {
          // console.log("resultat.ok : " + resultat.ok);
          // console.log("resultat.status : " + resultat.status);
          if (resultat.ok) return resultat.json();
          else {
            console.log("Requête post : resultat ko");
            return null;
          }
        })
        .then(function (value) {
          let orderNumber = value.orderId;
          let urlWithOrderNumber = "./confirmation.html?orderId=" + orderNumber;
          window.location = urlWithOrderNumber;
        });
    } else {
      throw new Error("Erreur avec le  formulaire ou le panier.");
    }
    // fin if
  } catch (e) {
    // fin try
    console.log("Erreur de requête POST: " + e.message);
  }
} //fin fonction onSubmit

// quelques regex alternatifs
// email regex to improve : /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$/
// let regexNames = /^([A-Z][a-zàâäéèêëîïôöüûùç]+)([' -][A-Z][a-zàâäéèêëîïôöüûùç]*)*$/;
////let regexNames = /^([A-Z](([a-zàâäéèêëîïôöüûùç]*)|([' -][A-Z][a-zàâäéèêëîïôöüûùç]*))*)$/;
// let regexNames = /^([A-Z][a-zàâäéèêëîïôöüûùç]+)([' -][A-Z][a-zàâäéèêëîïôöüûùç]*)*$/;
// let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

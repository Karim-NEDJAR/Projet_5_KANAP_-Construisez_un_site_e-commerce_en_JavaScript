/***********************************
 *   PRODUCT.JS 
 * 
 * Récupération des informations d'un produit  depuis l'API
 * grâce à son identifiant affiché dans l'URL
 * Affichage du produit 
 * et  au clic ajout du produit au panier 
 * (après vérification de la saisie) 
 * 
  ******************************* */



//fonction pour récupérer l'identifiant DU produit depuis l'URL
function recupererParametre() {
    let url = new URL(window.location.href);
    let search_params = new URLSearchParams(url.search);
    if (search_params.has('id')) {
        let id = search_params.get('id');
        return id;
    } else {
        return false;
    }
}

// recupererProduits() : fonction de récupération des produits depuis l'API

const url = "http://localhost:3000/api/products";

async function recupererProduits(url) {
    const promesseFetch = await fetch(url);
    try {
        if (promesseFetch.ok) {
            return promesseJson = await promesseFetch.json();

        } else {
            console.log("Erreur http: ", reponse.status);
        }
    }
    catch (erreur) {
        console.error("Erreur fetch. Impossible de récupérer les produits: " + erreur);
    };

}


// voiciLeProduit() : fonction pour récupérer de l'API LE produit correspondant à l'id présent dans l'url de la page
async function voiciLeProduit() {
    let allProducts = await recupererProduits(url);
    let id = recupererParametre();
    let trouve = false;
    let i = 0;
    while (id && !trouve && i < allProducts.length) {
        if (allProducts[i]._id == id) {
            trouve = true;
            // console.log("Produit trouvé : " + trouve);
            // console.log("name: "+ allProducts[i].name);
            return allProducts[i];
        }
        i++;
        // console.log("i = " + i + "  Produit pas encore trouvé");
    }
    if (!trouve) { console.log("Produit introuvable ou paramètre incorrect"); }
}

/*************************************************
*****   fonction pour afficher LE   produit  ******
***************************************************/
async function afficherProduit() {
    //on récupère le produit depuis l'url
    const produit = await voiciLeProduit();
    //insertion  du titre de la page
    let titleElement = document.querySelector("title");
    titleElement.textContent = produit.name;
    let headTag = document.querySelector("head");
    headTag.appendChild(titleElement);
    //on cible l'élément parent de "article" à savoir "item"
    const sectionItemElement = document.querySelector("section.item");
    //  on supprime d'abord  le ou les article(s) déjà présent(s)
    while (sectionItemElement.firstChild) {
        sectionItemElement.removeChild(sectionItemElement.firstChild);
    }
    //on crée "article"....
    let articleElement = document.createElement("article");
    //... puis les enfants de "article" 
    //création de la 1ère div laquelle contient une image 
    let divItemImg = document.createElement("div");
    divItemImg.classList.add("item__img");
    let imgItemImg = document.createElement("img");
    imgItemImg.src = produit.imageUrl;
    imgItemImg.setAttribute("alt", produit.altTxt);
    divItemImg.appendChild(imgItemImg);
    articleElement.appendChild(divItemImg);
    //création de la 2ème div laquelle  englobe tout le reste dans 4 div enfants
    let divItemContent = document.createElement("div");
    divItemContent.classList.add("item__content");
    //1er enfant de la 2ème div
    let divItemContentTitlePrice = document.createElement("div");
    divItemContentTitlePrice.classList.add("item__content__titlePrice");
    let hUnTitle = document.createElement("h1");
    hUnTitle.id = "title";
    hUnTitle.textContent = produit.name;
    //on insère ce h1 dans le 1er enfant
    divItemContentTitlePrice.appendChild(hUnTitle);
    //paragraphe price (frère de h1)...
    let pPriceElement = document.createElement("p");
    //... contenant une span price ...
    let spanPrice = document.createElement("span");
    spanPrice.id = "price";
    spanPrice.textContent = produit.price;
    pPriceElement.appendChild(spanPrice);
    pPriceElement.insertAdjacentText("afterbegin", "Prix : ");
    pPriceElement.insertAdjacentText("beforeend", " €");
    divItemContentTitlePrice.appendChild(pPriceElement);
    //insertion de ce 1er enfant à la 2ème div
    divItemContent.appendChild(divItemContentTitlePrice);
    //2ème enfant de la 2ème div contenant 2 paragraphes  enfants
    let divItemContentDescription = document.createElement("div");
    divItemContentDescription.classList.add("item__content__description");
    let pItemContentDescriptionTitle = document.createElement("p");
    pItemContentDescriptionTitle.classList.add("item__content__description__title");
    pItemContentDescriptionTitle.textContent = "Description :";
    divItemContentDescription.appendChild(pItemContentDescriptionTitle);
    let pDescription = document.createElement("p");
    pDescription.id = "description";
    pDescription.textContent = produit.description;
    divItemContentDescription.appendChild(pDescription);
    //insertion de cette  div dans sa parente
    divItemContent.appendChild(divItemContentDescription);
    // 3ème enfant de la 2ème div, ce 3ème enfant ayant 2 div enfants 
    let divItemContentSettings = document.createElement("div");
    divItemContentSettings.classList.add("item__content__settings");
    let divItemContentSettingsColor = document.createElement("div");
    divItemContentSettingsColor.classList.add("item__content__settings__color");
    // label  ....
    let labelColorSelect = document.createElement("label");
    labelColorSelect.setAttribute("for", "color-select");
    labelColorSelect.textContent = "Choisir une couleur :";
    divItemContentSettingsColor.appendChild(labelColorSelect);
    // .... +  SELECT ...
    let selectColorSelect = document.createElement("select");
    selectColorSelect.id = "colors";
    selectColorSelect.setAttribute("name", "color-select");
    // .... + options
    let optionValueZero = document.createElement("option");
    optionValueZero.setAttribute("value", "");
    optionValueZero.textContent = "--SVP, choisissez une couleur --";
    selectColorSelect.appendChild(optionValueZero);

    for (let couleur of produit.colors) {
        let optionValue = document.createElement("option");
        optionValue.setAttribute("value", couleur);
        optionValue.textContent = couleur;
        selectColorSelect.appendChild(optionValue);
    }
    //insertion du select et de sa  div parente
    divItemContentSettingsColor.appendChild(selectColorSelect);
    divItemContentSettings.appendChild(divItemContentSettingsColor);
    // dernière div du 3ème enfant
    let divItemContentSettingsQuantity = document.createElement("div");
    divItemContentSettingsQuantity.classList.add("item__content__settings__quantity");
    // label  ....
    let labelItemQuantity = document.createElement("label");
    // attention il y a eu modification de la valeur du for 
    // par rapport à l'original (voir remarque dans product.html )
    labelItemQuantity.setAttribute("for", "quantity");
    labelItemQuantity.textContent = "Nombre d'article(s) (1-100) :";
    //insertion du label
    divItemContentSettingsQuantity.appendChild(labelItemQuantity);
    // .... + input
    let inputNumberItemQuantity = document.createElement("input");
    inputNumberItemQuantity.setAttribute("type", "number");
    inputNumberItemQuantity.setAttribute("name", "itemQuantity");
    inputNumberItemQuantity.setAttribute("min", "1");
    inputNumberItemQuantity.setAttribute("max", "100");
    inputNumberItemQuantity.setAttribute("value", "1");
    inputNumberItemQuantity.id = "quantity";
    //insertion de l'input
    divItemContentSettingsQuantity.appendChild(inputNumberItemQuantity);
    //insertion de cette dernière div du 3ème enfant  dans sa parente
    divItemContentSettings.appendChild(divItemContentSettingsQuantity);
    //laquelle parente est elle-même indérée dans sa div parente 
    divItemContent.appendChild(divItemContentSettings);
    // 4ème et dernier enfant de la 2ème div : la div contenant le bouton
    let divItemContentAddButton = document.createElement("div");
    divItemContentAddButton.classList.add("item__content__addButton");
    //le bouton
    let buttonAddToCart = document.createElement("button");
    buttonAddToCart.id = "addToCart";
    buttonAddToCart.textContent = "Ajouter au panier";
    //insertion du bouton dans sa div 
    divItemContentAddButton.appendChild(buttonAddToCart);
    //insertion de la div du bouton dans sa parente qui est la 2ème div de "article"
    divItemContent.appendChild(divItemContentAddButton);
    //insertion de la 2ème div de "article" dans sa parente "article"
    articleElement.appendChild(divItemContent);
    //et finalement insertion de "artile" dans la section parente "item"
    sectionItemElement.appendChild(articleElement);

    /******** fin affichage de "article"  *******/



    /**********************************
     **      vérifications des saisies 
     ************************************/

    function colorIsValid() {
        let thisColor = document.getElementById("colors");
        if (thisColor.value === "") {
            console.log(" ===================== \n Couleur saisie: " + thisColor.value + " (invalide)");
            return false;
        } else {
            console.log("===================== \n Couleur saisie: " + thisColor.value + " (valide)");
            return true;
        }
    }


    function quantityIsValid() {
        let thisQuantity = document.getElementById("quantity");
        if ((thisQuantity.value < 1) || (thisQuantity.value > 100)) {
            console.log("Quantité saisie: " + thisQuantity.value + " (invalide)");
            return false;
        } else {
            console.log("Quantité saisie: " + thisQuantity.value + " (valide)");
            return true;
        }
    }


    function inputIsValid() {
        if (colorIsValid() && quantityIsValid()) return true; else return false;
    }




    /********************************************************************************* */
    /*************      processAndAddToTheCart()        ******************************** 
      
    / ************   traitement  puis si ok  ajout dans le panier   ********************** */
    /************************************************************************************* */

    function processAndAddToTheCart() {

        //soit  l'article actuel  
        const thisItem = {
            idProduct: recupererParametre(),
            quantityProduct: parseInt(document.getElementById("quantity").value),
            colorProduct: document.getElementById("colors").value
        };
        //soit le tableau recevant le contenu du localStorage
        let itemsInLocalStorage = [];
        let items = [];
        items = window.localStorage.getItem("panier");
        //if localStorage is empty i.e. ...
        if (items === null) {
            console.log("Nothing was in localStorage. \n Then we initialize it with the current item");
            itemsInLocalStorage.push(thisItem);
            window.localStorage.setItem("panier", JSON.stringify(itemsInLocalStorage));

        } else {
            // localStorage is NOT  empty, so...
            //import the localStorage
            //find the item in the cart
            //check if the current model and color are yet presents in the cart
            //  increment quantity in the cart if needed
            itemsInLocalStorage = JSON.parse(items);
            let notFoundTheSame = true;
            let i = itemsInLocalStorage.length - 1;

            while (notFoundTheSame && (i >= 0)) {
                if ((thisItem.idProduct == itemsInLocalStorage[i].idProduct) && (thisItem.colorProduct == itemsInLocalStorage[i].colorProduct)) {
                    notFoundTheSame = false;
                    let oldSum = itemsInLocalStorage[i].quantityProduct;
                    let somme = itemsInLocalStorage[i].quantityProduct += thisItem.quantityProduct;
                    console.log("\n Quantité dans le panier AVANT ajout: " + oldSum);
                    console.log("Quantité dans le panier APRES ajout:  " + somme);
                    window.localStorage.setItem("panier", JSON.stringify(itemsInLocalStorage));
                }
                i--;
            }
            if (notFoundTheSame) {
                console.log("\nIt is a new item  :  " + thisItem.idProduct + " (" + thisItem.colorProduct + ")");
                itemsInLocalStorage.push(thisItem);
                //ajout  dans le panier
                window.localStorage.setItem("panier", JSON.stringify(itemsInLocalStorage));
            }
        }
    }
    /*************  FIN traitement  **************************** */

    /*************  fonction de validation du panier ******************** */
    function validateCart() {
        let addToCartButton = document.getElementById("addToCart");
        addToCartButton.addEventListener("click", function () {
            if (inputIsValid()) {
                // appel de la fonction de traitement du panier
                console.log("\nSUCCES: article ajouté au panier ");
                processAndAddToTheCart();
            }
            else {
                //informer de la mauvaise saisie
                console.log("\nECHEC: article non ajouté au panier \n(Vérifiez votre saisie.)");
            }
        });
    }


    validateCart();

} //fin de la fonction d'affichage
afficherProduit();


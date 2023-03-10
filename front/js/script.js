/*************************************************************
 *   SCRIPT.JS 
 * 
 * Récupération de tous les produits depuis l'API et affichage
 * 
 ************************************************************ */

//les variables

const url = "http://localhost:3000/api/products";
const urlProduitId = "./product.html?id=";
let produits;


// définition de la fonction asynchrone "recupererProduits ()" depuis l'API
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
        console.error("Erreur fetch. Impossible de récupérer les produits ----> " + erreur);
    };

}

/******************************************************************
 * fonction pour afficher les produits
**  
********************************************************************/
async function afficherProduits() {
    produits = await recupererProduits(url);
    for (let i = 0; i < produits.length; i++) {

        //on accède à l'élément parent, section.items
        const itemsElement = document.getElementById("items");
        //CREATION de "article" contenant les infos d'un produit
        const articleElement = document.createElement("article");
        /***  CREATION des éléments enfants de "article" ****/
        //CREATION de l'élément image et attribution d'une source et d'un texte alternatif
        const imgElement = document.createElement("img");
        imgElement.setAttribute("src", produits[i].imageUrl);
        imgElement.setAttribute("alt", produits[i].altTxt);
        //CREATION du titre h3 et attribution d'une classe
        const hTroisElement = document.createElement("h3");
        hTroisElement.classList.add("productName");
        hTroisElement.textContent = produits[i].name;
        //CREATION du paragraphe et attribution d'une classe
        const pElement = document.createElement("p");
        pElement.classList.add("productDescription");
        pElement.textContent = produits[i].description;
        /***  INSERTION  des éléments dans l'article  ****/
        articleElement.appendChild(imgElement);
        articleElement.appendChild(hTroisElement);
        articleElement.appendChild(pElement);
        // CREATION de l'élément "a", conteneur de "article" 
        const aElement = document.createElement("a");
        aElement.setAttribute("href", "" + urlProduitId + produits[i]._id);
        // INSERTION  de "article" dans son élément parent  "a" 
        aElement.appendChild(articleElement);
        // INSERTION  de l'élément "a" dans son élément parent  "items"
        itemsElement.appendChild(aElement);
    }
}

/*****************************************************************
 * appel de  la fonction (affichage des produits)
 *******************************************************************/
afficherProduits();



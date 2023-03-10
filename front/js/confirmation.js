/***********************************
 *   CONFIRMATION.JS 
 * 
 *      Affichage du numéro de commande  présent dans l'URL
 *              &
 *      Affichage d'un message de remerciement  
 * 
 *   ***************************************/



//fonction pour récupérer le numéro de commande depuis l'URL  

function extraireNumeroDeCommande() {
    let url = new URL(window.location.href);
    let search_params = new URLSearchParams(url.search);
    if (search_params.has("orderId")) {
        let orderId = search_params.get("orderId");
        return orderId;
    } else {
        return false;
    }
}


//fonction pour insérer le numéro de commande dans la page, 
//à l'endroit prévu et le remerciement après deux passages à la ligne
function insertionOrderId() {
    //on cible l'élément où afficher le numéro de commande
    let spanOrderId = document.getElementById("orderId");
    //ciblage du paragraphe parent 
    // pour y ajouter deux sauts de ligne et des remerciements
    let pParent = document.querySelector("#limitedWidthBlock > div.confirmation p");
    // essai d'obtention du numéro de commande
    let thisOrderId = extraireNumeroDeCommande();
    // si numéro de commande valide on effectue l'affichage
    if (thisOrderId) {
        let brElement1 = document.createElement("br");
        let brElement2 = document.createElement("br");
        pParent.appendChild(brElement1);
        pParent.appendChild(brElement2);
        //le numéro de commande étant long, on l'affiche seul sur une ligne
        //on insère donc un saut de ligne avant notre élément cible
        spanOrderId.textContent = thisOrderId;
        let message = "Merci pour votre commande."
        pParent.insertAdjacentText("beforeend", message);
    } else {
        //sinon pas d'affichage
        console.log("Numero de commande invalide.");
    }

}

insertionOrderId();
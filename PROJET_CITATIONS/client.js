/* ******************************************************************
 * Constantes de configuration
 */
//const apiKey = "fe5fb988-4085-43c1-bfa6-7be077fb0078";
const serverUrl = "https://lifap5.univ-lyon1.fr";


/* ******************************************************************
 * Gestion des tabs "Voter" et "Toutes les citations"
 ******************************************************************** */

/**
 * Mets à jour le div et le tab à afficher
 * 
 * @param {Object} etatCourant l'état courant
 */
function majTab(etatCourant) {
  console.log("CALL majTab");
  const dDuel = document.getElementById("div-duel");
  const dTout = document.getElementById("div-tout");
  const dAdd = document.getElementById("div-add");

  const tDuel = document.getElementById("tab-duel");
  const tTout = document.getElementById("tab-tout");
  const tAdd = document.getElementById("tab-add");
  if (etatCourant.tab === "duel") {
    //affiche les duels
    showTab(dDuel,tDuel,dTout,tTout,dAdd,tAdd);
  } 
  else if (etatCourant.tab === "tout") {
    //affiche toutes les citations
    showTab(dTout,tTout,dDuel,tDuel,dAdd,tAdd);
  }
  else if (etatCourant.tab === "add") {
    //affiche l'onglet pour ajouter une citation
    showTab(dAdd,tAdd,dTout,tTout,dDuel,tDuel);
  }
}

/**
 * Affiche/masque les divs "div-duel", "div-tout" et "div-add"
 * 
 * @param {Object} showDiv affiche le div
 * @param {Object} showTab affiche le tab
 * @param {Object} hideDiv0 masque le div
 * @param {Object} hideTab0 masque le tab
 * @param {Object} hideDiv1 masque le div
 * @param {Object} hideTab1 masque le tab
 */
function showTab(showDiv, showTab, hideDiv0, hideTab0, hideDiv1, hideTab1) {
  showOnglet(showDiv, showTab);
  hideOnglet(hideDiv0, hideTab0);
  hideOnglet(hideDiv1, hideTab1);
}

/**
 * Affiche le div et le tab
 * 
 * @param {Object} div un div
 * @param {Object} tab un tab
 */
function showOnglet(div, tab) {
  div.style.display = "flex";
  tab.classList.add("is-active");
}

/**
 * Masque le div et le tab
 * 
 * @param {Object} div un div
 * @param {Object} tab un tab
 */
function hideOnglet(div, tab) {
  div.style.display = "none";
  tab.classList.remove("is-active");
}

/**
 * Mets au besoin à jour l'état courant lors d'un click sur un tab.
 * En cas de mise à jour, déclenche une mise à jour de la page.
 *
 * @param {string} tab le nom du tab qui a été cliqué
 * @param {Object} etatCourant l'état courant
 */
function clickTab(tab, etatCourant) {
  console.log(`CALL clickTab(${tab},...)`);
  if (etatCourant.tab !== tab) {
    etatCourant.tab = tab;
    majPage(etatCourant);
  }
}

/**
 * Enregistre les fonctions à utiliser lorsque l'on clique
 * sur un des tabs.
 *
 * @param {Object} etatCourant l'état courant
 */
function registerTabClick(etatCourant) {
  console.log("CALL registerTabClick");
  document.getElementById("tab-duel").onclick = () =>
    clickTab("duel",etatCourant);
  document.getElementById("tab-tout").onclick = () =>
    clickTab("tout",etatCourant);  
  document.getElementById("tab-add").onclick = () =>
    clickTab("add",etatCourant);
  document.getElementById("mdl-login").onclick = () =>
    clickTab("mdl",etatCourant);

}



/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * l'utilisateur.
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami
 * 
 * @param {string} apiKey la clé API
 * @return une promesse du login utilisateur ou du message d'erreur
 */
function fetchWhoami(apiKey) {
  return fetch(serverUrl + "/whoami", { headers: { "x-api-key": apiKey } })
    .then((response) => response.json())
    .then((jsonData) => {
      if (jsonData.status && Number(jsonData.status) != 200) {
        return { err: jsonData.message };
      }
      return jsonData;
    })
    .catch((erreur) => ({ err: erreur }));
}

/**
 * Fait une requête sur le serveur et vérifie si la clé API est valide.
 * Appel de la fonction login quand la clé API est valide.
 * 
 * @return Une promesse ou un message d'erreur
 */
function lanceWhoamiEtInsereLogin() 
{
  const elt = document.getElementById("txtApi").value;
  const error = document.getElementById("error-login");
  
  if(elt !== "") {
    return fetchWhoami(elt).then((data) => {
      const ok = data.err === undefined;
      if (!ok) {
        error.setAttribute("class", "help has-text-danger");
        error.innerHTML = "Clé API non valide";
      } else {
        login(elt, data.login);
      }
      return ok;
    });
  } else {
    error.setAttribute("class", "help has-text-danger");
    error.innerHTML = "Clé API non valide";
  }
}

/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
  console.log("CALL majPage");
  majTab(etatCourant);
  registerTabClick(etatCourant);
}

/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
function initClientCitations() {
  console.log("CALL initClientCitations");
  const etatInitial = {
    tab: "duel",
    loginModal: false,
  };
  majPage(etatInitial);
}

/**
 * Appel de la fonction initClientCitations après chargement de la page
 * Rempli le tableau et affiche un duel.
 */
document.addEventListener("DOMContentLoaded", () => {
  tabBody = document.getElementById("tBody"); 
  console.log("Exécution du code après chargement de la page");
  initClientCitations();

  fetchCitations(citation => {
    fillTotalTable(citation);
    duels(citation);
  })
});


/* ******************************************************************
 *        Affichage de l’ensemble des citations du serveur
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /citations
 * 
 * @param {Object} citation l'ensemble des citations
 * @return une promesse de toutes les citations ou d'un message d'erreur
 */
function fetchCitations(citation) {
  console.log("Récupération des citations");
  return fetch(serverUrl + "/citations")
  .then((response) => response.json())
  .then(citation)
  .catch((erreur) => ({err: erreur}))
}

/**
 * Remplit un tableau avec toutes les citations
 * 
 * @param {Object} citations l'ensemble des citations
 */
function fillTotalTable(citation)
{
  let tab = Array.from(citation);
  totalTab = document.getElementById("tBody");
  totalTab.innerHTML = ``;
  tab.forEach((element, index) => {
    totalTab.appendChild(addTotalTab(index, element));
  });
}

/**
 * Crée une ligne du tableau et lui ajoute les informations
 * 
 * @param {number} i le rang de la citation
 * @param {Object} citation les détails de la citation
 * @return une ligne du tableau
 */
function addTotalTab(i,citation)
{
  let row = document.createElement('tr');
  let rank = document.createElement('th');
  let character = document.createElement('td');
  let quote = document.createElement('td');
  
  rank.textContent = i+1;
  character.textContent = citation.character;
  quote.textContent = citation.quote;

  row.appendChild(rank);
  row.appendChild(character);
  row.appendChild(quote);
  row.appendChild(addBtn(i,citation));
  return row;
}

/**
 * Crée un bouton pour afficher les détails d'une citation
 * 
 * @param {number} ind du rang de la citation
 * @param {Object} citation les détails de la citation
 * @return un bouton
 */
function addBtn(ind, citation)
{
  let btd = document.createElement("td");
  let button = document.createElement("button");
  let i = ind + 1;

  button.setAttribute("id", "btn"+i);
  button.setAttribute("class", "button is-primary is-light");
  button.appendChild(document.createTextNode("Détails"));
  button.onclick = () => infoBtn(citation);
  btd.appendChild(button);
  return btd;
}


/* ******************************************************************
 *                  Affichage d’un duel aléatoire
 * ****************************************************************** */

/**
 * Retourne un entier aléatoire compris entre 0 et max(exclue)
 * 
 * @param {number} max un entier
 * @return un entier
 */
function random(max) {
  return Math.floor(Math.random() * max);
}
/**
 * Tire deux citations au hasard et les affiches
 * 
 * @param {Object} citation l'ensemble des citations
 */
function duels(citation) {
  console.log("duel");
  let tab = Array.from(citation);
  let citLeft = random(tab.length);
  let citRight = random(tab.length);

  if(citLeft === citRight) {
    citLeft = random(tab.length);
  }

  addDuelCit("Left",tab[citLeft]);
  addDuelCit("Right",tab[citRight]);

  let btnLeft = document.getElementById("btnLeft");
  btnLeft.onclick = () => vote(tab[citLeft]._id, tab[citRight]._id, citation);
  let btnRight = document.getElementById("btnRight");
  btnRight.onclick = () => vote(tab[citRight]._id, tab[citLeft]._id, citation);
}

/**
 * Ajoute une la citation au duel
 * 
 * @param {string} side le coté du contenant (Left/Right)
 * @param {Object} citation la citation
 */
function addDuelCit(side, citation) {
  console.log("Affichage du texte et de l'image "+side);

  const cita = document.getElementById("cit"+side);
  const img = document.getElementById("card"+side);

  if(cita.childElementCount != 0) {
    cita.removeChild(document.getElementById("tit"+side));
    cita.removeChild(document.getElementById("sub"+side));
    img.removeChild(document.getElementById("img"+side));
  }

  cita.appendChild(addParagrapheDuel(citation.quote, side, "title"));

  const p = citation.character + "dans" + citation.origin;
  cita.appendChild(addParagrapheDuel(p, side, "subtitle"));
  
  const direction = citation.characterDirection;
  img.appendChild(addImage(citation.image, side, direction));
}

/**
 * Crée un paragraphe pour le duel
 * 
 * @param {string} text le texte à afficher
 * @param {string} side le coté du contenant (Left/Right)
 * @param {string} value la forme du texte (title/subtitle)
 * @return un paragraphe avec son contenu
 */
function addParagrapheDuel(text, side, value)
{
  const tit = addParagraphe(text);
  tit.classList.add(value); 
  
  if(value == "title") { tit.setAttribute("id", "tit" + side); }
  if(value == "subtitle") { tit.setAttribute("id", "sub" + side); }

  return tit;
}

/**
 * Crée un paragraphe
 * 
 * @param {string} text le texte à afficher
 * @return un paragraphe
 */
function addParagraphe(text)
{
  const p = document.createElement("p");
  p.appendChild(document.createTextNode(text));
  return p;
}

/**
 * Ajoute une image
 * 
 * @param {*} url le lien de l'image
 * @param {*} side le coté du contenant (Left/Right)
 * @param {*} dir la direction de l'image (Left/Right)
 * @return une image
 */
function addImage(url, side, dir) 
{
  img = document.createElement("img");
  img.setAttribute("src", url);
  img.setAttribute("id", "img"+side)

  if(side !== dir) {
    img.setAttribute("style", "transform: scaleX(-1)");
  }
  return img;
}

/* ******************************************************************
 *                              Vote
 * ****************************************************************** */

/**
 * Fait une requête POST authentifiée sur /citations/duels
 * 
 * @param {string} winner l'identifiant de la citation gagnante
 * @param {string} looser l'identifiant de la citation perdante
 * @return une promesse d'un gagnant et d'un perdant, ou d'un message d'erreur
 */
function fetchDuels(winner, looser) 
{
  console.log("CALL fetchDuels");
  const apiKey = document.getElementById("txtApi").textContent;
  return fetch(serverUrl + "/citations/duels", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json"},
    body: JSON.stringify({"winner": winner, "looser": looser})
  })
    .then((response) => response.json())
    .then((jsonData) => {
      if (jsonData.status && Number(jsonData.status) != 200) {
        return { err: jsonData.message };
      }
      return jsonData;
    })
    .catch((erreur) => ({ err: erreur }));
}

/**
 * Permet de voter parmis les deux citations afficher après connection
 * 
 * @param {string} idWin l'identifiant de la citation gagnante
 * @param {string} idLoos l'identifiant de la citation perdante
 * @param {Object} citation les citations
 */
function vote(idWin, idLoos, citation) 
{
  const inputKey = document.getElementById("txtApi").value;
  if(inputKey === "") {
    alert("Veuillez vous connecter s'il vous plaît.");
  } 
  else {
    fetchDuels(idWin, idLoos);
    duels(citation);
  }
}

/* ******************************************************************
 *                   Détails d'une citation
 * ****************************************************************** */

/**
 * Ajoute les informations à la fenêtre modal mdl-inf
 * @param {Object} citation les détails de la citation
 */
function infoBtn(citation) 
{
  const apiKey = document.getElementById("txtApi").textContent;
  if(apiKey !== '') {
    openMdl('mdl-inf');

    document.getElementById("editQuote").textContent = citation.quote;
    document.getElementById("editCharacter").textContent = citation.character;
    document.getElementById("editOrigin").textContent = citation.origin;
    document.getElementById("editImage").textContent = citation.image;
    document.getElementById("editCharacterDirection").textContent = citation.characterDirection;
    document.getElementById("editAddedBy").textContent = citation.addedBy;
    
  } else {
    alert("Veuillez vous connecter s'il vous plaît.");
  }
}

/* ******************************************************************
 *                            Connexion
 * ****************************************************************** */

/**
 * Remplace le modal de login par le modal de signOut
 * 
 * @param {string} apiKey la clé API
 * @param {string} login le numéro étudiant associé à la clé API
 */
function login(apiKey, login)
{
  console.log("CALL login");
  document.getElementById("mdl-login").classList.remove("is-active");

  document.getElementById("btn-open-login-modal").innerHTML = `${login}`;

  document.getElementById("modalHeader").innerHTML = ``;
  headerLoginMdl();
  bodyLoginMdl(apiKey, login);
  document.getElementById("modalFooter").innerHTML = ``;
  footerLoginMdl();
}

/**
 * Remplace le header du modal login
 */
function headerLoginMdl()
{
  let header = document.getElementById("modalHeader");
  let p = document.createElement("p");
  let btn = document.createElement("button");

  p.appendChild(document.createTextNode("Profil"));
  p.setAttribute("class", "modal-card-title");
  btn.setAttribute("class", "delete");
  btn.setAttribute("onclick", "closeMdl('mdl-login');");
  btn.setAttribute("aria-label", "close");

  header.appendChild(p);
  header.appendChild(btn);
}

/**
 * Remplace le body du modal login
 * 
 * @param {string} apiKey la clé API
 * @param {string} login le numéro étudiant associé à la clé API
 */
function bodyLoginMdl(apiKey, login)
{
  document.getElementById("modalSection").innerHTML = `
  <article class="media">
    <div class="media-left">
      <span class="icon is-large">
        <i class="fas fa-address-card fa-3x"></i>
      </span>
    </div>
    <div class="media-content">
      <div class="content">
        <p>
          <strong>Numéro Etudiant:</strong> 
          <small>${login}</small>
          <br>
          <strong>API Key:</strong>
          <small id="txtApi">${apiKey}</small>
        </p>
      </div>
    </div>
  </article>`;
}

/**
 * Remplace le footer du modal login
 */
function footerLoginMdl()
{
  let footer = document.getElementById("modalFooter");
  let btnClose = document.createElement("button");
  let btnSignOut = document.createElement("button");

  btnClose.setAttribute("class", "button");
  btnClose.setAttribute("onclick", "closeMdl('mdl-login');");
  btnClose.appendChild(document.createTextNode("Fermer"));

  btnSignOut.setAttribute("onclick", "signOut();");
  btnSignOut.setAttribute("class", "button");
  btnSignOut.appendChild(document.createTextNode("Se Déconnecter"));
  footer.appendChild(btnClose);
  footer.appendChild(btnSignOut);
}

/**
 * Remplace le modal de signOut par le modal de login
 */
function signOut()
{
  console.log("CALL signOut");
  document.getElementById("mdl-login").classList.remove("is-active");
  document.getElementById("btn-open-login-modal").innerHTML = `Connexion`;
  
  document.getElementById("modalHeader").innerHTML = ``;
  headerSignOutMdl();
  
  bodySignOutMdl();
    
  document.getElementById("modalFooter").innerHTML = ``;
  footerSignOutMdl();
}

/**
 * Remplace le header du modal signOut
 */
function headerSignOutMdl() {
  let header = document.getElementById("modalHeader");
  let p = document.createElement("p");
  let btn = document.createElement("button");

  p.appendChild(document.createTextNode("Connexion"));
  p.setAttribute("class", "modal-card-title");
  btn.setAttribute("class", "delete");
  btn.setAttribute("onclick", "closeMdl('mdl-login');");
  btn.setAttribute("aria-label", "close");

  header.appendChild(p);
  header.appendChild(btn);
}

/**
 * Remplace le body du modal signOut
 */
function bodySignOutMdl() {
  document.getElementById("modalSection").innerHTML = `
  <label for="apiKey">Saisissez votre clé api:</label>
  <input id="txtApi" class="input" type="password" placeholder="Clé API">
  <span id="error-login" class="help"></span> `;
}

/**
 * Remplace le footer du modal signOut
 */
function footerSignOutMdl() {
  let footer = document.getElementById("modalFooter");
  let btnClose = document.createElement("button");
  let btnSignOut = document.createElement("button");

  btnClose.setAttribute("class", "button");
  btnClose.setAttribute("onclick", "closeMdl('mdl-login');");
  btnClose.appendChild(document.createTextNode("Fermer"));

  btnSignOut.setAttribute("onclick", "lanceWhoamiEtInsereLogin();");
  btnSignOut.setAttribute("class", "button");
  btnSignOut.appendChild(document.createTextNode("Se Connecter"));
  footer.appendChild(btnClose);
  footer.appendChild(btnSignOut);
}

/**
 * Ouvre un modal
 * 
 * @param {string} idModal l'identifiant d'une fenêtre modal 
 */
function openMdl(idMdl)
{
  console.log("CALL modalOpen("+idMdl+")");
  document.getElementById(idMdl).classList.add('is-active');
}
 
/**
 * Ferme un modal
 * 
 * @param {string} idMdl l'identifiant d'une fenêtre modal
 */
function closeMdl(idMdl)
{
  console.log("CALL modalClose("+idMdl+")");
  document.getElementById(idMdl).classList.remove('is-active');
}

/* ******************************************************************
 *                   Filtre des citations
 * ****************************************************************** */

//pas fini
function filtreCitation(citation,i) {
  const search = document.getElementById("search").value;
  if(search == citations.character) || (search == citations.quote) || (search == "") {
    return fetchCitations(citation);
  }
}

/* ******************************************************************
 *                     Ajout d'une citation
 * ****************************************************************** */

/**
 * Fait une requête POST authentifiée sur /citations
 * 
 * @param {string} quote la citation
 * @param {string} character le personnage
 * @param {string} image l'image
 * @param {string} characterDirection la direction de l'image
 * @param {string} origin l'origine
 * @param {string} apiKey la clé API
 * @return une promesse de la citation à ajouter, ou d'un message d'erreur
 */
function fetchAddCitation(quote, character, image, characterDirection, origin, apiKey)
{
  console.log("CALL fetchAddCitation");
  return fetch(serverUrl + "/citations", 
  {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "Application/json"},
    body: JSON.stringify({
        "quote": quote, "character": character, "image": image, "characterDirection": characterDirection, "origin": origin,
      })
  })
    .then((response) => response.json())
    .then((jsonData) => {
      if (jsonData.status && Number(jsonData.status) != 200) {
        return { err: jsonData.message };
      }
      return jsonData;
    })
    .catch((erreur) => ({ err: erreur }));
}

/**
 * Ajoute une citation au serveur et rafraîchit le tableau des citations 
 */
function addCit() {
  const apiKey = document.getElementById("txtApi").textContent;
  if(apiKey !== '') {
    const quote = document.getElementById("inputQuote").value;
    const character = document.getElementById("inputCharacter").value;
    const image = document.getElementById("inputImage").value;
    const characterDirection = document.getElementById("inputCharacterDirection").value;
    const origin = document.getElementById("inputOrigin").value;
    if(quote !== "" && origin !== "" && character !== "") {
      console.log("CALL addCit")
      fetchAddCitation(quote, character, image, characterDirection, origin, apiKey);
      clearInputandSpan();
      fetchCitations(() => { totalTab.innerHTML = ``; });
      fetchCitations(cit => { fillTotalTable(cit); });
    } else {
      addErrCit(quote, origin, character);
    }
  } else {
    alert("Veuillez vous connecter s'il vous plaît.")
  }
}

/**
 * Vérifie si la valeur de ces champs sont vides
 * @param {string} champ1 la case de saisie citation vide
 * @param {string} champ2 la case de saisie origine vide
 * @param {string} champ3 la case de saisie personnage vide
 */
function addErrCit(champ1, champ2, champ3)
{
  if(champ1 == "") {
    document.getElementById("errorQuote").innerHTML = "Veuillez remplir cette case.";
  } else {
    document.getElementById("errorQuote").innerHTML = '';
  }
  if(champ2 == "") {
    document.getElementById("errorOrigin").innerHTML = "Veuillez remplir cette case.";
  } else {
    document.getElementById("errorOrigin").innerHTML = '';
  }
  if(champ3 == "") {
    document.getElementById("errorCharacter").innerHTML = "Veuillez remplir cette case.";
  } else {
    document.getElementById("errorCharacter").innerHTML = '';
  }
}

/**
 * Après l'ajout de la citation au serveur
 * supprime les valeurs saisi et les messages d'erreur
 */
function clearInputandSpan()
{
  document.getElementById("inputQuote").value = '';
  document.getElementById("inputCharacter").value = '';
  document.getElementById("inputImage").value = '';
  document.getElementById("inputCharacterDirection").value = '';
  document.getElementById("inputOrigin").value = '';

  document.getElementById("errorQuote").innerHTML = '';
  document.getElementById("errorOrigin").innerHTML = '';
  document.getElementById("errorCharacter").innerHTML = '';
}








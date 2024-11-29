var plateau = document.getElementById("conteneurDeCases");
var tableCases = []; //Toutes les cases du plateau sont rangées ici et numérotées de 0 à 48.


class Case{

    constructor(div , X , Y ) {
        this.div = div; //Un moyen rapide de récupérer l'équivalent graphique à une case.
        this.X = X;
        this.Y = Y;
        this.accessible = false; //Indique au jeu si on aura le droit de placer un pion dans cette case au prochain tour.
        //Le plateau est une matrice en 7x7. Les cases sur la circonférence sont extérieures au plateau.
        this.contenu = null; //Vaut null si la case est vide, sinon contient un objet de type Pion.
    }

    getX(){
        return this.X;
    }

    getY(){
        return this.Y;
    }

    getDiv(){
        return this.div;
    }

    enJeu(){
        //Vaut true si la case est dans la zone de jeu.
        return 0 < this.X && this.X < 6 && 0 < this.Y && this.Y < 6;
    }

    voisinHaut(){
        if (!this.enJeu())return null;
        return tableCases[(this.X+7*this.Y)-7];
    }

    voisinBas(){
        if (!this.enJeu())return null;
        return tableCases[(this.X+7*this.Y)+7];
    }

    voisinDroite(){
        if (!this.enJeu())return null;
        return tableCases[(this.X+7*this.Y)+1];
    }

    voisinGauche(){
        if (!this.enJeu())return null;
        return tableCases[(this.X+7*this.Y)-1];
    }

    caseVoisine(sens){
        switch (sens){
            case "haut": return this.voisinHaut();
            case "bas": return this.voisinBas();
            case "droite": return this.voisinDroite();
            case "gauche": return this.voisinGauche();
            default: return null;
        }
    }

    setContenu(pion){
        //Pour poser un pion sur une case où vider une case (setContenu(null))
        this.contenu = pion;
    }

    getContenu(){
        //Si la case est vide retourne null, sinon retourne un pion.
        return this.contenu;
    }

    getAccessible(){
        return this.accessible;
    }

    setAccessible(state){
        this.accessible = state;
    }

    estVide(){
        return !(this.contenu);
    }

}

class Pion{

    constructor(type,position,direction=null){
        if (!["rocher","ryno","ele"].includes(type))type = null;
        this.type = type;
        this.direction = direction; // un string qui vaut "droite","gauche","haut" où "bas". Vaut null si et seulement si le pion est un rocher.
        this.position = position; //La case où le pion est situé actuellement.
    }

    getType(){
        return this.type;
    }

    getDirection(){
        return this.direction;
    }

    setDirection(sens){
        if (this.rocher)return;
        if (!["haut","bas","droite","gauche"].includes(sens))return;
        this.direction = sens;
    }

    setImage(imagePath) {
        // Associe une image au pion.
        if (typeof imagePath !== 'string' || !imagePath.endsWith(".png")) {
            console.error("setImage() : chemin d'image invalide !");
            return;
        }
        this.image = imagePath;
    }
    
    pionVoisin(sens){
        //Récupère le pion adjacent à this s'il existe.
        var voisin;
        voisin = this.position.caseVoisine(sens);
        return voisin.getContenu() ? voisin.getContenu() : null;
    }

    oppose(sens){
        //A chaque sens associe son opposé pour savoir si un pion est face à un autre.
        switch (sens){
            case "droite": return "gauche";
            case "gauche": return "droite";
            case "haut": return "bas";
            case "bas": return "haut";
            default: return null;
        }
    }

    nbAmis(sens,res=1){
        //Parcourt une rangée dans le sens indiqué pour trouver le nombre de pièces qui poussent dans la même direction que this.
        var voisin = this.pionVoisin(sens);
        if (!voisin)return res;
        if (voisin.getDirection() === sens)res ++;
        return voisin.nbAmis(sens,res);
    }

    nbAdversaires(sens,res=0){
        //Parcourt une rangée dans le sens indiqué pour trouver le nombre de pièces qui poussent dans la direction opposée à this.
        var voisin = this.pionVoisin(sens);
        if (!voisin)return res;
        if (voisin.getDirection() === this.oppose(sens))res ++;
        return voisin.nbAdversaires(sens,res);
    }

    nbRochers(sens,res=0){
        //Parcourt une rangée dans le sens indiqué pour trouver le nombre de rochers.
        var voisin = this.pionVoisin(sens);
        if (!voisin)return res;
        if (voisin.getType() === "rocher")res ++;
        return voisin.nbRochers(sens,res);
    }

    peutPousser(sens){
        //Détermine si on peut pousser dans une direction.
        if (!this.position.caseVoisine(sens).enJeu()){return false}//On ne peut pas se déplacer en sortant de la zone de jeu.
        if (!this.pionVoisin(sens)){return true;} //On peut toujours pousser quand la case voisine est vide.
        if (this.direction !== sens)return false;
        var adv = this.nbAdversaires(sens,0);
        var ami = this.nbAmis(sens,1);
        var rocher = this.nbRochers(sens,0);
        return (ami > adv && ami >= rocher);
    }

    poussePion(sens){
        //Fonction récursive qui permet de pousser une rangée à partir du pion this.
        if (!this.pionVoisin(sens)){
            this.position.caseVoisine(sens).setContenu(this);
            this.position.setContenu(null);
        }
        this.pionVoisin(sens).poussePion(sens);
        this.position.caseVoisine(sens).setContenu(this);
        this.position.setContenu(null);
    }

    getPossibilites(){
        //retourne un tableau qui contient toutes les cases où ce pion peut se déplacer.
        var res = [];
        if (this.peutPousser("haut")){res.push(this.position.voisinHaut())}
        if (this.peutPousser("bas")){res.push(this.position.voisinBas())}
        if (this.peutPousser("droite")){res.push(this.position.voisinDroite())}
        if (this.peutPousser("gauche")){res.push(this.position.voisinGauche())}
        return res;
    }

    
}

class Affichage{

    constructor() {
        this.initialized = false; // Indique si les pions ont déjà été placés.
    }

    updatePlateau() {
        // Initialisation des pions lors du premier appel.
        if (!this.initialized) {
            this.placeInitialPieces(); // Appelle une méthode pour placer les pièces au début.
            this.initialized = true;
        }

        // Parcourt le statut de chaque case et lui associe l'affichage requis.
        var pionOrNull;
        var platCase;
        for (platCase of tableCases) {
            pionOrNull = platCase.getContenu();
            if (!pionOrNull) {
                platCase.getDiv().style.backgroundColor = "transparent";
                platCase.getDiv().style.backgroundImage = "none";
            } else {
                switch (pionOrNull.getType()) {
                    case "ryno":
                        platCase.getDiv().style.backgroundImage = `url(${pionOrNull.image})`;
                        platCase.getDiv().style.backgroundSize = "cover";
                        break;
                    case "ele":
                        platCase.getDiv().style.backgroundImage = `url(${pionOrNull.image})`;
                        platCase.getDiv().style.backgroundSize = "cover";
                        break;
                    case "rocher":
                        platCase.getDiv().style.backgroundImage = `url(${pionOrNull.image})`;
                        platCase.getDiv().style.backgroundSize = "cover";
                        break;
                    default:
                        console.log("Erreur : type de pion inconnu.");
                }
            }
        }
    }

    placeInitialPieces() {
        let indicesRochers = [23, 24, 25];  // Indices des cases qui accueilleront les rochers.
        let indicesRynoes = [1, 2, 3, 4, 5];  // Indices des cases qui accueilleront les rynoes.
        let indicesElephants = [43, 44, 45, 46, 47];  // Indices des cases qui accueilleront les éléphants.

        // Chemins vers les images des rochers.
        let imagesRochers = [
            "./img_siam/Pieces/Rocher/rock1.png",
            "./img_siam/Pieces/Rocher/rock2.png",
            "./img_siam/Pieces/Rocher/rock3.png",
            "./img_siam/Pieces/Rocher/rock4.png",
            "./img_siam/Pieces/Rocher/rock5.png"
        ];

        // Chemins vers les images des rynoes.
        let imagesRynoes = [
            "./img_siam/Pieces/Rino/rino1.png",
            "./img_siam/Pieces/Rino/rino2.png",
            "./img_siam/Pieces/Rino/rino3.png",
            "./img_siam/Pieces/Rino/rino4.png",
            "./img_siam/Pieces/Rino/rino5.png"
        ];

        // Chemins vers les images des éléphants.
        let imagesElephants = [
            "./img_siam/Pieces/Elephant/ele1.png",
            "./img_siam/Pieces/Elephant/ele2.png",
            "./img_siam/Pieces/Elephant/ele3.png",
            "./img_siam/Pieces/Elephant/ele4.png",
            "./img_siam/Pieces/Elephant/ele5.png"
        ];

        // Mélange les images et sélectionne celles nécessaires.
        let imagesChoisiesRochers = imagesRochers.sort(() => Math.random() - 0.5).slice(0, 3);
        let imagesChoisiesRynoes = imagesRynoes.sort(() => Math.random() - 0.5).slice(0, 5);
        let imagesChoisiesElephants = imagesElephants.sort(() => Math.random() - 0.5).slice(0, 5);

        // Place les rochers sur les cases spécifiées.
        indicesRochers.forEach((index, i) => {
            let caseRocher = tableCases[index];
            let rocher = new Pion("rocher", caseRocher, null);
            rocher.setImage(imagesChoisiesRochers[i]); // Assigne une image au rocher.
            caseRocher.setContenu(rocher); // Place le rocher sur la case.
        });

        // Place les rynoes sur les cases spécifiées.
        indicesRynoes.forEach((index, i) => {
            let caseRyno = tableCases[index];
            let ryno = new Pion("ryno", caseRyno, "bas");
            ryno.setImage(imagesChoisiesRynoes[i]); // Assigne une image au ryno.
            caseRyno.setContenu(ryno); // Place le ryno sur la case.
        });

        // Place les éléphants sur les cases spécifiées.
        indicesElephants.forEach((index, i) => {
            let caseElephant = tableCases[index];
            let elephant = new Pion("ele", caseElephant, "haut");
            elephant.setImage(imagesChoisiesElephants[i]); // Assigne une image à l'éléphant.
            caseElephant.setContenu(elephant); // Place l'éléphant sur la case.
        });
    }

    affichePossibilites(tour){
        //Montre au joueur/joueuse toutes les cases où il/elle a le droit de placer le pion qu'il/elle a choisi.
        //Enlève également toutes les cases mises en évidencde au tour d'avant.
        var couleur;
        var platCase;
        switch (tour){
            case "ele": couleur="rgba(255,0,0,0.5)";break;
            case "ryno": couleur="rgba(0,0,255,0.5)";break;
            default : alert("alright something is not working.");return;
        }
        for (platCase of tableCases){
            if (platCase.getAccessible()){
                platCase.getDiv().style.backgroundColor = couleur;
            }
            else if (platCase.estVide()){
                console.log("une case inaccesible à été assombrie.");
                platCase.getDiv().style.backgroundColor = "transparent";
            }

        }
        return;
    }

    placeDiv(){
        //Construit la structure initiale de la page.
        var caseDiv;
        var nbCases = 49;
        var i = 0;
        for (i=0;i<nbCases;i++){
            caseDiv = document.createElement("div");
            caseDiv.classList.add("case");
            caseDiv.id = i;
            plateau.appendChild(caseDiv);
            tableCases.push(new Case(caseDiv , i % 7 , Math.floor( i / 7 ) ));
        }
        return;
    }

}

class Jeu{

    constructor() {
        // Le jeu est à la jonction entre l'affichage et les règles
        this.timer = 0;
        this.aff = new Affichage();
        this.tour = "ele"; // "ele" pour Joueur 1, "ryno" pour Joueur 2
        this.aff.placeDiv();
        this.placePieces();
        this.aff.updatePlateau();
    }

    updatePlateau(){
        this.aff.updatePlateau();
    }

    updatePlayerBar() {
        const player1 = document.getElementById('player1');
        const player2 = document.getElementById('player2');

        // Appliquer le shadow effect sur le joueur dont c'est le tour
        if (this.tour === "ele") {
            player1.style.boxShadow = "0 0 10px 2px rgba(0,0,255,0.7)"; // Bleu pour Joueur 1
            player2.style.boxShadow = "none";
        } else {
            player2.style.boxShadow = "0 0 10px 2px rgba(255,0,0,0.7)"; // Rouge pour Joueur 2
            player1.style.boxShadow = "none";
        }
    }

    placePieces() {
        let indicesRochers = [23, 24, 25];  // Indices des cases qui accueilleront les rochers
        let indicesRynoes = [1, 2, 3, 4, 5];  // Indices des cases qui accueilleront les rynoes
        let indicesElephants = [43, 44, 45, 46, 47];  // Indices des cases qui accueilleront les éléphants
    
        // Chemins vers les images des rochers (en png).
        let imagesRochers = [
            "./img_siam/Pieces/Rocher/rock1.png",
            "./img_siam/Pieces/Rocher/rock2.png",
            "./img_siam/Pieces/Rocher/rock3.png",
            "./img_siam/Pieces/Rocher/rock4.png",
            "./img_siam/Pieces/Rocher/rock5.png"
        ];
    
        // Chemins vers les images des rynoes (en png).
        let imagesRynoes = [
            "./img_siam/Pieces/Rino/rino1.png",
            "./img_siam/Pieces/Rino/rino2.png",
            "./img_siam/Pieces/Rino/rino3.png",
            "./img_siam/Pieces/Rino/rino4.png",
            "./img_siam/Pieces/Rino/rino5.png"
        ];
    
        // Chemins vers les images des éléphants (en png).
        let imagesElephants = [
            "./img_siam/Pieces/Elephant/ele1.png",
            "./img_siam/Pieces/Elephant/ele2.png",
            "./img_siam/Pieces/Elephant/ele3.png",
            "./img_siam/Pieces/Elephant/ele4.png",
            "./img_siam/Pieces/Elephant/ele5.png"
        ];
    
        // Mélange les images et sélectionne trois au hasard pour les rochers.
        let imagesChoisiesRochers = imagesRochers.sort(() => Math.random() - 0.5).slice(0, 3);
    
        // Mélange les images et sélectionne cinq au hasard pour les rynoes.
        let imagesChoisiesRynoes = imagesRynoes.sort(() => Math.random() - 0.5).slice(0, 5);
    
        // Mélange les images et sélectionne cinq au hasard pour les éléphants.
        let imagesChoisiesElephants = imagesElephants.sort(() => Math.random() - 0.5).slice(0, 5);
    
        // Place les rochers sur les cases qui étaient blanches avec des images choisies aléatoirement.
        indicesRochers.forEach((index, i) => {
            let caseRocher = tableCases[index];
            let rocher = new Pion("rocher", caseRocher, null); // Crée un Rocher
            rocher.setImage(imagesChoisiesRochers[i]); // Assigne une image aléatoire au rocher
            caseRocher.setContenu(rocher); // Place le rocher sur la case
            console.log(`Rocher placé sur case ${index} avec image ${imagesChoisiesRochers[i]}`);
        });
    
        // Place les rynoes sur les cases rouges avec des images choisies aléatoirement.
        indicesRynoes.forEach((index, i) => {
            let caseRyno = tableCases[index];
            let ryno = new Pion("ryno", caseRyno, "bas"); // Crée un Ryno
            ryno.setImage(imagesChoisiesRynoes[i]); // Assigne une image aléatoire au Ryno
            caseRyno.setContenu(ryno); // Place le Ryno sur la case
            console.log(`Ryno placé sur case ${index} avec image ${imagesChoisiesRynoes[i]}`);
        });
    
        // Place les éléphants sur les cases bleues avec des images choisies aléatoirement.
        indicesElephants.forEach((index, i) => {
            let caseElephant = tableCases[index];
            let elephant = new Pion("ele", caseElephant, "haut"); // Crée un Elephant
            elephant.setImage(imagesChoisiesElephants[i]); // Assigne une image aléatoire à l'éléphant
            caseElephant.setContenu(elephant); // Place l'éléphant sur la case
            console.log(`Elephant placé sur case ${index} avec image ${imagesChoisiesElephants[i]}`);
        });
    }
    
    allumeCirconference(){
        //Donne à toutes les cases sur la circonférence de la zone de jeu le statut "accessible"
        //Exeption : la règle du jeu spécifie que tant que trois tours de jeu n'ont pas eu lieu, les cases sur la colonne centrale sont interdites.
        var i;
        for (i=0;i<5;i++){
            tableCases[8+i].setAccessible(true);
            tableCases[tableCases.length-(8+i)-1].setAccessible(true);
            tableCases[8+7*i].setAccessible(true);
            tableCases[tableCases.length-(8+7*i)-1].setAccessible(true);
        }
        if (this.timer < 3){
            tableCases[10].setAccessible(false);
            tableCases[tableCases.length - 1 - 10].setAccessible(false);
        }
    }

    changerDeTour() {
        if (this.tour === "ele") {
            this.tour = "ryno";
        } else {
            this.tour = "ele";
        }

        // Met à jour la barre des joueurs après chaque changement de tour
        this.updatePlayerBar();
    }

    eteintPlateau() {
        //Toutes les cases obtiennent le statut inaccesible.
        tableCases.forEach(platCase => platCase.setAccessible(false));
        this.aff.affichePossibilites(this.tour);
    }

    allumePossibilites(pionChoisi){
        //Le joueur a choisi un Pion, montrons lui où il est possible de le déplacer.
        alert("allumons les possibilités");
        var caseAccessible;
        if (!pionChoisi){alert("Bro 'pion' was never real");}
        if (!pionChoisi.position.enJeu()){
            this.allumeCirconference();
            this.aff.affichePossibilites(this.tour);
            return;
        }
        for (caseAccessible of pionChoisi.getPossibilites()){
            caseAccessible.setAccessible(true);
        }
        this.aff.affichePossibilites(this.tour);
        return;
    }

}


class Interface {

    constructor() {
        // Cette classe est la plus générale, car elle gère l'interaction au-delà du jeu.
        this.jeu = new Jeu();
        this.jeu.updatePlateau();
        
        // Ajout de la barre en haut de l'écran
        this.addPlayerBar();
        
        var x;
        var y;
        var i;
        for (let i = 0; i < tableCases.length; i++) {
            x = tableCases[i].getX();
            y = tableCases[i].getY();
            tableCases[i].getDiv().addEventListener("click", this.onClickEvent(x, y, this.jeu));
        }
    }

    // Fonction pour ajouter la barre des joueurs
    addPlayerBar() {
        const bar = document.createElement('div');
        bar.id = 'playerBar'; // Id pour la barre
        bar.style.backgroundColor = '#A4D3A2'; // Fond verdâtre
        bar.style.height = '20px';
        bar.style.width = '100%';  // Prend toute la largeur de l'écran
        bar.style.position = 'fixed';  // Fixe la barre en haut
        bar.style.top = '0';  // Positionne la barre en haut de la page
        bar.style.left = '0';  // Prend toute la largeur
        bar.style.display = 'flex';
        bar.style.justifyContent = 'space-between';
        bar.style.padding = '5px';
        bar.style.alignItems = 'center';
        bar.style.zIndex = '1000';  // Assure que la barre est au-dessus des autres éléments

        const player1 = document.createElement('div');
        player1.id = 'player1';
        player1.textContent = "Joueur 1";
        player1.style.color = 'blue';
        player1.style.fontWeight = 'bold';
        player1.style.textAlign = 'center';
        player1.style.width = '50%';

        const player2 = document.createElement('div');
        player2.id = 'player2';
        player2.textContent = "Joueur 2";
        player2.style.color = 'red';
        player2.style.fontWeight = 'bold';
        player2.style.textAlign = 'center';
        player2.style.width = '50%';

        bar.appendChild(player1);
        bar.appendChild(player2);

        // Ajouter la barre au body ou au conteneur du jeu
        document.body.appendChild(bar);
    }

    onClickEvent(x, y, jeu) {
        return function () {
            jeu.eteintPlateau();
            var caseChoisie = gatherFromTableCases(x, y);
            var pionChoisi = caseChoisie.getContenu();
            if (pionChoisi) {
                jeu.allumePossibilites(pionChoisi);
                return;
            }
            alert(caseChoisie.getAccessible());
        };
    }
}

function gatherFromTableCases(x,y){
    //Récupère la case de coordonnées (x,y) dans tablecases.
    var index = x+7*y;
    return tableCases[index];
}

inter = new Interface();
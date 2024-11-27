var plateau = document.getElementById("conteneurDeCases");
var tableCases = []; // Toutes les cases du plateau sont rangées ici et numérotées de 0 à 48.

class Case {
    constructor(div, X, Y) {
        this.div = div; // L'élément HTML associé à la case.
        this.X = X;
        this.Y = Y;
        this.accessible = false; // Indique si un pion peut être placé ici.
        this.contenu = null; // Null si la case est vide, sinon contient un objet de type Pion.
    }

    getX() {
        return this.X;
    }

    getY() {
        return this.Y;
    }

    getDiv() {
        return this.div;
    }

    enJeu() {
        // Retourne true si la case est dans la zone de jeu (pas sur les bords).
        return 0 < this.X && this.X < 6 && 0 < this.Y && this.Y < 6;
    }

    setContenu(pion) {
        this.contenu = pion;
    }

    getContenu() {
        return this.contenu;
    }

    estVide() {
        return !this.contenu;
    }

    // Méthode pour obtenir la case voisine dans une direction
    caseVoisine(sens) {
        let x = this.X;
        let y = this.Y;
        switch (sens) {
            case "haut":
                return tableCases[(y - 1) * 7 + x];  // Case au-dessus
            case "bas":
                return tableCases[(y + 1) * 7 + x];  // Case en-dessous
            case "gauche":
                return tableCases[y * 7 + (x - 1)];  // Case à gauche
            case "droite":
                return tableCases[y * 7 + (x + 1)];  // Case à droite
            default:
                return null;
        }
    }

    // Méthode pour définir si une case est accessible
    setAccessible(accessible) {
        this.accessible = accessible;
        if (accessible) {
            this.div.style.backgroundColor = "rgba(0, 255, 0, 0.5)";  // Couleur de survol
        } else {
            this.div.style.backgroundColor = "";
        }
    }
}

class Pion {
    constructor(type, position, direction = null) {
        if (!["rocher", "ryno", "ele"].includes(type)) type = null;
        this.type = type;
        this.direction = direction; // "haut", "bas", "droite", "gauche"
        this.position = position;
        this.image = null; // Image associée au pion.
    }

    setImage(imagePath) {
        this.image = imagePath;
        if (this.position) {
            // Appliquer l'image comme arrière-plan de la div de la case.
            this.position.getDiv().style.backgroundImage = `url(${imagePath})`;
            this.position.getDiv().style.backgroundSize = "cover";
            this.position.getDiv().style.backgroundPosition = "center";

            // Appliquer la rotation de l'image en fonction de la direction.
            this.applyRotation();
        }
    }

    getType() {
        return this.type;
    }

    getDirection() {
        return this.direction;
    }

    setDirection(sens) {
        if (this.type === "rocher") return;
        if (!["haut", "bas", "droite", "gauche"].includes(sens)) return;
        this.direction = sens;
        this.applyRotation();  // Appliquer la rotation chaque fois que la direction change.
    }

    // Applique la rotation en fonction de la direction du pion
    applyRotation() {
        if (this.direction === "haut") {
            this.position.getDiv().style.transform = "rotate(0deg)";
        } else if (this.direction === "bas") {
            this.position.getDiv().style.transform = "rotate(180deg)";
        } else if (this.direction === "droite") {
            this.position.getDiv().style.transform = "rotate(90deg)";
        } else if (this.direction === "gauche") {
            this.position.getDiv().style.transform = "rotate(-90deg)";
        }
    }

    setDirection(sens){
        if (this.rocher)return;
        if (!["haut","bas","droite","gauche"].includes(sens))return;
        this.direction = sens;
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

class Affichage {

    placeDiv() {
        // Construit la structure initiale du plateau.
        var caseDiv;
        var nbCases = 49; // 7x7 plateau
        for (let i = 0; i < nbCases; i++) {
            caseDiv = document.createElement("div");
            caseDiv.classList.add("case");
            caseDiv.id = i;
            plateau.appendChild(caseDiv);
            tableCases.push(new Case(caseDiv, i % 7, Math.floor(i / 7)));
        }
    }

    updatePlateau() {
        // Met à jour visuellement le plateau en fonction des contenus des cases.
        for (let platCase of tableCases) {
            // Supprimer tous les enfants de la case (nettoyage des images existantes)
            while (platCase.getDiv().firstChild) {
                platCase.getDiv().removeChild(platCase.getDiv().firstChild);
            }

            let pion = platCase.getContenu();
            if (pion && pion.getType() === "rocher") {
                let img = document.createElement("img");
                img.src = pion.getImage();
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "contain";
                platCase.getDiv().appendChild(img);
            } else if (!pion) {
                platCase.getDiv().style.backgroundColor = "transparent";
            } else if (pion.getType() === "ryno") {
                platCase.getDiv().style.backgroundColor = "red";
            } else if (pion.getType() === "ele") {
                platCase.getDiv().style.backgroundColor = "blue";
            }
        }
    }
}

class Jeu {
    constructor() {
        this.aff = new Affichage();
        this.aff.placeDiv();
        this.placePieces(); // Place les rochers, rynoes et éléphants
        this.aff.updatePlateau();
        this.activePion = null; // Pour stocker le pion sélectionné
    }

    placePieces() {
       
        let indicesRochers = [23, 24, 25];  // Indices des cases centrales pour les rochers (les trois au centre)
        

        let indicesRynoes = [1, 2, 3, 4, 5];  // Les cases en haut du plateau

        let indicesElephants = [43, 44, 45, 46, 47];  // Les cases en bas du plateau

        // Chemins vers les images des rochers (en JPG).
        let imagesRochers = [
            "img_siam/Pieces/Rocher/rock1.jpg",
            "img_siam/Pieces/Rocher/rock2.jpg",
            "img_siam/Pieces/Rocher/rock3.jpg",
            "img_siam/Pieces/Rocher/rock4.jpg",
            "img_siam/Pieces/Rocher/rock5.jpg"
        ];
        
        // Chemins vers les images des rynoes (en JPG).
        let imagesRynoes = [
            "img_siam/Pieces/Rino/rino1.jpg",
            "img_siam/Pieces/Rino/rino2.jpg",
            "img_siam/Pieces/Rino/rino3.jpg",
            "img_siam/Pieces/Rino/rino4.jpg",
            "img_siam/Pieces/Rino/rino5.jpg"
        ];
        
        // Chemins vers les images des éléphants (en JPG).
        let imagesElephants = [
            "img_siam/Pieces/Elephant/ele1.jpg",
            "img_siam/Pieces/Elephant/ele2.jpg",
            "img_siam/Pieces/Elephant/ele3.jpg",
            "img_siam/Pieces/Elephant/ele4.jpg",
            "img_siam/Pieces/Elephant/ele5.jpg"
        ];

        // Mélange les images et sélectionne trois au hasard pour les rochers.
        let imagesChoisiesRochers = imagesRochers.sort(() => Math.random() - 0.5).slice(0, 3);

        // Mélange les images et sélectionne cinq au hasard pour les rynoes.
        let imagesChoisiesRynoes = imagesRynoes.sort(() => Math.random() - 0.5).slice(0, 5);

        // Mélange les images et sélectionne cinq au hasard pour les éléphants.
        let imagesChoisiesElephants = imagesElephants.sort(() => Math.random() - 0.5).slice(0, 5);

        // Place les rochers sur les cases centrales avec des images choisies aléatoirement.
        indicesRochers.forEach((index, i) => {
            let caseRocher = tableCases[index];
            let rocher = new Pion("rocher", caseRocher, null);
            rocher.setImage(imagesChoisiesRochers[i]);
            caseRocher.setContenu(rocher);
        });

        // Place les rynoes sur les cases rouges avec des images choisies aléatoirement.
        indicesRynoes.forEach((index, i) => {
            let caseRyno = tableCases[index];
            let ryno = new Pion("ryno", caseRyno, "bas");  // Orientation à "bas" pour la tête en bas
            ryno.setImage(imagesChoisiesRynoes[i]);
            caseRyno.setContenu(ryno);
        });

        // Place les éléphants sur les cases bleues avec des images choisies aléatoirement.
        indicesElephants.forEach((index, i) => {
            let caseElephant = tableCases[index];
            let elephant = new Pion("ele", caseElephant, "haut");  // Orientation à "haut"
            elephant.setImage(imagesChoisiesElephants[i]);
            caseElephant.setContenu(elephant);
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
        this.jeu = new Jeu();
        this.jeu.aff.updatePlateau();
    }
}

new Interface();

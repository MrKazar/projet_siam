var plateau = document.getElementById("conteneurDeCases");
var tableCases = []; //Toutes les cases du plateau sont rangées ici et numérotées de 0 à 48.


class Case{

    constructor(div , X , Y ) {
        this.div = div; //Un moyen rapide de récupérer l'équivalent graphique à une case.
        this.X = X;
        this.Y = Y;
        //Le plateau est une matrice en 7x7. Les cases sur la circonférence sont extérieures au plateau.
        this.contenu = null; //Vaut null si la case est vide, sinon contient un objet de type Pion.
    }

    enJeu(){
        //Vaut true si la case est dans la zone de jeu.
        return 0 < this.X && this.X < 7 && 0 < this.Y && this.Y < 7;
    }

    voisinHaut(){
        if (!this.enJeu())return;
        return tableCases[this.X-7];
    }

    voisinBas(){
        if (!this.enJeu())return;
        return tableCases[this.X+7];
    }

    voisinDroite(){
        if (!this.enJeu())return;
        return tableCases[this.X+1];
    }

    voisinGauche(){
        if (!this.enJeu())return;
        return tableCases[this.X-1];
    }

    setContenu(pion){
        //Pour poser un pion sur une case où vider une case (setContenu(null))
        this.contenu = pion;
    }

    getContenu(){
        //Si la case est vide retourne null, sinon retourne un pion.
        return this.contenu;
    }

}

class Pion{

    constructor(type,position){
        this.rocher = (type === "rocher");//Vaut true si le pion est un rocher.
        this.ryno = (type === "ryno");//Vaut true si le pion est un rynocéros.
        this.ele = (type === "ele"); //Vaut true si le pion est un éléphant
        this.direction = null; // un string qui vaut "droite","gauche","haut" où "bas". Vaut null si et seulement si le pion est un rocher.
        this.position = position; //La case où le pion est situé actuellement.
    }

    getDirection(){
        return this.direction;
    }

    setDirection(sens){
        if (this.rocher)return;
        if (!sens in ["haut","bas","droite","gauche"])return;
        this.direction = sens;
    }

    pionVoisin(sens){
        //Récupère le pion adjacent à this s'il existe.
        var voisin;
        switch (sens){
            case "droite": voisin = this.position.voisinDroite().getContenu();
            case "gauche": voisin = this.position.voisinGauche().getContenu();
            case "haut": voisin = this.position.voisinDroite().getContenu();
            case "bas": voisin = this.position.voisinBas().getContenu();
            default: voisin = null;
        }
        return voisin;
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

    
}

class Affichage{

    updatePlateau(){
        var imagePion = document.createElement("img")
        for (platCase of tableCases){
            if (platCase.contenu){
                platCase.appendChild(imagePion);
                //GERER L'APPARITION DE L'IMAGE DU PION ORIENTEE DANS LE BON SENS
                //NOTE : TOUES LES INFORMATIONS NECESSAIRES SONT EN METHODE DE PLATCASE
            }
        }
    }

}


function placeDiv(){
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

placeDiv();
console.log(tableCases);
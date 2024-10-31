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

    pionVoisin(sens){
        //Récupère le pion adjacent à this s'il existe.
        var voisin;
        switch (sens){
            case "droite": voisin = this.position.voisinDroite().getContenu();break;
            case "gauche": voisin = this.position.voisinGauche().getContenu();break;
            case "haut": voisin = this.position.voisinHaut().getContenu();break;
            case "bas": voisin = this.position.voisinBas().getContenu();break;
            default: voisin = null;
        }
        return voisin ? voisin.getContenu() : null;
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
        if (!this.pionVoisin(sens))return true;
        var adv = this.nbAdversaires(sens,0);
        var ami = this.nbAmis(sens,1);
        var rocher = this.nbRochers(sens,0);
        return (ami > adv && ami >= rocher);
    }

    
}

class Affichage{

    updatePlateau(){
        var pionOrNull;
        var platCase;
        for (platCase of tableCases){
            pionOrNull = platCase.getContenu();
            if (!pionOrNull) platCase.getDiv().style.backgroundColor = "black";
            else if (pionOrNull.getType() === "ryno") platCase.getDiv().style.backgroundColor = "red";
            else if (pionOrNull.getType() === "ele") platCase.getDiv().style.backgroundColor = "blue";
            else if (pionOrNull.getType() === "rocher") platCase.getDiv().style.backgroundColor = "white";
            else console.log("nu huh");
        }
    }

}

class Jeu{

    constructor(){
        this.aff = new Affichage();
        this.placeDiv();
        this.placePieces();
        this.aff.updatePlateau();
    }

    placeDiv(){
    //
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
    return;}

    placePieces(){
        var i;
        for(i=1;i<7-1;i++){
            tableCases[i].setContenu(new Pion("ryno",tableCases[i],"bas"));
            tableCases[48-i].setContenu(new Pion("ele",tableCases[48-i],"haut"));
        }
        tableCases[23].setContenu(new Pion("rocher",tableCases[23],null));
        tableCases[24].setContenu(new Pion("rocher",tableCases[24],null));
        tableCases[25].setContenu(new Pion("rocher",tableCases[25],null));
    }

}

var jeu = new Jeu();
console.log(tableCases[2].getContenu().pionVoisin("droite"));
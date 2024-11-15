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

    updatePlateau(){
        //Parcourt le statut de chaque case et lui associe l'affichage requis.
        var pionOrNull;
        var platCase;
        for (platCase of tableCases){
            pionOrNull = platCase.getContenu();
            if (!pionOrNull) platCase.getDiv().style.backgroundColor = "transparent";
            else if (pionOrNull.getType() === "ryno") platCase.getDiv().style.backgroundColor = "red";
            else if (pionOrNull.getType() === "ele") platCase.getDiv().style.backgroundColor = "blue";
            else if (pionOrNull.getType() === "rocher") platCase.getDiv().style.backgroundColor = "white";
            else console.log("nu huh");
        }
    }

    affichePossibilites(tour){
        //Montre au joueur/joueuse toutes les cases où il/elle a le droit de placer le pion qu'il/elle a choisi.
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

class Interraction{

    constructor() {
        var x;
        var y;
        var i;
        for (let i = 0; i < tableCases.length; i++) {
            x = tableCases[i].getX();
            y = tableCases[i].getY();
            tableCases[i].getDiv().addEventListener("click",this.onClickEvent(x,y));
        }
        alert("should work");
    }

    onClickEvent(x,y){
        console.log("AAAAAAAAA");
        return function(){
            alert("aoeifh");
            alert(x);
            alert(y);
        };
    }


}

class Jeu{

    constructor(){
        //Le jeu est l'élément le plus global. Dès que possible, il doit déléguer les tâches à ses attributs.
        this.timer = 0;
        this.aff = new Affichage();
        this.tour = "ele";
        this.aff.placeDiv();
        this.placePieces();
        this.aff.updatePlateau();
        this.inter = new Interraction();
    }

    updatePlateau(){
        this.aff.updatePlateau();
    }

    placePieces(){
        //Génère la disposition initiale du jeu.
        var i;
        for(i=1;i<7-1;i++){
            tableCases[i].setContenu(new Pion("ryno",tableCases[i],"bas"));
            tableCases[48-i].setContenu(new Pion("ele",tableCases[48-i],"haut"));
        }
        tableCases[23].setContenu(new Pion("rocher",tableCases[23],null));
        tableCases[24].setContenu(new Pion("rocher",tableCases[24],null));
        tableCases[25].setContenu(new Pion("rocher",tableCases[25],null));
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
        //Toutes les cases obtiennent le statur inaccesible.
        tableCases.forEach(platCase => platCase.setAccessible(false));
    }

    allumePossibilites(pionChoisi){
        //Le joueur a choisi un Pion, montrons lui où il est possible de le déplacer.
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

var jeu = new Jeu();
tableCases[10].setContenu(new Pion("ele",tableCases[10],"bas"));
tableCases[17].setContenu(new Pion("ele",tableCases[17],"bas"));
jeu.updatePlateau();
jeu.allumePossibilites(tableCases[10].getContenu());
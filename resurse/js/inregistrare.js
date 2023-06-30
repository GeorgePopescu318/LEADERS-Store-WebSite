window.onload= function(){
    //la incarcarea paginii preluam formularul
    var formular=document.getElementById("form_inreg");
    if(formular){
        //daca exista, onsubmit inseamna sa apasam pe butonul de trimitere
    formular.onsubmit= function(){
        //daca valoarea parolei sunt diferite atunci returnam false, iar daca e bine returnam true
            if(document.getElementById("parl").value!=document.getElementById("rparl").value){
                alert("Nu ati introdus acelasi sir pentru campurile \"parola\" si \"reintroducere parola\".");
                return false;
            }
            return true;
        }
    }
 }
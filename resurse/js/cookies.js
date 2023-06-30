

//setCookie("a",10, 1000)
function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare)
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}`;
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    //cand afisez un cookie se vede doar cheia si valoarea ce sunt separate prin =, facem split sa despartim cookiurile intre ele 
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
        //verific daca a=10 , b=20, si luam valoarea adica 10
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
    //setam un cookie cu numele respectiv si ii pune ca data de expirare, data curenta
}

function deleteAllCokies(){
    vectorParametri=document.cookie.split(";")
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            param.split("=")[1].deleteCookie
    }
}


window.addEventListener("load", function() {

    var banner = document.getElementById("banner");

    if (getCookie("acceptat_banner")) {
        banner.style.display = "none";
    //Se ascunde banner dacă cookie-ul există
    } else {
        banner.style.display = "block";
    // Afișează elementul banner dacă cookie-ul nu există
    }

    document.getElementById("ok_cookies").onclick = function() {
        //cookieul se numeste acceptat_banner
        setCookie("acceptat_banner", true, 6000); 
        banner.style.display = "none";
    
    }
    
});

window.addEventListener("load", function() {

    let ultima_accesare=this.document.referrer;
    document.getElementById("ultima").innerHTML = ultima_accesare;
});
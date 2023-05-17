window.onload = function(){

    document.getElementById("inp-pret").onchange = function(){
        document.getElementById("infoRange").innerHTML =`(${this.value})`;
    }

    document.getElementById("filtrare").onclick = function(){
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();

        let radiobuttons = document.getElementsByName("gr_rad");
        let val_calorii;
        for ( let r of radiobuttons){
            if (r.checked) {
                val_calorii=r.value;
                break;
            }
        }
        if (val_calorii != "toate"){
            var cal_a, cal_b;
            [cal_a,cal_b] = val_calorii.split(":");
            cal_a = parseInt(cal_a);
            cal_b = parseInt(cal_b);
        }

        let val_pret = document.getElementById("inp-pret");

        let var_categ = document.getElementById("inp-categorie").value;

        var produse = document.getElementsByClassName("produs");

        for (let prod of produse){
            prod.style.display="none";  
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let cond1 = (nume.startsWith(val_nume));

            let calorii = parseInt(prod.getElementsByClassName("val-calorii")[0].innerHTML);

            let cond2 = (val_calorii == "toate" || cal_a <= calorii && cal_b > calorii);

            let pret = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML);

            let cond3 = (pret>=val_pret);

            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            let cond4 = (var_categ == "toate" || var_categ == categorie);

            if(cond1 && cond2 && cond3 && cond4){
                prod.style.display="block";
            }
        }
    }

    window.onkeydown = function(e){
        if (e.key == 'c' && e.altKey){
            if (document.getElementById("info-suma"))
                return;     
            var produse = document.getElementsByClassName("produs");
            let suma = 0;
            for (let prod of produse){
                if (prod.style.display != "none"){
                    let pret = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    suma += pret;
                }
            }
            let p = document.createElement("p");
            p.innerHTML = suma;
            if (document.getElementById)
            p.id = "info-suma";
            ps = document.getElementById("p-suma");
            container = ps.parentNode;
            frate = ps.nextElementSibling;
            container.insertBefore(p,frate);
            setTimeout(function(){
                let info = document.getElementById("info-suma");
                if (info)
                    info.remove;
            }, 1000);
        }
    }

}




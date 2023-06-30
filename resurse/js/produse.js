window.addEventListener("load", function() {
    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];

    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true;
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    let checkboxuri= document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];

            if( this.checked){
                iduriProduse.push(this.value)
            }
            else{
                let poz= iduriProduse.indexOf(this.value);
                if(poz != -1){
                    iduriProduse.slice(poz,1);
                }
            }
            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }
    }


    document.getElementById("inp-pretlow").onchange=function() {
        document.getElementById("infoRangelow").innerHTML=`(${this.value})`;
    }

    document.getElementById("inp-prethigh").onchange=function() {
        document.getElementById("infoRangehigh").innerHTML=`(${this.value})`;
    }
    
    function normalizeText(text) {
        var map = {
            'ă': 'a',
            'â': 'a',
            'î': 'i',
            'ș': 's',
            'ț': 't',
            'ȃ': 'a',
            'ȋ': 'i',
            'ș': 's',
            'ț': 't',
        };
        return text.replace(/[ăâîșțȃȋșț]/g, function(match) {
            return map[match];
        });
    }
    
    document.getElementById("filtrare").onclick=function() {
        var counter=0;
        let val_nume=normalizeText(document.getElementById("inp-nume").value.toLowerCase());
        if (val_nume.includes("*")){
            val_nume.split('*')
        }
        let val_cuvant=normalizeText(document.getElementById("inp-cuvant").value.toLowerCase());
        let radioButtons=document.getElementsByName("gr_rad");
        let val_produ_disp;
        
        for(let r of radioButtons) {
            if(r.checked) {
                val_produ_disp=r.value;
                break;
            }
        }

        let val_culoare = [];
        if(document.getElementById("orice").checked){
            val_culoare = document.getElementById("orice").value;
        }
        else{
        if(document.getElementById("alb").checked)
        val_culoare.push(document.getElementById("alb").value)
        if(document.getElementById("albastru").checked)
        val_culoare.push(document.getElementById("albastru").value)
        if(document.getElementById("verde").checked)
        val_culoare.push(document.getElementById("verde").value)
        }
        console.log(val_culoare);
        var nr_a, nr_b;
        if(val_produ_disp!="toate") {
            [nr_a, nr_b]=val_produ_disp.split(":");
            nr_a=parseInt(nr_a);
            nr_b=parseInt(nr_b);
        }
        
        let val_pretlow=document.getElementById("inp-pretlow").value;
        let val_prethigh=document.getElementById("inp-prethigh").value;

        let val_material=document.getElementById("inp-material").value;
        var val_categoriem = []
        val_categoriem = document.getElementById("inp-categoriem").value;
        // var selectedOptions = Array.from(val_categoriem,selectedOptions);
        // var selectedValuesCategoriem = selectedOptions.map(option => option.value);

        let val_de_spalat=document.getElementById("inp-de_spalat").value;
        var produse=document.getElementsByClassName("produs");
        for(let prod of produse) {      
            prod.style.display="none";
            let nume=prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let cond1=(nume.startsWith(val_nume[0]) && nume.endsWith(val_nume[1])||nume == "" || nume == val_nume || nume.startsWith(val_nume));
            //cond1 merge
            let produ_disp=parseInt(prod.getElementsByClassName("val-produ_disp")[0].innerHTML);
            let cond2=(val_produ_disp=="toate" || nr_a<=produ_disp && nr_b>=produ_disp);
            //cond2 merge
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.toLowerCase());
            let cond3=(pret >= val_pretlow && pret <= val_prethigh);

            let material=prod.getElementsByClassName("val-material")[0].innerHTML;
            let cond4=(val_material=="toate" || val_material==material || val_material=="");
            // console.log("mat" + material)
            // console.log("val" + val_material)
            // console.log(cond4)

            let de_spalat=prod.getElementsByClassName("val-de_spalat")[0].innerHTML.slice(-2);

            if(de_spalat == "da")
            de_spalat="true";
            else if(de_spalat=="nu")
            de_spalat="false";

            let cond5=(val_de_spalat=="toate" || val_de_spalat==de_spalat);
            // console.log("mat" + de_spalat)
            // console.log("val" + val_de_spalat)
            // console.log(cond5)
            let culoare = prod.getElementsByClassName("val-culoare")[0].innerHTML.toLowerCase().trimStart();
            let cond0 = (val_culoare == "orice" || val_culoare.includes(culoare) || val_culoare == culoare || val_culoare == "");
            //cond0 merge
            let categoriem=prod.getElementsByClassName("val-categorie")[0].innerHTML.toLowerCase().trimStart();
            let cond6=(categoriem == val_categoriem || val_categoriem == "" || val_categoriem == "toate");
            //cond6 merge
            // console.log("val")
            // console.log(val_categoriem)
            // console.log("categ")
            // console.log(categoriem)
            // console.log(cond6)
            // if(selectedValuesCategoriem[0]=="toate")
            //     cond6=true;
            // else {
            //     for(var i=0;i<selectedValuesCategoriem.length;i++) {
            //         console.log(selectedValuesCategoriem[i])
            //         if(selectedValuesCategoriem[i]==categoriem) {
            //             cond6=true;
            //             break;
            //         }
            //     }
            // }
            // console.log(cond6)
            // console.log(selectedValuesCategoriem[0])
            // console.log(categoriem)

           
             

            let descriere=prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            let cond7=(descriere.includes(val_cuvant) || val_cuvant=="");
            //cond7 merge
            if(cond0 && cond1 && cond2 && cond6 && cond7) {
                counter++;  
                console.log(counter)
                prod.style.display="block";
            }
            
            
            if( counter < 1)
            {
                console.log(counter)
                let p="Nu avem produse de afisat!";
                document.getElementById("demo").innerHTML = p;
            }
        }
        afisareFiltre();
    }

    let filtrareInputs = document.querySelectorAll('#inp-nume, #inp-categoriem, [name="gr_rad"], #inp-cuvant, #inp-material, #inp-de_spalat, #i_rad4, #infoRangelow, #infoRangehigh');
    for(let filtru of filtrareInputs) {
            filtru.onchange = document.getElementById("filtrare").onclick;
        }
    document.getElementById("resetare").onclick= function(){
        document.getElementById("inp-nume").value="";
        document.getElementById("inp-cuvant").value="";
        document.getElementById("inp-pretlow").value=document.getElementById("inp-pretlow").min;
        document.getElementById("inp-prethigh").value=document.getElementById("inp-prethigh").min;
        document.getElementById("inp-material").value="toate";
        document.getElementById("inp-categoriem").value="toate";
        document.getElementById("inp-de_spalat").value="toate";
        document.getElementById("i_rad4").checked=true;
        document.getElementById("infoRangelow").innerHTML="(0)";
        document.getElementById("infoRangehigh").innerHTML="(0)";
        document.getElementById("orice").checked=false;
        document.getElementById("alb").checked=false;
        document.getElementById("verde").checked=false;
        document.getElementById("albastru").checked=false;
        var produse=document.getElementsByClassName("produs");

        for (let prod of produse)
            prod.style.display="block";
    };
    
    function sortare(semn){
        var produse=document.getElementsByClassName("produs");
        var v_produse= Array.from(produse);
        v_produse.sort(function (a,b){
            let nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
            let nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
            if(nume_a==nume_b){
                let lungime_a= parseInt(a.getElementsByClassName("val-descriere")[0].innerHTML).length;
                let lungime_b= parseInt(b.getElementsByClassName("val-descriere")[0].innerHTML).length;
                return semn*(lungime_a-lungime_b);
            }
            return semn*nume_a.localeCompare(nume_b);
        });
        for(let prod of v_produse){
            prod.parentElement.appendChild(prod);
        }
    }
    document.getElementById("sortCrescNume").onclick=function(){
        sortare(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sortare(-1);
    }

    document.getElementById("btnSortare").onclick = function() {
        var cheie1 = document.getElementById("selectCheie1").value;
        var cheie2 = document.getElementById("selectCheie2").value;
        var ordine = document.getElementById("selectOrdine").value;

        var semn = 1;
        if (ordine === "descrescator") {
          semn = -1;
        }
        
        sortare_dinamica(semn, cheie1, cheie2);
      }

    function sortare_dinamica(semn, cheie1, cheie2) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);

        v_produse.sort(function(a, b) {
          var val_a = a.getElementsByClassName("val-" + cheie1)[0].innerHTML;
          var val_b = b.getElementsByClassName("val-" + cheie1)[0].innerHTML;

            if (cheie1 == "pret" & val_a != val_b){
                val_a = parseFloat(val_a);
                val_b = parseFloat(val_b);
                return(semn * (val_a-val_b));
            }

          if (val_a == val_b) {
            val_a = a.getElementsByClassName("val-" + cheie2)[0].innerHTML;
            val_b = b.getElementsByClassName("val-" + cheie2)[0].innerHTML;
          }

          if(cheie1 != "pret"){
            return semn * (val_a.localeCompare(val_b));
          }

          if (cheie1 == "pret" & cheie2 != "pret"){
            return semn * (val_a.localeCompare(val_b));
          }
          
          if (cheie1 == "pret" || cheie2 == "pret") {
            val_a = parseFloat(val_a);
            val_b = parseFloat(val_b);
            if (val_a != val_b){
            return(semn * (val_a-val_b))
        }
          }
            return semn * (val_a.localeCompare(val_b));
        });

        for (var i = 0; i < v_produse.length; i++) {
          v_produse[i].parentElement.appendChild(v_produse[i]);
        }
    } 
    
    function celMaiScump() {
        var maxim = -1;
        var produse=document.getElementsByClassName("produs");
        for(let prod of produse) {
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.toLowerCase());
            if(pret>maxim)
                maxim=pret;
        }
        return maxim;
    }

    function celMaiIeftin() {
        var minim = Infinity;
        var produse=document.getElementsByClassName("produs");
        for(let prod of produse) {
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.toLowerCase());
            if(pret<minim)
                minim=pret;
        }
        return minim;
    }

    function celMaiCel(semn) {
        var produse=document.getElementsByClassName("produs");
        var fieMaiMareFieMaiMic=0;
        if(semn>0) 
            fieMaiMareFieMaiMic=celMaiIeftin();
        else fieMaiMareFieMaiMic=celMaiScump();

        for(let prod of produse) {
            prod.style.display="none";
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.toLowerCase());
            if(semn>0) {
                if(pret == fieMaiMareFieMaiMic) {
                    prod.style.display="block";
                }
            } else {
                if(pret == fieMaiMareFieMaiMic) {
                    prod.style.display="block";
                }
            }
        }
    }

    document.getElementById("ieftin").onclick=function() {
        celMaiCel(1);
    }

    document.getElementById("scump").onclick=function() {
        celMaiCel(-1);
    }

    this.document.getElementById("sumaproduselor").onclick=function(){
        if(document.getElementById("info-suma"))
            return;
        var produse=document.getElementsByClassName("produs");
        let suma=0;
        for (let prod of produse){
            if(prod.style.display!="none") {
                let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                suma+=pret;
            }
        }
        let p=document.createElement("p");
        p.innerHTML="Suma produselor afisate este de " + suma + "RON.";
        p.id="info-suma";
        ps=document.getElementById("sumaproduselor");
        container = ps.parentNode;
        frate=ps.nextElementSibling
        container.insertBefore(p, frate);
        setTimeout(function(){
            let info=document.getElementById("info-suma");
            if(info)
                info.remove();
            }, 2000);
    }

    document.getElementById("btn-inp-categoriem").onclick=function() {
        var categoriem = document.getElementById("inp-categoriem");
        var butoncategoriem=document.getElementById("btn-inp-categoriem");
        if (categoriem.style.display === "none") {
            categoriem.style.display = "block";
            butoncategoriem.innerHTML="Ascunde";
        } else {
            categoriem.style.display = "none";
            butoncategoriem.innerHTML="Arata";
        }
      }

      function afisareFiltre() {
        var button = document.getElementById('filtre');
        var form = document.querySelector('form');
      
          if (form.style.display === 'none') {
              button.innerHTML="Ascunde filtre";
            form.style.display = 'block';
        } else {
              button.innerHTML="Afiseaza filtre";
            form.style.display = 'none';
          }
      }

      document.getElementById("filtre").onclick=function() {
            afisareFiltre();
      }
});
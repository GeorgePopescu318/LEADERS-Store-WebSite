   /**
      * @typedef {string} n - numarul de caractere al token-ului generat
      * @property {string} init - tipul de conexiune ("init", "render" etc.)
      * 
     * /

     /**
      * Returneaza un token
      *
      * @param {n} un token cu n caractere
      * @returns {genereazaToken}
      */

     sirAlphaNum="";
     v_intervale=[[48,57],[65,90],[97,122]]
     //iteram prin fiecare interval
     for(let interval of v_intervale){
         //de la stanga la dreapta
         for(let i=interval[0]; i<=interval[1]; i++)
             //concatenam toate caracterele care pot sa apara 
             sirAlphaNum+=String.fromCharCode(i)
             //aici tranformam din cod ascii in litere
     }
     
     console.log(sirAlphaNum);
     
     function genereazaToken(n){
         let token=""
         //pentru fiecare caracter luam generam un toke random, inmultim numarul random dintre 0 si 1 cu lungimea vectorului, niciodata nu o sa fie lungimea vectorului
         for (let i=0;i<n; i++){
         //concatenam de n ori
             token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]
         }
         return token;
     }
     //ia dintr un sir in mod aleator cate un caracter si pune in token
     
     module.exports.genereazaToken=genereazaToken;
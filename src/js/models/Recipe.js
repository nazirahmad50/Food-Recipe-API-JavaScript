import axios from "axios";

export default class Recipe{
    constructor(id){

        this.id = id; // each recipe identified by id
    }

    async getRecipe (){
        try{
            const apiKey = "148bf047e0281698691ac94df4a13a9c";
            const corsProxy = "http://cors-anywhere.herokuapp.com/";

            const res = await axios(`${corsProxy}https://www.food2fork.com/api/get?key=${apiKey}&rId=${this.id}`); //this wil lreturn a promise

            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;

        }catch(err){
        console.log(err);
    }
    }

    calcTime() {
        // Assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients(){

        const unitsLong = ["tablespoons","tablespoon", "ounce", "ounces", "teaspoon", "teaspoons", "cups", "pounds"]; // the way it appears in the api recipe
        const unitsShort = ["tbsp", "tbsp", "oz", "oz", "tsp", "tsp", "c", "pound"]; // the way we want it to appear


        // use map to loop through the ingredients and set it to const 'newIngredients'
        const newIngredients = this.ingredients.map(el =>{
            //---- 1. Uniform Units
            let ingredient = el.toLowerCase();

            // replace all the long ingreedients units with short units
            unitsLong.forEach((unit, i) =>{ 
                
                ingredient = ingredient.replace(unit, unitsShort[i])
            });
           
            //----- 2. Remove Parentheses
            ingredient = ingredient.replace(/["'()]/g, " ")

            //---- 3. Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(" ");
            // for each of the elemetns in the arrImg array check if that element is included in 'unitsShort' array
           // and it return an index of that position 
            const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));

            let objIng;
            // '-1' means it coudlnt find anything
            // so if its more than -1 that means it found something
            if (unitIndex > -1){
                // Ex. 4 1/2, arrCount will be [4, 1/2]
                // Ex. 4 cups, arrCount will be [4]
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1){ // if there is one element in arrCount
                    //replace the - with + and evaluate it
                    count = eval(arrIng[0]); // set the count to that 1st element from arrIng
                }else{
                    // 'eval' will evaluate the string as javascript and caluclate it
                    // eval("4+1/2") = 4.5
                    count = eval(arrIng.slice(0, unitIndex).join("+").replace("-", "+"));
                }

                objIng = {
                    count,
                    unit:arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(" ")
                };

            }else if (parseInt(arrIng[0], 10)){ // there is no unit but there is a number in 1st postion
                objIng = {
                    count:parseInt(arrIng[0], 10),
                    unit:"",
                    ingredient: arrIng.slice(1).join(" ")
                };
            }
            
            else if(unitIndex === -1){ // There is no unit found and no number is 1st postion

                objIng = {
                    count:1,
                    unit:"",
                    ingredient // get the all ingredients
                }
            }

            return objIng; // for map we have to return soemthing for each iteration

        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}
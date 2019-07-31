//THIS IS CONTROLLER
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';


/** Global state of app
 * -Search Object
 * Current recipe object
 * shopping list object
 * liked recipes
 */
const state = {};

// SEARCH CONTROLLER
const controlSearch = async ()=>{
    //1. Get query from View
    const query = searchView.getInput();

    if (query){ // if there is query

        //2. new search object and add to state
        state.search = new Search(query);

        //3. Prepare UI for for results
        searchView.clearInput();
        searchView.clearRenderResults();
        renderLoader(elements.searchResultForLoader);
        

        //4. search for recipes
        await state.search.getResult(); // this returns a promise so we await it

        //5. render results on UI
        searchView.renderResults(state.search.result);
        clearLoader();
        console.log(state.search.result)


    }

}


elements.searchForm.addEventListener("submit", ev =>{
    ev.preventDefault(); // stops the page from reloading when we click teh search button

    controlSearch();
})

elements.searchResPages.addEventListener("click", e =>{

    // get the closest ancestor of the event target we click on
    const btn = e.target.closest(".btn-inline");

    if (btn){
        // when ever we add an attribute called data in html then its stored in the 'dataset'
        // the 'goto' is the name we gave after the data, e.g. 'data-goto'
        const goToPage = parseInt(btn.dataset.goto, 10); // second param is the base type
        
        searchView.clearRenderResults(); // clear both the recipe results and the buttons

        searchView.renderResults(state.search.result, goToPage); // show the results and the pagination buttons


    }

});


// RECIPE CONTROLLER
const controlRecipe = async ()=>{

    // 'window.location' is the entire url and we get is the hash property from the url
    const id = window.location.hash.replace("#", ""); // replace the hash symbol with nothing

    if (id){

        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try{
        
         // Get recipe data
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        // Clculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //Render Recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
        );


        }catch(er){
            console.log(er);
        }
       
    }
};

// 'window' is the global object in browser
// this event takes place when ever we change the hash in the url
window.addEventListener("hashchange", controlRecipe);
window.addEventListener("load", controlRecipe); // when the page loads it will still work on the id

/** 
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/** 
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});
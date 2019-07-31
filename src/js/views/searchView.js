import {elements} from './base';

export const getInput = ()=> elements.searchInput.value;
export const clearInput = ()=> {elements.searchInput.value = ""};
export const clearRenderResults = ()=> {
    elements.searchResultList.innerHTML = "";
    elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
};

export const limitRecipeTitle = (title, limit = 17) =>{ // default limit is 17

    const newTitle = []; //empty array

    if (title.length > limit){
       
        // splits the title at spaces, so whereever there is a space it splits it
        // The 'reduce' method reduces the array to a single value
        // te 'reducer' take accumelator and current value as params in its callback func
        title.split(" ").reduce((acc,cur) =>{
            if (acc + cur.length <= limit){
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);

        // so if the length of the title is more than limit then return the ttile with '...'
        return `${newTitle.join(" ")}...`; // 'join' is opposite of split
    }
    // if title is less than limit then just return that title
    return title;
};

const createButtons = (page, type) => // without the brackets it means we are returning the code inside the func
    `   
        <button class="btn-inline results__btn--${type}" data-goto= ${type === "prev" ? page -1 : page + 1}>
            <span>Page ${type === "prev" ? page -1 : page + 1}</span>
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === "prev" ? "left" : "right"}"></use>
            </svg>
        </button>
       
        `;


const renderButtons = (page, numResults, resPerPage)=>{

    //calculate how many pages there are
    const pages = Math.ceil(numResults / resPerPage);

    let button;

    if (page === 1 && pages > 1){ // if we are on page and there are more than 1 pages
        button = createButtons(page,"next");
    }else if (page < pages){ // were on the middle page

        button = `
        ${createButtons(page,"prev")}
        ${createButtons(page,"next")}
        `;
        
    }
    else if (page === pages && pages > 1){ // were on the last page and there are more than 1 page
        button = createButtons(page,"prev");
    }

    elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) =>{ 

    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    // 'recipes' param will hold an array of recipes so we loop through each of those recipes
    recipes.slice(start,end) .forEach(el =>{

        const markup = `
        <li>
        <a class="results__link results__link--active" href="#${el.recipe_id}">
            <figure class="results__fig">
                <img src="${el.image_url}" alt="${el.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(el.title)}</h4>
                <p class="results__author">${el.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResultList.insertAdjacentHTML("beforeend", markup);
    });

    renderButtons(page, recipes.length, resPerPage);

};




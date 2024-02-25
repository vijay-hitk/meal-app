const searchBtn = document.getElementById("search-btn");
const inputBox = document.getElementById("Search-input");
const suggestBox = document.querySelector(".suggest-box");
const mealList = document.getElementById("meal");
const mealDetailsContent = document.querySelector(".meal-details-content");
const recipeCloseBtn = document.getElementById("recipe-close-btn");



//Event Listeners
searchBtn.addEventListener('click',getMealList);
mealList.addEventListener('click',getMealRecipe);
recipeCloseBtn.addEventListener('click',closeRecipe);
// inputBox.addEventListener('keyUp',filterSuggestions);




// its fetch meals from api and return it
async function fetchMealsFromApi(url,value) {
    const response=await fetch(`${url+value}`);
    const meals=await response.json();
    return meals;
}


//Get meal list that matches with the ingredients
 function getMealList(){

    let searchInputTxt = document.getElementById("Search-input").value;
    console.log(searchInputTxt);
    
    //include https:// mandatory to fetch.
    //use within string literals for variables.
    let url="https://www.themealdb.com/api/json/v1/1/search.php?s=";
    let x=fetchMealsFromApi(url,searchInputTxt);
    x.then(data => {
        // console.log(data);
        let html = "";
        if(data.meals){
           //here meal represent each item of meals array.
           //idMeal , strMealThumb , strMeal are from api 
            data.meals.forEach(meal => {
                html += `
                    <div class="meal-item" data-id="${meal.idMeal}"> 
                    <button data-id="${meal.idMeal} id="fav" class="favorite-btn }" >+</button>

                    <div class="meal-img">
                        <img src="${meal.strMealThumb}" alt="food">
                    </div>
                    <div class="meal-name">
                        <h4>${meal.strMeal}</h4>
                        <a href="#" class="recipe-btn">Get Recipe</a>
                    </div>
                        </div> 
                    `;
                
            });
            mealList.classList.remove("notFound");
        }
        else {
            html = `Sorry, We did not find any meal!`
            mealList.classList.add("notFound");
        }
        mealList.innerHTML = html;
    })
   
  
    .catch(function(error){
        console.log('error',error);
    })
}

//get recipe of the meal 
function getMealRecipe(event){
    event.preventDefault();

    //when favorite button is clicked
    if(event.target.classList.contains("favorite-btn")){
        // console.log("click");
        if(event.target.classList.contains("is-fav")){
            //remove the class
            event.target.classList.remove("is-fav");
            event.target.textContent = '+'
           
          }else{

            //add the class
            event.target.classList.add("is-fav");
            event.target.textContent = '-'
            console.log(event.target.parentElement);

            const cardBody = event.target.parentElement;
            //getting meal information
            const mealInfo={
                id : event.target.dataset.id.slice(0,5),
                name : cardBody.querySelector('h4').textContent,
                image : cardBody.querySelector('img').src,
            }
           console.log(mealInfo);

           //Adding to local Storage
           saveIntoDB(mealInfo);
        }
    }

    //when recipe button is clicked
    // console.log(event.target); gives the target element which is clicked
    if(event.target.classList.contains("recipe-btn")){
        let mealItem = event.target.parentElement.parentElement;
        console.log(mealItem);
        console.log(mealItem.dataset.id);
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            mealRecipeModal(data.meals);

        })

    }

    //when remove button is clicked in favorites
    if(event.target.classList.contains('remove-recipe')){
        //removing from DOM
        event.target.parentElement.remove();

        //removing from DB
        let meals = getFromDB();
        meals.forEach((meal,i) => {
            if(event.target.dataset.id === meal.id){
                meals.splice(i,1);
            }
        })
        console.log("length in meals",meals.length);

        localStorage.setItem('meals' ,JSON.stringify(meals)); //object to JSON String
       
      
       
    }
}




//save the recipe into local storage
function saveIntoDB(meal){
//    console.log("save",meal);
    const meals = getFromDB();
    
    meals.push(meal);
    localStorage.setItem('meals',JSON.stringify(meals)); // object to json string

    

}


//get meals from local storage
function getFromDB(){
    let meals;
    //check from local storage 
    if(localStorage.getItem('meals') === null){
        meals = [];
       
    }else {
        meals = JSON.parse(localStorage.getItem('meals')); //json string to js object
    }
    return meals ;
  
}

// when favorite button is clicked
function showFavorite(){

    let meals = getFromDB();
    console.log(meals);

    let html = "";
    if(meals){
       //here meal represent each item of meals array.
       //id , image , name are from object stored in local storage. 
       meals.forEach(meal => {
            html += `
                <div class="meal-item" data-id="${meal.id}"> 
                <button data-id="${meal.id}" id="fav" class=" favorite-btn is-fav remove-recipe">-</button>

                <div class="meal-img">
                    <img src="${meal.image}" alt="food">
                </div>
                <div class="meal-name"> 
                    <h4>${meal.name}</h4>
                    <a href="#" class="recipe-btn">Get Recipe</a>
                </div>
                    </div> 
                `;
                console.log(meals.id);
            
        });
        mealList.classList.remove("notFound");
    }
    if(meals.length == 0) {
        html = `Sorry, We did not find any favorite meal!`
        mealList.classList.add("notFound");
    }
    mealList.innerHTML = html;
}










//create a mealRecipeModal function

function mealRecipeModal(meal){
    meal = meal[0];
    let html = `         <h2 class="recipe-title">${meal.strMeal}</h2>
    <p class="recipe-category">${meal.strCategory}</p>
    <div class="recipe-instruct">
        <h3>Instructions:-</h3>
        <p>${meal.strInstructions}</p>
    </div>
    <div class="recipe-meal-img">
        <img src="${meal.strMealThumb}" alt="food">
    </div>
    <div class="recipe-link">
        <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
    </div> `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add("showRecipe");

}

function closeRecipe(){
    mealDetailsContent.parentElement.classList.remove("showRecipe");

}


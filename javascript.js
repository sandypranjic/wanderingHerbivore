/* 
Documentation for my API can be found here: https://developers.zomato.com/documentation#/

The purpose of my API project is to allow the user to input any city in the world and find a list of restaurants that offer plant-based options on their menu. I used the Zomato API, so the search results for cities entirely depends on a) if Zomato has information on that particular city, and b) if users of the Zomato website have submitted information regarding restaurants and their plant-based menu offerings. While for the most part the Zomato API offers really good results, there are some gaps in the ability to search for very common travel destinations (like Paris, France for example). 

The beginning of the JavaScript starts with a namespace I created called veganApp to easily organize the rest of my code. The document ready is called, and calls the veganApp.init() function. The first thing the init() does is an event listener on the form that waits for the user to submit a city. The .mainContainer in the HTML was hidden prior to this because I wanted the homepage to be a full-bleed layout that didn't initally scroll, but the submit event removes the class on the .mainContainer that had "display: none" on it. Next, the page automatically scrolls down to the main section. 

The city that the user searched for is contained in a variable called citySearch and is generated from the value of the input. Then, as long as the search wasn't an empty string (determined with an if statement), the variable citySearch is passed as an arguement to a function called veganApp.getAllCityOptions(). 

veganApp.getAllCityOptions() is a function that makes the first call to the Zomato API and takes an argument called cityQuery. The value of cityQuery is whatever city the user searched. This returns an object that has an array in it called location_suggestions, and each item in the array has information about the individual city (name, id, country id, etc). The data that is returned from the API call is passed as an argument to a function called veganApp.displayAllCityOptions. 

The function displayAllCityOptions() takes the location_suggestions array and reiterates through each item using forEach(). If the Zomato API has data about the city search, the name of each city is appended as individual list items into an unordered list called .cityResultsList. If the Zomato API does not have any suggestions for the search term, a span is appended instead that tells the user there's no information on it. One important detail to mention is that the Zomato API can also make inquiries using the city's ID (just a random number assigned to them by Zomato's documentation), and this is much more accurate than searching by city name. Each list item with a location suggestion also has the city's assigned ID as the value of the li. This is helpful to the user if they search for a city name that exists in more than one place (for example, London, England vs London, Ontario).

After this, there is an event listener that waits for the user to click one of the list items. The value of the list item (the city's ID) is passed into a function called veganApp.searchVeganOptions(). For example, Toronto, Ontario has an id of 89, which is also the value of the list item that contains "Toronto, ON". If the user clicks Toronto, ON, 89 is passed as an argument to the searchVeganOptions() function. 

The searchVeganOptions() function is another API call to Zomato that takes the id, and uses that to search the API, and also takes a query parameter that searches for the word "vegan" anywhere in the city's data. By using the Zomato website and also checking what data I was able to return, I found that within the individual city object, there's an array called "highlights" that will show if the restaurant has "vegan options". This returns me a list of all the restaurants with customer-submitted information as to whether or not a place has plant-based food available, and each restaurant is appeneded into a div.

I came into an issue when appending the highlights of each restaurant into the div, because I wanted to make sure each individual highlight was a list item in an unordered list. I knew it would be easy to just display the results as a span in a div and style it to make it look like a list, but it would be semantically incorrect. However, nesting a for loop inside of the forEach() was reiterating through ALL of the highlights in the entire object (meaning all the restaurants) and appending all of them under every individual restaurant. I had to give the ul containing the highlists a class of whatever the index of the restaurant was in the array. I then used an if statement to check that if the highlights ul had a class that was the same as the index of the restaurant in the array, then it would append. 

Things I will be improving:

- I'm going to make a mobile version of the website using media queries
*/

const veganApp = {};
veganApp.baseUrl = "https://developers.zomato.com/api/v2.1/";

$(window).scroll(function() {    
    let scroll = $(window).scrollTop();
    let windowHeight = $(window).height(); 
    if (scroll >= windowHeight) {
        $(".scroll").addClass("scrollChange");
        $(".scroll2").addClass("scrollChange2");
        $(".logo").addClass("logoChange");
    } else {
        $(".scroll").removeClass("scrollChange");
        $(".scroll2").removeClass("scrollChange2");
        $(".logo").removeClass("logoChange");
    }
});

veganApp.getAllCityOptions = function(cityQuery) {
    $.ajax({
        url: `${veganApp.baseUrl}cities?q=${cityQuery}`,
        method: "GET",
        dataType: "json",
        data: {
            q: `${cityQuery}`
        },
        headers: {
            "user-key": "df84a2663f5bd9345448ce4934d4e03b",
        }
    }).then(function(allCityOptions) {
        console.log(allCityOptions);
        veganApp.displayAllCityOptions(allCityOptions);
    });
};

veganApp.displayAllCityOptions = function(data) {
    data.location_suggestions.forEach(function(cityOption) {
        const cityResultsHtml = `
        <li value="${cityOption.id}">${cityOption.name}</li>
        `;
        $(".cityResultsList").append(cityResultsHtml);
    });
    if (data.location_suggestions.length == 0) {
        console.log("We don't have any info on the location you entered.");
        const noCityResultsHtml = `
            <span class="noCityResults">We don't have any info on the location you entered.</span>
        `;
        $(".cityResultsList").append(noCityResultsHtml);
    };
};

$("ul").on("click", "li", function() {
    $(".listOfRestaurants").empty();
    let id = $(this).val();
    let cityId = parseInt(id);
    veganApp.searchVeganOptions(cityId);
});

veganApp.searchVeganOptions = function(cityId) {
    $.ajax({
        url: `${veganApp.baseUrl}search?entity_id=${cityId}&entity_type=city&q=vegan`,
        method: "GET",
        dataType: "json",
        data: {
            q: "vegan"
        },
        headers: {
            "user-key": "df84a2663f5bd9345448ce4934d4e03b",
        }
    }).then(function(veganOptionsInCity) {
        veganApp.displayRestaurants(veganOptionsInCity);
    });
};

veganApp.displayRestaurants = function(data) {
    console.log(data.restaurants);
    data.restaurants.forEach(function(restaurantOption, index) {
        const restaurantHtml = `
        <div class="restaurantResult">
            <h4>${restaurantOption.restaurant.name}</h4>
            <span class="restaurantAddress"><i class="fas fa-map-marker-alt"></i> ${restaurantOption.restaurant.location.address}</span>
            <span class="restaurantPhone"><i class="fas fa-phone-square"></i> ${restaurantOption.restaurant.phone_numbers}</span>
            <span class="cuisines">Cuisines: ${restaurantOption.restaurant.cuisines}</span>
            <span class="restaurantMenu"><a href="${restaurantOption.restaurant.menu_url}" target="blank">See the menu <i class="fas fa-external-link-alt"></i></a></span>
            <ul class="restaurantHighlights ${index}">
            </ul>
        </div>
        `;
        $(".listOfRestaurants").append(restaurantHtml);
        if ($(".restaurantHighlights").hasClass(index) == true) {
            for (let i = 0; i < restaurantOption.restaurant.highlights.length; i++) {
                const highlightsHtml = `
                <li>${restaurantOption.restaurant.highlights[i]}</li>
                `;
                $(`.${index}`).append(highlightsHtml);
            };
        };            
    });
    if (data.restaurants.length == 0) {
        console.log("We can't find any vegan options in the city you entered.");
        const noResults = `<span class="noResults">We can't find any vegan options in the city you entered.</span>`;
        $(".listOfRestaurants").append(noResults);
    };
    $(".restaurants").removeClass("restaurantsHidden");
    $('html, body').animate({
        scrollTop: $(".restaurants").offset().top
    }, 1000);
};


veganApp.init = function() {
    $("form").on("submit", function(event) {
        event.preventDefault();
        $(".mainContainer").removeClass("mainContainerHidden");
        $('html, body').animate({
            scrollTop: $("main").offset().top
        }, 1000);
        const citySearch = $("input").val();
        if (citySearch !== "") {
            $(".resultHighlights").empty();
            $(".cityResultsList").empty();
            $(".listOfRestaurants").empty();
            veganApp.getAllCityOptions(citySearch);
        };
        if ($(".restaurants").hasClass("restaurantsHidden") == false) {
            $(".restaurants").addClass("restaurantsHidden");
        };
    });
};

$(function() {
    veganApp.init();
});
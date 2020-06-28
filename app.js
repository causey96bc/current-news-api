
const baseUrl = 'https://api.currentsapi.services/v1'
const dataPoints = {
    news: "latest-news",
    search: "search",
}
const languagesURL = 'available/languages'

const categoriesURL = "available/categories"
const regionsURL = "available/regions"




const { news, search } = dataPoints
const apiKey = 'apiKey=Bo7hfZr-BH4zac2-R6ItXfXwy6edgox_pFZVH-WQfut_eYNO'
let urlStartDate = 'start_date=YYYY-MM-DD'
let urlEndDate = 'end_date=YYYY-MM-DD'
let newClassURL
let pageNumber = 1
let newURL
let categorySearchQuery




async function fetchAllCategories() {
    const categoryURL = `${baseUrl}/${categoriesURL}?${apiKey}`
    if (localStorage.getItem("categories")) {
        return JSON.parse(localStorage.getItem("categories"));
    }
    try {
        const response = await fetch(categoryURL);
        const { categories } = await response.json();
        localStorage.setItem("categories", JSON.stringify(categories));
        console.log(categories)
        return categories;
    } catch (error) {
        console.error(error);
    }
}

// fetchAllCategories(category).then(x => console.log(x))

async function fetchAllLanguages() {

    const languageURL = `${baseUrl}/${languagesURL}?${apiKey}`
    if (localStorage.getItem("languages")) {
        return JSON.parse(localStorage.getItem("languages"));
    }
    try {
        const response = await fetch(languageURL);
        const { languages } = await response.json();
        localStorage.setItem("languages", JSON.stringify(languages));
        console.log(languages)
        return languages;
    } catch (error) {
        console.error(error);
    }
}



async function fetchAllRegions() {
    const regionURL = `${baseUrl}/${regionsURL}?${apiKey}`
    if (localStorage.getItem("regions")) {
        return JSON.parse(localStorage.getItem("regions"));
    }
    try {
        const response = await fetch(regionURL);
        const { regions } = await response.json();
        localStorage.setItem("regions", JSON.stringify(regions));
        console.log(regions)
        return regions;
    } catch (error) {
        console.error(error);
    }
}
async function fetchAllLists() {
    try {
        const [categories, regions, languages] = await Promise.all([
            fetchAllCategories(), fetchAllRegions(), fetchAllLanguages(),

        ]);
        $(".categories-count").text(`(${categories.length})`);

        categories.forEach(category => {
            let categoryHtml = $(`<option value="${category}">${category}</option>`);
            $("#select-categories").append(categoryHtml);

        });



        const regionArray = Object.entries(regions)
        $(".regions-count").text(`(${regionArray.length})`);
        regionArray.forEach((region) => {
            let key = region[0]
            let value = region[1]
            let regionsHtml = $(`<option value="${value}">${key}</option>
        
          `);
            $("#select-regions").append(regionsHtml);
        });

        const languageArray = Object.entries(languages)
        $(".languages-count").text(`(${languageArray.length})`);

        languageArray.forEach((language) => {
            let key = language[0]
            let value = language[1]
            let languagesHtml = $(`<option value="${value}">${key}</option>
        
          `);
            $("#select-languages").append(languagesHtml);
        });

    }
    catch (error) {
        console.error(error)

    }
}





function buildSearchString() {
    categorySearchQuery = {
        category: $("#select-categories").val(),
        country: $("#select-regions").val(),
        language: $("#select-languages").val(),



    };

    let keyword = $("#keywords").val()
    let startDate = $("#current-news-date").val()
    let endDate = $("#end-news-date").val()
    console.log("grab the motherfucker", categorySearchQuery)

    let searchQuery = Object.entries(categorySearchQuery)
        .map(function (line) {
            if (line != '') {
                return line.join("=");
            }
        })
        .join("&");

    console.log("query is here", searchQuery)
    if (keyword !== "") {

        newClassURL = `${baseUrl}/search?keyword=${keyword}&${apiKey}&start_date=${startDate}&end_date=${endDate}&page_number=1`
        newURL = `${baseUrl}/search?keyword=${keyword}&${apiKey}&page_number=`
        console.log(newClassURL)
        return newClassURL

    } else {


        newClassURL = `${baseUrl}/latest-news?${encodeURI(searchQuery)}&${apiKey}&page_number=1`
        newURL = `${baseUrl}/latest-news?${encodeURI(searchQuery)}&${apiKey}&page_number=`

        // categorySearchQuery.page_number++
        console.log(newClassURL)
        return newClassURL;
    }


}


function onFetchStart() {
    $("#loading").addClass("active");
}

function onFetchEnd() {
    $("#loading").removeClass("active");
}
// drop it in .card-header



function renderCard(stories) {
    const { title, author, description, url, image, category, published } = stories
    const newElement = $(`<div class="renderNews">
<header> 
<h1>${title}</h1>
<p>${author}</p>
<p> ${published}</p>
</header>
<p>${description}</p>
<a href="${url}"> click here to see the full article</a>
${image == "None" ? "" : `<a class="image" href ="${url}"><img src="${image}"></img></a>`}
${
        category.map(function (tag) {
            return `<a href="#" class="tag" data-tag="${tag}">${tag}</a>`
        }).join(", ")


        }
</div>`).data("stories", stories)
    return newElement
}

function isCurrent(date) {
    const newsDate = new Date(date);
    const now = new Date(); // uses date constructor to create two date objects

    return now < newsDate;
}



function updateCard(news) {

    const root = $(".cards")
    let results = root.find(".card-body").empty()
    $(".results").empty()
    pageNumber >= 2
        ? $('.previous').attr('disabled', false)
        : $('.previous').attr('disabled', true)
    news.forEach(function (stories) {
        results.append(renderCard(stories))
    })
}
$(".pagination .next, .pagination .previous").on("click", async function () {
    onFetchStart();
    // let nextNumber = categorySearchQuery.page_number++
    // console.log("yo", nextNumberURL)
    // let previousNumber = categorySearchQuery.page_number--
    // console.log("this is here here", pageNumberURL)
    target = $(this).attr("class")
    if (target == "next") {
        pageNumber = Number(pageNumber) + 1

    } else if (target == "previous") {
        pageNumber = Number(pageNumber) - 1


    }
    try {
        let newResult = newURL + pageNumber
        const results = await fetch(newResult);
        const { news, status, page, date } = await results.json();
        updateCard(news, status, page, date);
        console.log(newResult)
    } catch (error) {
        console.error(error);
    } finally {
        onFetchEnd();
    }
})


$("#search").on("submit", async function (event) {
    event.preventDefault();
    onFetchStart();
    try {
        const result = await fetch(buildSearchString());
        const { news, status, page, published } = await result.json();
        //   updatePreview(records, info);
        console.log(status, news, page)
        updateCard(news, page)
        isCurrent(published)
        return news, status



    } catch (error) {
        console.error(error);
    } finally {
        onFetchEnd();
        $("#search").trigger("reset")

    }
});


$("#allItems").on("click", ".tag", async function () {


    try {
        let target = $(this).attr("data-tag")
        const tagURL = `${baseUrl}/latest-news?${apiKey}&category=${target}&page_number=1`
        const response = await fetch(tagURL)
        const { news, status, page } = await response.json()
        console.log("this is clicked", target)
        updateCard(news, status, page)

    } catch (error) {
        console.error(error)
    }



})


async function displayOnLoad() {

    try {
        const loadURL = `${baseUrl}/latest-news?${apiKey}&page_number=1`
        const response = await fetch(loadURL)
        const { news, status, page } = await response.json()
        updateCard(news, status, page)


    } catch (error) {
        console.error(error)
    }




}
displayOnLoad()




fetchAllLists()
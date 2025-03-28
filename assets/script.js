var items = [];
var narratives = [];
var selection = [];
var curNarrative = "";
var curVal = "";
var curSort = "";
var currentSelection = []; // Definindo currentSelection no escopo global
// additional variables for offcanvas narratives
var timeList = [];
var placeList = [];
var genreList = [];
// mapping with schema properties
var schemaMapping = {
    "time": "temporalCoverage",
    "date of production": "dateCreated",
    "conservation location": "spatial",
    "author": "creator",
    "authority": "sameAs",
    "place": "locationCreated",
    "artistic expression": "genre",
}

$(document).ready(function() {
    console.log("jQuery è pronto!");

    $.ajax({
        url: "data/revised_structure.json",
        method: "get",
        success: function(data) {
            console.log("Dati ricevuti:", data);
            
            items = data.items;
            //console.log("items stored");

            var startItem = data.meta.startItem;
            var item = items[startItem];
            //console.log("The items:", JSON.stringify(item));

            narratives = data.meta.narratives;
            curNarrative = data.meta.startNarrative;
            curVal = data.meta.startVal;

            // Controlla se c'è un itemId nell'URL
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('itemId');

            if (itemId) {
                const index = items.findIndex(item => item.iId == itemId);
                if (index !== -1) {
                    currentSelection = items; // Define currentSelection as all items
                    showInfo(index);
                }
            } else {
                prepareNarratives(); // Carica l'elemento iniziale se non c'è itemId
            }
        },
        error: function() {
            alert("Errore nel caricamento dei dati");
        }
    });
});



function prepareNarratives() {
    currentSelection = items.filter(i => i.info.narratives[curNarrative] == curVal)
    //console.log("This is the current selection in the prepareNarratives function:", JSON.stringify(currentSelection))
    currentSelection.sort((i,j) => {
        if (i["iId"] < j["iId"]) return -1;
        if (i["iId"] > j["iId"]) return 1;
        return 0;
    });
    if (currentSelection.length==0)
        currentSelection = items
    var index = currentSelection.findIndex(i => i["iId"] == curSort) 
    if (index == -1) index = 0
    showInfo(index)
};

const infoTitle = $("#infoTitle");
const shortInfo = $("#text1");
const figImage = $("#img");
const figCaption = $("#item-figcaption");
const longerInfo = $("#text2");
const fullText = $("#fullText");
const infoContainer = $("#info-wrapper")
const metaTable = $("#table")

function showInfo(index) {
    try {
        var item = currentSelection[index];
        //console.log("This is the item in the showInfo function:", item)
        curSort = item["iId"];
        //console.log("This is the item id:", curSort)
    
        infoTitle.html(item.name);
        shortInfo.html(item.info["text 1"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText2()">Read more</a>');
        figImage.attr('src', item.info.image);
        figImage.attr('alt', item.name);
        figImage.css("aspect-ratio", item.display["aspect ratio"])
        figCaption.html(item.name);
        longerInfo.html(item.info["text 2"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText1()">Back</a> <a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText3()">Read more</a>');
        
        // for full html
        document.getElementById("fullText").dataset.path = item.info["text 3"];
    
        // ensuring text1 is the first to be displayed when the item or the narrative changes
        if (shortInfo.hasClass("d-none")) {
            showText1();
        }
        createInfoTable(item)
    
        prepareNavigationButtons(index);
    } catch(error) {
        return "item is not defined"
    }
}

function showText1() {
    shortInfo.removeClass("d-none");
    longerInfo.addClass("d-none");
    infoContainer.animate({scrollTop: 0}, "fast")
}

function showText2() {
    shortInfo.addClass("d-none");
    longerInfo.removeClass("d-none");
    fullText.addClass("d-none");
    infoContainer.animate({scrollTop: 0}, "fast")
}

// for full html
function showText3() {
    var path = document.getElementById("fullText").dataset.path
    fetch(path)
    .then(response => response.text())
    .then(data => {
        document.getElementById("fullText").innerHTML = data;
        fullText.removeClass("d-none").fadeIn("slow");
        shortInfo.addClass("d-none");
        longerInfo.addClass("d-none");
        infoContainer.scrollTo(0,0)

        // hide table on small screen when full text is displayed
        if (window.matchMedia("(max-width: 1024px)") && tableCol.hasClass("visible")) {
            tableCol.removeClass("visible")
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);  
    });
}

function createInfoTable(item) {
    var table = $("#info");
    table.html("");

    for (let i in item.itemMeta) {
        if (item.itemMeta[i]) {
            let val = item.itemMeta[i];
            // display only non empty values
            if (item.itemMeta[i] !== "") {
                if (i === "authority" || i == "sameAs") {
                    let authorityLink = ('<a class="button" role="button" target="_blank" href=" ' + item.itemMeta[i] + ' " style="color:black;">' + item.name + '</a>');
                    table.append("<tr><th><span>" + i + "</span></th><td>" + authorityLink + "</td></tr>"); 
                } else {
                    if ((i !== "authority" || i !== "sameAs") && narratives.includes(item.itemMeta[i])) {
                    val = ('<a class="button" role="button" href="#" onclick="changeNarrative(\'' + i + '\',\'' + val + '\')">' + val + '</a>');
                    }
                    table.append("<tr><th><span>" + i + "</span></th><td>" + val + "</td></tr>");
                }
            } else {
                table.append("<tr><th><span>" + i + "</span></th><td>" + item.itemMeta[i] + "</td></tr>");
            }
        }
    }
    // display schema property 
    let firstHeader = table.find("th").first(); // retrieve first header for modal instructions
    firstHeader.addClass("schema-popup");

    let tableHeaders = table.find("th")
    tableHeaders.each(function() {
        let header = $(this);
        let headerText = header.text().trim();
        let mappedText = schemaMapping[headerText];
        

        if (mappedText) {

            header.on("click", function() {
                if (header.text() == headerText) {
                    header.html(mappedText).css("color", "#736f4c")
                } else {
                    header.html(headerText).css("color", "black")
                }
            });
        }
    });
}
function changeNarrative(narrative, value) {
    curNarrative = narrative;
    curVal = value;
    if (curNarrative == "place") {
        $("body").css("background-image", "url(images/prova_bg_place.png)");
    } if (curNarrative == "artistic expression") {
        $("body").css("background-image", "url(images/prova_bg_genre.png)");
    } if (curNarrative == "time") {
        $("body").css("background-image", "url(images/prova_bg_time.png)");
    }
    prepareNarratives();
}

function prepareNavigationButtons(index) {
    if (index > 0) {
        $("#prevBtn").removeClass("disabled");
        // check use of .off
        $("#prevBtn").off("click").click(function() {
            showInfo(index - 1);
        });
        $("#prevBtn").text(currentSelection[index - 1].name)
    } else {
        $("#prevBtn").addClass("disabled");
        $("#prevBtn").click = null;
        $("#prevBtn").text("no item available");
    }
    if (index < currentSelection.length - 1) {
        $("#nextBtn").removeClass("disabled");
        $("#nextBtn").click(function() { showInfo(index + 1) });
        $("#nextBtn").text(currentSelection[index + 1].name);
    } else {
        $("#nextBtn").addClass("disabled");
        $("#nextBtn").click = null;
        $("#nextBtn").text("no item available");
    }
    $("#narrative").text(curNarrative+": "+curVal)
}

// offcanvas narratives
// Initialize offcanvas instance
let offCanvasElement = document.getElementById('offcanvasExample');
let offCanvas = new bootstrap.Offcanvas(offCanvasElement);
let offCanvasLink = $(".open-option")

let chooseTime = $(".fa-clock")
let choosePlace = $(".fa-earth-americas")
let chooseGenre = $(".fa-paintbrush")
let offcanvasUl = $("#narr-val-list")
let offcanvasTitle = $("#offcanvas-narrative-title")
let offcanvasText = $("#offcanvas-text")
offCanvasLink.on("click", function() {
    //console.log("click on offcanvas event fired")
    if ($(this).find(chooseTime).length) {
        showTimeNarrative()
    }
    if ($(this).find(choosePlace).length) {
        showPlaceNarrative()
        
    }
    if ($(this).find(chooseGenre).length) {
        showGenreNarrative()
        
    }
})

// time order mapping
centuries_order = {
    "XX century BC": 0,
    "XIX century BC": 1,
    "IX-VIII century BC": 2,
    "VI century BC": 3,
    "V century BC": 4,
    "II century BC": 5,
    "I century BC-I century AD": 6,
    "I century AD": 7,
    "II century AD": 8,
    "XIV-XV century": 9,
    "XIX century": 10,
    "XXI century": 11
}

// toggle time narrative
function showTimeNarrative() {
        // clearing the list before appending new items
        offcanvasUl.empty()
        timeList = items.map((item) => (item.info.narratives.time.trim()))
        timeList = [... new Set(timeList)]
        // sort array chronologically
        timeList.sort((a, b) => {
            return centuries_order[a] - centuries_order[b]
        })
        for (let period of timeList) {
            offcanvasUl.append('<li>' + period + '</li>')
            offcanvasTitle.text("Time")
            offcanvasText.text("Click on a time period to discover the items associated to it.")   
        }
        offcanvasUl.on("click", "li", function() {
            var selectedVal = $(this).text()
            //console.log("Selected value from time offcanvas", selectedVal)
            var timeNarrative = "time"
            changeNarrative(timeNarrative, selectedVal)
            offCanvas.hide()
        })
}

// toggle place narrative
function showPlaceNarrative() {
        // clearing the list before appending new items
        offcanvasUl.empty()
        placeList = items.map((item) => (item.info.narratives.place.trim()))
        placeList = [... new Set(placeList)].sort()
        for (let place of placeList) {
            offcanvasUl.append('<li>' + place + '</li>')
            offcanvasTitle.text("Place")
            offcanvasText.text("Click on a place to discover the items associated to it.")  
        }
        offcanvasUl.on("click", "li", function() {
            var selectedVal = $(this).text()
            //console.log("Selected value from place offcanvas", selectedVal)
            var placeNarrative = "place"
            changeNarrative(placeNarrative, selectedVal)
            offCanvas.hide()
        })
}

// toggle genre narrative
function showGenreNarrative() {
        // clearing the list before appending new items
        offcanvasUl.empty()
        genreList = items.map((item) => (item.info.narratives["artistic expression"].trim()))
        genreList = [... new Set(genreList)].sort()
        for (let genre of genreList) {
            offcanvasUl.append('<li>' + genre + '</li>')
            offcanvasTitle.text("Artistic Expression")
            offcanvasText.text("Click on a genre to discover the items associated to it.")   
        }
        offcanvasUl.on("click", "li", function() {
            var selectedVal = $(this).text()
            //console.log("Selected value from genre offcanvas", selectedVal)
            var genreNarrative = "artistic expression"
            changeNarrative(genreNarrative, selectedVal)
            offCanvas.hide()
        })
}


// display table on small screen layout
const figure = $(".exhibit-figure");
const infoIcon = $(".see-info-icon");
const imgCol = $("#imgCol");
const infoCol = $("#infoCol");
const tableCol = $("#tableCol");
const mediaQuery = window.matchMedia("(max-width: 1024px)");

function handleScreenResize(e) {
    if (e.matches) {
        tableCol.removeClass("visible")
        tableCol.css("pointer-events", "none");
        //table.css("height", item.display.height)
        infoIcon.on("click", function() {
            tableCol.toggleClass("visible");
            if (tableCol.hasClass("visible")) {
                tableCol.css("pointer-events", "auto");
            } else {
                tableCol.css("pointer-events", "none");
            }
        });
    } else {
        infoIcon.off("click");
        tableCol.removeClass("visible");
        tableCol.css("pointer-events", "auto");
    }
}

handleScreenResize(mediaQuery);

mediaQuery.addEventListener("change", handleScreenResize);

// change title position in smaller screen sizes
function updateTitlePosition() {
    const title = document.getElementById("infoTitle");
    const grid = document.getElementById("main-im");

    if (window.innerWidth <= 1024 && title.parentNode !== document.body) {
        title.style.display = "block"
        title.style.marginTop = "1rem"
        document.body.insertBefore(title, grid); // Move title above the grid
    } else if (window.innerWidth > 1024 && title.parentNode !== grid) {
        title.style.marginTop = "1rem"
        infoCol.prepend(title); // Move title back inside the grid
    }
}

window.addEventListener("DOMContentLoaded", updateTitlePosition);
window.addEventListener("resize", updateTitlePosition);

// function for handling modal-background interaction
let infoModal = $("#info-modal");
let modalSpan = $("#select-narr-pos");
let infoModalBody = $(".modal-body");
let chooseNarrative = $("#choose-from-offcanvas");
let title = $(".modal-body > h6");
let paragraphMapping = {
    "use-table": "#info",
    "see-schema": ".schema-popup",
    "use-offcanvas": "#choose-from-offcanvas"
}
function highlightOnScroll() {
    if (infoModal) {
        infoModalBody.on("scroll", function() {
            let scrollTop = infoModalBody.scrollTop();
            let titleId = "";
            let paragraphOnScreen = "";

            for (let t of title) {
                titleId = t.getAttribute("id");
                //console.log(titleId)
                let titleOffset = t.offsetTop; 
                //console.log(titleOffset)

                if (scrollTop >= titleOffset) {
                    paragraphOnScreen = titleId;
                    //console.log(paragraphOnScreen);
                }
            }

            if (paragraphOnScreen) {
                let bgElement = $(paragraphMapping[paragraphOnScreen]); 
                //console.log(bgElement);
                highlightBackground(bgElement);

                if (paragraphOnScreen === "see-schema") {
                    firstHeader.setAttribute("style", "background-color: rgba(61, 19, 2, 0.5);");
                }

                // Check if the paragraph on screen corresponds to the table
                if (paragraphOnScreen === "use-table" || paragraphOnScreen === "see-schema" && mediaQuery.matches) {
                    tableCol.addClass("visible");
                    tableCol.css("pointer-events", "auto");
                } else if (mediaQuery.matches) {
                    // Hide the table when "use-table" is no longer on screen
                    tableCol.removeClass("visible");
                    tableCol.css("pointer-events", "none");
                }
            }
        })
    } 
}

function highlightBackground(element) {
    $.each(paragraphMapping, function(key, value) {
        $(value).removeClass("highlight");
    });
    element.addClass("highlight");
}


infoModal.on("shown.bs.modal", function () {
    highlightOnScroll();
});

// Remove highlight when modal is hidden
infoModal.on("hidden.bs.modal", function () {
    $.each(paragraphMapping, function(key, value) {
        $(value).removeClass("highlight");  
    });
    // Hide the table when the modal is closed (on small screens)
    if (mediaQuery.matches) {
        tableCol.removeClass("visible");
        tableCol.css("pointer-events", "none");
    }
});



// navbar
// select all navbar and dropdown links 
const navLinks = document.querySelectorAll('.nav-link');
const dropdownLinks = document.querySelectorAll('.dropdown-item');

// obtain current URL path
const currentPath = window.location.pathname.split("/").pop().split("?")[0];  // extract last part of the URL parameters

// remove'active' class from all links
function removeActiveClass() {
    navLinks.forEach(link => link.classList.remove('active'));
    dropdownLinks.forEach(link => link.classList.remove('active'));
}

// add 'active' class to the link that corresponds to the current page
function setActiveLink() {
    removeActiveClass();  // remove existing 'active' class 
    console.log("Current Path: ", currentPath); 
    // check navbar links
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // home: if currentPath is empty or "/" (root), activate link for "index.html"
        if ((currentPath === "" || currentPath === "/") && (linkHref === 'index.html' || linkHref === '/')) {
            link.classList.add('active');
        } else if (linkHref === currentPath) {
            link.classList.add('active');  // add 'active' class to the corresponding link
        }
    });

    // check dropdown links
    dropdownLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');  // add'active' class to the corresponding dropdown link
        }
    });
}

// load the page
window.addEventListener('load', setActiveLink);

// FOOTER
function setActiveLink() {
    var currentPage = window.location.pathname;
    var footerLinks = document.querySelectorAll('footer a');

    footerLinks.forEach(function(link) {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('footeractive-link');
      }
    });
  }




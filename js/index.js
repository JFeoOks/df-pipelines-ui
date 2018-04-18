var allLogs = [];

var currentPageName, logsOnPage, pagesCount, currentPage, lastLogId;

const MAX_LOGS_ON_PAGE = 10;
const VISIBLE_PAGES = 5;

var isNeedToLoad = true;
var isLoaded = true;

var defaultOpts = {
// maximum visible pages
    visiblePages: VISIBLE_PAGES,

    initiateStartPageClick: true,

// template for pagination links
    href: false,

// variable name in href template for page number
    hrefVariable: '{{number}}',

// Text labels
    first: 'First',
    prev: 'Previous',
    next: 'Next',
    last: 'Last',

// carousel-style pagination
    loop: false,

// callback function
    onPageClick: function (event, page) {
        currentPage = page;
        if (isLoaded && isNeedToLoad && (pagesCount > VISIBLE_PAGES) && ((page + VISIBLE_PAGES) > pagesCount)) {
            isLoaded = false;
            loadRouteLogs("/route/data/init/config?lastLog=" + lastLogId + "&id=" + urlParams.get("object"));
        }

        $('.page-active').removeClass('page-active');
        $('#page' + page).addClass('page-active');
    },

// pagination Classes
    paginationClass: 'pagination',
    nextClass: 'next',
    prevClass: 'prev',
    lastClass: 'hidden',
    firstClass: 'first',
    pageClass: 'page',
    activeClass: 'active',
    disabledClass: 'disabled'

};

//url1 = "/route/data/search?lastLog=" + lastLogId;
//url2 = "/route/data/init/config?lastLog=" + lastLogId + "&id=" + urlParams.get("object");
const ID_PREF = "ID=";
const STATUS_PREF = "STATUS=";

function search() {
    var rules = buildRules($("#text-box").val().split("&"));

    clearData();
    addFoundedElements(rules);
    refresgPaging();
}

function buildRules(searchExpressions) {
    var ruleMap = new Map();

    for (let i = 0; i < searchExpressions.length; i++) {
        var expression = searchExpressions[i].toUpperCase();
        if (expression.startsWith(ID_PREF))
            addToMap(
                ruleMap,
                ID_PARAM,
                {func: idRule, value: expression.slice(ID_PREF.length).trim()}
            );
        else if (expression.startsWith(STATUS_PREF))
            addToMap(
                ruleMap,
                STATUS_PARAM,
                {func: statusRule, value: expression.slice(STATUS_PREF.length).trim()}
            );
    }

    var result = [];
    ruleMap.forEach(function (value) {
        result.push(value);
    });

    return result;
}

function addToMap(map, param, value) {
    var savedValue = map.get(param);
    if (savedValue) savedValue.push(value);
    else map.set(param, [value]);
}

const ID_PARAM = "id";

function idRule(target, id) {
    if (target[ID_PARAM] == id) return true;
    else return false;
}

const STATUS_PARAM = "status";

function statusRule(target, status) {
    if (target[STATUS_PARAM] == status) return true;
    else return false;
}

function checkEntryForRules(entry, rules) {
    var isValid = true;
    for (let i = 0; i < rules.length; i++) {
        if (isValid) {
            for (let j = 0; j < rules[i].length; j++) {
                if (rules[i][j].func(entry, rules[i][j].value)) {
                    isValid = true;
                    break;
                }
                else isValid = false;
            }
        }
    }

    return isValid;
}

function clearData() {
    lastLogId = 0;
    logsOnPage = 0;
    pagesCount = 0;
    currentPage = 1;

    isNeedToLoad = true;
    isLoaded = true;

    $("#data").empty();
    addNewPage();
}

function addFoundedElements(rules) {
    if (rules.length > 0) {
        for (let i = 0; i < allLogs.length; i++) {
            if (checkEntryForRules(allLogs[i], rules)) {
                addElement(allLogs[i]);
            }
        }
    }
}

function refresgPaging() {
    $("#pagination-demo").twbsPagination('destroy');
    $('#pagination-demo').twbsPagination(
        $.extend({}, defaultOpts, {
            totalPages: pagesCount,
            startPage: currentPage
        })
    );

    isLoaded = true;
}

function loadRouteLogs(url) {
    $.ajax({
        type: "GET",
        url: url,
        data: $("#text-box").val(),
        success: parseMessageFunction
    });
}

var urlParams = new URLSearchParams(window.location.search);

window.onload = function initLoadRouteLogsByConfiguration() {
    clearData();
    loadRouteLogs("/route/data/init/config?lastLog=" + lastLogId + "&id=" + urlParams.get("object"));
};

var parseMessageFunction = function parseMessage(msg) {
    var logStrings = JSON.parse(msg);

    if (logStrings.length === 0) {
        isNeedToLoad = false;
    }

    for (var i = 0; i < logStrings.length; i++) {
        lastLogId = logStrings[i].id;
        logStrings[i].data = JSON.parse(logStrings[i].data);
        allLogs.push(logStrings[i]);

        addElement(logStrings[i]);
    }

    refresgPaging();
};

function addElement(routeLog) {
    var message = "Log Id: " + routeLog.id;
    switch (routeLog.status) {
        case "SUCCESS":
            successElement(routeLog, message);
            break;
        case "ERROR":
            errorElement(routeLog, message);
            break;
        case "WARNING":
            warningElement(routeLog, message);
    }
}

// Добавление ноды
// document.getElementById("data").onclick = function() {
//     edges.add({from: nodes.length, to: nodes.length + 1});
//     nodes.add({id: nodes.length + 1, label: 'Node' + (nodes.length + 1)});
// };

function errorElement(routeLog, message) {
    addLogEntry(routeLog, 'alert error', '<strong>Error!</strong> ' + message);
}

function warningElement(routeLog, message) {
    addLogEntry(routeLog, 'alert warning', '<strong>Warning!</strong> ' + message);
}

function successElement(routeLog, message) {
    addLogEntry(routeLog, 'alert success', '<strong>Success!</strong> ' + message);
}

// Добавление записи (
// https://stackoverflow.com/questions/1520178/jquery-using-append-with-effects
// http://ts-soft.ru/blog/jquery-create-element
// )

function addLogEntry(routeLog, className, message) {
    if (logsOnPage >= MAX_LOGS_ON_PAGE) addNewPage();

    var elements = routeLog.data.elements;

    $('<div/>', {
            class: className,
            style: 'display: none;',
            html: message,
            on: {
                click: function () {
                    // create an array with nodes
                    //green - #00FF00
                    //yellow - ##FFFF00
                    //red - #FB7E81
                    //blue - #97C2FC

                    chains = new Set();
                    nodes.clear();
                    edges.clear();

                    nodes.add(elements);

                    var edgesArray = [];
                    for (var i = 0; i < elements.length - 1; i++) {
                        edgesArray.push({from: elements[i].id, to: elements[i + 1].id});
                    }

                    edges.add(edgesArray);
                }
            }
        }
    ).prependTo('#' + currentPageName).slideDown().show('slow');

    logsOnPage++;
}

function addNewPage() {
    logsOnPage = 0;
    currentPageName = "page" + (++pagesCount);
    $('<div/>', {
        id: currentPageName,
        class: "page",
    }).appendTo("#data");
}
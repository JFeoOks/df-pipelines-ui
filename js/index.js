// Добавление ноды
// document.getElementById("data").onclick = function() {
//     edges.add({from: nodes.length, to: nodes.length + 1});
//     nodes.add({id: nodes.length + 1, label: 'Node' + (nodes.length + 1)});
// };

// make the clusters
function makeClusters(scale) {
    chains.forEach(function (currentChain) {
            (function (currentChain) {
                    var clusterOptions = {
                        joinCondition: function (childOptions) {
                            return childOptions.chain === currentChain;
                        },

                        processProperties: function (clusterOptions, childNodesOptions, childEdgesOptions) {
                            clusterIndex = clusterIndex + 1;

                            var childrenCount = 0;
                            var colors = [];

                            for (var i = 0; i < childNodesOptions.length; i++) {
                                childrenCount += childNodesOptions[i].childrenCount || 1;
                                colors.push(childNodesOptions[i].color.background);
                            }

                            if (colors.includes('#FB7E81')) clusterOptions.color = '#FB7E81';
                            else if (colors.includes('#00FF00')) clusterOptions.color = '#00FF00';

                            clusterOptions.childrenCount = childrenCount;
                            clusterOptions.label = currentChain;
                            clusterOptions.font = {size: childrenCount * 5 + 30};
                            clusterOptions.id = 'cluster:' + clusterIndex;
                            clusters.push({id: 'cluster:' + clusterIndex, scale: scale});
                            return clusterOptions;
                        },

                        clusterNodeProperties: {
                            allowSingleNodeCluster: true
                        }
                    };

                    network.cluster(clusterOptions);
                }
            )(currentChain);
        }
    );
}

// open them back up!
function openClusters(scale) {
    var newClusters = [];
    for (var i = 0; i < clusters.length; i++) {
        if (clusters[i].scale < scale && scale > lastClusterZoomLevel) {
            network.openCluster(clusters[i].id);
        }
        else {
            newClusters.push(clusters[i])
        }
    }
    clusters = newClusters;
}

function errorElement(element, message) {
    addLogEntry(element, 'alert', '<strong>Error!</strong> ' + message);
}

function warningElement(element, message) {
    addLogEntry(element, 'alert warning', '<strong>Warning!</strong> ' + message);
}

function successElement(element, message) {
    addLogEntry(element, 'alert success', '<strong>Success!</strong> ' + message);
}

// Добавление записи (
// https://stackoverflow.com/questions/1520178/jquery-using-append-with-effects
// http://ts-soft.ru/blog/jquery-create-element
// )
function addLogEntry(element, className, message) {
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

                    nodes.add(element);

                    var edgesArray = [];
                    for (var i = 1; i <= element.length - 1; i++) {
                        edgesArray.push({from: i, to: i + 1});
                    }

                    edges.add(edgesArray);
                }
            }
        }
    ).prependTo('#data').slideDown().show('slow');
}

function loadRouteLogs() {
    $.ajax({
        type: "GET",
        url: "/route/data",
        data: $("#text-box").val(),
        success: function (msg) {
            $("#data").empty();

            var routesStrings = JSON.parse(msg);
            for (var i = 0; i < routesStrings.length; i++) {
                var routeData = JSON.parse(routesStrings[i]);
                var message =
                    "<br>Log Id: " + routeData.id;

                switch (routeData.status) {
                    case "SUCCESS":
                        successElement(routeData.element, message);
                        break;
                    case "ERROR":
                        errorElement(routeData.element, message);
                        break;
                    case "WARNING":
                        warningElement(routeData.element, message);
                }
            }

        }
    });
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
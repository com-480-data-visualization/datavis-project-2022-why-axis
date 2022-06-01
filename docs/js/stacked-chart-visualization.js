// set the dimensions and margins of the graph
var margin = {top: 60, right: 230, bottom: 50, left: 50},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#stacked-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("data/viz3.csv").then(function (data) {

    console.log(data)
    //////////
    // GENERAL //
    //////////

    // List of groups = header of the csv files
    var keys = data.columns.slice(1)

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);

    //stack the data?
    var stackedData = d3.stack()
        .keys(keys)
        (data)


    //////////
    // AXIS //
    //////////

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d.Year;
        }))
        .range([0, height]);

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "/" + (d+1- 2000)))

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", height)
        .attr("y", height + 40)
        .text("Academic year");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Share of students")
        .attr("text-anchor", "start")

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => parseFloat(100 * d).toFixed(2)+"%"))



    // Create the scatter variable: where both the circles and the brush take place
    var areaChart = svg.append('g')
    // .attr("clip-path", "url(#clip)")

    // Area generator
    var area = d3.area()
        .x(function (d) {
            return x(d.data.Year);
        })
        .y0(function (d) {
            return y(d[0]);
        })
        .y1(function (d) {
            return y(d[1]);
        })

    // Show the areas
    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function (d) {
            return "myArea " + d.key.replace(/[^a-z0-9]/gi, '')
        })
        .style("fill", function (d) {
            return color(d.key);
        })
        .attr("d", area)

    //////////
    // HIGHLIGHT GROUP //
    //////////

    // What to do when one group is hovered
    var highlight = function (d) {
        console.log(d)
        console.log(this)
        // reduce opacity of all groups
        d3.selectAll(".myArea").style("opacity", .1)
        // expect the one that is hovered
        const id = d.path[0].__data__.replace(/\s/g, '').replace(/[^a-z0-9]/gi, '');
        d3.select("." + id).style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function (d) {
        d3.selectAll(".myArea").style("opacity", 1)
    }


    //////////
    // LEGEND //
    //////////

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("myrect")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", 500)
        .attr("y", function (d, i) {
            return 150 + i * (size + 5)
        })
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) {
            return color(d)
        })
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 500 + size * 1.2)
        .attr("y", function (d, i) {
            return 150 + i * (size + 5) + (size / 2)
        })
        .style("fill", function (d) {
            return color(d)
        })
        .text(function (d) { return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

})



// set the dimensions and margins of the graph
const bubble_chart_margin = {top: 40, right: 150, bottom: 60, left: 30},
    bubble_chart_width = 800 - bubble_chart_margin.left - bubble_chart_margin.right,
    bubble_chart_height = 600 - bubble_chart_margin.top - bubble_chart_margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#bubble-chart")
    .append("svg")
    .attr("width", bubble_chart_width + bubble_chart_margin.left + bubble_chart_margin.right)
    .attr("height", bubble_chart_height + bubble_chart_margin.top + bubble_chart_margin.bottom)
    .append("g")
    .attr("transform", `translate(${bubble_chart_margin.left},${bubble_chart_margin.top})`);

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv").then(function (data) {

    // ---------------------------//
    //       AXIS  AND SCALE      //
    // ---------------------------//

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 45000])
        .range([0, bubble_chart_width]);
    svg.append("g")
        .attr("transform", `translate(0, ${bubble_chart_height})`)
        .call(d3.axisBottom(x).ticks(3));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", bubble_chart_width)
        .attr("y", bubble_chart_height + 50)
        .text("Gdp per Capita");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([35, 90])
        .range([bubble_chart_height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Life expectancy")
        .attr("text-anchor", "start")

    // Add a scale for bubble size
    const z = d3.scaleSqrt()
        .domain([200000, 1310000000])
        .range([2, 30]);

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
        .range(d3.schemeSet1);


    // ---------------------------//
    //      TOOLTIP               //
    // ---------------------------//

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    const showTooltip = function (event, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html("Country: " + d.country)
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 - 50 + "px")
    }
    const moveTooltip = function (event, d) {
        tooltip
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 - 50 + "px")
    }
    const hideTooltip = function (event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }


    // ---------------------------//
    //       HIGHLIGHT GROUP      //
    // ---------------------------//

    // What to do when one group is hovered
    const highlight = function (event, d) {
        // reduce opacity of all groups
        d3.selectAll(".bubbles").style("opacity", .05)
        // expect the one that is hovered
        d3.selectAll("." + d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    const noHighlight = function (event, d) {
        d3.selectAll(".bubbles").style("opacity", 1)
    }


    // ---------------------------//
    //       CIRCLES              //
    // ---------------------------//

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("class", function (d) {
            return "bubbles " + d.continent
        })
        .attr("cx", d => x(d.gdpPercap))
        .attr("cy", d => y(d.lifeExp))
        .attr("r", d => z(d.pop))
        .style("fill", d => myColor(d.continent))
        // -3- Trigger the functions for hover
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)


    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
    const valuesToShow = [10000000, 100000000, 1000000000]
    const xCircle = 620
    const xLabel = 660
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .join("circle")
        .attr("cx", xCircle)
        .attr("cy", d => bubble_chart_height - 100 - z(d))
        .attr("r", d => z(d))
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .join("line")
        .attr('x1', d => xCircle + z(d))
        .attr('x2', xLabel)
        .attr('y1', d => bubble_chart_height - 100 - z(d))
        .attr('y2', d => bubble_chart_height - 100 - z(d))
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .join("text")
        .attr('x', xLabel)
        .attr('y', d => bubble_chart_height - 100 - z(d))
        .text(d => d / 1000000)
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')

    // Legend title
    svg.append("text")
        .attr('x', xCircle)
        .attr("y", bubble_chart_height - 100 + 30)
        .text("Population (M)")
        .attr("text-anchor", "middle")

    // Add one dot in the legend for each name.
    const size = 20
    const allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]
    svg.selectAll("myrect")
        .data(allgroups)
        .join("circle")
        .attr("cx", 620)
        .attr("cy", (d, i) => 190 + i * (size + 5)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", d => myColor(d))
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
        .data(allgroups)
        .enter()
        .append("text")
        .attr("x", 620 + size * .8)
        .attr("y", (d, i) => 180 + i * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => myColor(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
})
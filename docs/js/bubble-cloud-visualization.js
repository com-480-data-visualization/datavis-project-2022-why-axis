// set the dimensions and margins of the graph
const bubble_cloud_width = 600
const bubble_cloud_height = 600

// append the svg object to the body of the page
const bubble_cloud = d3.select("#bubble-cloud")
    .append("svg")
    .attr("width", bubble_cloud_width)
    .attr("height", bubble_cloud_height)

// Read data
d3.csv("data/viz4_enhanced.csv").then(function (data) {

    // Filter a bit the data -> more than 1 million inhabitants
    data = data.filter(function (d) {
        return d.outgoing > 5000
    })

    // Color palette for continents?
    const bubble_cloud_color = d3.scaleOrdinal()
        .domain(["Southern Europe", "Eastern Europe", "Western Europe", "Northern Europe", "Western Asia"])
        .range(d3.schemeSet1);

    // Size scale for countries
    const size = d3.scaleLinear()
        .domain([0, 15000])
        .range([8, 90])  // circle will be between 7 and 55 px wide

    // create a tooltip
    const Tooltip = d3.select("#bubble-cloud")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
        Tooltip
            .style("opacity", 1)
    }
    const mousemove = function (event, d) {
        Tooltip
            .html('<u>' + d.university + '</u>' + "<br>" + d.outgoing + " outgoing students")
            .style("left", (event.x / 2 + 20) + "px")
            .style("top", (event.y / 2 - 30) + "px")
    }
    var mouseleave = function (event, d) {
        Tooltip
            .style("opacity", 0)
    }

    // Initialize the circle: all located at the center of the svg area
    var node = bubble_cloud.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "node")
        .attr("r", d => size(d.outgoing))
        .attr("cx", bubble_cloud_width / 2)
        .attr("cy", bubble_cloud_height / 2)
        .style("fill", d => bubble_cloud_color(d.country_unregion))
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .on("mouseover", mouseover) // What to do when hovered
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(bubble_cloud_width / 2).y(bubble_cloud_height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.2).radius(function (d) {
            return (size(d.outgoing) + 3)
        }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function (d) {
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
        });

    // What happens when a circle is dragged?
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }

})
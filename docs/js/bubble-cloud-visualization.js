// set the dimensions and margins of the graph
const bubble_cloud_width = document.getElementById('visualization-four').getElementsByClassName('column')[0].offsetWidth;
const bubble_cloud_height = 800;

var column_name = 'total';

function create_bubble_chart(data) {
    var bubble_cloud = d3.select("#bubble-cloud")
        .append("svg")
        .attr("width", bubble_cloud_width)
        .attr("height", bubble_cloud_height)
    // Listen to the buttons
    d3.select('#bubble-cloud-toolbar')
        .selectAll('.btn--tiny')
        .on('click', function () {
            // Remove active class from all buttons
            d3.selectAll('.btn--tiny').classed('active', false);
            // Find the button just clicked
            var button = d3.select(this);
            // Set it as the active button
            button.classed('active', true);
            // Get the id of the button
            var buttonId = button.attr('id');
            // Toggle the bubble chart based on
            // the currently clicked button.
            toggleDisplay(buttonId);
        });
    function toggleDisplay(buttonId) {
        if (buttonId === 'total') {
            column_name = 'total';
        } else if (buttonId === 'outgoing') {
            column_name = 'outgoing';
        } else if (buttonId === 'incoming') {
            column_name = 'incoming';
        } else if (buttonId === 'pagerank') {
            column_name = 'pagerank';
        } else if (buttonId === 'betweenness') {
            column_name = 'betweenness';
        }
        d3.select('#bubble-cloud').selectAll('*').remove();
        create_bubble_chart(data);
    }
    // Filter a bit the data
    var max_col = d3.max(data, function (d) {
        return parseFloat(d[column_name]);
    })
    filteredData = data.filter(function (d) {
        if (column_name === 'pagerank') {
            return d[column_name] > max_col / 3;
        } else if (column_name === 'betweenness') {
            return d[column_name] > max_col / 8;
        }
        return d[column_name] > max_col / 4
    })
    // Color palette for regions?
    const bubble_cloud_color = d3.scaleOrdinal()
        .domain(["Southern Europe", "Eastern Europe", "Western Europe", "Northern Europe", "Western Asia"])
        .range(d3.schemeSet1);
    const bubble_cloud_legend = d3.legendColor()
        .scale(bubble_cloud_color)
        .labelFormat(d3.format(".0f"));
    bubble_cloud.call(bubble_cloud_legend);
    // Size scale for countries
    const size = d3.scaleLinear()
        .domain([0, max_col * 1.5])
        .range([6, 80])  // circle will be between 6 and 80 px wide
    // create a tooltip
    const Tooltip = d3.select("#bubble-cloud")
        .append("div")
        .style("opacity", 0)
        .attr("class", "bubble-cloud-tooltip")
    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
        Tooltip
            .style("opacity", 1)
    }
    const mousemove = function (event, d) {
        Tooltip
            .html('<h5>' + d.university + '</h5>' +
                '<p>' + parseInt(d.total) + " total exchange students" + '</p>' +
                '<p>' + parseInt(d.outgoing) + " outgoing exchange students" + '</p>' +
                '<p>' + parseInt(d.incoming) + " incoming exchange students" + '</p>'
            )
            .style("left", (parseFloat(d3.select(this).attr("cx")) + width / 40) + "px")
            .style("top", (parseFloat(d3.select(this).attr("cy") + height / 40)) + "px")
    }
    var mouseleave = function (event, d) {
        Tooltip
            .style("opacity", 0)
    }
    // Initialize the circle: all located at the center of the svg area
    var node = bubble_cloud.append("g")
        .selectAll("circle")
        .data(filteredData)
        .join("circle")
        .attr("class", "node")
        .attr("r", d => size(d[column_name]))
        .attr("r", d => size(d[column_name]))
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
            return (size(d[column_name]) + 3)
        }).iterations(1))
    // Force that avoids circle overlapping
    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(filteredData)
        .on("tick", ticked);
    simulation.force('x', d3.forceX().strength(0.02).x(width / 2))
    simulation.force('y', d3.forceY().strength(0.02).y(height / 2))
    simulation.restart();
    function ticked() {
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
    }
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
        simulation.force('x', d3.forceX().strength(0.02).x(width / 2))
        simulation.force('y', d3.forceY().strength(0.02).y(height / 2))
        simulation.restart();
    }
}

// Read data
d3.csv("data/viz4_enhanced.csv").then(create_bubble_chart)
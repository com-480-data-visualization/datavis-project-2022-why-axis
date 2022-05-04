// The svg
const erasmus_map = d3.select("#erasmus-map"),
    width = +erasmus_map.attr("width"),
    height = +erasmus_map.attr("height");

// Map and projection
const projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (data) {

    // Draw the map
    erasmus_map.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff")

})
// The svg
const erasmus_map_svg = d3.select("#erasmus-map"),
    erasmus_map_width = +erasmus_map_svg.attr("width"),
    erasmus_map_height = +erasmus_map_svg.attr("height");

// Map and projection
const erasmus_map_path = d3.geoPath();
const erasmus_map_projection = d3.geoMercator()
    .scale(660)
    .center([14, 48])
    .translate([erasmus_map_width / 2, erasmus_map_height / 2]);

// Data and color scale
const erasmus_map_data = new Map();
const erasmus_map_colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
        erasmus_map_data.set(d.code, +d.pop)
    })]).then(function(loadData){
    let topo = loadData[0]

    let mouseOver = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5)
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black")
    }

    let mouseLeave = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")
    }

    // Draw the map
    erasmus_map_svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(erasmus_map_projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.total = erasmus_map_data.get(d.id) || 0;
            return erasmus_map_colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )

})
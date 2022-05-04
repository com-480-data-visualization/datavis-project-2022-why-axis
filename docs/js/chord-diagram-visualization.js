// create the svg area
const chord_diagram = d3.select("#chord-diagram").append("g").attr("transform", "translate(300, 300)")

// create input data: a square matrix that provides flow between entities
const matrix = [
    [11975, 5871, 8916, 2868],
    [1951, 10048, 2060, 6171],
    [8010, 16145, 8090, 8045],
    [1013, 990, 940, 6907]
];

// give this matrix to d3.chord(): it will calculate all the info we need to draw arc and ribbon
const res = d3.chord()
    .padAngle(0.05)     // padding between entities (black arc)
    .sortSubgroups(d3.descending)
    (matrix)

// add the groups on the inner part of the circle
chord_diagram
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(d => d.groups)
    .join("g")
    .append("path")
    .style("fill", "grey")
    .style("stroke", "black")
    .attr("d", d3.arc()
        .innerRadius(200)
        .outerRadius(210)
    )

// Add the links between groups
chord_diagram
    .datum(res)
    .append("g")
    .selectAll("path")
    .data(d => d)
    .join("path")
    .attr("d", d3.ribbon()
        .radius(200)
    )
    .style("fill", "#69b3a2")
    .style("stroke", "black");
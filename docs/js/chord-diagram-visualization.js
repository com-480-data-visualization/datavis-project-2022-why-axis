const json_path = "data/viz2.json"
const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
const innerRadius = 360
const outerRadius = 380

$.getJSON(json_path, function(data) {
    const matrix = data["matrix"]
    const labels = data["labels"]

    chordDiagram(matrix, labels)
});

function chordDiagram(matrix, labels) {
    // create the svg area
    const chordArea = document.getElementById("chord-diagram")
    const height = chordArea.getAttribute("height")
    const width = chordArea.getAttribute("width")
    console.log(chordArea)
    const chord_diagram = d3.select("#chord-diagram").append("g").attr("transform", `translate(${height/2},${width/2})`)
    const res = d3.chord()
    .padAngle(0.01)     // padding between entities (black arc)
    .sortSubgroups(d3.descending)
    (matrix)

    // based on https://d3-graph-gallery.com/graph/chord_basic.html
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
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
        )

    chord_diagram.append("path")
      .attr("fill", "none")
      .attr("d", d3.arc()({outerRadius, startAngle: 0, endAngle: 2 * Math.PI}));

    // // Add the links between groups
    chord_diagram
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(d => d)
        .join("path")
        .attr("d", d3.ribbon()
            .radius(innerRadius - 10)
        )
        .style("fill", function(d){ return(colors[d.source.index]) })
}
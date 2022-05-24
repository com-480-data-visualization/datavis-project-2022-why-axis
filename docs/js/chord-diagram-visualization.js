const json_path = "data/viz2.json"

function chordAlt(matrix, names) {
    const innerRadius = 320
    const outerRadius = 330
    const ySpacing = 25
    const xOffset = 380
    const radius = 8


    function yDot(d, i) {
        return +(i - names.length / 2) * ySpacing
    }

    function yLabel(d, i) {
        return +(i - names.length / 2) * ySpacing + 2
    }

    function onMouseOver(selected) {
        group
            .filter(d => d.index !== selected.index)
            .style("opacity", 0.3);

        svg.selectAll(".chord")
            .filter(d => d.source.index !== selected.index)
            .style("opacity", 0.3);
        console.log("hi")
    }

    function onMouseOut() {
        group.style("opacity", 1);
        svg.selectAll(".chord")
            .style("opacity", 1);
        console.log("hi")
    }

    console.log(matrix)
    console.log(names)

    const chordArea = document.getElementById("chord-diagram")
    const height = chordArea.getAttribute("height")
    const width = chordArea.getAttribute("width")
    const svg = d3.select("#chord-diagram").append("g").attr("transform", `translate(${width / 2.5},${height / 2})`)

    var color = d3.scaleOrdinal()
        .domain(names)
        .range(d3.schemeSet2);

    chord = d3.chordDirected().padAngle(5 / innerRadius).sortSubgroups(d3.descending)
    ribbon = d3.ribbonArrow().radius(innerRadius - 0.5).padAngle(1 / innerRadius)
    arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
    const chords = chord(matrix);

    formatValue = x => `: ${x.toFixed(0)} students`

    const group = svg.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");

    svg.append("g")
        .attr("fill-opacity", 0.75)
        .selectAll("g")
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", d => color(names[d.source.index]))
        .style("mix-blend-mode", "multiply")
        .append("title")
        .text(d => `${names[d.source.index]} to ${names[d.target.index]} ${formatValue(d.source.value)}`)

    svg.append("g")
        .attr("font-family", "Helvetica")
        .attr("font-size", 10)
        .selectAll("g")
        .data(chords.groups)
        .join("g")
        .call(g => g.append("path")
            .attr("d", arc)
            .attr("fill", d => color(names[d.index]))
            .attr("stroke", "#fff"))
        .call(g => g.append("title")
            .text(d => `${names[d.index]}
        from ${formatValue(d3.sum(matrix[d.index]))}
        to ${formatValue(d3.sum(matrix, row => row[d.index]))}`));

    // add legend
    // https://d3-graph-gallery.com/graph/custom_legend.html
    svg.selectAll("legend-dots")
        .data(names)
        .enter()
        .append("circle")
        .attr("cx", xOffset)
        .attr("cy", yDot)
        .attr("r", radius)
        .style("fill", function (d) {
            return color(d)
        })

    svg.selectAll("legend-labels")
        .data(names)
        .enter()
        .append("text")
        .attr("font-family", "monospace")
        .attr("font-size", 12)
        .attr("x", xOffset + 20)
        .attr("y", yLabel)
        .style("fill", function (d) {
            return color(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}

$.getJSON(json_path, function (data) {
    const matrix = data["matrix"]
    const labels = data["labels"]

    // chordDiagram(matrix, labels)
    chordAlt(matrix, labels)
});
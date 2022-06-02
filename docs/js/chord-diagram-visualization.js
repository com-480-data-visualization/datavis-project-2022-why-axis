var path = ""

function chord(matrix, names) {
    const innerRadius = 320
    const outerRadius = 350

    // mouse events adapted from https://observablehq.com/@john-guerra/mouseover-chord-diagram

    function onMouseOverPath(selected) {
        const indexFrom = selected.path[0].__data__["source"]["index"]
        const indexTo = selected.path[0].__data__["target"]["index"]
        const value = selected.path[0].__data__["source"]["value"]

        svg.selectAll(".chordpath")
            .filter(d => d.source.index !== indexFrom).transition().style("opacity", 0.3);

        tooltip.text(`${names[indexFrom]} to ${names[indexTo]}: ${value} students`)

        tooltip.style("visibility", "visible");
    }

    function onMouseMove(selected) {
        var coordinates = d3.pointer(selected)
        const x = coordinates[0] + window.innerWidth / 2 
        const y = coordinates[1] + height / 2 + 100
        tooltip.style("top", (y + "px")).style("left", (x + "px")).transition()
        tooltip.style("height", "auto")
    }

    function onMouseOverGroup(selected) {
        // i don't know what's a better way to get that index?
        const index = selected.path[0].__data__['index']
        svg.selectAll(".chordpath")
            .filter(d => d.source.index !== index).transition()
            .style("opacity", 0.3);

        tooltip.text(`${names[index]}: out: ${d3.sum(matrix[index])}, in: ${d3.sum(matrix, row => row[index])}`)
        tooltip.style("visibility", "visible");
    }

    function onMouseOut() {
        svg.selectAll(".chordpath").transition()
            .style("opacity", 1);
        tooltip.style("visibility", "hidden");
    }


    const chordArea = document.getElementById("chord-diagram")
    const height = chordArea.getAttribute("height")
    const width = chordArea.getAttribute("width")
    const svg = d3.select("#chord-diagram").append("g").attr("transform", `translate(${width / 2},${height / 2})`)

    // tooltip based on https://codepen.io/DuliniM/pen/YqLqrL
    var tooltip = d3.select("#tooltip");

    var color = d3.scaleOrdinal()
        .domain(names)
        .range(d3.schemeTableau10);

    chord = d3.chordDirected().padAngle(5 / innerRadius).sortSubgroups(d3.descending)
    ribbon = d3.ribbonArrow().radius(innerRadius - 10).padAngle(1 / innerRadius)
    arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
    const chords = chord(matrix);

    // add groups
    const group = svg.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");

    group.append("text")
        .each(d => {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("dy", ".35em")
        .attr("class", "label")
        // .attr("font-family", "Helvetica")
        // .attr("font-size", 15)
        .attr("fill", color)
        .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI) - 90})
        translate(${outerRadius + 10})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text(d => names[d.index]);

    // add paths
    svg.append("g")
        .attr("fill-opacity", 0.75)
        .selectAll("g")
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .on("mouseover", onMouseOverPath)
        .on("mouseout", onMouseOut)
        .on("mousemove", onMouseMove)
        .attr("class", "chordpath")
        .attr("fill", d => color(names[d.source.index]))
        .style("mix-blend-mode", "multiply")

    group.append("path")
        .attr("fill", d => color(names[d.index]))
        .attr("stroke", "#fff")
        .attr("d", arc)
        .on("mouseover", onMouseOverGroup)
        .on("mouseout", onMouseOut)
        .on("mousemove", onMouseMove)
}

const json_path = "data/viz2.json"
$.getJSON(json_path, function (data) {

    const matrix = data["matrix"]
    const labels = data["labels"]

    chord(matrix, labels)
});
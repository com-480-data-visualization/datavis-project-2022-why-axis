var path = ""

function chord(matrix, names) {
    const innerRadius = 320
    const outerRadius = 350

    // mouse events adapted from https://observablehq.com/@john-guerra/mouseover-chord-diagram
    // create a tooltip
    const Tooltip = d3.select("#chord")
        .append("div")
        .attr("id", "chord-tooltip")
        .style("opacity", 0)
        .attr("class", "chord-diagram-tooltip")

    // functions that change the tooltip when user hover / move / leave a cell
    const mouseoverArc = function (event, d) {
        const index = d.index
        const out = d3.sum(matrix[index])
        const in_ = d3.sum(matrix, row => row[index])
        Tooltip.html('<h5>' + names[d.index] + '</h5>' +
            '<p>' + parseInt(out + in_) + " total exchange students" + '</p>' +
            '<p>' + parseInt(out) + " outgoing exchange students" + '</p>' +
            '<p>' + parseInt(in_) + " incoming exchange students" + '</p>'
            )
            .style("opacity", 1)

        svg.selectAll(".chordpath")
            .filter(d_ => d_.source.index !== d.index).transition()
            .style("opacity", 0.3);
    }

    const mouseoverRibbon = function (event, d) {
        const val = matrix[d.source.index][d.target.index]
        Tooltip
            .html('<h5>' + names[d.source.index] + " -> " + names[d.target.index] + '</h5>' +
                '<p>' + parseInt(val) + " total students" + '</p>'
            )
            .style("opacity", 1)

        svg.selectAll(".chordpath")
            .filter(d_ => d_.source.index !== d.source.index).transition()
            .style("opacity", 0.3);
    }

    const mousemove = function (event, d) {
        var coordinates = d3.pointer(event)
        const x = coordinates[0] + width / 2 + 20
        const y = coordinates[1] + height / 2 + 20

        Tooltip
            .style("left", (parseFloat(x)) + "px")
            .style("top", (parseFloat(y)) + "px")
    }

    var mouseleave = function (event, d) {
        Tooltip
            .style("opacity", 0)
        svg.selectAll(".chordpath").transition()
            .style("opacity", 1);
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
        .on("mouseover", mouseoverRibbon)
        .on("mouseleave", mouseleave)
        .on("mousemove", mousemove)
        .attr("class", "chordpath")
        .attr("fill", d => color(names[d.source.index]))
        .style("mix-blend-mode", "multiply")

    group.append("path")
        .attr("fill", d => color(names[d.index]))
        .attr("stroke", "#fff")
        .attr("d", arc)
        .on("mouseover", mouseoverArc)
        .on("mouseleave", mouseleave)
        .on("mousemove", mousemove)
}

const json_path = "data/viz2.json"
$.getJSON(json_path, function (data) {

    const matrix = data["matrix"]
    const labels = data["labels"]

    chord(matrix, labels)
});
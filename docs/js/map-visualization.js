function map(data) {
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

    // const colors = d3.scaleThreshold()
    // .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    // // .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);
    // .range(d3.schemeBlues[7]);
    // const erasmus_map_colorScale = d3.scaleOrdinal().range(colors);

    const erasmus_map_colorScale = d3.scaleThreshold()
        .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
        .range(d3.schemeBlues[7]);

    // var sliderTime = d3.sliderBottom()
    //     .min(d3.min(dataTime))
    //     .max(d3.max(dataTime))
    //     .step(1000 * 60 * 60 * 24 * 365)
    //     .width(300)
    //     .tickFormat(d3.timeFormat('%Y'))
    //     .tickValues(dataTime)
    //     .default(new Date(1998, 10, 3))
    //     .on('onchange', val => {
    //         d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
    //     });

    // var gTime = d3.select('div#slider-time')
    //     .append('svg')
    //     .attr('width', 500)
    //     .attr('height', 100)
    //     .append('g')
    //     .attr('transform', 'translate(30,30)');

    // Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function (d) {
            erasmus_map_data.set(d.code, +d.pop)
        })]).then(function (loadData) {
            let topo = loadData[0]

            // Tooltip stuff
            var tooltip = d3.select("#tooltip-map")

            // // Slider stuff --> https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
            // gTime.call(sliderTime);
            // d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));

            let mouseOver = function (d) {
                tooltip.style("visibility", "visible");

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

            let mouseLeave = function (d) {
                tooltip.style("visibility", "hidden");

                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", .8)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", "transparent")
            }

            let mouseMove = function (d) {
                const name = d.path[0].__data__["properties"]["name"]
                var obj = null;
                for (var i = 0; i < data.length; i++) {
                    if (data[i]["Country"] == name) {
                        obj = data[i];
                        console.log(obj);
                        break;
                    }
                }

                // todo: handle year
                var year = "";

                // checkboxes handling
                const cb_female = $("#cb-female").is(":checked");
                const cb_male = $("#cb-male").is(":checked");
                const cb_sending = $("#cb-sending").is(":checked");
                const cb_receiving = $("#cb-receiving").is(":checked");
                var gender = (cb_female && cb_male) ? "Female, Male" : ((cb_female ? "Female" : (cb_male ? "Male" : "")))
                var program = (cb_sending && cb_receiving) ? "Sending, Receiving" : ((cb_sending ? "Sending" : (cb_receiving ? "Receiving" : "")))
                var participants = 0

                var text = "No data for Erasmus programs."
                if (obj != null) {
                    year = obj["Yearly-Data"][0]["Academic Year"];

                    if (cb_sending && cb_receiving && cb_female && cb_male) participants = obj["Yearly-Data"][0]["All-All"];
                    else if (cb_sending && cb_receiving && cb_male) participants = obj["Yearly-Data"][0]["All-Male"];
                    else if (cb_sending && cb_receiving & cb_female) participants = obj["Yearly-Data"][0]["All-Female"];
                    else if (cb_receiving && cb_female && cb_male) participants = obj["Yearly-Data"][0]["Receiving-All"];
                    else if (cb_sending && cb_female && cb_male) participants = obj["Yearly-Data"][0]["Sending-All"];
                    else if (cb_sending && cb_female) participants = obj["Yearly-Data"][0]["Sending-Female"];
                    else if (cb_sending && cb_male) participants = obj["Yearly-Data"][0]["Sending-Male"];
                    else if (cb_receiving & cb_female) participants = obj["Yearly-Data"][0]["Receiving-Female"];
                    else if (cb_receiving && cb_male) participants = obj["Yearly-Data"][0]["Receiving-Male"];

                    text = "Academic Year: " + year + "<br>" + "Gender: " + gender + "<br>" + "Program Type: " + program + "<br>" + "Participants: " + participants;
                }
                tooltip.html("Country: " + name + "<br>" + text)
                    .style("left", (d3.pointer(d)[0] - erasmus_map_width / 2) + "px")
                    .style("top", (d3.pointer(d)[1]) + "px")
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
                .attr("class", function (d) { return "Country" })
                .style("opacity", .8)
                .on("mouseover", mouseOver)
                .on("mouseleave", mouseLeave)
                .on("mousemove", mouseMove)
        })
}


const json_viz1 = "data/viz1.json"
$.getJSON(json_viz1, function (data) {
    map(data)
});
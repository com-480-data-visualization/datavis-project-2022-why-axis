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

    document.getElementById('cb-female').addEventListener('change', _ => updateColors());
    document.getElementById('cb-male').addEventListener('change', _ => updateColors());
    document.getElementById('cb-sending').addEventListener('change', _ => updateColors());
    document.getElementById('cb-receiving').addEventListener('change', _ => updateColors());

    function updateColors() {
        // todo: handle year
        var year = "";
        const cb_female = $("#cb-female").is(":checked");
        const cb_male = $("#cb-male").is(":checked");
        const cb_sending = $("#cb-sending").is(":checked");
        const cb_receiving = $("#cb-receiving").is(":checked");

        var maxCount = 0;
        var participants = 0
        var countryParticipants = new Map();
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
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
            if (participants > maxCount) maxCount = participants;
            countryParticipants.set(obj["Country"], participants);
        }
        for (const entry of countryParticipants.entries()) {
            const text = "[country_name=\'" + entry[0] + "\']"
            var country = $("#erasmus-map").find(text)[0]
            if (country != undefined) country.style.fill = d3.interpolateRdBu((0.5 + (entry[1] / maxCount) / 2));
        }
    }

    var sliderData = [1, 2, 3, 4, 5, 6];

    // Step
    var sliderStep = d3
        .sliderBottom()
        .min(d3.min(sliderData))
        .max(d3.max(sliderData))
        .width(300)
        .tickFormat(d3.format("d"))
        .ticks(6)
        .step(1)
        .default(sliderData[0])
        .on('onchange', val => {
            d3.select('p#value-step').text(d3.format("d")(val));
        });

    var gStep = d3
        .select('div#slider-step')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gStep.call(sliderStep);

    d3.select('p#value-step').text(d3.format("d")(sliderStep.value()));
    
    // Load external data and boot
    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function (d) {
            erasmus_map_data.set(d.code, +d.pop)
        })]).then(function (loadData) {
            let topo = loadData[0]

            // Tooltip stuff
            var tooltip = d3.select("#tooltip-map")

            let mouseOver = function (d) {
                tooltip.style("visibility", "visible").transition()

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
                tooltip.style("visibility", "hidden").transition()

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

                // todo: handle year
                var year = "";

                // checkboxes handling
                const cb_female = $("#cb-female").is(":checked");
                const cb_male = $("#cb-male").is(":checked");
                const cb_sending = $("#cb-sending").is(":checked");
                const cb_receiving = $("#cb-receiving").is(":checked");
                var gender = (cb_female && cb_male) ? "Female, Male" : ((cb_female ? "Female" : (cb_male ? "Male" : "")))
                var program = (cb_sending && cb_receiving) ? "Sending, Receiving" : ((cb_sending ? "Sending" : (cb_receiving ? "Receiving" : "")))

                var obj = null;
                var maxCount = 0;
                var participants = 0
                var text = "No data for Erasmus programs."
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];

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

                    if (participants > maxCount) maxCount = participants;

                    if (obj["Country"] == name) {
                        text = "Academic Year: " + year + "<br>" + "Gender: " + gender + "<br>" + "Program Type: " + program + "<br>" + "Participants: " + participants;
                        break;
                    }
                }
                // todo: fix size of box
                tooltip.html("Country: " + name + "<br>" + text)
                    .style("left", (d3.pointer(d)[0] - erasmus_map_width / 2) + "px")
                    .style("top", (d3.pointer(d)[1]) + "px")
                    .transition()
                // d.srcElement.style.fill = d3.interpolateRdBu((0.5 + (participants / maxCount) / 2));
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
                    var maxCount = 0;
                    var participants = 0;
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        if (obj["Yearly-Data"][0]["All-All"] > maxCount) maxCount = obj["Yearly-Data"][0]["All-All"];
                        if (d.properties.name == obj["Country"]) {
                            participants = obj["Yearly-Data"][0]["All-All"];
                        }
                    }
                    return d3.interpolateRdBu(0.5 + (participants / maxCount) / 2);
                })
                .style("stroke", "transparent")
                .attr("class", function (d) { return "Country" })
                .attr("country_name", function (d) { return d.properties.name })
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
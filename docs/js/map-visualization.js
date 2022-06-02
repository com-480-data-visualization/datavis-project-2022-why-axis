function map(data) {
    // The svg
    const erasmus_map_svg = d3.select("#erasmus-map"),
        erasmus_map_width = +erasmus_map_svg.attr("width"),
        erasmus_map_height = +erasmus_map_svg.attr("height");

    // Map and projection
    const erasmus_map_projection = d3.geoMercator()
        .scale(660)
        .center([14, 48])
        .translate([erasmus_map_width / 2, erasmus_map_height / 2]);

    // Data and color scale
    const erasmus_map_data = new Map();

    // Adding event listeners to checkbox-es and drop-down list of education level
    document.getElementById('cb-female').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('cb-male').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('cb-sending').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('cb-receiving').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('education-level').addEventListener('change', _ => update_colors_and_values());

    // Global map where key is the country, value is participants count based on current selections
    var country_participants_values = new Map();

    // Function that updates colors and participants nubmer for current selection of filters
    function update_colors_and_values() {
        const cb_female = $("#cb-female").is(":checked");
        const cb_male = $("#cb-male").is(":checked");
        const cb_sending = $("#cb-sending").is(":checked");
        const cb_receiving = $("#cb-receiving").is(":checked");
        const year = sliderStep.value();
        const education_level = document.getElementById('education-level').value

        var maxCount = 0
        for (var i = 0; i < data.length; i++) {
            var obj = data[i]
            var participants = 0
            for (var j = 0; j < obj["Yearly-Data"].length; j++) {
                if (obj["Yearly-Data"][j]["Academic Year"].startsWith(year) &&
                    (education_level == 'All' || (obj["Yearly-Data"][j]["Education Level"].startsWith(education_level))) &&
                    ((cb_female && obj["Yearly-Data"][j]["Participant Gender"] == 'Female') || (cb_male && obj["Yearly-Data"][j]["Participant Gender"] == 'Male'))) {
                    if (cb_sending) participants += obj["Yearly-Data"][j]["Sending"];
                    if (cb_receiving) participants += obj["Yearly-Data"][j]["Receiving"];
                }
            }
            if (participants > maxCount) maxCount = participants;
            country_participants_values.set(obj["Country"], participants);
        }
        for (const entry of country_participants_values.entries()) {
            const text = "[country_name=\'" + entry[0] + "\']"
            var country = $("#erasmus-map").find(text)[0]
            if (country != undefined) country.style.fill = d3.interpolateRdBu((0.5 + (entry[1] / maxCount) / 2));
        }
    }

    // Slider Step that represents Academic Year (taken from - https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518)
    var sliderData = [2014, 2015, 2016, 2017, 2018, 2019];
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
            update_colors_and_values();
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
    document.getElementById('value-step').addEventListener('change', _ => console.log("prr"));
    document.getElementById('slider-step').addEventListener('change', _ => console.log("prr"));

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
                update_colors_and_values();

                const name = d.path[0].__data__["properties"]["name"]
                const cb_female = $("#cb-female").is(":checked");
                const cb_male = $("#cb-male").is(":checked");
                const cb_sending = $("#cb-sending").is(":checked");
                const cb_receiving = $("#cb-receiving").is(":checked");

                var text = "No data for Erasmus program year " + sliderStep.value() + "."
                for (var i = 0; i < data.length; i++) {
                    if (data[i]["Country"] != name) continue;
                    const participants = country_participants_values.get(data[i]["Country"]);
                    const year = sliderStep.value() + "-" + (sliderStep.value() + 1);
                    const gender = (cb_female && cb_male) ? "Female, Male" : ((cb_female ? "Female" : (cb_male ? "Male" : "")))
                    const program = (cb_sending && cb_receiving) ? "Sending, Receiving" : ((cb_sending ? "Sending" : (cb_receiving ? "Receiving" : "")))
                    var education = document.getElementById('education-level').value
                    if (education.startsWith("Not")) education = "Not classified"
                    if (education.startsWith("Short")) education = "Short-Cycle"
                    text = "Academic Year: " + year + "<br>" + "Gender: " + gender + "<br>" + "Program Type: " + program + "<br>" + "Education Level: " + education + "<br>" + "Participants: " + participants;
                }
                tooltip.html("Country: " + name + "<br>" + text)
                    .style("left", (window.innerWidth / 2 - 2 * erasmus_map_width / 3) + "px")
                    .style("top", (erasmus_map_height / 4) + "px")
                    .transition()
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
                    var maxCount = 0
                    var country_participants = 0;
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i]
                        var participants = 0
                        for (var j = 0; j < obj["Yearly-Data"].length; j++) {
                            if (obj["Yearly-Data"][j]["Academic Year"].startsWith("2014")) {
                                participants += obj["Yearly-Data"][j]["Sending"]
                                participants += obj["Yearly-Data"][j]["Receiving"]
                            }
                        }
                        if (participants > maxCount) maxCount = participants;
                        if (d.properties.name == obj["Country"]) country_participants = participants
                    }
                    return d3.interpolateRdBu(0.5 + (country_participants / maxCount) / 2);
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
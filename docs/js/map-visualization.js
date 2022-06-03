function map(data) {
    const chordArea = document.getElementById("erasmus-map")
    const height = chordArea.getAttribute("height")
    const width = chordArea.getAttribute("width")

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

    // tooltip
    const Tooltip = d3.select("#map")
        .append("div")
        .attr("id", "map-tooltip")
        .style("opacity", 0)
        .attr("class", "map-tooltip")

    // Adding event listeners to checkbox-es and drop-down list of education level
    document.getElementById('cb-female').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('cb-male').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('cb-sending').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('cb-receiving').addEventListener('change', _ => update_colors_and_values());
    document.getElementById('education-level').addEventListener('change', _ => update_colors_and_values());

    // Global map where key is the country, value is participants count based on current selections
    var country_participants_values = new Map();

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
        const name = d["properties"]["name"]
        const cb_female = $("#cb-female").is(":checked");
        const cb_male = $("#cb-male").is(":checked");
        const cb_sending = $("#cb-sending").is(":checked");
        const cb_receiving = $("#cb-receiving").is(":checked");
        var participants;
        var education;
        var gender;
        var program;
        var year;

        for (var i = 0; i < data.length; i++) {
            if (data[i]["Country"] != name) continue;
            participants = country_participants_values.get(data[i]["Country"]);
            year = sliderStep.value() + "-" + (sliderStep.value() + 1);
            gender = (cb_female && cb_male) ? "Female, Male" : ((cb_female ? "Female" : (cb_male ? "Male" : "")))
            program = (cb_sending && cb_receiving) ? "Sending, Receiving" : ((cb_sending ? "Sending" : (cb_receiving ? "Receiving" : "")))
            education = document.getElementById('education-level').value
            if (education.startsWith("Not")) education = "Not classified"
            if (education.startsWith("Short")) education = "Short-Cycle"
            text = "Academic Year: " + year + "<br>" + "Gender: " + gender + "<br>" + "Program Type: " + program + "<br>" + "Education Level: " + education + "<br>" + "Participants: " + participants;
        }

        if (typeof participants === 'undefined') {
            Tooltip.html('<h5>' + name + '</h5>' +
            '<p>' + "No data available" + '</p>'
            )
            .style("opacity", 1)
        } else {
            Tooltip.html('<h5>' + name + '</h5>' +
                '<p>' + "Academic year: " + year + '</p>' +
                '<p>' + "Gender: " + gender + '</p>' +
                '<p>' + "Program type: " + program + '</p>' +
                '<p>' + "Education level: " + education + '</p>' +
                '<p>' + "Participants: " + parseInt(participants) + '</p>'
            )
                .style("opacity", 1)
        }

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

    const mousemove = function (event, d) {
        update_colors_and_values();
        var coordinates = d3.pointer(event)
        const x = coordinates[0] + 80
        const y = coordinates[1] + 10
        console.log(x,y)

        Tooltip
            .style("left", (parseFloat(x)) + "px")
            .style("top", (parseFloat(y)) + "px")
    }

    var mouseleave = function (event, d) {
        Tooltip
            .style("opacity", 0)
                        d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")
    }

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
        .attr('width', 350)
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
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave)
                .on("mousemove", mousemove)
        })
}


const json_viz1 = "data/viz1.json"
$.getJSON(json_viz1, function (data) {
    map(data)
});
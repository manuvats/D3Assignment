// Set up the SVG container
const width = 1000;
const height = 600;
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection for the UK map
const projection = d3.geoMercator()
    .center([-10, 55])
    .scale(2000)
    .translate([width / 2, height / 2]);

// Create a path generator
const path = d3.geoPath().projection(projection);

// Load and draw the UK map
d3.json("gb.json").then(function (uk) {
    // Draw the map
    console.log(uk);
    svg.selectAll("path")
        .data(uk.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#b8b8b8")
        .attr("stroke", "#fff");
});

// Function to plot towns on the map
function plotTowns(data, townCount) {
    // Remove existing town circles
    svg.selectAll(".town").remove();

    // Filter the data to select a subset of towns based on the townCount
    const filteredData = data.slice(0, townCount);

    // Plot new set of towns without animations
    const townCircles = svg.selectAll(".town")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "town")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1])
        .attr("r", 0)  // Set initial radius to 0
        .attr("fill", "steelblue")
        .attr("opacity", 0.9);

    // Add tooltips to towns
    townCircles.on("mouseover", function (d) {
        // Show custom tooltip on hover
        const tooltip = d3.select("#customTooltip");
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        tooltip.html(`Town: ${d.Town}<br>Population: ${d.Population}<br>County: ${d.County}`)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
        // Hide tooltip on mouseout
        const tooltip = d3.select("#customTooltip");
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    // Apply animations to the new towns
    townCircles.transition()
        .duration(500)
        .ease(d3.easeBounceOut)
        .attr("r", d => Math.sqrt(d.Population) / 50);

    // Show town details on click
    townCircles.on("click", function (d) {
        alert(`Town: ${d.Town}\nPopulation: ${d.Population}\nCounty: ${d.County}`);
    });
}

// Load the town data from a JSON file
d3.json("townsdata.json").then(function (townData) {
    const townCountInput = document.getElementById("townCount");
    let selectedTownCount = townCountInput.value;
    const sliderValue = document.getElementById("sliderValue");

    // Load and plot the initial set of towns
    plotTowns(townData, selectedTownCount);

    // Update the slider value display
    sliderValue.innerText = selectedTownCount;

    // Reload data and plot new set of towns when the button is clicked
    d3.select("#reloadButton").on("click", function () {
        selectedTownCount = townCountInput.value;
        plotTowns(townData, selectedTownCount);
        sliderValue.innerText = selectedTownCount;
    });

    // Update the number of towns displayed based on the slider
    townCountInput.addEventListener("input", function () {
        selectedTownCount = this.value;
        plotTowns(townData, selectedTownCount);
        sliderValue.innerText = selectedTownCount;
    });
});

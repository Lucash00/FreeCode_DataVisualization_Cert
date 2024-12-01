window.onload = function () {
    const countiesDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

    d3.json(countiesDataUrl).then(countiesData => {
        const width = 960;
        const height = 600;

        const svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const path = d3.geoPath();

        const counties = topojson.feature(countiesData, countiesData.objects.counties).features;

        svg.selectAll("path")
            .data(counties)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "lightblue")
            .attr("stroke", "#333")
            .attr("stroke-width", "0.5px");
    }).catch(err => {
        console.error("Error al cargar los datos:", err);
    });
};

window.onload = function () {
    const countiesDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
    const educationDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

    // Cargar los datos de TopoJSON y de educación
    Promise.all([
        d3.json(countiesDataUrl),
        d3.json(educationDataUrl)
    ]).then(([countiesData, educationData]) => {
        console.log(educationData);  // Aquí ves los datos cargados de educación

        const width = 960;
        const height = 600;

        // Crear el contenedor SVG
        const svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const path = d3.geoPath();

        // Convertir TopoJSON a GeoJSON para los condados
        const counties = topojson.feature(countiesData, countiesData.objects.counties).features;
        console.log(counties);  // Aquí ves los datos de los condados

        // Crear un diccionario de los datos de educación usando el código FIPS
        const educationByFips = {};
        educationData.forEach(d => {
            educationByFips[d.fips] = d.bachelorsOrHigher;
        });

        // Establecer un rango de colores basado en los valores de educación
        const colorScale = d3.scaleQuantize()
            .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
            .range(["#C4E6FF", "#8BC8F6", "#64AFE5", "#4897D1", "#247EC1", "#0062A9"]);

        // Dibujar los condados en el mapa
        svg.selectAll("path")
            .data(counties)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("fill", d => {
                const education = educationByFips[d.id];
                return education ? colorScale(education) : "#ccc";
            })
            .attr("stroke", "#333")
            .attr("stroke-width", "0.5px")
            .attr("data-fips", d => d.id)
            .attr("data-education", d => educationByFips[d.id])
            .on("mouseover", function (event, d) {
                const education = educationByFips[d.id];
                const countyName = educationData.find(e => e.fips === d.id)?.area_name || 'Unknown County';
                const tooltip = d3.select("#tooltip");

                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`${countyName}: ${education}% with bachelor's degree or higher`)
                    .attr("data-education", education)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", function () {
                d3.select("#tooltip").transition().duration(500).style("opacity", 0);
            });

        // Crear la leyenda
        const legend = d3.select("#legend");

        const legendWidth = 200;
        const legendHeight = 10;

        const legendScale = d3.scaleLinear()
            .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
            .range([0, legendWidth]);

        const legendSvg = legend.append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        legendSvg.append("g")
            .attr("class", "legend")
            .selectAll("rect")
            .data(colorScale.range())
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * (legendWidth / colorScale.range().length))
            .attr("width", legendWidth / colorScale.range().length)
            .attr("height", legendHeight)
            .attr("fill", d => d);

        // Añadir texto a la leyenda
        legend.append("text")
            .attr("x", 0)
            .attr("y", 30)
            .text("Education (Bachelor's Degree or Higher)")
            .style("font-size", "14px");

    }).catch(err => {
        console.error("Error al cargar los datos:", err);
    });
};
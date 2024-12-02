document.addEventListener("DOMContentLoaded", () => {
    const width = 960;
    const height = 600;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select("#tooltip");
    tooltip.style("opacity", 0);

    const links = document.querySelectorAll("nav a");

    function loadTreemap(url) {
        d3.json(url).then(data => {
            d3.select("#treemap").html(""); 
            d3.select("#legend").html(""); 

            const root = d3.hierarchy(data)
                .sum(d => +d.value)
                .sort((a, b) => b.value - a.value);

            const treemap = d3.treemap()
                .size([width, height])
                .paddingInner(1);

            treemap(root);

            const svg = d3.select("#treemap")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

                const nodes = svg.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0})`)
                .on("mouseover", (event, d) => {
                    // Función para hacer los números más legibles
                    function formatValue(value) {
                        if (value >= 1e9) { 
                            return (value / 1e9).toFixed(2) + "B";  
                        } else if (value >= 1e6) {  
                            return (value / 1e6).toFixed(2) + "M";  
                        } else if (value >= 1e3) {  
                            return (value / 1e3).toFixed(2) + "K";  
                        }
                        return value;
                    }
                
                    tooltip.style("opacity", 1)
                        .html(`${d.data.name} <strong>${d.data.category}</strong>: ${formatValue(d.data.value)}`)
                        .attr("data-value", d.data.value);
                })
                
                .on("mousemove", (event) => {
                    tooltip.style("left", `${event.pageX + 10}px`)
                           .style("top", `${event.pageY - 30}px`);
                })
                .on("mouseout", () => {
                    tooltip.style("opacity", 0);
                });
            
            nodes.append("rect")
                .attr("class", "tile")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => color(d.data.category))
                .attr("data-name", d => d.data.name)
                .attr("data-category", d => d.data.category)
                .attr("data-value", d => d.data.value);
            
            nodes.append("text")
                .selectAll("tspan")
                .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
                .enter()
                .append("tspan")
                .attr("x", 4)
                .attr("y", (d, i) => 13 + i * 10)
                .text(d => d);
            

            const categories = root.leaves().map(d => d.data.category)
                .filter((v, i, a) => a.indexOf(v) === i);

            const legendContainer = d3.select("#legend")
                .append("div")
                .attr("class", "legend-container");

            const columns = 3; 
            const rows = Math.ceil(categories.length / columns);

            // Crear una matriz bidimensional para agrupar las categorías
            const groupedCategories = Array.from({ length: columns }, (_, i) =>
                categories.slice(i * rows, (i + 1) * rows)
            );

            // Crear las columnas y añadir los elementos de la leyenda
            groupedCategories.forEach(columnCategories => {
                const column = legendContainer.append("div").attr("class", "legend-column");

                column.selectAll(".legend-item-rect")
                    .data(columnCategories)
                    .enter()
                    .append("div")
                    .attr("class", "legend-item-rect")
                    .html(d => `
                        <svg width="20" height="20">
                            <rect class="legend-item" fill="${color(d)}" width="20" height="20"></rect>
                        </svg>
                        <span>${d}</span>
                    `);
            });
        });
    }

    links.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const url = link.getAttribute("data-url");
            const title = link.textContent;
            document.getElementById("title").textContent = `${title} Sales`;
            document.getElementById("description").textContent = `Top 100 ${title.toLowerCase()} that have generated the most money grouped by category`;
            loadTreemap(url);
        });
    });

    // Cargar el primer treemap por defecto
    loadTreemap("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json");
});

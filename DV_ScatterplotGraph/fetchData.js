window.onload = function () {
    // Configuración inicial del SVG y dimensiones
    const width = 900;
    const height = 500;
    const margin = { top: 50, right: 50, bottom: 50, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Seleccionar el SVG y establecer dimensiones
    const svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);

    // Cargar los datos desde la URL proporcionada
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    d3.json(url).then(data => {
        // Ajustar el dominio X incluyendo un año extra al principio y al final
        const xDomain = d3.extent(data, d => new Date(d.Year, 0));
        xDomain[0] = new Date(xDomain[0].getFullYear() - 1, 0); 
        xDomain[1] = new Date(xDomain[1].getFullYear() + 1, 0); 

        // Parsear los tiempos del dominio Y
        const times = data.map(d => d3.timeParse("%M:%S")(d.Time));
        const yDomain = d3.extent(times);

        // Extender el dominio Y: -5 segundo al mínimo y +5 segundo al máximo
        yDomain[0] = new Date(yDomain[0].getTime() - 5000); 
        yDomain[1] = new Date(yDomain[1].getTime() + 5000); 

        // Crear escalas
        const xScale = d3.scaleTime()
            .domain(xDomain) 
            .range([0, innerWidth]);

        const yScale = d3.scaleTime()
            .domain(yDomain) 
            .range([0, innerHeight]);

        // Crear los ejes
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
        const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

        // Añadir el eje X al gráfico
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
            .call(xAxis);

        // Añadir etiqueta para el eje X
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Year");

        // Añadir el eje Y al gráfico
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(yAxis);

        // Añadir etiqueta para el eje Y
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -(height / 2))
            .attr("y", 20)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Time (Minutes:Seconds)");


        // Añadir puntos de datos
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(new Date(d.Year, 0)) + margin.left)
            .attr("cy", d => yScale(d3.timeParse("%M:%S")(d.Time)) + margin.top)
            .attr("r", 5)
            .attr("fill", d => d.Doping ? "red" : "green")
            .attr("data-xvalue", d => d.Year)
            .attr("data-yvalue", d => d3.timeParse("%M:%S")(d.Time));

        // Crear la leyenda
        const legendData = [
            { color: "red", text: "Doping allegations" },
            { color: "green", text: "No allegations" }
        ];
        // Contenedor de la leyenda
        const legendGroup = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${width - margin.right - 150}, ${margin.top})`); 

        // Añadir título de la leyenda
        legendGroup.append("text")
            .attr("id", "legend-title")
            .attr("x", 0)
            .attr("y", -20) 
            .style("text-anchor", "start")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Legend");

        // Añadir un rectángulo como fondo de la leyenda
        const legendBackground = legendGroup.append("rect")
            .attr("id", "legend-background")
            .attr("x", -10)
            .attr("y", -10)
            .attr("width", 160) 
            .attr("height", 50) 
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("rx", 5) 
            .attr("ry", 5); 

        // Añadir los elementos de la leyenda
        const legend = legendGroup.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        // Añadir los círculos para la leyenda
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .style("fill", d => d.color);

        // Añadir el texto para la leyenda
        legend.append("text")
            .attr("x", 15)
            .attr("y", 5)
            .style("font-size", "12px")
            .text(d => d.text);


        // Crear el tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute");

        // Crear las líneas vertical y horizontal (inicialmente ocultas)
        const verticalLine = svg.append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .style("opacity", 0);

        const horizontalLine = svg.append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .style("opacity", 0);

        // Añadir eventos para mostrar y ocultar el tooltip y las líneas
        svg.selectAll(".dot")
            .on("mouseover", (event, d) => {
                const pointColor = d.Doping ? "red" : "green"; 

                // Mostrar el tooltip
                tooltip.transition().style("opacity", 1);
                tooltip.html(
                    `Name: ${d.Name}<br>
             Year: ${d.Year}<br>
             Time: ${d.Time}<br>
             Doping: ${d.Doping || "None"}`
                )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .attr("data-year", d.Year);

                // Mostrar las líneas y posicionarlas con el color correspondiente
                verticalLine.transition().style("opacity", 1)
                    .attr("stroke", pointColor) 
                    .attr("x1", xScale(new Date(d.Year, 0)) + margin.left)
                    .attr("y1", yScale(d3.timeParse("%M:%S")(d.Time)) + margin.top) 
                    .attr("x2", xScale(new Date(d.Year, 0)) + margin.left)
                    .attr("y2", height - margin.bottom); 

                horizontalLine.transition().style("opacity", 1)
                    .attr("stroke", pointColor) 
                    .attr("x1", margin.left)
                    .attr("y1", yScale(d3.timeParse("%M:%S")(d.Time)) + margin.top)
                    .attr("x2", xScale(new Date(d.Year, 0)) + margin.left)
                    .attr("y2", yScale(d3.timeParse("%M:%S")(d.Time)) + margin.top);
            })
            .on("mouseout", () => {
                tooltip.transition().style("opacity", 0);
                verticalLine.transition().style("opacity", 0);
                horizontalLine.transition().style("opacity", 0);
            });

    });
};

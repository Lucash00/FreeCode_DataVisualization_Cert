window.onload = function () {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  
    // Dimensiones del gráfico
    const width = 1200;
    const height = 600;
    const padding = 80;
  
    // Colores para el mapa de calor
    const colors = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
    // Crear el contenedor SVG
    const svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height +50);
  
    // Obtener datos del JSON
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const baseTemperature = data.baseTemperature;
        const dataset = data.monthlyVariance;
  
        // Escalas
        const xScale = d3.scaleBand()
          .domain(dataset.map(d => d.year))
          .range([padding, width - padding]);
  
        const yScale = d3.scaleBand()
          .domain(d3.range(1, 13))
          .range([padding, height - padding]);
  
        const colorScale = d3.scaleQuantize()
          .domain([
            baseTemperature + d3.min(dataset, d => d.variance),
            baseTemperature + d3.max(dataset, d => d.variance)
          ])
          .range(colors);
  
        // Ejes
        const xAxis = d3.axisBottom(xScale)
          .tickValues(xScale.domain().filter(year => year % 10 === 0))
          .tickFormat(d3.format("d"));
  
        const yAxis = d3.axisLeft(yScale)
          .tickFormat(d => months[d - 1]);
  
        svg.append("g")
          .attr("id", "x-axis")
          .attr("transform", `translate(0, ${height - padding})`)
          .call(xAxis);
  
        svg.append("g")
          .attr("id", "y-axis")
          .attr("transform", `translate(${padding}, 0)`)
          .call(yAxis);
  
        // **Agregar etiquetas para los ejes**
        svg.append("text")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", height - padding / 2 + 0)
          .text("Years")
          .attr("class", "axis-label");

        svg.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", `rotate(-90)`)
          .attr("x", -height / 2)
          .attr("y", padding / 2 - 20)
          .text("Months")
          .attr("class", "axis-label");
  
        // Dibujar celdas
        svg.selectAll(".cell")
          .data(dataset)
          .enter()
          .append("rect")
          .attr("class", "cell")
          .attr("x", d => xScale(d.year))
          .attr("y", d => yScale(d.month))
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", d => colorScale(baseTemperature + d.variance))
          .attr("data-month", d => d.month - 1)
          .attr("data-year", d => d.year)
          .attr("data-temp", d => baseTemperature + d.variance)
          .on("mouseover", function (event, d) {
            const tooltip = d3.select("#tooltip")
              .style("visibility", "visible")
              .attr("data-year", d.year)
              .html(`
                Year: ${d.year}<br>
                Month: ${months[d.month - 1]}<br>
                Temp: ${(baseTemperature + d.variance).toFixed(2)}°C<br>
                Variance: ${d.variance.toFixed(2)}°C
              `);
            tooltip.style("top", (event.pageY - 50) + "px")
              .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseout", () => d3.select("#tooltip").style("visibility", "hidden"));
  
        // Crear leyenda
        const legendWidth = 400;
        const legendHeight = 20;
  
        const legendScale = d3.scaleLinear()
          .domain(colorScale.domain())
          .range([0, legendWidth]);
  
        const legendAxis = d3.axisBottom(legendScale)
          .tickFormat(d3.format(".1f"));
  
        const legend = svg.append("g")
          .attr("id", "legend")
          .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - padding / 3})`);
  
        legend.selectAll("rect")
          .data(colors)
          .enter()
          .append("rect")
          .attr("x", (d, i) => i * (legendWidth / colors.length))
          .attr("y", 0)
          .attr("width", legendWidth / colors.length)
          .attr("height", legendHeight)
          .attr("fill", d => d);
  
        legend.append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis);
      });
  
    // Crear tooltip
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("visibility", "hidden");
  };

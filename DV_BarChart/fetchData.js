// Asegurarse de que el código se ejecute cuando el DOM esté listo
window.onload = function() {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

  async function fetchData() {
    try {
      // Hacer la solicitud HTTP
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.data) {
        const gdpData = data.data;

        // Procesar los datos
        const processedData = gdpData.map(item => ({
          date: new Date(item[0]),
          gdp: item[1]
        }));

        // Configuración para el gráfico
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 900 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleTime()
          .domain(d3.extent(processedData, d => d.date))
          .range([0, width]);

        const y = d3.scaleLinear()
          .domain([0, d3.max(processedData, d => d.gdp)])
          .range([height, 0]);

        svg.append("g")
        .attr("class", "x-axis")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

        svg.append("g")
          .attr("class", "y-axis")
          .attr("id", "y-axis")
          .call(d3.axisLeft(y).ticks(6));

        // barras del gráfico
        svg.selectAll(".bar")
          .data(processedData)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("data-date", d => d.date.toISOString().split('T')[0])  // Agregar data-date
          .attr("data-gdp", d => d.gdp)  // Agregar data-gdp
          .attr("x", d => x(d.date))
          .attr("y", d => y(d.gdp))
          .attr("width", width / processedData.length)
          .attr("height", d => height - y(d.gdp));

        // Crear el tooltip en el DOM
        const tooltip = d3.select("body").append("div").attr("id", "tooltip");

        // Hover sobre una barra
        svg.selectAll(".bar")
          .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);  // Mostrar el tooltip
            tooltip.html(`
              <p>Date: ${d.date.toISOString().split('T')[0]}</p>
              <p>GDP: $${d.gdp.toFixed(2)}</p>
            `)
            .attr("data-date", d.date.toISOString())
            .style("left", (event.pageX + 10) + "px")  // Posicionar tooltip en X
            .style("top", (event.pageY - 28) + "px"); // Posicionar tooltip en Y
          })
          .on("mouseout", function() {
            tooltip.transition().duration(200).style("opacity", 0);  // Ocultar el tooltip
          });

        console.log("Datos procesados correctamente y gráfico generado.");
      } else {
        console.log("No se pudo procesar los datos correctamente.");
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }

  fetchData();
};

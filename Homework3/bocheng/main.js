d3.csv("data/pokemon.csv").then(data => {
  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 20, bottom: 60, left: 60 };

  const svg = d3.select("#view1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand().padding(0.2);
  const y = d3.scaleLinear();

  const xAxisG = svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`);

  const yAxisG = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("class", "y-axis");

  const title = svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .attr("class", "bar-title");

  function updateBarChart(attribute) {
    let typeCounts = d3.rollup(
      data,
      v => v.length,
      d => d[attribute]
    );

    let typeData = Array.from(typeCounts, ([type, count]) => ({ type, count }))
                        .filter(d => d.type !== "");

    // Optional sort before rendering (default by count)
    const sortType = d3.select("#sortSelect").property("value");
    if (sortType === "count") {
      typeData.sort((a, b) => d3.descending(a.count, b.count));
    } else {
      typeData.sort((a, b) => d3.ascending(a.type, b.type));
    }

    x.domain(typeData.map(d => d.type))
     .range([margin.left, width - margin.right]);

    y.domain([0, d3.max(typeData, d => d.count)])
     .nice()
     .range([height - margin.bottom, margin.top]);

    const bars = svg.selectAll("rect")
      .data(typeData, d => d.type);

    bars.enter()
      .append("rect")
      .attr("x", d => x(d.type))
      .attr("y", y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "steelblue")
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        svg.selectAll("rect").attr("fill", "steelblue");
        d3.select(this).attr("fill", "orange");

        d3.selectAll("#checkboxContainer2 input[type=checkbox]")
          .property("checked", function () {
            return this.value === d.type;
          });

        d3.selectAll("#checkboxContainer2 input[type=checkbox]").dispatch("change");

        d3.select("#typeSelect").property("value", d.type).dispatch("change");
      })
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("display", "block")
          .html(`<strong>${d.type}</strong><br>Count: ${d.count}`);
      })
      .on("mousemove", function (event) {
        d3.select("#tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("display", "none");
      })
      .merge(bars)
      .transition()
      .duration(750)
      .attr("x", d => x(d.type))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.count));
  

    bars.exit()
      .transition()
      .duration(500)
      .attr("y", y(0))
      .attr("height", 0)
      .remove();

    xAxisG.transition()
      .duration(750)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    yAxisG.transition()
      .duration(750)
      .call(d3.axisLeft(y));

    title.text(`Distribution of Pokémon by ${attribute}`);
  }

  // Initial render
  updateBarChart("Type_1");

  // When attribute changes
  d3.select("#barAttrSelect").on("change", function () {
    updateBarChart(this.value);
  });

  // When sort changes
  d3.select("#sortSelect").on("change", function () {
    updateBarChart(d3.select("#barAttrSelect").property("value"));
  });
});



d3.csv("data/pokemon.csv").then(data => {
  data.forEach(d => {
    d.Height_m = +d.Height_m;
    d.Weight_kg = +d.Weight_kg;
  });

  const width = 500;
  const height = 320;
  const margin = { top: 20, right: 40, bottom: 60, left: 60 };

  const svg = d3.select("#scatterContainer").append("svg")
    .attr("width", width)
    .attr("height", height);
  const zoomGroup = svg.append("g");
  const x = d3.scaleLinear().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  const xAxisG = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
  const yAxisG = svg.append("g").attr("transform", `translate(${margin.left},0)`);

  const circleGroup = svg.append("g");

  const allTypes = [...new Set(data.map(d => d.Type_1))].sort();
  const fixedColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
  let typeColorMap = {};
  let activeTypes = [];

  function drawScatter() {
    const filtered = data.filter(d => activeTypes.includes(d.Type_1));

    x.domain(d3.extent(filtered, d => d.Height_m)).nice();
    y.domain(d3.extent(filtered, d => d.Weight_kg)).nice();

    xAxisG.call(d3.axisBottom(x));
    yAxisG.call(d3.axisLeft(y));

    svg.selectAll(".xLabel").remove();
    svg.selectAll(".yLabel").remove();

    svg.append("text")
      .attr("class", "xLabel")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .text("Height (m)");

    svg.append("text")
      .attr("class", "yLabel")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Weight (kg)");

    const circles = circleGroup.selectAll("circle").data(filtered, d => d.Name);

   circles.enter()
  .append("circle")
  .attr("r", 5)
  .attr("cx", d => x(d.Height_m))
  .attr("cy", d => y(d.Weight_kg))
  .attr("fill", d => typeColorMap[d.Type_1])
  .style("opacity", 0)
  .on("mouseover", function (event, d) {
    d3.select("#tooltip")
      .style("display", "block")
      .html(`<strong>${d.Name}</strong><br>Height: ${d.Height_m} m<br>Weight: ${d.Weight_kg} kg`);
  })
  .on("mousemove", function (event) {
    d3.select("#tooltip")
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
  })
  .on("mouseout", function () {
    d3.select("#tooltip").style("display", "none");
  })
  .transition()
  .duration(500)
  .style("opacity", 0.7);


circles
  .on("mouseover", function (event, d) {
    d3.select("#tooltip")
      .style("display", "block")
      .html(`<strong>${d.Name}</strong><br>Height: ${d.Height_m} m<br>Weight: ${d.Weight_kg} kg`);
  })
  .on("mousemove", function (event) {
    d3.select("#tooltip")
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
  })
  .on("mouseout", function () {
    d3.select("#tooltip").style("display", "none");
  })
  .transition()
  .duration(500)
  .attr("cx", d => x(d.Height_m))
  .attr("cy", d => y(d.Weight_kg))
  .attr("fill", d => typeColorMap[d.Type_1])
  .style("opacity", 0.7);


circles.exit()
  .transition()
  .duration(500)
  .style("opacity", 0)
  .remove();

    circles.exit().remove();
  }
  const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .translateExtent([[0, 0], [width, height]])
  .on("zoom", zoomed);

svg.call(zoom);

function zoomed(event) {
  zoomGroup.attr("transform", event.transform);
}

  const checkboxContainer = d3.select("#checkboxContainer2");
  allTypes.forEach(type => {
    const label = checkboxContainer.append("label").style("margin-right", "12px");
    label.append("input")
      .attr("type", "checkbox")
      .attr("value", type)
      .on("change", updateSelection);
    label.append("span").text(" " + type);
  });

  function updateSelection() {
    activeTypes = [];
    typeColorMap = {};
    let count = 0;

    checkboxContainer.selectAll("input[type=checkbox]").each(function () {
      if (this.checked) {
        if (count >= 5) {
          alert("Please select at most 5 types.");
          d3.select(this).property("checked", false);
        } else {
          const type = this.value;
          typeColorMap[type] = fixedColors[count];
          activeTypes.push(type);
          count++;
        }
      }
    });

    drawScatter();
  }

  drawScatter(); // Initial draw
});

d3.csv("data/pokemon.csv").then(data => {
  const allStats = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
  data.forEach(d => {
    allStats.forEach(k => d[k] = +d[k]);
  });

  const typeOptions = [...new Set(data.map(d => d.Type_1))].sort();
  const fixedColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
  const selectedMap = new Map();

  const width = 500, height = 500, radius = 180;
  const centerX = width / 2, centerY = height / 2;

  const svg = d3.select("#starPlot").append("svg")
    .attr("width", width)
    .attr("height", height);

  const polygonsGroup = svg.append("g");
  const typeSelect = d3.select("#typeSelect");
  const nameContainer = d3.select("#nameCheckboxContainer");
  const legend = d3.select("#starLegend");

  function getSelectedStats() {
    const group = d3.select("#statGroup").property("value");
    if (group === "offense") return ["Attack", "Sp_Atk", "Speed"];
    if (group === "defense") return ["Defense", "Sp_Def", "HP"];
    return allStats;
  }

  function getSortedStatsByMean() {
    const statKeys = getSelectedStats();
    const means = statKeys.map(stat => {
      const mean = d3.mean([...selectedMap.values()], d => d[stat]);
      return { stat, mean };
    });
    means.sort((a, b) => d3.descending(a.mean, b.mean));
    return means.map(d => d.stat);
  }

  function drawStars(pokemonList, colorMap) {
    const statKeys = getSortedStatsByMean();
const angleSlice = (2 * Math.PI) / statKeys.length;

const radialScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d3.max(statKeys.map(k => d[k])))])
  .range([0, radius]);

const polygons = polygonsGroup.selectAll("polygon")
  .data(pokemonList, d => d.Name);

// ENTER + UPDATE
polygons.enter()
  .append("polygon")
  .attr("fill", d => colorMap[d.Name])
  .attr("stroke", d => colorMap[d.Name])
  .attr("fill-opacity", 0.0) // start transparent
  .attr("stroke-width", 2)
  .merge(polygons)
  .transition()
  .duration(800)
  .attr("points", d => {
    const points = statKeys.map((key, idx) => {
      const angle = idx * angleSlice;
      const r = radialScale(d[key]);
      const x = centerX + r * Math.cos(angle - Math.PI / 2);
      const y = centerY + r * Math.sin(angle - Math.PI / 2);
      return [x, y];
    });
    return points.map(p => p.join(",")).join(" ");
  })
  .attr("fill-opacity", 0.3);  // fade in

// EXIT
polygons.exit()
  .transition()
  .duration(400)
  .attr("fill-opacity", 0)
  .remove();
  }

  function updateRadar() {
    const statKeys = getSortedStatsByMean();
    const angleSlice = (2 * Math.PI) / statKeys.length;

    d3.select("#statDisplay").text("Stats: " + statKeys.join(", "));
    svg.selectAll("line").remove();
    svg.selectAll("text").filter(function () {
      return !this.classList.contains("legendLabel");
    }).remove();

    statKeys.forEach((key, i) => {
      const angle = i * angleSlice;
      const x = centerX + radius * Math.cos(angle - Math.PI / 2);
      const y = centerY + radius * Math.sin(angle - Math.PI / 2);
      svg.append("line")
        .attr("x1", centerX).attr("y1", centerY)
        .attr("x2", x).attr("y2", y)
        .attr("stroke", "#ccc");
      svg.append("text")
        .attr("x", x).attr("y", y)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .text(key);
    });

    const selectedData = [...selectedMap.values()];
    const colorMap = {};
    selectedData.forEach((d, i) => {
      colorMap[d.Name] = fixedColors[i];
    });

    drawStars(selectedData, colorMap);

    legend.html("");
    selectedData.forEach(p => {
      const row = legend.append("div").style("margin-bottom", "4px");
      row.append("span")
        .style("display", "inline-block")
        .style("width", "12px")
        .style("height", "12px")
        .style("margin-right", "6px")
        .style("background-color", colorMap[p.Name]);

      row.append("span")
        .text(`${p.Name} (${p.Type_1})`)
        .style("cursor", "pointer")
        .on("mouseover", function () {
          const stats = statKeys.map(k => `${k}: ${p[k]}`).join("<br>");
          d3.select("#tooltip")
            .style("display", "block")
            .html(`<strong>${p.Name}</strong><br>${stats}`);
        })
        .on("mousemove", function (event) {
          d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });
    });
  }

  typeSelect.append("option")
    .attr("value", "")
    .attr("disabled", true)
    .attr("selected", true)
    .text("-- Select a Type --");

  typeOptions.forEach(type => {
    typeSelect.append("option")
      .attr("value", type)
      .text(type);
  });

  typeSelect.on("change", function () {
    const selectedType = this.value;
    const pokemons = data.filter(d => d.Type_1 === selectedType);

    nameContainer.html("");
    const section = nameContainer.append("div").style("margin-bottom", "6px");
    section.append("strong").text(`${selectedType}: `);

    pokemons.forEach(p => {
      const label = section.append("label").style("margin-right", "10px");
      const checkbox = label.append("input")
        .attr("type", "checkbox")
        .attr("value", p.Name)
        .property("checked", selectedMap.has(p.Name))
        .on("change", function () {
          if (this.checked) {
            if (selectedMap.size >= 5) {
              alert("Please select at most 5 Pokémon.");
              this.checked = false;
              return;
            }
            selectedMap.set(p.Name, p);
          } else {
            selectedMap.delete(p.Name);
          }
          updateRadar();
        });
      label.append("span").text(" " + p.Name);
    });
  });

  d3.select("#statGroup").on("change", updateRadar);
  updateRadar();
});

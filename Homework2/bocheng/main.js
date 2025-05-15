d3.csv("data/pokemon.csv").then(data => {
  // Count Pokémon per Type 1
  const typeCounts = d3.rollup(
    data,
    v => v.length,
    d => d["Type_1"]
  );

  const typeData = Array.from(typeCounts, ([type, count]) => ({ type, count }));

  // Set up SVG dimensions
  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 20, bottom: 60, left: 60 };

  const svg = d3.select("#view1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(typeData.map(d => d.type))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(typeData, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Bars
  svg.selectAll("rect")
    .data(typeData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.type))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.count))
    .attr("fill", "steelblue");

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Distribution of Pokémon Types: Count of Pokémon per Type_1");
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
      .merge(circles)
      .attr("cx", d => x(d.Height_m))
      .attr("cy", d => y(d.Weight_kg))
      .attr("fill", d => typeColorMap[d.Type_1])
      .attr("opacity", 0.7);

    circles.exit().remove();
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
  const statKeys = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];
  data.forEach(d => {
    statKeys.forEach(k => d[k] = +d[k]);
  });

  const typeOptions = [...new Set(data.map(d => d.Type_1))].sort();
  const fixedColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
  const selectedMap = new Map();  // Keeps selected Pokémon by name

  const width = 500, height = 500, radius = 180;
  const centerX = width / 2, centerY = height / 2;
  const angleSlice = (2 * Math.PI) / statKeys.length;

  const svg = d3.select("#starPlot").append("svg")
    .attr("width", width)
    .attr("height", height);

  const radialScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(statKeys.map(k => d[k])))])
    .range([0, radius]);

  // Draw radar axes
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

  const polygonsGroup = svg.append("g");

  function drawStars(pokemonList, colorMap) {
    polygonsGroup.selectAll("*").remove();

    pokemonList.forEach((p, i) => {
      const points = statKeys.map((key, idx) => {
        const angle = idx * angleSlice;
        const r = radialScale(p[key]);
        const x = centerX + r * Math.cos(angle - Math.PI / 2);
        const y = centerY + r * Math.sin(angle - Math.PI / 2);
        return [x, y];
      });

      polygonsGroup.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("fill", colorMap[p.Name])
        .attr("fill-opacity", 0.3)
        .attr("stroke", colorMap[p.Name])
        .attr("stroke-width", 2);

    });
  }

  const typeSelect = d3.select("#typeSelect");
  const nameContainer = d3.select("#nameCheckboxContainer");
  const legend = d3.select("#starLegend");

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

    nameContainer.html(""); // clear only the visible checkbox list

    const section = nameContainer.append("div").style("margin-bottom", "6px");
    section.append("strong").text(selectedType + ": ");

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

  function updateRadar() {
    const selectedData = [...selectedMap.values()];
    const colorMap = {};
    selectedData.forEach((d, i) => {
      colorMap[d.Name] = fixedColors[i];
    });

    drawStars(selectedData, colorMap);

    // Update legend
    legend.html("");
    selectedData.forEach(p => {
      const row = legend.append("div").style("margin-bottom", "4px");
      row.append("span")
        .style("display", "inline-block")
        .style("width", "12px")
        .style("height", "12px")
        .style("margin-right", "6px")
        .style("background-color", colorMap[p.Name]);
      row.append("span").text(p.Name + " (" + p.Type_1 + ")");
    });
  }
});



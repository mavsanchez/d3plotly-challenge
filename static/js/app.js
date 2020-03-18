let subject_id = d3.select("#selDataset");
let metadata_id = d3.select("#sample-metadata");
let bubble_id = d3.select("#bubble");
let json_raw = {};

function render_meta(idNum) {
    let metadata_data = json_raw.metadata;
    let selectedMeta = metadata_data.filter((meta) => { if (parseInt(meta.id) == parseInt(idNum)) return true; })[0];
    // Put metadata information to DOM
    let htmlMeta = ""
    for (let [key, value] of Object.entries(selectedMeta)) {
        htmlMeta += key + " : " + value + "<br/>";
    }
    metadata_id.html(htmlMeta);
}

function render_barchart(mapped, idNum) {

    // Create and plot the top 10
    let trace = {
        x: mapped.map(row => row.sample_values),
        y: mapped.map(row => "OTU " + row.otu_id),
        text: mapped.map(row => row.otu_labels),
        name: idNum,
        type: "bar",
        orientation: "h"
    }
    let chart_data = [trace];
    let layout = {
        title: "Sample ID " + idNum + " Results",
        margin: { l: 100, r: 100, t: 100, b: 100 }
    }
    Plotly.newPlot("bar", chart_data, layout);
}

function render_bubblechart(mapped, idNum) {
    bubble_id.html("");

    // Use otu_ids for the x values.
    // Use sample_values for the y values.
    // Use sample_values for the marker size.
    // Use otu_ids for the marker colors.
    // Use otu_labels for the text values.

    let otus = mapped.map(row => row.otu_id);
    let values = mapped.map(row => row.sample_values = +row.sample_values );
    let labels = mapped.map(row => row.otu_labels);

    let svgWidth = 500;
    let svgHeight = 300;

    // Define the chart's margins as an object
    let chartMargin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    };

    // Define dimensions of the chart area
    let chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    let chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

    let svg = d3.select('#bubble')
        .append('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    let chartGroup = svg.append("g")
        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    let xScale = d3.scaleBand()
        .domain(otus)
        .range([0, chartWidth]);

    let yScale = d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([chartHeight, 0]);
    
    let rScale = d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([10, chartMargin.top]);

    let opacity = d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([1, .5]);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let yAxis = d3.axisLeft(yScale);
    let xAxis = d3.axisBottom(xScale);

    chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis);

    chartGroup.append('g')
        .call(yAxis);

    chartGroup.selectAll("circle")
        .data(values)
        .enter()
        .insert("circle")
        .attr("cx", (data, index) => xScale(otus[index]))
        .attr("cy", data => yScale(data))
        .attr("opacity", data => opacity(data))
        .attr("r", data => { return `${rScale(data)}`})
        .style("fill", (data, index) => colorScale(otus[index]))
        .append("title")
        .text((data, index) => `${data}\n${labels[index]}`);

}

function optionChanged(idNum) {
    let samples_data = json_raw.samples;

    let selectedSample = samples_data.filter((sample) => { if (parseInt(sample.id) == parseInt(idNum)) return true; })[0];

    //Build a selected samples array of JSON objects
    let mapped = [];
    for (i = 0; i < selectedSample.sample_values.length; i++) {
        mapped.push({
            otu_id: selectedSample.otu_ids[i],
            sample_values: selectedSample.sample_values[i],
            otu_labels: selectedSample.otu_labels[i]
        });
    }

    // Slicing, sorting, reversing the returned samples
    mapped = mapped.sort((a, b) => parseInt(b.sample_values) - parseInt(a.sample_values));
    mapped = mapped.slice(0, 10);
    mapped = mapped.reverse();
    
    console.log(selectedSample.sample_values.length)
    render_meta(idNum);
    render_barchart(mapped, idNum);
    
    mapped = mapped.sort((a, b) => parseInt(a.otu_id) - parseInt(b.otu_id));
    console.log(mapped);
    render_bubblechart(mapped, idNum);

}

// Initialize
d3.json("samples.json").then((data) => {
    json_raw = data;

    subject_id.selectAll("option")
        .data(json_raw.names)
        .enter()
        .append('option')
        .text(data => data)
        .attr('value', data => data);

    optionChanged(Math.min(parseInt(json_raw.names)));
});

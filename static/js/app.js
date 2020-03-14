
// id: "940"
// otu_ids: (80)[1167, 2859, 482, 2264, 41, 1189, 352, 189, 2318, 1977, 3450, 874, 1959, 2191, 1950, 2077, 2275, 944, 2184, 2244, 2024, 2419, 2811, 165, 2782, 2247, 2011, 2396, 830, 2964, 1795, 2722, 307, 2178, 2908, 1193, 2167, 1208, 2039, 1274, 2739, 2737, 1314, 1962, 2186, 2335, 2936, 907, 833, 2483, 2475, 2491, 2291, 159, 2571, 2350, 2342, 2546, 725, 170, 1505, 513, 259, 1169, 258, 1232, 1497, 1498, 1503, 412, 2235, 1960, 1968, 121, 2065, 340, 2110, 2188, 357, 342]
// sample_values: (80)[163, 126, 113, 78, 71, 51, 50, 47, 40, 40, 37, 36, 30, 28, 25, 23, 22, 19, 19, 14, 13, 13, 13, 12, 12, 11, 11, 11, 10, 10, 10, 8, 7, 7, 7, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
// otu_labels: (80)["Bacteria;Bacteroidetes;Bacteroidia;Bactero
let subject_id = d3.select("#selDataset");
let metadata_id = d3.select("#sample-metadata");
let json_raw = {};

// function init(){
//     let data = [
//         {
//             x: [1, 2, 3, 4, 5],
//             y: [1, 2, 4, 8, 16]
//         }
//     ];
//     Plotly.newPlot("bar", data);
// }

function set_options(html_obj, lst) {
    lst_dist = new Set(lst);
    lst_dist.forEach((opt) => {
        let new_option = html_obj.append("option").text(opt.toUpperCase());
        new_option.attr("value", opt);
    });
}

function optionChanged(idNum){
    let samples_data = json_raw.samples;
    let metadata_data = json_raw.metadata;
    console.log(metadata_data);
    let selectedSample = samples_data.filter((sample) => { if (parseInt(sample.id) == parseInt(idNum)) return true; })[0];
    let selectedMeta = metadata_data.filter((meta) => { if (parseInt(meta.id) == parseInt(idNum)) return true; })[0];
    // id: 940
    // ethnicity: "Caucasian"
    // gender: "F"
    // age: 24
    // location: "Beaufort/NC"
    // bbtype: "I"
    // wfreq: 2
    // let htmlMeta = "<ul style='list-style-type: none'>"
    let htmlMeta = ""
    for (let [key, value] of Object.entries(selectedMeta)) {
        // htmlMeta+= "<li>"+key+" : "+value+"</li>";
        htmlMeta+= key+" : "+value+"<br/>";
    }

    metadata_id.html(htmlMeta);
    // (selectedMeta.ethnicity);

    let mapped = []
    for (i = 0; i < selectedSample.sample_values.length;i++){
        let temp_d = {};
        temp_d.otu_id = selectedSample.otu_ids[i];
        temp_d.sample_values = selectedSample.sample_values[i];
        temp_d.otu_labels = selectedSample.otu_labels[i];
        mapped.push(temp_d);
    }
    
    mapped = mapped.sort((a, b) => parseInt(b.sample_values) - parseInt(a.sample_values));
    mapped = mapped.slice(0, 10);
    mapped = mapped.reverse();
    let trace = {
        x: mapped.map(row => row.sample_values),
        y: mapped.map(row => "OTU "+row.otu_id),
        text: mapped.map(row => row.otu_labels),
        name: idNum,
        type: "bar",
        orientation: "h"
    }
    let chart_data = [trace];
    let layout = {
        title: "Sample ID "+idNum+" Results",
        margin: {
            l: 100,
            r: 100,
            t: 100,
            b: 100
        }
    }

    Plotly.newPlot("bar", chart_data, layout);


}

d3.json("samples.json").then((data) => {
    json_raw = data;
    set_options(subject_id, json_raw.names.sort( (a,b) => a-b ));
    // init();
});

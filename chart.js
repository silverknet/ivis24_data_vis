//scatter frame properties
frame_properties = {
  width: 500,
  height: 500,
  padding: 60,
}
data_properties = {
  x_axis: 3,
  y_axis: 2,
  skills: ["viz", "stats", "math", "art", "ui", "code", "graph", "hci", "eval", "comm", "collab", "GIT"],
  get_x: function() { return this.skills[this.x_axis]; },
  get_y: function() { return this.skills[this.y_axis]; },
}

var xscale = d3.scaleLinear([0, 10],[0, frame_properties.width]);
var yscale = d3.scaleLinear([0, 10],[frame_properties.height, 0]);
var dot_size_scale = d3.scaleLinear([1, 100],[3.5, 250]);

data = []
filtered_data = []
d3.csv("data.csv").then((d)=>{
  d.forEach(element => {
    data.push(element);
    filtered_data.push(element);
  });
}).then(()=>{
  run();
  filter();
});

function get_bubble_data(old_data){
  new_data = [];
  ack_data = {};

  for(let i = 0; i < old_data.length; i++){
    if(!old_data[i][data_properties.get_x()] || !old_data[i][data_properties.get_y()] ){
      continue;
    }
    if (ack_data[`${old_data[i][data_properties.get_x()]}, ${old_data[i][data_properties.get_y()]}`]){
      ack_data[`${old_data[i][data_properties.get_x()]}, ${old_data[i][data_properties.get_y()]}`].size += 1;
      ack_data[`${old_data[i][data_properties.get_x()]}, ${old_data[i][data_properties.get_y()]}`].alias.push(data[i].ALIAS);
    }
    else{
      ack_data[`${old_data[i][data_properties.get_x()]}, ${old_data[i][data_properties.get_y()]}`] = {size: 1, x: old_data[i][data_properties.get_x()], y: old_data[i][data_properties.get_y()]};
      ack_data[`${old_data[i][data_properties.get_x()]}, ${old_data[i][data_properties.get_y()]}`].alias = [old_data[i].ALIAS];
    }
  }
  Object.keys(ack_data).forEach((key) => {
    new_data.push(ack_data[key]);
  });
  return new_data
}

function array_to_string(arr){
  str = "";
  for(let i = 0; i < arr.length; i++){
    str += arr[i];
    if(i === arr.length-1){
      break;
    }
    str += "<br>";
  }
  return str;
}



function run(){
  d3.select("elementSelector").style("outline", "none");

  d3.select(".d3_content").select("svg").remove();
  d3.select(".d3_content").select(".tooltip").remove();
  const new_data = get_bubble_data(filtered_data);

  const svg = d3.select(".d3_content").append("svg")
  .attr("class", "scatter-frame")
  .attr("width", frame_properties.width + frame_properties.padding * 2)
  .attr("height", frame_properties.height + frame_properties.padding * 2);

  var x = d3.scaleLinear().domain([0, 10]).range([ 0, frame_properties.width]);
  var y = d3.scaleLinear().domain([10, 0]).range([ 0, frame_properties.height]);

  svg.append("g")
    .attr("transform", `translate(${frame_properties.padding}, ${frame_properties.height + frame_properties.padding} )`)
    .call(d3.axisBottom(x))


  svg.append("g")
    .attr("transform", `translate(${frame_properties.padding}, ${frame_properties.padding} )`)
    .call(d3.axisLeft(y))

  var tooltip = d3.select(".d3_content")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white");

  var showTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(50)
    tooltip
      .style("opacity", 0.8)
      .html(`${array_to_string(d.alias)}`)
      .style("left", (d3.pointer(event, this)[0]+30) + "px")
      .style("top", (d3.pointer(event, this)[1]+30) + "px")
  }
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(50)
      .style("opacity", 0)
  }
  var moveTooltip = function(event, d) {
    tooltip
      .style("left", (d3.pointer(event, this)[0]+30) + "px")
      .style("top", (d3.pointer(event, this)[1]+30) + "px")
  }


  //dots/bubbles
  svg.append("g").selectAll("circle")
    .data(new_data)
    .join("circle")
    .attr("cx", (d)=>{return xscale(parseInt(d.x)) + frame_properties.padding})
    .attr("cy", (d)=>{return yscale(parseInt(d.y)) + frame_properties.padding})
    .attr("r", (d)=>{ return dot_size_scale(d.size)})
    .style("fill", "rgb(242,49,49)" )
    .style("fill", "rgb(242,49,49)")
    .style("stroke", "black") 
    .style("stroke-width", "1")
    .style("opacity", "0.7")
    .on("mousemove", moveTooltip )
    .on('mouseover', function (event, d) {
      d3.select(this).transition()
          .duration('50')
          .style("opacity", "0.9")
          .attr("r", (d)=>{ return dot_size_scale(d.size * 1.2)});
          showTooltip(event, d);
      })
    .on('mouseleave', function (event,d) {
      d3.select(this).transition()
          .duration('50')
          .style("opacity", "0.7")
          .attr("r", (d)=>{ return dot_size_scale(d.size )});
          hideTooltip(event, d);
      });

  // y axis label
  svg.append("text").text(data_properties.get_y())
    .attr("x", -frame_properties.height / 2  - frame_properties.padding)
    .attr("y", frame_properties.padding -30) //it rotated so these gets turned around :/
    .attr('transform', 'rotate(-90)')
    .attr("text-anchor", "middle")
    .attr("class", "axis_text");

  // x axis label
  svg.append("text").text(data_properties.get_x())
    .attr("x", frame_properties.width / 2 + frame_properties.padding)
    .attr("y", frame_properties.height + frame_properties.padding + 40)
    .attr('transform', 'rotate(0)')
    .attr("text-anchor", "middle")
    .attr("class", "axis_text");
  
  // Title text
  svg.append("text").text("Skills of IVIS24")
    .attr("x", 130)
    .attr("y",  30) 
    .attr("text-anchor", "middle")
    .attr("class", "Title_text");


  //Arrow code
  const arrow = d3.arrow11()
  .id("my-arrow")
  .attr("fill", "steelblue")
  .attr("stroke", "steelblue");

  svg.call(arrow);

  function createArrow(startX, startY, endX, endY, on_click_function) {
    var padding = 10;
  
    svg.append("rect")
      .attr("x", Math.min(startX, endX) - padding)
      .attr("y", startY - padding / 2)
      .attr("width", Math.abs(endX - startX) + 2 * padding)
      .attr("height", padding)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() { d3.select(this).style("cursor", "pointer"); })
      .on("click", on_click_function);
  
    // arrow
    svg.append("polyline")
      .attr("marker-end", "url(#my-arrow)")
      .attr("points", [[startX, startY], [endX, endY]])
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .on("mouseover", function() { d3.select(this).style("cursor", "pointer"); });
  }
  
  // Define the start and end points for each interactive element
  var baseX = frame_properties.width / 2 + 110;
  var baseY = frame_properties.height + frame_properties.padding + 33;

  createArrow(baseX, baseY, baseX + 5, baseY, switch_x_data);
  createArrow(baseX - 100, baseY, baseX - 100 -5, baseY, switch_x_data_left);

  var baseX_left = 23;
  var baseY_left = frame_properties.height /2 + 5;
  
  createArrow(baseX_left, baseY_left, baseX_left, baseY_left -5, switch_y_data);
  createArrow(baseX_left, baseY_left + 115 - 5, baseX_left, baseY_left + 115, switch_y_data_left);
  
}  

function switch_x_data(){
  size = data_properties.skills.length;
  data_properties.x_axis = data_properties.x_axis >= size -1 ? 0 : data_properties.x_axis + 1;
  run();
}
function switch_x_data_left(){
  size = data_properties.skills.length;
  data_properties.x_axis = data_properties.x_axis <= 0 ? size - 1 : data_properties.x_axis - 1;
  run();
}
function switch_y_data(){
  size = data_properties.skills.length;
  data_properties.y_axis = data_properties.y_axis >= size -1 ? 0 : data_properties.y_axis + 1;
  run();
}
function switch_y_data_left(){
  size = data_properties.skills.length;
  data_properties.y_axis = data_properties.y_axis <= 0 ? size -1 : data_properties.y_axis - 1;
  run();
}

function filter_change(event, d, checked){
  if(!checked){
    filtered_data = filtered_data.filter(item => item.ALIAS != d.ALIAS);
  }else{
    filtered_data.push(data.find(item => item.ALIAS === d.ALIAS));
  }
  run()
}

function focus(event, d, label){
  console.log(label);
}

function filter() {
  const container = d3.select('.checkboxContainer');

  const checkboxes = container.selectAll('.checkbox')
    .data(data)
    .enter()
    .append('div')
      .classed('checkbox', true);

  checkboxes.append('input')
    .attr('type', 'checkbox')
    .attr('id', (d, i) => `checkbox${i}`)
    .attr('name', (d, i) => `checkbox${i}`)
    .attr('value', d => d)
    .attr("checked", true)
    .on("change", function(event, d){filter_change(event, d, this.checked)});

  checkboxes.append('label')
    .attr('for', (d, i) => `checkbox${i}`)
    .text(d => `${d.ALIAS}`)
    .on("clicked", function(event, d){filter_change(event, d, this)});
}

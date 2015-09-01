var legendRectSize = 18;
var legendSpacing = 4;

var dataset = {
  apples: [53245, 28479, 19697, 24037, 40245],
};

var width = 400,
    height = 400,
    radius = Math.min(width, height) / 2;

var color = d3.scale.category20();

var pie = d3.layout.pie()
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 50);

var svg, path;
$(function() {
    renderGraph();
});

function renderGraph() {
    if( d3.select("#donut").length > 0 ) {
        d3.select("#donut svg").remove();
    }

    svg = d3.select("#donut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    path = svg.selectAll("path")
        .data(pie(realData))
        .enter().append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc);
    
    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = -2 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);
    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return labels[d]; });
}
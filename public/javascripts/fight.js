/** @jsx React.DOM */

var Tweet = React.createClass({
    render: function() {
        return (
            <li><span style={{'float': 'left', 'width': '50px'}}>{this.props.sentiment.score}</span>{this.props.text}</li>
        )
    }
});

var TweetList = React.createClass({
    render: function() {
        var tweets = this.props.data.map(function(tweet) {
            return <Tweet text={tweet.text} sentiment={tweet.sentiment} />;
        });
        return (
            <div>
                <ul>
                    {tweets}
                </ul>
            </div>
        )
    }
});

var TweetBox = React.createClass({
    addTweet: function(tweet) {
        var tweets = this.state.data;
        var newTweets = tweets.concat([tweet]);

        if(newTweets.length > 15) {
            newTweets.splice(0, 1);
        }

        this.setState({data: newTweets});
    },
    getInitialState: function() {
        return {data: []};
    },
    componentWillMount: function() {
        var socket = io.connect();
        var self = this;

        socket.on('info', function (data) {
            self.addTweet(data.tweet);
        });
    },
    render: function() {
        return (
            <div>
                <TweetList data={this.state.data} />
            </div>
        )
    }
});

React.renderComponent(
  <TweetBox />,
  document.getElementById('content')
);

var width = 960,
    height = 500,
    parseDate = d3.time.format("%x").parse;

var color = d3.time.scale()
    .domain([new Date(1962, 0, 1), new Date()])
    .range(["black", "steelblue"])
    .interpolate(d3.interpolateLab);

var hexbin = d3.hexbin()
    .size([width, height])
    .radius(8);

var radius = d3.scale.sqrt()
    .domain([0, 12])
    .range([0, 8]);

var projection = d3.geo.albers()
    .scale(1000)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "vendor/d3/us.json")
    .defer(d3.tsv, "vendor/d3/readme-walmart.tsv")
    .await(ready);

function ready(error, us, walmarts) {
  walmarts.forEach(function(d) {
    var p = projection(d);
    d[0] = p[0], d[1] = p[1];
    d.date = parseDate(d.date);
  });

  svg.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);

  svg.append("g")
      .attr("class", "hexagons")
    .selectAll("path")
      .data(hexbin(walmarts).sort(function(a, b) { return b.length - a.length; }))
    .enter().append("path")
      .attr("d", function(d) { return hexbin.hexagon(radius(d.length)); })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("fill", function(d) { return color(d3.median(d, function(d) { return +d.date; })); });
}

// represent dimensions on various elements in the application
var width = window.innerWidth - window.innerWidth/6;
var height= window.innerHeight;
var circRadius = 18;
var rectHeight = 50;
var rectWidth = 15;
var numRect = 3;
var numCircles = 10;

// appends and centers svg canvas in window
var svg = d3.select("#canvas")
    .attr("align", "center")
    .append("svg")
    .attr("width", width)
    .attr("height", height - height/3)
    .style("background-color","#ebebeb");

// creates scale for the circles' fills
var colorScale = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, 1]);

// copied from colorful-circles
d3.select("#colorPalette").on("change", function() {
    var palette = this.value;

    colorScale = d3.scaleSequential(d3[palette])
        .domain([0, 1]);
});
// end copy

// represents the number of rectangles the user has left to place on the svg
var leftToPlace = numRect;

// array that stores where the rectangles were place
var rectPositions = [];

// if there are rectangles left to place, when user clicks on the svg, 
// will draw rectangles where mouse is clicked
svg.on("click", function() {
    if(leftToPlace > 0) {
        var pos = d3.mouse(this);  
        
        rectPositions.push(pos);
        
        svg.append("rect")
            .attr("x", pos[0] - rectWidth/2)
            .attr("y", pos[1] - rectHeight/2)
            .attr("width", rectWidth)
            .attr("height", rectHeight)                
            .attr("fill", "brown");

    }

    leftToPlace -= 1;
})

// array that stores information about the circles drawn
var circles = [];

// value that is converted by colorScale to fill value
var colorIndex = 0;

// represents the user's current score
var score = 0;

// stores high score
var highScore = 0;

// when start button is clicked
d3.select("#start").on("click", function() {

    // if the user presses start without clearing the svg canvas, will still update scores
    if(score != 0) {
        updateHighScore();
    }
    
    // will only draw circles if the user has place all three rectangles
    if(leftToPlace <= 0) {
        for(var i = 0; i < numCircles; i++) {
            // colorIndex copied from colorful-circles
            if(colorIndex > 1) {
                colorIndex = 0;
            }
    
            colorIndex += 0.05;
            // end copy
    
            // represent attributes of the circles to be drawn
            var x;
            var y;
            var velocity = Math.round(Math.random() * 2) + 2;;
    
            // randomly generates which side the circle will come from
            var whichSide = Math.round(Math.random());
    
            // gives circle initial starting x position accordingly
            if(whichSide == 0) {
                x = -circRadius;
            }
            else {
                x = width + circRadius;
            }
    
            // randomly generates constrainted y position for circle
            y = Math.random() * (height - height/3);
            if(y == 0) {
                y += circRadius;
            }
    
            if(whichSide != 0) {
                velocity *= -1;
            }
    
            circles.push({xPos: x, yPos: y, radius: circRadius, velocity: velocity, color: colorScale(colorIndex), hasBounced: false});

        }

        // draws circles 
        var drawnCircles = svg.selectAll("circle")
          .data(circles)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return d.xPos; })
            .attr("cy", function(d) { return d.yPos; })
            .attr("r", circRadius)
            .attr("fill", function(d) { return d.color; });


            // moves circles and for each circle checks if it has moved off the svg canvas or has hit a rectangle
            setInterval(function() {

                drawnCircles.each(function(d) {
                    var circle = d3.select(this);

                    // removes circle if it has moved past edge of canvas
                    if((d.xPos > (width + (circRadius * 5))) || (d.xPos < (-circRadius * 5))) {
                        circle.remove();
                    }
                    

                    else {

                        // determines if circle has hit rectangle and updates score accordingly
                        if(hitRectangle(d.xPos, d.yPos, d.velocity, d.hasBounced)) {
                            score += 1;
                            d3.select("#score").text("Score: " + score);

                            d.hasBounced = true;
                            d.velocity *= -5;
                            d.radius /= 2;
                        }
                        // updates circle's position
                        else {
                            d.xPos += d.velocity;
                            
                            circle.attr("cx", d.xPos);
                        }
                    }     
                })

            }, 5);
}
});

// when user clicks clear button, removes the rectangles, 
// clears the rectangle and circle arrays, and updates score
d3.select("#clear").on("click", function() {
    leftToPlace = numRect;

    rectPositions = []

    circles = [];

    updateHighScore();

    d3.selectAll("rect").remove();
    
});

// determines if a circle has hit a rectangle
function hitRectangle(xPos, yPos, velocity, hasBounced) {
    if(hasBounced) {
        return false;
    }

    for(var i = 0; i < rectPositions.length; i++) {
        var rectYCenter = rectPositions[i][1];
        var rectXSide;
        var circleEdge;

        if(velocity > 0) {
            rectXSide = rectPositions[i][0] - rectWidth/2;
            circleEdge = xPos + circRadius;

            if(circleEdge - rectXSide >= 0 && (Math.abs(yPos - rectYCenter) <= rectHeight)) {
                return true;
            }
        }
        else {
            rectXSide = rectPositions[i][0] + rectWidth/2;
            circleEdge = xPos - circRadius;

            if(circleEdge - rectXSide <= 0 && (Math.abs(yPos - rectYCenter) <= rectHeight)) {
                return true;
            }
        } 
    }

    return false;
    
}

// updates the high score
function updateHighScore() {
    if(score > highScore) {
        highScore = score;
    }
    score = 0;

    d3.select("#score").text("Score: " + score);

    d3.select("#high-score").text("High Score: " + highScore);
}




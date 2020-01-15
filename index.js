const kmeans = require("ml-kmeans");
const fs = require("fs");
const readline = require("readline");

const readInterface = readline.createInterface({
  input: fs.createReadStream("./dataset.data"),
  console: false
});

const points = [];
const fireflies = [];
const firefliesFitnesses = [];

readInterface.on("line", line => {
  points.push(Array.from(line.split(",").map(item => parseInt(item))));
});

readInterface.on("close", () => {
  // Choose fireflies
  fireflies.push(
    [points[6], points[2]],
    [points[1], points[3]],
    [points[0], points[7]],
    [points[8], points[5]],
    [points[4], points[6]]
  );

  // Replace the first firefly with the output of kmeans clustering
  const kmeansResult = kmeans(points, 2).centroids;
  fireflies[0] = [kmeansResult[0].centroid, kmeansResult[1].centroid];
  let i = 0;
  // Some termination criteria should be specified here
  while (i < 1) {
    fireflies.forEach(firefly => {
      firefliesFitnesses.push(fitnessCalculator(firefly, 2));
    });
    i++;
  }
  console.log(firefliesFitnesses);
});

function fitnessCalculator(firefly) {
  let fitness = 0;
  // Figure out the points in both clusters
  let firstClusterPoints = [];
  let secondClusterPoints = [];

  points.forEach(point => {
    let distanceFromFirstCentroid = euclideanDistanceCalculator(
      point,
      firefly[0]
    );

    let distanceFromSecondCentroid = euclideanDistanceCalculator(
      point,
      firefly[1]
    );

    if (distanceFromFirstCentroid < distanceFromSecondCentroid) {
      firstClusterPoints.push(point);
    } else {
      secondClusterPoints.push(point);
    }
  });

  // Calculate the fitness
  for (let i = 0; i < 2; i++) {
    // Calculate the intra-cluster distance for first Cluster
    firstClusterPoints.forEach(point => {
      fitness += euclideanDistanceCalculator(point, firefly[0]);
    });
    // Calculate the intra-cluster distance for second Cluster
    secondClusterPoints.forEach(point => {
      fitness += euclideanDistanceCalculator(point, firefly[1]);
    });
  }
  return fitness;
}

function euclideanDistanceCalculator(point1, point2) {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
  );
}

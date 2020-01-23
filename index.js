const kmeans = require("ml-kmeans");
const { Matrix } = require("ml-matrix");
const { plot, Plot } = require("nodeplotlib");
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

  fireflies.forEach(firefly => {
    firefliesFitnesses.push(fitnessCalculator(firefly));
  });

  // Some termination criteria should be specified here
  while (i < 5) {
    let alpha = 0.2;
    let epsilon = new Matrix([
      [3.73, 2.408],
      [-5.04, 2.907]
    ]);
    let theta = 0.97;

    // Update the positions of fireflies
    for (let first = 0; first < fireflies.length; first++) {
      for (let second = 0; second < fireflies.length; second++) {
        if (firefliesFitnesses[first] < firefliesFitnesses[second]) {
          // Generate a random control matrix
          let controlMatrix = new Matrix(controlMatrixGenerator());
          let firstFirefly = new Matrix(fireflies[first]);
          let secondFirefly = new Matrix(fireflies[second]);
          let firstFireflyNewPosition = Matrix.add(
            firstFirefly,
            Matrix.add(
              Matrix.multiply(
                controlMatrix,
                Matrix.subtract(secondFirefly, firstFirefly)
              ),
              Matrix.mul(epsilon, alpha)
            )
          );
          fireflies[first] = firstFireflyNewPosition.to2DArray();
        }
      }
    }
    alpha *= theta;
    i++;
    const trace = {
      x: [
        fireflies[0][0][0],
        fireflies[1][0][0],
        fireflies[2][0][0],
        fireflies[3][0][0],
        fireflies[4][0][0]
      ],
      y: [
        fireflies[0][0][1],
        fireflies[1][0][1],
        fireflies[2][0][1],
        fireflies[3][0][1],
        fireflies[4][0][1]
      ],
      mode: "markers",
      type: "scatter"
    };
    plot([trace], {
      width: 1366,
      height: 768
    });
  }
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

function controlMatrixGenerator() {
  return [
    [
      Math.floor(Math.random() * Math.floor(2)),
      Math.floor(Math.random() * Math.floor(2))
    ],
    [
      Math.floor(Math.random() * Math.floor(2)),
      Math.floor(Math.random() * Math.floor(2))
    ]
  ];
}

function euclideanDistanceCalculator(point1, point2) {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
  );
}

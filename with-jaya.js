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
let firefliesPrevious = [];
const firefliesFitnesses = [];
let firefliesFitnessesPrevious = [];

readInterface.on("line", line => {
  points.push(Array.from(line.split(",").map(item => parseInt(item))));
});

readInterface.on("close", () => {
  // Choose fireflies
  fireflies.push(
    [points[0], points[9]],
    [points[1], points[10]],
    [points[2], points[11]],
    [points[3], points[12]],
    [points[4], points[13]],
    [points[5], points[14]],
    [points[6], points[15]],
    [points[7], points[16]],
    [points[8], points[17]],
    [points[19], points[18]]
  );

  let i = 0;
  let bestFitness = 999999;
  let worstFitness = 0;
  let bestFitnessFirefly, worstFitnessFirefly;

  while (i < 10) {
    const trace = {
      x: [
        fireflies[0][0][0],
        fireflies[1][0][0],
        fireflies[2][0][0],
        fireflies[3][0][0],
        fireflies[4][0][0],
        fireflies[5][0][0],
        fireflies[6][0][0],
        fireflies[7][0][0],
        fireflies[8][0][0],
        fireflies[9][0][0]
      ],
      y: [
        fireflies[0][0][1],
        fireflies[1][0][1],
        fireflies[2][0][1],
        fireflies[3][0][1],
        fireflies[4][0][1],
        fireflies[5][0][1],
        fireflies[6][0][1],
        fireflies[7][0][1],
        fireflies[8][0][1],
        fireflies[9][0][1]
      ],
      mode: "markers",
      type: "scatter"
    };
    plot([trace], {
      width: 1366,
      height: 768,
      xaxis: { range: [-100, 100] },
      yaxis: { range: [-100, 100] }
    });

    let r1 = Math.random().toFixed(2),
      r2 = Math.random().toFixed(2);

    // Compute the fitness for each firefly and get the best and worst fitnesses.
    fireflies.forEach(firefly => {
      let fitness = fitnessCalculator(firefly);
      if (fitness < bestFitness) {
        bestFitness = fitness;
        bestFitnessFirefly = firefly;
      }
      if (fitness > worstFitness) {
        worstFitness = fitness;
        worstFitnessFirefly = firefly;
      }
      firefliesFitnesses.push(fitness);
    });

    if (i !== 0) {
      for (let i = 0; i < firefliesFitnesses.length; i++) {
        if (firefliesFitnessesPrevious[i] < firefliesFitnesses[i]) {
          fireflies[i] = firefliesPrevious[i];
        }
      }
    }

    firefliesPrevious = [...fireflies];
    firefliesFitnessesPrevious = [...firefliesFitnesses];

    // Update the coordinates using Jaya Optimization
    fireflies.forEach(firefly => {
      firefly[0][0] +=
        r1 * (bestFitnessFirefly[0][0] - firefly[0][0]) -
        r2 * (worstFitnessFirefly[0][0] - firefly[0][0]);
      firefly[0][1] +=
        r1 * (bestFitnessFirefly[0][1] - firefly[0][1]) -
        r2 * (worstFitnessFirefly[0][1] - firefly[0][1]);
      firefly[1][0] +=
        r1 * (bestFitnessFirefly[1][0] - firefly[1][0]) -
        r2 * (worstFitnessFirefly[1][0] - firefly[1][0]);
      firefly[1][1] +=
        r1 * (bestFitnessFirefly[1][1] - firefly[1][1]) -
        r2 * (worstFitnessFirefly[1][1] - firefly[1][1]);
    });

    i++;
  }
});

function fitnessCalculator(firefly) {
  let fitness = 0;

  // Calculate euclidean distance from all points
  let euclideanDistances = [[]];
  euclideanDistances[1] = [];

  points.forEach((point, i) => {
    euclideanDistances[0][i] = euclideanDistanceCalculator(
      point,
      firefly[0]
    ).toFixed(3);
  });

  points.forEach((point, i) => {
    euclideanDistances[1][i] = euclideanDistanceCalculator(
      point,
      firefly[1]
    ).toFixed(3);
  });

  for (let i = 0; i < points.length; i++) {
    fitness += Math.min(euclideanDistances[0][i], euclideanDistances[1][i]);
  }

  return fitness.toFixed(4);
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

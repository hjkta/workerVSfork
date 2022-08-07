const { Worker } = require("worker_threads");
const { fork } = require("child_process");
const { performance, PerformanceObserver } = require("perf_hooks");
const { readFileSync } = require("fs");

const file = readFileSync("./file");

const performanceObserver = new PerformanceObserver((items) => {
	items.getEntries().forEach((entry) => {
		console.log(`${entry.name}: ${entry.duration}`);
	});
});

performanceObserver.observe({ entryTypes: ["measure"] });

const workerFunction = (array) => {
	return new Promise((resolve, reject) => {
		performance.mark("start");

		const workerProcess = new Worker("./worker.js", {
			workerData: {
				array,
				file,
			},
		});

		workerProcess.on("message", (response) => {
			performance.mark("end");
			performance.measure("worker", "start", "end");
			resolve(response);
		});

		workerProcess.on("error", (error) => {
			performance.mark("end");
			performance.measure("worker", "start", "end");
			reject(error);
		});
	});
};

const forkFunction = (array) => {
	return new Promise((resolve, reject) => {
		performance.mark("start");

		const forkProcess = fork("./fork.js");

		forkProcess.send({ array, file });

		forkProcess.on("message", (response) => {
			performance.mark("end");
			performance.measure("fork", "start", "end");
			resolve(response);
		});

		forkProcess.on("error", (error) => {
			performance.mark("end");
			performance.measure("fork", "start", "end");
			reject(error);
		});
	});
};

const main = async () => {
	await workerFunction([25, 19, 48, 30]);
	await forkFunction([25, 19, 48, 30]);
};

main();

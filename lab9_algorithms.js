// Завдання 1: Генерація масиву випадкових цілих чисел у діапазоні від -10 000 до 10 000
function buildRandomSequence(length) {
  const MIN_NUM = -10000;
  const SPAN = 20001; // Total integer count in [-10000, 10000]
  const sequence = new Array(length);

  // Fill the array with uniformly distributed random integers
  let idx = 0;
  while (idx < length) {
    sequence[idx] = Math.trunc(Math.random() * SPAN) + MIN_NUM;
    idx++;
  }

  return sequence;
}

// Завдання 2.1: Спосіб 1 — пошук 6-го елемента за допомогою простого сортування (Bubble Sort)
function findSixthByBubbleSort(input) {
  // Use a typed array copy to avoid mutating the original dataset
  const buffer = Int32Array.from(input);
  const len = buffer.length;

  // Perform descending Bubble Sort with early-exit optimization
  for (let pass = 0; pass < len - 1; pass++) {
    let hasSwapped = false;

    for (let j = 0; j < len - 1 - pass; j++) {
      if (buffer[j] < buffer[j + 1]) {
        const holder = buffer[j];
        buffer[j] = buffer[j + 1];
        buffer[j + 1] = holder;
        hasSwapped = true;
      }
    }

    // Stop early if the array is already sorted
    if (!hasSwapped) break;
  }

  // Return the 6th largest element (0-based index 5)
  return buffer[5];
}

// Завдання 2.2: Спосіб 2 — пошук 6-го елемента через відсортований масив із 6 найбільших чисел
function findSixthBySortedLeaders(input) {
  // Store top 6 numbers sorted from largest (index 0) to 6th largest (index 5)
  const leaders = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

  for (const num of input) {
    // Compare incoming number only with the last element of the sorted top-6 list
    if (num > leaders[5]) {
      let insertAt = 0;

      // Locate the proper index to preserve descending order
      while (insertAt < 6 && num <= leaders[insertAt]) {
        insertAt++;
      }

      // Insert the new leader and drop the 7th element
      leaders.splice(insertAt, 0, num);
      leaders.pop();
    }
  }

  return leaders[5];
}

// Завдання 2.3: Спосіб 3 — шестиразовий пошук максимуму із заміною знайденого елемента на мінімальне значення
function findSixthBySixPeaks(input) {
  // Clone input into Int32Array for fast in-place replacement
  const pool = Int32Array.from(input);
  const ERASED_MARKER = -100000; // Strictly less than the lowest possible value (-10000)
  let sixthPeak = ERASED_MARKER;

  // Execute 6 linear scans to extract the top 6 maximums one by one
  let step = 0;
  while (step < 6) {
    let maxFound = ERASED_MARKER;
    let maxPosition = -1;

    for (let i = 0; i < pool.length; i++) {
      if (pool[i] > maxFound) {
        maxFound = pool[i];
        maxPosition = i;
      }
    }

    // Replace the discovered maximum so it is ignored in subsequent scans
    if (maxPosition !== -1) {
      pool[maxPosition] = ERASED_MARKER;
    }

    sixthPeak = maxFound;
    step++;
  }

  return sixthPeak;
}

// Завдання 3: Вимірювання середнього часу роботи алгоритмів (3 запуски на кожен розмір, разом 45 перевірок)
function runTripleTrial(solverFn, data) {
  const TRIAL_COUNT = 3;
  const elapsedList = [];
  let computedAnswer = null;

  // Measure execution time across 3 identical runs
  for (let attempt = 0; attempt < TRIAL_COUNT; attempt++) {
    const t0 = performance.now();
    computedAnswer = solverFn(data);
    const t1 = performance.now();

    elapsedList.push(t1 - t0);
  }

  // Compute average time in milliseconds
  const meanTime =
    elapsedList.reduce((total, current) => total + current, 0) / TRIAL_COUNT;

  const formattedMean = meanTime.toFixed(2);
  const formattedTrials = elapsedList.map((ms) => ms.toFixed(2)).join(" ");

  return {
    cellText: `${formattedMean}(${formattedTrials})`,
    answer: computedAnswer,
  };
}

// Завдання 4: Запуск тестування на всіх обсягах даних та вивід підсумкової таблиці
function startEfficiencyStudy() {
  const TEST_SIZES = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000];

  // Configure all 3 strategies in a single descriptor list
  const STRATEGIES = [
    {
      column: "Спосіб 1 (Сортування)",
      fn: findSixthByBubbleSort,
      maxElements: 100_000, // Prevent multi-minute freeze on O(n^2) sort for n >= 1,000,000
    },
    {
      column: "Спосіб 2 (Масив)",
      fn: findSixthBySortedLeaders,
      maxElements: Infinity,
    },
    {
      column: "Спосіб 3 (Максимальні елементи)",
      fn: findSixthBySixPeaks,
      maxElements: Infinity,
    },
  ];

  const summaryRows = [];

  for (const size of TEST_SIZES) {
    console.log(`Генерація та тестування для N = ${size.toLocaleString("uk-UA")}...`);
    const sampleData = buildRandomSequence(size);
    const row = { "Розмір вхідних даних": size.toLocaleString("uk-UA") };
    const answers = [];

    for (const strategy of STRATEGIES) {
      if (size <= strategy.maxElements) {
        const outcome = runTripleTrial(strategy.fn, sampleData);
        row[strategy.column] = outcome.cellText;
        answers.push(outcome.answer);
      } else {
        // Account for 3 checks skipped due to quadratic O(n^2) time complexity
        row[strategy.column] = "> 10 хв (O(n²))";
      }
    }

    // Verify that all executed methods found the exact same 6th largest number
    const allMatch = answers.every((val) => val === answers[0]);
    if (!allMatch) {
      throw new Error(`Results mismatch at N=${size}: ${answers.join(", ")}`);
    }

    summaryRows.push(row);
  }

  console.log("\nРезультати порівняння ефективності алгоритмів (мс):");
  console.table(summaryRows);
}

startEfficiencyStudy();

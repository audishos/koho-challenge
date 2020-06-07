const path = require('path');
const processTransactionList = require('../processTransactionList');
const { DAILY_AMOUNT_LIMIT } = require('../constants');

const testName = path.parse(__filename).name;

const mockTransactionList = [
  // accepted
  {
    id: '1',
    customer_id: '1',
    load_amount: DAILY_AMOUNT_LIMIT / 4,
    time: Date.parse('2020-04-01'),
  },
  // accepted
  {
    id: '2',
    customer_id: '1',
    load_amount: DAILY_AMOUNT_LIMIT / 4,
    time: Date.parse('2020-04-01'),
  },
  // accepted
  {
    id: '3',
    customer_id: '1',
    load_amount: DAILY_AMOUNT_LIMIT / 4,
    time: Date.parse('2020-04-01'),
  },
  // rejected - daily transaction count limit exceeded
  {
    id: '4',
    customer_id: '1',
    load_amount: DAILY_AMOUNT_LIMIT / 4,
    time: Date.parse('2020-04-01'),
  },
  // rejected - load amount exceeds daily limit
  {
    id: '420',
    customer_id: '8',
    load_amount: DAILY_AMOUNT_LIMIT + 1,
    time: Date.parse('2020-04-01'),
  },
  // accepted
  {
    id: '666',
    customer_id: '40',
    load_amount: DAILY_AMOUNT_LIMIT / 2 - 1,
    time: Date.parse('2020-04-01'),
  },
  // accepted
  {
    id: '675',
    customer_id: '40',
    load_amount: DAILY_AMOUNT_LIMIT / 2 - 1,
    time: Date.parse('2020-04-01'),
  },
  // rejected - duplicate transaction
  {
    id: '675',
    customer_id: '40',
    load_amount: DAILY_AMOUNT_LIMIT / 2 - 1,
    time: Date.parse('2020-04-01'),
  },
  // rejected - load amount exceeds daily limit
  {
    id: '686',
    customer_id: '40',
    load_amount: 3,
    time: Date.parse('2020-04-01'),
  },
  // accepted
  {
    id: '728',
    customer_id: '123',
    load_amount: DAILY_AMOUNT_LIMIT,
    time: Date.parse('2020-04-01'),
  },
  // accepted
  {
    id: '734',
    customer_id: '123',
    load_amount: DAILY_AMOUNT_LIMIT,
    time: Date.parse('2020-04-02'),
  },
  // accepted
  {
    id: '756',
    customer_id: '123',
    load_amount: DAILY_AMOUNT_LIMIT,
    time: Date.parse('2020-04-03'),
  },
  // accepted
  {
    id: '757',
    customer_id: '123',
    load_amount: DAILY_AMOUNT_LIMIT,
    time: Date.parse('2020-04-04'),
  },
  // rejected - load amount exceeds weekly limit
  {
    id: '758',
    customer_id: '123',
    load_amount: DAILY_AMOUNT_LIMIT,
    time: Date.parse('2020-04-05'),
  },
  // accepted
  {
    id: '1025',
    customer_id: '5',
    load_amount: DAILY_AMOUNT_LIMIT - 1,
    time: Date.parse('2020-04-06'),
  },
];

describe(testName, () => {
  const results = processTransactionList(mockTransactionList);

  it('should match the results snapshot', () => {
    expect(results).toMatchSnapshot();
  });

  it('should reject transactions that exceed the daily load count limit', () => {
    expect(results[3].accepted).toBe(false);
  });

  it('should reject transactions with a load_amount that exceeds the daily limit', () => {
    expect(results[4].accepted).toBe(false);
  });

  it('should reject duplicate transactions', () => {
    expect(results[7].accepted).toBe(false);
  });

  it("should reject transactions that would cause the customer's daily load amount to exceed the limit", () => {
    expect(results[8].accepted).toBe(false);
  });

  it("should reject transactions that would cause the customer's weekly load amount to exceed the limit", () => {
    expect(results[13].accepted).toBe(false);
  });

  it('should accept the other transactions', () => {
    results.forEach((result, i) => {
      if ([3, 4, 7, 8, 13].includes(i)) {
        return;
      }

      expect(result.accepted).toBe(true);
    });
  });
});

const path = require('path');
const parseTransactionsFile = require('../parseTransactionsFile');

const testName = path.parse(__filename).name;

const mockTransactionsFileString = `
{"id":"15887","customer_id":"528","load_amount":"$3318.47","time":"2000-01-01T00:00:00Z"}
{"id":"30081","customer_id":"154","load_amount":"$1413.18","time":"2000-01-01T01:01:22Z"}
{"id":"26540","customer_id":"426","load_amount":"$404.56","time":"2000-01-01T02:02:44Z"}
{"id":"10694","customer_id":"1","load_amount":"$785.11","time":"2000-01-01T03:04:06Z"}
{"id":"15089","customer_id":"205","load_amount":"$2247.28","time":"2000-01-01T04:05:28Z"}
{"id":"3211","customer_id":"409","load_amount":"$314.45","time":"2000-01-01T05:06:50Z"}
{"id":"27106","customer_id":"630","load_amount":"$1404.95","time":"2000-01-01T06:08:12Z"}
{"id":"7528","customer_id":"273","load_amount":"$5862.58","time":"2000-01-01T07:09:34Z"}

{"id":"27947","customer_id":"800","load_amount":"$3382.87","time":"2000-01-01T08:10:56Z"}
this line is not valid
`;

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => mockTransactionsFileString),
}));

jest.spyOn(console, 'warn').mockImplementation(() => {});

describe(testName, () => {
  const result = parseTransactionsFile('./foo/bar.txt');

  it('should match the parsed snapshot', () => {
    expect(result).toMatchSnapshot();
  });

  it('should warn about any invalid JSON lines', () => {
      expect(console.warn).toBeCalledWith('Unable to parse line 12:"this line is not valid". Not valid JSON.')
  })

  it('should create 9 transactions', () => {
      expect(result.length).toBe(9);
  })
});

const MILLISECONDS_PER_DAY = 86400000;

module.exports = {
  DAILY_AMOUNT_LIMIT: 5000,
  WEEKLY_AMOUNT_LIMIT: 20000,
  DAILY_LOAD_COUNT_LIMIT: 3,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK: MILLISECONDS_PER_DAY * 7,
  INPUT_PATH: './takehome/input.txt',
  OUTPUT_PATH: './output/output.txt',
};

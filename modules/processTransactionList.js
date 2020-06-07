const {
  DAILY_LOAD_COUNT_LIMIT,
  DAILY_AMOUNT_LIMIT,
  WEEKLY_AMOUNT_LIMIT,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
} = require('./constants');

function processTransactionList(transactionList = []) {
  const resultList = [];

  const pushResult = (accepted, { id, customer_id }) =>
    resultList.push({ id, customer_id, accepted });

  const validationChecks = [
    checkLoadAmountExceedsDailyLimit,
    checkCustomerHasPreviousTransactions,
    checkIsDuplicateTransaction,
    checkCustomerHasPreviousTransactionsInLastWeek,
    checkIsWeeklyLoadAmountLimitExceeded,
    checkCustomerHasPreviosTransactionsInLastDay,
    checkIsDailyTransactionCountLimitExceeded,
    checkIsDailyLoadAmountLimitExceeded,
    ({ transaction, processed }) => !processed && pushResult(true, transaction),
  ];

  transactionList.forEach((transaction, i) => {
    validationChecks.reduce((x, f) => f(x), { transaction, i });
  });

  return resultList;

  // Validation check reducer functions
  function checkLoadAmountExceedsDailyLimit({ transaction, i }) {
    let processed = false;
    if (transaction.load_amount > DAILY_AMOUNT_LIMIT) {
      pushResult(false, transaction);
      processed = true;
    }
    return { transaction, i, processed };
  }

  function checkCustomerHasPreviousTransactions({ transaction, i, processed }) {
    if (processed) return { processed };
    let _processed = processed;
    const previousTransactionsForCustomer = transactionList
      .slice(0, i || 1 - 1)
      .filter(
        (x, i) =>
          x.customer_id === transaction.customer_id &&
          resultList[i].accepted === true
      );

    if (previousTransactionsForCustomer.length < 1) {
      pushResult(true, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      previousTransactionsForCustomer,
      processed: _processed,
    };
  }

  function checkIsDuplicateTransaction({
    transaction,
    i,
    previousTransactionsForCustomer,
    processed,
  }) {
    if (processed) return { processed };
    let _processed = processed;
    if (
      getIsTransactionAlreadyPosted(
        previousTransactionsForCustomer,
        transaction
      )
    ) {
      pushResult(false, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      previousTransactionsForCustomer,
      processed: _processed,
    };
  }

  function checkCustomerHasPreviousTransactionsInLastWeek({
    transaction,
    i,
    previousTransactionsForCustomer,
    processed,
  }) {
    if (processed) return { processed };
    let _processed = processed;
    const weekStartIndex = previousTransactionsForCustomer.findIndex(
      x => transaction.time - x.time < MILLISECONDS_PER_WEEK
    );

    if (weekStartIndex < 0) {
      pushResult(true, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      previousTransactionsForCustomer,
      weekStartIndex,
      processed: _processed,
    };
  }

  function checkIsWeeklyLoadAmountLimitExceeded({
    transaction,
    i,
    previousTransactionsForCustomer,
    weekStartIndex,
    processed,
  }) {
    if (processed) return { processed };
    let _processed = processed;
    const customerTransactionsInLastWeek = previousTransactionsForCustomer.slice(
      weekStartIndex,
      i
    );

    if (
      getIsLoadAmountLimitExceeded(
        customerTransactionsInLastWeek,
        transaction,
        WEEKLY_AMOUNT_LIMIT
      )
    ) {
      pushResult(false, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      customerTransactionsInLastWeek,
      processed: _processed,
    };
  }

  function checkCustomerHasPreviosTransactionsInLastDay({
    transaction,
    i,
    customerTransactionsInLastWeek,
    processed,
  }) {
    if (processed) return { processed };
    let _processed = processed;
    const dayStartIndex = customerTransactionsInLastWeek.findIndex(
      x => transaction.time - x.time < MILLISECONDS_PER_DAY
    );

    const customerTransactionsInLastDay = customerTransactionsInLastWeek.slice(
      dayStartIndex,
      i
    );

    if (dayStartIndex < 0) {
      pushResult(true, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      customerTransactionsInLastDay,
      processed: _processed,
    };
  }

  function checkIsDailyTransactionCountLimitExceeded({
    transaction,
    i,
    customerTransactionsInLastDay,
    processed,
  }) {
    if (processed) return { processed };
    let _processed = processed;
    if (customerTransactionsInLastDay.length + 1 > DAILY_LOAD_COUNT_LIMIT) {
      pushResult(false, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      customerTransactionsInLastDay,
      processed: _processed,
    };
  }

  function checkIsDailyLoadAmountLimitExceeded({
    transaction,
    i,
    customerTransactionsInLastDay,
    processed,
  }) {
    if (processed) return { processed };
    let _processed = processed;
    if (
      getIsLoadAmountLimitExceeded(
        customerTransactionsInLastDay,
        transaction,
        DAILY_AMOUNT_LIMIT
      )
    ) {
      pushResult(false, transaction);
      _processed = true;
    }
    return {
      transaction,
      i,
      customerTransactionsInLastDay,
      processed: _processed,
    };
  }
}

module.exports = processTransactionList;

// Helper functions
function getIsTransactionAlreadyPosted(
  previousTransactionList,
  currentTransaction
) {
  return !!previousTransactionList.find(x => x.id === currentTransaction.id);
}

function getIsLoadAmountLimitExceeded(
  previousTransactionList,
  currentTransaction,
  limit
) {
  return (
    previousTransactionList.reduce(getTotalAmount, 0) +
      currentTransaction.load_amount >
    limit
  );
}

function getTotalAmount(total, transaction) {
  return total + transaction.load_amount;
}

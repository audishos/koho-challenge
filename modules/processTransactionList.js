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

  transactionList.forEach((transaction, i) => {
    if (transaction.load_amount > DAILY_AMOUNT_LIMIT) {
      pushResult(false, transaction);
      return;
    }

    const previousTransactionsForCustomer = transactionList
      .slice(0, i || 1 - 1)
      .filter(
        (x, i) =>
          x.customer_id === transaction.customer_id &&
          resultList[i].accepted === true
      );

    if (previousTransactionsForCustomer.length < 1) {
      pushResult(true, transaction);
      return;
    }

    if (
      getIsTransactionAlreadyPosted(
        previousTransactionsForCustomer,
        transaction
      )
    ) {
      pushResult(false, transaction);
      return;
    }

    const weekStartIndex = previousTransactionsForCustomer.findIndex(
      x => transaction.time - x.time < MILLISECONDS_PER_WEEK
    );

    if (weekStartIndex < 0) {
      pushResult(true, transaction);
      return;
    }

    const customerTransactionsInLastWeek = previousTransactionsForCustomer.slice(
      weekStartIndex,
      i - 1
    );

    if (
      getIsLoadAmountLimitExceeded(
        customerTransactionsInLastWeek,
        transaction,
        WEEKLY_AMOUNT_LIMIT
      )
    ) {
      pushResult(false, transaction);
      return;
    }

    const dayStartIndex = customerTransactionsInLastWeek.findIndex(
      x => transaction.time - x.time < MILLISECONDS_PER_DAY
    );

    const customerTransactionsInLastDay = customerTransactionsInLastWeek.slice(
      dayStartIndex,
      i - 1
    );

    if (dayStartIndex < 0) {
      pushResult(true, transaction);
      return;
    }

    if (customerTransactionsInLastDay.length + 1 > DAILY_LOAD_COUNT_LIMIT) {
      pushResult(false, transaction);
      return;
    }

    if (
      getIsLoadAmountLimitExceeded(
        customerTransactionsInLastDay,
        transaction,
        DAILY_AMOUNT_LIMIT
      )
    ) {
      pushResult(false, transaction);
      return;
    }

    pushResult(true, transaction);
  });

  return resultList;
}

module.exports = processTransactionList;

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

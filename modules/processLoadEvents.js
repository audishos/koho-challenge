const {
  DAILY_LOAD_COUNT_LIMIT,
  DAILY_AMOUNT_LIMIT,
  WEEKLY_AMOUNT_LIMIT,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
} = require('./constants');

function processLoadEvents(transactionList = []) {
  return transactionList.map((transaction, i) => {
    const result = {
      id: transaction.id,
      customer_id: transaction.customer_id,
      accepted: 'false',
    };

    if (transaction.load_amount > DAILY_AMOUNT_LIMIT) {
      return result;
    }

    const previousTransactionsForCustomer = transactionList
      .slice(0, i || 1 - 1)
      .filter(x => x.customer_id === transaction.customer_id);

    if (previousTransactionsForCustomer.length < 1) {
      result.accepted = 'true';
      return result;
    }

    if (
      getIsTransactionAlreadyPosted(
        previousTransactionsForCustomer,
        transaction
      )
    ) {
      return result;
    }

    const weekStartIndex = previousTransactionsForCustomer.findIndex(
      x => transaction.time - x.time <= MILLISECONDS_PER_WEEK
    );

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
      return result;
    }

    const dayStartIndex = customerTransactionsInLastWeek.findIndex(
      x => transaction.time - x.time <= MILLISECONDS_PER_DAY
    );

    const customerTransactionsInLastDay = customerTransactionsInLastWeek.slice(
      dayStartIndex,
      i - 1
    );

    if (customerTransactionsInLastDay.length + 1 > DAILY_LOAD_COUNT_LIMIT) {
      return result;
    }

    if (
      getIsLoadAmountLimitExceeded(
        customerTransactionsInLastDay,
        transaction,
        DAILY_AMOUNT_LIMIT
      )
    ) {
      return result;
    }

    result.accepted = 'true';
    return result;
  });
}

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

module.exports = processLoadEvents;

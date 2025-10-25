-- Example seed data for finance-backend (SQLite dialect)
-- Notes:
-- - Adjust table names if your naming strategy differs (default here matches entity class names: user, account, category, transaction).
-- - Bcrypt hashes are not generated in SQL. Replace <<BCRYPT_HASH_*>> placeholders with real hashes (cost 10 recommended),
--   or create users via the API to get automatic hashing.
-- - Transactions use Single Table Inheritance (STI) with discriminator column "type":
--     * 'StandardTransaction' uses columns: accountId, amount, date, description, categoryId
--     * 'TransferTransaction' uses columns: accountId (source or destination), toAccountId, amount, date, description, relatedTransactionId
-- - Transfer pairs are linked via relatedTransactionId both ways. We insert outgoing first, then incoming, then update the outgoing link.
-- - currentBalance is set explicitly because raw SQL does not run service hooks that recalculate balances.
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

/* ==========================
Users
========================== */
-- Password for all below is intended to be "123456"; replace placeholder with a real bcrypt hash.
-- INSERT INTO
--     "user" (id, name, email, password)
-- VALUES
--     (
--         1,
--         'Alice',
--         'alice@example.com',
--         '<<BCRYPT_HASH_123456>>'
--     ),
--     (
--         2,
--         'Bob',
--         'bob@example.com',
--         '<<BCRYPT_HASH_123456>>'
--     );
/* ==========================
Accounts (belong to Alice)
========================== */
-- AccountType: CHECKING, SAVINGS, CREDIT, INVESTMENT, LOAN, OTHER
INSERT INTO
    "account" (
        id,
        name,
        initialBalance,
        currentBalance,
        type,
        color,
        icon,
        isActive,
        userId
    )
VALUES
    (
        1,
        'Wallet',
        1000,
        1750,
        'CHECKING',
        '#1E90FF',
        NULL,
        1,
        1
    ),
    (
        2,
        'Savings',
        3000,
        3500,
        'SAVINGS',
        '#2ECC71',
        NULL,
        1,
        1
    );

/* ==========================
Categories (belong to Alice)
========================== */
-- CategoryType: 'Receita' (INCOME), 'Despesa' (EXPENSE)
-- INSERT INTO
--     "category" (
--         id,
--         name,
--         type,
--         icon,
--         isDefault,
--         isActive,
--         userId,
--         parentId
--     )
-- VALUES
--     (2, 'Groceries', 'Despesa', NULL, 0, 1, 1, NULL),
--     (3, 'Rent', 'Despesa', NULL, 0, 1, 1, NULL),
/* ==========================
Standard Transactions (Wallet)
========================== */
-- type = 'StandardTransaction'
INSERT INTO
    "transaction" (
        id,
        type,
        accountId,
        amount,
        date,
        description,
        categoryId
    )
VALUES
    (
        1,
        'StandardTransaction',
        1,
        2000.00,
        '2025-01-05',
        'Salary January',
        1
    ),
    (
        2,
        'StandardTransaction',
        1,
        150.00,
        '2025-01-10',
        'Groceries - Market',
        5
    ),
    (
        3,
        'StandardTransaction',
        1,
        800.00,
        '2025-01-01',
        'Rent January',
        7
    ),
    (
        4,
        'StandardTransaction',
        1,
        200.00,
        '2025-01-20',
        'Birthday Gift',
        4
    );

/* ==========================
Transfer (Wallet -> Savings)
========================== */
-- We create an outgoing (Saída) and incoming (Entrada) pair and link them.
-- Outgoing: accountId = source, toAccountId = destination
-- Incoming: accountId = destination, toAccountId = source
INSERT INTO
    "transaction" (
        id,
        type,
        accountId,
        toAccountId,
        amount,
        date,
        description,
        relatedTransactionId
    )
VALUES
    (
        100,
        'TransferTransaction',
        1,
        2,
        500.00,
        '2025-01-15',
        'Transferência de Saída - Move to savings',
        NULL
    );

INSERT INTO
    "transaction" (
        id,
        type,
        accountId,
        toAccountId,
        amount,
        date,
        description,
        relatedTransactionId
    )
VALUES
    (
        101,
        'TransferTransaction',
        2,
        1,
        500.00,
        '2025-01-15',
        'Transferência de Entrada - Move to savings',
        100
    );

-- Link the outgoing to its related incoming
UPDATE "transaction"
SET
    relatedTransactionId = 101
WHERE
    id = 100;

/* ==========================
More Standard Transactions (40 examples)
========================== */
-- Note: Account currentBalance may not reflect these inserts when seeding via raw SQL.
--       Recalculate balances in-app or adjust account.currentBalance accordingly if needed.
INSERT INTO
    "transaction" (
        id,
        type,
        accountId,
        amount,
        date,
        description,
        categoryId
    )
VALUES
    -- Account 1 (Wallet) - 20 rows
    (
        200,
        'StandardTransaction',
        1,
        800.00,
        '2025-02-01',
        'Rent February',
        7
    ),
    (
        201,
        'StandardTransaction',
        1,
        2000.00,
        '2025-02-05',
        'Salary February',
        1
    ),
    (
        202,
        'StandardTransaction',
        1,
        180.00,
        '2025-02-10',
        'Groceries February',
        5
    ),
    (
        203,
        'StandardTransaction',
        1,
        100.00,
        '2025-02-20',
        'Gift February',
        4
    ),
    (
        204,
        'StandardTransaction',
        1,
        800.00,
        '2025-03-01',
        'Rent March',
        7
    ),
    (
        205,
        'StandardTransaction',
        1,
        2000.00,
        '2025-03-05',
        'Salary March',
        1
    ),
    (
        206,
        'StandardTransaction',
        1,
        160.00,
        '2025-03-12',
        'Groceries March',
        5
    ),
    (
        207,
        'StandardTransaction',
        1,
        80.00,
        '2025-03-20',
        'Gift March',
        4
    ),
    (
        208,
        'StandardTransaction',
        1,
        800.00,
        '2025-04-01',
        'Rent April',
        7
    ),
    (
        209,
        'StandardTransaction',
        1,
        2000.00,
        '2025-04-05',
        'Salary April',
        1
    ),
    (
        210,
        'StandardTransaction',
        1,
        150.00,
        '2025-04-11',
        'Groceries April',
        5
    ),
    (
        211,
        'StandardTransaction',
        1,
        50.00,
        '2025-04-22',
        'Gift April',
        4
    ),
    (
        212,
        'StandardTransaction',
        1,
        800.00,
        '2025-05-01',
        'Rent May',
        7
    ),
    (
        213,
        'StandardTransaction',
        1,
        2000.00,
        '2025-05-05',
        'Salary May',
        1
    ),
    (
        214,
        'StandardTransaction',
        1,
        170.00,
        '2025-05-14',
        'Groceries May',
        5
    ),
    (
        215,
        'StandardTransaction',
        1,
        120.00,
        '2025-05-25',
        'Gift May',
        4
    ),
    (
        216,
        'StandardTransaction',
        1,
        800.00,
        '2025-06-01',
        'Rent June',
        7
    ),
    (
        217,
        'StandardTransaction',
        1,
        2000.00,
        '2025-06-05',
        'Salary June',
        1
    ),
    (
        218,
        'StandardTransaction',
        1,
        140.00,
        '2025-06-09',
        'Groceries June',
        5
    ),
    (
        219,
        'StandardTransaction',
        1,
        90.00,
        '2025-06-18',
        'Gift June',
        4
    ),
    -- Account 2 (Savings) - 20 rows
    (
        220,
        'StandardTransaction',
        2,
        200.00,
        '2025-02-03',
        'Gift February',
        4
    ),
    (
        221,
        'StandardTransaction',
        2,
        500.00,
        '2025-02-15',
        'Salary February',
        1
    ),
    (
        222,
        'StandardTransaction',
        2,
        50.00,
        '2025-02-18',
        'Groceries February',
        5
    ),
    (
        223,
        'StandardTransaction',
        2,
        300.00,
        '2025-02-25',
        'Rent February',
        7
    ),
    (
        224,
        'StandardTransaction',
        2,
        150.00,
        '2025-03-02',
        'Gift March',
        4
    ),
    (
        225,
        'StandardTransaction',
        2,
        500.00,
        '2025-03-15',
        'Salary March',
        1
    ),
    (
        226,
        'StandardTransaction',
        2,
        45.00,
        '2025-03-19',
        'Groceries March',
        5
    ),
    (
        227,
        'StandardTransaction',
        2,
        300.00,
        '2025-03-25',
        'Rent March',
        7
    ),
    (
        228,
        'StandardTransaction',
        2,
        120.00,
        '2025-04-02',
        'Gift April',
        4
    ),
    (
        229,
        'StandardTransaction',
        2,
        500.00,
        '2025-04-15',
        'Salary April',
        1
    ),
    (
        230,
        'StandardTransaction',
        2,
        60.00,
        '2025-04-20',
        'Groceries April',
        5
    ),
    (
        231,
        'StandardTransaction',
        2,
        300.00,
        '2025-04-25',
        'Rent April',
        7
    ),
    (
        232,
        'StandardTransaction',
        2,
        180.00,
        '2025-05-02',
        'Gift May',
        4
    ),
    (
        233,
        'StandardTransaction',
        2,
        500.00,
        '2025-05-15',
        'Salary May',
        1
    ),
    (
        234,
        'StandardTransaction',
        2,
        55.00,
        '2025-05-22',
        'Groceries May',
        5
    ),
    (
        235,
        'StandardTransaction',
        2,
        300.00,
        '2025-05-25',
        'Rent May',
        7
    ),
    (
        236,
        'StandardTransaction',
        2,
        160.00,
        '2025-06-02',
        'Gift June',
        4
    ),
    (
        237,
        'StandardTransaction',
        2,
        500.00,
        '2025-06-15',
        'Salary June',
        1
    ),
    (
        238,
        'StandardTransaction',
        2,
        65.00,
        '2025-06-21',
        'Groceries June',
        5
    ),
    (
        239,
        'StandardTransaction',
        2,
        300.00,
        '2025-06-25',
        'Rent June',
        7
    );

/* ==========================
Goals (belong to Alice)
========================== */
-- GoalType: POUPANCA, DIVIDA, COMPRA, ORCAMENTO, INVESTIMENTO
-- Table columns inferred from entity: id, type, targetValue, startDate, endDate, description, userId
INSERT INTO
    "goal" (
        id,
        type,
        targetValue,
        startDate,
        endDate,
        description,
        userId
    )
VALUES
    (
        1,
        'POUPANCA',
        5000.00,
        '2025-01-01',
        '2025-06-30',
        'Reserva de emergência',
        1
    ),
    (
        2,
        'DIVIDA',
        1500.00,
        '2025-02-01',
        '2025-04-30',
        'Quitar dívida do cartão',
        1
    ),
    (
        3,
        'COMPRA',
        7000.00,
        '2025-03-01',
        '2025-08-31',
        'Comprar notebook',
        1
    ),
    (
        4,
        'ORCAMENTO',
        1200.00,
        '2025-04-01',
        '2025-04-30',
        'Gastos com alimentação (Abril)',
        1
    ),
    (
        5,
        'INVESTIMENTO',
        3000.00,
        '2025-01-01',
        '2025-03-31',
        'Aportes no 1º trimestre',
        1
    );

COMMIT;
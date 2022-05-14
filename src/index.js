const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const custumers = [];

function verifyIfExistAccountCPF(req, res, next) {
    const { cpf } = req.headers;
    const custumer = custumers.find(custumer => custumer.cpf === cpf);

    if (!custumer) {
        return res.status(400).json({ error: "Custumer not found" });
    }

    req.custumer = custumer;
    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.value;
        } else {
            return acc - operation.value;
        }

    }, 0);

    return balance;
}

app.listen(3333, () => {
    console.log('Server open on port 3333 🔥');
});

app.post("/account", (req, res) => {
    const { cpf, name } = req.body;

    const custumerAlreadyExists = custumers.some(custumer => custumer.cpf === cpf);

    if (custumerAlreadyExists) {
        return res.status(400).json({ error: "Custumer already exists" });
    }

    custumers.push({
        id: uuidv4(),
        cpf,
        name,
        statement: []
    })

    return res.status(201).send();
});

app.get("/statement", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    return res.json(custumer.statement);
});

app.post("/deposit", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    const { description, amount } = req.body;

    const statementOperation = {
        created_at: new Date(),
        type: "credit",
        description,
        amount,
    }

    custumer.statement.push(statementOperation);

    return res.status(201).send();
});

app.post("/withdraw", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    const { amount } = req.body;

    const balance = getBalance(custumer.statement);
    console.log(balance);

    if (balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
    }

    const statementOperation = {
        created_at: new Date(),
        type: "debit",
        amount,
    }

    custumer.statement.push(statementOperation);
    return res.status(201).send();
});

app.get("/statement/date", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = custumer.statement.filter(statement =>
        statement.created_at.toDateString() === new Date(dateFormat).toDateString()
    );


    return res.json(statement);
});

app.put("/account", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    const { name } = req.body;

    custumer.name = name;
    return res.status(200).send();
});

app.get("/account", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    return res.json(custumer);
});

app.delete("/account", verifyIfExistAccountCPF, (req, res) => {
    const { custumer } = req;
    custumers.splice(custumer, 1);
    return res.status(200).json(custumers);
});
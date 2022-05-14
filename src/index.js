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
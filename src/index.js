const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const custumers = [];

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

app.get("/statement", (req, res) => {
    const { cpf } = req.headers;

    const custumer = custumers.find(custumer => custumer.cpf === cpf);

    if (!custumer) {
        return res.status(400).json({ error: "Custumer not found" });
    }

    return res.json(custumer.statement);
});
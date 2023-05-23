const express = require("express");
const app = express();
const persons = require("./data/persons.json");
const data = persons.persons;
const requestLogger = require("./middleware/logger");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
app.use(express.json());
app.use(requestLogger);
//create a write stream (in append mode)

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//setup the logger

app.use(morgan("combined", { stream: accessLogStream }));

const date = new Date();
app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has ${persons.persons.length} people</p>
               <p>${date}</p>`);
});

app.get("/api/persons/all", (request, response) => {
  response.json(data);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = data.find((person) => person.id === id);
  if (!person) {
    response.status(400);
    response.send("No person found");
  }

  response.json(person);
});

app.post("/api/persons/create", (request, response) => {
  const maxId = data.length > 0 ? Math.max(...data.map((n) => n.id)) : 0;

  const person = request.body;
  if (!person || !person.name || !person.number) {
    response.send({ message: "Name and number are required" });
    return;
  }
  person.id = maxId + 1;

  const existingPerson = data.find(
    (p) => p.name === person.name && p.number === person.number
  );

  if (existingPerson) {
    response.send({ message: "This person exists" });
  } else {
    const updatedPerson = data.find((p) => p.name === person.name);
    if (updatedPerson) {
      updatedPerson.number = person.number;
      response.send(updatedPerson);
    } else {
      data.push(person);
      response.json(person);
    }
  }
});
app.delete("/api/persons/delete/:id", (request, response) => {
  const person = data.filter((person) => person.id !== request.params.id);
  if (!person) {
    response.status(400);
    response.send({ message: "The person does not exist" });
  }
  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT);

console.log(`Server running on port ${PORT}`);

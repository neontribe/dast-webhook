"use strict";
require("dotenv").config();
const ResultsCalculator = require('./components/results-calculator');
const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json()); // creates http server
const token = process.env.TOKEN; // verification token
const port = process.env.PORT;

const sessions = {};

app.get("/", (req, res) => {
  // check if verification token is correct
  if (req.query.token !== token) {
    return res.sendStatus(401);
  }

  // return challenge
  return res.end(req.query.challenge);
});

app.post("/", (req, res) => {
  // check if verification token is correct
  if (req.query.token !== token) {
    return res.sendStatus(401);
  }

  const result = req.body.result;
  const id = req.body.conversationId;
  let session = sessions[id];
  //7fbd6081.ngrok.io

  http: if (!session) {
    session = {
      id,

      drugInteractions: {}, // q1
      useInteractions: {}, // q2, 4 & 5
      scoreInteractions: {} // q3(1-10)
    };

    sessions[id] = session;
  }

  // final question leads to score calculation
  if (result.interaction.name === "end quiz") {
    console.log("quiz ended");
    const resultsCalculator = new ResultsCalculator(session);
    let result = {
      responses: [
        {
          type: "text",
          elements: [resultsCalculator.evaluate()]
        }
      ]
    };
    return res.json(result);
  }


    const response = {
      parameters: { save: "me" },
      responses: [
        {
          type: "text",
          elements: ["ok", "thanks"]
        }
      ]
    };


    switch (result.interaction.name.substring(0, 5)) {
      case "categ":
        session.drugInteractions[result.resolvedQuery] = true;
        break;
      case "usage":
        session.useInteractions[result.interaction.name] = result.resolvedQuery;
        break;
      case "injec":
        session.useInteractions[result.interaction.name] = result.resolvedQuery;
        break;
      case "treat":
        session.useInteractions[result.interaction.name] = result.resolvedQuery;
        break;
      case "score":
        session.scoreInteractions[result.interaction.name] =
          result.resolvedQuery;
        break;
      default:
        // we have no idea
        return res.sendStatus(403);
    }


  console.log(session);
  return res.json(response);
});

app.listen(port, () => console.log("[BotEngine] Webhook is listening"));

"use strict";
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json()); // creates http server
const token = process.env.TOKEN; // verification token
const port = process.env.PORT;

var scores = [];
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

    var answers = Object.values(session.scoreInteractions);
    var drugCategories = Object.keys(session.drugInteractions);
    var search = "yes";

    var count = answers.reduce(function(n, val) {
      return n + (val === search);
    }, 0);


    switch (true) {
      case count === 0:
        const healthy = {
          responses: [
            {
              type: "text",
              elements: ["healthy - no action required"]
            }
          ]
        };
        return res.json(healthy);
        break;

      case count >= 3 && count < 6:
        const harmful = {
          responses: [
            {
              type: "text",
              elements: ["harmful - brief intervention/brief treatment"]
            }
          ]
        };

        return res.json(harmful);
        break;

      case count >= 6:
        const dependant = {
          responses: [
            {
              type: "text",
              elements: ["dependant - refer to specialised treatment"]
            }
          ]
        };
        return res.json(dependant);
        break;

      case count > 0 &&
        count <= 2 &&
        (session.useInteractions.usageFrequencyAnswer !== "daily/almost daily" ||
          (session.useInteractions.usageFrequencyAnswer === "weekly" &&
            (drugCategories.includes("methamphetamines") ||
              drugCategories.includes("cocaine") ||
              drugCategories.includes("narcotics")) &&
            session.useInteractions.injectionAnswer !== "in the past 90 days" &&
            session.useInteractions.treatmentAnswer !== "currently")):
        const riskyAdvice = {
          responses: [
            {
              type: "text",
              elements: ["risky - provide advice"]
            }
          ]
        };

        return res.json(riskyAdvice);
        break;

      default:
        const risky = {
          sessionAttributes: { save: "me" },
          responses: [
            {
              type: "text",
              elements: ["risky - brief intervention"]
            }
          ]
        };

        return res.json(risky);
        break;
    }
  }

  const response = {
    sessionAttributes: { save: "me" },
    responses: [
      {
        type: "text",
        elements: ["thank you for your answer", "thanks", "thank you"]
      }
    ]
  };

  //identify if final or not to separate final question out
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
      session.scoreInteractions[result.interaction.name] = result.resolvedQuery;
      break;
    default:
      // we have no idea
      return res.sendStatus(403);
  }

  console.log(session);
  return res.json(response);
});

app.listen(port, () => console.log("[BotEngine] Webhook is listening"));

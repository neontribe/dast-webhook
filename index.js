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

  if (!session) {
    session = {
      id,

      drugInteractions: {}, // q1
      useInteractions: {}, // q2, 4 & 5
      scoreInteractions: {} // q3(1-10)
    };

    sessions[id] = session;
  }
  console.log(result.interaction.name.substring(0, 5));
  console.log(result.resolvedQuery);

  if (result.interaction.name === "end quiz") {
    console.log(session);
    //logic here adding up etc

    // name final question in botengine
    // add values for scoreInteractions
    // if 0 - healthy
    // if 1 - 2
    // && useInteractions["use frequency"] !== "Daily or almost daily"
    // && drugInteractions does not contain "cocaine", "methamphetamines" or "narcotics (heroin, oxycodone, methadone, etc.)"
    // && useInteractions["injection"] !== "Yes, in the past 90 days"
    // && useInteractions["treatment"] !== "currently"
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
      console.log("switch works");
      session.drugInteractions[result.interaction.name] = result.resolvedQuery;
      break;
    case "usage":
      session.useInteractions[result.interaction.name] = result.resolvedQuery;
      break;
      console.log(session);
    case "injec":
      session.useInteractions[result.interaction.name] = result.resolvedQuery;
      break;
    case "treat":
      session.useInteractions[result.interaction.name] = result.resolvedQuery;
      break;
    case "score":
      session.scoreInteractions[result.interaction.name] = result.resolvedQuery;
    default:
      // we have no idea
      return res.sendStatus(403);
  }

  console.log(session);
  return res.json(response);
});

app.listen(port, () => console.log("[BotEngine] Webhook is listening"));

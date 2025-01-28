import { Readable } from 'stream';
require('dotenv').config();
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

import LenderModel from "../models/lender.model";
import PropertyModel from "../models/property.model";
import LocationModel from "../models/location.model";

const lender = new LenderModel();
const property = new PropertyModel();
const location = new LocationModel();

class RealEstateAgent {
  system: string = "";
  messages: any[] = [];

  constructor(system: string) {
    this.system = system;
    this.messages = [];
    if (this.system) {
      this.messages.push({
        role: "system",
        content: this.system,
      });
    }
  }

  async generateResponse(message: string) {
    this.messages.push({
      role: "user",
      content: message,
    });
    const result = await this.execute();
    this.messages.push({
      role: "assistant",
      content: result,
    });

    return result;
  }

  private async execute() {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: this.messages,
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  }
}

const functions: any = {
  "getLenders": lender.getLenders, // this function get all lenders, params: none
  "getLenderById": lender.getLenderById, // this function get lender by id, params: id(number)
  "addLender": lender.addLender, // this function add lender, params: lender(object)
  "getProperties": property.getProperties, // this function get all properties, params: none
  "getPropertyById": property.getPropertyById, // this function get property by id, params: id(number)
  "addProperty": property.addProperty, // this function add property, params: property(object)
  "getLocations": location.getLocations, // this function get all locations, params: none
  "getLocationById": location.getLocationById, // this function get location by id, params: id(number)
  "addLocation": location.addLocation, // this function add location, params: location(object)
};

const prompt = `
You are an AI Agent specialized in Real Estate, designed to assist with property-related inquiries using the ReACT (Reason + Act) framework. Your primary goal is to provide accurate and helpful answers by reasoning through questions and utilizing the available functions to gather relevant information.

You operate in a loop of Thought, Action, PAUSE, and Observation. At the end of the loop, you output an Answer.
  - Thought: Explain your reasoning and decide what action to take to address the question or request.
  - Action: Use one of the available functions, specifying the parameters if needed, and then return PAUSE.
  - Observation: You will be provided with the result of the action you performed.

Your available actions are:
  - getLenders: Retrieves all lenders. Example: Action: getLenders: undefined
  - getLenderById: Retrieves a lender by its ID. Example: Action: getLenderById: 1
  - getProperties: Retrieves all properties. Example: Action: getProperties: undefined
  - getPropertyById: Retrieves a property by its ID. Example: Action: getPropertyById: 2
  - getLocations: Retrieves all locations. Example: Action: getLocations: undefined
  - getLocationById: Retrieves a location by its ID. Example: Action: getLocationById: 3

These are the Lender, Property, and Location data interfaces:
  - Lender: { id: number; name: string; email: string; variableRate: number; fixedRateFiveYears: number; fixedRateTenYears: number; }
  - Location: { id: number; neighborhood: string; city: string; state: string; }
  - Property: { id: number; address: string; zip: string; locationId: number; price: number; beds: number; baths: number; sqft: number; yearBuilt: number; }

Example Session:

Question: Can you list all available properties?
Thought: I need to retrieve all properties to answer this question.
Action: getProperties: null
PAUSE

Observation: The system returned a list of 10 properties.

Answer: There are 10 properties available. Let me know if you’d like details about any specific property.

Question: What is the price of the property with ID 5?
Thought: I should fetch the details of the property with ID 5 to find its price.
Action: getPropertyById: 5
PAUSE

Observation: The property with ID 5 is listed at $350,000.

Answer: The property with ID 5 is priced at $350,000.

Be concise in your responses and always explain your reasoning when taking an action. If a request cannot be fulfilled, politely explain why and suggest an alternative if possible.
`;

const actionRe = new RegExp(/^Action: (\w+): (.*)$/);

export async function query(question: string, maxTurns: number = 5): Promise<Readable> {
  const stream = new Readable({
    read() { } // Required to implement a readable stream
  });

  let i = 0;
  const bot = new RealEstateAgent(prompt);
  let nextPrompt = question;

  (async () => {
    try {
      while (i < maxTurns) {
        i++;
        const result = await bot.generateResponse(nextPrompt);
        stream.push(result + '\n'); // Stream the result

        const actions = result?.split('\n')
          .map(line => actionRe.exec(line))
          .filter(match => match !== null) as RegExpExecArray[];

        if (actions.length > 0) {
          // There is an action to run
          const [action, actionInput] = actions[0].slice(1); // Extract groups from the match

          if (!functions[action]) {
            throw new Error(`Unknown action: ${action}: ${actionInput}`);
          }

          stream.push(` -- running ${action} ${actionInput}\n`); // Stream action details
          const observation = await functions[action](actionInput); // Ensure this is async if necessary
          stream.push("Observation: " + observation + '\n');
          nextPrompt = `Observation: ${observation}`;
        } else {
          stream.push("No action detected. Ending conversation.\n");
          break;
        }
      }
    } catch (error: any) {
      stream.push(`Error: ${error.message}\n`);
    } finally {
      stream.push(null); // End the stream
    }
  })();

  return stream;
}

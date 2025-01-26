import { createHmac } from "crypto";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const YOUR_SIGNING_SECRET = process.env.TALLY_SIGNING_SECRET;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const webhookPayload = req.body;
    const receivedSignature = req.headers["tally-signature"];

    const calculatedSignature = createHmac("sha256", YOUR_SIGNING_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest("base64");

    if (receivedSignature === calculatedSignature) {
      console.log("Webhook received successfully:", webhookPayload);

      const { eventType, data } = webhookPayload;

      if (eventType === "FORM_RESPONSE") {
        console.log("Form Name:", data.formName);
        console.log("Form Fields:", data.fields);

        const founder_name = data.fields.find(
          (f) => f.key === "question_xjN1L5"
        )?.value;
        const founder_email = data.fields.find(
          (f) => f.key === "question_NDBQ9j"
        )?.value;
        const startup_name = data.fields.find(
          (f) => f.key === "question_QMBWaG"
        )?.value;
        const startup_description = data.fields.find(
          (f) => f.key === "question_dN24ed"
        )?.value;
        const startup_website = data.fields.find(
          (f) => f.key === "question_eDxljk"
        )?.value;

        const startup_industry = data.fields.find(
          (f) => f.key === "question_vr0Pyg"
        )?.value;
        const industry_options = data.fields.find(
          (f) => f.key === "question_vr0Pyg"
        )?.options;
        const selected_industry = startup_industry?.map((id) => {
          const option = industry_options.find((opt) => opt.id === id);
          return option?.text || "Unknown";
        });

        const startup_business_model = data.fields.find(
          (f) => f.key === "question_dNZYVD"
        )?.value;
        const model_options = data.fields.find(
          (f) => f.key === "question_dNZYVD"
        )?.options;
        const selected_model = startup_business_model?.map((id) => {
          const option = model_options.find((opt) => opt.id === id);
          return option?.text || "Unknown";
        });

        const startup_market = data.fields.find(
          (f) => f.key === "question_vr0XEd"
        )?.value;
        const market_options = data.fields.find(
          (f) => f.key === "question_vr0XEd"
        )?.options;
        const selected_markets = startup_market?.map((id) => {
          const option = market_options.find((opt) => opt.id === id);
          return option?.text || "Unknown";
        });

        const startup_stage = data.fields.find(
          (f) => f.key === "question_KePpvk"
        )?.value;
        const stage_options = data.fields.find(
          (f) => f.key === "question_KePpvk"
        )?.options;
        const round_type = startup_stage?.map((id) => {
          const option = stage_options.find((opt) => opt.id === id);
          return option?.text || "Unknown";
        });

        const fundraising_round_type = data.fields.find(
          (f) => f.key === "question_LzEDvO"
        )?.value;
        const investment_options = data.fields.find(
          (f) => f.key === "question_LzEDvO"
        )?.options;
        const investment_type = fundraising_round_type?.map((id) => {
          const option = investment_options.find((opt) => opt.id === id);
          return option?.text || "Unknown";
        });

        const unique_selling_point = data.fields.find(
          (f) => f.key === "question_QMx7VY"
        )?.value;

        const investor_type = data.fields.find(
          (f) => f.key === "question_pd0eRZ"
        )?.value;
        const investor_options = data.fields.find(
          (f) => f.key === "question_pd0eRZ"
        )?.options;
        const selected_investor_types = investor_type?.map((id) => {
          const option = investor_options.find((opt) => opt.id === id);
          return option?.text || "Unknown";
        });

        const notable_traction = data.fields.find(
          (f) => f.key === "question_9X67QE"
        )?.value;

        const fundraising_amount = data.fields.find(
          (f) => f.key === "question_OlBeMY"
        )?.value;

        const team_apart = data.fields.find(
          (f) => f.key === "question_eDNaRx"
        )?.value;

        const number_of_investors = data.fields.find(
          (f) => f.key === "question_GKBjAL"
        )?.value;

        console.log({
          founder_name,
          founder_email,
          startup_name,
          startup_description,
          startup_website,
          startup_industry: selected_industry,
          startup_business_model: selected_model,
          startup_market: selected_markets,
          fundraising_round_type: round_type,
          startup_investment_type: investment_type,
          investor_types: selected_investor_types,
          fundraising_amount,
          unique_selling_point,
          notable_traction,
          team_apart,
          number_of_investors,
        });

        const payload = {
          founder_name,
          founder_email,
          startup_name,
          startup_description,
          startup_website,
          startup_industry: selected_industry,
          startup_business_model: selected_model,
          startup_market: selected_markets,
          fundraising_round_type: round_type,
          startup_investment_type: investment_type,
          investor_types: selected_investor_types,
          fundraising_amount,
          unique_selling_point,
          notable_traction,
          team_apart,
          number_of_investors,
        };

        console.log("Prepared Payload:", payload);

        try {
          const response = await axios.post(
            "https://api-lr.agent.ai/v1/agent/4nn8v57mtzbxjlfz/webhook/99cce98b",
            payload,
            { headers: { "Content-Type": "application/json" } }
          );
          console.log("Response from Agent.ai:", response.data);
          res.status(200).send("Webhook processed and forwarded successfully.");
        } catch (error) {
          console.error(
            "Error sending data to Agent.ai:",
            error.response?.data || error.message
          );
          res.status(500).send("Failed to forward webhook data.");
        }
      } else {
        console.error("Unsupported event type received:", eventType);
        res.status(400).send("Unsupported event type.");
      }
    } else {
      console.error("Invalid signature. Rejecting request.");
      res.status(401).send("Invalid signature.");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
};
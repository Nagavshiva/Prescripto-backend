import { GoogleGenAI } from "@google/genai";
import Doctor from "../models/doctorModel.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const checkSymptoms = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: "Please provide symptoms." });
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `A patient reports the following symptoms: "${symptoms}".`,
        `Please list 3-5 most likely medical conditions or concerns based on these symptoms.`,
        `Avoid medical advice or treatment suggestions. Only give numbered condition names.`
      ]
    });

    const text = result.text;
    if (!text || typeof text !== "string") {
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    const conditionLines = text
      .split("\n")
      .filter(line => /^\d+\.\s/.test(line.trim()));
    const conditions = conditionLines.map(line =>
      line.replace(/^\d+\.\s*/, '').toLowerCase().trim()
    );

    const conditionToSpeciality = {
      'migraine': 'Neurologist',
      'tension headache': 'General physician',
      'headache': 'General physician',
      'cluster headache': 'Neurologist',
      'brain tumor': 'Neurologist',
      'sinusitis': 'ENT Specialist',
      'flu': 'General physician',
      'fever': 'General physician',
      'cold': 'General physician',
      'eczema': 'Dermatologist',
      'acne': 'Dermatologist',
      'anxiety': 'Neurologist',
      'depression': 'Neurologist',
      'irregular periods': 'Gynecologist',
      'rash': 'Dermatologist',
      'chest pain': 'Cardiologist',
      'blood in nose': 'ENT Specialist',
      'nosebleed': 'ENT Specialist',
      'primary care physician': 'General physician',
      'general practitioner': 'General physician'
    };

    // Select first matching known condition
    let selectedSpeciality = 'General physician';
    for (let condition of conditions) {
      if (conditionToSpeciality[condition]) {
        selectedSpeciality = conditionToSpeciality[condition];
        break;
      }
    }

    const matchedDoctors = await Doctor.findAll({
      where: { speciality: selectedSpeciality },
      attributes: ['id', 'name', 'speciality', 'image', 'available']
    });

    res.status(200).json({
      symptomsProvided: symptoms,
      aiAnalysis: conditions,
      suggestedSpeciality: selectedSpeciality,
      matchedDoctors
    });

  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Symptom analysis failed. Please try again later." });
  }
};

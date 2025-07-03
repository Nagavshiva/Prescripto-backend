import express from 'express';
import { checkSymptoms } from '../controllers/aiController.js'; 

const aiRouter = express.Router();

aiRouter.post('/symptom-check', checkSymptoms);

export default aiRouter;
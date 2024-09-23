import express from 'express';
import { profileDetails } from '../controllers/profileController';
const router = express.Router();

router.get('/', profileDetails);


export default router;

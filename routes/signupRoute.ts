import express from 'express';
import { userSignup } from '../controllers/userSignup';
const router = express.Router();

router.post('/', userSignup); 

export default router;

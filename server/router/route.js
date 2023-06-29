import { Router } from 'express';
const router = Router();
import { registerMail } from '../controllers/mailer.js';
import auth, { localVariables } from "../middleware/auth.js";



// all controllers
import * as controller from '../controllers/appController.js'

// Post
router.route('/register').post(controller.register);
router.route('/registerMail').post(registerMail);
router.route('/authenticate').post(controller.verifyUser, (req, res) => res.end());
router.route('/login').post(controller.verifyUser, controller.login);

// Get
router.route('/user/:username').get(controller.getUser);
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP);
router.route('/verifyOTP').get(controller.verifyOTP);
router.route('/createresetsession').get(controller.createResetSession);

// Put
router.route('/updateuser').put(auth, controller.updateUser);
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword);


export default router;
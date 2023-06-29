import UserModel from '../model/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js'
import otpGenerator from 'otp-generator';


// Middleware for verify user
export async function verifyUser(req, res, next) {
    try {

        const { username } = req.method == "GET" ? req.query : req.body;
        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "Can't find User!" });
        next();
    } catch (error) {
        return res.status(404).send({ error: "Authentication Error" });
    }
}

export async function register(req, res) {
    try {
        const { username, password, profile, email } = req.body;

        const existUsername = UserModel.findOne({ username }).then(usernameResult => usernameResult);
        const existEmail = UserModel.findOne({ email }).then(emailResult => emailResult);

        Promise.all([existUsername, existEmail])
            .then(([usernameResult, emailResult]) => {
                if (usernameResult) {
                    throw new Error("Please use a unique username");
                }

                if (emailResult) {
                    throw new Error("Please use a unique email");
                }

                if (password) {
                    bcrypt
                        .hash(password, 10)
                        .then(hashedPassword => {
                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            user
                                .save()
                                .then(result => res.status(201).send({ msg: "User registered successfully" }))
                                .catch(error => {
                                    console.error(error);
                                    res.status(500).send({ error });
                                });
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(500).send({
                                error: "Unable to hash the password"
                            });
                        });
                }
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({ error: error.message });
            });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}

export async function login(req, res) {
    const { username, password } = req.body;

    try {
        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {
                        if (!passwordCheck) return res.status(400).send({ error: "Password does not exists" })
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, ENV.JWT_SECRET, { expiresIn: '24h' })

                        return res.status(200).send({
                            msg: 'Login successful!',
                            username: user.username,
                            token
                        })


                    })
                    .catch(error => {
                        console.log(error)
                        return res.status(400).send({ error: "Password does not match" })
                    })
            })
            .catch(error => {
                return res.status(404).send({ error: "User not found" });
            })

    } catch (error) {
        return res.status(500).send({ error })

    }
}

export async function getUser(req, res) {
    const { username } = req.params;

    try {
        if (!username) {
            return res.status(400).send({ error: "Invalid Username" });
        }

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).send({ error: "Couldn't find the User" });
        }
        const { password, ...rest } = Object.assign({}, user.toJSON());

        return res.status(200).send(rest);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

export async function updateUser(req, res) {
    try {
        const { userId } = req.user;

        if (userId) {
            const body = req.body;

            // update the data
            await UserModel.updateOne({ _id: userId }, body);

            return res.status(201).send({ msg: "Record Updated...!" });
        } else {
            return res.status(401).send({ error: "User Not Found...!" });
        }
    } catch (error) {
        console.log(error)
        return res.status(401).send({ error });
    }
}


export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    res.status(201).send({ code: req.app.locals.OTP });
}

export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: 'Verify Successfully!' });
    }
    return res.status(400).send({ error: "Invalid OTP" });
}

export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ flag: req.app.locals.resetSession })
    }
    return res.status(440).send({ error: "Session expired!" })
}


export async function resetPassword(req, res) {
    try {
        if (!req.app.locals.resetSession) {
            return res.status(440).send({ error: "Session expired!" });
        }

        const { username, password } = req.body;

        try {
            const user = await UserModel.findOne({ username });

            if (!user) {
                return res.status(404).send({ error: "Username not Found" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await UserModel.updateOne({ username: user.username }, { password: hashedPassword });

            req.app.locals.resetSession = false;
            return res.status(201).send({ msg: "Record Updated...!" });
        } catch (error) {
            return res.status(500).send({ error: "Unable to hash password" });
        }
    } catch (error) {
        return res.status(401).send({ error });
    }
}
